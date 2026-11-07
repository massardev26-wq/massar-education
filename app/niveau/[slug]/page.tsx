
import { supabase } from "@/lib/supabase";
import Ad from "@/components/Ad";

export const dynamic = "force-dynamic";

export default async function Level({
  params,
}: {
  params: { slug: string };
}) {
  const { data: level } = await supabase
    .from("levels")
    .select("*")
    .eq("slug", params.slug)
    .maybeSingle();

  if (!level) {
    return (
      <main className="wrap">
        <h1>Niveau introuvable</h1>
      </main>
    );
  }

  const { data: ls } = await supabase
    .from("level_subjects")
    .select("subjects(id,name,icon)")
    .eq("level_id", level.id);

  const { data: res } = await supabase
    .from("resources")
    .select("*, chapters(title)")
    .eq("level_id", level.id)
    .order("created_at", { ascending: false });

  const { data: ads } = await supabase
    .from("ads")
    .select("*")
    .eq("enabled", true);

  const ad = (s: string) =>
    (ads || []).find((a: any) => a.slot === s);

  const subjects = (ls || [])
    .map((x: any) => x.subjects)
    .filter(Boolean);

  const themes = [
    { color: "#0875e1", light: "#d9ecff" },
    { color: "#7838c9", light: "#eee0ff" },
    { color: "#f07813", light: "#ffead5" },
    { color: "#159b68", light: "#d9f8eb" },
  ];

  return (
    <main className="wrap" style={{ padding: "25px 3%" }}>
      <h1
        style={{
          color: "#123579",
          fontSize: "28px",
          fontWeight: 900,
          marginBottom: "25px",
        }}
      >
        {level.name}
      </h1>

      {/* COLONNES DES MATIERES */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "12px",
          alignItems: "start",
        }}
      >
        {subjects.map((s: any, index: number) => {
          const theme = themes[index % themes.length];

          const items = (res || []).filter(
            (r: any) => r.subject_id === s.id
          );

          const chapters = Array.from(
            new Set(
              items.map(
                (r: any) =>
                  r.chapters?.title || "Sans chapitre"
              )
            )
          );

          return (
            <section
              key={s.id}
              style={{
                border: `2px solid ${theme.color}`,
                borderRadius: "20px",
                overflow: "hidden",
                background: theme.light,
                boxShadow:
                  "0 5px 15px rgba(18,51,122,0.09)",
              }}
            >
              {/* TITRE MATIERE */}
              <div
                style={{
                  background: theme.color,
                  color: "#fff",
                  minHeight: "75px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "12px",
                  padding: "15px 10px",
                }}
              >
                <span style={{ fontSize: "30px" }}>
                  {s.icon || "📚"}
                </span>

                <h2
                  style={{
                    margin: 0,
                    fontSize: "23px",
                    fontWeight: 900,
                    textAlign: "center",
                  }}
                >
                  {s.name}
                </h2>
              </div>

              {/* CONTENU */}
              <div style={{ padding: "9px" }}>
                {!items.length && (
                  <p
                    style={{
                      textAlign: "center",
                      padding: "15px",
                      fontSize: "14px",
                    }}
                  >
                    Aucune ressource pour le moment.
                  </p>
                )}

                {chapters.map((chapter: any) => {
                  const chapterItems = items.filter(
                    (r: any) =>
                      (r.chapters?.title ||
                        "Sans chapitre") === chapter
                  );

                  return (
                    <div key={chapter}>
                      {/* MASQUER SANS CHAPITRE */}
                      {chapter !== "Sans chapitre" && (
                        <h3
                          style={{
                            color: theme.color,
                            fontSize: "16px",
                            fontWeight: 800,
                            margin: "13px 6px 10px",
                          }}
                        >
                          📚 {chapter}
                        </h3>
                      )}

                      {chapterItems.map((r: any) => (
                        <div
                          key={r.id}
                          style={{
                            background: "#fff",
                            borderRadius: "16px",
                            padding: "12px",
                            marginBottom: "10px",
                            border: "1px solid #e7edf7",
                            boxShadow:
                              "0 3px 9px rgba(18,51,122,0.06)",
                          }}
                        >
                          {/* BADGES */}
                          <div
                            style={{
                              display: "flex",
                              gap: "6px",
                              flexWrap: "wrap",
                              marginBottom: "9px",
                            }}
                          >
                            <span
                              style={{
                                background: theme.light,
                                color: theme.color,
                                padding: "5px 10px",
                                borderRadius: "20px",
                                fontSize: "12px",
                                fontWeight: 900,
                              }}
                            >
                              {r.type}
                            </span>

                            {r.is_premium && (
                              <span
                                style={{
                                  background: "#fff0c2",
                                  color: "#8b5a00",
                                  padding: "5px 10px",
                                  borderRadius: "20px",
                                  fontSize: "12px",
                                  fontWeight: 900,
                                }}
                              >
                                🔒 Premium
                              </span>
                            )}
                          </div>

                          {/* TITRE + BOUTONS */}
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              gap: "8px",
                            }}
                          >
                            <div
                              style={{
                                flex: 1,
                                minWidth: 0,
                              }}
                            >
                              <b
                                style={{
                                  color: "#17233c",
                                  fontSize: "15px",
                                  fontWeight: 900,
                                  lineHeight: 1.4,
                                  overflowWrap: "anywhere",
                                }}
                              >
                                {r.title}
                              </b>

                              {r.description && (
                                <p
                                  style={{
                                    color: "#666",
                                    fontSize: "12px",
                                    margin: "5px 0 0",
                                  }}
                                >
                                  {r.description}
                                </p>
                              )}
                            </div>

                            {/* ACTIONS */}
                            {r.file_url && !r.is_premium && (
                              <div
                                style={{
                                  display: "flex",
                                  gap: "6px",
                                  flexShrink: 0,
                                }}
                              >
                                {/* CONSULTER */}
                                <a
                                  href={r.file_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  style={{
                                    width: "68px",
                                    height: "58px",
                                    background: "#0875e1",
                                    color: "#fff",
                                    borderRadius: "12px",
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    gap: "3px",
                                    textDecoration: "none",
                                    fontWeight: 900,
                                    fontSize: "11px",
                                    textAlign: "center",
                                  }}
                                >
                                  <span style={{ fontSize: "21px" }}>
                                    👁
                                  </span>
                                  Consulter
                                </a>

                                {/* TELECHARGER DIRECT PDF */}
                                <a
                                  href={r.file_url.replace(
                                    "/storage/v1/object/public/",
                                    "/storage/v1/object/download/"
                                  )}
                                  download
                                  style={{
                                    width: "68px",
                                    height: "58px",
                                    background: "#20a43a",
                                    color: "#fff",
                                    borderRadius: "12px",
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    gap: "3px",
                                    textDecoration: "none",
                                    fontWeight: 900,
                                    fontSize: "10px",
                                    textAlign: "center",
                                  }}
                                >
                                  <span style={{ fontSize: "22px" }}>
                                    ⬇
                                  </span>
                                  Télécharger
                                </a>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })}

                <Ad ad={ad("entre")} />
              </div>
            </section>
          );
        })}
      </div>

      {/* PUBLICITE */}
      <div style={{ marginTop: "20px" }}>
        <Ad ad={ad("sidebar")} />
      </div>
    </main>
  );
}

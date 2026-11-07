
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

  if (!level)
    return (
      <main className="wrap">
        <h1>Niveau introuvable</h1>
      </main>
    );

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
    <main className="wrap" style={{ padding: "30px 3%" }}>
      <h1
        style={{
          color: "#123579",
          fontSize: "30px",
          fontWeight: 900,
          marginBottom: "30px",
        }}
      >
        {level.name}
      </h1>

      {/* COLONNES DES MATIERES */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(320px, 1fr))",
          gap: "14px",
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
                borderRadius: "24px",
                overflow: "hidden",
                background: theme.light,
                boxShadow:
                  "0 7px 18px rgba(18,51,122,0.10)",
              }}
            >
              {/* BANDEAU MATIERE */}
              <div
                style={{
                  background: theme.color,
                  color: "#fff",
                  minHeight: "90px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "18px",
                  padding: "18px 12px",
                }}
              >
                <span style={{ fontSize: "38px" }}>
                  {s.icon || "📚"}
                </span>

                <h2
                  style={{
                    margin: 0,
                    fontSize: "27px",
                    fontWeight: 900,
                    textAlign: "center",
                  }}
                >
                  {s.name}
                </h2>
              </div>

              {/* CONTENU DE LA COLONNE */}
              <div style={{ padding: "10px" }}>
                {!items.length && (
                  <p
                    style={{
                      textAlign: "center",
                      padding: "20px",
                    }}
                  >
                    Aucune ressource pour le moment.
                  </p>
                )}

                {chapters.map((chapter: any) => (
                  <div key={chapter}>
                    <h3
                      style={{
                        color: theme.color,
                        fontSize: "17px",
                        fontWeight: 800,
                        margin: "15px 8px 12px",
                      }}
                    >
                      {chapter}
                    </h3>

                    {items
                      .filter(
                        (r: any) =>
                          (r.chapters?.title ||
                            "Sans chapitre") === chapter
                      )
                      .map((r: any) => (
                        <div
                          key={r.id}
                          style={{
                            background: "#fff",
                            borderRadius: "20px",
                            padding: "16px",
                            marginBottom: "12px",
                            border: "1px solid #e7edf7",
                            boxShadow:
                              "0 4px 12px rgba(18,51,122,0.07)",
                          }}
                        >
                          {/* BADGES */}
                          <div
                            style={{
                              display: "flex",
                              gap: "7px",
                              flexWrap: "wrap",
                              marginBottom: "12px",
                            }}
                          >
                            <span
                              style={{
                                background: theme.light,
                                color: theme.color,
                                padding: "6px 13px",
                                borderRadius: "20px",
                                fontSize: "13px",
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
                                  padding: "6px 13px",
                                  borderRadius: "20px",
                                  fontSize: "13px",
                                  fontWeight: 900,
                                }}
                              >
                                🔒 Premium
                              </span>
                            )}
                          </div>

                          {/* TITRE ET BOUTONS */}
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              gap: "10px",
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
                                  fontSize: "17px",
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
                                    fontSize: "13px",
                                    margin: "6px 0 0",
                                  }}
                                >
                                  {r.description}
                                </p>
                              )}
                            </div>

                            {/* BOUTONS SEPARES */}
                            {r.file_url && !r.is_premium && (
                              <div
                                style={{
                                  display: "flex",
                                  gap: "8px",
                                  flexShrink: 0,
                                }}
                              >
                                <a
                                  href={r.file_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  style={{
                                    width: "82px",
                                    height: "70px",
                                    background: "#0875e1",
                                    color: "#fff",
                                    borderRadius: "15px",
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    gap: "4px",
                                    textDecoration: "none",
                                    fontWeight: 900,
                                    fontSize: "12px",
                                    boxShadow:
                                      "0 4px 9px rgba(8,117,225,0.2)",
                                  }}
                                >
                                  <span style={{ fontSize: "24px" }}>
                                    ◉
                                  </span>
                                  Consulter
                                </a>

                                <a
                                  href={r.file_url}
                                  download
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  style={{
                                    width: "82px",
                                    height: "70px",
                                    background: "#20a43a",
                                    color: "#fff",
                                    borderRadius: "15px",
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    gap: "4px",
                                    textDecoration: "none",
                                    fontWeight: 900,
                                    fontSize: "12px",
                                    boxShadow:
                                      "0 4px 9px rgba(32,164,58,0.2)",
                                  }}
                                >
                                  <span style={{ fontSize: "25px" }}>
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
                ))}

                <Ad ad={ad("entre")} />
              </div>
            </section>
          );
        })}
      </div>

      <div style={{ marginTop: "25px" }}>
        <Ad ad={ad("sidebar")} />
      </div>
    </main>
  );
}

"use client";

import { useMemo, useState } from "react";

const BLUE = "#0645b8";
const NAVY = "#08245f";

const styles: Record<string, React.CSSProperties> = {
  page: {
    color: NAVY,
    background: "#f7faff",
    padding: "16px 1.2% 28px",
    fontFamily: "Arial, sans-serif",
  },

  breadcrumb: {
    color: BLUE,
    fontWeight: 700,
    fontSize: 14,
    margin: "0 0 14px",
    display: "flex",
    gap: 10,
    flexWrap: "wrap",
  },

  banner: {
    borderRadius: 18,
    padding: "24px 30px",
    color: "white",
    background:
      "linear-gradient(105deg,#0645b8,#087fe5 60%,#063a96)",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 14,
    boxShadow: "0 5px 15px #124a9b20",
    marginBottom: 16,
  },

  mainGrid: {
    display: "grid",
    gridTemplateColumns: "minmax(240px, 23%) minmax(0, 1fr)",
    gap: 14,
    alignItems: "stretch",
  },

  sidebar: {
    border: "1px solid #b9cce8",
    borderRadius: 17,
    background: "white",
    overflow: "hidden",
    minHeight: 500,
  },

  sideHead: {
    padding: "16px 20px",
    background: "linear-gradient(90deg,#073b8d,#0756bd)",
    color: "white",
    fontWeight: 900,
    fontSize: 22,
  },

  main: {
    border: "1px solid #b9cce8",
    borderRadius: 17,
    padding: 12,
    background: "white",
    minWidth: 0,
  },

  tabRow: {
    display: "grid",
    gridTemplateColumns: "repeat(2,minmax(0,1fr))",
    gap: 8,
    margin: "14px 0",
  },

  pane: {
    border: "1px solid #b8cce9",
    borderRadius: 16,
    padding: 12,
    minWidth: 0,
    background: "#fff",
  },
};

export default function LevelLearningClient({
  level,
  subjects,
  resources,
}: {
  level: any;
  subjects: any[];
  resources: any[];
}) {
  const [subjectId, setSubjectId] = useState(
    String(subjects[0]?.id ?? "")
  );

  const [chapterName, setChapterName] = useState("");

  const [tab, setTab] = useState<"cours" | "exercices">(
    "exercices"
  );

  const [viewingResource, setViewingResource] = useState<any>(null);

  const subject =
    subjects.find((s) => String(s.id) === subjectId) ||
    subjects[0];

  const subjectResources = resources.filter(
    (r) => String(r.subject_id) === String(subject?.id)
  );

  const chapters = useMemo(() => {
    const names = Array.from(
      new Set(
        subjectResources.map(
          (r) => r.chapters?.title || "Sans chapitre"
        )
      )
    );

    return names.sort((a, b) => {
      const pa = subjectResources.find(
        (r) => (r.chapters?.title || "Sans chapitre") === a
      )?.chapters?.position;

      const pb = subjectResources.find(
        (r) => (r.chapters?.title || "Sans chapitre") === b
      )?.chapters?.position;

      if (
        typeof pa === "number" &&
        typeof pb === "number" &&
        pa !== pb
      ) {
        return pa - pb;
      }

      return a.localeCompare(b, "fr");
    });
  }, [subjectResources]);

  const activeChapter = chapters.includes(chapterName)
    ? chapterName
    : chapters[0] || "";

  const chapterResources = subjectResources.filter(
    (r) =>
      (r.chapters?.title || "Sans chapitre") === activeChapter
  );

  const cours = chapterResources.filter((r) =>
    /cours|résumé|fiche/i.test(r.type || "")
  );

  // Exercices uniquement : exclure les ressources déjà corrigées
  // (ex. type = "Exercice corrigé") pour éviter les doublons.
  const exercises = chapterResources.filter((r) => {
    const type = String(r.type || "");
    const title = String(r.title || "");
    const description = String(r.description || "");

    const isExercise = /exercice|examen|contrôle/i.test(type);
    const isCorrection =
      /corrig|correction/i.test(type) ||
      /corrig|correction/i.test(title) ||
      /corrig|correction/i.test(description);

    return isExercise && !isCorrection;
  });

  // Corrections uniquement
  const corrections = chapterResources.filter((r) => {
    const type = String(r.type || "");
    const title = String(r.title || "");
    const description = String(r.description || "");

    return (
      /corrig|correction/i.test(type) ||
      /corrig|correction/i.test(title) ||
      /corrig|correction/i.test(description)
    );
  });

  const pdfs = chapterResources.filter(
    (r) => /pdf/i.test(r.type || "") || r.file_url
  );

  // Extraction du numéro de l'exercice ou de la correction
  function getExerciseNumber(resource: any): number | null {
    const text = `${resource.title || ""} ${resource.description || ""}`;

    const match = text.match(
      /(?:exercice|exercices|correction|corrigé|corrige)\s*(?:n[°ºo]?\s*)?(\d+)/i
    );

    return match ? Number(match[1]) : null;
  }

  // Associer exercice et correction selon leur numéro
  const pairedExercises = useMemo(() => {
    const sortedExercises = [...exercises].sort((a, b) => {
      const numA = getExerciseNumber(a);
      const numB = getExerciseNumber(b);

      if (numA !== null && numB !== null) {
        return numA - numB;
      }

      return String(a.title || "").localeCompare(
        String(b.title || ""),
        "fr"
      );
    });

    return sortedExercises.map((exercise, index) => {
      const exerciseNumber = getExerciseNumber(exercise);

      let correction = corrections.find((c) => {
        const correctionNumber = getExerciseNumber(c);

        return (
          exerciseNumber !== null &&
          correctionNumber === exerciseNumber
        );
      });

      // Si les numéros ne sont pas disponibles,
      // on associe les ressources selon leur ordre.
      if (!correction && exerciseNumber === null) {
        correction = corrections[index];
      }

      return {
        exercise,
        correction,
        number: exerciseNumber ?? index + 1,
      };
    });
  }, [exercises, corrections]);

  function resourceCard(
    r: any,
    accent = BLUE,
    showNumber = false
  ) {
    return (
      <article
        key={r.id}
        style={{
          border: "1px solid #d8e5f5",
          borderRadius: 13,
          background: "white",
          padding: 12,
          marginBottom: 10,
          boxShadow: "0 3px 9px #102e650a",
          overflowWrap: "anywhere",
        }}
      >
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 6,
            marginBottom: 8,
          }}
        >
          <span
            style={{
              background: "#e4efff",
              color: accent,
              borderRadius: 20,
              padding: "4px 9px",
              fontSize: 12,
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
                borderRadius: 20,
                padding: "4px 9px",
                fontSize: 12,
                fontWeight: 900,
              }}
            >
              🔒 Premium
            </span>
          )}
        </div>

        <b
          style={{
            fontSize: 15,
            lineHeight: 1.4,
          }}
        >
          {r.title}
        </b>

        {r.description && (
          <p
            style={{
              margin: "6px 0 0",
              color: "#526078",
              fontSize: 13,
              whiteSpace: "pre-wrap",
            }}
          >
            {r.description}
          </p>
        )}

        {r.file_url && !r.is_premium && (
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 7,
              marginTop: 10,
            }}
          >
            <button
              onClick={() => setViewingResource(r)}
              style={{
                background: BLUE,
                color: "white",
                borderRadius: 9,
                padding: "8px 11px",
                fontWeight: 800,
                fontSize: 12,
                border: "none",
                cursor: "pointer",
              }}
            >
              👁 Consulter
            </button>

            <a
              href={`/api/download?url=${encodeURIComponent(
                r.file_url
              )}&title=${encodeURIComponent(
                r.title || "document"
              )}&resource_id=${encodeURIComponent(
                String(r.id || "")
              )}&level_id=${encodeURIComponent(
                String(r.level_id || "")
              )}&subject_id=${encodeURIComponent(
                String(r.subject_id || "")
              )}`}
              style={{
                background: "#20a43a",
                color: "white",
                borderRadius: 9,
                padding: "8px 11px",
                fontWeight: 800,
                fontSize: 12,
                textDecoration: "none",
                display: "inline-block",
              }}
            >
              ⬇ Télécharger
            </a>
          </div>
        )}
      </article>
    );
  }

  const tabButton = (
    key: typeof tab,
    label: string,
    icon: string
  ) => (
    <button
      onClick={() => {
        setTab(key);
        setViewingResource(null);
      }}
      style={{
        border: "1px solid #9bb9e6",
        borderRadius: 12,
        padding: "13px 8px",
        background:
          tab === key
            ? "linear-gradient(100deg,#0645b8,#084de0)"
            : "#f8fbff",
        color: tab === key ? "white" : NAVY,
        fontWeight: 900,
        fontSize: 16,
        cursor: "pointer",
      }}
    >
      {icon} {label}
    </button>
  );

  return (
    <main style={styles.page}>
      {/* BREADCRUMB */}
      <div style={styles.breadcrumb}>
        ⌂ Accueil　›　{level.cycle || "Niveau"}　›　{level.name}
       　›　{subject?.name || "Matière"}
      </div>

      {/* HEADER */}
      <header style={styles.banner}>
        <div>
          <div
            style={{
              fontSize: 13,
              opacity: 0.9,
              fontWeight: 700,
            }}
          >
            ESPACE ÉDUCATIF • MASSAR
          </div>

          <h1
            style={{
              margin: "7px 0 0",
              fontSize: "clamp(24px,3vw,36px)",
              fontWeight: 900,
            }}
          >
            {subject?.icon || "📚"}{" "}
            {subject?.name || "Choisissez une matière"} – {level.name}
          </h1>
        </div>

        <div style={{ fontSize: 54 }} aria-hidden>
          📚 ✏️
        </div>
      </header>

      {/* SUBJECTS */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 8,
          marginBottom: 14,
        }}
      >
        {subjects.map((s) => (
          <button
            key={s.id}
            onClick={() => {
              setSubjectId(String(s.id));
              setChapterName("");
              setViewingResource(null);
            }}
            style={{
              border: "1px solid #b7cbe8",
              borderRadius: 12,
              padding: "10px 15px",
              background:
                String(s.id) === String(subject?.id)
                  ? BLUE
                  : "white",
              color:
                String(s.id) === String(subject?.id)
                  ? "white"
                  : NAVY,
              fontWeight: 900,
              cursor: "pointer",
            }}
          >
            {s.icon || "📘"} {s.name}
          </button>
        ))}
      </div>

      {/* MAIN GRID */}
      <div style={styles.mainGrid}>
        {/* SIDEBAR */}
        <aside style={styles.sidebar}>
          <div style={styles.sideHead}>📖 Chapitres</div>

          {chapters.map((chapter, i) => (
            <button
              key={chapter}
              onClick={() => {
                setChapterName(chapter);
                setViewingResource(null);
              }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                width: "calc(100% - 18px)",
                margin: "9px",
                padding: "13px 12px",
                textAlign: "left",
                borderRadius: 12,
                border: "1px solid #d2e0f3",
                background:
                  chapter === activeChapter
                    ? "linear-gradient(100deg,#0645b8,#0759c8)"
                    : "white",
                color:
                  chapter === activeChapter ? "white" : NAVY,
                fontWeight: 900,
                fontSize: 14,
                cursor: "pointer",
              }}
            >
              <span style={{ fontSize: 20 }}>📁</span>

              <span style={{ flex: 1 }}>
                Chapitre {i + 1} : {chapter}
              </span>

              <span>⌄</span>
            </button>
          ))}
        </aside>

        {/* CONTENT */}
        <section style={styles.main}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 10,
              flexWrap: "wrap",
            }}
          >
            <h2
              style={{
                margin: "4px 0",
                fontSize: "clamp(20px,2.4vw,27px)",
                fontWeight: 900,
              }}
            >
              📂 {activeChapter || "Aucun chapitre"}
            </h2>

            <span
              style={{
                color: "#59708f",
                fontWeight: 700,
                fontSize: 13,
              }}
            >
              {level.name} › {subject?.name}
            </span>
          </div>

          {/* CHAPTER TITLE */}
          <div
            style={{
              background:
                "linear-gradient(90deg,#0645b8,#087fe5)",
              color: "white",
              borderRadius: 12,
              padding: "18px 15px",
              fontWeight: 900,
              marginTop: 10,
              fontSize: 20,
              boxShadow: "0 4px 12px #0645b820",
              position: "relative",
              overflow: "hidden",
            }}
          >
            📖 Leçon : {activeChapter}
          </div>

          {/* TABS */}
          <div style={styles.tabRow}>
            {tabButton("cours", "Cours", "📖")}

            {tabButton(
              "exercices",
              "Exercices + Correction",
              "📝"
            )}
          </div>

          {/* INLINE PDF VIEWER */}
          {viewingResource && (
            <div
              style={{
                border: "1px solid #b8cce9",
                borderRadius: 15,
                padding: 12,
                background: "#f5faff",
                marginBottom: 14,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: 10,
                  marginBottom: 10,
                }}
              >
                <h3
                  style={{
                    margin: 0,
                    fontSize: 17,
                    fontWeight: 900,
                  }}
                >
                  📄 {viewingResource.title}
                </h3>

                <button
                  onClick={() => setViewingResource(null)}
                  style={{
                    background: "#dc2626",
                    color: "white",
                    border: "none",
                    borderRadius: 9,
                    padding: "8px 12px",
                    fontWeight: 800,
                    cursor: "pointer",
                  }}
                >
                  ✖ Fermer
                </button>
              </div>

              <iframe
                src={viewingResource.file_url}
                title={viewingResource.title}
                style={{
                  width: "100%",
                  height: "75vh",
                  minHeight: 450,
                  border: "1px solid #d2e0f3",
                  borderRadius: 10,
                  background: "white",
                }}
              />

              <div style={{ marginTop: 10 }}>
                <a
                  href={viewingResource.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    color: BLUE,
                    fontWeight: 800,
                    fontSize: 13,
                  }}
                >
                  Ouvrir le document dans un nouvel onglet ↗
                </a>
              </div>
            </div>
          )}

          {/* COURS */}
          {tab === "cours" && (
            <div
              style={{
                ...styles.pane,
                background: "#f5faff",
              }}
            >
              <h3
                style={{
                  margin: "0 0 12px",
                  background: "#dceaff",
                  borderRadius: 10,
                  padding: 12,
                  fontSize: 20,
                }}
              >
                📘 Cours
              </h3>

              {cours.length ? (
                cours.map((r) => resourceCard(r))
              ) : (
                <p>Aucun cours disponible pour ce chapitre.</p>
              )}
            </div>
          )}

          {/* EXERCICES + CORRECTIONS */}
          {tab === "exercices" && (
            <div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(auto-fit,minmax(min(100%,300px),1fr))",
                  gap: 12,
                }}
              >
                {/* EXERCISES COLUMN */}
                <div
                  style={{
                    ...styles.pane,
                    background: "#f9fcff",
                  }}
                >
                  <h3
                    style={{
                      margin: "0 0 12px",
                      background:
                        "linear-gradient(90deg,#dceaff,#c6ddff)",
                      borderRadius: 10,
                      padding: 12,
                      fontSize: 20,
                    }}
                  >
                    ✏️ Exercices
                  </h3>

                  {pairedExercises.length ? (
                    pairedExercises.map((item) => (
                      <div key={item.exercise.id}>
                        <div
                          style={{
                            background: "#e5efff",
                            borderRadius: 9,
                            padding: "8px 10px",
                            marginBottom: 8,
                            color: BLUE,
                            fontWeight: 900,
                          }}
                        >
                          Exercice {item.number}
                        </div>

                        {resourceCard(
                          item.exercise,
                          "#0875e1"
                        )}
                      </div>
                    ))
                  ) : (
                    <p>Aucun exercice disponible.</p>
                  )}
                </div>

                {/* CORRECTIONS COLUMN */}
                <div
                  style={{
                    ...styles.pane,
                    background: "#fff8fc",
                    borderColor: "#edc5dc",
                  }}
                >
                  <h3
                    style={{
                      margin: "0 0 12px",
                      background:
                        "linear-gradient(90deg,#ffdcec,#ffcae5)",
                      borderRadius: 10,
                      padding: 12,
                      fontSize: 20,
                    }}
                  >
                    ⭕ Corrections
                  </h3>

                  {pairedExercises.length ? (
                    pairedExercises.map((item) => (
                      <div key={item.exercise.id}>
                        <div
                          style={{
                            background: "#ffe5f1",
                            borderRadius: 9,
                            padding: "8px 10px",
                            marginBottom: 8,
                            color: "#d82e75",
                            fontWeight: 900,
                          }}
                        >
                          Correction {item.number}
                        </div>

                        {item.correction ? (
                          resourceCard(
                            item.correction,
                            "#d82e75"
                          )
                        ) : (
                          <div
                            style={{
                              border: "1px dashed #edc5dc",
                              borderRadius: 12,
                              padding: 14,
                              marginBottom: 10,
                              color: "#a44c78",
                              fontSize: 13,
                            }}
                          >
                            Correction non disponible pour
                            cet exercice.
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <p>Aucune correction disponible.</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}


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
    background: "linear-gradient(105deg,#0645b8,#087fe5 60%,#063a96)",
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

// استخراج رقم التمرين أو التصحيح من العنوان أو النوع
function extractResourceNumber(title: string, type: string) {
  const text = `${type || ""} ${title || ""}`;

  const match = text.match(
    /(?:exercice|exercise|correction|corrig[eé])\s*(?:n[°ºo.]?\s*)?(\d+)/i
  );

  return match ? Number(match[1]) : null;
}

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

  const [chapterName, setChapterName] = useState<string>("");

  const [tab, setTab] = useState<"cours" | "exercices">("exercices");

  const [selectedPdf, setSelectedPdf] = useState<any>(null);

  const subject =
    subjects.find((s) => String(s.id) === subjectId) || subjects[0];

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
    (r) => (r.chapters?.title || "Sans chapitre") === activeChapter
  );

  const cours = chapterResources.filter((r) =>
    /cours|résumé|fiche/i.test(r.type || "")
  );

  const exercises = chapterResources.filter((r) =>
    /exercice|examen|contrôle/i.test(r.type || "")
  );

  const corrections = chapterResources.filter((r) =>
    /corrig|correction/i.test(r.type || "")
  );

  const pdfs = chapterResources.filter(
    (r) =>
      /pdf/i.test(r.type || "") ||
      (r.file_url && /\.pdf(?:$|[?#])/i.test(r.file_url))
  );

  function downloadUrl(r: any) {
    return `/api/download?url=${encodeURIComponent(r.file_url)}&title=${encodeURIComponent(
      r.title || "document"
    )}&resource_id=${encodeURIComponent(String(r.id || ""))}&level_id=${encodeURIComponent(
      String(r.level_id || "")
    )}&subject_id=${encodeURIComponent(String(r.subject_id || ""))}`;
  }

  function resourceCard(r: any, accent = BLUE) {
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
            overflowWrap: "anywhere",
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
              type="button"
              onClick={() => setSelectedPdf(r)}
              style={{
                background: BLUE,
                color: "white",
                border: "none",
                borderRadius: 9,
                padding: "8px 11px",
                fontWeight: 800,
                fontSize: 12,
                cursor: "pointer",
              }}
            >
              👁 Consulter
            </button>

            <a
              href={downloadUrl(r)}
              style={{
                background: "#20a43a",
                color: "white",
                borderRadius: 9,
                padding: "8px 11px",
                fontWeight: 800,
                fontSize: 12,
                textDecoration: "none",
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
      type="button"
      onClick={() => {
        setTab(key);
        setSelectedPdf(null);
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

  // Récupérer les corrections déjà associées à un exercice
  const usedCorrectionIds = new Set<string>();

  function findCorrection(exercise: any, index: number) {
    const exerciseNumber = extractResourceNumber(
      exercise.title,
      exercise.type
    );

    if (exerciseNumber !== null) {
      const matchingCorrection = corrections.find((correction) => {
        const correctionNumber = extractResourceNumber(
          correction.title,
          correction.type
        );

        return (
          correctionNumber === exerciseNumber &&
          !usedCorrectionIds.has(String(correction.id))
        );
      });

      if (matchingCorrection) {
        usedCorrectionIds.add(String(matchingCorrection.id));
        return matchingCorrection;
      }
    }

    // Si aucun numéro correspondant, utiliser l'ordre des ressources
    const fallbackCorrection = corrections.find(
      (correction, correctionIndex) =>
        correctionIndex === index &&
        !usedCorrectionIds.has(String(correction.id))
    );

    if (fallbackCorrection) {
      usedCorrectionIds.add(String(fallbackCorrection.id));
      return fallbackCorrection;
    }

    return null;
  }

  const exercisePairs = exercises.map((exercise, index) => ({
    exercise,
    correction: findCorrection(exercise, index),
    number:
      extractResourceNumber(exercise.title, exercise.type) ??
      index + 1,
  }));

  const remainingCorrections = corrections.filter(
    (correction) => !usedCorrectionIds.has(String(correction.id))
  );

  return (
    <main style={styles.page}>
      <div style={styles.breadcrumb}>
        ⌂ Accueil　›　{level.cycle || "Niveau"}　›　{level.name}　›　
        {subject?.name || "Matière"}
      </div>

      <header style={styles.banner}>
        <div>
          <div style={{ fontSize: 13, opacity: 0.9, fontWeight: 700 }}>
            ESPACE ÉDUCATIF • MASSAR
          </div>

          <h1
            style={{
              margin: "7px 0 0",
              fontSize: "clamp(24px,3vw,36px)",
              fontWeight: 900,
            }}
          >
            {subject?.icon || "📚"} {subject?.name || "Choisissez une matière"} –{" "}
            {level.name}
          </h1>
        </div>

        <div style={{ fontSize: 54 }} aria-hidden>
          📚 ✏️
        </div>
      </header>

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
            type="button"
            onClick={() => {
              setSubjectId(String(s.id));
              setChapterName("");
              setSelectedPdf(null);
            }}
            style={{
              border: "1px solid #b7cbe8",
              borderRadius: 12,
              padding: "10px 15px",
              background:
                String(s.id) === String(subject?.id) ? BLUE : "white",
              color:
                String(s.id) === String(subject?.id) ? "white" : NAVY,
              fontWeight: 900,
              cursor: "pointer",
            }}
          >
            {s.icon || "📘"} {s.name}
          </button>
        ))}
      </div>

      <div style={styles.mainGrid}>
        <aside style={styles.sidebar}>
          <div style={styles.sideHead}>📖 Chapitres</div>

          {chapters.map((chapter, i) => (
            <button
              key={chapter}
              type="button"
              onClick={() => {
                setChapterName(chapter);
                setSelectedPdf(null);
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
                color: chapter === activeChapter ? "white" : NAVY,
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

          <div
            style={{
              background:
                "linear-gradient(110deg,#0645b8,#087fe5 55%,#b8d5ff)",
              color: "white",
              borderRadius: 12,
              padding: "15px",
              fontWeight: 900,
              marginTop: 10,
              fontSize: 18,
              boxShadow: "0 4px 12px #0645b820",
            }}
          >
            📘 Leçon : {activeChapter}
          </div>

          <div style={styles.tabRow}>
            {tabButton("cours", "Cours", "📖")}
            {tabButton("exercices", "Exercices + Correction", "📝")}
          </div>

          {tab === "cours" && (
            <div style={{ ...styles.pane, background: "#f5faff" }}>
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

          {tab === "exercices" && (
            <div style={{ ...styles.pane, background: "#f9fcff" }}>
              <h3
                style={{
                  margin: "0 0 12px",
                  background: "linear-gradient(90deg,#dceaff,#c6ddff)",
                  borderRadius: 10,
                  padding: 12,
                  fontSize: 20,
                }}
              >
                ✏️ Exercices et corrections
              </h3>

              {exercises.length === 0 && corrections.length === 0 && (
                <p>Aucun exercice ou correction disponible.</p>
              )}

              {exercisePairs.map(({ exercise, correction, number }) => (
                <div
                  key={exercise.id}
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fit,minmax(230px,1fr))",
                    gap: 10,
                    marginBottom: 12,
                  }}
                >
                  <div
                    style={{
                      border: "1px solid #b8cce9",
                      borderRadius: 13,
                      padding: 10,
                      background: "#f4f9ff",
                    }}
                  >
                    <div
                      style={{
                        background: "#dceaff",
                        borderRadius: 9,
                        padding: 8,
                        color: BLUE,
                        fontWeight: 900,
                        marginBottom: 8,
                      }}
                    >
                      ✏️ Exercice {number}
                    </div>

                    {resourceCard(exercise, "#0875e1")}
                  </div>

                  <div
                    style={{
                      border: "1px solid #edc5dc",
                      borderRadius: 13,
                      padding: 10,
                      background: "#fff8fc",
                    }}
                  >
                    <div
                      style={{
                        background: "#ffdcec",
                        borderRadius: 9,
                        padding: 8,
                        color: "#d82e75",
                        fontWeight: 900,
                        marginBottom: 8,
                      }}
                    >
                      ✅ Correction {number}
                    </div>

                    {correction ? (
                      resourceCard(correction, "#d82e75")
                    ) : (
                      <p style={{ fontSize: 13 }}>
                        Correction non disponible pour cet exercice.
                      </p>
                    )}
                  </div>
                </div>
              ))}

              {remainingCorrections.map((correction, index) => (
                <div
                  key={correction.id}
                  style={{
                    border: "1px solid #edc5dc",
                    borderRadius: 13,
                    padding: 10,
                    background: "#fff8fc",
                    marginBottom: 12,
                  }}
                >
                  <div
                    style={{
                      background: "#ffdcec",
                      borderRadius: 9,
                      padding: 8,
                      color: "#d82e75",
                      fontWeight: 900,
                      marginBottom: 8,
                    }}
                  >
                    ✅ Correction supplémentaire {index + 1}
                  </div>

                  {resourceCard(correction, "#d82e75")}
                </div>
              ))}
            </div>
          )}

          {pdfs.length > 0 && (
            <div
              style={{
                ...styles.pane,
                marginTop: 14,
                background: "#fffafa",
              }}
            >
              <h3
                style={{
                  margin: "0 0 12px",
                  background: "#ffe5e5",
                  borderRadius: 10,
                  padding: 12,
                  fontSize: 20,
                }}
              >
                📄 Documents du chapitre
              </h3>

              {pdfs.map((r) => resourceCard(r, "#c52222"))}
            </div>
          )}

          {selectedPdf && (
            <div
              style={{
                marginTop: 16,
                border: "1px solid #b8cce9",
                borderRadius: 16,
                padding: 12,
                background: "#fff",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 10,
                  flexWrap: "wrap",
                  marginBottom: 12,
                }}
              >
                <h3 style={{ margin: 0, color: NAVY }}>
                  📄 {selectedPdf.title}
                </h3>

                <button
                  type="button"
                  onClick={() => setSelectedPdf(null)}
                  style={{
                    border: "none",
                    borderRadius: 9,
                    padding: "8px 12px",
                    background: "#e8eff9",
                    color: NAVY,
                    fontWeight: 900,
                    cursor: "pointer",
                  }}
                >
                  ✖ Fermer
                </button>
              </div>

              <iframe
                key={selectedPdf.id}
                src={selectedPdf.file_url}
                title={selectedPdf.title || "Document PDF"}
                style={{
                  width: "100%",
                  height: "min(75vh, 850px)",
                  minHeight: 450,
                  border: "1px solid #d8e5f5",
                  borderRadius: 10,
                  background: "#f5f8fc",
                }}
              />

              <div style={{ marginTop: 10 }}>
                <a
                  href={downloadUrl(selectedPdf)}
                  style={{
                    display: "inline-block",
                    background: "#20a43a",
                    color: "white",
                    borderRadius: 9,
                    padding: "9px 13px",
                    fontWeight: 800,
                    fontSize: 13,
                    textDecoration: "none",
                  }}
                >
                  ⬇ Télécharger le document
                </a>
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

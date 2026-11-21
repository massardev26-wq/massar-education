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
    minHeight: 300,
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
  section: {
    border: "1px solid #b8cce9",
    borderRadius: 14,
    padding: 13,
    background: "#fff",
    marginTop: 14,
    minWidth: 0,
  },
};

export default function LevelLearningClient({
  level,
  subjects,
  chapters,
  resources,
}: {
  level: any;
  subjects: any[];
  chapters: any[];
  resources: any[];
}) {
  const [subjectId, setSubjectId] = useState(String(subjects[0]?.id ?? ""));
  const [selectedChapterId, setSelectedChapterId] = useState("");
  const [viewingResource, setViewingResource] = useState<any>(null);

  const subject =
    subjects.find((item) => String(item.id) === subjectId) || subjects[0];

  const subjectResources = useMemo(
    () => resources.filter((resource) => String(resource.subject_id) === String(subject?.id)),
    [resources, subject?.id]
  );

  const subjectChapters = useMemo(
    () =>
      chapters
        .filter((chapter) => String(chapter.subject_id) === String(subject?.id))
        .sort((a, b) => {
          const pa = Number(a.position ?? 0);
          const pb = Number(b.position ?? 0);
          return pa - pb || String(a.title).localeCompare(String(b.title), "fr");
        }),
    [chapters, subject?.id]
  );

  const hasUnchapteredResources = subjectResources.some(
    (resource) => !resource.chapter_id
  );

  const chapterOptions = useMemo(
    () => [
      ...subjectChapters.map((chapter) => ({
        id: String(chapter.id),
        title: chapter.title,
        position: chapter.position,
      })),
      ...(hasUnchapteredResources
        ? [{ id: "sans-chapitre", title: "Sans chapitre", position: 999999 }]
        : []),
    ],
    [subjectChapters, hasUnchapteredResources]
  );

  const activeChapterId = chapterOptions.some((item) => item.id === selectedChapterId)
    ? selectedChapterId
    : chapterOptions[0]?.id || "";

  const activeChapter = chapterOptions.find((item) => item.id === activeChapterId);

  const chapterResources = subjectResources.filter((resource) =>
    activeChapterId === "sans-chapitre"
      ? !resource.chapter_id
      : String(resource.chapter_id) === activeChapterId
  );

  const cours = chapterResources.filter((resource) =>
    /cours|résumé|resume|fiche|leçon|lecon/i.test(String(resource.type || ""))
  );

  const corrections = chapterResources.filter((resource) => {
    const searchable = `${resource.type || ""} ${resource.title || ""} ${resource.description || ""}`;
    return /corrig|correction|solution/i.test(searchable);
  });

  const exercises = chapterResources.filter((resource) => {
    const searchable = `${resource.type || ""} ${resource.title || ""} ${resource.description || ""}`;
    return /exercice|examen|contrôle|controle|test/i.test(searchable) &&
      !/corrig|correction|solution/i.test(searchable);
  });


  function resourceCard(resource: any, accent = BLUE) {
    return (
      <article
        key={resource.id}
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
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 8 }}>
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
            {resource.type || "Ressource"}
          </span>
          {resource.is_premium && (
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

        <b style={{ fontSize: 15, lineHeight: 1.4 }}>{resource.title}</b>
        {resource.description && (
          <p
            style={{
              margin: "6px 0 0",
              color: "#526078",
              fontSize: 13,
              whiteSpace: "pre-wrap",
            }}
          >
            {resource.description}
          </p>
        )}

        {resource.file_url && !resource.is_premium && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginTop: 10 }}>
            <button
              onClick={() => setViewingResource(resource)}
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
              href={`/api/download?url=${encodeURIComponent(resource.file_url)}&title=${encodeURIComponent(resource.title || "document")}&resource_id=${encodeURIComponent(String(resource.id || ""))}&level_id=${encodeURIComponent(String(resource.level_id || level.id))}&subject_id=${encodeURIComponent(String(resource.subject_id || ""))}`}
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

  function sectionTitle(title: string, background: string) {
    return (
      <h3
        style={{
          margin: "0 0 12px",
          background,
          borderRadius: 10,
          padding: 12,
          fontSize: 19,
        }}
      >
        {title}
      </h3>
    );
  }

  return (
    <main style={styles.page}>
      <div style={styles.breadcrumb}>
        ⌂ Accueil　›　{level.cycle || "Niveau"}　›　{level.name}　›　{subject?.name || "Matière"}
      </div>

      <header style={styles.banner}>
        <div>
          <div style={{ fontSize: 13, opacity: 0.9, fontWeight: 700 }}>
            ESPACE ÉDUCATIF • MASSAR
          </div>
          <h1 style={{ margin: "7px 0 0", fontSize: "clamp(24px,3vw,36px)", fontWeight: 900 }}>
            {subject?.icon || "📚"} {subject?.name || "Choisissez une matière"} – {level.name}
          </h1>
        </div>
        <div style={{ fontSize: 54 }} aria-hidden>📚 ✏️</div>
      </header>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 14 }}>
        {subjects.map((item) => (
          <button
            key={item.id}
            onClick={() => {
              setSubjectId(String(item.id));
              setSelectedChapterId("");
              setViewingResource(null);
            }}
            style={{
              border: "1px solid #b7cbe8",
              borderRadius: 12,
              padding: "10px 15px",
              background: String(item.id) === String(subject?.id) ? BLUE : "white",
              color: String(item.id) === String(subject?.id) ? "white" : NAVY,
              fontWeight: 900,
              cursor: "pointer",
            }}
          >
            {item.icon || "📘"} {item.name}
          </button>
        ))}
      </div>

      <div style={styles.mainGrid}>
        <aside style={styles.sidebar}>
          <div style={styles.sideHead}>📖 Chapitres</div>
          {chapterOptions.map((chapter, index) => (
            <button
              key={chapter.id}
              onClick={() => {
                setSelectedChapterId(chapter.id);
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
                background: chapter.id === activeChapterId
                  ? "linear-gradient(100deg,#0645b8,#0759c8)"
                  : "white",
                color: chapter.id === activeChapterId ? "white" : NAVY,
                fontWeight: 900,
                fontSize: 14,
                cursor: "pointer",
              }}
            >
              <span style={{ fontSize: 20 }}>{chapter.id === "sans-chapitre" ? "📄" : "📁"}</span>
              <span style={{ flex: 1 }}>
                {chapter.id === "sans-chapitre" ? chapter.title : `Chapitre ${index + 1} : ${chapter.title}`}
              </span>
              <span>›</span>
            </button>
          ))}
          {!chapterOptions.length && (
            <p style={{ padding: 14, color: "#64748b" }}>Aucun chapitre disponible.</p>
          )}
        </aside>

        <section style={styles.main}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <h2 style={{ margin: "4px 0", fontSize: "clamp(20px,2.4vw,27px)", fontWeight: 900 }}>
              📂 {activeChapter?.title || "Aucun chapitre"}
            </h2>
            <span style={{ color: "#59708f", fontWeight: 700, fontSize: 13 }}>
              {level.name} › {subject?.name}
            </span>
          </div>

          {viewingResource && (
            <div style={{ border: "1px solid #b8cce9", borderRadius: 15, padding: 12, background: "#f5faff", marginTop: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10, marginBottom: 10 }}>
                <h3 style={{ margin: 0, fontSize: 17, fontWeight: 900 }}>📄 {viewingResource.title}</h3>
                <button
                  onClick={() => setViewingResource(null)}
                  style={{ background: "#dc2626", color: "white", border: "none", borderRadius: 9, padding: "8px 12px", fontWeight: 800, cursor: "pointer" }}
                >
                  ✖ Fermer
                </button>
              </div>
              <iframe
                src={viewingResource.file_url}
                title={viewingResource.title}
                style={{ width: "100%", height: "75vh", minHeight: 450, border: "1px solid #d2e0f3", borderRadius: 10, background: "white" }}
              />
              <div style={{ marginTop: 10 }}>
                <a href={viewingResource.file_url} target="_blank" rel="noopener noreferrer" style={{ color: BLUE, fontWeight: 800, fontSize: 13 }}>
                  Ouvrir le document dans un nouvel onglet ↗
                </a>
              </div>
            </div>
          )}

          <div
            style={{
              background: "linear-gradient(90deg,#0645b8,#087fe5)",
              color: "white",
              borderRadius: 12,
              padding: "17px 15px",
              fontWeight: 900,
              marginTop: 14,
              fontSize: 19,
            }}
          >
            📖 Contenu du chapitre : {activeChapter?.title}
          </div>

          <section style={{ ...styles.section, background: "#f5faff" }}>
            {sectionTitle("📘 Cours", "#dceaff")}
            {cours.length ? cours.map((resource) => resourceCard(resource)) : (
              <p style={{ color: "#64748b" }}>Aucun cours disponible pour ce chapitre.</p>
            )}
          </section>

          <section style={{ ...styles.section, background: "#f9fcff" }}>
            {sectionTitle("✏️ Exercices", "linear-gradient(90deg,#dceaff,#c6ddff)")}
            {exercises.length ? exercises.map((resource) => resourceCard(resource, "#0875e1")) : (
              <p style={{ color: "#64748b" }}>Aucun exercice disponible pour ce chapitre.</p>
            )}
          </section>

          <section style={{ ...styles.section, background: "#fff8fc", borderColor: "#edc5dc" }}>
            {sectionTitle("⭕ Corrections", "linear-gradient(90deg,#ffdcec,#ffcae5)")}
            {corrections.length ? corrections.map((resource) => resourceCard(resource, "#d82e75")) : (
              <p style={{ color: "#a44c78" }}>Aucune correction disponible pour ce chapitre.</p>
            )}
          </section>

          {chapterResources.length === 0 && (
            <p style={{ padding: 12, color: "#64748b", textAlign: "center" }}>
              Aucun contenu n’a encore été ajouté à ce chapitre.
            </p>
          )}
        </section>
      </div>

      <style jsx>{`
        @media (max-width: 760px) {
          main > div[style*="grid"] { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </main>
  );
}

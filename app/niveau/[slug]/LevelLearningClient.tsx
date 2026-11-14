
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
  const [selectedSubject, setSelectedSubject] = useState<any>(null);

  const filteredResources = useMemo(() => {
    if (!selectedSubject) return resources;

    return resources.filter(
      (resource: any) => resource.subjectId === selectedSubject.id
    );
  }, [resources, selectedSubject]);

  return (
    <div style={styles.page}>
      <div style={styles.banner}>
        <h1>{level?.name || level?.title || "المستوى الدراسي"}</h1>
      </div>

      <div style={styles.mainGrid}>
        <aside style={styles.sidebar}>
          <div style={styles.sideHead}>المواد الدراسية</div>

          {subjects.map((subject: any) => (
            <button
              key={subject.id}
              onClick={() => setSelectedSubject(subject)}
              style={{
                display: "block",
                width: "100%",
                padding: 12,
                border: "none",
                background:
                  selectedSubject?.id === subject.id
                    ? "#e5efff"
                    : "white",
                color: NAVY,
                cursor: "pointer",
              }}
            >
              {subject.name || subject.title}
            </button>
          ))}
        </aside>

        <main style={styles.main}>
          <h2>
            {selectedSubject?.name ||
              selectedSubject?.title ||
              "جميع الموارد"}
          </h2>

          {filteredResources.map((resource: any, index: number) => (
            <div key={resource.id || index} style={styles.pane}>
              <h3>{resource.title || resource.name}</h3>
              <p>{resource.description}</p>
            </div>
          ))}
        </main>
      </div>
    </div>
  );
}

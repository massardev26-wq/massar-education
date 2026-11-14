"use client";

import { useMemo, useState } from "react";
import type { CSSProperties } from "react";

const BLUE = "#0645b8";
const NAVY = "#08245f";

type Subject = {
  id: string | number;
  name?: string;
  title?: string;
};

type Resource = {
  id?: string | number;
  subjectId?: string | number;
  title?: string;
  name?: string;
  description?: string;
  type?: string;
};

type LevelLearningClientProps = {
  level: any;
  subjects: Subject[];
  resources: Resource[];
};

const styles: Record<string, CSSProperties> = {
  page: {
    color: NAVY,
    background: "#f7faff",
    padding: "16px 1.2% 28px",
    fontFamily: "Arial, sans-serif",
    minHeight: "100vh",
    boxSizing: "border-box",
  },
  breadcrumb: {
    color: BLUE,
    fontWeight: 700,
    fontSize: 14,
    margin: "0 0 14px",
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
  bannerTitle: {
    margin: 0,
    fontSize: "clamp(22px, 3vw, 32px)",
    fontWeight: 900,
  },
  mainGrid: {
    display: "grid",
    gridTemplateColumns: "minmax(220px, 23%) minmax(0, 1fr)",
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
    fontSize: 20,
  },
  subjectButton: {
    display: "block",
    width: "100%",
    padding: "13px 16px",
    border: "none",
    borderBottom: "1px solid #edf2fa",
    textAlign: "right",
    fontSize: 15,
    fontWeight: 700,
    cursor: "pointer",
    transition: "background 0.15s ease",
  },
  main: {
    border: "1px solid #b9cce8",
    borderRadius: 17,
    padding: 16,
    background: "white",
    minWidth: 0,
  },
  mainTitle: {
    margin: "0 0 14px",
    fontSize: 22,
    fontWeight: 900,
  },
  resourceGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 260px), 1fr))",
    gap: 12,
  },
  pane: {
    border: "1px solid #b8cce9",
    borderRadius: 15,
    padding: 14,
    minWidth: 0,
    background: "#fff",
    boxShadow: "0 2px 8px #0b3e8110",
  },
  resourceTitle: {
    margin: "0 0 8px",
    fontSize: 17,
    fontWeight: 800,
    overflowWrap: "anywhere",
  },
  description: {
    margin: 0,
    color: "#435675",
    lineHeight: 1.7,
    whiteSpace: "pre-wrap",
    overflowWrap: "anywhere",
  },
  typeBadge: {
    display: "inline-block",
    marginBottom: 9,
    borderRadius: 999,
    padding: "4px 10px",
    background: "#e8f1ff",
    color: BLUE,
    fontSize: 12,
    fontWeight: 800,
  },
  empty: {
    border: "1px dashed #b8cce9",
    borderRadius: 14,
    padding: 24,
    textAlign: "center",
    color: "#60728f",
    background: "#f8fbff",
    lineHeight: 1.8,
  },
};

function getSubjectLabel(subject: Subject) {
  return subject.name || subject.title || "مادة بدون اسم";
}

function getResourceLabel(resource: Resource) {
  return resource.title || resource.name || "مورد بدون عنوان";
}

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
  subjects = [],
  resources = [],
}: LevelLearningClientProps) {
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);

  const filteredResources = useMemo(() => {
    if (!selectedSubject) return resources;

    return resources.filter(
      (resource) => String(resource.subjectId) === String(selectedSubject.id)
    );
  }, [resources, selectedSubject]);

  const levelName = level?.name || level?.title || "المستوى الدراسي";
  const selectedSubjectName = selectedSubject
    ? getSubjectLabel(selectedSubject)
    : "جميع الموارد";

  return (
    <div style={styles.page} dir="rtl">
      <div style={styles.banner}>
        <h1 style={styles.bannerTitle}>{levelName}</h1>
      </div>

      <div style={styles.mainGrid}>
        <aside style={styles.sidebar}>
          <div style={styles.sideHead}>المواد الدراسية</div>

          <button
            type="button"
            onClick={() => setSelectedSubject(null)}
            style={{
              ...styles.subjectButton,
              background: selectedSubject === null ? "#e5efff" : "#fff",
              color: NAVY,
            }}
          >
            جميع الموارد
          </button>

          {subjects.map((subject) => {
            const isSelected = String(selectedSubject?.id) === String(subject.id);

            return (
              <button
                type="button"
                key={subject.id}
                onClick={() => setSelectedSubject(subject)}
                style={{
                  ...styles.subjectButton,
                  background: isSelected ? "#e5efff" : "#fff",
                  color: NAVY,
                }}
              >
                {getSubjectLabel(subject)}
              </button>
            );
          })}
        </aside>

        <main style={styles.main}>
          <h2 style={styles.mainTitle}>{selectedSubjectName}</h2>

          {filteredResources.length === 0 ? (
            <div style={styles.empty}>
              لا توجد موارد متاحة لهذه المادة حالياً.
            </div>
          ) : (
            <div style={styles.resourceGrid}>
              {filteredResources.map((resource, index) => {
                const title = getResourceLabel(resource);
                const type = resource.type || "مورد تعليمي";
                const number = extractResourceNumber(title, type);

                return (
                  <article
                    key={resource.id ?? `${title}-${index}`}
                    style={styles.pane}
                  >
                    <span style={styles.typeBadge}>
                      {type}
                      {number !== null ? ` • ${number}` : ""}
                    </span>

                    <h3 style={styles.resourceTitle}>{title}</h3>

                    {resource.description ? (
                      <p style={styles.description}>{resource.description}</p>
                    ) : (
                      <p style={styles.description}>لا يوجد وصف لهذا المورد.</p>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </main>
      </div>


    </div>
  );
}

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

      <style jsx>{`
        @media (max-width: 760px) {
          div[style*="grid-template-columns"] {
            grid-template-columns: minmax(0, 1fr) !important;
          }
        }
      `}</style>
    </div>
  );
}

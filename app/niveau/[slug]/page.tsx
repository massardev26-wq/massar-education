<a
  href={`/api/download?url=${encodeURIComponent(r.file_url)}&title=${encodeURIComponent(r.title || "document")}&resource_id=${r.id || ""}&level_id=${r.level_id || ""}&subject_id=${r.subject_id || ""}`}
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
  <span style={{ fontSize: "22px" }}>⬇</span>
  Télécharger PDF
</a>

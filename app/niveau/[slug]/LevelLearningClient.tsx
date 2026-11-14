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

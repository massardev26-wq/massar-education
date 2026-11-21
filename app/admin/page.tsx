              Cette rubrique nécessite une table/structure dédiée dans Supabase pour activer les actions.
              La navigation et l’interface sont en place, mais aucune donnée fictive n’est affichée.
            </p>
          </div>
        )}

        {editingChapter && (
          <div style={{ position: "fixed", inset: 0, zIndex: 1100, background: "#0b173b99", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
            <div style={{ ...css.panel, width: "min(560px, 100%)", maxHeight: "90vh", overflowY: "auto", boxShadow: "0 18px 50px #0003" }}>
              <h2 style={{ marginTop: 0 }}>✏️ Modifier le chapitre</h2>
              <label style={{ display: "block", fontWeight: 700, marginBottom: 6 }}>Nom du chapitre</label>
              <input style={{ ...css.input, width: "100%", boxSizing: "border-box", marginBottom: 14 }} value={chapterEditForm.title} onChange={e => setChapterEditForm({ ...chapterEditForm, title: e.target.value })} />

              <label style={{ display: "block", fontWeight: 700, marginBottom: 6 }}>Matière</label>
              <select style={{ ...css.input, width: "100%", boxSizing: "border-box", marginBottom: 14 }} value={chapterEditForm.subject_id} onChange={e => setChapterEditForm({ ...chapterEditForm, subject_id: e.target.value })}>
                <option value="">Choisir une matière</option>
                {data.subjects.map((subject: any) => <option key={subject.id} value={String(subject.id)}>{subject.name}</option>)}
              </select>

              <label style={{ display: "block", fontWeight: 700, marginBottom: 8 }}>Niveaux associés (choisissez un ou plusieurs)</label>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(130px,1fr))", gap: 8, marginBottom: 18 }}>
                {data.levels.map((level: any) => (
                  <label key={level.id} style={{ display: "flex", alignItems: "center", gap: 7, padding: 8, border: "1px solid #dce5f3", borderRadius: 8 }}>
                    <input type="checkbox" checked={chapterEditForm.level_ids.includes(String(level.id))} onChange={e => setChapterEditForm({ ...chapterEditForm, level_ids: e.target.checked ? [...chapterEditForm.level_ids, String(level.id)] : chapterEditForm.level_ids.filter(id => id !== String(level.id)) })} />
                    <span>{level.cycle ? `${level.cycle} — ` : ""}{level.name}</span>
                  </label>
                ))}
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
                <button style={css.btn} onClick={() => setEditingChapter(null)}>Annuler</button>
                <button style={css.primary} onClick={saveChapterEdit}>Enregistrer</button>
              </div>
            </div>
          </div>
        )}

        {editingResource && (
          <div style={{
            position: "fixed",
            inset: 0,
            zIndex: 1000,
            background: "#0b173b99",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16
          }}>
            <div style={{ ...css.panel, width: "min(520px, 100%)", boxShadow: "0 18px 50px #0003" }}>
              <h2 style={{ marginTop: 0 }}>✏️ Modifier la ressource</h2>

              <label style={{ display: "block", fontWeight: 700, marginBottom: 6 }}>Titre</label>
              <input
                style={{ ...css.input, width: "100%", boxSizing: "border-box", marginBottom: 14 }}
                value={editForm.title}
                onChange={e => setEditForm({ ...editForm, title: e.target.value })}
                placeholder="Nom de la ressource"
              />

              <label style={{ display: "block", fontWeight: 700, marginBottom: 6 }}>Type</label>
              <select
                style={{ ...css.input, width: "100%", boxSizing: "border-box", marginBottom: 14 }}
                value={editForm.type}
                onChange={e => setEditForm({ ...editForm, type: e.target.value })}
              >
                {[...new Set([...(TYPES || []), editForm.type].filter(Boolean))].map((t: any) =>
                  <option key={t} value={t}>{t}</option>
                )}
              </select>

              <label style={{ display: "block", fontWeight: 700, marginBottom: 6 }}>Niveau</label>
              <select
                style={{ ...css.input, width: "100%", boxSizing: "border-box", marginBottom: 18 }}
                value={editForm.level_id}
                onChange={e => setEditForm({ ...editForm, level_id: e.target.value, chapter_id: "" })}
              >
                <option value="">Choisir un niveau</option>
                {data.levels.map((l: any) => (
                  <option key={l.id} value={String(l.id)}>
                    {l.cycle ? `${l.cycle} — ` : ""}{l.name}
                  </option>
                ))}
              </select>

              <label style={{ display: "block", fontWeight: 700, marginBottom: 6 }}>Chapitre (facultatif)</label>
              <select
                style={{ ...css.input, width: "100%", boxSizing: "border-box", marginBottom: 18 }}
                value={editForm.chapter_id || ""}
                onChange={e => setEditForm({ ...editForm, chapter_id: e.target.value })}
              >
                <option value="">Aucun chapitre</option>
                {data.chapters
                  .filter((c: any) =>
                    String(c.level_id) === String(editForm.level_id) &&
                    String(c.subject_id) === String(editingResource.subject_id)
                  )
                  .sort((a: any, b: any) =>
                    (Number(a.position ?? 999999) - Number(b.position ?? 999999)) ||
                    String(a.title || "").localeCompare(String(b.title || ""), "fr")
                  )
                  .map((c: any) => (
                    <option key={c.id} value={String(c.id)}>{c.title}</option>
                  ))}
              </select>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
                <button style={css.btn} onClick={() => setEditingResource(null)}>Annuler</button>
                <button style={css.primary} onClick={saveResourceEdit}>Enregistrer les modifications</button>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  </main>;
}

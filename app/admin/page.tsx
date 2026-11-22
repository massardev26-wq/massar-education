                  style={{ ...css.input, width: "100%", marginTop: 8 }}
                  rows={3}
                  defaultValue={a.code || ""}
                  placeholder="Code AdSense facultatif"
                  onBlur={e => run(supabase.from("ads").update({ code: e.target.value }).eq("slot", a.slot))}
                />
              </div>
            ))}
          </div>
        )}

        {(section === "users" || section === "settings") && (
          <div style={css.panel}>
            <h2>{section === "users" ? "♙ Utilisateurs" : "⚙ Paramètres"}</h2>
            <p>
              Cette rubrique nécessite une table/structure dédiée dans Supabase pour activer les actions.
              La navigation et l’interface sont en place, mais aucune donnée fictive n’est affichée.
            </p>
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

              <label style={{ display: "block", fontWeight: 700, marginBottom: 6 }}>Niveaux concernés</label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 16 }}>
                {data.levels.map((l: any) => (
                  <label key={l.id} style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                    <input type="checkbox" checked={(editForm.level_ids || []).map(String).includes(String(l.id))} onChange={e => {
                      const current = (editForm.level_ids || []).map(String);
                      const next = e.target.checked ? [...current, String(l.id)] : current.filter((id: string) => id !== String(l.id));
                      setEditForm({ ...editForm, level_ids: next, level_id: next[0] || "", chapter_id: "" });
                    }} />
                    {l.name}
                  </label>
                ))}
              </div>

              <label style={{ display: "block", fontWeight: 700, marginBottom: 6 }}>Contenu du cours</label>
              <textarea
                style={{ ...css.input, width: "100%", minHeight: 180, boxSizing: "border-box", marginBottom: 14 }}
                value={editForm.content || ""}
                onChange={e => setEditForm({ ...editForm, content: e.target.value })}
                placeholder="Texte du cours affiché sur la page dédiée"
              />

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

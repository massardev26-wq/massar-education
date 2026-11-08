
      <p>
        Activez ou désactivez chaque emplacement.
        Collez le code fourni par Google AdSense seulement
        quand votre compte sera validé.
      </p>

      {D.ads.map((a: any) => (
        <div
          className="card"
          key={a.slot}
          style={{ marginBottom: 10 }}
        >
          <label>
            <input
              type="checkbox"
              checked={a.enabled}
              onChange={(e) =>
                run(
                  supabase
                    .from("ads")
                    .update({
                      enabled: e.target.checked,
                    })
                    .eq("slot", a.slot)
                )
              }
            />

            <b>{a.label}</b>
          </label>

          <textarea
            style={{
              width: "100%",
              marginTop: 8,
            }}
            rows={3}
            placeholder="Code AdSense (facultatif)"
            defaultValue={a.code}
            onBlur={(e) =>
              run(
                supabase
                  .from("ads")
                  .update({ code: e.target.value })
                  .eq("slot", a.slot)
              )
            }
          />
        </div>
      ))}

      {editingResource && (
        <div style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(7,20,50,.65)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
          <div className="card" style={{ width: "min(520px, 100%)", background: "white", padding: 20, borderRadius: 14, boxShadow: "0 15px 50px #0003" }}>
            <h2 style={{ marginTop: 0 }}>✏️ Modifier la ressource</h2>
            <label style={{ display: "block", marginBottom: 5 }}>Titre</label>
            <input style={{ width: "100%", marginBottom: 12, boxSizing: "border-box" }} value={editForm.title} onChange={(e) => setEditForm({ ...editForm, title: e.target.value })} />
            <label style={{ display: "block", marginBottom: 5 }}>Type</label>
            <select style={{ width: "100%", marginBottom: 12 }} value={editForm.type} onChange={(e) => setEditForm({ ...editForm, type: e.target.value })}>
              {[...new Set([...TYPES, editForm.type].filter(Boolean))].map((t: any) => <option key={t} value={t}>{t}</option>)}
            </select>
            <label style={{ display: "block", marginBottom: 5 }}>Niveau</label>
            <select style={{ width: "100%", marginBottom: 16 }} value={editForm.level_id} onChange={(e) => setEditForm({ ...editForm, level_id: e.target.value })}>
              <option value="">Choisir un niveau</option>
              {D.levels.map((l: any) => <option key={l.id} value={String(l.id)}>{l.cycle ? `${l.cycle} — ` : ""}{l.name}</option>)}
            </select>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
              <button className="alt" onClick={() => setEditingResource(null)}>Annuler</button>
              <button onClick={saveResourceEdit}>Enregistrer les modifications</button>
            </div>
          </div>
        </div>
      )}
      </div>
      <style jsx global>{`
        .massar-admin-shell{display:grid;grid-template-columns:260px minmax(0,1fr);min-height:100vh;background:#f3f6fc;color:#172554;gap:0;font-family:Arial,Helvetica,sans-serif}
        .massar-admin-sidebar{background:linear-gradient(165deg,#073780 0%,#061d4d 62%,#041538 100%);color:#fff;padding:22px 14px;position:sticky;top:0;height:100vh;box-sizing:border-box;overflow:auto;box-shadow:8px 0 28px #08285b12}
        .massar-brand{display:flex;flex-direction:column;align-items:center;text-align:center;gap:9px;padding:12px 5px 28px;font-size:36px}
        .massar-brand strong{font-size:20px;letter-spacing:.2px}.massar-brand strong span{color:#55df79}.massar-brand small{font-size:12px;color:#c9dcff;letter-spacing:1.3px;text-transform:uppercase}
        .massar-admin-sidebar nav{display:flex;flex-direction:column;gap:7px}.massar-admin-sidebar nav a{color:#eaf1ff;text-decoration:none;padding:13px 14px;border-radius:11px;font-weight:700;display:block;border:1px solid transparent;transition:background .18s,transform .18s}.massar-admin-sidebar nav a:hover{background:#1c65c9;color:white;border-color:#4a8de7;transform:translateX(2px)}
        .massar-admin-main{width:auto!important;max-width:none!important;margin:0!important;padding:30px 32px!important;box-sizing:border-box;min-width:0}
        .massar-admin-main h1{font-size:clamp(25px,2.4vw,36px);margin:0 0 22px;color:#10245d;letter-spacing:-.7px}.massar-admin-main h1 span{color:#168b32}
        .massar-admin-main h2{margin-top:30px;padding:15px 18px;background:#fff;border:1px solid #e0e8f6;border-radius:14px;color:#10245d;box-shadow:0 5px 18px #10245d0a;font-size:20px}
        .massar-admin-main h3{color:#18366e;font-size:17px}
        .massar-admin-main .card,.massar-admin-main .row,.massar-admin-main .form{background:#fff;border:1px solid #e0e8f6;border-radius:14px;padding:16px;margin-bottom:12px;box-shadow:0 5px 18px #10245d0a}
        .massar-admin-main .row{display:flex;align-items:center;justify-content:space-between;gap:14px;flex-wrap:wrap}
        .massar-admin-main h2#admin-stats + div{display:grid!important;grid-template-columns:repeat(3,minmax(0,1fr))!important;gap:16px!important}
        .massar-admin-main h2#admin-stats + div > div{background:linear-gradient(145deg,#fff,#f5f9ff)!important;border:1px solid #dce7fa!important;border-radius:16px!important;padding:22px!important;text-align:left!important;box-shadow:0 8px 24px #163d7b0c!important;position:relative;overflow:hidden}
        .massar-admin-main h2#admin-stats + div > div:after{content:"";position:absolute;right:-22px;bottom:-32px;width:95px;height:95px;border-radius:50%;background:#dceaff;opacity:.45}
        .massar-admin-main h2#admin-stats + div > div > div:first-child{display:inline-flex;align-items:center;justify-content:center;width:48px;height:48px;border-radius:13px;background:#e8f1ff;font-size:25px!important;margin-bottom:12px}
        .massar-admin-main h2#admin-stats + div > div > div:nth-child(2){font-size:32px!important;color:#0a3478;font-weight:900;line-height:1.2;margin-bottom:5px}
        .massar-admin-main h2#admin-stats + div > div > div:nth-child(3){font-size:13px;color:#637594;font-weight:700}
        .massar-admin-main button{border-radius:9px;font-weight:700;padding:9px 13px;cursor:pointer;transition:filter .15s,transform .15s}.massar-admin-main button:hover{filter:brightness(.96);transform:translateY(-1px)}
        .massar-admin-main input,.massar-admin-main select,.massar-admin-main textarea{border:1px solid #c9d7f0;border-radius:9px;padding:10px;max-width:100%;box-sizing:border-box;background:#fff;color:#172554}
        .massar-admin-main table{background:#fff;border-radius:10px;overflow:hidden}.massar-admin-main th{background:#edf4ff;color:#19386f}.massar-admin-main td,.massar-admin-main th{padding:10px!important}
        .massar-admin-main .msg{padding:12px 15px;border-radius:10px;background:#eef6ff;border:1px solid #cfe1ff;color:#17417e}
        @media(max-width:1000px){.massar-admin-main h2#admin-stats + div{grid-template-columns:repeat(2,minmax(0,1fr))!important}}
        @media(max-width:850px){.massar-admin-shell{grid-template-columns:1fr}.massar-admin-sidebar{position:relative;height:auto;padding:14px}.massar-admin-sidebar nav{display:grid;grid-template-columns:repeat(2,minmax(0,1fr))}.massar-admin-main{padding:14px!important}.massar-admin-main h2#admin-stats + div{grid-template-columns:1fr!important}}
      `}</style>
    </main>
  );
}

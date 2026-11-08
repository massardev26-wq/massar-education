
"use client";

import { useEffect, useState } from "react";
import { supabase, TYPES } from "@/lib/supabase";

const slug = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

const nm = (a: any[], id: any) =>
  a.find((x) => x.id === id)?.name || "?";

export default function Admin() {
  const [st, setSt] = useState("load");
  const [em, setEm] = useState("");
  const [pw, setPw] = useState("");
  const [msg, setMsg] = useState("");

  const [D, setD] = useState<any>({
    levels: [],
    subjects: [],
    chapters: [],
    resources: [],
    ads: [],
    visits: [],
    downloads: [],
  });

  const [f, setF] = useState<any>({ type: TYPES[0] });
  const [nl, setNl] = useState({ name: "", cycle: "Primaire" });
  const [ns, setNs] = useState<any>({
    name: "",
    icon: "📘",
    lv: [],
  });
  const [nc, setNc] = useState("");
  const [editingResource, setEditingResource] = useState<any>(null);
  const [editForm, setEditForm] = useState<any>({ title: "", type: TYPES[0], level_id: "" });
  const [visitorSearch, setVisitorSearch] = useState("");
  const [selectedVisitorId, setSelectedVisitorId] = useState<string | null>(null);

  // Charger les données
  async function load() {
    try {
      const [
        levels,
        subjects,
        chapters,
        resources,
        ads,
        visits,
        downloads,
      ] = await Promise.all([
        supabase.from("levels").select("*").order("position"),
        supabase.from("subjects").select("*").order("name"),
        supabase.from("chapters").select("*").order("title"),
        supabase.from("resources").select("*").order("created_at"),
        supabase.from("ads").select("*").order("slot"),
        supabase
          .from("site_visits")
          .select("visitor_id,page_path,visited_at"),
        supabase
          .from("resource_downloads")
          .select("resource_id,resource_title,downloaded_at"),
      ]);

      console.log("LOAD LEVELS:", levels.error);
      console.log("LOAD SUBJECTS:", subjects.error);
      console.log("LOAD CHAPTERS:", chapters.error);
      console.log("LOAD RESOURCES:", resources.error);
      console.log("LOAD ADS:", ads.error);
      console.log("LOAD VISITS:", visits.error);
      console.log("LOAD DOWNLOADS:", downloads.error);

      if (
        levels.error ||
        subjects.error ||
        chapters.error ||
        resources.error ||
        ads.error ||
        visits.error ||
        downloads.error
      ) {
        setMsg("Erreur de chargement. Consultez la Console.");
      }

      setD({
        levels: levels.data || [],
        subjects: subjects.data || [],
        chapters: chapters.data || [],
        resources: resources.data || [],
        ads: ads.data || [],
        visits: visits.data || [],
        downloads: downloads.data || [],
      });
    } catch (error) {
      console.error("LOAD ERROR:", error);
      setMsg("Erreur lors du chargement des données.");
    }
  }

  // Vérifier si l'utilisateur est administrateur
  async function check() {
    setSt("load");
    setMsg("");

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      console.log("USER:", user);
      console.log("USER ERROR:", userError);

      if (userError) {
        setMsg("Erreur utilisateur : " + userError.message);
      }

      if (!user) {
        setSt("out");
        return;
      }

      const { data, error } = await supabase
        .from("admins")
        .select("user_id")
        .eq("user_id", user.id)
        .maybeSingle();

      console.log("ADMIN USER ID:", user.id);
      console.log("ADMIN DATA:", data);
      console.log("ADMIN ERROR:", error);

      if (error) {
        setMsg("Erreur Admin : " + error.message);
        setSt("no");
        return;
      }

      if (data) {
        setSt("ok");
        await load();
      } else {
        setMsg("Aucun accès administrateur trouvé pour ce compte.");
        setSt("no");
      }
    } catch (error) {
      console.error("CHECK ERROR:", error);
      setMsg("Erreur de vérification.");
      setSt("out");
    }
  }

  useEffect(() => {
    check();
  }, []);

  // Exécuter une opération
  async function run(
    p: any,
    ok = "Enregistré ✅"
  ) {
    const { error } = await p;

    if (error) {
      console.error("DATABASE ERROR:", error);
      setMsg("Erreur : " + error.message);
    } else {
      setMsg(ok);
    }

    await load();
  }

  // Connexion
  async function login() {
    setMsg("");

    if (!em || !pw) {
      setMsg("Veuillez saisir votre email et votre mot de passe.");
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({
      email: em.trim(),
      password: pw,
    });

    if (error) {
      console.error("LOGIN ERROR:", error);
      setMsg("Connexion impossible : " + error.message);
      return;
    }

    await check();
  }

  // Ajouter une ressource PDF ou image
  async function addRes() {
    if (!f.level_id || !f.subject_id || !f.title) {
      setMsg(
        "Choisissez le niveau, la matière et écrivez un titre."
      );
      return;
    }

    let file_url = null;

    if (f.file) {
      const path =
        Date.now() +
        "-" +
        slug(f.file.name.replace(/\.[^.]+$/, "")) +
        "." +
        f.file.name.split(".").pop();

      const { error } = await supabase.storage
        .from("files")
        .upload(path, f.file);

      if (error) {
        console.error("UPLOAD ERROR:", error);
        setMsg("Erreur d’envoi du fichier : " + error.message);
        return;
      }

      file_url = supabase.storage
        .from("files")
        .getPublicUrl(path).data.publicUrl;
    }

    await run(
      supabase.from("resources").insert({
        level_id: +f.level_id,
        subject_id: +f.subject_id,
        chapter_id: f.chapter_id ? +f.chapter_id : null,
        type: f.type,
        title: f.title,
        description: f.description || null,
        is_premium: !!f.is_premium,
        file_url,
      }),
      "Ressource publiée ✅"
    );

    setF({ type: TYPES[0] });
  }

  // Modifier le titre, le type et le niveau d'une ressource
  function editResource(r: any) {
    setEditingResource(r);
    setEditForm({ title: r.title || "", type: r.type || TYPES[0], level_id: String(r.level_id ?? "") });
  }

  async function saveResourceEdit() {
    if (!editingResource) return;
    if (!editForm.title.trim() || !editForm.type || !editForm.level_id) {
      setMsg("Veuillez renseigner le titre, le type et le niveau.");
      return;
    }
    const changedLevel = String(editForm.level_id) !== String(editingResource.level_id);
    const update: any = {
      title: editForm.title.trim(),
      type: editForm.type,
      level_id: Number(editForm.level_id),
    };
    // Le chapitre appartient à un niveau; le vider si on change le niveau.
    if (changedLevel) update.chapter_id = null;
    const { error } = await supabase.from("resources").update(update).eq("id", editingResource.id);
    if (error) {
      setMsg("Erreur modification : " + error.message);
      return;
    }
    setMsg("Ressource modifiée ✅");
    setEditingResource(null);
    await load();
  }

  // Sélecteur
  const sel = (
    v: any,
    on: any,
    items: any[],
    ph: string
  ) => (
    <select
      value={v || ""}
      onChange={(e) => on(e.target.value)}
    >
      <option value="">{ph}</option>
      {items.map((i) => (
        <option key={i.id} value={i.id}>
          {i.name || i.title}
        </option>
      ))}
    </select>
  );

  // Confirmation suppression
  const ask = (t: string, p: any) =>
    confirm("Supprimer définitivement : " + t + " ?") &&
    run(p, "Supprimé ✅");

  // Chargement
  if (st === "load") {
    return (
      <main className="wrap">
        <p>Chargement…</p>
      </main>
    );
  }

  // Connexion et vérification Admin
  if (st !== "ok") {
    return (
      <main className="wrap">
        <h1>Administration</h1>

        {st === "no" && (
          <p className="msg">
            Ce compte n’est pas administrateur.
          </p>
        )}

        <div className="form">
          <input
            type="email"
            placeholder="Email"
            value={em}
            onChange={(e) => setEm(e.target.value)}
          />

          <input
            type="password"
            placeholder="Mot de passe"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
          />

          <button onClick={login}>
            Se connecter
          </button>
        </div>

        {msg && <p className="msg">{msg}</p>}
      </main>
    );
  }

  const chs = D.chapters.filter(
    (c: any) =>
      c.level_id == f.level_id &&
      c.subject_id == f.subject_id
  );

  // Statistiques du site
  const totalVisits = D.visits.length;

  const totalVisitors = new Set(
    D.visits
      .map((v: any) => v.visitor_id)
      .filter(Boolean)
  ).size;

  const totalDownloads = D.downloads.length;

  // Pages les plus visitées
  const topPages = Object.entries(
    D.visits.reduce((acc: any, v: any) => {
      acc[v.page_path] = (acc[v.page_path] || 0) + 1;
      return acc;
    }, {})
  )
    .sort((a: any, b: any) => b[1] - a[1])
    .slice(0, 5);

  // Ressources les plus téléchargées
  const topDownloads = Object.entries(
    D.downloads.reduce((acc: any, d: any) => {
      const title = d.resource_title || "Document";
      acc[title] = (acc[title] || 0) + 1;
      return acc;
    }, {})
  )
    .sort((a: any, b: any) => b[1] - a[1])
    .slice(0, 5);

  // Grouper les visites par identifiant anonyme du navigateur
  const visitorRows = Object.entries(
    D.visits.reduce((acc: any, v: any) => {
      const id = v.visitor_id || "Sans identifiant";
      if (!acc[id]) acc[id] = { id, count: 0, pages: new Set(), first: v.visited_at, last: v.visited_at };
      acc[id].count += 1;
      acc[id].pages.add(v.page_path || "/");
      if (new Date(v.visited_at).getTime() < new Date(acc[id].first).getTime()) acc[id].first = v.visited_at;
      if (new Date(v.visited_at).getTime() > new Date(acc[id].last).getTime()) acc[id].last = v.visited_at;
      return acc;
    }, {})
  )
    .filter(([id]: any) => String(id).toLowerCase().includes(visitorSearch.toLowerCase()))
    .sort((a: any, b: any) => b[1].count - a[1].count)
    .map(([_, row]: any) => row);

  const selectedVisitorHistory = selectedVisitorId
    ? D.visits.filter((v: any) => (v.visitor_id || "Sans identifiant") === selectedVisitorId)
        .sort((a: any, b: any) => new Date(b.visited_at).getTime() - new Date(a.visited_at).getTime())
    : [];

  // Tableau de bord Admin
  return (
    <main className="wrap">
      <h1>Administration Massar</h1>

      <button
        className="alt"
        onClick={async () => {
          await supabase.auth.signOut();
          setSt("out");
          setMsg("");
        }}
      >
        Se déconnecter
      </button>

      {msg && <p className="msg">{msg}</p>}

      {/* DASHBOARD STATISTIQUES */}
      <h2>📊 Statistiques du site</h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
          gap: "12px",
          marginBottom: "25px",
        }}
      >
        {[
          {
            title: "Visites totales",
            value: totalVisits,
            icon: "👁️",
          },
          {
            title: "Visiteurs uniques",
            value: totalVisitors,
            icon: "👥",
          },
          {
            title: "Téléchargements PDF",
            value: totalDownloads,
            icon: "📥",
          },
        ].map((stat) => (
          <div
            key={stat.title}
            style={{
              background: "#f0fdf4",
              border: "1px solid #bbf7d0",
              borderRadius: "12px",
              padding: "18px",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: "28px" }}>{stat.icon}</div>

            <div style={{ fontSize: "26px", fontWeight: 900 }}>
              {stat.value}
            </div>

            <div style={{ fontWeight: 700 }}>{stat.title}</div>
          </div>
        ))}
      </div>

      {/* Pages les plus visitées */}
      <div className="card" style={{ marginBottom: "20px" }}>
        <h3>🔥 Pages les plus visitées</h3>

        {topPages.length === 0 ? (
          <p>Aucune visite enregistrée.</p>
        ) : (
          topPages.map(([page, count]: any) => (
            <div
              className="row"
              key={page}
              style={{
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <span>{page}</span>
              <b>{count} visites</b>
            </div>
          ))
        )}
      </div>

      {/* Ressources les plus téléchargées */}
      <div className="card" style={{ marginBottom: "25px" }}>
        <h3>📚 Ressources les plus téléchargées</h3>

        {topDownloads.length === 0 ? (
          <p>Aucun téléchargement enregistré.</p>
        ) : (
          topDownloads.map(([title, count]: any) => (
            <div
              className="row"
              key={title}
              style={{
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <span>{title}</span>
              <b>{count} téléchargements</b>
            </div>
          ))
        )}
      </div>

      {/* Visiteurs détaillés et historique de téléchargement */}
      <div className="card" style={{ marginBottom: "22px" }}>
        <h2>👥 Visiteurs détaillés ({totalVisitors})</h2>
        <p>Identifiant anonyme du navigateur, nombre de visites, pages consultées et dates. Ces données ne donnent pas l'identité personnelle du visiteur.</p>
        <input
          placeholder="Rechercher par Visitor ID…"
          value={visitorSearch}
          onChange={(e) => setVisitorSearch(e.target.value)}
          style={{ width: "100%", marginBottom: 12 }}
        />
        {visitorRows.length === 0 ? <p>Aucun visiteur trouvé.</p> : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead><tr>{["Visitor ID", "Visites", "Pages consultées", "Première visite", "Dernière visite", "Détail"].map((h) => <th key={h} style={{ textAlign: "left", padding: 8 }}>{h}</th>)}</tr></thead>
              <tbody>{visitorRows.map((v: any) => <tr key={v.id}>
                <td style={{ padding: 8, borderTop: "1px solid #ddd", wordBreak: "break-all", fontSize: 12 }}>{v.id}</td>
                <td style={{ padding: 8, borderTop: "1px solid #ddd" }}>{v.count}</td>
                <td style={{ padding: 8, borderTop: "1px solid #ddd" }}>{Array.from(v.pages).join(", ")}</td>
                <td style={{ padding: 8, borderTop: "1px solid #ddd" }}>{new Date(v.first).toLocaleString("fr-FR")}</td>
                <td style={{ padding: 8, borderTop: "1px solid #ddd" }}>{new Date(v.last).toLocaleString("fr-FR")}</td>
                <td style={{ padding: 8, borderTop: "1px solid #ddd" }}><button className="alt" onClick={() => setSelectedVisitorId(selectedVisitorId === v.id ? null : v.id)}>{selectedVisitorId === v.id ? "Masquer" : "Voir détail"}</button></td>
              </tr>)}</tbody>
            </table>
          </div>
        )}
        {selectedVisitorId && <div style={{ marginTop: 14, padding: 12, background: "#f8fafc", borderRadius: 10 }}>
          <h3>Historique du visiteur : {selectedVisitorId}</h3>
          <div style={{ overflowX: "auto" }}><table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead><tr>{["Page", "Date", "Heure"].map((h) => <th key={h} style={{ textAlign: "left", padding: 8 }}>{h}</th>)}</tr></thead>
            <tbody>{selectedVisitorHistory.map((v: any, i: number) => <tr key={`${v.visited_at}-${i}`}>
              <td style={{ padding: 8, borderTop: "1px solid #ddd" }}>{v.page_path || "/"}</td>
              <td style={{ padding: 8, borderTop: "1px solid #ddd" }}>{new Date(v.visited_at).toLocaleDateString("fr-FR")}</td>
              <td style={{ padding: 8, borderTop: "1px solid #ddd" }}>{new Date(v.visited_at).toLocaleTimeString("fr-FR")}</td>
            </tr>)}</tbody>
          </table></div>
        </div>}
      </div>

      <div className="card" style={{ marginBottom: "22px" }}>
        <h2>📥 Historique détaillé des téléchargements ({totalDownloads})</h2>
        {D.downloads.length === 0 ? <p>Aucun téléchargement enregistré.</p> : <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead><tr>{["Document téléchargé", "Resource ID", "Date / heure"].map((h) => <th key={h} style={{ textAlign: "left", padding: 8 }}>{h}</th>)}</tr></thead>
            <tbody>{D.downloads.slice(0, 300).map((d: any, i: number) => <tr key={`${d.downloaded_at}-${i}`}>
              <td style={{ padding: 8, borderTop: "1px solid #ddd" }}>{d.resource_title || "Document"}</td>
              <td style={{ padding: 8, borderTop: "1px solid #ddd" }}>{d.resource_id ?? "—"}</td>
              <td style={{ padding: 8, borderTop: "1px solid #ddd" }}>{new Date(d.downloaded_at).toLocaleString("fr-FR")}</td>
            </tr>)}</tbody>
          </table>
        </div>}
      </div>

      {/* 1. Ressources */}
      <h2>1. Ajouter une ressource (PDF ou image)</h2>

      <div className="form">
        {sel(
          f.level_id,
          (v: any) =>
            setF({ ...f, level_id: v, chapter_id: "" }),
          D.levels,
          "Niveau"
        )}

        {sel(
          f.subject_id,
          (v: any) =>
            setF({ ...f, subject_id: v, chapter_id: "" }),
          D.subjects,
          "Matière"
        )}

        {sel(
          f.chapter_id,
          (v: any) => setF({ ...f, chapter_id: v }),
          chs,
          "Chapitre (facultatif)"
        )}

        <select
          value={f.type}
          onChange={(e) =>
            setF({ ...f, type: e.target.value })
          }
        >
          {TYPES.map((t: string) => (
            <option key={t}>{t}</option>
          ))}
        </select>

        <input
          placeholder="Titre"
          value={f.title || ""}
          onChange={(e) =>
            setF({ ...f, title: e.target.value })
          }
        />

        <input
          placeholder="Description"
          value={f.description || ""}
          onChange={(e) =>
            setF({ ...f, description: e.target.value })
          }
        />

        <label>
          <input
            type="checkbox"
            checked={!!f.is_premium}
            onChange={(e) =>
              setF({
                ...f,
                is_premium: e.target.checked,
              })
            }
          />
          Premium
        </label>

        <input
          type="file"
          accept=".pdf,image/*"
          onChange={(e) =>
            setF({
              ...f,
              file: e.target.files?.[0],
            })
          }
        />

        <button onClick={addRes}>
          Publier
        </button>
      </div>

      {/* 2. Ressources publiées */}
      <h2>
        2. Ressources publiées ({D.resources.length})
      </h2>

      {D.resources
        .slice()
        .reverse()
        .map((r: any) => (
          <div className="row" key={r.id}>
            <span>
              <b>{r.title}</b> – {nm(D.levels, r.level_id)} /
              {nm(D.subjects, r.subject_id)} / {r.type}
              {r.is_premium ? " 🔒" : ""}
            </span>

            <span>
              <button className="alt" onClick={() => editResource(r)}>
                Modifier contenu
              </button>{" "}

              <button
                className="alt"
                onClick={() =>
                  run(
                    supabase
                      .from("resources")
                      .update({
                        is_premium: !r.is_premium,
                      })
                      .eq("id", r.id)
                  )
                }
              >
                {r.is_premium
                  ? "Rendre gratuit"
                  : "Rendre premium"}
              </button>{" "}

              <button
                className="del"
                onClick={() =>
                  ask(
                    r.title,
                    supabase
                      .from("resources")
                      .delete()
                      .eq("id", r.id)
                  )
                }
              >
                Supprimer
              </button>
            </span>
          </div>
        ))}

      {/* 3. Chapitres */}
      <h2>3. Chapitres</h2>

      <div className="form">
        {sel(
          f.level_id,
          (v: any) => setF({ ...f, level_id: v }),
          D.levels,
          "Niveau"
        )}

        {sel(
          f.subject_id,
          (v: any) => setF({ ...f, subject_id: v }),
          D.subjects,
          "Matière"
        )}

        <input
          placeholder="Titre du chapitre"
          value={nc}
          onChange={(e) => setNc(e.target.value)}
        />

        <button
          onClick={() => {
            if (nc && f.level_id && f.subject_id) {
              run(
                supabase.from("chapters").insert({
                  level_id: +f.level_id,
                  subject_id: +f.subject_id,
                  title: nc,
                }),
                "Chapitre ajouté ✅"
              );

              setNc("");
            } else {
              setMsg(
                "Choisissez niveau, matière et titre."
              );
            }
          }}
        >
          Ajouter
        </button>
      </div>

      {chs.map((c: any) => (
        <div className="row" key={c.id}>
          <span>{c.title}</span>

          <button
            className="del"
            onClick={() =>
              ask(
                c.title,
                supabase
                  .from("chapters")
                  .delete()
                  .eq("id", c.id)
              )
            }
          >
            Supprimer
          </button>
        </div>
      ))}

      {/* 4. Matières */}
      <h2>4. Matières</h2>

      <div className="form">
        <input
          placeholder="Nom de la matière"
          value={ns.name}
          onChange={(e) =>
            setNs({ ...ns, name: e.target.value })
          }
        />

        <input
          style={{ width: 70 }}
          value={ns.icon}
          onChange={(e) =>
            setNs({ ...ns, icon: e.target.value })
          }
        />

        {D.levels.map((l: any) => (
          <label key={l.id}>
            <input
              type="checkbox"
              checked={ns.lv.includes(l.id)}
              onChange={(e) =>
                setNs({
                  ...ns,
                  lv: e.target.checked
                    ? [...ns.lv, l.id]
                    : ns.lv.filter(
                        (x: number) => x !== l.id
                      ),
                })
              }
            />
            {l.name}
          </label>
        ))}

        <button
          onClick={async () => {
            if (!ns.name.trim()) {
              setMsg("Écrivez le nom de la matière.");
              return;
            }

            const { data, error } = await supabase
              .from("subjects")
              .insert({
                name: ns.name,
                icon: ns.icon,
              })
              .select()
              .single();

            if (error) {
              setMsg("Erreur : " + error.message);
              return;
            }

            if (ns.lv.length > 0) {
              const { error: linkError } =
                await supabase
                  .from("level_subjects")
                  .insert(
                    ns.lv.map((l: number) => ({
                      level_id: l,
                      subject_id: data.id,
                    }))
                  );

              if (linkError) {
                setMsg(
                  "Matière ajoutée, mais liaison impossible : " +
                    linkError.message
                );
                await load();
                return;
              }
            }

            setNs({
              name: "",
              icon: "📘",
              lv: [],
            });

            setMsg("Matière ajoutée ✅");
            await load();
          }}
        >
          Ajouter la matière
        </button>
      </div>

      {D.subjects.map((s: any) => (
        <div className="row" key={s.id}>
          <span>
            {s.icon} {s.name}
          </span>

          <button
            className="del"
            onClick={() =>
              ask(
                s.name,
                supabase
                  .from("subjects")
                  .delete()
                  .eq("id", s.id)
              )
            }
          >
            Supprimer
          </button>
        </div>
      ))}

      {/* 5. Niveaux */}
      <h2>5. Niveaux</h2>

      <div className="form">
        <input
          placeholder="Nom du niveau"
          value={nl.name}
          onChange={(e) =>
            setNl({ ...nl, name: e.target.value })
          }
        />

        <select
          value={nl.cycle}
          onChange={(e) =>
            setNl({ ...nl, cycle: e.target.value })
          }
        >
          <option>Primaire</option>
          <option>Collège</option>
          <option>Lycée</option>
        </select>

        <button
          onClick={() => {
            if (!nl.name.trim()) {
              setMsg("Écrivez le nom du niveau.");
              return;
            }

            run(
              supabase.from("levels").insert({
                name: nl.name,
                slug: slug(nl.name),
                cycle: nl.cycle,
                position: 100,
              }),
              "Niveau ajouté ✅"
            );
          }}
        >
          Ajouter
        </button>
      </div>

      {D.levels.map((l: any) => (
        <div className="row" key={l.id}>
          <span>
            {l.cycle} – {l.name}
          </span>

          <button
            className="del"
            onClick={() =>
              ask(
                l.name,
                supabase
                  .from("levels")
                  .delete()
                  .eq("id", l.id)
              )
            }
          >
            Supprimer
          </button>
        </div>
      ))}

      {/* 6. Publicités */}
      <h2>6. Gestion des publicités</h2>

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
    </main>
  );
}

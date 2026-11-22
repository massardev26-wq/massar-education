"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { CSSProperties, FormEvent } from "react";
import { supabase, TYPES } from "@/lib/supabase";

const slugify = (value: string) =>
  value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

const navItems = [
  ["dashboard", "⌂", "Tableau de bord"],
  ["levels", "♧", "Niveaux"],
  ["subjects", "▱", "Matières"],
  ["chapters", "▣", "Chapitres"],
  ["resources", "▤", "Ressources"],
  ["ads", "◉", "Publicités"],
];

const css: Record<string, CSSProperties> = {
  page: { minHeight: "100vh", background: "#f4f7fc", color: "#101d4b", fontFamily: "Arial,sans-serif" },
  panel: { background: "#fff", border: "1px solid #dce5f3", borderRadius: 14, padding: 18, boxShadow: "0 2px 8px #0f1e4909" },
  btn: { border: "1px solid #cbd8ec", borderRadius: 9, padding: "9px 12px", background: "#fff", color: "#102354", fontWeight: 700, cursor: "pointer" },
  primary: { border: 0, borderRadius: 9, padding: "10px 14px", background: "#0877f9", color: "#fff", fontWeight: 700, cursor: "pointer" },
  input: { border: "1px solid #cbd8ec", borderRadius: 9, padding: "10px 11px", background: "#fff", color: "#102354", width: "100%", maxWidth: "100%" },
};

export default function Admin() {
  const [status, setStatus] = useState<"load" | "login" | "ready" | "denied">("load");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [section, setSection] = useState("dashboard");
  const [userEmail, setUserEmail] = useState("");
  const [busy, setBusy] = useState(false);

  const [data, setData] = useState<any>({
    levels: [], subjects: [], level_subjects: [], chapters: [], resources: [], ads: [],
  });

  const [levelForm, setLevelForm] = useState({ name: "", cycle: "Primaire" });
  const [subjectForm, setSubjectForm] = useState({ name: "", icon: "📘" });
  const [chapterForm, setChapterForm] = useState({ title: "", level_id: "", subject_id: "" });
  const [resourceForm, setResourceForm] = useState({
    title: "", type: TYPES?.[0] || "Cours", level_id: "", subject_id: "", chapter_id: "",
    description: "", content: "", is_premium: false,
  });
  const [resourceFile, setResourceFile] = useState<File | null>(null);
  const [adEdits, setAdEdits] = useState<Record<string, any>>({});

  const load = useCallback(async () => {
    const [levels, subjects, levelSubjects, chapters, resources, ads] = await Promise.all([
      supabase.from("levels").select("*").order("position", { ascending: true }),
      supabase.from("subjects").select("*").order("name"),
      supabase.from("level_subjects").select("*"),
      supabase.from("chapters").select("*").order("position", { ascending: true }),
      supabase.from("resources").select("*").order("created_at", { ascending: false }),
      supabase.from("ads").select("*").order("slot"),
    ]);
    const failed = [levels, subjects, levelSubjects, chapters, resources, ads].find((result) => result.error);
    if (failed?.error) {
      setMessage(`Erreur de chargement Supabase : ${failed.error.message}`);
      return;
    }
    setData({
      levels: levels.data || [], subjects: subjects.data || [],
      level_subjects: levelSubjects.data || [], chapters: chapters.data || [],
      resources: resources.data || [], ads: ads.data || [],
    });
    const edits: Record<string, any> = {};
    (ads.data || []).forEach((ad: any) => { edits[ad.slot] = { enabled: ad.enabled, code: ad.code || "" }; });
    setAdEdits(edits);
  }, []);

  const verifySession = useCallback(async () => {
    const { data: sessionData } = await supabase.auth.getSession();
    const user = sessionData.session?.user;
    if (!user) {
      setStatus("login");
      return;
    }
    setUserEmail(user.email || "");
    const { data: adminRow, error } = await supabase
      .from("admins").select("user_id").eq("user_id", user.id).maybeSingle();
    if (error || !adminRow) {
      setStatus("denied");
      return;
    }
    setStatus("ready");
    await load();
  }, [load]);

  useEffect(() => {
    verifySession();
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        setStatus("login");
        setUserEmail("");
      }
    });
    return () => listener.subscription.unsubscribe();
  }, [verifySession]);

  const counts = useMemo(() => ({
    levels: data.levels.length, subjects: data.subjects.length,
    chapters: data.chapters.length, resources: data.resources.length,
  }), [data]);

  async function signIn(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setMessage(`Connexion impossible : ${error.message}`);
      setStatus("login");
      setBusy(false);
      return;
    }
    await verifySession();
    setBusy(false);
  }

  async function signOut() {
    await supabase.auth.signOut();
    setStatus("login");
    setData({ levels: [], subjects: [], level_subjects: [], chapters: [], resources: [], ads: [] });
  }

  async function addLevel(event: FormEvent) {
    event.preventDefault();
    if (!levelForm.name.trim()) return;
    setBusy(true);
    const { error } = await supabase.from("levels").insert({
      name: levelForm.name.trim(), slug: slugify(levelForm.name),
      cycle: levelForm.cycle, position: data.levels.length + 1,
    });
    setMessage(error ? error.message : "Niveau ajouté.");
    if (!error) { setLevelForm({ name: "", cycle: "Primaire" }); await load(); }
    setBusy(false);
  }

  async function addSubject(event: FormEvent) {
    event.preventDefault();
    if (!subjectForm.name.trim()) return;
    setBusy(true);
    const { data: created, error } = await supabase.from("subjects")
      .insert({ name: subjectForm.name.trim(), icon: subjectForm.icon || "📘" }).select().single();
    if (!error && created) {
      const links = data.levels.map((level: any) => ({ level_id: level.id, subject_id: created.id }));
      if (links.length) await supabase.from("level_subjects").insert(links);
      setSubjectForm({ name: "", icon: "📘" });
      setMessage("Matière ajoutée et associée aux niveaux.");
      await load();
    } else setMessage(error?.message || "Impossible d’ajouter la matière.");
    setBusy(false);
  }

  async function addChapter(event: FormEvent) {
    event.preventDefault();
    if (!chapterForm.title.trim() || !chapterForm.level_id || !chapterForm.subject_id) {
      setMessage("Choisissez un niveau, une matière et un titre de chapitre.");
      return;
    }
    setBusy(true);
    const { error } = await supabase.from("chapters").insert({
      title: chapterForm.title.trim(), level_id: Number(chapterForm.level_id),
      subject_id: Number(chapterForm.subject_id), position: data.chapters.length + 1,
    });
    setMessage(error ? error.message : "Chapitre ajouté.");
    if (!error) { setChapterForm({ title: "", level_id: "", subject_id: "" }); await load(); }
    setBusy(false);
  }

  async function addResource(event: FormEvent) {
    event.preventDefault();
    if (!resourceForm.title.trim() || !resourceForm.level_id || !resourceForm.subject_id) {
      setMessage("Le titre, le niveau et la matière sont obligatoires.");
      return;
    }
    setBusy(true);
    let fileUrl: string | null = null;
    if (resourceFile) {
      const safeName = resourceFile.name.replace(/[^a-zA-Z0-9._-]/g, "-");
      const path = `${Date.now()}-${safeName}`;
      const { error: uploadError } = await supabase.storage.from("files").upload(path, resourceFile, { upsert: false });
      if (uploadError) {
        setMessage(`Échec du téléversement : ${uploadError.message}`);
        setBusy(false);
        return;
      }
      const { data: publicData } = supabase.storage.from("files").getPublicUrl(path);
      fileUrl = publicData.publicUrl;
    }
    const { error } = await supabase.from("resources").insert({
      title: resourceForm.title.trim(), type: resourceForm.type,
      level_id: Number(resourceForm.level_id), subject_id: Number(resourceForm.subject_id),
      chapter_id: resourceForm.chapter_id ? Number(resourceForm.chapter_id) : null,
      description: resourceForm.description || null, content: resourceForm.content || null,
      file_url: fileUrl, is_premium: resourceForm.is_premium,
    });
    setMessage(error ? `Erreur : ${error.message}` : "Ressource publiée.");
    if (!error) {
      setResourceForm({ title: "", type: TYPES?.[0] || "Cours", level_id: "", subject_id: "", chapter_id: "", description: "", content: "", is_premium: false });
      setResourceFile(null);
      await load();
    }
    setBusy(false);
  }

  async function deleteRow(table: string, id: any, label: string) {
    if (!window.confirm(`Supprimer ${label} ? Cette action est définitive.`)) return;
    setBusy(true);
    const { error } = await supabase.from(table).delete().eq("id", id);
    setMessage(error ? error.message : `${label} supprimé.`);
    if (!error) await load();
    setBusy(false);
  }

  async function saveAd(slot: string) {
    const value = adEdits[slot] || { enabled: false, code: "" };
    setBusy(true);
    const { error } = await supabase.from("ads").upsert({ slot, enabled: value.enabled, code: value.code }, { onConflict: "slot" });
    setMessage(error ? error.message : "Emplacement publicitaire enregistré.");
    if (!error) await load();
    setBusy(false);
  }

  const filteredChapters = data.chapters.filter((chapter: any) =>
    !resourceForm.subject_id || String(chapter.subject_id) === String(resourceForm.subject_id)
  );

  if (status === "load") {
    return <main style={{ ...css.page, display: "grid", placeItems: "center" }}><p>Vérification de la session administrateur…</p></main>;
  }

  if (status === "login" || status === "denied") {
    return (
      <main style={{ ...css.page, minHeight: "100vh", display: "grid", placeItems: "center", padding: 20 }}>
        <form onSubmit={signIn} style={{ ...css.panel, width: "min(440px,100%)", padding: 28 }}>
          <h1 style={{ marginTop: 0 }}>Administration Massar</h1>
          <p style={{ color: "#64748b" }}>Connectez-vous avec le compte administrateur autorisé.</p>
          {status === "denied" ? <p style={{ color: "#b42318" }}>Ce compte n’est pas autorisé dans la table admins. Déconnectez-vous puis utilisez le compte administrateur.</p> : null}
          <label style={{ display: "block", fontWeight: 700, margin: "14px 0 6px" }}>Adresse e-mail</label>
          <input type="email" required autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} style={css.input} />
          <label style={{ display: "block", fontWeight: 700, margin: "14px 0 6px" }}>Mot de passe</label>
          <input type="password" required autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} style={css.input} />
          {message ? <p role="alert" style={{ color: "#b42318" }}>{message}</p> : null}
          <button disabled={busy} type="submit" style={{ ...css.primary, width: "100%", marginTop: 18 }}>{busy ? "Connexion…" : "Se connecter"}</button>
          {status === "denied" ? <button type="button" onClick={signOut} style={{ ...css.btn, width: "100%", marginTop: 10 }}>Changer de compte</button> : null}
          <p style={{ color: "#64748b", fontSize: 12, marginTop: 18 }}>L’accès est contrôlé par la table admins de Supabase.</p>
        </form>
      </main>
    );
  }

  return (
    <main style={css.page}>
      <div style={{ display: "grid", gridTemplateColumns: "230px minmax(0,1fr)", minHeight: "100vh" }}>
        <aside style={{ background: "linear-gradient(180deg,#062b68,#032052)", color: "#fff", padding: 16 }}>
          <a href="/" style={{ color: "#fff", fontSize: 20, fontWeight: 900 }}>MASSAR ADMIN</a>
          <p style={{ color: "#c8d8f2", fontSize: 12, overflowWrap: "anywhere" }}>{userEmail}</p>
          <nav style={{ display: "grid", gap: 7, marginTop: 25 }}>
            {navItems.map(([key, icon, label]) => (
              <button key={key} type="button" onClick={() => setSection(key)}
                style={{ ...css.btn, textAlign: "left", border: 0, background: section === key ? "#fff" : "transparent", color: section === key ? "#073b8d" : "#fff" }}>
                {icon}　{label}
              </button>
            ))}
          </nav>
          <button type="button" onClick={signOut} style={{ ...css.btn, width: "100%", marginTop: 28 }}>Déconnexion</button>
        </aside>

        <section style={{ padding: "clamp(16px,3vw,34px)", minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
            <div><small style={{ color: "#64748b", fontWeight: 800 }}>ESPACE DE GESTION</small><h1 style={{ margin: "4px 0 18px" }}>{navItems.find((item) => item[0] === section)?.[2]}</h1></div>
            <button type="button" onClick={load} style={css.btn}>↻ Actualiser</button>
          </div>
          {message ? <div role="status" style={{ ...css.panel, marginBottom: 16, color: message.toLowerCase().includes("erreur") || message.includes("Échec") ? "#b42318" : "#166534" }}>{message}</div> : null}

          {section === "dashboard" ? (
            <div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 14 }}>
                {[
                  ["Niveaux", counts.levels, "🎓"], ["Matières", counts.subjects, "📚"],
                  ["Chapitres", counts.chapters, "📖"], ["Ressources", counts.resources, "📄"],
                ].map(([label, count, icon]) => <div key={String(label)} style={css.panel}><div style={{ fontSize: 26 }}>{icon}</div><strong style={{ fontSize: 28 }}>{count}</strong><div style={{ color: "#64748b" }}>{label}</div></div>)}
              </div>
              <div style={{ ...css.panel, marginTop: 16 }}>
                <h2>Bienvenue dans l’administration</h2>
                <p>Gérez les niveaux, matières, chapitres, cours, exercices et emplacements publicitaires de votre plateforme.</p>
              </div>
            </div>
          ) : null}

          {section === "levels" ? (
            <div style={{ display: "grid", gap: 16 }}>
              <form onSubmit={addLevel} style={css.panel}>
                <h2>Ajouter un niveau</h2>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 10 }}>
                  <input required placeholder="Nom du niveau (ex. 1AC)" value={levelForm.name} onChange={(e) => setLevelForm({ ...levelForm, name: e.target.value })} style={css.input} />
                  <select value={levelForm.cycle} onChange={(e) => setLevelForm({ ...levelForm, cycle: e.target.value })} style={css.input}><option>Primaire</option><option>Collège</option><option>Lycée</option></select>
                  <button disabled={busy} style={css.primary}>Ajouter</button>
                </div>
              </form>
              <div style={css.panel}><h2>Niveaux existants</h2>{data.levels.map((item: any) => <div key={item.id} style={{ display: "flex", justifyContent: "space-between", padding: 10, borderBottom: "1px solid #e6edf6" }}><span><strong>{item.name}</strong> · {item.cycle} <small>({item.slug})</small></span><button type="button" onClick={() => deleteRow("levels", item.id, item.name)} style={{ ...css.btn, color: "#b42318" }}>Supprimer</button></div>)}</div>
            </div>
          ) : null}

          {section === "subjects" ? (
            <div style={{ display: "grid", gap: 16 }}>
              <form onSubmit={addSubject} style={css.panel}>
                <h2>Ajouter une matière</h2>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 100px auto", gap: 10 }}>
                  <input required placeholder="Nom de la matière" value={subjectForm.name} onChange={(e) => setSubjectForm({ ...subjectForm, name: e.target.value })} style={css.input} />
                  <input placeholder="📘" value={subjectForm.icon} onChange={(e) => setSubjectForm({ ...subjectForm, icon: e.target.value })} style={css.input} />
                  <button disabled={busy} style={css.primary}>Ajouter</button>
                </div>
                <small style={{ color: "#64748b" }}>La matière sera associée automatiquement à tous les niveaux existants.</small>
              </form>
              <div style={css.panel}><h2>Matières existantes</h2>{data.subjects.map((item: any) => <div key={item.id} style={{ display: "flex", justifyContent: "space-between", padding: 10, borderBottom: "1px solid #e6edf6" }}><span>{item.icon} <strong>{item.name}</strong></span><button type="button" onClick={() => deleteRow("subjects", item.id, item.name)} style={{ ...css.btn, color: "#b42318" }}>Supprimer</button></div>)}</div>
            </div>
          ) : null}

          {section === "chapters" ? (
            <div style={{ display: "grid", gap: 16 }}>
              <form onSubmit={addChapter} style={css.panel}>
                <h2>Ajouter un chapitre</h2>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(170px,1fr))", gap: 10 }}>
                  <input required placeholder="Titre du chapitre" value={chapterForm.title} onChange={(e) => setChapterForm({ ...chapterForm, title: e.target.value })} style={css.input} />
                  <select required value={chapterForm.level_id} onChange={(e) => setChapterForm({ ...chapterForm, level_id: e.target.value })} style={css.input}><option value="">Choisir un niveau</option>{data.levels.map((l: any) => <option key={l.id} value={l.id}>{l.name}</option>)}</select>
                  <select required value={chapterForm.subject_id} onChange={(e) => setChapterForm({ ...chapterForm, subject_id: e.target.value })} style={css.input}><option value="">Choisir une matière</option>{data.subjects.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}</select>
                  <button disabled={busy} style={css.primary}>Ajouter</button>
                </div>
              </form>
              <div style={css.panel}><h2>Chapitres</h2>{data.chapters.map((item: any) => <div key={item.id} style={{ display: "flex", justifyContent: "space-between", gap: 10, padding: 10, borderBottom: "1px solid #e6edf6" }}><span><strong>{item.title}</strong><small style={{ display: "block", color: "#64748b" }}>{data.levels.find((l: any) => l.id === item.level_id)?.name || "Niveau"} · {data.subjects.find((s: any) => s.id === item.subject_id)?.name || "Matière"}</small></span><button type="button" onClick={() => deleteRow("chapters", item.id, item.title)} style={{ ...css.btn, color: "#b42318" }}>Supprimer</button></div>)}</div>
            </div>
          ) : null}

          {section === "resources" ? (
            <div style={{ display: "grid", gap: 16 }}>
              <form onSubmit={addResource} style={{ ...css.panel, display: "grid", gap: 11 }}>
                <h2>Publier une ressource</h2>
                <input required placeholder="Titre de la ressource" value={resourceForm.title} onChange={(e) => setResourceForm({ ...resourceForm, title: e.target.value })} style={css.input} />
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(170px,1fr))", gap: 10 }}>
                  <select value={resourceForm.type} onChange={(e) => setResourceForm({ ...resourceForm, type: e.target.value })} style={css.input}>{TYPES.map((type) => <option key={type}>{type}</option>)}</select>
                  <select required value={resourceForm.level_id} onChange={(e) => setResourceForm({ ...resourceForm, level_id: e.target.value, chapter_id: "" })} style={css.input}><option value="">Choisir un niveau</option>{data.levels.map((l: any) => <option key={l.id} value={l.id}>{l.name}</option>)}</select>
                  <select required value={resourceForm.subject_id} onChange={(e) => setResourceForm({ ...resourceForm, subject_id: e.target.value, chapter_id: "" })} style={css.input}><option value="">Choisir une matière</option>{data.subjects.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}</select>
                  <select value={resourceForm.chapter_id} onChange={(e) => setResourceForm({ ...resourceForm, chapter_id: e.target.value })} style={css.input}><option value="">Sans chapitre</option>{filteredChapters.filter((c: any) => !resourceForm.level_id || String(c.level_id) === resourceForm.level_id).map((c: any) => <option key={c.id} value={c.id}>{c.title}</option>)}</select>
                </div>
                <textarea placeholder="Description (facultative)" value={resourceForm.description} onChange={(e) => setResourceForm({ ...resourceForm, description: e.target.value })} rows={2} style={css.input} />
                <textarea placeholder="Contenu du cours / exercice / correction (texte)" value={resourceForm.content} onChange={(e) => setResourceForm({ ...resourceForm, content: e.target.value })} rows={7} style={css.input} />
                <label style={{ fontWeight: 700 }}>Joindre un fichier (PDF ou image)</label>
                <input type="file" accept=".pdf,.png,.jpg,.jpeg" onChange={(e) => setResourceFile(e.target.files?.[0] || null)} />
                <label style={{ display: "flex", gap: 8, alignItems: "center" }}><input type="checkbox" checked={resourceForm.is_premium} onChange={(e) => setResourceForm({ ...resourceForm, is_premium: e.target.checked })} /> Ressource Premium</label>
                <button disabled={busy} style={css.primary}>{busy ? "Publication…" : "Publier la ressource"}</button>
              </form>
              <div style={css.panel}><h2>Ressources publiées ({data.resources.length})</h2>{data.resources.map((item: any) => <div key={item.id} style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", padding: 10, borderBottom: "1px solid #e6edf6" }}><span><strong>{item.title}</strong><small style={{ display: "block", color: "#64748b" }}>{item.type} · {data.levels.find((l: any) => l.id === item.level_id)?.name || "Niveau"}</small></span><button type="button" onClick={() => deleteRow("resources", item.id, item.title)} style={{ ...css.btn, color: "#b42318", flexShrink: 0 }}>Supprimer</button></div>)}</div>
            </div>
          ) : null}

          {section === "ads" ? (
            <div style={{ display: "grid", gap: 14 }}>
              {data.ads.map((ad: any) => {
                const value = adEdits[ad.slot] || { enabled: ad.enabled, code: ad.code || "" };
                return <div key={ad.slot} style={css.panel}>
                  <h2>{ad.label || ad.slot}</h2>
                  <label style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}><input type="checkbox" checked={!!value.enabled} onChange={(e) => setAdEdits({ ...adEdits, [ad.slot]: { ...value, enabled: e.target.checked } })} /> Activer cet emplacement</label>
                  <textarea rows={4} placeholder="Code publicitaire" value={value.code} onChange={(e) => setAdEdits({ ...adEdits, [ad.slot]: { ...value, code: e.target.value } })} style={css.input} />
                  <button type="button" onClick={() => saveAd(ad.slot)} disabled={busy} style={{ ...css.primary, marginTop: 10 }}>Enregistrer</button>
                </div>;
              })}
              {!data.ads.length ? <div style={css.panel}>Aucun emplacement publicitaire n’a été trouvé dans la table ads.</div> : null}
            </div>
          ) : null}
        </section>
      </div>
      <style jsx>{`@media(max-width:760px){main>div{grid-template-columns:1fr!important}aside{min-height:auto}aside nav{grid-template-columns:repeat(2,minmax(0,1fr))!important}}`}</style>
    </main>
  );
}

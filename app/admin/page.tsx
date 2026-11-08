"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase, TYPES } from "@/lib/supabase";

const slug = (s: string) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const nm = (arr: any[], id: any) => arr.find((x) => String(x.id) === String(id))?.name || "—";
const fmt = (n: number) => new Intl.NumberFormat("fr-FR").format(n || 0);
const dt = (v: string) => v ? new Date(v).toLocaleDateString("fr-FR") : "—";
const dtime = (v: string) => v ? new Date(v).toLocaleString("fr-FR") : "—";

const css: any = {
  page: { minHeight: "100vh", background: "#f4f7fc", color: "#101d4b", fontFamily: "Arial, sans-serif" },
  sidebar: { background: "linear-gradient(180deg,#062b68,#032052)", color: "white", padding: "18px 12px", minHeight: "100vh" },
  panel: { background: "#fff", border: "1px solid #dce5f3", borderRadius: 14, boxShadow: "0 2px 8px #0f1e4909", padding: 15 },
  btn: { border: "1px solid #cbd8ec", borderRadius: 9, padding: "9px 12px", background: "#fff", color: "#102354", fontWeight: 700, cursor: "pointer" },
  primary: { border: 0, borderRadius: 9, padding: "10px 13px", background: "#0877f9", color: "#fff", fontWeight: 700, cursor: "pointer" },
  input: { border: "1px solid #cbd8ec", borderRadius: 9, padding: "9px 11px", background: "#fff", color: "#102354", maxWidth: "100%" },
  th: { background: "#eaf0fb", padding: 10, textAlign: "left", whiteSpace: "nowrap", borderBottom: "1px solid #d5e0ef" },
  td: { padding: 10, borderBottom: "1px solid #e6edf6", verticalAlign: "middle" },
};

const navItems = [
  ["dashboard", "⌂", "Tableau de bord"],
  ["levels", "♧", "Niveaux"],
  ["subjects", "▱", "Matières"],
  ["resources", "▤", "Ressources"],
  ["chapters", "▣", "Chapitres"],
  ["ads", "◉", "Publicités"],
  ["stats", "▥", "Statistiques"],
  ["visitors", "👥", "Visiteurs détaillés"],
  ["users", "♙", "Utilisateurs"],
  ["settings", "⚙", "Paramètres"],
];

export default function Admin() {
  const [status, setStatus] = useState("load");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [section, setSection] = useState("dashboard");
  const [cycleOpen, setCycleOpen] = useState("Primaire");
  const [levelSelected, setLevelSelected] = useState<any>(null);
  const [subjectSelected, setSubjectSelected] = useState<any>(null);
  const [resourceType, setResourceType] = useState("Toutes");
  const [resourceSearch, setResourceSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [visitorSearch, setVisitorSearch] = useState("");
  const [selectedVisitorId, setSelectedVisitorId] = useState<string | null>(null);

  const [data, setData] = useState<any>({
    levels: [],
    subjects: [],
    level_subjects: [],
    chapters: [],
    resources: [],
    ads: [],
    visits: [],
    downloads: [],
  });

  const [form, setForm] = useState<any>({ type: TYPES?.[0] || "Exercice" });
  const [editingResource, setEditingResource] = useState<any>(null);
  const [editForm, setEditForm] = useState<any>({
    title: "",
    type: TYPES?.[0] || "Exercice",
    level_id: "",
  });

  const [newLevel, setNewLevel] = useState({ name: "", cycle: "Primaire" });
  const [newSubject, setNewSubject] = useState({ name: "", icon: "📘", levels: [] as any[] });
  const [newChapter, setNewChapter] = useState("");
  const [dateRangeLabel, setDateRangeLabel] = useState("Période personnalisée");

  async function load() {
    const [levels, subjects, level_subjects, chapters, resources, ads, visits, downloads] = await Promise.all([
      supabase.from("levels").select("*").order("position"),
      supabase.from("subjects").select("*").order("name"),
      supabase.from("level_subjects").select("level_id,subject_id"),
      supabase.from("chapters").select("*").order("title"),
      supabase.from("resources").select("*").order("created_at", { ascending: false }),
      supabase.from("ads").select("*").order("slot"),
      supabase.from("site_visits").select("visitor_id,page_path,visited_at").order("visited_at", { ascending: false }),
      supabase.from("resource_downloads").select("resource_id,resource_title,level_id,subject_id,downloaded_at").order("downloaded_at", { ascending: false }),
    ]);

    const errs = [levels, subjects, level_subjects, chapters, resources, ads, visits, downloads].filter(x => x.error);
    if (errs.length) setMessage("Erreur Supabase: " + errs.map(x => x.error?.message).join(" / "));

    setData({
      levels: levels.data || [],
      subjects: subjects.data || [],
      level_subjects: level_subjects.data || [],
      chapters: chapters.data || [],
      resources: resources.data || [],
      ads: ads.data || [],
      visits: visits.data || [],
      downloads: downloads.data || [],
    });

    if (!levelSelected && levels.data?.length) setLevelSelected(levels.data[0].id);
    if (!subjectSelected && subjects.data?.length) setSubjectSelected(subjects.data[0].id);
  }

  async function verify() {
    setStatus("load");
    setMessage("");

    const { data: { user }, error: userErr } = await supabase.auth.getUser();
    if (userErr) setMessage(userErr.message);
    if (!user) {
      setStatus("out");
      return;
    }

    const { data: admin, error } = await supabase.from("admins").select("user_id").eq("user_id", user.id).maybeSingle();
    if (error) {
      setMessage(error.message);
      setStatus("no");
      return;
    }

    if (!admin) {
      setMessage("Ce compte n’est pas administrateur.");
      setStatus("no");
      return;
    }

    setStatus("ok");
    await load();
  }

  useEffect(() => {
    verify();
  }, []);

  async function run(query: any, success = "Enregistré ✅") {
    const { error } = await query;
    setMessage(error ? "Erreur : " + error.message : success);
    if (error) console.error(error);
    await load();
  }

  async function login() {
    if (!email || !password) {
      setMessage("Saisissez email et mot de passe.");
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) {
      setMessage("Connexion impossible : " + error.message);
      return;
    }

    await verify();
  }

  async function addResource() {
    if (!form.level_id || !form.subject_id || !form.title?.trim()) {
      setMessage("Sélectionnez niveau, matière et saisissez le titre.");
      return;
    }

    let file_url = null;

    if (form.file) {
      const extension = form.file.name.split(".").pop();
      const path = Date.now() + "-" + slug(form.file.name.replace(/\.[^.]+$/, "")) + "." + extension;

      const { error } = await supabase.storage.from("files").upload(path, form.file);
      if (error) {
        setMessage("Upload échoué: " + error.message);
        return;
      }

      file_url = supabase.storage.from("files").getPublicUrl(path).data.publicUrl;
    }

    await run(
      supabase.from("resources").insert({
        level_id: +form.level_id,
        subject_id: +form.subject_id,
        chapter_id: form.chapter_id ? +form.chapter_id : null,
        type: form.type,
        title: form.title.trim(),
        description: form.description || null,
        is_premium: !!form.is_premium,
        file_url,
      }),
      "Ressource publiée ✅"
    );

    setForm({ type: TYPES?.[0] || "Exercice" });
  }

  function editResource(r: any) {
    setEditingResource(r);
    setEditForm({
      title: r.title || "",
      type: r.type || (TYPES?.[0] || "Exercice"),
      level_id: String(r.level_id ?? ""),
    });
  }

  async function saveResourceEdit() {
    if (!editingResource) return;

    if (!editForm.title?.trim() || !editForm.level_id || !editForm.type?.trim()) {
      setMessage("Veuillez remplir le titre, le type et le niveau.");
      return;
    }

    const levelChanged = String(editForm.level_id) !== String(editingResource.level_id);

    const updateData: any = {
      title: editForm.title.trim(),
      type: editForm.type.trim(),
      level_id: Number(editForm.level_id),
    };

    if (levelChanged) updateData.chapter_id = null;

    const resourceId = editingResource.id;
    setEditingResource(null);

    await run(
      supabase.from("resources").update(updateData).eq("id", resourceId),
      "Ressource modifiée ✅"
    );
  }

  const askDelete = (name: string, query: any) => {
    if (confirm(`Supprimer définitivement « ${name} » ?`)) {
      run(query, "Supprimé ✅");
    }
  };

  const filterDate = (value: string) => {
    if (!value) return false;
    const date = new Date(value);

    if (startDate && date < new Date(startDate + "T00:00:00")) return false;
    if (endDate && date > new Date(endDate + "T23:59:59.999")) return false;

    return true;
  };

  const visits = useMemo(
    () => data.visits.filter((v: any) => (!startDate && !endDate) || filterDate(v.visited_at)),
    [data.visits, startDate, endDate]
  );

  const downloads = useMemo(
    () => data.downloads.filter((v: any) => (!startDate && !endDate) || filterDate(v.downloaded_at)),
    [data.downloads, startDate, endDate]
  );

  const unique = new Set(visits.map((v: any) => v.visitor_id).filter(Boolean)).size;

  const pageCounts: any = {};
  visits.forEach((v: any) => {
    pageCounts[v.page_path] = (pageCounts[v.page_path] || 0) + 1;
  });

  const topPages = Object.entries(pageCounts)
    .sort((a: any, b: any) => b[1] - a[1])
    .slice(0, 5);

  const downloadCounts: any = {};
  downloads.forEach((d: any) => {
    downloadCounts[d.resource_title || "Document"] = (downloadCounts[d.resource_title || "Document"] || 0) + 1;
  });

  const topDownloads = Object.entries(downloadCounts)
    .sort((a: any, b: any) => b[1] - a[1])
    .slice(0, 5);

  const typeCounts: any = {};
  data.resources.forEach((r: any) => {
    typeCounts[r.type || "Autres"] = (typeCounts[r.type || "Autres"] || 0) + 1;
  });

  const totalResources = data.resources.length;

  const filteredResources = data.resources.filter((r: any) =>
    (!levelSelected || String(r.level_id) === String(levelSelected)) &&
    (!subjectSelected || String(r.subject_id) === String(subjectSelected)) &&
    (resourceType === "Toutes" || r.type === resourceType) &&
    r.title?.toLowerCase().includes(resourceSearch.toLowerCase())
  );

  const totalPages = Math.max(1, Math.ceil(filteredResources.length / pageSize));
  const shownResources = filteredResources.slice((page - 1) * pageSize, page * pageSize);

  const visitorMap: any = {};
  visits.forEach((v: any) => {
    const id = v.visitor_id || "Sans identifiant";
    if (!visitorMap[id]) visitorMap[id] = { id, count: 0, pages: new Set(), first: v.visited_at, last: v.visited_at };
    visitorMap[id].count++;
    visitorMap[id].pages.add(v.page_path);

    if (new Date(v.visited_at) < new Date(visitorMap[id].first)) visitorMap[id].first = v.visited_at;
    if (new Date(v.visited_at) > new Date(visitorMap[id].last)) visitorMap[id].last = v.visited_at;
  });

  const visitorRows = Object.values(visitorMap)
    .sort((a: any, b: any) => new Date(b.last).getTime() - new Date(a.last).getTime())
    .filter((v: any) => v.id.toLowerCase().includes(visitorSearch.toLowerCase()));

  const dailyMap: any = {};
  visits.forEach((v: any) => {
    const key = new Date(v.visited_at).toLocaleDateString("fr-FR");
    dailyMap[key] = (dailyMap[key] || 0) + 1;
  });

  const daily = Object.entries(dailyMap).slice(-7);
  const levelsByCycle = (cycle: string) => data.levels.filter((l: any) => l.cycle === cycle);

  const subjectsAtLevel = data.level_subjects.length
    ? data.subjects.filter((s: any) =>
        data.level_subjects.some((ls: any) =>
          String(ls.level_id) === String(levelSelected) &&
          String(ls.subject_id) === String(s.id)
        )
      )
    : data.subjects;

  const chaptersForForm = data.chapters.filter(
    (c: any) => c.level_id == form.level_id && c.subject_id == form.subject_id
  );

  const select = (value: any, onChange: any, list: any[], placeholder: string) => (
    <select style={css.input} value={value || ""} onChange={e => onChange(e.target.value)}>
      <option value="">{placeholder}</option>
      {list.map((i: any) => <option key={i.id} value={i.id}>{i.name || i.title}</option>)}
    </select>
  );

  if (status === "load") return <main style={{ padding: 40, color: "#102354" }}>Chargement de l’administration…</main>;

  if (status !== "ok") return <main style={{ maxWidth: 460, margin: "60px auto", padding: 24, color: "#102354" }}>
    <h1>Administration Massar</h1>
    <div style={css.panel}>
      <input style={{ ...css.input, width: "100%", marginBottom: 10 }} type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
      <input style={{ ...css.input, width: "100%", marginBottom: 10 }} type="password" placeholder="Mot de passe" value={password} onChange={e => setPassword(e.target.value)} />
      <button style={css.primary} onClick={login}>Se connecter</button>
      {message && <p>{message}</p>}
    </div>
  </main>;

  const card = (icon: string, label: string, value: number, color: string) => (
    <div style={{ ...css.panel, background: color, display: "flex", alignItems: "center", gap: 13, minHeight: 95 }}>
      <div style={{ fontSize: 30, background: "#ffffffb8", borderRadius: 12, padding: 12 }}>{icon}</div>
      <div>
        <div style={{ fontWeight: 700, fontSize: 14 }}>{label}</div>
        <div style={{ fontSize: 28, fontWeight: 900 }}>{fmt(value)}</div>
      </div>
    </div>
  );  return <main style={css.page}>
    <div style={{ display: "grid", gridTemplateColumns: "245px minmax(0,1fr)", gap: 12 }}>
      <aside style={css.sidebar}>
        <div style={{ textAlign: "center", padding: "10px 4px 22px" }}>
          <div style={{ fontSize: 44 }}>📚</div>
          <h2 style={{ margin: "5px 0", color: "white" }}>
            Association <span style={{ color: "#34d058" }}>Massar</span>
          </h2>
          <div>Espace Administrateur</div>
        </div>

        {navItems.map(([key, icon, label]) => (
          <button
            key={key}
            onClick={() => setSection(key)}
            style={{
              ...css.btn,
              display: "block",
              width: "100%",
              textAlign: "left",
              marginBottom: 6,
              background: section === key ? "#1683f8" : "transparent",
              color: "white",
              borderColor: "transparent",
            }}
          >
            <span style={{ marginRight: 12 }}>{icon}</span>
            {label}
          </button>
        ))}

        <button
          onClick={async () => {
            await supabase.auth.signOut();
            setStatus("out");
          }}
          style={{ ...css.btn, display: "block", width: "100%", marginTop: 18 }}
        >
          ↪ Se déconnecter
        </button>
      </aside>

      <section style={{ padding: "14px 12px", minWidth: 0 }}>
        <header style={{
          display: "flex",
          justifyContent: "space-between",
          flexWrap: "wrap",
          alignItems: "center",
          gap: 10,
          marginBottom: 12
        }}>
          <div>
            <h1 style={{ margin: "0 0 5px", fontSize: 27 }}>
              Tableau de bord – <span style={{ color: "#16803b" }}>Association Massar</span>
            </h1>
            <p style={{ margin: 0, color: "#475569" }}>
              Gérez vos contenus, suivez les statistiques et développez votre plateforme.
            </p>
          </div>

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button style={css.btn} onClick={load}>↻ Actualiser</button>
            <button style={css.btn} onClick={() => setSection("stats")}>🔔 Statistiques</button>
            <button style={css.btn} onClick={async () => {
              await supabase.auth.signOut();
              setStatus("out");
            }}>
              A Admin · Déconnexion
            </button>
          </div>
        </header>

        {message && <div style={{ ...css.panel, marginBottom: 10, color: "#075985" }}>{message}</div>}

        <div style={{
          ...css.panel,
          display: "flex",
          gap: 10,
          flexWrap: "wrap",
          alignItems: "center",
          marginBottom: 12
        }}>
          <b>📅</b>
          <span>Du</span>
          <input style={css.input} type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
          <span>au</span>
          <input style={css.input} type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
          <button style={css.btn} onClick={() => { setStartDate(""); setEndDate(""); }}>
            Tout afficher
          </button>
        </div>

        {section === "dashboard" && <>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(4,minmax(0,1fr))",
            gap: 10,
            marginBottom: 12
          }}>
            {card("👥", "Visiteurs", unique, "#eaf3ff")}
            {card("📄", "Téléchargements", downloads.length, "#eafbef")}
            {card("▤", "Ressources", totalResources, "#f1eaff")}
            {card("👁", "Consultations", visits.length, "#fff2e5")}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "minmax(0,2fr) minmax(280px,1fr)", gap: 12 }}>
            <div>
              <div style={css.panel}>
                <h2 style={{ marginTop: 0 }}>🎓 Gestion par niveau</h2>

                {["Primaire", "Collège", "Lycée"].map(cycle => (
                  <div key={cycle} style={{
                    background: cycle === "Primaire" ? "#e7f2ff" : cycle === "Collège" ? "#f0eaff" : "#e8fae9",
                    padding: 10,
                    borderRadius: 10,
                    marginBottom: 8
                  }}>
                    <b>{cycle}</b>

                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
                      {levelsByCycle(cycle).map((l: any) => (
                        <button
                          key={l.id}
                          onClick={() => {
                            setLevelSelected(l.id);
                            const linked = data.level_subjects
                              .filter((ls: any) => String(ls.level_id) === String(l.id))
                              .map((ls: any) => String(ls.subject_id));
                            const nextSubject = data.subjects.find((sub: any) => linked.includes(String(sub.id)));
                            setSubjectSelected(nextSubject ? nextSubject.id : (data.level_subjects.length ? null : data.subjects[0]?.id));
                            setPage(1);
                            setSection("dashboard");
                          }}
                          style={{
                            ...css.btn,
                            background: String(levelSelected) === String(l.id) ? "#0877f9" : "white",
                            color: String(levelSelected) === String(l.id) ? "white" : "#102354"
                          }}
                        >
                          {l.name}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ ...css.panel, marginTop: 12 }}>
                <h2 style={{ marginTop: 0 }}>📖 {nm(data.levels, levelSelected)} – Gestion des matières</h2>

                <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
                  {subjectsAtLevel.map((s: any) => (
                    <button
                      key={s.id}
                      onClick={() => {
                        setSubjectSelected(s.id);
                        setPage(1);
                        setSection("dashboard");
                      }}
                      style={{
                        ...css.btn,
                        background: String(subjectSelected) === String(s.id) ? "#0877f9" : "white",
                        color: String(subjectSelected) === String(s.id) ? "white" : "#102354"
                      }}
                    >
                      {s.icon || "📘"} {s.name}
                    </button>
                  ))}
                </div>

                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 14 }}>
                  {["Toutes", ...(TYPES || [])].map((t: string) => (
                    <button
                      key={t}
                      style={{
                        ...css.btn,
                        background: resourceType === t ? "#0877f9" : "white",
                        color: resourceType === t ? "white" : "#102354"
                      }}
                      onClick={() => {
                        setResourceType(t);
                        setPage(1);
                        setSection("dashboard");
                      }}
                    >
                      {t === "Toutes" ? "▤" : "📘"} {t}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ ...css.panel, marginTop: 12 }}>
                <div style={{
                  display: "flex",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: 8,
                  alignItems: "center"
                }}>
                  <h2 style={{ margin: 0 }}>📄 Ressources ({filteredResources.length})</h2>
                  <button style={css.primary} onClick={() => setSection("resources")}>＋ Ajouter une ressource</button>
                </div>

                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", margin: "12px 0" }}>
                  <input
                    style={{ ...css.input, flex: 1, minWidth: 180 }}
                    placeholder="⌕ Rechercher un titre…"
                    value={resourceSearch}
                    onChange={e => { setResourceSearch(e.target.value); setPage(1); }}
                  />

                  <select style={css.input} value={resourceType} onChange={e => { setResourceType(e.target.value); setPage(1); }}>
                    <option>Toutes</option>
                    {(TYPES || []).map((t: string) => <option key={t}>{t}</option>)}
                  </select>

                  <button style={css.btn} onClick={() => {
                    const rows = [
                      ["Titre", "Type", "Niveau", "Matière", "Chapitre", "Date", "Téléchargements"],
                      ...filteredResources.map((r: any) => [
                        r.title,
                        r.type,
                        nm(data.levels, r.level_id),
                        nm(data.subjects, r.subject_id),
                        nm(data.chapters, r.chapter_id),
                        dt(r.created_at),
                        downloadCounts[r.title] || 0
                      ])
                    ];

                    const csv = rows.map(row =>
                      row.map((cell: any) => `"${String(cell ?? "").replace(/"/g, '""')}"`).join(",")
                    ).join("\r\n");

                    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = "ressources-massar.csv";
                    a.click();
                    URL.revokeObjectURL(url);
                  }}>
                    ⇩ Exporter CSV
                  </button>
                </div>

                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                    <thead>
                      <tr>
                        {["Titre", "Type", "Chapitre", "Date", "Vues", "Téléch.", "Actions"].map(x =>
                          <th key={x} style={css.th}>{x}</th>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {shownResources.map((r: any) => (
                        <tr key={r.id}>
                          <td style={css.td}>📕 {r.title}</td>
                          <td style={css.td}><span style={{ background: "#dcfce7", borderRadius: 20, padding: "4px 8px" }}>{r.type}</span></td>
                          <td style={css.td}>{nm(data.chapters, r.chapter_id)}</td>
                          <td style={css.td}>{dt(r.created_at)}</td>
                          <td style={css.td}>—</td>
                          <td style={css.td}><b style={{ color: "#15803d" }}>{fmt(downloadCounts[r.title] || 0)}</b></td>
                          <td style={css.td}>
                            <button style={css.btn} onClick={() => editResource(r)}>✎</button>
                            <button style={css.btn} onClick={() => run(supabase.from("resources").update({ is_premium: !r.is_premium }).eq("id", r.id), "Statut changé")}>
                              {r.is_premium ? "🔓" : "🔒"}
                            </button>
                            <button style={{ ...css.btn, color: "#dc2626" }} onClick={() => askDelete(r.title, supabase.from("resources").delete().eq("id", r.id))}>🗑</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div style={{
                  display: "flex",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: 8,
                  marginTop: 10,
                  alignItems: "center"
                }}>
                  <span>
                    Afficher{" "}
                    <select style={css.input} value={pageSize} onChange={e => { setPageSize(+e.target.value); setPage(1); }}>
                      <option value={5}>5</option>
                      <option value={10}>10</option>
                      <option value={20}>20</option>
                    </select>{" "}
                    éléments
                  </span>

                  <div style={{ display: "flex", gap: 5 }}>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).slice(0, 5).map(n =>
                      <button
                        key={n}
                        style={{ ...css.btn, background: page === n ? "#0877f9" : "white", color: page === n ? "white" : "#102354" }}
                        onClick={() => setPage(n)}
                      >
                        {n}
                      </button>
                    )}
                    <button style={css.btn} onClick={() => setPage(Math.min(totalPages, page + 1))}>›</button>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <div style={css.panel}>
                <h2 style={{ marginTop: 0 }}>📊 Statistiques générales</h2>
                <div style={{ height: 160, display: "flex", alignItems: "end", gap: 8, padding: "10px 2px" }}>
                  {daily.map(([day, count]: any) => (
                    <div key={day} title={`${day}: ${count}`} style={{ flex: 1, textAlign: "center" }}>
                      <div style={{
                        height: `${Math.max(8, Number(count) / Math.max(1, ...daily.map((x: any) => Number(x[1]))) * 125)}px`,
                        background: "linear-gradient(#1683f8,#8fc4ff)",
                        borderRadius: "5px 5px 0 0"
                      }} />
                      <small style={{ fontSize: 10 }}>{day.split("/").slice(0, 2).join("/")}</small>
                    </div>
                  ))}
                </div>
                <small>Visites par jour sur la période sélectionnée</small>
              </div>

              <div style={{ ...css.panel, marginTop: 12 }}>
                <h2 style={{ marginTop: 0 }}>🏆 Top 5 des téléchargements</h2>
                {topDownloads.map(([title, count]: any, i: number) => (
                  <div key={title} style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 8,
                    borderBottom: "1px solid #e6edf6",
                    padding: "9px 0",
                    fontSize: 13
                  }}>
                    <span>{i + 1}. 📕 {title}</span>
                    <b style={{ color: "#15803d" }}>{fmt(count)} ⬇</b>
                  </div>
                ))}
              </div>

              <div style={{ ...css.panel, marginTop: 12 }}>
                <h2 style={{ marginTop: 0 }}>▤ Répartition par type</h2>
                <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                  <div style={{
                    width: 130,
                    height: 130,
                    borderRadius: "50%",
                    background: `conic-gradient(${Object.entries(typeCounts).map(([t, n]: any, i) =>
                      `${["#1683f8", "#22c55e", "#9333ea", "#f59e0b", "#94a3b8"][i % 5]} ${
                        Object.values(typeCounts).slice(0, i).reduce<number>((a, b) => a + Number(b), 0) / Math.max(1, totalResources) * 100
                      }% ${
                        (Object.values(typeCounts).slice(0, i).reduce<number>((a, b) => a + Number(b), 0) + Number(n)) / Math.max(1, totalResources) * 100
                      }%`
                    ).join(",")})`,
                    display: "grid",
                    placeItems: "center"
                  }}>
                    <div style={{ width: 75, height: 75, borderRadius: "50%", background: "white", display: "grid", placeItems: "center", textAlign: "center", fontWeight: 900 }}>
                      {totalResources}<small>Ressources</small>
                    </div>
                  </div>

                  <div>
                    {Object.entries(typeCounts).map(([type, count]: any, i) => (
                      <div key={type} style={{ fontSize: 12, margin: "6px 0" }}>
                        <span style={{ color: ["#1683f8", "#22c55e", "#9333ea", "#f59e0b", "#94a3b8"][i % 5] }}>●</span>
                        {" "}{type}: {count} ({Math.round(Number(count) / Math.max(1, totalResources) * 100)}%)
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>}
                    {section === "stats" && (
          <div style={css.panel}>
            <h2>📊 Statistiques détaillées</h2>

            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))",
              gap: 10
            }}>
              {card("👥", "Visiteurs uniques", unique, "#eaf3ff")}
              {card("👁", "Visites", visits.length, "#eefbf1")}
              {card("⬇", "Téléchargements", downloads.length, "#f1eaff")}
              {card("▤", "Ressources", totalResources, "#fff2e5")}
            </div>

            <h3>Pages les plus consultées</h3>
            {topPages.map(([p, c]: any) => (
              <div key={p} style={{
                padding: 9,
                borderBottom: "1px solid #eee",
                display: "flex",
                justifyContent: "space-between"
              }}>
                {p}<b>{c}</b>
              </div>
            ))}

            <h3>📥 Historique détaillé des téléchargements ({downloads.length})</h3>

            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    {["Document téléchargé", "Niveau", "Matière", "Date / heure"].map(x =>
                      <th style={css.th} key={x}>{x}</th>
                    )}
                  </tr>
                </thead>

                <tbody>
                  {downloads.slice(0, 300).map((d: any, i: number) => (
                    <tr key={i}>
                      <td style={css.td}>{d.resource_title || "Document"}</td>
                      <td style={css.td}>{nm(data.levels, d.level_id)}</td>
                      <td style={css.td}>{nm(data.subjects, d.subject_id)}</td>
                      <td style={css.td}>{dtime(d.downloaded_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {section === "visitors" && (
          <div style={css.panel}>
            <h2>👥 Visiteurs détaillés</h2>

            <p>
              Les visiteurs sont identifiés par un ID anonyme du navigateur.
              Consultez leur nombre de visites, les pages consultées et
              l'historique complet sur la période sélectionnée.
            </p>

            <input
              style={{ ...css.input, width: "100%" }}
              placeholder="Rechercher un visitor ID…"
              value={visitorSearch}
              onChange={e => setVisitorSearch(e.target.value)}
            />

            <div style={{ overflowX: "auto", marginTop: 12 }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    {[
                      "Visitor ID",
                      "Nombre de visites",
                      "Pages consultées",
                      "Première visite",
                      "Dernière visite",
                      "Détail"
                    ].map(x => <th style={css.th} key={x}>{x}</th>)}
                  </tr>
                </thead>

                <tbody>
                  {visitorRows.map((v: any) => (
                    <tr key={v.id}>
                      <td style={css.td}>
                        <span style={{ fontFamily: "monospace", fontSize: 12 }}>
                          {v.id}
                        </span>
                      </td>

                      <td style={css.td}><b>{fmt(v.count)}</b></td>
                      <td style={css.td}>{[...v.pages].join(", ")}</td>
                      <td style={css.td}>{dtime(v.first)}</td>
                      <td style={css.td}>{dtime(v.last)}</td>

                      <td style={css.td}>
                        <button
                          style={css.primary}
                          onClick={() =>
                            setSelectedVisitorId(selectedVisitorId === v.id ? null : v.id)
                          }
                        >
                          {selectedVisitorId === v.id ? "Masquer" : "Voir détail"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {selectedVisitorId && (() => {
              const history = visits
                .filter((v: any) => (v.visitor_id || "Sans identifiant") === selectedVisitorId)
                .sort((a: any, b: any) =>
                  new Date(b.visited_at).getTime() - new Date(a.visited_at).getTime()
                );

              return (
                <div style={{
                  ...css.panel,
                  marginTop: 16,
                  background: "#f8fbff",
                  borderColor: "#b8d3f7"
                }}>
                  <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 10,
                    flexWrap: "wrap"
                  }}>
                    <h3 style={{ margin: "0 0 8px" }}>
                      🔎 Historique détaillé du visiteur
                    </h3>

                    <button style={css.btn} onClick={() => setSelectedVisitorId(null)}>
                      Fermer ✕
                    </button>
                  </div>

                  <p style={{ fontSize: 12, wordBreak: "break-all" }}>
                    <b>Visitor ID :</b> {selectedVisitorId}
                  </p>

                  <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))",
                    gap: 8,
                    marginBottom: 12
                  }}>
                    {card("👁", "Visites sur la période", history.length, "#eaf3ff")}
                    {card("📄", "Pages différentes", new Set(history.map((v: any) => v.page_path)).size, "#eafbef")}
                  </div>

                  <h4>Pages et dates / heures de visite</h4>

                  <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                      <thead>
                        <tr>
                          {["N°", "Page consultée", "Date", "Heure"].map(x =>
                            <th style={css.th} key={x}>{x}</th>
                          )}
                        </tr>
                      </thead>

                      <tbody>
                        {history.map((v: any, i: number) => (
                          <tr key={`${v.visited_at}-${i}`}>
                            <td style={css.td}>{i + 1}</td>
                            <td style={css.td}>{v.page_path || "—"}</td>
                            <td style={css.td}>
                              {new Date(v.visited_at).toLocaleDateString("fr-FR")}
                            </td>
                            <td style={css.td}>
                              {new Date(v.visited_at).toLocaleTimeString("fr-FR")}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })()}

            <h3>Historique récent de tous les visiteurs</h3>

            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    {["Visitor ID", "Page", "Date / heure"].map(x =>
                      <th style={css.th} key={x}>{x}</th>
                    )}
                  </tr>
                </thead>

                <tbody>
                  {visits.slice(0, 100).map((v: any, i: number) => (
                    <tr key={i}>
                      <td style={css.td}>
                        <span style={{ fontFamily: "monospace", fontSize: 12 }}>
                          {v.visitor_id || "—"}
                        </span>
                      </td>
                      <td style={css.td}>{v.page_path}</td>
                      <td style={css.td}>{dtime(v.visited_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {section === "resources" && (
          <>
            <div style={css.panel}>
              <h2>＋ Ajouter une ressource</h2>

              <div style={{ display: "flex", flexWrap: "wrap", gap: 9 }}>
                {select(form.level_id, (v: any) => setForm({ ...form, level_id: v, chapter_id: "" }), data.levels, "Niveau")}
                {select(form.subject_id, (v: any) => setForm({ ...form, subject_id: v, chapter_id: "" }), data.subjects, "Matière")}
                {select(form.chapter_id, (v: any) => setForm({ ...form, chapter_id: v }), chaptersForForm, "Chapitre facultatif")}

                <select style={css.input} value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                  {(TYPES || []).map((t: string) => <option key={t}>{t}</option>)}
                </select>

                <input style={css.input} placeholder="Titre" value={form.title || ""} onChange={e => setForm({ ...form, title: e.target.value })} />
                <input style={css.input} placeholder="Description" value={form.description || ""} onChange={e => setForm({ ...form, description: e.target.value })} />

                <label>
                  <input type="checkbox" checked={!!form.is_premium} onChange={e => setForm({ ...form, is_premium: e.target.checked })} />
                  Premium
                </label>

                <input type="file" accept=".pdf,image/*" onChange={e => setForm({ ...form, file: e.target.files?.[0] })} />

                <button style={css.primary} onClick={addResource}>Publier</button>
              </div>
            </div>

            <div style={css.panel}>
              <h2>Ressources publiées ({data.resources.length})</h2>

              {data.resources
                .filter((r: any) =>
                  (!levelSelected || String(r.level_id) === String(levelSelected)) &&
                  (!subjectSelected || String(r.subject_id) === String(subjectSelected))
                )
                .map((r: any) => (
                  <div key={r.id} style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 8,
                    padding: 9,
                    borderBottom: "1px solid #eee",
                    flexWrap: "wrap"
                  }}>
                    <span>
                      {r.title} — {nm(data.levels, r.level_id)} / {nm(data.subjects, r.subject_id)} / {r.type} {r.is_premium ? "🔒" : ""}
                    </span>

                    <span>
                      <button style={css.btn} onClick={() => editResource(r)}>Modifier contenu</button>

                      <button style={css.btn} onClick={() =>
                        run(supabase.from("resources").update({ is_premium: !r.is_premium }).eq("id", r.id))
                      }>
                        {r.is_premium ? "Gratuit" : "Premium"}
                      </button>

                      <button style={css.btn} onClick={() =>
                        askDelete(r.title, supabase.from("resources").delete().eq("id", r.id))
                      }>
                        Supprimer
                      </button>
                    </span>
                  </div>
                ))}
            </div>
          </>
        )}

        {section === "levels" && (
          <div style={css.panel}>
            <h2>🎓 Gestion des niveaux</h2>

            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
              <input style={css.input} placeholder="Nom du niveau" value={newLevel.name} onChange={e => setNewLevel({ ...newLevel, name: e.target.value })} />

              <select style={css.input} value={newLevel.cycle} onChange={e => setNewLevel({ ...newLevel, cycle: e.target.value })}>
                <option>Primaire</option>
                <option>Collège</option>
                <option>Lycée</option>
              </select>

              <button style={css.primary} onClick={() => {
                if (!newLevel.name.trim()) return setMessage("Saisissez le niveau");
                run(supabase.from("levels").insert({
                  name: newLevel.name,
                  slug: slug(newLevel.name),
                  cycle: newLevel.cycle,
                  position: 100
                }), "Niveau ajouté");
                setNewLevel({ name: "", cycle: "Primaire" });
              }}>
                Ajouter
              </button>
            </div>

            {data.levels.map((l: any) => (
              <div key={l.id} style={{
                display: "flex",
                justifyContent: "space-between",
                padding: 10,
                borderBottom: "1px solid #eee"
              }}>
                {l.cycle} — {l.name}

                <button style={css.btn} onClick={() =>
                  askDelete(l.name, supabase.from("levels").delete().eq("id", l.id))
                }>
                  Supprimer
                </button>
              </div>
            ))}
          </div>
        )}

        {section === "subjects" && (
          <div style={css.panel}>
            <h2>📚 Gestion des matières</h2>

            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
              <input style={css.input} placeholder="Nom matière" value={newSubject.name} onChange={e => setNewSubject({ ...newSubject, name: e.target.value })} />
              <input style={{ ...css.input, width: 75 }} value={newSubject.icon} onChange={e => setNewSubject({ ...newSubject, icon: e.target.value })} />

              {data.levels.map((l: any) => (
                <label key={l.id}>
                  <input
                    type="checkbox"
                    checked={newSubject.levels.includes(l.id)}
                    onChange={e => setNewSubject({
                      ...newSubject,
                      levels: e.target.checked
                        ? [...newSubject.levels, l.id]
                        : newSubject.levels.filter((id: any) => id !== l.id)
                    })}
                  />
                  {l.name}
                </label>
              ))}

              <button style={css.primary} onClick={async () => {
                if (!newSubject.name.trim()) return setMessage("Saisissez le nom de matière");

                const { data: created, error } = await supabase
                  .from("subjects")
                  .insert({ name: newSubject.name, icon: newSubject.icon })
                  .select()
                  .single();

                if (error) return setMessage(error.message);

                if (newSubject.levels.length) {
                  const { error: linkErr } = await supabase.from("level_subjects").insert(
                    newSubject.levels.map((id: any) => ({ level_id: id, subject_id: created.id }))
                  );

                  if (linkErr) {
                    setMessage(linkErr.message);
                    await load();
                    return;
                  }
                }

                setNewSubject({ name: "", icon: "📘", levels: [] });
                setMessage("Matière ajoutée");
                await load();
              }}>
                Ajouter matière
              </button>
            </div>

            {data.subjects.map((s: any) => (
              <div key={s.id} style={{
                display: "flex",
                justifyContent: "space-between",
                padding: 10,
                borderBottom: "1px solid #eee"
              }}>
                {s.icon} {s.name}

                <button style={css.btn} onClick={() =>
                  askDelete(s.name, supabase.from("subjects").delete().eq("id", s.id))
                }>
                  Supprimer
                </button>
              </div>
            ))}
          </div>
        )}

        {section === "chapters" && (
          <div style={css.panel}>
            <h2>📖 Gestion des chapitres</h2>

            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
              {select(form.level_id, (v: any) => setForm({ ...form, level_id: v }), data.levels, "Niveau")}
              {select(form.subject_id, (v: any) => setForm({ ...form, subject_id: v }), data.subjects, "Matière")}

              <input style={css.input} placeholder="Titre du chapitre" value={newChapter} onChange={e => setNewChapter(e.target.value)} />

              <button style={css.primary} onClick={() => {
                if (!newChapter.trim() || !form.level_id || !form.subject_id) {
                  return setMessage("Niveau, matière et titre nécessaires");
                }

                run(supabase.from("chapters").insert({
                  level_id: +form.level_id,
                  subject_id: +form.subject_id,
                  title: newChapter
                }), "Chapitre ajouté");

                setNewChapter("");
              }}>
                Ajouter
              </button>
            </div>

            {data.chapters.map((c: any) => (
              <div key={c.id} style={{
                display: "flex",
                justifyContent: "space-between",
                padding: 10,
                borderBottom: "1px solid #eee"
              }}>
                {c.title} — {nm(data.levels, c.level_id)} / {nm(data.subjects, c.subject_id)}

                <button style={css.btn} onClick={() =>
                  askDelete(c.title, supabase.from("chapters").delete().eq("id", c.id))
                }>
                  Supprimer
                </button>
              </div>
            ))}
          </div>
        )}

        {section === "ads" && (
          <div style={css.panel}>
            <h2>📢 Gestion des publicités</h2>
            <p>Activez les emplacements et modifiez leur code.</p>

            {data.ads.map((a: any) => (
              <div key={a.slot} style={{ ...css.panel, marginBottom: 10 }}>
                <label>
                  <input type="checkbox" checked={!!a.enabled} onChange={e =>
                    run(supabase.from("ads").update({ enabled: e.target.checked }).eq("slot", a.slot))
                  } />
                  <b>{a.label}</b>
                </label>

                <textarea
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

              <label style={{ display: "block", fontWeight: 700, marginBottom: 6 }}>Niveau</label>
              <select
                style={{ ...css.input, width: "100%", boxSizing: "border-box", marginBottom: 18 }}
                value={editForm.level_id}
                onChange={e => setEditForm({ ...editForm, level_id: e.target.value })}
              >
                <option value="">Choisir un niveau</option>
                {data.levels.map((l: any) => (
                  <option key={l.id} value={String(l.id)}>
                    {l.cycle ? `${l.cycle} — ` : ""}{l.name}
                  </option>
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

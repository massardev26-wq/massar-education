
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
  );

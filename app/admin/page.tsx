 "use client";

import { useEffect, useMemo, useState } from "react";
import { supabase, TYPES } from "@/lib/supabase";

const slug = (s: string) =>
  s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const nm = (items: any[], id: any) => items.find((x) => String(x.id) === String(id))?.name || "—";

export default function Admin() {
  const [st, setSt] = useState("load");
  const [em, setEm] = useState("");
  const [pw, setPw] = useState("");
  const [msg, setMsg] = useState("");
  const [D, setD] = useState<any>({ levels: [], subjects: [], chapters: [], resources: [], ads: [], visits: [], downloads: [] });
  const [f, setF] = useState<any>({ type: TYPES[0] });
  const [nl, setNl] = useState({ name: "", cycle: "Primaire" });
  const [ns, setNs] = useState<any>({ name: "", icon: "📘", lv: [] });
  const [nc, setNc] = useState("");
  const [editingResource, setEditingResource] = useState<any>(null);
  const [editForm, setEditForm] = useState<any>({ title: "", type: TYPES[0], level_id: "" });
  const [visitorSearch, setVisitorSearch] = useState("");
  const [selectedVisitorId, setSelectedVisitorId] = useState<string | null>(null);
  const [activeLevel, setActiveLevel] = useState<any>(null);
  const [activeSubject, setActiveSubject] = useState<any>(null);
  const [resourceTab, setResourceTab] = useState("Tous");
  const [resourceSearch, setResourceSearch] = useState("");
  const [page, setPage] = useState(1);
  const [showAdd, setShowAdd] = useState(false);
  const pageSize = 5;

  async function load() {
    try {
      const [levels, subjects, chapters, resources, ads, visits, downloads] = await Promise.all([
        supabase.from("levels").select("*").order("position"),
        supabase.from("subjects").select("*").order("name"),
        supabase.from("chapters").select("*").order("title"),
        supabase.from("resources").select("*").order("created_at", { ascending: false }),
        supabase.from("ads").select("*").order("slot"),
        supabase.from("site_visits").select("visitor_id,page_path,visited_at"),
        supabase.from("resource_downloads").select("resource_id,resource_title,downloaded_at"),
      ]);
      const errors = [levels, subjects, chapters, resources, ads, visits, downloads].filter((x) => x.error);
      if (errors.length) setMsg("Erreur de chargement. Consultez la Console.");
      setD({
        levels: levels.data || [], subjects: subjects.data || [], chapters: chapters.data || [],
        resources: resources.data || [], ads: ads.data || [], visits: visits.data || [], downloads: downloads.data || [],
      });
      if (!activeLevel && levels.data?.length) setActiveLevel(levels.data[0].id);
      if (!activeSubject && subjects.data?.length) setActiveSubject(subjects.data[0].id);
    } catch (e) {
      console.error(e); setMsg("Erreur lors du chargement des données.");
    }
  }

  async function check() {
    setSt("load"); setMsg("");
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) setMsg("Erreur utilisateur : " + userError.message);
      if (!user) { setSt("out"); return; }
      const { data, error } = await supabase.from("admins").select("user_id").eq("user_id", user.id).maybeSingle();
      if (error) { setMsg("Erreur Admin : " + error.message); setSt("no"); return; }
      if (data) { setSt("ok"); await load(); } else { setMsg("Aucun accès administrateur trouvé pour ce compte."); setSt("no"); }
    } catch (e) { console.error(e); setMsg("Erreur de vérification."); setSt("out"); }
  }
  useEffect(() => { check(); }, []);

  async function run(p: any, ok = "Enregistré ✅") {
    const { error } = await p;
    if (error) { console.error(error); setMsg("Erreur : " + error.message); }
    else setMsg(ok);
    await load();
  }
  async function login() {
    setMsg("");
    if (!em || !pw) { setMsg("Veuillez saisir votre email et votre mot de passe."); return; }
    const { error } = await supabase.auth.signInWithPassword({ email: em.trim(), password: pw });
    if (error) { setMsg("Connexion impossible : " + error.message); return; }
    await check();
  }
  async function addRes() {
    if (!f.level_id || !f.subject_id || !f.title) { setMsg("Choisissez le niveau, la matière et écrivez un titre."); return; }
    let file_url = null;
    if (f.file) {
      const path = Date.now() + "-" + slug(f.file.name.replace(/\.[^.]+$/, "")) + "." + f.file.name.split(".").pop();
      const { error } = await supabase.storage.from("files").upload(path, f.file);
      if (error) { setMsg("Erreur d’envoi du fichier : " + error.message); return; }
      file_url = supabase.storage.from("files").getPublicUrl(path).data.publicUrl;
    }
    await run(supabase.from("resources").insert({
      level_id: +f.level_id, subject_id: +f.subject_id, chapter_id: f.chapter_id ? +f.chapter_id : null,
      type: f.type, title: f.title, description: f.description || null, is_premium: !!f.is_premium, file_url,
    }), "Ressource publiée ✅");
    setF({ type: TYPES[0] }); setShowAdd(false);

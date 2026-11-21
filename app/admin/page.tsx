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

  const [form, setForm] = useState<any>({ type: TYPES?.[0] || "Exercice", content: "" });
  const [editingResource, setEditingResource] = useState<any>(null);
  const [editForm, setEditForm] = useState<any>({
    title: "",
    type: TYPES?.[0] || "Exercice",
    level_id: "",
  });

  const [newLevel, setNewLevel] = useState({ name: "", cycle: "Primaire" });
  const [newSubject, setNewSubject] = useState({ name: "", icon: "📘", levels: [] as any[] });
  const [newChapter, setNewChapter] = useState("");
  const [draggedChapterId, setDraggedChapterId] = useState<string | number | null>(null);
  const [dateRangeLabel, setDateRangeLabel] = useState("Période personnalisée");

  async function load() {
    const [levels, subjects, level_subjects, chapters, resources, ads, visits, downloads] = await Promise.all([
      supabase.from("levels").select("*").order("position"),
      supabase.from("subjects").select("*").order("name"),
      supabase.from("level_subjects").select("level_id,subject_id"),
      supabase.from("chapters").select("*").order("position", { ascending: true }).order("title", { ascending: true }),
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

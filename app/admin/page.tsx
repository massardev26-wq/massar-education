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

  // باقي الكود كيتبع فالأجزاء المقبلة

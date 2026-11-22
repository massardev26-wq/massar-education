import type { ReactNode } from "react";
import "./globals.css";
import VisitTracker from "./components/VisitTracker";
import Script from "next/script";
import { supabase } from "@/lib/supabase";

export const metadata = {
  title: "Association Massar - Espace éducatif",
  description:
    "Cours, exercices, examens et corrections du CP à la 2ème Bac.",
  verification: {
    google: "iBCshDSwXR8fEeD5Yo2jjNqZeBED8jsg7KnLXvRpp34",
  },
  other: {
    "google-adsense-account": "ca-pub-7789227220295594",
  },
};

export default async function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  const { data: navigationLevels } = await supabase
    .from("levels")
    .select("id,name,slug,cycle,position")
    .order("position", { ascending: true });

  return (
    <html lang="fr">
      <body>
        <Script
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7789227220295594"
          strategy="afterInteractive"
          crossOrigin="anonymous"
        />

        <div className="page">
          {/* TRACKING DES VISITES */}
          <VisitTracker />

          {/* HEADER */}
          <header
            style={{
              position: "sticky",
              top: 0,
              zIndex: 100,
              background: "rgba(255,255,255,0.98)",
              borderBottom: "1px solid #e3e8f2",
              boxShadow: "0 3px 15px rgba(18,51,122,0.05)",
              width: "100%",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "20px",
                padding: "10px 4%",
                flexWrap: "wrap",
                boxSizing: "border-box",
              }}
            >
              {/* LOGO */}
              <a
                href="/"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "15px",
                  textDecoration: "none",
                  outline: "none",
                }}
              >
                <img
                  src="/logo.jpg"
                  alt="Association Massar"
                  style={{
                    width: "85px",
                    height: "85px",
                    objectFit: "contain",
                    display: "block",
                  }}
                />

                <div
                  style={{
                    borderLeft: "2px solid #123579",
                    paddingLeft: "15px",
                  }}
                >
                  <div
                    style={{
                      color: "#123579",
                      fontSize: "21px",

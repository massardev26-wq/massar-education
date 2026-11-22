import type { ReactNode } from "react";
import Link from "next/link";
import Script from "next/script";
import "./globals.css";
import VisitTracker from "./components/VisitTracker";
import { supabase } from "@/lib/supabase";

export const metadata = {
  title: "Association Massar - Espace éducatif",
  description: "Cours, exercices, examens et corrections du CP à la 2ème Bac.",
  verification: {
    google: "iBCshDSwXR8fEeD5Yo2jjNqZeBED8jsg7KnLXvRpp34",
  },
  other: {
    "google-adsense-account": "ca-pub-7789227220295594",
  },
};

export const dynamic = "force-dynamic";

export default async function RootLayout({ children }: { children: ReactNode }) {
  const { data } = await supabase
    .from("levels")
    .select("id,name,slug,cycle,position")
    .order("position", { ascending: true });

  const levels = data || [];
  const cycles = ["Primaire", "Collège", "Lycée"];

  return (
    <html lang="fr">
      <body>
        <Script
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7789227220295594"
          strategy="afterInteractive"
          crossOrigin="anonymous"
        />
        <div className="page">
          <VisitTracker />
          <header>
            <div className="bar">
              <Link href="/" aria-label="Accueil Association Massar">
                <img src="/logo.jpg" alt="Association Massar" />
              </Link>
              <div style={{ minWidth: 180, color: "#123579", fontWeight: 900, lineHeight: 1.25 }}>
                <div style={{ fontSize: 19 }}>ASSOCIATION MASSAR</div>
                <small style={{ color: "#64748b", fontWeight: 600 }}>Espace éducatif</small>
              </div>
              <nav aria-label="Navigation principale">
                <Link href="/">Accueil</Link>
                {cycles.map((cycle) => {
                  const cycleLevels = levels.filter((level: any) => level.cycle === cycle);
                  if (!cycleLevels.length) return null;
                  return (
                    <span key={cycle} style={{ position: "relative", display: "inline-flex", alignItems: "center" }}>
                      <details>
                        <summary style={{ cursor: "pointer", padding: "8px 12px", fontWeight: 700, color: "#5b667d" }}>{cycle}</summary>
                        <div style={{ position: "absolute", top: "100%", left: 0, minWidth: 180, maxHeight: 300, overflowY: "auto", background: "#fff", border: "1px solid #e3e8f2", borderRadius: 10, boxShadow: "0 8px 24px #12337a20", padding: 8, zIndex: 20 }}>
                          {cycleLevels.map((level: any) => (
                            <Link key={level.id} href={`/niveau/${level.slug}`} style={{ display: "block", padding: "7px 10px", color: "#123579" }}>{level.name}</Link>
                          ))}
                        </div>
                      </details>
                    </span>
                  );
                })}
                <Link href="/a-propos">À propos</Link>
                <Link href="/contact">Contact</Link>
              </nav>
            </div>
          </header>
          {children}
          <footer>
            <div className="wrap">
              <strong>Association Massar pour l’Éducation et le Développement</strong>
              <p style={{ margin: "8px 0" }}>Cours, exercices, examens et corrections pour accompagner les élèves.</p>
              <div>
                <Link href="/">Accueil</Link>
                <Link href="/a-propos">À propos</Link>
                <Link href="/contact">Contact</Link>
                <Link href="/politique-confidentialite">Politique de confidentialité</Link>
              </div>
              <small style={{ display: "block", marginTop: 14 }}>© {new Date().getFullYear()} Association Massar</small>
            </div>
          </footer>
          {process.env.NEXT_PUBLIC_WHATSAPP ? (
            <a className="wa" href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP}`} target="_blank" rel="noreferrer">WhatsApp</a>
          ) : null}
        </div>
      </body>
    </html>
  );
}


import "./globals.css";

export const metadata = {
  title: "Association Massar - Espace éducatif",
  description:
    "Cours, exercices, examens et corrections du CP à la 2ème Bac.",
  verification: {
    google: "iBCshDSwXR8fEeD5Yo2jjNqZeBED8jsg7KnLXvRpp34",
  },
};

export default function Root({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body>
        <div className="page">
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
                      fontWeight: 900,
                    }}
                  >
                    Association{" "}
                    <span style={{ color: "#269b27" }}>
                      Massar
                    </span>
                  </div>

                  <div
                    style={{
                      color: "#123579",
                      fontSize: "13px",
                      fontWeight: 700,
                    }}
                  >
                    pour l’Éducation et le Développement
                  </div>
                </div>
              </a>

              {/* MENU */}
              <nav
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  flexWrap: "wrap",
                  flex: 1,
                }}
              >
                {[
                  { label: "⌂ Accueil", href: "/" },
                  { label: "Niveaux ⌄", href: "/#niveaux" },
                  { label: "Cours", href: "/#niveaux" },
                  { label: "Exercices", href: "/#niveaux" },
                  { label: "Examens", href: "/#niveaux" },
                ].map((item) => (
                  <a
                    key={item.label}
                    href={item.href}
                    style={{
                      color: "#123579",
                      fontWeight: 800,
                      fontSize: "16px",
                      padding: "12px 15px",
                      borderRadius: "12px",
                      textDecoration: "none",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {item.label}
                  </a>
                ))}
              </nav>

              {/* SE CONNECTER */}
              <a
                href="/admin"
                style={{
                  background: "#0750ad",
                  color: "#ffffff",
                  padding: "15px 28px",
                  borderRadius: "35px",
                  fontSize: "16px",
                  fontWeight: 800,
                  textDecoration: "none",
                  whiteSpace: "nowrap",
                  boxShadow:
                    "0 4px 12px rgba(7,80,173,0.18)",
                }}
              >
                👤 Se connecter
              </a>
            </div>
          </header>

          {/* CONTENU */}
          {children}

          {/* FOOTER */}
          <footer
            style={{
              background: "#123579",
              color: "#ffffff",
              padding: "35px 5%",
              marginTop: "30px",
            }}
          >
            <div
              style={{
                maxWidth: "1500px",
                margin: "auto",
              }}
            >
              <div
                style={{
                  fontSize: "20px",
                  fontWeight: 900,
                  marginBottom: "10px",
                }}
              >
                Association Massar pour l’Éducation et le
                Développement
              </div>

              <p
                style={{
                  color: "#dbe5ff",
                  margin: "8px 0 18px",
                }}
              >
                Ensemble pour une éducation de qualité et un
                avenir meilleur.
              </p>

              <div
                style={{
                  display: "flex",
                  gap: "20px",
                }}
              >
                <a
                  href="https://www.tiktok.com/@massar.dev26"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    color: "white",
                    fontWeight: 700,
                  }}
                >
                  TikTok
                </a>

                <a
                  href="https://www.instagram.com/massar_dev/"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    color: "white",
                    fontWeight: 700,
                  }}
                >
                  Instagram
                </a>
              </div>
            </div>
          </footer>

          {/* WHATSAPP */}
          <a
            className="wa"
            href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            💬 WhatsApp
          </a>
        </div>
      </body>
    </html>
  );
}

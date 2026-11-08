
export const metadata = {
  title: "Contact | Association Massar",
  description: "Contactez l'Association Massar.",
};

export default function ContactPage() {
  return (
    <main style={{ maxWidth: 900, margin: "auto", padding: "40px 20px", color: "#123579" }}>
      <h1>Contactez-nous</h1>

      <p>
        Vous avez une question ou une suggestion concernant
        nos ressources éducatives ? Nous sommes à votre écoute.
      </p>

      <h2>Nos réseaux sociaux</h2>

      <p>
        TikTok :
        <a href="https://www.tiktok.com/@massar.dev26">
          {" "} @massar.dev26
        </a>
      </p>

      <p>
        Instagram :
        <a href="https://www.instagram.com/massar_dev/">
          {" "} @massar_dev
        </a>
      </p>

      <p>
        WhatsApp :
        <a href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP}`}>
          {" "} Nous contacter
        </a>
      </p>
    </main>
  );
}

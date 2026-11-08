
export const metadata = {
  title: "Politique de confidentialité | Association Massar",
  description: "Politique de confidentialité de Massar Education.",
};

export default function PolitiquePage() {
  return (
    <main style={{ maxWidth: 900, margin: "auto", padding: "40px 20px", color: "#123579" }}>
      <h1>Politique de confidentialité</h1>

      <p>
        Dernière mise à jour : novembre 2026
      </p>

      <h2>1. Introduction</h2>
      <p>
        Massar Education respecte la confidentialité des
        visiteurs de son site et s'engage à protéger leurs
        informations personnelles.
      </p>

      <h2>2. Données collectées</h2>
      <p>
        Certaines données techniques, telles que le navigateur,
        les pages consultées et les statistiques de visite,
        peuvent être collectées afin d'améliorer le fonctionnement
        du site.
      </p>

      <h2>3. Cookies</h2>
      <p>
        Notre site peut utiliser des cookies pour assurer son
        fonctionnement, mesurer son audience et améliorer
        l'expérience des visiteurs.
      </p>

      <h2>4. Google AdSense</h2>
      <p>
        Notre site peut utiliser Google AdSense pour afficher
        des annonces publicitaires.
      </p>

      <p>
        Google et ses partenaires peuvent utiliser des cookies
        ou des technologies similaires pour diffuser des annonces,
        mesurer leur performance et, selon les paramètres de
        consentement applicables, proposer des annonces
        personnalisées.
      </p>

      <p>
        Pour en savoir plus :
        <a
          href="https://policies.google.com/technologies/ads"
          target="_blank"
          rel="noopener noreferrer"
        >
          {" "} Technologies publicitaires de Google
        </a>
      </p>

      <h2>5. Protection des données</h2>
      <p>
        Nous prenons des mesures raisonnables pour protéger
        les informations collectées contre tout accès non autorisé.
      </p>

      <h2>6. Contact</h2>
      <p>
        Pour toute question concernant cette politique,
        veuillez nous contacter via nos réseaux sociaux.
      </p>

      <h2>7. Modifications</h2>
      <p>
        Cette politique peut être mise à jour afin de refléter
        les évolutions de notre site ou des obligations légales.
      </p>
    </main>
  );
}

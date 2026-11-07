export default function Ad({ ad }: { ad: any }) {
  if (!ad) return null;
  return ad.code
    ? <iframe srcDoc={ad.code} style={{ width: "100%", height: 120, border: 0 }} title="Publicité" />
    : <div className="ad">Espace publicitaire</div>;
}

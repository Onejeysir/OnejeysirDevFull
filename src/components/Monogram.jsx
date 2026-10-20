// Monogramme ONEJEYSIR : un seul trait qui se lit à la fois "1" (ONE) et "J" (JEYSIR).
// Le carré jaune est le "pixel" : le point de départ de chaque projet.
export function Monogram({ title = "Monogramme ONEJEYSIR", stroke = "currentColor", accent = "#f2e313", ...props }) {
  return (
    <svg viewBox="0 0 100 100" role="img" aria-label={title} {...props}>
      <path d="M30 26 L59 12 L59 64 A19 19 0 0 1 21 64 L21 56" fill="none" stroke={stroke} strokeWidth="13" strokeLinejoin="miter" strokeMiterlimit="4" />
      <rect x="70" y="6" width="13" height="13" fill={accent} />
    </svg>
  );
}

export function MonogramPoster() {
  // Version de remplacement quand la 3D est indisponible : métal suggéré par dégradé.
  return (
    <svg viewBox="0 0 100 100" aria-hidden="true">
      <defs>
        <linearGradient id="mp-metal" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f4f2ea" />
          <stop offset="0.45" stopColor="#8f8d84" />
          <stop offset="0.7" stopColor="#d9d6cc" />
          <stop offset="1" stopColor="#5d5c55" />
        </linearGradient>
      </defs>
      <path d="M30 26 L59 12 L59 64 A19 19 0 0 1 21 64 L21 56" fill="none" stroke="url(#mp-metal)" strokeWidth="13" strokeLinejoin="miter" />
      <rect x="70" y="6" width="13" height="13" fill="#f2e313" />
    </svg>
  );
}

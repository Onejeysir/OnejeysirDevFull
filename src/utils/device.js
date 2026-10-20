// Détecte WebGL et choisit un niveau de qualité 3D.
export function hasWebGL() {
  try {
    const c = document.createElement("canvas");
    return !!(window.WebGLRenderingContext && (c.getContext("webgl2") || c.getContext("webgl")));
  } catch {
    return false;
  }
}

export function pickQuality() {
  if (typeof window === "undefined" || !hasWebGL()) return "off";
  const params = new URLSearchParams(window.location.search);
  if (params.get("3d") === "off") return "off";
  const cores = navigator.hardwareConcurrency || 4;
  const mem = navigator.deviceMemory || 4;
  const saveData = navigator.connection && navigator.connection.saveData;
  if (cores <= 2 || mem <= 2 || saveData) return "off";
  const coarse = window.matchMedia("(pointer: coarse)").matches;
  const small = window.innerWidth < 768;
  return coarse || small || cores < 6 ? "low" : "high";
}

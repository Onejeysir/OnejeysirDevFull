import { useEffect, useRef, useState } from "react";
import { useFinePointer, useReducedMotion } from "../hooks/useMedia.js";

// Anneau discret qui accompagne le curseur natif (jamais caché) et grossit sur les éléments interactifs.
export function Cursor() {
  const fine = useFinePointer();
  const reduced = useReducedMotion();
  const ref = useRef(null);
  const [on, setOn] = useState(false);
  const [hot, setHot] = useState(false);
  useEffect(() => {
    if (!fine || reduced) return;
    let x = -100, y = -100, cx = x, cy = y, raf;
    const move = (e) => {
      x = e.clientX;
      y = e.clientY;
      setOn(true);
      setHot(!!e.target.closest?.("a, button, select, input, textarea, [role=button], .visual"));
    };
    const leave = () => setOn(false);
    const loop = () => {
      cx += (x - cx) * 0.2;
      cy += (y - cy) * 0.2;
      if (ref.current) ref.current.style.transform = `translate3d(${cx}px, ${cy}px, 0)`;
      raf = requestAnimationFrame(loop);
    };
    window.addEventListener("pointermove", move, { passive: true });
    document.documentElement.addEventListener("pointerleave", leave);
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", move);
      document.documentElement.removeEventListener("pointerleave", leave);
    };
  }, [fine, reduced]);
  if (!fine || reduced) return null;
  return <div ref={ref} className={`cursor ${on ? "on" : ""} ${hot ? "hot" : ""}`} aria-hidden="true" />;
}

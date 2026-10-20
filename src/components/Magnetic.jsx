import { useRef } from "react";
import { useFinePointer, useReducedMotion } from "../hooks/useMedia.js";

// Effet magnétique léger : la cible suit le pointeur de quelques pixels (souris uniquement).
export function Magnetic({ children, strength = 0.25 }) {
  const ref = useRef(null);
  const fine = useFinePointer();
  const reduced = useReducedMotion();
  const on = fine && !reduced;
  const move = (e) => {
    const el = ref.current;
    if (!on || !el) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - (r.left + r.width / 2)) * strength;
    const y = (e.clientY - (r.top + r.height / 2)) * strength;
    el.style.transform = `translate(${x}px, ${y}px)`;
  };
  const leave = () => ref.current && (ref.current.style.transform = "");
  return (
    <span ref={ref} onPointerMove={move} onPointerLeave={leave} style={{ display: "inline-flex", transition: "transform 400ms var(--ease-out)" }}>
      {children}
    </span>
  );
}

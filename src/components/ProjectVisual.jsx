import { useRef } from "react";
import { Monogram } from "./Monogram.jsx";
import { useFinePointer, useReducedMotion } from "../hooks/useMedia.js";

// Compositions illustratives en CSS (légères, sans WebGL). À remplacer par project.screenshots[0] quand disponible.
function Tech() {
  return (
    <div className="vt">
      <div className="vt-search"><i /><b /></div>
      <div className="vt-cards">
        {[0, 1, 2].map((i) => (
          <div key={i} className={`vt-card ${i === 1 ? "on" : ""}`}><i /><div><s /><s /></div></div>
        ))}
      </div>
      <div className="vt-map">
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><path d="M10 80 C 30 60, 40 70, 55 45 S 80 30, 92 12" fill="none" stroke="#3b3c31" strokeWidth="2" strokeDasharray="4 4" /></svg>
        <span className="vt-pin" style={{ left: "48%", top: "34%" }} />
        <span className="vt-pin" style={{ left: "18%", top: "64%", background: "#eeebe1", boxShadow: "none" }} />
      </div>
    </div>
  );
}
function Edu() {
  return (
    <div className="ve">
      <div className="ve-side"><div className="on" /><div /><div /><div /></div>
      <div className="ve-q">
        <s /><s />
        {["A", "B", "C"].map((l) => <div key={l} className={`ve-opt ${l === "B" ? "on" : ""}`}>{l}</div>)}
        <div className="ve-prog"><i /></div>
      </div>
    </div>
  );
}
function Folio() {
  return <div className="vf"><Monogram aria-hidden="true" title="" stroke="#d4d1c6" /><b>ONEJEYSIR</b></div>;
}

export function ProjectVisual({ project }) {
  const ref = useRef(null);
  const fine = useFinePointer();
  const reduced = useReducedMotion();
  const tilt = fine && !reduced;
  const move = (e) => {
    if (!tilt) return;
    const r = ref.current.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    ref.current.style.setProperty("--ry", `${x * 10}deg`);
    ref.current.style.setProperty("--rx", `${-y * 8}deg`);
  };
  const leave = () => {
    ref.current.style.setProperty("--ry", "0deg");
    ref.current.style.setProperty("--rx", "0deg");
  };
  const shot = project.screenshots?.[0];
  const Body = { tech: Tech, edu: Edu, folio: Folio }[project.visual] ?? Folio;
  return (
    <figure className="visual" ref={ref} onPointerMove={move} onPointerLeave={leave} style={{ margin: 0 }}>
      <div className="visual-inner">
        <div className="v-bar" aria-hidden="true"><i /><i /><i /><span /></div>
        <div className="v-body">
          {shot ? <img src={shot} alt={`Capture d'écran de ${project.name}`} loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 10 }} /> : <Body />}
        </div>
      </div>
      <figcaption>{shot ? `Capture · ${project.name}` : project.visual === "folio" ? "Ce site que tu explores" : "Composition illustrative · capture réelle à venir"}</figcaption>
    </figure>
  );
}

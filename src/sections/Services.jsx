import { ArrowRight, Code2, FileText, Globe, Image, LayoutTemplate, Puzzle, Wrench } from "lucide-react";
import { services } from "../data/services.js";
import { Reveal } from "../components/Reveal.jsx";

const icons = { layout: LayoutTemplate, globe: Globe, code: Code2, puzzle: Puzzle, wrench: Wrench, file: FileText, image: Image };

export function Services({ onPick }) {
  return (
    <section id="services" className="section on-light" aria-labelledby="services-title">
      <div className="wrap">
        <Reveal><p className="eyebrow">Services</p></Reveal>
        <Reveal i={1}><h2 id="services-title" className="display h2" style={{ marginTop: 18 }}>Ce que je<br />peux construire</h2></Reveal>
        <div className="svc-grid">
          {services.map((s, i) => {
            const Icon = icons[s.icon];
            return (
              <Reveal key={s.title} i={i % 4} className={`svc ${i === 1 ? "lead" : ""}`}>
                <span className="ic" aria-hidden="true"><Icon size={24} /></span>
                <h3>{s.title}</h3>
                <p>{s.text}</p>
                <a href="#contact" onClick={() => onPick?.(s.title)}>En parler <ArrowRight size={16} aria-hidden="true" /></a>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

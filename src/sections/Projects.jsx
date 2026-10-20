import { useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { categories, projects } from "../data/projects.js";
import { Reveal } from "../components/Reveal.jsx";
import { ProjectVisual } from "../components/ProjectVisual.jsx";
import { ProjectSheet } from "../components/ProjectSheet.jsx";

export function Projects() {
  const [filter, setFilter] = useState("Tous");
  const [open, setOpen] = useState(null);
  const list = projects.filter((p) => filter === "Tous" || p.category === filter);
  return (
    <section id="projets" className="section" aria-labelledby="projects-title">
      <div className="wrap">
        <div className="proj-head">
          <div>
            <Reveal><p className="eyebrow">Projets</p></Reveal>
            <Reveal i={1}><h2 id="projects-title" className="display h2" style={{ marginTop: 18 }}>Réalisations</h2></Reveal>
          </div>
          <div className="filters" role="group" aria-label="Filtrer les projets">
            {categories.map((c) => (
              <button key={c} className="chip" aria-pressed={filter === c} onClick={() => setFilter(c)}>{c}</button>
            ))}
          </div>
        </div>
        <p className="sr-only" aria-live="polite">{list.length} projet(s) affiché(s)</p>
        <div className="proj-list">
          {list.map((p, i) => (
            <article key={p.slug} className={`proj ${i % 2 ? "flip" : ""}`} aria-labelledby={`p-${p.slug}`}>
              <Reveal><ProjectVisual project={p} /></Reveal>
              <div>
                <Reveal className="proj-meta">
                  <span>{p.category}</span>
                  {p.status && <span className="st">{p.status}</span>}
                </Reveal>
                <Reveal i={1}><h3 id={`p-${p.slug}`} className="display">{p.name}</h3></Reveal>
                <Reveal i={2}><p>{p.tagline}</p></Reveal>
                <Reveal i={3} className="tech" aria-label="Technologies">
                  {p.tech.length ? p.tech.map((t) => <span key={t} className="chip">{t}</span>) : <span className="chip todo">Technologies à préciser</span>}
                </Reveal>
                <Reveal i={4}>
                  <button className="btn ghost" onClick={() => setOpen(p)} aria-haspopup="dialog">Voir la fiche <ArrowUpRight size={18} aria-hidden="true" /></button>
                </Reveal>
              </div>
            </article>
          ))}
          <Reveal className="next-slot">
            <b>Prochain projet</b>
            <span>Les nouveaux projets personnels et académiques s'ajouteront ici.</span>
          </Reveal>
        </div>
      </div>
      <ProjectSheet project={open} onClose={() => setOpen(null)} />
    </section>
  );
}

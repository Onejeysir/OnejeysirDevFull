import { useEffect, useRef } from "react";
import { X, ExternalLink } from "lucide-react";
import { GithubIcon } from "./GithubIcon.jsx";

const Block = ({ title, items, text }) => {
  const has = text ? true : items && items.length > 0;
  return (
    <div>
      <h3>{title}</h3>
      {!has ? <p className="todo">À documenter</p> : text ? <p>{text}</p> : <ul>{items.map((x) => <li key={x}>{x}</li>)}</ul>}
    </div>
  );
};

// Fiche détaillée dans un <dialog> natif : piège du focus, touche Échap et fond inerte inclus.
export function ProjectSheet({ project, onClose }) {
  const ref = useRef(null);
  useEffect(() => {
    const d = ref.current;
    if (project && d && !d.open) d.showModal?.();
    if (!project && d?.open) d.close();
  }, [project]);
  return (
    <dialog ref={ref} className="sheet" aria-labelledby="sheet-title" onClose={onClose} onClick={(e) => e.target === ref.current && onClose()}>
      {project && (
        <div className="sheet-scroll">
          <div className="sheet-top">
            <p className="eyebrow">{project.category}{project.status ? ` · ${project.status}` : ""}</p>
            <button className="close" onClick={onClose} aria-label="Fermer la fiche"><X size={20} aria-hidden="true" /></button>
          </div>
          <h2 id="sheet-title" className="display">{project.name}</h2>
          <p style={{ color: "var(--bone)", fontSize: 19, maxWidth: "52ch" }}>{project.tagline}</p>
          <div className="sheet-grid">
            <Block title="Problème ciblé" text={project.problem} />
            <Block title="Solution" text={project.solution} />
            <Block title="Utilisateurs" items={project.users} />
            <Block title="Objectifs" items={project.objectives} />
            <Block title="Fonctionnalités réalisées" items={project.features} />
            <Block title="Technologies" items={project.tech} />
            <Block title="Choix techniques" items={project.choices} />
            <Block title="Difficultés rencontrées" items={project.challenges} />
            <Block title="Améliorations envisagées" items={project.next} />
            <Block title="Captures d'écran" items={project.screenshots?.length ? [`${project.screenshots.length} capture(s)`] : []} />
          </div>
          {(project.demo || project.repo) && (
            <div className="sheet-links">
              {project.demo && <a className="btn" href={project.demo} target="_blank" rel="noopener noreferrer">Démonstration <ExternalLink size={16} aria-hidden="true" /></a>}
              {project.repo && <a className="btn ghost" href={project.repo} target="_blank" rel="noopener noreferrer"><GithubIcon size={16} /> Code source</a>}
            </div>
          )}
        </div>
      )}
    </dialog>
  );
}

import { skillGroups, isUsedInProject } from "../data/skills.js";
import { Reveal } from "../components/Reveal.jsx";

export function Skills() {
  return (
    <section id="competences" className="section skills" aria-labelledby="skills-title">
      <div className="wrap">
        <Reveal><p className="eyebrow">Compétences</p></Reveal>
        <Reveal i={1}><h2 id="skills-title" className="display h2" style={{ marginTop: 18 }}>Boîte à outils</h2></Reveal>
        <Reveal i={2} className="legend">
          <span><i className="dot used" aria-hidden="true" /> Utilisé dans un projet présenté ici</span>
          <span><i className="dot" aria-hidden="true" /> Formation et apprentissage</span>
        </Reveal>
        <div className="sk-groups">
          {skillGroups.map((g, gi) => (
            <Reveal key={g.id} i={gi} className={`sk ${g.id}`}>
              <h3>{g.title}</h3>
              <ul>
                {g.items.map((s) => {
                  const used = isUsedInProject(s);
                  return (
                    <li key={s} className="chip">
                      {!g.tools && <i className={`dot ${used ? "used" : ""}`} aria-hidden="true" />}
                      {s}
                      {!g.tools && <span className="sr-only">{used ? " (utilisé en projet)" : " (formation et apprentissage)"}</span>}
                    </li>
                  );
                })}
              </ul>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

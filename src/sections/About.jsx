import { profile } from "../data/profile.js";
import { Reveal } from "../components/Reveal.jsx";

export function About() {
  return (
    <section id="a-propos" className="section on-light about" aria-labelledby="about-title">
      <div className="wrap about-grid">
        <div className="about-head">
          <Reveal><p className="eyebrow">À propos</p></Reveal>
          <Reveal i={1}>
            <h2 id="about-title" className="display" style={{ marginTop: 18 }}>
              Logique,<br />créativité, <em>code.</em>
            </h2>
          </Reveal>
        </div>
        <div className="about-text">
          <Reveal i={1}>
            <p>Je suis {profile.name}, étudiant en Génie logiciel au Cameroun. J'apprends le développement Full-Stack en construisant de vrais projets.</p>
          </Reveal>
          <Reveal i={2}>
            <p className="small">Après un BTS en Génie logiciel, je poursuis en niveau 3 à l'ENSPD. Chaque projet personnel ou académique est pour moi une occasion de mieux comprendre un besoin, de structurer une solution et de soigner l'expérience de ceux qui l'utilisent.</p>
          </Reveal>
          <Reveal i={3} className="interests" aria-label="Centres d'intérêt">
            {profile.interests.map((t) => <span key={t} className="chip">{t}</span>)}
          </Reveal>
        </div>
        <div>
          <Reveal className="cube-wrap" aria-hidden="true"><div className="cube"><i /><i /><i /><i /><i /><i /></div></Reveal>
          <ol className="path" aria-label="Parcours">
            {profile.path.map((s, i) => (
              <Reveal as="li" i={i} key={s.label} className={s.state !== "Obtenu" ? "now" : ""}>
                <b>{s.label}</b>
                <span>{s.place}</span><br />
                <small>{s.state}</small>
              </Reveal>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

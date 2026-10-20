import { ArrowUp } from "lucide-react";
import { nav, profile } from "../data/profile.js";
import { Monogram } from "../components/Monogram.jsx";
import { GithubIcon } from "../components/GithubIcon.jsx";

export function Footer() {
  const year = new Date().getFullYear();
  const toTop = () => {
    window.scrollTo({ top: 0, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
    document.querySelector(".brand")?.focus({ preventScroll: true });
  };
  return (
    <footer className="footer">
      <div className="wrap">
        <div className="footer-top">
          <div>
            <Monogram title="Monogramme ONEJEYSIR" stroke="#eeebe1" style={{ width: 64, height: 64 }} />
            <p style={{ margin: "18px 0 0", color: "var(--muted)", maxWidth: "30ch" }}>{profile.name}. Développeur Full-Stack en formation, {profile.location}.</p>
          </div>
          <nav aria-label="Navigation du pied de page">
            <ul>{nav.map((n) => <li key={n.id}><a href={`#${n.id}`}>{n.label}</a></li>)}</ul>
          </nav>
          <div className="links">
            {profile.socials.map((s) => (
              <a key={s.href} href={s.href} target="_blank" rel="noopener noreferrer"><GithubIcon size={18} /> {s.label} · {s.handle}</a>
            ))}
          </div>
        </div>
        <p className="display footer-mark" aria-hidden="true">ONEJEYSIR<span>.</span></p>
        <div className="footer-bottom">
          <span>© {year} {profile.name} · {profile.brand}</span>
          <button className="top-btn" onClick={toTop}>Retour en haut <ArrowUp size={16} aria-hidden="true" /></button>
        </div>
      </div>
    </footer>
  );
}

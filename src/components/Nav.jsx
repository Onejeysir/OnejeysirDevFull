import { useEffect, useRef, useState } from "react";
import { nav, profile } from "../data/profile.js";
import { useActiveSection } from "../hooks/useActiveSection.js";
import { Monogram } from "./Monogram.jsx";

const ids = nav.map((n) => n.id);

export function Nav() {
  const active = useActiveSection(ids);
  const [open, setOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const bar = useRef(null);
  const menuRef = useRef(null);
  const burgerRef = useRef(null);

  useEffect(() => {
    let last = window.scrollY, ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const y = window.scrollY;
        const max = document.documentElement.scrollHeight - window.innerHeight;
        bar.current?.style.setProperty("--p", max > 0 ? (y / max).toFixed(4) : 0);
        setHidden(y > 400 && y > last + 4);
        if (y < last - 4) setHidden(false);
        last = y;
        ticking = false;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    menuRef.current?.querySelector("a")?.focus();
    const onKey = (e) => {
      if (e.key === "Escape") {
        setOpen(false);
        burgerRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const link = (n) => ({ href: `#${n.id}`, "aria-current": active === n.id ? "true" : undefined, onClick: () => setOpen(false) });

  return (
    <>
      <div className="progress" ref={bar} aria-hidden="true"><span /></div>
      <header className={`nav ${hidden && !open ? "hide" : ""}`}>
        <a className="brand" href="#accueil" aria-label={`${profile.brand}, retour à l'accueil`}>
          <Monogram title="" aria-hidden="true" stroke="#eeebe1" />
          {profile.brand}
        </a>
        <nav aria-label="Navigation principale">
          <ul>
            {nav.slice(0, -1).map((n) => (
              <li key={n.id}><a {...link(n)}>{n.label}</a></li>
            ))}
          </ul>
        </nav>
        <a className="btn cta" href="#contact">Contact</a>
        <button ref={burgerRef} className="burger" aria-expanded={open} aria-controls="menu-mobile" aria-label={open ? "Fermer le menu" : "Ouvrir le menu"} onClick={() => setOpen((o) => !o)}>
          <div><span /><span /></div>
        </button>
      </header>
      <div id="menu-mobile" ref={menuRef} className={`menu ${open ? "open" : ""}`} aria-hidden={!open} inert={open ? undefined : ""}>
        <nav aria-label="Navigation mobile">
          <ol>
            {nav.map((n) => (
              <li key={n.id}><a {...link(n)} tabIndex={open ? 0 : -1}>{n.label}</a></li>
            ))}
          </ol>
        </nav>
        <p className="foot">{profile.name} · {profile.location}</p>
      </div>
    </>
  );
}

import { Component, Fragment, Suspense, lazy, useEffect, useRef, useState } from "react";
import { ArrowRight, ArrowDown } from "lucide-react";
import { profile } from "../data/profile.js";
import { MonogramPoster } from "../components/Monogram.jsx";
import { Magnetic } from "../components/Magnetic.jsx";
import { useFinePointer, useReducedMotion } from "../hooks/useMedia.js";
import { pickQuality } from "../utils/device.js";

// La scène 3D est chargée à part : le texte s'affiche avant elle.
const HeroScene = lazy(() => import("../scenes/HeroScene.jsx"));

class GLBoundary extends Component {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch() { this.props.onFail?.(); }
  render() { return this.state.failed ? null : this.props.children; }
}

export function Hero() {
  const reduced = useReducedMotion();
  const fine = useFinePointer();
  const [quality, setQuality] = useState("pending");
  const [ready, setReady] = useState(false);
  const [visible, setVisible] = useState(true);
  const ref = useRef(null);

  useEffect(() => setQuality(pickQuality()), []);

  // Met la scène en pause quand le hero sort de l'écran ou que l'onglet est masqué.
  useEffect(() => {
    const el = ref.current;
    let inView = true;
    const update = () => setVisible(inView && !document.hidden);
    const io = new IntersectionObserver(([e]) => { inView = e.isIntersecting; update(); });
    io.observe(el);
    document.addEventListener("visibilitychange", update);
    return () => { io.disconnect(); document.removeEventListener("visibilitychange", update); };
  }, []);

  let wi = 0;
  const words = (txt, cls) => txt.split(" ").map((w) => (
    <Fragment key={wi}><span className="w"><span className={cls} style={{ "--i": wi++ }}>{w}</span></span>{" "}</Fragment>
  ));

  return (
    <section id="accueil" className="hero" ref={ref} aria-labelledby="hero-title">
      <div className="hero-grid" aria-hidden="true" />
      <div className={`hero-stage ${ready ? "ready" : ""}`} data-quality={quality}>
        <div className="hero-poster" aria-hidden="true"><MonogramPoster /></div>
        {quality !== "off" && quality !== "pending" && (
          <GLBoundary onFail={() => setQuality("off")}>
            <Suspense fallback={null}>
              <HeroScene quality={quality} reduced={reduced} interactive={fine && !reduced} active={visible} onReady={() => setReady(true)} />
            </Suspense>
          </GLBoundary>
        )}
      </div>
      <p className="display wordmark-band" aria-hidden="true">{profile.brand}</p>

      <div className="wrap hero-copy">
        <p className="hero-id"><strong>{profile.name}</strong><span aria-hidden="true">/</span><span>{profile.brand}</span></p>
        <h1 id="hero-title" className="display">
          {words(profile.headline[0])}
          {words(profile.headline[1], "hl")}
          {words(profile.headline[2])}
        </h1>
        <p className="role"><span className="bar" aria-hidden="true" />{profile.role}</p>
        <p className="lede">{profile.intro}</p>
        <div className="hero-ctas">
          <Magnetic><a className="btn" href="#projets">Explorer mes projets <ArrowRight size={18} aria-hidden="true" /></a></Magnetic>
          <Magnetic><a className="btn ghost" href="#contact">Parlons de ton projet</a></Magnetic>
        </div>
      </div>
      <a className="scroll-cue" href="#a-propos" aria-label="Défiler vers la section À propos"><i aria-hidden="true" />Défiler</a>
    </section>
  );
}

import { useEffect, useRef, useState } from "react";
import { processSteps } from "../data/services.js";
import { Reveal } from "../components/Reveal.jsx";

export function Process() {
  const ref = useRef(null);
  const [on, setOn] = useState(0);
  useEffect(() => {
    const steps = [...ref.current.querySelectorAll(".step")];
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setOn((n) => Math.max(n, steps.indexOf(e.target) + 1))),
      { rootMargin: "0px 0px -30% 0px" }
    );
    steps.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, []);
  return (
    <section id="processus" className="section" aria-labelledby="process-title">
      <div className="wrap">
        <Reveal><p className="eyebrow">Processus</p></Reveal>
        <Reveal i={1}><h2 id="process-title" className="display h2" style={{ marginTop: 18 }}>Du concept<br />au produit</h2></Reveal>
        <div className="steps" ref={ref} style={{ "--f": on / processSteps.length }}>
          <span className="fill" aria-hidden="true" />
          <ol className="steps-list">
          {processSteps.map((s, i) => (
            <li key={s.title} className={`step ${i < on ? "on" : ""}`}>
              <span className="n" aria-hidden="true">{String(i + 1).padStart(2, "0")}</span>
              <h3><span className="sr-only">Étape {i + 1} : </span>{s.title}</h3>
              <p>{s.text}</p>
            </li>
          ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

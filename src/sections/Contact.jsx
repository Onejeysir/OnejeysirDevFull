import { ContactForm } from "../components/ContactForm.jsx";
import { Reveal } from "../components/Reveal.jsx";

export function Contact({ endpoint, presetType }) {
  return (
    <section id="contact" className="section on-volt contact" aria-labelledby="contact-title">
      <div className="wrap contact-grid">
        <div className="contact-copy">
          <Reveal><p className="eyebrow">Contact</p></Reveal>
          <Reveal i={1}><h2 id="contact-title" className="display" style={{ marginTop: 18 }}>Une idée en tête ? Construisons-la ensemble.</h2></Reveal>
          <Reveal i={2}><p className="lede" style={{ marginTop: 24 }}>Tu as un projet, une question ou une proposition de collaboration ? Présente-moi ton besoin et je te répondrai dès que possible.</p></Reveal>
        </div>
        <Reveal i={1}><ContactForm endpoint={endpoint} presetType={presetType} /></Reveal>
      </div>
    </section>
  );
}

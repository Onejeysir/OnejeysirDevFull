import { useState } from "react";
import "./styles/global.css";
import { Nav } from "./components/Nav.jsx";
import { Cursor } from "./components/Cursor.jsx";
import { Hero } from "./sections/Hero.jsx";
import { About } from "./sections/About.jsx";
import { Projects } from "./sections/Projects.jsx";
import { Skills } from "./sections/Skills.jsx";
import { Services } from "./sections/Services.jsx";
import { Process } from "./sections/Process.jsx";
import { Contact } from "./sections/Contact.jsx";
import { Footer } from "./sections/Footer.jsx";

const serviceToType = {
  "Sites vitrines": "Site vitrine",
  "Développement de sites web": "Site web",
  "Intégration d'interfaces": "Intégration d'interface",
  "Fonctionnalités web": "Fonctionnalité web",
  "Amélioration de sites existants": "Amélioration d'un site",
  "CV professionnels": "CV professionnel",
  "Affiches et visuels": "Affiche ou visuel",
};

export default function Portfolio({ contactEndpoint = "/api/contact" }) {
  const [preset, setPreset] = useState();
  return (
    <>
      <a className="skip" href="#contenu">Aller au contenu</a>
      <Cursor />
      <Nav />
      <main id="contenu">
        <Hero />
        <About />
        <Projects />
        <Skills />
        <Services onPick={(t) => setPreset(serviceToType[t])} />
        <Process />
        <Contact endpoint={contactEndpoint} presetType={preset} />
      </main>
      <Footer />
    </>
  );
}

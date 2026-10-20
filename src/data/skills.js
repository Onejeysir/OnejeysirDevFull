import { projects } from "./projects.js";

// "Utilisé en projet" est calculé automatiquement à partir de data/projects.js :
// rien n'est déclaré à la main, donc rien n'est exagéré.
const used = new Set(projects.flatMap((p) => p.tech.map((t) => t.toLowerCase())));
const alias = { html5: "html", css3: "css" };
export const isUsedInProject = (name) => used.has(alias[name.toLowerCase()] ?? name.toLowerCase());

export const skillGroups = [
  { id: "front", title: "Front-End", items: ["HTML5", "CSS3", "JavaScript", "React", "Tailwind CSS"] },
  { id: "back", title: "Back-End", items: ["PHP", "Laravel"] },
  { id: "data", title: "Bases de données", items: ["MySQL", "Modélisation relationnelle"] },
  { id: "prog", title: "Programmation", items: ["C", "Algorithmique"] },
  { id: "tools", title: "Outils", tools: true, items: ["Git", "GitHub", "Visual Studio Code", "Composer", "WampServer", "XAMPP", "phpMyAdmin"] },
];

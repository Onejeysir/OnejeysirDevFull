// Ajouter un projet = ajouter un objet à ce tableau.
// Règles : laisser un tableau vide [] ou null quand l'info n'est pas encore confirmée.
// Les blocs vides s'affichent "À documenter" et les liens null sont masqués.
export const projects = [
  {
    slug: "onejeysirtech",
    name: "ONEJEYSIRTECH",
    category: "Plateforme web",
    visual: "tech",
    tagline: "Plateforme de mise en relation entre clients et techniciens spécialisés.",
    status: null, // ex: "En ligne", "En développement", "Prototype"
    tech: ["HTML", "CSS", "JavaScript", "PHP", "MySQL"],
    problem: "Trouver rapidement le bon technicien pour un besoin précis n'est pas toujours simple pour un client.",
    solution: "Une plateforme web qui rassemble clients et techniciens spécialisés au même endroit pour faciliter la mise en relation.",
    users: ["Clients à la recherche d'un technicien", "Techniciens spécialisés"],
    objectives: [],
    features: [], // À compléter : uniquement les fonctionnalités réellement développées
    choices: ["Logique serveur en PHP", "Données relationnelles stockées dans MySQL", "Interface en HTML, CSS et JavaScript"],
    challenges: [],
    next: [],
    screenshots: [], // ex: ["/images/onejeysirtech-1.webp"]
    demo: null,
    repo: null,
  },
  {
    slug: "onejeysiredu237",
    name: "ONEJEYSIREDU237",
    category: "EdTech",
    visual: "edu",
    tagline: "Projet EdTech pour accompagner les apprenants dans leurs révisions et leur préparation aux concours.",
    status: null,
    tech: [], // À compléter
    problem: null,
    solution: "Un espace numérique pensé pour structurer les révisions et la préparation aux concours.",
    users: ["Apprenants en période de révision", "Candidats aux concours"],
    objectives: [],
    features: [],
    choices: [],
    challenges: [],
    next: [],
    screenshots: [],
    demo: null,
    repo: null,
  },
  {
    slug: "portfolio",
    name: "PORTFOLIO ONEJEYSIR",
    category: "Creative dev",
    visual: "folio",
    tagline: "Ce site : un projet technique qui réunit design interactif, motion design, 3D web et responsive.",
    status: "En cours · v1",
    tech: ["React", "Three.js", "React Three Fiber", "Drei", "CSS", "Vercel Functions", "Resend"],
    problem: "Un CV ou une simple liste de liens ne montre ni la façon de concevoir, ni le soin apporté à l'expérience.",
    solution: "Un univers 3D procédural autour de la marque ONEJEYSIR, rapide sur mobile et lisible sans 3D.",
    users: ["Recruteurs et écoles", "Clients potentiels", "Développeurs curieux"],
    objectives: ["Présenter les projets comme des produits", "Rester fluide sur un smartphone milieu de gamme", "Recevoir de vraies demandes de contact"],
    features: [
      "Monogramme 1J modélisé en code (aucun modèle 3D à télécharger)",
      "Qualité de rendu adaptée à l'appareil, repli statique sans WebGL",
      "Respect de prefers-reduced-motion",
      "Formulaire de contact avec validation client et serveur, honeypot et limitation de fréquence",
    ],
    choices: ["Géométries procédurales plutôt que fichiers GLB", "Animations CSS pour l'interface, useFrame pour la 3D", "Fonction serverless Vercel pour garder la clé API hors du navigateur"],
    challenges: ["Garder une scène riche sans pénaliser la batterie sur mobile"],
    next: ["Ajouter les captures réelles des projets", "Version anglaise"],
    screenshots: [],
    demo: null,
    repo: null,
  },
];

export const categories = ["Tous", ...new Set(projects.map((p) => p.category))];

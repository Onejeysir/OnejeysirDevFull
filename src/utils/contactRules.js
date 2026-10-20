// Règles partagées : le navigateur ET le serveur importent ce même fichier.
// Le serveur revalide toujours : la validation côté client n'est qu'un confort.
export const LIMITS = {
  name: [2, 80],
  email: [6, 254],
  subject: [3, 120],
  message: [20, 3000],
  company: [0, 120],
};

export const REQUEST_TYPES = [
  "Site vitrine",
  "Site web",
  "Intégration d'interface",
  "Fonctionnalité web",
  "Amélioration d'un site",
  "CV professionnel",
  "Affiche ou visuel",
  "Collaboration",
  "Autre",
];

export const BUDGETS = ["Non défini", "Moins de 100 000 FCFA", "100 000 à 300 000 FCFA", "Plus de 300 000 FCFA"];

export const MIN_FILL_MS = 3000; // un humain met plus de 3 s à remplir le formulaire

const EMAIL_RE = /^[^\s@<>()[\]\\,;:"]+@[^\s@<>()[\]\\,;:".]+(\.[^\s@<>()[\]\\,;:".]+)*\.[a-z]{2,}$/i;

// Supprime les caractères de contrôle. Les champs d'une ligne perdent aussi
// les retours à la ligne (protection contre l'injection d'en-têtes).
export function clean(value, { multiline = false } = {}) {
  if (typeof value !== "string") return "";
  let v = value.normalize("NFC");
  v = multiline ? v.replace(/\r\n?/g, "\n").replace(/[\x00-\x08\x0B-\x1F\x7F]/g, "") : v.replace(/[\x00-\x1F\x7F]+/g, " ");
  return v.trim();
}

export function validateContact(input = {}) {
  const data = {
    name: clean(input.name),
    email: clean(input.email).toLowerCase(),
    type: clean(input.type),
    subject: clean(input.subject),
    message: clean(input.message, { multiline: true }),
    company: clean(input.company),
    budget: clean(input.budget) || BUDGETS[0],
  };
  const errors = {};
  const len = (k) => [...data[k]].length;
  const range = (k, label) => {
    const [min, max] = LIMITS[k];
    if (len(k) < min) errors[k] = min <= 1 || !data[k] ? `${label} est obligatoire.` : `${label} : ${min} caractères minimum.`;
    else if (len(k) > max) errors[k] = `${label} : ${max} caractères maximum.`;
  };
  range("name", "Le nom");
  if (!data.email) errors.email = "L'adresse électronique est obligatoire.";
  else if (len("email") > LIMITS.email[1] || !EMAIL_RE.test(data.email)) errors.email = "Adresse électronique invalide.";
  if (!REQUEST_TYPES.includes(data.type)) errors.type = "Choisis un type de demande.";
  range("subject", "Le sujet");
  range("message", "Le message");
  if (len("company") > LIMITS.company[1]) errors.company = `Entreprise : ${LIMITS.company[1]} caractères maximum.`;
  if (!BUDGETS.includes(data.budget)) errors.budget = "Budget invalide.";
  return { ok: Object.keys(errors).length === 0, data, errors };
}

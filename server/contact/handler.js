import { MIN_FILL_MS, validateContact } from "../../src/utils/contactRules.js";
import { rateLimit } from "./rateLimit.js";
import { sendEmail } from "./sendEmail.js";

const MAX_BODY = 12_000; // octets

/**
 * Logique pure du point d'envoi, indépendante de l'hébergeur (testée dans tests/contact.test.mjs).
 * Retourne { status, body }. Le corps ne contient jamais l'adresse de réception.
 */
export async function handleContact({ method, headers = {}, body, ip = "unknown" }, deps = {}) {
  const env = deps.env ?? process.env;
  if (method !== "POST") return { status: 405, body: { ok: false, message: "Méthode non autorisée." } };

  const allowed = (env.ALLOWED_ORIGINS || "").split(",").map((s) => s.trim()).filter(Boolean);
  const origin = headers.origin;
  if (allowed.length && origin && !allowed.includes(origin)) return { status: 403, body: { ok: false, message: "Origine refusée." } };

  if (!String(headers["content-type"] || "").includes("application/json")) return { status: 415, body: { ok: false, message: "Format de requête invalide." } };

  let input = body;
  if (typeof input === "string") {
    if (input.length > MAX_BODY) return { status: 413, body: { ok: false, message: "Message trop volumineux." } };
    try { input = JSON.parse(input); } catch { return { status: 400, body: { ok: false, message: "Requête invalide." } }; }
  }
  if (!input || typeof input !== "object" || JSON.stringify(input).length > MAX_BODY) return { status: 400, body: { ok: false, message: "Requête invalide." } };

  // Anti-robots : champ piège rempli ou formulaire envoyé trop vite.
  if (input.website || Number(input.elapsedMs) < MIN_FILL_MS) return { status: 400, body: { ok: false, message: "Envoi refusé. Réessaie dans quelques secondes." } };

  const limit = await rateLimit(ip, { env, fetchImpl: deps.fetchImpl, limit: Number(env.CONTACT_RATE_LIMIT || 5) });
  if (!limit.ok) return { status: 429, body: { ok: false, message: "Trop de messages envoyés. Réessaie plus tard." } };

  const { ok, data, errors } = validateContact(input);
  if (!ok) return { status: 422, body: { ok: false, message: "Certains champs sont invalides.", errors } };

  const sent = await sendEmail(data, { env, fetchImpl: deps.fetchImpl });
  if (sent.ok) return { status: 200, body: { ok: true } };
  // Journal minimal : aucun contenu personnel.
  (deps.log ?? console.error)(`[contact] échec d'envoi: ${sent.reason}${sent.status ? ` (${sent.status})` : ""}`);
  if (sent.reason === "not_configured") return { status: 503, body: { ok: false, message: "Le service d'envoi n'est pas encore configuré." } };
  return { status: 502, body: { ok: false, message: "Le service d'envoi n'a pas accepté le message. Réessaie plus tard." } };
}

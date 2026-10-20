import { test, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { handleContact } from "../server/contact/handler.js";
import { _resetMemory } from "../server/contact/rateLimit.js";
import { buildEmail } from "../server/contact/sendEmail.js";
import { validateContact } from "../src/utils/contactRules.js";

const ENV = { RESEND_API_KEY: "test_key", CONTACT_TO_EMAIL: "owner@example.com", CONTACT_FROM_EMAIL: "Portfolio <contact@example.com>" };
const valid = { name: "Awa Ngono", email: "awa@example.com", type: "Site web", subject: "Site pour ma boutique", message: "Bonjour, j'aimerais un site pour présenter mes produits.", company: "", budget: "Non défini", website: "", elapsedMs: 9000 };
const req = (body, extra = {}) => ({ method: "POST", headers: { "content-type": "application/json" }, body, ip: extra.ip ?? `ip-${Math.random()}`, ...extra });
const okFetch = (calls) => async (url, init) => { calls?.push({ url, init }); return { ok: true, status: 200, json: async () => ({ id: "email_123" }) }; };
const silent = () => {};

beforeEach(() => _resetMemory());

test("soumission valide : envoi au destinataire configuré uniquement", async () => {
  const calls = [];
  const r = await handleContact(req({ ...valid, to: "pirate@evil.com" }), { env: ENV, fetchImpl: okFetch(calls) });
  assert.equal(r.status, 200);
  assert.deepEqual(r.body, { ok: true });
  const sent = JSON.parse(calls[0].init.body);
  assert.deepEqual(sent.to, ["owner@example.com"]);
  assert.equal(sent.reply_to, "awa@example.com");
  assert.ok(!JSON.stringify(r.body).includes("owner@example.com"));
});

test("champs manquants → 422 avec erreurs par champ", async () => {
  const r = await handleContact(req({ elapsedMs: 9000 }), { env: ENV, fetchImpl: okFetch() });
  assert.equal(r.status, 422);
  for (const k of ["name", "email", "type", "subject", "message"]) assert.ok(r.body.errors[k], k);
});

test("adresse électronique invalide", async () => {
  const r = await handleContact(req({ ...valid, email: "awa@@example" }), { env: ENV, fetchImpl: okFetch() });
  assert.equal(r.status, 422);
  assert.equal(r.body.errors.email, "Adresse électronique invalide.");
});

test("message trop long et trop court", async () => {
  assert.match(validateContact({ ...valid, message: "x".repeat(3001) }).errors.message, /3000/);
  assert.match(validateContact({ ...valid, message: "court" }).errors.message, /20/);
});

test("type de demande hors liste refusé", async () => {
  const r = await handleContact(req({ ...valid, type: "<script>" }), { env: ENV, fetchImpl: okFetch() });
  assert.equal(r.status, 422);
});

test("injection d'en-têtes neutralisée et HTML échappé", async () => {
  const { data } = validateContact({ ...valid, subject: "Salut\r\nBcc: victim@x.com", message: "<img src=x onerror=alert(1)> bonjour à tous ici" });
  assert.ok(!/[\r\n]/.test(data.subject));
  const mail = buildEmail(data);
  assert.ok(!mail.html.includes("<img"));
  assert.ok(mail.html.includes("&lt;img"));
  assert.ok(!/[\r\n]/.test(mail.subject));
});

test("honeypot rempli → refusé, aucun envoi", async () => {
  const calls = [];
  const r = await handleContact(req({ ...valid, website: "http://spam" }), { env: ENV, fetchImpl: okFetch(calls) });
  assert.equal(r.status, 400);
  assert.equal(calls.length, 0);
});

test("formulaire rempli trop vite → refusé", async () => {
  const r = await handleContact(req({ ...valid, elapsedMs: 300 }), { env: ENV, fetchImpl: okFetch() });
  assert.equal(r.status, 400);
});

test("limitation de fréquence : 6e envoi bloqué", async () => {
  const codes = [];
  for (let i = 0; i < 6; i++) codes.push((await handleContact(req(valid, { ip: "1.2.3.4" }), { env: ENV, fetchImpl: okFetch() })).status);
  assert.deepEqual(codes, [200, 200, 200, 200, 200, 429]);
});

test("échec du fournisseur → 502, jamais de faux succès", async () => {
  const fail = async () => ({ ok: false, status: 500, json: async () => ({ message: "boom" }) });
  const r = await handleContact(req(valid), { env: ENV, fetchImpl: fail, log: silent });
  assert.equal(r.status, 502);
  assert.equal(r.body.ok, false);
});

test("fournisseur injoignable → 502", async () => {
  const down = async () => { throw new Error("ECONNREFUSED"); };
  const r = await handleContact(req(valid), { env: ENV, fetchImpl: down, log: silent });
  assert.equal(r.status, 502);
});

test("réponse fournisseur sans identifiant → pas de confirmation", async () => {
  const weird = async () => ({ ok: true, status: 200, json: async () => ({}) });
  const r = await handleContact(req(valid), { env: ENV, fetchImpl: weird, log: silent });
  assert.equal(r.status, 502);
});

test("service non configuré → 503", async () => {
  const r = await handleContact(req(valid), { env: {}, fetchImpl: okFetch(), log: silent });
  assert.equal(r.status, 503);
});

test("méthode, format, taille et origine", async () => {
  assert.equal((await handleContact({ method: "GET" }, { env: ENV })).status, 405);
  assert.equal((await handleContact({ method: "POST", headers: { "content-type": "text/plain" }, body: "x" }, { env: ENV })).status, 415);
  assert.equal((await handleContact(req("x".repeat(20000)), { env: ENV })).status, 413);
  assert.equal((await handleContact(req("{pas du json"), { env: ENV })).status, 400);
  const r = await handleContact({ ...req(valid), headers: { "content-type": "application/json", origin: "https://evil.com" } }, { env: { ...ENV, ALLOWED_ORIGINS: "https://onejeysir.example" }, fetchImpl: okFetch() });
  assert.equal(r.status, 403);
});

test("le journal d'erreur ne contient aucune donnée personnelle", async () => {
  const logs = [];
  await handleContact(req(valid), { env: ENV, fetchImpl: async () => ({ ok: false, status: 401, json: async () => ({}) }), log: (m) => logs.push(m) });
  assert.equal(logs.length, 1);
  assert.ok(!logs[0].includes("awa") && !logs[0].includes("Ngono"));
});

test("adaptateur Vercel : réponse JSON, no-store", async () => {
  const { default: handler } = await import("../api/contact.js");
  const res = { headers: {}, setHeader(k, v) { this.headers[k] = v; }, status(c) { this.code = c; return this; }, json(b) { this.body = b; return this; } };
  await handler({ method: "GET", headers: {}, socket: {} }, res);
  assert.equal(res.code, 405);
  assert.equal(res.headers["Cache-Control"], "no-store");
  assert.equal(res.headers.Allow, "POST");
});

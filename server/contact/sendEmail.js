// Envoi via l'API HTTP de Resend (https://resend.com). Aucune dépendance : fetch natif de Node 18+.
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

export function buildEmail(data) {
  const rows = [
    ["Nom", data.name],
    ["Email", data.email],
    ["Type", data.type],
    ["Entreprise", data.company || "Non précisée"],
    ["Budget", data.budget],
  ];
  const text = `${rows.map(([k, v]) => `${k} : ${v}`).join("\n")}\n\nSujet : ${data.subject}\n\n${data.message}`;
  const html = `<div style="font-family:Arial,sans-serif;font-size:15px;color:#111">
<h2 style="margin:0 0 12px">Nouvelle demande · ${esc(data.type)}</h2>
<table cellpadding="4">${rows.map(([k, v]) => `<tr><td><b>${esc(k)}</b></td><td>${esc(v)}</td></tr>`).join("")}</table>
<p><b>Sujet :</b> ${esc(data.subject)}</p>
<p style="white-space:pre-wrap;border-left:3px solid #f2e313;padding-left:12px">${esc(data.message)}</p></div>`;
  return { subject: `[Portfolio] ${data.type} · ${data.subject}`.slice(0, 160), text, html };
}

export async function sendEmail(data, { env = process.env, fetchImpl = globalThis.fetch } = {}) {
  const { RESEND_API_KEY, CONTACT_TO_EMAIL, CONTACT_FROM_EMAIL } = env;
  if (!RESEND_API_KEY || !CONTACT_TO_EMAIL || !CONTACT_FROM_EMAIL) return { ok: false, reason: "not_configured" };
  const mail = buildEmail(data);
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 10000);
  try {
    const res = await fetchImpl("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: CONTACT_FROM_EMAIL, to: [CONTACT_TO_EMAIL], reply_to: data.email, ...mail }),
      signal: ctrl.signal,
    });
    const body = await res.json().catch(() => ({}));
    if (res.ok && body.id) return { ok: true, id: body.id };
    return { ok: false, reason: "provider_error", status: res.status };
  } catch {
    return { ok: false, reason: "provider_unreachable" };
  } finally {
    clearTimeout(timer);
  }
}

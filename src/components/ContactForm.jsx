import { useEffect, useRef, useState } from "react";
import { AlertTriangle, ArrowRight, Check, RotateCcw } from "lucide-react";
import { BUDGETS, LIMITS, REQUEST_TYPES, validateContact } from "../utils/contactRules.js";

function Err({ k, errors }) {
  return errors[k] ? <span id={`e-${k}`} className="err">{errors[k]}</span> : null;
}

const EMPTY = { name: "", email: "", type: "", subject: "", message: "", company: "", budget: BUDGETS[0], website: "" };
const LABEL = { idle: "Envoyer le message", sending: "Envoi en cours…", sent: "Message envoyé", error: "Réessayer l'envoi" };

/**
 * endpoint : URL du point d'envoi serveur (ex. "/api/contact").
 * endpoint = null : mode aperçu, rien n'est envoyé et l'interface le dit clairement.
 */
export function ContactForm({ endpoint = "/api/contact", presetType }) {
  const [v, setV] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [state, setState] = useState("idle");
  const [msg, setMsg] = useState("");
  const startedAt = useRef(Date.now());
  const busy = useRef(false);
  const formRef = useRef(null);

  useEffect(() => {
    if (presetType && REQUEST_TYPES.includes(presetType)) setV((o) => ({ ...o, type: presetType }));
  }, [presetType]);

  const set = (k) => (e) => {
    setV((o) => ({ ...o, [k]: e.target.value }));
    if (errors[k]) setErrors((o) => ({ ...o, [k]: undefined }));
    if (state === "error" || state === "sent") setState("idle");
  };

  const submit = async (e) => {
    e.preventDefault();
    if (busy.current) return; // empêche les doubles envois
    const { ok, errors: errs } = validateContact(v);
    setErrors(errs);
    if (!ok) {
      setState("idle");
      setMsg("Corrige les champs signalés.");
      const first = Object.keys(errs)[0];
      formRef.current?.querySelector(`[name="${first}"]`)?.focus();
      return;
    }
    if (!endpoint) {
      setState("error");
      setMsg("Aperçu : l'envoi est désactivé ici. Sur le site déployé, ce formulaire transmet réellement le message.");
      return;
    }
    busy.current = true;
    setState("sending");
    setMsg("");
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 15000);
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...v, elapsedMs: Date.now() - startedAt.current }),
        signal: ctrl.signal,
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.ok) {
        setState("sent");
        setMsg("Merci ! Ton message a bien été accepté par le service d'envoi. Je te réponds dès que possible.");
        setV(EMPTY);
        startedAt.current = Date.now();
      } else {
        if (data.errors) setErrors(data.errors);
        setState("error");
        setMsg(data.message || "L'envoi a échoué. Réessaie dans un instant.");
      }
    } catch (err) {
      setState("error");
      setMsg(err.name === "AbortError" ? "Le serveur met trop de temps à répondre. Réessaie." : "Impossible de joindre le serveur. Vérifie ta connexion.");
    } finally {
      clearTimeout(timer);
      // petit délai avant de pouvoir renvoyer, pour éviter les rafales
      setTimeout(() => (busy.current = false), 1500);
    }
  };

  const f = (k) => ({
    id: `f-${k}`,
    name: k,
    value: v[k],
    onChange: set(k),
    "aria-invalid": errors[k] ? true : undefined,
    "aria-describedby": errors[k] ? `e-${k}` : undefined,
  });
  const msgLen = [...v.message].length;

  return (
    <form ref={formRef} className="form" onSubmit={submit} noValidate aria-describedby="form-status">
      <div className="row2">
        <div className="field" data-err={!!errors.name}>
          <label htmlFor="f-name">Nom complet</label>
          <input {...f("name")} autoComplete="name" required maxLength={LIMITS.name[1] + 20} />
          <Err k="name" errors={errors} />
        </div>
        <div className="field" data-err={!!errors.email}>
          <label htmlFor="f-email">Adresse électronique</label>
          <input {...f("email")} type="email" inputMode="email" autoComplete="email" required />
          <Err k="email" errors={errors} />
        </div>
      </div>
      <div className="row2">
        <div className="field" data-err={!!errors.type}>
          <label htmlFor="f-type">Type de demande</label>
          <select {...f("type")} required>
            <option value="" disabled>Choisir…</option>
            {REQUEST_TYPES.map((t) => <option key={t}>{t}</option>)}
          </select>
          <Err k="type" errors={errors} />
        </div>
        <div className="field" data-err={!!errors.subject}>
          <label htmlFor="f-subject">Sujet</label>
          <input {...f("subject")} required maxLength={LIMITS.subject[1] + 20} />
          <Err k="subject" errors={errors} />
        </div>
      </div>
      <div className="field" data-err={!!errors.message}>
        <label htmlFor="f-message">Message</label>
        <textarea {...f("message")} required rows={6} />
        <span className={`count ${msgLen > LIMITS.message[1] ? "over" : ""}`} aria-live="polite">{msgLen} / {LIMITS.message[1]}</span>
        <Err k="message" errors={errors} />
      </div>
      <div className="row2">
        <div className="field" data-err={!!errors.company}>
          <label htmlFor="f-company">Entreprise <span className="opt">(facultatif)</span></label>
          <input {...f("company")} autoComplete="organization" />
          <Err k="company" errors={errors} />
        </div>
        <div className="field">
          <label htmlFor="f-budget">Budget estimé <span className="opt">(facultatif)</span></label>
          <select {...f("budget")}>{BUDGETS.map((b) => <option key={b}>{b}</option>)}</select>
        </div>
      </div>
      {/* Honeypot : invisible pour les humains, rempli par les robots */}
      <div className="hp" aria-hidden="true">
        <label htmlFor="f-website">Ne pas remplir</label>
        <input id="f-website" name="website" tabIndex={-1} autoComplete="off" value={v.website} onChange={set("website")} />
      </div>
      <div className="submit-row">
        <p id="form-status" className={`status ${state === "sent" ? "ok" : state === "error" ? "bad" : ""}`} role="status" aria-live="polite">{msg}</p>
        <button className="btn submit" type="submit" data-state={state} disabled={state === "sending"} aria-busy={state === "sending"}>
          {state === "sending" && <span className="spinner" aria-hidden="true" />}
          {LABEL[state]}
          {state === "idle" && <ArrowRight size={18} aria-hidden="true" />}
          {state === "sent" && <Check size={18} aria-hidden="true" />}
          {state === "error" && (endpoint ? <RotateCcw size={18} aria-hidden="true" /> : <AlertTriangle size={18} aria-hidden="true" />)}
        </button>
      </div>
      <p className="note">Aucun compte requis. Tes données servent uniquement à te répondre.</p>
    </form>
  );
}

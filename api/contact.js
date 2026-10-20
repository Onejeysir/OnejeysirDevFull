// Fonction serverless Vercel : POST /api/contact
import { handleContact } from "../server/contact/handler.js";

export default async function handler(req, res) {
  const fwd = String(req.headers["x-forwarded-for"] || "").split(",")[0].trim();
  const ip = fwd || req.socket?.remoteAddress || "unknown";
  const { status, body } = await handleContact({ method: req.method, headers: req.headers, body: req.body, ip });
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("X-Content-Type-Options", "nosniff");
  if (status === 405) res.setHeader("Allow", "POST");
  res.status(status).json(body);
}

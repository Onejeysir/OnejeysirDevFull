import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import Portfolio from "./Portfolio.jsx";

// Endpoint du formulaire : fonction serverless Vercel par défaut.
const endpoint = import.meta.env.VITE_CONTACT_ENDPOINT || "/api/contact";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Portfolio contactEndpoint={endpoint} />
  </StrictMode>
);

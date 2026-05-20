// ======================================================
// Arquivo: main.jsx
// ======================================================
// Ponto de entrada do frontend React.
// Aqui a aplicacao é montada no elemento #root do index.html.
// ======================================================

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles/global.css";
import App from "./App.jsx";

// Renderiza toda a aplicacao dentro da raiz HTML.
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);
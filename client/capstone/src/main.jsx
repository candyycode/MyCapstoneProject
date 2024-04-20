import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, HashRouter } from "react-router-dom";
import App from "./App.jsx";
import "./index.css";

const rootContainer = document.getElementById("root");
const existingRoot = rootContainer._reactRootContainer;

export const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3000/api";

if (existingRoot) {
  existingRoot.render(
    <React.StrictMode>
      <HashRouter>
        <App />
      </HashRouter>
    </React.StrictMode>
  );
} else {
  createRoot(rootContainer).render(
    <React.StrictMode>
      <HashRouter>
        <App />
      </HashRouter>
    </React.StrictMode>
  );
}

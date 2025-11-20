import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { ConvexProvider, ConvexReactClient } from "convex/react";
import App from "./App.tsx";
import "./index.css";
import { initializeDemoDrivers } from "./data/demoDrivers";

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL as string);

// Initialize demo drivers on app startup
initializeDemoDrivers();

// Register service worker for PWA
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/service-worker.js")
      .then((registration) => {
        console.log("SW registered:", registration);
      })
      .catch((error) => {
        console.log("SW registration failed:", error);
      });
  });
}

createRoot(document.getElementById("root")!).render(
  <ConvexProvider client={convex}>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </ConvexProvider>
);

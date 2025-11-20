import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { initializeDemoDrivers } from "./data/demoDrivers";

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

createRoot(document.getElementById("root")!).render(<App />);

"use client";

import { useEffect } from "react";

export default function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((reg) => {
          console.log("[Zarah PWA] Service Worker registered with scope:", reg.scope);
        })
        .catch((err) => {
          console.warn("[Zarah PWA] Service Worker registration failed:", err);
        });
    }
  }, []);

  return null;
}

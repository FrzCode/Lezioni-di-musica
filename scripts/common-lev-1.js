// scripts/common-autobase.js
document.addEventListener("DOMContentLoaded", () => {
  // Calcola dinamicamente quanti "../" servono per arrivare alla cartella docs/
  function getBasePrefix() {
    const path = window.location.pathname;
    const parts = path.split("/").filter(Boolean); // rimuove stringhe vuote
    // Cerchiamo l'indice di "docs" nella path
    const idx = parts.indexOf("docs");
    if (idx === -1) return "./"; // fallback: se manca "docs" nel percorso
    const depthAfterDocs = parts.length - (idx + 1);
    return "../".repeat(depthAfterDocs);
  }

  const BASE = getBasePrefix();

  // Funzione helper: prova a fare fetch di un file con vari prefissi
  async function fetchWithFallback(filename) {
    const candidates = [BASE, "./", "../", "../../", "/"];
    for (const base of candidates) {
      try {
        const r = await fetch(base + filename, { cache: "no-cache" });
        if (r.ok) return await r.text();
      } catch { /* ignora e prova il prossimo */ }
    }
    throw new Error("Impossibile caricare " + filename);
  }

  (async () => {
    // HEADER
    try {
      const header = await fetchWithFallback("header.html");
      const hc = document.getElementById("header-container");
      if (hc) hc.innerHTML = header;
    } catch (e) {
      console.warn("Header non trovato:", e);
    }

    // ASIDE
    try {
      const aside = await fetchWithFallback("aside-moduli.html");
      const ac = document.getElementById("aside-container");
      if (ac) {
        ac.innerHTML = aside;

        // carica automaticamente il file di ricerca relativo al livello attuale
        const script = document.createElement("script");
        script.src = BASE + "scripts/site-search-lev-1.js";
        document.body.appendChild(script);
      }
    } catch (e) {
      console.warn("Aside non trovato:", e);
    }

    // FOOTER
    try {
      const footer = await fetchWithFallback("footer.html");
      const fc = document.getElementById("footer-container");
      if (fc) fc.innerHTML = footer;
    } catch (e) {
      console.warn("Footer non trovato:", e);
    }
  })();
});

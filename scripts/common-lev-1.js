// scripts/common-lev-1.js
document.addEventListener("DOMContentLoaded", () => {
  // Prefisso relativo per arrivare alla cartella docs/ dalla pagina corrente
  // (docs/index.html -> "", docs/modulo-1/x.html -> "../")
  function getDocsPrefix() {
    const path = window.location.pathname;
    const parts = path.split("/").filter(Boolean);
    const idx = parts.indexOf("docs");
    if (idx === -1) return "";
    const isDir = path.endsWith("/");
    const depth = parts.length - (idx + 1) - (isDir ? 0 : 1);
    return "../".repeat(Math.max(0, depth));
  }

  const DOCS = getDocsPrefix();
  const BASE = DOCS + "../"; // radice del repository (cartella scripts/)

  // Funzione helper: prova a fare fetch di un file con vari prefissi
  async function fetchWithFallback(filename) {
    const candidates = [DOCS, "./", "../", "../../", "/"];
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

        // i link dell'aside sono scritti relativi a docs/: li riallineo alla pagina corrente
        ac.querySelectorAll("a[href]").forEach(a => {
          const h = a.getAttribute("href");
          if (/^([a-z][a-z0-9+.-]*:|\/|#)/i.test(h)) return;
          a.setAttribute("href", DOCS + h);
        });

        // carica la ricerca solo se la pagina non la include già
        if (!document.querySelector('script[src*="site-search-lev-1"]')) {
          const script = document.createElement("script");
          script.src = BASE + "scripts/site-search-lev-1.js";
          document.body.appendChild(script);
        }
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

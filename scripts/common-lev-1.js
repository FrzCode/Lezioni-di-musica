// scripts/common-lev-1.js
// Loader comune: header (freccia indietro + menu), aside, footer, ricerca.
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

  // I frammenti sono scritti con link relativi a docs/: li riallineo alla pagina corrente
  function rewriteLinks(root) {
    root.querySelectorAll("a[href]").forEach(a => {
      const h = a.getAttribute("href");
      if (/^([a-z][a-z0-9+.-]*:|\/|#)/i.test(h)) return;
      a.setAttribute("href", DOCS + h);
    });
  }

  const lastPart = location.pathname.split("/").filter(Boolean).pop() || "";
  const isHome = lastPart === "index.html" || location.pathname.endsWith("/docs/") || location.pathname === "/";

  function setupBackButton(header) {
    const btn = header.querySelector("#back-btn");
    if (!btn || isHome) return;
    btn.classList.remove("is-hidden");
    btn.addEventListener("click", () => {
      const standalone = window.matchMedia("(display-mode: standalone)").matches || navigator.standalone;
      const sameOrigin = document.referrer.startsWith(location.origin);
      if (history.length > 1 && (sameOrigin || standalone)) {
        history.back();
        return;
      }
      const m = location.pathname.match(/\/(modulo-\d+)\//);
      location.href = DOCS + (m ? m[1] + ".html" : "index.html");
    });
  }

  function setupMenu(header, asideHtml) {
    const btn = header.querySelector("#menu-btn");
    const menu = header.querySelector("#site-menu");
    if (!btn || !menu) return;
    const list = menu.querySelector("ul");

    // le voci del menu vengono dall'indice dell'aside (unica fonte)
    if (asideHtml) {
      const doc = new DOMParser().parseFromString(asideHtml, "text/html");
      const seen = new Set();
      doc.querySelectorAll(".top-links a, summary.accordion-summary > a").forEach(src => {
        const href = src.getAttribute("href");
        if (!href || href === "#" || seen.has(href)) return;
        seen.add(href);
        const li = document.createElement("li");
        const a = document.createElement("a");
        a.setAttribute("href", href);
        a.textContent = src.textContent.trim();
        li.appendChild(a);
        list.appendChild(li);
      });
      rewriteLinks(menu);
      menu.querySelectorAll("a").forEach(a => {
        if (new URL(a.href).pathname === location.pathname) a.setAttribute("aria-current", "page");
      });
    }

    function setOpen(open) {
      btn.setAttribute("aria-expanded", String(open));
      btn.setAttribute("aria-label", open ? "Chiudi il menu" : "Apri il menu");
      menu.hidden = !open;
    }
    btn.addEventListener("click", () => setOpen(menu.hidden));
    document.addEventListener("keydown", e => { if (e.key === "Escape" && !menu.hidden) { setOpen(false); btn.focus(); } });
    document.addEventListener("click", e => { if (!menu.hidden && !header.contains(e.target)) setOpen(false); });
  }

  // Dove il browser non sa mostrare i PDF in un iframe (tipicamente Android) offro un pulsante
  function pdfFallback() {
    if (navigator.pdfViewerEnabled !== false) return;
    document.querySelectorAll(".embed-pdf").forEach(box => {
      const frame = box.querySelector("iframe");
      if (!frame) return;
      const link = document.createElement("a");
      link.href = frame.getAttribute("src");
      link.target = "_blank";
      link.rel = "noopener";
      link.textContent = "Apri il PDF";
      link.className = "pdf-open";
      const note = document.createElement("p");
      note.textContent = frame.getAttribute("title") || "Documento PDF";
      box.classList.add("no-inline");
      box.replaceChildren(note, link);
    });
  }

  (async () => {
    let asideHtml = "";
    try { asideHtml = await fetchWithFallback("aside-moduli.html"); }
    catch (e) { console.warn("Aside non trovato:", e); }

    // HEADER
    try {
      const header = await fetchWithFallback("header.html");
      const hc = document.getElementById("header-container");
      if (hc) {
        hc.innerHTML = header;
        rewriteLinks(hc);
        const h = hc.querySelector("header");
        if (h) { setupBackButton(h); setupMenu(h, asideHtml); }
      }
    } catch (e) {
      console.warn("Header non trovato:", e);
    }

    // ASIDE
    const ac = document.getElementById("aside-container");
    if (ac && asideHtml) {
      ac.innerHTML = asideHtml;
      rewriteLinks(ac);

      // carica la ricerca solo se la pagina non la include già
      if (!document.querySelector('script[src*="site-search-lev-1"]')) {
        const script = document.createElement("script");
        script.src = BASE + "scripts/site-search-lev-1.js";
        document.body.appendChild(script);
      }
    }

    // FOOTER
    try {
      const footer = await fetchWithFallback("footer.html");
      const fc = document.getElementById("footer-container");
      if (fc) {
        fc.innerHTML = footer;
        rewriteLinks(fc);
        const y = fc.querySelector("[data-year]");
        if (y) y.textContent = new Date().getFullYear();
      }
    } catch (e) {
      console.warn("Footer non trovato:", e);
    }

    pdfFallback();
  })();
});

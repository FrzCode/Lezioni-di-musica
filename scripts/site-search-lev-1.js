// scripts/site-search-lev-1.js — indice = JSON (se c'è) + link reali dell'aside
document.addEventListener("DOMContentLoaded", () => {
  // Trova base reale di /docs/
  function getDocsBase() {
    const path = window.location.pathname;
    const split = path.split("/docs/");
    if (split.length < 2) return new URL("/", window.location.origin);
    const prefix = split[0];
    return new URL(prefix + "/docs/", window.location.origin);
  }

  const DOCS_BASE = getDocsBase();
  const INDEX_URL = new URL("search-index.json", DOCS_BASE).href;

  const aside = document.getElementById("aside-container");
  if (!aside) return;

  const norm = s => (s || "")
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, ""); // no accenti

  let INDEX = [];         // {title, url(abs), snippet}
  let loadedJSON = false;
  let active = -1;

  // Carica JSON se presente
  async function loadJsonIndex() {
    try {
      const res = await fetch(INDEX_URL, { cache: "no-cache" });
      if (!res.ok) return [];
      const arr = await res.json();
      loadedJSON = true;
      // normalizza in oggetti con URL assoluto
      return arr.map(it => ({
        title: it.title || it.url,
        url: new URL(it.url, DOCS_BASE).href,   // it.url è relativo a docs/
        snippet: it.snippet || it.body || ""
      }));
    } catch {
      return [];
    }
  }

  // Raccoglie i link reali presenti nell’aside
  function scrapeAsideLinks() {
    const links = Array.from(aside.querySelectorAll('#original-index a[href]'))
      .filter(a => !/^(https?:)?\/\//.test(a.getAttribute('href'))); // solo interni
    return links.map(a => ({
      title: a.textContent.trim() || a.getAttribute('href'),
      url: a.href,
      snippet: "" // opzionale
    }));
  }

  // Merge (dedup per URL)
  function mergeByUrl(a, b) {
    const map = new Map();
    [...a, ...b].forEach(it => {
      const key = it.url.replace(/#.*$/, ""); // ignora hash
      if (!map.has(key)) map.set(key, it);
    });
    return [...map.values()];
  }

  function search(q) {
    const nq = norm(q);
    if (nq.length < 2) return [];
    return INDEX.filter(it => {
      const hay = [
        norm(it.title),
        norm(it.snippet)
      ].join(" ");
      return hay.includes(nq);
    }).slice(0, 20);
  }

  function highlight(text, q) {
    if (!text) return "";
    const nq = norm(q);
    if (nq.length < 2) return text;
    // evidenzia a livello semplice (case/accents insensitive)
    const raw = text;
    // costruiamo una regex semplice sulla parola principale (prima parola della query)
    const term = q.trim().split(/\s+/)[0];
    try {
      const re = new RegExp(term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), "gi");
      return raw.replace(re, m => `<mark>${m}</mark>`);
    } catch {
      return raw;
    }
  }

  function clearResults(list, meta) {
    list.innerHTML = "";
    list.style.display = "none";
    if (meta) meta.textContent = "";
    active = -1;
  }

  function render(list, meta, results, q) {
    list.innerHTML = "";
    if (!results.length) {
      clearResults(list, meta);
      meta.textContent = "Nessun risultato.";
      return;
    }

    results.forEach((r, i) => {
      const li = document.createElement("li");
      li.dataset.idx = i;

      const a = document.createElement("a");
      a.href = r.url;
      a.innerHTML = highlight(r.title, q);
      li.appendChild(a);

      if (r.snippet) {
        const sm = document.createElement("div");
        sm.className = "search-snippet";
        sm.innerHTML = highlight(r.snippet, q);
        li.appendChild(sm);
      }

      list.appendChild(li);
    });

    meta.textContent = `${results.length} risultati`;
    list.style.display = "block";
    active = -1;
  }

  function setActive(list, idx) {
    const items = Array.from(list.children);
    items.forEach(el => el.classList.remove("active"));
    if (idx >= 0 && idx < items.length) {
      items[idx].classList.add("active");
      active = idx;
      items[idx].scrollIntoView({ block: "nearest" });
    } else {
      active = -1;
    }
  }

  function bindSearch() {
    const box  = aside.querySelector(".search-box");
    const input= aside.querySelector("#site-search");
    const btn  = aside.querySelector("#site-search-btn");
    let list   = aside.querySelector("#search-results");
    if (!box || !input || !btn || !list) return false;

    // meta line (creata al volo se non c'è)
    let meta = aside.querySelector("#search-meta");
    if (!meta) {
      meta = document.createElement("div");
      meta.id = "search-meta";
      meta.style.fontSize = "0.85em";
      meta.style.opacity = "0.8";
      meta.style.marginTop = ".25rem";
      box.insertBefore(meta, list);
    }

    async function ensureIndex() {
      // JSON (se c’è) + link dall’aside
      const [jsonPart] = await Promise.all([loadJsonIndex()]);
      const asidePart  = scrapeAsideLinks();
      INDEX = mergeByUrl(jsonPart, asidePart);
    }

    async function doSearch() {
      const q = input.value.trim();
      if (q.length < 2) { clearResults(list, meta); return; }
      if (!INDEX.length) await ensureIndex();
      const results = search(q);
      render(list, meta, results, q);
    }

    // input → mostra risultati (non naviga)
    input.addEventListener("input", doSearch);

    // Invio: se c’è un attivo → navega quel link; altrimenti mostra/aggiorna risultati
    input.addEventListener("keydown", (e) => {
      const items = Array.from(list.children);
      if (e.key === "Escape") { clearResults(list, meta); return; }
      if (e.key === "ArrowDown") { e.preventDefault(); setActive(list, active + 1 >= items.length ? 0 : active + 1); }
      if (e.key === "ArrowUp")   { e.preventDefault(); setActive(list, active - 1 < 0 ? items.length - 1 : active - 1); }
      if (e.key === "Enter") {
        e.preventDefault();
        if (active >= 0) {
          const link = items[active].querySelector("a");
          if (link) window.location.href = link.href;
        } else {
          // nessun attivo: non aprire a caso; aggiorna/elenca
          doSearch();
        }
      }
    });

    // bottone “Cerca”: solo mostra/aggiorna i risultati (NON naviga)
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      doSearch();
    });

    // click su un risultato → apri QUEL link
    list.addEventListener("click", (e) => {
      const a = e.target.closest("a");
      if (!a) return;
      e.preventDefault();
      window.location.href = a.href;
    });

    // chiudi lista se perdi focus (senza mangiare il click)
    input.addEventListener("blur", () => {
      setTimeout(() => { if (!list.matches(":hover")) clearResults(list, meta); }, 120);
    });

    return true;
  }

  // bind dopo che common-lev-1 ha iniettato l’aside
  function tryBindLater() { if (bindSearch()) mo.disconnect(); }
  const mo = new MutationObserver(tryBindLater);
  mo.observe(aside, { childList: true, subtree: true });
  // tenta subito nel caso l’aside sia già presente
  bindSearch();
});

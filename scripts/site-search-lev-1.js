// scripts/site-search-lev-1.js — FIX href + click
document.addEventListener("DOMContentLoaded", () => {
  // BASEURL = docs/ (una cartella sopra la pagina corrente)
  const BASEURL = new URL("../", window.location.href);
  const INDEX_URL = new URL("search-index.json", BASEURL).href;

  let INDEX = [];
  let loaded = false;
  let active = -1;

  const norm = s => (s || "").toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  async function loadIndex() {
    if (loaded) return INDEX;
    const res = await fetch(INDEX_URL, { cache: "no-cache" });
    if (!res.ok) throw new Error("search-index.json non trovato: " + res.status);
    INDEX = await res.json();
    loaded = true;
    return INDEX;
  }

  function search(q) {
    const nq = norm(q);
    if (!nq || nq.length < 2) return [];
    return INDEX.filter(it => {
      const hay = [norm(it.title), norm((it.tags||[]).join(" ")), norm(it.body||"")].join(" ");
      return hay.includes(nq);
    }).slice(0, 10);
  }

  function clearResults(list) {
    list.innerHTML = "";
    list.style.display = "none";
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

  function render(list, results) {
    list.innerHTML = "";
    if (!results.length) return clearResults(list);

    results.forEach((r, i) => {
      // r.url deve essere relativo a docs/ (es: "modulo-1/note-musicali.html")
      const hrefAbs = new URL(r.url, BASEURL).href; // <- costruzione affidabile

      const li = document.createElement("li");
      li.dataset.idx = i;

      const a = document.createElement("a");
      a.href = hrefAbs;               // link assoluto stabile
      a.textContent = r.title;
      a.title = r.title;
      li.appendChild(a);

      if (r.snippet) {
        const small = document.createElement("div");
        small.style.fontSize = "0.9em";
        small.style.opacity = "0.8";
        small.textContent = r.snippet;
        li.appendChild(small);
      }

      list.appendChild(li);
    });

    list.style.display = "block";
    active = -1;
  }

  function openFirst(list) {
    const a = list.querySelector("a");
    if (a) window.location.href = a.href;
  }

  // ---- Bind AFTER aside is injected by common-lev-1 ----
  const aside = document.getElementById("aside-container");
  if (!aside) return;

  function tryBind() {
    const input = document.getElementById("site-search");
    const list  = document.getElementById("search-results");
    const form  = document.querySelector(".search-box");
    if (!input || !list || !form) return false;

    input.addEventListener("input", async () => {
      const q = input.value.trim();
      if (q.length < 2) return clearResults(list);
      try { await loadIndex(); } catch(e){ console.error(e); return; }
      render(list, search(q));
    });

    // Submit (Invio o click su “Cerca”) -> apre primo o attivo
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const q = input.value.trim();
      if (q.length < 2) return;
      try { await loadIndex(); } catch(e){ console.error(e); return; }
      const results = search(q);
      render(list, results);
      if (active >= 0) {
        const items = Array.from(list.children);
        const link = items[active]?.querySelector("a");
        if (link) window.location.href = link.href;
      } else {
        openFirst(list);
      }
    });

    // Frecce/ESC/Enter sull’input
    input.addEventListener("keydown", (e) => {
      const items = Array.from(list.children);
      if (e.key === "Escape") return clearResults(list);
      if (!items.length) return;

      if (e.key === "ArrowDown") { e.preventDefault(); setActive(list, active + 1 >= items.length ? 0 : active + 1); }
      if (e.key === "ArrowUp")   { e.preventDefault(); setActive(list, active - 1 < 0 ? items.length - 1 : active - 1); }
      if (e.key === "Enter" && active >= 0) {
        e.preventDefault();
        const link = items[active].querySelector("a");
        if (link) window.location.href = link.href;
      }
    });

    // Chiudi se perdi focus (ma lascia il click sui risultati)
    input.addEventListener("blur", () => {
      setTimeout(() => { if (!list.matches(":hover")) clearResults(list); }, 120);
    });

    return true;
  }

  if (!tryBind()) {
    const mo = new MutationObserver(() => {
      if (tryBind()) mo.disconnect();
    });
    mo.observe(aside, { childList: true, subtree: true });
  }
});

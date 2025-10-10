// site-search-autobind.js
document.addEventListener("DOMContentLoaded", () => {

  // === funzioni di supporto ===
  const CANDIDATES = ["./", "../", "../../", "/"];
  let INDEX = [], BASE = "./";
  const normalize = s => (s || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  async function loadIndex() {
    for (const base of CANDIDATES) {
      try {
        const r = await fetch(base + "search-index.json", { cache: "no-cache" });
        if (r.ok) { BASE = base; INDEX = await r.json(); return; }
      } catch (_) {}
    }
    console.warn("search-index.json non trovato");
  }

  function search(q) {
    const nq = normalize(q);
    return INDEX.filter(it =>
      normalize(it.title).includes(nq) ||
      normalize(it.body || "").includes(nq) ||
      (it.tags || []).some(t => normalize(t).includes(nq))
    );
  }

  function render(list, results) {
    list.innerHTML = "";
    if (!results.length) { list.innerHTML = "<li>Nessun risultato</li>"; return; }
    results.forEach(r => {
      const li = document.createElement("li");
      li.innerHTML = `<a href="${BASE}${r.url}">${r.title}</a><br><small>${r.snippet}</small>`;
      list.appendChild(li);
    });
  }

  // === inizializzazione con attesa aside ===
  const observer = new MutationObserver(() => {
    const input = document.getElementById("site-search");
    const list  = document.getElementById("search-results");
    const btn   = document.getElementById("site-search-btn");
    if (!input || !list || !btn) return; // ancora non inserito

    observer.disconnect(); // trovato il form, smetto di osservare

    loadIndex(); // carica l’indice

    input.addEventListener("input", () => {
      const q = input.value.trim();
      if (q.length < 2) { list.innerHTML = ""; return; }
      const res = search(q);
      render(list, res);
    });

    btn.addEventListener("click", e => {
      e.preventDefault();
      const q = input.value.trim();
      if (q.length < 2) return;
      const res = search(q);
      render(list, res);
    });
  });

  observer.observe(document.body, { childList: true, subtree: true });
});

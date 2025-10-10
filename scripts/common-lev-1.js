// common-autobase.js
document.addEventListener("DOMContentLoaded", () => {
  const CANDIDATES = ["./", "../", "../../", "/"];
  async function fetchFirst(path) {
    for (const base of CANDIDATES) {
      try {
        const r = await fetch(base + path, { cache: "no-cache" });
        if (r.ok) return await r.text();
      } catch (_) { }
    }
    throw new Error("Impossibile caricare " + path);
  }

  (async () => {
    try {
      const header = await fetchFirst("header.html");
      const hc = document.getElementById("header-container");
      if (hc) hc.innerHTML = header;
    } catch (e) { console.warn(e); }

    try {
      const aside = await fetchFirst("aside-moduli.html");
      const ac = document.getElementById("aside-container");
      if (ac) {
        ac.innerHTML = aside;
        // ora che il form è nel DOM, carichiamo lo script di ricerca
        const s = document.createElement("script");
        s.src = "../../scripts/site-search-lev-1.js";
        document.body.appendChild(s);
      }

    } catch (e) { console.warn(e); }

    try {
      const footer = await fetchFirst("footer.html");
      const fc = document.getElementById("footer-container");
      if (fc) fc.innerHTML = footer;
    } catch (e) { console.warn(e); }
  })();
});

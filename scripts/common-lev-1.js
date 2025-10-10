// Esegue tutto solo dopo che il DOM è pronto
document.addEventListener("DOMContentLoaded", () => {
  // Header
  fetch("../header.html")
    .then(r => r.text())
    .then(html => {
      const el = document.getElementById("header-container");
      if (el) el.innerHTML = html;
    })
    .catch(e => console.error("Header load error:", e));

  // Aside
  fetch("../aside-moduli.html")
    .then(r => r.text())
    .then(html => {
      const el = document.getElementById("aside-container");
      if (el) el.innerHTML = html;
    })
    .catch(e => console.error("Aside load error:", e));

  // Footer
  fetch("../footer.html")
    .then(r => r.text())
    .then(html => {
      const el = document.getElementById("footer-container");
      if (el) el.innerHTML = html;
    })
    .catch(e => console.error("Footer load error:", e));
});

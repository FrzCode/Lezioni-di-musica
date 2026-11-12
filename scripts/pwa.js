// scripts/pwa.js: collega manifest, icone e service worker. Va incluso in ogni pagina.
(function () {
  const here = document.currentScript && document.currentScript.src;
  if (!here) return;
  const root = new URL("../", here); // radice del repository

  function add(tag, attrs) {
    const el = document.createElement(tag);
    Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
    document.head.appendChild(el);
  }
  if (!document.querySelector('link[rel="manifest"]')) {
    add("link", { rel: "manifest", href: new URL("manifest.webmanifest", root).href });
    add("link", { rel: "apple-touch-icon", href: new URL("icons/apple-touch-icon.png", root).href });
    add("meta", { name: "theme-color", content: "#0a9ecc" });
  }
  if ("serviceWorker" in navigator && /^https?:$/.test(location.protocol)) {
    navigator.serviceWorker
      .register(new URL("sw.js", root).href, { scope: root.pathname })
      .catch(err => console.warn("Service worker non registrato:", err));
  }
})();

// Service worker di Lezioni di musica.
// L'elenco PRECACHE e la versione sono generati da tools/build-sw.py: non modificarli a mano.
// Pagine, script e stili: sempre dalla rete (senza cache del browser), cache solo se manca la connessione.
// PDF e immagini: dalla cache, aggiornati in background alla visita successiva.
const CACHE = "lezioni-v4";
/*PRECACHE-START*/
const PRECACHE = [
  "manifest.webmanifest",
  "docs/Le%20scale.html",
  "docs/Yankee%20Doodle.html",
  "docs/aside-moduli.html",
  "docs/common-autobase.js",
  "docs/footer.html",
  "docs/header.html",
  "docs/index.html",
  "docs/minuetto-sol-bach.html",
  "docs/modulo-1.html",
  "docs/modulo-2.html",
  "docs/modulo-3.html",
  "docs/modulo-4.html",
  "docs/rulli-misurati.html",
  "docs/rullo-buzz.html",
  "docs/scale-mallet-control.html",
  "docs/search-index.json",
  "docs/4-mallets/Esercizi-per-quattro-bacchette.html",
  "docs/modulo-1/Le%20scale.html",
  "docs/modulo-1/SOLFEGGIO-riepilogo-modulo-1.html",
  "docs/modulo-1/chiavi.html",
  "docs/modulo-1/groove-8th.html",
  "docs/modulo-1/note-musicali.html",
  "docs/modulo-1/pentagramma.html",
  "docs/modulo-1/primi-colpi.html",
  "docs/modulo-1/sei-diteggiature-base.html",
  "docs/modulo-1/solfeggio-ritmico.html",
  "docs/modulo-1/tagli-addizionali.html",
  "docs/modulo-2/colpi-singoli-con-le-sei-diteggiature-diteggiature-sui-sedicesimi.html",
  "docs/modulo-2/pause-di-crome.html",
  "docs/modulo-2/solfeggi-quarti-crome-pause-crome.html",
  "docs/modulo-3/rudimenti-sei-ottavi.html",
  "docs/modulo-4/cinque-ottavi-diddle.html",
  "scripts/aside-moduli.html",
  "scripts/common-lev-1.js",
  "scripts/pdf-viewer.js",
  "scripts/pwa.js",
  "scripts/site-search-lev-1.js",
  "style/common.js",
  "style/style.css",
  "style/style2.css",
  "icons/apple-touch-icon.png",
  "icons/icon-192.png",
  "icons/icon-512.png",
  "icons/icon-maskable-512.png",
  "img/Accordo%20maggiore.png",
  "img/gradini_scala.png",
  "vendor/pdfjs/pdf.min.mjs",
  "vendor/pdfjs/pdf.worker.min.mjs"
];
/*PRECACHE-END*/

self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => Promise.all(PRECACHE.map(u => c.add(new Request(u, { cache: "reload" })).catch(() => {}))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  if (req.headers.has("range")) return; // le richieste parziali le gestisce il browser
  const url = new URL(req.url);
  if (url.origin !== location.origin) return; // CDN e font restano online

  const staticAsset = /\.(pdf|png|jpe?g|svg|webp)$/i.test(url.pathname);
  e.respondWith(staticAsset ? staleWhileRevalidate(req, e) : networkFirst(req));
});

function store(cache, req, res) {
  if (res && res.status === 200) cache.put(req, res.clone()).catch(() => {});
}

async function networkFirst(req) {
  const cache = await caches.open(CACHE);
  try {
    const res = await fetch(req, { cache: "no-cache" });
    store(cache, req, res);
    return res;
  } catch {
    const hit = await cache.match(req, { ignoreSearch: true });
    if (hit) return hit;
    throw new Error("offline e non in cache: " + req.url);
  }
}

async function staleWhileRevalidate(req, e) {
  const cache = await caches.open(CACHE);
  const hit = await cache.match(req);
  const net = fetch(req, { cache: "no-cache" })
    .then(res => { store(cache, req, res); return res; })
    .catch(() => null);
  if (hit) { e.waitUntil(net); return hit; }
  const res = await net;
  if (res) return res;
  throw new Error("offline e non in cache: " + req.url);
}

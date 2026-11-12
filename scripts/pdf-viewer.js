// scripts/pdf-viewer.js: anteprima dei PDF con PDF.js dove l'iframe non funziona (telefoni e tablet).
// Caricato come modulo da common-lev-1.js solo quando serve.
import * as pdfjs from "../vendor/pdfjs/pdf.min.mjs";

pdfjs.GlobalWorkerOptions.workerSrc = new URL("../vendor/pdfjs/pdf.worker.min.mjs", import.meta.url).href;

function showFallback(viewer, url, reason) {
  console.warn("Anteprima PDF non riuscita:", reason);
  const p = document.createElement("p");
  p.textContent = "L'anteprima non è disponibile. Puoi aprire il documento in una nuova scheda.";
  const a = document.createElement("a");
  a.href = url;
  a.target = "_blank";
  a.rel = "noopener";
  a.className = "pdf-open";
  a.textContent = "Apri il PDF";
  viewer.classList.add("pdf-failed");
  viewer.replaceChildren(p, a);
}

async function mount(frame) {
  const box = frame.closest(".embed-pdf");
  if (!box) return;
  const url = new URL(frame.getAttribute("src"), document.baseURI).href;
  const title = frame.getAttribute("title") || "Documento PDF";

  const viewer = document.createElement("div");
  viewer.className = "pdf-viewer";
  viewer.setAttribute("aria-label", title);
  const status = document.createElement("p");
  status.className = "pdf-status";
  status.textContent = "Caricamento del PDF…";
  viewer.appendChild(status);
  frame.replaceWith(viewer);
  box.classList.add("pdfjs");

  const actions = document.createElement("p");
  actions.className = "pdf-actions";
  const open = document.createElement("a");
  open.href = url;
  open.target = "_blank";
  open.rel = "noopener";
  open.textContent = "Apri il PDF in una nuova scheda";
  actions.appendChild(open);
  box.appendChild(actions);

  let pdf;
  try {
    // richiesta unica e completa: funziona anche con la cache offline
    pdf = await pdfjs.getDocument({ url, disableRange: true, disableStream: true }).promise;
  } catch (err) {
    showFallback(viewer, url, err);
    return;
  }

  const entries = [];
  const frag = document.createDocumentFragment();
  for (let n = 1; n <= pdf.numPages; n++) {
    const page = await pdf.getPage(n);
    const vp = page.getViewport({ scale: 1 });
    const wrap = document.createElement("div");
    wrap.className = "pdf-page";
    wrap.style.aspectRatio = vp.width + " / " + vp.height;
    const canvas = document.createElement("canvas");
    canvas.setAttribute("role", "img");
    canvas.setAttribute("aria-label", title + ", pagina " + n + " di " + pdf.numPages);
    wrap.appendChild(canvas);
    frag.appendChild(wrap);
    entries.push({ page, wrap, canvas, vp, visible: false, doneWidth: 0, busy: false });
  }
  viewer.replaceChildren(frag);

  async function render(entry) {
    const width = Math.round(viewer.clientWidth);
    if (!width || entry.busy || entry.doneWidth === width) return;
    entry.busy = true;
    try {
      // risoluzione abbondante: gli allievi ingrandiscono con le dita
      const dpr = Math.min(Math.max(window.devicePixelRatio || 1, 2) * 1.5, 4);
      const scale = (width / entry.vp.width) * dpr;
      const vp = entry.page.getViewport({ scale });
      entry.canvas.width = Math.floor(vp.width);
      entry.canvas.height = Math.floor(vp.height);
      await entry.page.render({ canvas: entry.canvas, canvasContext: entry.canvas.getContext("2d"), viewport: vp }).promise;
      entry.doneWidth = width;
    } catch (err) {
      console.warn("Pagina PDF non disegnata:", err);
    } finally {
      entry.busy = false;
    }
  }

  const io = new IntersectionObserver(list => {
    list.forEach(item => {
      const entry = entries.find(e => e.wrap === item.target);
      if (!entry) return;
      entry.visible = item.isIntersecting;
      if (entry.visible) render(entry);
    });
  }, { rootMargin: "800px 0px" });
  entries.forEach(e => io.observe(e.wrap));

  let timer;
  window.addEventListener("resize", () => {
    clearTimeout(timer);
    timer = setTimeout(() => entries.forEach(e => { if (e.visible) render(e); }), 250);
  });
}

document.querySelectorAll(".embed-pdf iframe").forEach(f => {
  mount(f).catch(err => console.warn("Anteprima PDF non riuscita:", err));
});

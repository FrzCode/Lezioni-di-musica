# 🎼 Lezioni-di-musica

## 📘 Descrizione del progetto

La finalità di questi materiali è la creazione di un sito locale, avviabile anche da una chiavetta.

Attualmente, bisogna aprirlo con Visual Studio Code e aprire con un server. Puoi installare l'estensione **Live Server** di Ritwick Dey e avviare la pagina che ti interessa con quello. In alternativa, è possibile al momento lanciare direttamente da un browser. Non è stato utilizzato PHP per rendere il tutto più semplice.

---

## 🎯 Scopo

Lo scopo è produrre una forma di libro interattivo che può essere sfruttato:
- ✅ in modo lineare, seguendo un indice
- 🔗 come ipertesto, cliccando su link all'interno delle pagine che conducono ad approfondimenti non previsti nell'indice

In questo modo:
- si può seguire sia il sistema lineare classico (A → B)
- oppure quello orizzontale (si parte da qualunque punto e si colmano i vuoti)

Per il docente questo progetto è una forma di lavagna multimediale: link video, basi, musica scritta, esercizi... tutto in continuo aggiornamento.

---

## 🧰 Cosa serve

- Un **indice** che raccoglie una lista di pagine in ordine
- Una **suddivisione in cartelle** con argomenti diversi (es. Percussioni, Teoria, Armonia)

---

## 📁 Struttura cartelle

```plaintext
progetto/
├── www/          → Tutti i file .html
│   └── teoria/   → Sottocartelle future
│   └── armonia/
│   └── percussioni/
├── style/        → style.css e fogli aggiuntivi
├── img/          → Immagini varie
├── test/         → Esperimenti
├── scripts/      → Codici JavaScript
```

🔗 **Attenzione ai collegamenti**:
- Se i file HTML sono in `/www`, i collegamenti al CSS funzionano direttamente.
- Se si trovano in sottocartelle, servono i `..` nei percorsi:
  - Esempio: `../style/style.css`  
  - Da sottocartelle: `../../style/style.css`

---

## 🧭 Osservazioni di lungo periodo

In fase di distribuzione del prodotto:
- È possibile nascondere le cartelle non rilevanti (es. solo teoria, solo armonia)
- Per un sistema **completo**, attenzione ai link tra cartelle:
  - Gli **ipertesti devono condurre solo a file della stessa cartella**
  - Es. Teoria → Teoria, Percussioni → Percussioni

Questo evita che un utente trovi link a pagine assenti o non pertinenti.

---

## 🤝 Collaborazione

Due modalità collaborative:
1. **Ambiti separati**: ognuno lavora su pagine diverse, poi si uniscono nel main
2. **Rami**: ciascuno sviluppa una propria "strada" del progetto, sempre visibile e open-source

Ogni collaboratore può personalizzare liberamente secondo la propria didattica.

---

## 📄 File modello

Esiste un file modello HTML già pronto. Può essere utilizzato anche con l’intelligenza artificiale:
- Carica il modello
- Carica il testo da inserire
- Ottieni il prodotto finito, da rifinire

---

## 🎵 File ABCjs

Questi file si gestiscono con un link già incluso nel file modello:

```html
<script src="https://cdn.jsdelivr.net/npm/abcjs"></script>
```

---

## 🧩 Componenti riutilizzabili (`header.html`, `footer.html`, ecc.)

Per evitare copia-incolla e aggiornamenti manuali su più file, usa questo sistema:

### Esempio: includere `header.html`

Supponendo che il file HTML sia in `www/` e `header.html` si trovi anch'esso in `www/`:

```html
<div id="header-container"></div>

<script>
  fetch("header.html")
    .then(res => res.text())
    .then(data => {
      document.getElementById("header-container").innerHTML = data;
    });
</script>
```

Se `header.html` è in una cartella `components/`, usa:

```javascript
fetch("../components/header.html")
```

---

## 🧠 Indicizzazione automatica via JavaScript

Per generare automaticamente l’indice da una lista JS o da un file JSON:

### Variante semplice (lista in JS)

```html
<ul id="indice"></ul>

<script>
  const pagine = [
    { titolo: "Ritmo", file: "ritmo.html" },
    { titolo: "Scale", file: "scale.html" },
    { titolo: "Intervalli", file: "intervalli.html" }
  ];

  const container = document.getElementById("indice");
  pagine.forEach(pagina => {
    const li = document.createElement("li");
    li.innerHTML = `<a href="${pagina.file}">${pagina.titolo}</a>`;
    container.appendChild(li);
  });
</script>
```

Può essere esteso per categorie, ordinamenti e evidenziamenti.

---

## 🚀 Avvio progetto

1. Apri la cartella principale in **Visual Studio Code**
2. Installa l’estensione **Live Server**
3. Clic destro sulla pagina HTML da avviare → **"Open with Live Server"**

Oppure apri direttamente i file `.html` da browser se non servono funzionalità lato server.


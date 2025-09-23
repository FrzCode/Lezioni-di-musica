# 🚀 Avvio del sito locale da chiavetta (senza Visual Studio Code, né Python)

## 💡 Obiettivo
Consentire l’apertura del sito "Lezioni di Musica" da una chiavetta USB su qualsiasi computer **senza Visual Studio Code** e **senza dover installare nulla**.

---

## 🛠️ Struttura consigliata sulla chiavetta

```
LezioniMusica/
├── www/                  → File HTML, CSS, JS
├── MiniWebServer/       → Contiene l’eseguibile del server
├── avvia_sito.bat       → Script batch per Windows
```

---

## 🖥️ Soluzione: MiniWeb (Windows, senza Python)

1. Scaricare **MiniWeb** dal sito ufficiale:  
   http://miniweb.sourceforge.net/

2. Inserire `miniweb.exe` nella cartella `MiniWebServer/`

3. Creare un file `avvia_sito.bat` nella cartella principale con questo contenuto:

```bat
@echo off
cd /d %~dp0MiniWebServer
start miniweb.exe -r ../www -p 8080
exit
```

4. Fare doppio clic su `avvia_sito.bat`

5. Aprire il browser e digitare:  
   `http://localhost:8080`

---

## 📋 Note

- Il file batch **non richiede installazioni**
- Può essere avviato da **qualsiasi computer Windows**
- Il sito sarà disponibile anche offline, in modo interattivo e navigabile
- Per Mac/Linux si possono usare strumenti equivalenti (es. Mongoose, Python, ecc.)

---

## 📎 Riferimenti

- MiniWeb Server: http://miniweb.sourceforge.net/

---
```

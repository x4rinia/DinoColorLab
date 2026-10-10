# Dino Color Lab 🦕

> **Live Web-App:** [https://x4rinia.github.io/DinoColorLab/](https://x4rinia.github.io/DinoColorLab/)

Digitaler, anfängerfreundlicher Haarfarben-Mischassistent für direktziehende, nichtoxidative Pigmente (**Blau, Rot-Pink, Gelb**) und **weiße Spülung**.

Optimiert für kleine Testmengen (**5 ml Standard**), mit interaktiver Mischvisualisierung, Teelöffel-Dosierhilfe, automatischem Rezept-Skalierer und lokaler IndexedDB-Speicherung.

---

## Funktionen

1. **Farbsystem:**
   - **Blau:** Echtes, kräftiges Blau (nicht türkis).
   - **Rot-Pink:** Kühles, pinkstichiges Rot für leuchtende Violett- und Beerentöne.
   - **Gelb:** Klares, strahlendes Gelb.
   - **Weiße Spülung:** Reine weiße Haarspülung (`#FFFFFF`) ohne Farb- oder Graustich zum Aufhellen und Verdünnen.

2. **Interaktive Farbmischungsansicht:**
   - Schritt-für-Schritt-Visualisierung: Ausgangspigmente $\rightarrow$ Zugabe $\rightarrow$ Pigmentkern $\rightarrow$ Weiße Spülung $\rightarrow$ Schalenfarbe $\rightarrow$ Wirkung auf der Haarsträhne.
   - Verständliche Erklärungen der subtraktiven Mischregeln direkt im UI.
   - Schematische Kennzeichnung für unkalibrierte Produkte.

3. **Optimiert für kleine Teststrähnen:**
   - Voreinstellungen für 2,5 ml, 5 ml (Standard), 10 ml, 15 ml, 25 ml sowie freie Eingabe.
   - Exakte primäre Berechnung in Gramm.
   - Milliliter-Berechnung ausschließlich bei hinterlegter Produktdichte.

4. **Alltagstaugliche Teelöffel- & Dosierberechnung:**
   - 1 TL = 5 ml, ½ TL = 2,5 ml, ¼ TL = 1,25 ml, ⅛ TL = 0,625 ml.
   - Transparente Genauigkeitsanzeige.
   - Automatische Dosierspritzen- und Feinwaagen-Empfehlung für Kleinstmengen unter 0,6 ml (keine Scheingenauigkeit).

5. **Modus „Kleine Teststrähne“:**
   - Auf 5 ml / 5 g voreingestellt.
   - Hebt Spülungsanteil und Kleinstmengen hervor.
   - Automatischer Hochrechner für Vollanwendungen (z. B. 30g, 60g, 100g, 150g).
   - Schritt-für-Schritt-Mischanleitung.
   - Direkte Dokumentation mit Vorher-/Nachher-Foto und Bewertung.

6. **PWA & Datenschutz:**
   - Funktioniert vollständig offline im Browser (Progressive Web App).
   - Keine Datenübertragung an Server; alle Rezepte, Pigmente und Fotos bleiben lokal in deiner Browser-Datenbank (Dexie / IndexedDB).

---

## Entwicklung & Build

```bash
# Abhängigkeiten installieren
npm install

# Entwicklungsserver starten
npm run dev

# Tests ausführen
npm test

# Linter ausführen
npm run lint

# Produktions-Bundle bauen
npm run build
```

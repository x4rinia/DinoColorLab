/**
 * Dino Color Lab - Exportiert die automatische Rezeptkarte als PNG-Bild
 * Läuft vollständig lokal im Browser via HTML5 Canvas.
 * Rein in Teelöffeln/Esslöffeln ohne Grammangaben.
 */

export interface RecipeCardExportData {
  title: string;
  mixedColorHex: string;
  blueTsp: string;
  redPinkTsp: string;
  yellowTsp: string;
  conditionerTsp: string;
  bluePercent: number;
  redPinkPercent: number;
  yellowPercent: number;
  conditionerPercent: number;
  ratioText: string;
}

export function downloadRecipeCardAsPng(data: RecipeCardExportData): void {
  const canvas = document.createElement('canvas');
  const width = 800;
  const height = 860;
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // Background Gradient
  const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
  bgGrad.addColorStop(0, '#0f172a');
  bgGrad.addColorStop(0.5, '#090d16');
  bgGrad.addColorStop(1, '#020617');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  // Outer Border
  ctx.strokeStyle = '#1e293b';
  ctx.lineWidth = 4;
  ctx.strokeRect(10, 10, width - 20, height - 20);

  // Inner Accent Border
  ctx.strokeStyle = '#2563eb';
  ctx.lineWidth = 1;
  ctx.strokeRect(16, 16, width - 32, height - 32);

  // Header Box
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(30, 30, width - 60, 80);

  // Header Title
  ctx.fillStyle = '#60a5fa';
  ctx.font = 'bold 28px sans-serif';
  ctx.fillText('Dino Color Lab 🦕', 50, 75);

  ctx.fillStyle = '#94a3b8';
  ctx.font = '16px sans-serif';
  ctx.fillText('Rezeptkarte für Färbeschale (40 ml / ca. 2 EL + 2 TL)', 50, 100);

  // Große Farb-Vorschau der gemischten Farbe
  const swatchY = 135;
  const swatchSize = 130;
  ctx.fillStyle = data.mixedColorHex;
  ctx.beginPath();
  ctx.roundRect(50, swatchY, swatchSize, swatchSize, 18);
  ctx.fill();
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Swatch Title and Info
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 24px sans-serif';
  ctx.fillText('Gemischte Farbnuance', 205, swatchY + 40);

  ctx.fillStyle = '#60a5fa';
  ctx.font = 'bold 20px monospace';
  ctx.fillText(data.mixedColorHex.toUpperCase(), 205, swatchY + 75);

  ctx.fillStyle = '#94a3b8';
  ctx.font = '14px sans-serif';
  ctx.fillText('Rezeptur rein in Löffelmaßen für einfache Dosierung', 205, swatchY + 110);

  // Farbbalken (Grafische Anteile)
  const barY = 295;
  ctx.fillStyle = '#cbd5e1';
  ctx.font = 'bold 15px sans-serif';
  ctx.fillText('Grafische Farbaufteilung:', 50, barY);

  const barX = 50;
  const barWidth = width - 100;
  const barH = 26;
  const barActualY = barY + 12;

  // Background for bar
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(barX, barActualY, barWidth, barH);
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 1;
  ctx.strokeRect(barX, barActualY, barWidth, barH);

  let currentX = barX;

  // Blue segment
  if (data.bluePercent > 0) {
    const w = (data.bluePercent / 100) * barWidth;
    ctx.fillStyle = '#2563eb';
    ctx.fillRect(currentX, barActualY, w, barH);
    currentX += w;
  }
  // Red-Pink segment
  if (data.redPinkPercent > 0) {
    const w = (data.redPinkPercent / 100) * barWidth;
    ctx.fillStyle = '#e11d48';
    ctx.fillRect(currentX, barActualY, w, barH);
    currentX += w;
  }
  // Yellow segment
  if (data.yellowPercent > 0) {
    const w = (data.yellowPercent / 100) * barWidth;
    ctx.fillStyle = '#facc15';
    ctx.fillRect(currentX, barActualY, w, barH);
    currentX += w;
  }
  // Conditioner segment (#FFFFFF with border)
  if (data.conditionerPercent > 0) {
    const w = barWidth - (currentX - barX);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(currentX, barActualY, w, barH);
  }

  // Zutaten-Tabelle
  const tableY = 370;
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(50, tableY, width - 100, 36);

  ctx.fillStyle = '#e2e8f0';
  ctx.font = 'bold 14px sans-serif';
  ctx.fillText('Zutat / Pigment', 65, tableY + 23);
  ctx.fillText('Löffelmaß (grob)', 450, tableY + 23);
  ctx.fillText('Anteil', 680, tableY + 23);

  const rows = [
    { name: 'Blau (Echtes Blau Direct Dye)', color: '#2563eb', tsp: data.blueTsp, pct: data.bluePercent },
    { name: 'Rot-Pink (Kühles Rot/Magenta)', color: '#e11d48', tsp: data.redPinkTsp, pct: data.redPinkPercent },
    { name: 'Gelb (Leuchtendes Gelb)', color: '#facc15', tsp: data.yellowTsp, pct: data.yellowPercent },
    { name: 'Weiße Spülung (#FFFFFF)', color: '#ffffff', tsp: data.conditionerTsp, pct: data.conditionerPercent }
  ];

  let currentY = tableY + 36;
  rows.forEach((row, i) => {
    ctx.fillStyle = i % 2 === 0 ? '#0f172a' : '#141e33';
    ctx.fillRect(50, currentY, width - 100, 48);

    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 0.5;
    ctx.strokeRect(50, currentY, width - 100, 48);

    // Color dot
    ctx.fillStyle = row.color;
    ctx.beginPath();
    ctx.arc(75, currentY + 24, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Name
    ctx.fillStyle = '#ffffff';
    ctx.font = '14px sans-serif';
    ctx.fillText(row.name, 95, currentY + 29);

    // Spoon amount (no grams!)
    ctx.fillStyle = '#93c5fd';
    ctx.font = 'bold 15px sans-serif';
    ctx.fillText(row.tsp, 450, currentY + 29);

    // Percent
    ctx.fillStyle = '#94a3b8';
    ctx.font = '14px monospace';
    ctx.fillText(`${row.pct.toFixed(1)}%`, 680, currentY + 29);

    currentY += 48;
  });

  // Mischverhältnis Box
  currentY += 20;
  ctx.fillStyle = '#1e293b';
  ctx.beginPath();
  ctx.roundRect(50, currentY, width - 100, 50, 12);
  ctx.fill();
  ctx.strokeStyle = '#3b82f6';
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.fillStyle = '#93c5fd';
  ctx.font = 'bold 14px sans-serif';
  ctx.fillText('Mischverhältnis:', 70, currentY + 31);

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 15px sans-serif';
  ctx.fillText(data.ratioText, 210, currentY + 31);

  // Bottom Notice
  currentY += 75;
  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  ctx.roundRect(50, currentY, width - 100, 75, 12);
  ctx.fill();

  ctx.fillStyle = '#fbbf24';
  ctx.font = 'bold 13px sans-serif';
  ctx.fillText('Praxistipp für die Anwendung:', 70, currentY + 28);

  ctx.fillStyle = '#94a3b8';
  ctx.font = '12px sans-serif';
  ctx.fillText('• 1 EL = ca. 15 ml | 1 TL = ca. 5 ml | Standardmenge Schale: 40 ml (2 EL + 2 TL).', 70, currentY + 48);
  ctx.fillText('• Vor der Gesamtanwendung immer eine Teststrähne durchführen, da die Haarfarbe durchscheint.', 70, currentY + 65);

  // Trigger Download
  const link = document.createElement('a');
  link.download = `${data.title.toLowerCase().replace(/[^a-z0-9]/g, '_')}_rezeptkarte.png`;
  link.href = canvas.toDataURL('image/png');
  link.click();
}

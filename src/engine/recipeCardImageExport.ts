/**
 * Dino Color Lab - Exportiert die automatische Rezeptkarte als PNG-Bild
 * Läuft vollständig lokal im Browser via HTML5 Canvas.
 */

export interface RecipeCardExportData {
  title: string;
  targetHex: string;
  bowlMixtureHex: string;
  resultOnHairHex: string;
  baseHairLevelName: string;
  totalMl: number;
  totalGrams: number;
  blueGrams: number;
  blueTsp: string;
  redPinkGrams: number;
  redPinkTsp: string;
  yellowGrams: number;
  yellowTsp: string;
  conditionerGrams: number;
  conditionerTsp: string;
  ratioText: string;
}

export function downloadRecipeCardAsPng(data: RecipeCardExportData): void {
  const canvas = document.createElement('canvas');
  const width = 800;
  const height = 980;
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
  ctx.strokeStyle = '#0284c7';
  ctx.lineWidth = 1;
  ctx.strokeRect(16, 16, width - 32, height - 32);

  // Header Box
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(30, 30, width - 60, 80);

  // Header Title
  ctx.fillStyle = '#38bdf8';
  ctx.font = 'bold 28px sans-serif';
  ctx.fillText('Dino Color Lab 🦕', 50, 75);

  ctx.fillStyle = '#94a3b8';
  ctx.font = '16px sans-serif';
  ctx.fillText('Automatische Rezeptkarte für Pony, Sidecut & Strähnen', 50, 100);

  // Sub-header (Menge)
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 20px sans-serif';
  ctx.fillText(`${data.totalMl} ml (${data.totalGrams} g Gesamtmenge)`, 50, 150);

  ctx.fillStyle = '#64748b';
  ctx.font = '14px sans-serif';
  ctx.fillText('Genaue Dosierung in Teelöffeln (TL) bzw. Esslöffeln (EL) für Spülung', 50, 175);

  // Color Swatches Section (3 Boxes)
  const swatchY = 210;
  const boxWidth = 220;
  const boxHeight = 140;

  // Swatch 1: Wunschfarbe
  drawSwatchBox(ctx, 40, swatchY, boxWidth, boxHeight, data.targetHex, '1. Wunschfarbe', data.targetHex.toUpperCase(), '#38bdf8');

  // Swatch 2: Mischung in der Schale
  drawSwatchBox(ctx, 290, swatchY, boxWidth, boxHeight, data.bowlMixtureHex, '2. Mischung (Schale)', data.bowlMixtureHex.toUpperCase(), '#cbd5e1');

  // Swatch 3: Farbbeispiel auf Ausgangshaar
  drawSwatchBox(ctx, 540, swatchY, boxWidth, boxHeight, data.resultOnHairHex, '3. Farbbeispiel Haar', `Auf ${data.baseHairLevelName}`, '#4ade80');

  // Mixing bar
  const barY = 380;
  ctx.fillStyle = '#cbd5e1';
  ctx.font = 'bold 15px sans-serif';
  ctx.fillText('Mischverhältnis der Farbanteile:', 40, barY);

  const totalG = Math.max(0.01, data.blueGrams + data.redPinkGrams + data.yellowGrams + data.conditionerGrams);
  const barX = 40;
  const barWidth = width - 80;
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
  if (data.blueGrams > 0) {
    const w = (data.blueGrams / totalG) * barWidth;
    ctx.fillStyle = '#2563eb';
    ctx.fillRect(currentX, barActualY, w, barH);
    currentX += w;
  }
  // Red-Pink segment
  if (data.redPinkGrams > 0) {
    const w = (data.redPinkGrams / totalG) * barWidth;
    ctx.fillStyle = '#e11d48';
    ctx.fillRect(currentX, barActualY, w, barH);
    currentX += w;
  }
  // Yellow segment
  if (data.yellowGrams > 0) {
    const w = (data.yellowGrams / totalG) * barWidth;
    ctx.fillStyle = '#ffd600';
    ctx.fillRect(currentX, barActualY, w, barH);
    currentX += w;
  }
  // Conditioner segment (Pure White #FFFFFF with border)
  if (data.conditionerGrams > 0) {
    const w = barWidth - (currentX - barX);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(currentX, barActualY, w, barH);
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 1;
    ctx.strokeRect(currentX, barActualY, w, barH);
  }

  // Ingredients Table Header
  const tableY = 460;
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(40, tableY, width - 80, 36);

  ctx.fillStyle = '#94a3b8';
  ctx.font = 'bold 14px sans-serif';
  ctx.fillText('Zutat', 60, tableY + 24);
  ctx.fillText('Löffelmaß (TL / EL)', 320, tableY + 24);
  ctx.fillText('Gramm (g)', 560, tableY + 24);
  ctx.fillText('Anteil', 680, tableY + 24);

  // Table Rows
  let rowY = tableY + 45;
  drawIngredientRow(ctx, 40, rowY, width - 80, '#2563eb', 'Blau', data.blueTsp, `${data.blueGrams} g`, `${Math.round((data.blueGrams / totalG) * 100)}%`);

  rowY += 45;
  drawIngredientRow(ctx, 40, rowY, width - 80, '#e11d48', 'Rot / Pink', data.redPinkTsp, `${data.redPinkGrams} g`, `${Math.round((data.redPinkGrams / totalG) * 100)}%`);

  rowY += 45;
  drawIngredientRow(ctx, 40, rowY, width - 80, '#ffd600', 'Gelb', data.yellowTsp, `${data.yellowGrams} g`, `${Math.round((data.yellowGrams / totalG) * 100)}%`);

  rowY += 45;
  drawIngredientRow(ctx, 40, rowY, width - 80, '#ffffff', 'Weiße Spülung (#FFFFFF)', data.conditionerTsp, `${data.conditionerGrams} g`, `${Math.round((data.conditionerGrams / totalG) * 100)}%`, true);

  // Simple Ratio Box
  const ratioBoxY = 660;
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(40, ratioBoxY, width - 80, 70);
  ctx.strokeStyle = '#0284c7';
  ctx.lineWidth = 1;
  ctx.strokeRect(40, ratioBoxY, width - 80, 70);

  ctx.fillStyle = '#38bdf8';
  ctx.font = 'bold 15px sans-serif';
  ctx.fillText('Einfaches Mischverhältnis:', 60, ratioBoxY + 28);

  ctx.fillStyle = '#f8fafc';
  ctx.font = 'bold 17px sans-serif';
  ctx.fillText(data.ratioText, 60, ratioBoxY + 54);

  // Hair & Mixing Advice Box
  const adviceY = 750;
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(40, adviceY, width - 80, 110);
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 1;
  ctx.strokeRect(40, adviceY, width - 80, 110);

  ctx.fillStyle = '#fbbf24';
  ctx.font = 'bold 14px sans-serif';
  ctx.fillText('💡 Wichtige Anwendungshinweise:', 60, adviceY + 30);

  ctx.fillStyle = '#cbd5e1';
  ctx.font = '13px sans-serif';
  ctx.fillText('• Haarfarben sind lasierend: Deine Ausgangshaarfarbe addiert sich optisch zum Farbergebnis.', 60, adviceY + 55);
  ctx.fillText('• Bei Mengen unter 1 ml empfehlen wir eine Dosierspritze oder Feinwaage (0,01 g).', 60, adviceY + 77);
  ctx.fillText('• Vor jeder Vollanwendung zwingend das Farbergebnis an einer Strähne überprüfen.', 60, adviceY + 97);

  // Footer
  ctx.fillStyle = '#64748b';
  ctx.font = '12px sans-serif';
  ctx.fillText('Erstellt mit Dino Color Lab (https://x4rinia.github.io/DinoColorLab/) • Offline & Sicher', 50, height - 35);

  // Download trigger
  const dataUrl = canvas.toDataURL('image/png');
  const anchor = document.createElement('a');
  anchor.href = dataUrl;
  anchor.download = `DinoColorLab_Rezept_${data.totalMl}ml.png`;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
}

function drawSwatchBox(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  hex: string,
  title: string,
  subtext: string,
  accentColor: string
) {
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(x, y, w, h);
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 1;
  ctx.strokeRect(x, y, w, h);

  // Swatch
  ctx.fillStyle = hex;
  ctx.fillRect(x + 15, y + 20, 50, 50);
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(x + 15, y + 20, 50, 50);

  // Labels
  ctx.fillStyle = accentColor;
  ctx.font = 'bold 14px sans-serif';
  ctx.fillText(title, x + 75, y + 38);

  ctx.fillStyle = '#f8fafc';
  ctx.font = 'bold 15px monospace';
  ctx.fillText(subtext, x + 75, y + 60);

  // Small bottom note
  ctx.fillStyle = '#94a3b8';
  ctx.font = '11px sans-serif';
  ctx.fillText('Farbeindruck', x + 15, y + 105);
}

function drawIngredientRow(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  colorDot: string,
  name: string,
  spoonMeasure: string,
  grams: string,
  percent: string,
  hasBorder: boolean = false
) {
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(x, y, w, 38);
  ctx.strokeStyle = '#1e293b';
  ctx.lineWidth = 1;
  ctx.strokeRect(x, y, w, 38);

  // Dot
  ctx.fillStyle = colorDot;
  ctx.beginPath();
  ctx.arc(x + 25, y + 19, 7, 0, Math.PI * 2);
  ctx.fill();
  if (hasBorder) {
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }

  // Name
  ctx.fillStyle = '#f8fafc';
  ctx.font = 'bold 14px sans-serif';
  ctx.fillText(name, x + 45, y + 24);

  // Spoon
  ctx.fillStyle = '#38bdf8';
  ctx.font = 'bold 14px sans-serif';
  ctx.fillText(spoonMeasure, x + 280, y + 24);

  // Grams
  ctx.fillStyle = '#cbd5e1';
  ctx.font = 'monospace 14px sans-serif';
  ctx.fillText(grams, x + 520, y + 24);

  // Percent
  ctx.fillStyle = '#94a3b8';
  ctx.font = '13px sans-serif';
  ctx.fillText(percent, x + 640, y + 24);
}

import { jsPDF } from 'jspdf';
import type { ColorRecipe, PigmentProfile, ConditionerProfile } from '../types';
import {
  formatVolumeWithSpoonEstimate,
  formatConditionerSpoonEstimate,
  calculateSimpleRatio
} from './unitConversions';

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  let clean = hex.replace('#', '').trim();
  if (clean.length === 3) {
    clean = clean.split('').map((c) => c + c).join('');
  }
  const num = parseInt(clean, 16);
  if (isNaN(num)) return { r: 100, g: 100, b: 100 };
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255
  };
}

export function downloadRecipeAsPdf(
  recipe: ColorRecipe,
  pigments?: PigmentProfile[],
  conditioners?: ConditionerProfile[]
): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const cyan = pigments?.find((p) => p.id === recipe.cyanPigmentId);
  const magenta = pigments?.find((p) => p.id === recipe.magentaPigmentId);
  const yellow = pigments?.find((p) => p.id === recipe.yellowPigmentId);
  const conditioner = conditioners?.find((c) => c.id === recipe.conditionerId);

  const ratio = calculateSimpleRatio(
    recipe.ingredients.cyanGrams,
    recipe.ingredients.magentaGrams,
    recipe.ingredients.yellowGrams,
    recipe.ingredients.conditionerGrams
  );

  const targetRgb = hexToRgb(recipe.targetHex);
  const baseHairHex = recipe.baseHairColor?.hex || '#fffbeb';
  const baseHairRgb = hexToRgb(baseHairHex);

  // --- Top Decorative Banner ---
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, 210, 36, 'F');

  doc.setFillColor(37, 99, 235); // blue-600 accent stripe
  doc.rect(0, 35, 210, 2, 'F');

  // Header Title
  doc.setTextColor(56, 189, 248); // sky-400
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('Dino Color Lab', 14, 18);

  doc.setTextColor(203, 213, 225); // slate-300
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text('Haarfarben-Rezeptur für Direktzieher & Teststrähnen', 14, 26);

  // Date on top right
  const dateStr = new Date(recipe.createdAt || Date.now()).toLocaleDateString('de-DE');
  doc.setTextColor(148, 163, 184); // slate-400
  doc.setFontSize(8);
  doc.text(`Datum: ${dateStr}`, 196, 26, { align: 'right' });

  // --- Recipe Title Card ---
  let y = 46;

  doc.setTextColor(15, 23, 42); // slate-900
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.text(recipe.title, 14, y);
  y += 7;

  if (recipe.description) {
    doc.setTextColor(71, 85, 105); // slate-600
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    const splitDesc = doc.splitTextToSize(recipe.description, 182);
    doc.text(splitDesc, 14, y);
    y += splitDesc.length * 4.5 + 3;
  } else {
    y += 2;
  }

  // --- Color Box & Hair Preview ---
  doc.setFillColor(248, 250, 252); // slate-50
  doc.setDrawColor(226, 232, 240); // slate-200
  doc.roundedRect(14, y, 182, 36, 3, 3, 'FD');

  // Color Swatch Target
  doc.setFillColor(targetRgb.r, targetRgb.g, targetRgb.b);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(18, y + 5, 26, 26, 2, 2, 'FD');

  // Swatch Info
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('Zielfarbe (Farbmischung)', 48, y + 12);

  doc.setTextColor(37, 99, 235);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text(recipe.targetHex.toUpperCase(), 48, y + 18);

  doc.setTextColor(100, 116, 139);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.text(`Portion: ca. ${recipe.totalBatchGrams || 5}g (Teststrähne ca. 1 TL / 5 ml)`, 48, y + 25);

  // Base Hair Color preview on the right
  doc.setFillColor(baseHairRgb.r, baseHairRgb.g, baseHairRgb.b);
  doc.roundedRect(144, y + 5, 16, 16, 2, 2, 'FD');

  doc.setTextColor(71, 85, 105);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('Ausgangshaar', 164, y + 11);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.text(baseHairHex.toUpperCase(), 164, y + 17);

  y += 42;

  // --- Mischverhältnis Banner ---
  doc.setFillColor(239, 246, 255); // blue-50
  doc.setDrawColor(191, 219, 254); // blue-200
  doc.roundedRect(14, y, 182, 12, 2, 2, 'FD');

  doc.setTextColor(30, 64, 175); // blue-800
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('Einfaches Mischverhältnis:', 18, y + 8);

  doc.setTextColor(30, 58, 138); // blue-900
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text(ratio, 80, y + 8);

  y += 18;

  // --- Tabelle Zutaten ---
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('Rezeptur & Löffelmaße', 14, y);
  y += 4;

  // Table Header
  doc.setFillColor(241, 245, 249); // slate-100
  doc.setDrawColor(226, 232, 240);
  doc.rect(14, y, 182, 8, 'FD');

  doc.setTextColor(71, 85, 105);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text('Zutat / Pigment', 18, y + 5.5);
  doc.text('Löffelmaß (Dosierung)', 115, y + 5.5);
  doc.text('Anteil (%)', 170, y + 5.5);

  y += 8;

  const rows = [
    {
      name: `Blau: ${cyan?.name || 'Echtes Blau Direct Dye'}`,
      colorRgb: { r: 37, g: 99, b: 235 },
      spoon: formatVolumeWithSpoonEstimate(recipe.ingredients.cyanGrams),
      percent: `${recipe.ingredients.cyanPercent}%`
    },
    {
      name: `Rot-Pink: ${magenta?.name || 'Kühles Rot/Magenta'}`,
      colorRgb: { r: 225, g: 29, b: 72 },
      spoon: formatVolumeWithSpoonEstimate(recipe.ingredients.magentaGrams),
      percent: `${recipe.ingredients.magentaPercent}%`
    },
    {
      name: `Gelb: ${yellow?.name || 'Leuchtendes Gelb'}`,
      colorRgb: { r: 250, g: 204, b: 21 },
      spoon: formatVolumeWithSpoonEstimate(recipe.ingredients.yellowGrams),
      percent: `${recipe.ingredients.yellowPercent}%`
    },
    {
      name: `Weiße Spülung: ${conditioner?.name || 'Weiße Haarspülung (#FFFFFF)'}`,
      colorRgb: { r: 255, g: 255, b: 255 },
      spoon: formatConditionerSpoonEstimate(recipe.ingredients.conditionerGrams),
      percent: `${recipe.ingredients.conditionerPercent}%`
    }
  ];

  rows.forEach((r, idx) => {
    if (idx % 2 === 1) {
      doc.setFillColor(248, 250, 252);
      doc.rect(14, y, 182, 10, 'F');
    }
    doc.setDrawColor(241, 245, 249);
    doc.line(14, y + 10, 196, y + 10);

    // Color dot
    doc.setFillColor(r.colorRgb.r, r.colorRgb.g, r.colorRgb.b);
    doc.setDrawColor(148, 163, 184);
    doc.circle(20, y + 5, 2.2, 'FD');

    // Name
    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text(r.name, 26, y + 6);

    // Spoon
    doc.setTextColor(37, 99, 235);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text(r.spoon, 115, y + 6);

    // Percent
    doc.setTextColor(100, 116, 139);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text(r.percent, 170, y + 6);

    y += 10;
  });

  y += 8;

  // --- Praxistipps & Dosierungshinweise Box ---
  doc.setFillColor(254, 243, 199); // amber-100
  doc.setDrawColor(251, 191, 36);  // amber-400
  doc.roundedRect(14, y, 182, 28, 2.5, 2.5, 'FD');

  doc.setTextColor(146, 64, 14); // amber-800
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('Praxistipps zur Anwendung & Dosierung:', 18, y + 6.5);

  doc.setTextColor(120, 53, 15);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text('• 1 TL = ca. 5 ml (Kaffeelöffel) | ½ TL = 2,5 ml | Spülung: 1 EL = 15 ml.', 18, y + 12);
  doc.text('• Bei winzigen Mengen unter ⅛ TL: Nur eine Messerspitze mit dem Färbepinsel oder Tropfen hinzugeben.', 18, y + 17);
  doc.text('• Direktzieher sind semi-transparent: Vorab immer eine Teststrähne an unauffälliger Haarpartie durchführen!', 18, y + 22);

  y += 36;

  // --- Tags (falls vorhanden) ---
  if (recipe.tags && recipe.tags.length > 0) {
    doc.setTextColor(100, 116, 139);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.text(`Tags: ${recipe.tags.map((t) => '#' + t).join('  ')}`, 14, y);
    y += 8;
  }

  // --- Footer ---
  doc.setDrawColor(226, 232, 240);
  doc.line(14, 280, 196, 280);

  doc.setTextColor(148, 163, 184);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text('Dino Color Lab 🦕 — Erstellt für nichtoxidative Direktzieher-Haarfarben', 14, 285);
  doc.text('by X4rinia & Dino', 196, 285, { align: 'right' });

  // Trigger browser PDF download
  const safeTitle = recipe.title.trim().replace(/[^a-zA-Z0-9äöüÄÖÜß_-]/g, '_') || 'Rezept';
  doc.save(`${safeTitle}_DinoColorLab.pdf`);
}

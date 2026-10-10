/**
 * Dino Color Lab - Einheiten- und Umrechnungslogik
 * Alltagstaugliche Maßeinheiten, Teelöffel-/Esslöffel-Umrechnung, Mischverhältnisse und Skalierung.
 */

import type { IngredientBreakdown, PigmentProfile, ConditionerProfile } from '../types';

export interface TeaspoonResult {
  canMeasureTeaspoon: boolean;
  teaspoonDisplay: string;
  fractionValue: number; // in ml of the closest spoon fraction
  diffMl: number; // difference in ml
  accuracyDescription: string;
  isAccurate: boolean;
  recommendation: string;
  recommendScaleOrSyringe: boolean;
}

export interface VolumeDisplayInfo {
  ml?: number;
  isApproximate: boolean;
  sourceText: string;
}

/**
 * Portionsgrößen für kleine Mengen (Pony, Sidecut, Strähne)
 * 2,5 ml | 5 ml (Standard) | 10 ml | 15 ml | 20 ml | Freie Eingabe
 */
export const SMALL_PORTION_VOLUME_PRESETS = [
  { id: '2.5', label: '2,5 ml', ml: 2.5, defaultGrams: 2.5, description: 'Sehr kleine Menge (z. B. feine Strähne)' },
  { id: '5', label: '5 ml (Standard)', ml: 5.0, defaultGrams: 5.0, isDefault: true, description: 'Standard-Menge für Pony oder Sidecut' },
  { id: '10', label: '10 ml', ml: 10.0, defaultGrams: 10.0, description: 'Dichterer Pony oder breiterer Sidecut' },
  { id: '15', label: '15 ml', ml: 15.0, defaultGrams: 15.0, description: 'Pony + Seitenpartien' },
  { id: '20', label: '20 ml', ml: 20.0, defaultGrams: 20.0, description: 'Ausführliche Teilpartie / Kurzhaardetails' }
] as const;

// Abwärtskompatibler Alias
export const TEST_STRAND_VOLUME_PRESETS = SMALL_PORTION_VOLUME_PRESETS;

/**
 * Wandelt ein Volumen in alltagstaugliche Teelöffel- oder Esslöffel-Einheiten um.
 * Basis:
 * - 1 EL = 15 ml (= 3 TL) -> besonders für weiße Spülung
 * - 1 TL = 5 ml
 * - ½ TL = 2,5 ml
 * - ¼ TL = 1,25 ml
 * - ⅛ TL = 0,625 ml
 */
export function calculateTeaspoonAmount(
  volumeMl: number | undefined,
  grams: number,
  densityGPerMl?: number,
  isConditioner: boolean = false
): TeaspoonResult {
  const ml = volumeMl !== undefined ? volumeMl : (densityGPerMl && densityGPerMl > 0 ? grams / densityGPerMl : grams);

  if (ml <= 0.001) {
    return {
      canMeasureTeaspoon: false,
      teaspoonDisplay: '0',
      fractionValue: 0,
      diffMl: 0,
      accuracyDescription: 'Keine Zugabe',
      isAccurate: true,
      recommendation: 'Diese Zutat wird für die Nuance nicht benötigt.',
      recommendScaleOrSyringe: false
    };
  }

  // Für Spülung bei größeren Mengen ab 15 ml Esslöffel (1 EL = 15 ml)
  if (isConditioner && ml >= 13.5) {
    if (ml >= 13.5 && ml < 17.5) {
      return {
        canMeasureTeaspoon: true,
        teaspoonDisplay: '1 EL',
        fractionValue: 15,
        diffMl: Math.round((ml - 15) * 100) / 100,
        accuracyDescription: '1 gestrichener Esslöffel (15 ml)',
        isAccurate: Math.abs(ml - 15) <= 1.0,
        recommendation: '1 gestrichener Esslöffel Spülung.',
        recommendScaleOrSyringe: false
      };
    }
    if (ml >= 17.5 && ml < 22.5) {
      return {
        canMeasureTeaspoon: true,
        teaspoonDisplay: '1 EL + 1 TL',
        fractionValue: 20,
        diffMl: Math.round((ml - 20) * 100) / 100,
        accuracyDescription: '1 EL (15 ml) + 1 TL (5 ml) = 20 ml',
        isAccurate: Math.abs(ml - 20) <= 1.0,
        recommendation: '1 Esslöffel plus 1 Teelöffel Spülung.',
        recommendScaleOrSyringe: false
      };
    }
    if (ml >= 22.5 && ml < 27.5) {
      return {
        canMeasureTeaspoon: true,
        teaspoonDisplay: 'ca. 1 ½ EL',
        fractionValue: 22.5,
        diffMl: Math.round((ml - 22.5) * 100) / 100,
        accuracyDescription: 'ca. 1 ½ Esslöffel',
        isAccurate: Math.abs(ml - 22.5) <= 1.5,
        recommendation: '1 ½ Esslöffel Spülung.',
        recommendScaleOrSyringe: false
      };
    }
    const tbsp = Math.round(ml / 15);
    return {
      canMeasureTeaspoon: true,
      teaspoonDisplay: `${tbsp} EL`,
      fractionValue: tbsp * 15,
      diffMl: Math.round((ml - tbsp * 15) * 100) / 100,
      accuracyDescription: `${tbsp} Esslöffel (${tbsp * 15} ml)`,
      isAccurate: Math.abs(ml - tbsp * 15) <= 2.0,
      recommendation: `${tbsp} Esslöffel Spülung.`,
      recommendScaleOrSyringe: false
    };
  }

  // Bei Mengen unter 0,4 ml (wenige Tropfen bzw. Messerspitze)
  if (ml < 0.4) {
    return {
      canMeasureTeaspoon: false,
      teaspoonDisplay: '< ⅛ TL (Tropfen/Spitze)',
      fractionValue: 0.25,
      diffMl: Math.round((0.25 - ml) * 1000) / 1000,
      accuracyDescription: 'Sehr kleine Menge',
      isAccurate: false,
      recommendation: 'Nur wenige Tropfen bzw. eine Messerspitze hinzugeben (oder eine 1-ml-Dosierspritze nutzen).',
      recommendScaleOrSyringe: false
    };
  }

  // Praktische, haushaltsübliche Löffelmaße:
  // 1 TL (5 ml), ¾ TL (3,75 ml), ⅔ TL (3,33 ml), ½ TL (2,5 ml), ⅓ TL (1,67 ml), ¼ TL (1,25 ml), ⅛ TL (0,625 ml)
  // Keine komplexen Brüche wie ⅜, ⅝ oder ⅞!
  const wholeTsp = Math.floor(ml / 5.0);
  const remainder = ml - wholeTsp * 5.0;

  interface SpoonFraction {
    text: string;
    ml: number;
    isWholeNext?: boolean;
  }

  const getSimpleFraction = (r: number): SpoonFraction => {
    if (r < 0.3) return { text: '', ml: 0 };
    if (r < 0.95) return { text: '⅛ TL', ml: 0.625 };
    if (r < 1.45) return { text: '¼ TL', ml: 1.25 };
    if (r < 2.05) return { text: '⅓ TL', ml: 1.67 };
    if (r < 2.90) return { text: '½ TL', ml: 2.50 };
    if (r < 3.50) return { text: '⅔ TL', ml: 3.33 };
    if (r < 4.40) return { text: '¾ TL', ml: 3.75 };
    return { text: '1 TL', ml: 5.0, isWholeNext: true };
  };

  const fraction = getSimpleFraction(remainder);

  let fractionText = '';
  let approxMl = 0;

  if (fraction.isWholeNext) {
    const finalWhole = wholeTsp + 1;
    fractionText = `${finalWhole} TL`;
    approxMl = finalWhole * 5.0;
  } else if (wholeTsp > 0) {
    if (fraction.text) {
      fractionText = `${wholeTsp} ${fraction.text}`;
      approxMl = wholeTsp * 5.0 + fraction.ml;
    } else {
      fractionText = `${wholeTsp} TL`;
      approxMl = wholeTsp * 5.0;
    }
  } else {
    fractionText = fraction.text || '¼ TL';
    approxMl = fraction.ml || 1.25;
  }

  const diffMl = Math.round((ml - approxMl) * 100) / 100;
  const absDiff = Math.abs(diffMl);
  const isAccurate = absDiff <= 0.25;

  let accuracyDescription = 'Exakt passend';
  if (absDiff > 0.05 && absDiff <= 0.4) {
    accuracyDescription = `Gute Näherung (${diffMl > 0 ? '+' : ''}${diffMl.toFixed(1)} ml)`;
  } else if (absDiff > 0.4) {
    accuracyDescription = `Grobe Schätzung (${diffMl > 0 ? '+' : ''}${diffMl.toFixed(1)} ml)`;
  }

  const recommendScaleOrSyringe = ml < 2.5;

  return {
    canMeasureTeaspoon: true,
    teaspoonDisplay: fractionText,
    fractionValue: approxMl,
    diffMl,
    accuracyDescription,
    isAccurate,
    recommendation: ml < 2.5 ? 'Dosierspritze (1–2 ml) oder Feinwaage empfohlen.' : 'Löffel mit Messerrücken glatt abstreifen.',
    recommendScaleOrSyringe
  };
}

/**
 * Hilfsfunktion: Gibt die Teelöffel-Schätzung für Farbpigmente zurück
 */
export function formatVolumeWithSpoonEstimate(grams: number, densityGPerMl?: number): string {
  const res = calculateTeaspoonAmount(undefined, grams, densityGPerMl || 1.0, false);
  return res.teaspoonDisplay;
}

/**
 * Hilfsfunktion: Gibt die Esslöffel/Teelöffel-Schätzung für Spülung zurück
 */
export function formatConditionerSpoonEstimate(grams: number, densityGPerMl?: number): string {
  const res = calculateTeaspoonAmount(undefined, grams, densityGPerMl || 1.0, true);
  return res.teaspoonDisplay;
}

/**
 * Berechnet ein einfaches, verständliches Mischverhältnis (z. B. "1 Teil Blau : 2 Teile Spülung")
 */
export function calculateSimpleRatio(
  cyanG: number,
  magentaG: number,
  yellowG: number,
  conditionerG: number
): string {
  const parts: { name: string; amount: number }[] = [];
  if (cyanG > 0.01) parts.push({ name: 'Blau', amount: cyanG });
  if (magentaG > 0.01) parts.push({ name: 'Rot/Pink', amount: magentaG });
  if (yellowG > 0.01) parts.push({ name: 'Gelb', amount: yellowG });
  if (conditionerG > 0.01) parts.push({ name: 'Weiße Spülung', amount: conditionerG });

  if (parts.length === 0) return '100% Farbpigmente';

  // Finde kleinsten Farbteil
  const minAmount = Math.min(...parts.map((p) => p.amount));
  if (minAmount <= 0.001) return 'Reine Farbe';

  const ratioStrings = parts.map((p) => {
    const ratioVal = Math.round((p.amount / minAmount) * 2) / 2; // runde auf 0.5
    const ratioFormatted = ratioVal % 1 === 0 ? ratioVal.toString() : ratioVal.toFixed(1);
    return `${ratioFormatted} ${ratioVal === 1 ? 'Teil' : 'Teile'} ${p.name}`;
  });

  return ratioStrings.join(' + ');
}

/**
 * Ermittelt Volumen und Dichte-Status für ein Pigment
 */
export function getVolumeDisplay(
  grams: number,
  profile?: PigmentProfile | ConditionerProfile,
  fallbackVolumeMl?: number
): VolumeDisplayInfo {
  if (profile?.densityGPerMl && profile.densityGPerMl > 0) {
    const ml = Math.round((grams / profile.densityGPerMl) * 100) / 100;
    return {
      ml,
      isApproximate: false,
      sourceText: `Berechnet aus Dichte (${profile.densityGPerMl} g/ml)`
    };
  }

  if (fallbackVolumeMl !== undefined) {
    return {
      ml: fallbackVolumeMl,
      isApproximate: true,
      sourceText: 'Näherungswert (ca. 1,0 g = 1,0 ml)'
    };
  }

  return {
    ml: undefined,
    isApproximate: true,
    sourceText: 'Kein Dichtewert hinterlegt'
  };
}

/**
 * Skaliert eine Rezeptur automatisch auf eine neue Gesamtmasse
 */
export function scaleRecipeIngredients(
  source: IngredientBreakdown,
  targetGrams: number,
  cyanDensity?: number,
  magentaDensity?: number,
  yellowDensity?: number,
  conditionerDensity?: number,
  precision: 0.1 | 0.01 = 0.1
): IngredientBreakdown {
  const currentTotal = Math.max(0.1, source.totalGrams);
  const factor = targetGrams / currentTotal;

  const roundVal = (val: number) => Math.round(val / precision) * precision;

  let cyanG = roundVal(source.cyanGrams * factor);
  let magG = roundVal(source.magentaGrams * factor);
  let yelG = roundVal(source.yellowGrams * factor);
  let condG = roundVal(source.conditionerGrams * factor);

  const currentSum = roundVal(cyanG + magG + yelG + condG);
  const diff = roundVal(targetGrams - currentSum);

  if (Math.abs(diff) > 0.0001) {
    const items = [
      { key: 'cond', val: condG },
      { key: 'cyan', val: cyanG },
      { key: 'mag', val: magG },
      { key: 'yel', val: yelG }
    ].sort((a, b) => b.val - a.val);

    if (items[0].key === 'cond') condG = roundVal(condG + diff);
    else if (items[0].key === 'cyan') cyanG = roundVal(cyanG + diff);
    else if (items[0].key === 'mag') magG = roundVal(magG + diff);
    else if (items[0].key === 'yel') yelG = roundVal(yelG + diff);
  }

  const cyanPercent = Math.round((cyanG / targetGrams) * 100 * 10) / 10;
  const magentaPercent = Math.round((magG / targetGrams) * 100 * 10) / 10;
  const yellowPercent = Math.round((yelG / targetGrams) * 100 * 10) / 10;
  const conditionerPercent = Math.round((condG / targetGrams) * 100 * 10) / 10;

  const cyanMl = cyanDensity ? Math.round((cyanG / cyanDensity) * 100) / 100 : undefined;
  const magentaMl = magentaDensity ? Math.round((magG / magentaDensity) * 100) / 100 : undefined;
  const yellowMl = yellowDensity ? Math.round((yelG / yellowDensity) * 100) / 100 : undefined;
  const conditionerMl = conditionerDensity ? Math.round((condG / conditionerDensity) * 100) / 100 : undefined;

  return {
    cyanGrams: cyanG,
    magentaGrams: magG,
    yellowGrams: yelG,
    conditionerGrams: condG,
    cyanPercent,
    magentaPercent,
    yellowPercent,
    conditionerPercent,
    cyanMl,
    magentaMl,
    yellowMl,
    conditionerMl,
    totalGrams: targetGrams
  };
}

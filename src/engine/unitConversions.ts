/**
 * Dino Color Lab - Einheiten- und Umrechnungslogik
 * Alltagstaugliche Maßeinheiten, Teelöffel-Umrechnung und Skalierung.
 */

import type { IngredientBreakdown, PigmentProfile, ConditionerProfile } from '../types';

export interface TeaspoonResult {
  canMeasureTeaspoon: boolean;
  teaspoonDisplay: string;
  fractionValue: number; // in ml of the closest spoon fraction
  diffMl: number; // difference in ml
  accuracyDescription: string;
  isAccurate: boolean; // within 0.1 ml
  recommendation: string;
  recommendScaleOrSyringe: boolean;
}

export interface VolumeDisplayInfo {
  ml?: number;
  isApproximate: boolean;
  sourceText: string;
}

export const TEST_STRAND_VOLUME_PRESETS = [
  { id: '2.5', label: '2,5 ml', ml: 2.5, defaultGrams: 2.5, description: 'Sehr sparsame kleine Strähne (1 cm)' },
  { id: '5', label: '5 ml (Standard)', ml: 5.0, defaultGrams: 5.0, isDefault: true, description: 'Standard-Menge für 1–2 cm Strähne' },
  { id: '10', label: '10 ml', ml: 10.0, defaultGrams: 10.0, description: 'Für längere oder kräftigere Strähnen' },
  { id: '15', label: '15 ml', ml: 15.0, defaultGrams: 15.0, description: 'Großzügige Testpartie' },
  { id: '25', label: '25 ml', ml: 25.0, defaultGrams: 25.0, description: 'Sehr breite Strähne / halber Pony' }
] as const;

/**
 * Wandelt ein Volumen in alltagstaugliche Teelöffel-Einheiten um.
 * Basis:
 * - 1 TL = 5 ml
 * - ½ TL = 2,5 ml
 * - ¼ TL = 1,25 ml
 * - ⅛ TL = 0,625 ml
 *
 * Wenn keine Dichte vorliegt, wird keine Teelöffelumrechnung aus Gramm vorgenommen.
 */
export function calculateTeaspoonAmount(
  volumeMl: number | undefined,
  grams: number,
  densityGPerMl?: number
): TeaspoonResult {
  // Wenn kein Dichtewert hinterlegt ist und kein Volumen bekannt ist:
  // Keine scheinexakten Gramm-zu-Löffel-Werte!
  if (volumeMl === undefined && (densityGPerMl === undefined || densityGPerMl <= 0)) {
    return {
      canMeasureTeaspoon: false,
      teaspoonDisplay: '—',
      fractionValue: 0,
      diffMl: 0,
      accuracyDescription: 'Dichte unbekannt',
      isAccurate: false,
      recommendation: `Für dieses Produkt ist kein Dichtewert hinterlegt. Bitte ausschließlich mit der Feinwaage (${grams} g) abwiegen, um Messfehler zu vermeiden.`,
      recommendScaleOrSyringe: true
    };
  }

  const ml = volumeMl !== undefined ? volumeMl : grams / (densityGPerMl || 1.0);

  if (ml <= 0.001) {
    return {
      canMeasureTeaspoon: false,
      teaspoonDisplay: '0 TL',
      fractionValue: 0,
      diffMl: 0,
      accuracyDescription: 'Keine Zugabe',
      isAccurate: true,
      recommendation: 'Diese Zutat wird für die Nuance nicht benötigt.',
      recommendScaleOrSyringe: false
    };
  }

  // Bei Mengen unter 0,625 ml (⅛ TL) ist ein Küchenteelöffel völlig ungeeignet
  if (ml < 0.625) {
    return {
      canMeasureTeaspoon: false,
      teaspoonDisplay: '< ⅛ TL',
      fractionValue: 0.625,
      diffMl: Math.round((0.625 - ml) * 1000) / 1000,
      accuracyDescription: 'Zu gering für Teelöffel',
      isAccurate: false,
      recommendation: `Kleinstmenge (${ml.toFixed(2)} ml): Teelöffel sind viel zu grob! Bitte eine 1 ml-Dosierspritze oder eine 0,01g-Feinwaage nutzen.`,
      recommendScaleOrSyringe: true
    };
  }

  // Multiplikator für ⅛ TL = 0,625 ml
  const eighths = Math.round(ml / 0.625);
  const approxMl = eighths * 0.625;
  const diffMl = Math.round((ml - approxMl) * 100) / 100;
  const absDiff = Math.abs(diffMl);

  const isAccurate = absDiff <= 0.1;

  let fractionText = '';
  const wholeTsp = Math.floor(eighths / 8);
  const remainderEighths = eighths % 8;

  let remainderText = '';
  switch (remainderEighths) {
    case 1:
      remainderText = '⅛ TL';
      break;
    case 2:
      remainderText = '¼ TL';
      break;
    case 3:
      remainderText = 'ca. ⅜ TL';
      break;
    case 4:
      remainderText = '½ TL';
      break;
    case 5:
      remainderText = 'ca. ⅝ TL';
      break;
    case 6:
      remainderText = '¾ TL';
      break;
    case 7:
      remainderText = 'ca. ⅞ TL';
      break;
    default:
      remainderText = '';
      break;
  }

  if (wholeTsp > 0) {
    if (remainderText) {
      fractionText = `${wholeTsp} ${remainderText}`;
    } else {
      fractionText = `${wholeTsp} TL`;
    }
  } else {
    fractionText = remainderText || '⅛ TL';
  }

  let accuracyDescription = 'Exakt (±0,05 ml)';
  if (absDiff > 0.05 && absDiff <= 0.25) {
    accuracyDescription = `Gute Näherung (${diffMl > 0 ? '+' : ''}${diffMl.toFixed(1)} ml)`;
  } else if (absDiff > 0.25) {
    accuracyDescription = `Grobe Schätzung (${diffMl > 0 ? '+' : ''}${diffMl.toFixed(1)} ml)`;
  }

  const recommendScaleOrSyringe = ml < 2.5;

  let recommendation = '';
  if (ml < 2.5) {
    recommendation = 'Kleine Menge: Für beste Farbgenauigkeit eine Dosierspritze (1–2 ml) oder Feinwaage nutzen.';
  } else {
    recommendation = 'Löffel mit Messerrücken glatt abstreichen. Für exakte Reproduzierbarkeit Waage bevorzugen.';
  }

  return {
    canMeasureTeaspoon: true,
    teaspoonDisplay: fractionText,
    fractionValue: approxMl,
    diffMl,
    accuracyDescription,
    isAccurate,
    recommendation,
    recommendScaleOrSyringe
  };
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
      sourceText: 'Näherungswert (ohne spezifische Produktdichte)'
    };
  }

  return {
    ml: undefined,
    isApproximate: true,
    sourceText: 'Kein Dichtewert hinterlegt'
  };
}

/**
 * Skaliert eine Rezeptur automatisch auf eine neue Gesamtmasse (z.B. von 5g Teststrähne auf 100g Vollanwendung)
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

  // Exakte Summe sicherstellen
  const currentSum = roundVal(cyanG + magG + yelG + condG);
  const diff = roundVal(targetGrams - currentSum);

  if (Math.abs(diff) > 0.0001) {
    // Differenz auf die größte Zutat anwenden
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

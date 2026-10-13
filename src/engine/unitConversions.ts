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
  { id: '40', label: '40 ml (Standard)', ml: 40.0, defaultGrams: 40.0, isDefault: true, description: 'Standard-Menge wie im Schälchen (40 ml / ca. 2 EL + 2 TL)' },
  { id: '20', label: '20 ml', ml: 20.0, defaultGrams: 20.0, description: 'Halbe Portion / Feine Strähnen (20 ml)' },
  { id: '60', label: '60 ml', ml: 60.0, defaultGrams: 60.0, description: 'Größere Partie / Ganze Tube (60 ml)' },
  { id: '10', label: '10 ml', ml: 10.0, defaultGrams: 10.0, description: 'Kleine Teststrähne (10 ml)' },
  { id: '2.5', label: '2,5 ml', ml: 2.5, defaultGrams: 2.5, description: 'Mini-Test (ca. ½ TL)' }
] as const;

// Abwärtskompatibler Alias
export const TEST_STRAND_VOLUME_PRESETS = SMALL_PORTION_VOLUME_PRESETS;

/**
 * Wandelt ein Volumen in alltagstaugliche Teelöffel- oder Esslöffel-Einheiten um.
 * Basis:
 * - 1 EL = 15 ml (= 3 TL) -> besonders für Spülung und größere Farbmengen
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
      teaspoonDisplay: '–',
      fractionValue: 0,
      diffMl: 0,
      accuracyDescription: 'Keine Zugabe',
      isAccurate: true,
      recommendation: 'Diese Zutat wird für die Nuance nicht benötigt.',
      recommendScaleOrSyringe: false
    };
  }

  // Für größere Mengen ab 13.5 ml Esslöffel (1 EL = 15 ml, 1 TL = 5 ml)
  if (ml >= 13.5) {
    if (ml >= 13.5 && ml < 17.5) {
      return {
        canMeasureTeaspoon: true,
        teaspoonDisplay: '1 EL',
        fractionValue: 15,
        diffMl: Math.round((ml - 15) * 100) / 100,
        accuracyDescription: '1 gestrichener Esslöffel (15 ml)',
        isAccurate: Math.abs(ml - 15) <= 1.0,
        recommendation: `1 gestrichener Esslöffel ${isConditioner ? 'Spülung' : 'Farbe'}.`,
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
        recommendation: `1 Esslöffel plus 1 Teelöffel ${isConditioner ? 'Spülung' : 'Farbe'}.`,
        recommendScaleOrSyringe: false
      };
    }
    if (ml >= 22.5 && ml < 27.5) {
      return {
        canMeasureTeaspoon: true,
        teaspoonDisplay: 'ca. 1 ½ EL',
        fractionValue: 22.5,
        diffMl: Math.round((ml - 22.5) * 100) / 100,
        accuracyDescription: 'ca. 1 ½ Esslöffel (25 ml)',
        isAccurate: Math.abs(ml - 22.5) <= 1.5,
        recommendation: `1 ½ Esslöffel ${isConditioner ? 'Spülung' : 'Farbe'}.`,
        recommendScaleOrSyringe: false
      };
    }
    if (ml >= 27.5 && ml < 32.5) {
      return {
        canMeasureTeaspoon: true,
        teaspoonDisplay: '2 EL',
        fractionValue: 30,
        diffMl: Math.round((ml - 30) * 100) / 100,
        accuracyDescription: '2 Esslöffel (30 ml)',
        isAccurate: Math.abs(ml - 30) <= 1.5,
        recommendation: `2 gestrichene Esslöffel ${isConditioner ? 'Spülung' : 'Farbe'}.`,
        recommendScaleOrSyringe: false
      };
    }
    if (ml >= 32.5 && ml < 37.5) {
      return {
        canMeasureTeaspoon: true,
        teaspoonDisplay: '2 EL + 1 TL',
        fractionValue: 35,
        diffMl: Math.round((ml - 35) * 100) / 100,
        accuracyDescription: '2 EL (30 ml) + 1 TL (5 ml) = 35 ml',
        isAccurate: Math.abs(ml - 35) <= 1.5,
        recommendation: `2 Esslöffel plus 1 Teelöffel ${isConditioner ? 'Spülung' : 'Farbe'}.`,
        recommendScaleOrSyringe: false
      };
    }
    if (ml >= 37.5 && ml < 42.5) {
      return {
        canMeasureTeaspoon: true,
        teaspoonDisplay: '2 EL + 2 TL',
        fractionValue: 40,
        diffMl: Math.round((ml - 40) * 100) / 100,
        accuracyDescription: '2 EL (30 ml) + 2 TL (10 ml) = 40 ml',
        isAccurate: Math.abs(ml - 40) <= 1.5,
        recommendation: `2 Esslöffel plus 2 Teelöffel ${isConditioner ? 'Spülung' : 'Farbe'}.`,
        recommendScaleOrSyringe: false
      };
    }
    const tbsp = Math.floor(ml / 15);
    const remTsp = Math.round((ml - tbsp * 15) / 5);
    const text = remTsp > 0 ? `${tbsp} EL + ${remTsp} TL` : `${tbsp} EL`;
    const approxVal = tbsp * 15 + remTsp * 5;
    return {
      canMeasureTeaspoon: true,
      teaspoonDisplay: text,
      fractionValue: approxVal,
      diffMl: Math.round((ml - approxVal) * 100) / 100,
      accuracyDescription: `${text} (ca. ${approxVal} ml)`,
      isAccurate: Math.abs(ml - approxVal) <= 2.0,
      recommendation: `${text} ${isConditioner ? 'Spülung' : 'Farbe'}.`,
      recommendScaleOrSyringe: false
    };
  }

  // Bei Mengen unter 0.8 ml (weniger als ¼ TL: wenige Tropfen bzw. Messerspitze)
  if (ml < 0.8) {
    return {
      canMeasureTeaspoon: false,
      teaspoonDisplay: '< ¼ TL (wenige Tropfen)',
      fractionValue: 0.5,
      diffMl: Math.round((0.5 - ml) * 100) / 100,
      accuracyDescription: 'Sehr kleine Menge',
      isAccurate: false,
      recommendation: 'Nur wenige Tropfen bzw. eine Messerspitze hinzugeben (oder eine 1-ml-Dosierspritze nutzen).',
      recommendScaleOrSyringe: false
    };
  }

  // Ausschließlich alltagstaugliche Löffelmaße:
  // Nur 1 TL, ½ TL, ⅓ TL, ¼ TL (und Kombinationen wie ½ TL + ¼ TL)!
  // Keine exotischen Brüche wie ⅔, ¾, ⅛, ⅜, ⅝ oder ⅞.
  const wholeTsp = Math.floor(ml / 5.0);
  const remainder = ml - wholeTsp * 5.0;

  interface SpoonFraction {
    text: string;
    ml: number;
    isWholeNext?: boolean;
  }

  const getStrictSimpleFraction = (r: number): SpoonFraction => {
    if (r < 0.5) return { text: '', ml: 0 };
    if (r < 1.45) return { text: '¼ TL', ml: 1.25 };
    if (r < 2.05) return { text: '⅓ TL', ml: 1.67 };
    if (r < 3.10) return { text: '½ TL', ml: 2.50 };
    if (r < 4.35) return { text: '½ TL + ¼ TL', ml: 3.75 };
    return { text: '1 TL', ml: 5.0, isWholeNext: true };
  };

  const fraction = getStrictSimpleFraction(remainder);

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
  const isAccurate = absDiff <= 0.35;

  let accuracyDescription = 'Exakt passend';
  if (absDiff > 0.05 && absDiff <= 0.5) {
    accuracyDescription = `Gute Näherung (${diffMl > 0 ? '+' : ''}${diffMl.toFixed(1)} ml)`;
  } else if (absDiff > 0.5) {
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
  if (magentaG > 0.01) parts.push({ name: 'Pinkstichiges Rot', amount: magentaG });
  if (yellowG > 0.01) parts.push({ name: 'Gelb', amount: yellowG });
  if (conditionerG > 0.01) parts.push({ name: 'Weiße Spülung', amount: conditionerG });

  if (parts.length === 0) return '100% Farbpigmente';
  if (parts.length === 1 && parts[0].name === 'Weiße Spülung') return '100% Weiße Spülung (Pur)';
  if (parts.length === 1) return `100% ${parts[0].name}`;

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

  // Die prozentuale Rezeptur-Zusammensetzung bleibt beim Hochskalieren (z. B. doppelte Menge) unverändert!
  const cyanPercent = source.cyanPercent;
  const magentaPercent = source.magentaPercent;
  const yellowPercent = source.yellowPercent;
  const conditionerPercent = source.conditionerPercent;

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

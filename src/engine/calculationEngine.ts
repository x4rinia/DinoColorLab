import type {
  CalculationInput,
  CalculationResult,
  PigmentProfile,
  ConditionerProfile,
  StrandTest,
  CalibrationSet,
  IngredientBreakdown,
  CalculationMode
} from '../types';
import {
  calculateDeltaE,
  normalizeHex,
  hexToRgb,
  BASE_HAIR_COLORS,
  calculateResultOnHair
} from './colorMath';

export interface EngineOptions {
  roundingPrecision?: 0.1 | 0.01;
}

export function calculateRecipe(
  input: CalculationInput,
  cyanPigment: PigmentProfile,
  magentaPigment: PigmentProfile,
  yellowPigment: PigmentProfile,
  conditioner?: ConditionerProfile,
  strandTests: StrandTest[] = [],
  _calibrationSets: CalibrationSet[] = [],
  options: EngineOptions = {}
): CalculationResult {
  const precision = options.roundingPrecision ?? 0.1;
  const targetHex = normalizeHex(input.targetHex);
  const totalGrams = Math.max(1, input.totalBatchGrams);
  const maxConditionerRatio = Math.max(0, Math.min(1.0, input.maxConditionerRatioPercent / 100));

  const matchingTests = strandTests.filter(
    (st) =>
      st.cyanPigmentId === cyanPigment.id &&
      st.magentaPigmentId === magentaPigment.id &&
      st.yellowPigmentId === yellowPigment.id &&
      st.baseHairColor.levelKey === input.baseHairColor.levelKey
  );

  const isFullyCalibrated =
    !cyanPigment.isDemo &&
    !magentaPigment.isDemo &&
    (cyanPigment.status === 'calibrated' || matchingTests.length >= 2);

  const mode: CalculationMode = isFullyCalibrated ? 'calibrated' : 'demo_experimental';

  const baseHairHex = input.baseHairColor.hex || BASE_HAIR_COLORS[input.baseHairColor.levelKey]?.hex || '#fffbeb';

  let gainC = 1.0 / (cyanPigment.intensity || 1.0);
  let gainM = 1.0 / (magentaPigment.intensity || 1.0);
  let gainY = 1.0 / (yellowPigment.intensity || 1.0);

  let confidenceScore = mode === 'calibrated' ? 85 : 40;
  let isExtrapolated = false;
  let calibrationNotes: string | undefined = undefined;

  if (matchingTests.length > 0) {
    confidenceScore = Math.min(95, 60 + matchingTests.length * 10);
    calibrationNotes = `Basierend auf ${matchingTests.length} dokumentierten Teststrähnen.`;
  }

  const targetRgb = hexToRgb(targetHex);
  const baseRgb = hexToRgb(baseHairHex);

  const targetBrightness = (targetRgb.r + targetRgb.g + targetRgb.b) / (255 * 3);
  const baseBrightness = (baseRgb.r + baseRgb.g + baseRgb.b) / (255 * 3);

  const isLighterThanBase = targetBrightness > baseBrightness + 0.05;

  // Chromatische Farbzerlegung für Direktzieher
  // Blau absorbiert Rot (max - normR)
  // Rot-Pink absorbiert Grün (max - normG)
  // Gelb absorbiert Blau (max - normB)
  const normR = targetRgb.r / 255;
  const normG = targetRgb.g / 255;
  const normB = targetRgb.b / 255;

  // Subtraktive Pigment-Absorption für Direktzieher (CMY):
  // Blau (Cyan) absorbiert Rot: (1 - normR)
  // Rot-Pink (Magenta) absorbiert Grün: (1 - normG)
  // Gelb (Yellow) absorbiert Blau: (1 - normB)
  const pigmentC = Math.max(0, 1 - normR);
  const pigmentM = Math.max(0, 1 - normG);
  const pigmentY = Math.max(0, 1 - normB);

  // Exakte Synchronisation mit den Farbreglern (Ganze Prozentpunkte 0–100%):
  // Wenn der Farbregler 0% anzeigt (oder < 0.5%), ist der Zutat-Anteil STRIKT 0%!
  const pctC = Math.round(pigmentC * 100);
  const pctM = Math.round(pigmentM * 100);
  const pctY = Math.round(pigmentY * 100);

  const pC = pctC === 0 ? 0 : pctC / 100;
  const pM = pctM === 0 ? 0 : pctM / 100;
  const pY = pctY === 0 ? 0 : pctY / 100;

  const pigmentSum = pC + pM + pY;

  let calcConditionerRatio = 0;

  if (maxConditionerRatio === 0) {
    calcConditionerRatio = 0;
  }
  // 1. Reines Weiß / keine Pigmente (pctSum === 0): 100% reine Spülung!
  else if (pigmentSum === 0) {
    calcConditionerRatio = 1.0;
  }
  // 2. Tiefes Schwarz: 100% Pigmentdichte, keine Spülung
  else if (targetBrightness < 0.16 || (targetRgb.r < 30 && targetRgb.g < 30 && targetRgb.b < 30)) {
    calcConditionerRatio = 0;
  }
  // 3. Pastell, mittlere und kräftige Nuancen:
  else {
    if (pigmentSum <= 0.90) {
      // Pastelltöne & helle Nuancen: Spülung macht exakt den Rest bis 100% aus
      calcConditionerRatio = Math.max(0, 1 - pigmentSum);
    } else {
      // Kräftige / vollgesättigte Farben: ca. 10% Streckanteil Spülung
      const baseStretch = 0.10;
      calcConditionerRatio = baseStretch;
    }
    calcConditionerRatio = Math.min(calcConditionerRatio, maxConditionerRatio);
  }

  const pigmentMassFraction = 1 - calcConditionerRatio;

  let cFrac = 0;
  let mFrac = 0;
  let yFrac = 0;

  if (pigmentSum > 0) {
    if (pigmentSum <= 0.90 && calcConditionerRatio === (1 - pigmentSum)) {
      // Direkte 1:1 Übereinstimmung mit den Farbregler-Prozenten
      cFrac = pC;
      mFrac = pM;
      yFrac = pY;
    } else {
      // Proportionale Skalierung auf die verfügbare Pigmentmasse
      cFrac = (pC / pigmentSum) * pigmentMassFraction;
      mFrac = (pM / pigmentSum) * pigmentMassFraction;
      yFrac = (pY / pigmentSum) * pigmentMassFraction;
    }

    // Falls kalibrierte Pigment-Intensitäten vorliegen:
    if (mode === 'calibrated') {
      const rawC = cFrac * gainC;
      const rawM = mFrac * gainM;
      const rawY = yFrac * gainY;
      const rawSum = rawC + rawM + rawY;
      if (rawSum > 0) {
        cFrac = (rawC / rawSum) * pigmentMassFraction;
        mFrac = (rawM / rawSum) * pigmentMassFraction;
        yFrac = (rawY / rawSum) * pigmentMassFraction;
      }
    }
  }

  const condFrac = calcConditionerRatio;

  let rawCyanG = cFrac * totalGrams;
  let rawMagG = mFrac * totalGrams;
  let rawYelG = yFrac * totalGrams;
  let rawCondG = condFrac * totalGrams;

  const roundVal = (val: number) => Math.round((Math.round(val / precision) * precision) * 1000) / 1000;

  let cyanG = roundVal(rawCyanG);
  let magG = roundVal(rawMagG);
  let yelG = roundVal(rawYelG);
  let condG = roundVal(rawCondG);

  // Strikte 0-Garantie: Wenn Regler 0% ist, sind die Gramm zwingend 0.0g!
  if (pC === 0) cyanG = 0;
  if (pM === 0) magG = 0;
  if (pY === 0) yelG = 0;
  if (calcConditionerRatio === 0) condG = 0;

  // Ausgleich für Rundungsdifferenzen (stets auf Spülung oder das größte aktive Pigment):
  if (condG > 0) {
    condG = roundVal(totalGrams - (cyanG + magG + yelG));
  } else {
    const diff = roundVal(totalGrams - (cyanG + magG + yelG));
    if (Math.abs(diff) > 0.001) {
      const activePigments = [
        { key: 'cyan', val: cyanG },
        { key: 'mag', val: magG },
        { key: 'yel', val: yelG }
      ].filter((p) => p.val > 0);
      if (activePigments.length > 0) {
        activePigments.sort((a, b) => b.val - a.val);
        const biggest = activePigments[0].key;
        if (biggest === 'cyan') cyanG = roundVal(cyanG + diff);
        else if (biggest === 'mag') magG = roundVal(magG + diff);
        else if (biggest === 'yel') yelG = roundVal(yelG + diff);
      }
    }
  }

  const cyanPercent = totalGrams > 0 ? Math.round((cyanG / totalGrams) * 100 * 10) / 10 : 0;
  const magentaPercent = totalGrams > 0 ? Math.round((magG / totalGrams) * 100 * 10) / 10 : 0;
  const yellowPercent = totalGrams > 0 ? Math.round((yelG / totalGrams) * 100 * 10) / 10 : 0;
  const conditionerPercent = totalGrams > 0 ? Math.round((condG / totalGrams) * 100 * 10) / 10 : 0;

  const cyanMl = cyanPigment.densityGPerMl ? Math.round((cyanG / cyanPigment.densityGPerMl) * 100) / 100 : undefined;
  const magentaMl = magentaPigment.densityGPerMl ? Math.round((magG / magentaPigment.densityGPerMl) * 100) / 100 : undefined;
  const yellowMl = yellowPigment.densityGPerMl ? Math.round((yelG / yellowPigment.densityGPerMl) * 100) / 100 : undefined;
  const conditionerMl = conditioner?.densityGPerMl ? Math.round((condG / conditioner.densityGPerMl) * 100) / 100 : undefined;

  const ingredients: IngredientBreakdown = {
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
    totalGrams
  };

  const estimatedResultHex = calculateResultOnHair(
    targetHex,
    baseHairHex,
    input.maxConditionerRatioPercent > 60
  );

  const deltaEToTarget = calculateDeltaE(targetHex, estimatedResultHex);

  const isTargetAchievable = !isLighterThanBase && deltaEToTarget < 35;
  let nearestAchievableHex: string | undefined = undefined;

  if (!isTargetAchievable) {
    if (isLighterThanBase) {
      nearestAchievableHex = baseHairHex;
    } else {
      nearestAchievableHex = estimatedResultHex;
    }
  }

  const disclaimer =
    mode === 'demo_experimental'
      ? 'Geschätztes Farbergebnis: Die berechneten Mengen sind eine Annäherung. Das tatsächliche Farbergebnis hängt von deinen verwendeten Produkten und deiner Ausgangshaarfarbe ab.'
      : 'Kalibrierter Modus: Das Modell nutzt dokumentierte Testergebnisse. Dennoch können individuelle Haarbeschaffenheiten das Ergebnis beeinflussen.';

  return {
    mode,
    ingredients,
    estimatedResultHex,
    deltaEToTarget,
    confidenceScore,
    isExtrapolated,
    isTargetAchievable,
    nearestAchievableHex,
    disclaimer,
    calibrationNotes
  };
}

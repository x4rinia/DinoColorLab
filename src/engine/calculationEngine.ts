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
  const maxConditionerRatio = Math.max(0, Math.min(0.95, input.maxConditionerRatioPercent / 100));

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

  const maxVal = Math.max(normR, normG, normB);
  const minVal = Math.min(normR, normG, normB);
  const delta = maxVal - minVal;
  const sat = maxVal > 0 ? delta / maxVal : 0;

  // Subtraktive Pigment-Absorption für Direktzieher:
  // Blau (Cyan) absorbiert Rot: (1 - normR)
  // Rot-Pink (Magenta) absorbiert Grün: (1 - normG)
  // Gelb (Yellow) absorbiert Blau: (1 - normB)
  const pigmentC = Math.max(0, 1 - normR);
  const pigmentM = Math.max(0, 1 - normG);
  const pigmentY = Math.max(0, 1 - normB);
  const pigmentSum = pigmentC + pigmentM + pigmentY;
  const maxPigmentReq = Math.max(pigmentC, pigmentM, pigmentY);

  let cRatio = 0;
  let mRatio = 0;
  let yRatio = 0;

  // Nur wenn echte Pigmente benötigt werden (nicht bei Weiß):
  if (maxPigmentReq > 0.015 && pigmentSum > 0.01) {
    cRatio = pigmentC / pigmentSum;
    mRatio = pigmentM / pigmentSum;
    yRatio = pigmentY / pigmentSum;

    // Für ungesättigte Töne (Grau, Schwarz, Erdtöne), NIEMALS für Weiß!
    if (sat < 0.25) {
      const neutralWeight = (0.25 - sat) / 0.25;
      cRatio = cRatio * (1 - neutralWeight) + 0.38 * neutralWeight;
      mRatio = mRatio * (1 - neutralWeight) + 0.34 * neutralWeight;
      yRatio = yRatio * (1 - neutralWeight) + 0.28 * neutralWeight;
    }
  }

  let rawC = cRatio * gainC;
  let rawM = mRatio * gainM;
  let rawY = yRatio * gainY;

  const rawPigmentSum = rawC + rawM + rawY;

  let calcConditionerRatio = 0;

  if (maxConditionerRatio === 0) {
    calcConditionerRatio = 0;
  }
  // 1. Reines Weiß / sehr helle Basen (maxPigmentReq < 0.015): 100% reine Spülung!
  else if (maxPigmentReq < 0.015) {
    calcConditionerRatio = 1.0;
  }
  // 2. Tiefes Schwarz: 100% Pigmentdichte, keine Spülung
  else if (targetBrightness < 0.16 || (targetRgb.r < 30 && targetRgb.g < 30 && targetRgb.b < 30)) {
    calcConditionerRatio = 0;
  }
  // 3. Alle Nuancen dazwischen: Helligkeit steuert direkt und stufenlos den Spülungsanteil!
  else {
    // Je heller die Zielfarbe (kleineres maxPigmentReq), desto mehr Spülung
    const naturalConditioner = Math.max(0, 1 - maxPigmentReq);
    // Bei voller Sättigung (maxPigmentReq nahe 1.0) bleibt ein kleiner Streckanteil von ca. 10%
    const baseStretch = 0.10;
    calcConditionerRatio = Math.max(baseStretch, naturalConditioner);
  }

  const pigmentMassFraction = 1 - calcConditionerRatio;

  let cFrac = 0;
  let mFrac = 0;
  let yFrac = 0;

  if (rawPigmentSum > 0) {
    cFrac = (rawC / rawPigmentSum) * pigmentMassFraction;
    mFrac = (rawM / rawPigmentSum) * pigmentMassFraction;
    yFrac = (rawY / rawPigmentSum) * pigmentMassFraction;
  }

  const condFrac = calcConditionerRatio;

  let rawCyanG = cFrac * totalGrams;
  let rawMagG = mFrac * totalGrams;
  let rawYelG = yFrac * totalGrams;
  let rawCondG = condFrac * totalGrams;

  const roundVal = (val: number) => Math.round(val / precision) * precision;

  let cyanG = roundVal(rawCyanG);
  let magG = roundVal(rawMagG);
  let yelG = roundVal(rawYelG);
  let condG = roundVal(rawCondG);

  let currentSum = roundVal(cyanG + magG + yelG + condG);
  const diff = roundVal(totalGrams - currentSum);

  if (Math.abs(diff) > 0.001) {
    const amounts = [
      { key: 'cond', val: condG },
      { key: 'cyan', val: cyanG },
      { key: 'mag', val: magG },
      { key: 'yel', val: yelG }
    ];
    amounts.sort((a, b) => b.val - a.val);

    if (amounts[0].key === 'cond') condG = roundVal(condG + diff);
    else if (amounts[0].key === 'cyan') cyanG = roundVal(cyanG + diff);
    else if (amounts[0].key === 'mag') magG = roundVal(magG + diff);
    else if (amounts[0].key === 'yel') yelG = roundVal(yelG + diff);
  }

  const cyanPercent = Math.round((cyanG / totalGrams) * 100 * 10) / 10;
  const magentaPercent = Math.round((magG / totalGrams) * 100 * 10) / 10;
  const yellowPercent = Math.round((yelG / totalGrams) * 100 * 10) / 10;
  const conditionerPercent = Math.round((condG / totalGrams) * 100 * 10) / 10;

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

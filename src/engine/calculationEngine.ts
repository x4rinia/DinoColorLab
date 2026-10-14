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
  calculateResultOnHair,
  hexToDirectDyePigments
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

  // Physikalische Farbzerlegung für Direktzieher (Rot, Gelb, Blau + Spülung):
  // Strikte 2-Primärfarben-Regel verhindert, dass die komplementäre 3. Farbe
  // die Mischung zu Schlamm/Braun (z.B. Kräuter de Provence) kippt.
  const dye = hexToDirectDyePigments(targetHex);

  let calcConditionerRatio = dye.conditionerRatio;
  if (maxConditionerRatio < 1.0) {
    calcConditionerRatio = Math.min(calcConditionerRatio, maxConditionerRatio);
  }
  if (maxConditionerRatio === 0) {
    calcConditionerRatio = 0;
  }

  const pigmentMassFraction = 1 - calcConditionerRatio;

  let cFrac = 0;
  let mFrac = 0;
  let yFrac = 0;

  const totalShare = dye.rotShare + dye.gelbShare + dye.blauShare;
  if (totalShare > 0 && pigmentMassFraction > 0) {
    cFrac = (dye.blauShare / totalShare) * pigmentMassFraction;
    mFrac = (dye.rotShare / totalShare) * pigmentMassFraction;
    yFrac = (dye.gelbShare / totalShare) * pigmentMassFraction;

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

  // Strikte 0-Garantie: Wenn die Farbe in der Zerlegung 0% hat, MUSS sie strikt 0.0g sein!
  if (dye.blau === 0) cyanG = 0;
  if (dye.rot === 0) magG = 0;
  if (dye.gelb === 0) yelG = 0;
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

  // Rezeptur-Prozente sind eine feste Eigenschaft der Farbmischung (Rezeptverhältnis)
  let cP = dye.blau === 0 ? 0 : Math.round(cFrac * 1000) / 10;
  let mP = dye.rot === 0 ? 0 : Math.round(mFrac * 1000) / 10;
  let yP = dye.gelb === 0 ? 0 : Math.round(yFrac * 1000) / 10;
  let condP = 0;
  if (calcConditionerRatio > 0) {
    condP = Math.round(Math.max(0, 100 - (cP + mP + yP)) * 10) / 10;
  } else {
    const diffP = Math.round((100 - (cP + mP + yP)) * 10) / 10;
    if (Math.abs(diffP) > 0.001) {
      if (cP >= mP && cP >= yP && cP > 0) cP = Math.round((cP + diffP) * 10) / 10;
      else if (mP >= cP && mP >= yP && mP > 0) mP = Math.round((mP + diffP) * 10) / 10;
      else if (yP > 0) yP = Math.round((yP + diffP) * 10) / 10;
    }
  }

  if (dye.blau === 0) cP = 0;
  if (dye.rot === 0) mP = 0;
  if (dye.gelb === 0) yP = 0;

  const cyanPercent = cP;
  const magentaPercent = mP;
  const yellowPercent = yP;
  const conditionerPercent = condP;

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
    calcConditionerRatio
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

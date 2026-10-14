import { describe, it, expect } from 'vitest';
import { calculateRecipe } from './calculationEngine';
import type { PigmentProfile, CalculationInput } from '../types';
import { calculateDeltaE, mixPigmentsSubtractive, hexToRgb, calculateResultOnHair, BASE_HAIR_COLORS } from './colorMath';

describe('Dino Color Lab Calculation Engine', () => {
  const demoBlue: PigmentProfile = {
    id: 1,
    name: 'Demo Blau (echtes Blau)',
    brand: 'Dino Lab Demos',
    colorGroup: 'cyan',
    referenceHex: '#2563eb', // Real deep blue, not turquoise!
    intensity: 1.0,
    densityGPerMl: 1.02,
    status: 'uncalibrated',
    isDemo: true,
    createdAt: '',
    updatedAt: ''
  };

  const demoRedPink: PigmentProfile = {
    id: 2,
    name: 'Demo Rot-Pink Vivid',
    brand: 'Dino Lab Demos',
    colorGroup: 'magenta',
    referenceHex: '#e11d48', // Cool pink-red
    intensity: 1.0,
    densityGPerMl: 1.01,
    status: 'uncalibrated',
    isDemo: true,
    createdAt: '',
    updatedAt: ''
  };

  const demoYellow: PigmentProfile = {
    id: 3,
    name: 'Demo Sonnengelb',
    brand: 'Dino Lab Demos',
    colorGroup: 'yellow',
    referenceHex: '#ffd600', // Clear radiant yellow
    intensity: 1.0,
    densityGPerMl: 1.0,
    status: 'uncalibrated',
    isDemo: true,
    createdAt: '',
    updatedAt: ''
  };

  it('preserves exact total batch weight for 5g standard test strand', () => {
    const input: CalculationInput = {
      targetHex: '#7c3aed',
      cyanPigmentId: 1,
      magentaPigmentId: 2,
      yellowPigmentId: 3,
      totalBatchGrams: 5.0, // Standard 5g
      maxConditionerRatioPercent: 80,
      baseHairColor: {
        levelKey: 'bleached_level10',
        hex: '#fffbeb'
      }
    };

    const result = calculateRecipe(input, demoBlue, demoRedPink, demoYellow);
    const sum =
      result.ingredients.cyanGrams +
      result.ingredients.magentaGrams +
      result.ingredients.yellowGrams +
      result.ingredients.conditionerGrams;

    expect(Math.round(sum * 10) / 10).toBe(5.0);
    expect(result.ingredients.totalGrams).toBe(5.0);
  });

  it('preserves exact total batch weight for small 2.5g test strand', () => {
    const input: CalculationInput = {
      targetHex: '#ec4899',
      cyanPigmentId: 1,
      magentaPigmentId: 2,
      yellowPigmentId: 3,
      totalBatchGrams: 2.5, // 2.5g
      maxConditionerRatioPercent: 90,
      baseHairColor: {
        levelKey: 'bleached_level10',
        hex: '#fffbeb'
      }
    };

    const result = calculateRecipe(input, demoBlue, demoRedPink, demoYellow);
    const sum =
      result.ingredients.cyanGrams +
      result.ingredients.magentaGrams +
      result.ingredients.yellowGrams +
      result.ingredients.conditionerGrams;

    expect(Math.round(sum * 10) / 10).toBe(2.5);
    expect(result.ingredients.totalGrams).toBe(2.5);
  });

  it('correctly sets mode to demo_experimental when using demo pigments', () => {
    const input: CalculationInput = {
      targetHex: '#a855f7',
      cyanPigmentId: 1,
      magentaPigmentId: 2,
      yellowPigmentId: 3,
      totalBatchGrams: 5,
      maxConditionerRatioPercent: 80,
      baseHairColor: {
        levelKey: 'bleached_level10',
        hex: '#fffbeb'
      }
    };

    const result = calculateRecipe(input, demoBlue, demoRedPink, demoYellow);
    expect(result.mode).toBe('demo_experimental');
    expect(result.disclaimer).toContain('Geschätztes Farbergebnis');
  });

  it('calculates ml when density is present, and leaves ml undefined when density is absent', () => {
    const uncalibratedWithoutDensity: PigmentProfile = {
      ...demoRedPink,
      densityGPerMl: undefined
    };

    const input: CalculationInput = {
      targetHex: '#2563eb',
      cyanPigmentId: 1,
      magentaPigmentId: 2,
      yellowPigmentId: 3,
      totalBatchGrams: 10,
      maxConditionerRatioPercent: 50,
      baseHairColor: {
        levelKey: 'bleached_level10',
        hex: '#fffbeb'
      }
    };

    const result = calculateRecipe(input, demoBlue, uncalibratedWithoutDensity, demoYellow);
    expect(result.ingredients.cyanMl).toBeDefined();
    expect(result.ingredients.magentaMl).toBeUndefined();
  });

  it('detects unachievable colors that are lighter than the base hair color', () => {
    const input: CalculationInput = {
      targetHex: '#ffffff',
      cyanPigmentId: 1,
      magentaPigmentId: 2,
      yellowPigmentId: 3,
      totalBatchGrams: 5,
      maxConditionerRatioPercent: 50,
      baseHairColor: {
        levelKey: 'dark_brown_level4',
        hex: '#451a03'
      }
    };

    const result = calculateRecipe(input, demoBlue, demoRedPink, demoYellow);
    expect(result.isTargetAchievable).toBe(false);
    expect(result.nearestAchievableHex).toBe('#451a03');
  });

  it('calculates Delta E perceptual distance properly', () => {
    const deltaE = calculateDeltaE('#2563eb', '#2563eb');
    expect(deltaE).toBe(0);

    const deltaEDiff = calculateDeltaE('#000000', '#ffffff');
    expect(deltaEDiff).toBeGreaterThan(50);
  });

  describe('Subtractive Hair Pigment Mixing Principles', () => {
    it('Blau + Rot-Pink creates violet / purple tones', () => {
      // 50% Blau + 50% Rot-Pink
      const mixed = mixPigmentsSubtractive(
        0.5,
        0.5,
        0.0,
        0.0,
        demoBlue.referenceHex,
        demoRedPink.referenceHex,
        demoYellow.referenceHex,
        1.0,
        1.0,
        1.0,
        '#ffffff'
      );
      const rgb = hexToRgb(mixed);
      // Violet has prominent blue and red with suppressed green
      expect(rgb.b).toBeGreaterThan(rgb.g);
      expect(rgb.r).toBeGreaterThan(rgb.g);
    });

    it('Blau + Gelb creates green tones', () => {
      // 50% Blau + 50% Gelb
      const mixed = mixPigmentsSubtractive(
        0.5,
        0.0,
        0.5,
        0.0,
        demoBlue.referenceHex,
        demoRedPink.referenceHex,
        demoYellow.referenceHex,
        1.0,
        1.0,
        1.0,
        '#ffffff'
      );
      const rgb = hexToRgb(mixed);
      // Green has prominent green channel over red
      expect(rgb.g).toBeGreaterThan(rgb.r);
    });

    it('Rot-Pink + Gelb creates orange / warm red tones', () => {
      // 50% Rot-Pink + 50% Gelb
      const mixed = mixPigmentsSubtractive(
        0.0,
        0.5,
        0.5,
        0.0,
        demoBlue.referenceHex,
        demoRedPink.referenceHex,
        demoYellow.referenceHex,
        1.0,
        1.0,
        1.0,
        '#ffffff'
      );
      const rgb = hexToRgb(mixed);
      // Orange has prominent red and green with minimal blue
      expect(rgb.r).toBeGreaterThan(rgb.b);
      expect(rgb.g).toBeGreaterThan(rgb.b);
    });

    it('Adding pure white conditioner dilutes and lightens the shade towards pastel', () => {
      const concentrated = mixPigmentsSubtractive(
        1.0,
        0.0,
        0.0,
        0.0, // 0% Spülung
        demoBlue.referenceHex,
        demoRedPink.referenceHex,
        demoYellow.referenceHex,
        1.0,
        1.0,
        1.0,
        '#ffffff'
      );
      const diluted = mixPigmentsSubtractive(
        1.0,
        0.0,
        0.0,
        0.9, // 90% Spülung
        demoBlue.referenceHex,
        demoRedPink.referenceHex,
        demoYellow.referenceHex,
        1.0,
        1.0,
        1.0,
        '#ffffff'
      );

      const rgbConc = hexToRgb(concentrated);
      const rgbDil = hexToRgb(diluted);

      // Diluted pastel shade is much brighter in all channels
      expect(rgbDil.r).toBeGreaterThan(rgbConc.r);
      expect(rgbDil.g).toBeGreaterThan(rgbConc.g);
      expect(rgbDil.b).toBeGreaterThanOrEqual(rgbConc.b);
    });

    it('adds conditioner to stretch bold colors but omits it for pure black', () => {
      // Kräftiges Blau (maxConditioner 20%)
      const boldBlueInput: CalculationInput = {
        targetHex: '#1d4ed8',
        cyanPigmentId: 1,
        magentaPigmentId: 2,
        yellowPigmentId: 3,
        totalBatchGrams: 40,
        maxConditionerRatioPercent: 20,
        baseHairColor: { levelKey: 'bleached_level10', hex: '#fffbeb' }
      };
      const boldResult = calculateRecipe(boldBlueInput, demoBlue, demoRedPink, demoYellow);
      expect(boldResult.ingredients.conditionerGrams).toBeGreaterThan(0);
      expect(boldResult.ingredients.conditionerPercent).toBeGreaterThanOrEqual(10);
      expect(boldResult.ingredients.conditionerPercent).toBeLessThanOrEqual(20);

      // Reines Schwarz (#0a0a0a)
      const blackInput: CalculationInput = {
        targetHex: '#0a0a0a',
        cyanPigmentId: 1,
        magentaPigmentId: 2,
        yellowPigmentId: 3,
        totalBatchGrams: 40,
        maxConditionerRatioPercent: 20,
        baseHairColor: { levelKey: 'bleached_level10', hex: '#fffbeb' }
      };
      const blackResult = calculateRecipe(blackInput, demoBlue, demoRedPink, demoYellow);
      expect(blackResult.ingredients.conditionerGrams).toBe(0);
      expect(blackResult.ingredients.conditionerPercent).toBe(0);
    });

    it('strictly excludes Blau for vivid orange #da5100 (Pi-mal-Daumen mud prevention)', () => {
      const orangeInput: CalculationInput = {
        targetHex: '#da5100',
        cyanPigmentId: 1,
        magentaPigmentId: 2,
        yellowPigmentId: 3,
        totalBatchGrams: 40,
        maxConditionerRatioPercent: 100,
        baseHairColor: { levelKey: 'bleached_level10', hex: '#fffbeb' }
      };
      const result = calculateRecipe(orangeInput, demoBlue, demoRedPink, demoYellow);
      // Strikte 0-Garantie: Bei Orange darf absolut kein Blau enthalten sein!
      expect(result.ingredients.cyanGrams).toBe(0);
      expect(result.ingredients.cyanPercent).toBe(0);
      expect(result.ingredients.magentaGrams).toBeGreaterThan(0);
      expect(result.ingredients.yellowGrams).toBeGreaterThan(0);
      expect(result.ingredients.totalGrams).toBe(40);
    });

    it('strictly excludes Gelb for purple / lila #7a219e (Pi-mal-Daumen mud prevention)', () => {
      const purpleInput: CalculationInput = {
        targetHex: '#7a219e',
        cyanPigmentId: 1,
        magentaPigmentId: 2,
        yellowPigmentId: 3,
        totalBatchGrams: 40,
        maxConditionerRatioPercent: 100,
        baseHairColor: { levelKey: 'bleached_level10', hex: '#fffbeb' }
      };
      const result = calculateRecipe(purpleInput, demoBlue, demoRedPink, demoYellow);
      // Strikte 0-Garantie: Bei Lila/Violett darf absolut kein Gelb enthalten sein!
      expect(result.ingredients.yellowGrams).toBe(0);
      expect(result.ingredients.yellowPercent).toBe(0);
      expect(result.ingredients.cyanGrams).toBeGreaterThan(0);
      expect(result.ingredients.magentaGrams).toBeGreaterThan(0);
      expect(result.ingredients.totalGrams).toBe(40);
    });

    it('strictly excludes Rot-Pink for teal shades like #1ddba3 (prevents mud in green tones)', () => {
      const tealInput: CalculationInput = {
        targetHex: '#1ddba3',
        cyanPigmentId: 1,
        magentaPigmentId: 2,
        yellowPigmentId: 3,
        totalBatchGrams: 40,
        maxConditionerRatioPercent: 100,
        baseHairColor: { levelKey: 'bleached_level10', hex: '#fffbeb' }
      };
      const result = calculateRecipe(tealInput, demoBlue, demoRedPink, demoYellow);
      // Rot-Pink darf in Türkis/Cyan NICHT enthalten sein!
      expect(result.ingredients.magentaGrams).toBe(0);
      expect(result.ingredients.magentaPercent).toBe(0);
      expect(result.ingredients.cyanPercent).toBeGreaterThan(40);
      expect(result.ingredients.yellowPercent).toBeGreaterThan(10);
      expect(result.ingredients.totalGrams).toBe(40);
    });

    it('calculates 100% conditioner and zero pigments for pure white #ffffff', () => {
      const whiteInput: CalculationInput = {
        targetHex: '#ffffff',
        cyanPigmentId: 1,
        magentaPigmentId: 2,
        yellowPigmentId: 3,
        totalBatchGrams: 40,
        maxConditionerRatioPercent: 100,
        baseHairColor: { levelKey: 'bleached_level10', hex: '#ffffff' }
      };
      const result = calculateRecipe(whiteInput, demoBlue, demoRedPink, demoYellow);
      expect(result.ingredients.conditionerGrams).toBe(40);
      expect(result.ingredients.conditionerPercent).toBe(100);
      expect(result.ingredients.cyanGrams).toBe(0);
      expect(result.ingredients.magentaGrams).toBe(0);
      expect(result.ingredients.yellowGrams).toBe(0);
      expect(result.ingredients.totalGrams).toBe(40);
    });

    it('strictly excludes Blau and Rot for pale yellow #ffffd8', () => {
      const yellowInput: CalculationInput = {
        targetHex: '#ffffd8',
        cyanPigmentId: 1,
        magentaPigmentId: 2,
        yellowPigmentId: 3,
        totalBatchGrams: 40,
        maxConditionerRatioPercent: 100,
        baseHairColor: { levelKey: 'bleached_level10', hex: '#ffffff' }
      };
      const result = calculateRecipe(yellowInput, demoBlue, demoRedPink, demoYellow);
      expect(result.ingredients.cyanGrams).toBe(0);
      expect(result.ingredients.cyanPercent).toBe(0);
      expect(result.ingredients.magentaGrams).toBe(0);
      expect(result.ingredients.magentaPercent).toBe(0);
      expect(result.ingredients.yellowPercent).toBeGreaterThan(10);
      expect(result.ingredients.conditionerPercent).toBeGreaterThan(70);
      expect(result.ingredients.totalGrams).toBe(40);
    });

    it('strictly excludes Blau and Gelb for pale pink #ffe8ff', () => {
      const pinkInput: CalculationInput = {
        targetHex: '#ffe8ff',
        cyanPigmentId: 1,
        magentaPigmentId: 2,
        yellowPigmentId: 3,
        totalBatchGrams: 40,
        maxConditionerRatioPercent: 100,
        baseHairColor: { levelKey: 'bleached_level10', hex: '#ffffff' }
      };
      const result = calculateRecipe(pinkInput, demoBlue, demoRedPink, demoYellow);
      expect(result.ingredients.cyanGrams).toBe(0);
      expect(result.ingredients.cyanPercent).toBe(0);
      expect(result.ingredients.yellowGrams).toBe(0);
      expect(result.ingredients.yellowPercent).toBe(0);
      expect(result.ingredients.magentaPercent).toBeGreaterThan(5);
      expect(result.ingredients.conditionerPercent).toBeGreaterThan(80);
      expect(result.ingredients.totalGrams).toBe(40);
    });

    it('strictly excludes Rot and Gelb for icy blue #f7ffff', () => {
      const blueInput: CalculationInput = {
        targetHex: '#f7ffff',
        cyanPigmentId: 1,
        magentaPigmentId: 2,
        yellowPigmentId: 3,
        totalBatchGrams: 40,
        maxConditionerRatioPercent: 100,
        baseHairColor: { levelKey: 'bleached_level10', hex: '#ffffff' }
      };
      const result = calculateRecipe(blueInput, demoBlue, demoRedPink, demoYellow);
      expect(result.ingredients.magentaGrams).toBe(0);
      expect(result.ingredients.magentaPercent).toBe(0);
      expect(result.ingredients.yellowGrams).toBe(0);
      expect(result.ingredients.yellowPercent).toBe(0);
      expect(result.ingredients.cyanPercent).toBeGreaterThan(0);
      expect(result.ingredients.conditionerPercent).toBeGreaterThan(90);
      expect(result.ingredients.totalGrams).toBe(40);
    });

    it('black direct dye #000015 on dark blonde #876743 produces deep black, NOT brown', () => {
      const blackInput: CalculationInput = {
        targetHex: '#000015',
        cyanPigmentId: 1,
        magentaPigmentId: 2,
        yellowPigmentId: 3,
        totalBatchGrams: 40,
        maxConditionerRatioPercent: 100,
        baseHairColor: { levelKey: 'dark_blonde_level6', hex: '#7c6349' }
      };
      const result = calculateRecipe(blackInput, demoBlue, demoRedPink, demoYellow);
      expect(result.estimatedResultHex).toBeDefined();
      const rgb = hexToRgb(result.estimatedResultHex!);
      const brightness = (rgb.r + rgb.g + rgb.b) / 3;
      // Must be very dark (brightness < 30), not brown (#764103 has brightness 63)
      expect(brightness).toBeLessThan(30);
      expect(result.estimatedResultHex).not.toBe('#764103');
    });

    it('defines realistic natural hair colors without neon yellow or carrot orange', () => {
      expect(BASE_HAIR_COLORS.medium_blonde_level8.hex).toBe('#bfa071');
      expect(BASE_HAIR_COLORS.dark_blonde_level6.hex).toBe('#7c6349');
      expect(BASE_HAIR_COLORS.light_brown_level5.hex).toBe('#533b27');
      expect(BASE_HAIR_COLORS.dark_brown_level4.hex).toBe('#2b1d14');

      const pureCondResult = calculateResultOnHair('#ffffff', '#7c6349', 1.0);
      expect(pureCondResult).toBe('#7c6349');
    });

    it('accounts for already_dyed custom base color in recipe estimation', () => {
      const customRedHair: CalculationInput = {
        targetHex: '#0088ff',
        cyanPigmentId: 1,
        magentaPigmentId: 2,
        yellowPigmentId: 3,
        totalBatchGrams: 40,
        maxConditionerRatioPercent: 100,
        baseHairColor: { levelKey: 'already_dyed', hex: '#AD5283', notes: 'rot' }
      };

      const result = calculateRecipe(customRedHair, demoBlue, demoRedPink, demoYellow);
      expect(result.estimatedResultHex).toBeDefined();

      // Applying blue over red dyed hair yields a purple/violet tone
      const rgb = hexToRgb(result.estimatedResultHex!);
      expect(rgb.b).toBeGreaterThan(rgb.g);
    });

    it('preserves identical percentage composition when doubling batch size from 40g to 80g', () => {
      const baseInput: Omit<CalculationInput, 'totalBatchGrams'> = {
        targetHex: '#7c3aed', // Purple/Violet
        cyanPigmentId: 1,
        magentaPigmentId: 2,
        yellowPigmentId: 3,
        maxConditionerRatioPercent: 80,
        baseHairColor: { levelKey: 'bleached_level10', hex: '#fffbeb' }
      };

      const result40 = calculateRecipe({ ...baseInput, totalBatchGrams: 40 }, demoBlue, demoRedPink, demoYellow);
      const result80 = calculateRecipe({ ...baseInput, totalBatchGrams: 80 }, demoBlue, demoRedPink, demoYellow);

      // Percentages must remain completely identical!
      expect(result80.ingredients.cyanPercent).toBe(result40.ingredients.cyanPercent);
      expect(result80.ingredients.magentaPercent).toBe(result40.ingredients.magentaPercent);
      expect(result80.ingredients.yellowPercent).toBe(result40.ingredients.yellowPercent);
      expect(result80.ingredients.conditionerPercent).toBe(result40.ingredients.conditionerPercent);

      // But grams must be doubled!
      expect(result80.ingredients.totalGrams).toBe(80);
      expect(result40.ingredients.totalGrams).toBe(40);
      expect(result80.ingredients.cyanGrams).toBeCloseTo(result40.ingredients.cyanGrams * 2, 0);
      expect(result80.ingredients.magentaGrams).toBeCloseTo(result40.ingredients.magentaGrams * 2, 0);
    });
  });
});

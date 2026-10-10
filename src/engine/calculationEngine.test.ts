import { describe, it, expect } from 'vitest';
import { calculateRecipe } from './calculationEngine';
import type { PigmentProfile, CalculationInput } from '../types';
import { calculateDeltaE, mixPigmentsSubtractive, hexToRgb } from './colorMath';

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
      expect(boldResult.ingredients.conditionerPercent).toBeGreaterThanOrEqual(15);
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
  });
});

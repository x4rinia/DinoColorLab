import { describe, it, expect } from 'vitest';
import { calculateRecipe } from './calculationEngine';
import type { PigmentProfile, CalculationInput } from '../types';
import { calculateDeltaE } from './colorMath';

describe('Dino Color Lab Calculation Engine', () => {
  const demoCyan: PigmentProfile = {
    id: 1,
    name: 'Demo Cyan',
    brand: 'Demo',
    colorGroup: 'cyan',
    referenceHex: '#00b4d8',
    intensity: 1.0,
    densityGPerMl: 1.02,
    status: 'uncalibrated',
    isDemo: true,
    createdAt: '',
    updatedAt: ''
  };

  const demoMagenta: PigmentProfile = {
    id: 2,
    name: 'Demo Magenta',
    brand: 'Demo',
    colorGroup: 'magenta',
    referenceHex: '#e6007e',
    intensity: 1.0,
    status: 'uncalibrated',
    isDemo: true,
    createdAt: '',
    updatedAt: ''
  };

  const demoYellow: PigmentProfile = {
    id: 3,
    name: 'Demo Yellow',
    brand: 'Demo',
    colorGroup: 'yellow',
    referenceHex: '#ffea00',
    intensity: 1.0,
    status: 'uncalibrated',
    isDemo: true,
    createdAt: '',
    updatedAt: ''
  };

  it('preserves exact total batch weight after rounding', () => {
    const input: CalculationInput = {
      targetHex: '#38bdf8',
      cyanPigmentId: 1,
      magentaPigmentId: 2,
      yellowPigmentId: 3,
      totalBatchGrams: 50,
      maxConditionerRatioPercent: 80,
      baseHairColor: {
        levelKey: 'bleached_level10',
        hex: '#fffbeb'
      }
    };

    const result = calculateRecipe(input, demoCyan, demoMagenta, demoYellow);
    const sum =
      result.ingredients.cyanGrams +
      result.ingredients.magentaGrams +
      result.ingredients.yellowGrams +
      result.ingredients.conditionerGrams;

    expect(sum).toBe(50);
    expect(result.ingredients.totalGrams).toBe(50);
  });

  it('correctly sets mode to demo_experimental when using demo pigments', () => {
    const input: CalculationInput = {
      targetHex: '#a855f7',
      cyanPigmentId: 1,
      magentaPigmentId: 2,
      yellowPigmentId: 3,
      totalBatchGrams: 100,
      maxConditionerRatioPercent: 80,
      baseHairColor: {
        levelKey: 'bleached_level10',
        hex: '#fffbeb'
      }
    };

    const result = calculateRecipe(input, demoCyan, demoMagenta, demoYellow);
    expect(result.mode).toBe('demo_experimental');
    expect(result.disclaimer).toContain('Achtung: Experimenteller Demo-Modus!');
  });

  it('calculates ml when density is present, and leaves ml undefined when density is absent', () => {
    const input: CalculationInput = {
      targetHex: '#00b4d8',
      cyanPigmentId: 1,
      magentaPigmentId: 2,
      yellowPigmentId: 3,
      totalBatchGrams: 50,
      maxConditionerRatioPercent: 50,
      baseHairColor: {
        levelKey: 'bleached_level10',
        hex: '#fffbeb'
      }
    };

    const result = calculateRecipe(input, demoCyan, demoMagenta, demoYellow);
    expect(result.ingredients.cyanMl).toBeDefined();
    expect(result.ingredients.magentaMl).toBeUndefined();
  });

  it('detects unachievable colors that are lighter than the base hair color', () => {
    const input: CalculationInput = {
      targetHex: '#ffffff',
      cyanPigmentId: 1,
      magentaPigmentId: 2,
      yellowPigmentId: 3,
      totalBatchGrams: 50,
      maxConditionerRatioPercent: 50,
      baseHairColor: {
        levelKey: 'dark_brown_level4',
        hex: '#451a03'
      }
    };

    const result = calculateRecipe(input, demoCyan, demoMagenta, demoYellow);
    expect(result.isTargetAchievable).toBe(false);
    expect(result.nearestAchievableHex).toBe('#451a03');
  });

  it('calculates Delta E perceptual distance properly', () => {
    const deltaE = calculateDeltaE('#00e5ff', '#00e5ff');
    expect(deltaE).toBe(0);

    const deltaEDiff = calculateDeltaE('#000000', '#ffffff');
    expect(deltaEDiff).toBeGreaterThan(50);
  });
});

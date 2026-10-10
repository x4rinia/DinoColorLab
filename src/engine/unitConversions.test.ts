import { describe, it, expect } from 'vitest';
import {
  calculateTeaspoonAmount,
  getVolumeDisplay,
  scaleRecipeIngredients,
  calculateSimpleRatio
} from './unitConversions';
import type { IngredientBreakdown } from '../types';

describe('Unit Conversions & Measurement Engine', () => {
  it('correctly maps 5 ml to 1 TL', () => {
    const res = calculateTeaspoonAmount(5.0, 5.0, 1.0);
    expect(res.canMeasureTeaspoon).toBe(true);
    expect(res.teaspoonDisplay).toBe('1 TL');
    expect(res.isAccurate).toBe(true);
  });

  it('correctly maps 2.5 ml to ½ TL', () => {
    const res = calculateTeaspoonAmount(2.5, 2.5, 1.0);
    expect(res.canMeasureTeaspoon).toBe(true);
    expect(res.teaspoonDisplay).toBe('½ TL');
    expect(res.isAccurate).toBe(true);
  });

  it('correctly maps 1.25 ml to ¼ TL', () => {
    const res = calculateTeaspoonAmount(1.25, 1.25, 1.0);
    expect(res.canMeasureTeaspoon).toBe(true);
    expect(res.teaspoonDisplay).toBe('¼ TL');
    expect(res.isAccurate).toBe(true);
  });

  it('correctly maps 0.625 ml to ⅛ TL', () => {
    const res = calculateTeaspoonAmount(0.625, 0.625, 1.0);
    expect(res.canMeasureTeaspoon).toBe(true);
    expect(res.teaspoonDisplay).toBe('⅛ TL');
    expect(res.isAccurate).toBe(true);
  });

  it('correctly falls back to 1.0 g/ml when density is undefined', () => {
    const res = calculateTeaspoonAmount(undefined, 2.5, undefined);
    expect(res.canMeasureTeaspoon).toBe(true);
    expect(res.teaspoonDisplay).toBe('½ TL');
  });

  it('recommends drops or syringe for amounts below 0.625 ml (< ⅛ TL)', () => {
    const res = calculateTeaspoonAmount(0.2, 0.2, 1.0);
    expect(res.canMeasureTeaspoon).toBe(false);
    expect(res.teaspoonDisplay).toBe('< ⅛ TL (Tropfen/Spitze)');
    expect(res.recommendation).toContain('Dosierspritze');
  });

  it('recommends precision scale or syringe for small volumes under 2.5 ml', () => {
    const res = calculateTeaspoonAmount(1.5, 1.5, 1.0);
    expect(res.recommendScaleOrSyringe).toBe(true);
    expect(res.recommendation).toContain('Dosierspritze');
  });

  it('calculates volume from density and flags approximations properly', () => {
    const withDensity = getVolumeDisplay(10.2, {
      name: 'Test',
      brand: 'Test',
      colorGroup: 'cyan',
      referenceHex: '#000000',
      intensity: 1,
      densityGPerMl: 1.02,
      status: 'calibrated',
      createdAt: '',
      updatedAt: ''
    });
    expect(withDensity.ml).toBe(10);
    expect(withDensity.isApproximate).toBe(false);

    const withoutDensity = getVolumeDisplay(10.2, {
      name: 'Test',
      brand: 'Test',
      colorGroup: 'cyan',
      referenceHex: '#000000',
      intensity: 1,
      status: 'uncalibrated',
      createdAt: '',
      updatedAt: ''
    }, 10.2);
    expect(withoutDensity.ml).toBe(10.2);
    expect(withoutDensity.isApproximate).toBe(true);
  });

  it('scales a 5g test batch to a 50g and 100g batch while preserving exact totals', () => {
    const testBatch: IngredientBreakdown = {
      cyanGrams: 0.3,
      magentaGrams: 0.1,
      yellowGrams: 0.1,
      conditionerGrams: 4.5,
      cyanPercent: 6.0,
      magentaPercent: 2.0,
      yellowPercent: 2.0,
      conditionerPercent: 90.0,
      totalGrams: 5.0
    };

    const scaled50g = scaleRecipeIngredients(testBatch, 50);
    expect(scaled50g.totalGrams).toBe(50);
    expect(scaled50g.cyanGrams + scaled50g.magentaGrams + scaled50g.yellowGrams + scaled50g.conditionerGrams).toBe(50);
    expect(scaled50g.cyanGrams).toBe(3.0);
    expect(scaled50g.conditionerGrams).toBe(45.0);

    const scaled100g = scaleRecipeIngredients(testBatch, 100);
    expect(scaled100g.totalGrams).toBe(100);
    expect(scaled100g.cyanGrams + scaled100g.magentaGrams + scaled100g.yellowGrams + scaled100g.conditionerGrams).toBe(100);
    expect(scaled100g.cyanGrams).toBe(6.0);
  });

  it('correctly maps 15 ml conditioner to 1 EL and 20 ml to 1 EL + 1 TL', () => {
    const res15 = calculateTeaspoonAmount(15.0, 15.0, 1.0, true);
    expect(res15.teaspoonDisplay).toBe('1 EL');

    const res20 = calculateTeaspoonAmount(20.0, 20.0, 1.0, true);
    expect(res20.teaspoonDisplay).toBe('1 EL + 1 TL');
  });

  it('calculates a simple understandable mixing ratio', () => {
    const ratio = calculateSimpleRatio(0.5, 0.5, 0.0, 4.0);
    expect(ratio).toBe('1 Teil Blau + 1 Teil Rot/Pink + 8 Teile Weiße Spülung');
  });
});

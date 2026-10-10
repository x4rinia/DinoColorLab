import {
  formatHex,
  parse,
  converter,
  differenceEuclidean
} from 'culori';

const toRgb = converter('rgb');

export interface RGBColor {
  r: number; // 0 - 255
  g: number; // 0 - 255
  b: number; // 0 - 255
}

export interface BaseHairColorDefinition {
  key: string;
  name: string;
  hex: string;
  lightness: number;
  warmth: number;
}

export const BASE_HAIR_COLORS: Record<string, BaseHairColorDefinition> = {
  bleached_level10: {
    key: 'bleached_level10',
    name: 'Sehr hell blondiert (Stufe 10-11)',
    hex: '#fffbeb',
    lightness: 96,
    warmth: 0.1
  },
  light_blonde_level9: {
    key: 'light_blonde_level9',
    name: 'Hellblond (Stufe 9)',
    hex: '#fef3c7',
    lightness: 88,
    warmth: 0.25
  },
  medium_blonde_level8: {
    key: 'medium_blonde_level8',
    name: 'Mittelblond (Stufe 7-8)',
    hex: '#fde047',
    lightness: 76,
    warmth: 0.45
  },
  dark_blonde_level6: {
    key: 'dark_blonde_level6',
    name: 'Dunkelblond (Stufe 6)',
    hex: '#d97706',
    lightness: 60,
    warmth: 0.65
  },
  light_brown_level5: {
    key: 'light_brown_level5',
    name: 'Hellbraun (Stufe 5)',
    hex: '#92400e',
    lightness: 45,
    warmth: 0.75
  },
  dark_brown_level4: {
    key: 'dark_brown_level4',
    name: 'Dunkelbraun (Stufe 4)',
    hex: '#451a03',
    lightness: 30,
    warmth: 0.85
  },
  already_dyed: {
    key: 'already_dyed',
    name: 'Bereits gefärbt',
    hex: '#a1a1aa',
    lightness: 70,
    warmth: 0.3
  },
  custom: {
    key: 'custom',
    name: 'Individuell',
    hex: '#e4e4e7',
    lightness: 80,
    warmth: 0.3
  }
};

export function normalizeHex(hex: string): string {
  if (!hex) return '#000000';
  let clean = hex.trim();
  if (!clean.startsWith('#')) {
    clean = '#' + clean;
  }
  const parsed = parse(clean);
  if (!parsed) return '#000000';
  return formatHex(parsed) || '#000000';
}

export function hexToRgb(hex: string): RGBColor {
  const parsed = parse(hex);
  if (!parsed) return { r: 0, g: 0, b: 0 };
  const rgb = toRgb(parsed);
  return {
    r: Math.round(Math.max(0, Math.min(1, rgb.r ?? 0)) * 255),
    g: Math.round(Math.max(0, Math.min(1, rgb.g ?? 0)) * 255),
    b: Math.round(Math.max(0, Math.min(1, rgb.b ?? 0)) * 255)
  };
}

export function rgbToHex(r: number, g: number, b: number): string {
  const normR = Math.max(0, Math.min(255, r)) / 255;
  const normG = Math.max(0, Math.min(255, g)) / 255;
  const normB = Math.max(0, Math.min(255, b)) / 255;
  return formatHex({ mode: 'rgb', r: normR, g: normG, b: normB }) || '#000000';
}

export function calculateDeltaE(hex1: string, hex2: string): number {
  const c1 = parse(hex1);
  const c2 = parse(hex2);
  if (!c1 || !c2) return 999;
  const oklabDist = differenceEuclidean('oklab')(c1, c2);
  return Math.round(oklabDist * 100 * 10) / 10;
}

export function hexToCmy(hex: string): { c: number; m: number; y: number } {
  const { r, g, b } = hexToRgb(hex);
  const normR = r / 255;
  const normG = g / 255;
  const normB = b / 255;

  let c = 1 - normR;
  let m = 1 - normG;
  let y = 1 - normB;

  return { c, m, y };
}

export function cmyToHex(c: number, m: number, y: number): string {
  const normC = Math.max(0, Math.min(1, c));
  const normM = Math.max(0, Math.min(1, m));
  const normY = Math.max(0, Math.min(1, y));

  const r = Math.round((1 - normC) * 255);
  const g = Math.round((1 - normM) * 255);
  const b = Math.round((1 - normY) * 255);

  return rgbToHex(r, g, b);
}

export function mixPigmentsSubtractive(
  cRatio: number,
  mRatio: number,
  yRatio: number,
  conditionerRatio: number,
  cyanRefHex: string,
  magentaRefHex: string,
  yellowRefHex: string,
  cyanIntensity: number = 1.0,
  magentaIntensity: number = 1.0,
  yellowIntensity: number = 1.0,
  baseHairHex: string = '#fffbeb'
): string {
  const cRef = hexToCmy(cyanRefHex);
  const mRef = hexToCmy(magentaRefHex);
  const yRef = hexToCmy(yellowRefHex);
  const baseRgb = hexToRgb(baseHairHex);

  const pigmentDyePower = 1 - Math.max(0, Math.min(0.99, conditionerRatio));

  const totalC = (cRatio * cRef.c * cyanIntensity + mRatio * mRef.c * magentaIntensity + yRatio * yRef.c * yellowIntensity) * pigmentDyePower;
  const totalM = (cRatio * cRef.m * cyanIntensity + mRatio * mRef.m * magentaIntensity + yRatio * yRef.m * yellowIntensity) * pigmentDyePower;
  const totalY = (cRatio * cRef.y * cyanIntensity + mRatio * mRef.y * magentaIntensity + yRatio * yRef.y * yellowIntensity) * pigmentDyePower;

  const transR = Math.pow(1 - Math.min(0.99, totalC), 1.2);
  const transG = Math.pow(1 - Math.min(0.99, totalM), 1.2);
  const transB = Math.pow(1 - Math.min(0.99, totalY), 1.2);

  const outR = Math.round(baseRgb.r * transR);
  const outG = Math.round(baseRgb.g * transG);
  const outB = Math.round(baseRgb.b * transB);

  return rgbToHex(outR, outG, outB);
}

/**
 * Berechnet das realistische, transparente Farbergebnis einer Haarfarbe auf der Ausgangshaarbasis.
 * Direktzieher legen sich lasierend um das Haar (subtraktive Filterwirkung).
 */
export function calculateResultOnHair(
  dyeHex: string,
  baseHairHex: string,
  isPastel: boolean = false
): string {
  const dyeRgb = hexToRgb(dyeHex);
  const hairRgb = hexToRgb(baseHairHex);

  const dyeStrength = isPastel ? 0.65 : 0.95;

  const transR = 1 - (1 - dyeRgb.r / 255) * dyeStrength;
  const transG = 1 - (1 - dyeRgb.g / 255) * dyeStrength;
  const transB = 1 - (1 - dyeRgb.b / 255) * dyeStrength;

  let outR = hairRgb.r * transR;
  let outG = hairRgb.g * transG;
  let outB = hairRgb.b * transB;

  if (isPastel) {
    outR = outR * 0.7 + hairRgb.r * 0.3;
    outG = outG * 0.7 + hairRgb.g * 0.3;
    outB = outB * 0.7 + hairRgb.b * 0.3;
  }

  return rgbToHex(outR, outG, outB);
}


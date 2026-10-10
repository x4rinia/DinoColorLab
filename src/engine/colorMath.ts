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
    hex: '#f5f0e1',
    lightness: 96,
    warmth: 0.05
  },
  light_blonde_level9: {
    key: 'light_blonde_level9',
    name: 'Hellblond (Stufe 9)',
    hex: '#e7d3aa',
    lightness: 88,
    warmth: 0.20
  },
  medium_blonde_level8: {
    key: 'medium_blonde_level8',
    name: 'Mittelblond (Stufe 7-8)',
    hex: '#bfa071',
    lightness: 76,
    warmth: 0.35
  },
  dark_blonde_level6: {
    key: 'dark_blonde_level6',
    name: 'Dunkelblond (Stufe 6)',
    hex: '#7c6349',
    lightness: 60,
    warmth: 0.50
  },
  light_brown_level5: {
    key: 'light_brown_level5',
    name: 'Hellbraun (Stufe 5)',
    hex: '#533b27',
    lightness: 45,
    warmth: 0.65
  },
  dark_brown_level4: {
    key: 'dark_brown_level4',
    name: 'Dunkelbraun (Stufe 4)',
    hex: '#2b1d14',
    lightness: 30,
    warmth: 0.80
  },
  already_dyed: {
    key: 'already_dyed',
    name: 'Bereits gefärbt',
    hex: '#8e8276',
    lightness: 70,
    warmth: 0.25
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
 * Berechnet das realistische subtraktive Farbergebnis einer Haarfarbe auf der Ausgangshaarbasis.
 * Direktzieher legen sich lasierend wie ein transparenter Farbfilter (Cellophan-Folie) um die Haarfaser.
 * Physikalisches Prinzip (Beer-Lambert-Gesetz):
 * - Licht tritt durch die Pigmentschicht ein, wird am Haarkeratin/Melanin reflektiert und gefiltert zurückgeworfen.
 * - Je geringer der Spülungsanteil (höhere Pigmentdichte), desto stärker die Lichtabsorption.
 * - Bei 100% Spülung (0% Farbpigment) bleibt die Haarfarbe unverändert.
 * - Direktzieher hellen dunkles Haar niemals auf (subtraktive Farbtheorie).
 */
export function calculateResultOnHair(
  dyeHex: string,
  baseHairHex: string,
  conditionerRatio: number = 0.10
): string {
  const dyeRgb = hexToRgb(dyeHex);
  const hairRgb = hexToRgb(baseHairHex);

  const cond = Math.max(0, Math.min(1.0, conditionerRatio));
  const pigmentLoad = 1 - cond;

  // Wenn 100% Spülung (kein Farbpigment), bleibt das Haar exakt in seiner Ausgangsfarbe
  if (pigmentLoad <= 0.005) {
    return rgbToHex(hairRgb.r, hairRgb.g, hairRgb.b);
  }

  // Normierte Transmission der Farbpigmente (0.0 bis 1.0)
  const normDyeR = dyeRgb.r / 255;
  const normDyeG = dyeRgb.g / 255;
  const normDyeB = dyeRgb.b / 255;

  // Subtraktive Absorption nach Beer-Lambert (Doppel-Passage durch die Pigmentschicht auf dem Haar)
  // Exponent steigt mit der Pigmentdichte
  const optDensity = Math.pow(pigmentLoad, 0.8) * 1.6;

  const transR = Math.pow(normDyeR, optDensity);
  const transG = Math.pow(normDyeG, optDensity);
  const transB = Math.pow(normDyeB, optDensity);

  // Gefiltertes Licht, das vom Haaruntergrund reflektiert wird
  let outR = Math.round(hairRgb.r * transR);
  let outG = Math.round(hairRgb.g * transG);
  let outB = Math.round(hairRgb.b * transB);

  // Garantiertes physikalisches Gesetz: Direktzieher hellen NIEMALS auf!
  outR = Math.min(hairRgb.r, Math.max(0, outR));
  outG = Math.min(hairRgb.g, Math.max(0, outG));
  outB = Math.min(hairRgb.b, Math.max(0, outB));

  return rgbToHex(outR, outG, outB);
}


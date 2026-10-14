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
    hex: '#ad5283',
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

export function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  const normR = r / 255;
  const normG = g / 255;
  const normB = b / 255;
  const max = Math.max(normR, normG, normB);
  const min = Math.min(normR, normG, normB);
  const delta = max - min;
  const l = (max + min) / 2;
  const s = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));
  let h = 0;
  if (delta > 0.0001) {
    if (max === normR) {
      h = 60 * (((normG - normB) / delta) % 6);
    } else if (max === normG) {
      h = 60 * (((normB - normR) / delta) + 2);
    } else {
      h = 60 * (((normR - normG) / delta) + 4);
    }
  }
  if (h < 0) h += 360;
  return { h, s, l };
}

export function hslToRgb(h: number, s: number, l: number): RGBColor {
  let r: number, g: number, b: number;
  if (s === 0) {
    r = g = b = l;
  } else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    const hue2rgb = (pVal: number, qVal: number, t: number) => {
      let tNorm = t;
      if (tNorm < 0) tNorm += 1;
      if (tNorm > 1) tNorm -= 1;
      if (tNorm < 1 / 6) return pVal + (qVal - pVal) * 6 * tNorm;
      if (tNorm < 1 / 2) return qVal;
      if (tNorm < 2 / 3) return pVal + (qVal - pVal) * (2 / 3 - tNorm) * 6;
      return pVal;
    };
    r = hue2rgb(p, q, h / 360 + 1 / 3);
    g = hue2rgb(p, q, h / 360);
    b = hue2rgb(p, q, h / 360 - 1 / 3);
  }
  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255)
  };
}

export interface DirectDyeDecomposition {
  rot: number; // 0 - 100% (Anteil unter den Farbpigmenten)
  gelb: number; // 0 - 100%
  blau: number; // 0 - 100%
  spuelung: number; // 0 - 100% (Verdünnung / Aufhellung)
  rotShare: number; // 0.0 - 1.0
  gelbShare: number; // 0.0 - 1.0
  blauShare: number; // 0.0 - 1.0
  conditionerRatio: number; // 0.0 - 1.0
  lightness: number; // 0.0 - 1.0
}

/**
 * Physikalische Zerlegung einer Wunschfarbe in Direktzieher-Primärpigmente (Rot, Gelb, Blau + Spülung).
 * Direktzieher verhalten sich nach subtraktiver Farbmischung:
 * - Warmbereich (Orange/Rot/Kupfer): Nur Rot + Gelb (Blau = 0%!)
 * - Kalt-/Grünbereich (Grün/Limette/Türkis/Petrol/Blau): Nur Gelb + Blau (Rot = 0%!)
 *   -> Nuancierte Töne: Grünliches Blau / Petrol erhält harmonisch "einen Schuss Gelb" (ca. 5-20% Gelb zu Blau)
 * - Violettbereich (Lila/Purpur/Pink): Nur Blau + Rot (Gelb = 0%!)
 * Die 3. Primärfarbe (Komplementärfarbe) wird STRIKT ausgeschlossen,
 * damit die Mischung selbst bei ungenauem Dosieren ("pi mal Daumen") niemals zu Schlamm/Braun kippt.
 */
export function hexToDirectDyePigments(hex: string): DirectDyeDecomposition {
  const { r, g, b } = hexToRgb(hex);
  const { h, s, l } = rgbToHsl(r, g, b);

  // 1. Rein weiß: 100% Spülung, 0% Pigmente
  if (l >= 0.995 || (r === 255 && g === 255 && b === 255)) {
    return {
      rot: 0,
      gelb: 0,
      blau: 0,
      spuelung: 100,
      rotShare: 0,
      gelbShare: 0,
      blauShare: 0,
      conditionerRatio: 1.0,
      lightness: 1.0
    };
  }

  // 2. Tiefschwarz: Reine Pigmente, keine Spülung
  if (l < 0.12 || (r < 30 && g < 30 && b < 30)) {
    return {
      rot: 32,
      gelb: 24,
      blau: 44,
      spuelung: 0,
      rotShare: 0.32,
      gelbShare: 0.24,
      blauShare: 0.44,
      conditionerRatio: 0.0,
      lightness: l
    };
  }

  // 3. Achromatisch / Grautöne (sehr geringe Farbsättigung s < 0.08)
  if (s < 0.08) {
    const condRatio = Math.max(0, Math.min(0.90, (l - 0.12) / 0.86));
    return {
      rot: 30,
      gelb: 25,
      blau: 45,
      spuelung: Math.round(condRatio * 100),
      rotShare: 0.30,
      gelbShare: 0.25,
      blauShare: 0.45,
      conditionerRatio: condRatio,
      lightness: l
    };
  }

  // 4. Chromatische Farben nach dem Direktzieher-Farbkreis
  let rotShare = 0;
  let gelbShare = 0;
  let blauShare = 0;

  // A) Reines Rot / Pink: 298° bis 360° und 0° bis 8°
  // BLAU UND GELB SIND STRIKT 0%!
  if (h >= 298 || h < 8) {
    rotShare = 1.0;
    gelbShare = 0;
    blauShare = 0;
  }
  // B) Warmbereich (Orange / Rot-Orange / Warmgelb): 8° bis 52°
  // BLAU IST STRIKT 0%!
  else if (h >= 8 && h < 52) {
    blauShare = 0;
    const t = (h - 8) / (52 - 8);
    rotShare = Math.pow(1 - t, 1.8);
    gelbShare = 1.0 - rotShare;
  }
  // C) Reines Gelb: 52° bis 62°
  // ROT UND BLAU SIND STRIKT 0%!
  else if (h >= 52 && h < 62) {
    gelbShare = 1.0;
    rotShare = 0;
    blauShare = 0;
  }
  // D) Violett- & Lilabereich: 235° bis 298°
  // GELB IST STRIKT 0%!
  else if (h >= 235 && h < 298) {
    gelbShare = 0;
    const t = (h - 235) / (298 - 235);
    rotShare = Math.pow(t, 1.15);
    blauShare = 1.0 - rotShare;
  }
  // E) Reines Blau & Eisblau-Toner: 212° bis 235° (sowie sehr helle Eisblau-Töne ab 175° mit l > 0.88)
  // ROT UND GELB SIND STRIKT 0%!
  else if (h >= 212 || (h >= 175 && l > 0.88)) {
    blauShare = 1.0;
    rotShare = 0;
    gelbShare = 0;
  }
  // F) Grün- & Petrolbereich (Gelbgrün über Smaragd & Türkis bis Petrol / grünliches Blau): 62° bis 212°
  // ROT IST STRIKT 0%!
  else {
    rotShare = 0;
    if (h < 165) {
      // Reines Gelbgrün bis Smaragd
      const t = (h - 62) / (165 - 62);
      blauShare = Math.pow(t, 1.25) * 0.70;
      gelbShare = 1.0 - blauShare;
    } else {
      // 165° bis 212°: Türkis über grünliches Blau / Petrol
      // Ermöglicht den perfekten "Schuss Gelb" (ca. 5% bis 25% Gelb) für nuanciertes Petrol & Meerblau
      const t = (h - 165) / (212 - 165);
      const yellowShot = 0.25 * Math.pow(1 - t, 1.4);
      if (yellowShot < 0.03) {
        gelbShare = 0;
        blauShare = 1.0;
      } else {
        gelbShare = yellowShot;
        blauShare = 1.0 - yellowShot;
      }
    }
  }

  const sumShare = rotShare + gelbShare + blauShare;
  if (sumShare > 0) {
    rotShare /= sumShare;
    gelbShare /= sumShare;
    blauShare /= sumShare;
  }

  // Spülungsanteil (Verdünnung & Pastellisierung nach physikalischer Helligkeit):
  // Helle Farben (Hellblau, Pastellrosa, Flieder) erhalten viel Spülung zum Aufhellen (60-95%)
  // Mittlere Farben (Kräftig) erhalten ca. 15-30% Spülung
  // Dunkle Farben (Dunkelblau, Weinrot, Tannengrün) erhalten 0-15% Spülung
  let conditionerRatio = 0.15;
  if (l >= 0.50) {
    conditionerRatio = 0.15 + ((l - 0.50) / 0.495) * 0.83;
    conditionerRatio = Math.max(0.15, Math.min(0.98, conditionerRatio));
  } else {
    conditionerRatio = Math.max(0, (l / 0.50) * 0.15);
  }

  let rotPct = 0;
  let gelbPct = 0;
  let blauPct = 0;

  if (blauShare === 0 && rotShare === 0) {
    gelbPct = 100;
  } else if (rotShare === 0 && gelbShare === 0) {
    blauPct = 100;
  } else if (gelbShare === 0 && blauShare === 0) {
    rotPct = 100;
  } else if (blauShare === 0) {
    rotPct = Math.round(rotShare * 100);
    gelbPct = 100 - rotPct;
  } else if (rotShare === 0) {
    blauPct = Math.round(blauShare * 100);
    gelbPct = 100 - blauPct;
  } else {
    rotPct = Math.round(rotShare * 100);
    blauPct = 100 - rotPct;
  }

  return {
    rot: rotPct,
    gelb: gelbPct,
    blau: blauPct,
    spuelung: Math.round(conditionerRatio * 100),
    rotShare,
    gelbShare,
    blauShare,
    conditionerRatio,
    lightness: l
  };
}

/**
 * Wandelt Reglerwerte (Rot, Gelb, Blau + Weiße Spülung) in eine resultierende Hex-Farbe um.
 * Unterstützt sowohl Spülungs-Prozentsätze (0-100%) als auch direkte Helligkeitswerte (0.0-1.0).
 */
export function directDyePigmentsToHex(
  rot: number,
  gelb: number,
  blau: number,
  spuelungOrLightness: number = 20
): string {
  const sum = rot + gelb + blau;
  if (sum <= 0) {
    return '#ffffff';
  }

  // Helligkeit berechnen:
  let l = 0.5;
  if (spuelungOrLightness <= 1.0) {
    // Falls ein 0.0 - 1.0 Helligkeitswert übergeben wurde
    l = Math.max(0.12, Math.min(0.95, spuelungOrLightness));
  } else {
    // Spülungs-Prozentwert (0% = tief/dunkel wie Dunkelblau, 80%+ = Hellblau/Pastell)
    const sp = Math.max(0, Math.min(100, spuelungOrLightness));
    if (sp <= 15) {
      l = 0.18 + (sp / 15) * 0.22; // 0% -> 0.18, 15% -> 0.40
    } else {
      l = 0.40 + ((sp - 15) / 85) * 0.48; // 50% -> 0.60, 85% -> 0.80
    }
  }

  // Fall 1: Nur Rot & Gelb (Blau === 0) -> Warmes Spektrum
  if (blau === 0) {
    const t = gelb / (rot + gelb);
    let h = 8 + t * 44;
    const rgb = hslToRgb(h, 0.98, l);
    return rgbToHex(rgb.r, rgb.g, rgb.b);
  }

  // Fall 2: Nur Gelb & Blau (Rot === 0) -> Grünspektrum bis Petrol & Echtes Blau
  if (rot === 0) {
    const t = blau / (gelb + blau);
    let h = 62;
    if (t <= 0.75) {
      // 0 bis 75% Blau: Gelbgrün bis Türkis
      h = 62 + (t / 0.75) * (175 - 62);
    } else {
      // 75% bis 100% Blau: Türkis über grünliches Blau / Petrol bis Reines Blau
      const u = (t - 0.75) / 0.25;
      h = 175 + u * (228 - 175);
    }
    const rgb = hslToRgb(h, 0.95, l);
    return rgbToHex(rgb.r, rgb.g, rgb.b);
  }

  // Fall 3: Nur Blau & Rot (Gelb === 0) -> Violettspektrum
  if (gelb === 0) {
    const t = rot / (blau + rot);
    const h = 228 + t * (350 - 228);
    const rgb = hslToRgb(h, 0.92, l);
    return rgbToHex(rgb.r, rgb.g, rgb.b);
  }

  // Fall 4: Alle 3 Regler aktiv -> Schlamm-/Neutral-Trübung
  const minVal = Math.min(rot, gelb, blau);
  const maxVal = Math.max(rot, gelb, blau);
  const desat = Math.min(1.0, (minVal / maxVal) * 1.5);
  const s = Math.max(0.05, 0.95 - desat * 0.8);

  let h = 0;
  if (blau <= rot && blau <= gelb) {
    const t = gelb / (rot + gelb);
    h = 8 + t * 44;
  } else if (rot <= gelb && rot <= blau) {
    const t = blau / (gelb + blau);
    h = 62 + (t <= 0.75 ? (t / 0.75) * 113 : 113 + ((t - 0.75) / 0.25) * 53);
  } else {
    const t = rot / (blau + rot);
    h = 228 + t * 122;
  }
  const adjustedL = Math.max(0.1, Math.min(0.85, l * (1 - desat * 0.2)));
  const rgb = hslToRgb(h, s, adjustedL);
  return rgbToHex(rgb.r, rgb.g, rgb.b);
}

export function hexToCmy(hex: string): { c: number; m: number; y: number } {
  const dye = hexToDirectDyePigments(hex);
  return {
    c: dye.blau / 100,
    m: dye.rot / 100,
    y: dye.gelb / 100
  };
}

export function cmyToHex(c: number, m: number, y: number): string {
  return directDyePigmentsToHex(
    Math.round(m * 100),
    Math.round(y * 100),
    Math.round(c * 100)
  );
}

function getOpticalAbsorptionCmy(hex: string): { c: number; m: number; y: number } {
  const { r, g, b } = hexToRgb(hex);
  return {
    c: 1 - r / 255,
    m: 1 - g / 255,
    y: 1 - b / 255
  };
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
  const cRef = getOpticalAbsorptionCmy(cyanRefHex);
  const mRef = getOpticalAbsorptionCmy(magentaRefHex);
  const yRef = getOpticalAbsorptionCmy(yellowRefHex);
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

  // Oberflächenanlagerung der Direktzieher-Pigmente (semi-permanente Farbschicht)
  const surfaceDeposit = 0.18 * pigmentLoad;
  outR = Math.round((1 - surfaceDeposit) * outR + surfaceDeposit * dyeRgb.r * pigmentLoad);
  outG = Math.round((1 - surfaceDeposit) * outG + surfaceDeposit * dyeRgb.g * pigmentLoad);
  outB = Math.round((1 - surfaceDeposit) * outB + surfaceDeposit * dyeRgb.b * pigmentLoad);

  // Grenzen einhalten (0–255)
  outR = Math.max(0, Math.min(255, outR));
  outG = Math.max(0, Math.min(255, outG));
  outB = Math.max(0, Math.min(255, outB));

  return rgbToHex(outR, outG, outB);
}


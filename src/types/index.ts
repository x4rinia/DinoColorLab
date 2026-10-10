export type ColorGroup = 'cyan' | 'magenta' | 'yellow';

export const COLOR_GROUP_NAMES: Record<ColorGroup, string> = {
  cyan: 'Blau',
  magenta: 'Rot-Pink',
  yellow: 'Gelb'
};

export const COLOR_GROUP_DESCRIPTIONS: Record<ColorGroup, string> = {
  cyan: 'Blau (echtes kräftiges Blau, nicht türkis)',
  magenta: 'Rot-Pink (kühles, pinkstichiges Rot für kräftige Violetttöne)',
  yellow: 'Gelb (klares, leuchtendes Gelb)'
};

export const COLOR_GROUP_DEFAULT_HEX: Record<ColorGroup, string> = {
  cyan: '#2563eb', // Echtes, kräftiges Blau (nicht türkis)
  magenta: '#e11d48', // Kühles pinkstichiges Rot
  yellow: '#ffd600' // Klares leuchtendes Gelb
};

export type CalibrationStatus = 'uncalibrated' | 'partially_calibrated' | 'calibrated';

export interface PigmentProfile {
  id?: number;
  name: string;
  brand: string;
  colorGroup: ColorGroup;
  photoUrl?: string; // compressed base64 data URL
  referenceHex: string; // Unverdünnte Referenzfarbe
  intensity: number; // 0.1 - 3.0 scale multiplier
  densityGPerMl?: number; // density in g/ml, optional
  concentrationData?: string; // text/JSON notes
  notes?: string;
  status: CalibrationStatus;
  isDemo?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ConditionerProfile {
  id?: number;
  name: string;
  brand: string;
  photoUrl?: string;
  densityGPerMl?: number;
  notes?: string;
  isDemo?: boolean;
  createdAt: string;
}

export type BaseHairColorLevel = 
  | 'bleached_level10' // Sehr hell blondiert (Level 10-11)
  | 'light_blonde_level9' // Hellblond (Level 9)
  | 'medium_blonde_level8' // Mittelblond (Level 7-8)
  | 'dark_blonde_level6' // Dunkelblond (Level 6)
  | 'light_brown_level5' // Hellbraun (Level 5)
  | 'dark_brown_level4' // Dunkelbraun (Level 4)
  | 'already_dyed'; // Bereits gefärbt

export interface BaseHairColorOption {
  key: BaseHairColorLevel;
  label: string;
  hex: string; // visual approximation
  description: string;
}

export interface CustomBaseHairColor {
  levelKey: BaseHairColorLevel;
  hex: string;
  notes?: string;
}

export interface CalculationInput {
  targetHex: string;
  cyanPigmentId: number;
  magentaPigmentId: number;
  yellowPigmentId: number;
  conditionerId?: number;
  totalBatchGrams: number;
  maxConditionerRatioPercent: number; // 0 to 95%
  baseHairColor: CustomBaseHairColor;
}

export interface IngredientBreakdown {
  cyanGrams: number;
  magentaGrams: number;
  yellowGrams: number;
  conditionerGrams: number;
  cyanPercent: number;
  magentaPercent: number;
  yellowPercent: number;
  conditionerPercent: number;
  // ml optional display
  cyanMl?: number;
  magentaMl?: number;
  yellowMl?: number;
  conditionerMl?: number;
  totalGrams: number;
}

export type CalculationMode = 'demo_experimental' | 'calibrated';

export interface CalculationResult {
  mode: CalculationMode;
  ingredients: IngredientBreakdown;
  estimatedResultHex: string;
  deltaEToTarget: number; // perception distance OKLab/Lab
  confidenceScore: number; // 0 to 100%
  isExtrapolated?: boolean;
  isTargetAchievable: boolean;
  nearestAchievableHex?: string;
  disclaimer: string;
  calibrationNotes?: string;
}

export interface ColorRecipe {
  id?: number;
  title: string;
  description?: string;
  targetHex: string;
  cyanPigmentId: number;
  magentaPigmentId: number;
  yellowPigmentId: number;
  conditionerId?: number;
  totalBatchGrams: number;
  ingredients: IngredientBreakdown;
  baseHairColor: CustomBaseHairColor;
  testStatus: 'untested' | 'tested_passed' | 'tested_needs_tweak';
  tags: string[];
  isFavorite: boolean;
  isDemo?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface StrandTest {
  id?: number;
  recipeId?: number;
  title: string;
  date: string;
  cyanPigmentId: number;
  magentaPigmentId: number;
  yellowPigmentId: number;
  conditionerId?: number;
  actualCyanGrams: number;
  actualMagentaGrams: number;
  actualYellowGrams: number;
  actualConditionerGrams: number;
  baseHairColor: CustomBaseHairColor;
  processingTimeMinutes: number; // Einwirkzeit
  photoBeforeUrl?: string;
  photoAfterUrl?: string;
  measuredResultHex: string;
  targetHex: string;
  rating: number; // 1-5 stars
  notes?: string;
  createdAt: string;
}

export interface CalibrationSet {
  id?: number;
  pigmentIds: { cyan: number; magenta: number; yellow: number };
  baseHairColorLevel: BaseHairColorLevel;
  gainCyan: number;
  gainMagenta: number;
  gainYellow: number;
  sampleCount: number;
  lastUpdated: string;
}

export interface AppSettings {
  id?: number;
  theme: 'dark' | 'light';
  disclaimerAccepted: boolean;
  defaultBatchGrams: number;
  roundingPrecision: 0.1 | 0.01;
  recentColors: string[];
  favoriteColors: string[];
}

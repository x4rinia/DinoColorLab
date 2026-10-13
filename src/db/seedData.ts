import type { PigmentProfile, ConditionerProfile, ColorRecipe, StrandTest, AppSettings } from '../types';

export const INITIAL_PIGMENTS: PigmentProfile[] = [
  {
    id: 1,
    name: 'Demo Blau Direct Dye (Beispiel)',
    brand: 'Dino Lab Demos',
    colorGroup: 'cyan',
    referenceHex: '#2563eb',
    intensity: 1.0,
    densityGPerMl: 1.02,
    concentrationData: 'Demonstration Pigment. Nicht für reale Haare ohne Strandtest.',
    notes: 'Kräftiges, echtes Blau (kein Türkis) zur Veranschaulichung der Farbmischung.',
    status: 'uncalibrated',
    isDemo: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 2,
    name: 'Demo Rot (Beispiel)',
    brand: 'Dino Lab Demos',
    colorGroup: 'magenta',
    referenceHex: '#D71D77',
    intensity: 1.0,
    densityGPerMl: 1.01,
    concentrationData: 'Demonstration Pigment.',
    notes: 'Kühles, pinkstichiges Rot für kräftige Violett- und Beerentöne.',
    status: 'uncalibrated',
    isDemo: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 3,
    name: 'Demo Sonnengelb (Beispiel)',
    brand: 'Dino Lab Demos',
    colorGroup: 'yellow',
    referenceHex: '#ffd600',
    intensity: 1.0,
    densityGPerMl: 1.0,
    concentrationData: 'Demonstration Pigment.',
    notes: 'Klares, leuchtendes Gelb für leuchtende Grün- und Orangetöne.',
    status: 'uncalibrated',
    isDemo: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export const INITIAL_CONDITIONER: ConditionerProfile[] = [
  {
    id: 1,
    name: 'Weiße Spülung (Neutral)',
    brand: 'Dino Lab Demos',
    densityGPerMl: 1.0,
    notes: 'Neutrale weiße Haarspülung (#FFFFFF) zum Verdünnen und Pastellisieren.',
    isDemo: true,
    createdAt: new Date().toISOString()
  }
];

export const INITIAL_SETTINGS: AppSettings = {
  id: 1,
  theme: 'dark',
  disclaimerAccepted: false,
  defaultBatchGrams: 5,
  roundingPrecision: 0.1,
  recentColors: ['#3b82f6', '#D71D77', '#ffd600', '#8b5cf6', '#10b981'],
  favoriteColors: ['#3b82f6', '#D71D77', '#8b5cf6']
};

export const INITIAL_RECIPES: ColorRecipe[] = [];

export const INITIAL_STRAND_TESTS: StrandTest[] = [];


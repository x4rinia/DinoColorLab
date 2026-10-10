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
    name: 'Demo Rot-Pink Vivid (Beispiel)',
    brand: 'Dino Lab Demos',
    colorGroup: 'magenta',
    referenceHex: '#e11d48',
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
  recentColors: ['#3b82f6', '#e11d48', '#ffd600', '#8b5cf6', '#10b981'],
  favoriteColors: ['#3b82f6', '#e11d48', '#8b5cf6']
};

export const INITIAL_RECIPES: ColorRecipe[] = [
  {
    id: 1,
    title: 'Pastell-Aquamarin Dino (Demo)',
    description: 'Frischer, kühler Türkiston mit hoher Verdünnung.',
    targetHex: '#7dd3fc',
    cyanPigmentId: 1,
    magentaPigmentId: 2,
    yellowPigmentId: 3,
    conditionerId: 1,
    totalBatchGrams: 50,
    ingredients: {
      cyanGrams: 4.5,
      magentaGrams: 0.5,
      yellowGrams: 1.0,
      conditionerGrams: 44.0,
      cyanPercent: 9.0,
      magentaPercent: 1.0,
      yellowPercent: 2.0,
      conditionerPercent: 88.0,
      cyanMl: 4.41,
      magentaMl: 0.5,
      yellowMl: 1.0,
      conditionerMl: 44.0,
      totalGrams: 50
    },
    baseHairColor: {
      levelKey: 'bleached_level10',
      hex: '#fffbeb',
      notes: 'Stufe 10 Platinblond'
    },
    testStatus: 'tested_passed',
    tags: ['Pastell', 'Türkis', 'Demo'],
    isFavorite: true,
    isDemo: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 2,
    title: 'Sanftes Lavendel-Flieder (Demo)',
    description: 'Ausgewogenes Rosa-Blau Gemisch mit viel Conditioner.',
    targetHex: '#c084fc',
    cyanPigmentId: 1,
    magentaPigmentId: 2,
    yellowPigmentId: 3,
    conditionerId: 1,
    totalBatchGrams: 50,
    ingredients: {
      cyanGrams: 3.0,
      magentaGrams: 5.0,
      yellowGrams: 0.2,
      conditionerGrams: 41.8,
      cyanPercent: 6.0,
      magentaPercent: 10.0,
      yellowPercent: 0.4,
      conditionerPercent: 83.6,
      cyanMl: 2.94,
      magentaMl: 4.95,
      yellowMl: 0.2,
      conditionerMl: 41.8,
      totalGrams: 50
    },
    baseHairColor: {
      levelKey: 'bleached_level10',
      hex: '#fffbeb'
    },
    testStatus: 'untested',
    tags: ['Pastell', 'Violett', 'Flieder'],
    isFavorite: false,
    isDemo: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export const INITIAL_STRAND_TESTS: StrandTest[] = [
  {
    id: 1,
    recipeId: 1,
    title: 'Teststrähne Aquamarin auf Platinblond',
    date: new Date().toISOString().split('T')[0],
    cyanPigmentId: 1,
    magentaPigmentId: 2,
    yellowPigmentId: 3,
    conditionerId: 1,
    actualCyanGrams: 4.5,
    actualMagentaGrams: 0.5,
    actualYellowGrams: 1.0,
    actualConditionerGrams: 44.0,
    baseHairColor: {
      levelKey: 'bleached_level10',
      hex: '#fffbeb'
    },
    processingTimeMinutes: 30,
    measuredResultHex: '#76d0f5',
    targetHex: '#7dd3fc',
    rating: 5,
    notes: 'Sehr gutes Ergebnis, kühler Pastellton wie gewünscht. Haare blieben geschmeidig.',
    createdAt: new Date().toISOString()
  }
];

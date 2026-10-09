import Dexie, { type Table } from 'dexie';
import type {
  PigmentProfile,
  ConditionerProfile,
  ColorRecipe,
  StrandTest,
  CalibrationSet,
  AppSettings
} from '../types';
import {
  INITIAL_PIGMENTS,
  INITIAL_CONDITIONER,
  INITIAL_SETTINGS,
  INITIAL_RECIPES,
  INITIAL_STRAND_TESTS
} from './seedData';

export class DinoColorLabDatabase extends Dexie {
  pigments!: Table<PigmentProfile, number>;
  conditioners!: Table<ConditionerProfile, number>;
  recipes!: Table<ColorRecipe, number>;
  strandTests!: Table<StrandTest, number>;
  calibrationSets!: Table<CalibrationSet, number>;
  settings!: Table<AppSettings, number>;

  constructor() {
    super('DinoColorLabDB');

    this.version(1).stores({
      pigments: '++id, colorGroup, status, isDemo',
      conditioners: '++id, isDemo',
      recipes: '++id, title, testStatus, isFavorite, isDemo, createdAt',
      strandTests: '++id, recipeId, rating, date',
      calibrationSets: '++id, baseHairColorLevel',
      settings: '++id'
    });
  }
}

export const db = new DinoColorLabDatabase();

db.on('populate', async () => {
  await db.pigments.bulkAdd(INITIAL_PIGMENTS);
  await db.conditioners.bulkAdd(INITIAL_CONDITIONER);
  await db.settings.add(INITIAL_SETTINGS);
  await db.recipes.bulkAdd(INITIAL_RECIPES);
  await db.strandTests.bulkAdd(INITIAL_STRAND_TESTS);
});

export async function getAppSettings(): Promise<AppSettings> {
  const settings = await db.settings.toCollection().first();
  if (settings) return settings;
  const id = await db.settings.add(INITIAL_SETTINGS);
  return { ...INITIAL_SETTINGS, id };
}

export async function updateAppSettings(changes: Partial<AppSettings>): Promise<void> {
  const current = await getAppSettings();
  if (current.id) {
    await db.settings.update(current.id, changes);
  }
}

import { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, updateAppSettings } from './db/database';
import {
  INITIAL_PIGMENTS,
  INITIAL_CONDITIONER,
  INITIAL_SETTINGS,
  INITIAL_RECIPES,
  INITIAL_STRAND_TESTS
} from './db/seedData';
import { Header } from './components/common/Header';
import { Navigation, type TabType } from './components/common/Navigation';
import { SafetyBanner } from './components/common/SafetyBanner';
import { Farblabor } from './components/lab/Farblabor';
import { PigmenteTab } from './components/pigments/PigmenteTab';
import { RezepteTab } from './components/recipes/RezepteTab';
import { TeststraehnenTab } from './components/strandtests/TeststraehnenTab';
import { EinstellungenTab } from './components/settings/EinstellungenTab';
import { PrintRecipeView } from './components/recipes/PrintRecipeView';
import type { PigmentProfile, ConditionerProfile, ColorRecipe, StrandTest, AppSettings } from './types';

export function App() {
  const [activeTab, setActiveTab] = useState<TabType>('farblabor');
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [standalonePrintRecipe, setStandalonePrintRecipe] = useState<any>(null);

  const pigments = useLiveQuery(() => db.pigments.toArray()) || INITIAL_PIGMENTS;
  const conditioners = useLiveQuery(() => db.conditioners.toArray()) || INITIAL_CONDITIONER;
  const recipes = useLiveQuery(() => db.recipes.toArray()) || INITIAL_RECIPES;
  const strandTests = useLiveQuery(() => db.strandTests.toArray()) || INITIAL_STRAND_TESTS;
  const dbSettings = useLiveQuery(() => db.settings.toCollection().first()) || INITIAL_SETTINGS;

  const [localSettings, setLocalSettings] = useState<AppSettings>(INITIAL_SETTINGS);

  useEffect(() => {
    if (dbSettings) {
      setLocalSettings(dbSettings);
    }
  }, [dbSettings]);

  useEffect(() => {
    if (localSettings.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [localSettings.theme]);

  useEffect(() => {
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  const handleInstallPwa = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    }
  };

  const handleUpdateSettings = async (changes: Partial<AppSettings>) => {
    const updated = { ...localSettings, ...changes };
    setLocalSettings(updated);
    await updateAppSettings(changes);
  };

  const handleSavePigment = async (pigment: Omit<PigmentProfile, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    await db.pigments.add({
      ...pigment,
      createdAt: now,
      updatedAt: now
    });
  };

  const handleUpdatePigment = async (id: number, changes: Partial<PigmentProfile>) => {
    await db.pigments.update(id, {
      ...changes,
      updatedAt: new Date().toISOString()
    });
  };

  const handleDeletePigment = async (id: number) => {
    await db.pigments.delete(id);
  };

  const handleSaveConditioner = async (conditioner: Omit<ConditionerProfile, 'id' | 'createdAt'>) => {
    await db.conditioners.add({
      ...conditioner,
      createdAt: new Date().toISOString()
    });
  };

  const handleSaveRecipe = async (recipe: Omit<ColorRecipe, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    await db.recipes.add({
      ...recipe,
      createdAt: now,
      updatedAt: now
    });
  };

  const handleUpdateRecipe = async (id: number, changes: Partial<ColorRecipe>) => {
    await db.recipes.update(id, {
      ...changes,
      updatedAt: new Date().toISOString()
    });
  };

  const handleDeleteRecipe = async (id: number) => {
    await db.recipes.delete(id);
  };

  const handleSaveStrandTest = async (test: Omit<StrandTest, 'id' | 'createdAt'>) => {
    await db.strandTests.add({
      ...test,
      createdAt: new Date().toISOString()
    });
  };

  const handleDeleteStrandTest = async (id: number) => {
    await db.strandTests.delete(id);
  };

  const handleReloadAllData = () => {};

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans transition-colors duration-300 selection:bg-cyan-500 selection:text-slate-950">
      <SafetyBanner />

      <Header
        settings={localSettings}
        onUpdateSettings={handleUpdateSettings}
        deferredInstallPrompt={deferredPrompt}
        onInstallPwa={handleInstallPwa}
      />

      <Navigation
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        recipeCount={recipes.length}
        testCount={strandTests.length}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6">
        {activeTab === 'farblabor' && (
          <Farblabor
            pigments={pigments}
            conditioners={conditioners}
            strandTests={strandTests}
            settings={localSettings}
            onSaveRecipe={handleSaveRecipe}
            onCreateStrandTest={handleSaveStrandTest}
            onUpdateSettings={handleUpdateSettings}
            onPrintRecipe={(recipe) => {
              setStandalonePrintRecipe(recipe);
            }}
          />
        )}

        {activeTab === 'pigmente' && (
          <PigmenteTab
            pigments={pigments}
            conditioners={conditioners}
            onSavePigment={handleSavePigment}
            onUpdatePigment={handleUpdatePigment}
            onDeletePigment={handleDeletePigment}
            onSaveConditioner={handleSaveConditioner}
          />
        )}

        {activeTab === 'rezepte' && (
          <RezepteTab
            recipes={recipes}
            pigments={pigments}
            conditioners={conditioners}
            onSaveRecipe={handleSaveRecipe}
            onUpdateRecipe={handleUpdateRecipe}
            onDeleteRecipe={handleDeleteRecipe}
            onNavigateToFarblabor={() => setActiveTab('farblabor')}
          />
        )}

        {activeTab === 'teststraehnen' && (
          <TeststraehnenTab
            strandTests={strandTests}
            pigments={pigments}
            conditioners={conditioners}
            onSaveStrandTest={handleSaveStrandTest}
            onDeleteStrandTest={handleDeleteStrandTest}
          />
        )}

        {activeTab === 'einstellungen' && (
          <EinstellungenTab
            settings={localSettings}
            onUpdateSettings={handleUpdateSettings}
            onReloadAllData={handleReloadAllData}
          />
        )}
      </main>

      <footer className="bg-slate-950 border-t border-slate-900 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            <strong>Dino Color Lab 🦕</strong> — Entwickelt für direkte, nichtoxidative Haarfarben.
          </div>
          <div>Alle Berechnungen & Daten lokal im Browser gespeichert (IndexedDB).</div>
        </div>
      </footer>

      {standalonePrintRecipe && (
        <PrintRecipeView
          recipe={standalonePrintRecipe}
          pigments={pigments}
          conditioners={conditioners}
          onClose={() => setStandalonePrintRecipe(null)}
        />
      )}
    </div>
  );
}

export default App;

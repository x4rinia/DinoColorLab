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
import { Farblabor } from './components/lab/Farblabor';
import { PigmenteTab } from './components/pigments/PigmenteTab';
import { RezepteTab } from './components/recipes/RezepteTab';
import { PrintRecipeView } from './components/recipes/PrintRecipeView';
import type { ColorRecipe, StrandTest, AppSettings } from './types';

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
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.add('light');
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

  // Einmalige Bereinigung veralteter Demo-Rezepte aus IndexedDB
  useEffect(() => {
    const clearDemosOnce = async () => {
      const alreadyCleared = localStorage.getItem('dino_demo_recipes_cleaned_v2');
      if (!alreadyCleared) {
        try {
          const allRecipes = await db.recipes.toArray();
          const demoIds = allRecipes
            .filter((r) => r.isDemo || r.title.includes('(Demo)') || r.tags?.includes('Demo'))
            .map((r) => r.id)
            .filter((id): id is number => typeof id === 'number');

          if (demoIds.length > 0) {
            await db.recipes.bulkDelete(demoIds);
          }
          localStorage.setItem('dino_demo_recipes_cleaned_v2', 'true');
        } catch (e) {
          console.error('Failed to cleanup demo recipes', e);
        }
      }
    };
    clearDemosOnce();
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

  const handleDeleteDemoRecipes = async () => {
    const allRecipes = await db.recipes.toArray();
    const demoIds = allRecipes
      .filter((r) => r.isDemo || r.title.includes('(Demo)') || r.tags?.includes('Demo'))
      .map((r) => r.id)
      .filter((id): id is number => typeof id === 'number');
    if (demoIds.length > 0) {
      await db.recipes.bulkDelete(demoIds);
    }
  };

  const handleSaveStrandTest = async (test: Omit<StrandTest, 'id' | 'createdAt'>) => {
    await db.strandTests.add({
      ...test,
      createdAt: new Date().toISOString()
    });
  };

  const isDark = (localSettings.theme ?? 'dark') === 'dark';

  return (
    <div className={`min-h-screen ${isDark ? 'bg-black text-slate-100' : 'bg-white text-slate-900'} flex flex-col font-sans transition-colors duration-200 selection:bg-cyan-500 selection:text-slate-950`}>
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
          <PigmenteTab />
        )}

        {activeTab === 'rezepte' && (
          <RezepteTab
            recipes={recipes}
            pigments={pigments}
            conditioners={conditioners}
            onSaveRecipe={handleSaveRecipe}
            onUpdateRecipe={handleUpdateRecipe}
            onDeleteRecipe={handleDeleteRecipe}
            onDeleteDemoRecipes={handleDeleteDemoRecipes}
            onNavigateToFarblabor={() => setActiveTab('farblabor')}
          />
        )}
      </main>

      <footer className="bg-slate-950 border-t border-slate-900 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            <strong>Dino Color Lab 🦕</strong> — Entwickelt für direkte, nichtoxidative Haarfarben.
          </div>
          <div className="text-slate-400 font-medium">
            by X4rinia und Dino 🦕
          </div>
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

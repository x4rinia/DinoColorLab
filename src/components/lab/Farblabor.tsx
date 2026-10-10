import React, { useState, useMemo } from 'react';
import type {
  PigmentProfile,
  ConditionerProfile,
  CustomBaseHairColor,
  StrandTest,
  ColorRecipe,
  AppSettings
} from '../../types';
import { calculateRecipe } from '../../engine/calculationEngine';
import { ColorSelection } from './ColorSelection';
import { BaseHairSelector } from './BaseHairSelector';
import { BatchSettings } from './BatchSettings';
import { RecipeResultCard } from './RecipeResultCard';
import { FarbmischungsAnsicht } from './FarbmischungsAnsicht';
import { DinoMascot } from '../common/DinoMascot';
import confetti from 'canvas-confetti';
import { BookmarkPlus, X, Check } from 'lucide-react';

interface FarblaborProps {
  pigments: PigmentProfile[];
  conditioners: ConditionerProfile[];
  strandTests: StrandTest[];
  settings: AppSettings;
  onSaveRecipe: (recipe: Omit<ColorRecipe, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  onCreateStrandTest: (test: Omit<StrandTest, 'id' | 'createdAt'>) => Promise<void>;
  onUpdateSettings: (newSettings: Partial<AppSettings>) => void;
  onPrintRecipe: (recipe: any) => void;
}

export const Farblabor: React.FC<FarblaborProps> = ({
  pigments,
  conditioners,
  strandTests,
  settings,
  onSaveRecipe,
  onCreateStrandTest: _onCreateStrandTest,
  onUpdateSettings,
  onPrintRecipe
}) => {
  const [targetHex, setTargetHex] = useState<string>('#3b82f6');
  // Default to 5 ml Standard for small portions (Pony, Sidecut, Strähne)
  const [totalBatchGrams, setTotalBatchGrams] = useState<number>(settings.defaultBatchGrams || 5);
  const [maxConditionerRatioPercent, setMaxConditionerRatioPercent] = useState<number>(80);

  const cyanPigment = useMemo(
    () => pigments.find((p) => p.colorGroup === 'cyan') || pigments[0],
    [pigments]
  );
  const magentaPigment = useMemo(
    () => pigments.find((p) => p.colorGroup === 'magenta') || pigments[1] || pigments[0],
    [pigments]
  );
  const yellowPigment = useMemo(
    () => pigments.find((p) => p.colorGroup === 'yellow') || pigments[2] || pigments[0],
    [pigments]
  );
  const conditioner = useMemo(
    () => conditioners[0],
    [conditioners]
  );

  const [baseHairColor, setBaseHairColor] = useState<CustomBaseHairColor>({
    levelKey: 'bleached_level10',
    hex: '#fffbeb'
  });

  const [showSaveModal, setShowSaveModal] = useState(false);
  const [recipeTitle, setRecipeTitle] = useState('');
  const [recipeDescription, setRecipeDescription] = useState('');
  const [recipeTags, setRecipeTags] = useState('Teststrähne, Pastell');


  const calculationResult = useMemo(() => {
    return calculateRecipe(
      {
        targetHex,
        cyanPigmentId: cyanPigment.id!,
        magentaPigmentId: magentaPigment.id!,
        yellowPigmentId: yellowPigment.id!,
        conditionerId: conditioner?.id,
        totalBatchGrams,
        maxConditionerRatioPercent,
        baseHairColor
      },
      cyanPigment,
      magentaPigment,
      yellowPigment,
      conditioner,
      strandTests,
      [],
      { roundingPrecision: settings.roundingPrecision }
    );
  }, [
    targetHex,
    totalBatchGrams,
    maxConditionerRatioPercent,
    cyanPigment,
    magentaPigment,
    yellowPigment,
    conditioner,
    baseHairColor,
    strandTests,
    settings.roundingPrecision
  ]);

  const handleColorChange = (hex: string) => {
    setTargetHex(hex);
    const currentRecents = settings.recentColors || [];
    const updatedRecents = [
      hex,
      ...currentRecents.filter((c) => c.toLowerCase() !== hex.toLowerCase())
    ].slice(0, 8);
    onUpdateSettings({ recentColors: updatedRecents });
  };

  const handleToggleFavorite = (hex: string) => {
    const currentFavs = settings.favoriteColors || [];
    const exists = currentFavs.some((c) => c.toLowerCase() === hex.toLowerCase());
    const updated = exists
      ? currentFavs.filter((c) => c.toLowerCase() !== hex.toLowerCase())
      : [...currentFavs, hex];
    onUpdateSettings({ favoriteColors: updated });
  };

  const handleConfirmSaveRecipe = async () => {
    if (!recipeTitle.trim()) return;

    await onSaveRecipe({
      title: recipeTitle.trim(),
      description: recipeDescription.trim(),
      targetHex,
      cyanPigmentId: cyanPigment.id!,
      magentaPigmentId: magentaPigment.id!,
      yellowPigmentId: yellowPigment.id!,
      conditionerId: conditioner?.id,
      totalBatchGrams,
      ingredients: calculationResult.ingredients,
      baseHairColor,
      testStatus: 'untested',
      tags: recipeTags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
      isFavorite: false
    });

    confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
    setShowSaveModal(false);
    setRecipeTitle('');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Welcome Banner: Clear Focus on Wunschfarbe & Portionen für Pony / Sidecut */}
      <div className="bg-gradient-to-r from-blue-950/80 via-slate-900 to-rose-950/80 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2.5 text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 text-xs font-semibold border border-cyan-500/30">
            <span>Dino Farblabor 🦕</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight m-0">
            Haarfarben-Mischlabor für direktziehende Pigmente
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
            Wähle deine <strong>Wunschfarbe</strong>, stimme Pigmente &amp; Spülungsanteil ab und erhalte sofort
            eine druckfertige <strong>automatische Rezeptkarte mit Löffelmaßen</strong> – ideal für sparsame Portionen (Pony, Sidecut oder einzelne Strähnen).
          </p>
        </div>

        <DinoMascot
          size="lg"
          expression="happy"
          speechBubble="Wähle deine Wunschfarbe – deine Rezeptkarte mit Löffelmaßen für Pony & Sidecut aktualisiert sich live!"
        />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Color Selection, Base Hair, Batch Settings */}
        <div className="lg:col-span-6 space-y-6">
          <ColorSelection
            targetHex={targetHex}
            onChangeColor={handleColorChange}
            recentColors={settings.recentColors || []}
            favoriteColors={settings.favoriteColors || []}
            onToggleFavorite={handleToggleFavorite}
          />

          <BaseHairSelector value={baseHairColor} onChange={setBaseHairColor} />

          <BatchSettings
            totalBatchGrams={totalBatchGrams}
            maxConditionerRatioPercent={maxConditionerRatioPercent}
            onChangeBatchGrams={setTotalBatchGrams}
            onChangeConditionerRatio={setMaxConditionerRatioPercent}
          />
        </div>

        {/* Right Column: Automatic Recipe Result Card */}
        <div className="lg:col-span-6 space-y-6 sticky top-24">
          <RecipeResultCard
            result={calculationResult}
            cyanPigment={cyanPigment}
            magentaPigment={magentaPigment}
            yellowPigment={yellowPigment}
            conditioner={conditioner}
            targetHex={targetHex}
            baseHairHex={baseHairColor.hex}
            baseHairLevelName={baseHairColor.levelKey}
            onSaveRecipe={() => setShowSaveModal(true)}
            onPrintRecipe={() =>
              onPrintRecipe({
                title: `Rezeptkarte ${targetHex.toUpperCase()} (${totalBatchGrams} ml)`,
                targetHex,
                estimatedResultHex: calculationResult.estimatedResultHex,
                baseHairColor,
                totalBatchGrams,
                ingredients: calculationResult.ingredients,
                cyanPigmentId: cyanPigment.id || 1,
                magentaPigmentId: magentaPigment.id || 2,
                yellowPigmentId: yellowPigment.id || 3,
                conditionerId: conditioner?.id,
                createdAt: new Date().toISOString()
              })
            }
          />
        </div>
      </div>

      {/* FarbmischungsAnsicht (Requirement 2): Subtractive Step-by-Step Mixing Visualizer */}
      <div className="pt-2">
        <FarbmischungsAnsicht
          cyanPigment={cyanPigment}
          magentaPigment={magentaPigment}
          yellowPigment={yellowPigment}
          conditioner={conditioner}
          ingredients={calculationResult.ingredients}
          estimatedResultHex={calculationResult.estimatedResultHex}
          baseHairHex={baseHairColor.hex}
          baseHairLevelName={baseHairColor.levelKey}
          isCalibrated={calculationResult.mode === 'calibrated'}
        />
      </div>

      {/* Save Recipe Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full text-white shadow-2xl relative space-y-4">
            <button
              onClick={() => setShowSaveModal(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-bold flex items-center gap-2 m-0">
              <BookmarkPlus className="w-5 h-5 text-cyan-400" />
              <span>Rezept in Bibliothek speichern</span>
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Rezept-Titel *</label>
              <input
                type="text"
                value={recipeTitle}
                onChange={(e) => setRecipeTitle(e.target.value)}
                placeholder="z. B. Dino Ozeanblau oder Beeren-Flieder"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-cyan-300 focus:outline-none focus:border-cyan-500"
                autoFocus
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">
                Beschreibung (optional)
              </label>
              <textarea
                value={recipeDescription}
                onChange={(e) => setRecipeDescription(e.target.value)}
                placeholder="Notizen zur Mischung, Besonderheiten..."
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-cyan-500 h-20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">
                Tags (kommagetrennt)
              </label>
              <input
                type="text"
                value={recipeTags}
                onChange={(e) => setRecipeTags(e.target.value)}
                placeholder="Teststrähne, Pastell, Sommer"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowSaveModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
              >
                Abbrechen
              </button>
              <button
                onClick={handleConfirmSaveRecipe}
                disabled={!recipeTitle.trim()}
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 font-semibold text-xs text-white shadow-md disabled:opacity-50"
              >
                <Check className="w-4 h-4" />
                <span>Speichern</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

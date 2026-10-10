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
import { TeststraehnenModusView } from './TeststraehnenModusView';
import { DinoMascot } from '../common/DinoMascot';
import confetti from 'canvas-confetti';
import { Check, BookmarkPlus, X, TestTube2, Layers } from 'lucide-react';

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
  onCreateStrandTest,
  onUpdateSettings,
  onPrintRecipe
}) => {
  const [labMode, setLabMode] = useState<'teststrand' | 'standard'>('teststrand');
  const [targetHex, setTargetHex] = useState<string>('#3b82f6');
  // Default to 5g (5ml Standard) for test strand optimization
  const [totalBatchGrams, setTotalBatchGrams] = useState<number>(settings.defaultBatchGrams || 5);
  const [maxConditionerRatioPercent, setMaxConditionerRatioPercent] = useState<number>(80);

  const defaultCyan = pigments.find((p) => p.colorGroup === 'cyan') || pigments[0];
  const defaultMagenta = pigments.find((p) => p.colorGroup === 'magenta') || pigments[0];
  const defaultYellow = pigments.find((p) => p.colorGroup === 'yellow') || pigments[0];
  const defaultConditioner = conditioners[0];

  const [selectedCyanId, setSelectedCyanId] = useState<number>(defaultCyan?.id || 1);
  const [selectedMagentaId, setSelectedMagentaId] = useState<number>(defaultMagenta?.id || 2);
  const [selectedYellowId, setSelectedYellowId] = useState<number>(defaultYellow?.id || 3);
  const [selectedConditionerId, setSelectedConditionerId] = useState<number | undefined>(
    defaultConditioner?.id || 1
  );

  const [baseHairColor, setBaseHairColor] = useState<CustomBaseHairColor>({
    levelKey: 'bleached_level10',
    hex: '#fffbeb'
  });

  const [showSaveModal, setShowSaveModal] = useState(false);
  const [recipeTitle, setRecipeTitle] = useState('');
  const [recipeDescription, setRecipeDescription] = useState('');
  const [recipeTags, setRecipeTags] = useState('Teststrähne, Pastell');

  const cyanPigment = useMemo(
    () => pigments.find((p) => p.id === selectedCyanId) || defaultCyan,
    [pigments, selectedCyanId, defaultCyan]
  );
  const magentaPigment = useMemo(
    () => pigments.find((p) => p.id === selectedMagentaId) || defaultMagenta,
    [pigments, selectedMagentaId, defaultMagenta]
  );
  const yellowPigment = useMemo(
    () => pigments.find((p) => p.id === selectedYellowId) || defaultYellow,
    [pigments, selectedYellowId, defaultYellow]
  );
  const conditioner = useMemo(
    () => conditioners.find((c) => c.id === selectedConditionerId) || defaultConditioner,
    [conditioners, selectedConditionerId, defaultConditioner]
  );

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
      {/* Welcome Banner with Friendly Terms & Prominent Mode Selector */}
      <div className="bg-gradient-to-r from-blue-950/80 via-slate-900 to-rose-950/80 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2.5 text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 text-xs font-semibold border border-cyan-500/30">
            <span>Dino Farblabor 🦕</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight m-0">
            Haarfarben-Mischlabor für direktziehende Pigmente
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
            Wähle deine <strong>Wunschfarbe</strong>, dosiere <strong>Blau</strong>,{' '}
            <strong>Rot-Pink</strong> und <strong>Gelb</strong> grammgenau und mische deine
            individuelle Nuance mit <strong>weißer Spülung</strong>.
          </p>

          {/* Mode Selector Tabs */}
          <div className="pt-2 flex items-center justify-center md:justify-start gap-2">
            <button
              onClick={() => {
                setLabMode('teststrand');
                setTotalBatchGrams(5); // 5ml Standard
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition-all shadow-md ${
                labMode === 'teststrand'
                  ? 'bg-cyan-500 text-slate-950 border-2 border-cyan-300 shadow-cyan-500/20 scale-105'
                  : 'bg-slate-800/80 text-slate-300 hover:text-white border border-slate-700'
              }`}
            >
              <TestTube2 className="w-4 h-4" />
              <span>🧪 Modus: Kleine Teststrähne (5 ml Standard)</span>
            </button>

            <button
              onClick={() => setLabMode('standard')}
              className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition-all ${
                labMode === 'standard'
                  ? 'bg-cyan-500 text-slate-950 border-2 border-cyan-300 shadow-cyan-500/20 scale-105'
                  : 'bg-slate-800/80 text-slate-300 hover:text-white border border-slate-700'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Standard-Mischung</span>
            </button>
          </div>
        </div>

        <DinoMascot
          size="lg"
          expression={labMode === 'teststrand' ? 'excited' : 'happy'}
          speechBubble={
            labMode === 'teststrand'
              ? 'Im Teststrähnen-Modus! Wir mischen sparsame 5 ml zum Vortesten!'
              : 'Wähle deine Wunschfarbe und ich berechne das Rezept!'
          }
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
            pigments={pigments}
            conditioners={conditioners}
            selectedCyanId={cyanPigment.id!}
            selectedMagentaId={magentaPigment.id!}
            selectedYellowId={yellowPigment.id!}
            selectedConditionerId={conditioner?.id}
            totalBatchGrams={totalBatchGrams}
            maxConditionerRatioPercent={maxConditionerRatioPercent}
            onSelectCyan={setSelectedCyanId}
            onSelectMagenta={setSelectedMagentaId}
            onSelectYellow={setSelectedYellowId}
            onSelectConditioner={setSelectedConditionerId}
            onChangeBatchGrams={setTotalBatchGrams}
            onChangeConditionerRatio={setMaxConditionerRatioPercent}
          />
        </div>

        {/* Right Column: Recipe Result Card & Test Strand View */}
        <div className="lg:col-span-6 space-y-6 sticky top-24">
          <RecipeResultCard
            result={calculationResult}
            cyanPigment={cyanPigment}
            magentaPigment={magentaPigment}
            yellowPigment={yellowPigment}
            conditioner={conditioner}
            targetHex={targetHex}
            onSaveRecipe={() => setShowSaveModal(true)}
            onCreateStrandTest={() => {
              onCreateStrandTest({
                title: `Teststrähne für ${targetHex}`,
                date: new Date().toISOString().split('T')[0],
                cyanPigmentId: cyanPigment.id!,
                magentaPigmentId: magentaPigment.id!,
                yellowPigmentId: yellowPigment.id!,
                conditionerId: conditioner?.id,
                actualCyanGrams: calculationResult.ingredients.cyanGrams,
                actualMagentaGrams: calculationResult.ingredients.magentaGrams,
                actualYellowGrams: calculationResult.ingredients.yellowGrams,
                actualConditionerGrams: calculationResult.ingredients.conditionerGrams,
                baseHairColor,
                processingTimeMinutes: 30,
                measuredResultHex: calculationResult.estimatedResultHex,
                targetHex,
                rating: 5,
                notes: 'Automatisch aus dem Farblabor übernommen.'
              });
            }}
            onPrintRecipe={() => onPrintRecipe(calculationResult)}
          />

          {/* Teststrähnen-Modus View (Requirement 5) */}
          {labMode === 'teststrand' && (
            <TeststraehnenModusView
              calculationResult={calculationResult}
              cyanPigment={cyanPigment}
              magentaPigment={magentaPigment}
              yellowPigment={yellowPigment}
              conditioner={conditioner}
              targetHex={targetHex}
              baseHairColor={baseHairColor}
              currentBatchGrams={totalBatchGrams}
              onChangeBatchGrams={setTotalBatchGrams}
              onSaveStrandTest={onCreateStrandTest}
            />
          )}
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

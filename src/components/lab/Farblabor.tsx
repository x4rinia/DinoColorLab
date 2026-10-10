import React, { useState, useMemo } from 'react';
import type {
  PigmentProfile,
  ConditionerProfile,
  CustomBaseHairColor,
  ColorRecipe
} from '../../types';
import { calculateRecipe } from '../../engine/calculationEngine';
import { ColorSelection, type ColorStyleCategory } from './ColorSelection';
import { BaseHairSelector } from './BaseHairSelector';
import { HairImpactFormulaCard } from './HairImpactFormulaCard';
import { RecipeResultCard } from './RecipeResultCard';
import { DinoMascot } from '../common/DinoMascot';
import confetti from 'canvas-confetti';
import { BookmarkPlus, X, Check } from 'lucide-react';

interface FarblaborProps {
  pigments: PigmentProfile[];
  conditioners: ConditionerProfile[];
  strandTests?: any[];
  settings?: any;
  onSaveRecipe: (recipe: Omit<ColorRecipe, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  onCreateStrandTest?: (test: any) => Promise<void>;
  onUpdateSettings?: (newSettings: any) => void;
  onPrintRecipe: (recipe: any) => void;
}

export const Farblabor: React.FC<FarblaborProps> = ({
  pigments,
  conditioners,
  onSaveRecipe,
  onPrintRecipe
}) => {
  // Wunschfarbe (Standard: echtes Blau)
  const [targetHex, setTargetHex] = useState<string>('#1d4ed8');
  // Gewählter Nuancen-Stil: Pastell, Kräftig, Dunkel, Grau/Schwarz, Natürlich
  const [selectedStyle, setSelectedStyle] = useState<ColorStyleCategory>('kraeftig');

  // Die Menge ist fest für ein Färbeschälchen wie auf dem Bild (40 ml / ca. 2 EL + 2 TL)
  const totalBatchGrams = 40.0;

  // Der Spülungsanteil wird passend zum gewählten Farbton-Stil gesetzt
  const maxConditionerRatioPercent = useMemo(() => {
    switch (selectedStyle) {
      case 'pastell':
        return 85;
      case 'grau_schwarz':
        return 35;
      case 'natur':
        return 30;
      case 'dunkel':
        return 15; // Bis zu 15% Spülung zum Strecken (0% bei reinem Schwarz)
      case 'kraeftig':
      default:
        return 20; // 20% Spülung zum Strecken & Pflegen bei voller Leuchtkraft
    }
  }, [selectedStyle]);

  // Grundfarben: Echtes Blau, Kaltes Rot-Pink, Leuchtendes Gelb & Weiße Spülung
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

  // Berechnung der Mischung (40 ml Färbeschale)
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
      [],
      [],
      { roundingPrecision: 0.1 }
    );
  }, [
    targetHex,
    totalBatchGrams,
    maxConditionerRatioPercent,
    cyanPigment,
    magentaPigment,
    yellowPigment,
    conditioner,
    baseHairColor
  ]);

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
      tags: [selectedStyle, 'Teststrähne'],
      isFavorite: false
    });

    confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
    setShowSaveModal(false);
    setRecipeTitle('');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-950/80 via-slate-900 to-indigo-950/80 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="space-y-2 text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold border border-blue-500/30">
            <span>Dino Farblabor 🦕</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight m-0">
            Haarfarben-Mischlabor für Direktzieher
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl m-0">
            Wähle deine <strong>Wunschfarbe</strong> und sieh sofort, wie sie sich mit deiner <strong>Ausgangshaarfarbe</strong> verbindet – inklusive Rezeptur in einfachen Löffelmaßen für dein Färbeschälchen (40 ml Standardmenge).
          </p>
        </div>

        <DinoMascot
          size="lg"
          expression="happy"
          speechBubble="Wähle deine Farbe – ich zeige dir direkt, wie es auf deinem Haar wirkt und wie du es anmischst!"
        />
      </div>

      {/* Hauptbereich: 2 Spalten */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Linke Spalte: Wunschfarbe & Nuancen-Stil + Ausgangshaar */}
        <div className="lg:col-span-6 space-y-6">
          <ColorSelection
            targetHex={targetHex}
            onChangeColor={setTargetHex}
            selectedStyle={selectedStyle}
            onSelectStyle={setSelectedStyle}
          />

          <BaseHairSelector value={baseHairColor} onChange={setBaseHairColor} />
        </div>

        {/* Rechte Spalte: 
            1. Geschätzte Wirkung auf dem Haar (Farbe + Haarfarbe = Ergebnis + Warnung wenn es nix wird)
            2. Automatische Rezeptkarte rein in Löffelmaßen */}
        <div className="lg:col-span-6 space-y-6 sticky top-24">
          <HairImpactFormulaCard
            dyeColorHex={targetHex}
            baseHairHex={baseHairColor.hex}
            baseHairLevelName={baseHairColor.levelKey}
            estimatedResultHex={calculationResult.estimatedResultHex}
            isPastelMode={selectedStyle === 'pastell'}
          />

          <RecipeResultCard
            result={calculationResult}
            cyanPigment={cyanPigment}
            magentaPigment={magentaPigment}
            yellowPigment={yellowPigment}
            conditioner={conditioner}
            mixedColorHex={targetHex}
            onSaveRecipe={() => setShowSaveModal(true)}
            onPrintRecipe={() =>
              onPrintRecipe({
                title: `Rezept ${targetHex.toUpperCase()}`,
                targetHex: targetHex,
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

      {/* Rezept speichern Modal */}
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
              <BookmarkPlus className="w-5 h-5 text-blue-400" />
              <span>In "Meine Rezepte" speichern</span>
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Rezept-Titel *</label>
              <input
                type="text"
                value={recipeTitle}
                onChange={(e) => setRecipeTitle(e.target.value)}
                placeholder="z. B. Dino Jeansblau oder Flieder-Traum"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-blue-300 focus:outline-none focus:border-blue-500"
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
                placeholder="Notizen zum Farbton..."
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-blue-500 h-20"
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
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 font-semibold text-xs text-white shadow-md disabled:opacity-50"
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

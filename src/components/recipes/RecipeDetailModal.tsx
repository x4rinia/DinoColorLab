import React, { useState, useMemo } from 'react';
import type { ColorRecipe, PigmentProfile, ConditionerProfile } from '../../types';
import { X, Copy, Download, Printer, Star, Trash2, Tag, FileText, Layers, Sparkles } from 'lucide-react';
import {
  formatVolumeWithSpoonEstimate,
  formatConditionerSpoonEstimate,
  scaleRecipeIngredients
} from '../../engine/unitConversions';
import { downloadRecipeAsPdf } from '../../engine/pdfExport';

interface RecipeDetailModalProps {
  recipe: ColorRecipe;
  pigments: PigmentProfile[];
  conditioners: ConditionerProfile[];
  onClose: () => void;
  onDuplicate: (recipe: ColorRecipe) => void;
  onToggleFavorite: (id: number) => void;
  onDelete: (id: number) => void;
  onPrint: (recipe: ColorRecipe) => void;
  onExportJson: (recipe: ColorRecipe) => void;
}

export const RecipeDetailModal: React.FC<RecipeDetailModalProps> = ({
  recipe,
  pigments,
  conditioners,
  onClose,
  onDuplicate,
  onToggleFavorite,
  onDelete,
  onPrint,
  onExportJson
}) => {
  const cyan = pigments.find((p) => p.id === recipe.cyanPigmentId);
  const magenta = pigments.find((p) => p.id === recipe.magentaPigmentId);
  const yellow = pigments.find((p) => p.id === recipe.yellowPigmentId);
  const conditioner = conditioners.find((c) => c.id === recipe.conditionerId);

  const isAlreadyDouble = (recipe.totalBatchGrams || 40) >= 75;
  const [multiplier, setMultiplier] = useState<1 | 2>(isAlreadyDouble ? 2 : 1);
  const isDouble = multiplier === 2;
  const targetTotal = isDouble ? 80 : 40;

  const currentIngredients = useMemo(() => {
    if (multiplier === (isAlreadyDouble ? 2 : 1)) {
      return recipe.ingredients;
    }
    return scaleRecipeIngredients(
      recipe.ingredients,
      targetTotal,
      cyan?.densityGPerMl,
      magenta?.densityGPerMl,
      yellow?.densityGPerMl,
      conditioner?.densityGPerMl
    );
  }, [recipe, multiplier, isAlreadyDouble, targetTotal, cyan, magenta, yellow, conditioner]);

  const activeRecipe = useMemo(() => {
    return {
      ...recipe,
      title: isDouble && !recipe.title.includes('Doppelte Menge') ? `${recipe.title} (Doppelte Menge)` : recipe.title,
      totalBatchGrams: targetTotal,
      ingredients: currentIngredients
    };
  }, [recipe, isDouble, targetTotal, currentIngredients]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-xl w-full text-white shadow-2xl relative my-8 space-y-5">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-start gap-4">
          <div
            className="w-16 h-16 rounded-2xl border-2 border-white/20 shadow-lg shrink-0"
            style={{ backgroundColor: recipe.targetHex }}
          />
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-bold text-slate-100 m-0">{recipe.title}</h3>
              <button
                onClick={() => onToggleFavorite(recipe.id!)}
                className="text-amber-400 hover:scale-110 transition-transform"
              >
                <Star className={`w-5 h-5 ${recipe.isFavorite ? 'fill-amber-400' : ''}`} />
              </button>
            </div>
            <div className="text-xs text-slate-400 font-mono mt-0.5">{recipe.targetHex.toUpperCase()}</div>
            {recipe.description && <p className="text-xs text-slate-300 mt-1">{recipe.description}</p>}
          </div>
        </div>

        {recipe.tags && recipe.tags.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap">
            <Tag className="w-3.5 h-3.5 text-slate-400" />
            {recipe.tags.map((tag, i) => (
              <span
                key={i}
                className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-800 text-cyan-300 border border-slate-700"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Mengen-Auswahl: Standard (40 ml) vs. Doppelte Menge (80 ml) */}
        <div className="bg-slate-950/70 p-3 rounded-2xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-inner">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 shrink-0">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <span>Menge:</span>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${isDouble ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' : 'bg-blue-500/15 text-blue-300 border border-blue-500/20'}`}>
                  {isDouble ? 'Doppelte Menge' : 'Standard'}
                </span>
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                {isDouble ? 'Rezeptur für 80 ml verdoppelt' : 'Standardmenge für 40 ml'}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-900/90 p-1 rounded-xl border border-slate-800 self-stretch sm:self-auto shrink-0">
            <button
              type="button"
              onClick={() => setMultiplier(1)}
              className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                !isDouble
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25 ring-1 ring-blue-400'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              Standard
            </button>
            <button
              type="button"
              onClick={() => setMultiplier(2)}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                isDouble
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/30 ring-1 ring-indigo-400'
                  : 'bg-slate-800/90 text-blue-300 hover:text-white hover:bg-slate-800 border border-blue-500/30'
              }`}
              title="Doppelte Menge anmischen"
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-300" />
              <span>Doppelte Menge</span>
            </button>
          </div>
        </div>

        <div className="bg-slate-950/70 border border-slate-800 rounded-2xl overflow-hidden">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-800/60 text-slate-300 font-semibold border-b border-slate-800">
              <tr>
                <th className="p-3">Zutat</th>
                <th className="p-3 text-right">Löffelmaß {isDouble ? '(für 80 ml)' : '(für 40 ml)'}</th>
                <th className="p-3 text-right">Anteil</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-200">
              <tr>
                <td className="p-3 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-600 shadow-sm" />
                  <span>Blau: {cyan?.name || 'Blau'}</span>
                </td>
                <td className="p-3 text-right font-bold text-blue-300">
                  {formatVolumeWithSpoonEstimate(currentIngredients.cyanGrams)}
                </td>
                <td className="p-3 text-right font-mono text-slate-400">{currentIngredients.cyanPercent}%</td>
              </tr>
              <tr>
                <td className="p-3 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full shadow-sm" style={{ backgroundColor: '#e01a69' }} />
                  <span>Rot: {magenta?.name || 'Rot'}</span>
                </td>
                <td className="p-3 text-right font-bold text-rose-300">
                  {formatVolumeWithSpoonEstimate(currentIngredients.magentaGrams)}
                </td>
                <td className="p-3 text-right font-mono text-slate-400">{currentIngredients.magentaPercent}%</td>
              </tr>
              <tr>
                <td className="p-3 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-sm" />
                  <span>Gelb: {yellow?.name || 'Gelb'}</span>
                </td>
                <td className="p-3 text-right font-bold text-amber-300">
                  {formatVolumeWithSpoonEstimate(currentIngredients.yellowGrams)}
                </td>
                <td className="p-3 text-right font-mono text-slate-400">{currentIngredients.yellowPercent}%</td>
              </tr>
              <tr>
                <td className="p-3 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-white border border-slate-400 shadow-sm" />
                  <span>Weiße Spülung: {conditioner?.name || 'Weiße Spülung'}</span>
                </td>
                <td className="p-3 text-right font-bold text-white">
                  {formatConditionerSpoonEstimate(currentIngredients.conditionerGrams)}
                </td>
                <td className="p-3 text-right font-mono text-slate-400">{currentIngredients.conditionerPercent}%</td>
              </tr>
              <tr className="bg-slate-900 font-bold border-t border-slate-700 text-white">
                <td className="p-3">Portion</td>
                <td className="p-3 text-right font-semibold text-blue-300">
                  {isDouble ? '80 ml (Doppelte Menge)' : '40 ml (Standard)'}
                </td>
                <td className="p-3 text-right font-mono">100%</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-800">
          <button
            onClick={() => {
              if (confirm('Rezept wirklich löschen?')) {
                onDelete(recipe.id!);
                onClose();
              }
            }}
            className="flex items-center gap-1 text-xs text-rose-400 hover:text-rose-300 px-3 py-2 rounded-xl bg-rose-500/10 border border-rose-500/20"
          >
            <Trash2 className="w-4 h-4" />
            <span>Löschen</span>
          </button>

          <div className="flex items-center gap-2 flex-wrap justify-end">
            <button
              onClick={() => onDuplicate(recipe)}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 rounded-xl border border-slate-700"
              title="Rezept duplizieren"
            >
              <Copy className="w-3.5 h-3.5 text-cyan-400" />
              <span>Duplizieren</span>
            </button>

            <button
              onClick={() => downloadRecipeAsPdf(activeRecipe, pigments, conditioners)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-rose-600 hover:bg-rose-500 text-xs font-semibold text-white rounded-xl shadow-md transition-all hover:scale-[1.02]"
              title="Als PDF Dokument herunterladen"
            >
              <FileText className="w-3.5 h-3.5 text-white" />
              <span>PDF Download</span>
            </button>

            <button
              onClick={() => onExportJson(activeRecipe)}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 rounded-xl border border-slate-700"
              title="JSON-Datei für Dino Color Lab App exportieren"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>JSON (App)</span>
            </button>

            <button
              onClick={() => {
                onClose();
                onPrint(activeRecipe);
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 rounded-xl border border-slate-700"
              title="Druckansicht öffnen"
            >
              <Printer className="w-3.5 h-3.5 text-cyan-400" />
              <span>Drucken</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

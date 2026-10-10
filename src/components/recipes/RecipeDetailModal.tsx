import React from 'react';
import type { ColorRecipe, PigmentProfile, ConditionerProfile } from '../../types';
import { X, Copy, Download, Printer, Star, Trash2, Tag, FileText } from 'lucide-react';
import {
  formatVolumeWithSpoonEstimate,
  formatConditionerSpoonEstimate
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

        <div className="bg-slate-950/70 border border-slate-800 rounded-2xl overflow-hidden">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-800/60 text-slate-300 font-semibold border-b border-slate-800">
              <tr>
                <th className="p-3">Zutat</th>
                <th className="p-3 text-right">Löffelmaß</th>
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
                  {formatVolumeWithSpoonEstimate(recipe.ingredients.cyanGrams)}
                </td>
                <td className="p-3 text-right font-mono text-slate-400">{recipe.ingredients.cyanPercent}%</td>
              </tr>
              <tr>
                <td className="p-3 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-600 shadow-sm" />
                  <span>Rot-Pink: {magenta?.name || 'Rot-Pink'}</span>
                </td>
                <td className="p-3 text-right font-bold text-rose-300">
                  {formatVolumeWithSpoonEstimate(recipe.ingredients.magentaGrams)}
                </td>
                <td className="p-3 text-right font-mono text-slate-400">{recipe.ingredients.magentaPercent}%</td>
              </tr>
              <tr>
                <td className="p-3 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-sm" />
                  <span>Gelb: {yellow?.name || 'Gelb'}</span>
                </td>
                <td className="p-3 text-right font-bold text-amber-300">
                  {formatVolumeWithSpoonEstimate(recipe.ingredients.yellowGrams)}
                </td>
                <td className="p-3 text-right font-mono text-slate-400">{recipe.ingredients.yellowPercent}%</td>
              </tr>
              <tr>
                <td className="p-3 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-white border border-slate-400 shadow-sm" />
                  <span>Weiße Spülung: {conditioner?.name || 'Weiße Spülung'}</span>
                </td>
                <td className="p-3 text-right font-bold text-white">
                  {formatConditionerSpoonEstimate(recipe.ingredients.conditionerGrams)}
                </td>
                <td className="p-3 text-right font-mono text-slate-400">{recipe.ingredients.conditionerPercent}%</td>
              </tr>
              <tr className="bg-slate-900 font-bold border-t border-slate-700 text-white">
                <td className="p-3">Portion</td>
                <td className="p-3 text-right font-semibold text-blue-300">Teststrähne (ca. 1 TL / 5 ml)</td>
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
              onClick={() => downloadRecipeAsPdf(recipe, pigments, conditioners)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-rose-600 hover:bg-rose-500 text-xs font-semibold text-white rounded-xl shadow-md transition-all hover:scale-[1.02]"
              title="Als PDF Dokument herunterladen"
            >
              <FileText className="w-3.5 h-3.5 text-white" />
              <span>PDF Download</span>
            </button>

            <button
              onClick={() => onExportJson(recipe)}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 rounded-xl border border-slate-700"
              title="JSON-Datei für Dino Color Lab App exportieren"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>JSON (App)</span>
            </button>

            <button
              onClick={() => {
                onClose();
                onPrint(recipe);
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

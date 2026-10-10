import React from 'react';
import type { ColorRecipe, PigmentProfile, ConditionerProfile } from '../../types';
import { Printer, Plus, Equal, FileText } from 'lucide-react';
import {
  formatVolumeWithSpoonEstimate,
  formatConditionerSpoonEstimate,
  calculateSimpleRatio
} from '../../engine/unitConversions';
import { downloadRecipeAsPdf } from '../../engine/pdfExport';

interface PrintRecipeViewProps {
  recipe: ColorRecipe & {
    estimatedResultHex?: string;
  };
  pigments: PigmentProfile[];
  conditioners: ConditionerProfile[];
  onClose: () => void;
}

export const PrintRecipeView: React.FC<PrintRecipeViewProps> = ({
  recipe,
  pigments,
  conditioners,
  onClose
}) => {
  const handlePrint = () => {
    window.print();
  };

  const ratio = calculateSimpleRatio(
    recipe.ingredients.cyanGrams,
    recipe.ingredients.magentaGrams,
    recipe.ingredients.yellowGrams,
    recipe.ingredients.conditionerGrams
  );

  const baseHairHex = recipe.baseHairColor?.hex || '#fffbeb';
  const resultHex = recipe.estimatedResultHex || recipe.targetHex;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white text-slate-900 rounded-3xl p-8 max-w-2xl w-full shadow-2xl relative my-8 print:m-0 print:shadow-none print:w-full print:max-w-none">
        <div className="flex items-center justify-between border-b pb-4 mb-6 print:hidden">
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 border rounded-xl"
          >
            Schließen
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={() => downloadRecipeAsPdf(recipe, pigments, conditioners)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-rose-600 text-white rounded-xl text-xs font-semibold hover:bg-rose-700 shadow-md transition-all"
            >
              <FileText className="w-4 h-4" />
              <span>Als PDF herunterladen</span>
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-700 shadow-md"
            >
              <Printer className="w-4 h-4" />
              <span>Drucken</span>
            </button>
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200 pb-4">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-blue-600">Dino Color Lab 🦕</div>
              <h1 className="text-2xl font-black text-slate-900 mt-1 m-0">{recipe.title}</h1>
              <div className="text-xs text-slate-500 mt-1">
                Erstellt am: {new Date(recipe.createdAt).toLocaleDateString('de-DE')} • Portion: Färbeschale (40 ml / ca. 2 EL + 2 TL)
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div
                className="w-16 h-16 rounded-2xl border-2 border-slate-300 shadow-sm"
                style={{ backgroundColor: recipe.targetHex }}
                title={`Farbe: ${recipe.targetHex}`}
              />
            </div>
          </div>

          {/* Formel: Farbe + Haarfarbe = Ergebnis */}
          <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl">
            <div className="text-xs font-bold text-slate-700 mb-2">Geschätzte Wirkung auf dem Haar:</div>
            <div className="flex items-center justify-between gap-2 text-center">
              <div>
                <div
                  className="w-12 h-12 rounded-xl border-2 border-slate-300 mx-auto"
                  style={{ backgroundColor: recipe.targetHex }}
                />
                <div className="text-[10px] font-bold text-slate-600 mt-1">Farbe</div>
              </div>

              <Plus className="w-4 h-4 text-slate-400" />

              <div>
                <div
                  className="w-12 h-12 rounded-xl border-2 border-slate-300 mx-auto"
                  style={{ backgroundColor: baseHairHex }}
                />
                <div className="text-[10px] font-bold text-slate-600 mt-1">Haarfarbe</div>
              </div>

              <Equal className="w-4 h-4 text-slate-400" />

              <div>
                <div
                  className="w-12 h-12 rounded-xl border-2 border-emerald-500 mx-auto"
                  style={{ backgroundColor: resultHex }}
                />
                <div className="text-[10px] font-bold text-emerald-700 mt-1">Ergebnis auf Haar</div>
              </div>
            </div>
          </div>

          {recipe.description && (
            <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200">
              {recipe.description}
            </p>
          )}

          {/* Mischverhältnis */}
          <div className="bg-blue-50 border border-blue-200 p-3 rounded-xl flex items-center justify-between text-xs">
            <span className="font-semibold text-blue-900">Einfaches Mischverhältnis:</span>
            <span className="font-bold text-blue-950">{ratio}</span>
          </div>

          {/* Tabelle rein in Löffelmaßen (KEINE GRAMMANGABEN!) */}
          <div className="border border-slate-200 rounded-2xl overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3">Zutat</th>
                  <th className="p-3 text-right">Löffelmaß (Dosierung)</th>
                  <th className="p-3 text-right">Anteil (%)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                <tr>
                  <td className="p-3 font-medium text-slate-800 flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-blue-600 inline-block shadow-sm" />
                    <span>Blau (Echtes Blau Direct Dye)</span>
                  </td>
                  <td className="p-3 text-right font-bold text-blue-700">
                    {formatVolumeWithSpoonEstimate(recipe.ingredients.cyanGrams)}
                  </td>
                  <td className="p-3 text-right font-mono">{recipe.ingredients.cyanPercent}%</td>
                </tr>
                <tr>
                  <td className="p-3 font-medium text-slate-800 flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-rose-600 inline-block shadow-sm" />
                    <span>Rot-Pink (Kühles Rot/Magenta)</span>
                  </td>
                  <td className="p-3 text-right font-bold text-rose-700">
                    {formatVolumeWithSpoonEstimate(recipe.ingredients.magentaGrams)}
                  </td>
                  <td className="p-3 text-right font-mono">{recipe.ingredients.magentaPercent}%</td>
                </tr>
                <tr>
                  <td className="p-3 font-medium text-slate-800 flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-amber-400 inline-block shadow-sm" />
                    <span>Gelb (Leuchtendes Gelb)</span>
                  </td>
                  <td className="p-3 text-right font-bold text-amber-700">
                    {formatVolumeWithSpoonEstimate(recipe.ingredients.yellowGrams)}
                  </td>
                  <td className="p-3 text-right font-mono">{recipe.ingredients.yellowPercent}%</td>
                </tr>
                <tr>
                  <td className="p-3 font-medium text-slate-800 flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-white border border-slate-400 inline-block shadow-sm" />
                    <span>Weiße Spülung (#FFFFFF)</span>
                  </td>
                  <td className="p-3 text-right font-bold text-slate-800">
                    {formatConditionerSpoonEstimate(recipe.ingredients.conditionerGrams)}
                  </td>
                  <td className="p-3 text-right font-mono">{recipe.ingredients.conditionerPercent}%</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Praktische Dosier-Hinweise */}
          <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl text-xs text-slate-700 space-y-1">
            <div className="font-bold">🥄 Praxistipp zur Dosierung:</div>
            <div>• 1 EL = 15 ml | 1 TL = 5 ml (Kaffeelöffel) | Gesamtmenge: 40 ml (2 EL + 2 TL).</div>
            <div>• Bei Kleinstmengen unter ¼ TL: Wenige Tropfen oder eine Messerspitze mit dem Färbepinsel hinzugeben.</div>
            <div>• Direktzieher sind semi-transparent: Immer zuerst eine kleine Teststrähne an unauffälliger Stelle machen.</div>
          </div>
        </div>
      </div>
    </div>
  );
};

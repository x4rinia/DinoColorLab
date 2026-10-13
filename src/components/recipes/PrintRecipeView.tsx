import React, { useState, useMemo } from 'react';
import type { ColorRecipe, PigmentProfile, ConditionerProfile } from '../../types';
import { Printer, Plus, Equal, FileText, Sparkles } from 'lucide-react';
import {
  formatVolumeWithSpoonEstimate,
  formatConditionerSpoonEstimate,
  calculateSimpleRatio,
  scaleRecipeIngredients
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

  const isAlreadyDouble = (recipe.totalBatchGrams || 40) >= 75;
  const [multiplier, setMultiplier] = useState<1 | 2>(isAlreadyDouble ? 2 : 1);
  const isDouble = multiplier === 2;
  const targetTotal = isDouble ? 80 : 40;

  const currentIngredients = useMemo(() => {
    if (multiplier === (isAlreadyDouble ? 2 : 1)) {
      return recipe.ingredients;
    }
    const cyan = pigments.find((p) => p.id === recipe.cyanPigmentId);
    const magenta = pigments.find((p) => p.id === recipe.magentaPigmentId);
    const yellow = pigments.find((p) => p.id === recipe.yellowPigmentId);
    const conditioner = conditioners.find((c) => c.id === recipe.conditionerId);
    return scaleRecipeIngredients(
      recipe.ingredients,
      targetTotal,
      cyan?.densityGPerMl,
      magenta?.densityGPerMl,
      yellow?.densityGPerMl,
      conditioner?.densityGPerMl
    );
  }, [recipe, multiplier, isAlreadyDouble, targetTotal, pigments, conditioners]);

  const activeRecipe = useMemo(() => {
    return {
      ...recipe,
      title: isDouble && !recipe.title.includes('Doppelte Menge') ? `${recipe.title} (Doppelte Menge)` : recipe.title,
      totalBatchGrams: targetTotal,
      ingredients: currentIngredients
    };
  }, [recipe, isDouble, targetTotal, currentIngredients]);

  const ratio = calculateSimpleRatio(
    currentIngredients.cyanGrams,
    currentIngredients.magentaGrams,
    currentIngredients.yellowGrams,
    currentIngredients.conditionerGrams
  );

  const baseHairHex = recipe.baseHairColor?.hex || '#fffbeb';
  const resultHex = recipe.estimatedResultHex || recipe.targetHex;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white text-slate-900 rounded-3xl p-8 max-w-2xl w-full shadow-2xl relative my-8 print:m-0 print:shadow-none print:w-full print:max-w-none">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b pb-4 mb-6 gap-3 print:hidden">
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 border rounded-xl"
          >
            Schließen
          </button>

          {/* Umschalter Standard vs. Doppelte Menge */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setMultiplier(1)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                !isDouble ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Standard
            </button>
            <button
              onClick={() => setMultiplier(2)}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                isDouble ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Doppelte Menge</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => downloadRecipeAsPdf(activeRecipe, pigments, conditioners)}
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
              <h1 className="text-2xl font-black text-slate-900 mt-1 m-0">{activeRecipe.title}</h1>
              <div className="text-xs text-slate-500 mt-1">
                Erstellt am: {new Date(recipe.createdAt).toLocaleDateString('de-DE')} • Portion: {isDouble ? 'Doppelte Menge (80 ml)' : 'Standard (40 ml / ca. 2 EL + 2 TL)'}
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
                  <th className="p-3 text-right">Löffelmaß {isDouble ? '(für 80 ml)' : '(für 40 ml)'}</th>
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
                    {formatVolumeWithSpoonEstimate(currentIngredients.cyanGrams)}
                  </td>
                  <td className="p-3 text-right font-mono">{currentIngredients.cyanPercent}%</td>
                </tr>
                <tr>
                  <td className="p-3 font-medium text-slate-800 flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full inline-block shadow-sm" style={{ backgroundColor: '#e01a69' }} />
                    <span>Pinkstichiges Rot (Kühles Rot/Magenta)</span>
                  </td>
                  <td className="p-3 text-right font-bold text-rose-700">
                    {formatVolumeWithSpoonEstimate(currentIngredients.magentaGrams)}
                  </td>
                  <td className="p-3 text-right font-mono">{currentIngredients.magentaPercent}%</td>
                </tr>
                <tr>
                  <td className="p-3 font-medium text-slate-800 flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-amber-400 inline-block shadow-sm" />
                    <span>Gelb (Leuchtendes Gelb)</span>
                  </td>
                  <td className="p-3 text-right font-bold text-amber-700">
                    {formatVolumeWithSpoonEstimate(currentIngredients.yellowGrams)}
                  </td>
                  <td className="p-3 text-right font-mono">{currentIngredients.yellowPercent}%</td>
                </tr>
                <tr>
                  <td className="p-3 font-medium text-slate-800 flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-white border border-slate-400 inline-block shadow-sm" />
                    <span>Weiße Spülung (#FFFFFF)</span>
                  </td>
                  <td className="p-3 text-right font-bold text-slate-800">
                    {formatConditionerSpoonEstimate(currentIngredients.conditionerGrams)}
                  </td>
                  <td className="p-3 text-right font-mono">{currentIngredients.conditionerPercent}%</td>
                </tr>
                <tr className="bg-slate-50 font-bold border-t border-slate-300">
                  <td className="p-3">Portion gesamt</td>
                  <td className="p-3 text-right font-semibold text-blue-700">
                    {isDouble ? '80 ml (Doppelte Menge)' : '40 ml (Standard)'}
                  </td>
                  <td className="p-3 text-right font-mono">100%</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Praktische Dosier-Hinweise */}
          <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl text-xs text-slate-700 space-y-1">
            <div className="font-bold">🥄 Praxistipp zur Dosierung:</div>
            <div>
              {isDouble
                ? '• Gesamtmenge: 80 ml (Doppelte Menge / ca. 5 EL + 1 TL).'
                : '• Gesamtmenge: 40 ml (Standard / ca. 2 EL + 2 TL).'}
            </div>
            <div>• 1 EL = 15 ml | 1 TL = 5 ml (Kaffeelöffel) | ½ TL = 2,5 ml.</div>
            <div>• Spülung: Dient auch bei kräftigen Farben zum Strecken & für Geschmeidigkeit (bei reinem Schwarz 0%).</div>
            <div>• Bei Kleinstmengen unter ¼ TL: Wenige Tropfen oder eine Messerspitze mit dem Färbepinsel hinzugeben.</div>
            <div>• Direktzieher sind semi-transparent: Immer zuerst eine kleine Teststrähne an unauffälliger Stelle machen.</div>
          </div>
        </div>
      </div>
    </div>
  );
};

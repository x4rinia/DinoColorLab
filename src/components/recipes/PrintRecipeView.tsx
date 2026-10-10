import React from 'react';
import type { ColorRecipe, PigmentProfile, ConditionerProfile } from '../../types';
import { Printer } from 'lucide-react';
import {
  formatVolumeWithSpoonEstimate,
  formatConditionerSpoonEstimate,
  calculateSimpleRatio
} from '../../engine/unitConversions';

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
  const cyan = pigments.find((p) => p.id === recipe.cyanPigmentId);
  const magenta = pigments.find((p) => p.id === recipe.magentaPigmentId);
  const yellow = pigments.find((p) => p.id === recipe.yellowPigmentId);
  const conditioner = conditioners.find((c) => c.id === recipe.conditionerId);

  const handlePrint = () => {
    window.print();
  };

  const ratio = calculateSimpleRatio(
    recipe.ingredients.cyanGrams,
    recipe.ingredients.magentaGrams,
    recipe.ingredients.yellowGrams,
    recipe.ingredients.conditionerGrams
  );

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
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800"
          >
            <Printer className="w-4 h-4" />
            <span>Jetzt drucken / PDF speichern</span>
          </button>
        </div>

        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200 pb-4">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-cyan-600">Dino Color Lab 🦕</div>
              <h1 className="text-2xl font-black text-slate-900 mt-1 m-0">{recipe.title}</h1>
              <div className="text-xs text-slate-500 mt-1">
                Erstellt am: {new Date(recipe.createdAt).toLocaleDateString('de-DE')} • Gesamtmenge: {recipe.totalBatchGrams} ml / g
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-center">
                <div
                  className="w-14 h-14 rounded-2xl border-2 border-slate-300 shadow-sm mx-auto"
                  style={{ backgroundColor: recipe.targetHex }}
                />
                <div className="text-[10px] font-bold text-slate-500 mt-1">Wunschfarbe</div>
              </div>

              {recipe.baseHairColor && (
                <div className="text-center">
                  <div
                    className="w-14 h-14 rounded-2xl border-2 border-slate-300 shadow-sm mx-auto"
                    style={{ backgroundColor: recipe.baseHairColor.hex }}
                  />
                  <div className="text-[10px] font-bold text-slate-500 mt-1">Haar-Basis</div>
                </div>
              )}
            </div>
          </div>

          {recipe.description && (
            <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200">
              {recipe.description}
            </p>
          )}

          {/* Simple Ratio badge */}
          <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-600">Einfaches Mischverhältnis:</span>
            <span className="font-bold text-slate-900">{ratio}</span>
          </div>

          {/* Table with spoon measurements */}
          <div className="border border-slate-200 rounded-2xl overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3">Zutat / Pigment</th>
                  <th className="p-3 text-center">Löffelmaß (grob)</th>
                  <th className="p-3 text-right">Gewicht</th>
                  <th className="p-3 text-right">Anteil</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                <tr>
                  <td className="p-3 font-medium text-slate-800 flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-blue-600 inline-block shadow-sm" />
                    <span>Blau {cyan?.name ? `(${cyan.name})` : ''}</span>
                  </td>
                  <td className="p-3 text-center font-bold text-blue-700">
                    {formatVolumeWithSpoonEstimate(recipe.ingredients.cyanGrams)}
                  </td>
                  <td className="p-3 text-right font-mono font-bold text-slate-700">{recipe.ingredients.cyanGrams} g</td>
                  <td className="p-3 text-right font-mono">{recipe.ingredients.cyanPercent}%</td>
                </tr>
                <tr>
                  <td className="p-3 font-medium text-slate-800 flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-rose-600 inline-block shadow-sm" />
                    <span>Rot-Pink {magenta?.name ? `(${magenta.name})` : ''}</span>
                  </td>
                  <td className="p-3 text-center font-bold text-rose-700">
                    {formatVolumeWithSpoonEstimate(recipe.ingredients.magentaGrams)}
                  </td>
                  <td className="p-3 text-right font-mono font-bold text-slate-700">{recipe.ingredients.magentaGrams} g</td>
                  <td className="p-3 text-right font-mono">{recipe.ingredients.magentaPercent}%</td>
                </tr>
                <tr>
                  <td className="p-3 font-medium text-slate-800 flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-amber-400 inline-block shadow-sm" />
                    <span>Gelb {yellow?.name ? `(${yellow.name})` : ''}</span>
                  </td>
                  <td className="p-3 text-center font-bold text-amber-700">
                    {formatVolumeWithSpoonEstimate(recipe.ingredients.yellowGrams)}
                  </td>
                  <td className="p-3 text-right font-mono font-bold text-slate-700">{recipe.ingredients.yellowGrams} g</td>
                  <td className="p-3 text-right font-mono">{recipe.ingredients.yellowPercent}%</td>
                </tr>
                <tr>
                  <td className="p-3 font-medium text-slate-800 flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-white border border-slate-400 inline-block shadow-sm" />
                    <span>Weiße Spülung {conditioner?.name ? `(${conditioner.name})` : ''}</span>
                  </td>
                  <td className="p-3 text-center font-bold text-slate-800">
                    {formatConditionerSpoonEstimate(recipe.ingredients.conditionerGrams)}
                  </td>
                  <td className="p-3 text-right font-mono font-bold text-slate-700">{recipe.ingredients.conditionerGrams} g</td>
                  <td className="p-3 text-right font-mono">{recipe.ingredients.conditionerPercent}%</td>
                </tr>
                <tr className="bg-slate-100 font-bold text-slate-900 border-t-2 border-slate-300">
                  <td className="p-3">Gesamtmenge</td>
                  <td className="p-3 text-center text-xs font-semibold text-slate-500">
                    1 TL = 5 ml • 1 EL = 15 ml
                  </td>
                  <td className="p-3 text-right font-mono text-base">{recipe.totalBatchGrams} g</td>
                  <td className="p-3 text-right font-mono">100.0%</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Subtractive & practical advice */}
          <div className="bg-sky-50 border border-sky-200 p-4 rounded-2xl text-xs text-sky-950 space-y-1">
            <div className="font-bold">Hinweis zum Farbergebnis &amp; Haar-Physik:</div>
            <div>• Direktzieher sind semi-transparente Farbpigmente (keine Deckfarbe).</div>
            <div>• Die Ausgangshaarfarbe bestimmt das finale Farbergebnis: Gelbstiche im Haar addieren sich subtraktiv zur Mixtur.</div>
            <div>• Bei sehr feinen Mengen unter 0,6 ml (kleiner als ⅛ TL) empfiehlt sich eine Dosierspritze oder Feinwaage.</div>
          </div>

          <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl text-xs text-amber-900 space-y-1">
            <div className="font-bold">Wichtige Sicherheitshinweise:</div>
            <div>• Vor der Gesamtanwendung zwingend eine kleine Teststrähne an unauffälliger Stelle durchführen.</div>
            <div>• Nur für direktziehende, gebrauchsfertige Haarfarben ohne Oxidationsmittel (kein Entwickler / Peroxid).</div>
            <div>• Verträglichkeitstest (Patch-Test) gemäß Herstellerangaben der Farbtuben beachten.</div>
          </div>
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import type { ColorRecipe, PigmentProfile, ConditionerProfile } from '../../types';
import { Printer } from 'lucide-react';

interface PrintRecipeViewProps {
  recipe: ColorRecipe;
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
                Erstellt am: {new Date(recipe.createdAt).toLocaleDateString('de-DE')}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div
                className="w-16 h-16 rounded-2xl border border-slate-300 shadow-md"
                style={{ backgroundColor: recipe.targetHex }}
              />
              <div className="font-mono font-bold text-sm text-slate-700">{recipe.targetHex.toUpperCase()}</div>
            </div>
          </div>

          {recipe.description && (
            <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200">
              {recipe.description}
            </p>
          )}

          <div className="border border-slate-200 rounded-2xl overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3">Zutat / Pigment</th>
                  <th className="p-3 text-right">Gewicht (Gramm)</th>
                  <th className="p-3 text-right">Anteil (%)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                <tr>
                  <td className="p-3 font-medium text-slate-800 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block" />
                    <span>Blau: {cyan?.name || 'Blau Pigment'}</span>
                  </td>
                  <td className="p-3 text-right font-mono font-bold text-blue-700">{recipe.ingredients.cyanGrams} g</td>
                  <td className="p-3 text-right font-mono">{recipe.ingredients.cyanPercent}%</td>
                </tr>
                <tr>
                  <td className="p-3 font-medium text-slate-800 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-600 inline-block" />
                    <span>Rot-Pink: {magenta?.name || 'Rot-Pink Pigment'}</span>
                  </td>
                  <td className="p-3 text-right font-mono font-bold text-rose-700">{recipe.ingredients.magentaGrams} g</td>
                  <td className="p-3 text-right font-mono">{recipe.ingredients.magentaPercent}%</td>
                </tr>
                <tr>
                  <td className="p-3 font-medium text-slate-800 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
                    <span>Gelb: {yellow?.name || 'Gelb Pigment'}</span>
                  </td>
                  <td className="p-3 text-right font-mono font-bold text-amber-700">{recipe.ingredients.yellowGrams} g</td>
                  <td className="p-3 text-right font-mono">{recipe.ingredients.yellowPercent}%</td>
                </tr>
                <tr>
                  <td className="p-3 font-medium text-slate-800 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-white border border-slate-400 inline-block" />
                    <span>Weiße Spülung: {conditioner?.name || 'Weiße Spülung'}</span>
                  </td>
                  <td className="p-3 text-right font-mono font-bold text-slate-900">{recipe.ingredients.conditionerGrams} g</td>
                  <td className="p-3 text-right font-mono">{recipe.ingredients.conditionerPercent}%</td>
                </tr>
                <tr className="bg-slate-100 font-bold text-slate-900 border-t-2 border-slate-300">
                  <td className="p-3">Gesamtgewicht (Waage)</td>
                  <td className="p-3 text-right font-mono text-base">{recipe.totalBatchGrams} g</td>
                  <td className="p-3 text-right font-mono">100.0%</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl text-xs text-amber-900 space-y-1">
            <div className="font-bold">Wichtige Sicherheitshinweise:</div>
            <div>• Vor der Gesamtanwendung zwingend eine Teststrähne durchführen.</div>
            <div>• Nur für direktziehende, gebrauchsfertige Haarfarben ohne Oxidationsmittel (Entwickler).</div>
            <div>• Verträglichkeitstest (Patch-Test) gemäß Herstellerangaben einhalten.</div>
          </div>
        </div>
      </div>
    </div>
  );
};

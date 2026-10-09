import React from 'react';
import type { CalculationResult, PigmentProfile, ConditionerProfile } from '../../types';
import { DinoMascot } from '../common/DinoMascot';
import {
  AlertTriangle,
  CheckCircle2,
  BookmarkPlus,
  TestTube2,
  Printer
} from 'lucide-react';

interface RecipeResultCardProps {
  result: CalculationResult;
  cyanPigment: PigmentProfile;
  magentaPigment: PigmentProfile;
  yellowPigment: PigmentProfile;
  conditioner?: ConditionerProfile;
  targetHex: string;
  onSaveRecipe: () => void;
  onCreateStrandTest: () => void;
  onPrintRecipe: () => void;
}

export const RecipeResultCard: React.FC<RecipeResultCardProps> = ({
  result,
  cyanPigment,
  magentaPigment,
  yellowPigment,
  conditioner,
  targetHex,
  onSaveRecipe,
  onCreateStrandTest,
  onPrintRecipe
}) => {
  const { ingredients, mode, estimatedResultHex, deltaEToTarget, confidenceScore, isTargetAchievable, nearestAchievableHex, disclaimer } = result;

  const isDemoMode = mode === 'demo_experimental';

  return (
    <div className="bg-slate-900/90 border-2 border-cyan-500/40 rounded-3xl p-6 shadow-2xl text-white backdrop-blur-md space-y-6 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-cyan-500 to-fuchsia-500 text-slate-950">
              Mischrezeptur
            </span>
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border flex items-center gap-1 ${
                isDemoMode
                  ? 'bg-amber-500/10 border-amber-500/40 text-amber-300'
                  : 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
              }`}
            >
              {isDemoMode ? <AlertTriangle className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
              <span>{isDemoMode ? 'Experimenteller Demo-Modus' : `Kalibriert (${confidenceScore}% Konfidenz)`}</span>
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Präzise Gewichtsangaben für eine digitale Feinwaage.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onSaveRecipe}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 font-semibold text-xs text-white shadow-md shadow-cyan-500/20 transition-all"
          >
            <BookmarkPlus className="w-4 h-4" />
            <span>Rezept speichern</span>
          </button>
          <button
            onClick={onCreateStrandTest}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/30 font-semibold text-xs transition-all"
            title="Dokumentiere diesen Versuch als Teststrähne"
          >
            <TestTube2 className="w-4 h-4" />
            <span className="hidden sm:inline">Teststrähne</span>
          </button>
          <button
            onClick={onPrintRecipe}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-all"
            title="Druckansicht"
          >
            <Printer className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-slate-950/70 p-4 rounded-2xl border border-slate-800 flex items-center justify-around gap-3">
          <div className="text-center space-y-1.5">
            <div className="text-xs font-semibold text-slate-400">Zielfarbe</div>
            <div
              className="w-16 h-16 rounded-2xl border-2 border-white/20 shadow-lg mx-auto"
              style={{ backgroundColor: targetHex }}
            />
            <div className="text-xs font-mono font-bold text-cyan-300">{targetHex.toUpperCase()}</div>
          </div>

          <div className="text-center text-slate-600 text-xl font-bold">➔</div>

          <div className="text-center space-y-1.5">
            <div className="text-xs font-semibold text-slate-400">Modellschätzung</div>
            <div
              className="w-16 h-16 rounded-2xl border-2 border-white/20 shadow-lg mx-auto"
              style={{ backgroundColor: estimatedResultHex }}
            />
            <div className="text-xs font-mono font-bold text-slate-200">{estimatedResultHex.toUpperCase()}</div>
          </div>
        </div>

        <div className="bg-slate-950/70 p-4 rounded-2xl border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400">Wahrnehmungsabstand</span>
              <span className="text-xs font-mono font-bold text-cyan-300">Delta E: {deltaEToTarget}</span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {deltaEToTarget < 5
                ? 'Sehr hohe Übereinstimmung (nahezu identisch).'
                : deltaEToTarget < 15
                ? 'Gute visuelle Annäherung im Toleranzbereich.'
                : 'Merklicher Farbunterschied dichte- oder haarbedingt.'}
            </p>
          </div>

          {!isTargetAchievable && (
            <div className="mt-3 p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
              <div className="flex items-center gap-1.5 font-bold mb-1">
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                <span>Nicht vollständig erreichbar!</span>
              </div>
              Zielfarbe ist heller als die Ausgangshaarfarbe oder liegt außerhalb des Pigmentspektrums.
              {nearestAchievableHex && (
                <div className="mt-1.5 flex items-center gap-2">
                  <span>Nächstmögliche Farbe:</span>
                  <span
                    className="w-4 h-4 rounded-md border border-white/20"
                    style={{ backgroundColor: nearestAchievableHex }}
                  />
                  <span className="font-mono">{nearestAchievableHex}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
          <span>Visuelles Mischverhältnis</span>
          <span>Gesamtmenge: {ingredients.totalGrams} g</span>
        </div>

        <div className="h-4 w-full rounded-full overflow-hidden flex bg-slate-950 border border-slate-800 shadow-inner">
          {ingredients.cyanGrams > 0 && (
            <div
              className="h-full bg-cyan-400 transition-all"
              style={{ width: `${ingredients.cyanPercent}%` }}
              title={`Cyan: ${ingredients.cyanGrams}g (${ingredients.cyanPercent}%)`}
            />
          )}
          {ingredients.magentaGrams > 0 && (
            <div
              className="h-full bg-fuchsia-500 transition-all"
              style={{ width: `${ingredients.magentaPercent}%` }}
              title={`Magenta: ${ingredients.magentaGrams}g (${ingredients.magentaPercent}%)`}
            />
          )}
          {ingredients.yellowGrams > 0 && (
            <div
              className="h-full bg-amber-400 transition-all"
              style={{ width: `${ingredients.yellowPercent}%` }}
              title={`Gelb: ${ingredients.yellowGrams}g (${ingredients.yellowPercent}%)`}
            />
          )}
          {ingredients.conditionerGrams > 0 && (
            <div
              className="h-full bg-purple-300/40 transition-all"
              style={{ width: `${ingredients.conditionerPercent}%` }}
              title={`Spülung: ${ingredients.conditionerGrams}g (${ingredients.conditionerPercent}%)`}
            />
          )}
        </div>
      </div>

      <div className="bg-slate-950/70 border border-slate-800 rounded-2xl overflow-hidden">
        <table className="w-full text-left border-collapse text-xs sm:text-sm">
          <thead>
            <tr className="bg-slate-800/60 text-slate-300 font-semibold border-b border-slate-800">
              <th className="p-3">Zutat / Pigment</th>
              <th className="p-3 text-right">Menge (Gramm)</th>
              <th className="p-3 text-right">Anteil (%)</th>
              <th className="p-3 text-right">Volumen (ml)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800 text-slate-200">
            <tr className="hover:bg-slate-900/40">
              <td className="p-3 flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-cyan-400" />
                <span className="font-medium">{cyanPigment.name}</span>
              </td>
              <td className="p-3 text-right font-mono font-bold text-cyan-300">{ingredients.cyanGrams} g</td>
              <td className="p-3 text-right font-mono text-slate-400">{ingredients.cyanPercent}%</td>
              <td className="p-3 text-right font-mono text-slate-400">
                {ingredients.cyanMl !== undefined ? `${ingredients.cyanMl} ml` : '—'}
              </td>
            </tr>

            <tr className="hover:bg-slate-900/40">
              <td className="p-3 flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-fuchsia-500" />
                <span className="font-medium">{magentaPigment.name}</span>
              </td>
              <td className="p-3 text-right font-mono font-bold text-fuchsia-300">{ingredients.magentaGrams} g</td>
              <td className="p-3 text-right font-mono text-slate-400">{ingredients.magentaPercent}%</td>
              <td className="p-3 text-right font-mono text-slate-400">
                {ingredients.magentaMl !== undefined ? `${ingredients.magentaMl} ml` : '—'}
              </td>
            </tr>

            <tr className="hover:bg-slate-900/40">
              <td className="p-3 flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-amber-400" />
                <span className="font-medium">{yellowPigment.name}</span>
              </td>
              <td className="p-3 text-right font-mono font-bold text-amber-300">{ingredients.yellowGrams} g</td>
              <td className="p-3 text-right font-mono text-slate-400">{ingredients.yellowPercent}%</td>
              <td className="p-3 text-right font-mono text-slate-400">
                {ingredients.yellowMl !== undefined ? `${ingredients.yellowMl} ml` : '—'}
              </td>
            </tr>

            <tr className="hover:bg-slate-900/40">
              <td className="p-3 flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-purple-300" />
                <span className="font-medium">{conditioner?.name || 'Pigmentfreie Haarspülung'}</span>
              </td>
              <td className="p-3 text-right font-mono font-bold text-purple-300">{ingredients.conditionerGrams} g</td>
              <td className="p-3 text-right font-mono text-slate-400">{ingredients.conditionerPercent}%</td>
              <td className="p-3 text-right font-mono text-slate-400">
                {ingredients.conditionerMl !== undefined ? `${ingredients.conditionerMl} ml` : '—'}
              </td>
            </tr>

            <tr className="bg-slate-900/80 font-bold text-white border-t border-slate-700">
              <td className="p-3">Summe (Gesamtgewicht)</td>
              <td className="p-3 text-right font-mono text-cyan-300 text-base">{ingredients.totalGrams} g</td>
              <td className="p-3 text-right font-mono">100.0%</td>
              <td className="p-3 text-right font-mono text-xs text-slate-400">
                {ingredients.cyanMl !== undefined || ingredients.magentaMl !== undefined ? 'Abgeleitet' : '—'}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-4 bg-slate-950/80 p-4 rounded-2xl border border-slate-800">
        <DinoMascot size="sm" expression={isDemoMode ? 'thinking' : 'happy'} />
        <div className="text-xs text-slate-300 space-y-1">
          <div className="font-bold text-slate-100">Dinos Laborhinweis:</div>
          <p>{disclaimer}</p>
          <div className="text-[11px] text-slate-400 italic">
            * Milliliter werden nur bei hinterlegten Dichtewerten (g/ml) berechnet. Keine pauschale Umrechnung von 1g = 1ml.
          </div>
        </div>
      </div>
    </div>
  );
};

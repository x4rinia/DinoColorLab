import React, { useState } from 'react';
import type { CalculationResult, PigmentProfile, ConditionerProfile } from '../../types';
import { calculateTeaspoonAmount } from '../../engine/unitConversions';
import { DinoMascot } from '../common/DinoMascot';
import {
  AlertTriangle,
  CheckCircle2,
  BookmarkPlus,
  TestTube2,
  Printer,
  ChevronDown,
  ChevronUp,
  Scale
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
  const {
    ingredients,
    mode,
    estimatedResultHex,
    deltaEToTarget,
    confidenceScore,
    isTargetAchievable,
    nearestAchievableHex,
    disclaimer
  } = result;

  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);

  const isDemoMode = mode === 'demo_experimental';

  const cyanTsp = calculateTeaspoonAmount(
    ingredients.cyanMl,
    ingredients.cyanGrams,
    cyanPigment.densityGPerMl
  );
  const magentaTsp = calculateTeaspoonAmount(
    ingredients.magentaMl,
    ingredients.magentaGrams,
    magentaPigment.densityGPerMl
  );
  const yellowTsp = calculateTeaspoonAmount(
    ingredients.yellowMl,
    ingredients.yellowGrams,
    yellowPigment.densityGPerMl
  );
  const condTsp = calculateTeaspoonAmount(
    ingredients.conditionerMl,
    ingredients.conditionerGrams,
    conditioner?.densityGPerMl || 1.0
  );

  return (
    <div className="bg-slate-900/90 border-2 border-cyan-500/40 rounded-3xl p-6 shadow-2xl text-white backdrop-blur-md space-y-6 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-cyan-500 to-blue-500 text-slate-950">
              Meine Mischung
            </span>
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border flex items-center gap-1 ${
                isDemoMode
                  ? 'bg-amber-500/10 border-amber-500/40 text-amber-300'
                  : 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
              }`}
            >
              {isDemoMode ? <AlertTriangle className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
              <span>{isDemoMode ? 'Schematische Vorschau' : `Kalibriert (${confidenceScore}%)`}</span>
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Genaue Rezeptur für deine Testmenge ({ingredients.totalGrams} g).
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

      {/* Farbe vergleichen (Color Comparison) */}
      <div className="bg-slate-950/70 p-4 rounded-2xl border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-300">Farbe vergleichen</span>
          <span className="text-[11px] text-slate-400">
            {deltaEToTarget < 5
              ? 'Sehr hohe Farbdeckung'
              : deltaEToTarget < 15
              ? 'Gute visuelle Annäherung'
              : 'Merklicher Unterschied (Dichte/Haarton)'}
          </span>
        </div>

        <div className="flex items-center justify-around gap-4 py-2">
          <div className="text-center space-y-1.5">
            <div className="text-xs font-semibold text-slate-400">Wunschfarbe</div>
            <div
              className="w-16 h-16 rounded-2xl border-2 border-white/20 shadow-lg mx-auto"
              style={{ backgroundColor: targetHex }}
            />
            <div className="text-xs font-mono font-bold text-cyan-300">{targetHex.toUpperCase()}</div>
          </div>

          <div className="text-center text-slate-600 text-2xl font-bold">➔</div>

          <div className="text-center space-y-1.5">
            <div className="text-xs font-semibold text-slate-400">Modellschätzung</div>
            <div
              className="w-16 h-16 rounded-2xl border-2 border-white/20 shadow-lg mx-auto"
              style={{ backgroundColor: estimatedResultHex }}
            />
            <div className="text-xs font-mono font-bold text-slate-200">{estimatedResultHex.toUpperCase()}</div>
          </div>
        </div>

        {!isTargetAchievable && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs space-y-1">
            <div className="flex items-center gap-1.5 font-bold">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>Wunschfarbe nicht vollständig erreichbar!</span>
            </div>
            <p>
              Die Wunschfarbe ist heller als die Ausgangshaarfarbe oder liegt außerhalb des mischbaren Farbraums.
            </p>
            {nearestAchievableHex && (
              <div className="flex items-center gap-2 pt-1 font-mono text-[11px]">
                <span>Nächstmögliche Farbe:</span>
                <span
                  className="w-4 h-4 rounded-md border border-white/20 inline-block"
                  style={{ backgroundColor: nearestAchievableHex }}
                />
                <span>{nearestAchievableHex}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Visual Mixing Bar */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
          <span>Visuelles Mischverhältnis</span>
          <span>Gesamtmenge: {ingredients.totalGrams} g</span>
        </div>

        <div className="h-5 w-full rounded-full overflow-hidden flex bg-slate-950 border border-slate-800 shadow-inner p-0.5">
          {ingredients.cyanGrams > 0 && (
            <div
              className="h-full bg-blue-500 transition-all rounded-l-full"
              style={{ width: `${ingredients.cyanPercent}%` }}
              title={`Blau: ${ingredients.cyanGrams}g (${ingredients.cyanPercent}%)`}
            />
          )}
          {ingredients.magentaGrams > 0 && (
            <div
              className="h-full bg-rose-500 transition-all"
              style={{ width: `${ingredients.magentaPercent}%` }}
              title={`Rot-Pink: ${ingredients.magentaGrams}g (${ingredients.magentaPercent}%)`}
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
            /* Pure white swatch bar with subtle border, no purple! */
            <div
              className="h-full bg-white border border-slate-300 dark:border-slate-600 transition-all rounded-r-full"
              style={{ width: `${ingredients.conditionerPercent}%` }}
              title={`Weiße Spülung: ${ingredients.conditionerGrams}g (${ingredients.conditionerPercent}%)`}
            />
          )}
        </div>
      </div>

      {/* So viel brauchst du (Recipe Card Table) */}
      <div className="bg-slate-950/70 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="px-4 py-2.5 bg-slate-800/60 border-b border-slate-800 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-200">So viel brauchst du</span>
          <span className="text-[11px] text-slate-400">Exakte Waagen-Gramm & Löffel</span>
        </div>

        <table className="w-full text-left border-collapse text-xs sm:text-sm">
          <thead>
            <tr className="bg-slate-900/60 text-slate-400 font-semibold border-b border-slate-800 text-[11px]">
              <th className="p-3">Zutat</th>
              <th className="p-3 text-right">Menge (g)</th>
              <th className="p-3 text-right">Anteil (%)</th>
              <th className="p-3 text-right">Volumen (ml)</th>
              <th className="p-3 text-right">Löffel / Dosierung</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800 text-slate-200">
            {/* Blau */}
            <tr className="hover:bg-slate-900/40">
              <td className="p-3 flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-blue-500 shadow-sm shrink-0" />
                <span className="font-medium text-blue-200">Blau: {cyanPigment.name}</span>
              </td>
              <td className="p-3 text-right font-mono font-bold text-blue-300">{ingredients.cyanGrams} g</td>
              <td className="p-3 text-right font-mono text-slate-400">{ingredients.cyanPercent}%</td>
              <td className="p-3 text-right font-mono text-slate-400">
                {ingredients.cyanMl !== undefined ? `${ingredients.cyanMl} ml` : '—'}
              </td>
              <td className="p-3 text-right font-mono text-slate-300">
                <span className={cyanTsp.recommendScaleOrSyringe ? 'text-cyan-300 font-semibold' : ''}>
                  {cyanTsp.teaspoonDisplay}
                </span>
              </td>
            </tr>

            {/* Rot-Pink */}
            <tr className="hover:bg-slate-900/40">
              <td className="p-3 flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-500 shadow-sm shrink-0" />
                <span className="font-medium text-rose-200">Rot-Pink: {magentaPigment.name}</span>
              </td>
              <td className="p-3 text-right font-mono font-bold text-rose-300">{ingredients.magentaGrams} g</td>
              <td className="p-3 text-right font-mono text-slate-400">{ingredients.magentaPercent}%</td>
              <td className="p-3 text-right font-mono text-slate-400">
                {ingredients.magentaMl !== undefined ? `${ingredients.magentaMl} ml` : '—'}
              </td>
              <td className="p-3 text-right font-mono text-slate-300">
                <span className={magentaTsp.recommendScaleOrSyringe ? 'text-rose-300 font-semibold' : ''}>
                  {magentaTsp.teaspoonDisplay}
                </span>
              </td>
            </tr>

            {/* Gelb */}
            <tr className="hover:bg-slate-900/40">
              <td className="p-3 flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-amber-400 shadow-sm shrink-0" />
                <span className="font-medium text-amber-200">Gelb: {yellowPigment.name}</span>
              </td>
              <td className="p-3 text-right font-mono font-bold text-amber-300">{ingredients.yellowGrams} g</td>
              <td className="p-3 text-right font-mono text-slate-400">{ingredients.yellowPercent}%</td>
              <td className="p-3 text-right font-mono text-slate-400">
                {ingredients.yellowMl !== undefined ? `${ingredients.yellowMl} ml` : '—'}
              </td>
              <td className="p-3 text-right font-mono text-slate-300">
                <span className={yellowTsp.recommendScaleOrSyringe ? 'text-amber-300 font-semibold' : ''}>
                  {yellowTsp.teaspoonDisplay}
                </span>
              </td>
            </tr>

            {/* Weiße Spülung (#FFFFFF with border) */}
            <tr className="hover:bg-slate-900/40">
              <td className="p-3 flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-white border border-slate-400 shadow-sm shrink-0" />
                <span className="font-medium text-slate-200">{conditioner?.name || 'Weiße Spülung'}</span>
              </td>
              <td className="p-3 text-right font-mono font-bold text-white">{ingredients.conditionerGrams} g</td>
              <td className="p-3 text-right font-mono text-slate-400">{ingredients.conditionerPercent}%</td>
              <td className="p-3 text-right font-mono text-slate-400">
                {ingredients.conditionerMl !== undefined ? `${ingredients.conditionerMl} ml` : '—'}
              </td>
              <td className="p-3 text-right font-mono text-white font-semibold">
                {condTsp.teaspoonDisplay}
              </td>
            </tr>

            {/* Total */}
            <tr className="bg-slate-900/90 font-bold text-white border-t border-slate-700">
              <td className="p-3">Summe (Gesamtmasse)</td>
              <td className="p-3 text-right font-mono text-cyan-300 text-base">{ingredients.totalGrams} g</td>
              <td className="p-3 text-right font-mono">100.0%</td>
              <td className="p-3 text-right font-mono text-xs text-slate-400">
                {ingredients.cyanMl !== undefined || ingredients.magentaMl !== undefined ? 'Dichtebasiert' : '—'}
              </td>
              <td className="p-3 text-right font-mono text-xs text-slate-400">
                ca. {condTsp.teaspoonDisplay}
              </td>
            </tr>
          </tbody>
        </table>

        {/* Measuring Tip */}
        <div className="p-3 bg-slate-900/50 border-t border-slate-800 text-[11px] text-slate-400 flex items-start gap-2">
          <Scale className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
          <div>
            <strong>Hinweis zu Teelöffeln & Millilitern:</strong> 1 TL entspricht ca. 5 ml (½ TL = 2,5 ml, ¼ TL = 1,25 ml, ⅛ TL = 0,625 ml).
            Bei kleinen Pigmentmengen unter 1 g bzw. 1 ml raten wir dringend zu einer <strong>Dosierspritze</strong> oder <strong>Feinwaage</strong>, da Küchenlöffel für Kleinstmengen zu ungenau sind.
          </div>
        </div>
      </div>

      {/* Collapsible Info Section: Technical Information */}
      <div className="bg-slate-950/70 border border-slate-800 rounded-2xl overflow-hidden">
        <button
          onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
          className="w-full px-4 py-3 flex items-center justify-between text-xs font-semibold text-slate-300 hover:text-white transition-colors"
        >
          <span>Details & Farbwissenschaft aufklappen</span>
          {showTechnicalDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {showTechnicalDetails && (
          <div className="p-4 pt-1 border-t border-slate-800 text-xs text-slate-400 space-y-2.5">
            <div className="flex justify-between py-1 border-b border-slate-800/60">
              <span>Wahrnehmungsabstand (Delta E):</span>
              <span className="font-mono text-cyan-300 font-bold">{deltaEToTarget}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800/60">
              <span>Berechnungsmodus:</span>
              <span className="font-semibold text-slate-200">
                {mode === 'calibrated' ? 'Kalibriert (mit empirischen Teststrähnen)' : 'Experimenteller Demo-Modus'}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800/60">
              <span>Konfidenzwert:</span>
              <span className="font-mono text-slate-200">{confidenceScore}%</span>
            </div>
            <p className="text-[11px] text-slate-500 italic pt-1">
              Die optische Schätzung basiert auf einem subtraktiven Transmissions- und Absorptionsmodell für direktziehende Farbpigmente und berücksichtigt die Helligkeit des Haarsubstrats.
            </p>
          </div>
        )}
      </div>

      {/* Dino Mascot Advisory */}
      <div className="flex flex-col sm:flex-row items-center gap-4 bg-slate-950/80 p-4 rounded-2xl border border-slate-800">
        <DinoMascot size="sm" expression={isDemoMode ? 'thinking' : 'happy'} />
        <div className="text-xs text-slate-300 space-y-1">
          <div className="font-bold text-slate-100">Dinos Laborhinweis:</div>
          <p>{disclaimer}</p>
          <div className="text-[11px] text-slate-400 italic">
            * Milliliter und Teelöffel werden nur bei hinterlegten Dichtewerten berechnet. Keine pauschale Gleichsetzung von 1g = 1ml ohne Produktdaten.
          </div>
        </div>
      </div>
    </div>
  );
};

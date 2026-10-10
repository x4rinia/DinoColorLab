import React, { useState, useMemo } from 'react';
import type { CalculationResult, PigmentProfile, ConditionerProfile } from '../../types';
import { calculateTeaspoonAmount, calculateSimpleRatio } from '../../engine/unitConversions';
import { downloadRecipeCardAsPng } from '../../engine/recipeCardImageExport';
import { mixPigmentsSubtractive } from '../../engine/colorMath';
import {
  BookmarkPlus,
  Printer,
  Copy,
  Check,
  Download,
  Scale,
  Sparkles,
  Info
} from 'lucide-react';

interface RecipeResultCardProps {
  result: CalculationResult;
  cyanPigment: PigmentProfile;
  magentaPigment: PigmentProfile;
  yellowPigment: PigmentProfile;
  conditioner?: ConditionerProfile;
  targetHex: string;
  baseHairHex: string;
  baseHairLevelName: string;
  onSaveRecipe: () => void;
  onPrintRecipe: () => void;
}

export const RecipeResultCard: React.FC<RecipeResultCardProps> = ({
  result,
  cyanPigment,
  magentaPigment,
  yellowPigment,
  conditioner,
  targetHex,
  baseHairHex,
  baseHairLevelName,
  onSaveRecipe,
  onPrintRecipe
}) => {
  const { ingredients, estimatedResultHex } = result;

  const [copied, setCopied] = useState(false);

  // 1. Farbe der cremigen Mischung in der Rührschale (auf weißem Grund)
  const bowlMixtureHex = useMemo(() => {
    return mixPigmentsSubtractive(
      ingredients.cyanGrams / ingredients.totalGrams,
      ingredients.magentaGrams / ingredients.totalGrams,
      ingredients.yellowGrams / ingredients.totalGrams,
      ingredients.conditionerGrams / ingredients.totalGrams,
      cyanPigment.referenceHex,
      magentaPigment.referenceHex,
      yellowPigment.referenceHex,
      cyanPigment.intensity,
      magentaPigment.intensity,
      yellowPigment.intensity,
      '#ffffff'
    );
  }, [ingredients, cyanPigment, magentaPigment, yellowPigment]);

  // Teelöffel- und Esslöffel-Berechnungen
  const cyanTsp = calculateTeaspoonAmount(
    ingredients.cyanMl,
    ingredients.cyanGrams,
    cyanPigment.densityGPerMl,
    false
  );
  const magentaTsp = calculateTeaspoonAmount(
    ingredients.magentaMl,
    ingredients.magentaGrams,
    magentaPigment.densityGPerMl,
    false
  );
  const yellowTsp = calculateTeaspoonAmount(
    ingredients.yellowMl,
    ingredients.yellowGrams,
    yellowPigment.densityGPerMl,
    false
  );
  const condTsp = calculateTeaspoonAmount(
    ingredients.conditionerMl,
    ingredients.conditionerGrams,
    conditioner?.densityGPerMl || 1.0,
    true
  );

  const simpleRatio = useMemo(() => {
    return calculateSimpleRatio(
      ingredients.cyanGrams,
      ingredients.magentaGrams,
      ingredients.yellowGrams,
      ingredients.conditionerGrams
    );
  }, [ingredients]);

  const handleCopyText = async () => {
    const text = [
      `🦕 Dino Color Lab – Rezeptkarte (${ingredients.totalGrams} ml/g)`,
      `Wunschfarbe: ${targetHex.toUpperCase()}`,
      `Mischfarbe Schale: ${bowlMixtureHex.toUpperCase()}`,
      `Farbbeispiel auf Haar (${baseHairLevelName}): ${estimatedResultHex.toUpperCase()}`,
      ``,
      `Zutaten:`,
      `• Blau: ${ingredients.cyanGrams} g (${cyanTsp.teaspoonDisplay})`,
      `• Rot/Pink: ${ingredients.magentaGrams} g (${magentaTsp.teaspoonDisplay})`,
      `• Gelb: ${ingredients.yellowGrams} g (${yellowTsp.teaspoonDisplay})`,
      `• Weiße Spülung: ${ingredients.conditionerGrams} g (${condTsp.teaspoonDisplay})`,
      ``,
      `Mischverhältnis: ${simpleRatio}`,
      `Hinweis: Haarfarben sind lasierend; die Ausgangshaarfarbe beeinflusst das Resultat.`
    ].join('\n');

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
    }
  };

  const handleDownloadPng = () => {
    downloadRecipeCardAsPng({
      title: `Rezept ${targetHex.toUpperCase()}`,
      targetHex,
      bowlMixtureHex,
      resultOnHairHex: estimatedResultHex,
      baseHairLevelName,
      totalMl: ingredients.totalGrams,
      totalGrams: ingredients.totalGrams,
      blueGrams: ingredients.cyanGrams,
      blueTsp: cyanTsp.teaspoonDisplay,
      redPinkGrams: ingredients.magentaGrams,
      redPinkTsp: magentaTsp.teaspoonDisplay,
      yellowGrams: ingredients.yellowGrams,
      yellowTsp: yellowTsp.teaspoonDisplay,
      conditionerGrams: ingredients.conditionerGrams,
      conditionerTsp: condTsp.teaspoonDisplay,
      ratioText: simpleRatio
    });
  };

  return (
    <div className="bg-slate-900/90 border-2 border-cyan-500/40 rounded-3xl p-6 shadow-2xl text-white backdrop-blur-md space-y-5 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header mit Titel & 4 Speicheraktionen */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-cyan-500 to-blue-500 text-slate-950">
              Automatische Rezeptkarte
            </span>
            <span className="text-xs text-slate-400 font-mono">
              {ingredients.totalGrams} ml / g
            </span>
          </div>
          <h3 className="text-lg font-extrabold text-slate-100 m-0 mt-1">
            Individuelle Mischrezeptur
          </h3>
        </div>

        {/* 4 Speicheroptionen */}
        <div className="flex flex-wrap items-center gap-1.5">
          {/* 1. Bild (PNG) speichern */}
          <button
            onClick={handleDownloadPng}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/30 text-xs font-semibold transition-all shadow-sm"
            title="Rezeptkarte als Bild (PNG) herunterladen"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Bild (PNG)</span>
          </button>

          {/* 2. Rezept kopieren */}
          <button
            onClick={handleCopyText}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-all"
            title="Rezept als Text in Zwischenablage kopieren"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
            <span>{copied ? 'Kopiert!' : 'Kopieren'}</span>
          </button>

          {/* 3. Für später speichern */}
          <button
            onClick={onSaveRecipe}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 font-semibold text-xs text-white shadow-md shadow-cyan-500/20 transition-all"
            title="In deiner Rezeptbibliothek sichern"
          >
            <BookmarkPlus className="w-3.5 h-3.5" />
            <span>Speichern</span>
          </button>

          {/* 4. Druckansicht */}
          <button
            onClick={onPrintRecipe}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-all"
            title="Druckansicht öffnen"
          >
            <Printer className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Farbvergleich: 3 Farbfelder (Wunschfarbe, Mischung in Schale, Farbbeispiel auf Haar) */}
      <div className="bg-slate-950/70 p-4 rounded-2xl border border-slate-800 space-y-3">
        <div className="grid grid-cols-3 gap-2 text-center items-center">
          {/* 1. Wunschfarbe */}
          <div className="space-y-1">
            <span className="text-[11px] font-semibold text-slate-400 block">Wunschfarbe</span>
            <div
              className="w-14 h-14 rounded-2xl border-2 border-white/20 shadow-md mx-auto"
              style={{ backgroundColor: targetHex }}
            />
            <span className="text-[11px] font-mono font-bold text-cyan-300 block">
              {targetHex.toUpperCase()}
            </span>
          </div>

          {/* 2. Mischung Schale */}
          <div className="space-y-1">
            <span className="text-[11px] font-semibold text-slate-400 block">In der Schale</span>
            <div
              className="w-14 h-14 rounded-2xl border-2 border-white/20 shadow-md mx-auto"
              style={{ backgroundColor: bowlMixtureHex }}
            />
            <span className="text-[11px] font-mono font-bold text-slate-200 block">
              {bowlMixtureHex.toUpperCase()}
            </span>
          </div>

          {/* 3. Farbbeispiel auf Ausgangshaar */}
          <div className="space-y-1">
            <span className="text-[11px] font-semibold text-emerald-400 flex items-center justify-center gap-1">
              <span>Auf Haar</span>
              <span
                className="w-2.5 h-2.5 rounded-full border border-white/40 inline-block"
                style={{ backgroundColor: baseHairHex }}
                title={`Ausgangshaarfarbe: ${baseHairHex} (${baseHairLevelName})`}
              />
            </span>
            <div
              className="w-14 h-14 rounded-2xl border-2 border-emerald-400/40 shadow-lg mx-auto"
              style={{ backgroundColor: estimatedResultHex }}
            />
            <span className="text-[11px] font-mono font-bold text-emerald-300 block truncate" title={baseHairLevelName}>
              {estimatedResultHex.toUpperCase()}
            </span>
          </div>
        </div>

        {/* Hinweis zur Ausgangshaarfarbe */}
        <div className="flex items-start gap-2 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800 text-[11px] text-slate-300">
          <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
          <p>
            <strong>Farbbeispiel:</strong> Direktziehende Haarfarben sind lasierend.
            Der Untergrund deines Haares (z. B. Gold-/Gelbstich oder dunklere Nuancen) addiert sich optisch zum Ergebnis.
          </p>
        </div>
      </div>

      {/* Grafischer Mengenaufteilungs-Mischbalken */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
          <span>Grafische Farbaufteilung</span>
          <span className="font-mono text-cyan-300">Gesamt: {ingredients.totalGrams} ml/g</span>
        </div>

        <div className="h-5 w-full rounded-full overflow-hidden flex bg-slate-950 border border-slate-800 shadow-inner p-0.5">
          {ingredients.cyanGrams > 0 && (
            <div
              className="h-full bg-blue-500 transition-all rounded-l-full"
              style={{ width: `${ingredients.cyanPercent}%` }}
              title={`Blau: ${ingredients.cyanGrams} g (${ingredients.cyanPercent}%)`}
            />
          )}
          {ingredients.magentaGrams > 0 && (
            <div
              className="h-full bg-rose-500 transition-all"
              style={{ width: `${ingredients.magentaPercent}%` }}
              title={`Rot-Pink: ${ingredients.magentaGrams} g (${ingredients.magentaPercent}%)`}
            />
          )}
          {ingredients.yellowGrams > 0 && (
            <div
              className="h-full bg-amber-400 transition-all"
              style={{ width: `${ingredients.yellowPercent}%` }}
              title={`Gelb: ${ingredients.yellowGrams} g (${ingredients.yellowPercent}%)`}
            />
          )}
          {ingredients.conditionerGrams > 0 && (
            /* Reines Weiß (#FFFFFF) mit feiner Umrandung – kein Lila! */
            <div
              className="h-full bg-white border border-slate-400 dark:border-slate-500 transition-all rounded-r-full"
              style={{ width: `${ingredients.conditionerPercent}%` }}
              title={`Weiße Spülung: ${ingredients.conditionerGrams} g (${ingredients.conditionerPercent}%)`}
            />
          )}
        </div>
      </div>

      {/* Zutaten & Löffelmaße (Teelöffel / Esslöffel) */}
      <div className="bg-slate-950/70 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="px-4 py-2.5 bg-slate-800/60 border-b border-slate-800 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-200">Rezeptur-Zutaten</span>
          <span className="text-[11px] text-cyan-300 font-semibold">Teelöffel & Esslöffel</span>
        </div>

        <div className="divide-y divide-slate-800 text-xs sm:text-sm">
          {/* Blau */}
          <div className="p-3 flex items-center justify-between hover:bg-slate-900/40 transition-colors">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-blue-500 shadow-sm shrink-0" />
              <span className="font-semibold text-blue-200">Blau</span>
            </div>
            <div className="flex items-center gap-4 text-right">
              <span className="font-bold text-blue-300">{cyanTsp.teaspoonDisplay}</span>
              <span className="font-mono text-slate-400 w-16 text-right">{ingredients.cyanGrams} g</span>
              <span className="font-mono text-slate-500 text-xs w-12 text-right">{ingredients.cyanPercent}%</span>
            </div>
          </div>

          {/* Rot-Pink */}
          <div className="p-3 flex items-center justify-between hover:bg-slate-900/40 transition-colors">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-rose-500 shadow-sm shrink-0" />
              <span className="font-semibold text-rose-200">Rot / Pink</span>
            </div>
            <div className="flex items-center gap-4 text-right">
              <span className="font-bold text-rose-300">{magentaTsp.teaspoonDisplay}</span>
              <span className="font-mono text-slate-400 w-16 text-right">{ingredients.magentaGrams} g</span>
              <span className="font-mono text-slate-500 text-xs w-12 text-right">{ingredients.magentaPercent}%</span>
            </div>
          </div>

          {/* Gelb */}
          <div className="p-3 flex items-center justify-between hover:bg-slate-900/40 transition-colors">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-amber-400 shadow-sm shrink-0" />
              <span className="font-semibold text-amber-200">Gelb</span>
            </div>
            <div className="flex items-center gap-4 text-right">
              <span className="font-bold text-amber-300">{yellowTsp.teaspoonDisplay}</span>
              <span className="font-mono text-slate-400 w-16 text-right">{ingredients.yellowGrams} g</span>
              <span className="font-mono text-slate-500 text-xs w-12 text-right">{ingredients.yellowPercent}%</span>
            </div>
          </div>

          {/* Weiße Spülung (Pure white #FFFFFF with border) */}
          <div className="p-3 flex items-center justify-between hover:bg-slate-900/40 transition-colors bg-white/5">
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded-full bg-white border border-slate-400 shadow-sm shrink-0" />
              <span className="font-semibold text-white">Weiße Spülung (#FFFFFF)</span>
            </div>
            <div className="flex items-center gap-4 text-right">
              <span className="font-bold text-white bg-slate-800 px-2 py-0.5 rounded-md border border-slate-700">
                {condTsp.teaspoonDisplay}
              </span>
              <span className="font-mono text-slate-200 w-16 text-right font-bold">{ingredients.conditionerGrams} g</span>
              <span className="font-mono text-slate-400 text-xs w-12 text-right">{ingredients.conditionerPercent}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Einfaches Mischverhältnis */}
      <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-cyan-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-bold text-slate-300">Einfaches Mischverhältnis:</span>
        </div>
        <div className="text-xs font-bold font-mono text-cyan-300 bg-cyan-950/60 px-3 py-1 rounded-xl border border-cyan-500/30">
          {simpleRatio}
        </div>
      </div>

      {/* Haushaltsmaß- & Feinwaagen-Hinweis */}
      <div className="flex items-start gap-2 bg-slate-950/60 p-3 rounded-2xl border border-slate-800 text-[11px] text-slate-400">
        <Scale className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
        <p>
          <strong>Haushaltsmaße:</strong> 1 Esslöffel (EL) = 15 ml, 1 Teelöffel (TL) = 5 ml (½ TL = 2,5 ml, ¼ TL = 1,25 ml).
          Für feinste Nuancen unter 1 ml empfehlen wir eine Dosierspritze oder Feinwaage (0,01 g).
        </p>
      </div>
    </div>
  );
};

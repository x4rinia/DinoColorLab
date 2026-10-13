import React, { useState, useMemo } from 'react';
import type { CalculationResult, PigmentProfile, ConditionerProfile } from '../../types';
import {
  calculateTeaspoonAmount,
  calculateSimpleRatio,
  scaleRecipeIngredients
} from '../../engine/unitConversions';
import { downloadRecipeCardAsPng } from '../../engine/recipeCardImageExport';
import { downloadRecipeAsPdf } from '../../engine/pdfExport';
import {
  Download,
  Copy,
  Check,
  BookmarkPlus,
  Printer,
  Sparkles,
  FileText,
  Layers
} from 'lucide-react';

interface RecipeResultCardProps {
  result: CalculationResult;
  cyanPigment: PigmentProfile;
  magentaPigment: PigmentProfile;
  yellowPigment: PigmentProfile;
  conditioner?: ConditionerProfile;
  mixedColorHex: string;
  batchMultiplier?: 1 | 2;
  onMultiplierChange?: (multiplier: 1 | 2) => void;
  onSaveRecipe: () => void;
  onPrintRecipe: () => void;
}

export const RecipeResultCard: React.FC<RecipeResultCardProps> = ({
  result,
  cyanPigment,
  magentaPigment,
  yellowPigment,
  conditioner,
  mixedColorHex,
  batchMultiplier,
  onMultiplierChange,
  onSaveRecipe,
  onPrintRecipe
}) => {
  const [internalMultiplier, setInternalMultiplier] = useState<1 | 2>(1);
  const activeMultiplier = batchMultiplier ?? internalMultiplier;
  const isDouble = activeMultiplier === 2;
  const currentTotalMl = isDouble ? 80 : 40;

  const handleMultiplierToggle = (newMultiplier: 1 | 2) => {
    if (onMultiplierChange) {
      onMultiplierChange(newMultiplier);
    } else {
      setInternalMultiplier(newMultiplier);
    }
  };

  const { ingredients: rawIngredients } = result;
  const [copied, setCopied] = useState(false);

  // Falls batchMultiplier nicht von außen gesteuert wird, lokal skalieren:
  const ingredients = useMemo(() => {
    if (batchMultiplier !== undefined) {
      return rawIngredients;
    }
    if (internalMultiplier === 2 && rawIngredients.totalGrams < 60) {
      return scaleRecipeIngredients(
        rawIngredients,
        80,
        cyanPigment.densityGPerMl,
        magentaPigment.densityGPerMl,
        yellowPigment.densityGPerMl,
        conditioner?.densityGPerMl
      );
    }
    return rawIngredients;
  }, [rawIngredients, batchMultiplier, internalMultiplier, cyanPigment, magentaPigment, yellowPigment, conditioner]);

  // Löffelmaße für die Zutaten (rein in TL/EL ohne Gramm)
  const blueTsp = calculateTeaspoonAmount(
    undefined,
    ingredients.cyanGrams,
    1.0,
    false
  );
  const redPinkTsp = calculateTeaspoonAmount(
    undefined,
    ingredients.magentaGrams,
    1.0,
    false
  );
  const yellowTsp = calculateTeaspoonAmount(
    undefined,
    ingredients.yellowGrams,
    1.0,
    false
  );
  const condTsp = calculateTeaspoonAmount(
    undefined,
    ingredients.conditionerGrams,
    1.0,
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

  const portionLabel = isDouble
    ? 'Doppelte Menge (80 ml)'
    : 'Standard (40 ml)';

  const handleCopyText = async () => {
    const text = [
      `🦕 Dino Color Lab – Rezeptkarte (${portionLabel})`,
      `Gemischte Farbe: ${mixedColorHex.toUpperCase()}`,
      ``,
      `Zutaten (Löffelmaße):`,
      `• Blau: ${blueTsp.teaspoonDisplay} (${ingredients.cyanPercent}%)`,
      `• Pinkstichiges Rot: ${redPinkTsp.teaspoonDisplay} (${ingredients.magentaPercent}%)`,
      `• Gelb: ${yellowTsp.teaspoonDisplay} (${ingredients.yellowPercent}%)`,
      `• Weiße Spülung: ${condTsp.teaspoonDisplay} (${ingredients.conditionerPercent}%)`,
      ``,
      `Mischverhältnis: ${simpleRatio}`,
      `Praxishinweis: 1 EL = 15 ml | 1 TL = 5 ml | Gesamtmenge: ${currentTotalMl} ml.`
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
      title: `Rezept_${mixedColorHex.toUpperCase()}${isDouble ? '_doppelte_menge' : ''}`,
      mixedColorHex,
      blueTsp: blueTsp.teaspoonDisplay,
      redPinkTsp: redPinkTsp.teaspoonDisplay,
      yellowTsp: yellowTsp.teaspoonDisplay,
      conditionerTsp: condTsp.teaspoonDisplay,
      bluePercent: ingredients.cyanPercent,
      redPinkPercent: ingredients.magentaPercent,
      yellowPercent: ingredients.yellowPercent,
      conditionerPercent: ingredients.conditionerPercent,
      ratioText: simpleRatio,
      portionText: portionLabel
    });
  };

  const handleDownloadPdf = () => {
    downloadRecipeAsPdf(
      {
        title: `Mischrezeptur ${mixedColorHex.toUpperCase()}${isDouble ? ' (Doppelte Menge)' : ''}`,
        description: `Berechnet im Dino Color Lab Farblabor für Direktzieher (${portionLabel}).`,
        targetHex: mixedColorHex,
        cyanPigmentId: cyanPigment.id || 1,
        magentaPigmentId: magentaPigment.id || 2,
        yellowPigmentId: yellowPigment.id || 3,
        conditionerId: conditioner?.id,
        totalBatchGrams: currentTotalMl,
        ingredients,
        baseHairColor: { levelKey: 'bleached_level10', hex: '#fffbeb' },
        testStatus: 'untested',
        tags: ['Farblabor', isDouble ? 'Doppelte Menge' : 'Standardmenge'],
        isFavorite: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      [cyanPigment, magentaPigment, yellowPigment],
      conditioner ? [conditioner] : []
    );
  };

  return (
    <div className="bg-slate-900/90 border-2 border-blue-500/40 rounded-3xl p-5 sm:p-6 shadow-2xl text-white backdrop-blur-md space-y-4 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header mit Titel & Exportoptionen */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm">
              Mischrezeptur
            </span>
            <span className="text-xs text-slate-400">
              {portionLabel}
            </span>
          </div>
          <h3 className="text-lg font-extrabold text-slate-100 m-0 mt-1">
            Zutaten zum Anrühren
          </h3>
        </div>

        {/* Speicher- & Exportoptionen: PDF, Bild, Kopieren, Speichern, Drucken */}
        <div className="flex flex-wrap items-center gap-1.5">
          {/* PDF herunterladen */}
          <button
            onClick={handleDownloadPdf}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-rose-600/90 hover:bg-rose-500 text-white text-xs font-semibold transition-all shadow-sm"
            title="Rezeptur als formatiertes PDF herunterladen"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>PDF</span>
          </button>

          {/* Bild (PNG) speichern */}
          <button
            onClick={handleDownloadPng}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-blue-300 border border-blue-500/30 text-xs font-semibold transition-all shadow-sm"
            title="Rezeptkarte als Bild (PNG) herunterladen"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Bild</span>
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
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 font-semibold text-xs text-white shadow-md shadow-blue-500/20 transition-all"
            title="In 'Meine Rezepte' sichern"
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

      {/* Große, klare Anzeige der gemischten Farbnuance */}
      <div className="bg-slate-950/70 p-4 rounded-2xl border border-slate-800 flex items-center gap-4">
        <div
          className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl border-2 border-white/20 shadow-xl shrink-0 transition-transform hover:scale-105"
          style={{ backgroundColor: mixedColorHex }}
          title={`Gemischte Farbe: ${mixedColorHex}`}
        />
        <div className="space-y-1">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span>Gemischte Farbnuance</span>
          </div>
          <div className="text-xl sm:text-2xl font-mono font-extrabold text-blue-300 tracking-wider">
            {mixedColorHex.toUpperCase()}
          </div>
          <div className="text-xs text-slate-400">
            Rezeptur in Löffelmaßen für {isDouble ? 'die doppelte Menge (80 ml)' : 'die Standardmenge (40 ml)'}
          </div>
        </div>
      </div>

      {/* Grafischer Mischbalken */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
          <span>Farbaufteilung:</span>
          <span className="font-mono text-blue-300">{simpleRatio}</span>
        </div>

        <div className="h-4 w-full rounded-full overflow-hidden flex bg-slate-950 border border-slate-800 shadow-inner p-0.5">
          {ingredients.cyanGrams > 0 && (
            <div
              className="h-full bg-blue-600 transition-all rounded-l-full"
              style={{ width: `${ingredients.cyanPercent}%` }}
              title={`Blau: ${blueTsp.teaspoonDisplay}`}
            />
          )}
          {ingredients.magentaGrams > 0 && (
            <div
              className="h-full transition-all"
              style={{ width: `${ingredients.magentaPercent}%`, backgroundColor: '#e01a69' }}
              title={`Pinkstichiges Rot: ${redPinkTsp.teaspoonDisplay}`}
            />
          )}
          {ingredients.yellowGrams > 0 && (
            <div
              className="h-full bg-amber-400 transition-all"
              style={{ width: `${ingredients.yellowPercent}%` }}
              title={`Gelb: ${yellowTsp.teaspoonDisplay}`}
            />
          )}
          {ingredients.conditionerGrams > 0 && (
            <div
              className="h-full bg-white border border-slate-400 transition-all rounded-r-full"
              style={{ width: `${ingredients.conditionerPercent}%` }}
              title={`Weiße Spülung: ${condTsp.teaspoonDisplay}`}
            />
          )}
        </div>
      </div>

      {/* Mengen-Auswahl: Standard (40 ml) vs. Doppelte Menge (80 ml) */}
      <div className="bg-slate-950/70 p-3 sm:p-3.5 rounded-2xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-inner">
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
              {isDouble
                ? 'Rezeptur für 80 ml (doppelte Löffelmengen)'
                : 'Standardmenge für 40 ml'}
            </div>
          </div>
        </div>

        {/* Die beiden Buttons: Standard vs. Doppelte Menge */}
        <div className="flex items-center gap-1.5 bg-slate-900/90 p-1 rounded-xl border border-slate-800 self-stretch sm:self-auto shrink-0">
          <button
            type="button"
            onClick={() => handleMultiplierToggle(1)}
            className={`flex-1 sm:flex-initial px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
              !isDouble
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25 ring-1 ring-blue-400'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/80'
            }`}
          >
            Standard
          </button>
          <button
            type="button"
            onClick={() => handleMultiplierToggle(2)}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
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

      {/* Zutatenliste rein in Löffelmaßen (KEINE GRAMMANGABEN!) */}
      <div className="border border-slate-800 rounded-2xl overflow-hidden bg-slate-950/50">
        <table className="w-full text-left text-xs sm:text-sm">
          <thead className="bg-slate-800/60 text-slate-300 font-bold border-b border-slate-800">
            <tr>
              <th className="p-3">Zutat</th>
              <th className="p-3 text-right">Löffelmaß {isDouble ? '(für 80 ml)' : '(für 40 ml)'}</th>
              <th className="p-3 text-right">Anteil</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80">
            {/* Blau */}
            <tr className={ingredients.cyanPercent === 0 ? 'opacity-40' : ''}>
              <td className="p-3 font-semibold flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded-full bg-blue-600 shadow-sm shrink-0" />
                <span className="text-blue-300">Blau</span>
              </td>
              <td className="p-3 text-right font-bold text-white">
                {blueTsp.teaspoonDisplay}
              </td>
              <td className="p-3 text-right font-mono text-slate-400">
                {ingredients.cyanPercent}%
              </td>
            </tr>

            {/* Pinkstichiges Rot */}
            <tr className={ingredients.magentaPercent === 0 ? 'opacity-40' : ''}>
              <td className="p-3 font-semibold flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded-full shadow-sm shrink-0" style={{ backgroundColor: '#e01a69' }} />
                <span className="text-rose-300">Pinkstichiges Rot</span>
              </td>
              <td className="p-3 text-right font-bold text-white">
                {redPinkTsp.teaspoonDisplay}
              </td>
              <td className="p-3 text-right font-mono text-slate-400">
                {ingredients.magentaPercent}%
              </td>
            </tr>

            {/* Gelb */}
            <tr className={ingredients.yellowPercent === 0 ? 'opacity-40' : ''}>
              <td className="p-3 font-semibold flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded-full bg-amber-400 shadow-sm shrink-0" />
                <span className="text-amber-300">Gelb</span>
              </td>
              <td className="p-3 text-right font-bold text-white">
                {yellowTsp.teaspoonDisplay}
              </td>
              <td className="p-3 text-right font-mono text-slate-400">
                {ingredients.yellowPercent}%
              </td>
            </tr>

            {/* Weiße Spülung (#FFFFFF) */}
            <tr className={ingredients.conditionerPercent === 0 ? 'opacity-40' : ''}>
              <td className="p-3 font-semibold flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded-full bg-white border border-slate-400 shadow-sm shrink-0" />
                <span className="text-slate-100">Weiße Spülung</span>
              </td>
              <td className="p-3 text-right font-bold text-white">
                {condTsp.teaspoonDisplay}
              </td>
              <td className="p-3 text-right font-mono text-slate-400">
                {ingredients.conditionerPercent}%
              </td>
            </tr>

            {/* Gesamtzeile */}
            <tr className="bg-slate-900/90 font-bold border-t border-slate-700 text-white">
              <td className="p-3">Portion gesamt</td>
              <td className="p-3 text-right font-semibold text-blue-300">
                {isDouble ? '80 ml (Doppelte Menge)' : '40 ml (Standard)'}
              </td>
              <td className="p-3 text-right font-mono">100%</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Praktischer Anwendungstipp */}
      <div className="bg-slate-950/60 p-3 rounded-2xl border border-slate-800 text-xs text-slate-300 space-y-1">
        <div className="font-bold text-slate-200">🥄 Praktische Dosier-Hilfe:</div>
        <p className="m-0 text-slate-400">
          • <strong>1 EL</strong> = 15 ml (großer Esslöffel) | <strong>1 TL</strong> = 5 ml (Kaffeelöffel) | <strong>½ TL</strong> = 2,5 ml
          <br />
          {isDouble ? (
            <>
              • Aktuelle Gesamtmenge: <strong>80 ml (Doppelte Menge)</strong>.
              <br />
              • Alle Löffelmaße in der Tabelle sind <strong>bereits verdoppelt</strong> (die Prozentanteile der Rezeptur bleiben exakt gleich).
            </>
          ) : (
            <>
              • Standard-Gesamtmenge: <strong>40 ml</strong> (ca. 2 EL + 2 TL).
            </>
          )}
          <br />
          • <strong>Spülung:</strong> Dient auch bei kräftigen Farben zum Strecken & für cremigen Auftrag (bei reinem Schwarz 0%).
          <br />
          • Bei Kleinstmengen unter ¼ TL: Nur wenige Tropfen oder eine Messerspitze mit dem Pinsel zugeben.
        </p>
      </div>
    </div>
  );
};

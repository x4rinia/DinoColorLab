import React, { useState, useMemo } from 'react';
import type { CalculationResult, PigmentProfile, ConditionerProfile } from '../../types';
import {
  calculateTeaspoonAmount,
  calculateSimpleRatio
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
  FileText
} from 'lucide-react';

interface RecipeResultCardProps {
  result: CalculationResult;
  cyanPigment: PigmentProfile;
  magentaPigment: PigmentProfile;
  yellowPigment: PigmentProfile;
  conditioner?: ConditionerProfile;
  mixedColorHex: string;
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
  onSaveRecipe,
  onPrintRecipe
}) => {
  const { ingredients } = result;
  const [copied, setCopied] = useState(false);

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

  const handleCopyText = async () => {
    const text = [
      `🦕 Dino Color Lab – Rezeptkarte (Teststrähne: mind. 10 ml / ca. 2 TL)`,
      `Gemischte Farbe: ${mixedColorHex.toUpperCase()}`,
      ``,
      `Zutaten (Löffelmaße):`,
      `• Blau: ${blueTsp.teaspoonDisplay} (${ingredients.cyanPercent}%)`,
      `• Rot-Pink: ${redPinkTsp.teaspoonDisplay} (${ingredients.magentaPercent}%)`,
      `• Gelb: ${yellowTsp.teaspoonDisplay} (${ingredients.yellowPercent}%)`,
      `• Weiße Spülung: ${condTsp.teaspoonDisplay} (${ingredients.conditionerPercent}%)`,
      ``,
      `Mischverhältnis: ${simpleRatio}`,
      `Praxishinweis: 1 TL = 5 ml | 1 EL = 15 ml | Bei Kleinstmengen wenige Tropfen zugeben.`
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
      title: `Rezept_${mixedColorHex.toUpperCase()}`,
      mixedColorHex,
      blueTsp: blueTsp.teaspoonDisplay,
      redPinkTsp: redPinkTsp.teaspoonDisplay,
      yellowTsp: yellowTsp.teaspoonDisplay,
      conditionerTsp: condTsp.teaspoonDisplay,
      bluePercent: ingredients.cyanPercent,
      redPinkPercent: ingredients.magentaPercent,
      yellowPercent: ingredients.yellowPercent,
      conditionerPercent: ingredients.conditionerPercent,
      ratioText: simpleRatio
    });
  };

  const handleDownloadPdf = () => {
    downloadRecipeAsPdf(
      {
        title: `Mischrezeptur ${mixedColorHex.toUpperCase()}`,
        description: 'Berechnet im Dino Color Lab Farblabor für Direktzieher.',
        targetHex: mixedColorHex,
        cyanPigmentId: cyanPigment.id || 1,
        magentaPigmentId: magentaPigment.id || 2,
        yellowPigmentId: yellowPigment.id || 3,
        conditionerId: conditioner?.id,
        totalBatchGrams: 5,
        ingredients,
        baseHairColor: { levelKey: 'bleached_level10', hex: '#fffbeb' },
        testStatus: 'untested',
        tags: ['Farblabor', 'Teststrähne'],
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
              Teststrähne (mind. 10 ml / ca. 2 TL)
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
            Rezeptur rein in Löffeln für die Testschale
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
              className="h-full bg-rose-500 transition-all"
              style={{ width: `${ingredients.magentaPercent}%` }}
              title={`Rot-Pink: ${redPinkTsp.teaspoonDisplay}`}
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

      {/* Zutatenliste rein in Löffelmaßen (KEINE GRAMMANGABEN!) */}
      <div className="border border-slate-800 rounded-2xl overflow-hidden bg-slate-950/50">
        <table className="w-full text-left text-xs sm:text-sm">
          <thead className="bg-slate-800/60 text-slate-300 font-bold border-b border-slate-800">
            <tr>
              <th className="p-3">Zutat</th>
              <th className="p-3 text-right">Löffelmaß</th>
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

            {/* Rot-Pink */}
            <tr className={ingredients.magentaPercent === 0 ? 'opacity-40' : ''}>
              <td className="p-3 font-semibold flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded-full bg-rose-600 shadow-sm shrink-0" />
                <span className="text-rose-300">Rot-Pink</span>
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
          </tbody>
        </table>
      </div>

      {/* Praktischer Anwendungstipp */}
      <div className="bg-slate-950/60 p-3 rounded-2xl border border-slate-800 text-xs text-slate-300 space-y-1">
        <div className="font-bold text-slate-200">🥄 Praktische Dosier-Hilfe:</div>
        <p className="m-0 text-slate-400">
          • <strong>1 TL</strong> = 5 ml (gestrichener Kaffeelöffel) | <strong>½ TL</strong> = 2,5 ml
          <br />
          • Bei <strong>&lt; ⅛ TL</strong>: Nur wenige Tropfen oder eine Messerspitze mit dem Pinsel zugeben.
          <br />
          • Spülung bei größeren Mengen: <strong>1 EL</strong> = 15 ml.
        </p>
      </div>
    </div>
  );
};

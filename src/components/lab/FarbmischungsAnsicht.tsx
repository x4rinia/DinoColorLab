import React, { useState, useMemo } from 'react';
import type { PigmentProfile, ConditionerProfile, IngredientBreakdown } from '../../types';
import { mixPigmentsSubtractive } from '../../engine/colorMath';
import {
  Layers,
  ChevronRight,
  Droplet,
  AlertTriangle,
  Sparkles,
  Info,
  CheckCircle2
} from 'lucide-react';

interface FarbmischungsAnsichtProps {
  cyanPigment: PigmentProfile;
  magentaPigment: PigmentProfile;
  yellowPigment: PigmentProfile;
  conditioner?: ConditionerProfile;
  ingredients: IngredientBreakdown;
  estimatedResultHex: string;
  baseHairHex: string;
  baseHairLevelName?: string;
  isCalibrated: boolean;
}

export const FarbmischungsAnsicht: React.FC<FarbmischungsAnsichtProps> = ({
  cyanPigment,
  magentaPigment,
  yellowPigment,
  conditioner,
  ingredients,
  estimatedResultHex,
  baseHairHex,
  baseHairLevelName = 'Sehr hell blondiert',
  isCalibrated
}) => {
  const [activeStep, setActiveStep] = useState<number>(0);
  const [viewMode, setViewMode] = useState<'stepper' | 'overview'>('overview');

  const totalPigmentGrams =
    ingredients.cyanGrams + ingredients.magentaGrams + ingredients.yellowGrams;

  // 1. Reine Pigment-Konzentration (subtraktiv ohne Spülung auf weißem Grund)
  const pureConcentrateHex = useMemo(() => {
    if (totalPigmentGrams <= 0.001) return '#ffffff';
    return mixPigmentsSubtractive(
      ingredients.cyanGrams / totalPigmentGrams,
      ingredients.magentaGrams / totalPigmentGrams,
      ingredients.yellowGrams / totalPigmentGrams,
      0,
      cyanPigment.referenceHex,
      magentaPigment.referenceHex,
      yellowPigment.referenceHex,
      cyanPigment.intensity,
      magentaPigment.intensity,
      yellowPigment.intensity,
      '#ffffff'
    );
  }, [ingredients, cyanPigment, magentaPigment, yellowPigment, totalPigmentGrams]);

  // 2. Fertige Mischung in der Schale (mit Spülung verdünnt auf weißem Grund)
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

  const steps = [
    {
      index: 1,
      title: 'Ausgangspigmente',
      subtitle: 'Deine gewählten Grundfarben',
      renderVisual: () => (
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="bg-slate-950/80 p-2.5 rounded-2xl border border-blue-500/30">
            <div
              className="w-10 h-10 rounded-full mx-auto shadow-md border-2 border-white/20"
              style={{ backgroundColor: cyanPigment.referenceHex }}
            />
            <div className="text-xs font-bold text-blue-300 mt-1.5">Blau</div>
            <div className="text-[10px] text-slate-400 font-mono truncate">{cyanPigment.name}</div>
          </div>
          <div className="bg-slate-950/80 p-2.5 rounded-2xl border border-rose-500/30">
            <div
              className="w-10 h-10 rounded-full mx-auto shadow-md border-2 border-white/20"
              style={{ backgroundColor: magentaPigment.referenceHex }}
            />
            <div className="text-xs font-bold text-rose-300 mt-1.5">Rot-Pink</div>
            <div className="text-[10px] text-slate-400 font-mono truncate">{magentaPigment.name}</div>
          </div>
          <div className="bg-slate-950/80 p-2.5 rounded-2xl border border-amber-500/30">
            <div
              className="w-10 h-10 rounded-full mx-auto shadow-md border-2 border-white/20"
              style={{ backgroundColor: yellowPigment.referenceHex }}
            />
            <div className="text-xs font-bold text-amber-300 mt-1.5">Gelb</div>
            <div className="text-[10px] text-slate-400 font-mono truncate">{yellowPigment.name}</div>
          </div>
        </div>
      ),
      description: 'Drei kühle bzw. leuchtende Grundpigmente bilden die Basis für jede Nuance.'
    },
    {
      index: 2,
      title: 'Zugabe der einzelnen Farben',
      subtitle: 'Dosiermengen nach Rezeptur',
      renderVisual: () => (
        <div className="space-y-2 bg-slate-950/80 p-3 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-1.5 text-blue-300 font-medium">
              <span className="w-3 h-3 rounded-full bg-blue-500" />
              Blau:
            </span>
            <span className="font-mono font-bold text-white">
              {ingredients.cyanGrams} g ({ingredients.cyanPercent}%)
            </span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-1.5 text-rose-300 font-medium">
              <span className="w-3 h-3 rounded-full bg-rose-500" />
              Rot-Pink:
            </span>
            <span className="font-mono font-bold text-white">
              {ingredients.magentaGrams} g ({ingredients.magentaPercent}%)
            </span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-1.5 text-amber-300 font-medium">
              <span className="w-3 h-3 rounded-full bg-amber-400" />
              Gelb:
            </span>
            <span className="font-mono font-bold text-white">
              {ingredients.yellowGrams} g ({ingredients.yellowPercent}%)
            </span>
          </div>
        </div>
      ),
      description: 'Zutaten werden in einer additiven Reihenfolge in die Rührschale gewogen.'
    },
    {
      index: 3,
      title: 'Vermischung der Pigmente',
      subtitle: 'Subtraktive Pigmentkonzentration',
      renderVisual: () => (
        <div className="flex items-center justify-around bg-slate-950/80 p-3 rounded-2xl border border-slate-800">
          <div className="text-center">
            <div className="text-[10px] text-slate-400 mb-1">Reine Farbpigmente</div>
            <div
              className="w-14 h-14 rounded-2xl mx-auto shadow-lg border-2 border-white/20 transition-all"
              style={{ backgroundColor: pureConcentrateHex }}
            />
            <div className="text-[11px] font-mono font-bold text-slate-200 mt-1">
              {pureConcentrateHex.toUpperCase()}
            </div>
          </div>
          <div className="text-xs text-slate-400 max-w-[140px] leading-relaxed">
            Unverdünnter Farbkern (Gesamt: {Math.round(totalPigmentGrams * 100) / 100} g Pigmentmasse).
          </div>
        </div>
      ),
      description: 'Haarpigmente wirken subtraktiv (filtern Licht) und erzeugen vor der Verdünnung einen intensiven Grundton.'
    },
    {
      index: 4,
      title: 'Hinzufügen weißer Spülung',
      subtitle: 'Aufhellung & Pastellisierung',
      renderVisual: () => (
        <div className="flex items-center justify-between gap-3 bg-slate-950/80 p-3 rounded-2xl border border-slate-800">
          <div className="flex items-center gap-2">
            {/* Pure white swatch with border */}
            <div
              className="w-12 h-12 rounded-2xl bg-white border-2 border-slate-400 shadow-md flex items-center justify-center shrink-0"
              title="Reine weiße Spülung (#FFFFFF)"
            >
              <Droplet className="w-5 h-5 text-slate-500" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-100">
                {conditioner?.name || 'Weiße Spülung'}
              </div>
              <div className="text-[10px] text-slate-400">Reines Weiß (#FFFFFF)</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm font-mono font-extrabold text-white">
              {ingredients.conditionerGrams} g
            </div>
            <div className="text-[10px] text-slate-400 font-mono">
              {ingredients.conditionerPercent}% Anteil
            </div>
          </div>
        </div>
      ),
      description: 'Weiße Spülung senkt die Pigmentkonzentration, macht die Mischung transluzenter und formt den gewünschten Pastellgrad.'
    },
    {
      index: 5,
      title: 'Geschätzte Farbe der fertigen Mischung',
      subtitle: 'In der Färbeschale vor dem Auftrag',
      renderVisual: () => (
        <div className="flex items-center justify-around bg-slate-950/80 p-3 rounded-2xl border border-slate-800">
          <div className="text-center">
            <div className="text-[10px] text-slate-400 mb-1">Farbe in der Schale</div>
            <div
              className="w-14 h-14 rounded-2xl mx-auto shadow-lg border-2 border-white/20"
              style={{ backgroundColor: bowlMixtureHex }}
            />
            <div className="text-[11px] font-mono font-bold text-slate-200 mt-1">
              {bowlMixtureHex.toUpperCase()}
            </div>
          </div>
          <div className="text-xs text-slate-300 max-w-[150px] leading-relaxed">
            So sieht die cremige Textur nach gründlichem Verrühren in der Schale aus.
          </div>
        </div>
      ),
      description: 'Achtung: Die Pastenfarbe in der Schale wirkt oft milchiger als das spätere Ergebnis auf dem Haar!'
    },
    {
      index: 6,
      title: 'Geschätzte Wirkung auf dem Haar',
      subtitle: `Auf ${baseHairLevelName}`,
      renderVisual: () => (
        <div className="grid grid-cols-2 gap-3 bg-slate-950/80 p-3 rounded-2xl border border-slate-800 text-center">
          <div>
            <div className="text-[10px] text-slate-400 mb-1">Ausgangshaar</div>
            <div
              className="w-12 h-12 rounded-2xl mx-auto border-2 border-white/20 shadow-md"
              style={{ backgroundColor: baseHairHex }}
            />
            <div className="text-[10px] font-mono text-slate-400 mt-1">{baseHairHex.toUpperCase()}</div>
          </div>
          <div>
            <div className="text-[10px] text-emerald-300 font-bold mb-1">Gefärbte Strähne</div>
            <div
              className="w-12 h-12 rounded-2xl mx-auto border-2 border-emerald-400/40 shadow-lg"
              style={{ backgroundColor: estimatedResultHex }}
            />
            <div className="text-[10px] font-mono font-bold text-emerald-300 mt-1">
              {estimatedResultHex.toUpperCase()}
            </div>
          </div>
        </div>
      ),
      description: 'Das Haar ist der Untergrund. Der Gelb- oder Goldstich des Haares verbindet sich subtraktiv mit den Pigmenten.'
    }
  ];

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 shadow-xl text-white backdrop-blur-md space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div>
          <h3 className="text-base font-bold flex items-center gap-2 text-slate-100 m-0">
            <Layers className="w-5 h-5 text-cyan-400" />
            <span>Schritt-für-Schritt Farbmischung</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Interaktiver Ablauf von den Einzelpigmenten bis zum Strähnenergebnis
          </p>
        </div>

        <div className="flex items-center gap-2">
          {!isCalibrated ? (
            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/10 border border-amber-500/30 text-amber-300 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3 text-amber-400" />
              <span>Schematische Vorschau (unkalibriert)</span>
            </span>
          ) : (
            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              <span>Kalibriertes Modell</span>
            </span>
          )}

          <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setViewMode('overview')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                viewMode === 'overview'
                  ? 'bg-cyan-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Übersicht
            </button>
            <button
              onClick={() => setViewMode('stepper')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                viewMode === 'stepper'
                  ? 'bg-cyan-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Schritte
            </button>
          </div>
        </div>
      </div>

      {/* Stepper View */}
      {viewMode === 'stepper' ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-1 overflow-x-auto pb-2 scrollbar-none">
            {steps.map((st, i) => (
              <button
                key={i}
                onClick={() => setActiveStep(i)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  activeStep === i
                    ? 'bg-cyan-500 text-slate-950 font-bold shadow-md'
                    : 'bg-slate-950/60 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                <span>{st.index}.</span>
                <span>{st.title}</span>
              </button>
            ))}
          </div>

          <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs text-cyan-400 font-bold uppercase tracking-wider">
                  Schritt {steps[activeStep].index} von {steps.length}
                </span>
                <h4 className="text-sm font-bold text-slate-100 m-0">{steps[activeStep].title}</h4>
                <div className="text-xs text-slate-400">{steps[activeStep].subtitle}</div>
              </div>
            </div>

            <div className="pt-2">{steps[activeStep].renderVisual()}</div>

            <p className="text-xs text-slate-300 bg-slate-900/60 p-3 rounded-xl border border-slate-800/80">
              {steps[activeStep].description}
            </p>

            <div className="flex items-center justify-between pt-2">
              <button
                disabled={activeStep === 0}
                onClick={() => setActiveStep((prev) => Math.max(0, prev - 1))}
                className="px-3 py-1.5 rounded-xl bg-slate-800 text-xs text-slate-300 disabled:opacity-30"
              >
                Zurück
              </button>
              <button
                disabled={activeStep === steps.length - 1}
                onClick={() => setActiveStep((prev) => Math.min(steps.length - 1, prev + 1))}
                className="flex items-center gap-1 px-4 py-1.5 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs disabled:opacity-30"
              >
                <span>Weiter</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Overview View: Visual Flow Cards */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {steps.map((st, i) => (
            <div
              key={i}
              className="bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800 flex flex-col justify-between space-y-3 hover:border-slate-700 transition-all"
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-300 text-[11px] font-extrabold flex items-center justify-center border border-cyan-500/30">
                    {st.index}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">Stufe {st.index}</span>
                </div>
                <h4 className="text-xs font-bold text-slate-100 m-0">{st.title}</h4>
                <div className="text-[11px] text-slate-400 mt-0.5">{st.subtitle}</div>
              </div>

              <div>{st.renderVisual()}</div>

              <div className="text-[11px] text-slate-400 line-clamp-2 italic pt-1 border-t border-slate-800/60">
                {st.description}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Educational Color Mixing Laws Banner */}
      <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 space-y-2.5">
        <div className="flex items-center gap-2 text-cyan-300 font-bold text-xs">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <span>Wichtige Zusammenhänge für Anfänger:</span>
        </div>

        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300">
          <li className="flex items-start gap-2 bg-slate-900/60 p-2 rounded-xl">
            <span className="text-cyan-400 font-bold">•</span>
            <span>
              <strong>Blau + Rot-Pink:</strong> Kann je nach Verhältnis kräftiges Violett, Purpur oder Beere ergeben.
            </span>
          </li>
          <li className="flex items-start gap-2 bg-slate-900/60 p-2 rounded-xl">
            <span className="text-cyan-400 font-bold">•</span>
            <span>
              <strong>Blau + Gelb:</strong> Kann frische Grün- und Smaragdtöne ergeben.
            </span>
          </li>
          <li className="flex items-start gap-2 bg-slate-900/60 p-2 rounded-xl">
            <span className="text-cyan-400 font-bold">•</span>
            <span>
              <strong>Rot-Pink + Gelb:</strong> Ergibt leuchtende Rötlich- bis Orange- und Korallentöne.
            </span>
          </li>
          <li className="flex items-start gap-2 bg-slate-900/60 p-2 rounded-xl">
            <span className="text-cyan-400 font-bold">•</span>
            <span>
              <strong>Alle drei Farben:</strong> Erzeugen je nach Pigmenten dunkle, gedämpfte oder bräunliche Nuancen.
            </span>
          </li>
          <li className="flex items-start gap-2 bg-slate-900/60 p-2 rounded-xl">
            <span className="text-cyan-400 font-bold">•</span>
            <span>
              <strong>Mehr neutrale Spülung:</strong> Verringert die Pigmentdichte – die Farbe wirkt heller und transparenter.
            </span>
          </li>
          <li className="flex items-start gap-2 bg-slate-900/60 p-2 rounded-xl">
            <span className="text-cyan-400 font-bold">•</span>
            <span>
              <strong>Ausgangshaar & Formulierung:</strong> Jeder Gelbstich oder dunkle Ton im Haar verändert das Endergebnis!
            </span>
          </li>
        </ul>

        <div className="flex items-center gap-2 text-[11px] text-amber-400/90 italic pt-1">
          <Info className="w-3.5 h-3.5 shrink-0" />
          <span>
            Hinweis: Diese Beispiele sind schematische Orientierungshilfen und keine garantierten Mischresultate.
          </span>
        </div>
      </div>
    </div>
  );
};

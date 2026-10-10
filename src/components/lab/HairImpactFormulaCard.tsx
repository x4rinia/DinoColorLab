import React from 'react';
import { AlertTriangle, CheckCircle2, Plus, Equal, Sparkles } from 'lucide-react';

interface HairImpactFormulaCardProps {
  bowlMixtureHex: string;
  baseHairHex: string;
  baseHairLevelName: string;
  estimatedResultHex: string;
  isPastelMode?: boolean;
}

export const HairImpactFormulaCard: React.FC<HairImpactFormulaCardProps> = ({
  bowlMixtureHex,
  baseHairHex,
  baseHairLevelName,
  estimatedResultHex,
  isPastelMode = false
}) => {
  // Analysiere, ob das Farbergebnis klappen wird oder ob es "nix wird"
  const evaluateCompatibility = () => {
    // 1. Ausgangshaar Helligkeit & Farbstich schätzen
    const baseR = parseInt(baseHairHex.slice(1, 3), 16) || 0;
    const baseG = parseInt(baseHairHex.slice(3, 5), 16) || 0;
    const baseB = parseInt(baseHairHex.slice(5, 7), 16) || 0;
    const baseBrightness = (baseR + baseG + baseB) / 3;

    // Ziel/Mischfarbe RGB
    const mixR = parseInt(bowlMixtureHex.slice(1, 3), 16) || 0;
    const mixG = parseInt(bowlMixtureHex.slice(3, 5), 16) || 0;
    const mixB = parseInt(bowlMixtureHex.slice(5, 7), 16) || 0;
    const mixBrightness = (mixR + mixG + mixB) / 3;

    const isBlueDominant = mixB > mixR + 30 && mixB > mixG + 10;
    const hasHairYellow = baseR > 200 && baseG > 180 && baseB < 160;

    // Test 1: Pastell auf dunklem/mittlerem Haar
    if (isPastelMode && baseBrightness < 225) {
      return {
        status: 'fail' as const,
        badge: 'Wird nicht funktionieren',
        title: 'Zu dunkles Haar für Pastell',
        text: 'Pastelltöne sind stark mit weißer Spülung verdünnt und extrem transparent. Auf dieser Ausgangshaarfarbe wird man die Farbe nicht sehen. Dafür wird weißblondes Haar (Stufe 10) benötigt.'
      };
    }

    // Test 2: Direktzieher kann dunkles Haar nicht aufhellen
    if (mixBrightness > baseBrightness + 50 && baseBrightness < 160) {
      return {
        status: 'fail' as const,
        badge: 'Wird nicht funktionieren',
        title: 'Haar ist zu dunkel (keine Aufhellung)',
        text: 'Direktzieher enthalten kein Bleichmittel und können dunkles Haar nicht aufhellen! Diese helle Nuance wird auf dem dunklen Haar nicht sichtbar sein. Erst blondieren.'
      };
    }

    // Test 3: Blau auf gelbstichigem Haar -> Grünstich
    if (isBlueDominant && hasHairYellow) {
      return {
        status: 'warning' as const,
        badge: 'Achtung: Grünstich-Gefahr',
        title: 'Gelbstich im Haar erzeugt Grün',
        text: 'Dein Haar hat einen deutlichen Gelb- oder Goldstich. Gelb im Haar + Blau der Farbe ergibt physikalisch Grün! Für ein reines Blau muss das Haar platinblond sein oder mit etwas Rot-Pink/Violett neutralisiert werden.'
      };
    }

    // Test 4: Sehr dunkles Haar (Braun/Schwarz)
    if (baseBrightness < 100) {
      return {
        status: 'warning' as const,
        badge: 'Kaum sichtbar',
        title: 'Dunkle Haarbasis',
        text: 'Auf sehr dunklem Haar wirken Direktzieher meist nur als leichter Schimmer im Sonnenlicht.'
      };
    }

    // Erfolgsfall
    return {
      status: 'success' as const,
      badge: 'Klappt hervorragend',
      title: 'Haar ist hell genug',
      text: 'Die Ausgangshaarfarbe ist ideal für diese Farbmischung. Die Farbpigmente werden wie dargestellt zur Geltung kommen.'
    };
  };

  const evaluation = evaluateCompatibility();

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl text-white backdrop-blur-md space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div>
          <h3 className="text-base font-extrabold text-slate-100 m-0 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-400" />
            <span>Geschätzte Wirkung auf dem Haar</span>
          </h3>
          <div className="text-xs text-slate-400 mt-0.5">
            Auf Basis: <span className="text-slate-200 font-semibold">{baseHairLevelName}</span>
          </div>
        </div>

        <span
          className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
            evaluation.status === 'success'
              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
              : evaluation.status === 'warning'
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
              : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
          }`}
        >
          {evaluation.badge}
        </span>
      </div>

      {/* Die visuelle Formel: Farbe + Haarfarbe = Ergebnis */}
      <div className="bg-slate-950/70 p-4 rounded-2xl border border-slate-800/80">
        <div className="flex items-center justify-between gap-1 sm:gap-3 text-center">
          {/* 1. Farbmischung */}
          <div className="flex-1 space-y-1">
            <span className="text-[11px] font-semibold text-slate-300 block">Farbe</span>
            <div
              className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl border-2 border-white/20 shadow-md mx-auto transition-transform hover:scale-105"
              style={{ backgroundColor: bowlMixtureHex }}
              title={`Gemischte Farbe: ${bowlMixtureHex}`}
            />
            <span className="text-[10px] font-mono font-bold text-slate-300 block">
              {bowlMixtureHex.toUpperCase()}
            </span>
          </div>

          <div className="text-slate-500 font-extrabold text-lg flex items-center justify-center">
            <Plus className="w-5 h-5 text-slate-400" />
          </div>

          {/* 2. Ausgangshaar */}
          <div className="flex-1 space-y-1">
            <span className="text-[11px] font-semibold text-slate-300 block">Haarfarbe</span>
            <div
              className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl border-2 border-white/20 shadow-md mx-auto transition-transform hover:scale-105"
              style={{ backgroundColor: baseHairHex }}
              title={`Ausgangshaar: ${baseHairHex}`}
            />
            <span className="text-[10px] font-mono font-bold text-slate-300 block">
              {baseHairHex.toUpperCase()}
            </span>
          </div>

          <div className="text-slate-500 font-extrabold text-lg flex items-center justify-center">
            <Equal className="w-5 h-5 text-slate-400" />
          </div>

          {/* 3. Ergebnis auf Haar */}
          <div className="flex-1 space-y-1">
            <span className="text-[11px] font-bold text-emerald-400 block">Ergebnis</span>
            <div
              className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl border-2 border-emerald-400/50 shadow-lg mx-auto transition-transform hover:scale-105"
              style={{ backgroundColor: estimatedResultHex }}
              title={`Ergebnis auf dem Haar: ${estimatedResultHex}`}
            />
            <span className="text-[10px] font-mono font-bold text-emerald-300 block">
              {estimatedResultHex.toUpperCase()}
            </span>
          </div>
        </div>
      </div>

      {/* Hinweiskasten wenn es klappt oder wenn es nix wird */}
      <div
        className={`p-3.5 rounded-2xl border flex items-start gap-3 text-xs leading-relaxed ${
          evaluation.status === 'success'
            ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-200'
            : evaluation.status === 'warning'
            ? 'bg-amber-950/40 border-amber-500/30 text-amber-200'
            : 'bg-rose-950/40 border-rose-500/30 text-rose-200'
        }`}
      >
        {evaluation.status === 'success' ? (
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
        ) : (
          <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
        )}
        <div>
          <div className="font-bold text-white mb-0.5">{evaluation.title}</div>
          <p className="m-0 text-slate-300">{evaluation.text}</p>
        </div>
      </div>

      <div className="text-[11px] text-slate-400 italic bg-slate-950/40 p-2.5 rounded-xl border border-slate-800/80">
        💡 Direktzieher sind semi-transparent: Sie legen sich wie eine Folie um das Haar, hellen es jedoch niemals auf.
      </div>
    </div>
  );
};

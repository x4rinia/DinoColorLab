import React from 'react';
import { AlertTriangle, CheckCircle2, Plus, Equal, Sparkles } from 'lucide-react';
import { calculateResultOnHair, calculateDeltaE } from '../../engine/colorMath';
import type { CustomBaseHairColor } from '../../types';

interface HairImpactFormulaCardProps {
  dyeColorHex: string;
  baseHairHex: string;
  baseHairLevelName: string;
  baseHairData?: CustomBaseHairColor;
  estimatedResultHex?: string;
  isPastelMode?: boolean;
  conditionerRatio?: number;
}

export const HairImpactFormulaCard: React.FC<HairImpactFormulaCardProps> = ({
  dyeColorHex,
  baseHairHex,
  baseHairLevelName,
  baseHairData,
  estimatedResultHex,
  isPastelMode = false,
  conditionerRatio = 0.10
}) => {
  // Berechne das realistische Farbergebnis auf dem Haar
  const resultOnHair =
    estimatedResultHex || calculateResultOnHair(dyeColorHex, baseHairHex, conditionerRatio);

  // Analysiere, ob das Farbergebnis klappen wird oder ob es "nix wird"
  const evaluateCompatibility = () => {
    // 1. Ausgangshaar Helligkeit & Farbstich schätzen
    const baseR = parseInt(baseHairHex.slice(1, 3), 16) || 0;
    const baseG = parseInt(baseHairHex.slice(3, 5), 16) || 0;
    const baseB = parseInt(baseHairHex.slice(5, 7), 16) || 0;
    const baseBrightness = (baseR + baseG + baseB) / 3;

    // Ziel/Mischfarbe RGB
    const mixR = parseInt(dyeColorHex.slice(1, 3), 16) || 0;
    const mixG = parseInt(dyeColorHex.slice(3, 5), 16) || 0;
    const mixB = parseInt(dyeColorHex.slice(5, 7), 16) || 0;
    const mixBrightness = (mixR + mixG + mixB) / 3;

    const deltaE = calculateDeltaE(dyeColorHex, resultOnHair);
    const isDarkDye = mixBrightness < 45;
    const isPastel = isPastelMode || conditionerRatio > 0.60;
    const isPureConditioner = conditionerRatio >= 0.98;

    // Test 0: Reine Spülung
    if (isPureConditioner) {
      return {
        status: 'warning' as const,
        badge: 'Keine Farbveränderung',
        title: 'Reine Spülung (0% Pigmente)',
        text: 'Diese Mischung enthält keine Farbpigmente und verändert die Haarfarbe nicht. Sie dient zur Pflege oder als Basis.'
      };
    }

    // Spezifische Farbregeln für "Bereits gefärbtes Haar"
    if (baseHairData?.levelKey === 'already_dyed') {
      const baseIsRedOrPink = baseR > baseG + 30 && baseR > baseB + 15;
      const baseIsGreen = baseG > baseR + 25 && baseG > baseB + 15;
      const baseIsYellowOrange = baseR > 140 && baseG > 95 && baseB < 95;

      const dyeIsGreenCyan = mixG > mixR + 30 || (mixG > 100 && mixB > 100 && mixR < 80);
      const dyeIsBlue = mixB > mixR + 30 && mixB > mixG + 15;
      const dyeIsYellow = mixR > 180 && mixG > 160 && mixB < 90;
      const dyeIsRedPink = mixR > mixG + 40 && mixR > mixB + 15;

      // 1. Direktzieher hellen dunklere Haarbasis nicht auf
      if (mixBrightness > baseBrightness + 35 && baseBrightness < 170) {
        return {
          status: 'fail' as const,
          badge: 'Wird nicht sichtbar sein',
          title: 'Haarbasis zu dunkel für hellere Tönung',
          text: `Die vorhandene Haarfarbe (${baseHairHex.toUpperCase()}) ist dunkler als die gewünschte Nuance. Direktzieher enthalten kein Bleichmittel – die hellere Farbe wird nicht sichtbar sein.`
        };
      }

      // 2. Pastell auf gefärbtem Haar
      if (isPastel && baseBrightness < 200) {
        return {
          status: 'fail' as const,
          badge: 'Zu schwach pigmentiert',
          title: 'Pastelltöne überdecken vorhandene Farbe nicht',
          text: `Pastellnuancen sind stark mit Spülung verdünnt und transparent. Auf der vorhandenen Haarfarbe (${baseHairHex.toUpperCase()}) reicht die Pigmentkraft nicht aus.`
        };
      }

      // 3. Komplementärkontrast (Rot/Pink + Grün/Cyan)
      if ((baseIsRedOrPink && dyeIsGreenCyan) || (baseIsGreen && dyeIsRedPink)) {
        return {
          status: 'warning' as const,
          badge: 'Achtung: Komplementärkontrast',
          title: 'Farben neutralisieren sich zu Braun/Schlamm',
          text: `Rot und Grün/Cyan liegen sich im Farbkreis gegenüber. Die neue Nuance neutralisiert den vorhandenen Ton (${baseHairHex.toUpperCase()}) zu einem schlammigen Braun- oder Grauton.`
        };
      }

      // 4. Blau auf Rot -> Violett/Beere
      if (baseIsRedOrPink && dyeIsBlue) {
        return {
          status: 'success' as const,
          badge: 'Farbmischung: Violett',
          title: 'Bestehendes Rot + Blau ergibt Beerenton',
          text: `Das vorhandene Rot (${baseHairHex.toUpperCase()}) verbindet sich harmonisch mit dem blauen Pigment zu einem satten Violett- oder Beerenton.`
        };
      }

      // 5. Gelb auf Rot -> Orange/Kupfer
      if (baseIsRedOrPink && dyeIsYellow) {
        return {
          status: 'success' as const,
          badge: 'Farbmischung: Orange',
          title: 'Bestehendes Rot + Gelb ergibt Kupfer/Orange',
          text: `Das gelbe Pigment legt sich über das vorhandene Rot (${baseHairHex.toUpperCase()}) und verschiebt das Gesamtergebnis in ein warmes Kupfer oder feuriges Orange.`
        };
      }

      // 6. Blau auf Gelb/Orange -> Grün
      if (baseIsYellowOrange && dyeIsBlue) {
        return {
          status: 'warning' as const,
          badge: 'Achtung: Grünstich-Gefahr',
          title: 'Gelb/Orange + Blau erzeugt Grün/Petrol',
          text: `Auf der vorhandenen warmen Haarbasis (${baseHairHex.toUpperCase()}) reagiert Blau subtraktiv zu Türkis, Petrol oder Moosgrün.`
        };
      }

      // 7. Ton-in-Ton Auffrischung
      if (baseIsRedOrPink && dyeIsRedPink) {
        return {
          status: 'success' as const,
          badge: 'Ton-in-Ton Auffrischung',
          title: 'Intensivierung der bestehenden Farbe',
          text: `Die roten Pigmente frischen den vorhandenen Ton (${baseHairHex.toUpperCase()}) auf und verleihen maximale Sättigung und Leuchtkraft.`
        };
      }
    }

    // Test 1: Dunkle, kräftige Farben (wie Tiefschwarz, Dunkelbraun, Midnight Blue)
    if (isDarkDye && !isPastel) {
      return {
        status: 'success' as const,
        badge: 'Klappt hervorragend',
        title: 'Hohe Deckkraft',
        text: 'Kräftige und dunkle Direktzieher besitzen eine dichte Pigmentierung und färben diese Haarbasis deckend und satt.'
      };
    }

    // Test 2: Pastelltöne auf dunklerem Haar
    if (isPastel && baseBrightness < 215) {
      return {
        status: 'fail' as const,
        badge: 'Wird nicht funktionieren',
        title: 'Zu dunkles Haar für Pastelltöne',
        text: 'Pastelltöne sind stark mit Spülung verdünnt und extrem transparent. Auf dunklerem Haar (unter Stufe 9–10) ist das Pigment kaum bis gar nicht sichtbar. Hierfür ist hellblondes bis weißblondes Haar erforderlich.'
      };
    }

    // Test 3: Direktzieher kann dunkles Haar nicht aufhellen
    if (mixBrightness > baseBrightness + 35 && baseBrightness < 180) {
      return {
        status: 'fail' as const,
        badge: 'Wird nicht funktionieren',
        title: 'Haar ist zu dunkel (keine Aufhellung)',
        text: 'Direktzieher enthalten kein Bleichmittel und können dunkles Haar niemals aufhellen! Diese helle Nuance wird auf dem dunkleren Haar nicht sichtbar sein. Erst auf die gewünschte Stufe blondieren.'
      };
    }

    // Test 4: Blau auf gelbstichigem Haar -> Grünstich-Gefahr
    const isBlueDominant = mixB > mixR + 30 && mixB > mixG + 15;
    const hasWarmYellowHair = baseR > baseB + 35 && baseG > baseB + 20;
    if (isBlueDominant && hasWarmYellowHair) {
      return {
        status: 'warning' as const,
        badge: 'Achtung: Grünstich-Gefahr',
        title: 'Gelb-/Goldstich im Haar erzeugt Grün',
        text: 'Blau auf warmblondem Haar reagiert subtraktiv zu Grün oder Petrol. Für ein kühles, reines Blau muss das Haar platinblond sein oder der Gelbstich mit einem Hauch Violett/Rot-Pink neutralisiert werden.'
      };
    }

    // Test 5: Sehr dunkles Haar (Stufe 4 Dunkelbraun/Schwarz) bei nicht-dunkler Farbe
    if (baseBrightness < 80 && mixBrightness > 50) {
      return {
        status: 'warning' as const,
        badge: 'Kaum sichtbar',
        title: 'Dunkle Haarbasis',
        text: 'Auf sehr dunklem Haar wirken bunte Direktzieher meist nur als dezenter Schimmer im direkten Sonnenlicht.'
      };
    }

    // Test 6: Spürbare Farbabweichung durch den Haaruntergrund
    if (deltaE > 25) {
      return {
        status: 'warning' as const,
        badge: 'Farbabweichung erwartet',
        title: 'Haarbasis beeinflusst das Ergebnis',
        text: 'Die Eigenpigmente deines Haars scheinen durch die Tönung hindurch. Das Farbergebnis wird wärmer oder gedämpfter ausfallen als die reine Farbmischung.'
      };
    }

    // Erfolgsfall
    return {
      status: 'success' as const,
      badge: 'Klappt hervorragend',
      title: 'Ideale Ausgangshaarfarbe',
      text: 'Die Ausgangshaarfarbe bietet einen guten Untergrund für diese Farbmischung. Die Farbpigmente werden gut zur Geltung kommen.'
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
          <div className="text-xs text-slate-400 mt-1 flex items-center gap-1.5 flex-wrap">
            <span>Auf Basis:</span>
            <span className="inline-flex items-center gap-1.5 bg-slate-800/90 px-2.5 py-0.5 rounded-lg border border-slate-700 text-slate-200 font-semibold shadow-sm">
              <span
                className="w-3 h-3 rounded-full border border-white/30 shrink-0 shadow-inner"
                style={{ backgroundColor: baseHairHex }}
              />
              <span>{baseHairLevelName}</span>
            </span>
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
          {/* 1. Farbmischung / Wunschfarbe */}
          <div className="flex-1 space-y-1">
            <span className="text-[11px] font-semibold text-slate-300 block">Farbe</span>
            <div
              className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl border-2 border-white/20 shadow-md mx-auto transition-transform hover:scale-105"
              style={{ backgroundColor: dyeColorHex }}
              title={`Eingestellte Farbe: ${dyeColorHex}`}
            />
            <span className="text-[10px] font-mono font-bold text-slate-300 block">
              {dyeColorHex.toUpperCase()}
            </span>
          </div>

          <div className="text-slate-500 font-extrabold text-lg flex items-center justify-center">
            <Plus className="w-5 h-5 text-slate-400" />
          </div>

          {/* 2. Ausgangshaar */}
          <div className="flex-1 space-y-1">
            <span
              className="text-[11px] font-semibold text-slate-300 block truncate"
              title={baseHairData?.notes ? `Haarfarbe (${baseHairData.notes})` : 'Haarfarbe'}
            >
              {baseHairData?.levelKey === 'already_dyed'
                ? `Haar (${baseHairData.notes || 'gefärbt'})`
                : 'Haarfarbe'}
            </span>
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
            <span
              className={`text-[11px] font-bold block ${
                evaluation.status === 'success'
                  ? 'text-emerald-400'
                  : evaluation.status === 'warning'
                  ? 'text-amber-400'
                  : 'text-rose-400'
              }`}
            >
              Ergebnis
            </span>
            <div
              className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl border-2 shadow-lg mx-auto transition-transform hover:scale-105 ${
                evaluation.status === 'success'
                  ? 'border-emerald-400/50'
                  : evaluation.status === 'warning'
                  ? 'border-amber-400/50'
                  : 'border-rose-400/50'
              }`}
              style={{ backgroundColor: resultOnHair }}
              title={`Ergebnis auf dem Haar: ${resultOnHair}`}
            />
            <span
              className={`text-[10px] font-mono font-bold block ${
                evaluation.status === 'success'
                  ? 'text-emerald-300'
                  : evaluation.status === 'warning'
                  ? 'text-amber-300'
                  : 'text-rose-300'
              }`}
            >
              {resultOnHair.toUpperCase()}
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

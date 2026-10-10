import React from 'react';
import { SMALL_PORTION_VOLUME_PRESETS } from '../../engine/unitConversions';
import { Scale, Droplet, Sparkles } from 'lucide-react';

interface BatchSettingsProps {
  totalBatchGrams: number;
  maxConditionerRatioPercent: number;
  onChangeBatchGrams: (grams: number) => void;
  onChangeConditionerRatio: (percent: number) => void;
}

export const BatchSettings: React.FC<BatchSettingsProps> = ({
  totalBatchGrams,
  maxConditionerRatioPercent,
  onChangeBatchGrams,
  onChangeConditionerRatio
}) => {
  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 shadow-xl text-white backdrop-blur-md space-y-5">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <h2 className="text-base font-bold flex items-center gap-2 text-slate-100 m-0">
          <Scale className="w-4 h-4 text-cyan-400" />
          <span>Menge & Spülungsanteil</span>
        </h2>
        <span className="text-xs text-slate-400 font-medium">Pony, Sidecut & Strähnen</span>
      </div>

      {/* Kleine Mengen für Pony und Sidecut */}
      <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Menge für kleine Partien (Pony, Sidecut)</span>
          </label>
          <span className="text-sm font-mono font-extrabold text-cyan-300">
            {totalBatchGrams} ml / g
          </span>
        </div>

        {/* Portionsgrößen: 2,5 ml, 5 ml (Standard), 10 ml, 15 ml, 20 ml, Freie Eingabe */}
        <div className="flex flex-wrap items-center gap-2">
          {SMALL_PORTION_VOLUME_PRESETS.map((p) => {
            const active = Math.abs(totalBatchGrams - p.defaultGrams) < 0.2;
            return (
              <button
                key={p.id}
                onClick={() => onChangeBatchGrams(p.defaultGrams)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
                  active
                    ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-md font-extrabold scale-105'
                    : 'bg-slate-800/80 text-slate-300 hover:text-white border-slate-700 hover:border-slate-600'
                }`}
                title={p.description}
              >
                {p.label}
              </button>
            );
          })}

          <div className="flex items-center gap-1.5 ml-auto">
            <span className="text-xs text-slate-400">Frei:</span>
            <input
              type="number"
              min="1"
              max="200"
              step="0.5"
              value={totalBatchGrams}
              onChange={(e) => onChangeBatchGrams(Math.max(1, parseFloat(e.target.value) || 1))}
              className="w-16 bg-slate-900 border border-slate-700 rounded-xl px-2 py-1 text-xs text-center font-mono text-cyan-300 focus:outline-none focus:border-cyan-500"
            />
            <span className="text-xs text-slate-400 font-mono">ml/g</span>
          </div>
        </div>

        <p className="text-[11px] text-slate-400 leading-relaxed bg-slate-900/50 p-2.5 rounded-xl border border-slate-800/80">
          💡 <strong>5 ml</strong> ist der ideale Standardwert für einen Pony, Sidecut oder Testbereich.
          Die tatsächlich benötigte Menge hängt von Haardicke, Dichte und Schnitt ab.
        </p>
      </div>

      {/* Spülungsregler / Pastell-Einstellung */}
      <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <Droplet className="w-3.5 h-3.5 text-white" />
            <span>Spülungsanteil (Pastell vs. Kräftig)</span>
          </label>
          <span className="text-sm font-mono font-bold text-white">
            {maxConditionerRatioPercent}% Spülung
          </span>
        </div>

        <input
          type="range"
          min="0"
          max="95"
          step="5"
          value={maxConditionerRatioPercent}
          onChange={(e) => onChangeConditionerRatio(parseInt(e.target.value))}
          className="w-full accent-cyan-400 h-2 bg-slate-800 rounded-lg cursor-pointer"
        />

        {/* Quick presets for pastel/vivid */}
        <div className="flex items-center justify-between gap-1.5 pt-1">
          {[
            { label: 'Kräftig (0%)', val: 0 },
            { label: 'Mittel (40%)', val: 40 },
            { label: 'Pastell (75%)', val: 75 },
            { label: 'Sehr zart (90%)', val: 90 }
          ].map((item) => (
            <button
              key={item.val}
              type="button"
              onClick={() => onChangeConditionerRatio(item.val)}
              className={`px-2 py-1 rounded-lg text-[10px] font-semibold transition-all ${
                maxConditionerRatioPercent === item.val
                  ? 'bg-slate-200 text-slate-950 font-bold'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <p className="text-[11px] text-slate-500 italic">
          0% = kräftige Vollfarbe aus reinen Pigmenten. Höhere Werte hellen die Nuance mit weißer Spülung auf.
        </p>
      </div>
    </div>
  );
};

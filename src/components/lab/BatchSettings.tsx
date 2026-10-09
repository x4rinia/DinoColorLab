import React from 'react';
import type { PigmentProfile, ConditionerProfile } from '../../types';
import { Sliders, Droplet, Scale } from 'lucide-react';

interface BatchSettingsProps {
  pigments: PigmentProfile[];
  conditioners: ConditionerProfile[];
  selectedCyanId: number;
  selectedMagentaId: number;
  selectedYellowId: number;
  selectedConditionerId?: number;
  totalBatchGrams: number;
  maxConditionerRatioPercent: number;
  onSelectCyan: (id: number) => void;
  onSelectMagenta: (id: number) => void;
  onSelectYellow: (id: number) => void;
  onSelectConditioner: (id?: number) => void;
  onChangeBatchGrams: (grams: number) => void;
  onChangeConditionerRatio: (percent: number) => void;
}

export const BatchSettings: React.FC<BatchSettingsProps> = ({
  pigments,
  conditioners,
  selectedCyanId,
  selectedMagentaId,
  selectedYellowId,
  selectedConditionerId,
  totalBatchGrams,
  maxConditionerRatioPercent,
  onSelectCyan,
  onSelectMagenta,
  onSelectYellow,
  onSelectConditioner,
  onChangeBatchGrams,
  onChangeConditionerRatio
}) => {
  const cyanOptions = pigments.filter((p) => p.colorGroup === 'cyan');
  const magentaOptions = pigments.filter((p) => p.colorGroup === 'magenta');
  const yellowOptions = pigments.filter((p) => p.colorGroup === 'yellow');

  const presetGramSizes = [30, 50, 100, 150];

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 shadow-xl text-white backdrop-blur-md space-y-5">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <h2 className="text-base font-bold flex items-center gap-2 text-slate-100 m-0">
          <Sliders className="w-4 h-4 text-cyan-400" />
          <span>Pigmente & Mischmenge</span>
        </h2>
        <span className="text-xs text-slate-400 font-medium">Rezeptur-Parameter</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-slate-950/60 p-3 rounded-2xl border border-cyan-500/30">
          <label className="block text-xs font-semibold text-cyan-300 mb-1 flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
            <span>Cyan-Pigment</span>
          </label>
          <select
            value={selectedCyanId}
            onChange={(e) => onSelectCyan(parseInt(e.target.value))}
            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
          >
            {cyanOptions.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} {p.isDemo ? '(DEMO)' : ''}
              </option>
            ))}
          </select>
        </div>

        <div className="bg-slate-950/60 p-3 rounded-2xl border border-fuchsia-500/30">
          <label className="block text-xs font-semibold text-fuchsia-300 mb-1 flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-fuchsia-400" />
            <span>Magenta-Pigment</span>
          </label>
          <select
            value={selectedMagentaId}
            onChange={(e) => onSelectMagenta(parseInt(e.target.value))}
            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-fuchsia-500"
          >
            {magentaOptions.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} {p.isDemo ? '(DEMO)' : ''}
              </option>
            ))}
          </select>
        </div>

        <div className="bg-slate-950/60 p-3 rounded-2xl border border-amber-500/30">
          <label className="block text-xs font-semibold text-amber-300 mb-1 flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
            <span>Gelb-Pigment</span>
          </label>
          <select
            value={selectedYellowId}
            onChange={(e) => onSelectYellow(parseInt(e.target.value))}
            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
          >
            {yellowOptions.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} {p.isDemo ? '(DEMO)' : ''}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-slate-950/40 p-3 rounded-2xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Droplet className="w-4 h-4 text-purple-400" />
          <span className="text-xs font-semibold text-slate-300">Pigmentfreie Haarspülung:</span>
        </div>
        <select
          value={selectedConditionerId || ''}
          onChange={(e) => onSelectConditioner(e.target.value ? parseInt(e.target.value) : undefined)}
          className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
        >
          {conditioners.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name} {c.isDemo ? '(DEMO)' : ''}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Scale className="w-3.5 h-3.5 text-cyan-400" />
              <span>Gesamtmenge (Gramm)</span>
            </label>
            <span className="text-sm font-mono font-bold text-cyan-300">{totalBatchGrams} g</span>
          </div>

          <div className="flex items-center gap-2">
            {presetGramSizes.map((g) => (
              <button
                key={g}
                onClick={() => onChangeBatchGrams(g)}
                className={`px-2.5 py-1 rounded-xl text-xs font-semibold transition-all ${
                  totalBatchGrams === g
                    ? 'bg-cyan-500 text-slate-950 font-extrabold'
                    : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {g}g
              </button>
            ))}
            <input
              type="number"
              min="5"
              max="500"
              value={totalBatchGrams}
              onChange={(e) => onChangeBatchGrams(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-16 bg-slate-900 border border-slate-700 rounded-xl px-2 py-1 text-xs text-center font-mono text-cyan-300"
            />
          </div>
        </div>

        <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Droplet className="w-3.5 h-3.5 text-purple-400" />
              <span>Max. Spülungsanteil (Pastell-Grad)</span>
            </label>
            <span className="text-sm font-mono font-bold text-purple-300">{maxConditionerRatioPercent}%</span>
          </div>

          <input
            type="range"
            min="0"
            max="95"
            step="5"
            value={maxConditionerRatioPercent}
            onChange={(e) => onChangeConditionerRatio(parseInt(e.target.value))}
            className="w-full accent-purple-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
};

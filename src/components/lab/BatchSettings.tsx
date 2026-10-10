import React from 'react';
import type { PigmentProfile, ConditionerProfile } from '../../types';
import { TEST_STRAND_VOLUME_PRESETS } from '../../engine/unitConversions';
import { Palette, Droplet, Scale } from 'lucide-react';

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

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 shadow-xl text-white backdrop-blur-md space-y-5">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <h2 className="text-base font-bold flex items-center gap-2 text-slate-100 m-0">
          <Palette className="w-4 h-4 text-cyan-400" />
          <span>Meine Grundfarben & weiße Spülung</span>
        </h2>
        <span className="text-xs text-slate-400 font-medium">Rezeptur-Basis</span>
      </div>

      {/* 3 Primary Colors */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Blau (formerly Cyan) */}
        <div className="bg-slate-950/60 p-3 rounded-2xl border border-blue-500/30">
          <label className="block text-xs font-semibold text-blue-300 mb-1 flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-sm" />
            <span>Blau</span>
          </label>
          <select
            value={selectedCyanId}
            onChange={(e) => onSelectCyan(parseInt(e.target.value))}
            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
          >
            {cyanOptions.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} {p.isDemo ? '(DEMO)' : ''}
              </option>
            ))}
          </select>
          <span className="text-[10px] text-slate-500 block mt-1">Echtes Blau (nicht türkis)</span>
        </div>

        {/* Rot-Pink (formerly Magenta) */}
        <div className="bg-slate-950/60 p-3 rounded-2xl border border-rose-500/30">
          <label className="block text-xs font-semibold text-rose-300 mb-1 flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-sm" />
            <span>Rot-Pink</span>
          </label>
          <select
            value={selectedMagentaId}
            onChange={(e) => onSelectMagenta(parseInt(e.target.value))}
            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-rose-500"
          >
            {magentaOptions.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} {p.isDemo ? '(DEMO)' : ''}
              </option>
            ))}
          </select>
          <span className="text-[10px] text-slate-500 block mt-1">Kühles pinkstichiges Rot</span>
        </div>

        {/* Gelb */}
        <div className="bg-slate-950/60 p-3 rounded-2xl border border-amber-500/30">
          <label className="block text-xs font-semibold text-amber-300 mb-1 flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-sm" />
            <span>Gelb</span>
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
          <span className="text-[10px] text-slate-500 block mt-1">Klares leuchtendes Gelb</span>
        </div>
      </div>

      {/* Weiße Spülung (Pure white #FFFFFF without purple tint) */}
      <div className="bg-slate-950/60 p-3 rounded-2xl border border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-5 h-5 rounded-full bg-white border border-slate-400 shadow-sm flex items-center justify-center shrink-0">
            <Droplet className="w-3 h-3 text-slate-600" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-200 block">Weiße Spülung (#FFFFFF):</span>
            <span className="text-[10px] text-slate-400">Neutrale Verdünnung ohne Eigenpigmente</span>
          </div>
        </div>
        <select
          value={selectedConditionerId || ''}
          onChange={(e) => onSelectConditioner(e.target.value ? parseInt(e.target.value) : undefined)}
          className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
        >
          {conditioners.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name} {c.isDemo ? '(DEMO)' : ''}
            </option>
          ))}
        </select>
      </div>

      {/* Batch Size & Dilution Slider */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Menge für eine Teststrähne */}
        <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800 space-y-2.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Scale className="w-3.5 h-3.5 text-cyan-400" />
              <span>Menge für eine Teststrähne</span>
            </label>
            <span className="text-sm font-mono font-bold text-cyan-300">{totalBatchGrams} g</span>
          </div>

          {/* Presets: 2,5 ml, 5 ml (Standard), 10 ml, 15 ml, 25 ml, Freie Eingabe */}
          <div className="flex flex-wrap items-center gap-1.5">
            {TEST_STRAND_VOLUME_PRESETS.map((p) => {
              const active = Math.abs(totalBatchGrams - p.defaultGrams) < 0.2;
              return (
                <button
                  key={p.id}
                  onClick={() => onChangeBatchGrams(p.defaultGrams)}
                  className={`px-2 py-1 rounded-xl text-xs font-semibold transition-all ${
                    active
                      ? 'bg-cyan-500 text-slate-950 font-extrabold shadow-sm'
                      : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                  title={p.description}
                >
                  {p.label}
                </button>
              );
            })}
            <div className="flex items-center gap-1 ml-auto">
              <input
                type="number"
                min="1"
                max="500"
                step="0.5"
                value={totalBatchGrams}
                onChange={(e) => onChangeBatchGrams(Math.max(1, parseFloat(e.target.value) || 1))}
                className="w-16 bg-slate-900 border border-slate-700 rounded-xl px-2 py-1 text-xs text-center font-mono text-cyan-300"
              />
              <span className="text-[10px] text-slate-400 font-mono">g</span>
            </div>
          </div>
          <span className="text-[10px] text-slate-500 block">
            * 1 ml entspricht ca. 1,0 g bei Standard-Haarspülungen. Primäre Berechnung exakt in Gramm.
          </span>
        </div>

        {/* Max. Spülungsanteil */}
        <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800 space-y-2.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Droplet className="w-3.5 h-3.5 text-slate-200" />
              <span>Max. Spülungsanteil (Pastell-Grad)</span>
            </label>
            <span className="text-sm font-mono font-bold text-white">{maxConditionerRatioPercent}%</span>
          </div>

          <input
            type="range"
            min="0"
            max="95"
            step="5"
            value={maxConditionerRatioPercent}
            onChange={(e) => onChangeConditionerRatio(parseInt(e.target.value))}
            className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
          />
          <span className="text-[10px] text-slate-500 block">
            Höherer Anteil = hellere Pastellfarben. 0% = reine Direktzieher-Pigmente.
          </span>
        </div>
      </div>
    </div>
  );
};

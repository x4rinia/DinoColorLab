import React from 'react';
import type { CustomBaseHairColor, BaseHairColorLevel } from '../../types';
import { BASE_HAIR_COLORS } from '../../engine/colorMath';
import { Info, Sparkles } from 'lucide-react';

interface BaseHairSelectorProps {
  value: CustomBaseHairColor;
  onChange: (newValue: CustomBaseHairColor) => void;
}

export const BaseHairSelector: React.FC<BaseHairSelectorProps> = ({ value, onChange }) => {
  const options = Object.values(BASE_HAIR_COLORS);

  const handleSelectLevel = (key: BaseHairColorLevel) => {
    const option = BASE_HAIR_COLORS[key];
    onChange({
      levelKey: key,
      hex: option?.hex || value.hex,
      notes: value.notes
    });
  };

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 shadow-xl text-white backdrop-blur-md">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base font-bold flex items-center gap-2 text-slate-100 m-0">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>Ausgangshaarfarbe</span>
        </h2>
        <span className="text-xs text-slate-400 font-medium">Haarbasis für Farbschätzung</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {options.map((option) => {
          const isSelected = value.levelKey === option.key;
          return (
            <button
              key={option.key}
              onClick={() => handleSelectLevel(option.key as BaseHairColorLevel)}
              className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                isSelected
                  ? 'bg-slate-800 border-cyan-500 shadow-md shadow-cyan-500/10'
                  : 'bg-slate-950/50 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <span
                  className="w-6 h-6 rounded-full border border-white/30 shrink-0 shadow-inner relative overflow-hidden ring-1 ring-black/40"
                  style={{
                    backgroundColor: option.hex,
                    backgroundImage: 'linear-gradient(135deg, rgba(255,255,255,0.22) 0%, rgba(0,0,0,0.18) 100%)'
                  }}
                />
                {isSelected && <span className="text-[10px] font-extrabold text-cyan-400 uppercase">Aktiv</span>}
              </div>
              <div className="text-xs font-semibold leading-tight text-slate-200">{option.name}</div>
            </button>
          );
        })}
      </div>

      {value.levelKey === 'already_dyed' && (
        <div className="mt-4 pt-3 border-t border-slate-800 flex items-center gap-4 bg-slate-950/60 p-3 rounded-2xl border border-slate-800">
          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-slate-400">Vorhandener Farbton:</label>
            <input
              type="color"
              value={value.hex}
              onChange={(e) => onChange({ ...value, hex: e.target.value })}
              className="w-8 h-8 rounded-lg border border-slate-700 bg-slate-900 cursor-pointer p-0.5"
            />
            <span className="text-xs font-mono text-cyan-300">{value.hex.toUpperCase()}</span>
          </div>

          <div className="flex-1">
            <input
              type="text"
              placeholder="Notizen zur Ausgangsfarbe (z. B. 'ausgewaschenes Pastellrosa')..."
              value={value.notes || ''}
              onChange={(e) => onChange({ ...value, notes: e.target.value })}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
            />
          </div>
        </div>
      )}

      <div className="mt-3 flex items-start gap-2 text-[11px] text-slate-400 bg-slate-950/40 p-2.5 rounded-xl border border-slate-800/80">
        <Info className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
        <span>
          <strong>Hinweis:</strong> Dunklere oder warme Haarbasen dämpfen kühle Pigmente (Cyan/Violett). Für kalibrierte Vorhersagen wird eine passende Teststrähne benötigt.
        </span>
      </div>
    </div>
  );
};

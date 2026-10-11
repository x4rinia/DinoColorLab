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
    const newHex =
      key === 'already_dyed'
        ? (value.levelKey === 'already_dyed'
            ? value.hex
            : value.hex && !options.some((o) => o.key !== 'already_dyed' && o.hex === value.hex)
            ? value.hex
            : '#AD5283')
        : (option?.hex || value.hex);

    onChange({
      levelKey: key,
      hex: newHex,
      notes: key === 'already_dyed' && !value.notes ? 'rot' : value.notes
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
          const isAlreadyDyed = option.key === 'already_dyed';

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
                  style={
                    isAlreadyDyed
                      ? {
                          background:
                            'conic-gradient(from 0deg, #ec4899 0%, #8b5cf6 16%, #3b82f6 33%, #10b981 50%, #eab308 66%, #f97316 83%, #ec4899 100%)'
                        }
                      : {
                          backgroundColor: option.hex,
                          backgroundImage:
                            'linear-gradient(135deg, rgba(255,255,255,0.22) 0%, rgba(0,0,0,0.18) 100%)'
                        }
                  }
                  title={isAlreadyDyed ? 'Bereits gefärbt (Bunt / Eigener Farbton)' : option.name}
                />
                {isSelected && <span className="text-[10px] font-extrabold text-cyan-400 uppercase">Aktiv</span>}
              </div>
              <div className="text-xs font-semibold leading-tight text-slate-200">{option.name}</div>
            </button>
          );
        })}
      </div>

      {value.levelKey === 'already_dyed' && (
        <div className="mt-4 pt-3 border-t border-slate-800 space-y-3 bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <label className="text-xs font-semibold text-slate-300">Vorhandener Farbton:</label>
              <input
                type="color"
                value={value.hex}
                onChange={(e) => onChange({ ...value, hex: e.target.value })}
                className="w-8 h-8 rounded-lg border border-slate-700 bg-slate-900 cursor-pointer p-0.5"
              />
              <span className="text-xs font-mono font-bold text-cyan-300">{value.hex.toUpperCase()}</span>
            </div>

            {/* Farb-Schnellauswahl für typische bereits gefärbte Nuancen */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] text-slate-500">Schnellauswahl:</span>
              {[
                { name: 'rot', hex: '#AD5283' },
                { name: 'kupfer', hex: '#d97706' },
                { name: 'pink', hex: '#ec4899' },
                { name: 'violett', hex: '#8b5cf6' },
                { name: 'blau', hex: '#3b82f6' },
                { name: 'türkis', hex: '#06b6d4' }
              ].map((preset) => (
                <button
                  key={preset.hex}
                  type="button"
                  onClick={() => onChange({ ...value, hex: preset.hex, notes: preset.name })}
                  className={`px-2 py-0.5 rounded-lg text-[10px] font-semibold border flex items-center gap-1 transition-all ${
                    value.hex.toLowerCase() === preset.hex.toLowerCase()
                      ? 'border-cyan-400 bg-cyan-950/60 text-cyan-200'
                      : 'border-slate-800 bg-slate-900/80 hover:border-slate-600 text-slate-300'
                  }`}
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full border border-white/20 shrink-0"
                    style={{ backgroundColor: preset.hex }}
                  />
                  <span>{preset.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1">
            <input
              type="text"
              placeholder="Notizen zur Ausgangsfarbe (z. B. 'rot', 'ausgewaschenes Pastellrosa')..."
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
          <strong>Hinweis:</strong> Bei bereits gefärbtem Haar überlagern sich die neuen Pigmente mit den vorhandenen Farbresten. Die Farbwirkung wird in der Schätzung exakt berücksichtigt.
        </span>
      </div>
    </div>
  );
};

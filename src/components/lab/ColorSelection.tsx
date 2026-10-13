import React, { useState } from 'react';
import { hexToCmy, cmyToHex } from '../../engine/colorMath';
import { ImageColorPicker } from '../common/ImageColorPicker';
import { Pipette, Sparkles } from 'lucide-react';

export type ColorStyleCategory = 'pastell' | 'kraeftig' | 'dunkel' | 'grau_schwarz' | 'natur';

interface StyleConfig {
  id: ColorStyleCategory;
  name: string;
  icon: string;
  desc: string;
  presets: { name: string; hex: string }[];
}

export const COLOR_STYLES: StyleConfig[] = [
  {
    id: 'pastell',
    name: 'Pastell',
    icon: '🌸',
    desc: 'Zarte, helle Töne mit hohem Spülungsanteil zum Aufhellen',
    presets: [
      { name: 'Babyblau', hex: '#93c5fd' },
      { name: 'Pastellrosa', hex: '#f472b6' },
      { name: 'Flieder', hex: '#c084fc' },
      { name: 'Mintgrün', hex: '#6ee7b7' },
      { name: 'Pastellgelb', hex: '#fef08a' },
      { name: 'Pfirsich', hex: '#fdba74' }
    ]
  },
  {
    id: 'kraeftig',
    name: 'Kräftig / Bunt',
    icon: '💎',
    desc: 'Leuchtende Knallfarben mit etwas Spülung zum Strecken & Pflegen',
    presets: [
      { name: 'Echtes Blau', hex: '#1d4ed8' },
      { name: 'Pinkstichiges Rot', hex: '#e01a69' },
      { name: 'Sonnengelb', hex: '#facc15' },
      { name: 'Smaragdgrün', hex: '#10b981' },
      { name: 'Purpurviolett', hex: '#7e22ce' },
      { name: 'Warmrot / Kupfer', hex: '#dc2626' }
    ]
  },
  {
    id: 'dunkel',
    name: 'Dunkel',
    icon: '🌑',
    desc: 'Tiefe, satte Töne (leichte Streckspülung, 0% bei Schwarz)',
    presets: [
      { name: 'Mitternachtsblau', hex: '#1e3a8a' },
      { name: 'Dunkelviolett', hex: '#4c1d95' },
      { name: 'Weinrot / Beere', hex: '#881337' },
      { name: 'Tannengrün', hex: '#064e3b' },
      { name: 'Dunkles Petrol', hex: '#164e63' }
    ]
  },
  {
    id: 'grau_schwarz',
    name: 'Grau & Schwarz',
    icon: '🌪️',
    desc: 'Aschige Grautöne (mit Spülung) bis Tiefschwarz (0% Spülung)',
    presets: [
      { name: 'Silbergrau', hex: '#94a3b8' },
      { name: 'Aschgrau', hex: '#64748b' },
      { name: 'Anthrazit', hex: '#334155' },
      { name: 'Blauschwarz', hex: '#0f172a' },
      { name: 'Graphit', hex: '#1e293b' }
    ]
  },
  {
    id: 'natur',
    name: 'Natürliche Töne',
    icon: '🌾',
    desc: 'Nuancierte Naturtöne wie Sand, Karamell & Braun',
    presets: [
      { name: 'Sandblond', hex: '#d6c7af' },
      { name: 'Honigblond', hex: '#d97706' },
      { name: 'Karamell', hex: '#b45309' },
      { name: 'Kastanienbraun', hex: '#78350f' },
      { name: 'Schokobraun', hex: '#451a03' }
    ]
  }
];

interface ColorSelectionProps {
  targetHex: string;
  onChangeColor: (hex: string) => void;
  selectedStyle: ColorStyleCategory;
  onSelectStyle: (style: ColorStyleCategory) => void;
}

export const ColorSelection: React.FC<ColorSelectionProps> = ({
  targetHex,
  onChangeColor,
  selectedStyle,
  onSelectStyle
}) => {
  const [showImagePicker, setShowImagePicker] = useState(false);
  const cmy = hexToCmy(targetHex);
  const pigmentPercent = {
    r: Math.round(cmy.m * 100), // Pinkstichiges Rot (Magenta)
    g: Math.round(cmy.y * 100), // Gelb (Yellow)
    b: Math.round(cmy.c * 100)  // Blau (Cyan)
  };

  const activeStyleConfig = COLOR_STYLES.find((s) => s.id === selectedStyle) || COLOR_STYLES[0];

  const handleHexInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (/^#[0-9A-Fa-f]{6}$/.test(val)) {
      onChangeColor(val);
    } else if (/^[0-9A-Fa-f]{6}$/.test(val)) {
      onChangeColor(`#${val}`);
    }
  };

  const handlePigmentChange = (channel: 'r' | 'g' | 'b', percent: number) => {
    const norm = Math.max(0, Math.min(100, percent)) / 100;
    let newC = cmy.c;
    let newM = cmy.m;
    let newY = cmy.y;
    if (channel === 'r') newM = norm;
    if (channel === 'g') newY = norm;
    if (channel === 'b') newC = norm;
    onChangeColor(cmyToHex(newC, newM, newY));
  };

  const handleNativeEyeDropper = async () => {
    // @ts-ignore
    if (window.EyeDropper) {
      try {
        // @ts-ignore
        const eyeDropper = new window.EyeDropper();
        const result = await eyeDropper.open();
        if (result.sRGBHex) {
          onChangeColor(result.sRGBHex);
        }
      } catch {
        // User cancelled
      }
    } else {
      setShowImagePicker(true);
    }
  };

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 shadow-xl text-white backdrop-blur-md space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold flex items-center gap-2 text-slate-100 m-0">
            <Sparkles className="w-5 h-5 text-blue-400" />
            <span>Wunschfarbe & Nuancen-Stil</span>
          </h2>
          <span className="text-xs text-slate-400">
            Feste Färbeschalen-Portion (40 ml)
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleNativeEyeDropper}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-blue-300 border border-blue-500/30 rounded-xl text-xs font-semibold transition-all"
            title="Farbe vom Bildschirm oder Bild auslesen"
          >
            <Pipette className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Pipette</span>
          </button>

          <button
            onClick={() => setShowImagePicker(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 rounded-xl text-xs font-semibold transition-all"
          >
            <span>Bild-Upload</span>
          </button>
        </div>
      </div>

      {/* Nuancen-Stil Auswahl: Pastell, Kräftig, Dunkel, Grau/Schwarz, Natürlich */}
      <div className="space-y-2 bg-slate-950/60 p-3 rounded-2xl border border-slate-800">
        <label className="text-xs font-semibold text-slate-300 block">
          Gewünschter Nuancen-Stil:
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-1.5">
          {COLOR_STYLES.map((style) => {
            const isActive = selectedStyle === style.id;
            return (
              <button
                key={style.id}
                type="button"
                onClick={() => {
                  onSelectStyle(style.id);
                  // Automatischer Wechsel auf das erste Preset dieses Stils
                  if (style.presets.length > 0) {
                    onChangeColor(style.presets[0].hex);
                  }
                }}
                className={`flex flex-col items-center justify-center p-2 rounded-xl text-xs font-bold transition-all border ${
                  isActive
                    ? 'bg-blue-600 text-white border-blue-400 shadow-md scale-102'
                    : 'bg-slate-900/80 text-slate-300 hover:text-white border-slate-800 hover:border-slate-700'
                }`}
              >
                <span className="text-base mb-0.5">{style.icon}</span>
                <span className="truncate">{style.name}</span>
              </button>
            );
          })}
        </div>

        {/* Schnellauswahl Farbtöne für den gewählten Stil */}
        <div className="pt-2">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] text-slate-400">
              Beispielfarben für <strong>{activeStyleConfig.name}</strong>:
            </span>
            <span className="text-[10px] text-slate-500 italic">
              {activeStyleConfig.desc}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {activeStyleConfig.presets.map((preset) => (
              <button
                key={preset.hex}
                type="button"
                onClick={() => onChangeColor(preset.hex)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl border text-xs font-semibold transition-all ${
                  targetHex.toLowerCase() === preset.hex.toLowerCase()
                    ? 'border-blue-400 bg-slate-800 text-white shadow-sm ring-1 ring-blue-400'
                    : 'border-slate-800 bg-slate-900/90 text-slate-300 hover:border-slate-700'
                }`}
              >
                <span
                  className="w-3.5 h-3.5 rounded-full border border-white/20 shadow-sm shrink-0"
                  style={{ backgroundColor: preset.hex }}
                />
                <span>{preset.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Farbwähler & Farbcode-Eingabe */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
        <div className="md:col-span-5 flex flex-col items-center justify-center p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
          <div className="relative group w-full max-w-[170px] aspect-square rounded-full border-4 border-slate-700/80 shadow-2xl flex items-center justify-center transition-transform hover:scale-105 overflow-hidden">
            <div
              className="w-full h-full rounded-full transition-colors duration-300"
              style={{ backgroundColor: targetHex }}
            />
            <input
              type="color"
              value={targetHex}
              onChange={(e) => onChangeColor(e.target.value)}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              title="Klicke, um den Farbwähler zu öffnen"
            />
            <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 flex items-center justify-center rounded-full transition-opacity pointer-events-none text-xs font-semibold text-white">
              Farbe anpassen
            </div>
          </div>

          <div className="mt-3 text-center">
            <span className="text-lg font-mono font-extrabold tracking-wider text-blue-300">
              {targetHex.toUpperCase()}
            </span>
          </div>
        </div>

        <div className="md:col-span-7 space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">HEX-Farbcode</label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={targetHex}
                onChange={handleHexInput}
                placeholder="#1d4ed8"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm font-mono text-blue-300 focus:outline-none focus:border-blue-500"
              />
              <input
                type="color"
                value={targetHex}
                onChange={(e) => onChangeColor(e.target.value)}
                className="w-10 h-10 rounded-xl border border-slate-700 bg-slate-950 cursor-pointer p-0.5 shrink-0"
              />
            </div>
          </div>

          <div className="space-y-2.5 pt-2 border-t border-slate-800">
            <div>
              <label className="text-xs font-semibold text-slate-300">
                Farbregler (Pinkstichiges Rot, Gelb, Blau)
              </label>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-rose-400 w-28 shrink-0" title="Kühles, pinkstichiges Rot (Magenta)">Pinkstichiges Rot</span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={pigmentPercent.r}
                  onChange={(e) => handlePigmentChange('r', parseInt(e.target.value))}
                  className="w-full accent-rose-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                />
                <span className="w-10 text-right font-mono text-xs text-rose-300">{pigmentPercent.r}%</span>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-amber-400 w-12" title="Gelb (Yellow)">Gelb</span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={pigmentPercent.g}
                  onChange={(e) => handlePigmentChange('g', parseInt(e.target.value))}
                  className="w-full accent-amber-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                />
                <span className="w-10 text-right font-mono text-xs text-amber-300">{pigmentPercent.g}%</span>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-blue-400 w-12" title="Blau (Cyan)">Blau</span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={pigmentPercent.b}
                  onChange={(e) => handlePigmentChange('b', parseInt(e.target.value))}
                  className="w-full accent-blue-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                />
                <span className="w-10 text-right font-mono text-xs text-blue-300">{pigmentPercent.b}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showImagePicker && (
        <ImageColorPicker
          onSelectColor={(hex) => onChangeColor(hex)}
          onClose={() => setShowImagePicker(false)}
        />
      )}
    </div>
  );
};

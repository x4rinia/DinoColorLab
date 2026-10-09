import React, { useState } from 'react';
import { hexToRgb, rgbToHex } from '../../engine/colorMath';
import { ImageColorPicker } from '../common/ImageColorPicker';
import { Pipette, Star, Clock, Sparkles } from 'lucide-react';

interface ColorSelectionProps {
  targetHex: string;
  onChangeColor: (hex: string) => void;
  recentColors: string[];
  favoriteColors: string[];
  onToggleFavorite: (hex: string) => void;
}

export const ColorSelection: React.FC<ColorSelectionProps> = ({
  targetHex,
  onChangeColor,
  recentColors,
  favoriteColors,
  onToggleFavorite
}) => {
  const [showImagePicker, setShowImagePicker] = useState(false);
  const rgb = hexToRgb(targetHex);
  const isFav = favoriteColors.includes(targetHex.toLowerCase());

  const handleHexInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (/^#[0-9A-Fa-f]{6}$/.test(val)) {
      onChangeColor(val);
    } else if (/^[0-9A-Fa-f]{6}$/.test(val)) {
      onChangeColor(`#${val}`);
    }
  };

  const handleRgbChange = (channel: 'r' | 'g' | 'b', val: number) => {
    const newRgb = { ...rgb, [channel]: Math.max(0, Math.min(255, val)) };
    onChangeColor(rgbToHex(newRgb.r, newRgb.g, newRgb.b));
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
      } catch (e) {
        // User cancelled or failed
      }
    } else {
      setShowImagePicker(true);
    }
  };

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 shadow-xl text-white backdrop-blur-md">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold flex items-center gap-2 text-slate-100 m-0">
          <Sparkles className="w-5 h-5 text-cyan-400" />
          <span>Wunschfarbe wählen</span>
        </h2>
        <div className="flex items-center gap-2">
          <button
            onClick={handleNativeEyeDropper}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/30 rounded-xl text-xs font-semibold transition-all"
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

      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
        <div className="md:col-span-5 flex flex-col items-center justify-center p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
          <div className="relative group w-full max-w-[200px] aspect-square rounded-full border-4 border-slate-700/80 shadow-2xl flex items-center justify-center transition-transform hover:scale-105 overflow-hidden">
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
            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 flex items-center justify-center rounded-full transition-opacity pointer-events-none text-xs font-semibold text-white">
              Farbe ändern
            </div>
          </div>

          <div className="flex items-center gap-2 mt-4">
            <span className="text-xl font-mono font-extrabold tracking-wider text-cyan-300">
              {targetHex.toUpperCase()}
            </span>
            <button
              onClick={() => onToggleFavorite(targetHex)}
              className={`p-1.5 rounded-xl border transition-all ${
                isFav
                  ? 'bg-amber-500/20 border-amber-500/50 text-amber-400'
                  : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-amber-300'
              }`}
              title={isFav ? 'Aus Favoriten entfernen' : 'Zu Favoriten hinzufügen'}
            >
              <Star className={`w-4 h-4 ${isFav ? 'fill-amber-400' : ''}`} />
            </button>
          </div>
        </div>

        <div className="md:col-span-7 space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">HEX-Farbcode</label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={targetHex}
                onChange={handleHexInput}
                placeholder="#00e5ff"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm font-mono text-cyan-300 focus:outline-none focus:border-cyan-500"
              />
              <input
                type="color"
                value={targetHex}
                onChange={(e) => onChangeColor(e.target.value)}
                className="w-10 h-10 rounded-xl border border-slate-700 bg-slate-950 cursor-pointer p-0.5"
              />
            </div>
          </div>

          <div className="space-y-2 pt-1 border-t border-slate-800">
            <label className="block text-xs font-semibold text-slate-400">RGB-Farbwerte</label>

            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-rose-400 w-4">R</span>
              <input
                type="range"
                min="0"
                max="255"
                value={rgb.r}
                onChange={(e) => handleRgbChange('r', parseInt(e.target.value))}
                className="w-full accent-rose-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
              />
              <input
                type="number"
                min="0"
                max="255"
                value={rgb.r}
                onChange={(e) => handleRgbChange('r', parseInt(e.target.value) || 0)}
                className="w-14 bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-xs text-center font-mono text-slate-200"
              />
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-emerald-400 w-4">G</span>
              <input
                type="range"
                min="0"
                max="255"
                value={rgb.g}
                onChange={(e) => handleRgbChange('g', parseInt(e.target.value))}
                className="w-full accent-emerald-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
              />
              <input
                type="number"
                min="0"
                max="255"
                value={rgb.g}
                onChange={(e) => handleRgbChange('g', parseInt(e.target.value) || 0)}
                className="w-14 bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-xs text-center font-mono text-slate-200"
              />
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-cyan-400 w-4">B</span>
              <input
                type="range"
                min="0"
                max="255"
                value={rgb.b}
                onChange={(e) => handleRgbChange('b', parseInt(e.target.value))}
                className="w-full accent-cyan-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
              />
              <input
                type="number"
                min="0"
                max="255"
                value={rgb.b}
                onChange={(e) => handleRgbChange('b', parseInt(e.target.value) || 0)}
                className="w-14 bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-xs text-center font-mono text-slate-200"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-5 pt-4 border-t border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5 mb-2">
            <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            <span>Favoriten</span>
          </span>
          <div className="flex items-center gap-2 flex-wrap min-h-[32px]">
            {favoriteColors.length === 0 ? (
              <span className="text-xs text-slate-500 italic">Keine Favoriten gespeichert</span>
            ) : (
              favoriteColors.map((hex) => (
                <button
                  key={hex}
                  onClick={() => onChangeColor(hex)}
                  className={`w-7 h-7 rounded-xl border-2 transition-transform hover:scale-110 shadow-md ${
                    targetHex.toLowerCase() === hex.toLowerCase() ? 'border-amber-400 scale-110' : 'border-slate-700'
                  }`}
                  style={{ backgroundColor: hex }}
                  title={hex}
                />
              ))
            )}
          </div>
        </div>

        <div>
          <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5 mb-2">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>Zuletzt verwendet</span>
          </span>
          <div className="flex items-center gap-2 flex-wrap min-h-[32px]">
            {recentColors.map((hex) => (
              <button
                key={hex}
                onClick={() => onChangeColor(hex)}
                className={`w-7 h-7 rounded-xl border-2 transition-transform hover:scale-110 shadow-md ${
                  targetHex.toLowerCase() === hex.toLowerCase() ? 'border-cyan-400 scale-110' : 'border-slate-700'
                }`}
                style={{ backgroundColor: hex }}
                title={hex}
              />
            ))}
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

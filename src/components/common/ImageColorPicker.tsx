import React, { useState, useRef } from 'react';
import { extractHexFromImageData, compressImage } from '../../db/imageUtils';
import { Upload, Pipette, X, Check } from 'lucide-react';

interface ImageColorPickerProps {
  onSelectColor: (hex: string) => void;
  onClose: () => void;
}

export const ImageColorPicker: React.FC<ImageColorPickerProps> = ({ onSelectColor, onClose }) => {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [pickedHex, setPickedHex] = useState<string>('#38bdf8');
  const [crosshair, setCrosshair] = useState<{ x: number; y: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const compressed = await compressImage(file, 1000, 1000, 0.9);
        setImageSrc(compressed);
      } catch (err) {
        console.error('Failed to load image', err);
      }
    }
  };

  const handleImageClick = async (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current || !imageSrc) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const xPercent = (x / rect.width) * 100;
    const yPercent = (y / rect.height) * 100;

    setCrosshair({ x, y });

    try {
      const hex = await extractHexFromImageData(imageSrc, xPercent, yPercent);
      setPickedHex(hex);
    } catch (err) {
      console.error('Failed to pick pixel color', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-lg w-full text-white shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-xl font-bold flex items-center gap-2 mb-1">
          <Pipette className="w-5 h-5 text-cyan-400" />
          <span>Farbe aus Bild auslesen</span>
        </h3>
        <p className="text-xs text-slate-400 mb-4">
          Lade ein Inspiration-Foto hoch und klicke auf eine Stelle, um die Zielfarbe zu extrahieren.
        </p>

        {!imageSrc ? (
          <label className="flex flex-col items-center justify-center h-56 border-2 border-dashed border-slate-700 hover:border-cyan-500 rounded-2xl cursor-pointer bg-slate-800/50 hover:bg-slate-800 transition-all p-4">
            <Upload className="w-10 h-10 text-cyan-400 mb-2 animate-bounce-short" />
            <span className="text-sm font-semibold text-slate-200">Foto hochladen</span>
            <span className="text-xs text-slate-400 mt-1">JPG, PNG, WebP bis 10MB</span>
            <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
          </label>
        ) : (
          <div>
            <div
              ref={containerRef}
              onClick={handleImageClick}
              className="relative overflow-hidden rounded-2xl border border-slate-700 cursor-crosshair max-h-72 flex items-center justify-center bg-black"
            >
              <img src={imageSrc} alt="Preview" className="w-full h-auto object-contain select-none" />
              {crosshair && (
                <div
                  className="absolute w-6 h-6 border-2 border-white rounded-full pointer-events-none transform -translate-x-1/2 -translate-y-1/2 shadow-lg"
                  style={{ left: crosshair.x, top: crosshair.y }}
                >
                  <div className="w-full h-full border border-black rounded-full" />
                </div>
              )}
            </div>

            <div className="flex items-center justify-between mt-4 p-3 bg-slate-800/80 rounded-2xl border border-slate-700/60">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl border border-white/20 shadow-md"
                  style={{ backgroundColor: pickedHex }}
                />
                <div>
                  <div className="text-xs text-slate-400 font-medium">Ausgewählte Farbe</div>
                  <div className="text-base font-mono font-bold text-cyan-300">{pickedHex.toUpperCase()}</div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <label className="px-3 py-1.5 text-xs font-semibold bg-slate-700 hover:bg-slate-600 rounded-xl cursor-pointer">
                  Anderes Bild
                  <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                </label>

                <button
                  onClick={() => {
                    onSelectColor(pickedHex);
                    onClose();
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 font-semibold text-xs rounded-xl shadow-md shadow-cyan-500/20"
                >
                  <Check className="w-4 h-4" />
                  <span>Übernehmen</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

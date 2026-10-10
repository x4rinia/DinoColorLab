import React, { useState, useRef, useEffect } from 'react';
import { rgbToHex } from '../../engine/colorMath';
import { Upload, Pipette, X, Check, RefreshCw } from 'lucide-react';

interface ImageColorPickerProps {
  onSelectColor: (hex: string) => void;
  onClose: () => void;
}

export const ImageColorPicker: React.FC<ImageColorPickerProps> = ({ onSelectColor, onClose }) => {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [pickedHex, setPickedHex] = useState<string>('#ffffff');
  const [crosshairPercent, setCrosshairPercent] = useState<{ x: number; y: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const imgRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const objectUrlRef = useRef<string | null>(null);

  // Cleanup object URLs when component unmounts
  useEffect(() => {
    return () => {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
      }
    };
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
      }
      const url = URL.createObjectURL(file);
      objectUrlRef.current = url;
      setImageSrc(url);
    }
  };

  // Wird aufgerufen, sobald das Bild im DOM geladen ist
  const handleImageLoad = () => {
    const img = imgRef.current;
    if (!img) return;

    // Erstelle ein Offscreen-Canvas mit den nativen Bild-Dimensionen
    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth || img.width;
    canvas.height = img.naturalHeight || img.height;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    ctx.drawImage(img, 0, 0);
    canvasRef.current = canvas;

    // AM ANFANG IMMER IN DER MITTE (50% X, 50% Y)
    const centerX = 50;
    const centerY = 50;
    setCrosshairPercent({ x: centerX, y: centerY });
    sampleColorAtPercent(centerX, centerY);
  };

  // Liest die exakte Pixelfarbe an den relativen Bildkoordinaten (0-100%)
  const sampleColorAtPercent = (xPercent: number, yPercent: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    const posX = Math.max(
      0,
      Math.min(canvas.width - 1, Math.floor((xPercent / 100) * canvas.width))
    );
    const posY = Math.max(
      0,
      Math.min(canvas.height - 1, Math.floor((yPercent / 100) * canvas.height))
    );

    try {
      const pixel = ctx.getImageData(posX, posY, 1, 1).data;
      const hex = rgbToHex(pixel[0], pixel[1], pixel[2]);
      setPickedHex(hex);
    } catch (err) {
      console.error('Fehler beim Auslesen des Pixels:', err);
    }
  };

  // Exakte Koordinatenberechnung relativ zum <img> selbst (ohne Letterboxing-Verschiebung)
  const handlePointerAction = (clientX: number, clientY: number) => {
    const img = imgRef.current;
    if (!img) return;

    const rect = img.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return;

    // Exakte Position innerhalb des Bildes
    const relX = Math.max(0, Math.min(rect.width, clientX - rect.left));
    const relY = Math.max(0, Math.min(rect.height, clientY - rect.top));

    const xPercent = (relX / rect.width) * 100;
    const yPercent = (relY / rect.height) * 100;

    setCrosshairPercent({ x: xPercent, y: yPercent });
    sampleColorAtPercent(xPercent, yPercent);
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsDragging(true);
    handlePointerAction(e.clientX, e.clientY);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isDragging) {
      handlePointerAction(e.clientX, e.clientY);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    setIsDragging(true);
    if (e.touches[0]) {
      handlePointerAction(e.touches[0].clientX, e.touches[0].clientY);
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches[0]) {
      handlePointerAction(e.touches[0].clientX, e.touches[0].clientY);
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 max-w-xl w-full text-white shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full bg-slate-800/80 hover:bg-slate-700 transition-all"
          title="Schließen"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-lg sm:text-xl font-bold flex items-center gap-2 mb-1">
          <Pipette className="w-5 h-5 text-blue-400" />
          <span>Farbe aus Bild auslesen</span>
        </h3>
        <p className="text-xs text-slate-400 mb-4">
          Lade ein Haarfarben-Foto hoch. Die Pipette startet exakt in der Bildmitte und kann frei bewegt werden.
        </p>

        {!imageSrc ? (
          <label className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-slate-700 hover:border-blue-500 rounded-2xl cursor-pointer bg-slate-950/50 hover:bg-slate-950/80 transition-all p-6 group">
            <Upload className="w-12 h-12 text-blue-400 mb-3 group-hover:scale-110 transition-transform" />
            <span className="text-sm font-bold text-slate-200">Inspirationsfoto hochladen</span>
            <span className="text-xs text-slate-400 mt-1">JPG, PNG, WebP oder Kamera-Foto</span>
            <span className="mt-3 px-3 py-1 bg-blue-600/30 text-blue-300 rounded-lg text-xs font-semibold border border-blue-500/40">
              Datei auswählen
            </span>
            <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
          </label>
        ) : (
          <div className="space-y-4">
            {/* Bild-Container mit zentriertem Bild und exakter Pipette */}
            <div className="bg-slate-950 rounded-2xl border border-slate-800 p-2 flex items-center justify-center overflow-hidden">
              <div
                className="relative inline-block select-none cursor-crosshair max-h-[360px]"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                onClick={(e) => handlePointerAction(e.clientX, e.clientY)}
              >
                <img
                  ref={imgRef}
                  src={imageSrc}
                  alt="Inspirations-Vorschau"
                  onLoad={handleImageLoad}
                  className="max-h-[360px] w-auto max-w-full rounded-xl object-contain block pointer-events-auto"
                  draggable={false}
                />

                {/* Das Zielkreuz / die Pipetten-Lupe exakt an der Pixelposition */}
                {crosshairPercent && (
                  <div
                    className="absolute pointer-events-none transform -translate-x-1/2 -translate-y-1/2 z-20"
                    style={{ left: `${crosshairPercent.x}%`, top: `${crosshairPercent.y}%` }}
                  >
                    <div
                      className="w-8 h-8 rounded-full border-2 border-white shadow-2xl flex items-center justify-center transition-transform scale-110"
                      style={{
                        backgroundColor: pickedHex,
                        boxShadow: '0 0 0 2px rgba(0,0,0,0.8), 0 4px 16px rgba(0,0,0,0.6)'
                      }}
                    >
                      {/* Fadenkreuz-Punkt */}
                      <div className="w-1.5 h-1.5 rounded-full bg-white shadow-sm ring-1 ring-black/80" />
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="text-[11px] text-slate-400 text-center italic">
              💡 Tipp: Klicke oder ziehe mit dem Finger/Mauszeiger auf eine Strähne, um den genauen Farbton abzutasten.
            </div>

            {/* Farb-Übernahmeleiste */}
            <div className="flex items-center justify-between p-3.5 bg-slate-950/80 rounded-2xl border border-slate-800">
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-xl border-2 border-white/20 shadow-md shrink-0 transition-transform hover:scale-105"
                  style={{ backgroundColor: pickedHex }}
                  title={`Ausgewählter Farbcode: ${pickedHex}`}
                />
                <div>
                  <div className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">
                    Ausgewählte Farbe
                  </div>
                  <div className="text-lg font-mono font-extrabold text-blue-300">
                    {pickedHex.toUpperCase()}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <label
                  className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl cursor-pointer border border-slate-700 transition-all"
                  title="Anderes Foto hochladen"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Neues Bild</span>
                  <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                </label>

                <button
                  onClick={() => {
                    onSelectColor(pickedHex);
                    onClose();
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 font-bold text-xs text-white rounded-xl shadow-lg shadow-blue-500/25 transition-all"
                >
                  <Check className="w-4 h-4" />
                  <span>Farbe übernehmen</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

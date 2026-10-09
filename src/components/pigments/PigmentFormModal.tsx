import React, { useState } from 'react';
import type { PigmentProfile, ColorGroup, CalibrationStatus } from '../../types';
import { compressImage } from '../../db/imageUtils';
import { Palette, Upload, X, Check, Trash2 } from 'lucide-react';

interface PigmentFormModalProps {
  pigment?: PigmentProfile;
  onSave: (pigment: Omit<PigmentProfile, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  onDelete?: (id: number) => Promise<void>;
  onClose: () => void;
}

export const PigmentFormModal: React.FC<PigmentFormModalProps> = ({
  pigment,
  onSave,
  onDelete,
  onClose
}) => {
  const [name, setName] = useState(pigment?.name || '');
  const [brand, setBrand] = useState(pigment?.brand || '');
  const [colorGroup, setColorGroup] = useState<ColorGroup>(pigment?.colorGroup || 'cyan');
  const [referenceHex, setReferenceHex] = useState(pigment?.referenceHex || '#00b4d8');
  const [intensity, setIntensity] = useState<number>(pigment?.intensity || 1.0);
  const [densityGPerMl, setDensityGPerMl] = useState<string>(
    pigment?.densityGPerMl ? pigment.densityGPerMl.toString() : ''
  );
  const [status, setStatus] = useState<CalibrationStatus>(pigment?.status || 'uncalibrated');
  const [notes, setNotes] = useState(pigment?.notes || '');
  const [photoUrl, setPhotoUrl] = useState<string | undefined>(pigment?.photoUrl);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const compressed = await compressImage(file, 600, 600, 0.85);
        setPhotoUrl(compressed);
      } catch (err) {
        console.error('Failed to compress photo', err);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    await onSave({
      name: name.trim(),
      brand: brand.trim() || 'Eigenes Pigment',
      colorGroup,
      referenceHex,
      intensity: Math.max(0.1, intensity),
      densityGPerMl: densityGPerMl ? parseFloat(densityGPerMl) : undefined,
      notes: notes.trim(),
      photoUrl,
      status,
      isDemo: pigment?.isDemo || false
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-lg w-full text-white shadow-2xl relative my-8">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-xl font-bold flex items-center gap-2 mb-4">
          <Palette className="w-5 h-5 text-cyan-400" />
          <span>{pigment ? 'Pigment bearbeiten' : 'Neues Pigment anlegen'}</span>
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Produktname *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="z. B. Direct Turquoise Vivid"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Hersteller / Marke</label>
              <input
                type="text"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                placeholder="z. B. Color Brand X"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Farbgruppe</label>
              <select
                value={colorGroup}
                onChange={(e) => setColorGroup(e.target.value as ColorGroup)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
              >
                <option value="cyan">Cyan (Blau-Grün)</option>
                <option value="magenta">Magenta (Pink-Rot)</option>
                <option value="yellow">Gelb (Yellow)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Unverdünnte Referenzfarbe</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={referenceHex}
                  onChange={(e) => setReferenceHex(e.target.value)}
                  className="w-9 h-9 rounded-xl border border-slate-700 bg-slate-950 cursor-pointer p-0.5"
                />
                <input
                  type="text"
                  value={referenceHex}
                  onChange={(e) => setReferenceHex(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-cyan-300 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Farbintensität (Multiplikator)</label>
              <input
                type="number"
                step="0.1"
                min="0.1"
                max="3.0"
                value={intensity}
                onChange={(e) => setIntensity(parseFloat(e.target.value) || 1.0)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500"
              />
              <span className="text-[10px] text-slate-500">Standard ist 1.0. Höher = stärker pigmentiert.</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Dichte in g/ml (optional)</label>
              <input
                type="number"
                step="0.01"
                min="0.5"
                max="2.0"
                placeholder="z. B. 1.02"
                value={densityGPerMl}
                onChange={(e) => setDensityGPerMl(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500"
              />
              <span className="text-[10px] text-slate-500">Für die optionale Milliliter-Anzeige.</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Kalibrierungsstatus</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as CalibrationStatus)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
              >
                <option value="uncalibrated">Unkalibriert</option>
                <option value="partially_calibrated">Teilweise kalibriert</option>
                <option value="calibrated">Kalibriert (getestet)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Produktfoto (optional)</label>
              <div className="flex items-center gap-2">
                {photoUrl && (
                  <img src={photoUrl} alt="Preview" className="w-9 h-9 rounded-xl object-cover border border-slate-700" />
                )}
                <label className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-700 text-xs font-semibold cursor-pointer">
                  <Upload className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{photoUrl ? 'Ändern' : 'Foto hochladen'}</span>
                  <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                </label>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Notizen & Inhaltsstoffe</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Besonderheiten, Einwirkzeit, Kompatibilität..."
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 h-20"
            />
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-slate-800">
            {pigment && onDelete && (
              <button
                type="button"
                onClick={async () => {
                  if (confirm('Möchtest du dieses Pigment wirklich löschen?')) {
                    await onDelete(pigment.id!);
                    onClose();
                  }
                }}
                className="flex items-center gap-1 text-xs text-rose-400 hover:text-rose-300 px-3 py-2 rounded-xl bg-rose-500/10 border border-rose-500/20"
              >
                <Trash2 className="w-4 h-4" />
                <span>Löschen</span>
              </button>
            )}

            <div className="flex items-center gap-2 ml-auto">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
              >
                Abbrechen
              </button>
              <button
                type="submit"
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 font-semibold text-xs text-white shadow-md"
              >
                <Check className="w-4 h-4" />
                <span>Speichern</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import type { StrandTest, PigmentProfile, ConditionerProfile, CustomBaseHairColor } from '../../types';
import { compressImage, extractHexFromImageData } from '../../db/imageUtils';
import { TestTube2, Star, X, Check, Camera, Info, Pipette } from 'lucide-react';

interface StrandTestModalProps {
  initialTest?: Partial<StrandTest>;
  pigments: PigmentProfile[];
  conditioners: ConditionerProfile[];
  onSave: (test: Omit<StrandTest, 'id' | 'createdAt'>) => Promise<void>;
  onClose: () => void;
}

export const StrandTestModal: React.FC<StrandTestModalProps> = ({
  initialTest,
  pigments,
  conditioners,
  onSave,
  onClose
}) => {
  const [title, setTitle] = useState(initialTest?.title || 'Teststrähne');
  const [date, setDate] = useState(initialTest?.date || new Date().toISOString().split('T')[0]);
  const [actualCyanGrams, setActualCyanGrams] = useState(initialTest?.actualCyanGrams || 5.0);
  const [actualMagentaGrams, setActualMagentaGrams] = useState(initialTest?.actualMagentaGrams || 1.0);
  const [actualYellowGrams, setActualYellowGrams] = useState(initialTest?.actualYellowGrams || 1.0);
  const [actualConditionerGrams, setActualConditionerGrams] = useState(initialTest?.actualConditionerGrams || 43.0);
  const [processingTimeMinutes, setProcessingTimeMinutes] = useState(initialTest?.processingTimeMinutes || 30);
  const [measuredResultHex, setMeasuredResultHex] = useState(initialTest?.measuredResultHex || '#7dd3fc');
  const [rating, setRating] = useState(initialTest?.rating || 5);
  const [notes, setNotes] = useState(initialTest?.notes || '');
  const [photoBeforeUrl, setPhotoBeforeUrl] = useState(initialTest?.photoBeforeUrl);
  const [photoAfterUrl, setPhotoAfterUrl] = useState(initialTest?.photoAfterUrl);

  const cyanOptions = pigments.filter((p) => p.colorGroup === 'cyan');
  const magentaOptions = pigments.filter((p) => p.colorGroup === 'magenta');
  const yellowOptions = pigments.filter((p) => p.colorGroup === 'yellow');

  const cyanId = initialTest?.cyanPigmentId || cyanOptions[0]?.id || 1;
  const magentaId = initialTest?.magentaPigmentId || magentaOptions[0]?.id || 2;
  const yellowId = initialTest?.yellowPigmentId || yellowOptions[0]?.id || 3;
  const conditionerId = initialTest?.conditionerId || conditioners[0]?.id || 1;
  const targetHex = initialTest?.targetHex || '#38bdf8';

  const baseHairColor: CustomBaseHairColor = initialTest?.baseHairColor || {
    levelKey: 'bleached_level10',
    hex: '#fffbeb'
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>, target: 'before' | 'after') => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const compressed = await compressImage(file, 800, 800, 0.85);
        if (target === 'before') setPhotoBeforeUrl(compressed);
        else setPhotoAfterUrl(compressed);
      } catch (err) {
        console.error('Failed to compress image', err);
      }
    }
  };

  const handleExtractColorFromPhoto = async () => {
    if (photoAfterUrl) {
      try {
        const extracted = await extractHexFromImageData(photoAfterUrl, 50, 50);
        setMeasuredResultHex(extracted);
      } catch (err) {
        console.error('Failed to extract color', err);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave({
      title: title.trim() || 'Teststrähne',
      date,
      cyanPigmentId: cyanId,
      magentaPigmentId: magentaId,
      yellowPigmentId: yellowId,
      conditionerId,
      actualCyanGrams,
      actualMagentaGrams,
      actualYellowGrams,
      actualConditionerGrams,
      baseHairColor,
      processingTimeMinutes,
      measuredResultHex,
      targetHex,
      rating,
      notes: notes.trim(),
      photoBeforeUrl,
      photoAfterUrl
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-xl w-full text-white shadow-2xl relative my-8 space-y-4">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-xl font-bold flex items-center gap-2 m-0">
          <TestTube2 className="w-5 h-5 text-cyan-400" />
          <span>Teststrähne dokumentieren</span>
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Titel der Teststrähne</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Datum</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          {/* Actual Measured Grams */}
          <div className="bg-slate-950/60 p-3 rounded-2xl border border-slate-800 space-y-2">
            <label className="block text-xs font-semibold text-cyan-300">Tatsächlich abgewogene Mengen (Gramm)</label>
            <div className="grid grid-cols-4 gap-2 text-center text-xs">
              <div>
                <span className="block text-[10px] text-cyan-400">Cyan (g)</span>
                <input
                  type="number"
                  step="0.1"
                  value={actualCyanGrams}
                  onChange={(e) => setActualCyanGrams(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-1.5 py-1 text-center font-mono text-cyan-300"
                />
              </div>
              <div>
                <span className="block text-[10px] text-fuchsia-400">Magenta (g)</span>
                <input
                  type="number"
                  step="0.1"
                  value={actualMagentaGrams}
                  onChange={(e) => setActualMagentaGrams(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-1.5 py-1 text-center font-mono text-fuchsia-300"
                />
              </div>
              <div>
                <span className="block text-[10px] text-amber-400">Gelb (g)</span>
                <input
                  type="number"
                  step="0.1"
                  value={actualYellowGrams}
                  onChange={(e) => setActualYellowGrams(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-1.5 py-1 text-center font-mono text-amber-300"
                />
              </div>
              <div>
                <span className="block text-[10px] text-purple-400">Spülung (g)</span>
                <input
                  type="number"
                  step="0.1"
                  value={actualConditionerGrams}
                  onChange={(e) => setActualConditionerGrams(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-1.5 py-1 text-center font-mono text-purple-300"
                />
              </div>
            </div>
          </div>

          {/* Processing Time & Rating */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Einwirkzeit (Minuten)</label>
              <input
                type="number"
                min="5"
                max="120"
                value={processingTimeMinutes}
                onChange={(e) => setProcessingTimeMinutes(parseInt(e.target.value) || 30)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Bewertung des Ergebnisses</label>
              <div className="flex items-center gap-1.5 pt-1.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="p-1 hover:scale-110 transition-transform"
                  >
                    <Star
                      className={`w-5 h-5 ${star <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-600'}`}
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Result Color Picker */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Erreichte Ergebnisfarbe</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={measuredResultHex}
                onChange={(e) => setMeasuredResultHex(e.target.value)}
                className="w-9 h-9 rounded-xl border border-slate-700 bg-slate-950 cursor-pointer p-0.5"
              />
              <input
                type="text"
                value={measuredResultHex}
                onChange={(e) => setMeasuredResultHex(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-cyan-300 focus:outline-none focus:border-cyan-500"
              />
              {photoAfterUrl && (
                <button
                  type="button"
                  onClick={handleExtractColorFromPhoto}
                  className="flex items-center gap-1 px-3 py-2 bg-slate-800 text-cyan-300 rounded-xl text-xs border border-slate-700 font-semibold shrink-0"
                >
                  <Pipette className="w-3.5 h-3.5" />
                  <span>Aus Foto</span>
                </button>
              )}
            </div>
          </div>

          {/* Photos Upload (Before & After) */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Foto VORHER</label>
              <div className="flex items-center gap-2">
                {photoBeforeUrl && (
                  <img src={photoBeforeUrl} alt="Before" className="w-10 h-10 rounded-xl object-cover border border-slate-700" />
                )}
                <label className="w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-700 text-xs font-semibold cursor-pointer">
                  <Camera className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Hochladen</span>
                  <input type="file" accept="image/*" onChange={(e) => handlePhotoUpload(e, 'before')} className="hidden" />
                </label>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Foto NACHHER</label>
              <div className="flex items-center gap-2">
                {photoAfterUrl && (
                  <img src={photoAfterUrl} alt="After" className="w-10 h-10 rounded-xl object-cover border border-slate-700" />
                )}
                <label className="w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-700 text-xs font-semibold cursor-pointer">
                  <Camera className="w-3.5 h-3.5 text-fuchsia-400" />
                  <span>Hochladen</span>
                  <input type="file" accept="image/*" onChange={(e) => handlePhotoUpload(e, 'after')} className="hidden" />
                </label>
              </div>
            </div>
          </div>

          {/* Lighting Disclaimer */}
          <div className="flex items-start gap-2 bg-amber-500/10 p-2.5 rounded-xl border border-amber-500/20 text-[11px] text-amber-300">
            <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <span>
              <strong>Kamera-Hinweis:</strong> Handyfotos hängen stark von Raumbeleuchtung und Kamera-Weißabgleich ab. Für genaue Farbtöne möglichst bei Tageslicht fotografieren.
            </span>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Notizen zum Versuch</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Haarzustand, Farbaufnahme, Haltbarkeit..."
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 h-16"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
            <button type="button" onClick={onClose} className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white">
              Abbrechen
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 font-semibold text-xs text-white shadow-md"
            >
              <Check className="w-4 h-4" />
              <span>Teststrähne speichern</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

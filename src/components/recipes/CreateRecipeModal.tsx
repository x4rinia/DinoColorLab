import React, { useState } from 'react';
import type { ColorRecipe, PigmentProfile, ConditionerProfile, BaseHairColorLevel } from '../../types';
import { X, Check, FlaskConical, Plus } from 'lucide-react';

interface CreateRecipeModalProps {
  pigments: PigmentProfile[];
  conditioners: ConditionerProfile[];
  onClose: () => void;
  onSave: (recipe: Omit<ColorRecipe, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  onNavigateToFarblabor: () => void;
}

const PRESET_COLORS = [
  { name: 'Aquamarin', hex: '#7dd3fc', cyan: 9, magenta: 1, yellow: 2, cond: 88 },
  { name: 'Flieder', hex: '#c084fc', cyan: 6, magenta: 10, yellow: 1, cond: 83 },
  { name: 'Pastellrosa', hex: '#f472b6', cyan: 0, magenta: 6, yellow: 1, cond: 93 },
  { name: 'Mintgrün', hex: '#6ee7b7', cyan: 5, magenta: 0, yellow: 8, cond: 87 },
  { name: 'Pfirsich', hex: '#fdba74', cyan: 0, magenta: 4, yellow: 9, cond: 87 },
  { name: 'Sonnengelb', hex: '#fde047', cyan: 0, magenta: 1, yellow: 14, cond: 85 },
  { name: 'Kornblume', hex: '#60a5fa', cyan: 14, magenta: 3, yellow: 0, cond: 83 }
];

export const CreateRecipeModal: React.FC<CreateRecipeModalProps> = ({
  pigments,
  conditioners,
  onClose,
  onSave,
  onNavigateToFarblabor
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [targetHex, setTargetHex] = useState('#7dd3fc');
  const [isFavorite, setIsFavorite] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>(['Eigenes Rezept']);
  const [batchGrams, setBatchGrams] = useState(5); // Standard 5g = ca. 1 TL Teststrähne
  const [baseLevel, setBaseLevel] = useState<BaseHairColorLevel>('bleached_level10');

  // Prozent-Anteile
  const [cyanPercent, setCyanPercent] = useState<number>(9);
  const [magentaPercent, setMagentaPercent] = useState<number>(1);
  const [yellowPercent, setYellowPercent] = useState<number>(2);
  const [condPercent, setCondPercent] = useState<number>(88);

  const sumPercent = cyanPercent + magentaPercent + yellowPercent + condPercent;

  const cyanPigment = pigments.find((p) => p.colorGroup === 'cyan') || pigments[0];
  const magentaPigment = pigments.find((p) => p.colorGroup === 'magenta') || pigments[1] || pigments[0];
  const yellowPigment = pigments.find((p) => p.colorGroup === 'yellow') || pigments[2] || pigments[0];
  const conditioner = conditioners[0];

  const handleApplyPreset = (preset: typeof PRESET_COLORS[0]) => {
    setTargetHex(preset.hex);
    setCyanPercent(preset.cyan);
    setMagentaPercent(preset.magenta);
    setYellowPercent(preset.yellow);
    setCondPercent(preset.cond);
    if (!title) {
      setTitle(preset.name);
    }
  };

  const handleNormalize = () => {
    if (sumPercent === 0) {
      setCondPercent(100);
      return;
    }
    const factor = 100 / sumPercent;
    const c = Math.round(cyanPercent * factor * 10) / 10;
    const m = Math.round(magentaPercent * factor * 10) / 10;
    const y = Math.round(yellowPercent * factor * 10) / 10;
    const cond = Math.round((100 - c - m - y) * 10) / 10;
    setCyanPercent(c);
    setMagentaPercent(m);
    setYellowPercent(y);
    setCondPercent(Math.max(0, cond));
  };

  const handleAddTag = () => {
    const trimmed = tagInput.trim();
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('Bitte gib einen Titel für das Rezept ein.');
      return;
    }

    const totalGrams = batchGrams > 0 ? batchGrams : 5;
    const cGrams = Math.round(((cyanPercent / 100) * totalGrams) * 100) / 100;
    const mGrams = Math.round(((magentaPercent / 100) * totalGrams) * 100) / 100;
    const yGrams = Math.round(((yellowPercent / 100) * totalGrams) * 100) / 100;
    const condGrams = Math.round(((condPercent / 100) * totalGrams) * 100) / 100;

    await onSave({
      title: title.trim(),
      description: description.trim(),
      targetHex: targetHex.toLowerCase(),
      cyanPigmentId: cyanPigment?.id || 1,
      magentaPigmentId: magentaPigment?.id || 2,
      yellowPigmentId: yellowPigment?.id || 3,
      conditionerId: conditioner?.id || 1,
      totalBatchGrams: totalGrams,
      ingredients: {
        cyanGrams: cGrams,
        magentaGrams: mGrams,
        yellowGrams: yGrams,
        conditionerGrams: condGrams,
        cyanPercent,
        magentaPercent,
        yellowPercent,
        conditionerPercent: condPercent,
        cyanMl: cGrams,
        magentaMl: mGrams,
        yellowMl: yGrams,
        conditionerMl: condGrams,
        totalGrams
      },
      baseHairColor: {
        levelKey: baseLevel,
        hex: baseLevel === 'bleached_level10' ? '#fffbeb' : '#fef08a'
      },
      testStatus: 'untested',
      tags,
      isFavorite,
      isDemo: false
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-xl w-full text-white shadow-2xl relative my-8 space-y-5">
        <button
          onClick={onClose}
          type="button"
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          <div className="p-2 bg-cyan-500/10 border border-cyan-500/20 rounded-xl text-cyan-400">
            <Plus className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-100 m-0">Neues Rezept hinzufügen</h3>
            <p className="text-xs text-slate-400 m-0">
              Erstelle eine eigene Rezeptur direkt oder übernehme ein Mischverhältnis.
            </p>
          </div>
        </div>

        {/* Schnellfarben-Vorschläge */}
        <div>
          <label className="text-xs font-semibold text-slate-300 mb-1.5 block">Farb-Inspiration & Vorlagen:</label>
          <div className="flex flex-wrap gap-1.5">
            {PRESET_COLORS.map((preset) => (
              <button
                key={preset.name}
                type="button"
                onClick={() => handleApplyPreset(preset)}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs bg-slate-950 border border-slate-800 hover:border-slate-700 transition-all text-slate-300"
              >
                <span className="w-3 h-3 rounded-full border border-white/20" style={{ backgroundColor: preset.hex }} />
                <span>{preset.name}</span>
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Titel & Farbe */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2 space-y-1">
              <label className="text-xs font-medium text-slate-300">Rezeptname *</label>
              <input
                type="text"
                required
                placeholder="z. B. Mein Pastell Türkis"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl px-3 py-2 text-xs text-slate-100 outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-300">Zielfarbe</label>
              <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-xl p-1.5">
                <input
                  type="color"
                  value={targetHex}
                  onChange={(e) => setTargetHex(e.target.value)}
                  className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                />
                <input
                  type="text"
                  value={targetHex}
                  onChange={(e) => setTargetHex(e.target.value)}
                  className="w-full bg-transparent text-xs font-mono uppercase text-slate-200 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Beschreibung */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-300">Beschreibung / Notizen (optional)</label>
            <input
              type="text"
              placeholder="z. B. Für Ansatz & Strähne, 20 Min Einwirkzeit..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl px-3 py-2 text-xs text-slate-100 outline-none"
            />
          </div>

          {/* Basis Haarfarbe & Portionsgröße */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-300">Ausgangshaarfarbe</label>
              <select
                value={baseLevel}
                onChange={(e) => setBaseLevel(e.target.value as BaseHairColorLevel)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 outline-none"
              >
                <option value="bleached_level10">Stufe 10: Platinblond (Hellst)</option>
                <option value="light_blonde_level9">Stufe 9: Hellblond</option>
                <option value="medium_blonde_level8">Stufe 7-8: Mittelblond</option>
                <option value="dark_blonde_level6">Stufe 6: Dunkelblond</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-300">Portion (Menge)</label>
              <select
                value={batchGrams}
                onChange={(e) => setBatchGrams(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 outline-none"
              >
                <option value={5}>Teststrähne: ca. 5g (ca. 1 TL)</option>
                <option value={10}>Größere Teststrähne: 10g (ca. 2 TL)</option>
                <option value={50}>Halbe Portion: 50g</option>
                <option value={100}>Ganzkopf: 100g</option>
              </select>
            </div>
          </div>

          {/* Mischverhältnis / Anteile in Prozent */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-200">Mischverhältnis der Komponenten (%)</span>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-mono font-bold ${sumPercent === 100 ? 'text-emerald-400' : 'text-amber-400'}`}>
                  Summe: {sumPercent.toFixed(1)}%
                </span>
                {sumPercent !== 100 && (
                  <button
                    type="button"
                    onClick={handleNormalize}
                    className="text-[10px] bg-slate-800 hover:bg-slate-700 px-2 py-0.5 rounded text-cyan-300 border border-slate-700"
                  >
                    Auf 100% runden
                  </button>
                )}
              </div>
            </div>

            {/* Farbverteilungs-Balken */}
            <div className="h-3 w-full rounded-full overflow-hidden flex bg-slate-800 border border-slate-700">
              <div style={{ width: `${Math.min(100, cyanPercent)}%` }} className="bg-blue-600 transition-all" />
              <div style={{ width: `${Math.min(100, magentaPercent)}%` }} className="bg-rose-500 transition-all" />
              <div style={{ width: `${Math.min(100, yellowPercent)}%` }} className="bg-amber-400 transition-all" />
              <div style={{ width: `${Math.min(100, condPercent)}%` }} className="bg-slate-200 transition-all" />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-2">
                <div className="text-[11px] font-semibold text-blue-400 mb-1">Blau (Cyan)</div>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.5"
                    value={cyanPercent}
                    onChange={(e) => setCyanPercent(Number(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs text-white"
                  />
                  <span className="text-xs text-slate-400">%</span>
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-xl p-2">
                <div className="text-[11px] font-semibold text-rose-400 mb-1">Rot-Pink</div>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.5"
                    value={magentaPercent}
                    onChange={(e) => setMagentaPercent(Number(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs text-white"
                  />
                  <span className="text-xs text-slate-400">%</span>
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-xl p-2">
                <div className="text-[11px] font-semibold text-amber-400 mb-1">Gelb</div>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.5"
                    value={yellowPercent}
                    onChange={(e) => setYellowPercent(Number(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs text-white"
                  />
                  <span className="text-xs text-slate-400">%</span>
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-xl p-2">
                <div className="text-[11px] font-semibold text-slate-300 mb-1">Spülung</div>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.5"
                    value={condPercent}
                    onChange={(e) => setCondPercent(Number(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs text-white"
                  />
                  <span className="text-xs text-slate-400">%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Tags & Favorit */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-1">
            <div className="flex items-center gap-1.5 flex-wrap flex-1">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 rounded-lg text-[10px] font-semibold bg-slate-800 text-cyan-300 border border-slate-700 flex items-center gap-1"
                >
                  #{tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="text-slate-400 hover:text-rose-400"
                  >
                    ×
                  </button>
                </span>
              ))}
              <div className="flex items-center gap-1">
                <input
                  type="text"
                  placeholder="+ Tag"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                  className="w-20 bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-[11px] text-slate-200 outline-none"
                />
                {tagInput && (
                  <button
                    type="button"
                    onClick={handleAddTag}
                    className="text-[10px] px-1.5 py-1 bg-slate-800 rounded text-slate-300"
                  >
                    +
                  </button>
                )}
              </div>
            </div>

            <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300 select-none shrink-0">
              <input
                type="checkbox"
                checked={isFavorite}
                onChange={(e) => setIsFavorite(e.target.checked)}
                className="w-4 h-4 rounded text-cyan-500 bg-slate-950 border-slate-800"
              />
              <span>Als Favorit markieren</span>
            </label>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between gap-2 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={() => {
                onClose();
                onNavigateToFarblabor();
              }}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-400 hover:text-cyan-300 transition-colors"
            >
              <FlaskConical className="w-3.5 h-3.5" />
              <span>Im Farblabor berechnen</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 rounded-xl"
              >
                Abbrechen
              </button>

              <button
                type="submit"
                className="flex items-center gap-1.5 px-5 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-xs font-bold text-white rounded-xl shadow-lg transition-transform hover:scale-[1.02]"
              >
                <Check className="w-4 h-4" />
                <span>Rezept speichern</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

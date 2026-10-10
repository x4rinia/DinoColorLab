import React, { useState } from 'react';
import type {
  CalculationResult,
  PigmentProfile,
  ConditionerProfile,
  CustomBaseHairColor,
  StrandTest
} from '../../types';
import {
  TEST_STRAND_VOLUME_PRESETS,
  calculateTeaspoonAmount,
  scaleRecipeIngredients
} from '../../engine/unitConversions';
import { compressImage } from '../../db/imageUtils';
import {
  TestTube2,
  Scale,
  Sparkles,
  Camera,
  Check,
  Star,
  Info,
  Maximize2
} from 'lucide-react';

interface TeststraehnenModusViewProps {
  calculationResult: CalculationResult;
  cyanPigment: PigmentProfile;
  magentaPigment: PigmentProfile;
  yellowPigment: PigmentProfile;
  conditioner?: ConditionerProfile;
  targetHex: string;
  baseHairColor: CustomBaseHairColor;
  currentBatchGrams: number;
  onChangeBatchGrams: (grams: number) => void;
  onSaveStrandTest: (test: Omit<StrandTest, 'id' | 'createdAt'>) => Promise<void>;
}

export const TeststraehnenModusView: React.FC<TeststraehnenModusViewProps> = ({
  calculationResult,
  cyanPigment,
  magentaPigment,
  yellowPigment,
  conditioner,
  targetHex,
  baseHairColor,
  currentBatchGrams,
  onChangeBatchGrams,
  onSaveStrandTest
}) => {
  const [scaleTargetGrams, setScaleTargetGrams] = useState<number>(60);
  const [showPhotoSection, setShowPhotoSection] = useState(false);
  const [photoBeforeUrl, setPhotoBeforeUrl] = useState<string | undefined>();
  const [photoAfterUrl, setPhotoAfterUrl] = useState<string | undefined>();
  const [testRating, setTestRating] = useState<number>(5);
  const [testNotes, setTestNotes] = useState<string>('');
  const [isSaved, setIsSaved] = useState(false);

  const { ingredients, estimatedResultHex } = calculationResult;

  const cyanTsp = calculateTeaspoonAmount(ingredients.cyanMl, ingredients.cyanGrams, cyanPigment.densityGPerMl);
  const magentaTsp = calculateTeaspoonAmount(ingredients.magentaMl, ingredients.magentaGrams, magentaPigment.densityGPerMl);
  const yellowTsp = calculateTeaspoonAmount(ingredients.yellowMl, ingredients.yellowGrams, yellowPigment.densityGPerMl);
  const condTsp = calculateTeaspoonAmount(ingredients.conditionerMl, ingredients.conditionerGrams, conditioner?.densityGPerMl || 1.0);

  // Scaled recipe
  const scaledIngredients = scaleRecipeIngredients(
    ingredients,
    scaleTargetGrams,
    cyanPigment.densityGPerMl,
    magentaPigment.densityGPerMl,
    yellowPigment.densityGPerMl,
    conditioner?.densityGPerMl || 1.0
  );

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'before' | 'after') => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const compressed = await compressImage(file, 800, 800, 0.85);
        if (type === 'before') setPhotoBeforeUrl(compressed);
        else setPhotoAfterUrl(compressed);
      } catch (err) {
        console.error('Image compression failed', err);
      }
    }
  };

  const handleSaveTest = async () => {
    await onSaveStrandTest({
      title: `Teststrähne (${ingredients.totalGrams}g) – ${targetHex.toUpperCase()}`,
      date: new Date().toISOString().split('T')[0],
      cyanPigmentId: cyanPigment.id!,
      magentaPigmentId: magentaPigment.id!,
      yellowPigmentId: yellowPigment.id!,
      conditionerId: conditioner?.id,
      actualCyanGrams: ingredients.cyanGrams,
      actualMagentaGrams: ingredients.magentaGrams,
      actualYellowGrams: ingredients.yellowGrams,
      actualConditionerGrams: ingredients.conditionerGrams,
      baseHairColor,
      processingTimeMinutes: 30,
      measuredResultHex: estimatedResultHex,
      targetHex,
      rating: testRating,
      notes: testNotes.trim() || 'Im Teststrähnen-Modus des Farblabors erstellt.',
      photoBeforeUrl,
      photoAfterUrl
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="bg-slate-900/90 border-2 border-cyan-500/50 rounded-3xl p-6 shadow-2xl text-white backdrop-blur-md space-y-6">
      {/* Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center shrink-0">
            <TestTube2 className="w-5 h-5 text-cyan-300" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-extrabold uppercase tracking-wider mb-0.5 border border-cyan-500/30">
              <span>Aktiver Modus</span>
            </div>
            <h3 className="text-lg font-bold text-slate-100 m-0">Kleine Teststrähne</h3>
          </div>
        </div>

        <div className="text-xs text-slate-400 sm:text-right">
          Standard-Menge: <strong className="text-cyan-300">5 ml (ca. 5,0 g)</strong>
        </div>
      </div>

      {/* Advisory on hair thickness & length */}
      <div className="flex items-start gap-2.5 bg-cyan-950/40 p-3.5 rounded-2xl border border-cyan-500/30 text-xs text-cyan-200">
        <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <strong className="block text-cyan-100">Hinweis zur benötigten Farbmenge:</strong>
          <p>
            Die tatsächliche benötigte Menge ist abhängig von Haarlänge, Haardicke und Strähnenbreite.
            5 ml reichen in der Regel für eine ca. 1–2 cm breite Strähne bei mittlerer Haarlänge.
          </p>
        </div>
      </div>

      {/* Presets */}
      <div className="space-y-2">
        <label className="block text-xs font-semibold text-slate-300">
          Menge für eine Teststrähne wählen:
        </label>
        <div className="flex flex-wrap items-center gap-2">
          {TEST_STRAND_VOLUME_PRESETS.map((preset) => {
            const isSelected = Math.abs(currentBatchGrams - preset.defaultGrams) < 0.2;
            return (
              <button
                key={preset.id}
                onClick={() => onChangeBatchGrams(preset.defaultGrams)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
                  isSelected
                    ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-md font-extrabold'
                    : 'bg-slate-950/70 text-slate-300 hover:text-white border-slate-800 hover:border-slate-700'
                }`}
                title={preset.description}
              >
                {preset.label}
              </button>
            );
          })}
          <div className="flex items-center gap-1.5 ml-auto">
            <span className="text-xs text-slate-400">Frei:</span>
            <input
              type="number"
              min="1"
              max="50"
              step="0.5"
              value={currentBatchGrams}
              onChange={(e) => onChangeBatchGrams(Math.max(1, parseFloat(e.target.value) || 1))}
              className="w-16 bg-slate-950 border border-slate-700 rounded-xl px-2 py-1 text-xs text-center font-mono text-cyan-300"
            />
            <span className="text-xs text-slate-400 font-mono">g</span>
          </div>
        </div>
      </div>

      {/* Conditioner & Micro Pigments Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Conditioner highlight */}
        <div className="bg-slate-950/70 p-4 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-200 flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded-full bg-white border border-slate-400 inline-block" />
              <span>Benötigter Spülungsanteil</span>
            </span>
            <span className="text-sm font-mono font-extrabold text-white">
              {ingredients.conditionerGrams} g
            </span>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400 pt-1 border-t border-slate-800/80">
            <span>Anteil an der Mischung:</span>
            <span className="font-mono font-bold text-cyan-300">{ingredients.conditionerPercent}%</span>
          </div>

          <div className="text-[11px] text-slate-400 flex items-center justify-between">
            <span>Dosierhilfe:</span>
            <span className="font-medium text-slate-300">
              {condTsp.canMeasureTeaspoon ? condTsp.teaspoonDisplay : `${ingredients.conditionerGrams} g (Feinwaage)`}
            </span>
          </div>
        </div>

        {/* Micro-pigments highlight */}
        <div className="bg-slate-950/70 p-4 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Sehr kleine Pigmentmengen</span>
            </span>
            <span className="text-xs font-mono text-slate-400">
              Summe Pigmente: {(ingredients.cyanGrams + ingredients.magentaGrams + ingredients.yellowGrams).toFixed(2)} g
            </span>
          </div>

          <div className="space-y-1.5 text-xs pt-1 border-t border-slate-800/80">
            <div className="flex items-center justify-between">
              <span className="text-blue-300 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                Blau:
              </span>
              <span className="font-mono font-bold text-white">
                {ingredients.cyanGrams} g{' '}
                <span className="text-[10px] text-slate-400 font-normal">
                  ({cyanTsp.canMeasureTeaspoon ? cyanTsp.teaspoonDisplay : '< ⅛ TL / Spritze'})
                </span>
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-rose-300 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                Rot-Pink:
              </span>
              <span className="font-mono font-bold text-white">
                {ingredients.magentaGrams} g{' '}
                <span className="text-[10px] text-slate-400 font-normal">
                  ({magentaTsp.canMeasureTeaspoon ? magentaTsp.teaspoonDisplay : '< ⅛ TL / Spritze'})
                </span>
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-amber-300 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                Gelb:
              </span>
              <span className="font-mono font-bold text-white">
                {ingredients.yellowGrams} g{' '}
                <span className="text-[10px] text-slate-400 font-normal">
                  ({yellowTsp.canMeasureTeaspoon ? yellowTsp.teaspoonDisplay : '< ⅛ TL / Spritze'})
                </span>
              </span>
            </div>
          </div>

          <div className="text-[10px] text-amber-300/90 italic pt-1">
            💡 Tipp: Bei Mengen unter 0,5 g unbedingt Feinwaage (0,01 g) oder Dosierspritze nutzen.
          </div>
        </div>
      </div>

      {/* Scaler: Automatisches Hochskalieren */}
      <div className="bg-slate-950/70 p-4 rounded-2xl border border-slate-800 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-2">
          <div className="flex items-center gap-2">
            <Maximize2 className="w-4 h-4 text-cyan-400" />
            <h4 className="text-xs font-bold text-slate-100 m-0">
              Rezeptur automatisch hochskalieren
            </h4>
          </div>
          <span className="text-[11px] text-slate-400">
            Von der Teststrähne ({ingredients.totalGrams} g) auf die Gesamthaarmenge
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-400">Zielmenge:</span>
          {[30, 60, 100, 150].map((grams) => (
            <button
              key={grams}
              onClick={() => setScaleTargetGrams(grams)}
              className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all ${
                scaleTargetGrams === grams
                  ? 'bg-cyan-500 text-slate-950 font-bold'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {grams} g
            </button>
          ))}
          <div className="flex items-center gap-1 ml-auto">
            <input
              type="number"
              min="10"
              max="500"
              step="5"
              value={scaleTargetGrams}
              onChange={(e) => setScaleTargetGrams(Math.max(5, parseInt(e.target.value) || 5))}
              className="w-16 bg-slate-900 border border-slate-700 rounded-xl px-2 py-1 text-xs text-center font-mono text-cyan-300"
            />
            <span className="text-xs text-slate-400 font-mono">g</span>
          </div>
        </div>

        {/* Scaled table */}
        <div className="bg-slate-900/60 rounded-xl p-3 border border-slate-800 text-xs">
          <div className="grid grid-cols-4 gap-2 text-center font-mono">
            <div>
              <div className="text-[10px] text-blue-300 font-sans font-medium">Blau</div>
              <div className="font-bold text-white">{scaledIngredients.cyanGrams} g</div>
            </div>
            <div>
              <div className="text-[10px] text-rose-300 font-sans font-medium">Rot-Pink</div>
              <div className="font-bold text-white">{scaledIngredients.magentaGrams} g</div>
            </div>
            <div>
              <div className="text-[10px] text-amber-300 font-sans font-medium">Gelb</div>
              <div className="font-bold text-white">{scaledIngredients.yellowGrams} g</div>
            </div>
            <div>
              <div className="text-[10px] text-slate-300 font-sans font-medium">Weiße Spülung</div>
              <div className="font-bold text-white">{scaledIngredients.conditionerGrams} g</div>
            </div>
          </div>
        </div>
      </div>

      {/* Step by Step Mixing Guide */}
      <div className="bg-slate-950/70 p-4 rounded-2xl border border-slate-800 space-y-3">
        <h4 className="text-xs font-bold text-cyan-300 flex items-center gap-2 m-0 uppercase tracking-wider">
          <Scale className="w-4 h-4 text-cyan-400" />
          <span>Schritt-für-Schritt Mischanleitung für deine Teststrähne</span>
        </h4>

        <ol className="space-y-2 text-xs text-slate-300 list-decimal list-inside leading-relaxed">
          <li className="bg-slate-900/50 p-2 rounded-xl">
            <strong>Vorbereiten:</strong> Schutzkleidung und Handschuhe anziehen, kleine Färbeschale auf die Feinwaage stellen und tarieren (auf 0 g setzen).
          </li>
          <li className="bg-slate-900/50 p-2 rounded-xl">
            <strong>Spülung vorlegen:</strong> Zuerst genau <strong>{ingredients.conditionerGrams} g</strong> weiße Spülung in die Schale geben.
          </li>
          <li className="bg-slate-900/50 p-2 rounded-xl">
            <strong>Pigmente zugeben:</strong> Nacheinander <strong>{ingredients.cyanGrams} g</strong> Blau, <strong>{ingredients.magentaGrams} g</strong> Rot-Pink und <strong>{ingredients.yellowGrams} g</strong> Gelb tropfen- bzw. grammweise zugeben.
          </li>
          <li className="bg-slate-900/50 p-2 rounded-xl">
            <strong>Gründlich verrühren:</strong> Mit einem Pinsel oder Spatel mindestens 1 Minute lang homogen rühren, bis keine Farbpunkte oder Schlieren mehr zu sehen sind.
          </li>
          <li className="bg-slate-900/50 p-2 rounded-xl">
            <strong>Auftragen & Einwirken:</strong> Eine ca. 1–2 cm breite Haarsträhne abteilen (z. B. am Hinterkopf), satt einstreichen und <strong>30 Minuten</strong> einwirken lassen.
          </li>
          <li className="bg-slate-900/50 p-2 rounded-xl">
            <strong>Ausspülen:</strong> Nur mit lauwarmem Wasser klar ausspülen, trockenföhnen und das Farbergebnis bei gutem Tageslicht überprüfen!
          </li>
        </ol>
      </div>

      {/* Save Test & Photo Section */}
      <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-xs font-bold text-slate-100 m-0">Test dokumentieren & Foto aufnehmen</h4>
            <p className="text-[11px] text-slate-400">
              Speichere dieses Testergebnis direkt in deinen Teststrähnen ab.
            </p>
          </div>

          <button
            onClick={() => setShowPhotoSection(!showPhotoSection)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-cyan-300 border border-slate-700"
          >
            <Camera className="w-3.5 h-3.5" />
            <span>{showPhotoSection ? 'Foto-Optionen schließen' : 'Foto anhängen'}</span>
          </button>
        </div>

        {showPhotoSection && (
          <div className="space-y-3 pt-2 border-t border-slate-800">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Foto VORHER (Ausgangshaar)
                </label>
                <div className="flex items-center gap-2">
                  {photoBeforeUrl && (
                    <img
                      src={photoBeforeUrl}
                      alt="Before"
                      className="w-10 h-10 rounded-xl object-cover border border-slate-700"
                    />
                  )}
                  <label className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-700 text-xs font-semibold cursor-pointer">
                    <Camera className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{photoBeforeUrl ? 'Ändern' : 'Hochladen'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handlePhotoUpload(e, 'before')}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Foto NACHHER (Ergebnis)
                </label>
                <div className="flex items-center gap-2">
                  {photoAfterUrl && (
                    <img
                      src={photoAfterUrl}
                      alt="After"
                      className="w-10 h-10 rounded-xl object-cover border border-slate-700"
                    />
                  )}
                  <label className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-700 text-xs font-semibold cursor-pointer">
                    <Camera className="w-3.5 h-3.5 text-rose-400" />
                    <span>{photoAfterUrl ? 'Ändern' : 'Hochladen'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handlePhotoUpload(e, 'after')}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                Bewertung (1–5 Sterne):
              </label>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setTestRating(star)}
                    className="p-1 hover:scale-110 transition-transform"
                  >
                    <Star
                      className={`w-4 h-4 ${
                        star <= testRating ? 'fill-amber-400 text-amber-400' : 'text-slate-600'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                Notizen zur Teststrähne (optional):
              </label>
              <textarea
                value={testNotes}
                onChange={(e) => setTestNotes(e.target.value)}
                placeholder="z. B. Haarbeschaffenheit, Einwirkzeit, Glanz, Auswaschverhalten..."
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 h-14"
              />
            </div>
          </div>
        )}

        <div className="flex items-center justify-end gap-2 pt-2">
          {isSaved && (
            <span className="text-xs text-emerald-400 font-bold flex items-center gap-1 animate-fade-in">
              <Check className="w-4 h-4" />
              <span>Teststrähne gespeichert!</span>
            </span>
          )}

          <button
            onClick={handleSaveTest}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 font-semibold text-xs text-white shadow-md shadow-cyan-500/20 transition-all"
          >
            <Check className="w-4 h-4" />
            <span>Ergebnis als Teststrähne speichern</span>
          </button>
        </div>
      </div>
    </div>
  );
};

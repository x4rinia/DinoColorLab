import React, { useState } from 'react';
import type { StrandTest, PigmentProfile, ConditionerProfile } from '../../types';
import { StrandTestModal } from './StrandTestModal';
import { DinoMascot } from '../common/DinoMascot';
import { TestTube2, Plus, Star, Calendar, Clock, Trash2, Sparkles } from 'lucide-react';

interface TeststraehnenTabProps {
  strandTests: StrandTest[];
  pigments: PigmentProfile[];
  conditioners: ConditionerProfile[];
  onSaveStrandTest: (test: Omit<StrandTest, 'id' | 'createdAt'>) => Promise<void>;
  onDeleteStrandTest: (id: number) => Promise<void>;
}

export const TeststraehnenTab: React.FC<TeststraehnenTabProps> = ({
  strandTests,
  pigments,
  conditioners,
  onSaveStrandTest,
  onDeleteStrandTest
}) => {
  const [showAddModal, setShowAddModal] = useState(false);

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2 text-white m-0">
            <TestTube2 className="w-6 h-6 text-cyan-400" />
            <span>Teststrähnen & Kalibrierung ({strandTests.length})</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Dokumentiere reale Mischversuche, um die Schätzgenauigkeit des Modells zu verbessern.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 font-semibold text-xs text-white shadow-md shadow-cyan-500/20"
        >
          <Plus className="w-4 h-4" />
          <span>Teststrähne dokumentieren</span>
        </button>
      </div>

      {/* Calibration Insight Card */}
      <div className="bg-gradient-to-r from-slate-900 via-cyan-950/40 to-slate-900 border border-cyan-500/30 rounded-3xl p-5 shadow-xl flex flex-col md:flex-row items-center gap-5">
        <DinoMascot size="md" expression="thinking" />
        <div className="space-y-1 text-xs text-slate-300">
          <div className="font-bold text-cyan-300 flex items-center gap-1.5 text-sm">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>Lernfunktion & Empirische Kalibrierung:</span>
          </div>
          <p>
            Jede dokumentierte Teststrähne dient dem Modell als realer Referenzpunkt. Sobald 2 oder mehr Tests für ein Pigmentsystem existieren, schaltet das Farblabor automatisch in den <strong>Kalibrierten Modus</strong>.
          </p>
          <div className="text-slate-400 italic text-[11px]">
            Keine neuronalen Netze oder Marketing-Versprechen — rein deterministische, nachvollziehbare Datenmodellierung.
          </div>
        </div>
      </div>

      {/* Strand Test Cards List */}
      {strandTests.length === 0 ? (
        <div className="text-center py-12 bg-slate-900/40 rounded-3xl border border-slate-800 text-slate-400 space-y-2">
          <TestTube2 className="w-10 h-10 mx-auto text-slate-600 mb-2" />
          <p className="font-semibold text-sm">Noch keine Teststrähnen erfasst.</p>
          <p className="text-xs text-slate-500">
            Klicke oben auf "Teststrähne dokumentieren", um deinen ersten Real-Versuch einzutragen.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {strandTests.map((test) => (
            <div
              key={test.id}
              className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 shadow-lg space-y-4 relative overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-3 border-b border-slate-800 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-100 m-0">{test.title}</h3>
                  <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-500" />
                      {test.date}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-cyan-400" />
                      {test.processingTimeMinutes} Min.
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-3.5 h-3.5 ${star <= test.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-700'}`}
                    />
                  ))}
                </div>
              </div>

              {/* Color Swatch Comparison */}
              <div className="flex items-center justify-around bg-slate-950/60 p-3 rounded-2xl border border-slate-800 text-center text-xs">
                <div>
                  <span className="text-slate-400 block mb-1">Zielfarbe</span>
                  <div
                    className="w-10 h-10 rounded-xl border border-white/20 mx-auto shadow-md"
                    style={{ backgroundColor: test.targetHex }}
                  />
                  <span className="font-mono font-bold text-cyan-300 mt-1 block">{test.targetHex.toUpperCase()}</span>
                </div>

                <div className="text-slate-600 font-bold text-lg">➔</div>

                <div>
                  <span className="text-slate-400 block mb-1">Ergebnis</span>
                  <div
                    className="w-10 h-10 rounded-xl border border-white/20 mx-auto shadow-md"
                    style={{ backgroundColor: test.measuredResultHex }}
                  />
                  <span className="font-mono font-bold text-emerald-300 mt-1 block">
                    {test.measuredResultHex.toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Actual Grams Breakdown */}
              <div className="grid grid-cols-4 gap-1 text-center text-[10px] font-mono font-bold bg-slate-950/40 p-2 rounded-xl border border-slate-800">
                <div className="text-blue-300">Blau: {test.actualCyanGrams}g</div>
                <div className="text-rose-300">Rot-Pink: {test.actualMagentaGrams}g</div>
                <div className="text-amber-300">Gelb: {test.actualYellowGrams}g</div>
                <div className="text-white">Spülung: {test.actualConditionerGrams}g</div>
              </div>

              {/* Before/After Photos */}
              {(test.photoBeforeUrl || test.photoAfterUrl) && (
                <div className="grid grid-cols-2 gap-2">
                  {test.photoBeforeUrl && (
                    <div className="relative rounded-xl overflow-hidden border border-slate-800 max-h-32 bg-black">
                      <img src={test.photoBeforeUrl} alt="Before" className="w-full h-full object-cover" />
                      <span className="absolute bottom-1 left-1 bg-black/60 text-[9px] px-1.5 py-0.5 rounded text-white font-semibold">
                        Vorher
                      </span>
                    </div>
                  )}
                  {test.photoAfterUrl && (
                    <div className="relative rounded-xl overflow-hidden border border-slate-800 max-h-32 bg-black">
                      <img src={test.photoAfterUrl} alt="After" className="w-full h-full object-cover" />
                      <span className="absolute bottom-1 left-1 bg-black/60 text-[9px] px-1.5 py-0.5 rounded text-white font-semibold">
                        Nachher
                      </span>
                    </div>
                  )}
                </div>
              )}

              {test.notes && <p className="text-xs text-slate-300 italic">{test.notes}</p>}

              {/* Actions */}
              <div className="pt-2 border-t border-slate-800 flex justify-end">
                <button
                  onClick={() => {
                    if (confirm('Teststrähne löschen?')) {
                      onDeleteStrandTest(test.id!);
                    }
                  }}
                  className="flex items-center gap-1 text-xs text-rose-400 hover:text-rose-300 px-3 py-1.5 rounded-xl bg-rose-500/10"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Löschen</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showAddModal && (
        <StrandTestModal
          pigments={pigments}
          conditioners={conditioners}
          onSave={onSaveStrandTest}
          onClose={() => setShowAddModal(false)}
        />
      )}
    </div>
  );
};

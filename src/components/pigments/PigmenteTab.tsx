import React, { useState } from 'react';
import type { PigmentProfile, ConditionerProfile } from '../../types';
import { PigmentFormModal } from './PigmentFormModal';
import { Palette, Plus, Droplet, Edit3 } from 'lucide-react';

interface PigmenteTabProps {
  pigments: PigmentProfile[];
  conditioners: ConditionerProfile[];
  onSavePigment: (pigment: Omit<PigmentProfile, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  onUpdatePigment: (id: number, pigment: Partial<PigmentProfile>) => Promise<void>;
  onDeletePigment: (id: number) => Promise<void>;
  onSaveConditioner: (conditioner: Omit<ConditionerProfile, 'id' | 'createdAt'>) => Promise<void>;
}

export const PigmenteTab: React.FC<PigmenteTabProps> = ({
  pigments,
  conditioners,
  onSavePigment,
  onUpdatePigment,
  onDeletePigment
}) => {
  const [editingPigment, setEditingPigment] = useState<PigmentProfile | undefined>(undefined);
  const [showAddModal, setShowAddModal] = useState(false);

  const cyanPigments = pigments.filter((p) => p.colorGroup === 'cyan');
  const magentaPigments = pigments.filter((p) => p.colorGroup === 'magenta');
  const yellowPigments = pigments.filter((p) => p.colorGroup === 'yellow');

  const renderPigmentCard = (p: PigmentProfile) => {
    return (
      <div
        key={p.id}
        className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 shadow-lg flex flex-col justify-between hover:border-slate-700 transition-all relative overflow-hidden"
      >
        <div>
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-1.5">
              <span
                className="w-4 h-4 rounded-full border border-white/20 shadow-sm"
                style={{ backgroundColor: p.referenceHex }}
              />
              <span className="text-xs font-mono font-bold text-slate-300">{p.referenceHex.toUpperCase()}</span>
            </div>

            <div className="flex items-center gap-1.5">
              {p.isDemo && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  DEMO (Beispiel)
                </span>
              )}
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                  p.status === 'calibrated'
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    : p.status === 'partially_calibrated'
                    ? 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                    : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}
              >
                {p.status === 'calibrated'
                  ? 'Kalibriert'
                  : p.status === 'partially_calibrated'
                  ? 'Teilw. kalibriert'
                  : 'Unkalibriert'}
              </span>
            </div>
          </div>

          <div className="flex items-start gap-3 mb-3">
            {p.photoUrl ? (
              <img
                src={p.photoUrl}
                alt={p.name}
                className="w-14 h-14 rounded-2xl object-cover border border-slate-700 shrink-0 shadow-md"
              />
            ) : (
              <div
                className="w-14 h-14 rounded-2xl border border-slate-700 flex items-center justify-center shrink-0 shadow-inner"
                style={{ backgroundColor: p.referenceHex + '25' }}
              >
                <Palette className="w-6 h-6 text-slate-400" />
              </div>
            )}

            <div>
              <h4 className="text-sm font-bold text-slate-100 leading-tight m-0">{p.name}</h4>
              <div className="text-xs text-slate-400 font-medium mt-0.5">{p.brand}</div>
            </div>
          </div>

          <div className="space-y-1 text-xs text-slate-400 bg-slate-950/50 p-2.5 rounded-2xl border border-slate-800">
            <div className="flex justify-between">
              <span>Farbintensität:</span>
              <span className="font-mono font-bold text-cyan-300">{p.intensity}x</span>
            </div>
            <div className="flex justify-between">
              <span>Dichte (g/ml):</span>
              <span className="font-mono text-slate-300">{p.densityGPerMl ? `${p.densityGPerMl} g/ml` : '—'}</span>
            </div>
            {p.notes && <div className="text-[11px] text-slate-500 italic mt-1 line-clamp-2">{p.notes}</div>}
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-800 flex justify-end">
          <button
            onClick={() => setEditingPigment(p)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-cyan-300 transition-all"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Bearbeiten</span>
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2 text-white m-0">
            <Palette className="w-6 h-6 text-cyan-400" />
            <span>Pigmentverwaltung & Produkte</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Hinterlege deine eigenen Cyan-, Magenta- und Gelbpigmente zur präzisen Berechnung.
          </p>
        </div>

        <button
          onClick={() => {
            setEditingPigment(undefined);
            setShowAddModal(true);
          }}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 font-semibold text-xs text-white shadow-md shadow-cyan-500/20"
        >
          <Plus className="w-4 h-4" />
          <span>Neues Pigment hinzufügen</span>
        </button>
      </div>

      <div className="space-y-3">
        <h3 className="text-base font-bold text-cyan-300 flex items-center gap-2 border-b border-cyan-500/20 pb-2">
          <span className="w-3 h-3 rounded-full bg-cyan-400" />
          <span>Cyan-Pigmente ({cyanPigments.length})</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {cyanPigments.map(renderPigmentCard)}
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-base font-bold text-fuchsia-300 flex items-center gap-2 border-b border-fuchsia-500/20 pb-2">
          <span className="w-3 h-3 rounded-full bg-fuchsia-400" />
          <span>Magenta-Pigmente ({magentaPigments.length})</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {magentaPigments.map(renderPigmentCard)}
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-base font-bold text-amber-300 flex items-center gap-2 border-b border-amber-500/20 pb-2">
          <span className="w-3 h-3 rounded-full bg-amber-400" />
          <span>Gelb-Pigmente ({yellowPigments.length})</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {yellowPigments.map(renderPigmentCard)}
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-base font-bold text-purple-300 flex items-center gap-2 border-b border-purple-500/20 pb-2">
          <Droplet className="w-4 h-4 text-purple-400" />
          <span>Pigmentfreie Haarspülungen ({conditioners.length})</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {conditioners.map((c) => (
            <div
              key={c.id}
              className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 shadow-lg flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center shrink-0">
                  <Droplet className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-100 m-0">{c.name}</h4>
                  <div className="text-xs text-slate-400">{c.brand}</div>
                  <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                    Dichte: {c.densityGPerMl ? `${c.densityGPerMl} g/ml` : 'Standard (1.0 g/ml)'}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {(showAddModal || editingPigment) && (
        <PigmentFormModal
          pigment={editingPigment}
          onSave={async (pigmentData) => {
            if (editingPigment?.id) {
              await onUpdatePigment(editingPigment.id, pigmentData);
            } else {
              await onSavePigment(pigmentData);
            }
            setShowAddModal(false);
            setEditingPigment(undefined);
          }}
          onDelete={onDeletePigment}
          onClose={() => {
            setShowAddModal(false);
            setEditingPigment(undefined);
          }}
        />
      )}
    </div>
  );
};

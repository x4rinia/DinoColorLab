import React, { useState } from 'react';
import { AlertTriangle, ShieldCheck, ChevronDown, ChevronUp, X } from 'lucide-react';

export const SafetyBanner: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  if (isDismissed) return null;

  return (
    <div className="w-full bg-amber-500/10 border-b border-amber-500/30 text-amber-900 dark:text-amber-200 px-4 py-2.5 transition-all text-xs sm:text-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 font-medium">
          <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500 shrink-0 animate-pulse" />
          <span>
            <strong>Wichtiger Sicherheitshinweis:</strong> Nur für direktziehende, nichtoxidative Haarfarben geeignet.
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1 text-amber-600 dark:text-amber-400 hover:underline text-xs font-semibold px-2 py-1 rounded bg-amber-500/10"
          >
            <span>{isExpanded ? 'Details verbergen' : 'Sicherheitsregeln'}</span>
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={() => setIsDismissed(true)}
            className="p-1 text-amber-500 hover:text-amber-700 dark:hover:text-amber-100 rounded"
            title="Schließen"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="max-w-7xl mx-auto mt-3 pt-3 border-t border-amber-500/20 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="flex items-start gap-2 bg-amber-500/5 p-2.5 rounded-xl">
            <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
            <div>
              <strong className="block font-semibold text-amber-800 dark:text-amber-300">1. Nur Direktzieher</strong>
              Verwende ausschließlich gebrauchsfertige, direktziehende Tönungen. Keine oxidativen Farben mit Entwickler (Peroxid) in den Rechner geben!
            </div>
          </div>

          <div className="flex items-start gap-2 bg-amber-500/5 p-2.5 rounded-xl">
            <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <strong className="block font-semibold text-amber-800 dark:text-amber-300">2. Teststrähne Pflicht</strong>
              Führe vor jeder Vollanwendung zwingend eine Teststrähne durch. Bildschirmfarben und digitale Modelle sind Näherungen.
            </div>
          </div>

          <div className="flex items-start gap-2 bg-amber-500/5 p-2.5 rounded-xl">
            <ShieldCheck className="w-4 h-4 text-cyan-500 shrink-0 mt-0.5" />
            <div>
              <strong className="block font-semibold text-amber-800 dark:text-amber-300">3. Verträglichkeitstest</strong>
              Beachte immer die Herstellerhinweise bezüglich Hautverträglichkeit und Allergietest (Patch-Test) 48h vor der Anwendung.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

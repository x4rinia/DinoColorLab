import React, { useState } from 'react';
import type { AppSettings } from '../../types';
import { db } from '../../db/database';
import { INITIAL_PIGMENTS, INITIAL_CONDITIONER, INITIAL_RECIPES, INITIAL_STRAND_TESTS } from '../../db/seedData';
import { DinoMascot } from '../common/DinoMascot';
import { Settings, Sun, Moon, Download, Upload, RotateCcw, ShieldCheck, Database, Check } from 'lucide-react';

interface EinstellungenTabProps {
  settings: AppSettings;
  onUpdateSettings: (newSettings: Partial<AppSettings>) => void;
  onReloadAllData: () => void;
}

export const EinstellungenTab: React.FC<EinstellungenTabProps> = ({
  settings,
  onUpdateSettings,
  onReloadAllData
}) => {
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 3500);
  };

  const handleExportFullDatabase = async () => {
    const pigments = await db.pigments.toArray();
    const conditioners = await db.conditioners.toArray();
    const recipes = await db.recipes.toArray();
    const strandTests = await db.strandTests.toArray();

    const dump = {
      version: 1,
      exportedAt: new Date().toISOString(),
      pigments,
      conditioners,
      recipes,
      strandTests,
      settings
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(dump, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `DinoColorLab_Backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    showNotification('Datenbank-Backup erfolgreich heruntergeladen!');
  };

  const handleRestoreFullDatabase = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const content = event.target?.result as string;
          const parsed = JSON.parse(content);
          if (parsed.pigments && parsed.recipes) {
            await db.pigments.clear();
            await db.conditioners.clear();
            await db.recipes.clear();
            await db.strandTests.clear();

            await db.pigments.bulkAdd(parsed.pigments);
            await db.conditioners.bulkAdd(parsed.conditioners || []);
            await db.recipes.bulkAdd(parsed.recipes || []);
            if (parsed.strandTests) await db.strandTests.bulkAdd(parsed.strandTests);

            onReloadAllData();
            showNotification('Datenbank erfolgreich wiederhergestellt!');
          } else {
            alert('Ungültiges Backup-Format.');
          }
        } catch (err) {
          alert('Fehler beim Einlesen des Backups.');
        }
      };
      reader.readAsText(file);
    }
  };

  const handleResetDemoData = async () => {
    if (confirm('Möchtest du alle Daten löschen und die Demo-Standardwerte wiederherstellen?')) {
      await db.pigments.clear();
      await db.conditioners.clear();
      await db.recipes.clear();
      await db.strandTests.clear();

      await db.pigments.bulkAdd(INITIAL_PIGMENTS);
      await db.conditioners.bulkAdd(INITIAL_CONDITIONER);
      await db.recipes.bulkAdd(INITIAL_RECIPES);
      await db.strandTests.bulkAdd(INITIAL_STRAND_TESTS);

      onReloadAllData();
      showNotification('Demo-Standarddaten wiederhergestellt!');
    }
  };

  return (
    <div className="space-y-6 pb-12 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2 text-white m-0">
            <Settings className="w-6 h-6 text-cyan-400" />
            <span>Einstellungen & Datenverwaltung</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            PWA-Konfiguration, Design, Waagen-Präzision & Lokale Datenbank.
          </p>
        </div>
        <DinoMascot size="md" expression="happy" />
      </div>

      {successMsg && (
        <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 rounded-2xl text-xs font-semibold flex items-center gap-2 animate-fade-in">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* App Settings Card */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-5">
        <h3 className="text-base font-bold text-slate-100 border-b border-slate-800 pb-2 m-0">
          Anwendungs-Einstellungen
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Theme */}
          <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-slate-300">Erscheinungsbild</div>
              <div className="text-xs text-slate-500 mt-0.5">
                {settings.theme === 'dark' ? 'Dunkelmodus aktiv' : 'Hellmodus aktiv'}
              </div>
            </div>
            <button
              onClick={() => onUpdateSettings({ theme: settings.theme === 'dark' ? 'light' : 'dark' })}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300"
            >
              {settings.theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-cyan-400" />}
            </button>
          </div>

          {/* Precision */}
          <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-slate-300">Waagen-Rundung</div>
              <div className="text-xs text-slate-500 mt-0.5">Rundung auf Gramm-Dezimalen</div>
            </div>
            <select
              value={settings.roundingPrecision}
              onChange={(e) =>
                onUpdateSettings({ roundingPrecision: parseFloat(e.target.value) as 0.1 | 0.01 })
              }
              className="bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-cyan-300 font-mono"
            >
              <option value="0.1">0.1 g (Feinwaage)</option>
              <option value="0.01">0.01 g (Laborwaage)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Database & Backup Card */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-5">
        <h3 className="text-base font-bold text-slate-100 flex items-center gap-2 border-b border-slate-800 pb-2 m-0">
          <Database className="w-5 h-5 text-cyan-400" />
          <span>Lokale Datenverwaltung (IndexedDB)</span>
        </h3>
        <p className="text-xs text-slate-400">
          Alle Pigmentprofile, Rezepte und Fotos werden ausschließlich lokal auf deinem Gerät gespeichert.
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            onClick={handleExportFullDatabase}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-cyan-300"
          >
            <Download className="w-4 h-4" />
            <span>Vollständiges Backup (JSON) exportieren</span>
          </button>

          <label className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-emerald-300 cursor-pointer">
            <Upload className="w-4 h-4" />
            <span>Backup wiederherstellen</span>
            <input type="file" accept=".json" onChange={handleRestoreFullDatabase} className="hidden" />
          </label>

          <button
            onClick={handleResetDemoData}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-xs font-semibold text-rose-300 ml-auto"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Demo-Daten zurücksetzen</span>
          </button>
        </div>
      </div>

      {/* PWA & Offline Status */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-3">
        <h3 className="text-base font-bold text-slate-100 flex items-center gap-2 border-b border-slate-800 pb-2 m-0">
          <ShieldCheck className="w-5 h-5 text-emerald-400" />
          <span>Progressive Web App (PWA) Status</span>
        </h3>
        <div className="text-xs text-slate-300 space-y-1">
          <div>• <strong>Offline-Modus:</strong> Aktiviert (ServiceWorker speichert App-Shell lokal).</div>
          <div>• <strong>Datenschutz:</strong> Keine Übertragung personenbezogener Daten oder Fotos an externe Server.</div>
          <div>• <strong>Kompatibilität:</strong> Funktioniert ohne Backend auf iPhone, iPad, Android & Desktop.</div>
        </div>
      </div>
    </div>
  );
};

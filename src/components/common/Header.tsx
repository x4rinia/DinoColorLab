import React from 'react';
import { DinoMascot } from './DinoMascot';
import { Download, Moon, Sun } from 'lucide-react';
import type { AppSettings } from '../../types';

interface HeaderProps {
  settings?: AppSettings;
  onUpdateSettings?: (newSettings: Partial<AppSettings>) => void;
  deferredInstallPrompt?: any;
  onInstallPwa?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  settings,
  onUpdateSettings,
  deferredInstallPrompt,
  onInstallPwa
}) => {
  const isDark = (settings?.theme ?? 'dark') === 'dark';

  const toggleTheme = () => {
    onUpdateSettings?.({ theme: isDark ? 'light' : 'dark' });
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 text-white px-4 py-3 transition-colors duration-200">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <DinoMascot size="sm" expression="happy" />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight bg-gradient-to-r from-blue-400 via-rose-400 to-amber-300 bg-clip-text text-transparent m-0 p-0 leading-none">
                Dino Color Lab
              </h1>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                v1.1 PWA
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium hidden sm:block m-0">
              Haarfarben-Mischassistent für Blau-, Rot-Pink- und Gelb-Pigmente & weiße Spülung
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Dunkel- / Hellmodus Umschalter (Schwarz / Weiß) */}
          <button
            type="button"
            onClick={toggleTheme}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl border transition-all cursor-pointer shadow-sm hover:scale-105 active:scale-95 bg-slate-800/90 border-slate-700 text-slate-200 hover:text-white"
            title={isDark ? 'Hintergrund auf Weiß (Hellmodus) umschalten' : 'Hintergrund auf Schwarz (Dunkelmodus) umschalten'}
          >
            {isDark ? (
              <>
                <Sun className="w-3.5 h-3.5 text-amber-400" />
                <span>Weiß</span>
              </>
            ) : (
              <>
                <Moon className="w-3.5 h-3.5 text-cyan-400" />
                <span>Schwarz</span>
              </>
            )}
          </button>

          {deferredInstallPrompt && (
            <button
              onClick={onInstallPwa}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-md shadow-cyan-500/20 transition-all"
              title="Als Web-App installieren"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">App installieren</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

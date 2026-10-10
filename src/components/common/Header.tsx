import React from 'react';
import { DinoMascot } from './DinoMascot';
import { Sun, Moon, Download } from 'lucide-react';
import type { AppSettings } from '../../types';

interface HeaderProps {
  settings: AppSettings;
  onUpdateSettings: (newSettings: Partial<AppSettings>) => void;
  deferredInstallPrompt?: any;
  onInstallPwa?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  settings,
  onUpdateSettings,
  deferredInstallPrompt,
  onInstallPwa
}) => {
  const toggleTheme = () => {
    onUpdateSettings({ theme: settings.theme === 'dark' ? 'light' : 'dark' });
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-900/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-800 text-white px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 cursor-pointer">
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
            <p className="text-xs text-slate-400 font-medium hidden sm:block">
              Haarfarben-Mischassistent für Blau-, Rot-Pink- und Gelb-Pigmente & weiße Spülung
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
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

          <button
            onClick={toggleTheme}
            className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 text-slate-300 hover:text-white transition-all shadow-inner"
            aria-label="Designmodus umschalten"
            title={settings.theme === 'dark' ? 'Hell-Modus aktivieren' : 'Dunkel-Modus aktivieren'}
          >
            {settings.theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400 animate-spin-slow" />
            ) : (
              <Moon className="w-4 h-4 text-cyan-400" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};

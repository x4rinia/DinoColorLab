import React from 'react';
import { FlaskConical, Palette, BookOpen, TestTube2, Settings } from 'lucide-react';

export type TabType = 'farblabor' | 'pigmente' | 'rezepte' | 'teststraehnen' | 'einstellungen';

interface NavigationProps {
  activeTab: TabType;
  onSelectTab: (tab: TabType) => void;
  recipeCount?: number;
  testCount?: number;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  onSelectTab,
  recipeCount = 0,
  testCount = 0
}) => {
  const tabs = [
    { id: 'farblabor' as TabType, label: 'Farblabor', icon: FlaskConical, badge: null },
    { id: 'pigmente' as TabType, label: 'Pigmente', icon: Palette, badge: null },
    { id: 'rezepte' as TabType, label: 'Meine Rezepte', icon: BookOpen, badge: recipeCount > 0 ? recipeCount : null },
    { id: 'teststraehnen' as TabType, label: 'Teststrähnen', icon: TestTube2, badge: testCount > 0 ? testCount : null },
    { id: 'einstellungen' as TabType, label: 'Einstellungen', icon: Settings, badge: null }
  ];

  return (
    <nav className="w-full bg-slate-900/90 border-b border-slate-800 text-slate-300 overflow-x-auto scrollbar-none sticky top-[57px] z-30">
      <div className="max-w-7xl mx-auto flex items-center justify-start md:justify-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 min-w-max">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl font-semibold text-xs sm:text-sm transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-gradient-to-r from-cyan-500/20 via-fuchsia-500/20 to-purple-500/20 text-cyan-300 border border-cyan-500/40 shadow-md shadow-cyan-500/10'
                  : 'hover:bg-slate-800/70 text-slate-400 hover:text-slate-200 border border-transparent'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400 animate-bounce-short' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
              {tab.badge !== null && (
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                    isActive ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};

import React from 'react';
import type { PigmentProfile, ConditionerProfile } from '../../types';
import { ShoppingBag, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';

interface PigmenteTabProps {
  pigments?: PigmentProfile[];
  conditioners?: ConditionerProfile[];
  onSavePigment?: (pigment: Omit<PigmentProfile, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  onUpdatePigment?: (id: number, pigment: Partial<PigmentProfile>) => Promise<void>;
  onDeletePigment?: (id: number) => Promise<void>;
  onSaveConditioner?: (conditioner: Omit<ConditionerProfile, 'id' | 'createdAt'>) => Promise<void>;
}

export const PigmenteTab: React.FC<PigmenteTabProps> = () => {
  const shoppingItems = [
    {
      id: 'blue',
      name: 'Echtes Blau (Direct Dye)',
      colorHex: '#1d4ed8',
      role: 'Kühles Primärpigment',
      why: 'Wichtigste Grundfarbe für alle Blau-, Türkis-, Violett-, Asch- und kühlen Grautöne.',
      brands: [
        'Directions: Atlantic Blue',
        'Manic Panic: Rockabilly Blue oder Shocking Blue',
        'Arctic Fox: Poseidon',
        'Headshot: Blue Scandal'
      ],
      tip: 'Achte darauf, ein echtes, sattes Primärblau zu kaufen – kein Türkis!'
    },
    {
      id: 'red_pink',
      name: 'Pinkstichiges Rot (Kühles Rot-Pink Direct Dye)',
      colorHex: '#e01a69',
      role: 'Pinkstichiges Kaltrot / Magenta',
      why: 'Unverzichtbar für leuchtende Pink-, Violett-, Flieder- und Beerentöne. Kühles Rot mischt mit Blau klares Violett, während warmes Orangerot schmutzig-braun werden würde.',
      brands: [
        'Directions: Cerise oder Carnation Pink',
        'Manic Panic: Hot Hot Pink oder Cleo Rose',
        'Arctic Fox: Virgin Pink',
        'I Heart Revolution: Pink Universe'
      ],
      tip: 'Ein kühles Rot mit deutlichem Pinkstich ist der Universalschlüssel für klare Mischfarben.'
    },
    {
      id: 'yellow',
      name: 'Leuchtendes Gelb (Direct Dye)',
      colorHex: '#facc15',
      role: 'Klares Sonnen- & Primärgelb',
      why: 'Bringt Wärme und Leuchtkraft. Mischt mit Rot zu Kupfer & Orange, mit Blau zu Grün, oder nuanciert Naturtöne wie Sand, Honig und Karamell.',
      brands: [
        'Directions: Bright Daffodil',
        'Manic Panic: Electric Banana oder Sunshine',
        'Arctic Fox: Cosmic Sunshine',
        'Headshot: Danger! Danger!'
      ],
      tip: 'Ein kräftiges Primärgelb ohne Grünstich wählen.'
    },
    {
      id: 'conditioner',
      name: 'Weiße Haarspülung (#FFFFFF)',
      colorHex: '#ffffff',
      isWhite: true,
      role: 'Farbloser Verdünnungs- & Pastell-Träger',
      why: 'Macht Direktzieher transluzent, hellt die Nuancen zu Pastelltönen auf und pflegt das Haar beim Tönen.',
      brands: [
        'Balea Feuchtigkeitsspülung (dm)',
        'Isana Pure Spülung (Rossmann)',
        'Alterra Feuchtigkeitsspülung (Rossmann)',
        'Jeder silikonfreie, weiße Conditioner'
      ],
      tip: 'Ganz wichtig: Die Spülung muss rein weiß sein (#FFFFFF), ohne Gelb-, Lila- oder Perlmuttstich!'
    }
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-950/80 via-slate-900 to-indigo-950/80 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold border border-blue-500/30 mb-2">
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Einkaufsliste fürs Farblabor</span>
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight m-0">
            Was du zum Selbermischen kaufen musst
          </h2>
          <p className="text-sm text-slate-300 max-w-xl mt-1.5">
            Du brauchst <strong>nur diese 4 Produkte</strong>: Drei direktziehende Grundfarben plus eine weiße Spülung. Damit kannst du jede Nuance von zartem Pastell bis hin zu Aschgrau und Braun selbst anrühren!
          </p>
        </div>

        <div className="hidden sm:flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-600/20 border border-blue-500/40 text-3xl shadow-inner">
          🛒
        </div>
      </div>

      {/* Die 4 Einkaufs-Karten */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {shoppingItems.map((item) => (
          <div
            key={item.id}
            className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 shadow-xl flex flex-col justify-between hover:border-slate-700 transition-all space-y-4"
          >
            <div>
              <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-2xl border-2 shadow-md shrink-0 flex items-center justify-center ${
                      item.isWhite ? 'border-slate-400 bg-white' : 'border-white/20'
                    }`}
                    style={item.isWhite ? {} : { backgroundColor: item.colorHex }}
                  />
                  <div>
                    <h3 className="text-base font-extrabold text-white m-0">{item.name}</h3>
                    <div className="text-xs text-blue-400 font-semibold">{item.role}</div>
                  </div>
                </div>
              </div>

              <div className="mt-3 space-y-3">
                <div>
                  <div className="text-xs font-bold text-slate-300 mb-1">Warum dieses Produkt?</div>
                  <p className="text-xs text-slate-400 leading-relaxed m-0">{item.why}</p>
                </div>

                <div className="bg-slate-950/60 p-3 rounded-2xl border border-slate-800/80 space-y-1.5">
                  <div className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
                    <span>Empfohlene Marken & Farbtöne:</span>
                  </div>
                  <ul className="text-xs text-slate-300 space-y-1 pl-4 list-disc m-0">
                    {item.brands.map((b, i) => (
                      <li key={i}>{b}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-2 bg-blue-950/30 p-2.5 rounded-xl border border-blue-500/20 text-[11px] text-blue-200">
              <Sparkles className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
              <span>{item.tip}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Zubehör & Spar-Tipp */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-5 text-xs text-slate-300 space-y-3">
        <h3 className="text-sm font-bold text-white flex items-center gap-2 m-0">
          <AlertCircle className="w-4 h-4 text-amber-400" />
          <span>Einfaches Zubehör daheim:</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-slate-400">
          <div className="bg-slate-950/50 p-3 rounded-2xl border border-slate-800">
            <strong className="text-slate-200 block mb-1">🥣 Schale & Pinsel</strong>
            Eine einfache Plastik- oder Glasschale (kein Metall!) und ein Haarfärbepinsel.
          </div>
          <div className="bg-slate-950/50 p-3 rounded-2xl border border-slate-800">
            <strong className="text-slate-200 block mb-1">🥄 Ess- & Teelöffel</strong>
            Ein Esslöffel (1 EL = 15 ml) und Teelöffel (1 TL = 5 ml) zum bequemen Dosieren deiner 40-ml-Mischung.
          </div>
          <div className="bg-slate-950/50 p-3 rounded-2xl border border-slate-800">
            <strong className="text-slate-200 block mb-1">🧤 Handschuhe</strong>
            Einweghandschuhe, da pure Farbpigmente Finger und Nägel sofort einfärben.
          </div>
        </div>
      </div>
    </div>
  );
};

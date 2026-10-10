import React, { useState } from 'react';
import type { ColorRecipe, PigmentProfile, ConditionerProfile } from '../../types';
import { RecipeDetailModal } from './RecipeDetailModal';
import { PrintRecipeView } from './PrintRecipeView';
import { BookOpen, Search, Upload, Plus, Star } from 'lucide-react';

interface RezepteTabProps {
  recipes: ColorRecipe[];
  pigments: PigmentProfile[];
  conditioners: ConditionerProfile[];
  onSaveRecipe: (recipe: Omit<ColorRecipe, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  onUpdateRecipe: (id: number, recipe: Partial<ColorRecipe>) => Promise<void>;
  onDeleteRecipe: (id: number) => Promise<void>;
  onNavigateToFarblabor: () => void;
}

export const RezepteTab: React.FC<RezepteTabProps> = ({
  recipes,
  pigments,
  conditioners,
  onSaveRecipe,
  onUpdateRecipe,
  onDeleteRecipe,
  onNavigateToFarblabor
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterFavoritesOnly, setFilterFavoritesOnly] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState<ColorRecipe | null>(null);
  const [printRecipe, setPrintRecipe] = useState<ColorRecipe | null>(null);

  const filteredRecipes = recipes.filter((r) => {
    if (filterFavoritesOnly && !r.isFavorite) return false;
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    const titleMatch = r.title.toLowerCase().includes(query);
    const descMatch = r.description?.toLowerCase().includes(query);
    const tagMatch = r.tags?.some((t) => t.toLowerCase().includes(query));
    return titleMatch || descMatch || tagMatch;
  });

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const content = event.target?.result as string;
          const parsed = JSON.parse(content);
          if (parsed.targetHex && parsed.ingredients && parsed.totalBatchGrams) {
            await onSaveRecipe({
              title: parsed.title || 'Importiertes Rezept',
              description: parsed.description || 'Aus JSON importiert.',
              targetHex: parsed.targetHex,
              cyanPigmentId: parsed.cyanPigmentId || 1,
              magentaPigmentId: parsed.magentaPigmentId || 2,
              yellowPigmentId: parsed.yellowPigmentId || 3,
              conditionerId: parsed.conditionerId || 1,
              totalBatchGrams: parsed.totalBatchGrams,
              ingredients: parsed.ingredients,
              baseHairColor: parsed.baseHairColor || { levelKey: 'bleached_level10', hex: '#fffbeb' },
              testStatus: 'untested',
              tags: parsed.tags || ['Importiert'],
              isFavorite: false
            });
            alert('Rezept erfolgreich importiert!');
          } else {
            alert('Ungültiges Rezept-Dateiformat.');
          }
        } catch (err) {
          alert('Fehler beim Parsen der JSON-Datei.');
        }
      };
      reader.readAsText(file);
    }
  };

  const handleExportJson = (r: ColorRecipe) => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(r, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `Recipe_${r.title.replace(/\s+/g, '_')}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleDuplicate = async (r: ColorRecipe) => {
    await onSaveRecipe({
      ...r,
      title: `${r.title} (Kopie)`
    });
    if (selectedRecipe) setSelectedRecipe(null);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Search & Actions Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2 text-white m-0">
            <BookOpen className="w-6 h-6 text-cyan-400" />
            <span>Rezeptbibliothek ({recipes.length})</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Verwalte, durchsuche und exportiere deine gespeicherten Haarfarben-Rezepte.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <label className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold cursor-pointer">
            <Upload className="w-4 h-4 text-emerald-400" />
            <span>JSON Import</span>
            <input type="file" accept=".json" onChange={handleImportJson} className="hidden" />
          </label>

          <button
            onClick={onNavigateToFarblabor}
            className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 font-semibold text-xs text-white rounded-xl shadow-md"
          >
            <Plus className="w-4 h-4" />
            <span>Neues Rezept erstellen</span>
          </button>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-950/60 p-3 rounded-2xl border border-slate-800">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Rezepte & Tags durchsuchen..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <button
          onClick={() => setFilterFavoritesOnly(!filterFavoritesOnly)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
            filterFavoritesOnly
              ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
              : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-slate-200'
          }`}
        >
          <Star className={`w-3.5 h-3.5 ${filterFavoritesOnly ? 'fill-amber-400' : ''}`} />
          <span>Nur Favoriten</span>
        </button>
      </div>

      {/* Recipe Grid */}
      {filteredRecipes.length === 0 ? (
        <div className="text-center py-12 bg-slate-900/40 rounded-3xl border border-slate-800 text-slate-400 space-y-2">
          <BookOpen className="w-10 h-10 mx-auto text-slate-600 mb-2" />
          <p className="font-semibold text-sm">Keine Rezepte gefunden.</p>
          <p className="text-xs text-slate-500">
            Erstelle deine erste Mischung im Farblabor oder ändere deinen Suchfilter.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredRecipes.map((recipe) => (
            <div
              key={recipe.id}
              onClick={() => setSelectedRecipe(recipe)}
              className="bg-slate-900/80 border border-slate-800 hover:border-cyan-500/50 rounded-3xl p-5 shadow-lg flex flex-col justify-between transition-all cursor-pointer group"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-2xl border-2 border-white/20 shadow-md shrink-0 group-hover:scale-105 transition-transform"
                      style={{ backgroundColor: recipe.targetHex }}
                    />
                    <div>
                      <h3 className="text-sm font-bold text-slate-100 group-hover:text-cyan-300 transition-colors m-0">
                        {recipe.title}
                      </h3>
                      <div className="text-xs font-mono text-slate-400 mt-0.5">{recipe.targetHex.toUpperCase()}</div>
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onUpdateRecipe(recipe.id!, { isFavorite: !recipe.isFavorite });
                    }}
                    className="text-slate-500 hover:text-amber-400 p-1"
                  >
                    <Star className={`w-4 h-4 ${recipe.isFavorite ? 'fill-amber-400 text-amber-400' : ''}`} />
                  </button>
                </div>

                {recipe.description && (
                  <p className="text-xs text-slate-400 line-clamp-2 mb-3 bg-slate-950/40 p-2 rounded-xl border border-slate-800/80">
                    {recipe.description}
                  </p>
                )}

                {/* Ingredients summary */}
                <div className="grid grid-cols-4 gap-1.5 text-center text-[10px] font-mono font-bold bg-slate-950/60 p-2 rounded-xl border border-slate-800 mb-3">
                  <div className="text-blue-300">Blau: {recipe.ingredients.cyanGrams}g</div>
                  <div className="text-rose-300">Rot-Pink: {recipe.ingredients.magentaGrams}g</div>
                  <div className="text-amber-300">Gelb: {recipe.ingredients.yellowGrams}g</div>
                  <div className="text-white">Sp: {recipe.ingredients.conditionerGrams}g</div>
                </div>

                {/* Tags */}
                {recipe.tags && recipe.tags.length > 0 && (
                  <div className="flex items-center gap-1 flex-wrap">
                    {recipe.tags.map((t, i) => (
                      <span key={i} className="px-2 py-0.5 rounded-md text-[9px] font-semibold bg-slate-800 text-slate-300">
                        #{t}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <span>{recipe.totalBatchGrams} g Batch</span>
                <span className="text-cyan-400 font-semibold group-hover:underline">Rezept öffnen ➔</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      {selectedRecipe && (
        <RecipeDetailModal
          recipe={selectedRecipe}
          pigments={pigments}
          conditioners={conditioners}
          onClose={() => setSelectedRecipe(null)}
          onDuplicate={handleDuplicate}
          onToggleFavorite={(id) => {
            const updated = !selectedRecipe.isFavorite;
            onUpdateRecipe(id, { isFavorite: updated });
            setSelectedRecipe({ ...selectedRecipe, isFavorite: updated });
          }}
          onDelete={onDeleteRecipe}
          onPrint={(r) => setPrintRecipe(r)}
          onExportJson={handleExportJson}
        />
      )}

      {/* Printable View */}
      {printRecipe && (
        <PrintRecipeView
          recipe={printRecipe}
          pigments={pigments}
          conditioners={conditioners}
          onClose={() => setPrintRecipe(null)}
        />
      )}
    </div>
  );
};

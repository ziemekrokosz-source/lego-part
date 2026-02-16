import React, { useState, useEffect, useCallback } from 'react';
import { Layout } from './components/Layout.tsx';
import { SetSearch } from './components/SetSearch.tsx';
import { SetCard } from './components/SetCard.tsx';
import { SetDetail } from './components/SetDetail.tsx';
import { fetchLegoSetData } from './services/geminiService.ts';
import { AppState } from './types.ts';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>(() => {
    const saved = localStorage.getItem('lego_part_master_state');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return { ...parsed, isSearching: false, error: null };
      } catch (e) {
        console.error("Failed to parse state", e);
      }
    }
    return {
      sets: [],
      activeSetId: null,
      isSearching: false,
      error: null
    };
  });

  useEffect(() => {
    localStorage.setItem('lego_part_master_state', JSON.stringify(state));
  }, [state]);

  const handleSearch = async (setNumber: string) => {
    setState(prev => ({ ...prev, isSearching: true, error: null }));
    try {
      const newSet = await fetchLegoSetData(setNumber);
      setState(prev => ({
        ...prev,
        sets: [newSet, ...prev.sets],
        activeSetId: newSet.id,
        isSearching: false
      }));
    } catch (err: any) {
      console.error(err);
      setState(prev => ({ 
        ...prev, 
        isSearching: false, 
        error: "BŁĄD: Nie znaleziono zestawu lub błąd połączenia." 
      }));
    }
  };

  const updatePart = useCallback((setId: string, partId: string, increment: boolean, setFull: boolean = false) => {
    setState(prev => ({
      ...prev,
      sets: prev.sets.map(set => {
        if (set.id !== setId) return set;
        return {
          ...set,
          lastModified: Date.now(),
          parts: set.parts.map(part => {
            if (part.id !== partId) return part;
            let newCount = part.collected;
            if (setFull) {
              newCount = part.quantity;
            } else {
              newCount = increment 
                ? Math.min(part.quantity, part.collected + 1)
                : Math.max(0, part.collected - 1);
            }
            return { ...part, collected: newCount };
          })
        };
      })
    }));
  }, []);

  const deleteSet = (setId: string) => {
    if (confirm('USUNĄĆ ZESTAW?')) {
      setState(prev => ({
        ...prev,
        sets: prev.sets.filter(s => s.id !== setId),
        activeSetId: prev.activeSetId === setId ? null : prev.activeSetId
      }));
    }
  };

  const activeSet = state.sets.find(s => s.id === state.activeSetId);

  return (
    <Layout>
      {state.error && (
        <div className="mb-6 bg-red-600 border-4 border-black text-white px-4 py-2 font-black uppercase flex items-center justify-between hard-shadow">
          <p className="text-xs">{state.error}</p>
          <button onClick={() => setState(p => ({ ...p, error: null }))} className="font-black text-xl">&times;</button>
        </div>
      )}

      {!activeSet ? (
        <>
          <section className="mb-10">
            <h1 className="text-3xl font-black uppercase tracking-tighter text-black">
              LEGO <span className="text-red-600">PartMaster</span>
            </h1>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest border-l-4 border-yellow-400 pl-3 mt-2">
              System Inwentaryzacji Klocków v2.0
            </p>
          </section>

          <SetSearch onSearch={handleSearch} isLoading={state.isSearching} />

          {state.sets.length > 0 && (
            <div className="mt-12">
              <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6 border-b-2 border-slate-300 pb-2">Moja Kolekcja</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {state.sets.map(set => (
                  <SetCard 
                    key={set.id} 
                    set={set} 
                    onClick={() => setState(p => ({ ...p, activeSetId: set.id }))}
                    onDelete={deleteSet}
                  />
                ))}
              </div>
            </div>
          )}
        </>
      ) : (
        <SetDetail 
          set={activeSet} 
          onUpdatePart={(partId, increment, setFull) => updatePart(activeSet.id, partId, increment, setFull)}
          onClose={() => setState(p => ({ ...p, activeSetId: null }))}
        />
      )}
    </Layout>
  );
};

export default App;
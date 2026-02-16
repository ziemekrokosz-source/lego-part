import React, { useState, useMemo } from 'react';
import { LegoSet, LegoPart } from '../types';

interface SetDetailProps {
  set: LegoSet;
  onUpdatePart: (partId: string, increment: boolean, setFull?: boolean) => void;
  onClose: () => void;
}

const PartImage: React.FC<{ part: LegoPart }> = ({ part }) => {
  const [imgSrc, setImgSrc] = useState(part.imageUrl);
  const [hasError, setHasError] = useState(false);

  const handleError = () => {
    if (!hasError && part.designId) {
      // Fallback: Jeśli serwer LEGO zawiedzie, spróbuj obrazka z BrickLink po DesignID
      setImgSrc(`https://img.bricklink.com/ItemImage/PN/0/${part.designId}.png`);
      setHasError(true);
    } else {
      setImgSrc(''); // Brak obrazka
    }
  };

  if (!imgSrc) {
    return <div className="w-full h-full flex flex-col items-center justify-center text-[7px] font-black bg-slate-100 text-slate-400 p-1">
      <span>NO IMG</span>
      <span>{part.designId}</span>
    </div>;
  }

  return (
    <img 
      src={imgSrc} 
      className="w-full h-full object-contain p-1" 
      alt={part.name} 
      onError={handleError}
    />
  );
};

type SortBy = 'name' | 'color' | 'id' | 'status';

export const SetDetail: React.FC<SetDetailProps> = ({ set, onUpdatePart, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<SortBy>('name');
  const [hideCompleted, setHideCompleted] = useState(false);
  
  const totalCollected = set.parts.reduce((acc, p) => acc + p.collected, 0);
  const totalRequired = set.parts.reduce((acc, p) => acc + p.quantity, 0);
  const progressPercent = Math.round((totalCollected / totalRequired) * 100) || 0;

  const processedParts = useMemo(() => {
    let list = [...set.parts];
    if (hideCompleted) list = list.filter(p => p.collected < p.quantity);
    if (searchTerm.trim()) {
      const lower = searchTerm.toLowerCase();
      list = list.filter(p => 
        p.name.toLowerCase().includes(lower) || 
        p.color.toLowerCase().includes(lower) ||
        (p.elementId && p.elementId.toLowerCase().includes(lower)) ||
        (p.designId && p.designId.toLowerCase().includes(lower))
      );
    }
    list.sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'color') return a.color.localeCompare(b.color);
      if (sortBy === 'id') return (a.elementId || '').localeCompare(b.elementId || '');
      if (sortBy === 'status') return (a.collected / a.quantity) - (b.collected / b.quantity);
      return 0;
    });
    return list;
  }, [set.parts, searchTerm, sortBy, hideCompleted]);

  return (
    <div className="flex flex-col gap-4 animate-in fade-in duration-300 pb-10">
      <div className="bg-white border-[3px] border-black p-4 hard-shadow flex flex-col md:flex-row items-center gap-6">
        <button onClick={onClose} className="bg-black text-white px-6 py-2 font-black uppercase text-xs hover:bg-red-600 transition-colors border-2 border-black">
          &larr; Powrót
        </button>
        <div className="flex-1 text-center md:text-left">
          <h2 className="text-2xl font-black uppercase tracking-tighter leading-none">
            {set.name} <span className="text-red-600">[{set.number}]</span>
          </h2>
          <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">Status: Aktywna Inwentaryzacja</p>
        </div>
        <div className="w-full md:w-72 bg-slate-100 border-2 border-black p-2">
          <div className="flex justify-between text-[10px] font-black uppercase mb-1 text-black">
            <span>Postęp kompletowania</span>
            <span>{progressPercent}%</span>
          </div>
          <div className="w-full bg-white h-5 border-2 border-black">
            <div className="bg-green-500 h-full transition-all duration-500" style={{ width: `${progressPercent}%` }} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-yellow-400 border-[3px] border-black p-4 hard-shadow">
            <h3 className="text-xs font-black uppercase mb-3 border-b-2 border-black pb-1">Filtry</h3>
            <div className="space-y-4">
              <input type="text" placeholder="SZUKAJ CZĘŚCI / ID..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-white border-2 border-black p-2 text-xs font-bold uppercase outline-none"/>
              <select className="w-full bg-white border-2 border-black p-2 text-xs font-bold uppercase outline-none" value={sortBy} onChange={(e) => setSortBy(e.target.value as SortBy)}>
                <option value="name">Nazwa (A-Z)</option>
                <option value="color">Kolor</option>
                <option value="id">ID Elementu</option>
                <option value="status">Ukończenie</option>
              </select>
              <label className="flex items-center gap-2 cursor-pointer bg-white border-2 border-black p-2 hover:bg-slate-50">
                <input type="checkbox" checked={hideCompleted} onChange={(e) => setHideCompleted(e.target.checked)} className="w-4 h-4 accent-black rounded-none border-2 border-black"/>
                <span className="text-[10px] font-black uppercase">Ukryj gotowe</span>
              </label>
            </div>
          </div>
        </div>

        <div className="lg:col-span-3">
          <div className="bg-white border-[3px] border-black hard-shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-slate-900 text-white text-[10px] font-black uppercase">
                    <th className="p-3 text-left w-24">Część</th>
                    <th className="p-3 text-left">Opis</th>
                    <th className="p-3 text-center w-56">Ilość</th>
                  </tr>
                </thead>
                <tbody className="divide-y-2 divide-black">
                  {processedParts.map((part) => (
                    <tr key={part.id} className={`hover:bg-yellow-50 ${part.collected >= part.quantity ? 'bg-green-50 opacity-60' : ''}`}>
                      <td className="p-2 border-r-2 border-black">
                        <div className="w-16 h-16 bg-white border border-slate-200">
                          <PartImage part={part} />
                        </div>
                      </td>
                      <td className="p-3 border-r-2 border-black">
                        <div className="flex flex-col">
                          <span className="text-xs font-black uppercase leading-tight">{part.name}</span>
                          <span className="text-[8px] font-bold px-1.5 py-0.5 bg-black text-white w-fit mt-1">{part.color}</span>
                          <div className="flex gap-2 mt-1">
                            {part.elementId && <span className="text-[8px] text-slate-400">EL: {part.elementId}</span>}
                            {part.designId && <span className="text-[8px] text-slate-400">DS: {part.designId}</span>}
                          </div>
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-1 justify-center">
                          <button onClick={() => onUpdatePart(part.id, false)} className="w-8 h-8 bg-white border-2 border-black font-black hover:bg-slate-100" disabled={part.collected === 0}>-</button>
                          <div className="w-16 text-center text-xs font-black">{part.collected}/{part.quantity}</div>
                          <button onClick={() => onUpdatePart(part.id, true)} className="w-8 h-8 bg-yellow-400 border-2 border-black font-black hover:bg-yellow-500" disabled={part.collected >= part.quantity}>+</button>
                          <button onClick={() => onUpdatePart(part.id, true, true)} className={`ml-2 px-2 py-1 text-[9px] font-black border-2 border-black transition-colors ${part.collected >= part.quantity ? 'bg-green-500' : 'bg-white hover:bg-green-200'}`}>OK</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
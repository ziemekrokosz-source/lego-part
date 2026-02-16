
import React from 'react';
import { LegoSet } from '../types';

interface SetCardProps {
  set: LegoSet;
  onClick: () => void;
  onDelete: (id: string) => void;
}

export const SetCard: React.FC<SetCardProps> = ({ set, onClick, onDelete }) => {
  const totalCollected = set.parts.reduce((acc, p) => acc + p.collected, 0);
  const totalRequired = set.parts.reduce((acc, p) => acc + p.quantity, 0);
  const progressPercent = Math.round((totalCollected / totalRequired) * 100) || 0;

  return (
    <div 
      className="bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all cursor-pointer flex flex-col" 
      onClick={onClick}
    >
      <div className="relative aspect-video border-b-2 border-black overflow-hidden">
        <img src={set.imageUrl} alt={set.name} className="w-full h-full object-cover grayscale-[0.2] contrast-125" />
        <div className="absolute top-2 left-2 bg-yellow-400 border border-black px-2 py-0.5 text-[10px] font-black uppercase">
          {set.number}
        </div>
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onDelete(set.id);
          }}
          className="absolute top-2 right-2 w-6 h-6 bg-white border border-black hover:bg-red-600 hover:text-white transition-colors flex items-center justify-center font-bold"
        >
          &times;
        </button>
      </div>
      <div className="p-3 flex-1 flex flex-col justify-between">
        <div>
          <span className="text-[9px] font-bold text-slate-400 uppercase leading-none">{set.theme}</span>
          <h3 className="text-sm font-black uppercase leading-tight mt-0.5 truncate">{set.name}</h3>
        </div>
        <div className="mt-4">
          <div className="w-full bg-slate-200 h-4 border-2 border-black relative overflow-hidden">
            <div 
              className="bg-green-500 h-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
            <span className="absolute inset-0 flex items-center justify-center text-[9px] font-black text-black mix-blend-difference">
              {progressPercent}% COMPLETE
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

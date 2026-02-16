
import React, { useState } from 'react';

interface SetSearchProps {
  onSearch: (setNumber: string) => void;
  isLoading: boolean;
}

export const SetSearch: React.FC<SetSearchProps> = ({ onSearch, isLoading }) => {
  const [setNumber, setSetNumber] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (setNumber.trim()) {
      onSearch(setNumber.trim());
      setSetNumber('');
    }
  };

  return (
    <section className="bg-white border-4 border-black p-6 mb-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
      <h2 className="text-sm font-black uppercase mb-4 tracking-widest text-slate-400">Add Set to Inventory</h2>
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-0">
        <input
          type="text"
          value={setNumber}
          onChange={(e) => setSetNumber(e.target.value)}
          placeholder="SET NUMBER (e.g. 10305)"
          className="flex-1 px-4 py-3 bg-slate-50 border-2 border-black font-bold uppercase placeholder:text-slate-300 outline-none focus:bg-white transition-colors"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading || !setNumber.trim()}
          className="bg-red-600 hover:bg-red-700 disabled:bg-slate-300 text-white px-8 py-3 font-black uppercase border-2 border-l-0 border-black transition-all active:translate-x-1 active:translate-y-1 active:shadow-none"
        >
          {isLoading ? 'Processing...' : 'Sync Database'}
        </button>
      </form>
    </section>
  );
};

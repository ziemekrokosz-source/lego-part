import React, { useState, useEffect } from 'react';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    });
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') setDeferredPrompt(null);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-yellow-400 border-b-4 border-black sticky top-0 z-50">
        <div className="max-w-[1400px] mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-red-600 border-2 border-black flex items-center justify-center shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              <div className="grid grid-cols-2 gap-1">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="w-2 h-2 bg-white/30 rounded-full"></div>
                ))}
              </div>
            </div>
            <div className="flex flex-col">
              <h1 className="text-xl font-black uppercase tracking-tighter text-black leading-none">
                PartMaster <span className="text-xs bg-black text-white px-1 ml-1">v2.6</span>
              </h1>
              <span className="text-[8px] font-black text-black bg-white border border-black px-1 mt-1 w-fit">CLOUD READY</span>
            </div>
          </div>
          <nav className="flex items-center gap-4">
            {deferredPrompt && (
              <button 
                onClick={handleInstall}
                className="bg-blue-600 text-white border-2 border-black px-3 py-1 font-black text-[10px] uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[-1px] transition-all"
              >
                Instaluj na PC
              </button>
            )}
            <div className="hidden md:flex items-center gap-2 bg-white border-2 border-black px-2 py-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-[9px] font-black uppercase">Online System</span>
            </div>
          </nav>
        </div>
      </header>
      <main className="flex-1 max-w-[1400px] mx-auto w-full px-4 py-6">
        {children}
      </main>
      <footer className="bg-white border-t-4 border-black py-4">
        <div className="max-w-[1400px] mx-auto px-4 flex justify-between items-center text-[10px] font-bold uppercase text-slate-500">
          <div className="flex gap-4">
            <span>BrickLink API Integrated</span>
            <span className="text-blue-600">PWA Manifest: OK</span>
          </div>
          <span>&copy; 2024 LEGO Part Master System</span>
        </div>
      </footer>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { ToolType } from './types';
import { Icons } from './constants';
import Clipper from './components/Clipper';
import ScreenshotEditor from './components/ScreenshotEditor';
import Downloader from './components/Downloader';

const App: React.FC = () => {
  const [activeTool, setActiveTool] = useState<ToolType>(ToolType.NONE);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const renderHome = () => (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 text-center space-y-16">
      <div className="space-y-4 animate-in fade-in zoom-in duration-1000">
        <h1 className="text-[12vw] font-bankai font-extrabold leading-none tracking-tighter uppercase relative select-none">
          <span className="text-multi-color">Bankai</span>
          <span className="absolute -top-4 -right-8 text-xs bg-white text-black px-2 py-1 rounded font-bold tracking-widest shadow-lg shadow-white/5">v3.0</span>
        </h1>
        <p className="text-zinc-500 text-xl max-w-2xl mx-auto font-light">
          Forging the next generation of creative AI instruments. <br/>Precision editing. Viral creation. No limits.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl px-4 animate-in slide-in-from-bottom-12 duration-1000 delay-300">
        <button 
          onClick={() => setActiveTool(ToolType.CLIPPER)}
          className="group relative p-10 glass rounded-[40px] text-left border border-white/5 hover:border-blue-500/50 transition-all duration-500"
        >
          <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform duration-500">
            <Icons.Clipper />
          </div>
          <h3 className="text-3xl font-bankai font-bold text-white uppercase">Clipper</h3>
          <p className="text-zinc-400 font-medium">Auto-generate vertical shorts from raw files with high-retention AI captions.</p>
        </button>

        <button 
          onClick={() => setActiveTool(ToolType.DOWNLOAD)}
          className="group relative p-10 glass rounded-[40px] text-left border border-white/5 hover:border-purple-500/50 transition-all duration-500"
        >
          <div className="w-12 h-12 bg-purple-600 rounded-2xl flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform duration-500">
            <Icons.Download />
          </div>
          <h3 className="text-3xl font-bankai font-bold text-white uppercase">Download</h3>
          <p className="text-zinc-400 font-medium">Rip content directly from YouTube, Shorts, and IG without any restrictions.</p>
        </button>

        <button 
          onClick={() => setActiveTool(ToolType.SCREENSHOT)}
          className="group relative p-10 glass rounded-[40px] text-left border border-white/5 hover:border-amber-500/50 transition-all duration-500"
        >
          <div className="w-12 h-12 bg-amber-600 rounded-2xl flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform duration-500">
            <Icons.Edit />
          </div>
          <h3 className="text-3xl font-bankai font-bold text-white uppercase">Edit SS</h3>
          <p className="text-zinc-400 font-medium">Change text within images using precise font-matching and AI inpainting.</p>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-purple-500 selection:text-white relative">
      <nav className="fixed top-0 left-0 right-0 z-50 p-6 flex justify-between items-center glass border-b border-white/5">
        <div onClick={() => setActiveTool(ToolType.NONE)} className="font-bankai text-2xl font-black cursor-pointer tracking-tighter uppercase">
          <span className="text-multi-color">BANKAI</span>
        </div>
        <div className="flex gap-4">
          <button onClick={() => setActiveTool(ToolType.CLIPPER)} className={`text-xs font-bold uppercase tracking-widest ${activeTool === ToolType.CLIPPER ? 'text-white' : 'text-zinc-500'}`}>Clipper</button>
          <button onClick={() => setActiveTool(ToolType.DOWNLOAD)} className={`text-xs font-bold uppercase tracking-widest ${activeTool === ToolType.DOWNLOAD ? 'text-white' : 'text-zinc-500'}`}>Download</button>
          <button onClick={() => setActiveTool(ToolType.SCREENSHOT)} className={`text-xs font-bold uppercase tracking-widest ${activeTool === ToolType.SCREENSHOT ? 'text-white' : 'text-zinc-500'}`}>Edit</button>
        </div>
      </nav>

      <main className="pt-24 pb-12 px-6">
        {activeTool === ToolType.NONE && renderHome()}
        {activeTool === ToolType.CLIPPER && <Clipper />}
        {activeTool === ToolType.DOWNLOAD && <Downloader />}
        {activeTool === ToolType.SCREENSHOT && <ScreenshotEditor />}
      </main>

      {activeTool !== ToolType.NONE && (
        <button onClick={() => setActiveTool(ToolType.NONE)} className="fixed bottom-10 left-10 p-4 rounded-full glass border border-white/10 hover:bg-white/5 transition-all z-50">
          <Icons.Back />
        </button>
      )}
    </div>
  );
};

export default App;

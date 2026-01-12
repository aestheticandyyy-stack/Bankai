
import React, { useState } from 'react';

const Downloader: React.FC = () => {
  const [url, setUrl] = useState('');
  const [status, setStatus] = useState<'idle' | 'searching' | 'ready'>('idle');

  const handleSearch = () => {
    if (!url) return;
    setStatus('searching');
    // Simulate deep link extraction
    setTimeout(() => setStatus('ready'), 2500);
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6 space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="text-center space-y-4">
        <h2 className="text-5xl font-bankai font-bold text-white uppercase tracking-tighter">
          BANKAI <span className="text-multi-color">DOWNLOAD</span>
        </h2>
        <p className="text-zinc-400 max-w-xl mx-auto">
          Rip high-quality MP4/MP3 directly from any social platform. No ads, no limits.
        </p>
      </div>

      <div className="glass p-10 rounded-[40px] border border-white/10 space-y-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-multi-color opacity-10 blur-3xl" />
        
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Paste YouTube/Shorts/Instagram Link..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 text-white focus:outline-none focus:border-white transition-all text-xl font-medium"
          />
          <button
            onClick={handleSearch}
            disabled={status === 'searching' || !url}
            className="w-full bg-white text-black font-black py-5 rounded-2xl transition-all hover:bg-zinc-200 disabled:opacity-50 text-lg uppercase tracking-widest"
          >
            {status === 'searching' ? 'Intercepting Stream...' : 'Analyze Link'}
          </button>
        </div>

        {status === 'ready' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in zoom-in duration-300">
            <a 
              href={`https://cobalt.tools/api/proxy?url=${encodeURIComponent(url)}`} // Using Cobalt as a gateway helper
              target="_blank"
              className="p-6 rounded-3xl bg-blue-600/20 border border-blue-500/30 flex flex-col items-center justify-center hover:bg-blue-600/30 transition-all group"
            >
              <span className="text-blue-400 font-black text-2xl uppercase">Video HD</span>
              <span className="text-blue-300/50 text-xs mt-2 font-bold">1080P • MP4</span>
            </a>
            <a 
              href={`https://cobalt.tools/api/proxy?url=${encodeURIComponent(url)}&isAudioOnly=true`}
              target="_blank"
              className="p-6 rounded-3xl bg-purple-600/20 border border-purple-500/30 flex flex-col items-center justify-center hover:bg-purple-600/30 transition-all"
            >
              <span className="text-purple-400 font-black text-2xl uppercase">Audio only</span>
              <span className="text-purple-300/50 text-xs mt-2 font-bold">320KBPS • MP3</span>
            </a>
          </div>
        )}
      </div>

      <div className="flex justify-center gap-12 opacity-30 grayscale">
        <img src="https://upload.wikimedia.org/wikipedia/commons/e/ef/Youtube_logo.png" className="h-6" alt="YT" />
        <img src="https://upload.wikimedia.org/wikipedia/commons/a/a5/Instagram_icon.png" className="h-6" alt="IG" />
        <img src="https://upload.wikimedia.org/wikipedia/en/a/a9/TikTok_logo.svg" className="h-6" alt="TT" />
      </div>
    </div>
  );
};

export default Downloader;

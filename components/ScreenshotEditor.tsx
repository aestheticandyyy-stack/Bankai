
import React, { useState, useRef } from 'react';
import { editScreenshotText } from '../services/geminiService';

const ScreenshotEditor: React.FC = () => {
  const [image, setImage] = useState<string | null>(null);
  const [editedImage, setEditedImage] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImage(event.target?.result as string);
        setEditedImage(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProcess = async () => {
    if (!image || !prompt) return;
    setIsProcessing(true);
    try {
      const result = await editScreenshotText(image, prompt);
      if (result) {
        setEditedImage(result);
      } else {
        alert("Could not process the image. Try a different instruction.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto p-6 space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="text-center space-y-4">
        <h2 className="text-5xl font-bankai font-bold text-white uppercase tracking-tighter">
          Ghost <span className="text-amber-500">Edit</span>
        </h2>
        <p className="text-zinc-400 max-w-xl mx-auto">
          Modify text within any image using seamless font-matching AI. Perfect for screenshots, signs, and professional documents.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Upload & Instructions */}
        <div className="space-y-6">
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="aspect-video bg-zinc-900/50 border-2 border-dashed border-white/10 rounded-3xl flex flex-col items-center justify-center cursor-pointer hover:border-amber-500/50 transition-all group overflow-hidden relative"
          >
            {image ? (
              <img src={image} className="w-full h-full object-contain" alt="Upload" />
            ) : (
              <>
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-zinc-500">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 12 12M12 3v13.5" />
                  </svg>
                </div>
                <p className="text-sm font-bold text-zinc-500">Click to upload screenshot</p>
              </>
            )}
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              className="hidden" 
              accept="image/*"
            />
          </div>

          <div className="glass p-6 rounded-3xl space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-500">Instructions</h3>
            <textarea
              placeholder="e.g., Change the text 'STOP' to 'GO' while keeping the font exactly the same."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500 transition-all min-h-[120px]"
            />
            <button
              onClick={handleProcess}
              disabled={isProcessing || !image || !prompt}
              className="w-full bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white font-bold py-4 rounded-xl transition-all shadow-xl shadow-amber-900/10"
            >
              {isProcessing ? 'Rewriting Reality...' : 'Transform Image'}
            </button>
          </div>
        </div>

        {/* Result Area */}
        <div className="space-y-6">
          <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-500 flex items-center">
            Result Preview
            {editedImage && <span className="ml-2 px-2 py-0.5 bg-green-500/20 text-green-500 rounded text-[10px]">AI Enhanced</span>}
          </h3>
          <div className="aspect-video bg-zinc-900 rounded-3xl overflow-hidden border border-white/5 flex items-center justify-center relative">
            {editedImage ? (
              <>
                <img src={editedImage} className="w-full h-full object-contain" alt="Edited Result" />
                <button 
                  onClick={() => {
                    const link = document.createElement('a');
                    link.href = editedImage;
                    link.download = 'bankai-edit.png';
                    link.click();
                  }}
                  className="absolute bottom-6 right-6 bg-white text-black px-6 py-2 rounded-full font-bold shadow-2xl hover:scale-105 transition-transform"
                >
                  Download
                </button>
              </>
            ) : (
              <div className="text-center px-8">
                <p className="text-zinc-600 text-sm">Your transformed image will appear here after processing.</p>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="glass p-4 rounded-2xl">
              <p className="text-xs font-bold text-zinc-600 uppercase mb-1">Font Detection</p>
              <p className="text-zinc-400 text-xs">Matches Weight, Tracking, and Serif style automatically.</p>
            </div>
            <div className="glass p-4 rounded-2xl">
              <p className="text-xs font-bold text-zinc-600 uppercase mb-1">Inpainting</p>
              <p className="text-zinc-400 text-xs">Replaces backgrounds seamlessly without artifacts.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScreenshotEditor;

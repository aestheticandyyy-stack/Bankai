
import React, { useState, useRef, useEffect } from 'react';
import { analyzeRealVideoFrames, generateTimedCaptionsForClip } from '../services/geminiService';
import { VideoClip, CaptionStyle } from '../types';
import { CAPTION_STYLES, Icons } from '../constants';

const Clipper: React.FC = () => {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoSrc, setVideoSrc] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isRendering, setIsRendering] = useState(false);
  const [clips, setClips] = useState<VideoClip[]>([]);
  const [selectedClip, setSelectedClip] = useState<VideoClip | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<CaptionStyle>(CAPTION_STYLES[0]);
  const [isRecording, setIsRecording] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setVideoFile(file);
      setVideoSrc(URL.createObjectURL(file));
      setClips([]);
      setSelectedClip(null);
    }
  };

  const extractFrames = async (videoUrl: string): Promise<string[]> => {
    return new Promise((resolve) => {
      const v = document.createElement('video');
      v.src = videoUrl;
      v.crossOrigin = 'anonymous';
      v.muted = true;
      v.onloadeddata = async () => {
        const frames: string[] = [];
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d')!;
        canvas.width = 320; // Lower res for AI processing
        canvas.height = 180;
        
        // Extract 8 frames spread across the video
        for (let i = 0; i < 8; i++) {
          v.currentTime = (v.duration / 8) * i;
          await new Promise(r => setTimeout(r, 200));
          ctx.drawImage(v, 0, 0, canvas.width, canvas.height);
          frames.push(canvas.toDataURL('image/jpeg', 0.6));
        }
        resolve(frames);
      };
    });
  };

  const handleAnalyze = async () => {
    if (!videoSrc) return;
    setIsAnalyzing(true);
    try {
      const frames = await extractFrames(videoSrc);
      const results = await analyzeRealVideoFrames(frames);
      setClips(results);
    } catch (err) {
      console.error(err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const processClip = async (clip: VideoClip) => {
    setIsRendering(true);
    try {
      const duration = clip.endTimeSeconds - clip.startTimeSeconds;
      const captions = await generateTimedCaptionsForClip(clip.description, duration);
      setSelectedClip({ ...clip, captions, duration });
      
      if (videoRef.current) {
        videoRef.current.currentTime = clip.startTimeSeconds;
      }

      setTimeout(() => {
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
      }, 500);
    } catch (err) {
      console.error(err);
    } finally {
      setIsRendering(false);
    }
  };

  // Canvas Render Loop with Captions
  useEffect(() => {
    if (!selectedClip || !canvasRef.current || !videoRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    const render = () => {
      const v = videoRef.current!;
      if (!v) return;

      // Draw Video to Canvas (Vertical Crop)
      const scale = canvas.height / v.videoHeight;
      const xOffset = (canvas.width - v.videoWidth * scale) / 2;
      ctx.drawImage(v, xOffset, 0, v.videoWidth * scale, canvas.height);

      // Draw Captions
      if (selectedClip.captions) {
        const relTime = v.currentTime - selectedClip.startTimeSeconds;
        const currentWord = selectedClip.captions.find(w => relTime >= w.start && relTime <= w.end);

        if (currentWord) {
          ctx.save();
          ctx.font = `bold 70px ${selectedStyle.font}`;
          ctx.textAlign = 'center';
          ctx.fillStyle = selectedStyle.color;
          ctx.shadowColor = 'black';
          ctx.shadowBlur = 10;
          
          const text = selectedStyle.case === 'uppercase' ? currentWord.word.toUpperCase() : currentWord.word;
          
          // Simple "Pop" animation
          const age = relTime - currentWord.start;
          const scale = Math.min(1.2, 1 + age * 2);
          ctx.translate(canvas.width / 2, canvas.height * 0.7);
          ctx.scale(scale, scale);
          ctx.fillText(text, 0, 0);
          ctx.restore();
        }
      }

      // Loop clip logic
      if (v.currentTime >= selectedClip.endTimeSeconds) {
        v.currentTime = selectedClip.startTimeSeconds;
      }

      animationId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationId);
  }, [selectedClip, selectedStyle]);

  const startExport = () => {
    if (!canvasRef.current || !videoRef.current) return;
    setIsRecording(true);
    chunksRef.current = [];
    const stream = canvasRef.current.captureStream(30);
    const recorder = new MediaRecorder(stream, { mimeType: 'video/webm' });

    recorder.ondataavailable = (e) => chunksRef.current.push(e.data);
    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: 'video/webm' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `bankai_clip_${Date.now()}.webm`;
      a.click();
      setIsRecording(false);
    };

    recorder.start();
    videoRef.current.currentTime = selectedClip!.startTimeSeconds;
    videoRef.current.play();

    // Record for the duration of the clip
    setTimeout(() => {
      recorder.stop();
    }, (selectedClip!.endTimeSeconds - selectedClip!.startTimeSeconds) * 1000);
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-6 space-y-12 pb-32">
      <div className="text-center space-y-4">
        <h2 className="text-6xl font-bankai font-bold uppercase tracking-tighter">
          CLIPPER <span className="text-multi-color">v3</span>
        </h2>
        <p className="text-zinc-400 max-w-xl mx-auto">
          Neural frame analysis. Real video cutting. Professional exports.
        </p>
      </div>

      <div className="glass p-10 rounded-[40px] border border-white/10 flex flex-col gap-8 items-center text-center">
        {!videoSrc ? (
          <div className="w-full h-64 border-2 border-dashed border-white/10 rounded-3xl flex flex-col items-center justify-center cursor-pointer hover:border-white/30 transition-all relative">
            <input type="file" accept="video/*" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer" />
            <div className="text-zinc-500 space-y-2">
              <p className="font-bold text-xl uppercase tracking-widest">Upload Video Source</p>
              <p className="text-xs">MP4, MOV, or WEBM (Max 50MB recommended)</p>
            </div>
          </div>
        ) : (
          <div className="w-full flex flex-col md:flex-row gap-6 items-center">
             <div className="w-full md:w-1/3 aspect-video bg-black rounded-2xl overflow-hidden border border-white/10">
               <video src={videoSrc} className="w-full h-full object-cover" controls />
             </div>
             <div className="flex-1 space-y-4 text-left">
               <h3 className="text-2xl font-bold">{videoFile?.name}</h3>
               <div className="flex gap-4">
                 <button onClick={handleAnalyze} disabled={isAnalyzing} className="px-8 py-4 bg-white text-black font-black rounded-xl uppercase tracking-widest text-sm hover:scale-105 transition-all">
                   {isAnalyzing ? 'Spectral Analysis...' : 'Deep AI Analysis'}
                 </button>
                 <button onClick={() => {setVideoSrc(''); setVideoFile(null); setClips([]);}} className="px-8 py-4 bg-white/5 border border-white/10 text-white rounded-xl font-bold uppercase tracking-widest text-xs">Clear</button>
               </div>
             </div>
          </div>
        )}
      </div>

      {clips.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {clips.map(clip => (
            <div key={clip.id} onClick={() => processClip(clip)} className="glass p-6 rounded-3xl border border-white/5 cursor-pointer hover:border-blue-500/50 group transition-all">
              <div className="text-blue-400 text-[10px] font-black uppercase mb-2">Segment Alpha • {clip.score}% Viral</div>
              <h4 className="font-bold text-lg leading-tight mb-4 group-hover:text-blue-400 transition-colors">{clip.description}</h4>
              <div className="flex justify-between items-center text-xs font-mono text-zinc-500">
                <span>START: {clip.startTimeSeconds}s</span>
                <span>END: {clip.endTimeSeconds}s</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {isRendering && <div className="py-20 text-center animate-pulse"><p className="text-multi-color font-bankai text-3xl font-black uppercase">Forging Metadata...</p></div>}

      {selectedClip && !isRendering && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 pt-12 border-t border-white/10">
          <div className="lg:col-span-4 space-y-8">
            <h3 className="text-xs font-black uppercase tracking-[0.4em] text-zinc-500">Physics Engine</h3>
            <div className="flex flex-col gap-3">
              {CAPTION_STYLES.map(s => (
                <button key={s.id} onClick={() => setSelectedStyle(s)} className={`p-5 rounded-2xl border text-left transition-all ${selectedStyle.id === s.id ? 'border-white bg-white/10' : 'border-white/5 bg-white/5 hover:border-white/10'}`}>
                  <p className="font-bold text-xl" style={{fontFamily: s.font, color: s.color}}>{s.name}</p>
                </button>
              ))}
            </div>
            <button 
              onClick={startExport} 
              disabled={isRecording}
              className="w-full bg-multi-color text-white font-black py-5 rounded-3xl shadow-2xl hover:scale-[1.02] transition-all uppercase tracking-widest"
            >
              {isRecording ? 'Capturing Stream...' : 'Export High Def'}
            </button>
          </div>

          <div className="lg:col-span-8 flex flex-col items-center">
            <div className="w-[360px] aspect-[9/16] bg-black rounded-[40px] overflow-hidden border-8 border-zinc-900 shadow-2xl relative">
              <video ref={videoRef} src={videoSrc} className="hidden" muted loop />
              <canvas ref={canvasRef} width={720} height={1280} className="w-full h-full object-cover" />
              <div className="absolute inset-x-0 bottom-10 px-8 text-center">
                 <div className="bg-black/60 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 inline-block">
                    <span className="text-[10px] font-black uppercase text-multi-color tracking-widest">Neural Render Engine v3.0.4</span>
                 </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Clipper;

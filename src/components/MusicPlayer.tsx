import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, SkipForward, SkipBack, Volume2, VolumeX } from 'lucide-react';

const TRACKS = [
  { id: 1, title: "NEON PULSE", artist: "AI SYNTH", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" },
  { id: 2, title: "CYBERNETIC DREAMS", artist: "AI SYNTH", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3" },
  { id: 3, title: "DIGITAL HORIZON", artist: "AI SYNTH", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3" },
];

export default function MusicPlayer() {
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const currentTrack = TRACKS[currentTrackIndex];

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(e => console.error("Audio play failed:", e));
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, currentTrackIndex]);

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const nextTrack = () => {
    setCurrentTrackIndex((prev) => (prev + 1) % TRACKS.length);
    setIsPlaying(true);
  };

  const prevTrack = () => {
    setCurrentTrackIndex((prev) => (prev - 1 + TRACKS.length) % TRACKS.length);
    setIsPlaying(true);
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const current = audioRef.current.currentTime;
      const duration = audioRef.current.duration;
      if (duration > 0) {
        setProgress((current / duration) * 100);
      }
    }
  };

  const handleTrackEnd = () => {
    nextTrack();
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newProgress = parseFloat(e.target.value);
    setProgress(newProgress);
    if (audioRef.current) {
      audioRef.current.currentTime = (newProgress / 100) * audioRef.current.duration;
    }
  };

  return (
    <div className="bg-black border-2 border-[#f0f] p-6 shadow-[0_0_20px_rgba(255,0,255,0.4)] w-full max-w-md mx-auto flex flex-col gap-4 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none border-[1px] border-[#0ff] opacity-50 m-1" />
      <audio
        ref={audioRef}
        src={currentTrack.url}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleTrackEnd}
      />
      
      <div className="flex items-center justify-between z-10">
        <div>
          <h3 className="text-[#f0f] font-bold text-sm tracking-widest drop-shadow-[0_0_8px_rgba(255,0,255,0.8)]" style={{fontFamily: 'var(--font-pixel)'}}>{currentTrack.title}</h3>
          <p className="text-[#0ff] text-[10px] mt-2" style={{fontFamily: 'var(--font-pixel)'}}>{currentTrack.artist}</p>
        </div>
        <div className="w-10 h-10 bg-black border-2 border-[#0ff] flex items-center justify-center shadow-[0_0_15px_rgba(0,255,255,0.5)]">
          <div className={`w-4 h-4 bg-[#f0f] ${isPlaying ? 'animate-pulse' : ''}`} style={{ animationDuration: '0.5s' }} />
        </div>
      </div>

      <div className="space-y-1 z-10 mt-2">
        <input
          type="range"
          min="0"
          max="100"
          value={progress || 0}
          onChange={handleSeek}
          className="w-full h-2 bg-black border border-[#0ff] appearance-none cursor-pointer accent-[#f0f]"
        />
      </div>

      <div className="flex items-center justify-between pt-4 z-10">
        <button 
          onClick={toggleMute}
          className="text-[#0ff] hover:text-[#f0f] transition-colors"
        >
          {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
        </button>
        
        <div className="flex items-center gap-6">
          <button 
            onClick={prevTrack}
            className="text-[#0ff] hover:text-[#f0f] transition-colors hover:drop-shadow-[0_0_8px_rgba(255,0,255,0.8)]"
          >
            <SkipBack size={24} />
          </button>
          
          <button 
            onClick={togglePlayPause}
            className="w-12 h-12 flex items-center justify-center bg-black border-2 border-[#f0f] text-[#f0f] hover:bg-[#f0f] hover:text-black transition-all shadow-[0_0_15px_rgba(255,0,255,0.4)] hover:shadow-[0_0_20px_rgba(255,0,255,0.8)]"
          >
            {isPlaying ? <Pause size={24} /> : <Play size={24} className="ml-1" />}
          </button>
          
          <button 
            onClick={nextTrack}
            className="text-[#0ff] hover:text-[#f0f] transition-colors hover:drop-shadow-[0_0_8px_rgba(255,0,255,0.8)]"
          >
            <SkipForward size={24} />
          </button>
        </div>
        
        <div className="w-5" /> {/* Spacer for balance */}
      </div>
    </div>
  );
}

import React from 'react';
import SnakeGame from './components/SnakeGame';
import MusicPlayer from './components/MusicPlayer';

export default function App() {
  return (
    <div className="min-h-screen bg-black text-white font-sans overflow-hidden relative flex flex-col items-center justify-between py-8 px-4 crt-flicker">
      {/* Background Effects */}
      <div className="static-noise"></div>
      <div className="scanline"></div>
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-[#f0f]/20 blur-[120px] rounded-full mix-blend-screen" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-[#0ff]/20 blur-[120px] rounded-full mix-blend-screen" />
      </div>

      {/* Header */}
      <header className="z-10 text-center mb-8 screen-tear">
        <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase glitch-text" data-text="NEON SNAKE">
          NEON SNAKE
        </h1>
        <p className="text-[#0ff] font-mono text-sm tracking-widest mt-2 uppercase font-bold" style={{fontFamily: 'var(--font-pixel)'}}>
          [ SYS.BEATS.INIT ]
        </p>
      </header>

      {/* Main Game Area */}
      <main className="z-10 flex-1 flex items-center justify-center w-full mb-12">
        <SnakeGame />
      </main>

      {/* Footer / Music Player */}
      <footer className="z-10 w-full max-w-2xl mx-auto screen-tear">
        <MusicPlayer />
      </footer>
    </div>
  );
}

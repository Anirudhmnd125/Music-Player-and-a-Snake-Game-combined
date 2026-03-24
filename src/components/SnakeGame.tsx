import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react';

const GRID_SIZE = 20;
const INITIAL_SPEED = 80;

type Point = { x: number; y: number };

export default function SnakeGame() {
  const [snake, setSnake] = useState<Point[]>([{ x: 10, y: 10 }]);
  const [food, setFood] = useState<Point>({ x: 15, y: 10 });
  const [direction, setDirection] = useState<Point>({ x: 1, y: 0 });
  const [isGameOver, setIsGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  
  const directionRef = useRef(direction);
  const gameContainerRef = useRef<HTMLDivElement>(null);

  // Focus the game container on mount to catch keyboard events
  useEffect(() => {
    if (gameContainerRef.current) {
      gameContainerRef.current.focus();
    }
  }, []);

  const generateFood = useCallback((currentSnake: Point[]): Point => {
    let newFood: Point;
    let isOccupied = true;
    while (isOccupied) {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };
      // eslint-disable-next-line no-loop-func
      isOccupied = currentSnake.some(segment => segment.x === newFood.x && segment.y === newFood.y);
    }
    return newFood!;
  }, []);

  const resetGame = () => {
    setSnake([{ x: 10, y: 10 }]);
    setDirection({ x: 1, y: 0 });
    directionRef.current = { x: 1, y: 0 };
    setFood(generateFood([{ x: 10, y: 10 }]));
    setScore(0);
    setIsGameOver(false);
    setIsPaused(false);
    if (gameContainerRef.current) {
      gameContainerRef.current.focus();
    }
  };

  const handleKeyDown = useCallback((e: React.KeyboardEvent | KeyboardEvent) => {
    // Prevent default scrolling for arrow keys and space
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
      e.preventDefault();
    }

    if (e.key === ' ') {
      if (isGameOver) {
        resetGame();
      } else {
        setIsPaused(prev => !prev);
      }
      return;
    }

    if (isPaused || isGameOver) return;

    const currentDir = directionRef.current;
    
    switch (e.key) {
      case 'ArrowUp':
      case 'w':
      case 'W':
        if (currentDir.y !== 1) directionRef.current = { x: 0, y: -1 };
        break;
      case 'ArrowDown':
      case 's':
      case 'S':
        if (currentDir.y !== -1) directionRef.current = { x: 0, y: 1 };
        break;
      case 'ArrowLeft':
      case 'a':
      case 'A':
        if (currentDir.x !== 1) directionRef.current = { x: -1, y: 0 };
        break;
      case 'ArrowRight':
      case 'd':
      case 'D':
        if (currentDir.x !== -1) directionRef.current = { x: 1, y: 0 };
        break;
    }
  }, [isPaused, isGameOver]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    if (isPaused || isGameOver) return;

    const moveSnake = () => {
      setSnake(prevSnake => {
        const head = prevSnake[0];
        const currentDir = directionRef.current;
        const newHead = {
          x: head.x + currentDir.x,
          y: head.y + currentDir.y,
        };

        // Check wall collision
        if (
          newHead.x < 0 ||
          newHead.x >= GRID_SIZE ||
          newHead.y < 0 ||
          newHead.y >= GRID_SIZE
        ) {
          setIsGameOver(true);
          setHighScore(prev => Math.max(prev, score));
          return prevSnake;
        }

        // Check self collision
        if (prevSnake.some(segment => segment.x === newHead.x && segment.y === newHead.y)) {
          setIsGameOver(true);
          setHighScore(prev => Math.max(prev, score));
          return prevSnake;
        }

        const newSnake = [newHead, ...prevSnake];

        // Check food collision
        if (newHead.x === food.x && newHead.y === food.y) {
          setScore(s => s + 10);
          setFood(generateFood(newSnake));
        } else {
          newSnake.pop();
        }

        setDirection(currentDir); // Sync state with ref for rendering if needed
        return newSnake;
      });
    };

    const speed = Math.max(30, INITIAL_SPEED - Math.floor(score / 50) * 5);
    const intervalId = setInterval(moveSnake, speed);

    return () => clearInterval(intervalId);
  }, [isPaused, isGameOver, food, score, generateFood]);

  return (
    <div 
      ref={gameContainerRef}
      className="flex flex-col items-center outline-none"
      tabIndex={0}
    >
      <div className="flex justify-between w-full max-w-[400px] mb-4 px-2">
        <div className="flex flex-col">
          <span className="text-[#0ff] text-[10px] uppercase tracking-widest" style={{fontFamily: 'var(--font-pixel)'}}>SCORE</span>
          <span className="text-[#0ff] font-bold text-5xl drop-shadow-[0_0_8px_rgba(0,255,255,0.8)] glitch-score" data-text={score}>{score}</span>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-[#f0f] text-[10px] uppercase tracking-widest" style={{fontFamily: 'var(--font-pixel)'}}>HI-SCORE</span>
          <span className="text-[#f0f] font-bold text-5xl drop-shadow-[0_0_8px_rgba(255,0,255,0.8)] glitch-score" data-text={highScore}>{highScore}</span>
        </div>
      </div>

      <div className="relative bg-[#000] border-2 border-[#0ff] p-2 shadow-[0_0_30px_rgba(0,255,255,0.3)]">
        <div 
          className="grid bg-[#0a0a0a] overflow-hidden"
          style={{
            gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(0, 1fr))`,
            width: 'min(90vw, 400px)',
            height: 'min(90vw, 400px)',
          }}
        >
          {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, i) => {
            const x = i % GRID_SIZE;
            const y = Math.floor(i / GRID_SIZE);
            
            const segmentIndex = snake.findIndex(segment => segment.x === x && segment.y === y);
            const isSnakeHead = segmentIndex === 0;
            const isSnakeBody = segmentIndex > 0;
            const isFood = food.x === x && food.y === y;

            let bodyStyle = {};
            if (isSnakeBody) {
              const intensity = 1 - (segmentIndex / snake.length);
              bodyStyle = {
                opacity: Math.max(0.3, intensity),
                transform: `scale(${0.6 + (intensity * 0.3)})`,
                boxShadow: `0 0 ${5 + intensity * 10}px rgba(6,182,212,${0.3 + intensity * 0.5})`
              };
            }

            return (
              <div
                key={i}
                className={`
                  w-full h-full border-[0.5px] border-white/[0.05]
                  ${isSnakeHead ? 'bg-[#0ff] shadow-[0_0_15px_rgba(0,255,255,1)] z-10' : ''}
                  ${isSnakeBody ? 'bg-[#0ff]' : ''}
                  ${isFood ? 'bg-[#f0f] shadow-[0_0_15px_rgba(255,0,255,1)] animate-pulse' : ''}
                `}
                style={isSnakeBody ? bodyStyle : undefined}
              />
            );
          })}
        </div>

        {/* Overlays */}
        {(isGameOver || isPaused) && (
          <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-20">
            <div className="text-center p-6 bg-black border-2 border-[#f0f] shadow-[0_0_30px_rgba(255,0,255,0.5)]">
              {isGameOver ? (
                <>
                  <h2 className="text-2xl text-[#f0f] mb-4 glitch-text" data-text="SYSTEM FAILURE" style={{fontFamily: 'var(--font-pixel)'}}>SYSTEM FAILURE</h2>
                  <p className="text-[#0ff] mb-8 text-sm" style={{fontFamily: 'var(--font-pixel)'}}>SCORE: {score}</p>
                  <button 
                    onClick={resetGame}
                    className="px-6 py-3 bg-transparent text-[#0ff] border-2 border-[#0ff] text-xs uppercase tracking-widest transition-all hover:bg-[#0ff] hover:text-black hover:shadow-[0_0_20px_rgba(0,255,255,0.8)]"
                    style={{fontFamily: 'var(--font-pixel)'}}
                  >
                    REBOOT
                  </button>
                </>
              ) : (
                <>
                  <h2 className="text-2xl text-[#0ff] mb-8 glitch-text" data-text="SYS.PAUSED" style={{fontFamily: 'var(--font-pixel)'}}>SYS.PAUSED</h2>
                  <button 
                    onClick={() => setIsPaused(false)}
                    className="px-6 py-3 bg-transparent text-[#f0f] border-2 border-[#f0f] text-xs uppercase tracking-widest transition-all hover:bg-[#f0f] hover:text-black hover:shadow-[0_0_20px_rgba(255,0,255,0.8)]"
                    style={{fontFamily: 'var(--font-pixel)'}}
                  >
                    RESUME
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
      
      <div className="mt-8 flex flex-col items-center gap-4 text-[#0ff] text-[10px] max-w-[400px]" style={{fontFamily: 'var(--font-pixel)'}}>
        <div className="flex items-center gap-3">
          <span>USE</span>
          <div className="flex gap-1">
            <kbd className="flex items-center justify-center w-6 h-6 bg-black border border-[#0ff] text-[#0ff] shadow-[0_0_8px_rgba(0,255,255,0.6)]"><ArrowUp size={14} strokeWidth={3} /></kbd>
            <kbd className="flex items-center justify-center w-6 h-6 bg-black border border-[#0ff] text-[#0ff] shadow-[0_0_8px_rgba(0,255,255,0.6)]"><ArrowDown size={14} strokeWidth={3} /></kbd>
            <kbd className="flex items-center justify-center w-6 h-6 bg-black border border-[#0ff] text-[#0ff] shadow-[0_0_8px_rgba(0,255,255,0.6)]"><ArrowLeft size={14} strokeWidth={3} /></kbd>
            <kbd className="flex items-center justify-center w-6 h-6 bg-black border border-[#0ff] text-[#0ff] shadow-[0_0_8px_rgba(0,255,255,0.6)]"><ArrowRight size={14} strokeWidth={3} /></kbd>
          </div>
          <span>OR</span>
          <div className="flex gap-1">
            <kbd className="flex items-center justify-center w-6 h-6 bg-black border border-[#0ff] text-[#0ff] shadow-[0_0_8px_rgba(0,255,255,0.6)]">W</kbd>
            <kbd className="flex items-center justify-center w-6 h-6 bg-black border border-[#0ff] text-[#0ff] shadow-[0_0_8px_rgba(0,255,255,0.6)]">A</kbd>
            <kbd className="flex items-center justify-center w-6 h-6 bg-black border border-[#0ff] text-[#0ff] shadow-[0_0_8px_rgba(0,255,255,0.6)]">S</kbd>
            <kbd className="flex items-center justify-center w-6 h-6 bg-black border border-[#0ff] text-[#0ff] shadow-[0_0_8px_rgba(0,255,255,0.6)]">D</kbd>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span>PRESS</span>
          <kbd className="inline-flex items-center justify-center px-4 h-6 bg-black border border-[#f0f] text-[#f0f] shadow-[0_0_8px_rgba(255,0,255,0.6)]">SPACE</kbd>
          <span>TO PAUSE</span>
        </div>
      </div>
    </div>
  );
}

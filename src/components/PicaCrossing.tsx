import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ChevronDown, ChevronLeft, ChevronRight, ChevronUp,
  Gamepad2, Pause, Play, RotateCcw, Volume2, VolumeX,
} from 'lucide-react';
import {
  createState, start, hop, step, START_TIME, START_LIVES,
  VIEW, type GameState, type Phase,
} from './arcade/crossingEngine';
import { drawFrame } from './arcade/crossingRender';

const BEST_KEY = 'pica_crossing_best';

/**
 * Desktop-only for now: the board is landscape and reads best with a keyboard.
 * Everything below is already touch- and small-screen-capable (D-pad, swipe,
 * fluid canvas), so putting a second game on mobile is a one-line change to
 * this query.
 */
function useDesktopViewport() {
  const [desktop, setDesktop] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)');
    const sync = () => setDesktop(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    window.addEventListener('resize', sync);
    return () => {
      mq.removeEventListener('change', sync);
      window.removeEventListener('resize', sync);
    };
  }, []);
  return desktop;
}

function CrossingGame() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const timerRef = useRef<HTMLDivElement | null>(null);
  const gameRef = useRef<GameState | null>(null);

  const [phase, setPhase] = useState<Phase>('cover');
  const [hud, setHud] = useState({ score: 0, best: 0, lives: START_LIVES, level: 1 });
  const [paused, setPaused] = useState(false);
  const [muted, setMuted] = useState(false);
  const [coarse, setCoarse] = useState(false);

  // Refs shadow what the rAF loop reads: the loop is built once and must not be
  // torn down every time a toggle flips.
  const pausedRef = useRef(false);
  const mutedRef = useRef(false);
  const visibleRef = useRef(false);
  pausedRef.current = paused;
  mutedRef.current = muted;

  useEffect(() => {
    setCoarse(window.matchMedia('(pointer: coarse)').matches);
  }, []);

  // ------------------------------------------------------------------ audio
  // One AudioContext for the whole game. A fresh one per effect works for a
  // few plays and then silently stops — browsers cap how many a page may hold.
  const acRef = useRef<AudioContext | null>(null);
  const audioDeadRef = useRef(false);
  const ensureAudio = useCallback(() => {
    // Every input path calls this before doing anything. Constructing an
    // AudioContext can throw outright (privacy modes, headless, exhausted
    // context limit) — unguarded, that exception would propagate out of the
    // key handler and take the controls down with the sound.
    if (audioDeadRef.current) return null;
    try {
      if (!acRef.current) {
        const AC = window.AudioContext
          ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
        if (!AC) { audioDeadRef.current = true; return null; }
        acRef.current = new AC();
      }
      if (acRef.current.state === 'suspended') void acRef.current.resume();
      return acRef.current;
    } catch {
      audioDeadRef.current = true;
      return null;
    }
  }, []);

  const sfx = useCallback((kind: 'hop' | 'home' | 'squash' | 'splash' | 'bonus' | 'level' | 'over') => {
    if (mutedRef.current) return;
    const ac = ensureAudio();
    if (!ac) return;
    const now = ac.currentTime;

    const blip = (type: OscillatorType, from: number, to: number, dur: number, gain: number, at = 0) => {
      try {
      const osc = ac.createOscillator();
      const amp = ac.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(from, now + at);
      osc.frequency.exponentialRampToValueAtTime(Math.max(1, to), now + at + dur);
      amp.gain.setValueAtTime(gain, now + at);
      amp.gain.exponentialRampToValueAtTime(0.001, now + at + dur);
      osc.connect(amp).connect(ac.destination);
      osc.start(now + at);
      osc.stop(now + at + dur + 0.02);
      } catch {
        // A failed sound must never break the input that triggered it.
      }
    };

    if (kind === 'hop') blip('square', 300, 620, 0.07, 0.045);
    else if (kind === 'home') [660, 880, 1320].forEach((f, i) => blip('square', f, f, 0.09, 0.055, i * 0.07));
    else if (kind === 'bonus') [880, 1100, 1320, 1760].forEach((f, i) => blip('triangle', f, f, 0.07, 0.05, i * 0.045));
    else if (kind === 'level') [523, 659, 784, 1047].forEach((f, i) => blip('square', f, f, 0.13, 0.06, i * 0.1));
    else if (kind === 'squash') blip('sawtooth', 260, 60, 0.24, 0.09);
    else if (kind === 'splash') { blip('sine', 700, 180, 0.22, 0.06); blip('sawtooth', 180, 70, 0.3, 0.05, 0.05); }
    else blip('sawtooth', 200, 50, 0.6, 0.07);
  }, [ensureAudio]);

  // Mirrors `hud` for the rAF loop, which must compare against the latest
  // values without taking `hud` as a dependency and rebuilding the loop.
  const hudRef = useRef({ score: 0, best: 0, lives: START_LIVES, level: 1 });

  // ------------------------------------------------------------------- loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Back the canvas at device resolution so the clay gradients stay smooth
    // under the CSS perspective transform.
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = VIEW.w * dpr;
    canvas.height = VIEW.h * dpr;
    ctx.scale(dpr, dpr);

    const best = Number(localStorage.getItem(BEST_KEY) ?? 0) || 0;
    const g = createState(best);
    gameRef.current = g;
    setHud({ score: 0, best, lives: START_LIVES, level: 1 });

    const TICK = 1000 / 60;
    let raf = 0;
    let last = performance.now();
    let acc = 0;
    let prevPhase: Phase = g.phase;
    let prevHomes = 0;
    let prevLevel = 1;
    let prevPickups = 0;

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);

      let dt = now - last;
      last = now;
      // Returning from a background tab hands us one enormous delta. Treat it
      // as a single tick rather than fast-forwarding the run the player left.
      if (dt > 250) dt = TICK;

      if (!pausedRef.current) {
        acc += dt;
        let steps = 0;
        // Cap catch-up work so one slow frame cannot cascade into a freeze.
        while (acc >= TICK && steps < 5) {
          step(g);
          acc -= TICK;
          steps++;
        }
        if (acc > TICK * 5) acc = 0;
      }

      // Sound is driven off state transitions rather than fired from the
      // engine, which keeps the engine free of side effects.
      const homes = g.homes.filter(Boolean).length;
      if (homes > prevHomes) sfx('home');
      prevHomes = homes;

      if (g.level !== prevLevel) { sfx('level'); prevLevel = g.level; }
      if (g.pickups !== prevPickups) { sfx('bonus'); prevPickups = g.pickups; }

      if (g.phase !== prevPhase) {
        if (g.phase === 'dying') sfx(g.dieKind === 'squash' ? 'squash' : 'splash');
        if (g.phase === 'over') {
          sfx('over');
          localStorage.setItem(BEST_KEY, String(g.best));
        }
        prevPhase = g.phase;
        setPhase(g.phase);
      }

      const h = hudRef.current;
      if (g.score !== h.score || g.lives !== h.lives || g.level !== h.level || g.best !== h.best) {
        hudRef.current = { score: g.score, best: g.best, lives: g.lives, level: g.level };
        setHud(hudRef.current);
      }

      // The clock ticks 60x a second — driving it through React state would
      // re-render the whole cabinet every frame, so it writes to the DOM node.
      if (timerRef.current) {
        const pct = Math.max(0, Math.min(1, g.time / START_TIME));
        timerRef.current.style.width = `${pct * 100}%`;
        timerRef.current.style.background = pct < 0.25 ? '#FF6B6B' : pct < 0.5 ? '#FFD93D' : '#6BCB77';
      }

      drawFrame(ctx, g);
    };

    drawFrame(ctx, g);
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [sfx]);

  // Pause whenever the player is not actually looking: tab hidden, or the
  // cabinet scrolled out of view. Otherwise the frog dies offscreen.
  useEffect(() => {
    const pauseIfPlaying = () => {
      if (gameRef.current?.phase === 'playing') setPaused(true);
    };
    const onVisibility = () => { if (document.hidden) pauseIfPlaying(); };
    document.addEventListener('visibilitychange', onVisibility);

    const el = wrapRef.current;
    let io: IntersectionObserver | undefined;
    if (el && 'IntersectionObserver' in window) {
      io = new IntersectionObserver(
        ([entry]) => {
          visibleRef.current = entry.isIntersecting;
          if (!entry.isIntersecting) pauseIfPlaying();
        },
        { threshold: 0.4 },
      );
      io.observe(el);
    }
    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      io?.disconnect();
    };
  }, []);

  // ------------------------------------------------------------------ input
  const move = useCallback((dir: 0 | 1 | 2 | 3) => {
    const g = gameRef.current;
    if (!g) return;
    ensureAudio();
    if (pausedRef.current) return;
    if (g.phase === 'cover' || g.phase === 'over') {
      start(g);
      setPhase('playing');
      return;
    }
    if (hop(g, dir)) sfx('hop');
  }, [ensureAudio, sfx]);

  const begin = useCallback(() => {
    const g = gameRef.current;
    if (!g) return;
    ensureAudio();
    setPaused(false);
    start(g);
    setPhase('playing');
  }, [ensureAudio]);

  useEffect(() => {
    const KEYS: Record<string, 0 | 1 | 2 | 3> = {
      ArrowUp: 0, ArrowRight: 1, ArrowDown: 2, ArrowLeft: 3,
      w: 0, d: 1, s: 2, a: 3, W: 0, D: 1, S: 2, A: 3,
    };
    const onKey = (e: KeyboardEvent) => {
      // Only claim the arrow keys while the cabinet is actually on screen —
      // stealing page scroll from someone reading the specs would be rude.
      if (!visibleRef.current) return;
      const dir = KEYS[e.key];
      if (dir !== undefined) {
        e.preventDefault();
        move(dir);
        return;
      }
      if (e.key === ' ' || e.key === 'Enter') {
        const g = gameRef.current;
        if (g && (g.phase === 'cover' || g.phase === 'over')) {
          e.preventDefault();
          begin();
        }
        return;
      }
      if (e.key === 'p' || e.key === 'P') {
        if (gameRef.current?.phase === 'playing') setPaused((p) => !p);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [move, begin]);

  // Swipe, for the touch build.
  const touchRef = useRef<{ x: number; y: number } | null>(null);
  const onTouchStart = (e: React.PointerEvent) => {
    touchRef.current = { x: e.clientX, y: e.clientY };
  };
  const onTouchEnd = (e: React.PointerEvent) => {
    const t = touchRef.current;
    touchRef.current = null;
    const g = gameRef.current;
    if (!g) return;
    if (g.phase === 'cover' || g.phase === 'over') { begin(); return; }
    if (!t) return;
    const dx = e.clientX - t.x;
    const dy = e.clientY - t.y;
    if (Math.abs(dx) < 18 && Math.abs(dy) < 18) { move(0); return; }
    if (Math.abs(dx) > Math.abs(dy)) move(dx > 0 ? 1 : 3);
    else move(dy > 0 ? 2 : 0);
  };

  const newBest = phase === 'over' && hud.score > 0 && hud.score >= hud.best;

  return (
    <div ref={wrapRef} className="relative mx-auto w-full max-w-[840px]">
      {/* Cabinet, in the same clay language as the rest of the page. */}
      <div className="clay clay-cream edge-yellow clay-lg p-4 sm:p-5">
        {/* ------------------------------------------------------------ HUD */}
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <Readout label="Score" value={hud.score} accent />
            <Readout label="Best" value={hud.best} />
            <Readout label="Level" value={hud.level} />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#6D6D6D]">Lives</span>
            <div className="flex gap-1.5">
              {Array.from({ length: START_LIVES }).map((_, i) => (
                <span
                  key={i}
                  className={`clay clay-sm h-5 w-5 ${i < hud.lives ? 'clay-green' : 'clay-cream opacity-40'}`}
                  aria-hidden
                />
              ))}
            </div>
            <button
              onClick={() => { setMuted((m) => !m); ensureAudio(); }}
              aria-label={muted ? 'Unmute game sound' : 'Mute game sound'}
              className="clay clay-cream clay-btn clay-sm ml-1 p-1.5"
            >
              {muted ? <VolumeX className="h-4 w-4 text-[#6D6D6D]" /> : <Volume2 className="h-4 w-4 text-[#FF6B6B]" />}
            </button>
          </div>
        </div>

        {/* --------------------------------------------------------- screen */}
        {/* perspective on the frame + rotateX on the canvas: the board is 2D,
            the recession is real 3D, and the game logic never has to know. */}
        <div className="relative" style={{ perspective: '1400px' }}>
          <div
            className="relative overflow-hidden rounded-[20px] border-[3px] border-[#2D2D2D] bg-[#2D2D2D]"
            style={{ transform: 'rotateX(7deg)', transformStyle: 'preserve-3d', boxShadow: '0 18px 34px rgba(60,40,20,0.32)' }}
          >
            <canvas
              ref={canvasRef}
              onPointerDown={onTouchStart}
              onPointerUp={onTouchEnd}
              className="block w-full touch-none select-none"
              style={{ aspectRatio: `${VIEW.w} / ${VIEW.h}` }}
              aria-label="Pica Crossing — use the arrow keys to hop the frog to the waitlist"
            />

            {phase === 'playing' && !paused && (
              <button
                onClick={() => setPaused(true)}
                aria-label="Pause"
                className="absolute right-2.5 top-2.5 rounded-xl border-2 border-[#2D2D2D] bg-white/90 p-1.5 text-[#2D2D2D] shadow-[0_2px_0_#2D2D2D]"
              >
                <Pause className="h-4 w-4" />
              </button>
            )}

            {/* ------------------------------------------------ cover card */}
            {phase === 'cover' && (
              <Overlay>
                <Badge>Pica Arcade</Badge>
                <h3 className="mt-2 text-4xl font-black uppercase leading-none tracking-tight text-white drop-shadow-[0_3px_0_#2D2D2D] sm:text-5xl">
                  Pica Crossing
                </h3>
                <p className="mt-2 max-w-sm text-xs font-bold uppercase tracking-wider text-[#FFD93D]">
                  Get to the waitlist. Don&apos;t get squashed.
                </p>
                {hud.best > 0 && (
                  <p className="mt-1 text-[11px] font-black uppercase tracking-wider text-white/70">Best {hud.best}</p>
                )}
                <button onClick={begin} className="clay clay-btn clay-coral mt-4 flex items-center gap-2 px-8 py-3 text-sm font-black uppercase">
                  <Play className="h-4 w-4 text-[#FFD93D]" />
                  Play
                </button>
                <p className="mt-3 text-[10px] font-bold uppercase tracking-widest text-white/60">
                  Arrow keys or WASD · P to pause
                </p>
              </Overlay>
            )}

            {/* ------------------------------------------------ pause card */}
            {paused && phase === 'playing' && (
              <Overlay>
                <Badge>Paused</Badge>
                <p className="mt-3 text-5xl font-black text-white drop-shadow-[0_3px_0_#2D2D2D]">{hud.score}</p>
                <div className="mt-4 flex items-center gap-2">
                  <button onClick={() => setPaused(false)} className="clay clay-btn clay-coral flex items-center gap-2 px-6 py-2.5 text-xs font-black uppercase">
                    <Play className="h-4 w-4 text-[#FFD93D]" />
                    Resume
                  </button>
                  <button onClick={begin} className="clay clay-btn clay-cream flex items-center gap-2 px-6 py-2.5 text-xs font-black uppercase">
                    <RotateCcw className="h-4 w-4" />
                    Restart
                  </button>
                </div>
              </Overlay>
            )}

            {/* --------------------------------------------- level-up card */}
            {phase === 'levelup' && (
              <Overlay>
                <Badge>All Five Home</Badge>
                <p className="mt-3 text-4xl font-black uppercase text-[#FFD93D] drop-shadow-[0_3px_0_#2D2D2D]">
                  Level {hud.level}
                </p>
                <p className="mt-1 text-xs font-bold uppercase tracking-widest text-white/80">
                  Everything gets faster
                </p>
              </Overlay>
            )}

            {/* -------------------------------------------- game over card */}
            {phase === 'over' && (
              <Overlay>
                <Badge>{newBest ? 'New Best!' : 'Game Over'}</Badge>
                <div className="mt-3 flex items-end gap-6">
                  <Stat label="Score" value={hud.score} accent />
                  <Stat label="Best" value={hud.best} />
                  <Stat label="Level" value={hud.level} />
                </div>
                <button onClick={begin} className="clay clay-btn clay-coral mt-4 flex items-center gap-2 px-8 py-3 text-sm font-black uppercase">
                  <RotateCcw className="h-4 w-4 text-[#FFD93D]" />
                  Play again
                </button>
              </Overlay>
            )}
          </div>
        </div>

        {/* ---------------------------------------------------------- clock */}
        <div className="mt-3.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#6D6D6D]">Time</span>
            <span className="text-[10px] font-black uppercase tracking-widest text-[#6D6D6D]">
              +10 a row · +100 home · +50 yoyo
            </span>
          </div>
          <div className="clay-well clay-cream mt-1.5 h-3 w-full overflow-hidden !rounded-full p-0">
            <div ref={timerRef} className="h-full rounded-full transition-[background] duration-300" style={{ width: '100%', background: '#6BCB77' }} />
          </div>
        </div>

        {/* D-pad. Shown on touch pointers only — a mouse has the keyboard. */}
        {coarse && (
          <div className="mt-4 flex items-center justify-center gap-2">
            <Dpad icon={<ChevronLeft className="h-5 w-5" />} onPress={() => move(3)} label="Left" />
            <div className="flex flex-col gap-2">
              <Dpad icon={<ChevronUp className="h-5 w-5" />} onPress={() => move(0)} label="Up" primary />
              <Dpad icon={<ChevronDown className="h-5 w-5" />} onPress={() => move(2)} label="Down" />
            </div>
            <Dpad icon={<ChevronRight className="h-5 w-5" />} onPress={() => move(1)} label="Right" />
          </div>
        )}
      </div>
    </div>
  );
}

const Readout: React.FC<{ label: string; value: number; accent?: boolean }> = ({ label, value, accent }) => (
  <div className={`clay clay-sm ${accent ? 'clay-yellow' : 'clay-cream'} px-3 py-1.5 leading-none`}>
    <span className="block text-[8px] font-black uppercase tracking-widest opacity-60">{label}</span>
    <span className="block text-base font-black tabular-nums">{value}</span>
  </div>
);

const Overlay: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#2D2D2D]/62 px-6 text-center backdrop-blur-[2px]">
    {children}
  </div>
);

const Badge: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span className="inline-flex items-center gap-1.5 rounded-full border-2 border-[#2D2D2D] bg-[#FFD93D] px-3 py-1 text-[10px] font-black uppercase tracking-widest text-[#2D2D2D]">
    <Gamepad2 className="h-3 w-3" />
    {children}
  </span>
);

const Stat: React.FC<{ label: string; value: number; accent?: boolean }> = ({ label, value, accent }) => (
  <div className="flex flex-col items-center">
    <span className="text-[10px] font-black uppercase tracking-widest text-white/70">{label}</span>
    <span className={`text-4xl font-black leading-none drop-shadow-[0_3px_0_#2D2D2D] ${accent ? 'text-[#FFD93D]' : 'text-white'}`}>
      {value}
    </span>
  </div>
);

const Dpad: React.FC<{ icon: React.ReactNode; onPress: () => void; label: string; primary?: boolean }> = ({
  icon, onPress, label, primary,
}) => (
  <button
    onPointerDown={(e) => { e.preventDefault(); onPress(); }}
    aria-label={label}
    className={`clay clay-btn clay-sm ${primary ? 'clay-coral' : 'clay-cream'} flex h-11 w-11 items-center justify-center`}
  >
    {icon}
  </button>
);

/**
 * Pica Arcade — Pica Crossing.
 *
 * Desktop counterpart to Flappy Picas. The two are mutually exclusive by
 * viewport, so they share the `#arcade` anchor and the header's Arcade link
 * lands on whichever one is mounted.
 */
export const PicaCrossing: React.FC = () => {
  const desktop = useDesktopViewport();
  if (!desktop) return null;

  return (
    <section
      id="arcade"
      className="relative overflow-hidden border-y-[3px] border-[#4D96FF] bg-[#FFF4E4] px-6 py-12"
    >
      <div className="mx-auto max-w-4xl text-center">
        <div className="mb-3 flex w-full items-center justify-center gap-3">
          <Gamepad2 className="h-9 w-9 shrink-0 text-[#FF6B6B]" />
          <span className="toys-r-us-text text-4xl font-black uppercase tracking-[0.14em] whitespace-nowrap">
            <span className="rainbow-p">P</span>
            <span className="rainbow-i">I</span>
            <span className="rainbow-c">C</span>
            <span className="rainbow-a">A</span>
            <span> </span>
            <span className="rainbow-t">A</span>
            <span className="rainbow-o">R</span>
            <span className="rainbow-y">C</span>
            <span className="rainbow-s">A</span>
            <span className="rainbow-p">D</span>
            <span className="rainbow-i">E</span>
          </span>
        </div>
        <p className="mx-auto mb-6 max-w-md text-sm font-medium text-[#6D6D6D]">
          Hop the frog across four lanes of traffic and a river to the waitlist. While you wait for the first batch.
        </p>

        <CrossingGame />
      </div>
    </section>
  );
};

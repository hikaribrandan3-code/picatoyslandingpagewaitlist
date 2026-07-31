import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Gamepad2, Pause, Play, RotateCcw, Trophy, Volume2, VolumeX } from 'lucide-react';
import {
  createState, start, flap, step, medalFor,
  VIEW, type GameState, type Phase,
} from './arcade/flappyEngine';
import { drawFrame } from './arcade/flappyRender';

const BEST_KEY = 'pica_flappy_best';

/** Mobile-only: the game is built for portrait and a thumb, so desktop skips it. */
function useMobileViewport() {
  const [mobile, setMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 1023px)');
    const sync = () => setMobile(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    // `resize` as well as `change`: if the viewport moves across the breakpoint
    // without a change event landing, the query and what is on screen disagree
    // until the next reload. Re-reading on resize is a couple of comparisons
    // and removes that whole failure mode.
    window.addEventListener('resize', sync);
    return () => {
      mq.removeEventListener('change', sync);
      window.removeEventListener('resize', sync);
    };
  }, []);
  return mobile;
}

const MEDAL_STYLE: Record<string, { ring: string; face: string; label: string }> = {
  bronze: { ring: '#8C5A2B', face: '#CD7F32', label: 'Bronze' },
  silver: { ring: '#8A8A8A', face: '#D8D8D8', label: 'Silver' },
  gold: { ring: '#B7930A', face: '#FFD93D', label: 'Gold' },
  platinum: { ring: '#9FB0B5', face: '#E8F1F2', label: 'Platinum' },
};

function FlappyGame() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const gameRef = useRef<GameState | null>(null);

  const [phase, setPhase] = useState<Phase>('cover');
  const [hud, setHud] = useState({ score: 0, best: 0 });
  const [paused, setPaused] = useState(false);
  const [muted, setMuted] = useState(false);

  // Refs shadow the state the rAF loop reads: the loop is created once and
  // must not be torn down and rebuilt every time a toggle flips.
  const pausedRef = useRef(false);
  const mutedRef = useRef(false);
  pausedRef.current = paused;
  mutedRef.current = muted;

  // ------------------------------------------------------------------ audio
  // One AudioContext for the whole game, created on the first gesture. Making
  // a fresh context per sound effect works for a handful of plays and then
  // silently stops — browsers cap how many a page may hold.
  const acRef = useRef<AudioContext | null>(null);
  const ensureAudio = useCallback(() => {
    if (!acRef.current) {
      const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AC) return null;
      acRef.current = new AC();
    }
    if (acRef.current.state === 'suspended') void acRef.current.resume();
    return acRef.current;
  }, []);

  const sfx = useCallback((kind: 'flap' | 'score' | 'hit' | 'fall') => {
    if (mutedRef.current) return;
    const ac = ensureAudio();
    if (!ac) return;
    const now = ac.currentTime;

    const blip = (type: OscillatorType, from: number, to: number, dur: number, gain: number, at = 0) => {
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
    };

    if (kind === 'flap') blip('square', 620, 380, 0.08, 0.05);
    else if (kind === 'score') { blip('square', 880, 880, 0.06, 0.06); blip('square', 1320, 1320, 0.09, 0.06, 0.06); }
    else if (kind === 'hit') blip('sawtooth', 320, 90, 0.18, 0.09);
    else blip('sawtooth', 200, 55, 0.45, 0.07);
  }, [ensureAudio]);

  // ------------------------------------------------------------------- loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.imageSmoothingEnabled = false;

    const best = Number(localStorage.getItem(BEST_KEY) ?? 0) || 0;
    const g = createState(best);
    gameRef.current = g;
    setHud({ score: 0, best });

    const TICK = 1000 / 60;
    let raf = 0;
    let last = performance.now();
    let acc = 0;
    let prevPhase: Phase = g.phase;
    let prevScore = 0;

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);

      let dt = now - last;
      last = now;
      // Coming back from a background tab hands us one enormous delta. Treat it
      // as a single tick rather than fast-forwarding the run the player left.
      if (dt > 250) dt = TICK;

      if (!pausedRef.current) {
        acc += dt;
        // Cap catch-up work so a slow frame cannot cascade into a freeze.
        let steps = 0;
        while (acc >= TICK && steps < 5) {
          step(g);
          acc -= TICK;
          steps++;
        }
        if (acc > TICK * 5) acc = 0;
      }

      if (g.score !== prevScore) {
        if (g.score > prevScore) sfx('score');
        prevScore = g.score;
      }
      if (g.phase !== prevPhase) {
        if (g.phase === 'dying') sfx('hit');
        if (g.phase === 'over') {
          sfx('fall');
          localStorage.setItem(BEST_KEY, String(g.best));
          setHud({ score: g.score, best: g.best });
        }
        prevPhase = g.phase;
        setPhase(g.phase);
      }

      const idle = pausedRef.current || g.phase === 'cover' || g.phase === 'over';
      drawFrame(ctx, g, idle);
    };

    // Paint one frame straight away so the canvas is never blank before the
    // first animation frame arrives.
    drawFrame(ctx, g, true);
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [sfx]);

  // Pause whenever the player is not actually looking at the game: tab hidden,
  // or the cabinet scrolled out of view. Otherwise the penguin dies offscreen.
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
        ([entry]) => { if (!entry.isIntersecting) pauseIfPlaying(); },
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
  const tap = useCallback(() => {
    const g = gameRef.current;
    if (!g) return;
    ensureAudio();
    if (paused) return;              // the overlay owns input while paused
    if (g.phase === 'cover' || g.phase === 'over') {
      start(g);
      setPhase('playing');
    } else if (g.phase === 'playing') {
      flap(g);
      sfx('flap');
    }
  }, [paused, ensureAudio, sfx]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== ' ' && e.key !== 'Enter') return;
      e.preventDefault();
      tap();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [tap]);

  const restart = useCallback(() => {
    const g = gameRef.current;
    if (!g) return;
    setPaused(false);
    start(g);
    setPhase('playing');
  }, []);

  const medal = medalFor(hud.score);
  const newBest = phase === 'over' && hud.score > 0 && hud.score >= hud.best;

  return (
    <div ref={wrapRef} className="relative mx-auto w-full max-w-[360px]">
      {/* Cabinet bezel, in the same clay language as the rest of the page. */}
      <div className="clay clay-cream edge-blue clay-lg p-3">
        <div className="relative overflow-hidden rounded-2xl border-[3px] border-[#131C33] bg-[#4EC0E8]">
          <canvas
            ref={canvasRef}
            width={VIEW.w}
            height={VIEW.h}
            onPointerDown={(e) => { e.preventDefault(); tap(); }}
            className="block w-full touch-none select-none"
            style={{ imageRendering: 'pixelated', aspectRatio: `${VIEW.w} / ${VIEW.h}` }}
            aria-label="Flappy Picas — tap to flap"
          />

          {/* Pause control, only while a run is live. */}
          {phase === 'playing' && !paused && (
            <button
              onClick={() => setPaused(true)}
              aria-label="Pause"
              className="absolute right-2 top-2 rounded-xl border-2 border-[#131C33] bg-white/90 p-1.5 text-[#131C33] shadow-[0_2px_0_#131C33]"
            >
              <Pause className="h-4 w-4" />
            </button>
          )}

          {/* ---------------------------------------------------- cover card */}
          {phase === 'cover' && (
            <Overlay lower>
              <Badge>Pica Arcade</Badge>
              <h3 className="mt-2 text-5xl sm:text-6xl font-black uppercase leading-none tracking-tight text-white drop-shadow-[0_3px_0_#131C33] text-center">
                Flappy<br />Picas
              </h3>
              {hud.best > 0 && (
                <p className="mt-1 text-[11px] font-black uppercase tracking-wider text-[#FFD93D]">
                  Best {hud.best}
                </p>
              )}
              <button onClick={tap} className="clay clay-btn clay-coral mt-4 flex items-center gap-2 px-7 py-3 text-sm font-black uppercase">
                <Play className="h-4 w-4 text-[#FFD93D]" />
                Play
              </button>
            </Overlay>
          )}

          {/* ---------------------------------------------------- pause card */}
          {paused && phase === 'playing' && (
            <Overlay>
              <Badge>Paused</Badge>
              <p className="mt-3 text-4xl font-black text-white drop-shadow-[0_3px_0_#131C33]">
                {gameRef.current?.score ?? 0}
              </p>
              <div className="mt-4 flex flex-col items-stretch gap-2">
                <button onClick={() => setPaused(false)} className="clay clay-btn clay-coral flex items-center justify-center gap-2 px-6 py-2.5 text-xs font-black uppercase">
                  <Play className="h-4 w-4 text-[#FFD93D]" />
                  Resume
                </button>
                <button onClick={restart} className="clay clay-btn clay-cream flex items-center justify-center gap-2 px-6 py-2.5 text-xs font-black uppercase">
                  <RotateCcw className="h-4 w-4" />
                  Restart
                </button>
              </div>
            </Overlay>
          )}

          {/* ------------------------------------------------ game over card */}
          {phase === 'over' && (
            <Overlay>
              <Badge>{newBest ? 'New Best!' : 'Game Over'}</Badge>

              <div className="mt-3 flex items-end gap-5">
                <Stat label="Score" value={hud.score} accent />
                <Stat label="Best" value={hud.best} />
              </div>

              {medal !== 'none' && (
                <div className="mt-3 flex items-center gap-2">
                  <span
                    className="flex h-8 w-8 items-center justify-center rounded-full border-2"
                    style={{ borderColor: MEDAL_STYLE[medal].ring, background: MEDAL_STYLE[medal].face }}
                  >
                    <Trophy className="h-4 w-4 text-[#131C33]" />
                  </span>
                  <span className="text-[11px] font-black uppercase tracking-widest text-white">
                    {MEDAL_STYLE[medal].label}
                  </span>
                </div>
              )}

              <button onClick={restart} className="clay clay-btn clay-coral mt-4 flex items-center gap-2 px-7 py-3 text-sm font-black uppercase">
                <RotateCcw className="h-4 w-4 text-[#FFD93D]" />
                Play again
              </button>
            </Overlay>
          )}
        </div>

        {/* Cabinet footer: score readout + mute, matching the page chrome. */}
        <div className="mt-3 flex items-center justify-between border-t-[3px] border-[#E3CDB0] pt-2.5">
          <span className="text-[11px] font-black uppercase tracking-widest text-[#6D6D6D]">
            Best <span className="text-[#FF6B6B]">{hud.best}</span>
          </span>
          <button
            onClick={() => { setMuted((m) => !m); ensureAudio(); }}
            aria-label={muted ? 'Unmute game sound' : 'Mute game sound'}
            className="clay clay-cream clay-btn clay-sm p-1.5"
          >
            {muted ? <VolumeX className="h-4 w-4 text-[#6D6D6D]" /> : <Volume2 className="h-4 w-4 text-[#FF6B6B]" />}
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Card over the canvas. `lower` drops it into the bottom half, which the cover
 * screen uses so the bobbing penguin stays visible above the title instead of
 * sitting behind it.
 */
const Overlay: React.FC<{ children: React.ReactNode; lower?: boolean }> = ({ children, lower }) => (
  <div
    className={`absolute inset-0 flex flex-col items-center px-6 text-center ${
      lower ? 'justify-start pt-[10%]' : 'justify-center'
    }`}
  >
    {children}
  </div>
);

const Badge: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span className="inline-flex items-center gap-1.5 rounded-full border-2 border-[#131C33] bg-[#FFD93D] px-3 py-1 text-[10px] font-black uppercase tracking-widest text-[#131C33]">
    <Gamepad2 className="h-3 w-3" />
    {children}
  </span>
);

const Stat: React.FC<{ label: string; value: number; accent?: boolean }> = ({ label, value, accent }) => (
  <div className="flex flex-col items-center">
    <span className="text-[10px] font-black uppercase tracking-widest text-white/70">{label}</span>
    <span
      className={`text-4xl font-black leading-none drop-shadow-[0_3px_0_#131C33] ${accent ? 'text-[#FFD93D]' : 'text-white'}`}
    >
      {value}
    </span>
  </div>
);

/**
 * Pica Arcade — Flappy Picas.
 *
 * Mounted only on mobile widths: it is a portrait, one-thumb game, and the
 * gate is a real media query rather than `hidden lg:block` so desktop never
 * mounts the canvas or runs the loop at all.
 */
export const FlappyPicas: React.FC = () => {
  const mobile = useMobileViewport();
  if (!mobile) return null;

  return (
    <section
      id="arcade"
      className="relative overflow-hidden border-y-[3px] border-[#4D96FF] bg-[#FFF4E4] px-4 py-8"
    >
      <div className="mx-auto max-w-md text-center">
        {/* Rainbow title, same letter-by-letter treatment as the header
            wordmark, standing in for the section title. No clay pill/card
            around it — sits directly on the section background, bigger and
            bolder than the pill version was. Sized to still fit a 360px-wide
            phone at the mobile size (text-3xl) without clipping against the
            section's overflow-hidden edge; the sm: bump only matters on
            wider portrait tablets, where the container has more room. */}
        <div className="mb-3 flex w-full items-center justify-center gap-2">
          <Gamepad2 className="h-7 w-7 sm:h-9 sm:w-9 shrink-0 text-[#FF6B6B]" />
          <span className="text-3xl sm:text-4xl font-black uppercase tracking-[0.14em] toys-r-us-text whitespace-nowrap">
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
        <p className="mx-auto mb-4 max-w-xs text-sm font-medium text-[#6D6D6D]">
          While you wait for the first batch.
        </p>

        <FlappyGame />
      </div>
    </section>
  );
};

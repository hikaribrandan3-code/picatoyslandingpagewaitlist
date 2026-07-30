/**
 * Flappy Picas — game logic, with no reference to the DOM, canvas, or React.
 *
 * The split is deliberate. A canvas game cannot be verified by looking at the
 * page: if the tuning is wrong the only symptom is "it feels bad", and if the
 * collision box is wrong the only symptom is an unfair death. Keeping the
 * simulation pure means it can be driven headlessly by a scripted player and
 * asserted on — see scripts/verify-flappy.ts.
 *
 * The simulation runs on a fixed 60Hz tick. The render loop feeds it whole
 * ticks from an accumulator, so physics stay identical on a 120Hz phone and
 * a throttled background tab, and a slow frame can never let the penguin
 * tunnel through a pipe.
 */

/** Logical canvas size. Scaled up by CSS; every draw call snaps to ART_PX. */
export const VIEW = { w: 288, h: 512 } as const;

/** One art pixel. Sprite cells and scene rects are all multiples of this. */
export const ART_PX = 2;

/** Ground strip height — the playfield is everything above it. */
export const GROUND_H = 112;
export const PLAY_H = VIEW.h - GROUND_H; // 400

/**
 * The penguin. `w`/`h` are the *hitbox*, inset from the 36x30 sprite so a
 * clipped wing tip or beak pixel never reads as an unfair death.
 */
export const BIRD = { x: 84, w: 26, h: 22 } as const;

/**
 * Two ratios decide how this game feels, and both are matched to the original
 * Flappy Bird rather than picked by eye:
 *
 *   flap rise / gap height ~= 0.42  — much more and the bird is twitchy, with
 *                                     every correction risking a ceiling strike
 *   gap height / bird height ~= 4.4 — much more and even a sloppy player never
 *                                     dies, which is what the headless
 *                                     difficulty test caught at 5.6
 */
export const PHYS = {
  gravity: 0.40,
  flap: -5.7,
  maxFall: 9,
  /** Rotation limits in radians — nose-up on a flap, tipping over on a fall. */
  rotUp: -0.45,
  rotDown: 1.5,
} as const;

export const PIPE = {
  w: 52,
  gap: 96,
  speed: 2.0,
  /** Horizontal distance between pipe leading edges. 170/2 = 85 ticks apart. */
  spacing: 170,
  capH: 16,
  capOverhang: 4,
  /** Gap centre may not sit closer than this to the ceiling or the ground. */
  margin: 56,
  /**
   * Cap on how far the gap may move between consecutive pipes. Without it the
   * generator can demand a full-height climb inside one pipe interval, which
   * is reachable but reads as unfair.
   */
  maxStep: 110,
  /**
   * The first `easePipes` pipes of a run get a wider gap than PIPE.gap,
   * tapering linearly down to it. A brand-new player is still learning what
   * a flap does on pipe one — full difficulty from the first obstacle reads
   * as unfair rather than hard. By easePipes it's indistinguishable from the
   * steady-state game.
   */
  easePipes: 4,
  easeExtra: 26,
} as const;

export type Phase = 'cover' | 'playing' | 'dying' | 'over';

export interface Pipe {
  /** Left edge, in logical px. */
  x: number;
  /** Top of the gap. */
  gapY: number;
  /** This pipe's own gap height — see PIPE.easePipes for why it varies. */
  gap: number;
  scored: boolean;
}

export interface GameState {
  phase: Phase;
  /** Ticks elapsed in the current phase — drives idle bob and wing cycle. */
  t: number;
  /** Penguin centre y. */
  y: number;
  vy: number;
  rot: number;
  pipes: Pipe[];
  score: number;
  best: number;
  /**
   * Total world distance travelled. Left unwrapped so each parallax layer can
   * take its own modulo at draw time and never show a seam; it advances by
   * whole pixels, so it stays an exact integer far past any real session.
   */
  scroll: number;
  /** Ticks since the last flap, for the wing animation. */
  sinceFlap: number;
  /** Decaying impact shake, in px. */
  shake: number;
  /** Seeded RNG state, so a run is reproducible from its seed. */
  seed: number;
  /** Pipes spawned since the last start() — drives the opening-gap ease. */
  spawnCount: number;
}

/** The penguin rests here on the cover screen, and starts here on a run. */
const START_Y = Math.round(PLAY_H * 0.42);

/** mulberry32 — small, fast, and reproducible, which is what the tests need. */
function nextRandom(state: GameState): number {
  state.seed = (state.seed + 0x6d2b79f5) | 0;
  let z = state.seed;
  z = Math.imul(z ^ (z >>> 15), z | 1);
  z ^= z + Math.imul(z ^ (z >>> 7), z | 61);
  return ((z ^ (z >>> 14)) >>> 0) / 4294967296;
}

export function createState(best = 0, seed = (Math.random() * 2 ** 32) >>> 0): GameState {
  return {
    phase: 'cover',
    t: 0,
    y: START_Y,
    vy: 0,
    rot: 0,
    pipes: [],
    score: 0,
    best,
    scroll: 0,
    sinceFlap: 999,
    shake: 0,
    seed: seed >>> 0,
    spawnCount: 0,
  };
}

/** This spawn's gap height — PIPE.gap for a seasoned run, wider near pipe 1. */
function easedGap(spawnIndex: number): number {
  if (spawnIndex >= PIPE.easePipes) return PIPE.gap;
  const t = spawnIndex / PIPE.easePipes;
  return Math.round(PIPE.gap + PIPE.easeExtra * (1 - t));
}

/** Legal range for a gap top, given the margins and this pipe's own gap. */
function gapBounds(gap: number) {
  return { lo: PIPE.margin, hi: PLAY_H - gap - PIPE.margin };
}

/**
 * Pick the next gap. Biased to stay within `maxStep` of the previous gap so
 * the run always has a reachable line through it.
 */
function spawnPipe(s: GameState, x: number): Pipe {
  const gap = easedGap(s.spawnCount++);
  const { lo, hi } = gapBounds(gap);
  const prev = s.pipes.length ? s.pipes[s.pipes.length - 1].gapY : START_Y - gap / 2;
  const lo2 = Math.max(lo, prev - PIPE.maxStep);
  const hi2 = Math.min(hi, prev + PIPE.maxStep);
  const gapY = Math.round(lo2 + nextRandom(s) * (hi2 - lo2));
  return { x, gapY, gap, scored: false };
}

/** Begin a run from the cover screen (or after a game over). */
export function start(s: GameState): void {
  s.phase = 'playing';
  s.t = 0;
  s.y = START_Y;
  s.vy = PHYS.flap * 0.6; // a gentle lift so the first tap is not a fall
  s.rot = PHYS.rotUp;
  s.score = 0;
  s.pipes = [];
  s.sinceFlap = 0;
  s.shake = 0;
  s.spawnCount = 0;
  // Seed the field far enough right that the player gets a beat to react.
  for (let i = 0; i < 3; i++) {
    s.pipes.push(spawnPipe(s, VIEW.w + 60 + i * PIPE.spacing));
  }
}

export function flap(s: GameState): void {
  if (s.phase !== 'playing') return;
  s.vy = PHYS.flap;
  s.sinceFlap = 0;
}

/** Bird hitbox for the current state. */
export function birdBox(s: GameState) {
  return {
    left: BIRD.x - BIRD.w / 2,
    right: BIRD.x + BIRD.w / 2,
    top: s.y - BIRD.h / 2,
    bottom: s.y + BIRD.h / 2,
  };
}

/** True when the penguin overlaps a pipe or has reached the ground. */
export function hitTest(s: GameState): boolean {
  const b = birdBox(s);
  if (b.bottom >= PLAY_H) return true;

  for (const p of s.pipes) {
    if (b.right <= p.x || b.left >= p.x + PIPE.w) continue;
    // Inside the column horizontally — clear only through this pipe's own gap.
    if (b.top < p.gapY || b.bottom > p.gapY + p.gap) return true;
  }
  return false;
}

/** Advance exactly one 60Hz tick. Mutates and returns the same state object. */
export function step(s: GameState): GameState {
  s.t++;
  s.sinceFlap++;
  if (s.shake > 0) s.shake = Math.max(0, s.shake - 0.6);

  if (s.phase === 'cover') {
    // Idle bob, so the cover screen is not a still image.
    s.y = START_Y + Math.sin(s.t * 0.11) * 7;
    s.rot = Math.sin(s.t * 0.11) * 0.12;
    s.scroll += PIPE.speed * 0.5;
    return s;
  }

  if (s.phase === 'over') return s;

  // --- falling, both while alive and while tumbling out ---
  s.vy = Math.min(PHYS.maxFall, s.vy + PHYS.gravity);
  s.y += s.vy;

  if (s.phase === 'dying') {
    s.rot = Math.min(PHYS.rotDown, s.rot + 0.14);
    const floor = PLAY_H - BIRD.h / 2;
    if (s.y >= floor) {
      s.y = floor;
      s.phase = 'over';
      s.best = Math.max(s.best, s.score);
    }
    return s;
  }

  // --- alive ---
  s.scroll += PIPE.speed;

  // Tip toward the direction of travel; snap up quickly, tip down slowly.
  const target = s.vy < 0 ? PHYS.rotUp : Math.min(PHYS.rotDown, s.vy * 0.13);
  s.rot += (target - s.rot) * (s.vy < 0 ? 0.45 : 0.12);

  for (const p of s.pipes) p.x -= PIPE.speed;

  // Score the moment the penguin's hitbox clears a column.
  const b = birdBox(s);
  for (const p of s.pipes) {
    if (!p.scored && p.x + PIPE.w < b.left) {
      p.scored = true;
      s.score++;
    }
  }

  // Recycle: drop pipes that have left the view, keep the field topped up.
  s.pipes = s.pipes.filter((p) => p.x + PIPE.w > -PIPE.capOverhang);
  const last = s.pipes[s.pipes.length - 1];
  if (!last || last.x <= VIEW.w - PIPE.spacing) {
    s.pipes.push(spawnPipe(s, (last ? last.x : VIEW.w) + PIPE.spacing));
  }

  // The ceiling is solid, but touching it is not fatal — same as the original.
  if (s.y - BIRD.h / 2 < 0) {
    s.y = BIRD.h / 2;
    s.vy = 0;
  }

  if (hitTest(s)) {
    s.phase = 'dying';
    s.vy = -3.2; // small bounce off the impact
    s.shake = 6;
    s.best = Math.max(s.best, s.score);
  }

  return s;
}

/** Medal tiers shown on the game-over card. */
export function medalFor(score: number): 'none' | 'bronze' | 'silver' | 'gold' | 'platinum' {
  if (score >= 40) return 'platinum';
  if (score >= 30) return 'gold';
  if (score >= 20) return 'silver';
  if (score >= 10) return 'bronze';
  return 'none';
}

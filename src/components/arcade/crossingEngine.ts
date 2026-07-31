/**
 * Pica Crossing — game logic, with no reference to the DOM, canvas, or React.
 *
 * Same split as Flappy Picas: the simulation is pure so it can be driven
 * headlessly and asserted on, and so the renderer can be rewritten without
 * touching a single rule. Fixed 60Hz tick, fed whole ticks by the shell's
 * accumulator, so a 144Hz monitor and a throttled tab play identically.
 *
 * Layout is classic Frogger, bottom-to-top: you spawn on the near bank, cross
 * four lanes of traffic, catch your breath on the median, then ride logs and
 * lily pads across the river into one of five home slots at the top. Homes
 * persist across deaths; filling all five clears the level and speeds
 * everything up.
 */

/** Logical board size. The shell scales this by devicePixelRatio. */
export const VIEW = { w: 720, h: 396 } as const;

export const ROW_H = 36;
export const ROWS = 11;
/** One sideways hop. Vertical hops preserve x, so log rides stay off-grid. */
export const CELL_W = 40;

// Row map, index 0 at the top.
export const ROW_GOAL = 0;
export const ROW_MEDIAN = 5;
export const ROW_START = 10;
export const isRiver = (r: number) => r >= 1 && r <= 4;
export const isRoad = (r: number) => r >= 6 && r <= 9;

/** Centre y of a row. */
export const rowY = (r: number) => r * ROW_H + ROW_H / 2;

export const HOME_COUNT = 5;
export const HOME_W = 78;
export const homeCenterX = (i: number) => (VIEW.w / HOME_COUNT) * (i + 0.5);

/** Which home a landing x falls in, or -1 for the wall between them. */
export function homeIndexAt(x: number): number {
  for (let i = 0; i < HOME_COUNT; i++) {
    if (Math.abs(x - homeCenterX(i)) <= HOME_W / 2) return i;
  }
  return -1;
}

/** Frog hitbox half-width, and how many ticks one hop takes. */
export const FROG = { half: 13, hop: 8 } as const;

/** Ticks on the clock per attempt. 40s — long enough to think, short enough to push. */
export const START_TIME = 60 * 40;

export const START_LIVES = 3;

export type Phase = 'cover' | 'playing' | 'dying' | 'levelup' | 'over';
export type LaneKind = 'road' | 'river';
export type ItemKind = 'car' | 'truck' | 'racer' | 'log' | 'pad';
export type DeathKind = 'squash' | 'splash' | 'time';

export interface Lane {
  row: number;
  kind: LaneKind;
  item: ItemKind;
  dir: 1 | -1;
  /** Level-1 speed in px/tick. Scaled by `speedOf`. */
  baseSpeed: number;
  len: number;
  gap: number;
  count: number;
  /** Total wrap distance. Always >= VIEW.w + len + gap so wrapping never pops. */
  span: number;
  offset: number;
  /** Palette slot, so two lanes of the same item kind don't read as clones. */
  hue: number;
}

export interface Frog {
  x: number;
  y: number;
  row: number;
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  /** Hop progress 0..1. 1 means idle. */
  t: number;
  /** 0 up, 1 right, 2 down, 3 left. */
  facing: 0 | 1 | 2 | 3;
  /**
   * Log velocity applied to both ends of an in-flight hop. Without it a
   * sideways hop taken while riding drifts off the log and drowns you for
   * something that looked correct on screen.
   */
  carry: number;
}

export interface Bonus {
  row: number;
  x: number;
  life: number;
}

export interface GameState {
  phase: Phase;
  lanes: Lane[];
  frog: Frog;
  homes: boolean[];
  score: number;
  best: number;
  lives: number;
  level: number;
  time: number;
  /** Highest row reached this attempt — progress only scores once. */
  furthest: number;
  bonus: Bonus | null;
  /** Monotonic pickup counter. The shell watches it to fire the SFX, so the
   *  engine stays free of side effects and the sound can't be inferred wrong
   *  from a score delta that a home bonus also matches. */
  pickups: number;
  dieT: number;
  dieKind: DeathKind;
  /** Counts down after a pickup or a home, for the renderer's flash. */
  flashT: number;
  levelT: number;
  tick: number;
  seed: number;
}

interface LaneCfg {
  row: number;
  kind: LaneKind;
  item: ItemKind;
  dir: 1 | -1;
  speed: number;
  len: number;
  gap: number;
  hue: number;
}

/**
 * Traffic gets faster as it gets further from the start bank, so the run has a
 * difficulty ramp inside a single crossing rather than four interchangeable
 * lanes. The river alternates direction every row for the same reason: you
 * cannot ride one heading all the way across.
 */
const LANE_CFG: LaneCfg[] = [
  { row: 1, kind: 'river', item: 'log', dir: -1, speed: 0.95, len: 150, gap: 252, hue: 0 },
  { row: 2, kind: 'river', item: 'pad', dir: 1, speed: 1.30, len: 84, gap: 182, hue: 1 },
  { row: 3, kind: 'river', item: 'log', dir: -1, speed: 1.70, len: 194, gap: 314, hue: 2 },
  { row: 4, kind: 'river', item: 'pad', dir: 1, speed: 1.05, len: 96, gap: 198, hue: 3 },
  { row: 6, kind: 'road', item: 'truck', dir: 1, speed: 1.15, len: 118, gap: 322, hue: 0 },
  { row: 7, kind: 'road', item: 'racer', dir: -1, speed: 2.55, len: 58, gap: 270, hue: 1 },
  { row: 8, kind: 'road', item: 'car', dir: 1, speed: 1.85, len: 64, gap: 238, hue: 2 },
  { row: 9, kind: 'road', item: 'car', dir: -1, speed: 1.30, len: 64, gap: 212, hue: 3 },
];

function buildLanes(): Lane[] {
  return LANE_CFG.map((c, i) => {
    const count = Math.ceil((VIEW.w + c.len + c.gap) / c.gap);
    const span = count * c.gap;
    return {
      row: c.row,
      kind: c.kind,
      item: c.item,
      dir: c.dir,
      baseSpeed: c.speed,
      len: c.len,
      gap: c.gap,
      count,
      span,
      // Stagger the phases so the board never lines up into a visible grid.
      offset: (i * 137) % span,
      hue: c.hue,
    };
  });
}

/** Level 1 plays at the tuned speed; each level adds 15%. */
export const speedOf = (l: Lane, level: number) => l.baseSpeed * (1 + (level - 1) * 0.15);

/**
 * Walk a lane's items without allocating. Positions are derived from a single
 * scrolling offset rather than a spawn list, so items can never bunch up,
 * never leak, and never need culling.
 */
export function forEachItem(l: Lane, fn: (x: number, idx: number) => void) {
  for (let i = 0; i < l.count; i++) {
    let x = (i * l.gap + l.offset) % l.span;
    if (x < 0) x += l.span;
    fn(x - l.len, i);
  }
}

const laneAt = (g: GameState, row: number) => g.lanes.find((l) => l.row === row);

/** Deterministic RNG so a recorded run replays identically. */
function rnd(g: GameState) {
  g.seed = (g.seed * 1664525 + 1013904223) >>> 0;
  return g.seed / 4294967296;
}

// -------------------------------------------------------------- construction

function freshFrog(): Frog {
  const x = VIEW.w / 2;
  const y = rowY(ROW_START);
  return { x, y, row: ROW_START, fromX: x, fromY: y, toX: x, toY: y, t: 1, facing: 0, carry: 0 };
}

export function createState(best: number): GameState {
  return {
    phase: 'cover',
    lanes: buildLanes(),
    frog: freshFrog(),
    homes: new Array(HOME_COUNT).fill(false),
    score: 0,
    best,
    lives: START_LIVES,
    level: 1,
    time: START_TIME,
    furthest: ROW_START,
    bonus: null,
    pickups: 0,
    dieT: 0,
    dieKind: 'squash',
    flashT: 0,
    levelT: 0,
    tick: 0,
    seed: 0x5eed1234,
  };
}

/** Reset the frog and the clock. Homes survive — they only clear on a level. */
function beginLife(g: GameState, clearHomes: boolean) {
  if (clearHomes) g.homes.fill(false);
  g.frog = freshFrog();
  g.time = START_TIME;
  g.furthest = ROW_START;
  g.bonus = null;
  g.phase = 'playing';
}

export function start(g: GameState) {
  g.score = 0;
  g.lives = START_LIVES;
  g.level = 1;
  g.flashT = 0;
  g.levelT = 0;
  beginLife(g, true);
}

// ------------------------------------------------------------------- queries

/** Velocity of whatever the frog is standing on in a river row, or null if water. */
function rideAt(g: GameState, row: number, x: number): number | null {
  const l = laneAt(g, row);
  if (!l) return null;
  let v: number | null = null;
  // 4px of slack at each end: a toe hanging over the bark should not drown you.
  forEachItem(l, (ix) => {
    if (v === null && x >= ix - 4 && x <= ix + l.len + 4) v = l.dir * speedOf(l, g.level);
  });
  return v;
}

/** Traffic hit test. Car hitboxes are inset 5px so a near miss reads as a miss. */
function hitTraffic(g: GameState, row: number, x: number): boolean {
  const l = laneAt(g, row);
  if (!l) return false;
  let hit = false;
  forEachItem(l, (ix) => {
    if (!hit && x + FROG.half > ix + 5 && x - FROG.half < ix + l.len - 5) hit = true;
  });
  return hit;
}

// --------------------------------------------------------------------- input

/**
 * Queue a hop. Ignored mid-hop, which is what keeps the grid readable — you
 * commit to one square at a time and cannot cancel out of a bad decision.
 * Returns whether a hop actually started, so the shell knows to play the SFX.
 */
export function hop(g: GameState, dir: 0 | 1 | 2 | 3): boolean {
  if (g.phase !== 'playing') return false;
  const f = g.frog;
  if (f.t < 1) return false;

  let row = f.row;
  let x = f.x;
  if (dir === 0) row -= 1;
  else if (dir === 2) row += 1;
  else if (dir === 1) x += CELL_W;
  else x -= CELL_W;

  if (row < ROW_GOAL || row > ROW_START) return false;
  x = Math.max(CELL_W / 2, Math.min(VIEW.w - CELL_W / 2, x));
  if (row === f.row && x === f.x) return false;

  // Inherit the current log's drift for the whole flight.
  f.carry = isRiver(f.row) ? (rideAt(g, f.row, f.x) ?? 0) : 0;
  f.fromX = f.x;
  f.fromY = f.y;
  f.toX = x;
  f.toY = rowY(row);
  f.row = row;
  f.facing = dir;
  f.t = 0;
  return true;
}

// ---------------------------------------------------------------------- step

function die(g: GameState, kind: DeathKind) {
  g.phase = 'dying';
  g.dieKind = kind;
  g.dieT = 58;
  g.lives -= 1;
}

function afterDeath(g: GameState) {
  if (g.lives <= 0) {
    g.phase = 'over';
    if (g.score > g.best) g.best = g.score;
  } else {
    beginLife(g, false);
  }
}

function resolveHome(g: GameState) {
  const i = homeIndexAt(g.frog.x);
  if (i < 0 || g.homes[i]) {
    die(g, 'splash');
    return;
  }
  g.homes[i] = true;
  g.score += 100 + Math.floor(g.time / 60) * 5;
  g.flashT = 34;
  if (g.homes.every(Boolean)) {
    g.score += 300 * g.level;
    g.level += 1;
    g.phase = 'levelup';
    g.levelT = 105;
  } else {
    beginLife(g, false);
  }
}

/** Everything that happens the instant a hop finishes. */
function land(g: GameState) {
  const f = g.frog;
  f.x = f.toX;
  f.y = f.toY;
  f.carry = 0;

  if (f.row < g.furthest) {
    g.score += 10 * (g.furthest - f.row);
    g.furthest = f.row;
  }

  if (f.row === ROW_GOAL) {
    resolveHome(g);
    return;
  }
  if (isRiver(f.row) && rideAt(g, f.row, f.x) === null) die(g, 'splash');
}

function advanceLanes(g: GameState) {
  for (const l of g.lanes) {
    l.offset += l.dir * speedOf(l, g.level);
    l.offset = ((l.offset % l.span) + l.span) % l.span;
  }
}

export function step(g: GameState) {
  g.tick++;
  if (g.flashT > 0) g.flashT--;

  // Attract mode and the game-over card keep the board alive behind them.
  if (g.phase === 'cover' || g.phase === 'over') {
    advanceLanes(g);
    return;
  }
  // Freeze traffic during the death beat so the cause of death stays readable.
  if (g.phase === 'dying') {
    if (--g.dieT <= 0) afterDeath(g);
    return;
  }
  if (g.phase === 'levelup') {
    advanceLanes(g);
    if (--g.levelT <= 0) beginLife(g, true);
    return;
  }

  advanceLanes(g);

  const f = g.frog;
  if (f.t < 1) {
    // Carry both ends so the arc lands where the log will be, not where it was.
    if (f.carry !== 0) {
      f.fromX += f.carry;
      f.toX += f.carry;
    }
    f.t = Math.min(1, f.t + 1 / FROG.hop);
    // Ease-out: the frog leaves fast and settles, which reads as a real hop.
    const e = 1 - (1 - f.t) * (1 - f.t);
    f.x = f.fromX + (f.toX - f.fromX) * e;
    f.y = f.fromY + (f.toY - f.fromY) * e;
    if (f.t >= 1) {
      land(g);
      if (g.phase !== 'playing') return;
    }
  } else if (isRiver(f.row)) {
    const v = rideAt(g, f.row, f.x);
    if (v === null) {
      die(g, 'splash');
      return;
    }
    f.x += v;
    // Carried off the edge of the board. Classic, and it teaches the lanes.
    if (f.x < 10 || f.x > VIEW.w - 10) {
      die(g, 'splash');
      return;
    }
  }

  // Traffic is checked every tick, mid-hop included — a car that arrives while
  // you are in the air still hits you.
  if (isRoad(f.row) && hitTraffic(g, f.row, f.x)) {
    die(g, 'squash');
    return;
  }

  // Bonus yoyo: a tempting detour on the median, never on a lethal row.
  if (g.bonus) {
    if (--g.bonus.life <= 0) g.bonus = null;
    else if (f.row === g.bonus.row && Math.abs(f.x - g.bonus.x) < 24) {
      g.score += 50;
      g.flashT = 24;
      g.pickups++;
      g.bonus = null;
    }
  } else if (g.tick % 430 === 0) {
    g.bonus = { row: ROW_MEDIAN, x: 70 + rnd(g) * (VIEW.w - 140), life: 60 * 9 };
  }

  if (--g.time <= 0) die(g, 'time');
}

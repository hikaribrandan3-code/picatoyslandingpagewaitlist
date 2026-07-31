/**
 * Canvas painter for Pica Crossing. Pure: reads a GameState, writes pixels,
 * owns no state except a couple of lazily-built texture tiles.
 *
 * The look is three things layered deliberately:
 *
 *   1. CLAY   — every object is an extruded rounded shape: soft ground shadow,
 *               a darker side wall offset downward, a gradient top face, and an
 *               OFF-CENTRE gloss + dent. Off-centre matters: a symmetric
 *               highlight reads as a CSS bevel, an asymmetric one reads as a
 *               thumbprint. Same recipe as the .clay rule in index.css.
 *   2. 3D     — the side walls give real height, and the shell tilts the whole
 *               canvas with a CSS perspective so the board recedes. Depth
 *               scales with row so nearer rows sit taller.
 *   3. RETRO  — scanlines, a CRT vignette, chunky checker curbs and a dot-grain
 *               tile over the top, so the plasticine reads as a cabinet screen
 *               rather than a render.
 */
import {
  VIEW, ROW_H, ROW_GOAL, ROW_MEDIAN, ROW_START, HOME_COUNT, HOME_W,
  homeCenterX, rowY, isRiver, isRoad, forEachItem, type GameState, type Lane,
} from './crossingEngine';

const TAU = Math.PI * 2;

interface Clay {
  top: string;
  fill: string;
  bot: string;
  edge: string;
  ledge: string;
}

const C = {
  coral: { top: '#FF9F9F', fill: '#FF6B6B', bot: '#EE5555', edge: '#D94F4F', ledge: '#B03B3B' },
  yellow: { top: '#FFEE9C', fill: '#FFD93D', bot: '#F2C424', edge: '#D4A017', ledge: '#B08512' },
  blue: { top: '#8FBEFF', fill: '#4D96FF', bot: '#3B83EE', edge: '#2B62D9', ledge: '#2350B0' },
  green: { top: '#A6EAAF', fill: '#6BCB77', bot: '#57B963', edge: '#3E9648', ledge: '#32793B' },
  teal: { top: '#7FEDE8', fill: '#3BA8A8', bot: '#2E9292', edge: '#248383', ledge: '#1B6666' },
  cream: { top: '#FFFEFC', fill: '#FFF6EA', bot: '#F7E8D4', edge: '#E3CDB0', ledge: '#CBB093' },
  wood: { top: '#D2A171', fill: '#A9713F', bot: '#8E5C31', edge: '#6E4626', ledge: '#553618' },
  pad: { top: '#9FE08A', fill: '#71C25C', bot: '#5FAD4C', edge: '#47893A', ledge: '#396E2F' },
  road: { top: '#96897E', fill: '#7D7268', bot: '#6B6057', edge: '#514840', ledge: '#3E3730' },
  water: { top: '#8AD0F7', fill: '#57ACE4', bot: '#4595CE', edge: '#3179AE', ledge: '#255F8B' },
  grass: { top: '#B4EBAB', fill: '#8BD584', bot: '#77C270', edge: '#5AA355', ledge: '#478642' },
  bank: { top: '#FFF3D8', fill: '#F7E2BC', bot: '#EDD3A6', edge: '#D8B87F', ledge: '#BF9C63' },
} satisfies Record<string, Clay>;

/** Car body colours, cycled by lane hue so no two lanes look like clones. */
const CAR_CLAY: Clay[] = [C.coral, C.blue, C.yellow, C.teal];

// ------------------------------------------------------------------ textures

let grainTile: CanvasPattern | null = null;
let scanTile: CanvasPattern | null = null;

/** Fine plasticine grain. Built once, reused as a repeating pattern. */
function getGrain(ctx: CanvasRenderingContext2D): CanvasPattern | null {
  if (grainTile) return grainTile;
  const c = document.createElement('canvas');
  c.width = c.height = 96;
  const g = c.getContext('2d');
  if (!g) return null;
  const img = g.createImageData(96, 96);
  // Deterministic noise: a fixed pattern never shimmers between frames.
  let s = 0x13579bdf;
  for (let i = 0; i < img.data.length; i += 4) {
    s = (s * 1664525 + 1013904223) >>> 0;
    const v = 128 + ((s >>> 24) - 128) * 0.5;
    img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
    img.data[i + 3] = 255;
  }
  g.putImageData(img, 0, 0);
  grainTile = ctx.createPattern(c, 'repeat');
  return grainTile;
}

/** CRT scanlines — 3px pitch, one dark row. */
function getScan(ctx: CanvasRenderingContext2D): CanvasPattern | null {
  if (scanTile) return scanTile;
  const c = document.createElement('canvas');
  c.width = 1;
  c.height = 3;
  const g = c.getContext('2d');
  if (!g) return null;
  g.fillStyle = 'rgba(0,0,0,0.42)';
  g.fillRect(0, 0, 1, 1);
  scanTile = ctx.createPattern(c, 'repeat');
  return scanTile;
}

// ------------------------------------------------------------- clay builders

function rr(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number | number[]) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r as number[]);
}

function groundShadow(ctx: CanvasRenderingContext2D, cx: number, cy: number, rx: number, ry: number, alpha = 0.22) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = '#3D2E1E';
  ctx.beginPath();
  ctx.ellipse(cx, cy, rx, ry, 0, 0, TAU);
  ctx.fill();
  ctx.restore();
}

/**
 * The whole look in one function: shadow, extruded side wall, gradient top,
 * off-centre gloss and dent. `depth` is how tall the object stands.
 */
function clayBlock(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number,
  r: number | number[], c: Clay, depth = 6, shadow = true,
) {
  if (shadow) groundShadow(ctx, x + w / 2 + 2, y + h + depth - 2, w * 0.5, Math.max(3, h * 0.3));

  // Side wall. Drawn as the same silhouette pushed down, so the visible sliver
  // between the two is the object's height.
  ctx.fillStyle = c.ledge;
  rr(ctx, x, y + depth, w, h, r);
  ctx.fill();

  // Top face.
  const g = ctx.createLinearGradient(x, y, x + w * 0.35, y + h);
  g.addColorStop(0, c.top);
  g.addColorStop(0.55, c.fill);
  g.addColorStop(1, c.bot);
  rr(ctx, x, y, w, h, r);
  ctx.fillStyle = g;
  ctx.fill();
  ctx.strokeStyle = c.edge;
  ctx.lineWidth = 2;
  ctx.stroke();

  // Thumbprint lighting, clipped to the shape.
  ctx.save();
  rr(ctx, x, y, w, h, r);
  ctx.clip();
  const span = Math.max(w, h);
  const hi = ctx.createRadialGradient(x + w * 0.26, y + h * 0.2, 0, x + w * 0.26, y + h * 0.2, span * 0.55);
  hi.addColorStop(0, 'rgba(255,255,255,0.5)');
  hi.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = hi;
  ctx.fillRect(x, y, w, h);
  const lo = ctx.createRadialGradient(x + w * 0.8, y + h * 0.86, 0, x + w * 0.8, y + h * 0.86, span * 0.5);
  lo.addColorStop(0, 'rgba(40,20,0,0.2)');
  lo.addColorStop(1, 'rgba(40,20,0,0)');
  ctx.fillStyle = lo;
  ctx.fillRect(x, y, w, h);
  ctx.restore();
}

/** Extruded blob. Same recipe, elliptical silhouette. */
function clayBall(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number, rx: number, ry: number, c: Clay, depth = 5, shadow = true,
) {
  if (shadow) groundShadow(ctx, cx + 1, cy + ry + depth - 2, rx * 0.95, ry * 0.42);

  ctx.fillStyle = c.ledge;
  ctx.beginPath();
  ctx.ellipse(cx, cy + depth, rx, ry, 0, 0, TAU);
  ctx.fill();

  const g = ctx.createLinearGradient(cx - rx, cy - ry, cx + rx * 0.4, cy + ry);
  g.addColorStop(0, c.top);
  g.addColorStop(0.55, c.fill);
  g.addColorStop(1, c.bot);
  ctx.beginPath();
  ctx.ellipse(cx, cy, rx, ry, 0, 0, TAU);
  ctx.fillStyle = g;
  ctx.fill();
  ctx.strokeStyle = c.edge;
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.save();
  ctx.beginPath();
  ctx.ellipse(cx, cy, rx, ry, 0, 0, TAU);
  ctx.clip();
  const hi = ctx.createRadialGradient(cx - rx * 0.35, cy - ry * 0.42, 0, cx - rx * 0.35, cy - ry * 0.42, rx * 1.2);
  hi.addColorStop(0, 'rgba(255,255,255,0.55)');
  hi.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = hi;
  ctx.fillRect(cx - rx, cy - ry, rx * 2, ry * 2);
  ctx.restore();
}

/** Pressed-in clay, for home slots. Highlight and shadow swap corners. */
function clayWell(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number[], c: Clay) {
  rr(ctx, x, y, w, h, r);
  ctx.fillStyle = c.bot;
  ctx.fill();
  ctx.save();
  rr(ctx, x, y, w, h, r);
  ctx.clip();
  const lo = ctx.createLinearGradient(x, y, x, y + h);
  lo.addColorStop(0, 'rgba(0,0,0,0.26)');
  lo.addColorStop(0.6, 'rgba(0,0,0,0)');
  ctx.fillStyle = lo;
  ctx.fillRect(x, y, w, h);
  const hi = ctx.createLinearGradient(x, y + h, x, y);
  hi.addColorStop(0, 'rgba(255,255,255,0.4)');
  hi.addColorStop(0.5, 'rgba(255,255,255,0)');
  ctx.fillStyle = hi;
  ctx.fillRect(x, y, w, h);
  ctx.restore();
  rr(ctx, x, y, w, h, r);
  ctx.strokeStyle = c.edge;
  ctx.lineWidth = 2;
  ctx.stroke();
}

// --------------------------------------------------------------------- scene

/** Deterministic per-cell jitter, so scenery is scattered but never flickers. */
const hash = (n: number) => {
  const s = Math.sin(n * 127.1) * 43758.5453;
  return s - Math.floor(s);
};

function drawBank(ctx: CanvasRenderingContext2D, row: number, c: Clay, seed: number) {
  const y = row * ROW_H;
  const g = ctx.createLinearGradient(0, y, 0, y + ROW_H);
  g.addColorStop(0, c.top);
  g.addColorStop(0.5, c.fill);
  g.addColorStop(1, c.bot);
  ctx.fillStyle = g;
  ctx.fillRect(0, y, VIEW.w, ROW_H);

  // Retro checker curb along the top lip of the bank.
  ctx.save();
  ctx.globalAlpha = 0.16;
  for (let x = 0; x < VIEW.w; x += 16) {
    ctx.fillStyle = (x / 16) % 2 === 0 ? '#2D2D2D' : '#FFFFFF';
    ctx.fillRect(x, y, 16, 4);
  }
  ctx.restore();

  // Clay tufts. Positions are hashed off the seed, not random per frame.
  for (let i = 0; i < 14; i++) {
    const h1 = hash(seed + i * 3.7);
    const h2 = hash(seed + i * 9.1);
    const x = h1 * VIEW.w;
    const cy = y + 12 + h2 * (ROW_H - 20);
    clayBall(ctx, x, cy, 5 + h2 * 4, 3.5 + h1 * 2.5, C.green, 3, false);
  }
}

function drawRoad(ctx: CanvasRenderingContext2D, rows: number[]) {
  const top = rows[0] * ROW_H;
  const h = rows.length * ROW_H;
  const g = ctx.createLinearGradient(0, top, 0, top + h);
  g.addColorStop(0, C.road.top);
  g.addColorStop(0.45, C.road.fill);
  g.addColorStop(1, C.road.bot);
  ctx.fillStyle = g;
  ctx.fillRect(0, top, VIEW.w, h);

  // Inner shadow at both edges so the asphalt sits *below* the banks.
  const sh = ctx.createLinearGradient(0, top, 0, top + 12);
  sh.addColorStop(0, 'rgba(0,0,0,0.3)');
  sh.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = sh;
  ctx.fillRect(0, top, VIEW.w, 12);

  // Lane dashes between rows, chunky and slightly uneven — moulded, not printed.
  ctx.fillStyle = 'rgba(255,248,230,0.72)';
  for (let i = 1; i < rows.length; i++) {
    const y = (rows[0] + i) * ROW_H - 2;
    for (let x = 8; x < VIEW.w; x += 44) {
      rr(ctx, x, y, 24, 4, 2);
      ctx.fill();
    }
  }
}

function drawRiver(ctx: CanvasRenderingContext2D, rows: number[], tick: number) {
  const top = rows[0] * ROW_H;
  const h = rows.length * ROW_H;
  const g = ctx.createLinearGradient(0, top, 0, top + h);
  g.addColorStop(0, C.water.top);
  g.addColorStop(0.5, C.water.fill);
  g.addColorStop(1, C.water.bot);
  ctx.fillStyle = g;
  ctx.fillRect(0, top, VIEW.w, h);

  // Rolling ripple bands. Two incommensurate sines so the surface never
  // visibly repeats, drawn per row so each lane drifts at its own rate.
  ctx.save();
  ctx.beginPath();
  ctx.rect(0, top, VIEW.w, h);
  ctx.clip();
  for (let r = 0; r < rows.length; r++) {
    const cy = rows[r] * ROW_H + ROW_H * 0.5;
    const drift = tick * (0.35 + r * 0.12) * (r % 2 ? -1 : 1);
    ctx.strokeStyle = r % 2 ? 'rgba(255,255,255,0.22)' : 'rgba(20,70,110,0.18)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    for (let x = 0; x <= VIEW.w; x += 6) {
      const yy = cy + Math.sin((x + drift) / 34) * 3 + Math.sin((x + drift) / 71) * 2;
      if (x === 0) ctx.moveTo(x, yy);
      else ctx.lineTo(x, yy);
    }
    ctx.stroke();
  }
  ctx.restore();
}

// --------------------------------------------------------------------- items

function drawLog(ctx: CanvasRenderingContext2D, x: number, y: number, len: number) {
  const h = 26;
  const top = y - h / 2;
  clayBlock(ctx, x, top, len, h, [13, 13, 13, 13], C.wood, 7);
  // Bark grooves + cut rings at each end.
  ctx.save();
  rr(ctx, x, top, len, h, 13);
  ctx.clip();
  ctx.strokeStyle = 'rgba(90,54,24,0.32)';
  ctx.lineWidth = 2;
  for (let i = 1; i < 5; i++) {
    const gx = x + (len * i) / 5;
    ctx.beginPath();
    ctx.moveTo(gx, top + 5);
    ctx.lineTo(gx + 3, top + h - 5);
    ctx.stroke();
  }
  ctx.restore();
  for (const cx of [x + 9, x + len - 9]) {
    ctx.beginPath();
    ctx.ellipse(cx, y, 5, 8, 0, 0, TAU);
    ctx.fillStyle = C.wood.top;
    ctx.fill();
    ctx.strokeStyle = C.wood.edge;
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(cx, y, 2, 3.5, 0, 0, TAU);
    ctx.strokeStyle = 'rgba(110,70,38,0.6)';
    ctx.stroke();
  }
}

function drawPad(ctx: CanvasRenderingContext2D, x: number, y: number, len: number, idx: number) {
  // A lily raft: two or three overlapping pads, so it reads organic.
  const n = len > 90 ? 3 : 2;
  const step = len / n;
  for (let i = 0; i < n; i++) {
    const cx = x + step * (i + 0.5);
    const rx = step * 0.56;
    clayBall(ctx, cx, y, rx, 13, C.pad, 5);
    // Notch, rotated per pad. Clipped to the pad — an unclipped wedge shoots
    // out past the rim and reads as a blue arrow stuck to the lily.
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(cx, y, rx, 13, 0, 0, TAU);
    ctx.clip();
    ctx.translate(cx, y);
    ctx.rotate(hash(idx * 7 + i) * TAU);
    ctx.fillStyle = C.water.fill;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(rx * 1.4, -5.5);
    ctx.lineTo(rx * 1.4, 5.5);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }
  // One flower per raft, for colour.
  const fx = x + step * 0.5;
  for (let p = 0; p < 5; p++) {
    const a = (p / 5) * TAU;
    clayBall(ctx, fx + Math.cos(a) * 4, y - 2 + Math.sin(a) * 4, 3.2, 3.2, C.coral, 2, false);
  }
  clayBall(ctx, fx, y - 2, 2.6, 2.6, C.yellow, 1, false);
}

const TYRE: Clay = { top: '#5A5A5A', fill: '#3A3A3A', bot: '#2A2A2A', edge: '#1E1E1E', ledge: '#141414' };
const GLASS: Clay = { top: '#8FA8BC', fill: '#5E7A92', bot: '#4B6579', edge: '#3A5064', ledge: '#2C3D4D' };

/** Wheels sit at the body's lower edge so only the bottom arc shows. Drawn
 *  before the shell — tucked fully inside, they may as well not be there. */
function wheels(ctx: CanvasRenderingContext2D, xs: number[], y: number, h: number) {
  for (const wx of xs) clayBall(ctx, wx, y + h / 2 + 1, 6, 4.8, TYRE, 3, false);
}

function drawCar(ctx: CanvasRenderingContext2D, x: number, y: number, len: number, dir: number, clay: Clay, racer: boolean) {
  const h = racer ? 22 : 25;
  const top = y - h / 2;
  const front = dir > 0 ? x + len : x;
  const nose = dir > 0 ? -1 : 1;

  wheels(ctx, [x + len * 0.24, x + len * 0.76], y, h);
  clayBlock(ctx, x, top, len, h, racer ? [7, 7, 7, 7] : [9, 8, 10, 8], clay, 8);

  // Read as a car from above: a pale cabin across the middle, with a dark
  // glass band at each end of it. The cabin is what makes the two bands read
  // as a windscreen and a rear window instead of a pair of eyes.
  const roofW = len * (racer ? 0.46 : 0.5);
  const roofX = x + (len - roofW) / 2 - nose * len * 0.05;
  clayBlock(ctx, roofX, top + 3, roofW, h - 6, 5, C.cream, 2, false);
  const gw = roofW * 0.26;
  for (const gx of [roofX + 2, roofX + roofW - gw - 2]) {
    clayBlock(ctx, gx, top + 4.5, gw, h - 9, 2.5, GLASS, 0, false);
  }

  // Headlights at the nose, one per side.
  for (const dy of [-5.5, 5.5]) clayBall(ctx, front + nose * 4.5, y + dy, 3, 2.6, C.yellow, 2, false);
}

function drawTruck(ctx: CanvasRenderingContext2D, x: number, y: number, len: number, dir: number) {
  const h = 27;
  const top = y - h / 2;
  const cabW = len * 0.3;
  const cabX = dir > 0 ? x + len - cabW : x;
  const boxX = dir > 0 ? x : x + cabW;
  const boxW = len - cabW;
  const nose = dir > 0 ? -1 : 1;

  wheels(ctx, [x + len * 0.14, x + len * 0.52, x + len * 0.86], y, h);

  // Cab and cargo share a baseline and butt flush together — offsetting them
  // vertically made the truck read as two unrelated blocks.
  clayBlock(ctx, boxX, top, boxW, h, [7, 7, 7, 7], C.cream, 8);
  clayBlock(ctx, cabX, top, cabW, h, [9, 8, 9, 8], C.coral, 8);
  clayBlock(ctx, cabX + cabW * 0.2, top + 4, cabW * 0.6, h - 8, 4, GLASS, 0, false);
  const front = dir > 0 ? cabX + cabW : cabX;
  for (const dy of [-6, 6]) clayBall(ctx, front + nose * 4.5, y + dy, 3, 2.6, C.yellow, 2, false);

  // Pica stripe down the cargo box, centred whichever way the truck faces.
  const sw = 7, sg = 9;
  const sx = boxX + boxW / 2 - (4 * sg - (sg - sw)) / 2;
  ctx.save();
  ctx.globalAlpha = 0.9;
  for (let i = 0; i < 4; i++) {
    ctx.fillStyle = [C.coral.fill, C.yellow.fill, C.green.fill, C.blue.fill][i];
    ctx.fillRect(sx + i * sg, y - 2.5, sw, 6);
  }
  ctx.restore();
}

function drawLaneItems(ctx: CanvasRenderingContext2D, l: Lane) {
  const y = rowY(l.row);
  forEachItem(l, (x, i) => {
    if (x > VIEW.w + 8 || x + l.len < -8) return;
    if (l.item === 'log') drawLog(ctx, x, y, l.len);
    else if (l.item === 'pad') drawPad(ctx, x, y, l.len, i + l.row * 13);
    else if (l.item === 'truck') drawTruck(ctx, x, y, l.len, l.dir);
    else drawCar(ctx, x, y, l.len, l.dir, CAR_CLAY[(l.hue + i) % CAR_CLAY.length], l.item === 'racer');
  });
}

// ---------------------------------------------------------------- goal bank

function drawGoal(ctx: CanvasRenderingContext2D, g: GameState) {
  const y = ROW_GOAL * ROW_H;
  const grad = ctx.createLinearGradient(0, y, 0, y + ROW_H);
  grad.addColorStop(0, C.bank.top);
  grad.addColorStop(1, C.bank.bot);
  ctx.fillStyle = grad;
  ctx.fillRect(0, y, VIEW.w, ROW_H);

  // Hedge walls between slots, so the gaps read as targets.
  for (let i = 0; i <= HOME_COUNT; i++) {
    const cx = i === 0 ? 0 : i === HOME_COUNT ? VIEW.w : (homeCenterX(i - 1) + homeCenterX(i)) / 2;
    clayBlock(ctx, cx - 13, y + 2, 26, ROW_H - 4, [8, 6, 8, 6], C.green, 5, false);
  }

  for (let i = 0; i < HOME_COUNT; i++) {
    const cx = homeCenterX(i);
    const x = cx - HOME_W / 2 + 6;
    const w = HOME_W - 12;
    clayWell(ctx, x, y + 5, w, ROW_H - 10, [10, 8, 10, 8], C.bank);

    if (g.homes[i]) {
      // A settled frog, plus a warm glow while the score flash is running.
      if (g.flashT > 0) {
        ctx.save();
        ctx.globalAlpha = (g.flashT / 34) * 0.5;
        ctx.fillStyle = C.yellow.fill;
        rr(ctx, x - 3, y + 2, w + 6, ROW_H - 4, 12);
        ctx.fill();
        ctx.restore();
      }
      clayBall(ctx, cx, y + ROW_H / 2, 12, 10, C.green, 4, false);
      for (const ex of [-4.5, 4.5]) {
        clayBall(ctx, cx + ex, y + ROW_H / 2 - 5, 3.6, 3.6, C.cream, 1, false);
        ctx.fillStyle = '#2D2D2D';
        ctx.beginPath();
        ctx.arc(cx + ex, y + ROW_H / 2 - 5, 1.7, 0, TAU);
        ctx.fill();
      }
    } else {
      // Empty slot: a yellow waitlist ticket, bobbing.
      const bob = Math.sin(g.tick / 22 + i) * 1.6;
      clayBlock(ctx, cx - 11, y + ROW_H / 2 - 7 + bob, 22, 14, [5, 4, 5, 4], C.yellow, 3, false);
      ctx.fillStyle = 'rgba(45,45,45,0.55)';
      ctx.fillRect(cx - 6, y + ROW_H / 2 - 2 + bob, 12, 2);
    }
  }
}

// ---------------------------------------------------------------------- frog

function drawFrogBody(ctx: CanvasRenderingContext2D, scaleX: number, scaleY: number, dead: boolean) {
  ctx.save();
  ctx.scale(scaleX, scaleY);

  // Hind feet, splayed behind.
  for (const sx of [-1, 1]) {
    clayBall(ctx, sx * 11, 9, 6, 4.5, C.pad, 3, false);
  }
  // Front feet.
  for (const sx of [-1, 1]) {
    clayBall(ctx, sx * 10, -6, 5, 4, C.pad, 2, false);
  }

  clayBall(ctx, 0, 0, 13, 12, C.green, 6, false);

  // Belly, lighter and low.
  ctx.save();
  ctx.globalAlpha = 0.5;
  clayBall(ctx, 0, 3, 8, 6, C.pad, 0, false);
  ctx.restore();

  // Eye domes on top of the head.
  for (const ex of [-6, 6]) {
    clayBall(ctx, ex, -7.5, 5.4, 5.4, C.green, 3, false);
    clayBall(ctx, ex, -8.5, 3.6, 3.6, C.cream, 1, false);
    if (dead) {
      ctx.strokeStyle = '#2D2D2D';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(ex - 2.4, -10.9);
      ctx.lineTo(ex + 2.4, -6.1);
      ctx.moveTo(ex + 2.4, -10.9);
      ctx.lineTo(ex - 2.4, -6.1);
      ctx.stroke();
    } else {
      ctx.fillStyle = '#2D2D2D';
      ctx.beginPath();
      ctx.arc(ex, -9.2, 1.9, 0, TAU);
      ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.9)';
      ctx.beginPath();
      ctx.arc(ex - 0.8, -10, 0.8, 0, TAU);
      ctx.fill();
    }
  }

  // Mouth.
  if (!dead) {
    ctx.strokeStyle = 'rgba(45,80,45,0.6)';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.arc(0, -1, 5, 0.25 * Math.PI, 0.75 * Math.PI);
    ctx.stroke();
  }
  ctx.restore();
}

function drawFrog(ctx: CanvasRenderingContext2D, g: GameState) {
  const f = g.frog;

  if (g.phase === 'dying') {
    const p = 1 - g.dieT / 58;
    if (g.dieKind === 'splash') {
      // Expanding rings, then the frog sinks out.
      for (let i = 0; i < 3; i++) {
        const rp = Math.max(0, p - i * 0.12);
        if (rp <= 0) continue;
        ctx.save();
        ctx.globalAlpha = (1 - rp) * 0.65;
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 3 - i * 0.6;
        ctx.beginPath();
        ctx.ellipse(f.x, f.y, 8 + rp * 34, (8 + rp * 34) * 0.42, 0, 0, TAU);
        ctx.stroke();
        ctx.restore();
      }
      ctx.save();
      ctx.globalAlpha = Math.max(0, 1 - p * 1.6);
      ctx.translate(f.x, f.y + p * 8);
      const s = Math.max(0.1, 1 - p);
      drawFrogBody(ctx, s, s, true);
      ctx.restore();
      return;
    }
    // Squashed flat, with a clay splat behind.
    ctx.save();
    ctx.globalAlpha = 0.5;
    clayBall(ctx, f.x, f.y + 2, 20 + p * 6, 9 + p * 2, C.pad, 0, false);
    ctx.restore();
    ctx.save();
    ctx.translate(f.x, f.y + 3);
    drawFrogBody(ctx, 1 + p * 0.55, Math.max(0.22, 1 - p * 0.8), true);
    ctx.restore();
    return;
  }

  // Hop arc: the body lifts and stretches, the shadow stays down and shrinks.
  const air = f.t < 1 ? Math.sin(f.t * Math.PI) : 0;
  const lift = air * 12;
  const idle = f.t >= 1 ? Math.sin(g.tick / 16) * 0.02 : 0;

  groundShadow(ctx, f.x + 2, f.y + 12, 12 * (1 - air * 0.32), 5 * (1 - air * 0.32), 0.26 - air * 0.12);

  ctx.save();
  ctx.translate(f.x, f.y - lift);
  ctx.rotate((f.facing * Math.PI) / 2);
  drawFrogBody(ctx, 1 - air * 0.12 - idle, 1 + air * 0.2 + idle, false);
  ctx.restore();
}

// -------------------------------------------------------------------- bonus

function drawBonus(ctx: CanvasRenderingContext2D, g: GameState) {
  if (!g.bonus) return;
  const b = g.bonus;
  const y = rowY(b.row) + Math.sin(g.tick / 14) * 2.5;
  // Blink out over the last second.
  if (b.life < 60 && Math.floor(b.life / 6) % 2 === 0) return;

  // A Pica yoyo seen edge-on, spinning: two clay halves and an axle.
  const spin = (g.tick / 9) % TAU;
  const squash = Math.abs(Math.cos(spin)) * 0.75 + 0.25;
  groundShadow(ctx, b.x + 1, y + 13, 11, 4, 0.24);
  clayBall(ctx, b.x, y, 11 * squash + 2, 11, C.coral, 5, false);
  clayBall(ctx, b.x, y, 5 * squash + 1, 5, C.yellow, 2, false);
  ctx.save();
  ctx.globalAlpha = 0.55;
  ctx.strokeStyle = '#FFF6EA';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(b.x, y + 10);
  ctx.quadraticCurveTo(b.x + 5, y + 15, b.x + 2, y + 19);
  ctx.stroke();
  ctx.restore();
}

// -------------------------------------------------------------------- finish

/** Scanlines, vignette and grain. Applied last, over everything. */
function crtPass(ctx: CanvasRenderingContext2D) {
  const scan = getScan(ctx);
  if (scan) {
    ctx.save();
    ctx.globalAlpha = 0.13;
    ctx.fillStyle = scan;
    ctx.fillRect(0, 0, VIEW.w, VIEW.h);
    ctx.restore();
  }

  const grain = getGrain(ctx);
  if (grain) {
    ctx.save();
    ctx.globalAlpha = 0.05;
    ctx.globalCompositeOperation = 'overlay';
    ctx.fillStyle = grain;
    ctx.fillRect(0, 0, VIEW.w, VIEW.h);
    ctx.restore();
  }

  const vig = ctx.createRadialGradient(
    VIEW.w / 2, VIEW.h / 2, VIEW.h * 0.35,
    VIEW.w / 2, VIEW.h / 2, VIEW.w * 0.72,
  );
  vig.addColorStop(0, 'rgba(0,0,0,0)');
  vig.addColorStop(1, 'rgba(30,16,4,0.34)');
  ctx.fillStyle = vig;
  ctx.fillRect(0, 0, VIEW.w, VIEW.h);
}

const RIVER_ROWS = [1, 2, 3, 4];
const ROAD_ROWS = [6, 7, 8, 9];

export function drawFrame(ctx: CanvasRenderingContext2D, g: GameState) {
  ctx.clearRect(0, 0, VIEW.w, VIEW.h);

  drawGoal(ctx, g);
  drawRiver(ctx, RIVER_ROWS, g.tick);
  drawBank(ctx, ROW_MEDIAN, C.grass, 11);
  drawRoad(ctx, ROAD_ROWS);
  drawBank(ctx, ROW_START, C.grass, 47);

  for (const l of g.lanes) {
    if (isRiver(l.row)) drawLaneItems(ctx, l);
  }
  drawBonus(ctx, g);
  for (const l of g.lanes) {
    if (isRoad(l.row)) drawLaneItems(ctx, l);
  }

  if (g.phase !== 'over' && g.phase !== 'levelup') drawFrog(ctx, g);

  crtPass(ctx);
}

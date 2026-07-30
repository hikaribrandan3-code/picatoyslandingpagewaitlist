/**
 * Canvas painter for Flappy Picas. Pure: reads a GameState, writes pixels,
 * holds no state of its own — so the React shell owns the loop and this file
 * owns the look, and neither needs to know about the other.
 *
 * Everything snaps to the ART_PX grid. The canvas backing store stays at the
 * logical 288x512 and CSS scales it up with image-rendering: pixelated, so the
 * chunky look is real pixel art rather than a filter over smooth shapes.
 */
import {
  VIEW, ART_PX, PLAY_H, GROUND_H, BIRD, PIPE, type GameState,
} from './flappyEngine';
import {
  PALETTE, PENGUIN, WINGS, WING_ANCHOR, DIGITS, SCENE,
} from './flappySprites';

/** Snap a value down to the art grid so nothing lands on a half pixel. */
const snap = (v: number) => Math.floor(v / ART_PX) * ART_PX;

function rect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, fill: string) {
  ctx.fillStyle = fill;
  ctx.fillRect(snap(x), snap(y), snap(w), snap(h));
}

/** Paint a character grid at (x, y), one cell per art pixel. */
function grid(ctx: CanvasRenderingContext2D, g: string[], x: number, y: number) {
  for (let row = 0; row < g.length; row++) {
    for (let col = 0; col < g[row].length; col++) {
      const key = g[row][col];
      if (key === ' ') continue;
      const fill = PALETTE[key];
      if (!fill) continue;
      ctx.fillStyle = fill;
      ctx.fillRect(x + col * ART_PX, y + row * ART_PX, ART_PX, ART_PX);
    }
  }
}

// ---------------------------------------------------------------- scenery

/**
 * Rolling hill height as a function of absolute world x. Sum of two sines with
 * incommensurate wavelengths, so the ridge never visibly repeats and — because
 * it is a function of world position rather than screen position — never seams.
 */
const ridge = (worldX: number, amp: number, l1: number, l2: number) =>
  Math.sin(worldX / l1) * amp + Math.sin(worldX / l2) * amp * 0.45;

function drawHills(
  ctx: CanvasRenderingContext2D, scroll: number,
  factor: number, baseY: number, amp: number, l1: number, l2: number, fill: string,
) {
  const off = scroll * factor;
  ctx.fillStyle = fill;
  for (let x = 0; x < VIEW.w; x += ART_PX) {
    const top = snap(baseY - amp - ridge(x + off, amp, l1, l2));
    ctx.fillRect(x, top, ART_PX, PLAY_H - top);
  }
}

/**
 * A pine of overall height `h`, built from stacked rows so it stays on the
 * pixel grid. Three tiers, each widening toward its base, lit on top and
 * shadowed underneath.
 */
function drawPine(ctx: CanvasRenderingContext2D, x: number, baseY: number, h: number) {
  const trunkH = Math.max(4, h * 0.18);
  rect(ctx, x - 2, baseY - trunkH, 4, trunkH, SCENE.treeDark);

  const foliageH = h - trunkH;
  const tiers = 3;
  const tierH = foliageH / tiers;
  for (let t = 0; t < tiers; t++) {
    // t = 0 is the narrow top tier, t = 2 the wide bottom one.
    const top = baseY - trunkH - foliageH + t * tierH;
    const maxHalf = h * 0.16 * (t + 1) * 0.75;
    const rows = Math.max(2, Math.round(tierH / ART_PX));
    for (let r = 0; r < rows; r++) {
      const halfW = maxHalf * (0.35 + 0.65 * (r / rows));
      rect(ctx, x - halfW, top + r * ART_PX, halfW * 2, ART_PX,
        r < rows * 0.45 ? SCENE.treeLight : SCENE.treeDark);
    }
  }
}

/** Chunky cloud: three overlapping bands, lit on top and shaded underneath. */
function drawCloud(ctx: CanvasRenderingContext2D, x: number, y: number, s: number) {
  rect(ctx, x - 14 * s, y - 4 * s, 28 * s, 6 * s, SCENE.cloud);
  rect(ctx, x - 20 * s, y + 2 * s, 40 * s, 6 * s, SCENE.cloud);
  rect(ctx, x - 8 * s, y - 9 * s, 18 * s, 6 * s, SCENE.cloud);
  rect(ctx, x - 20 * s, y + 8 * s, 40 * s, 2 * s, SCENE.cloudShade);
}

function drawBush(ctx: CanvasRenderingContext2D, x: number, baseY: number) {
  rect(ctx, x - 14, baseY - 8, 28, 8, SCENE.bush);
  rect(ctx, x - 9, baseY - 14, 18, 7, SCENE.bush);
  rect(ctx, x - 2, baseY - 18, 9, 5, SCENE.bush);
}

/**
 * Walk one parallax layer's world positions across the visible strip.
 * Iterating world indices (rather than screen positions) is what keeps items
 * pinned to the world as it scrolls.
 */
function eachInLayer(
  scroll: number, factor: number, spacing: number, pad: number,
  fn: (screenX: number, index: number) => void,
) {
  const off = scroll * factor;
  const first = Math.floor((off - pad) / spacing);
  const last = Math.ceil((off + VIEW.w + pad) / spacing);
  for (let i = first; i <= last; i++) fn(i * spacing - off, i);
}

// ---------------------------------------------------------------- pipes

function drawPipeColumn(ctx: CanvasRenderingContext2D, x: number, top: number, h: number) {
  if (h <= 0) return;
  rect(ctx, x, top, PIPE.w, h, SCENE.pipeBody);
  rect(ctx, x + 6, top, 8, h, SCENE.pipeLight);       // specular stripe
  rect(ctx, x + PIPE.w - 16, top, 10, h, SCENE.pipeDark);
  rect(ctx, x, top, 2, h, SCENE.pipeEdge);            // outlines
  rect(ctx, x + PIPE.w - 2, top, 2, h, SCENE.pipeEdge);
}

function drawPipeCap(ctx: CanvasRenderingContext2D, x: number, top: number) {
  const cx = x - PIPE.capOverhang;
  const cw = PIPE.w + PIPE.capOverhang * 2;
  rect(ctx, cx, top, cw, PIPE.capH, SCENE.pipeBody);
  rect(ctx, cx + 6, top + 2, 8, PIPE.capH - 4, SCENE.pipeLight);
  rect(ctx, cx + cw - 18, top + 2, 12, PIPE.capH - 4, SCENE.pipeDark);
  rect(ctx, cx, top, cw, 2, SCENE.pipeEdge);
  rect(ctx, cx, top + PIPE.capH - 2, cw, 2, SCENE.pipeEdge);
  rect(ctx, cx, top, 2, PIPE.capH, SCENE.pipeEdge);
  rect(ctx, cx + cw - 2, top, 2, PIPE.capH, SCENE.pipeEdge);
}

function drawPipes(ctx: CanvasRenderingContext2D, s: GameState) {
  for (const p of s.pipes) {
    // Upper column hangs from the ceiling down to its cap at the gap edge.
    drawPipeColumn(ctx, p.x, 0, p.gapY - PIPE.capH);
    drawPipeCap(ctx, p.x, p.gapY - PIPE.capH);
    // Lower column starts with its cap and runs to the ground.
    const lowTop = p.gapY + PIPE.gap;
    drawPipeCap(ctx, p.x, lowTop);
    drawPipeColumn(ctx, p.x, lowTop + PIPE.capH, PLAY_H - lowTop - PIPE.capH);
  }
}

// ---------------------------------------------------------------- ground

function drawGround(ctx: CanvasRenderingContext2D, scroll: number) {
  const top = PLAY_H;
  rect(ctx, 0, top, VIEW.w, GROUND_H, SCENE.dirt);
  rect(ctx, 0, top, VIEW.w, 14, SCENE.grass);
  rect(ctx, 0, top + 14, VIEW.w, 4, SCENE.grassDark);

  // Scrolling tufts on the grass line and a coarse dirt speckle below. Both
  // are keyed off world position, so they slide with the pipes exactly.
  const off = scroll % 16;
  for (let x = -16; x < VIEW.w + 16; x += 16) {
    rect(ctx, x - off, top, 8, 4, SCENE.grassDark);
    rect(ctx, x - off + 8, top + 10, 8, 4, SCENE.grassDark);
  }
  const off2 = scroll % 24;
  for (let x = -24; x < VIEW.w + 24; x += 24) {
    for (let r = 0; r < 3; r++) {
      rect(ctx, x - off2 + r * 6, top + 26 + r * 22, 10, 4, SCENE.dirtDark);
      rect(ctx, x - off2 + 14 - r * 4, top + 36 + r * 20, 6, 4, SCENE.dirtDark);
    }
  }
}

// ---------------------------------------------------------------- penguin

/**
 * Wing pose. Cycles quickly just after a flap, then holds extended while the
 * penguin dives — the same read as the original, where the bird stops beating
 * its wings on the way down.
 */
function wingFrame(s: GameState): number {
  if (s.phase === 'cover') return Math.floor(s.t / 9) % WINGS.length;
  if (s.phase === 'playing' && s.sinceFlap < 14) return Math.floor(s.sinceFlap / 4) % WINGS.length;
  return 2;
}

/**
 * The penguin is pre-rendered flat, once per wing pose, and then blitted.
 *
 * Painting the grids directly under ctx.rotate() looks broken: every one of
 * the ~200 cells is its own fillRect, and a rotated fillRect gets antialiased
 * edges, so the shared borders between cells all show up as seams and the
 * sprite reads as checkered. One rotated drawImage of a flat bitmap has no
 * internal edges to alias — and is far cheaper per frame besides.
 */
let penguinCache: HTMLCanvasElement[] | null = null;

function penguinSprites(): HTMLCanvasElement[] {
  if (penguinCache) return penguinCache;
  const w = PENGUIN[0].length * ART_PX;
  const h = PENGUIN.length * ART_PX;
  penguinCache = WINGS.map((wing, f) => {
    const c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    const cx = c.getContext('2d')!;
    cx.imageSmoothingEnabled = false;
    grid(cx, PENGUIN, 0, 0);
    const a = WING_ANCHOR[f];
    grid(cx, wing, a.x * ART_PX, a.y * ART_PX);
    return c;
  });
  return penguinCache;
}

function drawPenguin(ctx: CanvasRenderingContext2D, s: GameState) {
  const sprite = penguinSprites()[wingFrame(s)];
  ctx.save();
  ctx.translate(snap(BIRD.x), snap(s.y));
  ctx.rotate(s.rot);
  ctx.drawImage(sprite, -sprite.width / 2, -sprite.height / 2);
  ctx.restore();
}

// ---------------------------------------------------------------- score

/** Big outlined score, drawn in the same pixel grid as the sprites. */
function drawScore(ctx: CanvasRenderingContext2D, score: number, cx: number, y: number) {
  const cell = 6;
  const digits = String(score).split('').map(Number);
  const dw = 3 * cell;
  const total = digits.length * dw + (digits.length - 1) * cell;
  let x = cx - total / 2;

  for (const d of digits) {
    const g = DIGITS[d];
    // Outline first: the same glyph offset in four directions, then white on
    // top. Cheaper and crisper than a stroked font at this size. The offset is
    // one art pixel, not one cell — a full-cell offset reads as a heavy halo
    // and closes up the counters of 0, 6, 8 and 9.
    for (const [dx, dy] of [[-ART_PX, 0], [ART_PX, 0], [0, -ART_PX], [0, ART_PX]]) {
      ctx.fillStyle = '#131C33';
      for (let r = 0; r < 5; r++) for (let c = 0; c < 3; c++) {
        if (g[r][c] === '1') ctx.fillRect(x + c * cell + dx, y + r * cell + dy, cell, cell);
      }
    }
    ctx.fillStyle = '#FFFFFF';
    for (let r = 0; r < 5; r++) for (let c = 0; c < 3; c++) {
      if (g[r][c] === '1') ctx.fillRect(x + c * cell, y + r * cell, cell, cell);
    }
    x += dw + cell;
  }
}

// ---------------------------------------------------------------- frame

/**
 * Paint one frame. `dim` darkens the world for the cover, pause, and game-over
 * cards, which are DOM overlays sitting on top of this canvas.
 */
export function drawFrame(ctx: CanvasRenderingContext2D, s: GameState, dim = false) {
  ctx.save();

  // Impact shake, applied to the world but not to the score.
  if (s.shake > 0) {
    ctx.translate(
      Math.round((Math.random() - 0.5) * s.shake),
      Math.round((Math.random() - 0.5) * s.shake),
    );
  }

  const sky = ctx.createLinearGradient(0, 0, 0, PLAY_H);
  sky.addColorStop(0, SCENE.skyTop);
  sky.addColorStop(1, SCENE.skyLow);
  ctx.fillStyle = sky;
  ctx.fillRect(-16, -16, VIEW.w + 32, PLAY_H + 32);

  eachInLayer(s.scroll, 0.12, 150, 60, (x, i) => {
    // Deterministic per-index variation, so clouds differ but never flicker.
    const y = 46 + ((i * 37) % 54);
    drawCloud(ctx, x, y, ((i * 17) % 2) === 0 ? 1 : 0.75);
  });

  drawHills(ctx, s.scroll, 0.22, PLAY_H - 46, 16, 170, 61, SCENE.hillFar);

  // The treeline goes *between* the two hill bands. Drawn over the near hill
  // instead, the pines read as sprites pasted onto a green mass; tucked behind
  // it, the trunks are occluded and only the crowns break the ridge, which is
  // what makes it look like a forest on a slope.
  eachInLayer(s.scroll, 0.34, 46, 60, (x, i) => {
    if (i % 4 === 3) return; // gaps, so the treeline is not a solid comb
    drawPine(ctx, x, PLAY_H - 24, 42 + ((i * 29) % 3) * 7);
  });

  drawHills(ctx, s.scroll, 0.44, PLAY_H - 8, 18, 118, 47, SCENE.hillNear);

  eachInLayer(s.scroll, 0.8, 62, 30, (x, i) => {
    if (i % 2 === 0) drawBush(ctx, x, PLAY_H + 1);
  });

  drawPipes(ctx, s);
  drawGround(ctx, s.scroll);
  drawPenguin(ctx, s);

  ctx.restore();

  // Score sits above the world, unshaken, and hides behind the overlay cards.
  if (s.phase === 'playing' || s.phase === 'dying') {
    drawScore(ctx, s.score, VIEW.w / 2, 40);
  }

  // Light touch: enough to lift the overlay card off the scene, not enough to
  // grey out the sky and turn the white clouds into smudges.
  if (dim) {
    ctx.fillStyle = 'rgba(12, 18, 34, 0.28)';
    ctx.fillRect(0, 0, VIEW.w, VIEW.h);
  }
}

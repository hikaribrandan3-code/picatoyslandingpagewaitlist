/**
 * Headless check for the Pica Crossing rules.
 *
 * A canvas game cannot be verified by looking at the page: an unfair collision
 * box and a correct one look identical in a screenshot, and "it feels bad" is
 * the only symptom of bad tuning. The engine is pure, so we drive it with a
 * scripted player here and assert on the outcomes instead.
 *
 * Run: npx tsx scripts/verify-crossing.ts
 */
import {
  createState, start, step, hop, buildLanes,
  VIEW, ROW_START, ROW_GOAL, ROW_MEDIAN, HOME_COUNT, START_TIME, START_LIVES,
  homeCenterX, isRiver, isRoad, rowY, forEachItem, speedOf, levelMultiplier, MAP_NAMES,
  type GameState, type Phase,
} from '../src/components/arcade/crossingEngine';

let failures = 0;
function check(name: string, cond: boolean, detail = '') {
  if (cond) {
    console.log(`  ok   ${name}`);
  } else {
    failures++;
    console.log(`  FAIL ${name}${detail ? ` — ${detail}` : ''}`);
  }
}

/** Run the sim until `pred` holds or we give up. */
function until(g: GameState, pred: () => boolean, max = 4000) {
  let n = 0;
  while (!pred() && n < max) { step(g); n++; }
  return n < max;
}

/** Finish whatever hop is in flight. */
const settle = (g: GameState) => until(g, () => g.frog.t >= 1 || g.phase !== 'playing', 60);

console.log('\nPica Crossing — engine checks\n');

// ---------------------------------------------------------------- geometry
{
  const g = createState(0);
  check('board rows tile the view exactly', rowY(ROW_START) + 18 === VIEW.h, `${rowY(ROW_START) + 18} vs ${VIEW.h}`);
  check('start bank is safe', !isRiver(ROW_START) && !isRoad(ROW_START));
  check('median is safe', !isRiver(ROW_MEDIAN) && !isRoad(ROW_MEDIAN));
  check('goal row is not lethal terrain', !isRiver(ROW_GOAL) && !isRoad(ROW_GOAL));

  // Every lane must wrap without a visible pop: the wrap span has to exceed
  // the screen plus one item, or an item vanishes before its twin appears.
  const bad = g.lanes.filter((l) => l.span < VIEW.w + l.len);
  check('every lane wraps seamlessly', bad.length === 0, `${bad.length} too-short spans`);

  // Homes must fit side by side without overlapping.
  let overlap = false;
  for (let i = 1; i < HOME_COUNT; i++) {
    if (homeCenterX(i) - homeCenterX(i - 1) < 78) overlap = true;
  }
  check('home slots do not overlap', !overlap);
}

// ------------------------------------------------------------------ hopping
{
  const g = createState(0);
  start(g);
  check('start puts the frog on the near bank', g.frog.row === ROW_START);
  check('start gives a full clock', g.time === START_TIME);
  check('start gives full lives', g.lives === START_LIVES);

  const x0 = g.frog.x;
  hop(g, 1);
  const acceptedMidHop = hop(g, 1);
  check('input is ignored mid-hop', acceptedMidHop === false);
  settle(g);
  check('a sideways hop moves exactly one cell', Math.abs(g.frog.x - x0 - 40) < 0.01, `moved ${g.frog.x - x0}`);

  // Edges must hold.
  for (let i = 0; i < 40; i++) { hop(g, 3); settle(g); }
  check('frog cannot hop off the left edge', g.frog.x >= 20 - 0.01, `x=${g.frog.x}`);
  check('frog stays on the start bank while hopping sideways', g.frog.row === ROW_START);

  const downFromStart = hop(g, 2);
  check('frog cannot hop below the start bank', downFromStart === false);
}

// -------------------------------------------------------------- road deaths
{
  // Park the frog in a road lane and let traffic arrive. It must eventually
  // die — if it never does, the hitbox is not connected to anything.
  const g = createState(0);
  start(g);
  hop(g, 0); settle(g);
  check('one hop up lands in the road', isRoad(g.frog.row), `row ${g.frog.row}`);
  const died = until(g, () => g.phase === 'dying', 2000);
  check('standing in traffic is eventually fatal', died);
  check('the fatal cause is a squash', g.dieKind === 'squash');
  check('a death costs one life', g.lives === START_LIVES - 1);
}

// ------------------------------------------------------------- river deaths
{
  // Teleport onto the water between rafts: stepping into open river drowns.
  const g = createState(0);
  start(g);
  g.frog.row = 2;
  g.frog.y = rowY(2);
  g.frog.t = 1;
  // Nudge time forward until the frog is genuinely over water, then confirm.
  const drowned = until(g, () => g.phase === 'dying', 600);
  check('open water is eventually fatal', drowned);
  check('the fatal cause is a splash', g.dieKind === 'splash');
}

// --------------------------------------------------------------- log riding
{
  // Find a tick where the frog sits on a raft, then confirm it is carried.
  const g = createState(0);
  start(g);
  let rode = false;
  for (let attempt = 0; attempt < 400 && !rode; attempt++) {
    const t = createState(0);
    start(t);
    for (let i = 0; i < attempt; i++) step(t);
    t.frog.row = 1;
    t.frog.y = rowY(1);
    t.frog.t = 1;
    const x0 = t.frog.x;
    step(t);
    if (t.phase === 'playing' && Math.abs(t.frog.x - x0) > 0.01) rode = true;
  }
  check('a frog on a raft is carried by it', rode);
}

// ------------------------------------------------------------------- homes
{
  const g = createState(0);
  start(g);
  // Drop the frog onto the goal row aligned with a home slot.
  g.frog.row = ROW_GOAL;
  g.frog.x = homeCenterX(2);
  g.frog.toX = g.frog.x;
  g.frog.toY = rowY(ROW_GOAL);
  g.frog.t = 1 - 1 / 8;
  step(g);
  check('landing in an empty home fills it', g.homes[2] === true);
  check('a home scores at least 100', g.score >= 100, `score ${g.score}`);
  check('a home respawns the frog on the bank', g.frog.row === ROW_START);
  check('a home does not cost a life', g.lives === START_LIVES);

  // Landing on the same home again must not fill it twice. `furthest` is
  // pinned first so the row-progress award does not muddy the comparison —
  // we are asking about the home bonus specifically.
  g.furthest = ROW_GOAL;
  const before = g.score;
  const filledBefore = g.homes.filter(Boolean).length;
  g.frog.row = ROW_GOAL;
  g.frog.x = homeCenterX(2);
  g.frog.toX = g.frog.x;
  g.frog.toY = rowY(ROW_GOAL);
  g.frog.t = 1 - 1 / 8;
  step(g);
  check('an occupied home is fatal', g.phase === 'dying', `phase ${g.phase}`);
  check('an occupied home pays nothing', g.score === before, `${before} -> ${g.score}`);
  check('an occupied home is not double-counted', g.homes.filter(Boolean).length === filledBefore);
}

// --------------------------------------------------------------- level ramp
{
  const g = createState(0);
  start(g);
  for (let i = 0; i < HOME_COUNT; i++) {
    g.phase = 'playing';
    g.frog.row = ROW_GOAL;
    g.frog.x = homeCenterX(i);
    g.frog.toX = g.frog.x;
    g.frog.toY = rowY(ROW_GOAL);
    g.frog.t = 1 - 1 / 8;
    step(g);
  }
  check('filling every home clears the level', g.phase === 'levelup', `phase ${g.phase}`);
  check('clearing advances to level 2', g.level === 2);
  check('every home fill counts as a crossing', g.crossings === HOME_COUNT, `crossings ${g.crossings}`);
  until(g, () => g.phase === 'playing', 200);
  check('the next level resets the homes', g.homes.every((h) => !h));

  check('the per-level speed multiplier grows monotonically',
    levelMultiplier(2) > levelMultiplier(1) && levelMultiplier(12) > levelMultiplier(2));
  check('the per-level multiplier never resets or caps',
    levelMultiplier(50) > levelMultiplier(20) && levelMultiplier(20) > levelMultiplier(10));
}

// -------------------------------------------------------------- map rotation
{
  // This is the actual fix for "it's the same board forever": every single
  // home landing — not just every level clear — must swap in a different map.
  const g = createState(0);
  start(g);
  check('a fresh game starts on map 0', g.mapIndex === 0);

  const seenMaps = new Set<number>();
  const seenLaneShapes = new Set<string>();
  for (let i = 0; i < HOME_COUNT * MAP_NAMES.length; i++) {
    g.phase = 'playing';
    g.frog.row = ROW_GOAL;
    g.frog.x = homeCenterX(i % HOME_COUNT);
    g.frog.toX = g.frog.x;
    g.frog.toY = rowY(ROW_GOAL);
    g.frog.t = 1 - 1 / 8;
    const mapBefore = g.mapIndex;
    step(g);
    seenMaps.add(g.mapIndex);
    seenLaneShapes.add(g.lanes.map((l) => `${l.item}${l.baseSpeed}${l.gap}`).join('|'));
    check(`crossing ${i}: map advances on a home landing`, g.mapIndex !== mapBefore || MAP_NAMES.length === 1);
    // step() mutates g.phase, but TS's control-flow narrowing still treats it
    // as the literal assigned above ('playing') and does not account for a
    // function call invalidating that — cast past it rather than compare
    // against a type TS has (wrongly) narrowed to a single literal.
    if ((g.phase as Phase) === 'levelup') until(g, () => (g.phase as Phase) === 'playing', 200);
  }
  check('every predefined map gets visited over time', seenMaps.size === MAP_NAMES.length, `${seenMaps.size}/${MAP_NAMES.length}`);
  check('the lane composition actually differs across maps', seenLaneShapes.size >= MAP_NAMES.length - 1, `${seenLaneShapes.size} distinct shapes`);

  // Returning to a map already visited must not replay an identical layout —
  // this was the bug where buildLanes' phase depended only on lane index, so
  // every revisit of a given map was a frozen, byte-identical replay.
  const first = buildLanes(0, 0);
  const secondVisit = buildLanes(0, MAP_NAMES.length);
  const identical = first.every((l, i) => l.offset === secondVisit[i].offset);
  check('revisiting a map does not replay the exact same phase', !identical);
}

// -------------------------------------------------------------- clock & end
{
  const g = createState(0);
  start(g);
  g.time = 2;
  const timedOut = until(g, () => g.phase === 'dying', 60);
  check('running out of time is fatal', timedOut && g.dieKind === 'time');

  // Burn the remaining lives and confirm the run ends and the best is kept.
  g.score = 250;
  while (g.lives > 0) {
    g.phase = 'playing';
    g.time = 2;
    until(g, () => g.phase === 'dying', 60);
    until(g, () => g.phase !== 'dying', 120);
  }
  check('the run ends when lives run out', g.phase === 'over', `phase ${g.phase}`);
  check('the best score is recorded', g.best === 250, `best ${g.best}`);
}

// ------------------------------------------------------- difficulty is fair
{
  /** Would the frog be safe standing at (row, x) for the next `look` ticks? */
  function safeAt(g: GameState, row: number, x: number, look = 16): boolean {
    if (row < ROW_GOAL || row > ROW_START) return false;
    if (x < 20 || x > VIEW.w - 20) return false;
    const l = g.lanes.find((ln) => ln.row === row);
    if (!l) return true; // bank or median
    if (l.kind === 'river') {
      // Need a raft under the landing point, with both toes clear of the ends.
      let ok = false;
      forEachItem(l, (ix) => {
        if (x >= ix + 10 && x <= ix + l.len - 10) ok = true;
      });
      return ok;
    }
    // Road: no car may sweep through us over the hop plus a margin. Checking
    // only "right now" walks straight into a fast lane.
    const v = l.dir * speedOf(l, g.level);
    let ok = true;
    forEachItem(l, (ix) => {
      for (let t = 0; t <= look; t += 2) {
        const cx = ix + v * t;
        if (x + 13 > cx - 8 && x - 13 < cx + l.len + 8) ok = false;
      }
    });
    return ok;
  }

  const inTraffic = (g: GameState, row: number) =>
    g.lanes.some((l) => l.row === row && l.kind === 'road');

  // A competent player: advance when the next row is clear, line up with a
  // home for the last hop, and — crucially — get out of the way when a car is
  // bearing down on the lane you are standing in, rather than waiting to die.
  // If this player cannot cross, the board is impossible rather than hard.
  let crossings = 0;
  const ATTEMPTS = 40;
  for (let seed = 0; seed < ATTEMPTS; seed++) {
    const g = createState(0);
    start(g);
    for (let i = 0; i < seed * 23; i++) step(g);
    g.phase = 'playing';
    g.time = START_TIME;

    let guard = 0;
    while (g.phase === 'playing' && guard++ < 9000) {
      const f = g.frog;
      if (f.t >= 1) {
        if (f.row === ROW_GOAL + 1) {
          // Last row before the goal: slide to the nearest empty home first.
          let best = -1;
          let bestD = Infinity;
          for (let i = 0; i < HOME_COUNT; i++) {
            if (g.homes[i]) continue;
            const d = Math.abs(homeCenterX(i) - f.x);
            if (d < bestD) { bestD = d; best = i; }
          }
          if (best >= 0 && bestD > 20) {
            const dir = homeCenterX(best) > f.x ? 1 : 3;
            if (safeAt(g, f.row, f.x + (dir === 1 ? 40 : -40))) hop(g, dir);
          } else if (safeAt(g, ROW_GOAL, f.x)) {
            hop(g, 0);
          }
        } else if (safeAt(g, f.row - 1, f.x)) {
          hop(g, 0);
        } else if (inTraffic(g, f.row) && !safeAt(g, f.row, f.x, 12)) {
          if (safeAt(g, f.row, f.x + 40)) hop(g, 1);
          else if (safeAt(g, f.row, f.x - 40)) hop(g, 3);
          else if (safeAt(g, f.row + 1, f.x)) hop(g, 2);
        }
      }
      step(g);
      if (g.homes.some(Boolean)) break;
    }
    if (g.homes.some(Boolean)) crossings++;
  }
  const rate = Math.round((crossings / ATTEMPTS) * 100);
  check('a competent player can reach a home', crossings > 0, `${rate}%`);
  check('the board is beatable, not punishing', rate >= 65, `${rate}%`);
  // The flip side: if even a bot with perfect information never dies, there is
  // no game here. Some failure is the point.
  check('the board is not a walkover', rate <= 97, `${rate}%`);
}

// ------------------------------------------------------ every map is fair
{
  /** Same competent-player logic as above, but pointed at an arbitrary map
   *  built directly via `buildLanes` rather than only whatever a fresh game
   *  starts on — this is what actually exercises maps 1-3 and high levels. */
  function safeAt(g: GameState, row: number, x: number, look = 16): boolean {
    if (row < ROW_GOAL || row > ROW_START) return false;
    if (x < 20 || x > VIEW.w - 20) return false;
    const l = g.lanes.find((ln) => ln.row === row);
    if (!l) return true;
    if (l.kind === 'river') {
      let ok = false;
      forEachItem(l, (ix) => { if (x >= ix + 10 && x <= ix + l.len - 10) ok = true; });
      return ok;
    }
    const v = l.dir * speedOf(l, g.level);
    let ok = true;
    forEachItem(l, (ix) => {
      for (let t = 0; t <= look; t += 2) {
        const cx = ix + v * t;
        if (x + 13 > cx - 8 && x - 13 < cx + l.len + 8) ok = false;
      }
    });
    return ok;
  }
  const inTraffic = (g: GameState, row: number) => g.lanes.some((l) => l.row === row && l.kind === 'road');

  function winRate(mapIdx: number, level: number, N = 120): number {
    let wins = 0;
    for (let visit = 0; visit < N; visit++) {
      const g = createState(0);
      start(g);
      g.level = level;
      g.mapIndex = mapIdx;
      g.lanes = buildLanes(mapIdx, visit);
      g.phase = 'playing';
      g.time = START_TIME;

      let guard = 0;
      while (g.phase === 'playing' && guard++ < 9000) {
        const f = g.frog;
        if (f.t >= 1) {
          if (f.row === ROW_GOAL + 1) {
            let best = -1;
            let bestD = Infinity;
            for (let i = 0; i < HOME_COUNT; i++) {
              if (g.homes[i]) continue;
              const d = Math.abs(homeCenterX(i) - f.x);
              if (d < bestD) { bestD = d; best = i; }
            }
            if (best >= 0 && bestD > 20) {
              const dir = homeCenterX(best) > f.x ? 1 : 3;
              if (safeAt(g, f.row, f.x + (dir === 1 ? 40 : -40))) hop(g, dir);
            } else if (safeAt(g, ROW_GOAL, f.x)) hop(g, 0);
          } else if (safeAt(g, f.row - 1, f.x)) {
            hop(g, 0);
          } else if (inTraffic(g, f.row) && !safeAt(g, f.row, f.x, 12)) {
            if (safeAt(g, f.row, f.x + 40)) hop(g, 1);
            else if (safeAt(g, f.row, f.x - 40)) hop(g, 3);
            else if (safeAt(g, f.row + 1, f.x)) hop(g, 2);
          }
        }
        step(g);
        if (g.homes.some(Boolean)) break;
      }
      if (g.homes.some(Boolean)) wins++;
    }
    return Math.round((wins / N) * 100);
  }

  const l1Rates = MAP_NAMES.map((_, i) => winRate(i, 1));
  l1Rates.forEach((rate, i) => {
    check(`${MAP_NAMES[i]} is fair at level 1`, rate >= 55 && rate <= 99, `${rate}%`);
  });

  // Gridlock is the designed hard mode — if it is not measurably tougher
  // than the opening map, difficulty tuning has drifted or someone edited
  // the numbers without re-checking the balance.
  check('Gridlock is harder than Sunny Crossing at the same level',
    l1Rates[l1Rates.length - 1] < l1Rates[0] - 5,
    `Gridlock ${l1Rates[l1Rates.length - 1]}% vs Sunny ${l1Rates[0]}%`);

  // The level multiplier must eventually bite hard — "keeps going, keeps
  // getting harder" is the whole point, not a curve that flattens out.
  const earlyRate = winRate(0, 1, 80);
  const lateRate = winRate(0, 14, 80);
  check('the same map gets substantially harder by level 14',
    lateRate < earlyRate - 25, `L1 ${earlyRate}% vs L14 ${lateRate}%`);
}

console.log(`\n${failures === 0 ? 'All checks passed.' : `${failures} FAILED.`}\n`);
process.exit(failures === 0 ? 0 : 1);

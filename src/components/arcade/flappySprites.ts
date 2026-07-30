/**
 * Pixel-art atlas for Flappy Picas, authored as character grids.
 *
 * Everything is drawn procedurally from these grids rather than loaded from
 * image files: the game ships inside the main bundle with no extra network
 * request, and a grid is far easier to nudge by hand than a PNG.
 *
 * One grid cell renders as an ART pixel (see ART_PX in flappyEngine), so the
 * chunky look is intentional and consistent across every sprite.
 */

/** Palette keys used by the grids below. A space means transparent. */
export const PALETTE: Record<string, string> = {
  K: '#131C33', // outline — dark navy, never pure black
  N: '#2E4B87', // penguin back / head
  B: '#4A78C4', // penguin blue highlight
  W: '#FFFFFF', // belly + face
  w: '#C9D8EC', // belly shade
  O: '#FFA62B', // beak, lit
  o: '#E4780A', // beak, shadowed
  E: '#0B1020', // eye
};

/**
 * The penguin, facing right. 18x15 cells.
 *
 * Navy crown and back, white face and belly, and a beak that protrudes past
 * the body outline so the silhouette still reads as a bird at this size.
 *
 * The eye sits with white on *both* sides. Butted straight up against the
 * outline it vanishes — eye and outline are near enough the same value that
 * they merge into one dark blob and the bird ends up faceless.
 *
 * The body carries no 'B': that light blue belongs to the wing alone, so the
 * wing reads as a separate moving part rather than as body shading.
 */
export const PENGUIN = [
  '      KKKKK       ',
  '    KKNNNNNKK     ',
  '   KNNNNNNNNNK    ',
  '  KNNNNNNNNNNNK   ',
  '  KNNNWWWWWWWK    ',
  ' KNNNNWWEEWWWK    ',
  ' KNNNWWWEEWWWKOOK ',
  ' KNNNWWWWWWWWKOOOK',
  ' KNNNNWWWWWWWKOoK ',
  ' KNNNNWWWWWWWK    ',
  ' KNNNNWWWWWWWK    ',
  '  KNNNWWWWWWWK    ',
  '  KKNNWWWWWWK     ',
  '    KKwwwwwKK     ',
  '      KKKKKK      ',
];

/**
 * Wing frames, drawn over the penguin's flank. Three poses cycled while
 * climbing. Each is offset vertically as well as reshaped — the small vertical
 * travel is what actually makes the flap read at this scale.
 */
export const WINGS = [
  // up
  [' KKKK ', 'KBBBBK', 'KBBBK ', ' KKK  '],
  // mid
  ['      ', ' KKKK ', 'KBBBBK', ' KKKK '],
  // down
  [' KKK  ', 'KBBBK ', 'KBBBBK', ' KKKK '],
];

/** Where each wing frame sits relative to the penguin grid origin, in cells. */
export const WING_ANCHOR = [
  { x: 2, y: 6 },
  { x: 2, y: 8 },
  { x: 2, y: 9 },
];

/**
 * 3x5 bitmap digits for the in-world score. A real bitmap font rather than
 * canvas fillText: the score has to sit in the same pixel grid as everything
 * else, and a hinted system font at this size would look out of place.
 */
export const DIGITS: string[][] = [
  ['111', '101', '101', '101', '111'], // 0
  ['010', '110', '010', '010', '111'], // 1
  ['111', '001', '111', '100', '111'], // 2
  ['111', '001', '111', '001', '111'], // 3
  ['101', '101', '111', '001', '001'], // 4
  ['111', '100', '111', '001', '111'], // 5
  ['111', '100', '111', '101', '111'], // 6
  ['111', '001', '001', '001', '001'], // 7
  ['111', '101', '111', '101', '111'], // 8
  ['111', '101', '111', '001', '111'], // 9
];

/** Scene colours kept beside the sprites so the whole look tunes in one file. */
export const SCENE = {
  skyTop: '#4EC0E8',
  skyLow: '#9BDDF3',
  cloud: '#FFFFFF',
  cloudShade: '#DCEFF8',
  // The scenery greens need real value separation, not just different hues:
  // at this size a treeline only reads if it is clearly darker than the hill
  // behind it. Far hill lightest, near hill mid, trees and bushes darkest.
  hillFar: '#8AD673',
  hillNear: '#63B551',
  treeDark: '#1F5E2B',
  treeLight: '#2E8038',
  bush: '#297A38',
  pipeBody: '#5FC13A',
  pipeLight: '#8BE05F',
  pipeDark: '#2F7C1E',
  pipeEdge: '#1C4A12',
  grass: '#8ED14F',
  grassDark: '#5FA332',
  dirt: '#B9803F',
  dirtDark: '#8A5A28',
} as const;

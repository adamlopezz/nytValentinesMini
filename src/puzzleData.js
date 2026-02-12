export const ROWS = 13;
export const COLS = 12;

export const acrossClues = [
  { number: 3, word: 'SALT', row: 1, col: 3, clue: 'Favorite mineral' },
  { number: 6, word: 'CORONA', row: 2, col: 6, clue: 'Lime-paired lager' },
  { number: 7, word: 'THEBOOT', row: 3, col: 0, clue: 'Site of your favorite drunk pizza' },
  { number: 10, word: 'ZEBRA', row: 9, col: 5, clue: 'Pattern on your childhood retainer' },
  { number: 11, word: 'MRSKISS', row: 10, col: 1, clue: 'Favorite teacher and neighbor' },
  { number: 12, word: 'LIVLAXLUV', row: 11, col: 3, clue: 'Middle school screen name' },
  { number: 13, word: 'CONEY', row: 12, col: 5, clue: 'NYC island still unchecked' },
];

export const downClues = [
  { number: 1, word: 'COTTONBALLS', row: 0, col: 0, clue: 'Childhood "stuffed animal" substitute' },
  { number: 2, word: 'JASONSUDEIKIS', row: 0, col: 4, clue: 'Celebrity crush' },
  { number: 4, word: 'LOVEACTUALLY', row: 1, col: 9, clue: 'Holiday rom-com staple' },
  { number: 5, word: 'JEEPLIBERTY', row: 2, col: 2, clue: 'First car' },
  { number: 8, word: 'PICKLES', row: 4, col: 6, clue: 'Snack obsession' },
  { number: 9, word: 'ADAM', row: 7, col: 1, clue: 'Your baby boo boo thang who loves you most' },
];

export function buildGrid() {
  const grid = Array.from({ length: ROWS }, () =>
    Array.from({ length: COLS }, () => null)
  );

  const allClues = [
    ...acrossClues.map((c) => ({ ...c, dir: 'A' })),
    ...downClues.map((c) => ({ ...c, dir: 'D' })),
  ];

  for (const clue of allClues) {
    for (let i = 0; i < clue.word.length; i++) {
      const r = clue.dir === 'A' ? clue.row : clue.row + i;
      const c = clue.dir === 'A' ? clue.col + i : clue.col;

      if (!grid[r][c]) {
        grid[r][c] = { letter: clue.word[i] };
      }

      if (clue.dir === 'A') {
        grid[r][c].acrossClue = clue.number;
        grid[r][c].acrossIdx = i;
      } else {
        grid[r][c].downClue = clue.number;
        grid[r][c].downIdx = i;
      }
    }
  }

  // Assign clue numbers to starting cells
  const numberMap = new Map();
  for (const clue of allClues) {
    const key = `${clue.row},${clue.col}`;
    numberMap.set(key, clue.number);
  }

  for (const [key, num] of numberMap) {
    const [r, c] = key.split(',').map(Number);
    if (grid[r][c]) {
      grid[r][c].number = num;
    }
  }

  return grid;
}

export function getClueCells(clue, dir) {
  const clueData =
    dir === 'A'
      ? acrossClues.find((c) => c.number === clue)
      : downClues.find((c) => c.number === clue);

  if (!clueData) return [];

  const cells = [];
  for (let i = 0; i < clueData.word.length; i++) {
    const r = dir === 'A' ? clueData.row : clueData.row + i;
    const c = dir === 'A' ? clueData.col + i : clueData.col;
    cells.push({ row: r, col: c });
  }
  return cells;
}

export function getClueWord(number, dir) {
  const clues = dir === 'A' ? acrossClues : downClues;
  const clue = clues.find((c) => c.number === number);
  return clue ? clue.word : '';
}

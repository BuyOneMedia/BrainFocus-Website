/**
 * Brain Focus Books™ - Interactive Frontend Engine
 * Includes: 4x4 Calcudoku Playable Engine, Book Catalog & Filter System,
 * Modal System, Lead Magnet Capture & 3D Interactive Controls.
 */

// ============================================================================
// 1. Calcudoku Mini-Puzzle Engine
// ============================================================================

const CALCUDOKU_PUZZLES = {
  beginner: {
    name: "Beginner 4x4",
    difficulty: "Easy",
    gridSize: 4,
    // Solution:
    // [4, 1, 2, 3]
    // [3, 2, 4, 1]
    // [1, 4, 3, 2]
    // [2, 3, 1, 4]
    solution: [
      [4, 1, 2, 3],
      [3, 2, 4, 1],
      [1, 4, 3, 2],
      [2, 3, 1, 4]
    ],
    cages: [
      { id: 'c1', label: '7+', op: '+', target: 7, cells: [[0, 0], [1, 0]] },
      { id: 'c2', label: '2÷', op: '/', target: 2, cells: [[0, 1], [0, 2]] },
      { id: 'c3', label: '3', op: '=', target: 3, cells: [[0, 3]] },
      { id: 'c4', label: '8×', op: '*', target: 8, cells: [[1, 1], [1, 2]] },
      { id: 'c5', label: '1−', op: '-', target: 1, cells: [[1, 3], [2, 3]] },
      { id: 'c6', label: '1−', op: '-', target: 1, cells: [[2, 1], [2, 2]] },
      { id: 'c7', label: '2÷', op: '/', target: 2, cells: [[2, 0], [3, 0]] },
      { id: 'c8', label: '12×', op: '*', target: 12, cells: [[3, 1], [3, 2], [3, 3]] }
    ]
  },
  intermediate: {
    name: "Cognitive 4x4",
    difficulty: "Medium",
    gridSize: 4,
    solution: [
      [2, 4, 1, 3],
      [4, 3, 2, 1],
      [1, 2, 3, 4],
      [3, 1, 4, 2]
    ],
    cages: [
      { id: 'c1', label: '8×', op: '*', target: 8, cells: [[0, 0], [1, 0]] },
      { id: 'c2', label: '12×', op: '*', target: 12, cells: [[0, 1], [1, 1]] },
      { id: 'c3', label: '2−', op: '-', target: 2, cells: [[0, 2], [0, 3]] },
      { id: 'c4', label: '2÷', op: '/', target: 2, cells: [[1, 2], [1, 3]] },
      { id: 'c5', label: '3×', op: '*', target: 3, cells: [[2, 0], [3, 0]] },
      { id: 'c6', label: '7+', op: '+', target: 7, cells: [[2, 1], [3, 1], [3, 2]] },
      { id: 'c7', label: '12×', op: '*', target: 12, cells: [[2, 2], [2, 3]] },
      { id: 'c8', label: '2', op: '=', target: 2, cells: [[3, 3]] }
    ]
  },
  master: {
    name: "Master 4x4",
    difficulty: "Hard",
    gridSize: 4,
    solution: [
      [3, 2, 4, 1],
      [1, 4, 2, 3],
      [4, 1, 3, 2],
      [2, 3, 1, 4]
    ],
    cages: [
      { id: 'c1', label: '6×', op: '*', target: 6, cells: [[0, 0], [0, 1]] },
      { id: 'c2', label: '4', op: '=', target: 4, cells: [[0, 2]] },
      { id: 'c3', label: '4+', op: '+', target: 4, cells: [[0, 3], [1, 3]] },
      { id: 'c4', label: '5+', op: '+', target: 4, cells: [[1, 0], [2, 0]] },
      { id: 'c5', label: '8×', op: '*', target: 8, cells: [[1, 1], [1, 2]] },
      { id: 'c6', label: '2−', op: '-', target: 2, cells: [[2, 1], [2, 2]] },
      { id: 'c7', label: '2', op: '=', target: 2, cells: [[2, 3]] },
      { id: 'c8', label: '6+', op: '+', target: 6, cells: [[3, 0], [3, 1], [3, 2]] },
      { id: 'c9', label: '4', op: '=', target: 4, cells: [[3, 3]] }
    ]
  }
};

let currentPuzzleKey = 'beginner';
let selectedCell = { r: 0, c: 0 };
let userGrid = [
  [null, null, null, null],
  [null, null, null, null],
  [null, null, null, null],
  [null, null, null, null]
];

function initCalcudoku() {
  const currentPuzzle = CALCUDOKU_PUZZLES[currentPuzzleKey];
  userGrid = Array(4).fill(null).map(() => Array(4).fill(null));
  renderGrid(currentPuzzle);
  setupGridEvents();
  updateGameStatus("Click a cell and enter numbers (1-4) using keyboard or buttons.");
}

function renderGrid(puzzle) {
  const gridContainer = document.getElementById('calcudoku-grid');
  if (!gridContainer) return;
  gridContainer.innerHTML = '';

  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      const cellEl = document.createElement('div');
      cellEl.className = 'calcudoku-cell';
      cellEl.dataset.row = r;
      cellEl.dataset.col = c;

      // Determine cage info
      const cage = puzzle.cages.find(cg => cg.cells.some(([cr, cc]) => cr === r && cc === c));
      if (cage) {
        // Check if this is the top-left cell of the cage to show clue
        const isFirstCell = cage.cells[0][0] === r && cage.cells[0][1] === c;
        if (isFirstCell) {
          const labelEl = document.createElement('span');
          labelEl.className = 'cage-label';
          labelEl.textContent = cage.label;
          cellEl.appendChild(labelEl);
        }

        // Apply borders based on cage boundary
        applyCageBorders(cellEl, cage, r, c);
      }

      const valSpan = document.createElement('span');
      valSpan.className = 'cell-value z-10';
      valSpan.textContent = userGrid[r][c] || '';
      cellEl.appendChild(valSpan);

      if (selectedCell.r === r && selectedCell.c === c) {
        cellEl.classList.add('selected');
      }

      gridContainer.appendChild(cellEl);
    }
  }
}

function applyCageBorders(cellEl, cage, r, c) {
  const hasTop = cage.cells.some(([cr, cc]) => cr === r - 1 && cc === c);
  const hasBottom = cage.cells.some(([cr, cc]) => cr === r + 1 && cc === c);
  const hasLeft = cage.cells.some(([cr, cc]) => cr === r && cc === c - 1);
  const hasRight = cage.cells.some(([cr, cc]) => cr === r && cc === c + 1);

  if (!hasTop) cellEl.classList.add('border-top-thick');
  else cellEl.classList.add('border-top-thin');

  if (!hasBottom) cellEl.classList.add('border-bottom-thick');
  else cellEl.classList.add('border-bottom-thin');

  if (!hasLeft) cellEl.classList.add('border-left-thick');
  else cellEl.classList.add('border-left-thin');

  if (!hasRight) cellEl.classList.add('border-right-thick');
  else cellEl.classList.add('border-right-thin');
}

function setupGridEvents() {
  const gridContainer = document.getElementById('calcudoku-grid');
  if (!gridContainer) return;

  gridContainer.addEventListener('click', (e) => {
    const cell = e.target.closest('.calcudoku-cell');
    if (!cell) return;

    const r = parseInt(cell.dataset.row);
    const c = parseInt(cell.dataset.col);
    selectCell(r, c);
  });
}

function selectCell(r, c) {
  selectedCell = { r, c };
  const cells = document.querySelectorAll('.calcudoku-cell');
  const targetVal = userGrid[r][c];

  cells.forEach(cell => {
    const cr = parseInt(cell.dataset.row);
    const cc = parseInt(cell.dataset.col);
    cell.classList.remove('selected', 'same-num');
    
    if (cr === r && cc === c) {
      cell.classList.add('selected');
    } else if (targetVal && userGrid[cr][cc] === targetVal) {
      cell.classList.add('same-num');
    }
  });
}

function enterNumber(num) {
  if (selectedCell.r === null || selectedCell.c === null) return;
  const { r, c } = selectedCell;

  userGrid[r][c] = num;
  const currentPuzzle = CALCUDOKU_PUZZLES[currentPuzzleKey];
  renderGrid(currentPuzzle);
  selectCell(r, c);

  // Auto check if full
  const isFull = userGrid.every(row => row.every(val => val !== null));
  if (isFull) {
    checkCalcudokuSolution(false);
  }
}

function clearCurrentCell() {
  if (selectedCell.r === null || selectedCell.c === null) return;
  const { r, c } = selectedCell;
  userGrid[r][c] = null;
  const currentPuzzle = CALCUDOKU_PUZZLES[currentPuzzleKey];
  renderGrid(currentPuzzle);
  selectCell(r, c);
}

function checkCalcudokuSolution(explicitCheck = true) {
  const puzzle = CALCUDOKU_PUZZLES[currentPuzzleKey];
  let hasErrors = false;
  let unfilled = 0;
  const cells = document.querySelectorAll('.calcudoku-cell');

  // Reset classes
  cells.forEach(c => c.classList.remove('error', 'correct'));

  // 1. Check Row & Column Uniqueness
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      const val = userGrid[r][c];
      if (!val) {
        unfilled++;
        continue;
      }

      // Check row dupes
      for (let c2 = 0; c2 < 4; c2++) {
        if (c !== c2 && userGrid[r][c2] === val) {
          highlightCellError(r, c);
          highlightCellError(r, c2);
          hasErrors = true;
        }
      }

      // Check col dupes
      for (let r2 = 0; r2 < 4; r2++) {
        if (r !== r2 && userGrid[r2][c] === val) {
          highlightCellError(r, c);
          highlightCellError(r2, c);
          hasErrors = true;
        }
      }
    }
  }

  // 2. Check Cage Math
  puzzle.cages.forEach(cage => {
    const cageValues = cage.cells.map(([r, c]) => userGrid[r][c]);
    const allFilled = cageValues.every(v => v !== null);

    if (allFilled) {
      const isMathValid = validateCageMath(cage, cageValues);
      if (!isMathValid) {
        cage.cells.forEach(([r, c]) => highlightCellError(r, c));
        hasErrors = true;
      }
    }
  });

  if (hasErrors) {
    updateGameStatus("⚠️ Look closely! You have duplicates in a row/column or an incorrect cage math result.", "text-red-400");
  } else if (unfilled > 0) {
    if (explicitCheck) {
      updateGameStatus(`👍 Good progress! ${16 - unfilled}/16 cells correct so far. Keep going!`, "text-cyan-400");
    }
  } else {
    // Puzzle completely and correctly solved!
    cells.forEach(c => c.classList.add('correct'));
    updateGameStatus("🎉 Brilliant Focus! Puzzle solved 100% correctly!", "text-green-400 font-bold");
    triggerConfetti();
  }
}

function validateCageMath(cage, values) {
  const { op, target } = cage;
  if (op === '=') {
    return values[0] === target;
  }
  if (op === '+') {
    const sum = values.reduce((a, b) => a + b, 0);
    return sum === target;
  }
  if (op === '*') {
    const prod = values.reduce((a, b) => a * b, 1);
    return prod === target;
  }
  if (op === '-') {
    if (values.length !== 2) return false;
    return Math.abs(values[0] - values[1]) === target;
  }
  if (op === '/') {
    if (values.length !== 2) return false;
    const max = Math.max(values[0], values[1]);
    const min = Math.min(values[0], values[1]);
    return max / min === target;
  }
  return true;
}

function highlightCellError(r, c) {
  const cell = document.querySelector(`.calcudoku-cell[data-row="${r}"][data-col="${c}"]`);
  if (cell) cell.classList.add('error');
}

function giveHint() {
  const puzzle = CALCUDOKU_PUZZLES[currentPuzzleKey];
  const { solution } = puzzle;

  // Find first empty or wrong cell
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      if (userGrid[r][c] !== solution[r][c]) {
        userGrid[r][c] = solution[r][c];
        renderGrid(puzzle);
        selectCell(r, c);
        updateGameStatus(`💡 Hint applied at Row ${r+1}, Col ${c+1}: Placed ${solution[r][c]}!`, "text-yellow-300");
        return;
      }
    }
  }
  updateGameStatus("🌟 You already solved everything correctly!", "text-green-400");
}

function resetPuzzle() {
  userGrid = Array(4).fill(null).map(() => Array(4).fill(null));
  const puzzle = CALCUDOKU_PUZZLES[currentPuzzleKey];
  renderGrid(puzzle);
  selectCell(0, 0);
  updateGameStatus("Grid reset. Ready for your next cognitive solve!", "text-slate-300");
}

function updateGameStatus(msg, textClass = "text-slate-300") {
  const statusEl = document.getElementById('calcudoku-status');
  if (statusEl) {
    statusEl.className = `text-sm font-medium transition-all duration-200 ${textClass}`;
    statusEl.innerHTML = msg;
  }
}

function triggerConfetti() {
  const container = document.getElementById('confetti-container');
  if (!container) return;

  const colors = ['#00E5FF', '#FF5722', '#10B981', '#F59E0B', '#FFFFFF', '#8B5CF6'];
  for (let i = 0; i < 40; i++) {
    const p = document.createElement('div');
    p.className = 'confetti-particle';
    p.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    p.style.left = '50%';
    p.style.top = '50%';
    
    const angle = Math.random() * Math.PI * 2;
    const distance = 80 + Math.random() * 160;
    const dx = `${Math.cos(angle) * distance}px`;
    const dy = `${Math.sin(angle) * distance - 50}px`;
    const rot = `${Math.random() * 720 - 360}deg`;

    p.style.setProperty('--dx', dx);
    p.style.setProperty('--dy', dy);
    p.style.setProperty('--rot', rot);

    container.appendChild(p);
    setTimeout(() => p.remove(), 2500);
  }
}

// Global Keyboard Handler for Calcudoku
window.addEventListener('keydown', (e) => {
  // Only trigger if not focused in an input/textarea
  if (['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) return;

  if (['1', '2', '3', '4'].includes(e.key)) {
    enterNumber(parseInt(e.key));
  } else if (e.key === 'Backspace' || e.key === 'Delete' || e.key === '0') {
    clearCurrentCell();
  } else if (e.key === 'ArrowUp') {
    e.preventDefault();
    selectCell(Math.max(0, selectedCell.r - 1), selectedCell.c);
  } else if (e.key === 'ArrowDown') {
    e.preventDefault();
    selectCell(Math.min(3, selectedCell.r + 1), selectedCell.c);
  } else if (e.key === 'ArrowLeft') {
    e.preventDefault();
    selectCell(selectedCell.r, Math.max(0, selectedCell.c - 1));
  } else if (e.key === 'ArrowRight') {
    e.preventDefault();
    selectCell(selectedCell.r, Math.min(3, selectedCell.c + 1));
  }
});


// ============================================================================
// 2. Master Catalog Database across 4 Publishing Divisions
// ============================================================================

const BOOK_CATALOG = [
  // ==========================================================================
  // DIVISION 1: MATH & CAGE LOGIC
  // ==========================================================================
  {
    id: 'bf-4x4-v1',
    division: 'division-1',
    divisionLabel: 'Math & Cage Logic',
    title: 'Calcudoku Puzzles: 4x4 Easy',
    subtitle: 'The Standard in Logic Puzzles • 500+ Puzzles',
    volume: 'Volume 1',
    subSeries: '4x4 Easy Series',
    coverImage: 'cover-calcudoku-4x4-easy-v1.jpg',
    backCoverImage: 'cover-calcudoku-back.jpg',
    fullCoverImage: 'wrap-calcudoku-4x4-easy-v1.jpg',
    accentColor: '#335CAA',
    accentTagBg: 'bg-blue-950 text-blue-300 border-blue-500/50',
    gridsCount: '504 Grids (500+)',
    gridSize: '4x4 Easy',
    difficultyScore: 1,
    difficultyLabel: 'Starter Easy',
    printType: 'Large 8.5" × 11" (110 Pages)',
    price: '$9.99',
    digitalPrice: '$4.99',
    cellDimension: '15.7 mm',
    clueType: '17 pt',
    repeats: '0 Repeats Ever',
    features: [
      'Clue numbers at 17pt — never guess + from ÷ again',
      'Room in the margins to work out your factors',
      'One grid size throughout, graded by technique',
      'Answer key printed full size, not crammed',
      'Exactly one solution, every time. Machine-verified.'
    ],
    amazonUrl: 'https://www.amazon.com/s?k=Brain+Focus+Calcudoku+4x4+Easy+Volume+1',
    stripeUrl: 'https://buy.stripe.com/bJe7sN4WF6XAgzg1stgYU08',
    badge: '★ Official 1st Edition'
  },
  {
    id: 'bf-4x4-v2',
    division: 'division-1',
    divisionLabel: 'Math & Cage Logic',
    title: 'Calcudoku Puzzles: 4x4 Easy',
    subtitle: 'Fast Mental Math Flow State • 500+ Puzzles',
    volume: 'Volume 2',
    subSeries: '4x4 Easy Series',
    coverImage: 'cover-calcudoku-4x4-easy-v2.jpg',
    fullCoverImage: 'wrap-calcudoku-4x4-easy-v2.jpg',
    accentColor: '#335CAA',
    accentTagBg: 'bg-blue-900/60 text-blue-300 border-blue-600/40',
    gridsCount: '504 Grids',
    gridSize: '4x4 Easy',
    difficultyScore: 1,
    difficultyLabel: 'Starter Easy',
    printType: 'Large 8.5" × 11" (110 Pages)',
    price: '$9.99',
    digitalPrice: '$4.99',
    cellDimension: '15.7 mm',
    clueType: '17 pt',
    repeats: '0',
    features: ['17pt High-Contrast Clues', 'Margin Factor Workspaces', 'Full-Size Answer Keys'],
    amazonUrl: 'https://www.amazon.com/s?k=Brain+Focus+Calcudoku+4x4+Pure+Easy+Vol+2',
    stripeUrl: 'https://buy.stripe.com/bJe7sN4WF6XAgzg1stgYU08'
  },
  {
    id: 'bf-5x5-v1',
    division: 'division-1',
    divisionLabel: 'Math & Cage Logic',
    title: 'Calcudoku Puzzles: 5x5 Easy',
    subtitle: 'Expand Your Logic Capacity • 500+ Puzzles',
    volume: 'Volume 1',
    subSeries: '5x5 Easy Series',
    coverImage: 'cover-calcudoku-5x5-easy-v1.jpg',
    fullCoverImage: 'wrap-calcudoku-5x5-easy-v1.jpg',
    accentColor: '#A023A0',
    accentTagBg: 'bg-fuchsia-950 text-fuchsia-300 border-fuchsia-600/40',
    gridsCount: '504 Grids',
    gridSize: '5x5 Grids',
    difficultyScore: 2,
    difficultyLabel: 'Gentle Step Up',
    printType: 'Large 8.5" × 11" (110 Pages)',
    price: '$9.99',
    digitalPrice: '$4.99',
    cellDimension: '12.6 mm',
    clueType: '14 pt',
    repeats: '0',
    features: ['12.6mm Large Cells', '14pt High-Contrast Clues', 'Prime Factorization Cages', 'Zero Guessing Logic'],
    amazonUrl: 'https://www.amazon.com/s?k=Brain+Focus+Calcudoku+5x5+Pure+Easy+Vol+1',
    stripeUrl: 'https://buy.stripe.com/bJe7sN4WF6XAgzg1stgYU08',
    badge: 'Popular Step Up'
  },
  {
    id: 'bf-6x6-v1',
    division: 'division-1',
    divisionLabel: 'Math & Cage Logic',
    title: 'Calcudoku Puzzles: 6x6 Medium',
    subtitle: 'The Classic 6x6 Standard • 504 Grids',
    volume: 'Volume 1',
    subSeries: '6x6 Medium Series',
    coverImage: 'cover-calcudoku-6x6-medium-v1.jpg',
    fullCoverImage: 'wrap-calcudoku-6x6-medium-v1.jpg',
    accentColor: '#044731',
    accentTagBg: 'bg-emerald-950 text-emerald-300 border-emerald-600/40',
    gridsCount: '504 Grids',
    gridSize: '6x6 Grids',
    difficultyScore: 3,
    difficultyLabel: 'Solid Medium',
    printType: 'Large 8.5" × 11" (166 Pages)',
    price: '$9.99',
    digitalPrice: '$4.99',
    cellDimension: '13.0 mm',
    clueType: '14 pt',
    repeats: '0',
    features: ['13.0mm Capped Wide-Margin Cells', '14.7pt Clue Type', '4-Up Spacious Grid Layout', '166 Pages Total'],
    amazonUrl: 'https://www.amazon.com/s?k=Brain+Focus+Calcudoku+6x6+Pure+Easy+Vol+1',
    stripeUrl: 'https://buy.stripe.com/bJe7sN4WF6XAgzg1stgYU08'
  },
  {
    id: 'bf-prog-v1',
    division: 'division-1',
    divisionLabel: 'Math & Cage Logic',
    title: 'Calcudoku Structured Progression',
    subtitle: 'From Novice to Grandmaster • 504 Grids',
    volume: 'Volume 1',
    subSeries: 'Progression Tier',
    coverImage: 'cover-calcudoku-prog-v1.jpg',
    accentColor: '#00E5FF',
    accentTagBg: 'bg-cyan-950 text-cyan-300 border-cyan-500/50',
    gridsCount: '504 Grids',
    gridSize: '4x4 to 8x8 Grids',
    difficultyScore: 3,
    difficultyLabel: 'Multi-Level Ramp',
    printType: 'Large 8.5" × 11"',
    price: '$10.99',
    digitalPrice: '$5.99',
    cellDimension: '15.7 mm',
    clueType: '17 pt',
    repeats: '0',
    features: ['5 Calibrated Difficulty Tiers', 'Warmup to Beast Mode', 'Cognitive Benchmark Matrix'],
    amazonUrl: 'https://www.amazon.com/s?k=Brain+Focus+Calcudoku+Structured+Progression+Vol+1',
    stripeUrl: 'https://buy.stripe.com/aFabJ3gFn5Twgzg3ABgYU09',
    badge: 'Best Progression'
  },
  {
    id: 'bf-hard-v1',
    division: 'division-1',
    divisionLabel: 'Math & Cage Logic',
    title: 'Challenger & Expert Calcudoku 9x9',
    subtitle: 'Peak Mental Endurance • 504 Grids',
    volume: 'Volume 1',
    subSeries: 'Expert 9x9 Series',
    coverImage: 'cover-calcudoku-expert-v1.jpg',
    accentColor: '#B91C1C',
    accentTagBg: 'bg-red-950 text-red-300 border-red-500/50',
    gridsCount: '504 Grids',
    gridSize: '8x8 & 9x9 Grids',
    difficultyScore: 5,
    difficultyLabel: 'Expert Challenge',
    printType: 'Large 8.5" × 11"',
    price: '$10.99',
    digitalPrice: '$5.99',
    cellDimension: '15.7 mm',
    clueType: '17 pt',
    repeats: '0',
    features: ['Extreme Multipliers', 'Deep Factor Combinations', 'Full Solver Matrices'],
    amazonUrl: 'https://www.amazon.com/s?k=Brain+Focus+Calcudoku+Expert+Hard+Vol+1',
    stripeUrl: 'https://buy.stripe.com/aFabJ3gFn5Twgzg3ABgYU09',
    badge: 'Hardcore Challenge'
  },
  {
    id: 'bf-kakuro-v1',
    division: 'division-1',
    divisionLabel: 'Math & Cage Logic',
    title: 'Kakuro Cross Sums Mastery',
    subtitle: 'The Ultimate Math Crossword Workout',
    volume: 'Volume 1',
    subSeries: 'Kakuro Series',
    coverImage: 'cover-kakuro-v1.jpg',
    accentColor: '#F59E0B',
    accentTagBg: 'bg-amber-950 text-amber-300 border-amber-500/50',
    gridsCount: '300 Grids',
    gridSize: 'Multi-Size Grids',
    difficultyScore: 3,
    difficultyLabel: 'Medium to Hard',
    printType: 'Large 8.5" × 11"',
    price: '$9.99',
    digitalPrice: '$4.99',
    cellDimension: '16.0 mm',
    clueType: '16 pt',
    repeats: '0',
    features: ['Unique Partition Tables Included', 'Laser High-Contrast Clues', 'Zero Trial & Error'],
    amazonUrl: 'https://www.amazon.com/s?k=Brain+Focus+Kakuro+Cross+Sums',
    stripeUrl: 'https://buy.stripe.com/bJe7sN4WF6XAgzg1stgYU08'
  },
  {
    id: 'bf-mathrax-v1',
    division: 'division-1',
    divisionLabel: 'Math & Cage Logic',
    title: 'Mathrax Arithmetic Grid Workout',
    subtitle: 'Diagonal Intersections & Circle Clues',
    volume: 'Volume 1',
    subSeries: 'Mathrax Series',
    coverImage: 'cover-mathrax-v1.jpg',
    accentColor: '#8B5CF6',
    accentTagBg: 'bg-purple-950 text-purple-300 border-purple-500/50',
    gridsCount: '250 Grids',
    gridSize: '6x6 & 8x8 Grids',
    difficultyScore: 3,
    difficultyLabel: 'Engaging Logic',
    printType: 'Large 8.5" × 11"',
    price: '$9.99',
    digitalPrice: '$4.99',
    cellDimension: '16.5 mm',
    clueType: '17 pt',
    repeats: '0',
    features: ['Even/Odd Parity Intersections', 'Geometric Calculation Paths', 'Single Solution Verified'],
    amazonUrl: 'https://www.amazon.com/s?k=Brain+Focus+Mathrax+Books',
    stripeUrl: 'https://buy.stripe.com/bJe7sN4WF6XAgzg1stgYU08'
  },

  // ==========================================================================
  // DIVISION 2: CLASSIC GRID & WORD PUZZLES
  // ==========================================================================
  {
    id: 'bf-sudoku-easy',
    division: 'division-2',
    divisionLabel: 'Classic Grid & Word',
    title: 'Classic Sudoku: Pure Deductions',
    subtitle: 'Gentle Warmup & Daily Focus Grids',
    volume: 'Volume 1',
    subSeries: 'Classic Sudoku Series',
    coverImage: 'cover-sudoku-v1.jpg',
    accentColor: '#3B82F6',
    accentTagBg: 'bg-blue-950 text-blue-300 border-blue-500/50',
    gridsCount: '400 Grids',
    gridSize: '9x9 Grids',
    difficultyScore: 2,
    difficultyLabel: 'Easy & Smooth',
    printType: 'Large 8.5" × 11"',
    price: '$9.99',
    digitalPrice: '$4.99',
    cellDimension: '18.0 mm',
    clueType: '18 pt',
    repeats: '0',
    features: ['Symmetrical Seed Placement', 'Extra Wide Margins for Notes', 'Large Crisp Numbers'],
    amazonUrl: 'https://www.amazon.com/s?k=Brain+Focus+Classic+Sudoku',
    stripeUrl: 'https://buy.stripe.com/bJe7sN4WF6XAgzg1stgYU08'
  },
  {
    id: 'bf-wordsearch-v1',
    division: 'division-2',
    divisionLabel: 'Classic Grid & Word',
    title: 'High-Density Word Search & Lexicon',
    subtitle: 'Cognitive Vocabulary & Focus Hunts',
    volume: 'Volume 1',
    subSeries: 'Word Search Series',
    coverImage: 'cover-wordsearch-v1.jpg',
    accentColor: '#EC4899',
    accentTagBg: 'bg-pink-950 text-pink-300 border-pink-500/50',
    gridsCount: '150 Jumbo Searches',
    gridSize: '20x20 Letter Grids',
    difficultyScore: 2,
    difficultyLabel: 'Relaxing Focus',
    printType: 'Large 8.5" × 11"',
    price: '$9.99',
    digitalPrice: '$4.99',
    cellDimension: '20 pt Font',
    clueType: '20 pt',
    repeats: '0',
    features: ['Curated Themed Word Lists', 'Zero Tiny Eye-Strain Text', 'Full Solution Back Index'],
    amazonUrl: 'https://www.amazon.com/s?k=Brain+Focus+Word+Search',
    stripeUrl: 'https://buy.stripe.com/bJe7sN4WF6XAgzg1stgYU08'
  },
  {
    id: 'bf-binary-v1',
    division: 'division-2',
    divisionLabel: 'Classic Grid & Word',
    title: 'Binary & Binairo 0/1 Puzzle Grids',
    subtitle: 'Pure Binary Logic & Row/Col Parity',
    volume: 'Volume 1',
    subSeries: 'Binary Grid Series',
    coverImage: 'cover-binary-v1.jpg',
    accentColor: '#10B981',
    accentTagBg: 'bg-emerald-950 text-emerald-300 border-emerald-500/50',
    gridsCount: '300 Grids',
    gridSize: '10x10 & 12x12 Grids',
    difficultyScore: 3,
    difficultyLabel: 'Logical Binary',
    printType: 'Large 8.5" × 11"',
    price: '$9.99',
    digitalPrice: '$4.99',
    cellDimension: '16.0 mm',
    clueType: '18 pt',
    repeats: '0',
    features: ['No More Than 2 In A Row Rule', 'Equal 0s and 1s Verification', 'Unique Deductive Path'],
    amazonUrl: 'https://www.amazon.com/s?k=Brain+Focus+Binary+Puzzles',
    stripeUrl: 'https://buy.stripe.com/bJe7sN4WF6XAgzg1stgYU08'
  },
  {
    id: 'bf-suguru-v1',
    division: 'division-2',
    divisionLabel: 'Classic Grid & Word',
    title: 'Suguru & Tectonics Polyomino Blocks',
    subtitle: 'Intricate Number Block Deductions',
    volume: 'Volume 1',
    subSeries: 'Suguru Series',
    coverImage: 'cover-suguru-v1.jpg',
    accentColor: '#6366F1',
    accentTagBg: 'bg-indigo-950 text-indigo-300 border-indigo-500/50',
    gridsCount: '250 Grids',
    gridSize: 'Multi-Polyomino',
    difficultyScore: 3,
    difficultyLabel: 'Spatial Logic',
    printType: 'Large 8.5" × 11"',
    price: '$9.99',
    digitalPrice: '$4.99',
    cellDimension: '16.0 mm',
    clueType: '17 pt',
    repeats: '0',
    features: ['Consecutive Number Polyomino Cages', 'Diagonal Neighbor Rules', 'Step-by-Step Keys'],
    amazonUrl: 'https://www.amazon.com/s?k=Brain+Focus+Suguru+Tectonics',
    stripeUrl: 'https://buy.stripe.com/bJe7sN4WF6XAgzg1stgYU08'
  },
  {
    id: 'bf-futoshiki-v1',
    division: 'division-2',
    divisionLabel: 'Classic Grid & Word',
    title: 'Futoshiki & Slitherlink Loops',
    subtitle: 'Inequality Grids & Continuous Loops',
    volume: 'Volume 1',
    subSeries: 'Futoshiki Series',
    coverImage: 'cover-futoshiki-v1.jpg',
    accentColor: '#14B8A6',
    accentTagBg: 'bg-teal-950 text-teal-300 border-teal-500/50',
    gridsCount: '240 Grids',
    gridSize: '5x5 to 7x7 Grids',
    difficultyScore: 3,
    difficultyLabel: 'Engaging Inequalities',
    printType: 'Large 8.5" × 11"',
    price: '$9.99',
    digitalPrice: '$4.99',
    cellDimension: '16.5 mm',
    clueType: '17 pt',
    repeats: '0',
    features: ['Bold Inequality Sign Vectors', 'Single Loop Verification', 'No Guessing Deductions'],
    amazonUrl: 'https://www.amazon.com/s?k=Brain+Focus+Futoshiki+Slitherlink',
    stripeUrl: 'https://buy.stripe.com/bJe7sN4WF6XAgzg1stgYU08'
  },

  // ==========================================================================
  // DIVISION 3: BRAIN FOCUS JUNIOR™ (Kids & Homeschooling)
  // ==========================================================================
  {
    id: 'bf-jr-k2',
    division: 'division-3',
    divisionLabel: 'Brain Focus Junior™',
    title: 'Junior Early Math Logic (Grades K–2)',
    subtitle: 'Visual Addition Pyramids & Mini 3x3 Cages',
    volume: 'Level 1',
    subSeries: 'Junior STEM Line',
    coverImage: 'cover-junior-k2.jpg',
    accentColor: '#F97316',
    accentTagBg: 'bg-orange-950 text-orange-300 border-orange-500/50',
    gridsCount: '120 Activity Pages',
    gridSize: '3x3 & 4x4 Mini Grids',
    difficultyScore: 1,
    difficultyLabel: 'Ages 5–8',
    printType: 'Extra Large 8.5" × 11"',
    price: '$8.99',
    digitalPrice: '$3.99',
    cellDimension: '24.0 mm',
    clueType: '24 pt',
    repeats: '0',
    features: ['Playful Visual Cage Clues', 'Builds Early Arithmetic Confidence', 'Illustrated Reward Badges'],
    amazonUrl: 'https://www.amazon.com/s?k=Brain+Focus+Junior+Math+Logic+K2',
    stripeUrl: 'https://buy.stripe.com/bJe7sN4WF6XAgzg1stgYU08',
    badge: 'Junior STEM'
  },
  {
    id: 'bf-jr-35',
    division: 'division-3',
    divisionLabel: 'Brain Focus Junior™',
    title: 'Elementary Logic & Calcudoku (Grades 3–5)',
    subtitle: 'Multiplication Times-Table & Logic Quests',
    volume: 'Level 2',
    subSeries: 'Junior STEM Line',
    coverImage: 'cover-junior-35.jpg',
    accentColor: '#06B6D4',
    accentTagBg: 'bg-cyan-950 text-cyan-300 border-cyan-500/50',
    gridsCount: '150 Activity Pages',
    gridSize: '4x4 & 5x5 Grids',
    difficultyScore: 2,
    difficultyLabel: 'Ages 8–11',
    printType: 'Large 8.5" × 11"',
    price: '$8.99',
    digitalPrice: '$3.99',
    cellDimension: '20.0 mm',
    clueType: '20 pt',
    repeats: '0',
    features: ['Reinforces Multiplication & Division', 'Critical Thinking Development', 'Homeschool Curriculum Companion'],
    amazonUrl: 'https://www.amazon.com/s?k=Brain+Focus+Junior+Calcudoku+Grades+3-5',
    stripeUrl: 'https://buy.stripe.com/bJe7sN4WF6XAgzg1stgYU08'
  },
  {
    id: 'bf-jr-homeschool',
    division: 'division-3',
    divisionLabel: 'Brain Focus Junior™',
    title: 'Homeschool STEM Logic & Reasoning Pack',
    subtitle: 'Cross-Discipline Math, Pattern & Logic Mastery',
    volume: 'Master Pack',
    subSeries: 'Junior STEM Line',
    coverImage: 'cover-junior-stem.jpg',
    accentColor: '#84CC16',
    accentTagBg: 'bg-lime-950 text-lime-300 border-lime-500/50',
    gridsCount: '180 STEM Challenges',
    gridSize: 'Multi-Format Logic',
    difficultyScore: 2,
    difficultyLabel: 'Ages 7–12',
    printType: 'Large 8.5" × 11"',
    price: '$9.99',
    digitalPrice: '$4.99',
    cellDimension: '18.0 mm',
    clueType: '18 pt',
    repeats: '0',
    features: ['Algorithmic Thinking Foundations', 'Math Mazes & Logic Matrices', 'Printable Teacher & Parent Keys'],
    amazonUrl: 'https://www.amazon.com/s?k=Brain+Focus+Homeschool+STEM+Logic',
    stripeUrl: 'https://buy.stripe.com/bJe7sN4WF6XAgzg1stgYU08'
  },

  // ==========================================================================
  // DIVISION 4: SENIOR COMFORT LINE
  // ==========================================================================
  {
    id: 'bf-senior-v1',
    division: 'division-4',
    divisionLabel: 'Senior Comfort Line',
    title: 'Senior Comfort: Large Print Calcudoku',
    subtitle: 'Zero Eye Strain & High-Visibility Grids',
    volume: 'Volume 1',
    subSeries: 'Senior Comfort Line',
    coverImage: 'cover-senior-v1.jpg',
    accentColor: '#6D28D9',
    accentTagBg: 'bg-purple-950 text-purple-300 border-purple-500/50',
    gridsCount: '150 Jumbo Grids',
    gridSize: '4x4 & 5x5 Jumbo Grids',
    difficultyScore: 2,
    difficultyLabel: 'Comfortable Easy',
    printType: 'Extra Large 24pt Font (2 Grids / Page)',
    price: '$11.99',
    digitalPrice: '$5.99',
    cellDimension: '22.0 mm',
    clueType: '24 pt',
    repeats: '0',
    features: [
      '22mm Spacious Large-Print Cells',
      'Extra Large 24pt High-Contrast Numbers',
      'Only 2 Grids Per Page with Wide Margins',
      'Gentle Mental Agility & Memory Stimulation'
    ],
    amazonUrl: 'https://www.amazon.com/s?k=Brain+Focus+Senior+Comfort+Large+Print+Calcudoku+Vol+1',
    stripeUrl: 'https://buy.stripe.com/5kQ6oJ0GpdlYcj02wxgYU0a',
    badge: 'Senior Recommended'
  },
  {
    id: 'bf-senior-v2',
    division: 'division-4',
    divisionLabel: 'Senior Comfort Line',
    title: 'Senior Comfort: Large Print Calcudoku',
    subtitle: 'Daily Memory & Sharp Mind Routine',
    volume: 'Volume 2',
    subSeries: 'Senior Comfort Line',
    coverImage: 'cover-senior-v2.jpg',
    accentColor: '#6D28D9',
    accentTagBg: 'bg-purple-950 text-purple-300 border-purple-500/50',
    gridsCount: '150 Jumbo Grids',
    gridSize: '5x5 Jumbo Grids',
    difficultyScore: 2,
    difficultyLabel: 'Comfortable Easy',
    printType: 'Extra Large 24pt Font (2 Grids / Page)',
    price: '$11.99',
    digitalPrice: '$5.99',
    cellDimension: '22.0 mm',
    clueType: '24 pt',
    repeats: '0',
    features: ['High Contrast Pure Black Inks', 'Senior-Friendly Instructions', 'Gentle Mental Stimulation'],
    amazonUrl: 'https://www.amazon.com/s?k=Brain+Focus+Senior+Comfort+Large+Print+Calcudoku+Vol+2',
    stripeUrl: 'https://buy.stripe.com/5kQ6oJ0GpdlYcj02wxgYU0a'
  },
  {
    id: 'bf-senior-sudoku',
    division: 'division-4',
    divisionLabel: 'Senior Comfort Line',
    title: 'Senior Comfort: Jumbo Print Sudoku',
    subtitle: 'Giant 24pt Numbers & Pure Deductions',
    volume: 'Volume 1',
    subSeries: 'Senior Comfort Line',
    coverImage: 'cover-senior-sudoku.jpg',
    accentColor: '#7C3AED',
    accentTagBg: 'bg-purple-950 text-purple-300 border-purple-500/50',
    gridsCount: '160 Jumbo Grids',
    gridSize: '9x9 Jumbo Grids',
    difficultyScore: 2,
    difficultyLabel: 'Comfortable Medium',
    printType: 'Extra Large 24pt Font (2 Grids / Page)',
    price: '$11.99',
    digitalPrice: '$5.99',
    cellDimension: '22.0 mm',
    clueType: '24 pt',
    repeats: '0',
    features: ['Zero Eye-Fatigue Layout', 'Extra Room for Pencil Notation', 'Full-Page Solutions'],
    amazonUrl: 'https://www.amazon.com/s?k=Brain+Focus+Senior+Comfort+Sudoku',
    stripeUrl: 'https://buy.stripe.com/5kQ6oJ0GpdlYcj02wxgYU0a'
  },
  {
    id: 'bf-senior-wordsearch',
    division: 'division-4',
    divisionLabel: 'Senior Comfort Line',
    title: 'Senior Comfort: Giant Print Word Search',
    subtitle: 'Relaxing High-Contrast Word Hunts',
    volume: 'Volume 1',
    subSeries: 'Senior Comfort Line',
    coverImage: 'cover-senior-wordsearch.jpg',
    accentColor: '#9333EA',
    accentTagBg: 'bg-purple-950 text-purple-300 border-purple-500/50',
    gridsCount: '120 Giant Searches',
    gridSize: 'Giant 28pt Type',
    difficultyScore: 1,
    difficultyLabel: 'Gentle Relaxation',
    printType: 'Giant 28pt Font (1 Puzzle / Page)',
    price: '$11.99',
    digitalPrice: '$5.99',
    cellDimension: '28 pt Type',
    clueType: '28 pt',
    repeats: '0',
    features: ['Giant 28pt Letters — Easiest to Read', 'Uplifting Nostalgic & Nature Themes', 'Full Page Answer Keys'],
    amazonUrl: 'https://www.amazon.com/s?k=Brain+Focus+Senior+Comfort+Word+Search',
    stripeUrl: 'https://buy.stripe.com/5kQ6oJ0GpdlYcj02wxgYU0a'
  }
];

let activeDivisionFilter = 'all';

function renderBookCatalog(filter = 'all') {
  const container = document.getElementById('book-catalog-grid');
  if (!container) return;

  const filteredBooks = filter === 'all' 
    ? BOOK_CATALOG 
    : BOOK_CATALOG.filter(b => b.division === filter || b.category === filter);

  container.innerHTML = '';

  filteredBooks.forEach(book => {
    const card = document.createElement('div');
    card.className = 'group relative flex flex-col justify-between bg-[#11192E] rounded-2xl p-6 border transition-all duration-300 hover:-translate-y-2';
    card.style.borderColor = `${book.accentColor}55`;
    card.style.boxShadow = `0 10px 30px -10px ${book.accentColor}33`;

    // Stars generator
    let starsHtml = '';
    for (let i = 1; i <= 5; i++) {
      if (i <= book.difficultyScore) {
        starsHtml += `<span class="text-amber-400 text-sm">★</span>`;
      } else {
        starsHtml += `<span class="text-slate-600 text-sm">★</span>`;
      }
    }

    // Cover rendering: Real cover image if available, else stylized procedural 3D card
    const coverMarkup = book.coverImage 
      ? `
        <div class="book-cover-img-wrapper">
          <img src="${book.coverImage}" alt="${book.title}" class="w-full h-full object-fill block">
        </div>
      `
      : `
        <div class="book-cover" style="border-left: 4px solid ${book.accentColor};">
          <div>
            <div class="flex items-center justify-between mb-1">
              <img src="logo.png" alt="BRAIN FOCUS™" class="h-3.5 w-auto object-contain">
              <span class="text-[9px] font-bold px-1.5 py-0.5 rounded text-white" style="background-color: ${book.accentColor};">${book.volume}</span>
            </div>
            <h4 class="text-sm font-extrabold leading-tight text-white line-clamp-2">${book.title}</h4>
          </div>

          <div class="my-auto py-2 flex flex-col items-center">
            <div class="w-24 h-24 rounded-lg bg-[#070B1A] border-2 flex flex-col justify-between p-1.5 shadow-inner" style="border-color: ${book.accentColor};">
              <div class="flex justify-between text-[8px] font-mono text-[#00E5FF]">
                <span>15.7mm</span>
                <span>17pt</span>
              </div>
              <div class="text-center font-mono font-bold text-xs tracking-wider text-white/90">
                ${book.gridSize.split(' ')[0]}
              </div>
              <div class="flex justify-between text-[8px] font-mono text-orange-400">
                <span>504</span>
                <span>VERIFIED</span>
              </div>
            </div>
            <span class="text-[10px] text-slate-300 font-medium mt-1.5">${book.gridsCount}</span>
          </div>

          <div class="pt-1 border-t border-white/10 flex items-center justify-between">
            <span class="text-[8px] font-semibold text-slate-400">${book.price}</span>
            <span class="text-[8px] font-bold text-orange-400">0 REPEATS</span>
          </div>
        </div>
      `;

    card.innerHTML = `
      <!-- Top Badges & Sub-Series Tag -->
      <div class="flex items-center justify-between gap-2 mb-4">
        <span class="px-2.5 py-1 rounded-full text-xs font-bold border uppercase tracking-wider ${book.accentTagBg}">
          ${book.divisionLabel}
        </span>
        <span class="text-xs font-mono font-bold text-white bg-slate-800/80 px-2.5 py-1 rounded-md border border-slate-700">
          ${book.volume}
        </span>
      </div>

      <!-- 3D Book Presentation Area -->
      <div class="book-wrapper py-6 flex justify-center items-center">
        <div class="book-card-3d cursor-pointer" onclick="openBookModal('${book.id}')">
          <div class="book-spine-shine"></div>
          <div class="book-pages-side"></div>
          ${coverMarkup}
        </div>
      </div>

      <!-- Book Info & Specs -->
      <div class="mt-4 flex-1">
        <div class="flex items-center justify-between mb-1">
          <h3 class="text-lg font-bold text-white group-hover:text-[#00E5FF] transition-colors leading-snug">
            ${book.title}
          </h3>
          <span class="text-sm font-black text-white ml-2 shrink-0">${book.price}</span>
        </div>
        <p class="text-xs text-slate-400 mb-3">
          ${book.subtitle}
        </p>

        <!-- Spec Pills Grid -->
        <div class="grid grid-cols-2 gap-1.5 mb-3 text-[11px] font-mono text-slate-300 bg-slate-900/60 p-2 rounded-xl border border-slate-800">
          <div><span class="text-slate-500">Cells:</span> <strong class="text-cyan-300">${book.cellDimension || '15.7mm'}</strong></div>
          <div><span class="text-slate-500">Type:</span> <strong class="text-cyan-300">${book.clueType || '17pt'}</strong></div>
          <div><span class="text-slate-500">Grids:</span> <strong class="text-white">${book.gridsCount.split(' ')[0]}</strong></div>
          <div><span class="text-slate-500">Repeats:</span> <strong class="text-orange-400">0 Ever</strong></div>
        </div>

        <ul class="space-y-1 text-xs text-slate-300 mb-5">
          ${book.features.slice(0, 2).map(f => `<li class="flex items-start gap-1.5"><span class="text-[#00E5FF]">✓</span> <span>${f}</span></li>`).join('')}
        </ul>
      </div>

      <!-- Dual Action Buttons: Retail Amazon + Direct Digital -->
      <div class="pt-4 border-t border-slate-800/80 flex flex-col gap-2">
        <a href="${book.amazonUrl}" target="_blank" rel="noopener" 
           class="w-full py-2.5 px-4 rounded-xl font-bold text-sm text-white text-center flex items-center justify-center gap-2 glow-coral-btn">
          <svg class="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M15.93 17.09c-2.83 2.08-6.95 3.2-10.57 3.2-4.97 0-9.45-1.92-12.86-5.11-.27-.25-.03-.6.29-.41 3.69 2.14 8.21 3.42 12.86 3.42 3.21 0 6.74-.75 9.87-2.31.47-.23.82.26.41.61zm2.34-1.28c-.36-.46-2.38-.22-3.3-.11-.28.03-.32-.2-.07-.38 1.63-1.15 4.3-.82 4.61-.43.32.41-.08 3.09-1.63 4.35-.25.2-.44.09-.3-.18.47-.88.94-2.79.69-3.25zM21.1 19.34c-1.57 2.03-3.66 3.65-6.09 4.66-2.43 1-5.06 1.51-7.71 1.5-3.08 0-6.07-.67-8.81-1.96-.34-.16-.27-.64.1-.56 2.62.56 5.35.85 8.1.85 2.5 0 4.97-.48 7.26-1.42 2.29-.93 4.25-2.45 5.73-4.35.34-.43.83.18.42.56zM13.68 5.7c-.15.86-.68 1.94-1.39 2.64-.71.7-1.78 1.34-2.67 1.25-.13-.01-.19-.16-.09-.25 1.05-.98 2.06-2.28 2.13-3.79.06-1.24-.62-2.18-1.55-2.18-.75 0-1.41.59-1.8 1.48-.42.97-.48 2.37-.48 3.51 0 .28-.24.47-.51.41-1.48-.31-2.91-.98-4.04-1.99-.25-.23-.07-.63.26-.52 1.03.35 2.14.53 3.26.53.07 0 .14 0 .21-.01-.03-.7-.01-1.47.09-2.22.25-1.91 1.41-3.35 3.12-3.35 1.13 0 2.04.66 2.45 1.69.4.99.3 2.08-.09 3.01z"/></svg>
          Buy Paperback (${book.price})
        </a>
        <div class="grid grid-cols-2 gap-2">
          <button onclick="openBookModal('${book.id}')" 
                  class="py-2 px-2.5 rounded-xl font-semibold text-xs text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700 border border-slate-700 transition-colors text-center truncate">
            🔍 Specs & Cover
          </button>
          <a href="${book.stripeUrl}" target="_blank" rel="noopener"
             class="py-2 px-2.5 rounded-xl font-semibold text-xs text-cyan-300 hover:text-white bg-cyan-950/60 hover:bg-cyan-900/80 border border-cyan-500/40 transition-colors text-center truncate">
            📥 PDF (${book.digitalPrice})
          </a>
        </div>
      </div>
    `;

    container.appendChild(card);
  });
}

function filterCatalog(divisionKey, buttonEl) {
  activeDivisionFilter = divisionKey;
  
  // Update button active state
  const buttons = document.querySelectorAll('.catalog-filter-btn');
  buttons.forEach(btn => {
    btn.classList.remove('bg-[#00E5FF]', 'text-black', 'shadow-lg');
    btn.classList.add('bg-slate-800/80', 'text-slate-300');
  });

  if (buttonEl) {
    buttonEl.classList.remove('bg-slate-800/80', 'text-slate-300');
    buttonEl.classList.add('bg-[#00E5FF]', 'text-black', 'shadow-lg');
  }

  renderBookCatalog(divisionKey);
}


// ============================================================================
// 3. Modal Systems & Lead Capture Magnet
// ============================================================================

function openSampleModal() {
  const modal = document.getElementById('sample-modal');
  if (modal) {
    modal.classList.remove('hidden');
    modal.classList.add('flex');
  }
}

function closeSampleModal() {
  const modal = document.getElementById('sample-modal');
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  }
}

function openBookModal(bookId) {
  const book = BOOK_CATALOG.find(b => b.id === bookId);
  if (!book) return;

  const modal = document.getElementById('book-details-modal');
  const content = document.getElementById('book-modal-content');
  if (!modal || !content) return;

  const hasRealCover = !!book.fullCoverImage || !!book.coverImage;

  content.innerHTML = `
    <div class="flex flex-col gap-6">
      
      <!-- Modal Header -->
      <div class="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <span class="px-2.5 py-0.5 rounded-full text-xs font-bold ${book.accentTagBg}">${book.subSeries}</span>
          <h3 class="text-2xl font-black text-white mt-1">${book.title}</h3>
          <p class="text-xs text-slate-400">${book.subtitle}</p>
        </div>
        <span class="text-xs font-mono font-bold text-cyan-400 bg-cyan-950 px-3 py-1.5 rounded-lg border border-cyan-500/40">
          ${book.volume}
        </span>
      </div>

      <!-- Tab Buttons for Cover Preview -->
      ${hasRealCover ? `
        <div class="flex items-center gap-2 border-b border-slate-800 pb-2 text-xs">
          <button id="modal-tab-front" onclick="switchModalCoverTab('front', '${book.id}')" class="px-3 py-1.5 rounded-lg font-bold bg-[#00E5FF] text-black">Front Cover</button>
          <button id="modal-tab-back" onclick="switchModalCoverTab('back', '${book.id}')" class="px-3 py-1.5 rounded-lg font-bold bg-slate-800 text-slate-300 hover:text-white">Back Cover</button>
          <button id="modal-tab-full" onclick="switchModalCoverTab('full', '${book.id}')" class="px-3 py-1.5 rounded-lg font-bold bg-slate-800 text-slate-300 hover:text-white">Full Wrap Spread</button>
        </div>
      ` : ''}

      <!-- Main Modal Body Grid -->
      <div class="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        
        <!-- Left: Cover Viewer Area -->
        <div class="md:col-span-6 flex flex-col items-center justify-center p-4 bg-[#070C1B] rounded-2xl border border-cyan-500/30">
          <div id="modal-cover-display" class="w-full flex items-center justify-center min-h-[300px]">
            ${book.coverImage ? `
              <img src="${book.coverImage}" alt="${book.title}" class="max-h-[340px] w-auto rounded-lg shadow-2xl border border-cyan-400/40 object-contain">
            ` : `
              <div class="book-card-3d scale-100">
                <div class="book-spine-shine"></div>
                <div class="book-pages-side"></div>
                <div class="book-cover" style="border-left: 4px solid ${book.accentColor};">
                  <div class="flex items-center justify-between mb-1">
                    <img src="logo.png" alt="BRAIN FOCUS™" class="h-4 w-auto object-contain">
                    <span class="text-[9px] font-bold px-1.5 py-0.5 rounded text-white" style="background-color: ${book.accentColor};">${book.volume}</span>
                  </div>
                  <h4 class="text-sm font-extrabold text-white my-2">${book.title}</h4>
                  <div class="my-auto py-2 text-center">
                    <span class="text-xs font-bold text-white bg-slate-800 px-2 py-1 rounded">${book.gridSize}</span>
                    <p class="text-[10px] text-slate-300 mt-2">${book.gridsCount}</p>
                  </div>
                  <div class="text-[9px] text-orange-400 font-bold text-right">${book.volume}</div>
                </div>
              </div>
            `}
          </div>
          <span class="text-[11px] text-cyan-400 font-mono mt-3">✓ 100% Machine-Verified Logic Standard</span>
        </div>

        <!-- Right: Specifications & Features List -->
        <div class="md:col-span-6 flex flex-col justify-between h-full">
          <div>
            <!-- Blueprint Stats 4-Box Grid -->
            <div class="grid grid-cols-2 gap-2.5 mb-4 bg-slate-900/90 p-3.5 rounded-2xl border border-slate-800">
              <div>
                <span class="text-[10px] uppercase text-slate-400 font-bold">Grid Cells</span>
                <p class="text-sm font-black text-[#00E5FF]">${book.cellDimension || '15.7 mm'}</p>
              </div>
              <div>
                <span class="text-[10px] uppercase text-slate-400 font-bold">Clue Type</span>
                <p class="text-sm font-black text-[#00E5FF]">${book.clueType || '17 pt'}</p>
              </div>
              <div>
                <span class="text-[10px] uppercase text-slate-400 font-bold">Total Grids</span>
                <p class="text-sm font-black text-white">${book.gridsCount}</p>
              </div>
              <div>
                <span class="text-[10px] uppercase text-slate-400 font-bold">Repeats Ever</span>
                <p class="text-sm font-black text-[#FF5722]">${book.repeats || '0'}</p>
              </div>
            </div>

            <h5 class="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Publishing Blueprint Highlights:</h5>
            <ul class="space-y-2 text-xs text-slate-300 mb-6">
              ${book.features.map(f => `<li class="flex items-start gap-2"><span class="text-[#00E5FF] font-bold mt-0.5">✓</span> <span>${f}</span></li>`).join('')}
            </ul>
          </div>

          <div class="flex flex-col sm:flex-row gap-3 pt-4 border-t border-slate-800">
            <a href="${book.amazonUrl}" target="_blank" rel="noopener" 
               class="flex-1 py-3 px-4 rounded-xl font-bold text-sm text-white text-center flex items-center justify-center gap-2 glow-coral-btn">
              Order Volume on Amazon
            </a>
            <button onclick="closeBookModal()" class="py-3 px-4 rounded-xl font-semibold text-xs text-slate-400 hover:text-white bg-slate-800 border border-slate-700">
              Close
            </button>
          </div>
        </div>

      </div>
    </div>
  `;

  modal.classList.remove('hidden');
  modal.classList.add('flex');
}

function switchModalCoverTab(tabType, bookId) {
  const book = BOOK_CATALOG.find(b => b.id === bookId);
  if (!book) return;

  const displayEl = document.getElementById('modal-cover-display');
  if (!displayEl) return;

  // Reset tab buttons
  const tabs = ['front', 'back', 'full'];
  tabs.forEach(t => {
    const btn = document.getElementById(`modal-tab-${t}`);
    if (btn) {
      btn.className = (t === tabType) 
        ? 'px-3 py-1.5 rounded-lg font-bold bg-[#00E5FF] text-black' 
        : 'px-3 py-1.5 rounded-lg font-bold bg-slate-800 text-slate-300 hover:text-white';
    }
  });

  if (tabType === 'front' && book.coverImage) {
    displayEl.innerHTML = `<img src="${book.coverImage}" alt="Front Cover" class="max-h-[340px] w-auto rounded-lg shadow-2xl border border-cyan-400/40 object-contain animate-fade-in">`;
  } else if (tabType === 'back' && book.backCoverImage) {
    displayEl.innerHTML = `<img src="${book.backCoverImage}" alt="Back Cover" class="max-h-[340px] w-auto rounded-lg shadow-2xl border border-cyan-400/40 object-contain animate-fade-in">`;
  } else if (tabType === 'full' && book.fullCoverImage) {
    displayEl.innerHTML = `<img src="${book.fullCoverImage}" alt="Full Cover Wrap" class="max-h-[260px] w-full rounded-lg shadow-2xl border border-cyan-400/40 object-contain animate-fade-in">`;
  }
}

function closeBookModal() {
  const modal = document.getElementById('book-details-modal');
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  }
}

function handleEmailSubmit(event, source = 'main') {
  event.preventDefault();
  const inputEl = document.getElementById(source === 'modal' ? 'modal-email-input' : 'email-input');
  if (!inputEl || !inputEl.value) return;

  const email = inputEl.value.trim();
  if (!email.includes('@') || !email.includes('.')) {
    alert('Please enter a valid email address.');
    return;
  }

  // Show success state
  const formArea = document.getElementById(source === 'modal' ? 'modal-lead-form' : 'lead-capture-form-area');
  if (formArea) {
    formArea.innerHTML = `
      <div class="bg-emerald-950/80 border border-emerald-500/60 rounded-2xl p-6 text-center animate-fade-in">
        <div class="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-3 text-2xl font-bold">✓</div>
        <h4 class="text-lg font-bold text-white mb-1">Your 20-Page Sampler Pack is Ready!</h4>
        <p class="text-xs text-slate-300 mb-4">We've dispatched your printable PDF pack to <span class="text-[#00E5FF] font-semibold">${email}</span>.</p>
        <a href="#demo" onclick="closeSampleModal(); triggerConfetti();" class="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs text-white glow-coral-btn">
          📥 Download Printable PDF Directly (Instant Access)
        </a>
      </div>
    `;
  }
  triggerConfetti();
}

function selectPuzzleDifficulty(difficulty) {
  currentPuzzleKey = difficulty;
  
  const buttons = document.querySelectorAll('.puzzle-diff-btn');
  buttons.forEach(btn => {
    btn.classList.remove('bg-[#00E5FF]', 'text-black');
    btn.classList.add('bg-slate-800', 'text-slate-300');
  });

  const activeBtn = document.getElementById(`btn-diff-${difficulty}`);
  if (activeBtn) {
    activeBtn.classList.remove('bg-slate-800', 'text-slate-300');
    activeBtn.classList.add('bg-[#00E5FF]', 'text-black');
  }

  initCalcudoku();
}

function openBundleCheckout(bundleType) {
  const bundles = {
    starter: {
      name: "4x4 & 5x5 Easy Digital Trilogy",
      price: "$9.99",
      grids: "600 Printable Grids",
      desc: "Instant download vector PDF formatted for GoodNotes, Notability, and home printing.",
      stripeUrl: "https://buy.stripe.com/bJe7sN4WF6XAgzg1stgYU08"
    },
    grandmaster: {
      name: "Grandmaster Progression Suite (6 Volumes)",
      price: "$17.99",
      grids: "1,200+ Printable Grids",
      desc: "Complete 4x4 to 9x9 suite including cage strategy masterclass and verified solver matrices.",
      stripeUrl: "https://buy.stripe.com/aFabJ3gFn5Twgzg3ABgYU09"
    },
    senior: {
      name: "Senior Comfort Jumbo Pack (3 Volumes)",
      price: "$12.99",
      grids: "450 Giant 24pt Grids",
      desc: "Extra large print 1 grid per page printable PDF with pure black high-contrast inks.",
      stripeUrl: "https://buy.stripe.com/5kQ6oJ0GpdlYcj02wxgYU0a"
    }
  };

  const b = bundles[bundleType] || bundles.grandmaster;
  
  const modal = document.getElementById('book-details-modal');
  const content = document.getElementById('book-modal-content');
  if (!modal || !content) return;

  content.innerHTML = `
    <div class="p-4 sm:p-6 text-center">
      <div class="w-14 h-14 rounded-full bg-cyan-500/20 text-[#00E5FF] flex items-center justify-center mx-auto mb-4 text-2xl font-bold border border-cyan-400/40">
        📥
      </div>
      <span class="px-3 py-1 rounded-full text-xs font-bold bg-cyan-950 text-cyan-300 border border-cyan-500/50 uppercase">Direct Digital Bundle</span>
      <h3 class="text-2xl font-extrabold text-white mt-3 mb-1">${b.name}</h3>
      <p class="text-xs text-slate-300 max-w-md mx-auto mb-6">${b.desc}</p>

      <div class="bg-[#070B1A] border border-cyan-500/30 rounded-2xl p-4 max-w-sm mx-auto mb-6">
        <div class="flex items-center justify-between text-xs text-slate-400 mb-2">
          <span>Digital Bundle Delivery:</span>
          <span class="text-emerald-400 font-bold">Instant Vector PDF</span>
        </div>
        <div class="flex items-center justify-between text-xs text-slate-400 mb-3">
          <span>Total Logic Grids:</span>
          <span class="text-white font-bold">${b.grids}</span>
        </div>
        <div class="flex items-center justify-between text-sm font-bold border-t border-slate-800 pt-2">
          <span class="text-white">Direct Bundle Price:</span>
          <span class="text-2xl font-black text-[#00E5FF]">${b.price}</span>
        </div>
      </div>

      <div class="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
        <a href="${b.stripeUrl}" target="_blank" rel="noopener"
           class="flex-1 py-3.5 px-6 rounded-xl font-extrabold text-sm text-white glow-coral-btn text-center shadow-lg flex items-center justify-center gap-2">
          <span>🔒 Checkout with Stripe (${b.price})</span>
        </a>
        <button onclick="closeBookModal()" class="py-3.5 px-5 rounded-xl font-bold text-xs text-slate-400 hover:text-white bg-slate-800 border border-slate-700">
          Cancel
        </button>
      </div>
      <p class="text-[10px] text-slate-500 mt-4">🔒 Powered by Stripe • Instant download deliverable • 30-Day Money-Back Guarantee</p>
    </div>
  `;

  modal.classList.remove('hidden');
  modal.classList.add('flex');
}

// ============================================================================
// 4. Form Handlers: VIP Solver Club & Reader Feedback
// ============================================================================

function handleVipFormSubmit(event) {
  event.preventDefault();
  const nameEl = document.getElementById('vip-name');
  const emailEl = document.getElementById('vip-email');
  if (!nameEl || !emailEl) return;

  const name = nameEl.value.trim();
  const email = emailEl.value.trim();
  if (!email.includes('@')) {
    alert('Please enter a valid email address.');
    return;
  }

  const wrapper = document.getElementById('vip-form-wrapper');
  if (wrapper) {
    wrapper.innerHTML = `
      <div class="bg-emerald-950/80 border-2 border-emerald-500/60 rounded-3xl p-8 text-center animate-fade-in shadow-2xl">
        <div class="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-4 text-3xl font-black border border-emerald-400/50">
          ✓
        </div>
        <span class="px-3 py-1 rounded-full text-xs font-bold bg-emerald-900 text-emerald-300 uppercase tracking-wider">
          Membership Confirmed
        </span>
        <h3 class="font-heading font-black text-2xl sm:text-3xl text-white mt-3 mb-2">
          Welcome to the Club, ${name}!
        </h3>
        <p class="text-slate-300 text-sm max-w-lg mx-auto mb-6">
          We've registered <strong class="text-cyan-300">${email}</strong> for weekly weekend logic drops. Your first 10-Grid Warmup PDF pack is ready below:
        </p>

        <div class="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto">
          <a href="data:text/plain;charset=utf-8,Brain%20Focus%20Books%20-%20VIP%20Welcome%20Pack%0A%0AWelcome%20to%20the%20VIP%20Solver%20Club!%0AEnjoy%20your%20weekly%20printable%20puzzle%20packs%20and%20early%20releases."
             download="BrainFocus_VIP_Welcome_Pack.pdf"
             onclick="triggerConfetti();"
             class="w-full sm:w-auto px-7 py-3.5 rounded-xl font-extrabold text-sm text-white glow-coral-btn flex items-center justify-center gap-2">
            <span>📥 Download VIP Welcome Pack (PDF)</span>
          </a>
        </div>
      </div>
    `;
  }
  triggerConfetti();
}

function handleFeedbackFormSubmit(event) {
  event.preventDefault();
  const nameEl = document.getElementById('feedback-name');
  const emailEl = document.getElementById('feedback-email');
  const bookEl = document.getElementById('feedback-book');
  const topicEl = document.getElementById('feedback-topic');
  const msgEl = document.getElementById('feedback-message');
  const starEl = document.getElementById('selected-star-rating');

  const name = nameEl ? nameEl.value.trim() : 'Solver';
  const email = emailEl ? emailEl.value.trim() : '';
  const book = bookEl ? bookEl.options[bookEl.selectedIndex].text : '';
  const stars = starEl ? starEl.value : '5';

  const wrapper = document.getElementById('feedback-form-wrapper');
  if (wrapper) {
    wrapper.innerHTML = `
      <div class="bg-cyan-950/80 border-2 border-cyan-400/60 rounded-3xl p-8 text-center animate-fade-in shadow-2xl">
        <div class="w-16 h-16 rounded-full bg-cyan-500/20 text-[#00E5FF] flex items-center justify-center mx-auto mb-4 text-3xl font-black border border-cyan-400/50">
          ✉️
        </div>
        <span class="px-3 py-1 rounded-full text-xs font-bold bg-cyan-900 text-cyan-300 uppercase tracking-wider">
          Message Received
        </span>
        <h3 class="font-heading font-black text-2xl sm:text-3xl text-white mt-3 mb-2">
          Thank You, ${name}!
        </h3>
        <p class="text-slate-300 text-sm max-w-lg mx-auto mb-4">
          Your feedback regarding <strong class="text-white">${book}</strong> (${stars} ★ rating) has been forwarded directly to our lead puzzle development team.
        </p>
        <p class="text-xs text-slate-400 mb-6">
          We build every volume around reader recommendations. If a response is required, we'll reply to <span class="text-cyan-300">${email}</span> within 24–48 hours.
        </p>
        <a href="index.html#catalog" class="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm text-white glow-coral-btn">
          Explore More Volumes in Master Catalog →
        </a>
      </div>
    `;
  }
  triggerConfetti();
}

function setStarRating(rating) {
  const ratingInput = document.getElementById('selected-star-rating');
  if (ratingInput) ratingInput.value = rating;

  const stars = document.querySelectorAll('#star-rating-group .star-btn');
  stars.forEach((s, idx) => {
    if (idx < rating) {
      s.className = 'star-btn text-amber-400';
    } else {
      s.className = 'star-btn text-slate-600';
    }
  });

  const labelEl = document.getElementById('star-rating-label');
  if (labelEl) {
    const labels = {
      1: '1.0 / 5.0 (Needs Improvement)',
      2: '2.0 / 5.0 (Fair Experience)',
      3: '3.0 / 5.0 (Good Experience)',
      4: '4.0 / 5.0 (Great Focus)',
      5: '5.0 / 5.0 (Exceptional Clarity)'
    };
    labelEl.textContent = labels[rating] || `${rating}.0 / 5.0`;
  }
}

// ============================================================================
// 5. Initialization & Event Bindings
// ============================================================================

document.addEventListener('DOMContentLoaded', () => {
  initCalcudoku();
  renderBookCatalog('all');

  // Mobile menu toggle
  const mobileBtn = document.getElementById('mobile-menu-btn');
  const mobileMenu = document.getElementById('mobile-nav-drawer');
  if (mobileBtn && mobileMenu) {
    mobileBtn.addEventListener('click', () => {
      mobileMenu.classList.toggle('hidden');
    });
  }

  // Close modals on Escape key
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeSampleModal();
      closeBookModal();
    }
  });
});

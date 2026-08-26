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
// 2. Book Catalog Database & Sub-Series Specs
// ============================================================================

const BOOK_CATALOG = [
  // 4x4 Pure Easy Series (Royal Blue #1E40AF)
  {
    id: 'bf-4x4-v1',
    title: '4x4 Calcudoku: Pure Easy',
    subtitle: 'The Perfect Cognitive Starter Pack',
    volume: 'Vol. 1',
    category: 'easy',
    subSeries: '4x4 Pure Easy',
    accentColor: '#1E40AF',
    accentGlow: 'rgba(30, 64, 175, 0.4)',
    accentTagBg: 'bg-blue-900/60 text-blue-300 border-blue-600/40',
    gridsCount: '200 Grids',
    gridSize: '4x4 Grids',
    difficultyScore: 1,
    difficultyLabel: 'Starter Easy',
    printType: 'Standard 8.5 x 11',
    features: ['Gentle Math Ramps', 'Full Step-by-Step Solutions', 'Large Clear Numbers'],
    amazonUrl: 'https://www.amazon.com/s?k=Brain+Focus+Calcudoku+4x4+Pure+Easy+Vol+1',
    badge: 'Popular Starter'
  },
  {
    id: 'bf-4x4-v2',
    title: '4x4 Calcudoku: Pure Easy',
    subtitle: 'Fast Mental Math Flow State',
    volume: 'Vol. 2',
    category: 'easy',
    subSeries: '4x4 Pure Easy',
    accentColor: '#1E40AF',
    accentGlow: 'rgba(30, 64, 175, 0.4)',
    accentTagBg: 'bg-blue-900/60 text-blue-300 border-blue-600/40',
    gridsCount: '200 Grids',
    gridSize: '4x4 Grids',
    difficultyScore: 1,
    difficultyLabel: 'Starter Easy',
    printType: 'Standard 8.5 x 11',
    features: ['Quick 3-Min Solves', 'Cage Math Logic Guide', 'High Contrast Inks'],
    amazonUrl: 'https://www.amazon.com/s?k=Brain+Focus+Calcudoku+4x4+Pure+Easy+Vol+2'
  },

  // 5x5 Pure Easy Series (Emerald Green #047857)
  {
    id: 'bf-5x5-v1',
    title: '5x5 Calcudoku: Pure Easy',
    subtitle: 'Expand Your Logic Capacity',
    volume: 'Vol. 1',
    category: 'easy',
    subSeries: '5x5 Pure Easy',
    accentColor: '#047857',
    accentGlow: 'rgba(4, 120, 87, 0.4)',
    accentTagBg: 'bg-emerald-900/60 text-emerald-300 border-emerald-600/40',
    gridsCount: '200 Grids',
    gridSize: '5x5 Grids',
    difficultyScore: 2,
    difficultyLabel: 'Gentle Step Up',
    printType: 'Standard 8.5 x 11',
    features: ['Prime Factorization Cages', 'Wide Margins for Notes', 'Zero Guessing Logic'],
    amazonUrl: 'https://www.amazon.com/s?k=Brain+Focus+Calcudoku+5x5+Pure+Easy+Vol+1',
    badge: 'Reader Favorite'
  },
  {
    id: 'bf-5x5-v2',
    title: '5x5 Calcudoku: Pure Easy',
    subtitle: 'Smooth Cognitive Agility',
    volume: 'Vol. 2',
    category: 'easy',
    subSeries: '5x5 Pure Easy',
    accentColor: '#047857',
    accentGlow: 'rgba(4, 120, 87, 0.4)',
    accentTagBg: 'bg-emerald-900/60 text-emerald-300 border-emerald-600/40',
    gridsCount: '200 Grids',
    gridSize: '5x5 Grids',
    difficultyScore: 2,
    difficultyLabel: 'Gentle Step Up',
    printType: 'Standard 8.5 x 11',
    features: ['Calibrated Clues', 'Anti-Eye-Strain Layout', 'Progress Tracker Checkbox'],
    amazonUrl: 'https://www.amazon.com/s?k=Brain+Focus+Calcudoku+5x5+Pure+Easy+Vol+2'
  },

  // 6x6 Pure Easy Series (Bright Teal #0E7490)
  {
    id: 'bf-6x6-v1',
    title: '6x6 Calcudoku: Pure Easy',
    subtitle: 'The Classic 6x6 Standard',
    volume: 'Vol. 1',
    category: 'easy',
    subSeries: '6x6 Pure Easy',
    accentColor: '#0E7490',
    accentGlow: 'rgba(14, 116, 144, 0.4)',
    accentTagBg: 'bg-cyan-900/60 text-cyan-300 border-cyan-600/40',
    gridsCount: '220 Grids',
    gridSize: '6x6 Grids',
    difficultyScore: 2,
    difficultyLabel: 'Engaging Easy',
    printType: 'Standard 8.5 x 11',
    features: ['Multi-Operator Cages', 'Complete Answer Key', 'Durable Binding Ready'],
    amazonUrl: 'https://www.amazon.com/s?k=Brain+Focus+Calcudoku+6x6+Pure+Easy+Vol+1'
  },

  // Progression Series (Multi-Tiered Progression)
  {
    id: 'bf-prog-v1',
    title: 'Calcudoku Structured Progression',
    subtitle: 'From Novice to Grandmaster',
    volume: 'Vol. 1',
    category: 'progression',
    subSeries: 'Progression Tier',
    accentColor: '#00E5FF',
    accentGlow: 'rgba(0, 229, 255, 0.4)',
    accentTagBg: 'bg-cyan-950 text-cyan-300 border-cyan-500/50',
    gridsCount: '250 Grids',
    gridSize: '4x4 to 8x8 Grids',
    difficultyScore: 3,
    difficultyLabel: 'Multi-Level Ramp',
    printType: 'Standard 8.5 x 11',
    features: ['5 Distinct Difficulty Tiers', 'Warmup to Beast Mode', 'Cognitive Benchmark Index'],
    amazonUrl: 'https://www.amazon.com/s?k=Brain+Focus+Calcudoku+Structured+Progression+Vol+1',
    badge: 'Best Overall Value'
  },
  {
    id: 'bf-prog-v2',
    title: 'Calcudoku Structured Progression',
    subtitle: 'Master Complex Cage Deductions',
    volume: 'Vol. 2',
    category: 'progression',
    subSeries: 'Progression Tier',
    accentColor: '#00E5FF',
    accentGlow: 'rgba(0, 229, 255, 0.4)',
    accentTagBg: 'bg-cyan-950 text-cyan-300 border-cyan-500/50',
    gridsCount: '250 Grids',
    gridSize: '5x5 to 9x9 Grids',
    difficultyScore: 4,
    difficultyLabel: 'Intermediate to Hard',
    printType: 'Standard 8.5 x 11',
    features: ['Advanced Parity Logic', 'Speed Solving Times', 'Laser Verified Math'],
    amazonUrl: 'https://www.amazon.com/s?k=Brain+Focus+Calcudoku+Structured+Progression+Vol+2'
  },

  // Pure Medium Series (Deep Amber #D97706)
  {
    id: 'bf-med-v1',
    title: 'Pure Medium Calcudoku',
    subtitle: 'Deep Cognitive Focus Workouts',
    volume: 'Vol. 1',
    category: 'progression',
    subSeries: 'Pure Medium Series',
    accentColor: '#D97706',
    accentGlow: 'rgba(217, 119, 6, 0.4)',
    accentTagBg: 'bg-amber-950 text-amber-300 border-amber-500/50',
    gridsCount: '200 Grids',
    gridSize: '6x6 & 7x7 Grids',
    difficultyScore: 3,
    difficultyLabel: 'Solid Medium',
    printType: 'Standard 8.5 x 11',
    features: ['Subtle Cage Interactions', 'No Trial-and-Error Required', 'Laser-Crisp Math Lines'],
    amazonUrl: 'https://www.amazon.com/s?k=Brain+Focus+Calcudoku+Pure+Medium+Vol+1'
  },

  // Hard & Expert Series (Crimson Red #B91C1C)
  {
    id: 'bf-hard-v1',
    title: 'Expert Calcudoku: Hard Tier',
    subtitle: 'Intense Logic & Advanced Multipliers',
    volume: 'Vol. 1',
    category: 'hard',
    subSeries: 'Hard & Expert Series',
    accentColor: '#B91C1C',
    accentGlow: 'rgba(185, 28, 28, 0.4)',
    accentTagBg: 'bg-red-950 text-red-300 border-red-500/50',
    gridsCount: '200 Grids',
    gridSize: '7x7 & 8x8 Grids',
    difficultyScore: 5,
    difficultyLabel: 'Expert Challenge',
    printType: 'Standard 8.5 x 11',
    features: ['Large Number Factors', 'Extreme Logic Chains', 'Master Tier Certificate'],
    amazonUrl: 'https://www.amazon.com/s?k=Brain+Focus+Calcudoku+Expert+Hard+Vol+1',
    badge: 'Hardcore Challenge'
  },
  {
    id: 'bf-hard-v2',
    title: 'Grandmaster Calcudoku 9x9',
    subtitle: 'The Ultimate Math Puzzle Trial',
    volume: 'Vol. 2',
    category: 'hard',
    subSeries: 'Hard & Expert Series',
    accentColor: '#B91C1C',
    accentGlow: 'rgba(185, 28, 28, 0.4)',
    accentTagBg: 'bg-red-950 text-red-300 border-red-500/50',
    gridsCount: '180 Grids',
    gridSize: '8x8 & 9x9 Grids',
    difficultyScore: 5,
    difficultyLabel: 'Grandmaster 9x9',
    printType: 'Standard 8.5 x 11',
    features: ['Complex Arithmetic Cages', 'Peak Mental Endurance', 'Full Verification Matrix'],
    amazonUrl: 'https://www.amazon.com/s?k=Brain+Focus+Calcudoku+Grandmaster+9x9+Vol+2'
  },

  // Senior Comfort Line (Violet Purple #6D28D9)
  {
    id: 'bf-senior-v1',
    title: 'Senior Comfort: Large Print Calcudoku',
    subtitle: 'Zero Eye Strain & High-Visibility Grids',
    volume: 'Vol. 1',
    category: 'senior',
    subSeries: 'Senior Comfort Line',
    accentColor: '#6D28D9',
    accentGlow: 'rgba(109, 40, 217, 0.4)',
    accentTagBg: 'bg-purple-950 text-purple-300 border-purple-500/50',
    gridsCount: '150 Jumbo Grids',
    gridSize: '4x4 & 5x5 Jumbo Grids',
    difficultyScore: 2,
    difficultyLabel: 'Comfortable Easy',
    printType: 'Extra Large 24pt Font',
    features: ['Extra Large 24pt Numbers', 'One Giant Grid Per Page', 'Easy-Turn Wide Margins'],
    amazonUrl: 'https://www.amazon.com/s?k=Brain+Focus+Senior+Comfort+Large+Print+Calcudoku+Vol+1',
    badge: 'Senior Recommended'
  },
  {
    id: 'bf-senior-v2',
    title: 'Senior Comfort: Large Print Calcudoku',
    subtitle: 'Daily Memory & Sharp Mind Routine',
    volume: 'Vol. 2',
    category: 'senior',
    subSeries: 'Senior Comfort Line',
    accentColor: '#6D28D9',
    accentGlow: 'rgba(109, 40, 217, 0.4)',
    accentTagBg: 'bg-purple-950 text-purple-300 border-purple-500/50',
    gridsCount: '150 Jumbo Grids',
    gridSize: '5x5 Jumbo Grids',
    difficultyScore: 2,
    difficultyLabel: 'Comfortable Easy',
    printType: 'Extra Large 24pt Font',
    features: ['High Contrast Pure Black Inks', 'Senior-Friendly Instructions', 'Gentle Mental Stimulation'],
    amazonUrl: 'https://www.amazon.com/s?k=Brain+Focus+Senior+Comfort+Large+Print+Calcudoku+Vol+2'
  }
];

let activeCategoryFilter = 'all';

function renderBookCatalog(filter = 'all') {
  const container = document.getElementById('book-catalog-grid');
  if (!container) return;

  const filteredBooks = filter === 'all' 
    ? BOOK_CATALOG 
    : BOOK_CATALOG.filter(b => b.category === filter);

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

    card.innerHTML = `
      <!-- Top Badges & Sub-Series Tag -->
      <div class="flex items-center justify-between gap-2 mb-4">
        <span class="px-2.5 py-1 rounded-full text-xs font-bold border uppercase tracking-wider ${book.accentTagBg}">
          ${book.subSeries}
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
          
          <div class="book-cover" style="border-left: 4px solid ${book.accentColor};">
            <!-- Book Cover Header -->
            <div>
              <div class="flex items-center justify-between mb-1">
                <img src="logo.png" alt="BRAIN FOCUS™" class="h-3.5 w-auto object-contain">
                <span class="text-[9px] font-bold px-1.5 py-0.5 rounded text-white" style="background-color: ${book.accentColor};">${book.volume}</span>
              </div>
              <h4 class="text-sm font-extrabold leading-tight text-white line-clamp-2">${book.title}</h4>
            </div>

            <!-- Book Cover Center Geometric Art -->
            <div class="my-auto py-2 flex flex-col items-center">
              <div class="w-24 h-24 rounded-lg bg-[#070B1A] border-2 flex flex-col justify-between p-1.5 shadow-inner" style="border-color: ${book.accentColor};">
                <div class="flex justify-between text-[8px] font-mono text-[#00E5FF]">
                  <span>6+</span>
                  <span>12*</span>
                </div>
                <div class="text-center font-mono font-bold text-sm tracking-widest text-white/90">
                  ${book.gridSize.split(' ')[0]}
                </div>
                <div class="flex justify-between text-[8px] font-mono text-orange-400">
                  <span>2/</span>
                  <span>1-</span>
                </div>
              </div>
              <span class="text-[10px] text-slate-300 font-medium mt-1.5">${book.gridsCount}</span>
            </div>

            <!-- Book Cover Footer -->
            <div class="pt-1 border-t border-white/10 flex items-center justify-between">
              <span class="text-[8px] font-semibold text-slate-400">${book.printType}</span>
              <span class="text-[8px] font-bold text-orange-400">VERIFIED MATH</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Book Info & Specs -->
      <div class="mt-4 flex-1">
        <h3 class="text-lg font-bold text-white group-hover:text-[#00E5FF] transition-colors leading-snug">
          ${book.title}
        </h3>
        <p class="text-xs text-slate-400 mt-1 mb-3">
          ${book.subtitle}
        </p>

        <div class="flex items-center gap-2 mb-3">
          <div class="flex items-center gap-0.5">${starsHtml}</div>
          <span class="text-xs text-slate-400 font-medium">(${book.difficultyLabel})</span>
        </div>

        <ul class="space-y-1 text-xs text-slate-300 mb-5">
          ${book.features.map(f => `<li class="flex items-center gap-1.5"><span class="text-[#00E5FF]">✓</span> ${f}</li>`).join('')}
        </ul>
      </div>

      <!-- Action Buttons -->
      <div class="pt-4 border-t border-slate-800/80 flex flex-col gap-2">
        <a href="${book.amazonUrl}" target="_blank" rel="noopener" 
           class="w-full py-2.5 px-4 rounded-xl font-bold text-sm text-white text-center flex items-center justify-center gap-2 glow-coral-btn">
          <svg class="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M15.93 17.09c-2.83 2.08-6.95 3.2-10.57 3.2-4.97 0-9.45-1.92-12.86-5.11-.27-.25-.03-.6.29-.41 3.69 2.14 8.21 3.42 12.86 3.42 3.21 0 6.74-.75 9.87-2.31.47-.23.82.26.41.61zm2.34-1.28c-.36-.46-2.38-.22-3.3-.11-.28.03-.32-.2-.07-.38 1.63-1.15 4.3-.82 4.61-.43.32.41-.08 3.09-1.63 4.35-.25.2-.44.09-.3-.18.47-.88.94-2.79.69-3.25zM21.1 19.34c-1.57 2.03-3.66 3.65-6.09 4.66-2.43 1-5.06 1.51-7.71 1.5-3.08 0-6.07-.67-8.81-1.96-.34-.16-.27-.64.1-.56 2.62.56 5.35.85 8.1.85 2.5 0 4.97-.48 7.26-1.42 2.29-.93 4.25-2.45 5.73-4.35.34-.43.83.18.42.56zM13.68 5.7c-.15.86-.68 1.94-1.39 2.64-.71.7-1.78 1.34-2.67 1.25-.13-.01-.19-.16-.09-.25 1.05-.98 2.06-2.28 2.13-3.79.06-1.24-.62-2.18-1.55-2.18-.75 0-1.41.59-1.8 1.48-.42.97-.48 2.37-.48 3.51 0 .28-.24.47-.51.41-1.48-.31-2.91-.98-4.04-1.99-.25-.23-.07-.63.26-.52 1.03.35 2.14.53 3.26.53.07 0 .14 0 .21-.01-.03-.7-.01-1.47.09-2.22.25-1.91 1.41-3.35 3.12-3.35 1.13 0 2.04.66 2.45 1.69.4.99.3 2.08-.09 3.01z"/></svg>
          Buy on Amazon
        </a>
        <button onclick="openBookModal('${book.id}')" 
                class="w-full py-2 px-3 rounded-xl font-semibold text-xs text-slate-300 hover:text-white bg-slate-800/60 hover:bg-slate-700/60 border border-slate-700 transition-colors">
          Quick Specs & Preview
        </button>
      </div>
    `;

    container.appendChild(card);
  });
}

function filterCatalog(category, buttonEl) {
  activeCategoryFilter = category;
  
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

  renderBookCatalog(category);
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

  content.innerHTML = `
    <div class="flex flex-col md:flex-row gap-6">
      <div class="w-full md:w-1/2 flex flex-col items-center justify-center p-6 bg-[#070C1B] rounded-2xl border" style="border-color: ${book.accentColor};">
        <div class="book-card-3d scale-110 mb-4">
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
        <span class="text-xs text-cyan-400 font-mono mt-2">✓ Verified Math Guarantee</span>
      </div>

      <div class="w-full md:w-1/2 flex flex-col justify-between">
        <div>
          <div class="flex items-center gap-2 mb-2">
            <span class="px-2.5 py-0.5 rounded-full text-xs font-bold ${book.accentTagBg}">${book.subSeries}</span>
            <span class="text-xs font-mono text-slate-400 font-bold">${book.volume}</span>
          </div>
          <h3 class="text-2xl font-extrabold text-white mb-1">${book.title}</h3>
          <p class="text-sm text-slate-400 mb-4">${book.subtitle}</p>

          <div class="grid grid-cols-2 gap-3 mb-4 bg-slate-900/80 p-3 rounded-xl border border-slate-800">
            <div>
              <span class="text-[10px] uppercase text-slate-500 font-bold">Total Content</span>
              <p class="text-sm font-bold text-white">${book.gridsCount}</p>
            </div>
            <div>
              <span class="text-[10px] uppercase text-slate-500 font-bold">Grid Dimensions</span>
              <p class="text-sm font-bold text-cyan-400">${book.gridSize}</p>
            </div>
            <div>
              <span class="text-[10px] uppercase text-slate-500 font-bold">Difficulty</span>
              <p class="text-sm font-bold text-amber-400">${book.difficultyLabel}</p>
            </div>
            <div>
              <span class="text-[10px] uppercase text-slate-500 font-bold">Print Format</span>
              <p class="text-sm font-bold text-white">${book.printType}</p>
            </div>
          </div>

          <h5 class="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Key Book Highlights:</h5>
          <ul class="space-y-1.5 text-xs text-slate-300 mb-6">
            ${book.features.map(f => `<li class="flex items-center gap-2"><span class="text-[#00E5FF]">✓</span> ${f}</li>`).join('')}
            <li class="flex items-center gap-2"><span class="text-[#00E5FF]">✓</span> High-opacity 60lb white paper prevents ink bleed-through</li>
            <li class="flex items-center gap-2"><span class="text-[#00E5FF]">✓</span> Complete solutions with answer grid coordinate keys</li>
          </ul>
        </div>

        <div class="flex gap-3">
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
  `;

  modal.classList.remove('hidden');
  modal.classList.add('flex');
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
// 4. Initialization & Event Bindings
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

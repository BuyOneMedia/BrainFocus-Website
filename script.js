/**
 * Brain Focus Books - Website Script
 * Powers the Etsy product grid, featured items, category filters, search,
 * mobile navigation, feedback mailto helper, and playable puzzle page.
 */

const FEATURED_LISTING_IDS = [
  4608574821, // Logic Puzzles for Kids (best seller)
  4612741320, // Christmas Logic Puzzles for Kids (new)
  4605994741, // Christmas Word Search, 100 Large Print
  4608583764, // Large Print Christmas Crosswords
  4606669270, // Giant Christmas Word Search, a party poster
  4608237017, // Cozy Christmas Coloring Book for Adults
  4608383521, // Christmas Activities for Seniors
  4606014110  // Large Print Puzzle Bundle, 500 puzzles
];

let allProducts = [];
let activeSection = 'all';
let searchQuery = '';

function formatPrice(price) {
  return '$' + Number(price).toFixed(2);
}

function escapeHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function createProductCardHtml(product, badgeText = '') {
  const shortTitle = escapeHtml(product.short_title);
  const fullTitle = escapeHtml(product.title);
  const section = escapeHtml(product.section);
  const priceStr = formatPrice(product.price);
  const url = escapeHtml(product.url);
  const image = escapeHtml(product.image);

  const badgeMarkup = badgeText
    ? `<span class="inline-block px-2.5 py-0.5 rounded-full text-xs font-bold bg-orange-100 text-orange-800 border border-orange-200 mb-2">${escapeHtml(badgeText)}</span>`
    : `<span class="inline-block text-xs font-semibold text-brandTeal mb-1.5">${section}</span>`;

  return `
    <article class="product-card p-4 flex flex-col justify-between h-full">
      <div>
        <a href="${url}" target="_blank" rel="noopener" class="block aspect-square rounded-xl overflow-hidden bg-stone-100 border border-stone-200 mb-3.5 group">
          <img src="${image}"
               alt="${shortTitle} - ${section} printable PDF"
               loading="lazy"
               class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300">
        </a>
        ${badgeMarkup}
        <h3 class="font-heading font-bold text-base sm:text-lg text-slate-900 leading-snug mb-2" title="${fullTitle}">
          <a href="${url}" target="_blank" rel="noopener" class="hover:text-brandTeal transition-colors">
            ${shortTitle}
          </a>
        </h3>
      </div>

      <div class="pt-3 mt-2 border-t border-stone-100 flex items-center justify-between gap-3">
        <span class="font-heading font-extrabold text-lg sm:text-xl text-slate-900">${priceStr}</span>
        <a href="${url}" target="_blank" rel="noopener"
           class="px-4 py-2.5 rounded-xl font-bold text-sm btn-coral inline-flex items-center justify-center gap-1.5 shrink-0">
          <span>View on Etsy</span>
          <span aria-hidden="true">→</span>
        </a>
      </div>
    </article>
  `;
}

function renderFeaturedProducts() {
  const container = document.getElementById('featured-products-grid');
  if (!container || !allProducts.length) return;

  const byId = new Map(allProducts.map(p => [Number(p.listing_id), p]));
  const featured = FEATURED_LISTING_IDS.map(id => byId.get(id)).filter(Boolean);

  container.innerHTML = featured.map((product, index) => {
    let badge = '';
    if (index === 0) badge = 'Best Seller';
    else if (index === 1) badge = 'New for Christmas';
    else badge = 'Holiday Pick';
    return createProductCardHtml(product, badge);
  }).join('');
}

function renderAllProducts() {
  const grid = document.getElementById('all-products-grid');
  const countLabel = document.getElementById('products-count-label');
  const resetBtn = document.getElementById('reset-filters-btn');
  if (!grid) return;

  const q = searchQuery.trim().toLowerCase();

  const filtered = allProducts.filter(product => {
    const matchesSection = activeSection === 'all' || product.section === activeSection;
    if (!matchesSection) return false;
    if (!q) return true;
    const haystack = `${product.short_title} ${product.title} ${product.section}`.toLowerCase();
    return haystack.includes(q);
  });

  if (countLabel) {
    const sectionNote = activeSection === 'all' ? 'all categories' : activeSection;
    if (q) {
      countLabel.textContent = `Showing ${filtered.length} of ${allProducts.length} printables in ${sectionNote} matching "${searchQuery.trim()}"`;
    } else if (activeSection === 'all') {
      countLabel.textContent = `Showing all ${allProducts.length} products`;
    } else {
      countLabel.textContent = `Showing ${filtered.length} printables in ${activeSection}`;
    }
  }

  if (resetBtn) {
    if (activeSection !== 'all' || q.length > 0) {
      resetBtn.classList.remove('hidden');
    } else {
      resetBtn.classList.add('hidden');
    }
  }

  if (filtered.length === 0) {
    grid.innerHTML = `
      <div class="col-span-full bg-white rounded-2xl p-10 text-center border border-stone-200">
        <p class="text-lg font-bold text-slate-800 mb-2">No matching printables found</p>
        <p class="text-base text-slate-600 mb-5">Try a different search word or view all categories.</p>
        <button type="button" onclick="resetProductFilters()" class="px-5 py-2.5 rounded-xl font-bold text-sm btn-teal">
          Show all 104 products
        </button>
      </div>
    `;
    return;
  }

  grid.innerHTML = filtered.map(product => createProductCardHtml(product)).join('');
}

function selectCategoryFilter(sectionName) {
  activeSection = sectionName || 'all';

  const buttons = document.querySelectorAll('#section-filter-bar .filter-pill');
  buttons.forEach(btn => {
    if (btn.dataset.section === activeSection) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  renderAllProducts();
}

function resetProductFilters() {
  activeSection = 'all';
  searchQuery = '';
  const searchInput = document.getElementById('product-search');
  if (searchInput) searchInput.value = '';
  selectCategoryFilter('all');
}

async function loadEtsyProducts() {
  const hasProductGrids = document.getElementById('all-products-grid') || document.getElementById('featured-products-grid');
  if (!hasProductGrids) return;

  try {
    const response = await fetch('etsy-products.json');
    if (!response.ok) throw new Error('HTTP ' + response.status);
    const data = await response.json();
    if (data && Array.isArray(data.products)) {
      allProducts = data.products;
      renderFeaturedProducts();
      renderAllProducts();
    }
  } catch (err) {
    console.error('Could not load etsy-products.json:', err);
  }
}

function closeMobileMenu() {
  const mobileMenu = document.getElementById('mobile-nav-drawer');
  const mobileBtn = document.getElementById('mobile-menu-btn');
  if (mobileMenu) mobileMenu.classList.add('hidden');
  if (mobileBtn) mobileBtn.setAttribute('aria-expanded', 'false');
}

// ============================================================================
// Honest Feedback Mailto Helper (feedback.html)
// Opens the visitor's email client with pre-filled subject and body instead
// of pretending to submit to a backend.
// ============================================================================

function handleFeedbackMailto(event) {
  event.preventDefault();
  const nameEl = document.getElementById('feedback-name');
  const topicEl = document.getElementById('feedback-topic');
  const msgEl = document.getElementById('feedback-message');

  const name = nameEl ? nameEl.value.trim() : '';
  const topic = topicEl ? topicEl.options[topicEl.selectedIndex].text : 'Website Feedback';
  const message = msgEl ? msgEl.value.trim() : '';

  const subject = encodeURIComponent(`Brain Focus Books Feedback: ${topic}`);
  const bodyLines = [
    name ? `From: ${name}` : '',
    `Topic: ${topic}`,
    '',
    message
  ].filter(Boolean).join('\n');

  window.location.href = `mailto:publisher@brainfocusbooks.com?subject=${subject}&body=${encodeURIComponent(bodyLines)}`;
}

// ============================================================================
// Playable 4x4 Calcudoku Mini-Puzzle (puzzles.html)
// ============================================================================

const CALCUDOKU_PUZZLES = {
  beginner: {
    name: 'Warm-Up 4x4',
    gridSize: 4,
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
    name: 'Medium 4x4',
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
    name: 'Tricky 4x4',
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
      { id: 'c4', label: '5+', op: '+', target: 5, cells: [[1, 0], [2, 0]] },
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
  const gridContainer = document.getElementById('calcudoku-grid');
  if (!gridContainer) return;

  const currentPuzzle = CALCUDOKU_PUZZLES[currentPuzzleKey];
  userGrid = Array(4).fill(null).map(() => Array(4).fill(null));
  renderGrid(currentPuzzle);
  setupGridEvents();
  updateGameStatus('Click a box and enter a number from 1 to 4.');
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

      const cage = puzzle.cages.find(cg => cg.cells.some(([cr, cc]) => cr === r && cc === c));
      if (cage) {
        const isFirstCell = cage.cells[0][0] === r && cage.cells[0][1] === c;
        if (isFirstCell) {
          const labelEl = document.createElement('span');
          labelEl.className = 'cage-label';
          labelEl.textContent = cage.label;
          cellEl.appendChild(labelEl);
        }
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

  cellEl.classList.add(hasTop ? 'border-top-thin' : 'border-top-thick');
  cellEl.classList.add(hasBottom ? 'border-bottom-thin' : 'border-bottom-thick');
  cellEl.classList.add(hasLeft ? 'border-left-thin' : 'border-left-thick');
  cellEl.classList.add(hasRight ? 'border-right-thin' : 'border-right-thick');
}

function setupGridEvents() {
  const gridContainer = document.getElementById('calcudoku-grid');
  if (!gridContainer || gridContainer.dataset.bound === 'true') return;
  gridContainer.dataset.bound = 'true';

  gridContainer.addEventListener('click', (e) => {
    const cell = e.target.closest('.calcudoku-cell');
    if (!cell) return;
    selectCell(parseInt(cell.dataset.row, 10), parseInt(cell.dataset.col, 10));
  });
}

function selectCell(r, c) {
  selectedCell = { r, c };
  const cells = document.querySelectorAll('.calcudoku-cell');
  const targetVal = userGrid[r][c];

  cells.forEach(cell => {
    const cr = parseInt(cell.dataset.row, 10);
    const cc = parseInt(cell.dataset.col, 10);
    cell.classList.remove('selected', 'same-num');
    if (cr === r && cc === c) {
      cell.classList.add('selected');
    } else if (targetVal && userGrid[cr][cc] === targetVal) {
      cell.classList.add('same-num');
    }
  });
}

function enterNumber(num) {
  if (!document.getElementById('calcudoku-grid')) return;
  const { r, c } = selectedCell;
  userGrid[r][c] = num;
  renderGrid(CALCUDOKU_PUZZLES[currentPuzzleKey]);
  selectCell(r, c);

  const isFull = userGrid.every(row => row.every(val => val !== null));
  if (isFull) checkCalcudokuSolution(false);
}

function clearCurrentCell() {
  if (!document.getElementById('calcudoku-grid')) return;
  const { r, c } = selectedCell;
  userGrid[r][c] = null;
  renderGrid(CALCUDOKU_PUZZLES[currentPuzzleKey]);
  selectCell(r, c);
}

function validateCageMath(cage, values) {
  const { op, target } = cage;
  if (op === '=') return values[0] === target;
  if (op === '+') return values.reduce((a, b) => a + b, 0) === target;
  if (op === '*') return values.reduce((a, b) => a * b, 1) === target;
  if (op === '-') return values.length === 2 && Math.abs(values[0] - values[1]) === target;
  if (op === '/') {
    if (values.length !== 2) return false;
    return Math.max(values[0], values[1]) / Math.min(values[0], values[1]) === target;
  }
  return true;
}

function highlightCellError(r, c) {
  const cell = document.querySelector(`.calcudoku-cell[data-row="${r}"][data-col="${c}"]`);
  if (cell) cell.classList.add('error');
}

function checkCalcudokuSolution(explicitCheck = true) {
  const puzzle = CALCUDOKU_PUZZLES[currentPuzzleKey];
  let hasErrors = false;
  let unfilled = 0;
  const cells = document.querySelectorAll('.calcudoku-cell');
  cells.forEach(c => c.classList.remove('error', 'correct'));

  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      const val = userGrid[r][c];
      if (!val) {
        unfilled++;
        continue;
      }
      for (let c2 = 0; c2 < 4; c2++) {
        if (c !== c2 && userGrid[r][c2] === val) {
          highlightCellError(r, c);
          highlightCellError(r, c2);
          hasErrors = true;
        }
      }
      for (let r2 = 0; r2 < 4; r2++) {
        if (r !== r2 && userGrid[r2][c] === val) {
          highlightCellError(r, c);
          highlightCellError(r2, c);
          hasErrors = true;
        }
      }
    }
  }

  puzzle.cages.forEach(cage => {
    const cageValues = cage.cells.map(([r, c]) => userGrid[r][c]);
    if (cageValues.every(v => v !== null) && !validateCageMath(cage, cageValues)) {
      cage.cells.forEach(([r, c]) => highlightCellError(r, c));
      hasErrors = true;
    }
  });

  if (hasErrors) {
    updateGameStatus('Check highlighted boxes: a row, column, or cage clue does not match yet.', 'text-red-700 font-semibold');
  } else if (unfilled > 0) {
    if (explicitCheck) {
      updateGameStatus(`Looking good so far! ${16 - unfilled} of 16 boxes filled.`, 'text-brandTeal font-semibold');
    }
  } else {
    cells.forEach(c => c.classList.add('correct'));
    updateGameStatus('🎉 Well done! You solved the puzzle!', 'text-emerald-700 font-bold');
  }
}

function giveHint() {
  const puzzle = CALCUDOKU_PUZZLES[currentPuzzleKey];
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      if (userGrid[r][c] !== puzzle.solution[r][c]) {
        userGrid[r][c] = puzzle.solution[r][c];
        renderGrid(puzzle);
        selectCell(r, c);
        updateGameStatus(`Hint: placed ${puzzle.solution[r][c]} in row ${r + 1}, column ${c + 1}.`, 'text-brandTeal font-semibold');
        return;
      }
    }
  }
  updateGameStatus('All boxes are already filled in!', 'text-emerald-700 font-semibold');
}

function resetPuzzle() {
  userGrid = Array(4).fill(null).map(() => Array(4).fill(null));
  renderGrid(CALCUDOKU_PUZZLES[currentPuzzleKey]);
  selectCell(0, 0);
  updateGameStatus('Puzzle cleared. Click any box to start over.');
}

function selectPuzzleDifficulty(difficulty) {
  currentPuzzleKey = difficulty;
  document.querySelectorAll('.puzzle-diff-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  const activeBtn = document.getElementById(`btn-diff-${difficulty}`);
  if (activeBtn) activeBtn.classList.add('active');
  initCalcudoku();
}

function updateGameStatus(msg, textClass = 'text-slate-700') {
  const statusEl = document.getElementById('calcudoku-status');
  if (statusEl) {
    statusEl.className = `mt-4 p-3 rounded-xl bg-stone-100 border border-stone-200 text-center text-sm ${textClass}`;
    statusEl.textContent = msg;
  }
}

// ============================================================================
// Initialization
// ============================================================================

document.addEventListener('DOMContentLoaded', () => {
  loadEtsyProducts();
  initCalcudoku();

  const searchInput = document.getElementById('product-search');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value || '';
      renderAllProducts();
    });
  }

  const mobileBtn = document.getElementById('mobile-menu-btn');
  const mobileMenu = document.getElementById('mobile-nav-drawer');
  if (mobileBtn && mobileMenu) {
    mobileBtn.addEventListener('click', () => {
      const isHidden = mobileMenu.classList.toggle('hidden');
      mobileBtn.setAttribute('aria-expanded', String(!isHidden));
    });
  }

  window.addEventListener('keydown', (e) => {
    if (!document.getElementById('calcudoku-grid')) return;
    if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName)) return;

    if (['1', '2', '3', '4'].includes(e.key)) {
      enterNumber(parseInt(e.key, 10));
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
});

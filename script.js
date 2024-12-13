const ROWS = 30;
const COLS = 30;

// DOM Elements
const gridContainer = document.getElementById('grid-container');
const gridElement = document.getElementById('grid');
const playPauseButton = document.getElementById('play-pause');
const resetButton = document.getElementById('reset');
const speedSelector = document.getElementById('speed');
const saveButton = document.getElementById('save');
const loadButton = document.getElementById('load');
const themeSelector = document.getElementById('theme');
const surviveInput = document.getElementById('survive');
const birthInput = document.getElementById('birth');
const aliveCount = document.getElementById('alive-cells');
const deadCount = document.getElementById('dead-cells');
const generationsCount = document.getElementById('generations');

let grid = [];
let interval = null;
let isPlaying = false;
let speed = parseInt(speedSelector.value);
let generations = 0;
let zoomLevel = 1;
let panX = 0;
let panY = 0;

// Initialize Conway's rules
let surviveRules = [2, 3];
let birthRules = [3];

// Create grid dynamically
function createGrid() {
    grid = [];
    gridElement.innerHTML = '';
    gridElement.style.gridTemplateRows = `repeat(${ROWS}, 1fr)`;
    gridElement.style.gridTemplateColumns = `repeat(${COLS}, 1fr)`;

    for (let row = 0; row < ROWS; row++) {
        const rowCells = [];
        for (let col = 0; col < COLS; col++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            cell.addEventListener('click', () => toggleCell(row, col));
            gridElement.appendChild(cell);
            rowCells.push(false);
        }
        grid.push(rowCells);
    }
}

// Toggle cell state
function toggleCell(row, col) {
    grid[row][col] = !grid[row][col];
    updateGrid();
}

// Update grid visuals
function updateGrid() {
    const cells = gridElement.children;
    let alive = 0;
    let dead = 0;

    for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
            const index = row * COLS + col;
            const isAlive = grid[row][col];
            cells[index].classList.toggle('alive', isAlive);
            isAlive ? alive++ : dead++;
        }
    }

    aliveCount.textContent = alive;
    deadCount.textContent = dead;
    generationsCount.textContent = generations;
}

// Calculate next generation
function nextGeneration() {
    const nextGrid = grid.map(row => [...row]);

    for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
            const aliveNeighbors = countAliveNeighbors(row, col);

            if (grid[row][col]) {
                nextGrid[row][col] = surviveRules.includes(aliveNeighbors);
            } else {
                nextGrid[row][col] = birthRules.includes(aliveNeighbors);
            }
        }
    }

    grid = nextGrid;
    generations++;
    updateGrid();
}

// Count alive neighbors
function countAliveNeighbors(row, col) {
    let count = 0;
    for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
            if (i === 0 && j === 0) continue;
            const newRow = row + i;
            const newCol = col + j;

            if (newRow >= 0 && newRow < ROWS && newCol >= 0 && newCol < COLS) {
                count += grid[newRow][newCol] ? 1 : 0;
            }
        }
    }
    return count;
}

// Play/Pause simulation
function togglePlayPause() {
    if (isPlaying) {
        clearInterval(interval);
        playPauseButton.textContent = 'Play';
    } else {
        interval = setInterval(nextGeneration, speed);
        playPauseButton.textContent = 'Pause';
    }
    isPlaying = !isPlaying;
}

// Reset simulation
function resetSimulation() {
    clearInterval(interval);
    isPlaying = false;
    playPauseButton.textContent = 'Play';
    generations = 0;
    createGrid();
    updateGrid();
}

// Save and Load functionality
function saveState() {
    localStorage.setItem('gameOfLifeState', JSON.stringify(grid));
    alert('State saved!');
}

function loadState() {
    const savedState = localStorage.getItem('gameOfLifeState');
    if (savedState) {
        grid = JSON.parse(savedState);
        updateGrid();
        alert('State loaded!');
    } else {
        alert('No saved state found.');
    }
}

// Handle rules customization
function updateRules() {
    surviveRules = surviveInput.value.split(',').map(Number);
    birthRules = birthInput.value.split(',').map(Number);
}

// Zoom and Pan
function handleZoom(event) {
    const delta = event.deltaY > 0 ? 0.1 : -0.1;
    zoomLevel = Math.max(0.5, Math.min(2, zoomLevel + delta));
    gridElement.style.transform = `scale(${zoomLevel}) translate(${panX}px, ${panY}px)`;
}

function handlePan(event) {
    panX += event.movementX / zoomLevel;
    panY += event.movementY / zoomLevel;
    gridElement.style.transform = `scale(${zoomLevel}) translate(${panX}px, ${panY}px)`;
}

// Event Listeners
gridContainer.addEventListener('wheel', handleZoom);
gridContainer.addEventListener('mousedown', () => gridContainer.addEventListener('mousemove', handlePan));
gridContainer.addEventListener('mouseup', () => gridContainer.removeEventListener('mousemove', handlePan));
playPauseButton.addEventListener('click', togglePlayPause);
resetButton.addEventListener('click', resetSimulation);
saveButton.addEventListener('click', saveState);
loadButton.addEventListener('click', loadState);
speedSelector.addEventListener('change', () => {
    speed = parseInt(speedSelector.value);
    if (isPlaying) {
        clearInterval(interval);
        interval = setInterval(nextGeneration, speed);
    }
});
surviveInput.addEventListener('change', updateRules);
birthInput.addEventListener('change', updateRules);
themeSelector.addEventListener('change', () => {
    document.body.classList.toggle('dark', themeSelector.value === 'dark');
});

// Initialize grid
createGrid();
updateGrid();

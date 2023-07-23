import { GRID_SIZE, BOX_SIZE, convertPositionToIndex, convertIndexToPosition } from "./utilities.js";
import { Sudoku } from "./sudoku.js";

let difficulty = 35

let sudoku = new Sudoku(difficulty);
let cells = document.querySelectorAll('.cell');
let selectedCellIndex;
let selectedCell;
const easy = document.querySelector('.difficult__complexity_easy')
const medium = document.querySelector('.difficult__complexity_medium')
const hard = document.querySelector('.difficult__complexity_hard')
const impossible = document.querySelector('.difficult__complexity_impossible')
const newGame = document.querySelector('.play-again')

easy.addEventListener('click', (e) => {
   removeAllCells()
   difficulty = 25
   sudoku = new Sudoku(difficulty);
   console.log(sudoku)
   init();
   easy.classList.add('disabled')
   impossible.classList.remove('disabled')
   hard.classList.remove('disabled')
   medium.classList.remove('disabled')
})
medium.addEventListener('click', (e) => {
   removeAllCells()
   difficulty = 35
   sudoku = new Sudoku(difficulty);
   console.log(sudoku)
   init();
   medium.classList.add('disabled')
   impossible.classList.remove('disabled')
   hard.classList.remove('disabled')
   easy.classList.remove('disabled')
})
hard.addEventListener('click', (e) => {
   removeAllCells()
   difficulty = 45
   sudoku = new Sudoku(difficulty);
   console.log(sudoku)
   init();
   hard.classList.add('disabled')
   impossible.classList.remove('disabled')
   medium.classList.remove('disabled')
   easy.classList.remove('disabled')
})
impossible.addEventListener('click', (e) => {
   removeAllCells()
   difficulty = 55
   sudoku = new Sudoku(difficulty);
   console.log(sudoku)
   init();
   impossible.classList.add('disabled')
   hard.classList.remove('disabled')
   medium.classList.remove('disabled')
   easy.classList.remove('disabled')
})
newGame.addEventListener('click', (e) => {
   removeAllCells()
   sudoku = new Sudoku(difficulty);
   console.log(sudoku)
   init();
})
init();

function init() {
   initCells();
   initNumbers();
   initRemover();
   initKeyEvent();
}

function initCells() {
   fillCells();
   initCellsEvent();
}

window.addEventListener('click', (e) => {
   if (!e.target.closest('.wrap')) {
      cells.forEach(cell => cell.classList.remove('error', 'zoom', 'highlighted', 'selected'));
      selectedCellIndex = null;
      selectedCell = null;
   }
})

function fillCells() {
   for (let i = 0; i < GRID_SIZE * GRID_SIZE; i++) {
      const { row, column } = convertIndexToPosition(i);

      if (sudoku.grid[row][column] !== null) {
         cells[i].classList.add('filled');
         cells[i].innerHTML = sudoku.grid[row][column];
      }
   }
}

function initCellsEvent() {
   cells.forEach((cell, index) => {
      cell.addEventListener('click', () => onCellClick(cell, index))
   });
}

function onCellClick(clickedCell, index) {
   cells.forEach(cell => cell.classList.remove('highlighted', 'selected', 'error'));

   if (clickedCell.classList.contains('filled')) {
      selectedCellIndex = null;
      selectedCell = null;
   } else {
      selectedCellIndex = index;
      selectedCell = clickedCell;
      clickedCell.classList.add('selected');
      highlightCellsBy(index);
   }

   if (clickedCell.innerHTML === '') return;
   cells.forEach(cell => {
      if (cell.innerHTML === clickedCell.innerHTML) cell.classList.add('selected');
   });
}

function highlightCellsBy(index) {
   highlightColumnBy(index);
   highlightRowBy(index);
   highlightBoxBy(index);
}

function highlightColumnBy(index) {
   const column = index % GRID_SIZE;
   for (let row = 0; row < GRID_SIZE; row++) {
      const cellIndex = convertPositionToIndex(row, column);
      cells[cellIndex].classList.add('highlighted');
   }
}

function highlightRowBy(index) {
   const row = Math.floor(index / GRID_SIZE);
   for (let column = 0; column < GRID_SIZE; column++) {
      const cellIndex = convertPositionToIndex(row, column);
      cells[cellIndex].classList.add('highlighted');
   }
}

function highlightBoxBy(index) {
   const column = index % GRID_SIZE;
   const row = Math.floor(index / GRID_SIZE);
   const firstRowInBox = row - row % BOX_SIZE;
   const firstColumnInBox = column - column % BOX_SIZE;

   for (let iRow = firstRowInBox; iRow < firstRowInBox + BOX_SIZE; iRow++) {
      for (let iColumn = firstColumnInBox; iColumn < firstColumnInBox + BOX_SIZE; iColumn++) {
         const cellIndex = convertPositionToIndex(iRow, iColumn)
         cells[cellIndex].classList.add('highlighted');
      }
   }
}

function initNumbers() {
   const numbers = document.querySelectorAll('.number');
   numbers.forEach((number) => {
      number.addEventListener('click', () => onNumberClick(parseInt(number.innerHTML)))
   });
}

function onNumberClick(number) {
   if (!selectedCell) return;
   if (selectedCell.classList.contains('filled')) return;

   cells.forEach(cell => cell.classList.remove('error', 'zoom', 'shake', 'selected'));
   selectedCell.classList.add('selected');
   setValueInSelectedCell(number);

   if (!sudoku.hasEmptyCells()) {
      setTimeout(() => winAnimation(), 500);
   }
}

function setValueInSelectedCell(value) {
   const { row, column } = convertIndexToPosition(selectedCellIndex);
   const duplicatesPositions = sudoku.getDuplicatePositions(row, column, value);
   if (duplicatesPositions.length) {
      highlightDuplicates(duplicatesPositions);
      return;
   }
   sudoku.grid[row][column] = value;
   selectedCell.innerHTML = value;
   setTimeout(() => selectedCell.classList.add('zoom'), 0);
}

function highlightDuplicates(duplicatesPositions) {
   duplicatesPositions.forEach(duplicate => {
      const index = convertPositionToIndex(duplicate.row, duplicate.column);
      setTimeout(() => cells[index].classList.add('error', 'shake'), 0);
   });
}

function initRemover() {
   const remover = document.querySelector('.remove');
   remover.addEventListener('click', () => onRemoveClick());
}

function onRemoveClick() {
   if (!selectedCell) return;
   if (selectedCell.classList.contains('filled')) return;

   cells.forEach(cell => cell.classList.remove('error', 'zoom', 'shake', 'selected'));
   selectedCell.classList.add('selected');
   const { row, column } = convertIndexToPosition(selectedCellIndex);
   selectedCell.innerHTML = '';
   sudoku.grid[row][column] = null;
}

function initKeyEvent() {
   document.addEventListener('keydown', (event) => {
      if (event.key === 'Backspace') {
         onRemoveClick();
      } else if (event.key >= '1' && event.key <= '9') {
         onNumberClick(parseInt(event.key));
      }
   });
}

function winAnimation() {
   cells.forEach(cell => cell.classList.remove('highlighted', 'selected', 'zoom'));
   cells.forEach((cell, i) => {
      setTimeout(() => cell.classList.add('highlighted', 'zoom'), i * 15);
   });
   for (let i = 1; i < 8; i++) {
      setTimeout(() => cells.forEach(cell => cell.classList.toggle('highlighted')), 500 + cells.length * 15 + 300 * i);
   }
}

function removeAllCells() {
   for (let i = 0; i < GRID_SIZE * GRID_SIZE; i++) {
      cells[i].innerHTML = null;
      cells.forEach(cell => cell.classList.remove('highlighted', 'filled', 'zoom', 'shake', 'selected', 'error'));
   }
}
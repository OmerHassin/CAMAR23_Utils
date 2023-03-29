'use strict'
const MINE_IMG = '💥';
const FLAG_IMG = '🚩';
const NUMS_IMGS = [' ','1️⃣','2️⃣','3️⃣','4️⃣','5️⃣','6️⃣','7️⃣','8️⃣'];

const BEGINNER = {size: 4, mines: 2};
const MEDIUM = {size: 8, mines: 14};
const EXPERT = {size: 12, mines: 32};

const gMines = [];

var gBoard;
var gGame;
var gLevel;
var gLives;
var gIsFirstClicked;
var gMarkedMinesCount;


function onInit() {
    gGame = {
        isOn: true,
        shownCount: 0,
        markedCount: 0,
        secPassed: 0
    };
    
    gLevel = BEGINNER;
    gIsFirstClicked = false;
    gMarkedMinesCount = 0;
    gLives = 2;
    
    gBoard = buildBoard();
    printBoard(gBoard);
    renderBoard(gBoard);
}

function buildBoard() {
    const size = gLevel.size;
    const board = []

    for (var i = 0; i < size; i++) {
        board[i] = [];
        for (var j = 0; j < size; j++) {
            board[i][j] = getCell(i, j);
        }
    }
    // board[0][1].isClicked = true;
    // board[0][2].isClicked = true;
    // board[0][3].isClicked = true;
    // board[1][1].isClicked = true;
    // board[1][2].isClicked = true;
    // board[1][3].isClicked = true;
    // board[2][0].isClicked = true;
    // board[2][1].isClicked = true;
    // board[2][2].isClicked = true;
    // board[2][3].isClicked = true;
    // board[3][0].isClicked = true;
    // board[3][1].isClicked = true;
    // board[3][2].isClicked = true;
    // board[3][3].isClicked = true;
    
    // addRandomMines(board, gLevel.mines);
    board[0][0].isMine = true;
    board[1][2].isMine = true;
    setMinesNegsCount(board);

    return board;
}

function printBoard(board) {
    const res = [];
    
    for(var i = 0; i < board.length; i++){
        res[i] = [];
        for(var j = 0; j < board.length; j++){
            if(board[i][j].isMine){
                res[i][j] = `${board[i][j].isMine} M`;
            }else{
                res[i][j] = board[i][j].isMine;
            }
        }
    }

    console.table(res);
}

function renderBoard(board) {
    var strHTML = '<table>\n<tbody>\n';
    for (var i = 0; i < board.length; i++) {
      strHTML += '<tr>\n';
      for (var j = 0; j < board.length; j++) {
        const className = getClassName(i, j);
  
        strHTML += `<td class="cell ${className}" oncontextmenu="onCellMarked(this,${i},${j})" onclick="onCellClicked(this,${i},${j})">`;
        strHTML += '</td>\n';
      }
      strHTML += '</tr>\n';
    }
    strHTML += '</tbody>\n</table>\n';
  
    const elBoard = document.querySelector('.board');
    elBoard.innerHTML = strHTML;
  }

function setMinesNegsCount(board) {
    for(var i = 0; i < board.length; i++){
        for(var j = 0; j < board.length; j++){
            board[i][j].minesAroundCount = getAmountOfNeighboursContaining(board, i, j);
        }
    }
}

//implement recursion
function expandShown(board, cellI, cellJ) {
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i > board.length - 1) continue;
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (j < 0 || j > board.length - 1 || (i === cellI && j === cellJ)) continue;
            const cell = board[i][j];
            if(!cell.isShown && !cell.isMine && !cell.isMarked){
                cell.isShown = true;
                const elCell = document.querySelector(`.${getClassName(i,j)}`);
                elCell.classList.add('clicked');
                console.log(elCell);
                renderCell({i, j}, NUMS_IMGS[cell.minesAroundCount]);
                // expandShown(board, i, j);
            }
        }
    }
}

//bug: before first right-click - context menu shows
function onCellMarked(elCell, i, j) {
    // console.log(`right i:${i}  right j:${j}`);
    const cell = gBoard[i][j];
    if(cell.isShown) return;
    document.addEventListener('contextmenu', (event) => {event.preventDefault();})
    elCell.classList.toggle('marked');

    renderMarkCell(elCell, cell);
}

function renderMarkCell(elCell, cell) {
    if(elCell.classList.contains('marked')){
        cell.isMarked = true;
        if(cell.isMine) gMarkedMinesCount++;
        elCell.innerHTML = FLAG_IMG;
    }else{
        cell.isMarked = false;
        if(cell.isMine) gMarkedMinesCount--;
        elCell.innerHTML = ''
    }
    // console.log(gMarkedMinesCount);
}

function onCellClicked(elCell, i, j) {
    // console.log(`i: ${i}, j: ${j}`);
    const cell = gBoard[i][j];
    if(elCell.classList.contains('marked')) return;
    if(cell.isShown) return
    if(cell.isMine){
        gLives--;
        gMarkedMinesCount++;
    }
    elCell.classList.toggle('clicked');
    cell.isShown = true;
    const cellImg = (cell.isMine) ? MINE_IMG : NUMS_IMGS[cell.minesAroundCount];
    renderCell({i, j}, cellImg);
    if(!cell.minesAroundCount && !cell.isMine) expandShown(gBoard, i, j);
    checkGameOver();
}

function getCell(cellI, cellJ) {
    return {position: {i: cellI, j: cellJ},
            minesAroundCount: 0,
            isClicked: false,
            isShown: false,
            isMine: false,
            isMarked: false}
}

//make sure I dont get the same location twice!
function addRandomMines(board, numOfMines) {
    for(var i = 0; i < numOfMines; i++){
        const randomLocation = getEmptyLocation(board);
        board[randomLocation.i][randomLocation.j].isMine = true;
        if(!gMines.includes(randomLocation)) gMines.push(randomLocation);
    }
}

function getClassName(i, j) {
    return `cell-${i}-${j}`;
}

function getEmptyLocation(board) {
    var emptyLocations = []
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[0].length; j++) {
            if (!board[i][j].isClicked) {
                emptyLocations.push({ i, j })
            }
        }
    }
    if (!emptyLocations.length) return null
    var randIdx = getRandomInt(0, emptyLocations.length)
    return emptyLocations[randIdx]
}

function checkGameOver() {
    var msg = '';
    if(gLives === 0){
        msg = `You are out of lives`
        gameOver(msg);
    } else if(gMarkedMinesCount === gLevel.mines){
        msg = `You Won!`;
        gameOver(msg)
    } 
}

function gameOver(msg) {
    alert(msg);
    onInit();
}
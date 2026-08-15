function Player(name, score, marker) {
    if (!new.target) {
        throw Error("You must use the 'new' operator to call the constructor");
    }

    this.name = name;
    this.score = score;
    this.marker = marker;
}

const gameBoard = (() => {
    const size = 3;
    let board = [];

    const getBoard = () => board;

    const placeMarker = (row, column, player) => {
        if (board[row][column] === null) {
            board[row][column] = player.marker;
            return true;
        }
        return false;
    }

    const setupBoard = () => {
        board = [];

        for (let i = 0; i < size; i++) {
            board[i] = []
            for (let j = 0; j < size; j++) {
                board[i].push(null);
            }
        }
    }

    setupBoard();
    return { getBoard, placeMarker, setupBoard };
})();

const gameController = (() => {
    const player1 = new Player("Player One", 0, "X");
    const player2 = new Player("Player Two", 0, "O");

    let activePlayer = player1;

    const switchPlayerTurn = () => {
        activePlayer = activePlayer === player1 ? player2 : player1;
    }

    const getActivePlayer = () => activePlayer;

    const playRound = (row, column) => {
        gameBoard.placeMarker(row, column, activePlayer)

        checkForWinner();
        switchPlayerTurn();
    }

    const checkForWinner = () => {
        /* Winning patterns
        // 256 | 128 | 64
        // ----+-----+---
        //  32 |  16 |  8
        // ----+-----+---
        //   4 |   2 |  1
        //
        // First row win = 256 + 128 + 64 = 448
        */
        const board = gameBoard.getBoard().flat();
        const boardState = board.map(cell => (cell === activePlayer.marker) ? "1" : "0");
        const binaryBoardState = parseInt(boardState.join(''), 2);

        const WINNING_PATTERNS = [
            448, 56, 7, // Row patterns
            292, 146, 73, // Column patterns
            273, 84 // Diagonal patterns
        ];

        if (WINNING_PATTERNS.some(pattern => (binaryBoardState & pattern) === pattern)) {
            console.log(`${activePlayer.name} WINS`);
            return { activePlayer }
        }

        if (!board.includes(null)) {
            console.log("GAME TIED");
            return;
        }
    }

    return { getActivePlayer, playRound };
})();

const screenController = (() => {
    const boardDiv = document.querySelector(".board");

    const updateScreen = () => {
        const playerTurnText = document.querySelector(".player__turn");
        playerTurnText.textContent = `Turn: ${gameController.getActivePlayer().name}`

        boardDiv.textContent = "";
        const board = gameBoard.getBoard();

        board.forEach((row, rowIndex) => {
            row.forEach((cell, columnIndex) => {
                const cellButton = document.createElement("button");
                cellButton.setAttribute("class", "board__cell");
                cellButton.setAttribute("data-row", rowIndex);
                cellButton.setAttribute("data-column", columnIndex);
                cellButton.textContent = cell;
                boardDiv.appendChild(cellButton);
            });
        });
    }

    const handleClick = (event) => {
        const selectedRow = event.target.dataset.row;
        const selectedColumn = event.target.dataset.column;

        if (!selectedRow || !selectedColumn) return;

        gameController.playRound(selectedRow, selectedColumn);
        updateScreen();
    }

    boardDiv.addEventListener("click", handleClick);
    updateScreen();
})();
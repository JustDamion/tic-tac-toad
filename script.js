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
        const board = gameBoard.getBoard();
        let boardState = "";
        let moveAvailable = false;

        for (let row = 0; row < board.length; row++) {
            for (let column = 0; column < board.length; column++) {
                if (board[row][column] === null) moveAvailable = true;

                if (board[row][column] === activePlayer.marker) {
                    boardState += 1;
                } else {
                    boardState += 0;
                }
            }
        }

        if (!moveAvailable) {
            console.log("GAME TIED");
            return;
        }

        /* Winning patterns
        // Conversion from left to right:
        // X O O
        // O X O
        // O O X
        // = 100 010 001
        */
        const winningPatterns = [
            "111000000", "000111000", "000000111", // Row patterns
            "100100100", "010010010", "001001001", // Column patterns
            "100010001", "001010100" // Diagonal patterns
        ];

        if (winningPatterns.includes(boardState)) {
            console.log(`${activePlayer.name} WINS`);
            return { activePlayer }
        }
    }

    return { getActivePlayer, playRound };
})();

const screenController = (() => {
    const boardDiv = document.querySelector(".board");

    const updateScreen = () => {
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
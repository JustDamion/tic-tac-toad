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
    const board = [];

    for (let i = 0; i < size; i++) {
        board[i] = []
        for (let j = 0; j < size; j++) {
            board[i].push([]);
        }
    }

    const getBoard = () => board;

    const placeMarker = (row, column, player) => {
        if (board[row][column] !== []) {
            board[row][column] = player.marker;
            return true;
        }
        return false;
    }

    const printBoard = () => {
        console.table(board);
    };

    return { getBoard, placeMarker, printBoard };
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
        console.log(`${activePlayer.name} placed ${activePlayer.marker} at ${row}, ${column}`);
        gameBoard.printBoard();

        checkForWinner();
        switchPlayerTurn();
    }

    const checkForWinner = () => {
        const board = gameBoard.getBoard();
        let boardState = "";
        for (let i = 0; i < board.length; i++) {
            for (let j = 0; j < board.length; j++) {
                if (board[i][j] === activePlayer.marker) {
                    boardState += 1;
                } else {
                    boardState += 0;
                }
            }
        }

        /* Winning patterns
        // Conversion from left to right:
        // X O O
        // O X O
        // O O X
        // = 100 010 001
        */
        const winningCombos = [
            "111000000", "000111000", "000000111", // Row patterns
            "100100100", "010010010", "001001001", // Column patterns
            "100010001", "001010100" // Diagonal patterns
        ];

        if (winningCombos.includes(boardState)) {
            console.log(`${activePlayer.name} WINS`);
        }
    }

    return { getActivePlayer, playRound };
})();

gameController.playRound(0, 0);
gameController.playRound(1, 1);
gameController.playRound(0, 1);
gameController.playRound(1, 2);
gameController.playRound(0, 2);
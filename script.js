function Player(name, health, marker) {
    if (!new.target) {
        throw Error("You must use the 'new' operator to call the constructor");
    }

    this.name = name;
    this.health = health;
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
    let player1 = new Player("Player One", 30, "X");
    let player2 = new Player("Player Two", 30, "O");

    const updatePlayer1 = (name, health, marker) => {
        player1 = new Player(name, health, marker);
    }

    let activePlayer = player1;
    let inActivePlayer = player2;

    const switchPlayerTurn = () => {
        activePlayer = activePlayer === player1 ? player2 : player1;
        inActivePlayer = inActivePlayer === player2 ? player1 : player2;
    }

    const getActivePlayer = () => activePlayer;

    const playRound = (row, column) => {
        const success = gameBoard.placeMarker(row, column, activePlayer);
        if (!success) return false;

        checkForWinner();
        switchPlayerTurn();

        return true;
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
            inActivePlayer.health -= 10;
            if (inActivePlayer.health <= 0) {
                console.log(`${activePlayer.name} WINS`)
                return { game: "over" };
            }

            gameBoard.setupBoard();
            return { game: "continue" }
        }

        if (!board.includes(null)) {
            gameBoard.setupBoard();
            return { game: "continue" };
        }
    }

    return { getActivePlayer, playRound, updatePlayer1 };
})();

const screenController = (() => {
    const boardDiv = document.querySelector(".board");
    const champSelectButton = document.querySelector(".champion-form__button");

    const updateScreen = () => {
        const playerTurnText = document.querySelector(".player__turn");
        playerTurnText.textContent = `Turn: ${gameController.getActivePlayer().name} (${gameController.getActivePlayer().marker})`

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

    const handleChampionSubmit = (event) => {
        event.preventDefault();

        const championForm = document.querySelector(".champion__form");
        const formData = new FormData(championForm);
        let champStats = {}

        switch (formData.get("champion")) {
            case "champ1":
                champStats = { name: "Champ 1", health: 30, marker: "X" }
                break;
            case "champ2":
                champStats = { name: "Champ 2", health: 50, marker: "X" }
                break;
            case "champ3":
                champStats = { name: "Champ 3", health: 100, marker: "X" }
                break;
        }

        console.log(champStats);

        gameController.updatePlayer1(champStats.name, champStats.health, champStats.marker)
    }

    const handleBoardClick = (event) => {
        const selectedRow = event.target.dataset.row;
        const selectedColumn = event.target.dataset.column;

        if (!selectedRow || !selectedColumn) return;

        gameController.playRound(selectedRow, selectedColumn);
        updateScreen();
    }

    champSelectButton.addEventListener("click", handleChampionSubmit);
    boardDiv.addEventListener("click", handleBoardClick);
    updateScreen();
})();
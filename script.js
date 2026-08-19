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
    let player1 = new Player("Player One", 50, "X");
    let player2 = new Player("Player Two", 50, "🍄‍🟫");

    let activePlayer = player1;
    let inActivePlayer = player2;

    const setActivePlayer = (player) => {
        activePlayer = player;
    }

    const updatePlayer1 = (name, health, marker) => {
        player1 = new Player(name, health, marker);
        setActivePlayer(player1);
    }

    const switchPlayerTurn = () => {
        activePlayer = activePlayer === player1 ? player2 : player1;
        inActivePlayer = inActivePlayer === player2 ? player1 : player2;

        if (inActivePlayer === player1) {
            botController.playRandomMove();
        }
    }

    const getPlayerOne = () => player1;
    const getPlayerTwo = () => player2;
    const getActivePlayer = () => activePlayer;
    const getInactivePlayer = () => inActivePlayer;

    const playRound = (row, column) => {
        const success = gameBoard.placeMarker(row, column, activePlayer);
        if (!success) return false;

        const isWinner = checkForWinner();

        if (isWinner) {
            return { game: "over", winner: activePlayer.name };
        }

        switchPlayerTurn();
        return { game: "continue", winner: null };
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

        // Bitwise & comparison
        // 448 = 000111000000
        // 464 = 000111010000
        //
        // 464 (binaryBoardState) & 448 (pattern)
        // 000111000000 = 448
        if (WINNING_PATTERNS.some(pattern => (binaryBoardState & pattern) === pattern)) {
            inActivePlayer.health -= 10;
            if (inActivePlayer.health <= 0) {
                return true;
            }

            gameBoard.setupBoard();
            return false;
        }

        if (!board.includes(null)) {
            gameBoard.setupBoard();
            return false;
        }
    }

    const restartGame = () => {
        player1 = new Player("Player One", 50, "X");
        player2 = new Player("Player Two", 50, "🍄‍🟫");
        activePlayer = player1;
        inActivePlayer = player2;

        gameBoard.setupBoard();
        console.table(gameBoard.getBoard());
    }

    return { getActivePlayer, getInactivePlayer, getPlayerOne, getPlayerTwo, playRound, updatePlayer1, restartGame };
})();

const botController = (() => {
    const playRandomMove = () => {
        const board = gameBoard.getBoard();
        const emptySpaces = [];

        board.forEach((row, rowIndex) => {
            row.forEach((cell, columnIndex) => {
                if (cell === null) {
                    emptySpaces.push({ rowIndex, columnIndex });
                }
            });
        });

        if (emptySpaces.length !== 0) {
            const randomSpace = Math.floor(Math.random() * emptySpaces.length);
            gameController.playRound(emptySpaces[randomSpace].rowIndex, emptySpaces[randomSpace].columnIndex);
        }
    }

    return { playRandomMove }
})();

const screenController = (() => {
    const boardDiv = document.getElementById("board");
    const championSection = document.querySelector(".champion-section");
    const championsDiv = document.querySelector(".champions");
    const champSelectButton = document.querySelector(".champion-form__button");
    let selectedChamp = document.querySelector(".champion__portrait--selected");

    const playerTurnText = document.querySelector(".player__turn");

    const playerOneName = document.querySelector(".player1__name");
    const playerOneHealthProgress = document.querySelector(".player1__health");
    const playerTwoHealthProgress = document.querySelector(".player2__health");
    const playerOneHealthLabel = document.querySelector(".player1__health-label")
    const playerTwoHealthLabel = document.querySelector(".player2__health-label");

    const gameOverRestartButton = document.querySelector(".game-over__restart-button");

    const updateHeaderPlayerInfo = () => {
        const playerOneHealth = gameController.getPlayerOne().health;
        const playerTwoHealth = gameController.getPlayerTwo().health;

        playerOneHealthProgress.setAttribute("value", playerOneHealth);
        playerTwoHealthProgress.setAttribute("value", playerTwoHealth);

        playerOneHealthLabel.textContent = `${playerOneHealth} HP`;
        playerTwoHealthLabel.textContent = `${playerTwoHealth} HP`;
    }

    const updateScreen = () => {
        boardDiv.setAttribute("class", "board");
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

        updateHeaderPlayerInfo();
    }

    const showGameOverModal = (winningPlayer) => {
        const gameOverModal = document.querySelector(".game-over-modal");
        const gameOverTitle = document.querySelector(".game-over__title");
        gameOverTitle.textContent = `${winningPlayer} Wins!`;
        gameOverModal.showModal();
    }

    const hideGameOverModal = () => {
        const gameOverModal = document.querySelector(".game-over-modal");
        gameOverModal.close();
    }

    const handleChampionSelect = (event) => {
        const championImage = event.target.previousElementSibling;
        championImage.setAttribute("class", "champion__portrait--selected");
        selectedChamp.setAttribute("class", "champion__portrait");
        selectedChamp = championImage;
    }

    const handleChampionSubmit = (event) => {
        event.preventDefault();

        const championForm = document.querySelector(".champion__form");
        const formData = new FormData(championForm);
        let champInfo = {}

        switch (formData.get("champion")) {
            case "champ1":
                champInfo = { name: "Danny DaviToad", health: 30, marker: "🍄" }
                break;
            case "champ2":
                champInfo = { name: "Lilly", health: 50, marker: "🍄" }
                break;
            case "champ3":
                champInfo = { name: "Gerald", health: 100, marker: "🍄" }
                break;
        }

        gameController.updatePlayer1(champInfo.name, champInfo.health, champInfo.marker);
        championSection.setAttribute("style", "display: none;");
        playerOneHealthProgress.setAttribute("max", champInfo.health);
        playerOneName.textContent = champInfo.name;
        updateScreen();
    }

    const handleBoardClick = (event) => {
        const selectedRow = event.target.dataset.row;
        const selectedColumn = event.target.dataset.column;

        if (!selectedRow || !selectedColumn) return;

        const roundResult = gameController.playRound(selectedRow, selectedColumn);
        updateScreen();

        if (roundResult.game === "over") {
            showGameOverModal(roundResult.winner)
        }
    }

    const handleRestartClick = (event) => {
        hideGameOverModal();
        gameController.restartGame();
        boardDiv.removeAttribute("class");
        boardDiv.textContent = "";
        playerTurnText.textContent = "";
        championSection.setAttribute("style", "display: block;");
        playerOneName.textContent = "Player 1";
        playerOneHealthProgress.setAttribute("max", "50")
        updateHeaderPlayerInfo();
    }

    championsDiv.addEventListener("change", handleChampionSelect);
    gameOverRestartButton.addEventListener("click", handleRestartClick);
    champSelectButton.addEventListener("click", handleChampionSubmit);
    boardDiv.addEventListener("click", handleBoardClick);
})();
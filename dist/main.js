"use strict";
const guidGenerator = () => {
    var S4 = function () {
        return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
    };
    return (S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4());
};
const coords = [
    { "x": 34, "y": 29 },
    { "x": 32, "y": 30 },
    { "x": 34, "y": 30 },
    { "x": 22, "y": 31 },
    { "x": 23, "y": 31 },
    { "x": 30, "y": 31 },
    { "x": 31, "y": 31 },
    { "x": 44, "y": 31 },
    { "x": 45, "y": 31 },
    { "x": 21, "y": 32 },
    { "x": 25, "y": 32 },
    { "x": 30, "y": 32 },
    { "x": 31, "y": 32 },
    { "x": 44, "y": 32 },
    { "x": 45, "y": 32 },
    { "x": 10, "y": 33 },
    { "x": 11, "y": 33 },
    { "x": 20, "y": 33 },
    { "x": 26, "y": 33 },
    { "x": 30, "y": 33 },
    { "x": 31, "y": 33 },
    { "x": 10, "y": 34 },
    { "x": 11, "y": 34 },
    { "x": 20, "y": 34 },
    { "x": 24, "y": 34 },
    { "x": 26, "y": 34 },
    { "x": 27, "y": 34 },
    { "x": 32, "y": 34 },
    { "x": 34, "y": 34 },
    { "x": 20, "y": 35 },
    { "x": 26, "y": 35 },
    { "x": 34, "y": 35 },
    { "x": 21, "y": 36 },
    { "x": 25, "y": 36 },
    { "x": 22, "y": 37 },
    { "x": 23, "y": 37 }
];
const setupGame = () => {
    const cells = [];
    const body = document.querySelector("body");
    if (!body)
        return cells;
    const table = document.createElement('table');
    body.appendChild(table);
    const tbody = document.createElement('tbody');
    table.appendChild(tbody);
    for (let y = 0; y < 50; y++) {
        let row = table.insertRow();
        for (let x = 0; x < 50; x++) {
            const cell = row.insertCell();
            cell.title = JSON.stringify({
                x,
                y
            });
            const isAlive = !!coords.find((c) => c.x === x && c.y === y);
            if (isAlive) {
                cell.style.backgroundColor = '#004dc9';
            }
            cells.push({
                _id: guidGenerator(),
                coords: {
                    x,
                    y
                },
                neighbors: [],
                isAlive,
                aliveNextRound: false,
                element: cell
            });
        }
    }
    cells.forEach((cell) => {
        const { coords } = cell;
        const { x, y } = coords;
        // TODO: Eventually clean this up/do it dynamically
        const neighborCoords = [
            {
                x: x - 1,
                y: y - 1
            },
            {
                x: x,
                y: y - 1
            },
            {
                x: x + 1,
                y: y - 1
            },
            {
                x: x - 1,
                y: y
            },
            {
                x: x + 1,
                y: y
            },
            {
                x: x - 1,
                y: y + 1
            },
            {
                x: x,
                y: y + 1
            },
            {
                x: x + 1,
                y: y + 1
            }
        ].filter((coord) => {
            return (coord.x >= 0 && coord.x < 50) && (coord.y >= 0 && coord.y < 50);
        });
        const neighborsToBe = cells.filter((c) => {
            if (neighborCoords.some(((coord) => {
                return coord.x === c.coords.x && coord.y === c.coords.y;
            }))) {
                return c;
            }
        });
        cell.neighbors = neighborsToBe;
        cell.element.addEventListener('click', function () {
            // console.log(cell.coords)
            cell.isAlive = !cell.isAlive;
            cell.element.style.backgroundColor = cell.isAlive ? '#004dc9' : 'rgb(136, 136, 136)';
        });
    });
    body.appendChild(playPauseButton);
    body.appendChild(resetButton);
    return cells;
};
function runGame(time, game) {
    setInterval(() => {
        game();
    }, time);
}
const resetButton = document.createElement('button');
resetButton.innerText = 'Reset Simulation';
resetButton.addEventListener('click', function () {
    cells = cells.map((c) => {
        return Object.assign(Object.assign({}, c), { isAlive: false, aliveNextRound: false });
    });
});
const playPauseButton = document.createElement('button');
playPauseButton.textContent = 'Play Simulation';
playPauseButton.addEventListener('click', function () {
    paused = !paused;
    playPauseButton.innerText = paused ? 'Resume Simulation' : 'Pause Simulation';
});
let cells = [];
let ranSetup = false;
let paused = true;
const mainGameLoop = () => {
    if (!ranSetup) {
        ranSetup = true;
        cells = setupGame();
    }
    if (!paused) {
        // return // getting the coords of intial then trying this out
        cells = cells.map((cell) => {
            const aliveNeighbors = cell.neighbors.filter((n) => n.isAlive).length;
            if (cell.isAlive) {
                if (aliveNeighbors < 2) {
                    cell.aliveNextRound = false;
                }
                else if ([2, 3].some((num) => num === aliveNeighbors)) {
                    cell.aliveNextRound = true;
                }
                else if (aliveNeighbors > 3) {
                    cell.aliveNextRound = false;
                }
            }
            else {
                if (aliveNeighbors === 3) {
                    cell.aliveNextRound = true;
                }
            }
            return cell;
        });
        cells.forEach((cell) => {
            cell.isAlive = cell.aliveNextRound;
            cell.element.style.backgroundColor = cell.isAlive ? '#004dc9' : 'rgb(136, 136, 136)';
        });
    }
    /** // TODO
     *! 1. Loop through all cells
     *?      1.1 Check the four conditions:
     **          A) Any live cell with fewer than two live neighbours dies, as if by underpopulation.
     **          B) Any live cell with two or three live neighbours lives on to the next generation.
     **          C) Any live cell with more than three live neighbours dies, as if by overpopulation.
     **          D) Any dead cell with exactly three live neighbours becomes a live cell, as if by reproduction.
     *?      1.2 Set Cell.aliveNextRound to the outcome of the conditions
     *! 2. Loop through all cells
     *?      2.1 Set alive to value of aliveNextRound
     *?      2.2 Set color to white(alive) or black(dead)
     */
};
runGame(25, mainGameLoop);

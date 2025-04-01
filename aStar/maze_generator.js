class Tractor {
    constructor () {
        this.x = 0;
        this.y = 0;
    }
}

const TRACTORS_COUNT = 1000;
let tractors = [];

function initTractors() {
    for (let i = 0; i < TRACTORS_COUNT; i++) {
        tractors.push(new Tractor);
    }
}

export function generate(mazeSize) {
    let mazeMatrix = createMatrix(mazeSize, mazeSize);
    mazeMatrix[0][0] = true;

    tractors = [];
    initTractors();
    let cnt = 0;
    while (!isValid(mazeMatrix)) {
        cnt++;
        for (let tractor of tractors) {
            moveTractor(tractor, mazeSize, mazeMatrix);
        }
    }

    return mazeMatrix;
}

function moveTractor(tractor, mazeSize, mazeMatrix) {
    let directions = [];

    if (tractor.x > 0) {
        directions.push([-2, 0]);
    }
    if (tractor.x < mazeSize - 2) {
        directions.push([2, 0]);
    }
    if (tractor.y > 0) {
        directions.push([0, -2]);
    }
    if (tractor.y < mazeSize - 2) {
        directions.push([0, 2]);
    }

    const [dx, dy] = getRandomItem(directions);

    tractor.x += dx;
    tractor.y += dy;

    if (!mazeMatrix[tractor.x][tractor.y]) {
        mazeMatrix[tractor.x][tractor.y] = true;
        mazeMatrix[tractor.x - dx / 2][tractor.y - dy / 2] = true;
    }
}

function isValid(mazeMatrix) {
    return mazeMatrix.every((row, y) => row.every((cell, x) => (y % 2 === 0 && x % 2 === 0) ? cell : true));
}

function getRandomItem(array) {
    const index = Math.floor(Math.random() * array.length);
    return array[index];
}

function createMatrix(rows, columns) {
    return Array.from({ length: rows }, () => new Array(columns).fill(false));
}

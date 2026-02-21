export const createGrid = (rows: number, cols: number, probability: number = 0.3): boolean[][] => {
    const grid: boolean[][] = [];
    for (let y = 0; y < rows; y++) {
        grid[y] = [];
        for (let x = 0; x < cols; x++) {
            grid[y][x] = Math.random() < probability;
        }
    }
    return grid;
};

export const countNeighbors = (grid: boolean[][], x: number, y: number, rows: number, cols: number): number => {
    let count = 0;
    for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
            if (dx === 0 && dy === 0) continue;
            const ny = (y + dy + rows) % rows;
            const nx = (x + dx + cols) % cols;
            if (grid[ny][nx]) count++;
        }
    }
    return count;
};

export const computeNextGeneration = (grid: boolean[][], rows: number, cols: number): { nextGrid: boolean[][], liveCells: number } => {
    const nextGrid: boolean[][] = [];
    let liveCells = 0;
    for (let y = 0; y < rows; y++) {
        nextGrid[y] = [];
        for (let x = 0; x < cols; x++) {
            const n = countNeighbors(grid, x, y, rows, cols);
            if (grid[y][x]) {
                nextGrid[y][x] = n === 2 || n === 3;
            } else {
                nextGrid[y][x] = n === 3;
            }
            if (nextGrid[y][x]) liveCells++;
        }
    }
    return { nextGrid, liveCells };
};

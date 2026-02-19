import { test } from 'node:test';
import assert from 'node:assert';
import { createGrid, countNeighbors, computeNextGeneration } from './gameOfLifeUtils.ts';

test('createGrid creates a grid with correct dimensions', () => {
    const rows = 10;
    const cols = 20;
    const grid = createGrid(rows, cols);
    assert.strictEqual(grid.length, rows);
    assert.strictEqual(grid[0].length, cols);
});

test('countNeighbors counts correctly with wrapping', () => {
    // 3x3 grid
    // T F T
    // F T F
    // T F T
    const grid = [
        [true, false, true],
        [false, true, false],
        [true, false, true]
    ];
    const rows = 3;
    const cols = 3;

    // Center (1,1) neighbors:
    // (0,0)=T, (0,1)=F, (0,2)=T
    // (1,0)=F,          (1,2)=F
    // (2,0)=T, (2,1)=F, (2,2)=T
    // T, F, T, F, F, T, F, T -> 4 neighbors
    assert.strictEqual(countNeighbors(grid, 1, 1, rows, cols), 4);

    // Corner (0,0) neighbors:
    // (-1,-1)->(2,2)=T, (-1,0)->(2,0)=T, (-1,1)->(2,1)=F
    // ( 0,-1)->(0,2)=T,                  ( 0,1)->(0,1)=F
    // ( 1,-1)->(1,2)=F, ( 1,0)->(1,0)=F, ( 1,1)->(1,1)=T
    // T, T, F, T, F, F, F, T -> 4 neighbors
    assert.strictEqual(countNeighbors(grid, 0, 0, rows, cols), 4);
});

test('computeNextGeneration handles Block pattern (Still Life)', () => {
    // 4x4 grid
    // F F F F
    // F T T F
    // F T T F
    // F F F F
    const grid = [
        [false, false, false, false],
        [false, true, true, false],
        [false, true, true, false],
        [false, false, false, false]
    ];
    const { nextGrid, liveCells } = computeNextGeneration(grid, 4, 4);

    // Should be identical
    assert.deepStrictEqual(nextGrid, grid);
    assert.strictEqual(liveCells, 4);
});

test('computeNextGeneration handles Blinker pattern (Oscillator)', () => {
    // 5x5 grid
    // F F F F F
    // F F T F F
    // F F T F F
    // F F T F F
    // F F F F F
    const grid = [
        [false, false, false, false, false],
        [false, false, true, false, false],
        [false, false, true, false, false],
        [false, false, true, false, false],
        [false, false, false, false, false]
    ];

    const { nextGrid } = computeNextGeneration(grid, 5, 5);

    // Expected:
    // F F F F F
    // F F F F F
    // F T T T F
    // F F F F F
    // F F F F F
    const expected = [
        [false, false, false, false, false],
        [false, false, false, false, false],
        [false, true, true, true, false],
        [false, false, false, false, false],
        [false, false, false, false, false]
    ];

    assert.deepStrictEqual(nextGrid, expected);
});

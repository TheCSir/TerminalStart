
import { test, describe } from 'node:test';
import assert from 'node:assert';
import { createColumn, updateColumn } from '../../src/utils/matrixUtils.ts';
import type { MatrixColumn } from '../../src/utils/matrixUtils.ts';

describe('Matrix Utils', () => {
    test('createColumn initializes correctly', () => {
        const rows = 10;
        const trailMultiplier = 1;
        const col = createColumn(rows, trailMultiplier);

        assert.strictEqual(col.cells.length, rows);
        assert.strictEqual(col.head, 0);
        assert.ok(col.spaceRemaining >= 1 && col.spaceRemaining <= rows);
        assert.ok(col.lengthRemaining >= 3 && col.lengthRemaining <= (rows - 3 + 3));
        assert.ok(col.updateSpeed >= 1 && col.updateSpeed <= 3);

        // Cells should be empty initially
        col.cells.forEach(cell => {
            assert.strictEqual(cell.val, ' ');
            assert.strictEqual(cell.isHead, false);
        });
    });

    test('updateColumn shifts head correctly', () => {
        const rows = 5;
        const col = createColumn(rows, 1);
        col.head = 0; // ensure start

        const getChar = () => 'A';

        // Update 1
        updateColumn(col, rows, 1, getChar);
        // Head should move back by 1 (wrapping to rows-1)
        assert.strictEqual(col.head, 4);

        // Update 2
        updateColumn(col, rows, 1, getChar);
        assert.strictEqual(col.head, 3);
    });

    test('updateColumn inserts characters when lengthRemaining > 0', () => {
        const rows = 5;
        const col = createColumn(rows, 1);
        col.spaceRemaining = 0; // Force character insertion
        col.lengthRemaining = 5;
        col.head = 0;

        const getChar = () => 'X';

        updateColumn(col, rows, 1, getChar);

        // Head moved to 4
        assert.strictEqual(col.head, 4);
        // Cell at head should be 'X'
        assert.strictEqual(col.cells[4].val, 'X');
        // lengthRemaining should decrease
        assert.strictEqual(col.lengthRemaining, 4);
    });

    test('updateColumn handles spaceRemaining correctly', () => {
        const rows = 5;
        const col = createColumn(rows, 1);
        col.spaceRemaining = 2; // Should insert space
        col.lengthRemaining = 5;
        col.head = 0;

        const getChar = () => 'X';

        updateColumn(col, rows, 1, getChar);

        assert.strictEqual(col.head, 4);
        assert.strictEqual(col.cells[4].val, ' ');
        assert.strictEqual(col.spaceRemaining, 1);
    });

    test('isHead logic is correct', () => {
        const rows = 3;
        const col = createColumn(rows, 1);
        // Setup:
        // [0]: ' '
        // [1]: 'A'
        // [2]: ' '
        // Head at 0.
        // Visually:
        // Row 0: ' ' (idx 0)
        // Row 1: 'A' (idx 1)
        // Row 2: ' ' (idx 2)

        col.cells[0] = { val: ' ', isHead: false };
        col.cells[1] = { val: 'A', isHead: false };
        col.cells[2] = { val: ' ', isHead: false };
        col.head = 0;

        // Force update logic (without shifting for a moment? No, updateColumn shifts)
        // Let's just run updateColumn and see what happens to the NEW state.

        // Let's set up state so after shift we have predictable outcome.
        // head=0. updateColumn shifts head to 2.
        // new cell at 2.
        // let's force new cell to be 'B'.
        col.spaceRemaining = 0;
        col.lengthRemaining = 10;
        const getChar = () => 'B';

        updateColumn(col, rows, 1, getChar);

        // Now head is 2.
        // cells[2] (new top) = 'B'.
        // cells[0] (was top, now row 1) = ' '.
        // cells[1] (was row 1, now row 2) = 'A'.

        // Visually:
        // Row 0 (idx 2): 'B'
        // Row 1 (idx 0): ' '
        // Row 2 (idx 1): 'A'

        // Check isHead:
        // 'B' (row 0): below is ' ' (row 1). So B is head?
        // ' ' (row 1): below is 'A' (row 2). Space is never head.
        // 'A' (row 2): below is off-screen (space). So A is head?

        assert.strictEqual(col.cells[2].val, 'B');
        assert.strictEqual(col.cells[2].isHead, true); // Below is ' '

        assert.strictEqual(col.cells[0].val, ' ');
        assert.strictEqual(col.cells[0].isHead, false);

        assert.strictEqual(col.cells[1].val, 'A');
        assert.strictEqual(col.cells[1].isHead, true); // Below is off-screen
    });
});

export interface MatrixCell {
    val: string;
    isHead: boolean;
}

export interface MatrixColumn {
    cells: MatrixCell[];
    head: number;
    spaceRemaining: number;
    lengthRemaining: number;
    updateSpeed: number;
}

/**
 * Creates a new MatrixColumn with initialized values.
 * @param rows Number of rows in the matrix (circular buffer size)
 * @param trailMultiplier Multiplier for trail length based on fade setting
 */
export function createColumn(rows: number, trailMultiplier: number): MatrixColumn {
    const cells: MatrixCell[] = [];
    for (let r = 0; r < rows; r++) {
        cells.push({ val: ' ', isHead: false });
    }

    return {
        cells,
        head: 0,
        spaceRemaining: Math.floor(Math.random() * rows) + 1,
        lengthRemaining: Math.floor((Math.random() * (rows - 3) + 3) * trailMultiplier),
        updateSpeed: Math.floor(Math.random() * 3) + 1
    };
}

/**
 * Updates a MatrixColumn by shifting (moving head) and inserting new characters.
 * Implements circular buffer logic for O(1) shift.
 * @param column The column to update
 * @param rows Total rows
 * @param trailMultiplier Multiplier for trail length
 * @param getChar Callback to generate a random character
 */
export function updateColumn(
    column: MatrixColumn,
    rows: number,
    trailMultiplier: number,
    getChar: () => string
): void {
    // Circular buffer shift: Move head back by 1 (wrapping around)
    column.head = (column.head - 1 + rows) % rows;

    // Reuse the cell object at the new head position (which represents logical row 0)
    const newCell = column.cells[column.head];

    // Determine content for the new cell
    if (column.spaceRemaining > 0) {
        newCell.val = ' ';
        newCell.isHead = false;
        column.spaceRemaining--;
    } else {
        if (column.lengthRemaining > 0) {
            newCell.val = getChar();
            newCell.isHead = false; // Will be determined in the loop below or implicitly?
            // Actually, if it's a new char, it might be head?
            // Wait, logic says:
            // if (length > 0) matrix[0][j] = { val: getChar(), isHead: false };
            // Then loop sets isHead based on below.
            column.lengthRemaining--;
        } else {
            // End of trail, start new space
            newCell.val = ' ';
            newCell.isHead = false;
            column.spaceRemaining = Math.floor(Math.random() * rows) + 1;
            column.lengthRemaining = Math.floor((Math.random() * (rows - 3) + 3) * trailMultiplier);
        }
    }

    // Mark heads and apply random glitch effect
    // Iterate logical rows 0 to rows-1
    for (let r = 0; r < rows; r++) {
        const idx = (column.head + r) % rows;
        const cell = column.cells[idx];

        if (cell.val !== ' ') {
            // Check below (logical r+1)
            let isHead = false;
            if (r + 1 < rows) {
                const belowIdx = (column.head + r + 1) % rows;
                const below = column.cells[belowIdx];
                isHead = (below.val === ' ');
            } else {
                // Bottom of screen - treating below as space makes it head when it falls off?
                // Original code: `const below = (r + 1 < rows) ? matrix[r + 1][j] : { val: ' ' };`
                // So yes, if r == rows-1, below is space.
                isHead = true;
            }
            cell.isHead = isHead;

            // Glitch effect: 5% chance to change character if not head
            if (!cell.isHead && Math.random() < 0.05) {
                cell.val = getChar();
            }
        }
    }
}

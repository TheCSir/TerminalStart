import React, { useEffect, useRef } from 'react';
import { createGrid, countNeighbors, computeNextGeneration } from '@/utils/gameOfLifeUtils';

interface GameOfLifeWidgetProps {
    speed?: number;
}

export const GameOfLifeWidget: React.FC<GameOfLifeWidgetProps> = ({ speed = 50 }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const container = containerRef.current;
        if (!canvas || !container) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let width = container.clientWidth;
        let height = container.clientHeight;
        canvas.width = width;
        canvas.height = height;

        const cellSize = 8;
        let cols = Math.floor(width / cellSize);
        let rows = Math.floor(height / cellSize);

        const getColors = () => {
            const root = getComputedStyle(document.documentElement);
            return {
                bg: root.getPropertyValue('--color-bg').trim(),
                accent: root.getPropertyValue('--color-accent').trim(),
                muted: root.getPropertyValue('--color-muted').trim(),
            };
        };

        let colors = getColors();
        const colorObserver = new MutationObserver(() => {
            colors = getColors();
        });
        colorObserver.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['style', 'class', 'data-theme']
        });

        // Grid state
        let grid: boolean[][] = [];
        let generation = 0;
        let staleCount = 0;
        let prevLiveCells = 0;

        const randomize = () => {
            grid = createGrid(rows, cols);
            generation = 0;
            staleCount = 0;
        };

        randomize();

        const step = () => {
            const result = computeNextGeneration(grid, rows, cols);
            grid = result.nextGrid;
            const liveCells = result.liveCells;
            generation++;

            // Detect stale state and re-randomize
            if (Math.abs(liveCells - prevLiveCells) < 3) {
                staleCount++;
            } else {
                staleCount = 0;
            }
            prevLiveCells = liveCells;

            if (staleCount > 30 || liveCells < 5) {
                randomize();
            }
        };

        const resizeObserver = new ResizeObserver(() => {
            width = container.clientWidth;
            height = container.clientHeight;
            canvas.width = width;
            canvas.height = height;
            cols = Math.floor(width / cellSize);
            rows = Math.floor(height / cellSize);
            randomize();
        });
        resizeObserver.observe(container);

        let animationId: number;
        let lastTime = 0;

        const render = (timestamp: number) => {
            animationId = requestAnimationFrame(render);

            const interval = Math.max(30, 300 - speed * 3);
            if (timestamp - lastTime < interval) return;
            lastTime = timestamp;

            step();

            // Draw
            ctx.fillStyle = colors.bg;
            ctx.fillRect(0, 0, width, height);

            for (let y = 0; y < rows; y++) {
                for (let x = 0; x < cols; x++) {
                    if (grid[y][x]) {
                        const n = countNeighbors(grid, x, y, rows, cols);
                        // Color intensity based on neighbor count
                        if (n === 3) {
                            ctx.fillStyle = colors.accent;
                            ctx.globalAlpha = 1.0;
                        } else {
                            ctx.fillStyle = colors.accent;
                            ctx.globalAlpha = 0.5;
                        }
                        ctx.fillRect(x * cellSize + 1, y * cellSize + 1, cellSize - 2, cellSize - 2);
                    }
                }
            }
            ctx.globalAlpha = 1.0;

            // Generation counter
            ctx.fillStyle = colors.muted;
            ctx.font = '10px "JetBrains Mono", monospace';
            ctx.textBaseline = 'top';
            ctx.fillText(`gen: ${generation}`, 4, height - 14);
        };

        animationId = requestAnimationFrame(render);

        return () => {
            cancelAnimationFrame(animationId);
            resizeObserver.disconnect();
            colorObserver.disconnect();
        };
    }, [speed]);

    return (
        <div ref={containerRef} className="w-full h-full bg-[var(--color-bg)] overflow-hidden rounded relative">
            <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
        </div>
    );
};

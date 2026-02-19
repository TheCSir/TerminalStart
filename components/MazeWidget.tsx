import React, { useEffect, useRef } from 'react';

interface MazeWidgetProps {
    speed?: number;
}

const BEST_TIME_KEY = 'tui-maze-best-time';

export const MazeWidget: React.FC<MazeWidgetProps> = ({ speed = 50 }) => {
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

        const cellSize = 12;
        let mazeCols = Math.floor(width / cellSize / 2) * 2 + 1;
        let mazeRows = Math.floor(height / cellSize / 2) * 2 + 1;
        if (mazeCols < 5) mazeCols = 5;
        if (mazeRows < 5) mazeRows = 5;

        const getColors = () => {
            const root = getComputedStyle(document.documentElement);
            return {
                bg: root.getPropertyValue('--color-bg').trim(),
                fg: root.getPropertyValue('--color-fg').trim(),
                accent: root.getPropertyValue('--color-accent').trim(),
                muted: root.getPropertyValue('--color-muted').trim(),
                border: root.getPropertyValue('--color-border').trim(),
            };
        };

        let maze: number[][] = [];
        let stack: { x: number; y: number }[] = [];
        let phase: 'generating' | 'solving' | 'pausing' = 'generating';
        let pauseStartTime = 0;
        let pauseDuration = 0;
        let pauseNextAction: 'solve' | 'restart' = 'solve';
        let solvePath: { x: number; y: number }[] = [];
        let solveVisited: boolean[][] = [];

        // timer state
        let solveStartTime = 0;
        let solveElapsedMs = 0;
        let solveFrozen = false;
        let bestTimeMs: number | null = null;

        // load best time from localStorage
        try {
            const stored = localStorage.getItem(BEST_TIME_KEY);
            if (stored) bestTimeMs = parseFloat(stored);
        } catch { }

        const formatTime = (ms: number) => {
            const s = ms / 1000;
            if (s < 10) return s.toFixed(2) + 's';
            if (s < 60) return s.toFixed(1) + 's';
            const mins = Math.floor(s / 60);
            const secs = (s % 60).toFixed(0).padStart(2, '0');
            return `${mins}:${secs}`;
        };

        const initMaze = () => {
            maze = [];
            for (let y = 0; y < mazeRows; y++) {
                maze[y] = [];
                for (let x = 0; x < mazeCols; x++) {
                    maze[y][x] = 0;
                }
            }
            maze[1][1] = 1;
            stack = [{ x: 1, y: 1 }];
            phase = 'generating';
            pauseStartTime = 0;
            pauseDuration = 0;
            solvePath = [];
            solveVisited = [];
            solveStartTime = 0;
            solveElapsedMs = 0;
            solveFrozen = false;
        };

        const initSolve = () => {
            solveVisited = [];
            for (let y = 0; y < mazeRows; y++) {
                solveVisited[y] = new Array(mazeCols).fill(false);
            }
            solvePath = [{ x: 1, y: 1 }];
            solveVisited[1][1] = true;
            phase = 'solving';
            solveStartTime = performance.now();
            solveElapsedMs = 0;
            solveFrozen = false;
        };

        initMaze();

        const getNeighbors = (x: number, y: number) => {
            const dirs = [
                { dx: 0, dy: -2 }, { dx: 2, dy: 0 },
                { dx: 0, dy: 2 }, { dx: -2, dy: 0 }
            ];
            return dirs.filter(d => {
                const nx = x + d.dx;
                const ny = y + d.dy;
                return nx > 0 && nx < mazeCols - 1 && ny > 0 && ny < mazeRows - 1 && maze[ny][nx] === 0;
            });
        };

        const getSolveNeighbors = (x: number, y: number) => {
            const dirs = [
                { dx: 0, dy: -1 }, { dx: 1, dy: 0 },
                { dx: 0, dy: 1 }, { dx: -1, dy: 0 }
            ];
            return dirs.filter(d => {
                const nx = x + d.dx;
                const ny = y + d.dy;
                return nx >= 0 && nx < mazeCols && ny >= 0 && ny < mazeRows
                    && maze[ny][nx] === 1 && !solveVisited[ny][nx];
            });
        };

        const resizeObserver = new ResizeObserver(() => {
            width = container.clientWidth;
            height = container.clientHeight;
            canvas.width = width;
            canvas.height = height;
            mazeCols = Math.floor(width / cellSize / 2) * 2 + 1;
            mazeRows = Math.floor(height / cellSize / 2) * 2 + 1;
            if (mazeCols < 5) mazeCols = 5;
            if (mazeRows < 5) mazeRows = 5;
            initMaze();
        });
        resizeObserver.observe(container);

        let animationId: number;
        let lastTime = 0;

        const render = (timestamp: number) => {
            animationId = requestAnimationFrame(render);

            const interval = Math.max(10, 80 - speed);
            if (timestamp - lastTime < interval) return;
            lastTime = timestamp;

            const colors = getColors();

            const stepsPerFrame = Math.max(1, Math.floor(speed / 15));

            // tick timer
            if (phase === 'solving' && !solveFrozen) {
                solveElapsedMs = performance.now() - solveStartTime;
            }

            if (phase === 'generating') {
                for (let s = 0; s < stepsPerFrame && stack.length > 0; s++) {
                    const current = stack[stack.length - 1];
                    const neighbors = getNeighbors(current.x, current.y);

                    if (neighbors.length > 0) {
                        const chosen = neighbors[Math.floor(Math.random() * neighbors.length)];
                        const wallX = current.x + chosen.dx / 2;
                        const wallY = current.y + chosen.dy / 2;
                        maze[wallY][wallX] = 1;
                        maze[current.y + chosen.dy][current.x + chosen.dx] = 1;
                        stack.push({ x: current.x + chosen.dx, y: current.y + chosen.dy });
                    } else {
                        stack.pop();
                    }
                }

                if (stack.length === 0) {
                    phase = 'pausing';
                    pauseStartTime = timestamp;
                    pauseDuration = 1000 + Math.random() * 1000;
                    pauseNextAction = 'solve';
                }
            } else if (phase === 'pausing') {
                if (timestamp - pauseStartTime >= pauseDuration) {
                    if (pauseNextAction === 'solve') {
                        initSolve();
                    } else {
                        initMaze();
                    }
                }
            } else if (phase === 'solving') {
                for (let s = 0; s < stepsPerFrame && solvePath.length > 0; s++) {
                    const current = solvePath[solvePath.length - 1];

                    if (current.x === mazeCols - 2 && current.y === mazeRows - 2) {
                        // freeze timer
                        solveFrozen = true;
                        solveElapsedMs = performance.now() - solveStartTime;

                        // check highscore
                        if (bestTimeMs === null || solveElapsedMs < bestTimeMs) {
                            bestTimeMs = solveElapsedMs;
                            try { localStorage.setItem(BEST_TIME_KEY, String(bestTimeMs)); } catch { }
                        }

                        phase = 'pausing';
                        pauseStartTime = timestamp;
                        pauseDuration = 1500 + Math.random() * 2000;
                        pauseNextAction = 'restart';
                        break;
                    }

                    const neighbors = getSolveNeighbors(current.x, current.y);
                    if (neighbors.length > 0) {
                        const chosen = neighbors[Math.floor(Math.random() * neighbors.length)];
                        const next = { x: current.x + chosen.dx, y: current.y + chosen.dy };
                        solveVisited[next.y][next.x] = true;
                        solvePath.push(next);
                    } else {
                        solvePath.pop();
                    }
                }

                if (solvePath.length === 0 && phase === 'solving') {
                    solveFrozen = true;
                    phase = 'pausing';
                    pauseStartTime = timestamp;
                    pauseDuration = 1000 + Math.random() * 2000;
                    pauseNextAction = 'restart';
                }
            }

            // draw
            ctx.fillStyle = colors.bg;
            ctx.fillRect(0, 0, width, height);

            for (let y = 0; y < mazeRows; y++) {
                for (let x = 0; x < mazeCols; x++) {
                    const px = x * cellSize;
                    const py = y * cellSize;

                    if (maze[y][x] === 0) {
                        ctx.fillStyle = colors.border;
                        ctx.globalAlpha = 0.4;
                        ctx.fillRect(px, py, cellSize, cellSize);
                        ctx.globalAlpha = 1.0;
                    }
                }
            }

            // solve path
            if (phase === 'solving' || (phase === 'pausing' && solvePath.length > 0)) {
                solvePath.forEach((p, i) => {
                    ctx.fillStyle = colors.accent;
                    ctx.globalAlpha = 0.3 + (i / solvePath.length) * 0.7;
                    ctx.fillRect(p.x * cellSize + 2, p.y * cellSize + 2, cellSize - 4, cellSize - 4);
                });
                ctx.globalAlpha = 1.0;
            }

            // generation head
            if (phase === 'generating' && stack.length > 0) {
                const head = stack[stack.length - 1];
                ctx.fillStyle = colors.accent;
                ctx.fillRect(head.x * cellSize, head.y * cellSize, cellSize, cellSize);

                stack.forEach((p, i) => {
                    if (i === stack.length - 1) return;
                    ctx.fillStyle = colors.accent;
                    ctx.globalAlpha = 0.15;
                    ctx.fillRect(p.x * cellSize + 1, p.y * cellSize + 1, cellSize - 2, cellSize - 2);
                });
                ctx.globalAlpha = 1.0;
            }

            // timer + best time overlay
            const showTimer = phase === 'solving' || (phase === 'pausing' && solveFrozen && solvePath.length > 0);
            if (showTimer || bestTimeMs !== null) {
                ctx.save();
                const fontSize = Math.max(10, Math.min(14, Math.floor(width / 30)));
                ctx.font = `${fontSize}px "JetBrains Mono", monospace`;
                ctx.textBaseline = 'bottom';

                const padding = 6;
                const bottomY = height - padding;

                // current solve time (bottom-left)
                if (showTimer) {
                    const timeStr = formatTime(solveElapsedMs);
                    ctx.fillStyle = colors.bg;
                    ctx.globalAlpha = 0.7;
                    const tw = ctx.measureText(timeStr).width;
                    ctx.fillRect(padding - 2, bottomY - fontSize - 2, tw + 4, fontSize + 4);
                    ctx.globalAlpha = 1.0;
                    ctx.fillStyle = colors.accent;
                    ctx.textAlign = 'left';
                    ctx.fillText(timeStr, padding, bottomY);
                }

                // best time (bottom-right)
                if (bestTimeMs !== null) {
                    const bestStr = '★ ' + formatTime(bestTimeMs);
                    ctx.fillStyle = colors.bg;
                    ctx.globalAlpha = 0.7;
                    ctx.textAlign = 'right';
                    const bw = ctx.measureText(bestStr).width;
                    ctx.fillRect(width - padding - bw - 2, bottomY - fontSize - 2, bw + 4, fontSize + 4);
                    ctx.globalAlpha = 1.0;
                    ctx.fillStyle = colors.muted;
                    ctx.fillText(bestStr, width - padding, bottomY);
                }

                ctx.restore();
            }
        };

        ctx.fillStyle = getColors().bg;
        ctx.fillRect(0, 0, width, height);

        animationId = requestAnimationFrame(render);

        return () => {
            cancelAnimationFrame(animationId);
            resizeObserver.disconnect();
        };
    }, [speed]);

    return (
        <div ref={containerRef} className="w-full h-full bg-[var(--color-bg)] overflow-hidden rounded relative">
            <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
        </div>
    );
};

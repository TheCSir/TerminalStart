import React, { useEffect, useRef } from 'react';

interface SnakeWidgetProps {
    speed?: number;
}

export const SnakeWidget: React.FC<SnakeWidgetProps> = ({ speed = 50 }) => {
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

        const cellSize = 10;
        let cols = Math.floor(width / cellSize);
        let rows = Math.floor(height / cellSize);

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

        // Snake state
        let snake: { x: number; y: number }[] = [];
        let food: { x: number; y: number } = { x: 0, y: 0 };
        let dir = { x: 1, y: 0 };
        let score = 0;

        const placeFood = () => {
            food = {
                x: Math.floor(Math.random() * cols),
                y: Math.floor(Math.random() * rows),
            };
            while (snake.some(s => s.x === food.x && s.y === food.y)) {
                food.x = Math.floor(Math.random() * cols);
                food.y = Math.floor(Math.random() * rows);
            }
        };

        const initGame = () => {
            const startX = Math.floor(cols / 2);
            const startY = Math.floor(rows / 2);
            snake = [];
            for (let i = 0; i < 4; i++) {
                snake.push({ x: startX - i, y: startY });
            }
            dir = { x: 1, y: 0 };
            score = 0;
            placeFood();
        };

        initGame();

        // AI: greedy pathfinding toward food, avoiding self-collision
        const getAIDirection = () => {
            const head = snake[0];
            const possibleDirs = [
                { x: 1, y: 0 }, { x: -1, y: 0 },
                { x: 0, y: 1 }, { x: 0, y: -1 }
            ].filter(d => !(d.x === -dir.x && d.y === -dir.y));

            const safeDirs = possibleDirs.filter(d => {
                const nx = (head.x + d.x + cols) % cols;
                const ny = (head.y + d.y + rows) % rows;
                return !snake.some((s, i) => i > 0 && s.x === nx && s.y === ny);
            });

            if (safeDirs.length === 0) return dir;

            // Sort by distance to food
            safeDirs.sort((a, b) => {
                const ax = (head.x + a.x + cols) % cols;
                const ay = (head.y + a.y + rows) % rows;
                const bx = (head.x + b.x + cols) % cols;
                const by = (head.y + b.y + rows) % rows;
                const aDist = Math.abs(ax - food.x) + Math.abs(ay - food.y);
                const bDist = Math.abs(bx - food.x) + Math.abs(by - food.y);
                return aDist - bDist;
            });

            // Small random chance for variety
            if (Math.random() < 0.08 && safeDirs.length > 1) {
                return safeDirs[1];
            }
            return safeDirs[0];
        };

        const resizeObserver = new ResizeObserver(() => {
            width = container.clientWidth;
            height = container.clientHeight;
            canvas.width = width;
            canvas.height = height;
            cols = Math.floor(width / cellSize);
            rows = Math.floor(height / cellSize);
            initGame();
        });
        resizeObserver.observe(container);

        let animationId: number;
        let lastTime = 0;

        const render = (timestamp: number) => {
            animationId = requestAnimationFrame(render);

            const interval = Math.max(40, 220 - speed * 2);
            if (timestamp - lastTime < interval) return;
            lastTime = timestamp;

            const colors = getColors();

            // AI
            dir = getAIDirection();

            // Move
            const head = snake[0];
            const newHead = {
                x: (head.x + dir.x + cols) % cols,
                y: (head.y + dir.y + rows) % rows,
            };

            if (snake.some(s => s.x === newHead.x && s.y === newHead.y)) {
                initGame();
                return;
            }

            snake.unshift(newHead);

            if (newHead.x === food.x && newHead.y === food.y) {
                score++;
                placeFood();
            } else {
                snake.pop();
            }

            // Draw
            ctx.fillStyle = colors.bg;
            ctx.fillRect(0, 0, width, height);

            // Subtle grid
            ctx.strokeStyle = colors.border;
            ctx.globalAlpha = 0.1;
            for (let x = 0; x <= cols; x++) {
                ctx.beginPath();
                ctx.moveTo(x * cellSize, 0);
                ctx.lineTo(x * cellSize, rows * cellSize);
                ctx.stroke();
            }
            for (let y = 0; y <= rows; y++) {
                ctx.beginPath();
                ctx.moveTo(0, y * cellSize);
                ctx.lineTo(cols * cellSize, y * cellSize);
                ctx.stroke();
            }
            ctx.globalAlpha = 1;

            // Draw snake body
            snake.forEach((seg, i) => {
                const px = seg.x * cellSize;
                const py = seg.y * cellSize;
                const inset = i === 0 ? 1 : 2;

                if (i === 0) {
                    // Head — brighter, slightly larger
                    ctx.fillStyle = colors.fg;
                    ctx.fillRect(px + inset, py + inset, cellSize - inset * 2, cellSize - inset * 2);
                } else {
                    // Body — accent with fade
                    const alpha = Math.max(0.25, 1 - (i / snake.length) * 0.75);
                    ctx.globalAlpha = alpha;
                    ctx.fillStyle = colors.accent;
                    ctx.fillRect(px + inset, py + inset, cellSize - inset * 2, cellSize - inset * 2);
                    ctx.globalAlpha = 1;
                }
            });

            // Draw food — pulsing dot
            const pulse = 0.7 + Math.sin(timestamp * 0.005) * 0.3;
            ctx.globalAlpha = pulse;
            ctx.fillStyle = colors.accent;
            const foodInset = 2;
            ctx.fillRect(
                food.x * cellSize + foodInset,
                food.y * cellSize + foodInset,
                cellSize - foodInset * 2,
                cellSize - foodInset * 2
            );
            ctx.globalAlpha = 1;

            // Score
            ctx.fillStyle = colors.muted;
            ctx.font = '10px "JetBrains Mono", monospace';
            ctx.textBaseline = 'top';
            ctx.fillText(`score: ${score}`, 4, height - 14);
        };

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

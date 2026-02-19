import React, { useEffect, useRef } from 'react';

// Heavy pipe chars for thick lines
const PIPE_H = '━';
const PIPE_V = '┃';
const CORNER_TL = '┏';
const CORNER_TR = '┓';
const CORNER_BL = '┗';
const CORNER_BR = '┛';

interface Pipe {
    x: number;
    y: number;
    dir: number; // 0=up, 1=right, 2=down, 3=left
    color: string;
}

interface PipesWidgetProps {
    options?: {
        speed: number;
        fade: number;
        count: number;
        fontSize: number;
        lifetime: number;
    };
    speed?: number;
}

// Get the pipe character for a direction change
const getPipeChar = (oldDir: number, newDir: number): string => {
    if (oldDir === newDir) {
        // Straight
        return (oldDir === 0 || oldDir === 2) ? PIPE_V : PIPE_H;
    }
    // Corner pieces based on old->new direction transition
    // 0=up, 1=right, 2=down, 3=left
    // oldDir = direction pipe was traveling TO reach this cell (enters from opposite side)
    // newDir = direction pipe will travel FROM this cell
    // ┏ (CORNER_TL) connects RIGHT + DOWN
    // ┓ (CORNER_TR) connects LEFT  + DOWN
    // ┗ (CORNER_BL) connects RIGHT + UP
    // ┛ (CORNER_BR) connects LEFT  + UP
    if ((oldDir === 0 && newDir === 1) || (oldDir === 3 && newDir === 2)) return CORNER_TL; // ┏ enters from bottom/right, exits right/down
    if ((oldDir === 0 && newDir === 3) || (oldDir === 1 && newDir === 2)) return CORNER_TR; // ┓ enters from bottom/left, exits left/down
    if ((oldDir === 2 && newDir === 1) || (oldDir === 3 && newDir === 0)) return CORNER_BL; // ┗ enters from top/right, exits right/up
    if ((oldDir === 2 && newDir === 3) || (oldDir === 1 && newDir === 0)) return CORNER_BR; // ┛ enters from top/left, exits left/up
    return PIPE_V;
};

export const PipesWidget: React.FC<PipesWidgetProps> = ({ options, speed = 50 }) => {
    const activeSpeed = options?.speed ?? speed;
    const fade = options?.fade ?? 0.1;
    const pipeCount = Math.min(options?.count ?? 3, 10);
    const fontSize = options?.fontSize ?? 16;
    const lifetime = options?.lifetime ?? 80;

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

        const fontSize = options?.fontSize ?? 16;
        const rowHeight = fontSize;

        // Measure actual character width from the font to avoid gaps
        ctx.font = `${fontSize}px "JetBrains Mono", monospace`;
        const colWidth = ctx.measureText('━').width || fontSize;

        let cols = Math.floor(width / colWidth);
        let rows = Math.floor(height / rowHeight);

        const getThemeColors = () => {
            const root = getComputedStyle(document.documentElement);
            return [
                root.getPropertyValue('--color-accent').trim(),
                root.getPropertyValue('--color-muted').trim(),
            ].filter(Boolean);
        };

        const getBgColor = () => getComputedStyle(document.documentElement).getPropertyValue('--color-bg').trim();

        let currentColors = getThemeColors();
        let currentBgColor = getBgColor();

        // Update colors when theme changes
        const themeObserver = new MutationObserver(() => {
            currentColors = getThemeColors();
            currentBgColor = getBgColor();
        });

        themeObserver.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['style', 'class', 'data-theme']
        });

        const initPipe = (): Pipe => ({
            x: Math.floor(Math.random() * cols),
            y: Math.floor(Math.random() * rows),
            dir: Math.floor(Math.random() * 4),
            color: currentColors[Math.floor(Math.random() * currentColors.length)] || '#888',
        });

        const pipes: Pipe[] = [];
        for (let i = 0; i < pipeCount; i++) {
            pipes.push(initPipe());
        }

        // Track steps for reset
        const steps: number[] = new Array(pipeCount).fill(0);

        const resizeObserver = new ResizeObserver(() => {
            width = container.clientWidth;
            height = container.clientHeight;
            canvas.width = width;
            canvas.height = height;
            cols = Math.floor(width / colWidth);
            rows = Math.floor(height / rowHeight);
            // Clear and re-init
            ctx.fillStyle = currentBgColor;
            ctx.fillRect(0, 0, width, height);
            pipes.length = 0;
            steps.length = 0;
            for (let i = 0; i < pipeCount; i++) {
                pipes.push(initPipe());
                steps.push(0);
            }
        });

        resizeObserver.observe(container);

        let animationId: number;
        let lastTime = 0;
        let fadeTimer = 0;

        const render = (timestamp: number) => {
            animationId = requestAnimationFrame(render);

            const interval = Math.max(20, 200 - (activeSpeed * 2));
            if (timestamp - lastTime < interval) return;
            lastTime = timestamp;

            // Periodic full fade to prevent clutter buildup
            fadeTimer++;
            if (fadeTimer % 3 === 0) {
                ctx.fillStyle = currentBgColor;
                ctx.globalAlpha = fade;
                ctx.fillRect(0, 0, width, height);
                ctx.globalAlpha = 1.0;
            }

            ctx.font = `${fontSize}px "JetBrains Mono", monospace`;
            ctx.textBaseline = 'top';

            pipes.forEach((p, index) => {
                // Decide: straight or turn
                let newDir = p.dir;
                if (Math.random() > 0.75) {
                    newDir = (p.dir + (Math.random() > 0.5 ? 1 : 3)) % 4;
                }

                // Get character
                const char = getPipeChar(p.dir, newDir);

                // Draw using colWidth for x, rowHeight for y
                ctx.fillStyle = p.color;
                ctx.fillText(char, p.x * colWidth, p.y * rowHeight);

                // Move
                p.dir = newDir;
                if (newDir === 0) p.y--;
                else if (newDir === 1) p.x++;
                else if (newDir === 2) p.y++;
                else if (newDir === 3) p.x--;

                // Wrap
                if (p.x >= cols) p.x = 0;
                if (p.x < 0) p.x = cols - 1;
                if (p.y >= rows) p.y = 0;
                if (p.y < 0) p.y = rows - 1;

                steps[index]++;

                // Reset pipe after lifetime steps (with some random variance)
                if (steps[index] > lifetime + Math.random() * (lifetime * 0.3)) {
                    pipes[index] = initPipe();
                    pipes[index].color = currentColors[Math.floor(Math.random() * currentColors.length)] || '#888';
                    steps[index] = 0;
                }
            });
        };

        // Initial clear
        ctx.fillStyle = currentBgColor;
        ctx.fillRect(0, 0, width, height);

        animationId = requestAnimationFrame(render);

        return () => {
            cancelAnimationFrame(animationId);
            resizeObserver.disconnect();
            themeObserver.disconnect();
        };
    }, [activeSpeed, fade, pipeCount, fontSize, lifetime]);

    return (
        <div ref={containerRef} className="w-full h-full bg-[var(--color-bg)] overflow-hidden rounded relative">
            <canvas ref={canvasRef} className="block w-full h-full" />
        </div>
    );
};

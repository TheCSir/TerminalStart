import React, { useEffect, useRef } from 'react';

interface RainWidgetProps {
    speed?: number;
}

interface Drop {
    x: number;
    y: number;
    speed: number;
    char: string;
    length: number;
}

interface Splash {
    x: number;
    y: number;
    life: number;
    maxLife: number;
}

export const RainWidget: React.FC<RainWidgetProps> = ({ speed = 50 }) => {
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

        const getColors = () => {
            const root = getComputedStyle(document.documentElement);
            return {
                bg: root.getPropertyValue('--color-bg').trim(),
                fg: root.getPropertyValue('--color-fg').trim(),
                accent: root.getPropertyValue('--color-accent').trim(),
                muted: root.getPropertyValue('--color-muted').trim(),
            };
        };

        let colors = getColors();
        const observer = new MutationObserver(() => {
            colors = getColors();
        });
        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['style', 'class', 'data-theme']
        });

        const dropChars = ['│', '┃', '|', '¦'];
        const splashChars = ['·', '.', '∙', '˙', '°'];
        let drops: Drop[] = [];
        let splashes: Splash[] = [];

        const initDrop = (startTop?: boolean): Drop => ({
            x: Math.random() * width,
            y: startTop ? -20 : Math.random() * height * -1,
            speed: 2 + Math.random() * 4,
            char: dropChars[Math.floor(Math.random() * dropChars.length)],
            length: 2 + Math.floor(Math.random() * 4),
        });

        // Initial drops
        const dropCount = Math.floor(width / 8);
        for (let i = 0; i < dropCount; i++) {
            drops.push(initDrop());
        }

        const resizeObserver = new ResizeObserver(() => {
            width = container.clientWidth;
            height = container.clientHeight;
            canvas.width = width;
            canvas.height = height;
        });
        resizeObserver.observe(container);

        let animationId: number;
        let lastTime = 0;

        const render = (timestamp: number) => {
            animationId = requestAnimationFrame(render);

            const interval = Math.max(16, 50 - speed * 0.4);
            if (timestamp - lastTime < interval) return;
            lastTime = timestamp;

            // Clear
            ctx.fillStyle = colors.bg;
            ctx.fillRect(0, 0, width, height);

            ctx.textBaseline = 'top';

            // Draw and update drops
            drops.forEach((d, i) => {
                d.y += d.speed * (speed / 50);

                // Draw rain trail
                for (let j = 0; j < d.length; j++) {
                    const trailY = d.y - j * 10;
                    if (trailY < 0 || trailY > height) continue;

                    const alpha = Math.max(0.1, 1 - j / d.length);
                    ctx.globalAlpha = alpha;
                    ctx.fillStyle = j === 0 ? colors.fg : colors.muted;
                    ctx.font = `${10 + (d.length - j)}px "JetBrains Mono", monospace`;
                    ctx.fillText(d.char, d.x, trailY);
                }
                ctx.globalAlpha = 1.0;

                // Hit ground
                if (d.y > height) {
                    splashes.push({
                        x: d.x,
                        y: height - 8,
                        life: 0,
                        maxLife: 10 + Math.random() * 10,
                    });
                    drops[i] = initDrop(true);
                }
            });

            // Draw splashes
            ctx.font = '8px "JetBrains Mono", monospace';
            splashes = splashes.filter(s => {
                s.life++;
                if (s.life >= s.maxLife) return false;

                const alpha = 1 - s.life / s.maxLife;
                ctx.globalAlpha = alpha * 0.8;
                ctx.fillStyle = colors.accent;

                const spread = s.life * 1.5;
                for (let i = -2; i <= 2; i++) {
                    const char = splashChars[Math.floor(Math.random() * splashChars.length)];
                    ctx.fillText(char, s.x + i * spread, s.y - s.life * 0.5);
                }
                ctx.globalAlpha = 1.0;
                return true;
            });
        };

        ctx.fillStyle = colors.bg;
        ctx.fillRect(0, 0, width, height);

        animationId = requestAnimationFrame(render);

        return () => {
            cancelAnimationFrame(animationId);
            resizeObserver.disconnect();
            observer.disconnect();
        };
    }, [speed]);

    return (
        <div ref={containerRef} className="w-full h-full bg-[var(--color-bg)] overflow-hidden rounded relative">
            <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
        </div>
    );
};

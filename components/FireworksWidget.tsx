import React, { useEffect, useRef } from 'react';

interface FireworksWidgetProps {
    speed?: number;
    explosionSize?: number;
}

interface Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    life: number;
    maxLife: number;
    char: string;
    color: string;
}

interface Rocket {
    x: number;
    y: number;
    vy: number;
    targetY: number;
    color: string;
}

export const FireworksWidget: React.FC<FireworksWidgetProps> = ({ speed = 50, explosionSize = 50 }) => {
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

        let currentColors: { bg: string; fg: string; accent: string; muted: string } = { bg: '#000000', fg: '#ffffff', accent: '#00ff00', muted: '#888888' };
        const updateColors = () => {
            const root = getComputedStyle(document.documentElement);
            currentColors = {
                bg: root.getPropertyValue('--color-bg').trim(),
                fg: root.getPropertyValue('--color-fg').trim(),
                accent: root.getPropertyValue('--color-accent').trim(),
                muted: root.getPropertyValue('--color-muted').trim(),
            };
        };

        // Initialize colors immediately
        updateColors();

        // Observe theme changes
        const observer = new MutationObserver((mutations) => {
            // Check if relevant attributes changed
            const shouldUpdate = mutations.some(m =>
                m.type === 'attributes' &&
                (m.attributeName === 'style' || m.attributeName === 'class' || m.attributeName === 'data-theme')
            );
            if (shouldUpdate) {
                updateColors();
            }
        });

        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['style', 'class', 'data-theme'],
        });

        const sparkChars = ['*', '·', '✦', '✧', '+', '•', '°', '¤'];
        let particles: Particle[] = [];
        let rockets: Rocket[] = [];

        const explode = (x: number, y: number, color: string) => {
            const count = 10 + Math.floor(Math.random() * 8);
            const minDim = Math.min(width, height);
            const velScale = minDim * 0.012 * (explosionSize / 50); // scale burst radius to widget size AND user setting
            for (let i = 0; i < count; i++) {
                const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.3;
                const vel = (0.5 + Math.random() * 1.5) * velScale;
                particles.push({
                    x, y,
                    vx: Math.cos(angle) * vel,
                    vy: Math.sin(angle) * vel,
                    life: 0,
                    maxLife: 20 + Math.random() * 15,
                    char: sparkChars[Math.floor(Math.random() * sparkChars.length)],
                    color,
                });
            }
        };

        const launchRocket = () => {
            const rocketSpeed = height * 0.015; // scale rocket speed to widget height
            rockets.push({
                x: width * 0.1 + Math.random() * width * 0.8, // keep within 10-90% of width
                y: height,
                vy: -(rocketSpeed + Math.random() * rocketSpeed),
                targetY: height * (0.15 + Math.random() * 0.35),
                color: Math.random() > 0.5 ? currentColors.accent : currentColors.fg,
            });
        };

        const resizeObserver = new ResizeObserver(() => {
            width = container.clientWidth;
            height = container.clientHeight;
            canvas.width = width;
            canvas.height = height;
        });
        resizeObserver.observe(container);

        let animationId: number;
        let lastTime = 0;
        let launchTimer = 0;

        const render = (timestamp: number) => {
            animationId = requestAnimationFrame(render);

            const interval = Math.max(16, 60 - speed * 0.5);
            if (timestamp - lastTime < interval) return;
            lastTime = timestamp;

            // Full clear each frame — no burn-in
            ctx.globalAlpha = 1.0;
            ctx.fillStyle = currentColors.bg;
            ctx.fillRect(0, 0, width, height);

            // Launch rockets periodically
            launchTimer++;
            const launchInterval = Math.max(20, 80 - speed * 0.5);
            if (launchTimer >= launchInterval) {
                launchRocket();
                launchTimer = 0;
            }

            // Update and draw rockets
            ctx.font = '12px "JetBrains Mono", monospace';
            ctx.textBaseline = 'top';

            rockets = rockets.filter(r => {
                r.y += r.vy;
                if (r.y <= r.targetY) {
                    explode(r.x, r.y, r.color);
                    return false;
                }
                ctx.fillStyle = r.color;
                ctx.fillText('│', r.x, r.y);
                return true;
            });

            // Update and draw particles
            particles = particles.filter(p => {
                p.x += p.vx;
                p.y += p.vy;
                p.vy += 0.05; // gravity
                p.vx *= 0.98; // drag
                p.life++;

                if (p.life >= p.maxLife) return false;

                const alpha = Math.max(0, 1 - p.life / p.maxLife);
                ctx.globalAlpha = alpha;
                ctx.fillStyle = p.color;
                ctx.fillText(p.char, p.x, p.y);
                ctx.globalAlpha = 1.0;
                return true;
            });
        };

        // Initial clear
        ctx.fillStyle = currentColors.bg;
        ctx.fillRect(0, 0, width, height);

        animationId = requestAnimationFrame(render);

        return () => {
            cancelAnimationFrame(animationId);
            resizeObserver.disconnect();
            observer.disconnect();
        };
    }, [speed, explosionSize]);

    return (
        <div ref={containerRef} className="w-full h-full bg-[var(--color-bg)] overflow-hidden rounded relative">
            <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
        </div>
    );
};

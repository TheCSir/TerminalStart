import React, { useEffect, useRef } from 'react';

interface StarfieldWidgetProps {
    speed?: number;
}

interface Star {
    x: number;
    y: number;
    z: number;
    pz: number;
}

export const StarfieldWidget: React.FC<StarfieldWidgetProps> = ({ speed = 50 }) => {
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

        let currentColors = getColors();

        const observer = new MutationObserver(() => {
            currentColors = getColors();
        });
        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['style', 'class', 'data-theme']
        });

        const starChars = ['.', '·', '∗', '✦', '•', '°'];
        let stars: Star[] = [];

        const initStar = (z?: number): Star => ({
            x: (Math.random() - 0.5) * width * 2,
            y: (Math.random() - 0.5) * height * 2,
            z: z ?? Math.random() * width,
            pz: 0,
        });

        const populateStars = () => {
            const area = width * height;
            // Target ~1 star per 4000px² to reduce clutter
            const count = Math.min(300, Math.max(20, Math.floor(area / 4000)));

            stars = [];
            for (let i = 0; i < count; i++) {
                stars.push(initStar());
            }
        };

        populateStars();

        const resizeObserver = new ResizeObserver(() => {
            width = container.clientWidth;
            height = container.clientHeight;
            canvas.width = width;
            canvas.height = height;
            populateStars(); // Re-populate on resize to adjust density
        });
        resizeObserver.observe(container);

        let animationId: number;

        const render = () => {
            animationId = requestAnimationFrame(render);

            const colors = currentColors;
            const spd = speed * 0.15;

            // Full clear — no burn-in
            ctx.globalAlpha = 1.0;
            ctx.fillStyle = colors.bg;
            ctx.fillRect(0, 0, width, height);

            const cx = width / 2;
            const cy = height / 2;

            ctx.textBaseline = 'middle';

            for (let i = 0; i < stars.length; i++) {
                const s = stars[i];
                s.pz = s.z;
                s.z -= spd;

                if (s.z <= 0) {
                    Object.assign(s, initStar(width));
                    s.pz = s.z;
                    continue;
                }

                // Project to 2D
                const sx = (s.x / s.z) * (width / 4) + cx;
                const sy = (s.y / s.z) * (height / 4) + cy;

                if (sx < 0 || sx >= width || sy < 0 || sy >= height) {
                    Object.assign(s, initStar(width));
                    s.pz = s.z;
                    continue;
                }

                // Size based on depth
                const r = Math.max(0, 1 - s.z / width);
                const charIndex = Math.min(starChars.length - 1, Math.floor(r * starChars.length));
                const fontSize = 8 + r * 10;

                ctx.font = `${fontSize}px "JetBrains Mono", monospace`;
                ctx.globalAlpha = 0.3 + r * 0.7;

                // Bright stars get accent color
                if (r > 0.7) {
                    ctx.fillStyle = colors.accent;
                } else if (r > 0.4) {
                    ctx.fillStyle = colors.fg;
                } else {
                    ctx.fillStyle = colors.muted;
                }

                ctx.fillText(starChars[charIndex], sx, sy);

                // Draw trail line for close stars
                if (r > 0.5 && spd > 2) {
                    const psx = (s.x / s.pz) * (width / 4) + cx;
                    const psy = (s.y / s.pz) * (height / 4) + cy;
                    ctx.beginPath();
                    ctx.moveTo(psx, psy);
                    ctx.lineTo(sx, sy);
                    ctx.strokeStyle = colors.accent;
                    ctx.globalAlpha = r * 0.3;
                    ctx.lineWidth = 1;
                    ctx.stroke();
                }

                ctx.globalAlpha = 1.0;
            }
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
    }, [speed]);

    return (
        <div ref={containerRef} className="w-full h-full bg-[var(--color-bg)] overflow-hidden rounded relative">
            <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
        </div>
    );
};

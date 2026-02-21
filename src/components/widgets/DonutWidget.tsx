import React, { useEffect, useRef, useState } from 'react';

interface DonutWidgetProps {
    speed?: number;
}

export const DonutWidget: React.FC<DonutWidgetProps> = ({ speed = 50 }) => {
    const preRef = useRef<HTMLPreElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [scale, setScale] = useState(1);

    // Donut Animation Loop
    useEffect(() => {
        let A = 0, B = 0;
        let intervalId: number;

        const renderDonut = () => {
            if (!preRef.current) return;

            let b = [];
            let z = [];
            A += 0.07;
            B += 0.03;
            let cA = Math.cos(A), sA = Math.sin(A),
                cB = Math.cos(B), sB = Math.sin(B);

            // Initialize buffer
            for (let k = 0; k < 1760; k++) {
                b[k] = k % 80 === 79 ? "\n" : " ";
                z[k] = 0;
            }

            for (let j = 0; j < 6.28; j += 0.07) {
                let ct = Math.cos(j), st = Math.sin(j);
                for (let i = 0; i < 6.28; i += 0.02) {
                    let sp = Math.sin(i), cp = Math.cos(i),
                        h = ct + 2, // R1 + R2*cos(theta)
                        D = 1 / (sp * h * sA + st * cA + 5), // 1/z
                        t = sp * h * cA - st * sA;

                    let x = 0 | (40 + 30 * D * (cp * h * cB - t * sB)),
                        y = 0 | (12 + 15 * D * (cp * h * sB + t * cB)),
                        o = x + 80 * y,
                        N = 0 | (8 * ((st * sA - sp * ct * cA) * cB - sp * ct * sA - st * cA - cp * ct * sB));

                    if (y < 22 && y >= 0 && x >= 0 && x < 79 && D > z[o]) {
                        z[o] = D;
                        b[o] = ".,-~:;=!*#$@"[N > 0 ? N : 0];
                    }
                }
            }
            preRef.current.innerText = b.join("");
        };

        // Determine interval based on speed
        // Speed 50 (default) -> 100ms
        // Speed 1 -> 200ms
        // Speed 100 -> 0ms (capped at 10ms for safety)
        const intervalDelay = Math.max(10, 200 - (speed * 2));

        intervalId = window.setInterval(renderDonut, intervalDelay);
        return () => clearInterval(intervalId);
    }, [speed]);

    // Auto-scale logic
    useEffect(() => {
        const handleResize = () => {
            if (containerRef.current) {
                const { clientWidth, clientHeight } = containerRef.current;

                // Donut Dimensions (Characters)
                const COLS = 80;
                const ROWS = 22;

                // Font Metrics for 12px Courier New (Approximate)
                // Width per char is roughly 0.6em (7.2px)
                // Line height is roughly 12px
                const CHAR_W = 7.22;
                const CHAR_H = 12;

                const textBlockWidth = COLS * CHAR_W;
                const textBlockHeight = ROWS * CHAR_H;

                const scaleX = clientWidth / textBlockWidth;
                const scaleY = clientHeight / textBlockHeight;

                // Fit to container with padding
                const newScale = Math.min(scaleX, scaleY) * 0.95;
                setScale(newScale);
            }
        };

        const observer = new ResizeObserver(handleResize);
        if (containerRef.current) {
            observer.observe(containerRef.current);
        }
        // Small delay to allow font loading or layout settle
        setTimeout(handleResize, 100);

        return () => observer.disconnect();
    }, []);

    return (
        <div ref={containerRef} className="w-full h-full flex items-center justify-center overflow-hidden bg-[var(--color-bg)] rounded text-[var(--color-accent)]">
            <pre
                ref={preRef}
                className="font-mono whitespace-pre select-none origin-center transition-transform duration-75 ease-out"
                style={{
                    fontFamily: '"Courier New", Courier, monospace',
                    fontSize: '12px',
                    lineHeight: '12px',
                    transform: `scale(${scale})`
                }}
            ></pre>
        </div>
    );
};
import React from 'react';

// Simple SVG Sparkline Component

export interface SparklineProps {
    data: number[];
    color?: string;
    max?: number;
    min?: number;
}

export const Sparkline: React.FC<SparklineProps> = ({ data, color = "var(--color-accent)", max: fixedMax, min: fixedMin }) => {
    if (data.length < 2) return null;

    const width = 100;
    const height = 100;
    const values = data;
    const min = fixedMin ?? Math.min(...values);
    const max = fixedMax ?? Math.max(...values, min + 1); // Avoid div by zero
    const range = max - min;

    // Generate polyline points
    const points = values.map((v, i) => {
        const x = (i / (values.length - 1)) * width;
        // Normalize Y (0 is top in SVG, so we invert)
        const normalizedY = (v - min) / (range || 1);
        const y = height - (normalizedY * height);
        return `${x},${y}`;
    }).join(' ');

    return (
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full opacity-80" preserveAspectRatio="none">
            <polyline
                fill="none"
                stroke={color}
                strokeWidth="1.5"
                points={points}
                vectorEffect="non-scaling-stroke"
            />
        </svg>
    );
};

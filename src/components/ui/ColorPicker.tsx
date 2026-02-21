import React, { useState, useRef, useEffect, useCallback } from 'react';
import { hexToHsv, hsvToHex } from '@/utils/colorUtils';

export interface SatValBoxProps {
    hsv: { h: number, s: number, v: number };
    onChange: (newHsv: { h: number, s: number, v: number }) => void;
}

export const SatValBox: React.FC<SatValBoxProps> = ({ hsv, onChange }) => {
    const boxRef = useRef<HTMLDivElement>(null);
    const [isDragging, setIsDragging] = useState(false);

    const handleMove = useCallback((e: MouseEvent) => {
        if (!boxRef.current) return;
        const rect = boxRef.current.getBoundingClientRect();
        const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
        const y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));

        // x is saturation (0..100), y is value (100..0)
        onChange({ ...hsv, s: x * 100, v: (1 - y) * 100 });
    }, [hsv, onChange]);

    useEffect(() => {
        const up = () => setIsDragging(false);
        const move = (e: MouseEvent) => { if (isDragging) handleMove(e); };

        if (isDragging) {
            window.addEventListener('mouseup', up);
            window.addEventListener('mousemove', move);
        }

        return () => {
            window.removeEventListener('mouseup', up);
            window.removeEventListener('mousemove', move);
        };
    }, [isDragging, handleMove]);

    return (
        <div
            ref={boxRef}
            className="w-full h-32 relative cursor-crosshair border border-[var(--color-border)] mb-2"
            style={{
                backgroundColor: `hsl(${hsv.h}, 100%, 50%)`,
                backgroundImage: 'linear-gradient(to right, #fff, transparent), linear-gradient(to top, #000, transparent)'
            }}
            onMouseDown={(e) => {
                setIsDragging(true);
                handleMove(e.nativeEvent);
            }}
        >
            <div
                className="absolute w-3 h-3 border-2 border-black bg-white rounded-full -ml-1.5 -mt-1.5 shadow-sm pointer-events-none mix-blend-difference"
                style={{
                    left: `${hsv.s}%`,
                    top: `${100 - hsv.v}%`
                }}
            />
        </div>
    );
};

export interface HueSliderProps {
    hsv: { h: number, s: number, v: number };
    onChange: (newHsv: { h: number, s: number, v: number }) => void;
}

export const HueSlider: React.FC<HueSliderProps> = ({ hsv, onChange }) => {
    const sliderRef = useRef<HTMLDivElement>(null);
    const [isDragging, setIsDragging] = useState(false);

    const handleMove = useCallback((e: MouseEvent) => {
        if (!sliderRef.current) return;
        const rect = sliderRef.current.getBoundingClientRect();
        const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
        onChange({ ...hsv, h: x * 360 });
    }, [hsv, onChange]);

    useEffect(() => {
        const up = () => setIsDragging(false);
        const move = (e: MouseEvent) => { if (isDragging) handleMove(e); };

        if (isDragging) {
            window.addEventListener('mouseup', up);
            window.addEventListener('mousemove', move);
        }

        return () => {
            window.removeEventListener('mouseup', up);
            window.removeEventListener('mousemove', move);
        };
    }, [isDragging, handleMove]);

    return (

        <div
            ref={sliderRef}
            className="w-full h-4 relative cursor-crosshair mb-2"
            style={{
                background: 'linear-gradient(to right, #f00, #ff0, #0f0, #0ff, #00f, #f0f, #f00)',
                borderRadius: 'var(--widget-radius)'
            }}
            onMouseDown={(e) => {
                setIsDragging(true);
                handleMove(e.nativeEvent);
            }}
        >
            <div
                className="absolute w-2 h-full bg-white border border-black -ml-1 pointer-events-none"
                style={{ left: `${(hsv.h / 360) * 100}%` }}
            />
        </div>
    );
};

export interface TuiColorPickerProps {
    label: string;
    value: string;
    onChange: (val: string) => void;
}

export const TuiColorPicker: React.FC<TuiColorPickerProps> = ({ label, value, onChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [hsv, setHsv] = useState(hexToHsv(value));
    const wrapperRef = useRef<HTMLDivElement>(null);

    // Sync internal state if external value changes (and we aren't dragging ideally, but simple sync is fine)
    useEffect(() => {
        setHsv(hexToHsv(value));
    }, [value]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        if (isOpen) document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    const handleHsvChange = (newHsv: { h: number, s: number, v: number }) => {
        setHsv(newHsv);
        onChange(hsvToHex(newHsv.h, newHsv.s, newHsv.v));
    };

    return (
        <div className="flex flex-col gap-1 p-2 border-b border-[var(--color-border)] last:border-0 border-opacity-30 relative" ref={wrapperRef}>
            <div className="flex items-center justify-between">
                <span className="font-mono text-sm uppercase text-[var(--color-accent)]">{label}</span>
                <div className="flex items-center gap-2">
                    <input
                        type="text"
                        value={value}
                        onChange={(e) => {
                            onChange(e.target.value);
                            setHsv(hexToHsv(e.target.value));
                        }}
                        className="bg-transparent border-b border-[var(--color-muted)] text-[var(--color-fg)] font-mono text-xs w-20 px-1 focus:border-[var(--color-accent)] outline-none text-right"
                    />
                    <div
                        onClick={() => setIsOpen(!isOpen)}
                        className="w-6 h-6 border border-[var(--color-border)] cursor-pointer hover:border-[var(--color-accent)]"
                        style={{ backgroundColor: value }}
                    />
                </div>
            </div>

            {isOpen && (
                <div className="absolute top-full right-0 mt-1 p-3 bg-[var(--color-bg)] border border-[var(--color-accent)] z-50 w-64 shadow-2xl">
                    <SatValBox hsv={hsv} onChange={handleHsvChange} />
                    <HueSlider hsv={hsv} onChange={handleHsvChange} />
                    <div className="text-right text-[10px] text-[var(--color-muted)] tracking-widest uppercase">
                        H:{Math.round(hsv.h)} S:{Math.round(hsv.s)} V:{Math.round(hsv.v)}
                    </div>
                </div>
            )}
        </div>
    );
};

import React, { useState, useRef, useEffect } from 'react';
import { Theme } from '@/types';
import { TuiColorPicker } from '@/components/ui/ColorPicker';

interface ThemeMakerState {
    name: string;
    bg: string;
    fg: string;
    accent: string;
    muted: string;
    border: string;
    hover: string;
}

interface ThemeMakerProps {
    onSave: (theme: Theme) => void;
    onClose: () => void;
    initialTheme?: Theme;
}

export const ThemeMaker: React.FC<ThemeMakerProps> = ({ onSave, onClose, initialTheme }) => {
    const [state, setState] = useState<ThemeMakerState>({
        name: initialTheme?.name || '',
        bg: initialTheme?.colors.bg || '#0d0d0d',
        fg: initialTheme?.colors.fg || '#e0e0e0',
        accent: initialTheme?.colors.accent || '#ffffff',
        muted: initialTheme?.colors.muted || '#777777',
        border: initialTheme?.colors.border || '#333333',
        hover: initialTheme?.colors.hover || '#222222',
    });

    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const dragStartPos = useRef({ x: 0, y: 0 });
    const containerRef = useRef<HTMLDivElement>(null);

    // Save handler
    const handleSave = () => {
        if (!state.name.trim()) return;

        const newTheme: Theme = {
            name: state.name.trim(),
            colors: {
                bg: state.bg,
                fg: state.fg,
                accent: state.accent,
                muted: state.muted,
                border: state.border,
                hover: state.hover,
            }
        };
        onSave(newTheme);
    };

    // Drag handlers (copied from Settings.tsx pattern)
    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (isDragging) {
                const newX = e.clientX - dragStartPos.current.x;
                const newY = e.clientY - dragStartPos.current.y;
                setPosition({ x: newX, y: newY });
            }
        };

        const handleMouseUp = () => {
            setIsDragging(false);
        };

        if (isDragging) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        }

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging]);

    const handleMouseDown = (e: React.MouseEvent) => {
        // Only drag from header
        const target = e.target as HTMLElement;
        if (target.closest('[data-drag-handle]')) {
            setIsDragging(true);
            dragStartPos.current = {
                x: e.clientX - position.x,
                y: e.clientY - position.y
            };
        }
    };

    return (
        <div
            ref={containerRef}
            style={{
                transform: `translate(${position.x}px, ${position.y}px)`,
            }}
            className="fixed top-1/2 left-1/2 -ml-[300px] -mt-[250px] w-[600px] h-[550px] bg-[var(--color-bg)] border border-[var(--color-border)] shadow-2xl z-50 flex flex-col font-mono text-[var(--color-accent)] modal-rounded overflow-hidden"
        >
            {/* Header */}
            <div
                data-drag-handle
                onMouseDown={handleMouseDown}
                className="flex justify-between items-center p-2 border-b border-[var(--color-border)] bg-[var(--color-hover)] cursor-move select-none"
            >
                <div className="flex items-center gap-2">
                    <span className="text-[var(--color-accent)] font-bold">⬡</span>
                    <span className="font-bold text-[var(--color-accent)]">theme_maker.exe</span>
                </div>
                <button
                    onClick={onClose}
                    className="text-[var(--color-muted)] hover:text-[var(--color-accent)] transition-colors px-2"
                >
                    [x]
                </button>
            </div>

            <div className="flex-1 flex overflow-hidden">
                {/* Controls Sidebar */}
                <div className="w-1/2 border-r border-[var(--color-border)] p-4 overflow-y-auto space-y-6">
                    {/* Name Input */}
                    <div className="space-y-2">
                        <label className="text-xs uppercase text-[var(--color-accent)] font-bold">Theme Name</label>
                        <input
                            type="text"
                            value={state.name}
                            onChange={(e) => setState({ ...state, name: e.target.value })}
                            placeholder="my_cool_theme"
                            className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-fg)] px-2 py-1 outline-none focus:border-[var(--color-accent)] font-mono"
                        />
                    </div>

                    {/* Colors */}
                    <div className="space-y-1 border border-[var(--color-border)]" style={{ borderRadius: 'var(--widget-radius)' }}>
                        <TuiColorPicker label="Background" value={state.bg} onChange={(v) => setState(prev => ({ ...prev, bg: v }))} />
                        <TuiColorPicker label="Foreground" value={state.fg} onChange={(v) => setState(prev => ({ ...prev, fg: v }))} />
                        <TuiColorPicker label="Accent" value={state.accent} onChange={(v) => setState(prev => ({ ...prev, accent: v }))} />
                        <TuiColorPicker label="Muted" value={state.muted} onChange={(v) => setState(prev => ({ ...prev, muted: v }))} />
                        <TuiColorPicker label="Border" value={state.border} onChange={(v) => setState(prev => ({ ...prev, border: v }))} />
                        <TuiColorPicker label="Hover" value={state.hover} onChange={(v) => setState(prev => ({ ...prev, hover: v }))} />
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-4">
                        <button
                            onClick={handleSave}
                            disabled={!state.name.trim()}
                            className="flex-1 bg-[var(--color-accent)] text-[var(--color-bg)] font-bold py-2 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            SAVE
                        </button>
                        <button
                            onClick={onClose}
                            className="flex-1 border border-[var(--color-border)] text-[var(--color-fg)] py-2 hover:bg-[var(--color-hover)]"
                        >
                            CANCEL
                        </button>
                    </div>
                </div>

                {/* Live Preview */}
                <div
                    className="w-1/2 p-4 flex flex-col gap-4 relative"
                    style={{
                        backgroundColor: state.bg,
                        color: state.fg,
                        borderColor: state.border
                    }}
                >
                    <div className="absolute inset-0 pointer-events-none border-2 border-dashed border-white opacity-20 m-2 flex items-center justify-center">
                        <span className="bg-black text-white px-2 py-1 text-xs">PREVIEW AREA</span>
                    </div>

                    {/* Dummy UI Elements to show off the theme */}
                    <div className="z-10 flex flex-col gap-4 h-full">
                        <div className="border-b" style={{ borderColor: state.border, paddingBottom: '0.5rem' }}>
                            <span style={{ color: state.accent, fontWeight: 'bold' }}>user@terminal:~$</span> list
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                            <div className="p-2 border" style={{ borderColor: state.border, backgroundColor: state.hover }}>
                                <span style={{ color: state.accent }}>Box 1 (Hover)</span>
                            </div>
                            <div className="p-2 border" style={{ borderColor: state.border }}>
                                <span>Box 2</span>
                            </div>
                        </div>

                        <div className="space-y-1 text-sm">
                            <div className="flex justify-between">
                                <span>CPU Usage</span>
                                <span style={{ color: state.accent }}>42%</span>
                            </div>
                            <div className="w-full h-2 overflow-hidden" style={{ backgroundColor: state.border, borderRadius: 'var(--widget-radius)' }}>
                                <div className="h-full w-[42%]" style={{ backgroundColor: state.accent }} />
                            </div>
                        </div>

                        <div className="mt-auto pt-4 border-t" style={{ borderColor: state.border, color: state.muted }}>
                            <p className="text-xs">System status: ONLINE</p>
                            <p className="text-xs">Last login: Today</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

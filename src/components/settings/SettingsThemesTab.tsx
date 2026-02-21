import React from 'react';
import { THEMES } from '@/constants';

interface SettingsThemesTabProps {
    currentTheme: string;
    onThemeChange: (themeName: string) => void;
    customThemes: Record<string, any>;
    onDeleteCustomTheme?: (name: string) => void;
    onOpenThemeMaker?: () => void;
}

export const SettingsThemesTab: React.FC<SettingsThemesTabProps> = ({
    currentTheme,
    onThemeChange,
    customThemes,
    onDeleteCustomTheme,
    onOpenThemeMaker,
}) => {
    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div
                onClick={onOpenThemeMaker}
                className="border border-[var(--color-accent)] border-dashed p-2 cursor-pointer hover:bg-[var(--color-hover)] flex flex-col items-center justify-center gap-2 text-center group min-h-[80px]"
            >
                <span className="text-2xl text-[var(--color-accent)] group-hover:scale-110 transition-transform">+</span>
                <span className="text-xs font-mono text-[var(--color-accent)]">CREATE NEW</span>
            </div>

            {Object.entries(customThemes).map(([key, theme]: [string, any]) => (
                <div
                    key={key}
                    onClick={() => onThemeChange(key)}
                    className={`
                        border p-2 cursor-pointer transition-all relative overflow-hidden group min-h-[80px] flex flex-col justify-between
                        ${currentTheme === key
                            ? 'border-[var(--color-accent)] bg-[var(--color-hover)]'
                            : 'border-[var(--color-border)] hover:border-[var(--color-muted)]'
                        }
                    `}
                >
                    <div className="flex items-center justify-between gap-1 mb-2 px-1">
                        <div className="flex items-center gap-2 overflow-hidden w-full pr-8">
                            <span className="font-mono text-xs uppercase truncate text-[var(--color-accent)]">{theme.name}</span>
                        </div>
                    </div>
                    <div className="flex w-full h-8 gap-0 mt-auto">
                        <div className="flex-1 h-full" style={{ backgroundColor: theme.colors.bg }} />
                        <div className="flex-1 h-full" style={{ backgroundColor: theme.colors.fg }} />
                        <div className="flex-1 h-full" style={{ backgroundColor: theme.colors.accent }} />
                    </div>
                    <div
                        onClick={(e) => {
                            e.stopPropagation();
                            onDeleteCustomTheme?.(key);
                        }}
                        className="absolute top-0 right-0 bg-[var(--color-bg)] border-l border-b border-[var(--color-border)] px-2 py-0.5 cursor-pointer hover:text-[var(--color-accent)] hover:border-[var(--color-accent)] transition-all z-10"
                        title="Delete Theme"
                    >
                        <span className="block group-hover:hidden text-[10px] text-[var(--color-accent)] font-bold">CUSTOM</span>
                        <span className="hidden group-hover:block text-[10px] font-bold text-[var(--color-accent)]">[x]</span>
                    </div>
                </div>
            ))}

            {Object.keys(THEMES).map(themeKey => (
                <div
                    key={themeKey}
                    onClick={() => onThemeChange(themeKey)}
                    className={`
                        border p-2 cursor-pointer transition-all relative overflow-hidden group min-h-[80px] flex flex-col justify-between
                        ${currentTheme === themeKey
                            ? 'border-[var(--color-accent)] bg-[var(--color-hover)]'
                            : 'border-[var(--color-border)] hover:border-[var(--color-muted)]'}
                    `}
                >
                    <div className="flex items-center justify-between gap-1 mb-2 px-1">
                        <div className="flex items-center gap-2 overflow-hidden w-full">
                            <span className="font-mono text-xs uppercase truncate text-[var(--color-accent)]">{THEMES[themeKey].name}</span>
                        </div>
                    </div>
                    <div className="flex w-full h-8 gap-0 mt-auto">
                        <div className="flex-1 h-full" style={{ backgroundColor: THEMES[themeKey].colors.bg }} />
                        <div className="flex-1 h-full" style={{ backgroundColor: THEMES[themeKey].colors.fg }} />
                        <div className="flex-1 h-full" style={{ backgroundColor: THEMES[themeKey].colors.accent }} />
                    </div>
                </div>
            ))}
        </div>
    );
};

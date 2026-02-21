import React, { useState } from 'react';
import { AsciiSlider } from '@/components/ui/AsciiSlider';
import { MarketConfig, MarketProvider, TodoistConfig } from '@/types';

interface SettingsAdvancedTabProps {
    showWidgetTitles: boolean;
    onToggleWidgetTitles: () => void;
    reserveSettingsSpace: boolean;
    onToggleReserveSettings: () => void;
    customFont: string;
    onCustomFontChange: (font: string) => void;
    widgetRadius?: number;
    onWidgetRadiusChange?: (value: number) => void;
    isLayoutLocked: boolean;
    onToggleLayoutLock: () => void;
    onResetLayout: () => void;
    isResizingEnabled: boolean;
    onToggleResizing: () => void;
    statsMode: 'text' | 'graph' | 'detailed' | 'minimal';
    onStatsModeChange: (mode: 'text' | 'graph' | 'detailed' | 'minimal') => void;
    weatherMode: 'standard' | 'icon';
    onWeatherModeChange: (mode: 'standard' | 'icon') => void;
    tempUnit: 'C' | 'F';
    onTempUnitChange: (unit: 'C' | 'F') => void;
    openInNewTab?: boolean;
    onToggleOpenInNewTab?: () => void;
    activeWidgets: Record<string, boolean>;
    funOptions: {
        matrix: { speed: number; fade: number; charSet: 'numbers' | 'latin' | 'mixed'; charFlux: number; glow: boolean; fontSize: number };
        pipes: { speed: number; fade: number; count: number; fontSize: number; lifetime: number };
        donut: { speed: number };
        snake: { speed: number };
        life: { speed: number };
        fireworks: { speed: number; explosionSize: number };
        starfield: { speed: number };
        rain: { speed: number };
        maze: { speed: number };
    };
    onFunOptionsChange: (options: any) => void;
    customCss: string;
    onCustomCssChange: (css: string) => void;
    marketConfig?: MarketConfig;
    onMarketConfigChange?: (config: MarketConfig) => void;
    borderGlow?: boolean;
    onToggleBorderGlow?: () => void;
    animatedLinks?: boolean;
    onToggleAnimatedLinks?: () => void;
    todoistConfig?: TodoistConfig;
    onTodoistConfigChange?: (config: TodoistConfig) => void;
}

export const SettingsAdvancedTab: React.FC<SettingsAdvancedTabProps> = ({
    showWidgetTitles,
    onToggleWidgetTitles,
    reserveSettingsSpace,
    onToggleReserveSettings,
    customFont,
    onCustomFontChange,
    widgetRadius = 4,
    onWidgetRadiusChange,
    isLayoutLocked,
    onToggleLayoutLock,
    onResetLayout,
    isResizingEnabled,
    onToggleResizing,
    statsMode,
    onStatsModeChange,
    weatherMode,
    onWeatherModeChange,
    tempUnit,
    onTempUnitChange,
    openInNewTab,
    onToggleOpenInNewTab,
    activeWidgets,
    funOptions,
    onFunOptionsChange,
    customCss,
    onCustomCssChange,
    marketConfig,
    onMarketConfigChange,
    borderGlow,
    onToggleBorderGlow,
    animatedLinks,
    onToggleAnimatedLinks,
    todoistConfig,
    onTodoistConfigChange,
}) => {
    const [symbolsInput, setSymbolsInput] = useState(marketConfig?.symbols.join(', ') ?? '');
    return (
        <div className="space-y-6">

            <div className="border border-[var(--color-border)] p-4">
                <h3 className="text-[var(--color-accent)] font-bold mb-2">Appearance</h3>
                <div className="flex flex-col gap-3">

                    <div
                        onClick={onToggleWidgetTitles}
                        className="flex items-center gap-2 cursor-pointer select-none group"
                    >
                        <span className="font-mono text-[var(--color-accent)] font-bold">
                            {showWidgetTitles ? '[x]' : '[ ]'}
                        </span>
                        <span className="text-[var(--color-fg)] text-sm group-hover:text-[var(--color-fg)]">Show Widget Titles</span>
                    </div>

                    <div
                        onClick={onToggleReserveSettings}
                        className="flex items-center gap-2 cursor-pointer select-none group mt-3"
                    >
                        <span className="font-mono text-[var(--color-accent)] font-bold">
                            {reserveSettingsSpace ? '[x]' : '[ ]'}
                        </span>
                        <span className="text-[var(--color-fg)] text-sm group-hover:text-[var(--color-fg)]">Reserve Settings Space</span>
                    </div>

                    <div
                        onClick={onToggleBorderGlow}
                        className="flex items-center gap-2 cursor-pointer select-none group mt-3"
                    >
                        <span className="font-mono text-[var(--color-accent)] font-bold">
                            {borderGlow ? '[x]' : '[ ]'}
                        </span>
                        <span className="text-[var(--color-fg)] text-sm group-hover:text-[var(--color-fg)]">Border Glow Effect</span>
                    </div>

                    <div className="flex flex-col gap-1 mt-2">
                        <span className="text-[var(--color-muted)] text-xs">Custom Font Family</span>
                        <input
                            type="text"
                            placeholder="e.g. Comic Sans MS, Arial"
                            className="bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-fg)] px-2 py-1 text-sm focus:border-[var(--color-accent)] outline-none w-full select-text font-sans"
                            value={customFont}
                            onChange={(e) => onCustomFontChange(e.target.value)}
                        />
                        <span className="text-[var(--color-muted)] text-[10px] opacity-60">Press enter or click away to apply.</span>
                    </div>


                    <div className="flex flex-col gap-1 mt-2 border-t border-[var(--color-border)] pt-2 border-dashed">
                        <AsciiSlider
                            label="Widget Roundness"
                            value={widgetRadius}
                            min={0}
                            max={24}
                            displayValue={`${widgetRadius}px`}
                            onChange={(v) => onWidgetRadiusChange?.(v)}
                            hint="0 = sharp corners, 24 = very round"
                        />
                    </div>
                </div>
            </div>


            <div className="border border-[var(--color-border)] p-4">
                <h3 className="text-[var(--color-accent)] font-bold mb-2">Layout</h3>
                <div className="flex flex-col gap-3">

                    <div className="flex items-center gap-4">
                        <button
                            onClick={onToggleLayoutLock}
                            className={`px-3 py-1 border text-xs font-mono transition-colors no-radius ${isLayoutLocked ? 'border-[var(--color-accent)] text-[var(--color-accent)]' : 'border-[var(--color-border)] text-[var(--color-muted)] hover:text-[var(--color-fg)]'}`}
                        >
                            [{isLayoutLocked ? 'LOCKED' : 'UNLOCKED'}]
                        </button>
                        <button
                            onClick={onResetLayout}
                            className="px-3 py-1 border border-[var(--color-border)] text-[var(--color-muted)] hover:text-red-500 hover:border-red-500 text-xs font-mono no-radius"
                        >
                            [RESET TO DEFAULT]
                        </button>
                    </div>


                    <div
                        onClick={onToggleResizing}
                        className="flex items-center gap-2 cursor-pointer mt-2 group text-xs font-mono text-left select-none"
                    >
                        <span className={`text-[var(--color-accent)] font-bold`}>
                            {isResizingEnabled ? '[x]' : '[ ]'}
                        </span>
                        <span className={`${isResizingEnabled ? 'text-[var(--color-fg)]' : 'text-[var(--color-muted)] group-hover:text-[var(--color-fg)]'}`}>
                            Enable Resizing (Experimental)
                        </span>
                    </div>
                </div>
            </div>


            <div className="border border-[var(--color-border)] p-4">
                <h3 className="text-[var(--color-accent)] font-bold mb-2">Status Widget Style</h3>
                <div className="flex flex-col sm:flex-row gap-4 flex-wrap">
                    <div onClick={() => onStatsModeChange('text')} className="flex items-center gap-2 cursor-pointer select-none group">
                        <span className="font-mono text-[var(--color-accent)] font-bold">
                            {statsMode === 'text' ? '[x]' : '[ ]'}
                        </span>
                        <span className="text-[var(--color-fg)] group-hover:text-[var(--color-accent)]">Text</span>
                    </div>
                    <div onClick={() => onStatsModeChange('graph')} className="flex items-center gap-2 cursor-pointer select-none group">
                        <span className="font-mono text-[var(--color-accent)] font-bold">
                            {statsMode === 'graph' ? '[x]' : '[ ]'}
                        </span>
                        <span className="text-[var(--color-fg)] group-hover:text-[var(--color-accent)]">Graphs</span>
                    </div>
                    <div onClick={() => onStatsModeChange('detailed')} className="flex items-center gap-2 cursor-pointer select-none group">
                        <span className="font-mono text-[var(--color-accent)] font-bold">
                            {statsMode === 'detailed' ? '[x]' : '[ ]'}
                        </span>
                        <span className="text-[var(--color-fg)] group-hover:text-[var(--color-accent)]">Detailed</span>
                    </div>
                    <div onClick={() => onStatsModeChange('minimal')} className="flex items-center gap-2 cursor-pointer select-none group">
                        <span className="font-mono text-[var(--color-accent)] font-bold">
                            {statsMode === 'minimal' ? '[x]' : '[ ]'}
                        </span>
                        <span className="text-[var(--color-fg)] group-hover:text-[var(--color-accent)]">Compact</span>
                    </div>
                </div>
            </div>


            <div className="border border-[var(--color-border)] p-4">
                <h3 className="text-[var(--color-accent)] font-bold mb-2">Weather Style</h3>
                <div className="flex flex-col gap-4">

                    <div className="flex flex-col sm:flex-row gap-4">
                        <div onClick={() => onWeatherModeChange('standard')} className="flex items-center gap-2 cursor-pointer select-none group">
                            <span className="font-mono text-[var(--color-accent)] font-bold">
                                {weatherMode === 'standard' ? '[x]' : '[ ]'}
                            </span>
                            <span className="text-[var(--color-fg)] group-hover:text-[var(--color-accent)]">Standard</span>
                        </div>
                        <div onClick={() => onWeatherModeChange('icon')} className="flex items-center gap-2 cursor-pointer select-none group">
                            <span className="font-mono text-[var(--color-accent)] font-bold">
                                {weatherMode === 'icon' ? '[x]' : '[ ]'}
                            </span>
                            <span className="text-[var(--color-fg)] group-hover:text-[var(--color-accent)]">Icon Mode</span>
                        </div>
                    </div>


                    <div className="flex items-center gap-4 mt-2 border-t border-[var(--color-border)] pt-2 border-dashed">
                        <span className="text-[var(--color-muted)] text-sm">Units:</span>
                        <div onClick={() => onTempUnitChange('C')} className="flex items-center gap-2 cursor-pointer select-none group">
                            <span className="font-mono text-[var(--color-accent)] font-bold">
                                {tempUnit === 'C' ? '[x]' : '[ ]'}
                            </span>
                            <span className="text-[var(--color-fg)] group-hover:text-[var(--color-accent)]">Celsius (°C)</span>
                        </div>
                        <div onClick={() => onTempUnitChange('F')} className="flex items-center gap-2 cursor-pointer select-none group">
                            <span className="font-mono text-[var(--color-accent)] font-bold">
                                {tempUnit === 'F' ? '[x]' : '[ ]'}
                            </span>
                            <span className="text-[var(--color-fg)] group-hover:text-[var(--color-accent)]">Fahrenheit (°F)</span>
                        </div>
                    </div>
                </div>
            </div>


            <div className="border border-[var(--color-border)] p-4">
                <h3 className="text-[var(--color-accent)] font-bold mb-2">Link Behavior</h3>
                <div className="flex flex-col gap-3">
                    <div onClick={() => onToggleOpenInNewTab?.()} className="flex items-center gap-2 cursor-pointer select-none group">
                        <span className="font-mono text-[var(--color-accent)] font-bold">
                            {openInNewTab ? '[x]' : '[ ]'}
                        </span>
                        <span className="text-[var(--color-fg)] group-hover:text-[var(--color-accent)]">Open Links in New Tab</span>
                    </div>
                    <div onClick={() => onToggleAnimatedLinks?.()} className="flex items-center gap-2 cursor-pointer select-none group">
                        <span className="font-mono text-[var(--color-accent)] font-bold">
                            {animatedLinks ? '[x]' : '[ ]'}
                        </span>
                        <span className="text-[var(--color-fg)] group-hover:text-[var(--color-accent)]">Animated Links</span>
                    </div>
                </div>
            </div>

            {/* todoist integration */}
            {activeWidgets['todo'] && todoistConfig && onTodoistConfigChange && (
                <div className="border border-[var(--color-border)] p-4 space-y-3">
                    <h3 className="text-[var(--color-accent)] font-bold">⬡ Todo Widget</h3>

                    <div
                        onClick={() => onTodoistConfigChange({ ...todoistConfig, enabled: !todoistConfig.enabled })}
                        className="flex items-center gap-2 cursor-pointer select-none group"
                    >
                        <span className="font-mono text-[var(--color-accent)] font-bold">
                            {todoistConfig.enabled ? '[x]' : '[ ]'}
                        </span>
                        <span className="text-[var(--color-fg)] text-sm group-hover:text-[var(--color-accent)]">
                            Sync with Todoist
                        </span>
                    </div>

                    {todoistConfig.enabled && (
                        <div className="flex flex-col gap-1">
                            <span className="text-[var(--color-muted)] text-xs">Todoist API Token</span>
                            <input
                                type="password"
                                placeholder="Enter your Todoist API token"
                                className="bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-fg)] px-2 py-1 text-sm focus:border-[var(--color-accent)] outline-none w-full select-text font-mono"
                                value={todoistConfig.apiKey}
                                onChange={(e) => onTodoistConfigChange({ ...todoistConfig, apiKey: e.target.value })}
                            />
                            <span className="text-[var(--color-muted)] text-[10px] opacity-60">
                                Settings &gt; Integrations &gt; Developer on todoist.com. Stored locally in your browser.
                            </span>
                        </div>
                    )}
                </div>
            )}

            {/* market / stocks */}
            {activeWidgets['market'] && marketConfig && onMarketConfigChange && (
                <div className="border border-[var(--color-border)] p-4 space-y-3">
                    <h3 className="text-[var(--color-accent)] font-bold">⬡ Market Ticker</h3>

                    {/* Provider selector */}
                    <div className="flex flex-col gap-1">
                        <span className="text-[var(--color-muted)] text-xs">Data Provider</span>
                        <div className="flex flex-wrap gap-3">
                            {([
                                { id: 'yahoo' as MarketProvider, label: 'Yahoo Finance' },
                                { id: 'finnhub' as MarketProvider, label: 'Finnhub' },
                                { id: 'twelvedata' as MarketProvider, label: 'Twelve Data' },
                            ]).map((p) => (
                                <div
                                    key={p.id}
                                    onClick={() => onMarketConfigChange({ ...marketConfig, provider: p.id })}
                                    className="flex items-center gap-2 cursor-pointer select-none group"
                                >
                                    <span className="font-mono text-[var(--color-accent)] font-bold">
                                        {marketConfig.provider === p.id ? '[x]' : '[ ]'}
                                    </span>
                                    <span className="text-[var(--color-fg)] group-hover:text-[var(--color-accent)] text-sm">
                                        {p.label}
                                    </span>
                                </div>
                            ))}
                        </div>
                        <span className="text-[var(--color-muted)] text-[10px] opacity-60">
                            {marketConfig.provider === 'yahoo' && 'Free, no API key needed. Unofficial endpoint.'}
                            {marketConfig.provider === 'finnhub' && 'Free tier: 60 calls/min. Requires free API key from finnhub.io'}
                            {marketConfig.provider === 'twelvedata' && 'Free tier: 8 calls/min, 800/day. Requires free API key from twelvedata.com'}
                        </span>
                    </div>

                    {/* API Key input (shown only for providers that need it) */}
                    {marketConfig.provider !== 'yahoo' && (
                        <div className="flex flex-col gap-1">
                            <span className="text-[var(--color-muted)] text-xs">API Key</span>
                            <input
                                type="password"
                                placeholder={`Enter your ${marketConfig.provider === 'finnhub' ? 'Finnhub' : 'Twelve Data'} API key`}
                                className="bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-fg)] px-2 py-1 text-sm focus:border-[var(--color-accent)] outline-none w-full select-text font-mono"
                                value={marketConfig.apiKey ?? ''}
                                onChange={(e) => onMarketConfigChange({ ...marketConfig, apiKey: e.target.value })}
                            />
                            <span className="text-[var(--color-muted)] text-[10px] opacity-60">
                                Stored locally in your browser. Never sent anywhere except the provider's API.
                            </span>
                        </div>
                    )}

                    {/* Symbols input */}
                    <div className="flex flex-col gap-1">
                        <span className="text-[var(--color-muted)] text-xs">Symbols (comma-separated)</span>
                        <input
                            type="text"
                            placeholder={
                                marketConfig.provider === 'yahoo' ? 'e.g. AAPL, NVDA, BTC-USD, EURUSD=X' :
                                marketConfig.provider === 'finnhub' ? 'e.g. AAPL, NVDA, BINANCE:BTCUSDT, OANDA:EUR_USD' :
                                'e.g. AAPL, NVDA, BTC/USD, EUR/USD'
                            }
                            className="bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-fg)] px-2 py-1 text-sm focus:border-[var(--color-accent)] outline-none w-full select-text font-mono"
                            value={symbolsInput}
                            onChange={(e) => setSymbolsInput(e.target.value)}
                            onBlur={() => {
                                const syms = symbolsInput.split(',').map(s => s.trim()).filter(Boolean);
                                onMarketConfigChange({ ...marketConfig, symbols: syms });
                            }}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    const syms = symbolsInput.split(',').map(s => s.trim()).filter(Boolean);
                                    onMarketConfigChange({ ...marketConfig, symbols: syms });
                                }
                            }}
                        />
                        <span className="text-[var(--color-muted)] text-[10px] opacity-60">
                            {marketConfig.provider === 'yahoo' && 'Stocks: AAPL, NVDA | Crypto: BTC-USD | Forex: EURUSD=X | Indices: ^GSPC'}
                            {marketConfig.provider === 'finnhub' && 'Stocks: AAPL, NVDA | Crypto: BINANCE:BTCUSDT | Forex: OANDA:EUR_USD'}
                            {marketConfig.provider === 'twelvedata' && 'Stocks: AAPL, NVDA | Crypto: BTC/USD | Forex: EUR/USD'}
                        </span>
                    </div>

                    <AsciiSlider
                        label="Refresh Interval"
                        value={marketConfig.refreshInterval}
                        min={1}
                        max={300}
                        step={1}
                        displayValue={`${marketConfig.refreshInterval}s`}
                        onChange={(v) => onMarketConfigChange({ ...marketConfig, refreshInterval: v })}
                        hint="How often to fetch new prices"
                    />
                </div>
            )}

            {/* matrix */}
            {activeWidgets['matrix'] && (
                <div className="border border-[var(--color-border)] p-4 space-y-3">
                    <h3 className="text-[var(--color-accent)] font-bold">⬡ Matrix Widget</h3>

                    <AsciiSlider
                        label="Drop Speed" value={funOptions.matrix.speed} min={5} max={200}
                        displayValue={`${funOptions.matrix.speed}%`}
                        onChange={(v) => onFunOptionsChange({ ...funOptions, matrix: { ...funOptions.matrix, speed: v } })}
                    />

                    <AsciiSlider
                        label="Trail Fade" value={funOptions.matrix.fade} min={0.01} max={0.3} step={0.01}
                        displayValue={`${Math.round((1 - funOptions.matrix.fade * 3.33) * 100)}%`}
                        onChange={(v) => onFunOptionsChange({ ...funOptions, matrix: { ...funOptions.matrix, fade: v } })}
                        hint="Lower = longer trails"
                    />

                    <AsciiSlider
                        label="Letter Size" value={funOptions.matrix.fontSize} min={8} max={32}
                        displayValue={`${funOptions.matrix.fontSize}px`}
                        onChange={(v) => onFunOptionsChange({ ...funOptions, matrix: { ...funOptions.matrix, fontSize: v } })}
                    />


                    <div className="flex items-center justify-between">
                        <span className="text-xs text-[var(--color-fg)]">Glow Letters</span>
                        <div
                            onClick={() => onFunOptionsChange({ ...funOptions, matrix: { ...funOptions.matrix, glow: !funOptions.matrix.glow } })}
                            className="cursor-pointer text-xs font-mono text-[var(--color-accent)] hover:text-[var(--color-fg)] transition-colors select-none"
                        >
                            {funOptions.matrix.glow ? '[x]' : '[ ]'}
                        </div>
                    </div>


                    <div>
                        <div className="text-xs text-[var(--color-fg)] mb-2">Character Set</div>
                        <div className="flex flex-wrap gap-2 text-xs">
                            {(['mixed', 'numbers', 'latin'] as const).map((mode) => (
                                <div
                                    key={mode}
                                    onClick={() => onFunOptionsChange({ ...funOptions, matrix: { ...funOptions.matrix, charSet: mode } })}
                                    className={`cursor-pointer px-2 py-1 border ${funOptions.matrix.charSet === mode ? 'border-[var(--color-accent)] text-[var(--color-accent)]' : 'border-[var(--color-border)] text-[var(--color-muted)]'}`}
                                >
                                    {mode.charAt(0).toUpperCase() + mode.slice(1)}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
            {/* pipes */}
            {activeWidgets['pipes'] && (
                <div className="border border-[var(--color-border)] p-4 space-y-3">
                    <h3 className="text-[var(--color-accent)] font-bold">⬡ Pipes Widget</h3>

                    <AsciiSlider
                        label="Draw Speed" value={funOptions.pipes.speed} min={5} max={200}
                        displayValue={`${funOptions.pipes.speed}%`}
                        onChange={(v) => onFunOptionsChange({ ...funOptions, pipes: { ...funOptions.pipes, speed: v } })}
                    />

                    <AsciiSlider
                        label="Trail Length" value={funOptions.pipes.fade} min={0.01} max={0.5} step={0.01}
                        displayValue={`${Math.round((1 - funOptions.pipes.fade * 2) * 100)}%`}
                        onChange={(v) => onFunOptionsChange({ ...funOptions, pipes: { ...funOptions.pipes, fade: v } })}
                        hint="Lower = longer trails"
                    />

                    <AsciiSlider
                        label="Lifetime" value={funOptions.pipes.lifetime} min={20} max={300} step={5}
                        displayValue={`${funOptions.pipes.lifetime} steps`}
                        onChange={(v) => onFunOptionsChange({ ...funOptions, pipes: { ...funOptions.pipes, lifetime: v } })}
                        hint="How long before a pipe resets"
                    />

                    <AsciiSlider
                        label="Pipe Count" value={funOptions.pipes.count} min={1} max={10}
                        onChange={(v) => onFunOptionsChange({ ...funOptions, pipes: { ...funOptions.pipes, count: v } })}
                    />

                    <AsciiSlider
                        label="Pipe Size" value={funOptions.pipes.fontSize} min={8} max={32}
                        displayValue={`${funOptions.pipes.fontSize}px`}
                        onChange={(v) => onFunOptionsChange({ ...funOptions, pipes: { ...funOptions.pipes, fontSize: v } })}
                    />
                </div>
            )}
            {/* donut */}
            {activeWidgets['donut'] && (
                <div className="border border-[var(--color-border)] p-4 space-y-3">
                    <h3 className="text-[var(--color-accent)] font-bold">⬡ Donut Widget</h3>

                    <AsciiSlider
                        label="Spin Speed" value={funOptions.donut.speed} min={5} max={200}
                        displayValue={`${funOptions.donut.speed}%`}
                        onChange={(v) => onFunOptionsChange({ ...funOptions, donut: { ...funOptions.donut, speed: v } })}
                    />
                </div>
            )}
            {/* snake */}
            {activeWidgets['snake'] && (
                <div className="border border-[var(--color-border)] p-4 space-y-3">
                    <h3 className="text-[var(--color-accent)] font-bold">⬡ Snake Widget</h3>
                    <AsciiSlider
                        label="Speed" value={funOptions.snake.speed} min={5} max={100}
                        displayValue={`${funOptions.snake.speed}%`}
                        onChange={(v) => onFunOptionsChange({ ...funOptions, snake: { ...funOptions.snake, speed: v } })}
                    />
                </div>
            )}
            {/* game of life */}
            {activeWidgets['life'] && (
                <div className="border border-[var(--color-border)] p-4 space-y-3">
                    <h3 className="text-[var(--color-accent)] font-bold">⬡ Conway's Life Widget</h3>
                    <AsciiSlider
                        label="Speed" value={funOptions.life.speed} min={5} max={100}
                        displayValue={`${funOptions.life.speed}%`}
                        onChange={(v) => onFunOptionsChange({ ...funOptions, life: { ...funOptions.life, speed: v } })}
                    />
                </div>
            )}
            {/* fireworks */}
            {activeWidgets['fireworks'] && (
                <div className="border border-[var(--color-border)] p-4 space-y-3">
                    <h3 className="text-[var(--color-accent)] font-bold">⬡ Fireworks Widget</h3>
                    <AsciiSlider
                        label="Explosion Size" value={funOptions.fireworks.explosionSize ?? 50} min={10} max={200}
                        displayValue={`${funOptions.fireworks.explosionSize ?? 50}%`}
                        onChange={(v) => onFunOptionsChange({ ...funOptions, fireworks: { ...funOptions.fireworks, explosionSize: v } })}
                    />
                    <AsciiSlider
                        label="Frequency" value={funOptions.fireworks.speed} min={55} max={400}
                        displayValue={`${funOptions.fireworks.speed}%`}
                        onChange={(v) => onFunOptionsChange({ ...funOptions, fireworks: { ...funOptions.fireworks, speed: v } })}
                    />
                </div>
            )}
            {/* starfield */}
            {activeWidgets['starfield'] && (
                <div className="border border-[var(--color-border)] p-4 space-y-3">
                    <h3 className="text-[var(--color-accent)] font-bold">⬡ Starfield Widget</h3>
                    <AsciiSlider
                        label="Warp Speed" value={funOptions.starfield.speed} min={5} max={100}
                        displayValue={`${funOptions.starfield.speed}%`}
                        onChange={(v) => onFunOptionsChange({ ...funOptions, starfield: { ...funOptions.starfield, speed: v } })}
                    />
                </div>
            )}
            {/* rain */}
            {activeWidgets['rain'] && (
                <div className="border border-[var(--color-border)] p-4 space-y-3">
                    <h3 className="text-[var(--color-accent)] font-bold">⬡ Rain Widget</h3>
                    <AsciiSlider
                        label="Intensity" value={funOptions.rain.speed} min={5} max={100}
                        displayValue={`${funOptions.rain.speed}%`}
                        onChange={(v) => onFunOptionsChange({ ...funOptions, rain: { ...funOptions.rain, speed: v } })}
                    />
                </div>
            )}
            {/* maze */}
            {activeWidgets['maze'] && (
                <div className="border border-[var(--color-border)] p-4 space-y-3">
                    <h3 className="text-[var(--color-accent)] font-bold">⬡ Maze Widget</h3>
                    <AsciiSlider
                        label="Generation Speed" value={funOptions.maze.speed} min={5} max={100}
                        displayValue={`${funOptions.maze.speed}%`}
                        onChange={(v) => onFunOptionsChange({ ...funOptions, maze: { ...funOptions.maze, speed: v } })}
                    />
                </div>
            )}

            <div className="border border-[var(--color-border)] p-4">
                <h3 className="text-[var(--color-accent)] font-bold mb-2">Custom CSS</h3>
                <p className="text-[var(--color-muted)] text-xs mb-2">Override theme styles. Saved locally.</p>
                <textarea
                    className="w-full h-40 bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-fg)] p-2 font-mono text-xs focus:border-[var(--color-accent)] outline-none select-text"
                    placeholder=".tui-box { border-radius: 10px; }"
                    value={customCss}
                    onChange={(e) => onCustomCssChange(e.target.value)}
                />
            </div>


            <div className="border border-[var(--color-border)] p-4">
                <h3 className="text-[var(--color-accent)] font-bold mb-2">Export / Import Settings</h3>
                <p className="text-[var(--color-muted)] text-xs mb-3">Backup all settings to a JSON file, or restore from a previous backup.</p>
                <div className="flex gap-3 flex-wrap">
                    <button
                        onClick={() => {
                            const data: Record<string, any> = {};
                            for (let i = 0; i < localStorage.length; i++) {
                                const key = localStorage.key(i);
                                if (key && key.startsWith('tui-')) {
                                    try {
                                        data[key] = JSON.parse(localStorage.getItem(key)!);
                                    } catch {
                                        data[key] = localStorage.getItem(key);
                                    }
                                }
                            }
                            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = `tui-dashboard-settings-${new Date().toISOString().slice(0, 10)}.json`;
                            a.click();
                            URL.revokeObjectURL(url);
                        }}
                        className="px-4 py-1 border border-[var(--color-border)] text-[var(--color-fg)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] text-xs font-mono no-radius transition-colors"
                    >
                        [ EXPORT ]
                    </button>
                    <button
                        onClick={() => {
                            const input = document.createElement('input');
                            input.type = 'file';
                            input.accept = '.json';
                            input.onchange = (e: any) => {
                                const file = e.target.files?.[0];
                                if (!file) return;
                                const reader = new FileReader();
                                reader.onload = (ev) => {
                                    try {
                                        const data = JSON.parse(ev.target?.result as string);
                                        if (typeof data !== 'object' || data === null) {
                                            alert('Invalid settings file.');
                                            return;
                                        }
                                        Object.entries(data).forEach(([key, value]) => {
                                            if (key.startsWith('tui-')) {
                                                localStorage.setItem(key, JSON.stringify(value));
                                            }
                                        });
                                        window.location.reload();
                                    } catch {
                                        alert('Failed to parse settings file.');
                                    }
                                };
                                reader.readAsText(file);
                            };
                            input.click();
                        }}
                        className="px-4 py-1 border border-[var(--color-border)] text-[var(--color-fg)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] text-xs font-mono no-radius transition-colors"
                    >
                        [ IMPORT ]
                    </button>
                </div>
            </div>

            <div className="text-[10px] text-[var(--color-muted)] mt-6 text-center opacity-50 font-mono">
                v2.2
            </div>
        </div>
    );
};

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useStickyState } from '@/hooks/useStickyState';
import { THEMES, LINKS_DATA } from '@/constants';
import { TodoItem, LinkGroup, Theme, Layouts, FunOptions, MarketConfig, TodoistConfig } from '@/types';

// Default Layouts
const DEFAULT_LAYOUTS: Layouts = {
  lg: [
    { i: 'settings-guard', x: 11, y: 0, w: 1, h: 1, static: true },
    { i: 'search', x: 2, y: 0, w: 7, h: 2, minW: 1, minH: 2 },
    { i: 'datetime', x: 6, y: 2, w: 3, h: 3, minW: 1, minH: 2 },
    { i: 'stats', x: 5, y: 2, w: 1, h: 3, minW: 1, minH: 2 },
    { i: 'weather', x: 2, y: 2, w: 3, h: 9, minW: 1, minH: 2 },
    { i: 'todo', x: 5, y: 5, w: 4, h: 6, minW: 1, minH: 2 },
    { i: 'links', x: 2, y: 11, w: 7, h: 5, minW: 1, minH: 2 },
    { i: 'snake', x: 2, y: 16, w: 7, h: 2, minW: 1, minH: 2 }
  ],
  md: [
    { i: 'search', x: 0, y: 0, w: 11, h: 2, minW: 2, minH: 2 },
    { i: 'settings-guard', x: 11, y: 0, w: 1, h: 1, static: true },
    { i: 'datetime', x: 0, y: 2, w: 8, h: 4, minW: 2, minH: 2 },
    { i: 'stats', x: 8, y: 2, w: 4, h: 4, minW: 2, minH: 2 },
    { i: 'weather', x: 0, y: 6, w: 4, h: 6, minW: 2, minH: 2 },
    { i: 'todo', x: 4, y: 6, w: 8, h: 6, minW: 2, minH: 2 },
    { i: 'links', x: 0, y: 12, w: 12, h: 4, minW: 2, minH: 2 },
    { i: 'snake', x: 0, y: 44, w: 2, h: 4, minW: 1, minH: 2 }
  ],
  sm: [
    { i: 'settings-guard', x: 5, y: 0, w: 1, h: 1, static: true },
    { i: 'search', x: 0, y: 0, w: 5, h: 2, minW: 2, minH: 2 },
    { i: 'datetime', x: 0, y: 2, w: 6, h: 4, minW: 2, minH: 2 },
    { i: 'stats', x: 0, y: 6, w: 6, h: 3, minW: 2, minH: 2 },
    { i: 'weather', x: 0, y: 9, w: 6, h: 4, minW: 2, minH: 2 },
    { i: 'todo', x: 0, y: 13, w: 6, h: 5, minW: 2, minH: 2 },
    { i: 'links', x: 0, y: 18, w: 6, h: 4, minW: 2, minH: 2 },
    { i: 'snake', x: 0, y: 22, w: 2, h: 4, minW: 1, minH: 2 }
  ]
};

const todoistDefaults: TodoistConfig = {
    apiKey: '',
    enabled: false,
};

const marketDefaults: MarketConfig = {
    symbols: ['DX-Y.NYB', '^IXIC', '^FTSE', '000001.SS', '^HSI', 'GC=F', 'CL=F'],
    refreshInterval: 60,
    provider: 'yahoo',
    apiKey: '',
};

const funDefaults: FunOptions = {
    matrix: { speed: 50, fade: 0.05, charSet: 'mixed' as const, charFlux: 30, glow: true, fontSize: 16 },
    pipes: { speed: 50, fade: 0.1, count: 5, fontSize: 16, lifetime: 80 },
    donut: { speed: 50 },
    snake: { speed: 100 },
    life: { speed: 50 },
    fireworks: { speed: 50, explosionSize: 50 },
    starfield: { speed: 25 },
    rain: { speed: 48 },
    maze: { speed: 50 },
};

interface AppContextType {
    currentTheme: string;
    setCurrentTheme: (theme: string) => void;
    customThemes: Record<string, Theme>;
    setCustomThemes: (themes: Record<string, Theme>) => void;
    isThemeMakerOpen: boolean;
    setIsThemeMakerOpen: (isOpen: boolean) => void;
    todos: TodoItem[];
    setTodos: (todos: TodoItem[]) => void;
    linkGroups: LinkGroup[];
    setLinkGroups: (groups: LinkGroup[]) => void;
    customCss: string;
    setCustomCss: (css: string) => void;
    statsMode: 'text' | 'graph' | 'detailed' | 'minimal';
    setStatsMode: (mode: 'text' | 'graph' | 'detailed' | 'minimal') => void;
    weatherMode: 'standard' | 'icon';
    setWeatherMode: (mode: 'standard' | 'icon') => void;
    layouts: Layouts;
    setLayouts: (layouts: Layouts) => void;
    tempUnit: 'C' | 'F';
    setTempUnit: (unit: 'C' | 'F') => void;
    widgetRadius: number;
    setWidgetRadius: (radius: number) => void;
    openInNewTab: boolean;
    setOpenInNewTab: (isOpen: boolean) => void;
    showWidgetTitles: boolean;
    setShowWidgetTitles: (show: boolean) => void;
    reserveSettingsSpace: boolean;
    setReserveSettingsSpace: (reserve: boolean) => void;
    customFont: string;
    setCustomFont: (font: string) => void;
    funOptions: FunOptions;
    setFunOptions: (options: FunOptions) => void;
    marketConfig: MarketConfig;
    setMarketConfig: (config: MarketConfig) => void;
    todoistConfig: TodoistConfig;
    setTodoistConfig: (config: TodoistConfig) => void;
    activeWidgets: Record<string, boolean>;
    setActiveWidgets: (widgets: Record<string, boolean>) => void;
    isLayoutLocked: boolean;
    setIsLayoutLocked: (locked: boolean) => void;
    isResizingEnabled: boolean;
    setIsResizingEnabled: (enabled: boolean) => void;
    borderGlow: boolean;
    setBorderGlow: (glow: boolean) => void;
    animatedLinks: boolean;
    setAnimatedLinks: (animated: boolean) => void;
    presets: any[];
    setPresets: (presets: any[]) => void;

    // Actions
    handleSaveCustomTheme: (newTheme: Theme) => void;
    handleDeleteCustomTheme: (name: string) => void;
    resetLayout: () => void;
    toggleWidget: (key: string) => void;
    addExtraWidget: (type: string) => void;
    removeExtraWidget: (key: string) => void;
    handleSavePreset: (name: string) => void;
    handleLoadPreset: (preset: any) => void;
    handleDeletePreset: (id: number) => void;

    // Computed
    allThemes: Record<string, Theme>;
    isCrt: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [currentTheme, setCurrentTheme] = useStickyState<string>('midnight', 'tui-theme');
    const [customThemes, setCustomThemes] = useStickyState<Record<string, Theme>>({}, 'tui-custom-themes');
    const [isThemeMakerOpen, setIsThemeMakerOpen] = useState(false);

    const [todos, setTodos] = useStickyState<TodoItem[]>([], 'tui-todos');
    const [linkGroups, setLinkGroups] = useStickyState<LinkGroup[]>(LINKS_DATA, 'tui-links');
    const [customCss, setCustomCss] = useStickyState<string>('', 'tui-custom-css');
    const [statsMode, setStatsMode] = useStickyState<'text' | 'graph' | 'detailed' | 'minimal'>('minimal', 'tui-stats-mode');
    const [weatherMode, setWeatherMode] = useStickyState<'standard' | 'icon'>('standard', 'tui-weather-mode');
    const [layouts, setLayouts] = useStickyState<Layouts>(DEFAULT_LAYOUTS, 'tui-layouts-v4');

    const [tempUnit, setTempUnit] = useStickyState<'C' | 'F'>('C', 'tui-temp-unit');

    const [widgetRadius, setWidgetRadius] = useStickyState<number>(0, 'tui-widget-radius');
    const [openInNewTab, setOpenInNewTab] = useStickyState<boolean>(false, 'tui-open-new-tab');
    const [showWidgetTitles, setShowWidgetTitles] = useStickyState<boolean>(true, 'tui-show-titles');
    const [reserveSettingsSpace, setReserveSettingsSpace] = useStickyState<boolean>(true, 'tui-reserve-settings');
    const [customFont, setCustomFont] = useStickyState<string>('', 'tui-custom-font');
    const [borderGlow, setBorderGlow] = useStickyState<boolean>(true, 'tui-border-glow');
    const [animatedLinks, setAnimatedLinks] = useStickyState<boolean>(true, 'tui-animated-links');

    const [funOptionsRaw, setFunOptions] = useStickyState<FunOptions>(funDefaults, 'tui-fun-options-v3');
    const [marketConfigRaw, setMarketConfig] = useStickyState<MarketConfig>(marketDefaults, 'tui-market-config');
    // merge defaults for backward compat (existing users lack provider/apiKey)
    const marketConfig: MarketConfig = { ...marketDefaults, ...marketConfigRaw };

    const [todoistConfigRaw, setTodoistConfig] = useStickyState<TodoistConfig>(todoistDefaults, 'tui-todoist-config');
    const todoistConfig: TodoistConfig = { ...todoistDefaults, ...todoistConfigRaw };

    // merge defaults
    const funOptions = {
        matrix: { ...funDefaults.matrix, ...funOptionsRaw?.matrix },
        pipes: { ...funDefaults.pipes, ...funOptionsRaw?.pipes },
        donut: { ...funDefaults.donut, ...funOptionsRaw?.donut },
        snake: { ...funDefaults.snake, ...funOptionsRaw?.snake },
        life: { ...funDefaults.life, ...funOptionsRaw?.life },
        fireworks: { ...funDefaults.fireworks, ...funOptionsRaw?.fireworks },
        starfield: { ...funDefaults.starfield, ...funOptionsRaw?.starfield },
        rain: { ...funDefaults.rain, ...funOptionsRaw?.rain },
        maze: { ...funDefaults.maze, ...funOptionsRaw?.maze },
    };

    const [activeWidgets, setActiveWidgets] = useStickyState<Record<string, boolean>>({
        search: true,
        datetime: true,
        stats: true,
        weather: true,
        todo: true,
        links: true,
        donut: false,
        matrix: false,
        pipes: false,
        snake: true,
        life: false,
        fireworks: false,
        starfield: false,
        rain: false,
        maze: false,
        market: false
    }, 'tui-active-widgets-v4');

    const [isLayoutLocked, setIsLayoutLocked] = useStickyState<boolean>(true, 'tui-layout-locked-v2');
    const [isResizingEnabled, setIsResizingEnabled] = useStickyState<boolean>(false, 'tui-resizing-enabled');
    const [presets, setPresets] = useStickyState<any[]>([], 'tui-presets');

    const allThemes = { ...THEMES, ...customThemes };
    const isCrt = currentTheme === 'crt';

    // settings-guard
    useEffect(() => {
        if (reserveSettingsSpace) {
            setLayouts((prevLayouts) => {
                const nextLayouts = { ...prevLayouts };
                let hasChanges = false;

                (['lg', 'md', 'sm', 'xs', 'xxs'] as const).forEach((bp) => {
                    if (!nextLayouts[bp]) return;

                    const layout = [...nextLayouts[bp]];
                    const guardIndex = layout.findIndex((item) => item.i === 'settings-guard');

                    let targetX = 0;
                    if (bp === 'lg' || bp === 'md') targetX = 11;
                    else if (bp === 'sm') targetX = 5;
                    else if (bp === 'xs') targetX = 3;
                    else if (bp === 'xxs') targetX = 1;

                    const guardItem = { i: 'settings-guard', x: targetX, y: 0, w: 1, h: 1, static: true };

                    if (guardIndex === -1) {
                        layout.push(guardItem);
                        nextLayouts[bp] = layout;
                        hasChanges = true;
                    } else {
                        const current = layout[guardIndex];
                        if (current.x !== targetX || current.y !== 0 || !current.static || current.w !== 1 || current.h !== 1) {
                            layout[guardIndex] = { ...current, ...guardItem };
                            nextLayouts[bp] = layout;
                            hasChanges = true;
                        }
                    }
                });

                return hasChanges ? nextLayouts : prevLayouts;
            });
        }
    }, [reserveSettingsSpace, setLayouts]);

    // migrations
    useEffect(() => {
        if (currentTheme === 'vss') {
            setCurrentTheme('crt');
        }
        if (currentTheme === 'lavander') {
            setCurrentTheme('lavender');
        }
        // @ts-ignore - handling migration from old state
        if (weatherMode === 'ascii') {
            // @ts-ignore
            setWeatherMode('icon');
        }
    }, [currentTheme, setCurrentTheme, weatherMode, setWeatherMode]);

    // Apply Theme
    useEffect(() => {
        const theme = allThemes[currentTheme] || THEMES['midnight'];
        const root = document.documentElement;

        root.style.setProperty('--color-bg', theme.colors.bg);
        root.style.setProperty('--color-fg', theme.colors.fg);
        root.style.setProperty('--color-muted', theme.colors.muted);
        root.style.setProperty('--color-border', theme.colors.border);
        root.style.setProperty('--color-accent', theme.colors.accent);
        root.style.setProperty('--color-hover', theme.colors.hover);

        document.body.style.backgroundColor = theme.colors.bg;
    }, [currentTheme, allThemes]); // Added allThemes to deps

    // Apply Widget Radius
    useEffect(() => {
        const root = document.documentElement;
        root.style.setProperty('--widget-radius', `${widgetRadius}px`);
    }, [widgetRadius]);

    // Apply Custom CSS
    useEffect(() => {
        const styleId = 'tui-user-custom-css';
        let styleEl = document.getElementById(styleId) as HTMLStyleElement;
        if (!styleEl) {
            styleEl = document.createElement('style');
            styleEl.id = styleId;
            document.head.appendChild(styleEl);
        }
        styleEl.textContent = customCss;
    }, [customCss]);

    // Actions
    const handleSaveCustomTheme = (newTheme: Theme) => {
        setCustomThemes(prev => ({
            ...prev,
            [newTheme.name]: newTheme
        }));
        setCurrentTheme(newTheme.name);
        setIsThemeMakerOpen(false);
    };

    const handleDeleteCustomTheme = (name: string) => {
        const newThemes = { ...customThemes };
        delete newThemes[name];
        setCustomThemes(newThemes);
        if (currentTheme === name) {
            setCurrentTheme('midnight');
        }
    };

    const resetLayout = () => {
        setLayouts(DEFAULT_LAYOUTS);
        setActiveWidgets({
            search: true,
            datetime: true,
            stats: true,
            weather: true,
            todo: true,
            links: true,
            donut: false,
            matrix: false,
            pipes: false,
            snake: true,
            life: false,
            fireworks: false,
            starfield: false,
            rain: false,
            maze: false,
            market: false
        });
        setShowWidgetTitles(true);
        setCustomFont('');
        setStatsMode('minimal');
        setWeatherMode('standard');
        setTempUnit('C');
        setWidgetRadius(0);
        setFunOptions(funDefaults);
        setMarketConfig(marketDefaults);
        setTodoistConfig(todoistDefaults);
    };

    const removeExtraWidget = (key: string) => {
        setActiveWidgets(prev => {
            const next = { ...prev };
            delete next[key];
            return next;
        });

        setLayouts(prev => {
            const nextLayouts = { ...prev } as Layouts;
            Object.keys(nextLayouts).forEach(bp => {
                if (nextLayouts[bp]) {
                    nextLayouts[bp] = nextLayouts[bp].filter(item => item.i !== key);
                }
            });
            return nextLayouts;
        });
    };

    const toggleWidget = (key: string) => {
        if (key.includes('-') && activeWidgets[key]) {
            removeExtraWidget(key);
            return;
        }

        const willBeActive = !activeWidgets[key];
        setActiveWidgets(prev => ({
            ...prev,
            [key]: willBeActive
        }));

        if (willBeActive) {
            setLayouts(prev => {
                const nextLayouts = { ...prev } as Layouts;
                Object.keys(nextLayouts).forEach(bp => {
                    const currentList = nextLayouts[bp] || [];
                    if (!currentList.find((item: any) => item.i === key)) {
                        let maxY = 0;
                        currentList.forEach((item: any) => {
                            maxY = Math.max(maxY, item.y + item.h);
                        });

                        nextLayouts[bp] = [
                            ...currentList,
                            { i: key, x: 0, y: maxY, w: 2, h: 4, minW: 1, minH: 2 }
                        ];
                    }
                });
                return nextLayouts;
            });
        }
    };

    const addExtraWidget = (type: string) => {
        const key = `${type}-${Date.now()}`;
        setActiveWidgets(prev => ({
            ...prev,
            [key]: true
        }));

        setLayouts(prev => {
            const nextLayouts = { ...prev } as Layouts;
            Object.keys(nextLayouts).forEach(bp => {
                const currentList = nextLayouts[bp] || [];
                let maxY = 0;
                currentList.forEach((item: any) => {
                    maxY = Math.max(maxY, item.y + item.h);
                });

                nextLayouts[bp] = [
                    ...currentList,
                    { i: key, x: 0, y: maxY, w: 2, h: 4, minW: 1, minH: 2 }
                ];
            });
            return nextLayouts;
        });
    };

    const handleSavePreset = (name: string) => {
        const newPreset = {
            id: Date.now(),
            name,
            data: {
                currentTheme,
                todos,
                linkGroups,
                customCss,
                statsMode,
                weatherMode,
                tempUnit,
                layouts,
                activeWidgets,
                showWidgetTitles,
                customFont,
                funOptions,
                widgetRadius,
                openInNewTab,
                marketConfig,
                todoistConfig
            }
        };
        setPresets([...presets, newPreset]);
    };

    const handleLoadPreset = (preset: any) => {
        if (!preset || !preset.data) return;
        const d = preset.data;
        if (d.currentTheme) setCurrentTheme(d.currentTheme);
        if (d.todos) setTodos(d.todos);
        if (d.linkGroups) setLinkGroups(d.linkGroups);
        if (d.customCss !== undefined) setCustomCss(d.customCss);
        if (d.statsMode) setStatsMode(d.statsMode);
        if (d.weatherMode) setWeatherMode(d.weatherMode);
        if (d.tempUnit) setTempUnit(d.tempUnit);
        if (d.layouts) setLayouts(d.layouts);
        if (d.activeWidgets) setActiveWidgets(d.activeWidgets);
        if (d.showWidgetTitles !== undefined) setShowWidgetTitles(d.showWidgetTitles);
        if (d.customFont !== undefined) setCustomFont(d.customFont);
        if (d.funOptions) setFunOptions(d.funOptions);
        if (d.widgetRadius !== undefined) setWidgetRadius(d.widgetRadius);
        if (d.openInNewTab !== undefined) setOpenInNewTab(d.openInNewTab);
        if (d.marketConfig) setMarketConfig(d.marketConfig);
        if (d.todoistConfig) setTodoistConfig(d.todoistConfig);
    };

    const handleDeletePreset = (id: number) => {
        setPresets(presets.filter(p => p.id !== id));
    };

    const value: AppContextType = {
        currentTheme, setCurrentTheme,
        customThemes, setCustomThemes,
        isThemeMakerOpen, setIsThemeMakerOpen,
        todos, setTodos,
        linkGroups, setLinkGroups,
        customCss, setCustomCss,
        statsMode, setStatsMode,
        weatherMode, setWeatherMode,
        layouts, setLayouts,
        tempUnit, setTempUnit,
        widgetRadius, setWidgetRadius,
        openInNewTab, setOpenInNewTab,
        showWidgetTitles, setShowWidgetTitles,
        reserveSettingsSpace, setReserveSettingsSpace,
        customFont, setCustomFont,
        funOptions, setFunOptions,
        marketConfig, setMarketConfig,
        todoistConfig, setTodoistConfig,
        activeWidgets, setActiveWidgets,
        isLayoutLocked, setIsLayoutLocked,
        isResizingEnabled, setIsResizingEnabled,
        borderGlow, setBorderGlow,
        animatedLinks, setAnimatedLinks,
        presets, setPresets,
        handleSaveCustomTheme,
        handleDeleteCustomTheme,
        resetLayout,
        toggleWidget,
        addExtraWidget,
        removeExtraWidget,
        handleSavePreset,
        handleLoadPreset,
        handleDeletePreset,
        allThemes,
        isCrt
    };

    return (
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    );
};

export const useAppContext = () => {
    const context = useContext(AppContext);
    if (context === undefined) {
        throw new Error('useAppContext must be used within an AppProvider');
    }
    return context;
};

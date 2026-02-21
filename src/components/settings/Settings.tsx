import React, { useState, useRef, useEffect } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { SettingsThemesTab } from '@/components/settings/SettingsThemesTab';
import { SettingsWidgetsTab } from '@/components/settings/SettingsWidgetsTab';
import { SettingsLinksTab } from '@/components/settings/SettingsLinksTab';
import { SettingsPresetsTab } from '@/components/settings/SettingsPresetsTab';
import { SettingsAdvancedTab } from '@/components/settings/SettingsAdvancedTab';

type Tab = 'themes' | 'links' | 'widgets' | 'advanced' | 'presets';

export const Settings: React.FC = () => {
    const {
        currentTheme, setCurrentTheme,
        customThemes, handleDeleteCustomTheme, setIsThemeMakerOpen,
        linkGroups, setLinkGroups,
        customCss, setCustomCss,
        statsMode, setStatsMode,
        weatherMode, setWeatherMode,
        tempUnit, setTempUnit,
        isLayoutLocked, setIsLayoutLocked,
        isResizingEnabled, setIsResizingEnabled,
        resetLayout,
        activeWidgets, toggleWidget, addExtraWidget,
        showWidgetTitles, setShowWidgetTitles,
        customFont, setCustomFont,
        reserveSettingsSpace, setReserveSettingsSpace,
        funOptions, setFunOptions,
        marketConfig, setMarketConfig,
        presets, handleSavePreset, handleLoadPreset, handleDeletePreset,
        widgetRadius, setWidgetRadius,
        openInNewTab, setOpenInNewTab,
        borderGlow, setBorderGlow,
        animatedLinks, setAnimatedLinks,
        todoistConfig, setTodoistConfig
    } = useAppContext();

    const [isButtonVisible, setIsButtonVisible] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<Tab>('themes');

    // Draggable State
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const dragStartPos = useRef({ x: 0, y: 0 });

    // Resizable State
    const [size, setSize] = useState({ width: 640, height: 500 });
    const [isResizing, setIsResizing] = useState(false);
    const resizeStart = useRef({ x: 0, y: 0, w: 0, h: 0 });

    // Widget duplication modal state
    const [widgetToDuplicate, setWidgetToDuplicate] = useState<string | null>(null);

    const toggleModal = () => {
        setIsModalOpen(!isModalOpen);
        if (!isModalOpen) {
            setPosition({ x: 0, y: 0 });
        }
    };

    // drag
    const handleMouseDown = (e: React.MouseEvent) => {
        if (e.target !== e.currentTarget) return; // Only drag if clicking header directly
        setIsDragging(true);
        dragStartPos.current = {
            x: e.clientX - position.x,
            y: e.clientY - position.y
        };
    };

    // resize
    const handleResizeMouseDown = (e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        setIsResizing(true);
        resizeStart.current = {
            x: e.clientX,
            y: e.clientY,
            w: size.width,
            h: size.height
        };
    };

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (isDragging) {
                const newX = Math.round(e.clientX - dragStartPos.current.x);
                const newY = Math.round(e.clientY - dragStartPos.current.y);
                setPosition({ x: newX, y: newY });
            }
            if (isResizing) {
                const deltaX = e.clientX - resizeStart.current.x;
                const deltaY = e.clientY - resizeStart.current.y;
                setSize({
                    width: Math.max(400, resizeStart.current.w + deltaX),
                    height: Math.max(350, resizeStart.current.h + deltaY)
                });
            }
        };

        const handleMouseUp = () => {
            setIsDragging(false);
            setIsResizing(false);
        };

        if (isDragging || isResizing) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        }

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging, isResizing]);

    return (
        <>
            {/* Hover Trigger Area */}
            <div
                className="absolute top-4 right-4 z-40 p-2 cursor-pointer"
                onMouseEnter={() => setIsButtonVisible(true)}
                onMouseLeave={() => setIsButtonVisible(false)}
                onClick={toggleModal}
            >
                <div className={`text-[var(--color-muted)] transition-opacity duration-200 ${isButtonVisible || isModalOpen ? 'opacity-100' : 'opacity-0'}`}>
                    ( settings )
                </div>
            </div>

            {/* Confirmation Modal for Widget Duplication */}
            {widgetToDuplicate && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 pointer-events-auto">
                    <div className="bg-[var(--color-bg)] border border-[var(--color-border)] p-4 shadow-2xl flex flex-col gap-4 max-w-sm">
                         <div className="text-[var(--color-fg)] font-bold text-center">
                            Add another '{widgetToDuplicate}'?
                        </div>
                        <div className="flex gap-4 justify-center">
                            <button
                                onClick={() => {
                                    addExtraWidget(widgetToDuplicate);
                                    setWidgetToDuplicate(null);
                                }}
                                className="px-4 py-1 border border-[var(--color-border)] text-[var(--color-accent)] hover:bg-[var(--color-hover)] no-radius"
                            >
                                [ YES ]
                            </button>
                            <button
                                onClick={() => setWidgetToDuplicate(null)}
                                className="px-4 py-1 border border-[var(--color-border)] text-[var(--color-muted)] hover:bg-[var(--color-hover)] no-radius"
                            >
                                [ NO ]
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* TUI Window Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
                    <div
                        className="bg-[var(--color-bg)] border border-[var(--color-border)] shadow-2xl flex flex-col pointer-events-auto relative p-[2px] overflow-hidden"
                        style={{
                            transform: `translate(${position.x}px, ${position.y}px)`,
                            width: `${size.width}px`,
                            height: `${size.height}px`,
                            maxWidth: '95vw',
                            maxHeight: '95vh',
                        }}
                    >

                        {/* Window Title Bar */}
                        <div
                            className="flex items-center justify-between px-3 py-2 border-b border-[var(--color-border)] bg-[var(--color-hover)] select-none cursor-move group shrink-0"
                            onMouseDown={handleMouseDown}
                            title="Drag to move"
                        >
                            <div className="flex items-center gap-2 pointer-events-none">
                                <span className="text-[var(--color-fg)] font-bold text-xs">user@tui-dashboard:~/settings</span>
                            </div>
                            <div className="flex gap-3 text-[var(--color-muted)] font-mono text-xs">
                                <button onClick={(e) => { e.stopPropagation(); setIsModalOpen(false); }} className="hover:text-[var(--color-accent)]">[x]</button>
                            </div>
                        </div>

                        {/* tabs */}
                        <div className="flex border-b border-[var(--color-border)] px-2 pt-2 gap-2 bg-[var(--color-bg)] flex-wrap shrink-0">
                            {['themes', 'links', 'widgets', 'presets', 'advanced'].map(tab => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab as Tab)}
                                    className={`px-4 py-1 text-sm rounded-t-sm border-t border-l border-r ${activeTab === tab ? 'border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-accent)] -mb-[1px] pb-2 font-bold' : 'border-transparent text-[var(--color-muted)] hover:text-[var(--color-fg)]'}`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>

                        {/* content */}
                        <div className="p-6 overflow-y-auto custom-scrollbar flex-1 bg-[var(--color-bg)] min-h-0">


                            {activeTab === 'themes' && (
                                <SettingsThemesTab
                                    currentTheme={currentTheme}
                                    onThemeChange={setCurrentTheme}
                                    customThemes={customThemes || {}}
                                    onDeleteCustomTheme={handleDeleteCustomTheme}
                                    onOpenThemeMaker={() => setIsThemeMakerOpen(true)}
                                />
                            )}


                            {activeTab === 'widgets' && (
                                <SettingsWidgetsTab
                                    activeWidgets={activeWidgets}
                                    onToggleWidget={toggleWidget}
                                    setWidgetToDuplicate={setWidgetToDuplicate}
                                />
                            )}


                            {activeTab === 'links' && (
                                <SettingsLinksTab
                                    linkGroups={linkGroups}
                                    onUpdateLinks={setLinkGroups}
                                />
                            )}


                            {activeTab === 'presets' && (
                                <SettingsPresetsTab
                                    presets={presets}
                                    onSavePreset={handleSavePreset}
                                    onLoadPreset={handleLoadPreset}
                                    onDeletePreset={handleDeletePreset}
                                />
                            )}


                            {activeTab === 'advanced' && (
                                <SettingsAdvancedTab
                                    showWidgetTitles={showWidgetTitles}
                                    onToggleWidgetTitles={() => setShowWidgetTitles(!showWidgetTitles)}
                                    reserveSettingsSpace={reserveSettingsSpace}
                                    onToggleReserveSettings={() => setReserveSettingsSpace(!reserveSettingsSpace)}
                                    customFont={customFont}
                                    onCustomFontChange={setCustomFont}
                                    widgetRadius={widgetRadius}
                                    onWidgetRadiusChange={setWidgetRadius}
                                    isLayoutLocked={isLayoutLocked}
                                    onToggleLayoutLock={() => setIsLayoutLocked(!isLayoutLocked)}
                                    onResetLayout={resetLayout}
                                    isResizingEnabled={isResizingEnabled}
                                    onToggleResizing={() => setIsResizingEnabled(!isResizingEnabled)}
                                    statsMode={statsMode}
                                    onStatsModeChange={setStatsMode}
                                    weatherMode={weatherMode}
                                    onWeatherModeChange={setWeatherMode}
                                    tempUnit={tempUnit}
                                    onTempUnitChange={setTempUnit}
                                    openInNewTab={openInNewTab}
                                    onToggleOpenInNewTab={() => setOpenInNewTab(!openInNewTab)}
                                    activeWidgets={activeWidgets}
                                    funOptions={funOptions}
                                    onFunOptionsChange={setFunOptions}
                                    customCss={customCss}
                                    onCustomCssChange={setCustomCss}
                                    marketConfig={marketConfig}
                                    onMarketConfigChange={setMarketConfig}
                                    borderGlow={borderGlow}
                                    onToggleBorderGlow={() => setBorderGlow(!borderGlow)}
                                    animatedLinks={animatedLinks}
                                    onToggleAnimatedLinks={() => setAnimatedLinks(!animatedLinks)}
                                    todoistConfig={todoistConfig}
                                    onTodoistConfigChange={setTodoistConfig}
                                />
                            )}

                        </div>


                        <div
                            className="absolute bottom-0 right-0 w-6 h-6 cursor-se-resize z-50 flex items-end justify-end text-[var(--color-accent)] opacity-50 hover:opacity-100 select-none"
                            onMouseDown={handleResizeMouseDown}
                            title="Resize"
                        >
                            <svg width="12" height="12" viewBox="0 0 10 10" fill="currentColor" className="pointer-events-none mb-[2px] mr-[2px]">
                                <path d="M10 10 L0 10 L10 0 Z" />
                            </svg>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

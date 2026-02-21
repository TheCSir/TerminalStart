import { useState, useEffect, useRef, useCallback } from 'react';
import { Responsive, Layout } from 'react-grid-layout';
// @ts-ignore
import { WidthProvider } from 'react-grid-layout';

import { TuiBox } from '@/components/ui/TuiBox';
import { DateTimeWidget } from '@/components/widgets/DateTimeWidget';
import { StatsWidget } from '@/components/widgets/StatsWidget';
import { WeatherWidget } from '@/components/widgets/WeatherWidget';
import { TodoWidget } from '@/components/widgets/TodoWidget';
import { LinksWidget } from '@/components/widgets/LinksWidget';
import { SearchWidget } from '@/components/widgets/SearchWidget';
import { DonutWidget } from '@/components/widgets/DonutWidget';
import { MatrixWidget } from '@/components/widgets/MatrixWidget';
import { PipesWidget } from '@/components/widgets/PipesWidget';
import { SnakeWidget } from '@/components/widgets/SnakeWidget';
import { GameOfLifeWidget } from '@/components/widgets/GameOfLifeWidget';
import { FireworksWidget } from '@/components/widgets/FireworksWidget';
import { StarfieldWidget } from '@/components/widgets/StarfieldWidget';
import { RainWidget } from '@/components/widgets/RainWidget';
import { MazeWidget } from '@/components/widgets/MazeWidget';
import { MarketWidget } from '@/components/widgets/MarketWidget';
import { Settings } from '@/components/settings/Settings';
import { ThemeMaker } from '@/components/settings/ThemeMaker';
import { AppProvider, useAppContext } from '@/contexts/AppContext';

const ResponsiveGridLayout = WidthProvider(Responsive);

const GLITCH_CHARS = '!@#$%^&*_+-=[]{}|;:<>?/~';
const LABEL = '~/CSir.info';

function Attribution() {
  const [display, setDisplay] = useState('');
  const [typed, setTyped] = useState(false);
  const [cursorVisible, setCursorVisible] = useState(true);
  const isHovering = useRef(false);
  const glitchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Typewriter on mount
  useEffect(() => {
    let i = 0;
    const id = setInterval(() => {
      i++;
      setDisplay(LABEL.slice(0, i));
      if (i >= LABEL.length) {
        clearInterval(id);
        setTyped(true);
      }
    }, 80);
    return () => clearInterval(id);
  }, []);

  // Blinking cursor after typing
  useEffect(() => {
    if (!typed) return;
    const id = setInterval(() => setCursorVisible(v => !v), 530);
    return () => clearInterval(id);
  }, [typed]);

  const scramble = useCallback(() => {
    let tick = 0;
    const maxTicks = 6;
    const run = () => {
      if (!isHovering.current || tick >= maxTicks) {
        setDisplay(LABEL);
        return;
      }
      tick++;
      setDisplay(
        LABEL.split('').map((ch, i) =>
          i < tick ? ch : GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)]
        ).join('')
      );
      glitchTimer.current = setTimeout(run, 50);
    };
    run();
  }, []);

  const handleMouseEnter = () => {
    isHovering.current = true;
    if (typed) scramble();
  };

  const handleMouseLeave = () => {
    isHovering.current = false;
    if (glitchTimer.current) clearTimeout(glitchTimer.current);
    setDisplay(LABEL);
  };

  return (
    <a
      href="https://github.com/TheCSir/TerminalStart"
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-2 right-3 font-mono text-xs text-[var(--color-muted)] hover:text-[var(--color-accent)] transition-colors duration-200 opacity-40 hover:opacity-100 select-none z-50 no-underline"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {display}
      <span className={typed && cursorVisible ? 'opacity-100' : 'opacity-0'}>_</span>
    </a>
  );
}

function AppContent() {
  const {
    isThemeMakerOpen, setIsThemeMakerOpen,
    todos, setTodos,
    linkGroups,
    statsMode,
    weatherMode,
    layouts, setLayouts,
    tempUnit,
    openInNewTab,
    showWidgetTitles,
    reserveSettingsSpace,
    customFont,
    funOptions,
    marketConfig,
    todoistConfig,
    activeWidgets,
    isLayoutLocked,
    isResizingEnabled,
    handleSaveCustomTheme,
    removeExtraWidget,
    isCrt
  } = useAppContext();

  const onLayoutChange = (_: Layout[], allLayouts: any) => {
    setLayouts(allLayouts);
  };

  const showHandles = isResizingEnabled && !isLayoutLocked;

  const appStyle = {
    fontFamily: customFont ? customFont : '"JetBrains Mono", monospace'
  };

  const [gridReady, setGridReady] = useState(false);
  const [isFirstLoad, setIsFirstLoad] = useState(true);

  // briefly hide grid items while layout is computed, then suppress transitions
  useEffect(() => {
    const showTimer = setTimeout(() => setGridReady(true), 150);
    const animTimer = setTimeout(() => setIsFirstLoad(false), 3000);
    return () => {
      clearTimeout(showTimer);
      clearTimeout(animTimer);
    };
  }, []);

  return (
    <div
      className={`min-h-screen w-full p-2 text-sm bg-[var(--color-bg)] relative overflow-hidden select-none ${isCrt ? 'theme-crt' : ''}`}
      style={appStyle}
    >

      {isCrt && (
        <>
          <div className="crt-curve-container"></div>
          <div className="crt-scanlines"></div>
          <div className="crt-noise"></div>
          <div className="crt-flicker"></div>
        </>
      )}

      <Settings />

      {isThemeMakerOpen && (
        <ThemeMaker
          onSave={handleSaveCustomTheme}
          onClose={() => setIsThemeMakerOpen(false)}
        />
      )}

      <div className="w-full z-10 relative px-2">
        <ResponsiveGridLayout
          className={`layout ${showHandles ? '' : 'hide-handles'} ${!gridReady ? 'grid-hidden' : ''} ${isFirstLoad ? 'no-animate' : ''}`}
          layouts={layouts}
          breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
          cols={{ lg: 12, md: 12, sm: 6, xs: 4, xxs: 2 }}
          rowHeight={30}
          onLayoutChange={onLayoutChange}
          draggableHandle=".drag-handle"
          margin={[10, 10]}
          isResizable={showHandles}
          isDraggable={!isLayoutLocked}
          useCSSTransforms={true}
          resizeHandles={['se', 'sw', 'ne', 'nw']}
        >
          {reserveSettingsSpace && (
            <div key="settings-guard" className="settings-guard-item pointer-events-none" />
          )}

          {Object.keys(activeWidgets).map(key => {
            if (!activeWidgets[key]) return null;
            const isExtra = key.includes('-');
            const type = isExtra ? key.split('-')[0] : key;

            // Common props
            const boxProps = {
                key: key,
                title: isExtra ? `${type}.exe (${key.split('-')[1].slice(-4)})` : (
                    ['snake', 'life', 'fireworks', 'starfield', 'rain', 'maze', 'pipes', 'matrix', 'donut', 'market'].includes(type)
                        ? (type === 'life' ? 'conway.life' :
                           type === 'donut' ? 'donut.c' :
                           type === 'pipes' ? 'pipes.scr' :
                           type === 'matrix' ? 'matrix.cs' :
                           type === 'snake' ? 'snake.exe' :
                           type === 'fireworks' ? 'fireworks.py' :
                           type === 'starfield' ? 'starfield.scr' :
                           type === 'rain' ? 'rain.sh' :
                           type === 'maze' ? 'maze.gen' :
                           type === 'market' ? 'stocks.info' : type)
                        : (type === 'todo' ? 'todo.txt' : type === 'search' ? 'search.ai' : type === 'links' ? 'links.href' : type === 'weather' ? 'forecast.py' : type === 'datetime' ? 'clock.sys' : type)
                ),
                showTitle: showWidgetTitles,
                onClose: isExtra ? () => removeExtraWidget(key) : undefined
            };

            switch (type) {
                case 'search':
                    return <TuiBox {...boxProps} title="search.ai"><SearchWidget /></TuiBox>;
                case 'datetime':
                    return <TuiBox {...boxProps} title="clock.sys"><DateTimeWidget /></TuiBox>;
                case 'stats':
                    return <TuiBox {...boxProps} title="status.exe"><StatsWidget mode={statsMode} /></TuiBox>;
                case 'weather':
                    return <TuiBox {...boxProps} title="forecast.py"><WeatherWidget mode={weatherMode} unit={tempUnit} /></TuiBox>;
                case 'todo':
                    return <TuiBox {...boxProps} title="todo.txt"><TodoWidget tasks={todos} setTasks={setTodos} todoistConfig={todoistConfig} /></TuiBox>;
                case 'links':
                    return <TuiBox {...boxProps} title="links.href"><LinksWidget groups={linkGroups} openInNewTab={openInNewTab} /></TuiBox>;
                case 'donut':
                    return <TuiBox {...boxProps}><DonutWidget speed={funOptions.donut.speed} /></TuiBox>;
                case 'matrix':
                    return <TuiBox {...boxProps}><MatrixWidget options={funOptions.matrix} /></TuiBox>;
                case 'pipes':
                    return <TuiBox {...boxProps}><PipesWidget options={funOptions.pipes} /></TuiBox>;
                case 'snake':
                    return <TuiBox {...boxProps}><SnakeWidget speed={funOptions.snake.speed} /></TuiBox>;
                case 'life':
                    return <TuiBox {...boxProps}><GameOfLifeWidget speed={funOptions.life.speed} /></TuiBox>;
                case 'fireworks':
                    return <TuiBox {...boxProps}><FireworksWidget speed={funOptions.fireworks.speed} explosionSize={funOptions.fireworks.explosionSize} /></TuiBox>;
                case 'starfield':
                    return <TuiBox {...boxProps}><StarfieldWidget speed={funOptions.starfield.speed} /></TuiBox>;
                case 'rain':
                    return <TuiBox {...boxProps}><RainWidget speed={funOptions.rain.speed} /></TuiBox>;
                case 'maze':
                    return <TuiBox {...boxProps}><MazeWidget speed={funOptions.maze.speed} /></TuiBox>;
                case 'market':
                    return <TuiBox {...boxProps}><MarketWidget symbols={marketConfig.symbols} refreshInterval={marketConfig.refreshInterval} provider={marketConfig.provider} apiKey={marketConfig.apiKey} /></TuiBox>;
                default:
                    return null;
            }
          })}

        </ResponsiveGridLayout>
      </div>
      <Attribution />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

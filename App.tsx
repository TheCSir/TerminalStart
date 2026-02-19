import { useState, useEffect } from 'react';
import { Responsive, Layout } from 'react-grid-layout';
// @ts-ignore
import { WidthProvider } from 'react-grid-layout';

import { TuiBox } from './components/TuiBox';
import { DateTimeWidget } from './components/DateTimeWidget';
import { StatsWidget } from './components/StatsWidget';
import { WeatherWidget } from './components/WeatherWidget';
import { TodoWidget } from './components/TodoWidget';
import { LinksWidget } from './components/LinksWidget';
import { SearchWidget } from './components/SearchWidget';
import { DonutWidget } from './components/DonutWidget';
import { MatrixWidget } from './components/MatrixWidget';
import { PipesWidget } from './components/PipesWidget';
import { SnakeWidget } from './components/SnakeWidget';
import { GameOfLifeWidget } from './components/GameOfLifeWidget';
import { FireworksWidget } from './components/FireworksWidget';
import { StarfieldWidget } from './components/StarfieldWidget';
import { RainWidget } from './components/RainWidget';
import { MazeWidget } from './components/MazeWidget';
import { MarketWidget } from './components/MarketWidget';
import { Settings } from './components/Settings';
import { ThemeMaker } from './components/ThemeMaker';
import { AppProvider, useAppContext } from './contexts/AppContext';

const ResponsiveGridLayout = WidthProvider(Responsive);

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
                           type === 'matrix' ? 'matrix' :
                           type === 'snake' ? 'snake.exe' :
                           type === 'fireworks' ? 'fireworks.py' :
                           type === 'starfield' ? 'starfield.scr' :
                           type === 'rain' ? 'rain.sh' :
                           type === 'maze' ? 'maze.gen' :
                           type === 'market' ? 'stocks.info' : type)
                        : (type === 'todo' ? 'todo-list' : type === 'search' ? 'web_search' : type)
                ),
                showTitle: showWidgetTitles,
                onClose: isExtra ? () => removeExtraWidget(key) : undefined
            };

            switch (type) {
                case 'search':
                    return <TuiBox {...boxProps} title="web_search"><SearchWidget /></TuiBox>;
                case 'datetime':
                    return <TuiBox {...boxProps} title="datetime"><DateTimeWidget /></TuiBox>;
                case 'stats':
                    return <TuiBox {...boxProps} title="stats"><StatsWidget mode={statsMode} /></TuiBox>;
                case 'weather':
                    return <TuiBox {...boxProps} title="weather"><WeatherWidget mode={weatherMode} unit={tempUnit} /></TuiBox>;
                case 'todo':
                    return <TuiBox {...boxProps} title="todo-list"><TodoWidget tasks={todos} setTasks={setTodos} /></TuiBox>;
                case 'links':
                    return <TuiBox {...boxProps} title="links"><LinksWidget groups={linkGroups} openInNewTab={openInNewTab} /></TuiBox>;
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

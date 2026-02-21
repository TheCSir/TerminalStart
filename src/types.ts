import { Layout } from 'react-grid-layout';

export interface Layouts {
  [key: string]: Layout[];
}

export interface FunOptions {
    matrix: { speed: number; fade: number; charSet: 'numbers' | 'latin' | 'mixed'; charFlux: number; glow: boolean; fontSize: number };
    pipes: { speed: number; fade: number; count: number; fontSize: number; lifetime: number };
    donut: { speed: number };
    snake: { speed: number };
    life: { speed: number };
    fireworks: { speed: number; explosionSize: number };
    starfield: { speed: number };
    rain: { speed: number };
    maze: { speed: number };
}

export interface Theme {
  name: string;
  colors: {
    bg: string;
    fg: string;
    muted: string;
    border: string;
    accent: string;
    hover: string;
  };
}

export interface TodoItem {
  id: number | string;
  text: string;
  done: boolean;
  due?: string;
}

export interface TodoistConfig {
  apiKey: string;
  enabled: boolean;
}

export interface Link {
  label: string;
  url: string;
  icon?: string;
}

export interface LinkGroup {
  category: string;
  links: Link[];
}


export type MarketProvider = 'yahoo' | 'finnhub' | 'twelvedata';

export interface MarketConfig {
    symbols: string[];
    refreshInterval: number;
    provider: MarketProvider;
    apiKey?: string;
}

export interface MarketQuote {
    symbol: string;
    name?: string;
    price: number;
    change: number;
    changePercent: number;
    isUp: boolean;
    sparkline: number[];
    error?: string;
}

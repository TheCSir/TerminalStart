import { useState, useEffect, useRef, useCallback } from 'react';
import { MarketQuote, MarketProvider } from '@/types';

interface CachedData {
    quotes: MarketQuote[];
    timestamp: number;
}

function cacheKey(provider: MarketProvider): string {
    return `tui-market-cache-${provider}`;
}

function loadCache(provider: MarketProvider): CachedData | null {
    try {
        const raw = localStorage.getItem(cacheKey(provider));
        if (!raw) return null;
        return JSON.parse(raw);
    } catch {
        return null;
    }
}

function saveCache(provider: MarketProvider, quotes: MarketQuote[]) {
    try {
        localStorage.setItem(cacheKey(provider), JSON.stringify({ quotes, timestamp: Date.now() }));
    } catch { /* quota exceeded — ignore */ }
}

// --- Yahoo Finance ---
async function fetchYahoo(symbol: string): Promise<MarketQuote> {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?range=1d&interval=15m`;

    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const json = await res.json();
    const result = json.chart?.result?.[0];
    if (!result) throw new Error('No data');

    const meta = result.meta;
    const price = meta.regularMarketPrice ?? 0;
    const previousClose = meta.chartPreviousClose ?? meta.previousClose ?? price;
    const change = price - previousClose;
    const changePercent = previousClose !== 0 ? (change / previousClose) * 100 : 0;

    const closes: number[] = result.indicators?.quote?.[0]?.close ?? [];
    const sparkline = closes.filter((v: number | null) => v != null) as number[];

    return {
        symbol: meta.symbol || symbol,
        name: meta.shortName || meta.longName || undefined,
        price,
        change,
        changePercent,
        isUp: change >= 0,
        sparkline,
    };
}

// --- Finnhub ---
async function fetchFinnhub(symbol: string, apiKey: string): Promise<MarketQuote> {
    const quoteUrl = `https://finnhub.io/api/v1/quote?symbol=${encodeURIComponent(symbol)}&token=${apiKey}`;
    const quoteRes = await fetch(quoteUrl);
    if (!quoteRes.ok) throw new Error(`HTTP ${quoteRes.status}`);
    const q = await quoteRes.json();

    if (q.c === 0 && q.d === null) {
        throw new Error('No data (symbol may be invalid for Finnhub)');
    }

    const price = q.c ?? 0;
    const change = q.d ?? 0;
    const changePercent = q.dp ?? 0;

    // Fetch candle data for sparkline and company name in parallel
    const now = Math.floor(Date.now() / 1000);
    const from = now - 86400;
    const candleUrl = `https://finnhub.io/api/v1/stock/candle?symbol=${encodeURIComponent(symbol)}&resolution=15&from=${from}&to=${now}&token=${apiKey}`;
    const profileUrl = `https://finnhub.io/api/v1/stock/profile2?symbol=${encodeURIComponent(symbol)}&token=${apiKey}`;

    let sparkline: number[] = [];
    let name: string | undefined;

    const [candleResult, profileResult] = await Promise.allSettled([
        fetch(candleUrl),
        fetch(profileUrl),
    ]);

    if (candleResult.status === 'fulfilled' && candleResult.value.ok) {
        try {
            const candle = await candleResult.value.json();
            if (candle.s === 'ok' && Array.isArray(candle.c)) {
                sparkline = candle.c;
            }
        } catch { /* ignore */ }
    }

    if (profileResult.status === 'fulfilled' && profileResult.value.ok) {
        try {
            const profile = await profileResult.value.json();
            if (profile.name) name = profile.name;
        } catch { /* ignore */ }
    }

    return {
        symbol,
        name,
        price,
        change,
        changePercent,
        isUp: change >= 0,
        sparkline,
    };
}

// --- Twelve Data ---
async function fetchTwelveData(symbol: string, apiKey: string): Promise<MarketQuote> {
    const url = `https://api.twelvedata.com/time_series?symbol=${encodeURIComponent(symbol)}&interval=15min&outputsize=30&apikey=${apiKey}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();

    if (json.status === 'error') {
        throw new Error(json.message || 'Twelve Data error');
    }

    const values = json.values;
    if (!Array.isArray(values) || values.length === 0) {
        throw new Error('No data');
    }

    // values[0] is most recent, values are descending by time
    const latest = values[0];
    const oldest = values[values.length - 1];

    const price = parseFloat(latest.close);
    const previousClose = parseFloat(oldest.open);
    const change = price - previousClose;
    const changePercent = previousClose !== 0 ? (change / previousClose) * 100 : 0;

    // Sparkline from close prices (reverse to chronological order)
    const sparkline = values
        .map((v: any) => parseFloat(v.close))
        .filter((v: number) => !isNaN(v))
        .reverse();

    return {
        symbol,
        name: json.meta?.exchange || undefined,
        price,
        change,
        changePercent,
        isUp: change >= 0,
        sparkline,
    };
}

// --- Permission helper ---
declare const chrome: any;

const PROVIDER_ORIGINS: Record<MarketProvider, string[]> = {
    yahoo: ['*://query1.finance.yahoo.com/*'],
    finnhub: ['*://finnhub.io/*'],
    twelvedata: ['*://api.twelvedata.com/*'],
};

async function checkHostPermission(provider: MarketProvider): Promise<boolean> {
    if (typeof chrome === 'undefined' || !chrome.permissions) return true;
    const origins = PROVIDER_ORIGINS[provider];
    return chrome.permissions.contains({ origins });
}

export async function requestHostPermission(provider: MarketProvider): Promise<boolean> {
    if (typeof chrome === 'undefined' || !chrome.permissions) return true;
    const origins = PROVIDER_ORIGINS[provider];
    return chrome.permissions.request({ origins });
}

// --- Dispatcher ---
async function fetchSymbol(
    symbol: string,
    provider: MarketProvider,
    apiKey?: string,
): Promise<MarketQuote> {
    const hasPermission = await checkHostPermission(provider);
    if (!hasPermission) throw new Error('Host permission not granted');

    switch (provider) {
        case 'finnhub':
            if (!apiKey) throw new Error('Finnhub requires an API key');
            return fetchFinnhub(symbol, apiKey);
        case 'twelvedata':
            if (!apiKey) throw new Error('Twelve Data requires an API key');
            return fetchTwelveData(symbol, apiKey);
        case 'yahoo':
        default:
            return fetchYahoo(symbol);
    }
}

// --- Hook ---
export function useMarketData(
    symbols: string[],
    refreshInterval: number,
    provider: MarketProvider = 'yahoo',
    apiKey?: string,
) {
    const [quotes, setQuotes] = useState<MarketQuote[]>(() => {
        const cached = loadCache(provider);
        if (cached) return cached.quotes;
        return [];
    });
    const [loading, setLoading] = useState(true);
    const [needsPermission, setNeedsPermission] = useState(false);
    const [lastUpdate, setLastUpdate] = useState<number | null>(() => {
        const cached = loadCache(provider);
        return cached?.timestamp ?? null;
    });
    const timerRef = useRef<ReturnType<typeof setInterval>>();

    const fetchAll = useCallback(async () => {
        if (symbols.length === 0) {
            setQuotes([]);
            setLoading(false);
            return;
        }

        const hasPermission = await checkHostPermission(provider);
        if (!hasPermission) {
            setNeedsPermission(true);
            setLoading(false);
            return;
        }
        setNeedsPermission(false);

        setLoading(true);
        const results = await Promise.all(
            symbols.map(async (sym) => {
                try {
                    return await fetchSymbol(sym.trim().toUpperCase(), provider, apiKey);
                } catch {
                    return {
                        symbol: sym.trim().toUpperCase(),
                        price: 0,
                        change: 0,
                        changePercent: 0,
                        isUp: true,
                        sparkline: [],
                        error: 'fetch failed',
                    } as MarketQuote;
                }
            })
        );

        setQuotes(results);
        setLastUpdate(Date.now());
        saveCache(provider, results);
        setLoading(false);
    }, [symbols, provider, apiKey]);

    // Re-initialize from cache when provider changes
    useEffect(() => {
        const cached = loadCache(provider);
        if (cached) {
            setQuotes(cached.quotes);
            setLastUpdate(cached.timestamp);
        } else {
            setQuotes([]);
            setLastUpdate(null);
        }
    }, [provider]);

    // Initial fetch (with small delay if cache exists)
    useEffect(() => {
        const cached = loadCache(provider);
        const delay = cached ? 1000 : 0;
        const t = setTimeout(fetchAll, delay);
        return () => clearTimeout(t);
    }, [fetchAll, provider]);

    // Periodic refresh
    useEffect(() => {
        if (refreshInterval <= 0) return;
        timerRef.current = setInterval(fetchAll, refreshInterval * 1000);
        return () => clearInterval(timerRef.current);
    }, [fetchAll, refreshInterval]);

    return { quotes, loading, lastUpdate, needsPermission, refetch: fetchAll };
}

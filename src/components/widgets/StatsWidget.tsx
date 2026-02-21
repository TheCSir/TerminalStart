
import React, { useEffect, useState, useRef } from 'react';
import { Sparkline } from '@/components/ui/Sparkline';

interface StatsWidgetProps {
    mode?: 'text' | 'graph' | 'detailed' | 'minimal';
}

const formatUptime = (ms: number): string => {
    const totalSeconds = Math.floor(ms / 1000);
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
};

const getMemoryMB = (): { used: number; limit: number } | null => {
    const perf = performance as any;
    if (perf.memory) {
        return {
            used: Math.round(perf.memory.usedJSHeapSize / 1048576),
            limit: Math.round(perf.memory.jsHeapSizeLimit / 1048576),
        };
    }
    return null;
};

export const StatsWidget: React.FC<StatsWidgetProps> = ({ mode = 'text' }) => {
    const [ping, setPing] = useState(0);
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [memory, setMemory] = useState(getMemoryMB);
    const [uptime, setUptime] = useState('00:00:00');
    const mountTime = useRef(Date.now());
    const pingRef = useRef(0);

    // History for graphs (last 30 points)
    const HISTORY_LENGTH = 30;
    const [history, setHistory] = useState({
        ping: new Array(HISTORY_LENGTH).fill(0),
        memory: new Array(HISTORY_LENGTH).fill(0),
    });

    // Online/offline listener
    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);
        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    // Ping measurement (existing logic)
    useEffect(() => {
        const measurePing = async () => {
            const start = performance.now();
            try {
                if (!navigator.onLine) {
                    throw new Error('Offline');
                }
                await fetch(`https://www.google.com?_=${Date.now()}`, {
                    method: 'HEAD',
                    mode: 'no-cors',
                    cache: 'no-store',
                });
                const end = performance.now();
                const latency = Math.round(end - start);
                setPing(latency);
                pingRef.current = latency;
            } catch {
                setPing(0);
                pingRef.current = 0;
            }
        };

        measurePing();
        const interval = setInterval(measurePing, 2000);
        return () => clearInterval(interval);
    }, []);

    // Memory + history polling (every 2s)
    useEffect(() => {
        const poll = () => {
            const mem = getMemoryMB();
            setMemory(mem);
            setHistory(prev => ({
                ping: [...prev.ping.slice(1), pingRef.current],
                memory: [...prev.memory.slice(1), mem ? mem.used : 0],
            }));
        };

        poll();
        const interval = setInterval(poll, 2000);
        return () => clearInterval(interval);
    }, []);

    // Uptime counter (every 1s)
    useEffect(() => {
        const interval = setInterval(() => {
            setUptime(formatUptime(Date.now() - mountTime.current));
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    const Row = ({ label, value }: { label: string; value: string }) => (
        <div className="flex justify-between items-center mb-1 text-sm font-mono leading-tight">
            <span className="text-[var(--color-muted)] text-xs">{label.toUpperCase()}</span>
            <span className="text-[var(--color-fg)] font-bold">{value}</span>
        </div>
    );

    // --- RENDER MODES ---

    if (mode === 'graph') {
        return (
            <div className="flex flex-col h-full justify-between py-1 px-1 overflow-hidden select-none">
                {/* Ping Graph */}
                <div className="flex-1 flex flex-col min-h-0 border-b border-[var(--color-border)] border-opacity-30 mb-1 pb-1">
                    <div className="flex justify-between items-baseline mb-1">
                        <span className="text-[10px] font-mono text-[var(--color-muted)]">PING (ms)</span>
                        <span className="text-[10px] font-mono text-[var(--color-fg)]">{ping === 0 ? '<1' : ping}</span>
                    </div>
                    <div className="flex-1 w-full min-h-0 relative">
                        <Sparkline data={history.ping} min={0} />
                    </div>
                </div>

                {/* Memory Graph */}
                <div className="flex-1 flex flex-col min-h-0">
                    <div className="flex justify-between items-baseline mb-1">
                        <span className="text-[10px] font-mono text-[var(--color-muted)]">MEM (MB)</span>
                        <span className="text-[10px] font-mono text-[var(--color-fg)]">
                            {memory ? memory.used : 'N/A'}
                        </span>
                    </div>
                    <div className="flex-1 w-full min-h-0 relative">
                        <Sparkline data={history.memory} min={0} />
                    </div>
                </div>
            </div>
        );
    }

    if (mode === 'detailed') {
        const memPercent = memory ? Math.round((memory.used / memory.limit) * 100) : 0;
        return (
            <div className="flex flex-col h-full font-mono text-xs overflow-hidden select-none justify-between py-1 px-2">
                <div className="overflow-y-auto custom-scrollbar pr-1">
                    {/* Connection Header */}
                    <div className="border-b border-[var(--color-border)] pb-2 mb-2 opacity-90">
                        <div className="flex justify-between items-center mb-1">
                            <span className="text-[var(--color-fg)] font-bold">CONNECTION</span>
                            <span className="flex items-center gap-1.5">
                                <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`}></span>
                                <span className="text-[var(--color-muted)]">{isOnline ? 'Active' : 'Disconnected'}</span>
                            </span>
                        </div>
                        <div className="text-[10px] text-[var(--color-muted)]">
                            PING: {ping === 0 ? '<1' : ping}ms
                        </div>
                    </div>

                    {/* Memory */}
                    <div className="mb-2 border-b border-[var(--color-border)] border-opacity-30 pb-2">
                        <div className="flex justify-between items-center mb-1">
                            <span className="text-[var(--color-muted)] text-[10px]">MEMORY</span>
                            <span className="text-[var(--color-fg)]">
                                {memory ? `${memory.used} / ${memory.limit} MB` : 'N/A'}
                            </span>
                        </div>
                        {memory && (
                            <div className="w-full h-1.5 bg-[var(--color-border)] rounded-sm overflow-hidden">
                                <div
                                    className="h-full bg-[var(--color-accent)] transition-all duration-300"
                                    style={{ width: `${Math.min(memPercent, 100)}%` }}
                                />
                            </div>
                        )}
                    </div>

                    {/* Session */}
                    <div className="mb-2">
                        <div className="text-[var(--color-muted)] text-[10px]">SESSION</div>
                        <div className="text-[var(--color-fg)]">{uptime}</div>
                    </div>
                </div>
            </div>
        );
    }

    if (mode === 'minimal') {
        return (
            <div className="flex flex-col justify-center items-center h-full w-full p-2 select-none overflow-hidden space-y-0.5">
                {/* Connection indicator + Ping */}
                <div className="flex items-center gap-1.5 leading-none">
                    <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <span className="text-xs font-mono font-bold text-[var(--color-fg)]">
                        {isOnline ? 'Active' : 'Offline'}
                    </span>
                </div>

                {/* Ping - Hero */}
                <div className="flex items-baseline gap-1 leading-none">
                    <span className="text-3xl font-bold font-mono text-[var(--color-fg)] tracking-tighter">
                        {ping === 0 ? '<1' : ping}
                    </span>
                    <span className="text-[10px] font-bold text-[var(--color-muted)]">ms</span>
                </div>

                {/* Uptime */}
                <div className="text-xs font-mono text-[var(--color-muted)] opacity-80">{uptime}</div>
            </div>
        );
    }

    // Fallback / Standard Text mode (List View)
    return (
        <div className="flex flex-col justify-center h-full px-2 py-1 gap-1">
            <Row label="conn" value={isOnline ? 'Active' : 'Disconnected'} />
            <Row label="mem" value={memory ? `${memory.used}MB / ${memory.limit}MB` : 'N/A'} />
            <Row label="ping" value={`${ping === 0 ? '<1' : ping}ms`} />
            <Row label="uptime" value={uptime} />
        </div>
    );
};


import React, { useEffect, useState, useRef } from 'react';
import { RealStats } from '../types';
import { Sparkline } from './Sparkline';

interface StatsWidgetProps {
    mode?: 'text' | 'graph' | 'detailed' | 'minimal';
}

export const StatsWidget: React.FC<StatsWidgetProps> = ({ mode = 'text' }) => {
    const [fps, setFps] = useState(0);
    const [ping, setPing] = useState(0);
    const [res, setRes] = useState(`${typeof window !== 'undefined' ? window.screen.width : 1920} x ${typeof window !== 'undefined' ? window.screen.height : 1080}`);

    // History for graphs (last 30 points)
    const HISTORY_LENGTH = 30;
    const [history, setHistory] = useState({
        fps: new Array(HISTORY_LENGTH).fill(0),
        ping: new Array(HISTORY_LENGTH).fill(0)
    });

    // Real stats state (Client Side Only) - Used for detailed view
    const [realStats, setRealStats] = useState<RealStats>({
        os: 'Unknown',
        browser: 'Unknown',
        gpu: 'Unknown',
        cores: navigator.hardwareConcurrency || 0,
        memoryGB: (navigator as any).deviceMemory || null,
        network: { type: 'unknown', downlink: null }
    });

    // Refs for access inside closures
    const pingRef = useRef(0);

    // Real Ping Measurement
    useEffect(() => {
        const measurePing = async () => {
            const start = performance.now();
            try {
                if (!navigator.onLine) {
                    throw new Error("Offline");
                }
                // Ping Google (HEAD request, no-cors, with cache buster)
                await fetch(`https://www.google.com?_=${Date.now()}`, {
                    method: 'HEAD',
                    mode: 'no-cors',
                    cache: 'no-store'
                });
                const end = performance.now();
                const latency = Math.round(end - start);

                setPing(latency);
                pingRef.current = latency;
            } catch (e) {
                setPing(0);
                pingRef.current = 0;
            }
        };

        measurePing();
        const interval = setInterval(measurePing, 2000);
        return () => clearInterval(interval);
    }, []);

    // Performance Loop (FPS)
    useEffect(() => {
        let frameCount = 0;
        let lastTime = performance.now();
        let animationFrameId: number;

        const loop = (currentTime: number) => {
            frameCount++;
            const delta = currentTime - lastTime;

            if (delta >= 1000) {
                const currentFps = frameCount;
                setFps(currentFps);

                // Update history
                setHistory(prev => ({
                    fps: [...prev.fps.slice(1), currentFps],
                    ping: [...prev.ping.slice(1), pingRef.current]
                }));

                frameCount = 0;
                lastTime = currentTime;
            }
            animationFrameId = requestAnimationFrame(loop);
        };

        animationFrameId = requestAnimationFrame(loop);
        return () => cancelAnimationFrame(animationFrameId);
    }, []);

    // Update Resolution on resize
    useEffect(() => {
        const handleResize = () => {
            setRes(`${window.screen.width} x ${window.screen.height}`);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Detailed Stats Gathering
    useEffect(() => {
        if (mode !== 'detailed') return; // Only gather if needed

        let os = 'Unknown';
        if (navigator.userAgent.indexOf('Win') !== -1) os = 'Windows';
        else if (navigator.userAgent.indexOf('Mac') !== -1) os = 'MacOS';
        else if (navigator.userAgent.indexOf('Linux') !== -1) os = 'Linux';
        else if (navigator.userAgent.indexOf('Android') !== -1) os = 'Android';
        else if (navigator.userAgent.indexOf('iOS') !== -1) os = 'iOS';

        let browser = 'Unknown';
        if (navigator.userAgent.indexOf('Firefox') !== -1) browser = 'Firefox';
        else if (navigator.userAgent.indexOf('Chrome') !== -1) browser = 'Chrome';
        else if (navigator.userAgent.indexOf('Safari') !== -1) browser = 'Safari';

        let gpu = 'Unknown GPU';
        try {
            const canvas = document.createElement('canvas');
            const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
            if (gl) {
                const debugInfo = (gl as WebGLRenderingContext).getExtension('WEBGL_debug_renderer_info');
                if (debugInfo) {
                    gpu = (gl as WebGLRenderingContext).getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
                    gpu = gpu.replace(/ANGLE \((.*)\)/, '$1').replace(/Direct3D11 vs_.* ps_.*/, '');
                }
            }
        } catch (e) { }

        setRealStats(prev => ({ ...prev, os, browser, gpu }));

        if ((navigator as any).connection) {
            const conn = (navigator as any).connection;
            setRealStats(prev => ({
                ...prev,
                network: { type: conn.effectiveType, downlink: conn.downlink }
            }));
        }
    }, [mode]);

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
                {/* FPS Graph */}
                <div className="flex-1 flex flex-col min-h-0 border-b border-[var(--color-border)] border-opacity-30 mb-1 pb-1">
                    <div className="flex justify-between items-baseline mb-1">
                        <span className="text-[10px] font-mono text-[var(--color-muted)]">FPS</span>
                        <span className="text-[10px] font-mono text-[var(--color-fg)]">{fps}</span>
                    </div>
                    <div className="flex-1 w-full min-h-0 relative">
                        <Sparkline data={history.fps} min={0} max={Math.max(60, ...history.fps)} />
                    </div>
                </div>

                {/* Ping Graph */}
                <div className="flex-1 flex flex-col min-h-0">
                    <div className="flex justify-between items-baseline mb-1">
                        <span className="text-[10px] font-mono text-[var(--color-muted)]">PING (ms)</span>
                        <span className="text-[10px] font-mono text-[var(--color-fg)]">{ping === 0 ? '<1' : ping}</span>
                    </div>
                    <div className="flex-1 w-full min-h-0 relative">
                        <Sparkline data={history.ping} min={0} />
                    </div>
                </div>
            </div>
        );
    }

    if (mode === 'detailed') {
        return (
            <div className="flex flex-col h-full font-mono text-xs overflow-hidden select-none justify-between py-1">
                <div className="overflow-y-auto custom-scrollbar pr-1">
                    {/* System Header */}
                    <div className="border-b border-[var(--color-border)] pb-2 mb-2 opacity-90">
                        <div className="flex justify-between items-center mb-1">
                            <span className="text-[var(--color-fg)] font-bold">SYSTEM</span>
                            <span className="text-[var(--color-muted)]">
                                {realStats.os} / {realStats.browser}
                            </span>
                        </div>
                        <div className="text-[10px] text-[var(--color-muted)] truncate" title={realStats.gpu}>
                            GPU: {realStats.gpu}
                        </div>
                    </div>

                    {/* CPU/RAM */}
                    <div className="grid grid-cols-2 gap-2 mb-2 border-b border-[var(--color-border)] border-opacity-30 pb-2">
                        <div>
                            <div className="text-[var(--color-muted)] text-[10px]">CORES</div>
                            <div className="text-[var(--color-fg)]">{realStats.cores}</div>
                        </div>
                        <div className="text-right">
                            <div className="text-[var(--color-muted)] text-[10px]">RAM (EST)</div>
                            <div className="text-[var(--color-fg)]">
                                {realStats.memoryGB ? `${realStats.memoryGB} GB` : 'N/A'}
                            </div>
                        </div>
                    </div>

                    {/* Network */}
                    <div className="mb-2">
                        <div className="text-[var(--color-muted)] text-[10px]">NETWORK</div>
                        <div className="text-[var(--color-fg)]">
                            {realStats.network.type ? realStats.network.type.toUpperCase() : 'UNKNOWN'}
                            {realStats.network.downlink ? ` (${realStats.network.downlink} Mbps)` : ''}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-auto pt-2 border-t border-[var(--color-border)] text-[10px] text-[var(--color-muted)] flex justify-between">
                    <span>{res}</span>
                    <span>{fps} FPS</span>
                </div>
            </div>
        );
    }

    if (mode === 'minimal') {
        return (
            <div className="flex flex-col justify-center items-center h-full w-full p-2 select-none overflow-hidden space-y-0.5">
                {/* FPS - Hero */}
                <div className="flex items-baseline gap-1 leading-none">
                    <span className="text-3xl font-bold font-mono text-[var(--color-fg)] tracking-tighter">{fps}</span>
                    <span className="text-[10px] font-bold text-[var(--color-muted)]">FPS</span>
                </div>

                {/* Ping - Subtitle */}
                <div className="flex items-center gap-1.5 opacity-80">
                    <div className={`w-1.5 h-1.5 rounded-full ${ping > 100 ? 'bg-red-500' : ping > 50 ? 'bg-yellow-500' : 'bg-green-500'}`}></div>
                    <span className="text-xs font-mono text-[var(--color-muted)]">{ping === 0 ? '<1' : ping}ms</span>
                </div>
            </div>
        );
    }

    // Fallback / Standard Text mode (List View)
    return (
        <div className="flex flex-col justify-center h-full px-2 py-1 gap-1">
            <Row label="fps" value={`${fps}`} />
            <Row label="ping" value={`${ping === 0 ? '<1' : ping}ms`} />
            <Row label="res" value={res} />
        </div>
    );
};

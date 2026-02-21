import React, { useRef, useEffect } from 'react';
import { useMarketData, requestHostPermission } from '@/hooks/useMarketData';
import { MarketQuote, MarketProvider } from '@/types';

interface MarketWidgetProps {
    symbols: string[];
    refreshInterval: number;
    provider?: MarketProvider;
    apiKey?: string;
}

export const MarketWidget: React.FC<MarketWidgetProps> = ({ symbols, refreshInterval, provider = 'yahoo', apiKey }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const { quotes, loading, lastUpdate, needsPermission, refetch } = useMarketData(symbols, refreshInterval, provider, apiKey);
    const quotesRef = useRef<MarketQuote[]>(quotes);
    const loadingRef = useRef(loading);
    const lastUpdateRef = useRef(lastUpdate);
    const scrollOffsetRef = useRef(0);

    // Keep refs in sync
    useEffect(() => { quotesRef.current = quotes; }, [quotes]);
    useEffect(() => { loadingRef.current = loading; }, [loading]);
    useEffect(() => { lastUpdateRef.current = lastUpdate; }, [lastUpdate]);

    useEffect(() => {
        const canvas = canvasRef.current;
        const container = containerRef.current;
        if (!canvas || !container) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animId: number;
        const dpr = window.devicePixelRatio || 1;

        function getColors() {
            const s = getComputedStyle(document.documentElement);
            return {
                bg: s.getPropertyValue('--color-bg').trim() || '#222222',
                fg: s.getPropertyValue('--color-fg').trim() || '#aaaaaa',
                muted: s.getPropertyValue('--color-muted').trim() || '#666666',
                border: s.getPropertyValue('--color-border').trim() || '#444444',
                accent: s.getPropertyValue('--color-accent').trim() || '#88aaff',
            };
        }

        function resize() {
            const rect = container!.getBoundingClientRect();
            canvas!.width = rect.width * dpr;
            canvas!.height = rect.height * dpr;
            canvas!.style.width = `${rect.width}px`;
            canvas!.style.height = `${rect.height}px`;
            ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
        }

        const ro = new ResizeObserver(resize);
        ro.observe(container);
        resize();

        // Handle scroll
        const handleWheel = (e: WheelEvent) => {
            e.preventDefault();
            scrollOffsetRef.current += e.deltaY > 0 ? 1 : -1;
            if (scrollOffsetRef.current < 0) scrollOffsetRef.current = 0;
        };
        canvas.addEventListener('wheel', handleWheel, { passive: false });

        function formatPrice(price: number): string {
            if (price === 0) return '-.--';
            if (price >= 10000) return price.toFixed(0);
            if (price >= 100) return price.toFixed(1);
            if (price >= 1) return price.toFixed(2);
            return price.toFixed(4);
        }

        function formatChange(change: number): string {
            const sign = change >= 0 ? '+' : '';
            if (Math.abs(change) >= 100) return `${sign}${change.toFixed(0)}`;
            if (Math.abs(change) >= 1) return `${sign}${change.toFixed(2)}`;
            return `${sign}${change.toFixed(4)}`;
        }

        function formatPercent(pct: number): string {
            const sign = pct >= 0 ? '+' : '';
            return `${sign}${pct.toFixed(2)}%`;
        }

        function drawSparkline(
            ctx: CanvasRenderingContext2D,
            data: number[],
            x: number, y: number, w: number, h: number,
            isUp: boolean,
        ) {
            if (data.length < 2) return;

            const min = Math.min(...data);
            const max = Math.max(...data);
            const range = max - min || 1;

            const color = isUp ? '#22c55e' : '#ef4444';

            // Draw sparkline area (faint fill)
            ctx.beginPath();
            for (let i = 0; i < data.length; i++) {
                const px = x + (i / (data.length - 1)) * w;
                const py = y + h - ((data[i] - min) / range) * h;
                if (i === 0) ctx.moveTo(px, py);
                else ctx.lineTo(px, py);
            }
            // close path down for fill
            ctx.lineTo(x + w, y + h);
            ctx.lineTo(x, y + h);
            ctx.closePath();
            ctx.fillStyle = color + '15';
            ctx.fill();

            // Draw sparkline line
            ctx.beginPath();
            for (let i = 0; i < data.length; i++) {
                const px = x + (i / (data.length - 1)) * w;
                const py = y + h - ((data[i] - min) / range) * h;
                if (i === 0) ctx.moveTo(px, py);
                else ctx.lineTo(px, py);
            }
            ctx.strokeStyle = color;
            ctx.lineWidth = 1;
            ctx.stroke();

            // Current price dot
            const lastPx = x + w;
            const lastPy = y + h - ((data[data.length - 1] - min) / range) * h;
            ctx.beginPath();
            ctx.arc(lastPx, lastPy, 2, 0, Math.PI * 2);
            ctx.fillStyle = color;
            ctx.fill();
        }

        function draw() {
            const w = canvas!.width / dpr;
            const h = canvas!.height / dpr;
            const c = getColors();
            const data = quotesRef.current;
            const isLoading = loadingRef.current;

            // Clear
            ctx!.fillStyle = c.bg;
            ctx!.fillRect(0, 0, w, h);

            const fontSize = Math.max(10, Math.min(12, w / 40));
            const rowH = fontSize + 10;
            const headerH = rowH;
            const statusH = fontSize + 8;
            const bodyH = h - headerH - statusH;
            const sparkW = Math.max(40, Math.min(80, w * 0.15));
            const padX = 12;

            ctx!.font = `${fontSize}px "JetBrains Mono", monospace`;
            ctx!.textBaseline = 'middle';

            // --- Header row ---
            ctx!.fillStyle = c.border + '40';
            ctx!.fillRect(0, 0, w, headerH);

            ctx!.fillStyle = c.muted;
            ctx!.textAlign = 'left';
            ctx!.fillText('SYMBOL', padX, headerH / 2);

            // Column positions (responsive)
            const colName = Math.max(w * 0.14, 65);
            const colPrice = Math.max(w * 0.42, 120);
            const colChg = Math.max(w * 0.58, 170);
            const colPct = Math.max(w * 0.72, 210);
            const colSpark = w - sparkW - padX;

            ctx!.fillText('NAME', colName, headerH / 2);

            ctx!.textAlign = 'right';
            ctx!.fillText('PRICE', colPrice + 50, headerH / 2);
            ctx!.fillText('CHG', colChg + 40, headerH / 2);
            ctx!.fillText('CHG%', colPct + 45, headerH / 2);

            ctx!.textAlign = 'center';
            ctx!.fillText('TREND', colSpark + sparkW / 2, headerH / 2);

            // Header separator
            ctx!.strokeStyle = c.border;
            ctx!.lineWidth = 1;
            ctx!.beginPath();
            ctx!.moveTo(0, headerH);
            ctx!.lineTo(w, headerH);
            ctx!.stroke();

            // --- Loading state ---
            if (isLoading && data.length === 0) {
                ctx!.fillStyle = c.muted;
                ctx!.textAlign = 'center';
                const dots = '.'.repeat((Math.floor(Date.now() / 400) % 3) + 1);
                ctx!.fillText(`fetching${dots}`, w / 2, h / 2);
                animId = requestAnimationFrame(draw);
                return;
            }

            // --- No symbols ---
            if (data.length === 0) {
                ctx!.fillStyle = c.muted;
                ctx!.textAlign = 'center';
                ctx!.fillText('no symbols configured', w / 2, h / 2);
                animId = requestAnimationFrame(draw);
                return;
            }

            // --- Data rows ---
            const maxVisible = Math.floor(bodyH / rowH);
            const maxScroll = Math.max(0, data.length - maxVisible);
            if (scrollOffsetRef.current > maxScroll) scrollOffsetRef.current = maxScroll;
            const startIdx = scrollOffsetRef.current;
            const visibleCount = Math.min(data.length - startIdx, maxVisible);

            ctx!.save();
            ctx!.beginPath();
            ctx!.rect(0, headerH, w, bodyH);
            ctx!.clip();

            for (let i = 0; i < visibleCount; i++) {
                const q = data[startIdx + i];
                const rowY = headerH + i * rowH;
                const textY = rowY + rowH / 2;

                // Alternating row bg
                if (i % 2 === 1) {
                    ctx!.fillStyle = c.border + '10';
                    ctx!.fillRect(0, rowY, w, rowH);
                }

                // Row separator
                ctx!.strokeStyle = c.border + '30';
                ctx!.lineWidth = 0.5;
                ctx!.beginPath();
                ctx!.moveTo(padX, rowY + rowH);
                ctx!.lineTo(w - padX, rowY + rowH);
                ctx!.stroke();

                if (q.error) {
                    // Error row
                    ctx!.fillStyle = c.muted;
                    ctx!.textAlign = 'left';
                    ctx!.fillText(q.symbol, padX, textY);
                    ctx!.fillStyle = '#ef4444';
                    ctx!.textAlign = 'right';
                    ctx!.fillText('error', colPrice + 50, textY);
                    continue;
                }

                const changeColor = q.isUp ? '#22c55e' : '#ef4444';

                // Symbol
                ctx!.fillStyle = c.fg;
                ctx!.textAlign = 'left';
                ctx!.fillText(q.symbol, padX, textY);

                // Name (muted, truncated to fit)
                if (q.name) {
                    ctx!.fillStyle = c.muted;
                    const maxNameW = colPrice - colName - 10;
                    let displayName = q.name;
                    while (displayName.length > 0 && ctx!.measureText(displayName).width > maxNameW) {
                        displayName = displayName.slice(0, -1);
                    }
                    if (displayName.length < q.name.length && displayName.length > 0) {
                        displayName = displayName.slice(0, -1) + '\u2026';
                    }
                    ctx!.fillText(displayName, colName, textY);
                }

                // Price
                ctx!.fillStyle = c.fg;
                ctx!.textAlign = 'right';
                ctx!.fillText(formatPrice(q.price), colPrice + 50, textY);

                // Change
                ctx!.fillStyle = changeColor;
                ctx!.textAlign = 'right';
                ctx!.fillText(formatChange(q.change), colChg + 40, textY);

                // Change %
                ctx!.fillText(formatPercent(q.changePercent), colPct + 45, textY);

                // Arrow
                const arrowX = colPct + 55;
                ctx!.fillStyle = changeColor;
                ctx!.textAlign = 'left';
                ctx!.fillText(q.isUp ? '\u25B2' : '\u25BC', arrowX, textY);

                // Sparkline
                drawSparkline(
                    ctx!, q.sparkline,
                    colSpark, rowY + 3, sparkW, rowH - 6,
                    q.isUp,
                );
            }

            ctx!.restore();

            // Scroll indicator
            if (data.length > maxVisible) {
                const barH = bodyH * (maxVisible / data.length);
                const barY = headerH + (scrollOffsetRef.current / maxScroll) * (bodyH - barH);
                ctx!.fillStyle = c.border + '60';
                ctx!.fillRect(w - 2, barY, 2, barH);
            }

            // --- Status bar ---
            const statusY = h - statusH;
            ctx!.fillStyle = c.border + '20';
            ctx!.fillRect(0, statusY, w, statusH);
            ctx!.strokeStyle = c.border;
            ctx!.lineWidth = 0.5;
            ctx!.beginPath();
            ctx!.moveTo(0, statusY);
            ctx!.lineTo(w, statusY);
            ctx!.stroke();

            ctx!.font = `${fontSize - 2}px "JetBrains Mono", monospace`;
            ctx!.fillStyle = c.muted;
            ctx!.textAlign = 'left';

            const lu = lastUpdateRef.current;
            const timeStr = lu ? new Date(lu).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '--:--:--';
            ctx!.fillText(`last: ${timeStr}`, padX, statusY + statusH / 2);

            ctx!.textAlign = 'right';
            const countStr = `${data.filter(q => !q.error).length}/${data.length} symbols`;
            ctx!.fillText(countStr, w - padX, statusY + statusH / 2);

            // Loading indicator
            if (isLoading) {
                const dots = '.'.repeat((Math.floor(Date.now() / 300) % 3) + 1);
                ctx!.textAlign = 'center';
                ctx!.fillStyle = c.accent;
                ctx!.fillText(`updating${dots}`, w / 2, statusY + statusH / 2);
            }

            animId = requestAnimationFrame(draw);
        }

        animId = requestAnimationFrame(draw);

        return () => {
            cancelAnimationFrame(animId);
            ro.disconnect();
            canvas.removeEventListener('wheel', handleWheel);
        };
    }, []);

    if (needsPermission) {
        return (
            <div className="w-full h-full flex items-center justify-center">
                <button
                    onClick={async () => {
                        const granted = await requestHostPermission(provider);
                        if (granted) refetch();
                    }}
                    className="px-4 py-2 text-xs font-mono border border-[var(--color-border)] text-[var(--color-fg)] bg-[var(--color-hover)] hover:bg-[var(--color-border)] transition-colors cursor-pointer"
                >
                    click to allow market data access
                </button>
            </div>
        );
    }

    return (
        <div ref={containerRef} className="w-full h-full">
            <canvas ref={canvasRef} className="block w-full h-full" />
        </div>
    );
};

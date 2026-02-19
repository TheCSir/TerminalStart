import React, { useEffect, useState, useRef } from 'react';

export const DateTimeWidget: React.FC = () => {
  const [date, setDate] = useState(new Date());
  const containerRef = useRef<HTMLDivElement>(null);
  const [layout, setLayout] = useState<'vertical' | 'horizontal'>('horizontal');
  const [timeFontSize, setTimeFontSize] = useState(40);
  const [dateFontSize, setDateFontSize] = useState(12);

  useEffect(() => {
    const timer = setInterval(() => setDate(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;

    const calculateSize = () => {
      if (!containerRef.current) return;
      const { clientWidth: w, clientHeight: h } = containerRef.current;

      // Determine Layout
      // If height is generous relative to width, go vertical to stack Time / PM / Date
      // Adjusted threshold to prefer vertical stacking in square-ish boxes for better fit
      const isVertical = h > w * 0.55;
      setLayout(isVertical ? 'vertical' : 'horizontal');

      // Font Size Calculations
      // DSEG7 Font aspect ratio is approx 0.55-0.6 (width / height)
      const CHAR_ASPECT = 0.55;

      // Char counts based on format
      const TIME_CHARS_H = 11; // "12:00:00 PM"
      const TIME_CHARS_V_TOP = 8;  // "12:00:00"

      let newTimeFS = 0;
      let newDateFS = 0;

      if (isVertical) {
        // Width constraint: 8 chars
        // We use 0.85 of width to leave padding
        const widthConstrainedFS = (w * 0.85) / (TIME_CHARS_V_TOP * CHAR_ASPECT);

        // Height constraint: 
        // We need to fit: Time (1em) + PM (0.4em) + Date (1em approx) + Spacing
        const totalHeightEm = 1 + 0.4 + 0.5; // Roughly 2em total height budget needed
        const heightConstrainedFS = (h * 0.6) / totalHeightEm;

        newTimeFS = Math.min(widthConstrainedFS, heightConstrainedFS);
        newDateFS = Math.max(10, Math.min(16, w * 0.08));
      } else {
        // Horizontal
        // Width constraint: 11 chars
        const widthConstrainedFS = (w * 0.9) / (TIME_CHARS_H * CHAR_ASPECT);

        // Height constraint: Time takes up bulk, date below
        const heightConstrainedFS = h * 0.55;

        newTimeFS = Math.min(widthConstrainedFS, heightConstrainedFS);
        newDateFS = Math.max(10, Math.min(16, h * 0.2));
      }

      // clamp minimum font size
      setTimeFontSize(Math.max(20, Math.floor(newTimeFS)));
      setDateFontSize(Math.floor(newDateFS));
    };

    const observer = new ResizeObserver(calculateSize);
    observer.observe(containerRef.current);
    // Debounce slightly to prevent flicker
    const timeout = setTimeout(calculateSize, 0);

    return () => {
      observer.disconnect();
      clearTimeout(timeout);
    };
  }, []);

  const timeStringFull = date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });

  // Split "12:00:00 PM" -> ["12:00:00", "PM"]
  const [timePart, ampmPart] = timeStringFull.split(' ');

  const dateOptions: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  };
  const dateString = date.toLocaleDateString('en-US', dateOptions).toLowerCase();

  return (
    <div ref={containerRef} className="w-full h-full flex flex-col items-center justify-center overflow-hidden">
      {layout === 'vertical' ? (
        <div className="flex flex-col items-center justify-center gap-0 w-full">
          {/* Time Numbers */}
          <div
            className="font-digital text-[var(--color-fg)] leading-none text-center"
            style={{ fontSize: `${timeFontSize}px` }}
          >
            {timePart}
          </div>
          {/* AM/PM */}
          <div
            className="font-digital text-[var(--color-fg)] leading-none opacity-80 mt-1"
            style={{ fontSize: `${timeFontSize * 0.4}px` }}
          >
            {ampmPart}
          </div>
          {/* Date */}
          <div
            className="text-[var(--color-muted)] font-mono text-center leading-tight mt-3 px-1 w-full truncate"
            style={{ fontSize: `${dateFontSize}px` }}
          >
            {dateString}
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center w-full">
          <div
            className="font-digital text-[var(--color-fg)] leading-none whitespace-nowrap"
            style={{ fontSize: `${timeFontSize}px` }}
          >
            {timeStringFull}
          </div>
          <div
            className="text-[var(--color-muted)] font-mono mt-1 whitespace-nowrap"
            style={{ fontSize: `${dateFontSize}px` }}
          >
            {dateString}
          </div>
        </div>
      )}
    </div>
  );
};
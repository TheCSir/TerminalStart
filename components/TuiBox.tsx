import React, { forwardRef } from 'react';

interface TuiBoxProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  className?: string;
  children: React.ReactNode;
  showTitle?: boolean;
  onClose?: () => void;
}

// Forward ref is required for react-grid-layout to work correctly with custom components
export const TuiBox = forwardRef<HTMLDivElement, TuiBoxProps>(({ title, className = '', children, showTitle = true, onClose, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={`border border-[var(--color-border)] bg-[var(--color-bg)] relative flex flex-col widget-rounded ${className}`}
      style={{ ...props.style }}
      {...props}
    >
      {/* Simulated Legend/Title or Invisible Handle */}
      {showTitle ? (
        <div className="flex items-center justify-between pointer-events-none z-20" style={{ lineHeight: '1.2rem', marginTop: '-0.6rem' }}>
          <div
            className="ml-3 bg-[var(--color-bg)] px-2 text-[var(--color-muted)] text-sm lowercase font-bold select-none cursor-move drag-handle pointer-events-auto"
          >
            {title}
          </div>
          {onClose && (
            <div
              className="mr-3 bg-[var(--color-bg)] px-2 text-[var(--color-muted)] hover:text-red-500 text-sm font-bold cursor-pointer pointer-events-auto"
              onClick={onClose}
            >
              [x]
            </div>
          )}
        </div>
      ) : (
        <>
            <div
            className="absolute top-0 left-0 w-full h-4 z-20 cursor-move drag-handle"
            title={title}
            />
            {onClose && (
            <div
              className="absolute top-0 right-0 z-30 px-2 text-[var(--color-muted)] hover:text-red-500 text-sm font-bold cursor-pointer"
              onClick={onClose}
            >
              [x]
            </div>
            )}
        </>
      )}

      {/* Content Area - Inner overflow handling */}
      <div className="flex-1 min-h-0 min-w-0 w-full relative pt-1 px-2 pb-2 overflow-hidden">
        {children}
      </div>
    </div>
  );
});

TuiBox.displayName = 'TuiBox';

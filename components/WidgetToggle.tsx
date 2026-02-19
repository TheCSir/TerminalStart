import React from 'react';

export interface WidgetToggleProps {
    id: string;
    label: string;
    isActive: boolean;
    onToggle: (id: string) => void;
    onDoubleClick?: () => void;
}

export const WidgetToggle: React.FC<WidgetToggleProps> = ({ id, label, isActive, onToggle, onDoubleClick }) => (
    <div
        onClick={() => onToggle(id)}
        onDoubleClick={onDoubleClick}
        className="flex items-center justify-between border border-[var(--color-border)] p-3 cursor-pointer hover:bg-[var(--color-hover)] select-none group no-radius"
    >
        <span className="text-[var(--color-fg)]">{label}</span>
        <span className="font-mono text-[var(--color-accent)] font-bold group-hover:text-shadow-glow">
            {isActive ? '[x]' : '[ ]'}
        </span>
    </div>
);

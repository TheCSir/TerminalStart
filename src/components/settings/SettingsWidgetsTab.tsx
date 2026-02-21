import React from 'react';
import { WidgetToggle } from '@/components/ui/WidgetToggle';

interface SettingsWidgetsTabProps {
    activeWidgets: Record<string, boolean>;
    onToggleWidget: (key: string) => void;
    setWidgetToDuplicate: (widget: string | null) => void;
}

export const SettingsWidgetsTab: React.FC<SettingsWidgetsTabProps> = ({
    activeWidgets,
    onToggleWidget,
    setWidgetToDuplicate,
}) => {
    const CoreWidgets = ['search', 'datetime', 'stats', 'weather', 'todo', 'links', 'market'];
    const FunWidgets = ['donut', 'matrix', 'pipes', 'snake', 'life', 'fireworks', 'starfield', 'rain', 'maze'];

    return (
        <div className="space-y-6">

            <div>
                <h3 className="text-[var(--color-accent)] font-bold mb-4 border-b border-[var(--color-border)] pb-2">Core Widgets</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {CoreWidgets.map(w => (
                        <WidgetToggle
                            key={w}
                            id={w}
                            label={w}
                            isActive={!!activeWidgets[w]}
                            onToggle={onToggleWidget}
                        />
                    ))}
                </div>
            </div>

            <div>
                <h3 className="text-[var(--color-accent)] font-bold mb-4 border-b border-[var(--color-border)] pb-2">Visual / Extras</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {FunWidgets.flatMap(w => {
                        // Find all instances of this widget type (e.g. "snake" and "snake-123456")
                        const instances = Object.keys(activeWidgets).filter(
                            key => key === w || key.startsWith(`${w}-`)
                        );
                        // If no instances, show the base one as inactive
                        if (instances.length === 0) instances.push(w);

                        return instances.sort().map(key => {
                            const isBase = key === w;
                            const displayLabel = isBase ? w : `${w} (extra)`;
                            return (
                                <WidgetToggle
                                    key={key}
                                    id={key}
                                    label={displayLabel}
                                    isActive={!!activeWidgets[key]}
                                    onToggle={onToggleWidget}
                                    onDoubleClick={() => setWidgetToDuplicate(w)}
                                />
                            );
                        });
                    })}
                </div>
            </div>

            <div className="flex flex-col gap-1 mt-4">
                <p className="text-[var(--color-muted)] text-xs">
                    Note: Toggling widgets may reset their position to the bottom of the grid.
                </p>
                <p className="text-[var(--color-accent)] text-xs font-bold">
                    Tip: Double-click to add duplicate widgets.
                </p>
            </div>
        </div>
    );
};

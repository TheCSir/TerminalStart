import React, { useState } from 'react';

interface SettingsPresetsTabProps {
    presets: any[];
    onSavePreset: (name: string) => void;
    onLoadPreset: (preset: any) => void;
    onDeletePreset: (id: number) => void;
}

export const SettingsPresetsTab: React.FC<SettingsPresetsTabProps> = ({
    presets,
    onSavePreset,
    onLoadPreset,
    onDeletePreset,
}) => {
    const [newPresetName, setNewPresetName] = useState('');

    const handleSavePresetClick = () => {
        if (!newPresetName.trim()) return;
        onSavePreset(newPresetName);
        setNewPresetName('');
    };

    return (
        <div className="space-y-6">
            <div className="border border-[var(--color-border)] p-4">
                <h3 className="text-[var(--color-accent)] font-bold mb-3">Save Current Config</h3>
                <div className="flex gap-2">
                    <input
                        type="text"
                        placeholder="preset name (e.g. Work Mode)"
                        className="bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-fg)] px-3 py-1 text-sm focus:border-[var(--color-accent)] outline-none flex-1 select-text no-radius"
                        value={newPresetName}
                        onChange={(e) => setNewPresetName(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSavePresetClick()}
                    />
                    <button
                        onClick={handleSavePresetClick}
                        className="bg-[var(--color-hover)] text-[var(--color-fg)] px-4 py-1 text-sm border border-[var(--color-border)] hover:border-[var(--color-accent)] no-radius"
                    >
                        [ SAVE ]
                    </button>
                </div>
            </div>

            <div className="border-t border-[var(--color-border)] pt-4">
                <h3 className="text-[var(--color-accent)] font-bold mb-4">Saved Presets</h3>
                <div className="space-y-2">
                    {presets.length === 0 && (
                        <div className="text-[var(--color-muted)] italic text-sm">No saved presets.</div>
                    )}
                    {presets.map(preset => (
                        <div key={preset.id} className="flex items-center justify-between border border-[var(--color-border)] p-3 hover:bg-[var(--color-hover)] no-radius">
                            <span className="text-[var(--color-fg)] font-mono">{preset.name}</span>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => onLoadPreset(preset)}
                                    className="text-[var(--color-accent)] hover:underline text-xs"
                                >
                                    [ LOAD ]
                                </button>
                                <button
                                    onClick={() => onDeletePreset(preset.id)}
                                    className="text-[var(--color-muted)] hover:text-red-500 text-xs"
                                >
                                    [ x ]
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

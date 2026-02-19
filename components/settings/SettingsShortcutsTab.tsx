import React, { useState, useRef, useEffect } from 'react';
import { LinkGroup } from '../../types';
import { LinkIcon } from '../LinkIcon';

interface IconEditorProps {
    currentIcon?: string;
    url: string;
    onChangeIcon: (icon: string) => void;
}

const IconEditor: React.FC<IconEditorProps> = ({ currentIcon, url, onChangeIcon }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [inputValue, setInputValue] = useState(currentIcon || '');
    const containerRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (!isOpen) return;
        const handleClickOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    const handleApply = () => {
        onChangeIcon(inputValue);
        setIsOpen(false);
    };

    const handleClear = () => {
        onChangeIcon('');
        setInputValue('');
        setIsOpen(false);
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !file.type.startsWith('image/')) return;
        if (file.size > 65536) {
            alert('Image too large. Please use an image under 64KB.');
            return;
        }
        const reader = new FileReader();
        reader.onload = () => {
            const base64 = reader.result as string;
            onChangeIcon(base64);
            setInputValue(base64);
            setIsOpen(false);
        };
        reader.readAsDataURL(file);
        e.target.value = '';
    };

    return (
        <div className="relative" ref={containerRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="text-[var(--color-muted)] hover:text-[var(--color-fg)] text-xs"
                title="Edit icon"
            >
                [ico]
            </button>
            {isOpen && (
                <div className="absolute right-0 top-full mt-1 z-50 bg-[var(--color-bg)] border border-[var(--color-border)] p-3 shadow-lg min-w-[220px] no-radius">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-[var(--color-muted)] text-xs">current:</span>
                        <LinkIcon icon={currentIcon} url={url} />
                    </div>

                    <input
                        type="text"
                        placeholder="emoji or image URL"
                        className="bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-fg)] px-2 py-1 text-xs focus:border-[var(--color-accent)] outline-none w-full mb-2 no-radius select-text"
                        value={inputValue.startsWith('data:image/') ? '(uploaded image)' : inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleApply()}
                    />

                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleFileUpload}
                    />

                    <div className="flex gap-2 items-center">
                        <button
                            onClick={handleApply}
                            className="text-[var(--color-fg)] hover:text-[var(--color-accent)] text-xs"
                        >
                            [set]
                        </button>
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="text-[var(--color-muted)] hover:text-[var(--color-fg)] text-xs"
                        >
                            [upload]
                        </button>
                        <button
                            onClick={handleClear}
                            className="text-[var(--color-muted)] hover:text-[var(--color-fg)] text-xs"
                        >
                            [default]
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

interface SettingsShortcutsTabProps {
    linkGroups: LinkGroup[];
    onUpdateLinks: (groups: LinkGroup[]) => void;
}

export const SettingsShortcutsTab: React.FC<SettingsShortcutsTabProps> = ({
    linkGroups,
    onUpdateLinks,
}) => {
    const [newCatName, setNewCatName] = useState('');
    const [newLinkInputs, setNewLinkInputs] = useState<Record<string, { label: string, url: string, icon: string }>>({});

    const handleAddCategory = () => {
        if (!newCatName.trim()) return;
        onUpdateLinks([...linkGroups, { category: newCatName, links: [] }]);
        setNewCatName('');
    };

    const handleDeleteCategory = (catIndex: number) => {
        const newGroups = [...linkGroups];
        newGroups.splice(catIndex, 1);
        onUpdateLinks(newGroups);
    };

    const handleAddLink = (catIndex: number) => {
        const catName = linkGroups[catIndex].category;
        const input = newLinkInputs[catName] || { label: '', url: '', icon: '' };

        if (!input.label.trim() || !input.url.trim()) return;

        const newGroups = [...linkGroups];
        newGroups[catIndex].links.push({
            label: input.label,
            url: input.url,
            icon: input.icon || undefined
        });
        onUpdateLinks(newGroups);

        setNewLinkInputs({
            ...newLinkInputs,
            [catName]: { label: '', url: '', icon: '' }
        });
    };

    const handleDeleteLink = (catIndex: number, linkIndex: number) => {
        const newGroups = [...linkGroups];
        newGroups[catIndex].links.splice(linkIndex, 1);
        onUpdateLinks(newGroups);
    };

    const handleUpdateLinkIcon = (catIndex: number, linkIndex: number, icon: string) => {
        const newGroups = linkGroups.map((g, gi) => {
            if (gi !== catIndex) return g;
            return {
                ...g,
                links: g.links.map((l, li) => {
                    if (li !== linkIndex) return l;
                    return { ...l, icon: icon || undefined };
                })
            };
        });
        onUpdateLinks(newGroups);
    };

    const updateLinkInput = (catName: string, field: 'label' | 'url' | 'icon', value: string) => {
        setNewLinkInputs({
            ...newLinkInputs,
            [catName]: {
                ...(newLinkInputs[catName] || { label: '', url: '', icon: '' }),
                [field]: value
            }
        });
    };

    return (
        <div className="space-y-6">
            {linkGroups.map((group, groupIdx) => (
                <div key={groupIdx} className="border border-[var(--color-border)] p-4 relative no-radius">
                    <div className="flex justify-between items-center mb-3">
                        <h3 className="text-[var(--color-accent)] font-bold">{group.category}</h3>
                        <button
                            onClick={() => handleDeleteCategory(groupIdx)}
                            className="text-[var(--color-muted)] hover:text-red-500 text-xs"
                        >
                            [delete group]
                        </button>
                    </div>

                    <div className="space-y-2 mb-4">
                        {group.links.map((link, linkIdx) => (
                            <div key={linkIdx} className="flex items-center justify-between bg-[var(--color-hover)] p-2 px-3 text-sm">
                                <div className="flex items-center gap-2 overflow-hidden flex-1 min-w-0">
                                    <LinkIcon icon={link.icon} url={link.url} />
                                    <span className="text-[var(--color-fg)] font-bold min-w-[80px]">{link.label}</span>
                                    <span className="text-[var(--color-muted)] truncate text-xs">{link.url}</span>
                                </div>
                                <div className="flex items-center gap-2 ml-2 shrink-0">
                                    <IconEditor
                                        currentIcon={link.icon}
                                        url={link.url}
                                        onChangeIcon={(icon) => handleUpdateLinkIcon(groupIdx, linkIdx, icon)}
                                    />
                                    <button
                                        onClick={() => handleDeleteLink(groupIdx, linkIdx)}
                                        className="text-[var(--color-muted)] hover:text-red-500"
                                    >
                                        x
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>


                    <div className="flex flex-col sm:flex-row gap-2 mt-2 pt-2 border-t border-[var(--color-border)] border-dashed">
                        <input
                            type="text"
                            placeholder="label"
                            className="bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-fg)] px-2 py-1 text-sm focus:border-[var(--color-accent)] outline-none w-full sm:w-1/4 select-text no-radius"
                            value={newLinkInputs[group.category]?.label || ''}
                            onChange={(e) => updateLinkInput(group.category, 'label', e.target.value)}
                        />
                        <input
                            type="text"
                            placeholder="url (https://...)"
                            className="bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-fg)] px-2 py-1 text-sm focus:border-[var(--color-accent)] outline-none flex-1 select-text no-radius"
                            value={newLinkInputs[group.category]?.url || ''}
                            onChange={(e) => updateLinkInput(group.category, 'url', e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleAddLink(groupIdx)}
                        />
                        <input
                            type="text"
                            placeholder="icon (optional)"
                            className="bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-fg)] px-2 py-1 text-sm focus:border-[var(--color-accent)] outline-none w-full sm:w-24 select-text no-radius"
                            value={newLinkInputs[group.category]?.icon || ''}
                            onChange={(e) => updateLinkInput(group.category, 'icon', e.target.value)}
                        />
                        <button
                            onClick={() => handleAddLink(groupIdx)}
                            className="border border-[var(--color-border)] text-[var(--color-muted)] hover:text-[var(--color-fg)] hover:border-[var(--color-fg)] px-3 py-1 text-sm no-radius"
                        >
                            add
                        </button>
                    </div>
                </div>
            ))}


            <div className="flex gap-2 items-center mt-6 p-4 border border-[var(--color-border)] border-dashed opacity-70 hover:opacity-100 transition-opacity">
                <span className="text-[var(--color-muted)] text-sm">New Category:</span>
                <input
                    type="text"
                    placeholder="category name"
                    className="bg-[var(--color-bg)] border-b border-[var(--color-muted)] text-[var(--color-fg)] px-2 py-1 text-sm focus:border-[var(--color-accent)] outline-none select-text"
                    value={newCatName}
                    onChange={(e) => setNewCatName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()}
                />
                <button
                    onClick={handleAddCategory}
                    className="text-[var(--color-fg)] hover:text-[var(--color-accent)] text-sm font-bold"
                >
                    [ + ]
                </button>
            </div>
        </div>
    );
};

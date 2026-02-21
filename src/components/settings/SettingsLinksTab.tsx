import React, { useState, useRef, useEffect } from 'react';
import { Link, LinkGroup } from '@/types';
import { LinkIcon } from '@/components/ui/LinkIcon';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

/* ── Icon Editor (unchanged) ─────────────────────────────── */

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

/* ── Sortable Link Row ───────────────────────────────────── */

interface SortableLinkProps {
    id: string;
    link: Link;
    groupIdx: number;
    linkIdx: number;
    onDeleteLink: (groupIdx: number, linkIdx: number) => void;
    onUpdateIcon: (groupIdx: number, linkIdx: number, icon: string) => void;
}

const SortableLink: React.FC<SortableLinkProps> = ({ id, link, groupIdx, linkIdx, onDeleteLink, onUpdateIcon }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id });

    const style: React.CSSProperties = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="flex items-center justify-between bg-[var(--color-hover)] p-2 px-3 text-sm"
        >
            <span
                {...attributes}
                {...listeners}
                className="cursor-grab active:cursor-grabbing text-[var(--color-border)] hover:text-[var(--color-accent)] mr-2 select-none text-xs font-mono"
                title="Drag to reorder"
            >
                ::
            </span>
            <div className="flex items-center gap-2 overflow-hidden flex-1 min-w-0">
                <LinkIcon icon={link.icon} url={link.url} />
                <span className="text-[var(--color-fg)] font-bold min-w-[80px]">{link.label}</span>
                <span className="text-[var(--color-muted)] truncate text-xs">{link.url}</span>
            </div>
            <div className="flex items-center gap-2 ml-2 shrink-0">
                <IconEditor
                    currentIcon={link.icon}
                    url={link.url}
                    onChangeIcon={(icon) => onUpdateIcon(groupIdx, linkIdx, icon)}
                />
                <button
                    onClick={() => onDeleteLink(groupIdx, linkIdx)}
                    className="text-[var(--color-muted)] hover:text-red-500"
                >
                    x
                </button>
            </div>
        </div>
    );
};

/* ── Sortable Group ──────────────────────────────────────── */

interface SortableGroupProps {
    id: string;
    group: LinkGroup;
    groupIdx: number;
    editingGroupIdx: number | null;
    editingGroupName: string;
    onStartEditing: (idx: number, name: string) => void;
    onEditingNameChange: (name: string) => void;
    onFinishEditing: (idx: number, name: string) => void;
    onCancelEditing: () => void;
    onDeleteCategory: (idx: number) => void;
    onDeleteLink: (groupIdx: number, linkIdx: number) => void;
    onUpdateIcon: (groupIdx: number, linkIdx: number, icon: string) => void;
    onAddLink: (groupIdx: number) => void;
    newLinkInput: { label: string; url: string; icon: string };
    onUpdateLinkInput: (catName: string, field: 'label' | 'url' | 'icon', value: string) => void;
}

const SortableGroup: React.FC<SortableGroupProps> = ({
    id, group, groupIdx,
    editingGroupIdx, editingGroupName,
    onStartEditing, onEditingNameChange, onFinishEditing, onCancelEditing,
    onDeleteCategory, onDeleteLink, onUpdateIcon,
    onAddLink, newLinkInput, onUpdateLinkInput,
}) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id });

    const style: React.CSSProperties = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
    };

    const isEditing = editingGroupIdx === groupIdx;
    const linkIds = group.links.map((_, li) => `link-${groupIdx}-${li}`);

    return (
        <div ref={setNodeRef} style={style} className="border border-[var(--color-border)] p-4 relative no-radius">
            <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                    <span
                        {...attributes}
                        {...listeners}
                        className="cursor-grab active:cursor-grabbing text-[var(--color-border)] hover:text-[var(--color-accent)] select-none text-sm font-mono"
                        title="Drag to reorder group"
                    >
                        :::
                    </span>
                    {isEditing ? (
                        <input
                            type="text"
                            className="bg-[var(--color-bg)] border-b border-[var(--color-accent)] text-[var(--color-accent)] font-bold outline-none select-text text-sm"
                            value={editingGroupName}
                            onChange={(e) => onEditingNameChange(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') onFinishEditing(groupIdx, editingGroupName);
                                if (e.key === 'Escape') onCancelEditing();
                            }}
                            onBlur={() => onFinishEditing(groupIdx, editingGroupName)}
                            autoFocus
                        />
                    ) : (
                        <h3
                            className="text-[var(--color-accent)] font-bold cursor-pointer hover:underline"
                            onClick={() => onStartEditing(groupIdx, group.category)}
                            title="Click to rename"
                        >
                            {group.category}
                        </h3>
                    )}
                </div>
                <button
                    onClick={() => onDeleteCategory(groupIdx)}
                    className="text-[var(--color-muted)] hover:text-red-500 text-xs"
                >
                    [delete group]
                </button>
            </div>

            <SortableContext items={linkIds} strategy={verticalListSortingStrategy}>
                <div className="space-y-2 mb-4">
                    {group.links.map((link, linkIdx) => (
                        <SortableLink
                            key={`link-${groupIdx}-${linkIdx}`}
                            id={`link-${groupIdx}-${linkIdx}`}
                            link={link}
                            groupIdx={groupIdx}
                            linkIdx={linkIdx}
                            onDeleteLink={onDeleteLink}
                            onUpdateIcon={onUpdateIcon}
                        />
                    ))}
                </div>
            </SortableContext>

            <div className="flex flex-col sm:flex-row gap-2 mt-2 pt-2 border-t border-[var(--color-border)] border-dashed">
                <input
                    type="text"
                    placeholder="label"
                    className="bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-fg)] px-2 py-1 text-sm focus:border-[var(--color-accent)] outline-none w-full sm:w-1/4 select-text no-radius"
                    value={newLinkInput.label}
                    onChange={(e) => onUpdateLinkInput(group.category, 'label', e.target.value)}
                />
                <input
                    type="text"
                    placeholder="url (https://...)"
                    className="bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-fg)] px-2 py-1 text-sm focus:border-[var(--color-accent)] outline-none flex-1 select-text no-radius"
                    value={newLinkInput.url}
                    onChange={(e) => onUpdateLinkInput(group.category, 'url', e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && onAddLink(groupIdx)}
                />
                <input
                    type="text"
                    placeholder="icon (optional)"
                    className="bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-fg)] px-2 py-1 text-sm focus:border-[var(--color-accent)] outline-none w-full sm:w-24 select-text no-radius"
                    value={newLinkInput.icon}
                    onChange={(e) => onUpdateLinkInput(group.category, 'icon', e.target.value)}
                />
                <button
                    onClick={() => onAddLink(groupIdx)}
                    className="border border-[var(--color-border)] text-[var(--color-muted)] hover:text-[var(--color-fg)] hover:border-[var(--color-fg)] px-3 py-1 text-sm no-radius"
                >
                    add
                </button>
            </div>
        </div>
    );
};

/* ── Main Component ──────────────────────────────────────── */

interface SettingsLinksTabProps {
    linkGroups: LinkGroup[];
    onUpdateLinks: (groups: LinkGroup[]) => void;
}

export const SettingsLinksTab: React.FC<SettingsLinksTabProps> = ({
    linkGroups,
    onUpdateLinks,
}) => {
    const [newCatName, setNewCatName] = useState('');
    const [newLinkInputs, setNewLinkInputs] = useState<Record<string, { label: string, url: string, icon: string }>>({});
    const [editingGroupIdx, setEditingGroupIdx] = useState<number | null>(null);
    const [editingGroupName, setEditingGroupName] = useState('');

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    /* ── Handlers ── */

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

    const handleRenameCategory = (catIndex: number, newName: string) => {
        const trimmed = newName.trim();
        if (!trimmed) {
            setEditingGroupIdx(null);
            setEditingGroupName('');
            return;
        }
        const oldCatName = linkGroups[catIndex].category;
        const newGroups = linkGroups.map((g, i) =>
            i === catIndex ? { ...g, category: trimmed } : g
        );
        if (oldCatName !== trimmed && newLinkInputs[oldCatName]) {
            const updatedInputs = { ...newLinkInputs };
            updatedInputs[trimmed] = updatedInputs[oldCatName];
            delete updatedInputs[oldCatName];
            setNewLinkInputs(updatedInputs);
        }
        onUpdateLinks(newGroups);
        setEditingGroupIdx(null);
        setEditingGroupName('');
    };

    const handleAddLink = (catIndex: number) => {
        const catName = linkGroups[catIndex].category;
        const input = newLinkInputs[catName] || { label: '', url: '', icon: '' };

        if (!input.label.trim() || !input.url.trim()) return;

        const newGroups = [...linkGroups];
        newGroups[catIndex] = {
            ...newGroups[catIndex],
            links: [...newGroups[catIndex].links, {
                label: input.label,
                url: input.url,
                icon: input.icon || undefined
            }]
        };
        onUpdateLinks(newGroups);

        setNewLinkInputs({
            ...newLinkInputs,
            [catName]: { label: '', url: '', icon: '' }
        });
    };

    const handleDeleteLink = (catIndex: number, linkIndex: number) => {
        const newGroups = [...linkGroups];
        newGroups[catIndex] = {
            ...newGroups[catIndex],
            links: newGroups[catIndex].links.filter((_, i) => i !== linkIndex)
        };
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

    /* ── Drag & Drop ── */

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;

        const activeId = active.id as string;
        const overId = over.id as string;

        // Reordering groups
        if (activeId.startsWith('group-') && overId.startsWith('group-')) {
            const oldIndex = parseInt(activeId.split('-')[1]);
            const newIndex = parseInt(overId.split('-')[1]);
            onUpdateLinks(arrayMove([...linkGroups], oldIndex, newIndex));
            return;
        }

        // Reordering links within the same group
        if (activeId.startsWith('link-') && overId.startsWith('link-')) {
            const activeParts = activeId.split('-');
            const overParts = overId.split('-');
            const activeGroupIdx = parseInt(activeParts[1]);
            const overGroupIdx = parseInt(overParts[1]);

            if (activeGroupIdx !== overGroupIdx) return;

            const oldLinkIndex = parseInt(activeParts[2]);
            const newLinkIndex = parseInt(overParts[2]);

            const newGroups = [...linkGroups];
            newGroups[activeGroupIdx] = {
                ...newGroups[activeGroupIdx],
                links: arrayMove([...newGroups[activeGroupIdx].links], oldLinkIndex, newLinkIndex),
            };
            onUpdateLinks(newGroups);
        }
    };

    /* ── Render ── */

    const groupIds = linkGroups.map((_, gi) => `group-${gi}`);

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
        >
            <div className="space-y-6">
                <SortableContext items={groupIds} strategy={verticalListSortingStrategy}>
                    {linkGroups.map((group, groupIdx) => (
                        <SortableGroup
                            key={`group-${groupIdx}`}
                            id={`group-${groupIdx}`}
                            group={group}
                            groupIdx={groupIdx}
                            editingGroupIdx={editingGroupIdx}
                            editingGroupName={editingGroupName}
                            onStartEditing={(idx, name) => {
                                setEditingGroupIdx(idx);
                                setEditingGroupName(name);
                            }}
                            onEditingNameChange={setEditingGroupName}
                            onFinishEditing={handleRenameCategory}
                            onCancelEditing={() => {
                                setEditingGroupIdx(null);
                                setEditingGroupName('');
                            }}
                            onDeleteCategory={handleDeleteCategory}
                            onDeleteLink={handleDeleteLink}
                            onUpdateIcon={handleUpdateLinkIcon}
                            onAddLink={handleAddLink}
                            newLinkInput={newLinkInputs[group.category] || { label: '', url: '', icon: '' }}
                            onUpdateLinkInput={updateLinkInput}
                        />
                    ))}
                </SortableContext>

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
        </DndContext>
    );
};

import React, { useState, useEffect, useRef } from 'react';

const ENGINES = [
    { id: 'google', label: 'google', url: 'https://www.google.com/search?q=' },
    { id: 'chatgpt', label: 'chatgpt', url: 'https://chatgpt.com/?q=' },
    { id: 'gemini', label: 'gemini', url: 'https://gemini.google.com/app?q=' },
    { id: 'perplexity', label: 'perplexity', url: 'https://www.perplexity.ai/search?q=' },
    { id: 'claude', label: 'claude', url: 'https://claude.ai/new?q=' },
    { id: 'youtube', label: 'youtube', url: 'https://www.youtube.com/results?search_query=' },
    { id: 'reddit', label: 'reddit', url: 'https://www.reddit.com/search/?q=' },
    { id: 'github', label: 'github', url: 'https://github.com/search?q=' },
];

export const SearchWidget: React.FC = () => {
    const [query, setQuery] = useState('');
    const [engineIndex, setEngineIndex] = useState(0);
    
    const inputRef = useRef<HTMLInputElement>(null);

    // Persist engine selection
    useEffect(() => {
        const savedEngine = localStorage.getItem('tui-search-engine');
        if (savedEngine) {
            const index = ENGINES.findIndex(e => e.id === savedEngine);
            if (index !== -1) setEngineIndex(index);
        }
    }, []);

    const cycleEngine = () => {
        const nextIndex = (engineIndex + 1) % ENGINES.length;
        setEngineIndex(nextIndex);
        localStorage.setItem('tui-search-engine', ENGINES[nextIndex].id);
        inputRef.current?.focus();
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim()) return;

        const currentEngine = ENGINES[engineIndex];
        window.open(currentEngine.url + encodeURIComponent(query), '_blank', 'noopener,noreferrer');
        setQuery('');
        inputRef.current?.blur();
    };

    const currentEngine = ENGINES[engineIndex];

    return (
        <div 
            className="h-full flex flex-col justify-center px-2 relative"
        >
            <form onSubmit={handleSearch} className="flex items-center gap-2 w-full z-20">
                <button 
                    type="button"
                    onClick={cycleEngine}
                    className="shrink-0 text-[var(--color-accent)] hover:text-[var(--color-fg)] font-bold font-mono transition-colors select-none"
                    title="Click to switch search engine"
                >
                    [{currentEngine.label}]
                </button>
                <div className="flex-1 relative group">
                     <span className="absolute left-0 top-1/2 -translate-y-1/2 text-[var(--color-muted)] font-bold pointer-events-none">
                        &gt;
                    </span>
                    <input 
                        ref={inputRef}
                        type="text" 
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="w-full bg-transparent border-none outline-none text-[var(--color-fg)] placeholder-[var(--color-muted)] font-mono pl-4 focus:placeholder-opacity-50 h-full py-1"
                        placeholder="search..."
                        autoComplete="off"
                    />
                </div>
                <button 
                    type="submit"
                    className="text-[var(--color-muted)] hover:text-[var(--color-fg)] text-xs font-mono"
                >
                    [ENTER]
                </button>
            </form>
        </div>
    );
};

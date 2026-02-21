import React from 'react';
import { LinkGroup } from '@/types';
import { sanitizeUrl } from '@/utils/urlUtils';
import { LinkIcon } from '@/components/ui/LinkIcon';
import { useAppContext } from '@/contexts/AppContext';

interface LinksWidgetProps {
    groups: LinkGroup[];
    openInNewTab?: boolean;
}

export const LinksWidget: React.FC<LinksWidgetProps> = ({ groups, openInNewTab = true }) => {
    const { animatedLinks } = useAppContext();

    return (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 h-full overflow-y-auto custom-scrollbar px-4 pt-2">
            {groups.map((group) => (
                <div key={group.category} className={`${animatedLinks ? 'link-group' : ''} flex flex-col gap-1.5 min-w-0`}>
                    <h4 className="text-xs font-bold uppercase tracking-wider mb-1 flex items-center gap-1.5">
                        <span className={`${animatedLinks ? 'category-prefix' : ''} text-[var(--color-accent)] opacity-60`}>//</span>
                        <span className="category-text text-[var(--color-muted)]">
                            {group.category.split('').map((char, i) => (
                                <span
                                    key={i}
                                    className={animatedLinks ? 'category-char' : ''}
                                    style={animatedLinks ? { '--char-index': i } as React.CSSProperties : undefined}
                                >
                                    {char}
                                </span>
                            ))}
                        </span>
                    </h4>
                    {group.links.length === 0 && (
                        <span className="text-[var(--color-muted)] text-xs italic opacity-50 pl-4">empty</span>
                    )}
                    {group.links.map(link => (
                        <a
                            key={`${link.label}-${link.url}`}
                            href={sanitizeUrl(link.url)}
                            target={openInNewTab ? "_blank" : "_self"}
                            rel="noopener noreferrer"
                            className="group text-[var(--color-muted)] hover:text-[var(--color-fg)] hover:text-shadow-glow transition-all duration-[20ms] text-sm flex items-center gap-1.5"
                            title={link.url}
                        >
                            <span className={`${animatedLinks ? 'link-arrow' : ''} text-[var(--color-border)] group-hover:text-[var(--color-accent)] text-sm leading-none`}>&#x203a;</span>
                            <LinkIcon icon={link.icon} url={link.url} />
                            <span className="truncate">{link.label}</span>
                        </a>
                    ))}
                </div>
            ))}
            {groups.length === 0 && (
                <div className="col-span-full flex items-center justify-center text-[var(--color-muted)]">
                    No shortcuts configured. Open settings (top right) to add some.
                </div>
            )}
        </div>
    );
};

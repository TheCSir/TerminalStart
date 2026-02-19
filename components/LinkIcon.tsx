import React from 'react';

interface LinkIconProps {
    icon?: string;
    url: string;
    className?: string;
}

export const LinkIcon: React.FC<LinkIconProps> = ({ icon, url, className = '' }) => {
    const sizeClasses = 'w-4 h-4 shrink-0';

    const hideOnError = (e: React.SyntheticEvent<HTMLImageElement>) => {
        (e.target as HTMLImageElement).style.display = 'none';
    };

    if (!icon) {
        let domain = '';
        try {
            domain = new URL(url).hostname;
        } catch {
            return <span className={`${sizeClasses} ${className}`} />;
        }
        return (
            <img
                src={`https://www.google.com/s2/favicons?domain=${domain}&sz=32`}
                alt=""
                className={`${sizeClasses} object-contain ${className}`}
                loading="lazy"
                onError={hideOnError}
            />
        );
    }

    if (icon.startsWith('data:image/') || icon.startsWith('http://') || icon.startsWith('https://')) {
        return (
            <img
                src={icon}
                alt=""
                className={`${sizeClasses} object-contain ${className}`}
                loading="lazy"
                onError={hideOnError}
            />
        );
    }

    return (
        <span
            className={`${sizeClasses} flex items-center justify-center text-xs leading-none ${className}`}
            role="img"
        >
            {icon}
        </span>
    );
};

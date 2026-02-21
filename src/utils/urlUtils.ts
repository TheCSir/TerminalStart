/**
 * Sanitizes a URL to prevent XSS attacks.
 * Allows only http, https, mailto, and relative paths.
 * Returns 'about:blank' for invalid or potentially malicious URLs.
 */
export const sanitizeUrl = (url: string): string => {
    if (!url) return '';

    const trimmed = url.trim();

    // Check for control characters which could be used to bypass checks
    // (though React/browsers usually handle this, it's good practice)
    if (/[\x00-\x1F\x7F]/.test(trimmed)) {
        return 'about:blank';
    }

    // Allow http, https, mailto
    if (/^(https?|mailto):/i.test(trimmed)) {
        return trimmed;
    }

    // Allow relative paths starting with / or .
    // This allows /, ./, ../, and protocol-relative URLs (starting with //)
    if (/^(\/|\.\.?\/)/.test(trimmed)) {
        return trimmed;
    }

    return 'about:blank';
};

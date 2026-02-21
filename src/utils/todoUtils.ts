export const extractTime = (str: string): { text: string; due?: string } => {
    // Regex matches:
    // 12-hour: 9:20pm, 9:20 pm, 9am, 9 am
    // 24-hour: 14:00, 09:30
    const timeRegex = /\b((?:1[0-2]|0?[1-9])(?::[0-5][0-9])?\s*(?:[aA][mM]|[pP][mM])|(?:2[0-3]|[01]?[0-9]):[0-5][0-9])\b/;
    const match = str.match(timeRegex);

    if (match) {
        const due = match[0];
        // Remove the time string and optional preceding "at"
        // e.g. "Meeting at 9pm" -> "Meeting"
        // e.g. "Meeting 9pm" -> "Meeting"
        // Escape special regex chars in the due string just in case
        const safeDue = due.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const cleanText = str
            .replace(new RegExp(`\\b(at\\s+)?${safeDue}\\b`, 'i'), '')
            .replace(/\s+/g, ' ')
            .trim();

        return { text: cleanText || "Task", due };
    }
    return { text: str.trim() };
};

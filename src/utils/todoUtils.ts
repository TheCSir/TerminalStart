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

// Todoist mode: extract natural-language date/time phrases and pass to Todoist's NLP.
// Splits on date trigger words so everything from that point becomes due_string.
// e.g. "meet john tomorrow at 2pm" -> { text: "meet john", due: "tomorrow at 2pm" }
// e.g. "buy groceries next monday" -> { text: "buy groceries", due: "next monday" }
// Falls back to extractTime for plain time-only inputs like "call mom 3pm".
export const extractDueForTodoist = (str: string): { text: string; due?: string } => {
    const dateTrigger = /\b(today|tonight|tomorrow|next\s+\w+|every\s+\w+|(?:mon|tue|wed|thu|fri|sat|sun)\w*|(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\w*\s+\d{1,2})\b/i;
    const match = str.match(dateTrigger);

    if (match && match.index !== undefined) {
        const due = str.slice(match.index).trim();
        const text = str.slice(0, match.index).replace(/\s+/g, ' ').trim();
        return { text: text || "Task", due };
    }

    // Fall back to time-only extraction
    return extractTime(str);
};

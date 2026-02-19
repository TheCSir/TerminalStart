import { test } from 'node:test';
import assert from 'node:assert';
import { sanitizeUrl } from './urlUtils.ts';

test('sanitizeUrl allows valid http/https URLs', () => {
    assert.strictEqual(sanitizeUrl('https://google.com'), 'https://google.com');
    assert.strictEqual(sanitizeUrl('http://example.com'), 'http://example.com');
    assert.strictEqual(sanitizeUrl('HTTPS://GOOGLE.COM'), 'HTTPS://GOOGLE.COM');
});

test('sanitizeUrl allows valid mailto URLs', () => {
    assert.strictEqual(sanitizeUrl('mailto:user@example.com'), 'mailto:user@example.com');
});

test('sanitizeUrl allows relative URLs', () => {
    assert.strictEqual(sanitizeUrl('/path/to/page'), '/path/to/page');
    assert.strictEqual(sanitizeUrl('./path'), './path');
    assert.strictEqual(sanitizeUrl('../parent'), '../parent');
    assert.strictEqual(sanitizeUrl('//example.com'), '//example.com'); // Protocol-relative
});

test('sanitizeUrl rejects javascript URLs', () => {
    assert.strictEqual(sanitizeUrl('javascript:alert(1)'), 'about:blank');
    assert.strictEqual(sanitizeUrl('JAVASCRIPT:alert(1)'), 'about:blank');
    assert.strictEqual(sanitizeUrl('javascript://%0aalert(1)'), 'about:blank');
});

test('sanitizeUrl rejects vbscript/data URLs', () => {
    assert.strictEqual(sanitizeUrl('vbscript:msgbox'), 'about:blank');
    assert.strictEqual(sanitizeUrl('data:text/html,<b>hi</b>'), 'about:blank');
});

test('sanitizeUrl rejects URLs with control characters', () => {
    assert.strictEqual(sanitizeUrl('java\nscript:alert(1)'), 'about:blank');
    assert.strictEqual(sanitizeUrl('javascript\t:alert(1)'), 'about:blank');
});

test('sanitizeUrl trims whitespace', () => {
    assert.strictEqual(sanitizeUrl('  https://google.com  '), 'https://google.com');
});

test('sanitizeUrl handles empty input', () => {
    assert.strictEqual(sanitizeUrl(''), '');
});

test('sanitizeUrl rejects unknown protocols', () => {
    assert.strictEqual(sanitizeUrl('ftp://example.com'), 'about:blank');
    assert.strictEqual(sanitizeUrl('file:///etc/passwd'), 'about:blank');
});

test('sanitizeUrl rejects plain strings (domains without protocol)', () => {
    // These are treated as relative paths if allowed, but since they don't start with / or ., they fail relative check.
    // And since they don't start with http/https/mailto, they fail protocol check.
    // So they return about:blank.
    // Note: If we want to support "google.com", we'd need to prepend https://, but for now we reject.
    assert.strictEqual(sanitizeUrl('google.com'), 'about:blank');
    assert.strictEqual(sanitizeUrl('www.google.com'), 'about:blank');
});

import { test } from 'node:test';
import assert from 'node:assert';
import { hexToHsv } from './colorUtils.ts';

test('hexToHsv converts white correctly', () => {
    const result1 = hexToHsv('#ffffff');
    assert.deepStrictEqual(result1, { h: 0, s: 0, v: 100 });

    const result2 = hexToHsv('#fff');
    assert.deepStrictEqual(result2, { h: 0, s: 0, v: 100 });
});

test('hexToHsv converts black correctly', () => {
    const result1 = hexToHsv('#000000');
    assert.deepStrictEqual(result1, { h: 0, s: 0, v: 0 });

    const result2 = hexToHsv('#000');
    assert.deepStrictEqual(result2, { h: 0, s: 0, v: 0 });
});

test('hexToHsv converts red correctly', () => {
    const result = hexToHsv('#ff0000');
    assert.deepStrictEqual(result, { h: 0, s: 100, v: 100 });
});

test('hexToHsv converts green correctly', () => {
    const result = hexToHsv('#00ff00');
    assert.deepStrictEqual(result, { h: 120, s: 100, v: 100 });
});

test('hexToHsv converts blue correctly', () => {
    const result = hexToHsv('#0000ff');
    assert.deepStrictEqual(result, { h: 240, s: 100, v: 100 });
});

test('hexToHsv handles missing # prefix', () => {
    const result = hexToHsv('ffffff');
    assert.deepStrictEqual(result, { h: 0, s: 0, v: 100 });
});

test('hexToHsv converts a random color correctly', () => {
    // #808080 (Gray)
    const result = hexToHsv('#808080');
    assert.strictEqual(Math.round(result.h), 0);
    assert.strictEqual(Math.round(result.s), 0);
    assert.strictEqual(Math.round(result.v * 10) / 10, 50.2); // 128/255 * 100 = 50.196...
});

test('hexToHsv handles invalid hex characters gracefully', () => {
    const result1 = hexToHsv('#ZZZZZZ');
    assert.deepStrictEqual(result1, { h: 0, s: 0, v: 0 });

    const result2 = hexToHsv('#GHIJKL');
    assert.deepStrictEqual(result2, { h: 0, s: 0, v: 0 });
});

test('hexToHsv handles invalid lengths gracefully', () => {
    const result1 = hexToHsv('#12');
    assert.deepStrictEqual(result1, { h: 0, s: 0, v: 0 });

    const result2 = hexToHsv('#12345');
    assert.deepStrictEqual(result2, { h: 0, s: 0, v: 0 });
});

test('hexToHsv handles empty string gracefully', () => {
    const result = hexToHsv('');
    assert.deepStrictEqual(result, { h: 0, s: 0, v: 0 });
});

test('hexToHsv handles partial invalid input gracefully', () => {
    const result = hexToHsv('#00GG00');
    assert.deepStrictEqual(result, { h: 0, s: 0, v: 0 });
});

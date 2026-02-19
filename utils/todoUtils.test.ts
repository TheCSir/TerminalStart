import { test } from 'node:test';
import assert from 'node:assert';
import { extractTime } from './todoUtils.ts';

test('extractTime extracts 12-hour format time', () => {
    assert.deepStrictEqual(extractTime('Meeting at 9pm'), { text: 'Meeting', due: '9pm' });
    assert.deepStrictEqual(extractTime('Meeting 9pm'), { text: 'Meeting', due: '9pm' });
    assert.deepStrictEqual(extractTime('9am Call'), { text: 'Call', due: '9am' });
    assert.deepStrictEqual(extractTime('Lunch 12:30pm'), { text: 'Lunch', due: '12:30pm' });
});

test('extractTime extracts 24-hour format time', () => {
    assert.deepStrictEqual(extractTime('Meeting 14:00'), { text: 'Meeting', due: '14:00' });
    assert.deepStrictEqual(extractTime('09:30 Gym'), { text: 'Gym', due: '09:30' });
});

test('extractTime handles "at" prefix correctly', () => {
    assert.deepStrictEqual(extractTime('Dinner at 8pm'), { text: 'Dinner', due: '8pm' });
    assert.deepStrictEqual(extractTime('at 5pm Go home'), { text: 'Go home', due: '5pm' });
});

test('extractTime handles no time present', () => {
    assert.deepStrictEqual(extractTime('Just a task'), { text: 'Just a task' });
});

test('extractTime handles invalid time', () => {
    // 25:00 is not matched by the regex part for 24h time: (?:2[0-3]|[01]?[0-9]):[0-5][0-9]
    // However, it might be matched partially or not at all depending on regex.
    // The regex is:
    // \b((?:1[0-2]|0?[1-9])(?::[0-5][0-9])?\s*(?:[aA][mM]|[pP][mM])|(?:2[0-3]|[01]?[0-9]):[0-5][0-9])\b
    // 25:00 -> 25 matches neither 1[0-2] nor 0?[1-9] nor 2[0-3] nor [01]?[0-9] if followed by :00?
    // Wait, [01]?[0-9] matches 0-9, 00-19. 2[0-3] matches 20-23.
    // So 25 is not matched.
    assert.deepStrictEqual(extractTime('Task 25:00'), { text: 'Task 25:00' });
});

test('extractTime handles multiple times (picks first)', () => {
    // Regex finds the first match.
    assert.deepStrictEqual(extractTime('Meeting 9am then 5pm'), { text: 'Meeting then 5pm', due: '9am' });
});

test('extractTime returns "Task" if text becomes empty', () => {
    assert.deepStrictEqual(extractTime('9pm'), { text: 'Task', due: '9pm' });
    assert.deepStrictEqual(extractTime('at 14:00'), { text: 'Task', due: '14:00' });
});

test('extractTime handles spacing', () => {
    assert.deepStrictEqual(extractTime('Meeting   at   9pm'), { text: 'Meeting', due: '9pm' });
    assert.deepStrictEqual(extractTime('   Meeting 9pm   '), { text: 'Meeting', due: '9pm' });
});

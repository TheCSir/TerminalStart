import { test } from 'node:test';
import assert from 'node:assert';
import { calculateSliderValue, calculateStepChange } from './sliderUtils.ts';

test('calculateSliderValue', async (t) => {
    await t.test('calculates correct value within range', () => {
        // rect width 100, left 0. min 0, max 100.
        // x=50 should be 50.
        const val = calculateSliderValue(50, 0, 100, 0, 100, 1);
        assert.strictEqual(val, 50);
    });

    await t.test('clamps to min', () => {
        const val = calculateSliderValue(-10, 0, 100, 0, 100, 1);
        assert.strictEqual(val, 0);
    });

    await t.test('clamps to max', () => {
        const val = calculateSliderValue(150, 0, 100, 0, 100, 1);
        assert.strictEqual(val, 100);
    });

    await t.test('respects step', () => {
        // step 10. x=12. 12/100 -> 0.12. 0.12*100 = 12. round(12/10)*10 = 10.
        const val = calculateSliderValue(12, 0, 100, 0, 100, 10);
        assert.strictEqual(val, 10);

        // x=18. 18/100 -> 0.18. 0.18*100 = 18. round(18/10)*10 = 20.
        const val2 = calculateSliderValue(18, 0, 100, 0, 100, 10);
        assert.strictEqual(val2, 20);
    });

    await t.test('handles non-zero min', () => {
        // min 10, max 20. width 100.
        // x=50 (middle). should be 15.
        const val = calculateSliderValue(50, 0, 100, 10, 20, 1);
        assert.strictEqual(val, 15);
    });
});

test('calculateStepChange', async (t) => {
    await t.test('increases value on ArrowRight', () => {
        const val = calculateStepChange(10, 1, 0, 100, 'ArrowRight');
        assert.strictEqual(val, 11);
    });

    await t.test('increases value on ArrowUp', () => {
        const val = calculateStepChange(10, 1, 0, 100, 'ArrowUp');
        assert.strictEqual(val, 11);
    });

    await t.test('decreases value on ArrowLeft', () => {
        const val = calculateStepChange(10, 1, 0, 100, 'ArrowLeft');
        assert.strictEqual(val, 9);
    });

    await t.test('decreases value on ArrowDown', () => {
        const val = calculateStepChange(10, 1, 0, 100, 'ArrowDown');
        assert.strictEqual(val, 9);
    });

    await t.test('clamps to max', () => {
        const val = calculateStepChange(100, 1, 0, 100, 'ArrowRight');
        assert.strictEqual(val, 100);
    });

    await t.test('clamps to min', () => {
        const val = calculateStepChange(0, 1, 0, 100, 'ArrowLeft');
        assert.strictEqual(val, 0);
    });

    await t.test('ignores other keys', () => {
        const val = calculateStepChange(10, 1, 0, 100, 'Enter');
        assert.strictEqual(val, 10);
    });
});

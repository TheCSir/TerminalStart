import { describe, it } from 'node:test';
import assert from 'node:assert';
import { hsvToHex } from '../utils/colorUtils.ts';

describe('hsvToHex', () => {
    it('should convert primary colors correctly', () => {
        assert.strictEqual(hsvToHex(0, 100, 100), '#ff0000', 'Red');
        assert.strictEqual(hsvToHex(120, 100, 100), '#00ff00', 'Green');
        assert.strictEqual(hsvToHex(240, 100, 100), '#0000ff', 'Blue');
    });

    it('should convert secondary colors correctly', () => {
        assert.strictEqual(hsvToHex(180, 100, 100), '#00ffff', 'Cyan');
        assert.strictEqual(hsvToHex(300, 100, 100), '#ff00ff', 'Magenta');
        assert.strictEqual(hsvToHex(60, 100, 100), '#ffff00', 'Yellow');
    });

    it('should convert grayscale colors correctly', () => {
        assert.strictEqual(hsvToHex(0, 0, 0), '#000000', 'Black');
        assert.strictEqual(hsvToHex(0, 0, 100), '#ffffff', 'White');
        assert.strictEqual(hsvToHex(0, 0, 50), '#808080', 'Gray');
    });

    it('should convert arbitrary colors correctly', () => {
        // h=270, s=50, v=50 -> #604080
        assert.strictEqual(hsvToHex(270, 50, 50), '#604080', 'Purple-ish');
    });

    it('should handle hue wrap-around (360 -> 0)', () => {
        assert.strictEqual(hsvToHex(360, 100, 100), '#ff0000', 'Red at 360');
    });
});

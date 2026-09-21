import test from 'node:test';
import assert from 'node:assert/strict';

// Test design tokens
import { color, type, spacing, shadow, motion } from '../design-system/tokens';

test('Design Tokens Integrity', async (t) => {
  await t.test('Brand primary is Deep Campus Green #143D32', () => {
    assert.equal(color.brand.primary, '#143D32');
    assert.equal(color.brand.primaryHover, '#0F2E26');
  });

  await t.test('Type scale defines fluid clamp display and body sizes', () => {
    assert.ok(type.display.includes('clamp'));
    assert.ok(type.h1.includes('clamp'));
    assert.equal(type.body, '1rem');
  });

  await t.test('Spacing scale adheres to 8px harmonic intervals', () => {
    assert.equal(spacing[1], '4px');
    assert.equal(spacing[2], '8px');
    assert.equal(spacing[4], '16px');
    assert.equal(spacing[6], '24px');
    assert.equal(spacing[8], '32px');
  });

  await t.test('Shadow levels are strictly structured', () => {
    assert.ok(shadow.sm.length > 0);
    assert.ok(shadow.md.length > 0);
    assert.ok(shadow.lg.length > 0);
  });

  await t.test('Motion tokens specify both cubic-bezier ease and duration', () => {
    assert.equal(motion.duration.fast, 0.15);
    assert.equal(motion.duration.base, 0.25);
    assert.deepEqual(motion.ease.out, [0.16, 1, 0.3, 1]);
  });
});

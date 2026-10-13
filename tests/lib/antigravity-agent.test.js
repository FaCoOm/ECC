/**
 * Focused tests for scripts/lib/install/antigravity-agent.js
 */

'use strict';

const assert = require('assert');
const { adaptAntigravityAgent } = require('../../scripts/lib/install/antigravity-agent');

function test(name, fn) {
  try {
    fn();
    console.log(`  ✓ ${name}`);
    return true;
  } catch (error) {
    console.log(`  ✗ ${name}`);
    console.log(`    Error: ${error.message}`);
    return false;
  }
}

function runTests() {
  console.log('\n=== Testing Antigravity agent adaptation & model routing ===\n');

  let passed = 0;
  let failed = 0;

  if (test('routes Claude sonnet to flash for high-efficiency 3.8 Flash execution', () => {
    const raw = '---\nname: planner\nmodel: sonnet\ntools: [Read, Write]\n---\n# Planner';
    const adapted = adaptAntigravityAgent(raw, 'planner.md');
    assert.ok(adapted.includes('model: flash'), 'Expected model to be mapped to flash');
    assert.ok(!adapted.includes('model: sonnet'));
    assert.ok(!adapted.includes('model: pro'));
  })) passed++; else failed++;

  if (test('routes Claude opus to flash for high-efficiency 3.8 Flash execution', () => {
    const raw = '---\nname: architect\nmodel: opus\ntools: [Read, Grep]\n---\n# Architect';
    const adapted = adaptAntigravityAgent(raw, 'architect.md');
    assert.ok(adapted.includes('model: flash'), 'Expected model to be mapped to flash');
    assert.ok(!adapted.includes('model: opus'));
    assert.ok(!adapted.includes('model: pro'));
  })) passed++; else failed++;

  if (test('routes Claude haiku to flash', () => {
    const raw = '---\nname: quick-fix\nmodel: haiku\ntools: [Read]\n---\n# Quick Fix';
    const adapted = adaptAntigravityAgent(raw, 'quick-fix.md');
    assert.ok(adapted.includes('model: flash'), 'Expected model to be mapped to flash');
  })) passed++; else failed++;

  if (test('routes legacy pro model to flash', () => {
    const raw = '---\nname: reviewer\nmodel: pro\ntools: [Read, Bash]\n---\n# Reviewer';
    const adapted = adaptAntigravityAgent(raw, 'reviewer.md');
    assert.ok(adapted.includes('model: flash'), 'Expected model to be mapped to flash');
    assert.ok(!adapted.includes('model: pro'));
  })) passed++; else failed++;

  if (test('defaults missing model to flash', () => {
    const raw = '---\nname: no-model\ntools: [Read]\n---\n# Body';
    const adapted = adaptAntigravityAgent(raw, 'no-model.md');
    assert.ok(adapted.includes('model: flash'), 'Expected model to default to flash');
  })) passed++; else failed++;

  if (test('strips color and maps tools accurately', () => {
    const raw = '---\nname: tdd-guide\nmodel: sonnet\ncolor: blue\ntools: [Read, Write, Edit, Bash]\n---\n# TDD';
    const adapted = adaptAntigravityAgent(raw, 'tdd-guide.md');
    assert.ok(!adapted.includes('color:'));
    assert.ok(adapted.includes('- view_file'));
    assert.ok(adapted.includes('- write_to_file'));
    assert.ok(adapted.includes('- replace_file_content'));
    assert.ok(adapted.includes('- run_command'));
    assert.ok(adapted.includes('model: flash'));
  })) passed++; else failed++;

  console.log(`\nResults: Passed: ${passed}, Failed: ${failed}`);
  process.exit(failed > 0 ? 1 : 0);
}

runTests();

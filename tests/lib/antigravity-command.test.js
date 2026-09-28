'use strict';

const assert = require('assert');
const yaml = require('js-yaml');
const { adaptAntigravityCommand } = require('../../scripts/lib/install/antigravity-command');

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`  \u2713 ${name}`);
    passed++;
  } catch (error) {
    console.log(`  \u2717 ${name}`);
    console.log(`    Error: ${error.message}`);
    failed++;
  }
}

function parseMarkdownFrontmatter(content) {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  assert.ok(match, 'Expected valid YAML frontmatter and body');
  return {
    frontmatter: yaml.load(match[1]),
    body: match[2],
  };
}

console.log('\n=== Testing Antigravity command adaptation ===\n');

test('adapts command with existing frontmatter and sets disable-model-invocation', () => {
  const source = `---
description: Detect the project build system and incrementally fix build/type errors.
argument-hint: "[optional-arg]"
---

# Build and Fix

Content here.`;

  const adapted = adaptAntigravityCommand(source, 'commands/build-fix.md');
  const parsed = parseMarkdownFrontmatter(adapted);

  assert.strictEqual(parsed.frontmatter.name, 'build-fix');
  assert.strictEqual(parsed.frontmatter.description, 'Detect the project build system and incrementally fix build/type errors.');
  assert.strictEqual(parsed.frontmatter['argument-hint'], '[optional-arg]');
  assert.strictEqual(parsed.frontmatter['disable-model-invocation'], true);
  assert.strictEqual(parsed.body.trim(), '# Build and Fix\n\nContent here.');
});

test('synthesizes frontmatter when source command lacks frontmatter', () => {
  const source = `# Plan

A test command without frontmatter.`;

  const adapted = adaptAntigravityCommand(source, 'commands/plan.md');
  const parsed = parseMarkdownFrontmatter(adapted);

  assert.strictEqual(parsed.frontmatter.name, 'plan');
  assert.strictEqual(parsed.frontmatter.description, 'plan');
  assert.strictEqual(parsed.frontmatter['disable-model-invocation'], true);
  assert.strictEqual(parsed.body.trim(), '# Plan\n\nA test command without frontmatter.');
});

test('preserves existing name when explicitly declared in command frontmatter', () => {
  const source = `---
name: custom-plan-name
description: Custom plan command
---

# Custom Plan`;

  const adapted = adaptAntigravityCommand(source, 'commands/plan.md');
  const parsed = parseMarkdownFrontmatter(adapted);

  assert.strictEqual(parsed.frontmatter.name, 'custom-plan-name');
  assert.strictEqual(parsed.frontmatter.description, 'Custom plan command');
  assert.strictEqual(parsed.frontmatter['disable-model-invocation'], true);
});

test('throws on non-object frontmatter', () => {
  const source = `---
- item1
- item2
---

# Array Frontmatter`;

  assert.throws(() => {
    adaptAntigravityCommand(source, 'commands/invalid.md');
  }, /frontmatter must be an object/);
});

console.log(`\nResults: Passed: ${passed}, Failed: ${failed}\n`);
if (failed > 0) {
  process.exit(1);
}

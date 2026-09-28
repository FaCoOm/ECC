'use strict';

const path = require('path');

function splitFrontmatter(source, label) {
  const match = String(source || '').match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n/);
  if (!match) {
    return {
      frontmatter: {},
      body: String(source || ''),
    };
  }

  // Keep YAML loading behind the transform boundary. Public help commands load
  // the installer graph without executing a transform, including in hermetic
  // packed-artifact checks where runtime dependencies are intentionally absent.
  const frontmatter = require('js-yaml').load(match[1]);
  if (!frontmatter || typeof frontmatter !== 'object' || Array.isArray(frontmatter)) {
    throw new Error(`Cannot adapt Antigravity command ${label}: frontmatter must be an object`);
  }

  return {
    frontmatter,
    body: source.slice(match[0].length),
  };
}

function adaptAntigravityCommand(source, label = '<unknown>') {
  const { frontmatter, body } = splitFrontmatter(source, label);
  const defaultName = path.basename(label, path.extname(label));
  const adapted = {
    name: frontmatter.name || defaultName,
    description: frontmatter.description || defaultName,
    ...frontmatter,
    'disable-model-invocation': true,
  };

  const serialized = require('js-yaml')
    .dump(adapted, { lineWidth: -1, noRefs: true })
    .trimEnd();
  return `---\n${serialized}\n---\n${body}`;
}

module.exports = {
  adaptAntigravityCommand,
};

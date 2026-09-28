const fs = require('fs');
const path = require('path');

const {
  createFlatRuleOperations,
  createInstallTargetAdapter,
  createManagedOperation,
  createManagedScaffoldOperation,
  normalizeRelativePath,
} = require('./helpers');

const SUPPORTED_SOURCE_PREFIXES = ['rules', 'commands', 'agents', 'skills'];

function supportsAntigravitySourcePath(sourceRelativePath) {
  const normalizedPath = normalizeRelativePath(sourceRelativePath);
  return SUPPORTED_SOURCE_PREFIXES.some(prefix => (
    normalizedPath === prefix || normalizedPath.startsWith(`${prefix}/`)
  ));
}

function collectCanonicalSkillNames(modules, repoRoot) {
  const canonicalSkillNames = new Set();
  for (const module of modules) {
    const paths = Array.isArray(module.paths) ? module.paths : [];
    for (const p of paths) {
      const norm = normalizeRelativePath(p);
      if (norm === 'skills' || norm.startsWith('skills/')) {
        if (norm === 'skills') {
          if (repoRoot) {
            const skillsDir = path.join(repoRoot, 'skills');
            if (fs.existsSync(skillsDir) && fs.statSync(skillsDir).isDirectory()) {
              for (const entry of fs.readdirSync(skillsDir, { withFileTypes: true })) {
                if (entry.isDirectory()) {
                  canonicalSkillNames.add(entry.name);
                }
              }
            }
          }
        } else {
          const parts = norm.split('/');
          if (parts[1]) {
            canonicalSkillNames.add(parts[1]);
          }
        }
      }
    }
  }
  return canonicalSkillNames;
}

function createAntigravityCommandOperations({
  moduleId,
  repoRoot,
  sourceRelativePath,
  destinationSkillsDir,
  canonicalSkillNames,
}) {
  const normalizedSourcePath = normalizeRelativePath(sourceRelativePath);
  const sourcePath = path.join(repoRoot || '', normalizedSourcePath);

  if (normalizedSourcePath !== 'commands' && normalizedSourcePath.startsWith('commands/')) {
    const fileName = path.basename(normalizedSourcePath);
    if (fileName.endsWith('.md')) {
      const commandName = path.basename(fileName, '.md');
      if (canonicalSkillNames.has(commandName)) {
        return [];
      }
      return [
        createManagedOperation({
          moduleId,
          sourceRelativePath: normalizedSourcePath,
          destinationPath: path.join(destinationSkillsDir, commandName, 'SKILL.md'),
          strategy: 'preserve-relative-path',
          contentTransform: 'antigravity-command-frontmatter',
        }),
      ];
    }
    return [];
  }

  if (normalizedSourcePath === 'commands') {
    if (!repoRoot || !fs.existsSync(sourcePath) || !fs.statSync(sourcePath).isDirectory()) {
      return [];
    }

    const entries = fs.readdirSync(sourcePath, { withFileTypes: true })
      .sort((left, right) => left.name.localeCompare(right.name));
    const operations = [];

    for (const entry of entries) {
      if (entry.isFile() && entry.name.endsWith('.md')) {
        const commandName = path.basename(entry.name, '.md');
        if (canonicalSkillNames.has(commandName)) {
          continue;
        }
        operations.push(
          createManagedOperation({
            moduleId,
            sourceRelativePath: path.join(normalizedSourcePath, entry.name),
            destinationPath: path.join(destinationSkillsDir, commandName, 'SKILL.md'),
            strategy: 'preserve-relative-path',
            contentTransform: 'antigravity-command-frontmatter',
          })
        );
      }
    }

    return operations;
  }

  return [];
}

module.exports = createInstallTargetAdapter({
  id: 'antigravity-project',
  target: 'antigravity',
  kind: 'project',
  rootSegments: ['.agents'],
  installStatePathSegments: ['ecc-install-state.json'],
  supportsModule(module) {
    const paths = Array.isArray(module && module.paths) ? module.paths : [];
    return paths.length > 0;
  },
  planOperations(input, adapter) {
    const modules = Array.isArray(input.modules)
      ? input.modules
      : (input.module ? [input.module] : []);
    const {
      repoRoot,
      projectRoot,
      homeDir,
    } = input;
    const planningInput = {
      repoRoot,
      projectRoot,
      homeDir,
    };
    const targetRoot = adapter.resolveRoot(planningInput);
    const canonicalSkillNames = collectCanonicalSkillNames(modules, repoRoot);

    return modules.flatMap(module => {
      const paths = Array.isArray(module.paths) ? module.paths : [];
      return paths
        .filter(supportsAntigravitySourcePath)
        .flatMap(sourceRelativePath => {
          const normalizedSourcePath = normalizeRelativePath(sourceRelativePath);

          if (
            normalizedSourcePath === 'rules'
            || normalizedSourcePath.startsWith('rules/')
          ) {
            return createFlatRuleOperations({
              moduleId: module.id,
              repoRoot,
              sourceRelativePath: normalizedSourcePath,
              destinationDir: path.join(targetRoot, 'rules'),
            });
          }

          if (
            normalizedSourcePath === 'commands'
            || normalizedSourcePath.startsWith('commands/')
          ) {
            return createAntigravityCommandOperations({
              moduleId: module.id,
              repoRoot,
              sourceRelativePath: normalizedSourcePath,
              destinationSkillsDir: path.join(targetRoot, 'skills'),
              canonicalSkillNames,
            });
          }

          if (
            normalizedSourcePath === 'agents'
            || normalizedSourcePath.startsWith('agents/')
          ) {
            const agentRelativePath = normalizedSourcePath === 'agents'
              ? ''
              : normalizedSourcePath.slice('agents/'.length);
            return [
              createManagedOperation({
                moduleId: module.id,
                sourceRelativePath: normalizedSourcePath,
                destinationPath: path.join(targetRoot, 'agents', agentRelativePath),
                strategy: 'preserve-relative-path',
                contentTransform: 'antigravity-agent-frontmatter',
              }),
            ];
          }

          if (
            normalizedSourcePath === 'skills'
            || normalizedSourcePath.startsWith('skills/')
          ) {
            const skillRelativePath = normalizedSourcePath === 'skills'
              ? ''
              : normalizedSourcePath.slice('skills/'.length);
            return [
              createManagedScaffoldOperation(
                module.id,
                normalizedSourcePath,
                path.join(targetRoot, 'skills', skillRelativePath),
                'preserve-relative-path'
              ),
            ];
          }

          return [];
        });
    });
  },
});

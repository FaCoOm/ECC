# ECC Project Installation & Deployment Guide

This guide provides practical, copy-pasteable commands to install Everything Claude Code (ECC) from this repository / fork into any designated target project across various AI coding harnesses (Claude Code, Antigravity, Kiro, Cursor, Gemini, Codex, Zed, Kimi, and others).

---

## 1. Prerequisites

Before installing ECC into a designated project:

1. **Node.js**: Ensure Node.js v18.0.0 or higher is installed:
   ```bash
   node --version
   ```
2. **Git**: Ensure Git is on your `PATH`:
   ```bash
   git --version
   ```
3. **Repository / Fork Location**:
   Clone or locate your local ECC fork repository. Throughout this guide, replace `<ECC_REPO_DIR>` with the absolute path to your cloned fork (for example: `C:\Users\username\GitHub\ECC` on Windows, or `/home/user/github/ECC` on Linux/macOS).
4. **Designated Project Location**:
   Replace `<PROJECT_DIR>` with the root directory of the target project you wish to equip with ECC capabilities.

---

## 2. Harness-Specific Installation Commands

### A. Claude Code

Claude Code supports installing ECC either via the native plugin marketplace (recommended for seamless auto-updates and hooks) or as a project-scoped managed directory.

#### Method 1: Native Claude Code Marketplace (In-Session)
Inside an active Claude Code session within your project directory:

```text
/plugin marketplace add https://github.com/FaCoOm/ECC
/plugin install ecc@ecc --scope project
```
> **Note**: Use `--scope project` to install ECC specifically for the current project repository (`.claude/`), or `--scope user` for global access across all projects (`~/.claude/`).

#### Method 2: Scripted Project Install (CLI / Terminal)
From PowerShell (Windows):
```pwsh
cd <PROJECT_DIR>
node <ECC_REPO_DIR>\scripts\install-apply.js --target claude-project --profile full
```

From Bash (macOS / Linux):
```bash
cd <PROJECT_DIR>
node <ECC_REPO_DIR>/scripts/install-apply.js --target claude-project --profile full
```

---

### B. Antigravity

Antigravity uses project-level agents, command skills, rules, and skills placed into `<PROJECT_DIR>/.agents/`.

#### From Windows (PowerShell):
```pwsh
cd <PROJECT_DIR>
& <ECC_REPO_DIR>\install.ps1 --target antigravity --profile full
```
Or directly using Node:
```pwsh
cd <PROJECT_DIR>
node <ECC_REPO_DIR>\scripts\install-apply.js --target antigravity --profile full
```

#### From Linux / macOS (Bash):
```bash
cd <PROJECT_DIR>
node <ECC_REPO_DIR>/scripts/install-apply.js --target antigravity --profile full
```

---

### C. ECC Kiro

Kiro provides native installer scripts for both Windows and Unix environments under `<ECC_REPO_DIR>/.kiro/`.

#### Windows (PowerShell):
```pwsh
cd <PROJECT_DIR>
& <ECC_REPO_DIR>\.kiro\install.ps1 .
```

#### Windows (Command Prompt / Batch):
```cmd
cd <PROJECT_DIR>
<ECC_REPO_DIR>\.kiro\install.bat .
```

#### Linux / macOS (Bash):
```bash
cd <PROJECT_DIR>
bash <ECC_REPO_DIR>/.kiro/install.sh .
```

This installs Kiro agents, skills, hooks, and steering rules directly into `<PROJECT_DIR>/.kiro/`.

---

### D. Cursor IDE

Installs Cursor rules, hooks, and configurations into `<PROJECT_DIR>/.cursor/`:

#### Windows (PowerShell):
```pwsh
cd <PROJECT_DIR>
node <ECC_REPO_DIR>\scripts\install-apply.js --target cursor --profile full
```

#### Linux / macOS (Bash):
```bash
cd <PROJECT_DIR>
node <ECC_REPO_DIR>/scripts/install-apply.js --target cursor --profile full
```

---

### E. Gemini CLI / Assistant

Installs project-local Gemini configurations and rules into `<PROJECT_DIR>/.gemini/`:

```pwsh
cd <PROJECT_DIR>
node <ECC_REPO_DIR>\scripts\install-apply.js --target gemini --profile full
```

---

### F. Codex

Codex utilizes a shared agent configuration in `~/.codex/` and project AGENTS.md instructions.

To configure Codex with developer instructions and token headroom:
```bash
cd <ECC_REPO_DIR>
node scripts/setup.js
```
Codex will register the skills catalog and respect developer instructions defined in `.codex/config.toml`.

---

### G. Other Supported Project Targets

ECC supports multiple other target environments using the same syntax:

| Target Platform | Target Flag | Installed Directory | Command Example |
| :--- | :--- | :--- | :--- |
| **Zed Editor** | `--target zed` | `.zed/` | `node <ECC_REPO_DIR>/scripts/install-apply.js --target zed --profile full` |
| **Kimi Code** | `--target kimi` | `.kimi-code/` | `node <ECC_REPO_DIR>/scripts/install-apply.js --target kimi --profile full` |
| **Codebuddy** | `--target codebuddy` | `.codebuddy/` | `node <ECC_REPO_DIR>/scripts/install-apply.js --target codebuddy --profile full` |
| **JoyCode** | `--target joycode` | `.joycode/` | `node <ECC_REPO_DIR>/scripts/install-apply.js --target joycode --profile full` |
| **OpenCode** | `--target opencode` | User Config / Local | `node <ECC_REPO_DIR>/scripts/install-apply.js --target opencode --profile full` |
| **Qwen** | `--target qwen` | `~/.qwen/` | `node <ECC_REPO_DIR>/scripts/install-apply.js --target qwen --profile full` |
| **Hermes** | `--target hermes` | `~/.hermes/` | `node <ECC_REPO_DIR>/scripts/install-apply.js --target hermes --profile full` |
| **Adal** | `--target adal` | `.adal/` | `node <ECC_REPO_DIR>/scripts/install-apply.js --target adal --profile full` |

---

## 3. Profiles and Fine-Grained Options

You can tailor which capabilities land in your designated project:

### Available Profiles
- `--profile full` (Default recommendation): Installs all 292 skills, agents, rules, database, frontend, security, and TDD tools.
- `--profile core`: Installs standard everyday engineering workflows without heavy specialized domain packs.
- `--profile minimal`: Installs only foundational rules, essentials, and minimal agents.

### Dry-Run Verification
Before applying changes, preview what files will be copied without modifying disk:
```bash
node <ECC_REPO_DIR>/scripts/install-apply.js --target antigravity --profile full --dry-run
```

### Component Inclusions / Exclusions
- `--with <component>`: Explicitly include optional components (e.g. `--with capability:machine-learning`).
- `--without <component>`: Explicitly exclude components.
- `--no-hooks`: Skip automatic runtime hooks if you only want skills and rules.

---

## 4. Verification and Health Check

After installation, verify that the project is correctly configured:

1. **Verify Files**: Check that the target configuration folder (e.g., `.agents`, `.claude`, `.cursor`, `.kiro`) exists and contains the expected skills and agents.
2. **Run Doctor**:
   ```bash
   node <ECC_REPO_DIR>/scripts/doctor.js
   ```
3. **Verify Catalog**:
   ```bash
   node <ECC_REPO_DIR>/scripts/ci/catalog.js --check
   ```

---

## 5. Updating a Designated Project

To update your designated project with the latest changes from your fork:

1. Update your local ECC clone:
   ```bash
   cd <ECC_REPO_DIR>
   git pull origin main
   ```
2. Re-run the installation command with your chosen target and profile against your designated project:
   ```bash
   cd <PROJECT_DIR>
   node <ECC_REPO_DIR>/scripts/install-apply.js --target <target> --profile full
   ```

# Upstream maintenance

Sater follows `microsoft/vscode/main` with merge-based synchronization. The objective is to preserve upstream ancestry and keep product work concentrated in a small, auditable patch surface.

## Remotes

| Remote | URL | Purpose |
| --- | --- | --- |
| `origin` | `https://github.com/Alpha-qnetrah/sater` | Private Sater repository |
| `upstream` | `https://github.com/microsoft/vscode` | Canonical Code - OSS history |
| `source-fork` | `https://github.com/Up-to-code/vscode` | Original source checkout and reference |

## Sater-owned integration points

| Path | Responsibility | Expected conflict risk |
| --- | --- | --- |
| `product.json` | Product names, protocols, data folders, platform identifiers, Open VSX, onboarding theme | Medium; upstream adds product capabilities here regularly |
| `build/hygiene.ts` | Allows only Sater's official Open VSX service URL while retaining the upstream gallery guard | Medium; keep the exception exact and fail closed |
| `package.json`, `package-lock.json` | Development package identity | Low; reapply only the root package name during lockfile refreshes |
| `extensions/sater-theme/` | Sater Dark workbench, terminal, and syntax colors | Low; isolated built-in extension |
| `src/vs/workbench/services/themes/common/workbenchThemeService.ts` | Default dark theme ID and pre-extension bootstrap palette | Medium; keep this patch limited to constants and the existing initial-color map |
| `src/vs/workbench/contrib/sater/` | Interface-language setting, persisted RTL shell direction, Arabic typography, and the explicit LTR boundary for code surfaces | Low; isolated Sater contribution with one common-main import |
| `src/vs/sessions/browser/media/saterAgents.css` | Neutral, compact Sater presentation for the upstream Agents Window | Low; CSS-only override with one sessions-workbench import |
| `src/vs/workbench/contrib/welcomeGettingStarted/` | Borderless Sater home and full-editor first-run language selection | Medium; upstream changes the Welcome implementation regularly |
| `resources/sater/logo.png` | Approved, unmodified brand master | Low; Sater-owned asset |
| `resources/darwin/code.icns` | Generated macOS application icon | Low; binary replacement may require conflict selection |
| `resources/linux/code.png` | Generated Linux application icon | Low; binary replacement may require conflict selection |
| `resources/win32/code.ico`, `resources/win32/code_150x150.png`, `resources/win32/code_70x70.png` | Generated Windows application icons | Low; binary replacement may require conflict selection |
| `README.md`, `docs/` | Sater development and maintenance documentation | Low; Sater-owned content |

The current RTL layer changes workbench direction only; it does not claim to solve mixed-direction source editing. Future Monaco or editor-engine changes must add their integration point, owner-facing rationale, test strategy, and conflict risk to this document.

## Merge procedure

1. Start from a clean `main` and fetch `upstream/main`.
2. Review upstream changes touching the integration points above.
3. Merge `upstream/main`; do not squash or rebase away upstream ancestry.
4. Keep conflict resolutions semantically equivalent to the Sater-owned behavior, not mechanically identical to old lines.
5. Install with the pinned Node version and refreshed dependencies.
6. Compile the client and built-in extensions.
7. Launch with clean temporary user-data and extension directories.
8. Verify product identity, bootstrap colors, Sater Dark, platform icons, protocol isolation, and Open VSX operations.
9. Commit the merge and any explicit adaptation separately when practical.

## Architectural rule

Choose the least invasive layer that can correctly implement a feature:

1. Configuration, theme, or localization
2. Built-in extension
3. Monaco/editor abstraction
4. Code - OSS workbench or platform core

A deeper layer is justified only when the shallower layer cannot produce correct editing behavior. Core changes should expose a reusable abstraction instead of embedding Sater-specific branching throughout upstream code.

# Sater

<p align="center">
  <img src="resources/sater/logo.png" width="180" alt="Sater logo">
</p>

Sater is an Arabic-first developer environment built on [Code - OSS](https://github.com/microsoft/vscode). It aims to make Arabic and mixed Arabic/English programming feel native while retaining compatibility with the VS Code extension ecosystem wherever practical.

Website: [sater.cc](https://sater.cc)

## Development status

Sater is in early development. The current build establishes an independently branded, runnable Code - OSS distribution with the Sater Dark theme, Open VSX, a neutral Sater Agents Window, and a first-run English/Arabic interface choice. Arabic mode mirrors the primary sidebar and activity rail to the right, keeps Chat on the left, and applies Arabic UI typography while deliberately keeping source editors and terminals on an independent LTR code surface. The full Arabic translation catalog and mixed-direction editor engine remain active product work.

Do not use this repository as a stable production editor yet.

## Build on macOS

The current development target is macOS on Apple silicon.

Prerequisites:

- Git and Git LFS
- Xcode command-line tools
- [NVM](https://github.com/nvm-sh/nvm)
- Python 3

```bash
git clone https://github.com/Alpha-qnetrah/sater.git
cd sater
git lfs install
nvm install
nvm use
npm install
npm run compile
./scripts/code.sh --user-data-dir /tmp/sater-user-data --extensions-dir /tmp/sater-extensions
```

The repository pins Node.js in `.nvmrc`. Use that version rather than a system-wide Node installation. For other platforms and deeper build troubleshooting, consult the upstream [How to Contribute](https://github.com/microsoft/vscode/wiki/How-to-Contribute) documentation.

## Product architecture

Sater keeps product-specific work behind narrow integration points:

- Product identity, protocols, data directories, and extension-gallery configuration live in `product.json`.
- The Sater visual system is an isolated built-in extension at `extensions/sater-theme`.
- The small core theme patch selects Sater Dark by default and supplies matching bootstrap colors before extensions load.
- The Sater locale contribution owns the interface-language setting, first-run language choice, RTL shell direction, and code-surface direction boundary.
- Approved brand assets live under `resources/sater`; generated platform icons remain in Code - OSS's standard resource paths.
- Further Arabic behavior should use the isolated locale boundary first, Monaco changes second, and wider workbench/core changes only where platform abstractions cannot express the required behavior.

Every Sater-owned integration point and its expected merge risk is recorded in [`docs/UPSTREAM.md`](docs/UPSTREAM.md). Brand color roles are recorded in [`docs/DESIGN_TOKENS.md`](docs/DESIGN_TOKENS.md).

## Extension gallery

Sater uses [Open VSX](https://open-vsx.org) as its extension gallery. Marketplace availability can differ from Visual Studio Marketplace, and an extension may rely on Microsoft-specific services that are not part of Code - OSS.

## Synchronizing upstream

The repository preserves the complete Code - OSS history. Microsoft is configured as the `upstream` remote and the original source checkout as `source-fork`.

```bash
git fetch upstream main
git checkout main
git merge upstream/main
npm install
npm run compile
git push origin main
```

Resolve conflicts inside the documented Sater integration points rather than spreading product logic into unrelated upstream modules.

## License and attribution

Sater is licensed under the [MIT License](LICENSE.txt). It is based on Code - OSS by Microsoft Corporation and retains the upstream copyright notices, license, and third-party notices.

Visual Studio Code and the Visual Studio Code Marketplace are Microsoft products. Sater is an independent project and is not affiliated with or endorsed by Microsoft.

# Sater localization

Sater uses Code-OSS's native NLS runtime. Do not add Expo, `i18next`, or a
second translation observer. Interface strings are created with `localize(...)`
at their construction site and are supplied by the built-in Arabic language
pack when the application restarts.

The screen, action, and directionality inventory is maintained in [`map.md`](../map.md).

## Catalog workflow

Edit the source catalogs in `src/vs/workbench/contrib/sater/locales/`:

- `en.json` is the key and placeholder source of truth.
- `ar.json` must contain every English key with matching `{0}`-style placeholders.
- `comment` documents translator context. Entries that are used outside the
  welcome contribution declare their Code-OSS module with `module`.

Run `npm run validate-sater-localization` to check missing, unknown, duplicate,
source-drift, placeholder-mismatched keys, and preserved `[[...]]` formatted-link
markers. Run `npm run generate-sater-localization` to
emit the deterministic `extensions/sater-language-pack-arabic/translations/main.i18n.json`
artifact consumed by Code-OSS NLS. Generation starts from the maintained MIT
Arabic Code-OSS catalog in
`resources/sater/locales/code-oss-arabic-main.i18n.json`, then overlays the
Sater catalogs so core workbench strings and product terminology ship together.
When a Code-OSS call moves modules without changing its key, generation also
reuses an existing translation only if all Arabic occurrences agree and the
placeholder set matches. Ambiguous keys remain in the audit for human review.

Run `npm run audit-sater-localization` after rebasing Code-OSS. It parses every
production TypeScript file under `src/vs` with the TypeScript compiler, compares
exact module/key pairs against the generated Arabic pack, and prints a compact
JSON report. The report distinguishes keys that moved modules from strings that
are absent everywhere and ranks the modules with the largest gaps, so review can
focus on the changed surface instead of loading the full 21,000-entry catalog.
It also reports high-confidence hardcoded UI candidates: literal assignments to
`textContent`/`innerText`, literal accessible attributes, and literal `Action`
labels. These candidates are a review queue rather than an automatic rewrite.
Pass `--module <module-id>` after the npm separator to output only the remaining
keys, English source messages, files, and lines for one module, for example:

```bash
npm run audit-sater-localization -- --module vs/sessions/contrib/automations/browser/automationDialog
```

For high-throughput review, `npm run plan-sater-localization -- --tokens 12000`
groups every remaining reference into deterministic, module-preserving batches.
User-facing browser surfaces come first, supporting strings second, and debug,
test, context-key, and telemetry text last. The estimate is deliberately simple
(serialized characters divided by four), so it is stable and does not require a
model-specific tokenizer. Fetch a batch with:

```bash
npm run audit-sater-localization -- --batch 1 --tokens 12000
```

Changing the token budget regenerates the plan; always use the same value for
the plan and batch command. A module is never split, even when it exceeds the
requested budget, which keeps its terminology coherent during review.

Reviewed translations for existing upstream keys belong in the module-native
`resources/sater/locales/sater-arabic-overrides.i18n.json` catalog. The validator
rejects unknown module/key pairs and placeholder drift before generation.

## Runtime rules

Changing `sater.interfaceLanguage` persists the setting, updates the sidebar
location, and asks to restart. The locale is written to `argv.json` only after
the user confirms. When that Sater-specific setting is absent, both workbench
windows honor the standard Code-OSS `argv.json`/`--locale` value via the active
NLS language. Skip on first launch selects English and completes optional
onboarding.

Arabic direction and the bundled Arabic font apply to interface chrome only:
the workbench/activity rail/sidebar mirror, while source editors, terminals,
diffs, markdown, and code containers remain LTR. `sater.editorTextDirection`
controls line content independently: `auto` (the default) follows the first
strong character on each visible line, while `ltr` and `rtl` force a direction.
This uses Monaco's native direction-aware cursor, selection, mouse, sticky-scroll,
and drag behavior instead of applying a visual-only CSS transform.

## Development verification note

Source-development launches set `VSCODE_DEV`, which makes Code-OSS intentionally
fall back to its default English NLS messages even when an Arabic pack is
registered. Use those launches to verify direction, typography, layout, icons,
and accessibility. Verify translated core labels in a packaged build; the
catalog validator and AST audit remain the fast deterministic checks during
development.

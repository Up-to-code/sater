# Sater user-facing surface map

This map records the user-visible routes, actions, localization ownership, and
directionality boundaries for Sater. It is intentionally implementation-facing:
each row points to the module that constructs the surface so translation work can
replace strings at construction time rather than relying on DOM mutation.

## Scope and invariants

- Translate interface chrome, menus, commands, onboarding, welcome, Agents,
  Sessions, settings, dialogs, notifications, and accessibility labels.
- Keep editor containers, terminals, diffs, markdown/code chrome, paths, and
  symbols LTR even when the interface language is Arabic. Editor line content
  defaults to first-strong-character auto direction so Arabic prose/comments
  receive native RTL caret and selection behavior without reversing Latin code.
- English remains the default. Arabic selection persists through the standard
  Code-OSS locale flow and takes effect after restart.
- Arabic mirrors interface chrome: activity rail and primary Explorer/sidebar on
  the right; chat/session auxiliary surfaces on the left. Use logical CSS and
  explicit layout ordering instead of translating content nodes.
- `sater.*` keys belong to `src/vs/workbench/contrib/sater/locales/*.json`.
  Existing Code-OSS `localize(...)` IDs remain owned by Code-OSS source modules;
  the packaged Arabic artifact includes the maintained core Code-OSS catalog,
  then overlays Sater-owned and explicitly selected Sessions keys.

## Entry points and shell composition

| Surface | Construction entry points | Primary user actions | Direction contract |
| --- | --- | --- | --- |
| Regular workbench bootstrap | `src/vs/code/electron-browser/workbench/workbench.ts`, `src/vs/workbench/workbench.desktop.main.ts` | launch, restore window, open workspace | shell follows locale; editor content stays LTR |
| Workbench grid | `src/vs/workbench/browser/workbench.ts` | show/hide primary sidebar, panel, auxiliary bar, editor groups | Arabic uses mirrored chrome and logical gaps |
| Activity rail | `src/vs/workbench/browser/parts/activitybar/activitybarPart.ts` | Explorer, Search, SCM, Run/Debug, Extensions, overflow | right in Arabic; icon glyphs remain white/neutral |
| Primary sidebar | `src/vs/workbench/browser/parts/sidebar/sidebarPart.ts` | switch view, resize, hide/show | right in Arabic, left in English |
| Panel | `src/vs/workbench/browser/parts/panel/panelPart.ts`, `panelActions.ts` | Problems, Output, Terminal, Debug Console | follows shell placement; terminal/debug text LTR |
| Auxiliary/secondary sidebar | `src/vs/workbench/browser/parts/auxiliarybar/auxiliaryBarPart.ts` | Chat, views, maximize/close | left in Arabic, right in English |
| Status bar/title bar | `src/vs/workbench/browser/parts/statusbar/`, titlebar parts | account, sync, branch, diagnostics, layout | logical alignment; paths and branch names LTR |

## Regular editor workbench screens

| Screen or trigger | Owner modules | User-visible strings/actions | RTL/LTR status |
| --- | --- | --- | --- |
| Welcome with no folder | `src/vs/workbench/contrib/welcomeGettingStarted/browser/gettingStarted.ts`, `startupPage.ts` | Sater title/subtitle, Open project, Clone repository, Connect via SSH/GitHub, recent projects, startup checkbox | construction-time NLS; chrome RTL only |
| Workspace welcome | same welcome modules plus `common/gettingStartedContent.ts` | recent workspace, walkthroughs, keyboard tips, accessibility text | Sater keys covered; upstream walkthrough IDs need language pack |
| Language onboarding | `gettingStarted.ts`, `src/vs/workbench/contrib/sater/browser/saterLocale.contribution.ts` | Choose language, English, العربية, Skip, restart prompt | optional; Skip persists English; restart reloads all surfaces |
| Explorer/files | `src/vs/workbench/contrib/files/browser/`, `fileActions.contribution.ts`, `common/files.ts` | Explorer, folders/files, Open, New File/Folder, Rename, Delete, Copy path, context menus | native NLS calls; tree chrome mirrors, paths/names LTR |
| Search | `src/vs/workbench/contrib/search/browser/` | Search, replace, include/exclude, result counts, clear, preserve case/regex | native NLS; query/results LTR |
| Quick access/command palette | `src/vs/workbench/contrib/quickaccess/`, `commands/` | command palette, recent files, symbols, settings search, placeholders | native NLS; input values LTR |
| Source control | `src/vs/workbench/contrib/scm/browser/`, `common/` | Source Control, changes, staged/unstaged, commit, sync, branch actions | native NLS; commit text/branch names LTR |
| Run and Debug | `src/vs/workbench/contrib/debug/browser/` | Run, Debug, breakpoints, variables, call stack, launch/configuration actions | native NLS; code/paths LTR |
| Extensions | `src/vs/workbench/contrib/extensions/browser/`, `electron-browser/` | Extensions, install/enable/disable, marketplace, recommended, updates | native NLS; extension IDs/readmes LTR |
| Settings/preferences | `src/vs/workbench/contrib/preferences/` | Settings, search settings, User/Workspace tabs, JSON, keybindings | native NLS; setting IDs/JSON LTR |
| Terminal/output/problems | `src/vs/workbench/contrib/terminal/`, `terminalContrib/`, `output/` | Terminal, Output, Problems, Debug Console, clear/kill/split | labels may translate; terminal/output/debug content is always LTR |
| Dialogs/notifications | `src/vs/workbench/browser/parts/dialogs/`, platform dialogs, notifications | confirmation, errors, warnings, progress, restart required | native NLS; buttons follow logical order |
| Chat in regular workbench | `src/vs/workbench/contrib/chat/browser/`, `electron-browser/chatLifecycle.ts` | Chat, New Chat, input placeholder, Agent/model/tool actions | auxiliary surface mirrors; prompts/code blocks LTR |

## Agents and Sessions window

| Surface | Owner modules | Actions and strings to cover | RTL requirement |
| --- | --- | --- | --- |
| Agents bootstrap | `src/vs/sessions/browser/web.main.ts`, `electron-browser/sessions.main.ts`, `sessions.desktop.main.ts`, `sessions.common.main.ts`, `browser/sessionsLocale.ts` | launch Agents, restore sessions, load contributions | Sessions bootstrap sets `document.lang`/`dir`, loads the bundled Arabic font, and applies the RTL class before UI construction |
| Agents workbench grid | `src/vs/sessions/browser/workbench.ts` | show sidebar/panel/auxiliary bar, switch workspace | Arabic top-level order is main content then sidebar; explicit `.right` parts need review |
| Sessions sidebar | `src/vs/sessions/browser/parts/sidebarPart.ts`, `sessionsPart.ts` | New Chat, session list, search/filter, sort, select/close session | sidebar on right in Arabic; list order must be logical |
| Session grid/view | `src/vs/sessions/browser/parts/sessionView.ts`, `sessionsPart.ts` | open session, loading, progress, read-only, detail/editor/diff | session chrome RTL; editor/diff content LTR |
| Session header/tabs | `sessionHeader.ts`, `chatCompositeBar.ts`, `chatGroupView.ts`, `chatGroupsView.ts` | rename session/chat, close/delete, tab status, archive/read-only labels | tab/action order mirrors without reversing message/code content |
| Chat composer | `src/vs/sessions/browser/parts/chatView.ts`, `src/vs/sessions/contrib/chat/` | Plan/Build placeholder, send, attach context, model/branch pickers, prompt options, pills, browser controls, tool calls | composer on left in Arabic; code blocks and prompts LTR |
| New-session welcome/setup | `src/vs/sessions/browser/sessionsSetUpService.ts` | Welcome to Agents, Get Started, Enable AI Features, sign-in/setup | full-screen chrome RTL; provider names LTR |
| Project/workspace bar | `src/vs/sessions/browser/parts/projectBarPart.ts` | add/remove folder, customize workspace appearance, letter/icon display | vertical rail mirrors; workspace names/paths LTR |
| Session details | `src/vs/sessions/browser/parts/auxiliaryBarPart.ts`, `singlePaneAuxiliaryBarPart.ts` | Session Details, metadata, actions | left in Arabic |
| Account/provider menu | `accountTitleBarState.ts`, `sessionsSignInDialog.ts`, `src/vs/sessions/contrib/accountMenu/` | Sign In, signed-in account, sign out, Copilot availability/quota/tokens, model management | account actions, provider usage, avatars, and status labels use Sater keys; menu chrome RTL; account IDs/emails LTR |
| Changes/review/browser/terminal/files | `src/vs/sessions/contrib/changes/`, `codeReview/`, `browser/`, `terminal/`, `files/` | review, changes, browser, terminal, files actions | visible Changes empty state/heading and browser-control labels use Sater NLS; labels translate; diffs/terminal/code/URLs LTR |
| Policy/error/read-only states | `policyBlocked/`, `sessionReadOnlyBanner.ts`, `sessionInputBanners/` | disabled, sign-in required, retry, learn more, dismiss, review/CI banner actions, read-only | policy and visible review/CI banner strings use construction-time NLS; message chrome RTL; embedded technical text LTR |
| Mobile sheets and filters | `parts/mobile/mobilePickerSheet.ts`, `mobileSessionFilterChips.ts`, `mobileSortGroupSheet.ts`, `mobileLayout.ts` | search, empty/loading, Done/Close, filter/sort/group | sheet controls mirror; values/content LTR |
| Automations and onboarding | `src/vs/sessions/contrib/automations/`, `onboarding/` | automation list/create/edit, Getting Started, Connect GitHub | RTL shell; URLs/repository names LTR |

## User action graph

```text
Launch
  ├─ first run → Sater welcome → language choice → Skip/Continue
  │                                └─ persist locale → restart prompt → restart
  └─ existing user → restore locale/workspace
        ↓
Workbench shell (activity rail + sidebar + editor + panel/auxiliary bar)
        ↓
Choose activity: Explorer / Search / SCM / Run & Debug / Extensions / Settings / Chat
        ↓
Open dialogs, quick access, context menus, notifications, or commands
        ↓
Open Agents/Sessions → project/session picker → chat composer → detail/review surfaces
```

## Localization ownership and generation

- Source catalogs: `src/vs/workbench/contrib/sater/locales/en.json` and `ar.json`.
- Stable namespaces currently include `sater.welcome.*`, `sater.onboarding.*`,
  `sater.settings.*`, `sater.activity.*`, `sater.explorer.*`, `sater.agents.*`,
  `sater.sessions.*`, and `sater.chat.*`.
- `build/lib/saterLocalization.ts` validates duplicate keys, missing/unknown
  translations, and `{0}`-style placeholder parity, then emits the deterministic
  Code-OSS artifact at
  `extensions/sater-language-pack-arabic/translations/main.i18n.json`.
- Entries with a `module` field are emitted under the exact module namespace so
  existing `localize(...)` calls in Sessions can consume Sater-owned translations.
- Run `npm run validate-sater-localization` before editing catalogs and
  `npm run generate-sater-localization` after changes. Run the pack test and
  `git diff --check` before handoff.
- Core Code-OSS Arabic translations are sourced from the checked-in MIT catalog
  at `resources/sater/locales/code-oss-arabic-main.i18n.json`; the generator
  merges it into the packaged artifact before applying Sater overrides. The
  source catalog should be refreshed deliberately when the upstream workbench
  version changes.

## RTL contract

English:

```text
[activity rail][primary Explorer/sidebar][editor/session content][chat/auxiliary]
```

Arabic:

```text
[chat/auxiliary][editor/session content][primary Explorer/sidebar][activity rail]
```

- Use `direction`, `inset-inline-*`, `margin-inline-*`, `padding-inline-*`, and
  logical flex/grid ordering for chrome.
- `saterLocale.ts` owns `document.lang`, `document.dir`, locale classes, and the
  bundled Arabic font for interface chrome.
- `saterEditorTextDirection.ts` decorates only visible Arabic-first editor lines
  with Monaco's native `TextDirection.RTL`; the `sater.editorTextDirection`
  setting also supports forced LTR and RTL modes.
- `saterLocale.css` and `saterAgents.css` explicitly reset editor, terminal,
  debug, diff, markdown, and code regions to LTR.
- Sessions currently reverses the outer workbench grid in
  `src/vs/sessions/browser/workbench.ts`; `sessionsPart`'s explicit
  `Direction.Right` and `.right` part classes still require runtime verification.
- Mirrored layout must not mirror glyph meaning blindly: review left-specific
  layout icons in `src/vs/sessions/browser/layoutActions.ts` and use logical or
  mirrored variants where available.

## Coverage gaps and next-pass checklist

The checked-in core Arabic source currently contains 21,156 translations across
1,791 modules. The generated Sater artifact contains 22,702 translations across
1,862 modules after safe moved-key reuse, 1,055 reviewed module-native overrides,
and the Sater overlay. The maintained AST audit scans 6,470 production source
files and currently finds 19,704 calls, 18,555 unique module/key pairs, and
16,151 exact Arabic matches. Of the 2,404 exact gaps, 31 have an ambiguous
same-key translation in another module and 2,373 are absent from the source
pack. Most of that backlog is post-upstream Agents, Sessions, chat customization,
and automation functionality; it remains explicit audit output rather than
being silently machine-filled. The audit's high-confidence hardcoded UI queue is
currently clear.

Priority order for implementation threads:

1. Convert remaining Sessions hardcoded strings in setup/welcome states,
   changes/review, and extension-specific surfaces to construction-time
   `localize(...)`; project-bar labels, account usage/status labels, blocked-
   session actions, visible input-banner review/CI labels, browser controls,
   Changes states, status/tab/chat-pill labels, automation dialog actions, and
   the primary Automations view/section are now covered by the Sater catalog.
2. Inventory and add Arabic coverage for remaining `sessions/contrib/chat` and
   mobile pickers; account, policy-blocked, and automation runner/tool messages
   now have reviewed coverage.
3. Audit regular workbench high-traffic modules (activity bar, Explorer, Search,
   SCM, Debug, Extensions, Preferences, quick access) for source-key drift from
   the checked-in core Arabic catalog and for newly introduced hardcoded strings.
4. Keep the clean-user-data smoke checks current. The regular workbench now has
   runtime evidence for `document.lang`, `document.dir`, mirrored rail/sidebar/
   chat placement, SVG icon loading, first-strong Arabic/Latin editor lines, and
   Screen Reader Optimized access. A packaged-build smoke test is still required
   for translated core labels because Code-OSS intentionally disables language
   packs when `VSCODE_DEV` is set.
5. The Agents custom window has runtime RTL and Screen Reader Optimized evidence.
   At a 430×800 viewport its RTL shell and sign-in dialog fit with zero body
   overflow; the mobile picker/filter/sort sheets still need to be opened and
   exercised independently.
6. Review Arabic terminology and brand names (`Sater`, `Agents`, `Sessions`,
   `GitHub`, `Copilot`, model/provider names) before merging the integration branch.

## Evidence

This map was created from a source inventory on branch
`codex/localization-foundation` and refreshed on 2026-09-04 with the full AST
audit. It covers all production `src/vs` TypeScript plus the shell, welcome,
Agents, mobile, account, policy, and setup entry points listed above. It is a
living map: each localization pass should update the relevant row and close a
checklist item.

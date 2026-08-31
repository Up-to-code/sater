# Sater visual tokens

Sater Dark is designed to feel calm, focused, and recognizably Sater without turning the entire interface green. The editor is the leading surface. Teal appears where interaction, progress, focus, or brand recognition needs emphasis.

## Foundation

| Product token | Value | Code - OSS roles |
| --- | --- | --- |
| `surface.brand` | `#012226` | Brand artwork and identity foundation |
| `surface.base` | `#111111` | Activity bar and status bar |
| `surface.sidebar` | `#151515` | Sidebar, panel, terminal |
| `surface.editor` | `#171717` | Editor, title bar, active tab |
| `surface.elevated` | `#222222` | Menus, widgets, inputs, hover and active surfaces |
| `border.default` | `#2A2A2A` | Dividers and component borders |
| `text.primary` | `#F4F3EF` | Primary text and editor foreground |
| `text.secondary` | `#C2C2C2` | Supporting labels and inactive chrome |
| `text.muted` | `#777777` | Comments, placeholders, line numbers |
| `icon.default` | `#E8E8E8` | Ordinary interface glyphs; never brand-colored by default |
| `accent.primary` | `#2CCFA3` | Primary actions, focus, progress, active indicators |
| `accent.hover` | `#42DDB5` | Hovered primary actions and active links |
| `accent.pressed` | `#22A985` | Pressed interaction state |
| `selection.background` | `#2CCFA344` | Editor and terminal selection |

## Semantic roles

| Product token | Value | Role |
| --- | --- | --- |
| `status.error` | `#FF6B72` | Errors, deletions, breakpoints |
| `status.warning` | `#F6C177` | Warnings, conflicts, paused debugging |
| `status.success` | `#57C785` | Success, additions, running state |
| `status.information` | `#78A9FF` | Information, modifications, navigation |
| `status.debugging` | `#8E65D6` | Debugging-mode status surface |

## Syntax roles

| Product token | Value | Role |
| --- | --- | --- |
| `syntax.keyword` | `#FF6FAE` | Keywords and language control forms |
| `syntax.function` | `#2CCFA3` | Function and method declarations/calls |
| `syntax.string` | `#8DD6A8` | Strings and template content |
| `syntax.type` | `#78A9FF` | Types, classes, namespaces, interfaces |
| `syntax.number` | `#F3A866` | Numeric literals |
| `syntax.variable` | `#D6D8DF` | Variables and parameters |
| `syntax.constant` | `#74C7EC` | Constants and enum members |
| `syntax.comment` | `#6B748B` | Comments and documentation annotations |
| `syntax.operator` | `#A4ABBA` | Operators, punctuation, delimiters |

Theme JSON is the executable source for Code - OSS color mappings. This document records product intent so future upstream merges preserve semantic roles rather than individual literals.

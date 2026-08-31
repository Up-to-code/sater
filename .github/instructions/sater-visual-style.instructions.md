---
description: Mandatory visual constraints for Sater icons, illustrations, onboarding assets, empty states, and AI graphics.
applyTo: "resources/sater/**,extensions/sater-theme/**,src/vs/workbench/**"
---

# Sater visual style

Sater's approved application mark is the source of truth: simple, clean, modern, flat, and immediately readable.

The approved Sater logo geometry is immutable. Never redraw, regenerate, reinterpret, extend, distort, or derive a new symbol by modifying its strokes. Use the original production asset unchanged. New icons may share its restraint, terminal angles, and corner character, but must be independent symbols.

## Non-negotiable rules

1. One asset has one subject.
2. Always use flat 2D geometry.
3. Preserve a clear silhouette and generous negative space.
4. Use the fewest shapes needed to communicate the idea.
5. Keep edges crisp and geometry suitable for later SVG reconstruction.
6. Use Sater's deep teal, warm white, and restrained neutral colors.
7. At icon size, the subject must remain recognizable without texture or labels.

## Reject immediately

- Multiple floating objects or competing focal points
- Perspective, isometric views, 3D panels, extrusions, or device mockups
- Scenes, environments, or decorative compositions
- Glow-heavy lighting, glassmorphism, metallic effects, shadows used as decoration, or photorealism
- Generic Arabic clichés, ornamental patterns, pyramids, domes, camels, flags, or calligraphy added without a functional reason
- Code brackets or other generic developer-logo symbols
- Fake text, tiny details, unnecessary particles, or visual filler
- Repeating the full Sater logo when a dedicated single-purpose symbol is clearer
- Altering the approved Sater logo or using generated approximations of it

## Asset review test

Before accepting an asset, answer all of the following:

- Is there exactly one visual subject?
- Is it completely flat and 2D?
- Can it be described in one short sentence?
- Can it be reconstructed cleanly as a small SVG?
- Does it still work as a monochrome silhouette?
- Does every shape serve the subject?

If any answer is no, reject the asset and simplify it before presenting it.

## Image-generation prompt guard

Every prompt for a Sater asset must explicitly include:

> One subject only. Flat 2D graphic. No scene, perspective, 3D, lighting effects, glow, floating objects, decorative background, text, or watermark. Crisp minimal geometry suitable for SVG reconstruction.

Generated output is a concept source, not production art. Do not add it to the product until it passes the review test above.

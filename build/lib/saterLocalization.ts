/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';

type Entry = { message: string; comment?: string; module?: string };
type Catalog = { version: number; locale: string; messages: Record<string, Entry> };
type TranslationContents = Record<string, Record<string, string>>;
type LocalizeReference = { moduleId: string; key: string; message?: string; file: string; line: number };
type HardcodedUiCandidate = { moduleId: string; value: string; file: string; line: number };
type AuditOptions = { moduleFilter?: string; plan?: boolean; batch?: number; tokenBudget?: number };
const root = path.join(import.meta.dirname, '../..');
const dir = path.join(root, 'src/vs/workbench/contrib/sater/locales');
const extensionTranslations = path.join(root, 'extensions/sater-language-pack-arabic', 'translations');
const upstreamArabicArtifact = path.join(root, 'resources/sater/locales/code-oss-arabic-main.i18n.json');
const saterArabicOverridesArtifact = path.join(root, 'resources/sater/locales/sater-arabic-overrides.i18n.json');

function read(locale: string): Catalog {
	const file = path.join(dir, `${locale}.json`);
	const raw = fs.readFileSync(file, 'utf8');
	const keys = [...raw.matchAll(/^\s*"([^"\\]+)"\s*:/gm)].map(match => match[1]);
	const duplicates = keys.filter((key, index) => keys.indexOf(key) !== index);
	if (duplicates.length) {
		throw new Error(`${locale}: duplicate JSON keys: ${[...new Set(duplicates)].join(', ')}`);
	}
	return JSON.parse(raw) as Catalog;
}

function formatSignature(value: string): string {
	return JSON.stringify({
		placeholders: [...value.matchAll(/\{(\d+)\}/g)].map(match => match[1]).sort(),
		formattedLinks: [...value.matchAll(/\[\[[^\]]+\]\]/g)].length
	});
}

function readUpstreamArabicContents(): TranslationContents {
	if (!fs.existsSync(upstreamArabicArtifact)) {
		throw new Error(`Upstream Arabic Code-OSS catalog is missing: ${path.relative(root, upstreamArabicArtifact)}`);
	}
	const parsed = JSON.parse(fs.readFileSync(upstreamArabicArtifact, 'utf8')) as { contents?: unknown };
	if (!parsed.contents || typeof parsed.contents !== 'object' || Array.isArray(parsed.contents)) {
		throw new Error(`Invalid upstream Arabic Code-OSS catalog: ${path.relative(root, upstreamArabicArtifact)}`);
	}
	const contents: TranslationContents = {};
	for (const [moduleId, entries] of Object.entries(parsed.contents as Record<string, unknown>)) {
		if (!entries || typeof entries !== 'object' || Array.isArray(entries)) {
			throw new Error(`Invalid translation module in upstream Arabic catalog: ${moduleId}`);
		}
		contents[moduleId] = {};
		for (const [key, value] of Object.entries(entries as Record<string, unknown>)) {
			if (typeof value !== 'string') {
				throw new Error(`Invalid translation value in upstream Arabic catalog: ${moduleId}.${key}`);
			}
			contents[moduleId][key] = value;
		}
	}
	return contents;
}

function readSaterArabicOverrides(): TranslationContents {
	if (!fs.existsSync(saterArabicOverridesArtifact)) {
		throw new Error(`Sater Arabic override catalog is missing: ${path.relative(root, saterArabicOverridesArtifact)}`);
	}
	const parsed = JSON.parse(fs.readFileSync(saterArabicOverridesArtifact, 'utf8')) as { version?: unknown; contents?: unknown };
	if (parsed.version !== '1.0' || !parsed.contents || typeof parsed.contents !== 'object' || Array.isArray(parsed.contents)) {
		throw new Error(`Invalid Sater Arabic override catalog: ${path.relative(root, saterArabicOverridesArtifact)}`);
	}
	return parsed.contents as TranslationContents;
}

function collectSaterSourceKeys(): Set<string> {
	const keys = new Set<string>();
	const sourceRoot = path.join(root, 'src', 'vs');
	const visit = (directory: string): void => {
		for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
			const file = path.join(directory, entry.name);
			if (entry.isDirectory()) {
				visit(file);
			} else if (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx')) {
				const source = fs.readFileSync(file, 'utf8');
				for (const match of source.matchAll(/localize(?:2|\d*)?\(\s*['\"](sater\.[^'\"]+)['\"]/g)) {
					keys.add(match[1]);
				}
				for (const match of source.matchAll(/localize(?:2|\d*)?\(\s*\{\s*key:\s*['\"](sater\.[^'\"]+)['\"]/g)) {
					keys.add(match[1]);
				}
			}
		}
	};
	visit(sourceRoot);
	return keys;
}

function localizeKey(node: ts.CallExpression): string | undefined {
	if (!ts.isIdentifier(node.expression) || !/^localize\d*$/.test(node.expression.text)) {
		return undefined;
	}
	const argument = node.arguments[0];
	if (argument && ts.isStringLiteralLike(argument)) {
		return argument.text;
	}
	if (!argument || !ts.isObjectLiteralExpression(argument)) {
		return undefined;
	}
	for (const property of argument.properties) {
		if (!ts.isPropertyAssignment(property)) {
			continue;
		}
		const name = ts.isIdentifier(property.name) || ts.isStringLiteralLike(property.name) ? property.name.text : undefined;
		if (name === 'key' && ts.isStringLiteralLike(property.initializer)) {
			return property.initializer.text;
		}
	}
	return undefined;
}

function localizeMessage(node: ts.CallExpression): string | undefined {
	const argument = node.arguments[1];
	return argument && ts.isStringLiteralLike(argument) ? argument.text : undefined;
}

function stringLiteralValue(node: ts.Node | undefined): string | undefined {
	if (!node || !ts.isStringLiteralLike(node)) {
		return undefined;
	}
	const value = node.text.trim();
	const technicalKeyLabels = new Set(['Alt', 'Cmd', 'Ctrl', 'Enter', 'Esc', 'Shift', 'Space', 'Tab']);
	if (value.length < 2 || value.includes('\n') || !/\p{Letter}/u.test(value) || value.startsWith('<<') || value.startsWith('@') || technicalKeyLabels.has(value)) {
		return undefined;
	}
	return value;
}

function hardcodedUiValue(node: ts.Node): string | undefined {
	if (ts.isBinaryExpression(node) && node.operatorToken.kind === ts.SyntaxKind.EqualsToken && ts.isPropertyAccessExpression(node.left)) {
		if (node.left.name.text === 'textContent' || node.left.name.text === 'innerText') {
			return stringLiteralValue(node.right);
		}
	}
	if (ts.isCallExpression(node) && ts.isPropertyAccessExpression(node.expression) && node.expression.name.text === 'setAttribute') {
		const attribute = stringLiteralValue(node.arguments[0]);
		if (attribute === 'aria-label' || attribute === 'title' || attribute === 'placeholder') {
			return stringLiteralValue(node.arguments[1]);
		}
	}
	if (ts.isNewExpression(node) && ts.isIdentifier(node.expression) && node.expression.text === 'Action') {
		return stringLiteralValue(node.arguments?.[1]);
	}
	return undefined;
}

function collectLocalizeReferences(): { references: LocalizeReference[]; hardcodedUiCandidates: HardcodedUiCandidate[]; files: number } {
	const references: LocalizeReference[] = [];
	const hardcodedUiCandidates: HardcodedUiCandidate[] = [];
	const sourceRoot = path.join(root, 'src', 'vs');
	let files = 0;
	const ignoredDirectories = new Set(['fixtures', 'node_modules', 'test', 'testData', 'tests']);
	const visit = (directory: string): void => {
		for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
			const file = path.join(directory, entry.name);
			if (entry.isDirectory()) {
				if (!ignoredDirectories.has(entry.name)) {
					visit(file);
				}
				continue;
			}
			if (!/\.tsx?$/.test(entry.name) || /\.(?:fixture|test)\.ts$/.test(entry.name)) {
				continue;
			}
			files++;
			const source = fs.readFileSync(file, 'utf8');
			const sourceFile = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true);
			const moduleId = path.relative(path.join(root, 'src'), file).replaceAll(path.sep, '/').replace(/\.tsx?$/, '');
			const collect = (node: ts.Node): void => {
				const hardcodedValue = hardcodedUiValue(node);
				if (hardcodedValue) {
					const position = sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile));
					hardcodedUiCandidates.push({
						moduleId,
						value: hardcodedValue,
						file: path.relative(root, file).replaceAll(path.sep, '/'),
						line: position.line + 1
					});
				}
				if (ts.isCallExpression(node)) {
					const key = localizeKey(node);
					if (key) {
						const position = sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile));
						references.push({
							moduleId,
							key,
							message: localizeMessage(node),
							file: path.relative(root, file).replaceAll(path.sep, '/'),
							line: position.line + 1
						});
					}
				}
				ts.forEachChild(node, collect);
			};
			collect(sourceFile);
		}
	};
	visit(sourceRoot);
	return { references, hardcodedUiCandidates, files };
}

function addMovedModuleTranslations(contents: TranslationContents): void {
	const translationsByKey = new Map<string, Set<string>>();
	for (const entries of Object.values(contents)) {
		for (const [key, translation] of Object.entries(entries)) {
			let translations = translationsByKey.get(key);
			if (!translations) {
				translations = new Set<string>();
				translationsByKey.set(key, translations);
			}
			translations.add(translation);
		}
	}
	for (const reference of collectLocalizeReferences().references) {
		if (contents[reference.moduleId]?.[reference.key] !== undefined) {
			continue;
		}
		const translations = translationsByKey.get(reference.key);
		if (!translations || translations.size !== 1) {
			continue;
		}
		const [translation] = translations;
		if (reference.message && formatSignature(reference.message) !== formatSignature(translation)) {
			continue;
		}
		(contents[reference.moduleId] ??= {})[reference.key] = translation;
	}
}

function localizationPriority(moduleId: string): 'user-facing' | 'supporting' | 'internal' {
	if (/debug|\/test\/|contextkeys|telemetry/i.test(moduleId)) {
		return 'internal';
	}
	if (/\/browser\/|accessibility|actions|widget|view|dialog|contribution/i.test(moduleId)) {
		return 'user-facing';
	}
	return 'supporting';
}

function buildTranslationBatches(missing: LocalizeReference[], tokenBudget: number): Array<{ estimatedTokens: number; entries: LocalizeReference[] }> {
	const priorityRank = { 'user-facing': 0, 'supporting': 1, 'internal': 2 } as const;
	const byModule = new Map<string, LocalizeReference[]>();
	for (const reference of missing) {
		const references = byModule.get(reference.moduleId);
		if (references) {
			references.push(reference);
		} else {
			byModule.set(reference.moduleId, [reference]);
		}
	}
	const modules = [...byModule]
		.sort(([firstId, first], [secondId, second]) =>
			priorityRank[localizationPriority(firstId)] - priorityRank[localizationPriority(secondId)] ||
			second.length - first.length || firstId.localeCompare(secondId));
	const batches: Array<{ estimatedTokens: number; entries: LocalizeReference[] }> = [];
	for (const [, references] of modules) {
		const estimatedTokens = Math.ceil(JSON.stringify(references).length / 4);
		const current = batches.at(-1);
		if (!current || current.estimatedTokens + estimatedTokens > tokenBudget) {
			batches.push({ estimatedTokens, entries: [...references] });
		} else {
			current.estimatedTokens += estimatedTokens;
			current.entries.push(...references);
		}
	}
	return batches;
}

export function audit(options: AuditOptions = {}): void {
	validate();
	const contents = buildContents(read('en'), read('ar'));
	const { references, hardcodedUiCandidates, files } = collectLocalizeReferences();
	const uniqueReferences = new Map(references.map(reference => [`${reference.moduleId}\0${reference.key}`, reference]));
	const translatedKeys = new Set(Object.values(contents).flatMap(module => Object.keys(module)));
	const missing = [...uniqueReferences.values()].filter(reference => contents[reference.moduleId]?.[reference.key] === undefined);
	const moved = missing.filter(reference => translatedKeys.has(reference.key));
	const absent = missing.filter(reference => !translatedKeys.has(reference.key));
	const missingByModule = new Map<string, number>();
	for (const reference of missing) {
		missingByModule.set(reference.moduleId, (missingByModule.get(reference.moduleId) ?? 0) + 1);
	}
	const topMissingModules = [...missingByModule]
		.sort((first, second) => second[1] - first[1] || first[0].localeCompare(second[0]))
		.slice(0, 40)
		.map(([moduleId, count]) => ({ moduleId, count }));
	const hardcodedByModule = new Map<string, number>();
	for (const candidate of hardcodedUiCandidates) {
		hardcodedByModule.set(candidate.moduleId, (hardcodedByModule.get(candidate.moduleId) ?? 0) + 1);
	}
	const topHardcodedUiModules = [...hardcodedByModule]
		.sort((first, second) => second[1] - first[1] || first[0].localeCompare(second[0]))
		.slice(0, 20)
		.map(([moduleId, count]) => ({ moduleId, count }));
	const requestedModule = options.moduleFilter ? {
		moduleId: options.moduleFilter,
		missingReferences: missing
			.filter(reference => reference.moduleId === options.moduleFilter)
			.map(({ key, message, file, line }) => ({ key, message, file, line }))
	} : undefined;
	if (requestedModule) {
		console.log(JSON.stringify({ requestedModule }, null, 2));
		return;
	}
	const requestedTokenBudget = options.tokenBudget ?? 12000;
	if (!Number.isFinite(requestedTokenBudget) || requestedTokenBudget <= 0) {
		throw new Error(`Invalid localization token budget: ${requestedTokenBudget}`);
	}
	const tokenBudget = Math.max(1000, Math.floor(requestedTokenBudget));
	const batches = buildTranslationBatches(missing, tokenBudget);
	if (options.plan) {
		console.log(JSON.stringify({
			tokenBudget,
			totalBatches: batches.length,
			batches: batches.map((batch, index) => ({
				batch: index + 1,
				estimatedTokens: batch.estimatedTokens,
				entryCount: batch.entries.length,
				priorities: [...new Set(batch.entries.map(reference => localizationPriority(reference.moduleId)))],
				modules: [...new Set(batch.entries.map(reference => reference.moduleId))].map(moduleId =>
					`${moduleId}:${batch.entries.filter(reference => reference.moduleId === moduleId).length}`)
			}))
		}, null, 2));
		return;
	}
	if (options.batch !== undefined) {
		if (!Number.isInteger(options.batch) || options.batch <= 0) {
			throw new Error(`Invalid localization batch: ${options.batch}`);
		}
		const batch = batches[options.batch - 1];
		if (!batch) {
			throw new Error(`Unknown localization batch ${options.batch}; expected 1-${batches.length}`);
		}
		console.log(JSON.stringify({
			requestedBatch: {
				batch: options.batch,
				totalBatches: batches.length,
				tokenBudget,
				estimatedTokens: batch.estimatedTokens,
				missingReferences: batch.entries.map(({ moduleId, key, message, file, line }) => ({ moduleId, key, message, file, line }))
			}
		}, null, 2));
		return;
	}
	console.log(JSON.stringify({
		scannedSourceFiles: files,
		localizeReferences: references.length,
		uniqueLocalizeReferences: uniqueReferences.size,
		translatedModuleKeyPairs: uniqueReferences.size - missing.length,
		missingModuleKeyPairs: missing.length,
		keysFoundInAnotherModule: moved.length,
		keysAbsentFromArabicPack: absent.length,
		topMissingModules,
		hardcodedUiStringCandidates: hardcodedUiCandidates.length,
		topHardcodedUiModules,
		hardcodedUiExamples: hardcodedUiCandidates.map(({ file, line, value }) => ({ file, line, value }))
	}, null, 2));
}

function buildContents(source: Catalog, target: Catalog): TranslationContents {
	// Start with the maintained core Code-OSS Arabic catalog. Sater entries are
	// overlaid below so product terminology remains authoritative for our UI.
	const contents: TranslationContents = readUpstreamArabicContents();
	for (const [moduleId, entries] of Object.entries(readSaterArabicOverrides())) {
		Object.assign(contents[moduleId] ??= {}, entries);
	}
	for (const key of Object.keys(source.messages).sort()) {
		// NLS keys are scoped to the module that calls localize(). Keep the
		// catalog pleasant to edit, then fan entries into the module buckets
		// consumed by Code-OSS's language-pack resolver.
		const moduleId = source.messages[key].module ?? (key.startsWith('sater.settings.')
			? 'vs/workbench/contrib/sater/browser/saterLocale.contribution'
			: key.startsWith('sater.')
				? 'vs/workbench/contrib/welcomeGettingStarted/browser/gettingStarted'
			: 'vs/workbench/contrib/sater/browser/saterLocale');
		(contents[moduleId] ??= {})[key] = target.messages[key]?.message ?? source.messages[key].message;
	}
	// Code-OSS frequently moves a localized call without changing its key.
	// Reuse only unambiguous Arabic values with matching placeholders; wording
	// collisions remain visible in the audit for human review.
	addMovedModuleTranslations(contents);
	return contents;
}

export function validate(): void {
	const source = read('en');
	const target = read('ar');
	const errors: string[] = [];
	for (const key of collectSaterSourceKeys()) {
		if (!source.messages[key]) {
			errors.push(`en: source localize key is missing from the catalog: ${key}`);
		}
	}
	for (const [key, entry] of Object.entries(source.messages)) {
		if (!entry.message) {
			errors.push(`en: empty message for ${key}`);
		}
		const translated = target.messages[key];
		if (!translated || !translated.message) {
			errors.push(`ar: missing translation for ${key}`);
		} else if (formatSignature(entry.message) !== formatSignature(translated.message)) {
			errors.push(`format signature mismatch for ${key}`);
		}
	}
	for (const key of Object.keys(target.messages)) {
		if (!source.messages[key]) {
			errors.push(`ar: unknown key ${key}`);
		}
	}
	const sourceReferences = new Map(collectLocalizeReferences().references.map(reference => [`${reference.moduleId}\0${reference.key}`, reference]));
	for (const [moduleId, entries] of Object.entries(readSaterArabicOverrides())) {
		if (!entries || typeof entries !== 'object' || Array.isArray(entries)) {
			errors.push(`override: invalid module ${moduleId}`);
			continue;
		}
		for (const [key, translation] of Object.entries(entries)) {
			const reference = sourceReferences.get(`${moduleId}\0${key}`);
			if (!reference) {
				errors.push(`override: unknown source key ${moduleId}.${key}`);
			} else if (typeof translation !== 'string' || !translation.trim()) {
				errors.push(`override: empty translation for ${moduleId}.${key}`);
			} else if (reference.message && formatSignature(reference.message) !== formatSignature(translation)) {
				errors.push(`override: format signature mismatch for ${moduleId}.${key}`);
			}
		}
	}
	if (errors.length) {
		throw new Error(`Sater localization validation failed:\n${errors.join('\n')}`);
	}
}

export function generate(locale = 'ar'): void {
	validate();
	const source = read('en');
	const target = read(locale);
	const contents = buildContents(source, target);
	const output = { version: '1.0', contents };
	const destination = path.join(extensionTranslations, 'main.i18n.json');
	fs.mkdirSync(path.dirname(destination), { recursive: true });
	fs.writeFileSync(destination, `${JSON.stringify(output, null, 2)}\n`);
}

/**
 * Verify the checked-in artifact is exactly what the catalog generator emits.
 * This is intentionally byte-for-byte: package builds must not depend on a
 * developer having run the generator locally or on object insertion order.
 */
export function checkGenerated(locale = 'ar'): void {
	validate();
	const source = read('en');
	const target = read(locale);
	const contents = buildContents(source, target);
	const expected = `${JSON.stringify({ version: '1.0', contents }, null, 2)}\n`;
	const destination = path.join(extensionTranslations, 'main.i18n.json');
	if (!fs.existsSync(destination)) {
		throw new Error(`Generated localization artifact is missing: ${path.relative(root, destination)}`);
	}
	const actual = fs.readFileSync(destination, 'utf8');
	if (actual !== expected) {
		throw new Error(`Generated localization artifact is stale: run npm run generate-sater-localization`);
	}
}

if (process.argv.includes('--generate')) {
	generate(process.argv[process.argv.indexOf('--generate') + 1] || 'ar');
} else if (process.argv.includes('--check-generated')) {
	checkGenerated(process.argv[process.argv.indexOf('--check-generated') + 1] || 'ar');
} else if (process.argv.includes('--audit')) {
	const moduleIndex = process.argv.indexOf('--module');
	const batchIndex = process.argv.indexOf('--batch');
	const tokenBudgetIndex = process.argv.indexOf('--tokens');
	audit({
		moduleFilter: moduleIndex >= 0 ? process.argv[moduleIndex + 1] : undefined,
		plan: process.argv.includes('--plan'),
		batch: batchIndex >= 0 ? Number(process.argv[batchIndex + 1]) : undefined,
		tokenBudget: tokenBudgetIndex >= 0 ? Number(process.argv[tokenBudgetIndex + 1]) : undefined
	});
} else {
	validate();
}

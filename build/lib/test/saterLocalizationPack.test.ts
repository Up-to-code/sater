/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as assert from 'assert';
import * as fs from 'fs';
import * as path from 'path';
import { describe, it } from 'node:test';

const root = path.join(import.meta.dirname, '../../..');
const extension = path.join(root, 'extensions/sater-language-pack-arabic');
const upstreamArabicCatalog = path.join(root, 'resources/sater/locales/code-oss-arabic-main.i18n.json');
const saterArabicOverrides = path.join(root, 'resources/sater/locales/sater-arabic-overrides.i18n.json');
const gettingStartedSource = path.join(root, 'src/vs/workbench/contrib/welcomeGettingStarted/browser/gettingStarted.ts');
const localeSource = path.join(root, 'src/vs/workbench/contrib/sater/browser/saterLocale.ts');
const sessionsLocaleSource = path.join(root, 'src/vs/sessions/browser/sessionsLocale.ts');
const sessionsWorkbenchSource = path.join(root, 'src/vs/sessions/browser/workbench.ts');
const sessionsSetupSource = path.join(root, 'src/vs/sessions/browser/sessionsSetUpService.ts');
const projectBarSource = path.join(root, 'src/vs/sessions/browser/parts/projectBarPart.ts');
const editorTextDirectionSource = path.join(root, 'src/vs/workbench/contrib/sater/browser/saterEditorTextDirection.ts');
const iconSource = path.join(root, 'src/vs/workbench/contrib/sater/browser/saterIcons.ts');
const localizationToolSource = path.join(root, 'build/lib/saterLocalization.ts');
const surfaceMap = path.join(root, 'map.md');

describe('Sater Arabic localization pack', () => {
	it('declares Arabic metadata and translation wiring', () => {
		const manifest = JSON.parse(fs.readFileSync(path.join(extension, 'package.json'), 'utf8'));
		const localization = manifest.contributes.localizations[0];
		assert.strictEqual(localization.languageId, 'ar');
		assert.strictEqual(localization.localizedLanguageName, 'العربية');
		assert.deepStrictEqual(localization.translations, [{ id: 'vscode', path: './translations/main.i18n.json' }]);
		// Local extensions are collected from extensions/* by the packaging
		// pipeline. Keep this assertion close to the manifest so a future
		// exclusion cannot silently ship the pack only in development.
		const extensionPackaging = fs.readFileSync(path.join(root, 'build/lib/extensions.ts'), 'utf8');
		assert.match(extensionPackaging, /glob\.sync\('extensions\/\*\/package\.json'\)/);
		assert.ok(fs.existsSync(path.join(extension, 'translations/main.i18n.json')));
		assert.ok(fs.existsSync(upstreamArabicCatalog));
		assert.ok(fs.existsSync(saterArabicOverrides));
		const rootPackage = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
		assert.match(rootPackage.scripts['check-sater-localization-artifact'], /--check-generated ar/);
		assert.match(rootPackage.scripts['audit-sater-localization'], /--audit/);
		assert.match(rootPackage.scripts['plan-sater-localization'], /--audit --plan/);
	});

	it('contains deterministic Arabic Sater strings', () => {
		const translations = JSON.parse(fs.readFileSync(path.join(extension, 'translations/main.i18n.json'), 'utf8'));
		assert.strictEqual(translations.version, '1.0');
		assert.strictEqual(translations.contents['vs/base/browser/ui/dialog/dialog'].ok, 'موافق');
		assert.ok(Object.keys(translations.contents).length > 1000, 'core Code-OSS Arabic modules should be packaged');
		const welcome = translations.contents['vs/workbench/contrib/welcomeGettingStarted/browser/gettingStarted'];
		assert.strictEqual(welcome['sater.onboarding.skip'], 'تخطي');
		assert.strictEqual(welcome['sater.activity.explorer'], 'المستكشف');
		const activity = translations.contents['vs/workbench/browser/parts/activitybar/activitybarPart'];
		assert.strictEqual(activity['sater.activity.position'], 'موضع شريط النشاط');
		const explorer = translations.contents['vs/workbench/contrib/files/browser/views/explorerViewer'];
		assert.strictEqual(explorer['sater.explorer.files'], 'مستكشف الملفات');
		const settings = translations.contents['vs/workbench/contrib/sater/browser/saterLocale.contribution'];
		assert.strictEqual(settings['sater.settings.restart'], 'إعادة التشغيل');
		const setup = translations.contents['vs/sessions/browser/sessionsSetUpService'];
		assert.strictEqual(setup['sater.sessions.welcome.getStarted'], 'البدء');
		assert.strictEqual(setup['sater.sessions.productName'], '{0} - الوكلاء');
		const projectBar = translations.contents['vs/sessions/browser/parts/projectBarPart'];
		assert.strictEqual(projectBar['sater.sessions.addFolderToProject'], 'إضافة مجلد إلى المشروع');
		const chatPills = translations.contents['vs/sessions/contrib/chat/common/sessionChatPills'];
		assert.strictEqual(chatPills['sater.chat.pills.browsers'], 'المتصفحات');
		assert.strictEqual(chatPills['sater.chat.pills.subagents'], 'الوكلاء الفرعيون');
		const chatToolbar = translations.contents['vs/sessions/contrib/chat/browser/sessionChatInputToolbar'];
		assert.strictEqual(chatToolbar['sater.chat.pills.files'], 'الملفات');
		const automation = translations.contents['vs/sessions/contrib/automations/browser/automationDialogService'];
		assert.strictEqual(automation['sater.sessions.automation.createTitle'], 'أتمتة جديدة');
		const automationsView = translations.contents['vs/sessions/contrib/sessions/browser/views/automationsView'];
		assert.strictEqual(automationsView['sater.sessions.automation.emptyTitle'], 'لا توجد أتمتة بعد');
		const sessionsList = translations.contents['vs/sessions/contrib/sessions/browser/views/sessionsList'];
		assert.strictEqual(sessionsList['sater.sessions.automation.section'], 'الأتمتة');
		const changes = translations.contents['vs/sessions/contrib/changes/browser/changesView'];
		assert.strictEqual(changes['sater.sessions.changes.noChanges'], 'ستظهر الملفات التي تم تغييرها والعناصر الأخرى للجلسة هنا.');
		const sessionsAccessibility = translations.contents['vs/sessions/contrib/chat/browser/sessionsChatAccessibilityHelp'];
		assert.match(sessionsAccessibility['sessionsChat.overview'], /نافذة الوكلاء/);
		const automationsAccessibility = translations.contents['vs/sessions/contrib/sessions/browser/views/automationsAccessibility'];
		assert.strictEqual(automationsAccessibility['automationsAccessibleView.title'], 'عمليات الأتمتة');
		const automationDialog = translations.contents['vs/sessions/contrib/automations/browser/automationDialog'];
		assert.strictEqual(automationDialog['automation.form.name'], 'الاسم');
		const chatAccessibility = translations.contents['vs/workbench/contrib/chat/browser/actions/chatAccessibilityHelp'];
		assert.match(chatAccessibility['chat.fileChangesDisclosure'], /ملخصات تغييرات الملفات/);
		const externalSessionBanner = translations.contents['vs/sessions/contrib/chat/browser/externalSessionBanner'];
		assert.strictEqual(externalSessionBanner['externalSessionBanner.select.last24Hours'], 'آخر 24 ساعة');
		const sessionsActions = translations.contents['vs/sessions/contrib/sessions/browser/sessionsActions'];
		assert.strictEqual(sessionsActions.closeAllChats, 'إغلاق كل الدردشات');
		assert.strictEqual(sessionsList.automationsNeedsInputAria, '{0}، عملية التشغيل تحتاج إلى إدخال');
		const customizationTools = translations.contents['vs/workbench/contrib/chat/browser/aiCustomization/toolsListWidget'];
		assert.strictEqual(customizationTools.toolsListTitle, 'الأدوات');
		const customizationPlugins = translations.contents['vs/workbench/contrib/chat/browser/aiCustomization/pluginListWidget'];
		assert.strictEqual(customizationPlugins.recommendedBadge, 'موصى به');
		const customizationMigration = translations.contents['vs/workbench/contrib/chat/browser/aiCustomization/customizationMigrationCategories'];
		assert.strictEqual(customizationMigration.promptMigrationConfirmButton, 'تحويل إلى مهارات');
		const mcpList = translations.contents['vs/workbench/contrib/chat/browser/aiCustomization/mcpListWidget'];
		assert.strictEqual(mcpList.authRequired, 'المصادقة مطلوبة');
		const voice = translations.contents['vs/workbench/contrib/chat/browser/voiceClient/voiceSessionController'];
		assert.strictEqual(voice['voice.retryAction'], 'إعادة المحاولة');
		const agentHostSchema = translations.contents['vs/platform/agentHost/common/agentHostSchema'];
		assert.strictEqual(agentHostSchema['agentHost.config.mcpServers.title'], 'خوادم MCP');
		const petAchievements = translations.contents['vs/workbench/contrib/chat/browser/chatPetAchievements'];
		assert.strictEqual(petAchievements['chatPet.achievement.agentChangesReviewed.title'], 'ثق، لكن تحقق');
		const customizationManagement = translations.contents['vs/workbench/contrib/chat/browser/aiCustomization/aiCustomizationManagementEditor'];
		assert.strictEqual(customizationManagement.customizationMigrationSelectAll, 'تحديد الكل');
		const voiceOnboarding = translations.contents['vs/workbench/contrib/agentsVoice/browser/voiceModeOnboarding'];
		assert.strictEqual(voiceOnboarding['voiceMode.onboarding.title'], 'مرحبًا بك في الوضع الصوتي');
		assert.ok(Object.keys(translations.contents).every(moduleId => moduleId.includes('/')));
	});

	it('uses construction-time NLS and keeps the RTL boundary explicit', () => {
		const gettingStarted = fs.readFileSync(gettingStartedSource, 'utf8');
		assert.match(gettingStarted, /localize\('sater\.onboarding\.skip'/);
		assert.doesNotMatch(gettingStarted, /MutationObserver|ARABIC_CHROME_LABELS/);
		const locale = fs.readFileSync(localeSource, 'utf8');
		assert.match(locale, /documentElement\.dir = isArabic \? 'rtl' : 'ltr'/);
		assert.doesNotMatch(locale, /MutationObserver|querySelectorAll/);
		const localeContribution = fs.readFileSync(path.join(root, 'src/vs/workbench/contrib/sater/browser/saterLocale.contribution.ts'), 'utf8');
		assert.match(localeContribution, /configurationService\.inspect<SaterInterfaceLanguage>/);
		assert.match(localeContribution, /Language\.value\(\)\.toLowerCase\(\)\.startsWith\('ar'\)/);
		const workbench = fs.readFileSync(sessionsWorkbenchSource, 'utf8');
		assert.match(workbench, /this\.interfaceLanguage === 'ar' \? \[rightSection, sideBarNode\]/);
		const sessionsLocale = fs.readFileSync(sessionsLocaleSource, 'utf8');
		assert.match(sessionsLocale, /documentElement\.dir = isArabic \? 'rtl' : 'ltr'/);
		assert.match(sessionsLocale, /NotoSansArabic-Variable\.ttf/);
		const setup = fs.readFileSync(sessionsSetupSource, 'utf8');
		assert.match(setup, /sater\.sessions\.welcome\.title/);
		assert.match(setup, /sater\.sessions\.welcomeFooter/);
		const projectBar = fs.readFileSync(projectBarSource, 'utf8');
		assert.match(projectBar, /sater\.sessions\.addFolderToProject/);
		const rtlShell = fs.readFileSync(path.join(root, 'src/vs/sessions/browser/media/saterAgents.css'), 'utf8');
		const rtlWorkbench = fs.readFileSync(path.join(root, 'src/vs/workbench/contrib/sater/browser/saterLocale.css'), 'utf8');
		assert.match(rtlWorkbench, /html\.sater-interface-rtl \.monaco-workbench/);
		assert.match(rtlWorkbench, /unicode-bidi: plaintext/);
		assert.match(rtlShell, /margin-inline: 0 var\(--vscode-agents-layout-floatingPanelGap\)/);
		assert.match(rtlShell, /html\.sater-interface-rtl \.agent-sessions-workbench/);
		assert.match(rtlShell, /direction: ltr/);
		const editorTextDirection = fs.readFileSync(editorTextDirectionSource, 'utf8');
		assert.match(editorTextDirection, /TextDirection\.RTL/);
		assert.match(editorTextDirection, /Script=Arabic/);
		assert.match(editorTextDirection, /getVisibleRanges\(\)/);
		const icons = fs.readFileSync(iconSource, 'utf8');
		assert.match(icons, /icons\/svg/);
		assert.doesNotMatch(icons, /icons\/png/);
		for (const icon of ['agent', 'explorer', 'extensions', 'search', 'settings', 'source-control']) {
			assert.ok(fs.existsSync(path.join(root, 'resources/sater/icons/svg', `${icon}.svg`)));
		}
	});

	it('keeps the source-wide audit aware of localized and hardcoded UI strings', () => {
		const localizationTool = fs.readFileSync(localizationToolSource, 'utf8');
		assert.match(localizationTool, /ts\.createSourceFile/);
		assert.match(localizationTool, /hardcodedUiStringCandidates/);
		assert.match(localizationTool, /sater-arabic-overrides\.i18n\.json/);
		assert.match(localizationTool, /process\.argv\.indexOf\('--module'\)/);
		assert.match(localizationTool, /process\.argv\.indexOf\('--batch'\)/);
		assert.match(localizationTool, /buildTranslationBatches/);
		assert.match(localizationTool, /formattedLinks/);
		assert.match(localizationTool, /textContent/);
		assert.match(localizationTool, /aria-label/);
	});

	it('keeps onboarding, Skip, persistence, and restart flow wired to the locale setting', () => {
		const gettingStarted = fs.readFileSync(gettingStartedSource, 'utf8');
		assert.match(gettingStarted, /buildSaterLanguageOnboarding/);
		assert.match(gettingStarted, /SATER_LANGUAGE_ONBOARDING_COMPLETE/);
		assert.match(gettingStarted, /selectLanguage\('en'\)/);
		assert.match(gettingStarted, /configurationService\.updateValue\(SATER_INTERFACE_LANGUAGE_SETTING/);
		const localeContribution = fs.readFileSync(path.join(root, 'src/vs/workbench/contrib/sater/browser/saterLocale.contribution.ts'), 'utf8');
		assert.match(localeContribution, /configurationService\.inspect<SaterInterfaceLanguage>/);
		assert.match(localeContribution, /jsonEditingService\.write\(this\.environmentService\.argvResource/);
		assert.match(localeContribution, /hostService\.restart\(\)/);
	});

	it('keeps the user-facing surface map anchored to implementation entry points', () => {
		const map = fs.readFileSync(surfaceMap, 'utf8');
		for (const anchor of [
			'# Sater user-facing surface map',
			'src/vs/workbench/browser/workbench.ts',
			'src/vs/workbench/contrib/welcomeGettingStarted/browser/gettingStarted.ts',
			'src/vs/sessions/browser/workbench.ts',
			'src/vs/sessions/contrib/chat/',
			'## RTL contract',
			'## Coverage gaps and next-pass checklist'
		]) {
			assert.match(map, new RegExp(anchor.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
		}
	});
});

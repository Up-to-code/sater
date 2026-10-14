/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { mainWindow } from '../../../../base/browser/window.js';
import { applySaterIconAssets } from './saterIcons.js';

/** Sater's language preference. Translated strings are supplied by Code-OSS NLS language packs. */
export const SATER_INTERFACE_LANGUAGE_SETTING = 'sater.interfaceLanguage';
export const SATER_LANGUAGE_ONBOARDING_COMPLETE = 'sater.languageOnboardingComplete';

export type SaterInterfaceLanguage = 'en' | 'ar';

/** Applies presentation-only language state; text is always created through `localize`. */
export function applySaterInterfaceLanguage(language: SaterInterfaceLanguage): void {
	applySaterIconAssets();
	const isArabic = language === 'ar';
	const documentElement = mainWindow.document.documentElement;
	documentElement.lang = language;
	documentElement.dir = isArabic ? 'rtl' : 'ltr';
	documentElement.classList.toggle('sater-interface-rtl', isArabic);
	documentElement.classList.toggle('sater-interface-ltr', !isArabic);
	mainWindow.document.body?.classList.toggle('sater-interface-rtl', isArabic);
}

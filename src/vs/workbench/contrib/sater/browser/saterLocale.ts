/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

export const SATER_INTERFACE_LANGUAGE_SETTING = 'sater.interfaceLanguage';
export const SATER_LANGUAGE_ONBOARDING_COMPLETE = 'sater.languageOnboardingComplete';

export type SaterInterfaceLanguage = 'en' | 'ar';

export function applySaterInterfaceLanguage(language: SaterInterfaceLanguage): void {
	const isArabic = language === 'ar';
	document.documentElement.lang = language;
	document.documentElement.dir = isArabic ? 'rtl' : 'ltr';
	document.documentElement.classList.toggle('sater-interface-rtl', isArabic);
}

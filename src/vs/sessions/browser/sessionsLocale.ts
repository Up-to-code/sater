/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { mainWindow } from '../../base/browser/window.js';
import { FileAccess } from '../../base/common/network.js';

export type SessionsInterfaceLanguage = 'en' | 'ar';

const ARABIC_FONT_STYLE_ID = 'sater-sessions-arabic-font';
let arabicFontInjected = false;

/** Apply the interface direction and typography for the standalone Agents window. */
export function applySessionsInterfaceLanguage(language: SessionsInterfaceLanguage): void {
	const documentElement = mainWindow.document.documentElement;
	const isArabic = language === 'ar';
	documentElement.lang = language;
	documentElement.dir = isArabic ? 'rtl' : 'ltr';
	documentElement.classList.toggle('sater-interface-rtl', isArabic);
	documentElement.classList.toggle('sater-interface-ltr', !isArabic);
	mainWindow.document.body?.classList.toggle('sater-interface-rtl', isArabic);

	if (isArabic && !arabicFontInjected) {
		const style = mainWindow.document.createElement('style');
		style.id = ARABIC_FONT_STYLE_ID;
		const fontUri = FileAccess.asBrowserUri('vs/../../resources/sater/fonts/NotoSansArabic-Variable.ttf').toString(true);
		style.textContent = `@font-face { font-family: "Sater Arabic"; src: url(${fontUri}) format("truetype"); font-style: normal; font-weight: 100 900; font-display: swap; }`;
		mainWindow.document.head.appendChild(style);
		arabicFontInjected = true;
	}
}

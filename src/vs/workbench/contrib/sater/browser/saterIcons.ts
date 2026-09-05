/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { mainWindow } from '../../../../base/browser/window.js';
import { FileAccess } from '../../../../base/common/network.js';

const SATER_ICON_PATHS = {
	agent: 'agent.svg',
	'chevron-down': 'chevron-down.svg',
	'chevron-right': 'chevron-right.svg',
	copy: 'copy.svg',
	explorer: 'explorer.svg',
	extensions: 'extensions.svg',
	'folder-closed': 'folder-closed.svg',
	'folder-open': 'folder-open.svg',
	'run-debug': 'run-debug.svg',
	search: 'search.svg',
	settings: 'settings.svg',
	'source-control': 'source-control.svg',
} as const;

const SATER_ARABIC_FONT_PATH = 'vs/../../resources/sater/fonts/NotoSansArabic-Variable.ttf';

export function applySaterIconAssets(): void {
	const documentElement = mainWindow.document.documentElement;
	documentElement.classList.add('sater-icons');
	for (const [name, fileName] of Object.entries(SATER_ICON_PATHS)) {
		const iconUri = FileAccess.asBrowserUri(`vs/../../resources/sater/icons/svg/${fileName}`).toString(true);
		documentElement.style.setProperty(`--sater-icon-${name}`, `url(${iconUri})`);
	}
	const arabicFontUri = FileAccess.asBrowserUri(SATER_ARABIC_FONT_PATH).toString(true);
	// eslint-disable-next-line no-restricted-syntax
	let arabicFontStyle = mainWindow.document.getElementById('sater-arabic-font-face') as HTMLStyleElement | null;
	if (!arabicFontStyle) {
		arabicFontStyle = mainWindow.document.createElement('style');
		arabicFontStyle.id = 'sater-arabic-font-face';
		mainWindow.document.head.appendChild(arabicFontStyle);
	}
	arabicFontStyle.textContent = `@font-face { font-family: "Sater Arabic"; src: url(${arabicFontUri}) format("truetype"); font-style: normal; font-weight: 100 900; font-display: swap; }`;
}

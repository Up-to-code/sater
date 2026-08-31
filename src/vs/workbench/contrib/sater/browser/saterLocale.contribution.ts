/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { Disposable } from '../../../../base/common/lifecycle.js';
import { localize } from '../../../../nls.js';
import { ConfigurationTarget, IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { IConfigurationRegistry, Extensions as ConfigurationExtensions } from '../../../../platform/configuration/common/configurationRegistry.js';
import { Registry } from '../../../../platform/registry/common/platform.js';
import { registerWorkbenchContribution2, WorkbenchPhase } from '../../../common/contributions.js';
import { IWorkbenchEnvironmentService } from '../../../services/environment/common/environmentService.js';
import { applySaterInterfaceLanguage, SATER_INTERFACE_LANGUAGE_SETTING, SaterInterfaceLanguage } from './saterLocale.js';
import './saterLocale.css';

class SaterLocaleContribution extends Disposable {
	static readonly ID = 'workbench.contrib.saterLocale';

	constructor(
		@IConfigurationService private readonly configurationService: IConfigurationService,
		@IWorkbenchEnvironmentService private readonly environmentService: IWorkbenchEnvironmentService,
	) {
		super();
		this.applyConfiguredLanguage();
		this._register(this.configurationService.onDidChangeConfiguration(event => {
			if (event.affectsConfiguration(SATER_INTERFACE_LANGUAGE_SETTING)) {
				this.applyConfiguredLanguage();
			}
		}));
	}

	private applyConfiguredLanguage(): void {
		const configured = this.configurationService.getValue<SaterInterfaceLanguage>(SATER_INTERFACE_LANGUAGE_SETTING);
		const language = configured === 'ar' ? 'ar' : 'en';
		applySaterInterfaceLanguage(language);
		if (!this.environmentService.isSessionsWindow) {
			void this.configurationService.updateValue('workbench.sideBar.location', language === 'ar' ? 'right' : 'left', ConfigurationTarget.USER);
		}
	}
}

Registry.as<IConfigurationRegistry>(ConfigurationExtensions.Configuration).registerConfiguration({
	id: 'sater',
	title: localize('sater.configuration.title', "Sater"),
	type: 'object',
	properties: {
		[SATER_INTERFACE_LANGUAGE_SETTING]: {
			type: 'string',
			enum: ['en', 'ar'],
			enumDescriptions: [
				localize('sater.interfaceLanguage.english', "English"),
				localize('sater.interfaceLanguage.arabic', "Arabic")
			],
			default: 'en',
			description: localize('sater.interfaceLanguage.description', "Controls the Sater interface language and layout direction. Source editors and terminals retain their code direction independently.")
		}
	}
});

registerWorkbenchContribution2(SaterLocaleContribution.ID, SaterLocaleContribution, WorkbenchPhase.BlockStartup);

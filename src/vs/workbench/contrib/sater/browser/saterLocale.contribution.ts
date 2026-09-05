/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { Disposable } from '../../../../base/common/lifecycle.js';
import { IJSONEditingService } from '../../../services/configuration/common/jsonEditing.js';
import { localize } from '../../../../nls.js';
import { ConfigurationTarget, IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { IConfigurationRegistry, Extensions as ConfigurationExtensions } from '../../../../platform/configuration/common/configurationRegistry.js';
import { Registry } from '../../../../platform/registry/common/platform.js';
import { registerWorkbenchContribution2, WorkbenchPhase } from '../../../common/contributions.js';
import { IWorkbenchEnvironmentService } from '../../../services/environment/common/environmentService.js';
import { IHostService } from '../../../services/host/browser/host.js';
import { IDialogService } from '../../../../platform/dialogs/common/dialogs.js';
import { Language } from '../../../../base/common/platform.js';
import { SATER_EDITOR_TEXT_DIRECTION_SETTING } from './saterEditorTextDirection.js';
import { applySaterInterfaceLanguage, SATER_INTERFACE_LANGUAGE_SETTING, SaterInterfaceLanguage } from './saterLocale.js';
import './saterLocale.css';

class SaterLocaleContribution extends Disposable {
	static readonly ID = 'workbench.contrib.saterLocale';
	private appliedLanguage: SaterInterfaceLanguage = 'en';
	private revertingLanguage = false;

	constructor(
		@IConfigurationService private readonly configurationService: IConfigurationService,
		@IWorkbenchEnvironmentService private readonly environmentService: IWorkbenchEnvironmentService,
		@IJSONEditingService private readonly jsonEditingService: IJSONEditingService,
		@IHostService private readonly hostService: IHostService,
		@IDialogService private readonly dialogService: IDialogService,
	) {
		super();
		this.appliedLanguage = this.readConfiguredLanguage();
		this.applyConfiguredLanguage(this.appliedLanguage);
		this._register(this.configurationService.onDidChangeConfiguration(event => {
			if (event.affectsConfiguration(SATER_INTERFACE_LANGUAGE_SETTING)) {
				if (this.revertingLanguage) {
					this.revertingLanguage = false;
					return;
				}
				void this.applyConfiguredLanguage(this.readConfiguredLanguage(), true);
			}
		}));
	}

	private readConfiguredLanguage(): SaterInterfaceLanguage {
		const userValue = this.configurationService.inspect<SaterInterfaceLanguage>(SATER_INTERFACE_LANGUAGE_SETTING)?.userValue;
		if (userValue === 'ar' || userValue === 'en') {
			return userValue;
		}
		// Respect the standard Code-OSS locale flow when the Sater-specific
		// setting has not been written yet (for example, Configure Display
		// Language wrote `locale: "ar"` to argv.json).
		return Language.value().toLowerCase().startsWith('ar') ? 'ar' : 'en';
	}

	private async applyConfiguredLanguage(language: SaterInterfaceLanguage, promptForRestart = false): Promise<void> {
		applySaterInterfaceLanguage(language);
		const previousLanguage = this.appliedLanguage;
		this.appliedLanguage = language;
		if (!this.environmentService.isSessionsWindow) {
			void this.configurationService.updateValue('workbench.sideBar.location', language === 'ar' ? 'right' : 'left', ConfigurationTarget.USER);
		}
		if (!promptForRestart) {
			return;
		}
		const { confirmed } = await this.dialogService.confirm({
			message: localize('sater.settings.restartRequired', 'Restart Sater to apply the language change?'),
			primaryButton: localize('sater.settings.restart', 'Restart')
		});
		if (!confirmed) {
			this.appliedLanguage = previousLanguage;
			this.revertingLanguage = true;
			try {
				await this.configurationService.updateValue(SATER_INTERFACE_LANGUAGE_SETTING, previousLanguage, ConfigurationTarget.USER);
			} finally {
				this.revertingLanguage = false;
			}
			applySaterInterfaceLanguage(previousLanguage);
			return;
		}
		await this.jsonEditingService.write(this.environmentService.argvResource, [{ path: ['locale'], value: language }], true);
		await this.hostService.restart();
	}
}

Registry.as<IConfigurationRegistry>(ConfigurationExtensions.Configuration).registerConfiguration({
	id: 'sater',
	title: localize('sater.settings.configurationTitle', "Sater"),
	type: 'object',
	properties: {
		[SATER_INTERFACE_LANGUAGE_SETTING]: {
			type: 'string',
			enum: ['en', 'ar'],
			enumDescriptions: [
				localize('sater.settings.english', "English"),
				localize('sater.settings.arabic', "Arabic")
			],
			default: 'en',
			description: localize('sater.settings.interfaceLanguageDescription', "Controls the interface language and layout direction. Source editors and terminals retain their code direction independently.")
		},
		[SATER_EDITOR_TEXT_DIRECTION_SETTING]: {
			type: 'string',
			enum: ['auto', 'ltr', 'rtl'],
			enumDescriptions: [
				localize('sater.settings.editorTextDirectionAuto', "Use the first strong character on each line."),
				localize('sater.settings.editorTextDirectionLtr', "Keep every editor line left-to-right."),
				localize('sater.settings.editorTextDirectionRtl', "Display every editor line right-to-left.")
			],
			default: 'auto',
			description: localize('sater.settings.editorTextDirectionDescription', "Controls text direction inside source editors. Auto keeps code left-to-right while allowing Arabic-first lines to use native right-to-left cursor and selection behavior.")
		}
	}
});

registerWorkbenchContribution2(SaterLocaleContribution.ID, SaterLocaleContribution, WorkbenchPhase.BlockStartup);

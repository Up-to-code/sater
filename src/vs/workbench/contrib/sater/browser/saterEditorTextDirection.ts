/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { RunOnceScheduler } from '../../../../base/common/async.js';
import { Disposable, toDisposable } from '../../../../base/common/lifecycle.js';
import { ICodeEditor } from '../../../../editor/browser/editorBrowser.js';
import { EditorContributionInstantiation, registerEditorContribution } from '../../../../editor/browser/editorExtensions.js';
import { Range } from '../../../../editor/common/core/range.js';
import { IModelDeltaDecoration, TextDirection } from '../../../../editor/common/model.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';

export const SATER_EDITOR_TEXT_DIRECTION_SETTING = 'sater.editorTextDirection';
export type SaterEditorTextDirection = 'auto' | 'ltr' | 'rtl';

const rtlCharacter = /[\p{Script=Arabic}\p{Script=Hebrew}]/u;
const strongCharacter = /\p{Letter}/u;

/** Returns the direction of the first strong character, matching Unicode bidi paragraph behavior. */
export function detectSaterTextDirection(value: string): TextDirection {
	for (const character of value) {
		if (rtlCharacter.test(character)) {
			return TextDirection.RTL;
		}
		if (strongCharacter.test(character)) {
			return TextDirection.LTR;
		}
	}
	return TextDirection.LTR;
}

class SaterEditorTextDirectionContribution extends Disposable {
	static readonly ID = 'editor.contrib.saterTextDirection';

	private readonly decorations = this.editor.createDecorationsCollection();
	private readonly updateScheduler = this._register(new RunOnceScheduler(() => this.update(), 0));

	constructor(
		private readonly editor: ICodeEditor,
		@IConfigurationService private readonly configurationService: IConfigurationService,
	) {
		super();
		this._register(toDisposable(() => this.decorations.clear()));
		this._register(this.editor.onDidChangeModel(() => this.updateScheduler.schedule()));
		this._register(this.editor.onDidChangeModelContent(() => this.updateScheduler.schedule()));
		this._register(this.editor.onDidChangeCursorPosition(() => this.updateScheduler.schedule()));
		this._register(this.editor.onDidScrollChange(event => {
			if (event.scrollTopChanged || event.scrollHeightChanged) {
				this.updateScheduler.schedule();
			}
		}));
		this._register(this.configurationService.onDidChangeConfiguration(event => {
			if (event.affectsConfiguration(SATER_EDITOR_TEXT_DIRECTION_SETTING)) {
				this.updateScheduler.schedule();
			}
		}));
		this.update();
	}

	private update(): void {
		const model = this.editor.getModel();
		const configuredMode = this.configurationService.getValue<SaterEditorTextDirection>(SATER_EDITOR_TEXT_DIRECTION_SETTING);
		const mode: SaterEditorTextDirection = configuredMode === 'ltr' || configuredMode === 'rtl' ? configuredMode : 'auto';
		if (!model || mode === 'ltr') {
			this.decorations.clear();
			return;
		}

		const lineNumbers = new Set<number>();
		for (const range of this.editor.getVisibleRanges()) {
			for (let lineNumber = range.startLineNumber; lineNumber <= range.endLineNumber; lineNumber++) {
				lineNumbers.add(lineNumber);
			}
		}
		for (const selection of this.editor.getSelections() ?? []) {
			lineNumbers.add(selection.positionLineNumber);
		}

		const decorations: IModelDeltaDecoration[] = [];
		for (const lineNumber of lineNumbers) {
			if (mode === 'auto' && detectSaterTextDirection(model.getLineContent(lineNumber)) !== TextDirection.RTL) {
				continue;
			}
			decorations.push({
				range: new Range(lineNumber, 1, lineNumber, model.getLineMaxColumn(lineNumber)),
				options: {
					description: 'sater-editor-text-direction',
					textDirection: TextDirection.RTL
				}
			});
		}
		this.decorations.set(decorations);
	}
}

registerEditorContribution(SaterEditorTextDirectionContribution.ID, SaterEditorTextDirectionContribution, EditorContributionInstantiation.AfterFirstRender);

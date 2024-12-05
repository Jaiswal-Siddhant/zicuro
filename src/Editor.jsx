import { useState, useCallback } from 'react';
import {
	Editor,
	EditorState,
	RichUtils,
	Modifier,
	convertToRaw,
	convertFromRaw,
} from 'draft-js';
import 'draft-js/dist/Draft.css';
import { CUSTOM_STYLES, customStyleMap } from './assets';

const decideStyle = (text) => {
	if (text === '*') {
		return 'BOLD';
	} else if (text === '**') {
		return 'RED_LINE';
	}
	return 'UNDERLINE';
};

const ColorfulEditorExample = () => {
	const [editorState, setEditorState] = useState(() => {
		const savedContent = localStorage.getItem('editorContent');
		return savedContent
			? EditorState.createWithContent(
					convertFromRaw(JSON.parse(savedContent))
			  )
			: EditorState.createEmpty();
	});

	const handleBeforeInput = useCallback((chars, editorState) => {
		if (chars !== ' ') return false;

		const selection = editorState.getSelection();
		const content = editorState.getCurrentContent();
		const currentBlock = content.getBlockForKey(selection.getStartKey());
		const text = currentBlock.getText();

		let newEditorState = editorState;
		let newContent;
		switch (text) {
			case '#':
				newContent = Modifier.removeRange(
					content,
					selection.merge({
						anchorOffset: 0,
						focusOffset: 1,
					}),
					'backward'
				);
				newEditorState = EditorState.push(
					editorState,
					newContent,
					'remove-range'
				);
				newEditorState = RichUtils.toggleBlockType(
					newEditorState,
					'header-one'
				);
				setEditorState(newEditorState);
				return true;

			case '*':
			case '**':
			case '***':
				newEditorState = RichUtils.toggleInlineStyle(
					EditorState.push(
						editorState,
						Modifier.removeRange(
							content,
							selection.merge({
								anchorOffset: 0,
								focusOffset: text.length,
							}),
							'backward'
						),
						'remove-range'
					),
					decideStyle(text, 'BOLD')
				);
				setEditorState(newEditorState);
				return true;
		}
		return false;
	}, []);

	const handleSave = useCallback(() => {
		const contentState = editorState.getCurrentContent();
		localStorage.setItem(
			'editorContent',
			JSON.stringify(convertToRaw(contentState))
		);
	}, [editorState]);

	return (
		<div style={CUSTOM_STYLES.root}>
			<button className='save-btn' onClick={handleSave}>
				Save
			</button>

			<Editor
				editorState={editorState}
				onChange={setEditorState}
				handleBeforeInput={handleBeforeInput}
				customStyleMap={customStyleMap}
				placeholder='Type to get started.'
				style={CUSTOM_STYLES.editor}
			/>
		</div>
	);
};

export default ColorfulEditorExample;

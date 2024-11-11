import Quill from 'quill';
import quillEmoji from 'quill-emoji';
import 'quill-emoji/dist/quill-emoji.css';
import React, {useMemo, useRef, useState} from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import './MLabQuillEditor.css';
import MlabQuillEditorPreviewModal from './MlabQuillEditorPreviewModal';
// Destructure the required objects from quillEmoji
const {EmojiBlot, ToolbarEmoji} = quillEmoji;

// Extend the EmojiBlot class
class CustomEmojiBlot extends EmojiBlot {
	static create(data: any) {
		const node = super.create(data);
		// Remove the span wrapper
		node.removeAttribute('class');
		return node;
	}
}

Quill.register(
	{
		'formats/emoji': CustomEmojiBlot,
		'modules/emoji-toolbar': ToolbarEmoji,
	},
	true
);

interface MLabQuillEditorProps {
	quillValue?: string;
	setQuillValue: (value: string) => void;
	isReadOnly: boolean;
	isUploadToMlabStorage: boolean;
	uploadToMlabStorage?: (e: any) => Promise<string>;
	onKeyPress?: ((event: any) => void) | undefined;
	onKeyDown?: ((event: any) => void) | undefined;
	toolbarPropsOptions?: any;
	hasImageToEditor: boolean;
	heightProps?: string;
	widthProps?: string;
	formatProps?: any;
}

const MLabQuillEditor: React.FC<MLabQuillEditorProps> = ({
	quillValue,
	setQuillValue,
	isReadOnly,
	isUploadToMlabStorage,
	uploadToMlabStorage,
	onKeyPress,
	onKeyDown,
	toolbarPropsOptions,
	hasImageToEditor,
	heightProps,
	widthProps,
	formatProps,
}) => {
	const [isHTMLMode, setIsHTMLMode] = useState(false);
	const [showPreview, setShowPreview] = useState<boolean>(false);
	const [textModeContent, setTextModeContent] = useState('');

	const quillRef = useRef<any>(null);

	const handleTextModeChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
		setTextModeContent(event.target.value);

		if (isHTMLMode) {
			setQuillValue(event.target.value.replace(`rel="noopener noreferrer" `, ''));
		}
	};

	const handleQuillChange = (content: string) => {
		setQuillValue(content.replace(`rel="noopener noreferrer" `, ''));
		if (isHTMLMode) {
			setTextModeContent(content);
		}
	};

	const handleToggleMode = () => {
		setIsHTMLMode(!isHTMLMode);
		// If switching to HTML mode, convert the rich text content to HTML
		if (!isHTMLMode) {
			setTextModeContent(quillValue ?? '');
		}
	};

	const handleImageDrop = () => {
		if (hasImageToEditor) {
			const input = document.createElement('input');
			input.setAttribute('type', 'file');
			input.setAttribute('accept', 'image/*');
			input.click();

			input.onchange = async () => {
				const file = input.files ? input.files[0] : null;
				if (file) {
					var uploadUri = await validateWhenUploadToStorageOrRetainBase64(file);
					if (uploadUri !== '') {
						if (quillRef.current) {
							const quill = quillRef.current.getEditor();
							const range = quill.getSelection();
							if (range) {
								quill.clipboard.dangerouslyPasteHTML(range.index, `<img src="${uploadUri}">`);
							}
						}
					}
				}
			};
		}
	};

	const toolbarOptions = [
		['bold', 'italic', 'underline', 'strike'],
		['emoji'],
		['blockquote', 'code-block'],
		['link', 'image', 'video', 'formula'],
		[{header: 1}, {header: 2}],
		[{list: 'ordered'}, {list: 'bullet'}, {list: 'check'}],
		[{script: 'sub'}, {script: 'super'}],
		[{indent: '-1'}, {indent: '+1'}],
		[{direction: 'rtl'}],
		[{size: ['small', false, 'large', 'huge']}],
		[{header: [1, 2, 3, 4, 5, 6, false]}],
		[{color: []}, {background: []}],
		[{font: []}],
		[{align: []}],
		['clean'],
	];

	const modules = useMemo(
		() => ({
			toolbar: {
				container: toolbarPropsOptions ?? toolbarOptions,
				handlers: {
					image: handleImageDrop,
				},
			},
			'emoji-toolbar': true,
			'emoji-shortname': true,
			clipboard: {
				matchVisual: false,
			},
		}),
		[]
	);

	const handleDrop = async (event: any) => {
		if (hasImageToEditor) {
			event.preventDefault();
			const files = event.dataTransfer.files;
			if (files && files.length > 0) {
				const file = files[0];
				const uploadUri = await validateWhenUploadToStorageOrRetainBase64(file);
				if (uploadUri !== '') {
					const quill = quillRef.current.getEditor();
					const range = quill.getSelection();
					if (range) {
						quill.clipboard.dangerouslyPasteHTML(range.index, `<img src="${uploadUri}">`);
					}
				}
			}
		}
	};

	const handleImagePaste = async (file: File) => {
		const uploadUri = await validateWhenUploadToStorageOrRetainBase64(file);
		const reader = new FileReader();
		reader.onload = (e: any) => {
			uploadImage(uploadUri);
		};
		reader.readAsDataURL(file);
	};

	const handlePaste = async (event: React.ClipboardEvent<HTMLDivElement>) => {
		if (hasImageToEditor) {
			const clipboardData = event.clipboardData || (window as any).clipboardData;
			if (clipboardData && clipboardData.items) {
				for (const item of clipboardData.items) {
					if (item.type.indexOf('image') !== -1) {
						event.preventDefault();
						const file = item.getAsFile();
						if (file) {
							await handleImagePaste(file);
						}
					}
				}
			}
		}
	};

	const uploadImage = (dataUrl: string) => {
		const range = quillRef.current.getEditor().getSelection();
		quillRef.current.getEditor().clipboard.dangerouslyPasteHTML(range.index, `<img src="${dataUrl}">`);
	};

	const handleShowQuilPreviewModalShow = () => {
		setShowPreview(true);
	};

	const validateWhenUploadToStorageOrRetainBase64 = async (_file: any) => {
		let _aquiredStringUri: string = '';
		if (isUploadToMlabStorage && uploadToMlabStorage) {
			_aquiredStringUri = await uploadToMlabStorage(_file);
		} else {
			let readFile = await readFileAsDataURL(_file);
			_aquiredStringUri = readFile ?? '';
		}
		return _aquiredStringUri;
	};

	const readFileAsDataURL = (file: File): Promise<string | null> => {
		return new Promise((resolve) => {
			const reader = new FileReader();
			reader.onload = (e: any) => {
				resolve(e.target.result);
			};
			reader.readAsDataURL(file);
		});
	};

	return (
		<div className='editor-container'>
			{!isReadOnly && (
				<>
					<button type='button' onClick={handleToggleMode}>
						{isHTMLMode ? 'Switch to Rich Text Mode' : 'Switch to HTML Mode'}
					</button>
				</>
			)}

			{isHTMLMode && (
				<button style={{marginLeft: 10}} type='button' onClick={handleShowQuilPreviewModalShow}>
					{'Preview Changes'}
				</button>
			)}

			{isHTMLMode ? (
				<>
					<textarea
						value={textModeContent}
						onChange={handleTextModeChange}
						placeholder='Enter HTML content here'
						style={{width: '100%', minHeight: '200px'}}
						disabled={isReadOnly}
					/>
				</>
			) : (
				<div onDrop={handleDrop} onDragOver={(e) => e.preventDefault()} onPaste={handlePaste}>
					<ReactQuill
						ref={quillRef}
						modules={modules}
						theme='snow'
						value={quillValue}
						onChange={handleQuillChange}
						readOnly={isReadOnly}
						style={{height: heightProps ?? '500px', width: widthProps ?? '100%'}}
						onKeyPress={onKeyPress}
						onKeyDown={onKeyDown}
						className='ql-editor'
						formats={formatProps}
					/>
				</div>
			)}
			<MlabQuillEditorPreviewModal contentPreview={textModeContent ?? ''} showPreview={showPreview} setShowPreview={setShowPreview} />
		</div>
	);
};

export {MLabQuillEditor};

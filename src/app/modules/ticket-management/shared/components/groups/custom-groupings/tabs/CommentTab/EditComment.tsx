import {useState} from 'react';
import {Col, Row} from 'react-bootstrap-v5';
import EditorField from '../../../../EditorField';
import {usePromptOnUnload} from '../../../../../../../../custom-helpers';
import swal from 'sweetalert';
import {ElementStyle, PROMPT_MESSAGES} from '../../../../../../../../constants/Constants';
import useConstant from '../../../../../../../../constants/useConstant';
import useFnsDateFormatter from '../../../../../../../../custom-functions/helper/useFnsDateFormatter';
import {MlabButton} from '../../../../../../../../custom-components';

const EditComment: React.FC<any> = ({...props}) => {
	const [isEdit, setIsEdit] = useState<boolean>(false);
	const [editorValue, setEditorValue] = useState<string>('');
	const [isSubmitClicked, setIsSubmitClicked] = useState<boolean>(false);
	const [isDeleted, setIsDeleted] = useState<boolean>(false);
	const [disableSubmit, setDisableSubmit] = useState<boolean>(true);
	const {commentDetails, handleEditCommentSubmit, handleDelete, username, isNewComment, hasAccess} = props;

	const {SwalConfirmMessage} = useConstant();
	const {mlabFormatDate} = useFnsDateFormatter();

	const isWhiteSpaceOnly = (data: any) => {
		const parser = new DOMParser();
		const doc = parser.parseFromString(data, 'text/html');
		const textContent = doc.body.textContent ?? '';
		let result = textContent.replace(/&nbsp;/gi, ' ');
		return /^[\s\u00A0]*$/.test(result);
	};

	usePromptOnUnload(isEdit, '');

	const handleEditOnClick = (comment: any) => {
		setDisableSubmit(isWhiteSpaceOnly(comment));
		setEditorValue(comment);
		setIsEdit(true);
	};

	const handleDeleteOnClick = (ticketCommentId: any) => {
		swal({
			title: PROMPT_MESSAGES.ConfirmRemoveTitle,
			text: SwalConfirmMessage.textConfirmRemove,
			icon: SwalConfirmMessage.icon,
			buttons: [SwalConfirmMessage.btnNo, SwalConfirmMessage.btnYes],
			dangerMode: true,
		}).then((onConfirm) => {
			if (onConfirm) {
				setIsEdit(false);
				handleDelete(ticketCommentId);
				setIsDeleted(true);
			}
		});
	};

	const handleCancel = () => {
		setIsEdit(false);
	};

	const handleOnChange = (_content: any) => {
		setDisableSubmit(isWhiteSpaceOnly(_content));
		setEditorValue(_content);
	};

	const handleSubmitOnClick = () => {
		setIsSubmitClicked(true);
		swal({
			title: PROMPT_MESSAGES.ConfirmSubmitTitle,
			text: PROMPT_MESSAGES.ConfirmSubmitMessageEdit,
			icon: SwalConfirmMessage.icon,
			buttons: [SwalConfirmMessage.btnNo, SwalConfirmMessage.btnYes],
			dangerMode: true,
		}).then((onConfirm) => {
			if (onConfirm) {
				commentDetails.Comment = editorValue;
				handleEditCommentSubmit(commentDetails);
				setIsEdit(false);
				setIsSubmitClicked(false);
			} else {
				setIsSubmitClicked(false);
			}
		});
	};

	const fadeStyleClassName = (isDeleted: boolean, isNewComment: boolean) => {
		if (isDeleted) {
			return 'edit-comment-card fade-delete';
		}

		if (isNewComment) {
			return 'edit-comment-card fade-add';
		}

		return 'edit-comment-card';
	};

	return (
		<div className={fadeStyleClassName(isDeleted, isNewComment)}>
			<Row>
				<Col md={12} className='comment-header'>
					{' '}
					{commentDetails.CreatedBy} | {mlabFormatDate(commentDetails.Timestamp)} {commentDetails.IsEdited && <span> - Edited</span>}
				</Col>
			</Row>
			<Row>
				<Col md={12}>
					<span dangerouslySetInnerHTML={{__html: commentDetails.Comment}}></span>
				</Col>
			</Row>
			{username === commentDetails.CreatedBy && hasAccess && (
				<Row>
					<Col md={12} className='ticket-edit-delete-btn-container'>
						<MlabButton
							access={hasAccess}
							size={'sm'}
							label={'Edit'}
							style={ElementStyle.secondary}
							type={'button'}
							weight={'solid'}
							onClick={() => handleEditOnClick(commentDetails.Comment)}
							loading={false}
							loadingTitle={''}
							disabled={false}
							additionalClassStyle='edit-comment-btn'
						/>
						<MlabButton
							access={hasAccess}
							size={'sm'}
							label={'Delete'}
							style={ElementStyle.secondary}
							type={'button'}
							weight={'solid'}
							onClick={() => handleDeleteOnClick(commentDetails.TicketCommentId)}
							loading={isDeleted}
							loadingTitle={'Please wait ...'}
							disabled={isDeleted}
							additionalClassStyle='delete-comment-btn'
						/>
					</Col>
				</Row>
			)}
			{isEdit && (
				<Row>
					<EditorField
						handleOnChange={handleOnChange}
						editorValue={editorValue}
						handleSubmit={handleSubmitOnClick}
						isSubmitClicked={isSubmitClicked}
						handleCancel={handleCancel}
						cancelClearBtnLabel='Cancel'
						hasAccess={hasAccess}
						disableSubmit={disableSubmit}
					/>
				</Row>
			)}
		</div>
	);
};

export default EditComment;

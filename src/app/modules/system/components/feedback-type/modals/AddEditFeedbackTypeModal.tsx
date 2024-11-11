import {useEffect, useState} from 'react';
import {Button, Modal} from 'react-bootstrap';
import {shallowEqual, useSelector} from 'react-redux';
import swal from 'sweetalert';
import {RootState} from '../../../../../../setup';
import {PROMPT_MESSAGES} from '../../../../../constants/Constants';
import {FieldContainer, PaddedContainer} from '../../../../../custom-components';
import {FeedbackTypeModel} from '../../../models/FeedbackTypeModel';
import {STATUS_OPTIONS} from '../../constants/SelectOptions';
import useConstant from '../../../../../constants/useConstant';

type ModalProps = {
	editMode: boolean;
	feedbackType?: FeedbackTypeModel;
	modal: boolean;
	toggle: () => void;
	saveFeedbackType: (val: FeedbackTypeModel) => void;
};

const AddEditFeedbackTypeModal: React.FC<ModalProps> = (props: ModalProps) => {

	const {SwalConfirmMessage, SwalServerErrorMessage, SwalFeedbackMessage, SwalFailedMessage} = useConstant();
	// States
	const [feedbackTypeInfo, setFeedbackTypeInfo] = useState<FeedbackTypeModel | undefined>(props.feedbackType);
	const [name, setName] = useState('');
	const [status, setStatus] = useState('true');
	const [isSubmitting, setIsSubmitting] = useState(false);
	const userAccessId = useSelector<RootState>(({auth}) => auth.userId, shallowEqual) as number;
	const feedbackTypeListState = useSelector<RootState>(({system}) => system.feedbackTypeList, shallowEqual) as FeedbackTypeModel[];
	// Effects

	useEffect(() => {
		if (props.modal) {
			setName('');
			setStatus('true');
			setIsSubmitting(false);
			if (props.editMode && props.feedbackType !== undefined) {
				setFeedbackTypeInfo(props.feedbackType);
				setName(props.feedbackType.feedbackTypeName);
				setStatus(props.feedbackType.feedbackTypeStatus ? 'true' : 'false');
				setIsSubmitting(false);
			}
		}
	}, [props.modal]);

	// Methods
	const handleNameOnchange = (event: any) => {
		setName(event.target.value);
	};

	const handleStatusOnChange = (event: any) => {
		setStatus(event.target.value);
	};
	const handleClose = () => {
		swal({
			title: PROMPT_MESSAGES.ConfirmCloseTitle,
			text: PROMPT_MESSAGES.ConfirmCloseMessage,
			icon: SwalConfirmMessage.icon,
			buttons: [SwalConfirmMessage.btnNo, SwalConfirmMessage.btnYes],
			dangerMode: true,
		}).then((willCreate) => {
			if (willCreate) {
				props.toggle();
			}
		});
	};

	const handleSaveChanges = () => {
		//validate
		setIsSubmitting(true);
		let isValid = true;
		if (name === '') {
			isValid = false;
			swal(SwalServerErrorMessage.title, PROMPT_MESSAGES.FailedValidationMandatoryMessage,  SwalServerErrorMessage.icon);
		}
		if (!props.editMode) {
			const isTypeDuplicate = feedbackTypeListState.some((i) => i.feedbackTypeName.toLowerCase() === name.toLowerCase());
			if (isTypeDuplicate) {
				isValid = false;
				swal(SwalFailedMessage.title, SwalFeedbackMessage.textErrorAlreadyExists,  SwalFailedMessage.icon);
			}
		}

		if (isValid) {
			const item: FeedbackTypeModel = {
				feedbackTypeId: feedbackTypeInfo?.feedbackTypeId !== undefined ? Number(feedbackTypeInfo?.feedbackTypeId) : 0,
				position: feedbackTypeInfo?.position !== undefined ? feedbackTypeInfo?.position : 0,
				feedbackTypeName: name,
				feedbackTypeStatus: status == 'true',
				createdBy: userAccessId,
				updatedBy: userAccessId,
				codeListId: 6,
				codeListName: 'Feedback Type',
			};

			props.saveFeedbackType(item);
		}
	};

	return (
		<Modal show={props.modal} size={'lg'} onHide={handleClose}>
			<Modal.Header>
				<Modal.Title>{props.editMode ? 'Edit' : 'Add'} Feedback Type</Modal.Title>
			</Modal.Header>
			<Modal.Body>
				<PaddedContainer>
					<FieldContainer>
						<FieldContainer>
							<div className='col-sm-4'>
								<label htmlFor='feedback-type-name'>Feedback Type Name</label>
							</div>
							<div className='col'>
								<input id='feedback-type-name' type='text' className='form-control' aria-label='Question Name' value={name} onChange={handleNameOnchange} />
							</div>
						</FieldContainer>

						<FieldContainer>
							<div className='col-sm-4'>
								<label htmlFor='feedback-type-status'>Feedback Type Status</label>
							</div>
							<div className='col'>
								<select id='feedback-type-status' className='form-select' aria-label='Select status' value={status.toString()} onChange={handleStatusOnChange}>
									{STATUS_OPTIONS.map((item) => (
										<option key={item.value.toString()} value={item.value.toString()}>
											{item.label}
										</option>
									))}
								</select>
							</div>
						</FieldContainer>
					</FieldContainer>
				</PaddedContainer>
			</Modal.Body>
			<Modal.Footer className='d-flex justify-content-start'>
				<Button disabled={isSubmitting} variant='primary' onClick={handleSaveChanges}>
					Submit
				</Button>
				<Button variant='secondary' onClick={handleClose}>
					Close
				</Button>
			</Modal.Footer>
		</Modal>
	);
};

export default AddEditFeedbackTypeModal;
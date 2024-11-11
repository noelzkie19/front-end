import {useEffect, useState} from 'react';
import {Button, Modal} from 'react-bootstrap';
import {shallowEqual, useSelector} from 'react-redux';
import Select from 'react-select';
import swal from 'sweetalert';
import {RootState} from '../../../../../../setup';
import {PROMPT_MESSAGES} from '../../../../../constants/Constants';
import {ContentContainer, ErrorLabel, FieldContainer, MainContainer} from '../../../../../custom-components';
import {FeedbackAnswerCategoryModel, FeedbackAnswerModel, FeedbackCategoryModel, OptionsSelectedModel} from '../../../models';
import {STATUS_OPTIONS} from '../../constants/SelectOptions';
import useConstant from '../../../../../constants/useConstant';

type ModalProps = {
	editMode: boolean;
	feedbackAnswer?: FeedbackAnswerModel;
	modal: boolean;
	toggle: () => void;
	saveFeedbackAnswer: (val: FeedbackAnswerModel) => void;
};

const AddEditFeedbackAnswerModal: React.FC<ModalProps> = (props: ModalProps) => {

	const { SwalConfirmMessage } = useConstant();
	// States
	const userAccessId = useSelector<RootState>(({auth}) => auth.userId, shallowEqual) as number;
	const [name, setName] = useState('');
	const [status, setStatus] = useState('true');
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [feedbackAnswerInfo, setFeedbackAnswerInfo] = useState<FeedbackAnswerModel | undefined>(props.feedbackAnswer);
	const feedbackAnswerListState = useSelector<RootState>(({system}) => system.feedbackAnswerList, shallowEqual) as FeedbackAnswerModel[];
	const feedbackCategoryListState = useSelector<RootState>(({system}) => system.feedbackCategoryList, shallowEqual) as FeedbackCategoryModel[];
	const [feedbackCategories, setFeedbackCategories] = useState<any>([]);

	const [hasErrors, setHasErrors] = useState<boolean>(false);
	const [errorMessage, setErrorMessage] = useState<string>('');
	// Effects

	useEffect(() => {
		if (props.modal) {
			setName('');
			setStatus('true');
			setFeedbackCategories([]);
			setIsSubmitting(false);
			setHasErrors(false);
			setErrorMessage('');

			if (props.editMode && props.feedbackAnswer !== undefined) {
				setFeedbackAnswerInfo(props.feedbackAnswer);
				setName(props.feedbackAnswer.feedbackAnswerName);
				setStatus(props.feedbackAnswer.feedbackAnswerStatus ? 'true' : 'false');

				// -- SET FEEDBACK CATEGORIES VALUE IF EDIT MODE -- //
				let OptionList = Array<OptionsSelectedModel>();

				props.feedbackAnswer.feedbackAnswerCategories.forEach((item: any) => {
					const tempOption: OptionsSelectedModel = {
						value: item.feedbackCategoryId.toString(),
						label: item.feedbackCategoryName,
					};
					OptionList.push(tempOption);
				});

				setFeedbackCategories(OptionList);
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

	const handleFeedbackCategoriesOnChange = (event: any) => {
		setFeedbackCategories(event);
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

	const _validateModal = () => {
		//validate
		let isValid = true;
		if (name === '' || feedbackCategories.length === 0) {
			isValid = false;
			setHasErrors(true);
			setErrorMessage(PROMPT_MESSAGES.FailedValidationMandatoryMessage);
		}

		if (!props.editMode) {
			const isAnswerDuplicate = feedbackAnswerListState.some((i) => i.feedbackAnswerName.toLowerCase() === name.toLowerCase());
			if (isAnswerDuplicate) {
				isValid = false;
				setHasErrors(true);
				setErrorMessage(PROMPT_MESSAGES.FailedValidationSearchDuplicateMessage);
			}
		}

		return isValid;
	}

	const getFeedbackAnswerCategories = () => {
		let feedbackCategoryObj = feedbackCategories.map((el: any) => el.value);
		const feedbackAnswerCats = feedbackCategoryListState.filter((e) => feedbackCategoryObj.indexOf(e.feedbackCategoryId.toString()) > -1);
		
		return feedbackAnswerCats.map((f: FeedbackCategoryModel) => {
			let ctId = 0;
			if (props.editMode) {
				ctId = props.feedbackAnswer
					? (props.feedbackAnswer?.feedbackAnswerCategories.find((i) => i.feedbackCategoryId === f.feedbackCategoryId)
						?.feedbackCategoryId as number)
					: 0;
			}
			const item2: FeedbackAnswerCategoryModel = {
				feedbackAnswerCategoriesId: ctId,
				feedbackAnswerId: props.editMode ? Number(feedbackAnswerInfo?.feedbackAnswerId) : 0,
				feedbackAnswerName: name,
				feedbackCategoryId: f.feedbackCategoryId,
				feedbackCategoryName: f.feedbackCategoryName,
			};
			return item2;
		})
	}

	const handleSaveChanges = () => {
		if (_validateModal()) {
			
			const item: FeedbackAnswerModel = {
				feedbackAnswerId: feedbackAnswerInfo?.feedbackAnswerId !== undefined ? Number(feedbackAnswerInfo?.feedbackAnswerId) : 0,
				position: feedbackAnswerInfo?.position !== undefined ? feedbackAnswerInfo?.position : feedbackAnswerListState.length + 1,
				feedbackAnswerName: name,
				feedbackAnswerStatus: status === 'true',
				feedbackCategoryId: 0,
				feedbackCategoryName: '',
				createdBy: feedbackAnswerInfo?.createdBy !== undefined ? Number(feedbackAnswerInfo?.createdBy) : userAccessId,
				updateBy: userAccessId,
				feedbackAnswerCategories: getFeedbackAnswerCategories(),
			};

			props.saveFeedbackAnswer(item);
		}
	};

	return (
		<Modal show={props.modal} size={'lg'} onHide={handleClose} centered>
			<Modal.Header>
				<Modal.Title>{props.editMode ? 'Edit' : 'Add'} Feedback Answer</Modal.Title>
			</Modal.Header>
			<Modal.Body>
				<MainContainer>
					<ContentContainer>
						<ErrorLabel hasErrors={hasErrors} errorMessage={errorMessage} />
						<FieldContainer>
							<div className='col-12'>
								<label htmlFor='feedback-answer-name' className={'form-label-sm ' + (props.editMode ? '' : 'required')}>Feedback Answer Name</label>

								<input
									id='feedback-answer-name'
									type='text'
									className='form-control form-control-sm '
									aria-label='Feedback Answer Name'
									value={name}
									onChange={handleNameOnchange}
									disabled={props.editMode}
								/>
							</div>
						</FieldContainer>

						<FieldContainer>
							<div className='col-12'>
								<label htmlFor='feedback-answer-status' className='form-label-sm required'>Feedback Answer Status</label>

								<select id='feedback-answer-status' className='form-select form-select-sm' aria-label='Select status' value={status.toString()} onChange={handleStatusOnChange}>
									{STATUS_OPTIONS.map((item) => (
										<option key={item.value.toString()} value={item.value.toString()}>
											{item.label}
										</option>
									))}
								</select>
							</div>
						</FieldContainer>
						<FieldContainer>
							<div className='col-12'>
								<label htmlFor='included-to-feedback-category' className='form-label-sm required'>Included to Feedback Category</label>

								<Select
									id='included-to-feedback-category'
									isMulti
									value={feedbackCategories}
									onChange={handleFeedbackCategoriesOnChange}
									options={
										feedbackCategoryListState?.map((item, index) => ({
											value: item.feedbackCategoryId.toString(),
											label: item.feedbackCategoryName,
										}))
									}
								/>
							</div>
						</FieldContainer>
					</ContentContainer>
				</MainContainer>
				<Modal.Footer style={{border: 0}}>
					<Button disabled={isSubmitting} className='btn btn-primary btn-sm me-2' onClick={handleSaveChanges}>
						Submit
					</Button>
					<Button className='btn btn-secondary btn-sm' onClick={handleClose}>
						Close
					</Button>
				</Modal.Footer>
			</Modal.Body>
		</Modal>
	);
};

export default AddEditFeedbackAnswerModal;
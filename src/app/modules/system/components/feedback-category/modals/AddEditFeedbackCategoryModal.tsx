import {useEffect, useState} from 'react';
import {Button, Modal} from 'react-bootstrap';
import {shallowEqual, useSelector} from 'react-redux';
import Select from 'react-select';
import swal from 'sweetalert';
import {RootState} from '../../../../../../setup';
import {PROMPT_MESSAGES} from '../../../../../constants/Constants';
import {ContentContainer, ErrorLabel, FieldContainer} from '../../../../../custom-components';
import {FeedbackCategoryTypeModel, FeedbackTypeModel, OptionsSelectedModel} from '../../../models';
import {FeedbackCategoryModel} from '../../../models/FeedbackCategoryModel';
import {STATUS_OPTIONS} from '../../constants/SelectOptions';
import useConstant from '../../../../../constants/useConstant';

type ModalProps = {
	editMode: boolean;
	feedbackCategory?: FeedbackCategoryModel;
	modal: boolean;
	toggle: () => void;
	saveFeedbackCategory: (val: FeedbackCategoryModel) => void;
};

const AddEditFeedbackCategoryModal: React.FC<ModalProps> = (props: ModalProps) => {

	const { SwalConfirmMessage } = useConstant();
	// States
	const [name, setName] = useState('');
	const [status, setStatus] = useState('true');
	const [feedbackTypeId, setFeedbackTypeId] = useState('1');
	const [feedbackTypes, setFeedbackTypes] = useState<any>([]);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [feedbackCategoryInfo, setFeedbackCategoryInfo] = useState<FeedbackCategoryModel | undefined>(props.feedbackCategory);
	const feedbackCategoryListState = useSelector<RootState>(({system}) => system.feedbackCategoryList, shallowEqual) as FeedbackCategoryModel[];
	const feedbackTypeListState = useSelector<RootState>(({system}) => system.feedbackTypeList, shallowEqual) as FeedbackTypeModel[];

	const [hasErrors, setHasErrors] = useState<boolean>(false);
	const [errorMessage, setErrorMessage] = useState<string>('');
	// Effects

	useEffect(() => {
		if (props.modal) {
			setName('');
			setStatus('true');
			setFeedbackTypes([]);
			setIsSubmitting(false);
			setHasErrors(false);
			setErrorMessage('');

			if (props.editMode && props.feedbackCategory !== undefined) {
				setFeedbackCategoryInfo(props.feedbackCategory);
				setName(props.feedbackCategory.feedbackCategoryName);
				setStatus(props.feedbackCategory.feedbackCategoryStatus ? 'true' : 'false');
				setFeedbackTypeId(props.feedbackCategory.feedbackTypeId.toString());

				let OptionList = Array<OptionsSelectedModel>();

				props.feedbackCategory.feedbackCategoryTypes.forEach((item: any) => {
					const tempOption: OptionsSelectedModel = {
						value: item.feedbackTypeId.toString(),
						label: item.feedbackTypeName,
					};
					OptionList.push(tempOption);
				});
				setFeedbackTypes(OptionList);

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

	const handleFeedbackTypesOnChange = (event: any) => {
		setFeedbackTypes(event);
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
		setIsSubmitting(true);
		let isValid = true;
		if (name === '' || feedbackTypes.length === 0) {
			isValid = false;
			setHasErrors(true);
			setErrorMessage(PROMPT_MESSAGES.FailedValidationMandatoryMessage);

			setIsSubmitting(false);
		}

		if (!props.editMode) {
			const isCategoryDuplicate = feedbackCategoryListState.some((i) => i.feedbackCategoryName.toLowerCase() === name.toLocaleLowerCase());
			if (isCategoryDuplicate) {
				isValid = false;
				setHasErrors(true);
				setErrorMessage(PROMPT_MESSAGES.FailedValidationSearchDuplicateMessage);

				setIsSubmitting(false);
			}
		}

		return isValid;
	}

	const getFeedbackCategoryTypes = () => {
		let feedbackTypeObj = feedbackTypes.map((el: any) => el.value);
		const feedbackCatTypes = feedbackTypeListState.filter((e) => feedbackTypeObj.indexOf(e.feedbackTypeId.toString()) > -1);

		return feedbackCatTypes.map((f: FeedbackTypeModel) => {
			let ctId = 0;
			if (props.editMode) {
				ctId = props.feedbackCategory
					? (props.feedbackCategory?.feedbackCategoryTypes.find((i) => i.feedbackTypeId === f.feedbackTypeId)?.feedbackTypeId as number)
					: 0;
			}
			const item2: FeedbackCategoryTypeModel = {
				feedbackCategoryTypesId: ctId,
				feedbackCategoryId: props.editMode ? Number(feedbackCategoryInfo?.feedbackCategoryId) : 0,
				feedbackCategoryName: name,
				feedbackTypeId: f.feedbackTypeId,
				feedbackTypeName: f.feedbackTypeName,
			};
			return item2;
		})
	}

	const handleSaveChanges = () => {
		if (_validateModal()) {
			const feedbackTypeInfo = feedbackCategoryListState.find((i) => i.feedbackCategoryId.toString() === feedbackTypeId);
			
			const item: FeedbackCategoryModel = {
				feedbackCategoryId: props.editMode ? Number(feedbackCategoryInfo?.feedbackCategoryId) : 0,
				position: props.editMode && feedbackCategoryInfo ? feedbackCategoryInfo?.position : feedbackCategoryListState.length + 1,
				feedbackCategoryName: name,
				feedbackCategoryStatus: status === 'true',
				feedbackTypeId: +feedbackTypeId,
				feedbackTypeName: feedbackTypeInfo?.feedbackCategoryName !== undefined ? feedbackTypeInfo?.feedbackCategoryName : '',
				feedbackCategoryTypes: getFeedbackCategoryTypes(),
			};

			props.saveFeedbackCategory(item);
		}
	};

	return (
		<Modal show={props.modal} size={'lg'} onHide={handleClose} centered>
			<Modal.Header>
				<Modal.Title>{props.editMode ? 'Edit' : 'Add'} Feedback Category</Modal.Title>
			</Modal.Header>
			<Modal.Body>
				<ContentContainer>
					<ErrorLabel hasErrors={hasErrors} errorMessage={errorMessage} />
					<FieldContainer>
						<div className='col-12'>
							<label htmlFor='feedback-category-name' className={'form-label-sm ' + (!props.editMode ? 'required' : '')}>Feedback Category Name</label>
							<input
								id='feedback-category-name'
								type='text'
								className='form-control form-control-sm '
								aria-label='Feedback Category Name'
								value={name}
								onChange={handleNameOnchange}
								disabled={props.editMode}
							/>
						</div>
					</FieldContainer>

					<FieldContainer>
						<div className='col-12'>
							<label htmlFor='feedback-category-status' className='form-label-sm required'>Feedback Category Status</label>
							<select id='feedback-category-status' className='form-select form-select-sm' aria-label='Select status' value={status.toString()} onChange={handleStatusOnChange}>
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
							<label htmlFor='included-to-feedback-type' className='form-label-sm required'>Included to Feedback Type</label>

							<Select
								id='included-to-feedback-type'
								isMulti
								value={feedbackTypes}
								onChange={handleFeedbackTypesOnChange}
								options={
									feedbackTypeListState?.map((item, index) => ({
										value: item.feedbackTypeId.toString(),
										label: item.feedbackTypeName,
									}))
								}
							/>
						</div>
					</FieldContainer>
				</ContentContainer>
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

export default AddEditFeedbackCategoryModal;
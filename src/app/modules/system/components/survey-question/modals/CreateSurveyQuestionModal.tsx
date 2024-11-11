import {useFormik} from 'formik';
import {Guid} from 'guid-typescript';
import React, {useEffect, useState} from 'react';
import { Modal} from 'react-bootstrap';
import {shallowEqual, useSelector} from 'react-redux';
import {useHistory} from 'react-router-dom';
import swal from 'sweetalert';
import * as Yup from 'yup';
import {RootState} from '../../../../../../setup';
import * as hubConnection from '../../../../../../setup/hub/MessagingHub';
import * as sessionHandler from '../../../../../../setup/session/SessionHandler';
import {PROMPT_MESSAGES} from '../../../../../constants/Constants';
import useConstant from '../../../../../constants/useConstant';
import {DefaultSecondaryButton, FieldContainer, FormContainer, PaddedContainer, SuccesLoaderButton} from '../../../../../custom-components';
import {FieldTypeModel} from '../../../models';
import {SurveyQuestionAnswerModel} from '../../../models/SurveyQuestionAnswerModel';
import {SurveyQuestionModel} from '../../../models/SurveyQuestionModel';
import {SurveyQuestionRequestModel} from '../../../models/SurveyQuestionRequestModel';
import {saveSurveyQuestion, saveSurveyQuestionResult} from '../../../redux/SystemService';
import {STATUS_OPTIONS} from '../../constants/SelectOptions';

type ModalProps = {
	modal: boolean;
	toggle: () => void;
	saveSurveyQuestion: () => void;
};

const createSurveyQuestionSchema = Yup.object().shape({
	id: Yup.number(),
	name: Yup.string(),
	fieldType: Yup.string(),
	status: Yup.boolean(),
	answers: Yup.array(),
	createdBy: Yup.number(),
});

const initialValues = {
	id: 0,
	name: '',
	fieldType: '2',
	status: true,
	answers: Array<SurveyQuestionAnswerModel>(),
	createdBy: '0',
	queueId: '',
	userId: '',
};

export const FIELD_TYPE_OPTIONS_QUESTION = [
	{value: '2', label: 'Dropdown'},
	{value: '3', label: 'Dropdown With Search'},
	{value: '4', label: 'Dropdown Multi Select'},
	{value: '5', label: 'Dropdown Multi Select With Search'},
	{value: '6', label: 'Radio Button'},
	{value: '7', label: 'Text Input'},
	{value: '8', label: 'Multiline Text Input'},
];

const CreateSurveyQuestionModal: React.FC<ModalProps> = (props: ModalProps) => {
	// Variables
	const {successResponse, SwalConfirmMessage} = useConstant();

	// States
	const messagingHub = hubConnection.createHubConnenction();
	const userAccessId = useSelector<RootState>(({auth}) => auth.userId, shallowEqual) as number;
	const expiresIn = useSelector<RootState>(({auth}) => auth.expiresIn, shallowEqual) as string;
	const history = useHistory();
	const [nameField, setNameField] = useState('');
	const [fieldTypeField, setFieldTypeField] = useState('');
	const [statusField, setStatusField] = useState('true');

	const fieldTypesState = useSelector<RootState>(({system}) => system.fieldType, shallowEqual) as FieldTypeModel[];
	const questionListState = useSelector<RootState>(({system}) => system.surveyQuestionList, shallowEqual) as SurveyQuestionModel[];

	async function questionRequest() {
		const fieldTypeInfo = fieldTypesState.find((i) => i.id.toString() === fieldTypeField);
		const questionRequestObj: SurveyQuestionRequestModel = {
			surveyQuestionId: 0,
			surveyQuestionName: nameField,
			isActive: statusField === 'true',
			fieldTypeId: +fieldTypeField,
			fieldTypeName: fieldTypeInfo !== undefined ? fieldTypeInfo.fieldTypeName : '',
			surveyQuestionAnswers: [],
			createdBy: userAccessId,
			updatedBy: userAccessId,
			queueId: Guid.create().toString(),
			userId: userAccessId.toString(),
		};

		return questionRequestObj;
	}

	// Formik
	const formik = useFormik({
		initialValues,
		validationSchema: createSurveyQuestionSchema,
		onSubmit: async (values, {setSubmitting, resetForm}) => {
			// Check if session is valid
			if (sessionHandler.isSessionExpired(expiresIn, history) === true) {
				return;
			}

			setSubmitting(true);
			
			// Add additional fields
			values.queueId = Guid.create().toString();
			values.userId = userAccessId.toString();
			values.name = nameField;
			values.status = statusField === 'true';
			values.fieldType = fieldTypeField;
			values.answers = [];
			values.createdBy = userAccessId.toString();

			// Validate fields
			let isValid: boolean = true;

			if (values.name === '' || values.fieldType === '') {
				swal(PROMPT_MESSAGES.FailedValidationTitle, PROMPT_MESSAGES.FailedValidationMandatoryMessage, 'error').catch(() => {});
				setSubmitting(false);
				isValid = false;
			}

			const duplicateIndex = questionListState.findIndex((i) => i.surveyQuestionName.toLowerCase() === nameField.trim().toLowerCase());
			if (duplicateIndex > -1) {
				swal(PROMPT_MESSAGES.FailedValidationTitle, 'Value already exists, please use the search filter to find them', 'error').catch(() => {});
				setSubmitting(false);
				isValid = false;
			}

			if (isValid === true) {
				let questionRequestObj = await questionRequest();

				resetForm({});
				messagingHub
					.start()
					.then(() => {
						saveSurveyQuestion(questionRequestObj)
							.then((response) => {
								// IF REQUEST IS SUCCESS THEN CONSUME CALLBACK API
								if (response.status === successResponse) {
									messagingHub.on(questionRequestObj.queueId.toString(), (message) => {
										saveSurveyQuestionResult(message.cacheId)
											.then(() => {
												saveNewSurveyQuestion();
												setSubmitting(false);
												messagingHub.off(questionRequestObj.queueId.toString());
											})
											.catch(() => {
												messagingHub.off(questionRequestObj.queueId.toString());
											});
									});
								}
							})
							.catch(() => {
								messagingHub.stop().catch(() => {});
								swal('Failed', 'Problem in getting feedback category info', 'error').catch(() => {});
								
							});
					})
					.catch(() => {});
			}
			setSubmitting(false);
		},
	});
	// Effects
	useEffect(() => {
		if (!props.modal) {
			resetForm();
		} else if (fieldTypesState !== undefined && fieldTypesState.length > 0) {
			setFieldTypeField(fieldTypesState[0].id.toString());
		}
	}, [props.modal]);

	// Methods
	const handleClose = () => {
		swal({
			title: PROMPT_MESSAGES.ConfirmCloseTitle,
			text: PROMPT_MESSAGES.ConfirmCloseMessage,
			icon: 'warning',
			buttons: {
				cancel: {
					text: SwalConfirmMessage.btnNo,
					value: null,
					visible: true,
				},
				confirm: {
					text: SwalConfirmMessage.btnYes,
					value: true,
					visible: true,
				},
			},
			dangerMode: true,
		})
			.then((willCreate) => {
				if (willCreate) {
					props.toggle();
				}
			})
			.catch(() => {});
	};
	const saveNewSurveyQuestion = () => {
		resetForm();
		props.toggle();
		props.saveSurveyQuestion();
	};

	const handleSaveChanges = () => {
		swal({
			title: PROMPT_MESSAGES.ConfirmSubmitTitle,
			text: PROMPT_MESSAGES.ConfirmSubmitMessage('Survey Question'),
			icon: 'warning',
			buttons: {
				cancel: {
					text: SwalConfirmMessage.btnNo,
					value: null,
					visible: true,
				},
				confirm: {
					text: SwalConfirmMessage.btnYes,
					value: true,
					visible: true,
				},
			},
			dangerMode: true,
		})
			.then((willCreate) => {
				if (willCreate) {
					formik.submitForm().catch(() => {});
				}
			})
			.catch(() => {});
	};

	const resetForm = () => {
		formik.resetForm();
		setNameField('');
		setFieldTypeField('');
		setStatusField('true');
	};

	const handleNameFieldChange = (event: any) => {
		setNameField(event.target.value);
	};

	const handleStatusChange = (event: any) => {
		setStatusField(event.target.value);
	};

	const handleFieldTypeChange = (event: any) => {
		setFieldTypeField(event.target.value);
	};

	return (
		<Modal show={props.modal} size={'lg'} onHide={handleClose} centered>
			<Modal.Header>
				<Modal.Title>Add Survey Question</Modal.Title>
			</Modal.Header>
			<Modal.Body>
				<FormContainer onSubmit={formik.handleSubmit}>
					<PaddedContainer>
						<FieldContainer>
							<FieldContainer>
								<div className='col-sm-4'>
									<label htmlFor='create-survey-question-name' className='form-label-sm required'>Survey Question Name</label>
								</div>
								<div className='col'>
									<input id='create-survey-question-name' type='text' className='form-control form-control-sm' aria-label='Question Name' value={nameField} onChange={handleNameFieldChange} />
								</div>
							</FieldContainer>
							<FieldContainer>
								<div className='col-sm-4'>
									<label htmlFor='create-survey-question-status' className='form-label-sm'>Survey Question Status</label>
								</div>
								<div className='col'>
									<select id='create-survey-question-status' className='form-select form-select-sm' aria-label='Select status' value={statusField} onChange={handleStatusChange}>
										{STATUS_OPTIONS.map((item) => (
											<option key={item.value.toString()} value={item.value.toString()}>
												{item.label}
											</option>
										))}
									</select>
								</div>
							</FieldContainer>
							<FieldContainer>
								<div className='col-sm-4'>
									<label htmlFor='create-survey-question-field-type' className='form-label-sm required'>Field Type</label>
								</div>
								<div className='col'>
									<select id='create-survey-question-field-type' className='form-select form-select-sm' aria-label='Select Field Type' value={fieldTypeField} onChange={handleFieldTypeChange}>
										{fieldTypesState?.map((item) => (
											<option key={item.id} value={item.id.toString()}>
												{item.fieldTypeName}
											</option>
										))}
									</select>
								</div>
							</FieldContainer>
						</FieldContainer>
					</PaddedContainer>
				</FormContainer>
			</Modal.Body>
			<Modal.Footer className='d-flex'>
				<SuccesLoaderButton  title={'Submit'} onClick={handleSaveChanges} loading={formik.isSubmitting} disabled={formik.isSubmitting} loadingTitle={'Please wait ...'}/>
				<DefaultSecondaryButton access={true} title={'Close'} onClick={handleClose}/>
			</Modal.Footer>
		</Modal>
	);
};

export default CreateSurveyQuestionModal;
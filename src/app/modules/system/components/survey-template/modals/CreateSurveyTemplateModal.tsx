import {useFormik} from 'formik';
import {Guid} from 'guid-typescript';
import React, {useEffect, useState} from 'react';
import { Modal} from 'react-bootstrap';
import {shallowEqual, useSelector} from 'react-redux';
import swal from 'sweetalert';
import * as Yup from 'yup';
import {RootState} from '../../../../../../setup';
import * as hubConnection from '../../../../../../setup/hub/MessagingHub';
import {PROMPT_MESSAGES} from '../../../../../constants/Constants';
import useConstant from '../../../../../constants/useConstant';
import {DefaultSecondaryButton, FieldContainer, FormContainer, PaddedContainer, SuccesLoaderButton} from '../../../../../custom-components';
import {CaseTypeModel, MessageTypeListResponse} from '../../../models';
import {SurveyTemplateModel} from '../../../models/SurveyTemplateModel';
import {SurveyTemplateRequestModel} from '../../../models/SurveyTemplateRequestModel';
import {GetSurveyTemplateByIdRequestModel} from '../../../models/requests/GetSurveyTemplateByIdRequestModel';
import {saveSurveyTemplate, saveSurveyTemplateResult} from '../../../redux/SystemService';
import {useSystemOptionHooks} from '../../../shared';
import {STATUS_OPTIONS} from '../../constants/SelectOptions';


type ModalProps = {
	isClone: boolean;
	surveyTemplate?: SurveyTemplateModel | null;
	modal: boolean;
	toggle: () => void;
	saveSurveyTemplate: () => void;
	caseTypeList: Array<CaseTypeModel>;
	messageTypeList: Array<MessageTypeListResponse>;
	surveyTemplateId: number;
};

const createSurveyQuestionSchema = Yup.object().shape({
	id: Yup.number(),
	name: Yup.string(),
	status: Yup.boolean(),
	description: Yup.string(),
	caseType: Yup.string(),
	messageType: Yup.string(),
	answers: Yup.array(),
	createdBy: Yup.number(),
});

const initialValues = {
	id: 1,
	name: '',
	status: true,
	description: '',
	caseType: '',
	messageType: '',
	createdBy: '',
};

const CreateSurveyTemplateModal: React.FC<ModalProps> = (props: ModalProps) => {
	// States
	const messagingHub = hubConnection.createHubConnenction();
	const userAccessId = useSelector<RootState>(({auth}) => auth.userId, shallowEqual) as number;
	const [nameField, setNameField] = useState<string>('');
	const [statusField, setStatusField] = useState<string>('true');
	const [descriptionField, setDescriptionField] = useState<string>('');
	const [caseTypeField, setCaseTypeField] = useState<string>('');
	const [messageTypeField, setMessageTypeField] = useState<string>('');
	const [title, setTitle] = useState<string>('');
	const [isLoading, setIsLoading] = useState<boolean>(false);

	const templateListState = useSelector<RootState>(({system}) => system.surveyTemplateList, shallowEqual) as SurveyTemplateRequestModel[];
	const {getSurveyTemplateInfo, surveyTemplateInfo} = useSystemOptionHooks();
	const {successResponse, SwalConfirmMessage} = useConstant();

	const saveSurveyTemplateResultCallback = (_cacheId: string, _queueId: string) => {
		saveSurveyTemplateResult(_cacheId)
			.then(() => {
				messagingHub.off(_queueId);
				saveNewSurveyTemplate();
			})
			.catch(() => {
				messagingHub.off(_queueId);
			});
	};

	async function validatCreateSurveyTemplateForm() {
		let isValid: boolean = true;

		// Validate fields
		if (nameField === '' || caseTypeField === '' || messageTypeField === '') {
			swal(PROMPT_MESSAGES.FailedValidationTitle, PROMPT_MESSAGES.FailedValidationMandatoryMessage, 'error').catch(() => {});
			isValid = false;
		}

		const index = templateListState?.findIndex((i) => i.surveyTemplateName.toLowerCase() === nameField.trim().toLowerCase());
		if (index > -1) {
			// Check if Template Name Already exist
			swal(PROMPT_MESSAGES.FailedValidationTitle, PROMPT_MESSAGES.FailedValidationDuplicateMessageCustom('Survey Template'), 'error').catch(() => {});
			isValid = false;
		}

		return isValid;
	}

	// Formik
	const formik = useFormik({
		initialValues,
		validationSchema: createSurveyQuestionSchema,
		onSubmit: async (values, {setSubmitting}) => {
			// Add additional fields
			values.name = nameField;
			values.description = descriptionField;
			values.status = statusField === 'true';
			values.caseType = caseTypeField;
			values.messageType = messageTypeField;
			values.createdBy = userAccessId.toString();

			let isValidate = await validatCreateSurveyTemplateForm();

			if (isValidate === true) {
				const surveyTemplateRequest: SurveyTemplateRequestModel = {
					surveyTemplateId: 0,
					surveyTemplateName: values.name,
					surveyTemplateStatus: values.status.toString() === 'true',
					surveyTemplateDescription: values.description,
					caseTypeId: +values.caseType,
					messageTypeId: +values.messageType,
					surveyTemplateQuestions:
						props.isClone && surveyTemplateInfo !== undefined ? surveyTemplateInfo.surveyTemplateQuestions : [],
					userId: userAccessId.toString(),
					queueId: Guid.create().toString(),
				};
				setIsLoading(true);
				messagingHub
					.start()
					.then(() => {
						saveSurveyTemplate(surveyTemplateRequest)
							.then((response) => {
								if (response.status === successResponse) {
									messagingHub.on(surveyTemplateRequest.queueId.toString(), (message) => {
										saveSurveyTemplateResultCallback(message.cacheId, surveyTemplateRequest.queueId.toString());
										setIsLoading(false);
									});
								}
							})
							.catch(() => {
								messagingHub.stop().catch(() => {});
								swal('Failed', 'Problem insaving Survey Template', 'error').catch(() => {});
								setIsLoading(false);
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
		} else {
			setTitle('Add Survey Template');
			if (props.caseTypeList !== undefined) {
				setCaseTypeField(props.caseTypeList[0].id.toString());
			}
			if (props.messageTypeList !== undefined) {
				setMessageTypeField(props.messageTypeList[0].messageTypeId !== undefined ? props.messageTypeList[0].messageTypeId.toString() : '0');
			}
			if (props.isClone) {
				if (props.surveyTemplate !== undefined && props.surveyTemplate !== null) {
					setCaseTypeField(props.surveyTemplate.caseTypeId.toString());
					setMessageTypeField(props.surveyTemplate.messageTypeId.toString());
					setTitle('Clone Survey Template');

					const request: GetSurveyTemplateByIdRequestModel = {
						surveyTemplateId: props.surveyTemplateId,
						userId: userAccessId.toString(),
						queueId: Guid.create().toString(),
					};

					setTimeout(() => {
						getSurveyTemplateInfo(request);
					}, 3000);
				}
			}
		}
	}, [props.modal]);

	// Methods
	const handleClose = () => {
		swal({
			title: 'Confirmation',
			text: 'Any changes will be discarded, please confirm',
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
			.then((confirmDiscardAction) => {
				if (confirmDiscardAction) {
					resetForm();
					props.toggle();
				}
			})
			.catch(() => {});
	};

	const saveNewSurveyTemplate = () => {
		resetForm();
		props.toggle();
		props.saveSurveyTemplate();
	};

	const handleSaveChanges = () => {
		swal({
			title: PROMPT_MESSAGES.ConfirmSubmitTitle,
			text: PROMPT_MESSAGES.ConfirmSubmitMessage('Survey Template'),
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
			.then((confirmSaveChanges) => {
				if (confirmSaveChanges) {
					formik.submitForm().catch(() => {});
				}
			})
			.catch(() => {});
	};

	const resetForm = () => {
		formik.resetForm();
		setNameField('');
		setDescriptionField('');
		setStatusField('true');
		setCaseTypeField('');
		setMessageTypeField('');
	};

	const handleNameChange = (event: any) => {
		setNameField(event.target.value);
	};

	const handleDescriptionChange = (event: any) => {
		setDescriptionField(event.target.value);
	};

	const handleStatusChange = (event: any) => {
		setStatusField(event.target.value);
	};

	const handleCaseTypeChange = (event: any) => {
		setCaseTypeField(event.target.value);
	};

	const handleMessageTypeChange = (event: any) => {
		setMessageTypeField(event.target.value);
	};

	return (
		<Modal show={props.modal} size={'lg'} onHide={handleClose} centered>
			<Modal.Header>
				<Modal.Title>{title}</Modal.Title>
			</Modal.Header>
			<Modal.Body>
				<FormContainer onSubmit={formik.handleSubmit}>
					<PaddedContainer>
						<FieldContainer>
							<FieldContainer>
								<div className='col-sm-4'>
									<label htmlFor='create-survey-template-name' className='form-label-sm required'>Survey Template Name</label>
								</div>
								<div className='col'>
									<input
										id='create-survey-template-name'
										type='text'
										className='form-control form-control-sm'
										aria-label='Template Name'
										value={nameField}
										onChange={handleNameChange}
									/>
								</div>
							</FieldContainer>
							<FieldContainer>
								<div className='col-sm-4'>
									<label htmlFor='create-survey-template-status' className='form-label-sm'>Survey Template Status</label>
								</div>
								<div className='col'>
									<select id='create-survey-template-status' className='form-select form-select-sm' aria-label='Select status' value={statusField} onChange={handleStatusChange}>
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
									<label htmlFor='create-survey-template-description' className='form-label-sm'>Survey Template Description</label>
								</div>
								<div className='col'>
									<textarea
										id='create-survey-template-description'
										className='form-control'
										aria-label='Description'
										rows={2}
										value={descriptionField}
										onChange={handleDescriptionChange}
									></textarea>
								</div>
							</FieldContainer>
							<FieldContainer>
								<div className='col-sm-4'>
									<label htmlFor='create-survey-template-case-type' className='form-label-sm required'>Case Type</label>
								</div>
								<div className='col'>
									<select
										id='create-survey-template-case-type'
										className='form-select form-select-sm'
										aria-label='Select Case Type'
										value={caseTypeField}
										onChange={handleCaseTypeChange}
										disabled={props.isClone}
									>
										{props.caseTypeList?.map((item) => (
											<option key={item.id.toString()} value={item.id.toString()}>
												{item.caseTypeName}
											</option>
										))}
									</select>
								</div>
							</FieldContainer>
							<FieldContainer>
								<div className='col-sm-4'>
									<label htmlFor='create-survey-template-message-type' className='form-label-sm required'>Message Type</label>
								</div>
								<div className='col'>
									<select
										id='create-survey-template-message-type'
										className='form-select form-select-sm'
										aria-label='Select Message Type'
										value={messageTypeField}
										onChange={handleMessageTypeChange}
										disabled={props.isClone}
									>
										{props.messageTypeList.map((item) => (
											<option key={item.messageTypeId?.toString()} value={item.messageTypeId?.toString() ?? '0'}>
												{item.messageTypeName}
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
				
				<SuccesLoaderButton onClick={handleSaveChanges} title={'Submit'} loading={formik.isSubmitting || isLoading} disabled={formik.isSubmitting || isLoading} loadingTitle={'Please wait ...'}/>
				<DefaultSecondaryButton access={true} title={'Close'} onClick={handleClose}/>
			</Modal.Footer>
		</Modal>
	);
};

export default CreateSurveyTemplateModal;
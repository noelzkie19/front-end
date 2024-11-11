import {useFormik} from 'formik';
import React, {useEffect, useState} from 'react';
import {Button, Modal} from 'react-bootstrap';
import {shallowEqual, useSelector} from 'react-redux';
import Select from 'react-select';
import swal from 'sweetalert';
import * as Yup from 'yup';
import {RootState} from '../../../../../../setup';
import {PROMPT_MESSAGES} from '../../../../../constants/Constants';
import useConstant from '../../../../../constants/useConstant';
import {FieldContainer, FormContainer} from '../../../../../custom-components';
import {SurveyQuestionModel} from '../../../models/SurveyQuestionModel';
import {SurveyTemplateQuestionModel} from '../../../models/SurveyTemplateQuestionModel';

type ModalProps = {
	modal: boolean;
	toggle: () => void;
	saveQuestion: (val: SurveyTemplateQuestionModel) => void;
};

const mandatoryOptions = [
	{value: '', label: '-'},
	{value: '1', label: 'Yes'},
	{value: '0', label: 'No'},
];

const createSurveyTemplateQuestionSchema = Yup.object().shape({
	name: Yup.string(),
	mandatory: Yup.boolean(),
});

const initialValues = {
	id: 0,
	orderNo: 0,
	question: '',
	mandatory: '1',
};

const CreateTemplateQuestionModal: React.FC<ModalProps> = (props: ModalProps) => {
	// States
	const [surveyQuestion, setSurveyQuestion] = useState<SurveyQuestionModel>();

	const [questionName, setQuestionName] = useState<any>();
	const [mandatory, setMandatory] = useState<any>();
	const questionListState = useSelector<RootState>(({system}) => system.surveyQuestionList, shallowEqual) as SurveyQuestionModel[];
	const templateQuestionsListState = useSelector<RootState>(({system}) => system.templateQuestions, shallowEqual) as SurveyTemplateQuestionModel[];
	const { SwalConfirmMessage} = useConstant();
	// Formik
	const formik = useFormik({
		initialValues,
		validationSchema: createSurveyTemplateQuestionSchema,
		onSubmit: (_values, {setSubmitting, resetForm}) => {
			//Validate
			let isValid: boolean = true;
			if (surveyQuestion === undefined || mandatory === undefined || mandatory === '' || mandatory === null) {
				swal(PROMPT_MESSAGES.FailedValidationTitle, PROMPT_MESSAGES.FailedValidationMandatoryMessage, 'error').catch(() => {});
				setSubmitting(false);
				isValid = false;
			}

			const dupCheck = templateQuestionsListState.find((i) => i.surveyQuestionId === surveyQuestion?.surveyQuestionId);
			if (dupCheck) {
				swal(PROMPT_MESSAGES.FailedValidationTitle, 'Value already exists, please use the search filter to find them', 'error').catch(() => {});
				setSubmitting(false);
				isValid = false;
			}

			if (isValid === true) {
				const newQuestion: SurveyTemplateQuestionModel = {
					id: 0,
					orderNo: 0,
					surveyTemplateId: 0,
					surveyQuestionId: surveyQuestion !== undefined ? surveyQuestion.surveyQuestionId : 0,
					surveyQuestionName: surveyQuestion === undefined ? '' : surveyQuestion.surveyQuestionName,
					question: surveyQuestion,
					isMandatory: mandatory.value === '1',
					surveyQuestionFieldTypeName: surveyQuestion === undefined ? '' : surveyQuestion.surveyQuestionName,
					status: true,
					surveyQuestionStatus: true,
					surveyQuestionUpdatedBy: '',
					surveyQuestionUpdatedDate: '',
				};
				setSubmitting(false);
				setSurveyQuestion(undefined);
				resetForm({});
				props.saveQuestion(newQuestion);
			}
		},
		onReset: () => {
			setQuestionName(null);
			setMandatory(null);
		},
	});

	// Effects
	useEffect(() => {
		if (!props.modal) {
			formik.resetForm();
			setSurveyQuestion(undefined);
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
			.then((confirmCloseAction) => {
				if (confirmCloseAction) {
					formik.resetForm();
					props.toggle();
				}
			})
			.catch(() => {});
	};

	const handleSaveChanges = () => {
		formik.submitForm().catch(() => {});
	};

	const questionSearchOnChange = (data: any) => {
		setQuestionName(data);
		const item = questionListState.find((i) => i.surveyQuestionId === data.value);
		if (item !== undefined) {
			console.log('Selected Survey Question', item);
			setSurveyQuestion(item);
		}
	};

	const handleMandatoryOnChange = (data: any) => {
		setMandatory(data);
	};
	return (
		<Modal show={props.modal} size={'lg'} onHide={handleClose} centered>
			<Modal.Header>
				<Modal.Title>Add Survey Question</Modal.Title>
			</Modal.Header>
			<Modal.Body>
				<FormContainer onSubmit={formik.handleSubmit}>
					<FieldContainer>
						<FieldContainer>
							<div className='col-sm-4'>
								<label htmlFor='create-template-question-name' className='form-label-sm required'>Survey Question Name</label>
							</div>
							<div className='col-sm-8'>
								<Select
									id='create-template-question-name'
									style={{width: '100%'}}
									isDisabled={false}
									options={questionListState?.map((i) => {
										return {
											label: i.surveyQuestionName,
											value: i.surveyQuestionId,
										};
									})}
									onChange={questionSearchOnChange}
									value={questionName}
								/>
							</div>
						</FieldContainer>
						<FieldContainer>
							<div className='col-sm-4'>
								<label htmlFor='create-template-mandatory-question' className='form-label-sm required'>Mandatory Question</label>
							</div>
							<div className='col'>
								<Select id='create-template-mandatory-question' style={{width: '100%'}} isDisabled={false} options={mandatoryOptions} onChange={handleMandatoryOnChange} value={mandatory} />
							</div>
						</FieldContainer>
					</FieldContainer>
				</FormContainer>
			</Modal.Body>
			<Modal.Footer className='d-flex'>
				<Button disabled={formik.isSubmitting} className='btn btn-primary btn-sm me-2' variant='primary' onClick={handleSaveChanges}>
					Submit
				</Button>
				<Button variant='secondary' className='btn btn-secondary btn-sm me-2' onClick={handleClose}>
					Close
				</Button>
			</Modal.Footer>
		</Modal>
	);
};

export default CreateTemplateQuestionModal;
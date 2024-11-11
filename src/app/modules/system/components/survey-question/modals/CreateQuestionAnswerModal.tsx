import {useFormik} from 'formik';
import React, {useEffect} from 'react';
import {Modal} from 'react-bootstrap';
import {shallowEqual, useSelector} from 'react-redux';
import swal from 'sweetalert';
import * as Yup from 'yup';
import {RootState} from '../../../../../../setup';
import {PROMPT_MESSAGES} from '../../../../../constants/Constants';
import useConstant from '../../../../../constants/useConstant';
import {DefaultSecondaryButton, FieldContainer, FormContainer, PaddedContainer, SuccesLoaderButton} from '../../../../../custom-components';
import {SurveyQuestionAnswerModel} from '../../../models/SurveyQuestionAnswerModel';

type ModalProps = {
	answer?: SurveyQuestionAnswerModel | null;
	modal: boolean;
	toggle: () => void;
	saveAnswer: (val: SurveyQuestionAnswerModel) => void;
};

const statusOptions = [
	{value: '', label: ''},
	{value: '1', label: 'Active'},
	{value: '0', label: 'Inactive'},
];

const activeStatus = '1';

const createSurveyQuestionAnswerSchema = Yup.object().shape({
	name: Yup.string(),
	status: Yup.boolean(),
});

const initialValues = {
	id: 0,
	orderNo: 0,
	name: '',
	status: '1',
};

const CreateQuestionAnswerModal: React.FC<ModalProps> = (props: ModalProps) => {
	// States
	const answerListState = useSelector<RootState>(({system}) => system.questionAnswers, shallowEqual) as SurveyQuestionAnswerModel[];
	const { SwalConfirmMessage } = useConstant();
	// Effects
	useEffect(() => {
		if (!props.modal) {
			formik.resetForm();
		}
	}, [props.modal]);

	// Formik
	const formik = useFormik({
		initialValues,
		validationSchema: createSurveyQuestionAnswerSchema,
		onSubmit: (values, {setSubmitting, resetForm}) => {
			//Validate
			let isValid: boolean = true;

			if (values.name === '' || values.status === '') {
				swal(PROMPT_MESSAGES.FailedValidationTitle, PROMPT_MESSAGES.FailedValidationMandatoryMessage, 'error').catch(() => {});
				setSubmitting(false);
				isValid = false;
			}

			const duplicateIndex = answerListState.findIndex((i) => i.name.toLowerCase() === values.name.trim().toLowerCase());
			if (duplicateIndex > -1) {
				swal(PROMPT_MESSAGES.FailedValidationTitle, 'Value already exists, please use the search filter to find them', 'error').catch(() => {});

				setSubmitting(false);
				isValid = false;
			}

			if (isValid === true) {
				const newAnswer: SurveyQuestionAnswerModel = {
					id: 0,
					orderNo: 0,
					questionId: 0,
					name: values.name,
					status: values.status === activeStatus,
				};
				setSubmitting(false);
				resetForm({});
				props.saveAnswer(newAnswer);
			}
		},
	});

	// Methods
	const handleClose = () => {
		swal({
			title: PROMPT_MESSAGES.ConfirmCloseTitle,
			text: PROMPT_MESSAGES.ConfirmCloseMessage,
			dangerMode: true,
			icon: SwalConfirmMessage.icon,
			buttons: [SwalConfirmMessage.btnNo, SwalConfirmMessage.btnYes],
		})
			.then((willClose) => {
				if (willClose) {
					formik.resetForm();
					props.toggle();
				}
			})
			.catch(() => {});
	};

	const handleSaveChanges = () => {
		formik.submitForm().catch(() => {});
	};

	return (
		<Modal show={props.modal} size={'lg'}  onHide={handleClose} centered>
			<Modal.Header>
				<Modal.Title>Add Survey Answer</Modal.Title>
			</Modal.Header>
			<Modal.Body>
				<FormContainer onSubmit={formik.handleSubmit}>
					<PaddedContainer>
						<div className='row mb-3 w-100'>
							<FieldContainer>
								<div className='col-sm-4'>
									<label htmlFor='create-survey-answer-name' className='form-label-sm required'>Survey Answer Name</label>
								</div>
								<div className='col-sm-8'>
									<input id='create-survey-answer-name' type='text' className='form-control form-control-sm' aria-label='Question Name' {...formik.getFieldProps('name')} />
								</div>
							</FieldContainer>

							<FieldContainer>
								<div className='col-sm-4'>
									<label htmlFor='create-survey-answer-status' className='form-label-sm'>Survey Answer Status</label>
								</div>
								<div className='col-sm-8'>
									<select id='create-survey-answer-status' className='form-select form-select-sm' aria-label='Select status' {...formik.getFieldProps('status')}>
										{statusOptions.map((item) => (
											<option key={item.value} value={item.value}>
												{item.label}
											</option>
										))}
									</select>
								</div>
							</FieldContainer>
						</div>
					</PaddedContainer>
				</FormContainer>
			</Modal.Body>
			<Modal.Footer className='d-flex'>
				<SuccesLoaderButton  title={'Submit'} onClick={handleSaveChanges}  disabled={formik.isSubmitting} loadingTitle={'Please wait ...'} loading={formik.isSubmitting}/>
				<DefaultSecondaryButton title={'Close'} access={true} onClick={handleClose}/>
			</Modal.Footer>
		</Modal>
	);
};

export default CreateQuestionAnswerModal;
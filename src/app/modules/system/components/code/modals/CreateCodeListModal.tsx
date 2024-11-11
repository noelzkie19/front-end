import {HubConnection} from '@microsoft/signalr';
import {AxiosResponse} from 'axios';
import {useFormik} from 'formik';
import {Guid} from 'guid-typescript';
import React, {useEffect, useState} from 'react';
import {Button, Modal} from 'react-bootstrap';
import {shallowEqual, useSelector} from 'react-redux';
import Select from 'react-select';
import swal from 'sweetalert';
import * as Yup from 'yup';
import {RootState} from '../../../../../../setup';
import * as hubConnection from '../../../../../../setup/hub/MessagingHub';
import {PROMPT_MESSAGES} from '../../../../../constants/Constants';
import useConstant from '../../../../../constants/useConstant';
import {FieldContainer, FormContainer, PaddedContainer} from '../../../../../custom-components';
import {disableSplashScreen} from '../../../../../utils/helper';
import {CodeListInfoModel} from '../../../models/CodeListInfoModel';
import {SelectOptionModel} from '../../../models/SelectOptionModel';
import {addCodeList, addCodeListResult} from '../../../redux/SystemService';
import {STATUS_OPTIONS} from '../../constants/SelectOptions';

type ModalProps = {
	modal: boolean;
	codeList: Array<SelectOptionModel>;
	codeListTypes: Array<SelectOptionModel>;
	fieldTypes: Array<SelectOptionModel>;
	toggle: () => void;
	saveCodeList: () => void;
};

const createSurveyQuestionAnswerSchema = Yup.object().shape({
	name: Yup.string(),
	status: Yup.boolean(),
	fieldType: Yup.string(),
	codeListType: Yup.string(),
	parent: Yup.string(),
});

const initialValues = {
	id: 0,
	name: '',
	status: 'true',
	fieldType: '1',
	codeListType: '1',
	parent: '',
};

const CreateCodeListModal: React.FC<ModalProps> = (props: ModalProps) => {
	// States
	const messagingHub = hubConnection.createHubConnenction();
	const userAccessId = useSelector<RootState>(({auth}) => auth.userId, shallowEqual) as number;
	const [loading, setLoading] = useState(false);

	const [statusField, setStatusField] = useState(STATUS_OPTIONS[0]);
	const [fieldTypeField, setFieldTypeField] = useState<SelectOptionModel>();
	const [codeListTypeField, setCodeListTypeField] = useState<SelectOptionModel>();
	const [parentField, setParentField] = useState<SelectOptionModel | null>(null);
	const {successResponse, HubConnected, SwalConfirmMessage} = useConstant();

	async function createAddCodeListRequest (values: any) {
		let newCodeList: CodeListInfoModel = {
			id: 0,
			codeListName: values.name,
			isActive: statusField.value,
			fieldTypeId: fieldTypeField !== undefined ? fieldTypeField.value : 0,
			codeListTypeId: codeListTypeField !== undefined ? codeListTypeField.value : 0,
			createdBy: 1,
			parentId: null,
			userId: userAccessId.toString(),
			queueId: Guid.create().toString(),
		};

		if (parentField !== undefined && parentField !== null && parentField.value !== 0) {
			newCodeList.parentId = parentField.value;
		}

		return newCodeList;
	}
	
	const processAddCodeListReturn = (messagingHub: HubConnection, response: AxiosResponse<any>, newCodeList: CodeListInfoModel) => {
		if (response.status === successResponse) {
			messagingHub.on(newCodeList.queueId.toString(), (message) => {
				addCodeListResult(message.cacheId).then((response) => {
					if (response.status !== successResponse) {
						swal('Failed', { icon: 'error' });
						setLoading(false);
					} else {
						formik.resetForm();
					}
					messagingHub.off(newCodeList.queueId.toString());
					messagingHub.stop();
					props.saveCodeList();
				});
			});
		} else {
			swal('Failed', response.data.message, 'error');
		}
	}

	// Formik
	const formik = useFormik({
		initialValues,
		validationSchema: createSurveyQuestionAnswerSchema,
		onSubmit: async (values, { setSubmitting, resetForm }) => {
			if (_validateCodeListModal() === true) {
				const newCodeList = await createAddCodeListRequest(values);
				setLoading(true);
				setTimeout(() => {
					messagingHub
						.start()
						.then(() => {
							if (messagingHub.state === HubConnected) {
								addCodeList(newCodeList).then((response) => {
									processAddCodeListReturn(messagingHub, response, newCodeList)
								});
							} else {
								swal('Failed', 'Problem connecting to the server, Please refresh', 'error');
							}
						})
						.catch((err) => console.log('Error while starting connection: ' + err))
						.finally(() => {
							setLoading(false);
							disableSplashScreen();
						});
				}, 1000);
			}
			setSubmitting(false);
		},
	});

	// // -----------------------------------------------------------------
	// // EFFECTS
	// // -----------------------------------------------------------------

	useEffect(() => {
		if (!props.modal) {
			formik.resetForm();
		}
	}, [props.modal]);

	// // -----------------------------------------------------------------
	// // METHODS
	// // -----------------------------------------------------------------
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
				},confirm: {
					text: SwalConfirmMessage.btnYes,
					value: true,
					visible: true,
				},
			},
			dangerMode: true,
		}).then((willCreate) => {
			if (willCreate) {
				formik.resetForm();
				props.toggle();
			}
		});
	};
	const handleSaveChanges = () => {
		formik.submitForm();
	};
	const handleStatusOnChange = (val: any) => {
		console.log(statusField);
		console.log(val);
		setStatusField(val);
	};
	const handleFieldTypeOnChange = (val: any) => {
		setFieldTypeField(val);
	};
	const handleCodeListTypeOnChange = (val: any) => {
		setCodeListTypeField(val);
	};
	const handleParentOnChange = (val: any) => {
		setParentField(val);
	};

	const _validateCodeListModal = () => {
		let isValid: boolean = true;

		if (formik.values.name === '' || fieldTypeField === undefined || codeListTypeField === undefined) {
			swal(PROMPT_MESSAGES.FailedValidationTitle, PROMPT_MESSAGES.FailedValidationMandatoryMessage, 'error');
			isValid = false;
		}

		if (props.codeList.find((i) => i.label.toLowerCase() === formik.values.name.toLowerCase()) !== undefined) {
			swal(PROMPT_MESSAGES.FailedValidationTitle, PROMPT_MESSAGES.FailedValidationDuplicateMessageCustom('Code List'), 'error');
			isValid = false;
		}

		return isValid;
	}

	// --------------------------------------------------------
	return (
		<Modal show={props.modal} size={'lg'} onHide={handleClose}>
			<Modal.Header>
				<Modal.Title>Add Code List</Modal.Title>
			</Modal.Header>
			<Modal.Body>
				<FormContainer onSubmit={formik.handleSubmit}>
					<PaddedContainer>
						<FieldContainer>
							<FieldContainer>
								<div className='col-sm-4'>
									<label htmlFor='codelist-name' className='form-label-sm'>Code List Name</label>
								</div>
								<div className='col'>
									<input id='codelist-name' type='text' className='form-control' aria-label='Code List Name' {...formik.getFieldProps('name')} />
								</div>
							</FieldContainer>

							<FieldContainer>
								<div className='col-sm-4'>
									<label htmlFor='codelist-status' className='form-label-sm'>Code List Status</label>
								</div>
								<div className='col'>
									<Select id='codelist-status' {...formik.getFieldProps('status')} options={STATUS_OPTIONS} onChange={handleStatusOnChange} value={statusField} />
								</div>
							</FieldContainer>

							<FieldContainer>
								<div className='col-sm-4'>
									<label htmlFor='field-type' className='form-label-sm'>Field Type</label>
								</div>
								<div className='col'>
									<Select
										id='field-type'
										{...formik.getFieldProps('fieldType')}
										options={props.fieldTypes}
										onChange={handleFieldTypeOnChange}
										value={fieldTypeField}
										placeholder='Select...'
										aria-labelledby='aria-label'
									/>
								</div>
							</FieldContainer>

							<FieldContainer>
								<div className='col-sm-4'>
									<label htmlFor='codelist-type' className='form-label-sm'>Code List Type</label>
								</div>
								<div className='col'>
									<Select
										id='codelist-type'
										{...formik.getFieldProps('codeListType')}
										options={props.codeListTypes}
										onChange={handleCodeListTypeOnChange}
										value={codeListTypeField}
										placeholder='Select...'
										aria-labelledby='aria-label'
									/>
								</div>
							</FieldContainer>

							<FieldContainer>
								<div className='col-sm-4'>
									<label htmlFor='codelist-parent' className='form-label-sm'>Parent</label>
								</div>
								<div className='col'>
									<Select id='codelist-parent' {...formik.getFieldProps('parent')} options={props.codeList} onChange={handleParentOnChange} value={parentField} />
								</div>
							</FieldContainer>
						</FieldContainer>
					</PaddedContainer>
				</FormContainer>
			</Modal.Body>
			<Modal.Footer className='d-flex justify-content-start'>
				<Button variant='secondary' onClick={handleClose}>
					Close
				</Button>
				<Button disabled={formik.isSubmitting || loading} variant='primary' onClick={handleSaveChanges}>
					Submit
				</Button>
			</Modal.Footer>
		</Modal>
	);
};

export default CreateCodeListModal;
import {useFormik} from 'formik';
import {Guid} from 'guid-typescript';
import {useEffect, useState} from 'react';
import {Col, Container, ModalFooter, Row} from 'react-bootstrap-v5';
import {shallowEqual, useSelector} from 'react-redux';
import swal from 'sweetalert';
import * as Yup from 'yup';
import {RootState} from '../../../../../setup';
import * as hubConnection from '../../../../../setup/hub/MessagingHub';
import {ElementStyle, PROMPT_MESSAGES} from '../../../../constants/Constants';
import useConstant from '../../../../constants/useConstant';
import {FormContainer, FormModal, LoaderButton, MlabButton} from '../../../../custom-components';
import {IAuthState} from '../../../auth';
import {SwalDetails} from '../../../system/components/constants/CampaignSetting';
import {UpsertChatSurveyActionAndSummaryRequestModel} from '../../models';
import {UpsertChatSurveyActionAndSummary} from '../../services/CustomerCaseApi';

interface Props {
	chatSurveyId: number;
	showForm: boolean;
	closeModal: () => void;
	addActionUpdate: (actionStatement: string, communicationId: number) => void;
	communicationId: number;
}
const initialValues = {
	chatSurveyId: 0,
	action: '',
	summary: '',
};
const FormSchema = Yup.object().shape({
	name: Yup.string(),
});
const AddSummaryAndActionModal: React.FC<Props> = ({chatSurveyId, showForm, closeModal, communicationId, addActionUpdate}) => {
	/**
	 *  ? Redux
	 */
	const {userId} = useSelector<RootState>(({auth}) => auth, shallowEqual) as IAuthState;
	/**
	 *  ? States
	 */
	const [loading, setLoading] = useState<boolean>(false);
	const [action, setAction] = useState<string>('');
	const [summary, setSummary] = useState<string>('');
	const {HubConnected, SwalConfirmMessage, SwalFailedMessage, SwalSuccessMessage, successResponse, SwalServerErrorMessage} = useConstant();

	/**
	 *  ? Methods
	 */
	const onCloseModal = () => {
		swal({
			title: PROMPT_MESSAGES.ConfirmCloseTitle,
			text: PROMPT_MESSAGES.ConfirmCloseMessage,
			icon: 'warning',
			buttons: ['No', 'Yes'],
			dangerMode: true,
		}).then((toConfirm) => {
			if (toConfirm) {
				closeModal();
			}
		});
	};
	const onChangeAction = (val: string | any) => {
		setAction(val.target.value);
	};
	const onChangeSummary = (val: string | any) => {
		setSummary(val.target.value);
	};
	/**
	 *  ? Mounted
	 */
	useEffect(() => {
		if (showForm) {
			clearFields();
		}
	}, [showForm]);
	const isValid = () => {
		let isValid = true;

		if (!action || action === '' || action === undefined) {
			return false;
		}
		if (!summary || summary === '' || summary === undefined) {
			return false;
		}
		return isValid;
	};
	const onSubmit = () => {
		setTimeout(() => {
			setLoading(true);
			const messagingHub = hubConnection.createHubConnenction();
			messagingHub
				.start()
				.then(() => {
					if (messagingHub.state === HubConnected) {
						const request: UpsertChatSurveyActionAndSummaryRequestModel = {
							queueId: Guid.create().toString(),
							userId: userId?.toString() || '0',
							chatSurveyId: chatSurveyId,
							action: action,
							summary: summary,
						};

						UpsertChatSurveyActionAndSummary(request)
							.then((response) => {
								if (response.status === successResponse) {
									messagingHub.on(request.queueId.toString(), (message) => {
										let resultData = JSON.parse(message.remarks);
										if (resultData.Status === successResponse) {
											swal(SwalSuccessMessage.title, SwalSuccessMessage.textSuccess, SwalSuccessMessage.icon);
											setLoading(false);
											addActionUpdate(action, communicationId)
											closeModal();
										} else {
											swal(SwalServerErrorMessage.title, SwalServerErrorMessage.textError, SwalServerErrorMessage.icon);
										}

										messagingHub.off(request.queueId.toString());
										messagingHub.stop();
									});

									setTimeout(() => {
										if (messagingHub.state === HubConnected) {
											messagingHub.stop();
										}
									}, 30000);
								} else {
									messagingHub.stop();
									swal('Failed', response.data.message, 'error');
								}
							})
							.catch(() => {
								messagingHub.stop();
								swal('Failed', 'Problem in adding subtopic details', 'error');
							});
					}
				})
				.catch((err) => console.log('Error while starting connection: ' + err));
		}, 1000);
	};
	const clearFields = () => {
		setAction('');
		setSummary('');
	};
	const formik = useFormik({
		initialValues,
		validationSchema: FormSchema,
		onSubmit: async (values, {setStatus, setSubmitting, resetForm}) => {
			if (!isValid()) {
				swal(PROMPT_MESSAGES.FailedValidationTitle, PROMPT_MESSAGES.FailedValidationMandatoryMessage, SwalDetails.ErrorIcon);
			} else {
				swal({
					title: PROMPT_MESSAGES.ConfirmSubmitTitle,
					text: PROMPT_MESSAGES.ConfirmSubmitMessageAdd,
					icon: SwalConfirmMessage.icon,
					buttons: [SwalConfirmMessage.btnNo, SwalConfirmMessage.btnYes],
					dangerMode: true,
				}).then((onConfirm) => {
					if (onConfirm) {
						onSubmit();
					} else {
						setSubmitting(false);
						setLoading(false);
					}
				});
			}
		},
	});
	return (
		<FormModal headerTitle='Add Summary and Action' haveFooter={false} show={showForm}>
			<FormContainer onSubmit={formik.handleSubmit}>
				<Container>
					<Row style={{marginTop: 10}}>
						<Col sm={12}>
							<label className='form-label-sm'>Communication ID: {communicationId}</label>
						</Col>
					</Row>
					<Row style={{marginTop: 10}}>
						<Col sm={12}>
							<label className='form-label-sm required'>Summary</label>
							<input type='text' className='form-control form-control-sm' aria-label='Summary' value={summary} onChange={onChangeSummary} />
						</Col>
					</Row>
					<Row style={{marginTop: 20}}>
						<Col sm={12}>
							<label className='form-label-sm required'>Action</label>
							<input type='text' className='form-control form-control-sm' aria-label='Action' value={action} onChange={onChangeAction} />
						</Col>
					</Row>
				</Container>
				<ModalFooter style={{border: 0}}>
					<LoaderButton access={true} loading={loading} title={'Submit'} loadingTitle={' Please wait... '} disabled={loading} />
					<MlabButton
						access={true}
						size={'sm'}
						label={'Close'}
						additionalClassStyle={{marginRight: 0}}
						style={ElementStyle.secondary}
						type={'button'}
						weight={'solid'}
						loading={loading}
						loadingTitle={'Please wait...'}
						disabled={loading}
						onClick={() => {
							onCloseModal();
						}}
					/>
				</ModalFooter>
			</FormContainer>
		</FormModal>
	);
};
export default AddSummaryAndActionModal;

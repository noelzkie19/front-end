import {useFormik} from 'formik';
import {FormContainer, FormModal, LoaderButton, MlabButton} from '../../../../custom-components';
import * as Yup from 'yup';
import {Col, Container, ModalFooter, Row} from 'react-bootstrap-v5';
import {ElementStyle, HttpStatusCodeEnum, PROMPT_MESSAGES} from '../../../../constants/Constants';
import {useEffect, useState} from 'react';
import swal from 'sweetalert';
import * as hubConnection from '../../../../../setup/hub/MessagingHub';
import {Guid} from 'guid-typescript';
import {
	ChatSurveyActionAndSummaryGetByIdRequestModel,
	GetChatSurveyByIdResultResponse,
	UpsertChatSurveyActionAndSummaryRequestModel,
	UpsertChatSurveyActionAndSummaryResponseModel,
} from '../../models';
import {shallowEqual, useSelector} from 'react-redux';
import {RootState} from '../../../../../setup';
import {IAuthState} from '../../../auth';
import {GetChatSurveyByIdAsync, GetChatSurveyByIdResultAsync, UpsertChatSurveyActionAndSummary} from '../../services/CustomerCaseApi';
import useConstant from '../../../../constants/useConstant';
import {SwalDetails} from '../../../system/components/constants/CampaignSetting';

interface Props {
	chatSurveyId: number;
	showForm: boolean;
	closeModal: () => void;
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
const EditSummaryAndActionModal: React.FC<Props> = ({chatSurveyId, showForm, closeModal, communicationId}) => {
	/**
	 *  ? Redux
	 */
	const {access, userId} = useSelector<RootState>(({auth}) => auth, shallowEqual) as IAuthState;

	/**
	 *  ? States
	 */
	const [loading, setLoading] = useState<boolean>(false);
	const [action, setAction] = useState<string>('');
	const [summary, setSummary] = useState<string>('');
	const [createdBy, setCreatedBy] = useState<string>('');
	const [updatedBy, setUpdatedBy] = useState<string>('');
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
		// if (skillModelUDT) {
		// 	skillModelUDT.licenseId = val.target.value;
		// 	setSkillModelUDT(skillModelUDT);
		// }

		setAction(val.target.value);
	};
	const onChangeSummary = (val: string | any) => {
		// if (skillModelUDT) {
		// 	skillModelUDT.licenseId = val.target.value;
		// 	setSkillModelUDT(skillModelUDT);
		// }

		setSummary(val.target.value);
	};
	const onButtonClick = () => {};
	/**
	 *  ? Mounted
	 */
	useEffect(() => {
		if (showForm) {
			setLoading(true);
			clearFields();
			const request: ChatSurveyActionAndSummaryGetByIdRequestModel = {
				queueId: Guid.create().toString(),
				userId: userId?.toString() || '0',
				chatSurveyId: chatSurveyId,
			};

			setTimeout(() => {
				const messagingHub = hubConnection.createHubConnenction();
				messagingHub.start().then(() => {
					if (messagingHub.state === HubConnected) {
						GetChatSurveyByIdAsync(request)
							.then((response) => {
								if (response.status === HttpStatusCodeEnum.Ok) {
									messagingHub.on(request.queueId.toString(), (message) => {
										GetChatSurveyByIdResultAsync(message.cacheId)
											.then((data) => {
												let resultData = Object.assign({} as GetChatSurveyByIdResultResponse, data.data[0]);
												setAction(resultData.Action);
												setSummary(resultData.Summary);
												setCreatedBy(resultData.CreatedBy);
												setUpdatedBy(resultData.UpdatedBy);
												messagingHub.off(request.queueId.toString());
												messagingHub.stop();
												setLoading(false);
											})
											.catch(() => {
												setLoading(false);
											});
									});
									setTimeout(() => {
										if (messagingHub.state === HubConnected) {
											messagingHub.stop();
										}
									}, 30000);
								} else {
									messagingHub.stop();
								}
							})
							.catch(() => {
								swal('Failed', 'Problem in getting GetChatSurveyByIdAsync', 'error');
								//setIsLoadingFirstFilter(false);
							});
					}
				});
			}, 1000);
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
		setLoading(true);
		setTimeout(() => {
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
					text: PROMPT_MESSAGES.ConfirmSubmitMessageEdit,
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
		<FormModal headerTitle='Edit Summary and Action' haveFooter={false} show={showForm}>
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
					<Row style={{marginTop: 10}}>
						<Col sm={6}>
							<label className='form-label-sm'>Created By: {createdBy}</label>
						</Col>
						<Col sm={6}>
							<label className='form-label-sm'>Updated By: {updatedBy}</label>
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
export default EditSummaryAndActionModal;

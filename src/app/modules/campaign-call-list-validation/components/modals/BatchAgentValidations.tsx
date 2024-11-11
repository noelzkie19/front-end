import {useFormik} from 'formik';
import {Guid} from 'guid-typescript';
import React, {useEffect, useState} from 'react';
import {Button, Modal} from 'react-bootstrap';
import {shallowEqual, useSelector} from 'react-redux';
import Select from 'react-select';
import swal from 'sweetalert';
import {RootState} from '../../../../../setup';
import * as hubConnection from '../../../../../setup/hub/MessagingHub';
import {ElementStyle, PROMPT_MESSAGES} from '../../../../constants/Constants';

//MODELS
import {AgentValidationsRequestModel} from '../../models/request/AgentValidationsRequestModel';
import {AgentValidationsResponseModel} from '../../models/response/AgentValidationsResponseModel';
import {CallValidationResponseModel} from '../../models/response/CallValidationResponseModel';

//SERVICES
import useConstant from '../../../../constants/useConstant';
import {MlabButton} from '../../../../custom-components';
import {upsertAgentValidation} from '../../redux/CallListValidationService';

type ModalProps = {
	modal: boolean;
	toggle: () => void;
	batchCampaignPlayerIds: Array<number>;
	selectedAgentValidationDetail: Array<AgentValidationsResponseModel>;
	currentData: Array<CallValidationResponseModel>;
};


const initialValues = {
	agentValidationNotes: '',
};

const optionsDefault = [
	{value: '1', label: 'Valid'},
	{value: '0', label: 'Invalid'},
];

const BatchAgentValidations: React.FC<ModalProps> = (props: ModalProps) => {
	//REDUX
	const userAccessId = useSelector<RootState>(({auth}) => auth.userId, shallowEqual) as number;

	// STATES
	const [isLoaded, setLoaded] = useState<boolean>(false);
	const [loading, setLoading] = useState<boolean>(false);
	const [selectedValidationStatus, setSelectedValidationStatus] = useState<string>('');
	const [hasErrors, setHasErrors] = useState<boolean>(false);
	const [errorMessage, setErrorMessage] = useState<string>('');
	const [previousBatchCampaignPlayerIds, setPreviousBatchCampaignPlayerIds] = useState<Array<number>>([]);
	const [hasChanged, setHasChanged] = useState<boolean>(false);

	//CONSTANTS
	const {HubConnected, successResponse, SwalConfirmMessage, SwalSuccessRecordMessage, SwalFailedMessage, SwalServerErrorMessage, AgentValidationsMessage} = useConstant();

	//METHODS
	function onChangeSelectedValidationStatus(val: any) {
		setSelectedValidationStatus(val);
		setHasChanged(true);
	}

	// FORMIK FORM POST
	const formik = useFormik({
		initialValues,
		onSubmit: async (values, {setStatus, setSubmitting, resetForm}) => {
			setLoading(true);
			setSubmitting(true);

			if (selectedValidationStatus === '') {
				swal(SwalFailedMessage.title, SwalFailedMessage.textMandatory, SwalFailedMessage.icon);
				setLoading(false);
				setSubmitting(false);
				return;
			}

			swal({
				title: SwalConfirmMessage.title,
				text: SwalConfirmMessage.textRecordValidated,
				icon: SwalConfirmMessage.icon,
				buttons: [SwalConfirmMessage.btnNo, SwalConfirmMessage.btnYes],
				dangerMode: true,
			})
				.then((onConfirm) => {
					if (onConfirm) {
						const messagingHub = hubConnection.createHubConnenction();

						messagingHub
							.start()
							.then(() => {
								if (messagingHub.state === HubConnected) {
									let request = new Array<AgentValidationsRequestModel>();
									let validationStatus = JSON.parse(JSON.stringify(selectedValidationStatus));
									let optionSelected = parseInt(validationStatus.value);
									let batchQueueId = Guid.create().toString();
									let batchUserId = userAccessId.toString();

									props.batchCampaignPlayerIds.forEach((row) => {
										let selectedDetail = props.selectedAgentValidationDetail.find((x) => x.campaignPlayerId === row);

										const item: AgentValidationsRequestModel = {
											queueId: batchQueueId,
											userId: batchUserId,
											agentValidationStatus: optionSelected == 1 ? true : false,
											agentValidationNotes: values.agentValidationNotes,
											isAgentValidated: true,
											campaignPlayerId: row,
											createdBy: typeof selectedDetail != 'undefined' ? selectedDetail.createdBy : userAccessId,
											updatedBy: userAccessId,
											agentValidationId: typeof selectedDetail != 'undefined' ? selectedDetail.agentValidationId : 0,
										};
										request.push(item);
									});

									upsertAgentValidation(request)
										.then((response) => {
											if (response.status === successResponse) {
												messagingHub.on(batchQueueId, (message) => {
													let resultData = JSON.parse(message.remarks);
													if (resultData.Status !== successResponse) {
														swal(SwalFailedMessage.title , resultData.Message, SwalFailedMessage.icon);
														setLoading(false);
														setSubmitting(false);
													} else {
														swal(SwalSuccessRecordMessage.title, SwalSuccessRecordMessage.textSuccess, SwalSuccessRecordMessage.icon);
														setHasErrors(false);
														setErrorMessage('');
														setLoading(false);
														setLoaded(false);
														setSubmitting(false);
														props.toggle();
													}

													messagingHub.off(batchQueueId);
													messagingHub.stop();
												});

												setTimeout(() => {
													if (messagingHub.state === HubConnected) {
														messagingHub.stop();
														setLoading(false);
														setSubmitting(false);
													}
												}, 30000);
											} else {
												swal(SwalFailedMessage.title, response.data.message, SwalFailedMessage.icon);
												setLoading(false);
												setSubmitting(false);
											}
										})
										.catch(() => {
											messagingHub.stop();
											swal(SwalFailedMessage.title, SwalFailedMessage.textAgentValidationProblem, SwalFailedMessage.icon);
											setLoading(false);
											setSubmitting(false);
										});
								} else {
									messagingHub.stop();
									swal(SwalServerErrorMessage.title, SwalServerErrorMessage.textError, SwalServerErrorMessage.icon);
									setLoading(false);
									setSubmitting(false);
								}
							})
							.catch((ex) => {
								setLoading(false);
								setSubmitting(false);
							});
					} else {
						setLoading(false);
						setSubmitting(false);
					}
				})
				.catch((ex) => {
					setLoading(false);
					setSubmitting(false);
				});
		},
	});

	useEffect(() => {
		if (props.batchCampaignPlayerIds.length === 0) {
			setPreviousBatchCampaignPlayerIds(props.batchCampaignPlayerIds);
		}

		if (props.batchCampaignPlayerIds.length != 0 && JSON.stringify(props.batchCampaignPlayerIds) !== JSON.stringify(previousBatchCampaignPlayerIds)) {
			setPreviousBatchCampaignPlayerIds(props.batchCampaignPlayerIds);
			setSelectedValidationStatus('');
			let selecteDetails = new Array<AgentValidationsResponseModel>();
			let selectedCampaignPlayerInfo = new Array<CallValidationResponseModel>();

			for (var i = 0; i <= props.batchCampaignPlayerIds.length - 1; i++) {
				let record = props.selectedAgentValidationDetail.filter((x) => x.campaignPlayerId === props.batchCampaignPlayerIds[i]);
				let playerInfo = props.currentData.find((x) => x.campaignPlayerId === props.batchCampaignPlayerIds[i]);
				if (record.length > 0) {
					let detail = record.find((x) => x);
					if (detail) {
						selecteDetails.push(detail);
					}
				}

				if (playerInfo) {
					selectedCampaignPlayerInfo.push(playerInfo!);
				}
			}

			setHasErrors(false);
			setErrorMessage('');

			let valids = selecteDetails.filter((x) => x.agentValidationStatus === true);
			let invalids = selecteDetails.filter((x) => x.agentValidationStatus === false);

			let validsReviewed = selecteDetails.filter((x) => x.isAgentValidated === true);
			let invalidsReviewed = selecteDetails.filter((x) => x.isAgentValidated === false);

			let isSystemValidations = selectedCampaignPlayerInfo.filter((x) => x.systemValidation === true);

			if (valids.length > 0 && invalids.length > 0) {
				setHasErrors(true);

				if (validsReviewed.length > 0 && props.batchCampaignPlayerIds.length != validsReviewed.length) {
					setErrorMessage(
						AgentValidationsMessage.textOverWriteExistingValuesOneReviewed
					);
				} else {
					setErrorMessage(AgentValidationsMessage.textOverwriteExistingOnly);
				}
			} else if (
				validsReviewed.length > 0 &&
				valids.length > 0 &&
				props.batchCampaignPlayerIds.length > 1 &&
				invalidsReviewed.length === 0 &&
				props.batchCampaignPlayerIds.length != validsReviewed.length &&
				isSystemValidations.length == props.batchCampaignPlayerIds.length
			) {
				setHasErrors(true);
				setErrorMessage(AgentValidationsMessage.textOneofRecordReviewd);
			} else if (
				validsReviewed.length > 0 &&
				valids.length > 0 &&
				invalids.length === 0 &&
				props.batchCampaignPlayerIds.length > 1 &&
				invalidsReviewed.length === 0 &&
				props.batchCampaignPlayerIds.length != validsReviewed.length &&
				isSystemValidations.length != props.batchCampaignPlayerIds.length
			) {
				setHasErrors(true);

				let hasNoSystemValidation = selectedCampaignPlayerInfo.filter((x) => x.systemValidation === false);
				let hasSystemValidation = selectedCampaignPlayerInfo.filter((x) => x.systemValidation === true);

				if (hasNoSystemValidation.length) {
					hasNoSystemValidation.forEach((item) => {
						let items = selecteDetails.filter((x) => x.campaignPlayerId === item.campaignPlayerId && x.agentValidationStatus === true);
						if (items.length > 0) {
							if (hasSystemValidation.length === 0 && hasNoSystemValidation.length > 0 && valids.length != props.batchCampaignPlayerIds.length) {
								setHasErrors(true);

								setErrorMessage(AgentValidationsMessage.textOverwriteExistingOnly);
							} else {
								setErrorMessage(AgentValidationsMessage.textOneofRecordReviewd);
							}
						} else {
							setErrorMessage(
								AgentValidationsMessage.textOverWriteExistingValuesOneReviewed
							);
						}
					});
				}
			} else if (
				validsReviewed.length > 0 &&
				valids.length === 0 &&
				invalids.length > 0 &&
				props.batchCampaignPlayerIds.length > 1 &&
				invalidsReviewed.length === 0 &&
				props.batchCampaignPlayerIds.length != validsReviewed.length
			) {
				let hasSystemValidation = selectedCampaignPlayerInfo.filter((x) => x.systemValidation === true);
				let hasNoSystemValidationBatchAgent = selectedCampaignPlayerInfo.filter((x) => x.systemValidation === false);
				if (
					hasSystemValidation.length > 0 &&
					hasNoSystemValidationBatchAgent.length > 0 &&
					valids.length > 0 &&
					invalids.length > 0 &&
					validsReviewed.length != props.batchCampaignPlayerIds.length
				) {
					setHasErrors(true);
					setErrorMessage(
						AgentValidationsMessage.textOverWriteExistingValuesOneReviewed
					);
				} else if (
					hasSystemValidation.length > 0 &&
					hasNoSystemValidationBatchAgent.length === 0 &&
					(valids.length > 0 || invalids.length > 0) &&
					validsReviewed.length != props.batchCampaignPlayerIds.length
				) {
					setHasErrors(true);
					setErrorMessage(
						AgentValidationsMessage.textOverWriteExistingValuesOneReviewed
					);
				} else if (
					hasSystemValidation.length === 0 &&
					hasNoSystemValidationBatchAgent.length > 0 &&
					(valids.length > 0 || invalids.length > 0) &&
					validsReviewed.length != props.batchCampaignPlayerIds.length
				) {
					setHasErrors(true);
					setErrorMessage(AgentValidationsMessage.textOneofRecordReviewd);
				}
			} else {
				let hasSystemValidation = selectedCampaignPlayerInfo.filter((x) => x.systemValidation === true);
				let hasNoSystemValidation = selectedCampaignPlayerInfo.filter((x) => x.systemValidation === false);

				if (hasSystemValidation.length > 0 && hasNoSystemValidation.length > 0 && valids.length != props.batchCampaignPlayerIds.length) {
					setHasErrors(true);
					setErrorMessage(AgentValidationsMessage.textOverwriteExistingOnly);
				}
			}
		}

		setHasChanged(false);
	});

	const handleClose = () => {
		if (hasChanged) {
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
			}).then((onHandleCloseBatch) => {
				if (onHandleCloseBatch) {
					setHasErrors(false);
					setErrorMessage('');
					setLoaded(false);
					props.toggle();
				}
			});
		} else {
			props.toggle();
		}
	};

	return (
		<Modal show={props.modal} size={'lg'} onHide={handleClose}>
			<Modal.Header>
				<Modal.Title>Agent Validation - Batch Action</Modal.Title>
			</Modal.Header>
			<Modal.Body>
				{hasErrors === true && (
					<div className='mb-lg-15 alert alert-danger'>
						<div className='alert-text font-weight-bold'>{errorMessage}</div>
					</div>
				)}

				<div className='d-flex p-2 bd-highlight'>
					<div className='col-sm-2'>
						<label className='form-label-sm m-2'>Agent Validation</label>
					</div>
					<div className='col-sm-8'>
						<Select
							menuPlacement='auto'
							menuPosition='fixed'
							size='small'
							style={{width: '100%'}}
							options={optionsDefault}
							onChange={onChangeSelectedValidationStatus}
							value={selectedValidationStatus}
						/>
					</div>
				</div>
			</Modal.Body>
			<Modal.Footer className='d-flex bd-highlights'>
				<MlabButton
								access={true}
								label='Submit'
								style={ElementStyle.primary}
								type={'submit'}
								weight={'solid'}
								size={'sm'}
								loading={loading}
								loadingTitle={'Please wait...'}
								disabled={loading}
								onClick={formik.submitForm}
							/>
				<Button variant='secondary' onClick={handleClose}>
					Close
				</Button>
			</Modal.Footer>
		</Modal>
	);
};
export default BatchAgentValidations;

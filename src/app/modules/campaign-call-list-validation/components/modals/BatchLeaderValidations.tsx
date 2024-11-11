import {useFormik} from 'formik';
import {Guid} from 'guid-typescript';
import React, {useEffect, useState} from 'react';
import {Button, Modal} from 'react-bootstrap';
import {shallowEqual, useSelector} from 'react-redux';
import Select from 'react-select';
import swal from 'sweetalert';
import * as Yup from 'yup';
import {RootState} from '../../../../../setup';
import * as hubConnection from '../../../../../setup/hub/MessagingHub';
import {PROMPT_MESSAGES} from '../../../../constants/Constants';

//Services
import {upsertLeaderValidation} from '../../redux/CallListValidationService';

//Models
import {LookupModel} from '../../../../common/model';
import useConstant from '../../../../constants/useConstant';
import {LeaderValidationsRequestModel} from '../../models/request/LeaderValidationsRequestModel';
import {CallValidationResponseModel} from '../../models/response/CallValidationResponseModel';
import {LeaderValidationsResponseModel} from '../../models/response/LeaderValidationsResponseModel';


type ModalProps = {
	modal: boolean;
	toggle: () => void;
	batchCampaignPlayerIds: Array<number>;
	selectedLeaderValidationDetail: Array<LeaderValidationsResponseModel>;
	leaderJustificationSettings: Array<LookupModel>;
	currentData: Array<CallValidationResponseModel>;
};

const initialValues = {
	leaderValidationNotes: '',
};

const leaderValidationSchema = Yup.object().shape({
	leaderValidationNotes: Yup.string(),
});
const optionsDefault = [
	{value: '1', label: 'Valid'},
	{value: '0', label: 'Invalid'},
];
const optionsHighDeposit = [
	{value: '1', label: 'Yes'},
	{value: '0', label: 'No'},
	{value: '2', label: 'NA'},
];

const BatchLeaderValidations: React.FC<ModalProps> = (props: ModalProps) => {
	//REDUX
	const userAccessId = useSelector<RootState>(({auth}) => auth.userId, shallowEqual) as number;

	//STATES
	const [loading, setLoading] = useState(false);
	const [selectedValidationStatus, setSelectedValidationStatus] = useState('');
	const [selectedValidationJustification, setSelectedValidationJustification] = useState('');
	const [selectedValidationHighDeposit, setSelectedValidationHighDeposit] = useState('');
	const [hasErrors, setHasErrors] = useState<boolean>(false);
	const [errorMessage, setErrorMessage] = useState('');
	const [isLoaded, setLoaded] = useState(false);
	const [previousBatchCampaignPlayerIds, setPreviousBatchCampaignPlayerIds] = useState<Array<number>>([]);
	const [hasChanged, setHasChanged] = useState(false);

	//CONSTANTS
	const {successResponse, HubConnected, SwalConfirmMessage, SwalFailedMessage, SwalSuccessRecordMessage, SwalServerErrorMessage, AgentValidationsMessage, SwalTransactionErrorMessage} = useConstant();

	//METHODS
	function onChangeSelectedValidationJustification(val: any) {
		setSelectedValidationJustification(val);
		setHasChanged(true);
	}
	
	function onChangeSelectedValidationStatus(val: any) {
		setSelectedValidationStatus(val);
		setHasChanged(true);
	}

	function onChangeSelectedValidationHighDeposit(val: any) {
		setSelectedValidationHighDeposit(val);
		setHasChanged(true);
	}

	// FORMIK FORM POST
	const formik = useFormik({
		initialValues,
		validationSchema: leaderValidationSchema,
		onSubmit: async (values, {setStatus, setSubmitting, resetForm}) => {
			setLoading(true);
			setSubmitting(true);

			if (selectedValidationStatus === '' || selectedValidationJustification === '' || selectedValidationJustification === '') {
				swal(SwalFailedMessage.title, SwalFailedMessage.textMandatory, SwalFailedMessage.icon);
				setSubmitting(false);
				setLoading(false);
				return;
			}

			swal({
				title: SwalConfirmMessage.title,
				text: SwalConfirmMessage.textRecordValidated,
				icon: SwalConfirmMessage.icon,
				buttons: [SwalConfirmMessage.btnNo, SwalConfirmMessage.btnYes],
				dangerMode: true,
			})
				.then((onConfirmBatch) => {
					if (onConfirmBatch) {
						const messagingHub = hubConnection.createHubConnenction();

						messagingHub
							.start()
							.then(() => {
								if (messagingHub.state === HubConnected) {
									let justifications = JSON.parse(JSON.stringify(selectedValidationJustification));
									let optionsJustification = parseInt(justifications.value);

									let validationStatus = JSON.parse(JSON.stringify(selectedValidationStatus));
									let optionSelected = parseInt(validationStatus.value);

									let highDeposits = JSON.parse(JSON.stringify(selectedValidationHighDeposit));
									let optionHighDeposit = parseInt(highDeposits.value);

									let request = new Array<LeaderValidationsRequestModel>();
									let batchQueueId = Guid.create().toString();
									let batchUserId = userAccessId.toString();

									props.batchCampaignPlayerIds.forEach((row) => {
										let selectedDetail = props.selectedLeaderValidationDetail.find((x) => x.campaignPlayerId === row);

										const item: LeaderValidationsRequestModel = {
											queueId: batchQueueId,
											userId: batchUserId,
											leaderValidationStatus: optionSelected == 1 ? true : false,
											justificationId: optionsJustification,
											leaderValidationNotes: values.leaderValidationNotes,
											highDeposit: optionHighDeposit,
											isLeaderValidated: true,
											campaignPlayerId: row,
											createdBy: typeof selectedDetail != 'undefined' ? selectedDetail.createdBy : userAccessId,
											updatedBy: userAccessId,
											leaderValidationId: typeof selectedDetail != 'undefined' ? selectedDetail.leaderValidationId : 0,
										};
										request.push(item);
									});

									upsertLeaderValidation(request)
										.then((response) => {
											if (response.status === successResponse) {
												messagingHub.on(batchQueueId, (message) => {
													let resultData = JSON.parse(message.remarks);
													if (resultData.Status !== successResponse) {
														swal('Failed', resultData.Message, 'error');
														setLoading(false);
														setSubmitting(false);
													} else {
														swal(SwalSuccessRecordMessage.title, SwalSuccessRecordMessage.textSuccess, SwalSuccessRecordMessage.icon);
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
														setLoading(false);
														setSubmitting(false);
														messagingHub.stop();
													}
												}, 30000);
											} else {
												swal(SwalServerErrorMessage.title, response.data.message, SwalServerErrorMessage.icon);
												setSubmitting(false);
												setLoading(false);
											}
										})
										.catch(() => {
											swal(SwalServerErrorMessage.title, AgentValidationsMessage.textProblemCreatingLeaderValidation, SwalServerErrorMessage.icon);
											setLoading(false);
											setSubmitting(false);
											messagingHub.stop();
										});
								} else {
									messagingHub.stop();
									swal(SwalTransactionErrorMessage.title, SwalTransactionErrorMessage.textError, SwalTransactionErrorMessage.icon);
									setLoading(false);
									setSubmitting(false);
								}
							})
							.catch((ex) => {
								setSubmitting(false);
								setLoading(false);
							});
					} else {
						setSubmitting(false);
						setLoading(false);
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
			setSelectedValidationJustification('');
			setSelectedValidationHighDeposit('');
			setSelectedValidationStatus('');

			let selecteDetails = new Array<LeaderValidationsResponseModel>();
			let selectedCampaignPlayerInfo = new Array<CallValidationResponseModel>();

			for (var i = 0; i <= props.batchCampaignPlayerIds.length - 1; i++) {
				let record = props.selectedLeaderValidationDetail.filter((x) => x.campaignPlayerId === props.batchCampaignPlayerIds[i]);
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

			let valids = selecteDetails.filter((x) => x.leaderValidationStatus === true);
			let invalids = selecteDetails.filter((x) => x.leaderValidationStatus === false);

			let validsReviewed = selecteDetails.filter((x) => x.isLeaderValidated === true);
			let invalidsReviewed = selecteDetails.filter((x) => x.isLeaderValidated === false);
			let isSystemValidations = selectedCampaignPlayerInfo.filter((x) => x.systemValidation === true);

			if (valids.length > 0 && invalids.length > 0) {
				setHasErrors(true);

				if (validsReviewed.length > 0 && props.batchCampaignPlayerIds.length != validsReviewed.length) {
					setErrorMessage(
						'The selected records have different values. This action will overwrite the existing values and one of the records has been reviewed.'
					);
				} else {
					setErrorMessage('The selected records have different values. This action will overwrite the existing values.');
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
				setErrorMessage('One of the records has been reviewed.');
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

				let hasSystemValidation = selectedCampaignPlayerInfo.filter((x) => x.systemValidation === true);
				let hasNoSystemValidation = selectedCampaignPlayerInfo.filter((x) => x.systemValidation === false);

				if (hasNoSystemValidation.length) {
					hasNoSystemValidation.forEach((item) => {
						let items = selecteDetails.filter((x) => x.campaignPlayerId === item.campaignPlayerId && x.leaderValidationStatus === true);
						if (items.length > 0) {
							if (hasSystemValidation.length === 0 && hasNoSystemValidation.length > 0 && valids.length != props.batchCampaignPlayerIds.length) {
								setHasErrors(true);

								setErrorMessage('The selected records have different values. This action will overwrite the existing values.');
							} else {
								setErrorMessage('One of the records has been reviewed.');
							}
						} else {
							setErrorMessage(
								'The selected records have different values. This action will overwrite the existing values and one of the records has been reviewed.'
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
				let hasNoSystemValidation = selectedCampaignPlayerInfo.filter((x) => x.systemValidation === false);
				let hasSystemValidationBatch = selectedCampaignPlayerInfo.filter((x) => x.systemValidation === true);
				if (
					hasSystemValidationBatch.length > 0 &&
					hasNoSystemValidation.length > 0 &&
					valids.length > 0 &&
					invalids.length > 0 &&
					validsReviewed.length != props.batchCampaignPlayerIds.length
				) {
					setHasErrors(true);
					setErrorMessage(
						'The selected records have different values. This action will overwrite the existing values and one of the records has been reviewed.'
					);
				} else if (
					hasSystemValidationBatch.length > 0 &&
					hasNoSystemValidation.length === 0 &&
					(valids.length > 0 || invalids.length > 0) &&
					validsReviewed.length != props.batchCampaignPlayerIds.length
				) {
					setHasErrors(true);
					setErrorMessage(
						'The selected records have different values. This action will overwrite the existing values and one of the records has been reviewed.'
					);
				} else if (
					hasSystemValidationBatch.length === 0 &&
					hasNoSystemValidation.length > 0 &&
					(valids.length > 0 || invalids.length > 0) &&
					validsReviewed.length != props.batchCampaignPlayerIds.length
				) {
					setHasErrors(true);
					setErrorMessage('One of the records has been reviewed.');
				}
			} else {
				let hasSystemValidation = selectedCampaignPlayerInfo.filter((x) => x.systemValidation === true);
				let hasNoSystemValidation = selectedCampaignPlayerInfo.filter((x) => x.systemValidation === false);

				if (hasSystemValidation.length > 0 && hasNoSystemValidation.length > 0 && valids.length != props.batchCampaignPlayerIds.length) {
					setHasErrors(true);
					setErrorMessage('The selected records have different values. This action will overwrite the existing values.');
				}
			}

			let optionHighDp = optionsHighDeposit.find((x) => x.value === '2');
			onChangeSelectedValidationHighDeposit(optionHighDp);
		}

		setHasChanged(false);
	});

	const handleBatchClose = () => {
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
			}).then((onHandleClose) => {
				if (onHandleClose) {
					setErrorMessage('');
					setHasErrors(false);
					setLoaded(false);
					props.toggle();
				}
			});
		} else {
			props.toggle();
		}
	};

	return (
		<Modal show={props.modal} size={'lg'} onHide={handleBatchClose}>
			<Modal.Header>
				<Modal.Title>Leader Validation - Batch Action</Modal.Title>
			</Modal.Header>
			<Modal.Body>
				{hasErrors === true && (
					<div className='mb-lg-15 alert alert-danger'>
						<div className='alert-text font-weight-bold'>{errorMessage}</div>
					</div>
				)}
				<div className='d-flex p-2 bd-highlight'>
					<div className='col-sm-3'>
						<span className='form-label-sm m-2 required'>Leader Validation</span>
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
				<div className='d-flex p-2 bd-highlight'>
					<div className='col-sm-3'>
						<span className='form-label-sm m-2 required'>Leader Justification</span>
					</div>
					<div className='col-sm-8'>
						<Select
							menuPlacement='auto'
							menuPosition='fixed'
							size='small'
							style={{width: '100%'}}
							options={props.leaderJustificationSettings}
							onChange={onChangeSelectedValidationJustification}
							value={selectedValidationJustification}
						/>
					</div>
				</div>
				<div className='d-flex p-2 bd-highlight'>
					<div className='col-sm-3'>
						<span className='form-label-sm m-2 required'>High Deposit</span>
					</div>
					<div className='col-sm-8'>
						<Select
							menuPlacement='auto'
							menuPosition='fixed'
							size='small'
							style={{width: '100%'}}
							options={optionsHighDeposit}
							onChange={onChangeSelectedValidationHighDeposit}
							value={selectedValidationHighDeposit}
						/>
					</div>
				</div>
			</Modal.Body>
			<Modal.Footer className='d-flex bd-highlights'>
				<Button type='submit' onClick={formik.submitForm} disabled={loading}>
					{!loading && <span className='indicator-label'>Submit</span>}
					{loading && (
						<span className='indicator-progress' style={{display: 'block'}}>
							Please wait...
							<span className='spinner-border spinner-border-sm align-middle ms-2'></span>
						</span>
					)}
				</Button>
				<Button variant='secondary' onClick={handleBatchClose}>
					Close
				</Button>
			</Modal.Footer>
		</Modal>
	);
};
export default BatchLeaderValidations;

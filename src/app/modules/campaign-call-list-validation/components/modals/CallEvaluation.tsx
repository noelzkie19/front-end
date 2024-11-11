import {useFormik} from 'formik';
import {Guid} from 'guid-typescript';
import React, {useEffect, useState} from 'react';
import {Button, Modal} from 'react-bootstrap';
import {shallowEqual,  useSelector} from 'react-redux';
import swal from 'sweetalert';
import * as Yup from 'yup';
import {RootState} from '../../../../../setup';
import * as hubConnection from '../../../../../setup/hub/MessagingHub';
import {PROMPT_MESSAGES} from '../../../../constants/Constants';
import { SearchTextInput} from '../../../../custom-components';

//Models
import {CallEvaluationRequestModel} from '../../models/request/CallEvaluationRequestModel';
import {DeleteCallEvaluationRequestModel} from '../../models/request/DeleteCallEvaluationRequestModel';
import {CallEvaluationResponseModel} from '../../models/response/CallEvaluationResponseModel';

//Services
import useConstant from '../../../../constants/useConstant';
import {deleteCallEvaluation, upsertCallEvaluation} from '../../redux/CallListValidationService';

type ModalProps = {
	modal: boolean;
	toggle: (id: number, campaignPlayerUsername: string, playerCampaignName: string) => void;
	selectedCampaignPlayerId: number;
	selectedCampaignUsername: string;
	selectedPlayerCampaignName: string;
	selectedCallEvaluationDetail: Array<CallEvaluationResponseModel>;
};

const initialValues = {
	callEvaluationNotes: '',
	callEvaluationPoints: 'NA',
};

const callEvaluationSchema = Yup.object().shape({
	callEvaluationNotes: Yup.string(),
	callEvaluationPoints: Yup.string(),
});

const CallEvaluation: React.FC<ModalProps> = (props: ModalProps) => {
	//Redux
	const userAccessId = useSelector<RootState>(({auth}) => auth.userId, shallowEqual) as number;

	//States
	const [loading, setLoading] = useState(false);
	const [selectedDetail, setSelectedDetail] = useState<CallEvaluationResponseModel>();
	const [isRemoveEnabled, setRemoveEnabled] = useState<boolean>(false);
	const [actionType, setActionType] = useState<string>('ADD');
	const [isLoaded, setLoaded] = useState(false);

	const [previousCampaigPlayerId, setPreviousCampaigPlayerId] = useState<number>(0);
	const [hasChanged, setHasChanged] = useState(false);
	const {SwalConfirmMessage, successResponse, SwalSuccessDeleteRecordMessage, HubConnected, SwalServerErrorMessage} = useConstant();

	// -----------------------------------------------------------------
	// FORMIK FORM POST
	// -----------------------------------------------------------------
	const formik = useFormik({
		initialValues,
		validationSchema: callEvaluationSchema,
		onSubmit: async (values, {setStatus, setSubmitting, resetForm}) => {
			setSubmitting(true);

			// if (values.callEvaluationNotes === '') {
			//     swal("Failed", "Unable to proceed. Please enter values on mandatory fields.", "error");
			//     setLoading(false)
			//     setSubmitting(false)
			//     return;
			// }

			if (values.callEvaluationPoints === '') {
				swal('Failed', 'Evaluation point must be a number or NA', 'error');
				setLoading(false);
				setSubmitting(false);
				return;
			} else {
				if (values.callEvaluationPoints.toUpperCase() !== 'NA') {
					if (parseFloat(values.callEvaluationPoints) > 10) {
						swal('Failed', 'Unable to proceed. Maximum point is 10.00', 'error');
						setLoading(false);
						setSubmitting(false);
						return;
					}

					if (parseFloat(values.callEvaluationPoints) < 0) {
						swal('Failed', 'Unable to proceed. Minimum point is 0 or NA', 'error');
						setLoading(false);
						setSubmitting(false);
						return;
					}
				}

				let decimalValue = values.callEvaluationPoints.split('.');

				if (decimalValue.length > 1) {
					let decimalPlaces = decimalValue[1];

					if (decimalPlaces.length > 2) {
						swal('Failed', 'Unable to proceed. Two decimal places allowed only.', 'error');
						setLoading(false);
						setSubmitting(false);
						return;
					}
				}
			}

			if (values.callEvaluationNotes.length > 4000) {
				swal('Failed', 'Unable to proceed. More than 4000 characters', 'error');
				setLoading(false);
				setSubmitting(false);
				return;
			}

			setLoading(true);

			if (actionType === 'DELETE') {
				swal({
					title: 'Remove Evaluation Details',
					text: 'This will remove the call evaluation point and Call evaluation notes. Please confirm',
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
				}).then((willRemove) => {
					setActionType('ADD');
					if (willRemove) {
						//DeleteCallEvaluationRequestModel

						const messagingHub = hubConnection.createHubConnenction();

						messagingHub
							.start()
							.then(() => {
								if (messagingHub.state === 'Connected') {
									const request: DeleteCallEvaluationRequestModel = {
										queueId: Guid.create().toString(),
										userId: userAccessId.toString(),
										callEvaluationId: typeof selectedDetail != 'undefined' ? selectedDetail.callEvaluationId : 0,
									};

									deleteCallEvaluation(request)
										.then((response) => {
											if (response.status === successResponse) {
												messagingHub.on(request.queueId.toString(), (message) => {
													let resultData = JSON.parse(message.remarks);
													if (resultData.Status !== successResponse) {
														swal('Failed', resultData.Message, 'error');
														setLoading(false);
														setSubmitting(false);
													} else {
														swal('Successful!', 'The data has been deleted', 'success');
														setLoading(false);
														setSubmitting(false);
														setLoaded(false);
														formik.setFieldValue('callEvaluationNotes', '');
														formik.setFieldValue('callEvaluationPoints', 0);
														setRemoveEnabled(false);
														props.toggle(0, '', '');
													}

													messagingHub.off(request.queueId.toString());
													messagingHub.stop();
												});

												setTimeout(() => {
													if (messagingHub.state === 'Connected') {
														messagingHub.stop();
														setLoading(false);
														setSubmitting(false);
													}
												}, 30000);
											} else {
												swal('Failed', response.data.message, 'error');
												setLoading(false);
												setSubmitting(false);
											}
										})
										.catch(() => {
											messagingHub.stop();
											swal('Failed', 'Problem deleting the call evaluation', 'error');
											setLoading(false);
											setSubmitting(false);
										});
								} else {
									messagingHub.stop();
									swal('Failed', 'Problem connecting to the server, Please refresh', 'error');
									setLoading(false);
									setSubmitting(false);
								}
							})
							.catch((err) => console.log('Error while starting connection: ' + err));
					} else {
						setLoading(false);
						setSubmitting(false);
					}
				});
			} else {
				swal({
					title: 'Confirmation',
					text: 'This action will update the Call Evaluation, please confirm',
					icon: 'warning',
					buttons: [SwalConfirmMessage.btnNo, SwalConfirmMessage.btnYes],
					dangerMode: true,
				})
					.then((willCreate) => {
						if (willCreate) {
							const messagingHub = hubConnection.createHubConnenction();

							messagingHub
								.start()
								.then(() => {
									if (messagingHub.state === 'Connected') {
										const request: CallEvaluationRequestModel = {
											queueId: Guid.create().toString(),
											userId: userAccessId.toString(),
											evaluationPoint: values.callEvaluationPoints.toUpperCase() === 'NA' ? undefined : parseFloat(values.callEvaluationPoints),
											evaluationNotes: values.callEvaluationNotes,
											campaignPlayerId: props.selectedCampaignPlayerId,
											createdBy: typeof selectedDetail != 'undefined' ? selectedDetail.createdBy : userAccessId,
											updatedBy: userAccessId,
											callEvaluationId: typeof selectedDetail != 'undefined' ? selectedDetail.callEvaluationId : 0,
										};

										upsertCallEvaluation(request)
											.then((response) => {
												if (response.status === successResponse) {
													messagingHub.on(request.queueId.toString(), (message) => {
														let resultData = JSON.parse(message.remarks);
														if (resultData.Status !== successResponse) {
															swal(SwalServerErrorMessage.title, resultData.Message, SwalServerErrorMessage.icon);
															setLoading(false);
															setSubmitting(false);
														} else {
															swal(SwalSuccessDeleteRecordMessage.title, SwalSuccessDeleteRecordMessage.textSuccess, SwalSuccessDeleteRecordMessage.icon);
															setLoading(false);
															setSubmitting(false);
															setLoaded(false);
															initialValues.callEvaluationPoints = 'NA';
															initialValues.callEvaluationNotes = '';
															formik.setFieldValue('callEvaluationPoints', initialValues.callEvaluationPoints);
															formik.setFieldValue('callEvaluationNotes', initialValues.callEvaluationNotes);
															props.toggle(0, '', '');
														}

														messagingHub.off(request.queueId.toString());
														messagingHub.stop();
													});

													setTimeout(() => {
														if (messagingHub.state === HubConnected) {
															messagingHub.stop();
															setSubmitting(false);
															setLoading(false);
														}
													}, 30000);
												} else {
													swal(SwalServerErrorMessage.title, response.data.message, SwalServerErrorMessage.icon);
													setLoading(false);
													setSubmitting(false);
												}
											})
											.catch(() => {
												messagingHub.stop();
												swal('Failed', 'Problem updating the call evaluation', 'error');
												setSubmitting(false);
												setLoading(false);
											});
									} else {
										messagingHub.stop();
										swal('Failed', 'Problem connecting to the server, Please refresh', 'error');
										setLoading(false);
										setSubmitting(false);
									}
								})
								.catch((ex) => {
									console.log('Error while starting connection:' + ex);
									setSubmitting(false);
									setLoading(false);
								});
						} else {
							setSubmitting(false);
							setLoading(false);
						}
					})
					.catch((ex) => {
						console.log('Problem in saving call evaluation:' + ex);
						setLoading(false);
						setSubmitting(false);
					});
			}
		},
	});

	useEffect(() => {
		if (props.modal === true) {
			if (props.selectedCampaignPlayerId === 0) {
				setPreviousCampaigPlayerId(0);
			}

			if (props.selectedCampaignPlayerId != 0 && props.selectedCampaignPlayerId != previousCampaigPlayerId) {
				setPreviousCampaigPlayerId(props.selectedCampaignPlayerId);
				initialValues.callEvaluationPoints = 'NA';
				initialValues.callEvaluationNotes = '';
				formik.setFieldValue('callEvaluationPoints', initialValues.callEvaluationPoints);
				formik.setFieldValue('callEvaluationNotes', initialValues.callEvaluationNotes);

				let detail = props.selectedCallEvaluationDetail.find((x) => x.campaignPlayerId === props.selectedCampaignPlayerId);

				if (typeof detail !== 'undefined') {
					setSelectedDetail(detail);
					initialValues.callEvaluationPoints = detail.evaluationPoint === null ? 'NA' : detail.evaluationPoint.toString();
					initialValues.callEvaluationNotes = detail.evaluationNotes;
					formik.setFieldValue('callEvaluationPoints', initialValues.callEvaluationPoints);
					formik.setFieldValue('callEvaluationNotes', initialValues.callEvaluationNotes);
					setRemoveEnabled(true);
					// setLoaded(true)
				} else {
					setRemoveEnabled(false);
				}
			}

			setHasChanged(false);
		}
	}, [props.modal]);

	useEffect(() => {
		var points = formik.getFieldProps('callEvaluationPoints');
		var notes = formik.getFieldProps('callEvaluationNotes');

		if (notes.value != initialValues.callEvaluationNotes || points.value != initialValues.callEvaluationPoints) {
			setHasChanged(true);
		}
	}, [formik]);

	const removePointDetail = () => {
		setActionType('DELETE');
		formik.submitForm();
	};

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
					},
					confirm: {
						text: SwalConfirmMessage.btnYes,
						value: true,
						visible: true,
					},
				},
				dangerMode: true,
			}).then((willClose) => {
				if (willClose) {
					initialValues.callEvaluationPoints = 'NA';
					initialValues.callEvaluationNotes = '';
					formik.setFieldValue('callEvaluationPoints', initialValues.callEvaluationPoints);
					formik.setFieldValue('callEvaluationNotes', initialValues.callEvaluationNotes);
					setLoaded(false);
					props.toggle(0, '', '');
				}
			});
		} else {
			props.toggle(0, '', '');
		}
	};

	return (
		<Modal show={props.modal} size={'lg'} onHide={handleClose} centered>
			<Modal.Header>
				<Modal.Title>Call Evaluation</Modal.Title>
			</Modal.Header>
			<Modal.Body>
			
				<div className='d-flex p-2 bd-highlight'>
					<div className='col-lg-4'>
						<label className='form-label-sm m-2'>Username </label>
					</div>
					<div className='col-lg-8'>
						<label className='form-label-sm m-2 fw-bolder'>{props.selectedCampaignUsername}</label>
					</div>
				</div>
				<div className='d-flex p-2 bd-highlight'>
					<div className='col-lg-4'>
						<label className='form-label-sm m-2'>Campaign Name </label>
					</div>
					<div className='col-lg-8'>
						<label className='form-label-sm m-2 fw-bolder'>{props.selectedPlayerCampaignName}</label>
					</div>
				</div>
				<div className='d-flex p-2 bd-highlight'>
					<div className='col-lg-4'>
						<span className='form-label-sm m-2 required'>Call Evaluation Point </span>
					</div>

					<div className='col-lg-8'>
						<SearchTextInput ariaLabel={'Call Evaluation Point'} {...formik.getFieldProps('callEvaluationPoints')} />
					</div>
				</div>
				<div className='d-flex p-2 bd-highlight'>
					<div className='col-lg-4'>
						<label className='form-label-sm m-2'>Call Evaluation Notes </label>
					</div>

					<div className='col-lg-8'>
						<textarea className='form-control form-control-sm' rows={3} {...formik.getFieldProps('callEvaluationNotes')} />
					</div>
				</div>	
				
			</Modal.Body>
			<Modal.Footer className='d-flex bd-highlights'>
				<Button type='submit' onClick={formik.submitForm} disabled={loading} className='btn btn-primary btn-sm me-2'>
					{!loading && <span className='indicator-label'>Submit</span>}
					{loading && (
						<span className='indicator-progress' style={{display: 'block'}}>
							Please wait...
							<span className='spinner-border spinner-border-sm align-middle ms-2'></span>
						</span>
					)}
				</Button>
				<Button variant='danger' className='btn btn-sm me-2' onClick={removePointDetail} disabled={!isRemoveEnabled || loading}>
					{!loading && <span className='indicator-label'>Remove</span>}
					{loading && (
						<span className='indicator-progress' style={{display: 'block'}}>
							Please wait...
							<span className='spinner-border spinner-border-sm align-middle ms-2'></span>
						</span>
					)}
				</Button>
				<Button variant='secondary' className='btn btn-sm me-2' onClick={handleClose}>
					Close
				</Button>
			</Modal.Footer>
		</Modal>
	);
};
export default CallEvaluation;

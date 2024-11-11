import {useFormik} from 'formik';
import {Guid} from 'guid-typescript';
import React, {useEffect, useState} from 'react';
import {Modal} from 'react-bootstrap';
import {shallowEqual, useSelector} from 'react-redux';
import Select from 'react-select';
import swal from 'sweetalert';
import * as Yup from 'yup';
import {RootState} from '../../../../../setup';
import * as hubConnection from '../../../../../setup/hub/MessagingHub';
import {PROMPT_MESSAGES} from '../../../../constants/Constants';
import {DefaultSecondaryButton, FormContainer, SuccesLoaderButton} from '../../../../custom-components';

//Models
import {AgentValidationsRequestModel} from '../../models/request/AgentValidationsRequestModel';
import {AgentValidationsResponseModel} from '../../models/response/AgentValidationsResponseModel';

//Services
import useConstant from '../../../../constants/useConstant';
import {upsertAgentValidation} from '../../redux/CallListValidationService';

type ModalProps = {
	modal: boolean;
	toggle: (id: number, campaignPlayerUsername: string, playerCampaignName: string, isAgentValidated: boolean, rootSource: string) => void;
	selectedCampaignPlayerId: number;
	selectedCampaignUsername: string;
	selectedPlayerCampaignName: string;
	selectedAgentValidationDetail: Array<AgentValidationsResponseModel>;
};

const initialValues = {
	agentValidationNotes: '',
};

const agentValidationSchema = Yup.object().shape({
	agentValidationNotes: Yup.string(),
});


const optionsDefault = [
	{value: '1', label: 'Valid'},
	{value: '0', label: 'Invalid'},
];

const AgentValidation: React.FC<ModalProps> = (props: ModalProps) => {
	//Redux
	const userAccessId = useSelector<RootState>(({auth}) => auth.userId, shallowEqual) as number;

	// STATES
	const [isLoaded, setLoaded] = useState(false);
	const [loading, setLoading] = useState(false);
	const [selectedValidationStatus, setSelectedValidationStatus] = useState('');
	const [selectedDetail, setSelectedDetail] = useState<AgentValidationsResponseModel>();
	const [previousCampaigPlayerId, setPreviousCampaigPlayerId] = useState<number>(0);
	const [hasChanged, setHasChanged] = useState(false);
	const {SwalConfirmMessage, SwalFailedMessage, HubConnected, successResponse, SwalSuccessRecordMessage, SwalServerErrorMessage, SwalUserConfirmMessage} = useConstant();

	//Methods
	function onChangeSelectedValidationStatus(val: any) {
		setSelectedValidationStatus(val);
		setHasChanged(true);
	}

	// -----------------------------------------------------------------
	// FORMIK FORM POST
	// -----------------------------------------------------------------
	const formik = useFormik({
		initialValues,
		validationSchema: agentValidationSchema,
		onSubmit: async (values, {setStatus, setSubmitting, resetForm}) => {
			setLoading(true);
			setSubmitting(true);

			if (selectedValidationStatus === '') {
				swal(SwalFailedMessage.title, SwalFailedMessage.textMandatory, SwalFailedMessage.icon);
				setLoading(false);
				setSubmitting(false);
				return;
			}

			if (values.agentValidationNotes.length > 4000) {
				swal(SwalFailedMessage.title, SwalFailedMessage.textMaxCharactersError, SwalFailedMessage.icon);
				setLoading(false);
				setSubmitting(false);
				return;
			}

			swal({
				title: SwalConfirmMessage.title,
				text: SwalConfirmMessage.textConfirmationAgentValidationUpdate,
				icon: SwalConfirmMessage.icon,
				buttons: [SwalConfirmMessage.btnNo, SwalConfirmMessage.btnYes],
				dangerMode: true,
			})
				.then((willCreate) => {
					if (willCreate) {
						const messagingHub = hubConnection.createHubConnenction();

						messagingHub
							.start()
							.then(() => {
								if (messagingHub.state === HubConnected) {
									let validationStatus = JSON.parse(JSON.stringify(selectedValidationStatus));
									let optionSelected = parseInt(validationStatus.value);

									const item: AgentValidationsRequestModel = {
										queueId: Guid.create().toString(),
										userId: userAccessId.toString(),
										agentValidationStatus: optionSelected == 1 ? true : false,
										agentValidationNotes: values.agentValidationNotes,
										isAgentValidated: true,
										campaignPlayerId: props.selectedCampaignPlayerId,
										createdBy: typeof selectedDetail != 'undefined' ? selectedDetail.createdBy : userAccessId,
										updatedBy: userAccessId,
										agentValidationId: typeof selectedDetail != 'undefined' ? selectedDetail.agentValidationId : 0,
									};

									let request = new Array<AgentValidationsRequestModel>();
									request.push(item);

									upsertAgentValidation(request)
										.then((response) => {
											if (response.status === successResponse) {
												messagingHub.on(item.queueId.toString(), (message) => {
													let resultData = JSON.parse(message.remarks);
													if (resultData.Status !== successResponse) {
														swal(SwalFailedMessage.title, resultData.Message, 'error');
														setLoading(false);
														setSubmitting(false);
													} else {
														swal(SwalSuccessRecordMessage.title, SwalSuccessRecordMessage.textSuccess, SwalSuccessRecordMessage.icon);
														setLoaded(false);
														setLoading(false);
														setSubmitting(false);
														props.toggle(0, '', '', true, 'Child');
													}

													messagingHub.off(item.queueId.toString());
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
												swal(SwalServerErrorMessage.title, response.data.message, SwalServerErrorMessage.icon);
												setLoading(false);
												setSubmitting(false);
											}
										})
										.catch(() => {
											messagingHub.stop();
											swal('Failed', 'Problem creating the agent validation', 'error');
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
							.catch((ex) => {
								console.log('Error while starting connection:' + ex);
								setLoading(false);
								setSubmitting(false);
							});
					} else {
						setSubmitting(false);
						setLoading(false);
					}
				})
				.catch((ex) => {
					console.log('Problem in saving agent validations:' + ex);
					setSubmitting(false);
					setLoading(false);
				});
		},
	});

	useEffect(() => {
		if (props.modal === true) {
			if (props.selectedCampaignPlayerId === 0) {
				setPreviousCampaigPlayerId(props.selectedCampaignPlayerId);
			}

			if (props.selectedCampaignPlayerId != 0 && props.selectedCampaignPlayerId != previousCampaigPlayerId) {
				setPreviousCampaigPlayerId(props.selectedCampaignPlayerId);
				let option = optionsDefault.find((x) => x.value === '1');
				onChangeSelectedValidationStatus(option);
				initialValues.agentValidationNotes = '';
				formik.setFieldValue('agentValidationNotes', '');

				let detail = props.selectedAgentValidationDetail.find((x) => x.campaignPlayerId === props.selectedCampaignPlayerId);
				if (typeof detail !== 'undefined') {
					setSelectedDetail(detail);
					let option = optionsDefault.find((x) => x.value === (detail?.agentValidationStatus === true ? '1' : '0'));
					onChangeSelectedValidationStatus(option);
					initialValues.agentValidationNotes = detail.agentValidationNotes;
					formik.setFieldValue('agentValidationNotes', initialValues.agentValidationNotes);
				} else {
					let option = optionsDefault.find((x) => x.value === '1');
					onChangeSelectedValidationStatus(option);
					initialValues.agentValidationNotes = '';
					formik.setFieldValue('agentValidationNotes', '');
				}
				// setLoaded(true)

				setHasChanged(false);
			}
		}
	}, [props.modal]);

	useEffect(() => {
		var notes = formik.getFieldProps('agentValidationNotes');
		if (notes.value != '') {
			setHasChanged(true);
		}
	}, [formik]);

	const handleClose = () => {
		if (hasChanged) {
			swal({
				title: PROMPT_MESSAGES.ConfirmCloseTitle,
				text: PROMPT_MESSAGES.ConfirmCloseMessage,
				icon: SwalUserConfirmMessage.icon,
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
			}).then((willClose) => {
				if (willClose) {
					let option = optionsDefault.find((x) => x.value === '1');
					onChangeSelectedValidationStatus(option);
					initialValues.agentValidationNotes = '';
					formik.setFieldValue('agentValidationNotes', '');
					
					props.toggle(0, '', '', true, 'Child');
				}
			});
		} else {
			props.toggle(0, '', '', true, 'Child');
		}
	};

	return (
		<Modal show={props.modal} size={'lg'} onHide={handleClose} centered>
			<Modal.Header>
				<Modal.Title>Agent Validation</Modal.Title>
			</Modal.Header>
			<Modal.Body>
			<FormContainer onSubmit={formik.handleSubmit}>
				<div className='d-flex p-2 bd-highlight'>
					<div className='col-lg-4'>
						<span className='m-2 form-label-sm '>Username </span>
					</div>
					<div className='col-lg-8'>
						<span className='form-label-sm m-2 fw-bolder'>{props.selectedCampaignUsername}</span>
					</div>
				</div>
				<div className='d-flex p-2 bd-highlight'>
					<div className='col-lg-4'>
						<span className='m-2 form-label-sm'>Campaign Name </span>
					</div>
					<div className='col-lg-8'>
						<span className='form-label-sm m-2 fw-bolder'>{props.selectedPlayerCampaignName}</span>
					</div>
				</div>
				<div className='d-flex p-2 bd-highlight'>
					<div className='col-lg-4'>
						<span className='m-2 form-label-sm'>Agent Validation </span>
					</div>
					<div className='col-lg-8'>
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
					<div className='col-lg-4'>
						<label className='form-label-sm m-2'>Agent Validation Notes </label>
					</div>

					<div className='col-lg-8'>
						<textarea className='form-control form-control-sm' rows={3} {...formik.getFieldProps('agentValidationNotes')} />
					</div>
				</div>
			</FormContainer>
				
			</Modal.Body>
			<Modal.Footer className='d-flex bd-highlights'>
				<SuccesLoaderButton onClick={formik.submitForm} title={'Submit'} loading={loading} disabled={loading} loadingTitle={'Please wait ...'}/>
				<DefaultSecondaryButton access={true} title={'Close'} onClick={handleClose}/>
			</Modal.Footer>
		</Modal>
	);
};
export default AgentValidation;

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
import {LeaderValidationsResponseModel} from '../../models/response/LeaderValidationsResponseModel';

type ModalProps = {
	modal: boolean;
	toggle: (id: number, campaignPlayerUsername: string, playerCampaignName: string, isLeaderValidated: boolean, rootSource: string) => void;
	selectedCampaignPlayerId: number;
	selectedCampaignUsername: string;
	selectedPlayerCampaignName: string;
	selectedLeaderValidationDetail: Array<LeaderValidationsResponseModel>;
	leaderJustificationSettings: Array<LookupModel>;
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

const LeaderValidation: React.FC<ModalProps> = (props: ModalProps) => {
	//Redux
	const userAccessId = useSelector<RootState>(({auth}) => auth.userId, shallowEqual) as number;

	//States
	const [loading, setLoading] = useState(false);
	const [selectedValidationStatus, setSelectedValidationStatus] = useState('');
	const [selectedDetail, setSelectedDetail] = useState<LeaderValidationsResponseModel>();
	const [selectedValidationJustification, setSelectedValidationJustification] = useState('');
	const [selectedValidationHighDeposit, setSelectedValidationHighDeposit] = useState('');
	const [isLoaded, setLoaded] = useState(false);
	const [previousCampaigPlayerId, setPreviousCampaigPlayerId] = useState<number>(0);
	const [hasChanged, setHasChanged] = useState(false);
	const { SwalConfirmMessage, HubConnected, SwalSuccessRecordMessage, SwalServerErrorMessage, AgentValidationsMessage} = useConstant();

	//Methods
	function onChangeSelectedValidationStatus(val: any) {
		setSelectedValidationStatus(val);
		setHasChanged(true);
	}

	function onChangeSelectedValidationJustification(val: any) {
		setSelectedValidationJustification(val);
		setHasChanged(true);
	}
	function onChangeSelectedValidationHighDeposit(val: any) {
		setSelectedValidationHighDeposit(val);
		setHasChanged(true);
	}

	// -----------------------------------------------------------------
	// FORMIK FORM POST
	// -----------------------------------------------------------------
	const formik = useFormik({
		initialValues,
		validationSchema: leaderValidationSchema,
		onSubmit: async (values, {setStatus, setSubmitting, resetForm}) => {
			setLoading(true);
			setSubmitting(true);

			if (selectedValidationStatus === '' || selectedValidationJustification === '' || selectedValidationJustification === '') {
				swal('Failed', 'Unable to proceed. Please enter values on mandatory fields.', 'error');
				setLoading(false);
				setSubmitting(false);
				return;
			}

			if (values.leaderValidationNotes.length > 4000) {
				swal('Failed', 'Unable to proceed. More than 4000 characters', 'error');
				setLoading(false);
				setSubmitting(false);
				return;
			}

			swal({
				title: 'Confirmation',
				text: 'This action will update the Leader Validation, please confirm',
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
								if (messagingHub.state === HubConnected) {
								
									let validationStatus = JSON.parse(JSON.stringify(selectedValidationStatus));
									let optionSelected = parseInt(validationStatus.value);

									let highDeposits = JSON.parse(JSON.stringify(selectedValidationHighDeposit));
									let optionHighDeposit = parseInt(highDeposits.value);

									let justifications = JSON.parse(JSON.stringify(selectedValidationJustification));
									let optionsJustification = parseInt(justifications.value);

									const item: LeaderValidationsRequestModel = {
										queueId: Guid.create().toString(),
										userId: userAccessId.toString(),
										leaderValidationStatus: optionSelected == 1 ? true : false,
										justificationId: optionsJustification,
										leaderValidationNotes: values.leaderValidationNotes,
										highDeposit: optionHighDeposit,
										isLeaderValidated: true,
										campaignPlayerId: props.selectedCampaignPlayerId,
										createdBy: typeof selectedDetail != 'undefined' ? selectedDetail.createdBy : userAccessId,
										updatedBy: userAccessId,
										leaderValidationId: typeof selectedDetail != 'undefined' ? selectedDetail.leaderValidationId : 0,
									};

									let request = new Array<LeaderValidationsRequestModel>();
									request.push(item);

									upsertLeaderValidation(request)
										.then((response) => {
											if (response.status === 200) {
												messagingHub.on(item.queueId.toString(), (message) => {
													let resultData = JSON.parse(message.remarks);
													if (resultData.Status !== 200) {
														swal('Failed', resultData.Message, 'error');
														setLoading(false);
														setSubmitting(false);
													} else {
														swal(SwalSuccessRecordMessage.title, SwalSuccessRecordMessage.textSuccess, SwalSuccessRecordMessage.icon);
														setLoading(false);
														setSubmitting(false);
														setLoaded(false);
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
												setSubmitting(false);
												setLoading(false);
											}
										})
										.catch(() => {
											messagingHub.stop();
											swal(SwalServerErrorMessage.title, AgentValidationsMessage.textProblemCreatingLeaderValidation, SwalServerErrorMessage.icon);
											setSubmitting(false);
											setLoading(false);
										});
								} else {
									messagingHub.stop();
									swal(SwalServerErrorMessage.title, SwalServerErrorMessage.textError, SwalServerErrorMessage.icon);
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
						setLoading(false);
						setSubmitting(false);
					}
				})
				.catch((ex) => {
					console.log(AgentValidationsMessage.textProblemSavingLeaderValidations + ex);
					setLoading(false);
					setSubmitting(false);
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
				onChangeSelectedValidationJustification('');
				let option = optionsDefault.find((x) => x.value === '1');
				onChangeSelectedValidationStatus(option);
				let optionHighDp = optionsHighDeposit.find((x) => x.value === '2');
				onChangeSelectedValidationHighDeposit(optionHighDp);
				initialValues.leaderValidationNotes = '';
				formik.setFieldValue('leaderValidationNotes', '');

				let detail = props.selectedLeaderValidationDetail.find((x) => x.campaignPlayerId === props.selectedCampaignPlayerId);
				if (typeof detail !== 'undefined') {
					setSelectedDetail(detail);
					let option = optionsDefault.find((x) => x.value === (detail?.leaderValidationStatus === true ? '1' : '0'));
					onChangeSelectedValidationStatus(option);
					let optionJustification = props.leaderJustificationSettings.find((x) => x.value === detail?.justificationId.toString());
					onChangeSelectedValidationJustification(optionJustification);
					let optionHighDeposit = optionsHighDeposit.find((x) => x.value === detail?.highDeposit.toString());
					onChangeSelectedValidationHighDeposit(optionHighDeposit);
					initialValues.leaderValidationNotes = detail.leaderValidationNotes;
					formik.setFieldValue('leaderValidationNotes', initialValues.leaderValidationNotes);
				} else {
					onChangeSelectedValidationJustification('');
					let option = optionsDefault.find((x) => x.value === '1');
					onChangeSelectedValidationStatus(option);
					let optionHighDp = optionsHighDeposit.find((x) => x.value === '2');
					onChangeSelectedValidationHighDeposit(optionHighDp);
					initialValues.leaderValidationNotes = '';
					formik.setFieldValue('leaderValidationNotes', '');
				}
				// setLoaded(true)

				setHasChanged(false);
			}
		}
	}, [props.modal]);

	useEffect(() => {
		var notes = formik.getFieldProps('leaderValidationNotes');
		if (notes.value != '') {
			setHasChanged(true);
		}
	}, [formik]);

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
			}).then((willClose) => {
				if (willClose) {
					onChangeSelectedValidationJustification('');
					let option = optionsDefault.find((x) => x.value === '1');
					onChangeSelectedValidationStatus(option);
					let optionHighDp = optionsHighDeposit.find((x) => x.value === '2');
					onChangeSelectedValidationHighDeposit(optionHighDp);
					initialValues.leaderValidationNotes = '';
					formik.setFieldValue('leaderValidationNotes', '');

					setLoaded(false);
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
				<Modal.Title>Leader Validation</Modal.Title>
			</Modal.Header>
			<Modal.Body>
				<div className='d-flex p-2 bd-highlight'>
					<div className='col-lg-4'>
						<span className='form-label-sm m-2'>Username </span>
					</div>
					<div className='col-lg-8'>
						<span className='form-label-sm m-2 fw-bolder'>{props.selectedCampaignUsername}</span>
					</div>
				</div>
				<div className='d-flex p-2 bd-highlight'>
					<div className='col-lg-4'>
						<span className='form-label-sm m-2'>Campaign Name </span>
					</div>
					<div className='col-lg-8'>
						<span className='form-label-sm m-2 fw-bolder'>{props.selectedPlayerCampaignName}</span>
					</div>
				</div>
				<div className='d-flex p-2 bd-highlight'>
					<div className='col-lg-4'>
						<span className='form-label-sm m-2 required'>Leader Validation </span>
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
						<span className='form-label-sm m-2 required'>Leader Justification</span>
					</div>
					<div className='col-lg-8'>
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
					<div className='col-lg-4'>
						<span className='form-label-sm m-2'>Leader Validation Notes </span>
					</div>

					<div className='col-sm-8'>
						{/* <SearchTextInput ariaLabel={'Leader Validation Notes'}
                            {...formik.getFieldProps('leaderValidationNotes')}
                        /> */}

						<textarea className='form-control form-control-sm' rows={3} {...formik.getFieldProps('leaderValidationNotes')} />
					</div>
				</div>
				<div className='d-flex p-2 bd-highlight'>
					<div className='col-lg-4'>
						<span className='form-label-sm m-2 required'>High Deposit</span>
					</div>
					<div className='col-lg-8'>
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
				<Button type='submit' className='btn btn-sm me-2' onClick={formik.submitForm} disabled={loading}>
					{!loading && <span className='indicator-label '>Submit</span>}
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
export default LeaderValidation;

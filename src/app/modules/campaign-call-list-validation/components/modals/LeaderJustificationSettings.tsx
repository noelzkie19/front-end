import {AgGridReact} from 'ag-grid-react';
import {useFormik} from 'formik';
import {Guid} from 'guid-typescript';
import React, {useEffect, useState} from 'react';
import {Button, Modal} from 'react-bootstrap';
import {shallowEqual, useDispatch, useSelector} from 'react-redux';
import {useHistory} from 'react-router-dom';
import Select from 'react-select';
import swal from 'sweetalert';
import * as Yup from 'yup';
import {RootState} from '../../../../../setup';
import * as hubConnection from '../../../../../setup/hub/MessagingHub';
import {PROMPT_MESSAGES} from '../../../../constants/Constants';
import { ColDef, ColGroupDef } from 'ag-grid-community';

//Models
import {LeaderJustificationRequestModel} from '../../models/request/LeaderJustificationRequestModel';
import {LeaderJustificationListResponseModel} from '../../models/response/LeaderJustificationListResponseModel';

//Services
import useConstant from '../../../../constants/useConstant';
import {getLeaderJustificationList, upsertLeaderJustification} from '../../../campaign-call-list-validation/redux/CallListValidationService';

type ModalProps = {
	modal: boolean;
	toggle: () => void;
};

const initialValues = {
	agentValidationNotes: '',
};

const LeaderJustificationSettings: React.FC<ModalProps> = (props: ModalProps) => {
	//Redux
	const userAccessId = useSelector<RootState>(({auth}) => auth.userId, shallowEqual) as number;
	const userAccess = useSelector<RootState>(({auth}) => auth, shallowEqual);
	const expiresIn = useSelector<RootState>(({auth}) => auth.expiresIn, shallowEqual) as string;
	const history = useHistory();

	// States
	const [isLoaded, setLoaded] = useState<boolean>(false);
	const [gridApi, setGridApi] = useState<any>();
	const [gridColumnApi, setGridColumnApi] = useState(null);
	const [settingsList, setSettingsList] = useState<Array<LeaderJustificationListResponseModel>>([]);
	const [justificationName, setJustificationName] = useState<string>('');
	const [loading, setLoading] = useState(false);
	const [hasChanged, setHasChanged] = useState(false);

	// Constants
	const {HubConnected, successResponse, SwalConfirmMessage} = useConstant();
	const justificationConstant = {
		action: {
			deactivate: 'Deactivate',
			activate: 'Activate',
		},
		status: {
			active: 'Active',
			inactive: 'Inactive',
		},
	};

	// Formik form post
	const formik = useFormik({
		initialValues,
		onSubmit: async (values, {setStatus, setSubmitting, resetForm}) => {
			setLoading(true);
			setSubmitting(true);

			swal({
				title: 'Confirmation',
				text: 'This action will update the Leader Justification Setting, please confirm',
				icon: 'warning',
				buttons: [SwalConfirmMessage.btnNo, SwalConfirmMessage.btnYes],
				dangerMode: true,
			})
				.then((onFormikSubmit) => {
					if (onFormikSubmit) {
						const messagingHub = hubConnection.createHubConnenction();

						messagingHub
							.start()
							.then(() => {
								if (messagingHub.state === HubConnected) {
									let request = new Array<LeaderJustificationRequestModel>();
									let batchQueueId = Guid.create().toString();
									let batchUserId = userAccessId.toString();

									settingsList.map((row) => {
										const item: LeaderJustificationRequestModel = {
											queueId: batchQueueId,
											userId: batchUserId,
											justification: row.justification,
											status: row.status,
											createdBy: row.createdBy,
											updatedBy: userAccessId,
											leaderJustificationId: row.leaderJustificationId,
										};
										request.push(item);
									});

									upsertLeaderJustification(request)
										.then((response) => {
											if (response.status === successResponse) {
												messagingHub.on(batchQueueId, (message) => {
													let resultData = JSON.parse(message.remarks);
													if (resultData.Status !== successResponse) {
														swal('Failed', resultData.Message, 'error');
														setLoading(false);
														setSubmitting(false);
													} else {
														swal('Successful!', 'The data has been submitted', 'success');
														setLoading(false);
														setSubmitting(false);
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
												swal('Failed', response.data.message, 'error');
												setLoading(false);
												setSubmitting(false);
											}
										})
										.catch(() => {
											messagingHub.stop();
											swal('Failed', 'Problem creating the agent validation', 'error');
											setLoading(false);
											setSubmitting(false);
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
						setLoading(false);
						setSubmitting(false);
					}
				})
				.catch((ex) => {
					console.log('Problem in saving leader justification settings:' + ex);
					setLoading(false);
					setSubmitting(false);
				});
		},
	});

	// Methods
	function getCurrentDate(): string {
		let today = new Date();
		var date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
		var time = today.getHours() + ':' + today.getMinutes() + ':' + today.getSeconds();
		var dateTime = date + ' ' + time;

		return dateTime;
	}

	useEffect(() => {
		if (!isLoaded) {
			loadLeaderJustificationSettings();
			setLoaded(true);
		}

		setHasChanged(false);
	});

	const onJustificationNameChanged = (val: string) => {
		setJustificationName(val);
	};

	const addJustification = () => {
		if (justificationName === '') {
			swal('Failed', 'Unable to proceed. Please enter values on mandatory fields.', 'error');
			return;
		}

		let items = settingsList.filter((x) => x.justification.toLowerCase() === justificationName.toLowerCase());

		if (items.length > 0) {
			swal('Failed', 'Unable to proceed. Record already exists', 'error');
			return;
		}

		let temporarySettings = Object.assign(new Array<LeaderJustificationListResponseModel>(), settingsList);

		const newSetting: LeaderJustificationListResponseModel = {
			justification: justificationName,
			status: true,
			leaderJustificationId: 0,
			createdBy: userAccessId,
			createdDate: getCurrentDate(),
			updatedBy: 0,
			updatedDate: getCurrentDate(),
		};

		temporarySettings.push(newSetting);
		setSettingsList(temporarySettings);
		setJustificationName('');

		setHasChanged(true);
	};

	const onChangeStatus = (justification: string, currentStatus: boolean) => {
		let current =
			currentStatus == true ? justificationConstant.action.deactivate.toLocaleLowerCase() : justificationConstant.action.activate.toLocaleLowerCase();
		swal({
			title: 'Change Status',
			text: 'This will ' + current + ' the selected record. Please confirm',
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
		}).then((onSuccessChangeStatus) => {
			if (onSuccessChangeStatus) {
				let temporarySettings = Object.assign(new Array<LeaderJustificationListResponseModel>(), settingsList);

				temporarySettings.forEach((row) => {
					if (row.justification === justification) {
						row.status = !currentStatus;
					}
				});
				setSettingsList(temporarySettings);
				setHasChanged(true);
			}
		});
	};

	async function loadLeaderJustificationSettings() {
		await getLeaderJustificationList()
			.then((response) => {
				if (response.status === successResponse) {
					setSettingsList(response.data);
				}
			})
			.catch((ex) => {
				console.log(ex);
			});
	}

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
			}).then((onHandleClose) => {
				if (onHandleClose) {
					loadLeaderJustificationSettings();
					setHasChanged(false);
					props.toggle();
				}
			});
		} else {
			props.toggle();
		}
	};
	const onGridReady = (params: any) => {
		setGridApi(params.api);
		setGridColumnApi(params.columnApi);
		params.api.sizeColumnsToFit();
	};

	// Table content and actions
	const columnDefs : (ColDef<LeaderJustificationListResponseModel> | ColGroupDef<LeaderJustificationListResponseModel>)[] = [
		{headerName: 'Leader Justification', field: 'justification'},
		{
			headerName: 'Status',
			field: 'status',
			cellRenderer: (params: any) => (
				<>
					{params ? (
						<div className='d-flex justify-content-center flex-shrink-0'>
							<label>{params.data.status === true ? justificationConstant.status.active : justificationConstant.status.inactive}</label>
						</div>
					) : null}
				</>
			),
		},
		{
			headerName: 'Action',
			field: 'status',
			cellRenderer: (params: any) => (
				<>
					{params ? (
						<div className='d-flex justify-content-center flex-shrink-0 mt-1'>
							<button
								type='button'
								className='btn btn-outline-primary btn-sm align-middle'
								onClick={() => onChangeStatus(params.data.justification, params.data.status)}
							>
								{params.data.status === true ? justificationConstant.action.deactivate : justificationConstant.action.activate}
							</button>
						</div>
					) : null}
				</>
			),
		},
	];

	return (
		<Modal show={props.modal} size={'lg'} onHide={handleClose} centered>
			<Modal.Header>
				<Modal.Title>Leader Justification Setting</Modal.Title>
			</Modal.Header>
			<Modal.Body>
				<div className='d-flex p-2 bd-highlight'>
					<div className='col-sm-3'>
						<label className='form-label-sm m-2'>Leader Justification</label>
					</div>
					<div className='col-sm-6'>
						<input
							type='text'
							className='form-control form-control-sm'
							onChange={(event) => onJustificationNameChanged(event.target.value)}
							value={justificationName}
						/>
					</div>
					<div className='col-sm-3 px-5'>
						<button type='button' className='btn btn-primary btn-sm me-2' onClick={addJustification}>
							Add
						</button>
					</div>
				</div>
				<div className='ag-theme-quartz' style={{height: 350, width: '100%'}}>
					<AgGridReact
						defaultColDef={{
							sortable: true,
							resizable: true,
						}}
						onGridReady={onGridReady}
						rowBuffer={0}
						columnDefs={columnDefs}
						rowData={settingsList}
					/>
				</div>
			</Modal.Body>
			<Modal.Footer className='d-flex bd-highlights'>
				<Button type='submit' className='btn btn-sm me-2' onClick={formik.submitForm} disabled={loading}>
					{!loading && <span className='indicator-label'>Submit</span>}
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
export default LeaderJustificationSettings;

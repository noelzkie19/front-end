import {faPencilAlt, faTrash} from '@fortawesome/free-solid-svg-icons';
import {AgGridReact} from 'ag-grid-react';
import {useFormik} from 'formik';
import {Guid} from 'guid-typescript';
import React, {useEffect, useState} from 'react';
import {ButtonGroup} from 'react-bootstrap-v5';
import {shallowEqual, useDispatch, useSelector} from 'react-redux';
import {Prompt, useHistory} from 'react-router-dom';
import Select from 'react-select';
import swal from 'sweetalert';
import * as Yup from 'yup';
import {RootState} from '../../../../../setup';
import * as hubConnection from '../../../../../setup/hub/MessagingHub';
import {LookupModel} from '../../../../common/model';
import {
	ButtonsContainer,
	ContentContainer,
	DefaultButton,
	DefaultSecondaryButton,
	FieldContainer,
	FormContainer,
	FormGroupContainer,
	FormHeader,
	GridLinkButton,
	LoaderButton,
	MainContainer,
	PaddedContainer,
	TableIconButton,
} from '../../../../custom-components';
import {useMasterReferenceOption} from '../../../../custom-functions';
import CommonLookups from '../../../../custom-functions/CommonLookups';
import {usePromptOnUnload} from '../../../../custom-helpers';
import {USER_CLAIMS} from '../../../user-management/components/constants/UserClaims';
import {
	ActiveEndedCampaignListModel,
	CampaignGoalSettingIdRequestModel,
	CampaignGoalSettingRequestModel,
	CommunicationRecordDepositListModel,
	GoalTypeCommunicationRecordUdtModel,
	GoalTypeDepositCurrencyMinMaxUdtModel,
	GoalTypeDepositUdtModel,
} from '../models';
import * as campaignGoalSetting from '../redux/GoalSettingRedux';
import {
	GetCampaignGoalSettingById,
	SendAddCampaignGoalSettingAsync,
	SendCheckCampaignGoalSettingByNameExist,
	SendGetCampaignGoalSettingById,
} from '../service/CampaignGoalSettingApi';
import AddEditGoalTypeConfigModal from './AddEditGoalTypeConfigModal';
import ViewGoalTypeConfigModal from './ViewGoalTypeConfigModal';

const initialValues = {
	settingName: '',
	settingDescription: '',
};

const FormSchema = Yup.object().shape({
	name: Yup.string(),
});

const AddGoalSetting: React.FC = () => {
	//	Get redux store
	const userAccess = useSelector<RootState>(({auth}) => auth.access, shallowEqual) as string;
	const userAccessId = useSelector<RootState>(({auth}) => auth.userId, shallowEqual) as number;

	const goalTypeCommnunicationRecordDepositListData = useSelector<RootState>(
		({campaignGoalSetting}) => campaignGoalSetting.goalTypeCommnunicationRecordDepositList,
		shallowEqual
	) as any;
	const goalTypeCommunicationRecordListData = useSelector<RootState>(
		({campaignGoalSetting}) => campaignGoalSetting.goalTypeCommunicationRecordList,
		shallowEqual
	) as any;
	const goalTypeDepositListData = useSelector<RootState>(({campaignGoalSetting}) => campaignGoalSetting.goalTypeDepositList, shallowEqual) as any;
	const goalTypeDepositCurrencyListData = useSelector<RootState>(
		({campaignGoalSetting}) => campaignGoalSetting.goalTypeDepositCurrencyList,
		shallowEqual
	) as any;

	//	States
	const [selectedSettingStatus, setSelectedSettingStatus] = useState<LookupModel | null>();
	const [gridApi, setGridApi] = useState<any | null>(null);
	const [gridColumnApi, setGridColumnApi] = useState(null);

	const [loading, setLoading] = useState<boolean>(false);
	const [rowData, setRowData] = useState<any>([]);
	const [modalShow, setModalShow] = useState<boolean>(false);
	const [goalParameterAmount, setGoalParameterAmount] = useState<string | any>('');
	const [goalParameterCount, setGoalParameterCount] = useState<string | any>('');
	const [action, setAction] = useState<string | any>('');
	const [goalTypeGuidId, setGoalTypeGuidId] = useState<string | any>('');
	const [goalTypeName, setGoalTypeName] = useState<string | any>('');
	const [hasErrors, setHasErrors] = useState<boolean>(false);
	const [errorMessage, setErrorMessage] = useState<string>('');
	const [modalViewShow, setModalViewShow] = useState<boolean>(false);
	const [campaignSettingId, setCampaignSettingId] = useState<number | any>('');
	const [formIsdirty, setFormIsdirty] = useState<boolean>(true);
	const masterReference = useMasterReferenceOption('49,47');
	const [dateSourceOptionFilter, setDateSourceOptionFilter] = useState<number | any>(0);
	const [selectedGoalAmount, setSelectedGoalAmount] = useState<number | any>(0);

	// Literals
	const goalAmtFTDAId = 48;
	const goalAmtIDAId = 157;
	const goalParameterAmountId = 47;
	const FIRST_TIME_DEPOSIT_DATE = 'First Time Deposit Date';
	const UPDATED_DATE = 'Updated Date';
	const DEPOSIT = 'Deposit';
	const COMMUNICATION_RECORD = 'Communication Record';
	const CONNECTED = 'Connected';

	//	Variables
	const history = useHistory();
	const dispatch = useDispatch();
	usePromptOnUnload(true, 'Any changes will be discarded, please confirm?');
	const goalParameterOptions = masterReference.filter((obj) => obj.masterReferenceParentId == goalParameterAmountId).map((obj) => obj.options);

	//	Watcher
	useEffect(() => {
		setModalShow(false);
		setRowData(goalTypeCommnunicationRecordDepositListData);
		setHasErrors(false);
		setErrorMessage('');

		if (
			goalTypeCommnunicationRecordDepositListData === undefined
				? true
				: goalTypeCommnunicationRecordDepositListData.filter((obj: any) => obj.goalTypeName === DEPOSIT).length === 0
		) {
			setGoalParameterAmount([]);
		}

		if (
			goalTypeCommnunicationRecordDepositListData === undefined
				? true
				: goalTypeCommnunicationRecordDepositListData.filter((obj: any) => obj.goalTypeName === COMMUNICATION_RECORD).length === 0
		) {
			setGoalParameterCount([]);
		}

		if (goalTypeCommnunicationRecordDepositListData !== undefined) {
			const countFTD = goalTypeCommnunicationRecordDepositListData.filter(
				(obj: any) => obj.goalTypeDataSourceName == FIRST_TIME_DEPOSIT_DATE && obj.goalTypeName === DEPOSIT
			).length;
			const countInitDeposit = goalTypeCommnunicationRecordDepositListData.filter(
				(obj: any) => obj.goalTypeDataSourceName == UPDATED_DATE && obj.goalTypeName === DEPOSIT
			).length;
			const countDeposit = goalTypeCommnunicationRecordDepositListData.filter((gl: any) => gl.goalTypeName === DEPOSIT).length;

			if (countFTD === countDeposit) {
				setSelectedGoalAmount(goalAmtFTDAId);
			} else if (countInitDeposit === countDeposit) {
				setSelectedGoalAmount(goalAmtIDAId);
			} else {
				setSelectedGoalAmount(0);
			}
		}
	}, [goalTypeCommnunicationRecordDepositListData]);

	useEffect(() => {
		_clearStorage();
	}, []);

	useEffect(() => {}, [goalTypeCommnunicationRecordDepositListData, selectedSettingStatus]);

	useEffect(() => {
		setRowData([]);
		if (_getGoalSettingId()) {
			_getCampaignGoalSettingById();
		}

		return () => {
			_clearStorage();
		};
	}, []);

	const _validate = () => {
		let isError: boolean = false;

		//Mandatory  Fields
		if (formik.values.settingName === '') {
			return true;
		}

		if (formik.values.settingDescription === '') {
			return true;
		}

		if (selectedSettingStatus?.value === '' || selectedSettingStatus?.value === undefined) {
			return true;
		}

		if (goalTypeCommnunicationRecordDepositListData === undefined || goalTypeCommnunicationRecordDepositListData.length === 0) {
			return true;
		}

		if (goalTypeCommnunicationRecordDepositListData.filter((obj: any) => obj.goalTypeName === DEPOSIT).length !== 0) {
			if (
				goalParameterAmount.value === '' ||
				goalParameterAmount.value === undefined ||
				goalParameterAmount.value === 0 ||
				goalParameterAmount.length === 0
			) {
				return true;
			}
		}

		if (goalTypeCommnunicationRecordDepositListData.filter((obj: any) => obj.goalTypeName === COMMUNICATION_RECORD).length !== 0) {
			if (
				goalParameterCount.value === '' ||
				goalParameterCount.value === undefined ||
				goalParameterCount.value === 0 ||
				goalParameterCount.length === 0
			) {
				return true;
			}
		}

		return isError;
	};

	//	Formik post
	const formik = useFormik({
		initialValues,
		validationSchema: FormSchema,
		onSubmit: async (values, {setStatus, setSubmitting, resetForm}) => {
			setLoading(true);
			setSubmitting(true);

			if (_validate() === true) {
				swal('Error', 'Unable to proceed, kindly fill up all mandatory fields', 'error');
			} else {
				SendCheckCampaignGoalSettingByNameExist({CampaignSettingName: formik.values.settingName})
					.then((response) => {
						if (response.status === 200) {
							let result = response.data;

							if (result === true) {
								swal('Error', 'Unable to record, the Setting Name is already exist', 'error');
							} else {
								swal({
									title: 'Confirmation',
									text: 'This action will update the setting data and configuration, please confirm',
									icon: 'warning',
									buttons: ['No', 'Yes'],
									dangerMode: true,
								}).then((willUpdate) => {
									if (willUpdate) {
										setFormIsdirty(false);
										_postTransaction();
									}
								});
							}
						} else {
							swal('Failed', 'Connection error Please close the form and try again 1', 'error');
						}
					})
					.catch(() => {
						swal('Failed', 'Connection error Please close the form and try again 2', 'error');
					});
			}
			setSubmitting(false);
		},
	});

	//	Methods
	const _viewGoalTypeConfig = (campaignSettingId: number, goalTypeName: string, paramGoalTypeGuidId: string) => {
		setCampaignSettingId(campaignSettingId);
		setGoalTypeName(goalTypeName);
		setModalViewShow(true);
		setGoalTypeGuidId(paramGoalTypeGuidId);
	};

	const _clearStorage = () => {
		dispatch(campaignGoalSetting.actions.goalTypeCommnunicationRecordDepositList([]));
		dispatch(campaignGoalSetting.actions.goalTypeCommunicationRecordList([]));
		dispatch(campaignGoalSetting.actions.goalTypeDepositCurrencyList([]));
		dispatch(campaignGoalSetting.actions.goalTypeDepositList([]));
		setRowData([]);
		setSelectedGoalAmount(0);
	};

	const _edit = (paramGoalTypeName: string, paramGoalTypeGuidId: string) => {
		setAction('Edit');
		setModalShow(true);
		setGoalTypeName(paramGoalTypeName);
		setGoalTypeGuidId(paramGoalTypeGuidId);
	};

	const _dispatchData = (
		goalTypeCommunicationRecordListResponseModel: Array<GoalTypeCommunicationRecordUdtModel>,
		goalTypeDepositListResponseModel: Array<GoalTypeDepositUdtModel>,
		goalTypeDepositCurrencyMinMaxListResponseModel: Array<GoalTypeDepositCurrencyMinMaxUdtModel>,
		communicationRecordDepositLisResponseModel: Array<CommunicationRecordDepositListModel>,
		activeEndedCampaignListResponseModel: Array<ActiveEndedCampaignListModel>
	) => {
		//Parent
		communicationRecordDepositLisResponseModel.forEach((cd) => {
			cd.goalTypeGuid = Guid.create().toString();
		});

		dispatch(
			campaignGoalSetting.actions.goalTypeCommnunicationRecordDepositList(
				communicationRecordDepositLisResponseModel !== undefined ? communicationRecordDepositLisResponseModel : []
			)
		);

		//Commnunication Record
		goalTypeCommunicationRecordListResponseModel.forEach((c) => {
			let communincationGuid = communicationRecordDepositLisResponseModel
				.filter((obj) => obj.goalTypeId === c.goalTypeId && obj.goalTypeCommunicationRecordDepositId === c.goalTypeCommunicationRecordId)
				.map((obj) => obj.goalTypeGuid)
				.toString();
			c.communicationGuid = communincationGuid;
		});

		goalTypeCommunicationRecordListResponseModel.forEach((c) => {
			c.campaignSettingId = 0;
			c.goalTypeCommunicationRecordId = 0;
		});
		dispatch(
			campaignGoalSetting.actions.goalTypeCommunicationRecordList(
				goalTypeCommunicationRecordListResponseModel !== undefined ? goalTypeCommunicationRecordListResponseModel : []
			)
		);

		//Deposit
		goalTypeDepositListResponseModel.forEach((d) => {
			d.depositGuid = communicationRecordDepositLisResponseModel
				.filter((obj) => obj.goalTypeId === d.goalTypeId && obj.goalTypeCommunicationRecordDepositId === d.goalTypeDepositId)
				.map((obj) => obj.goalTypeGuid)
				.toString();
		});

		dispatch(campaignGoalSetting.actions.goalTypeDepositList(goalTypeDepositListResponseModel !== undefined ? goalTypeDepositListResponseModel : []));

		//Deposit Currency
		goalTypeDepositCurrencyMinMaxListResponseModel.forEach((c) => {
			c.depositGuid = goalTypeDepositListResponseModel
				.filter((d) => d.goalTypeDepositId === c.goalTypeDepositId)
				.map((c) => c.depositGuid)
				.toString();
		});

		dispatch(
			campaignGoalSetting.actions.goalTypeDepositCurrencyList(
				goalTypeDepositCurrencyMinMaxListResponseModel !== undefined ? goalTypeDepositCurrencyMinMaxListResponseModel : []
			)
		);

		//RESET IDS TO 0
		//Deposit
		goalTypeDepositListResponseModel.forEach((d) => {
			d.campaignSettingId = 0;
			d.goalTypeDepositId = 0;
		});
		dispatch(campaignGoalSetting.actions.goalTypeDepositList(goalTypeDepositListResponseModel !== undefined ? goalTypeDepositListResponseModel : []));

		//Deposit Currency
		goalTypeDepositCurrencyMinMaxListResponseModel.forEach((c) => {
			c.goalTypeDepositCurrencyMinMaxId = 0;
			c.goalTypeDepositId = 0;
		});

		dispatch(
			campaignGoalSetting.actions.goalTypeDepositCurrencyList(
				goalTypeDepositCurrencyMinMaxListResponseModel !== undefined ? goalTypeDepositCurrencyMinMaxListResponseModel : []
			)
		);
	};

	const _getGoalSettingId = () => {
		let pageId: number = 0;
		const pathArray = window.location.pathname.split('/');
		if (pathArray.length >= 4) {
			pageId = parseInt(pathArray[4]);
		} else {
			pageId = 0;
		}

		return pageId;
	};

	const _removeGoalTypeConfig = (paramGoalTypeName: string, paramGoalTypeGuidId: string) => {
		//Parent
		let removeGoalTypeCommnunicationRecordDeposit = [];
		removeGoalTypeCommnunicationRecordDeposit = goalTypeCommnunicationRecordDepositListData.filter(
			(cd: any) => cd.goalTypeGuid !== paramGoalTypeGuidId
		);
		dispatch(
			campaignGoalSetting.actions.goalTypeCommnunicationRecordDepositList(
				removeGoalTypeCommnunicationRecordDeposit !== undefined ? removeGoalTypeCommnunicationRecordDeposit : []
			)
		);

		if (paramGoalTypeName === COMMUNICATION_RECORD) {
			let removeCommunicationRecord = [];
			removeCommunicationRecord = goalTypeCommunicationRecordListData.filter(
				(obj: any) => obj.goalTypeName !== paramGoalTypeName && obj.communicationGuid !== paramGoalTypeGuidId
			);
			dispatch(campaignGoalSetting.actions.goalTypeCommunicationRecordList(removeCommunicationRecord !== undefined ? removeCommunicationRecord : []));
		} else {
			//Deposit
			let removeDeposit = [];
			removeDeposit = goalTypeDepositListData.filter((obj: any) => obj.goalTypeName !== paramGoalTypeName && obj.depositGuid !== paramGoalTypeGuidId);
			dispatch(campaignGoalSetting.actions.goalTypeDepositList(removeDeposit));

			//Currency
			let removeCurrency = [];
			removeCurrency = goalTypeDepositCurrencyListData.filter((obj: any) => obj.depositGuid !== paramGoalTypeGuidId);
			dispatch(campaignGoalSetting.actions.goalTypeDepositCurrencyList(removeCurrency !== undefined ? removeCurrency : []));
		}
	};

	const onChangeGoalParameterAmount = (val: string | any) => {
		setGoalParameterAmount(val);
	};

	const onChangeGoalParameterCount = (val: string | any) => {
		setGoalParameterCount(val);
	};

	const onChangeSettingStatus = (params: LookupModel) => {
		setSelectedSettingStatus(params);
	};

	const tableLoader = (data: any) => {
		return (
			<div className='ag-custom-loading-cell' style={{paddingLeft: '10px', lineHeight: '25px'}}>
				<i className='fas fa-spinner fa-pulse'></i> <span> {data.loadingMessage}</span>
			</div>
		);
	};

	const onGridReady = (params: any) => {
		setGridApi(params.api);
		setGridColumnApi(params.columnApi);
		params.api.paginationGoToPage(4);
		params.api.sizeColumnsToFit();
	};

	const _back = () => {
		setFormIsdirty(false);
		swal({
			title: 'Confirmation',
			text: 'Any changes will be discarded, please confirm',
			icon: 'warning',
			buttons: ['No', 'Yes'],
			dangerMode: true,
		}).then((willUpdate) => {
			setFormIsdirty(true);
			if (willUpdate) {
				setFormIsdirty(false);
				_clearStorage();
				history.push('/campaign-management/campaign-setting/campaign-goal');
			} else {
				setFormIsdirty(true);
			}
		});
	};

	const _getCampaignGoalSettingById = () => {
		setTimeout(() => {
			//FETCH TO API
			const messagingHub = hubConnection.createHubConnenction();
			messagingHub
				.start()
				.then(() => {
					// CHECKING STATE CONNECTION
					if (messagingHub.state === CONNECTED) {
						const request: CampaignGoalSettingIdRequestModel = {
							campaignSettingId: _getGoalSettingId(),
							userId: userAccessId.toString(),
							queueId: Guid.create().toString(),
						};

						SendGetCampaignGoalSettingById(request)
							.then((response) => {
								// IF REQUEST IS SUCCESS THEN CONSUME CALLBACK API
								if (response.status === 200) {
									messagingHub.on(request.queueId.toString(), (message) => {
										GetCampaignGoalSettingById(message.cacheId)
											.then((data) => {
												let responseData = data.data;

												formik.setFieldValue('settingName', '');
												formik.setFieldValue('settingDescription', responseData.campaignGoalSettingList.campaignSettingDescription);
												setSelectedSettingStatus(
													responseData.campaignGoalSettingList.campaignSettingStatus === 'True'
														? {label: 'Active', value: '1'}
														: {label: 'Inactive', value: '0'}
												);
												setGoalParameterAmount(
													responseData.campaignGoalSettingList.goalParameterAmountId === 0
														? []
														: {
																label: responseData.campaignGoalSettingList.goalParameterAmountName,
																value: responseData.campaignGoalSettingList.goalParameterAmountId,
														  }
												);
												setGoalParameterCount(
													responseData.campaignGoalSettingList.goalParameterCountId === 0
														? []
														: {
																label: responseData.campaignGoalSettingList.goalParameterCountName,
																value: responseData.campaignGoalSettingList.goalParameterCountId,
														  }
												);

												_dispatchData(
													responseData.goalTypeCommunicationRecordList,
													responseData.goalTypeDepositList,
													responseData.goalTypeDepositCurrencyMinMaxList,
													responseData.communicationRecordDepositList,
													responseData.campaignList
												);

												setLoading(false);
											})
											.catch(() => {
												setLoading(false);
											});
										messagingHub.off(request.queueId.toString());
										messagingHub.stop();
									});

									setTimeout(() => {
										if (messagingHub.state === CONNECTED) {
											messagingHub.stop();
											setLoading(false);
										}
									}, 30000);
								} else {
									messagingHub.stop();
									swal('Failed', response.data.message, 'error');
								}
							})
							.catch(() => {
								messagingHub.stop();
								swal('Failed', 'Problem in getting message type list', 'error');
							});
					}
				})
				.catch((err) => console.log('Error while starting connection: ' + err));
		}, 1000);
	};

	const _postTransaction = () => {
		setTimeout(() => {
			//FETCH TO API
			const messagingHub = hubConnection.createHubConnenction();
			messagingHub
				.start()
				.then(() => {
					// CHECKING STATE CONNECTION
					if (messagingHub.state === CONNECTED) {
						const request: CampaignGoalSettingRequestModel = {
							userId: userAccessId.toString(),
							queueId: Guid.create().toString(),
							campaignSettingId: 0,
							campaignSettingName: formik.values.settingName,
							campaignSettingDescription: formik.values.settingDescription,
							isActive: selectedSettingStatus?.value === '1' ? true : false,
							goalTypeCommunicationRecordList: goalTypeCommunicationRecordListData,
							goalTypeDepositList: goalTypeDepositListData,
							goalTypeDepositCurrencyMinMaxList: goalTypeDepositCurrencyListData,
							goalParameterAmountId:
								goalParameterAmount.value === '' || goalParameterAmount.value === undefined ? 0 : parseInt(goalParameterAmount.value),
							goalParameterCountId:
								goalParameterCount.value === '' || goalParameterCount.value === undefined ? 0 : parseInt(goalParameterCount.value),
							createdBy: userAccessId,
							updatedBy: userAccessId,
						};
						SendAddCampaignGoalSettingAsync(request)
							.then((response) => {
								//IF REQUEST IS SUCCESS THEN CONSUME CALLBACK API
								if (response.status === 200) {
									messagingHub.on(request.queueId.toString(), (message) => {
										let resultData = JSON.parse(message.remarks);

										if (resultData.Status === 200) {
											swal('Success', 'Transaction successfully submitted', 'success');
											_clearStorage();
											let campaignSettingId = resultData.Data;

											history.push(`/campaign-management/campaign-setting/view-campaign-goal/${campaignSettingId}`);
										} else {
											swal('Failed', 'Problem connecting to the server, Please refresh', 'error');
											_clearStorage();
										}

										messagingHub.off(request.queueId.toString());
										messagingHub.stop();
									});

									setTimeout(() => {
										if (messagingHub.state === CONNECTED) {
											messagingHub.stop();
											setLoading(false);
										}
									}, 30000);
								} else {
									messagingHub.stop();
									swal('Failed', response.data.message, 'error');
								}
							})
							.catch(() => {
								messagingHub.stop();
								swal('Failed', 'Problem in adding goal type', 'error');
							});
					}
				})
				.catch((err) => console.log('Error while starting connection: ' + err));
		}, 1000);
	};

	const _closeModal = () => {
		setFormIsdirty(false);
		swal({
			title: 'Confirmation',
			text: 'Any changes will be discarded, please confirm',
			icon: 'warning',
			buttons: ['No', 'Yes'],
			dangerMode: true,
		}).then((willUpdate) => {
			if (willUpdate) {
				setModalShow(false);
				setModalViewShow(false);
				setFormIsdirty(true);
			}
		});
	};

	const columnDefs = [
		{headerName: 'Sequence', field: 'sequenceName', sort: 'asc' as 'asc'},
		{
			headerName: 'Goal Type',
			field: 'goalTypeName',
			width: 400,
			cellRenderer: (params: any) => (
				<>
					<GridLinkButton
						access={userAccess.includes(USER_CLAIMS.ViewGoalSettingRead)}
						title={params.data.goalTypeName}
						disabled={false}
						onClick={() => _viewGoalTypeConfig(params.data.campaignSettingId, params.data.goalTypeName, params.data.goalTypeGuid)}
					/>
				</>
			),
		},
		{headerName: 'Data Source', field: 'goalTypeDataSourceName'},
		{headerName: 'Period', field: 'goalTypePeriodName'},
		{
			headerName: 'Action',
			cellRenderer: (params: any) => (
				<>
					{params.data.messageResponseId != 0 ? (
						<ButtonGroup aria-label='Basic example'>
							<div className='d-flex justify-content-center flex-shrink-0'>
								<div className='me-4'>
									<TableIconButton
										access={userAccess.includes(USER_CLAIMS.ViewGoalSettingWrite)}
										faIcon={faPencilAlt}
										toolTipText={'Edit'}
										onClick={() => _edit(params.data.goalTypeName, params.data.goalTypeGuid)}
									/>
								</div>
								<div className='me-4'>
									<TableIconButton
										access={userAccess.includes(USER_CLAIMS.ViewGoalSettingWrite)}
										faIcon={faTrash}
										iconColor={'text-danger'}
										toolTipText={'Remove'}
										onClick={() => _removeGoalTypeConfig(params.data.goalTypeName, params.data.goalTypeGuid)}
									/>
								</div>
							</div>
						</ButtonGroup>
					) : null}
				</>
			),
		},
	];

	const _add = () => {
		setAction('Add');
		setModalShow(true);
	};

	//	Return
	return (
		<FormContainer onSubmit={formik.handleSubmit}>
			<MainContainer>
				<Prompt when={formIsdirty} message='Any changes will be discarded, please confirm?'></Prompt>
				<FormHeader headerLabel={'Add Campaign Goal Setting'} />
				<ContentContainer>
					<FormGroupContainer>
						<div className='col-lg-3'>
							<label className='form-label'>Setting Name</label>
							<input type='text' className='form-control form-control-sm' aria-label='Setting Name' {...formik.getFieldProps('settingName')} />
						</div>
						<div className='col-lg-6'>
							<label className='form-label'>Setting Description</label>
							<input
								type='text'
								className='form-control form-control-sm'
								aria-label='Setting Description'
								{...formik.getFieldProps('settingDescription')}
							/>
						</div>
						<div className='col-lg-3'>
							<label className='form-label'>Setting Status</label>
							<Select
								size='small'
								style={{width: '100%'}}
								options={CommonLookups('settingStatuses')}
								onChange={onChangeSettingStatus}
								value={selectedSettingStatus}
							/>
						</div>
					</FormGroupContainer>
					<hr />
					<div className='col-lg-12'>
						<label className='form-label'>
							<b>Goal Type Configuration</b>
						</label>
					</div>

					<div className='ag-theme-quartz' style={{height: 300, width: '100%'}}>
						<AgGridReact
							rowData={rowData}
							defaultColDef={{
								sortable: true,
								resizable: true,
							}}
							components={{
								tableLoader: tableLoader,
							}}
							onGridReady={onGridReady}
							rowBuffer={0}
							enableRangeSelection={true}
							pagination={true}
							paginationPageSize={10}
							columnDefs={columnDefs}
						/>
					</div>
					<FieldContainer>
						<ButtonsContainer>
							<DefaultButton access={userAccess.includes(USER_CLAIMS.ViewGoalSettingWrite)} title={'Add'} onClick={() => _add()} />
						</ButtonsContainer>
					</FieldContainer>
					<hr />
					<div className='col-lg-12'>
						<label className='form-label'>
							<b>Goal Parameters</b>
						</label>
					</div>
					<FormGroupContainer>
						<div className='col-lg-4'>
							<label className='form-label'>Amount</label>
							<Select
								isDisabled={
									goalTypeCommnunicationRecordDepositListData === undefined
										? true
										: goalTypeCommnunicationRecordDepositListData.filter((obj: any) => obj.goalTypeName === DEPOSIT).length === 0
								}
								size='small'
								style={{width: '100%'}}
								options={selectedGoalAmount != 0 ? goalParameterOptions.filter((obj: any) => obj.value == selectedGoalAmount) : goalParameterOptions}
								onChange={onChangeGoalParameterAmount}
								value={goalParameterAmount}
							/>
						</div>
						<div className='col-lg-4'>
							<label className='form-label'>Count</label>
							<Select
								isDisabled={
									goalTypeCommnunicationRecordDepositListData === undefined
										? true
										: goalTypeCommnunicationRecordDepositListData.filter((obj: any) => obj.goalTypeName === COMMUNICATION_RECORD).length === 0
								}
								size='small'
								style={{width: '100%'}}
								options={masterReference.filter((obj) => obj.masterReferenceParentId == 49).map((obj) => obj.options)}
								onChange={onChangeGoalParameterCount}
								value={goalParameterCount}
							/>
						</div>
					</FormGroupContainer>
					<hr />
					<PaddedContainer>
						<FieldContainer>
							<ButtonsContainer>
								<LoaderButton
									access={userAccess.includes(USER_CLAIMS.ViewGoalSettingWrite)}
									loading={formik.isSubmitting}
									title={'Submit'}
									loadingTitle={' Please wait... '}
									disabled={formik.isSubmitting}
								/>
								<DefaultSecondaryButton access={userAccess.includes(USER_CLAIMS.ViewGoalSettingRead)} title={'Back'} onClick={_back} />
							</ButtonsContainer>
						</FieldContainer>
					</PaddedContainer>
				</ContentContainer>

				<AddEditGoalTypeConfigModal
					showForm={modalShow}
					closeModal={_closeModal}
					action={action}
					goalTypeGuidId={goalTypeGuidId}
					goalTypeName={goalTypeName}
				/>
				<ViewGoalTypeConfigModal
					showFormView={modalViewShow}
					closeModal={_closeModal}
					campaignSettingId={campaignSettingId}
					goalTypeGuidId={goalTypeGuidId}
					goalTypeName={goalTypeName}
				/>
			</MainContainer>
		</FormContainer>
	);
};

export default AddGoalSetting;

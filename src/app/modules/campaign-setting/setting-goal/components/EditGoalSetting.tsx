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
import useConstant from '../../../../constants/useConstant';
import {
	ButtonsContainer,
	ContentContainer,
	DefaultPrimaryButton,
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
import {useFormattedDate, useMasterReferenceOption} from '../../../../custom-functions';
import CommonLookups from '../../../../custom-functions/CommonLookups';
import {usePromptOnUnload} from '../../../../custom-helpers';
import {
	CampaignSettingStatus,
	GoalSettingCommons,
	GoalSettingFields,
	GoalSettingHeaders,
	MasterReference,
	MasterReferenceChild,
} from '../../../system/components/constants/CampaignSetting';
import {USER_CLAIMS} from '../../../user-management/components/constants/UserClaims';
import {
	ActiveEndedCampaignListModel,
	CampaignGoalSettingIdRequestModel,
	CampaignGoalSettingListModel,
	CampaignGoalSettingRequestModel,
	CommunicationRecordDepositListModel,
	GoalTypeCommunicationRecordUdtModel,
	GoalTypeDepositCurrencyMinMaxUdtModel,
	GoalTypeDepositUdtModel,
} from '../models';
import * as campaignGoalSetting from '../redux/GoalSettingRedux';
import {GetCampaignGoalSettingById, SendAddCampaignGoalSettingAsync, SendGetCampaignGoalSettingById} from '../service/CampaignGoalSettingApi';
import AddEditGoalTypeConfigModal from './AddEditGoalTypeConfigModal';
import ViewGoalTypeConfigModal from './ViewGoalTypeConfigModal';

const initialValues = {
	settingName: '',
	settingDescription: '',
};

const FormSchema = Yup.object().shape({
	name: Yup.string(),
});

const EditGoalSetting: React.FC = () => {
	//  Get redux store
	const userAccess = useSelector<RootState>(({auth}) => auth.access, shallowEqual) as string;
	const userAccessId = useSelector<RootState>(({auth}) => auth.userId, shallowEqual) as number;
	const {HubConnected, successResponse} = useConstant();

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
	const goalTypeCampaignGoalSettingByIdData = useSelector<RootState>(
		({campaignGoalSetting}) => campaignGoalSetting.goalTypeCampaignGoalSettingByIdData,
		shallowEqual
	) as any;
	const goalTypeActiveEndedCampaignListData = useSelector<RootState>(
		({campaignGoalSetting}) => campaignGoalSetting.goalTypeActiveEndedCampaignList,
		shallowEqual
	) as any;

	//  States
	const [selectedSettingStatus, setSelectedSettingStatus] = useState<LookupModel | null>();
	const [gridApi, setGridApi] = useState<any | null>(null);
	const [gridColumnApi, setGridColumnApi] = useState(null);
	const [loading, setLoading] = useState<boolean>(false);
	const [rowData, setRowData] = useState<Array<CommunicationRecordDepositListModel>>([]);
	const [rowCampaignData, setRowCampaignData] = useState<Array<ActiveEndedCampaignListModel>>([]);
	const [modalShow, setModalShow] = useState<boolean>(false);
	const [modalViewShow, setModalViewShow] = useState<boolean>(false);
	const [goalParameterAmount, setGoalParameterAmount] = useState<string | any>('');
	const [goalParameterCount, setGoalParameterCount] = useState<string | any>('');
	const [campaignSettingId, setCampaignSettingId] = useState<number | any>('');
	const [goalTypeName, setGoalTypeName] = useState<string | any>('');
	const [action, setAction] = useState<string | any>('');
	const [goalTypeGuidId, setGoalTypeGuidId] = useState<string | any>('');
	const [formIsdirty, setFormIsdirty] = useState<boolean>(true);
	const masterReference = useMasterReferenceOption(`${MasterReference.GoalParameterCount},${MasterReference.GoalParameterAmount}`);
	const [selectedGoalAmount, setSelectedGoalAmount] = useState<number | any>(0);

	//  Variables
	const history = useHistory();
	const dispatch = useDispatch();
	usePromptOnUnload(true, 'Any changes will be discarded, please confirm?');

	const goalParameterOptions = masterReference
		.filter((obj) => obj.masterReferenceParentId == MasterReference.GoalParameterAmount)
		.map((obj) => obj.options);

	const isCamapaigActiveEnded: boolean =
		goalTypeActiveEndedCampaignListData === undefined
			? false
			: goalTypeActiveEndedCampaignListData.filter((obj: any) => obj.campaignStatus === GoalSettingCommons.ACTIVE || obj.campaignStatus === 'Ended')
					.length > 0;

	//  Watcher
	useEffect(() => {
		_getCampaignGoalSettingById();
		return () => {
			_clearStorage();
		};
	}, []);

	useEffect(() => {
		setModalShow(false);
		setModalViewShow(false);
		setRowData(goalTypeCommnunicationRecordDepositListData);

		if (
			goalTypeCommnunicationRecordDepositListData === undefined
				? true
				: goalTypeCommnunicationRecordDepositListData.filter((obj: any) => obj.goalTypeName === GoalSettingCommons.DEPOSIT).length === 0
		) {
			setGoalParameterAmount([]);
		}

		if (
			goalTypeCommnunicationRecordDepositListData === undefined
				? true
				: goalTypeCommnunicationRecordDepositListData.filter((obj: any) => obj.goalTypeName === GoalSettingCommons.COMMUNICATION_RECORD).length === 0
		) {
			setGoalParameterCount([]);
		}

		if (goalTypeCommnunicationRecordDepositListData !== undefined) {
			const countFTD = goalTypeCommnunicationRecordDepositListData.filter(
				(obj: any) => obj.goalTypeDataSourceName == GoalSettingCommons.FIRST_TIME_DEPOSIT_DATE && obj.goalTypeName === GoalSettingCommons.DEPOSIT
			).length;
			const countInitDeposit = goalTypeCommnunicationRecordDepositListData.filter(
				(obj: any) => obj.goalTypeDataSourceName == GoalSettingCommons.UPDATED_DATE && obj.goalTypeName === GoalSettingCommons.DEPOSIT
			).length;
			const countDeposit = goalTypeCommnunicationRecordDepositListData.filter((gl: any) => gl.goalTypeName === GoalSettingCommons.DEPOSIT).length;

			if (countFTD === countDeposit) {
				setSelectedGoalAmount(MasterReferenceChild.FirstTimeDepositAmount);
			} else if (countInitDeposit === countDeposit) {
				setSelectedGoalAmount(MasterReferenceChild.InitialDepositAmount);
			} else {
				setSelectedGoalAmount(0);
			}
		}
	}, [goalTypeCommnunicationRecordDepositListData]);

	//  Formik Post
	const formik = useFormik({
		initialValues,
		validationSchema: FormSchema,
		onSubmit: async (values, {setStatus, setSubmitting, resetForm}) => {
			if (_validate() === true) {
				swal('Error', 'Unable to proceed, kindly fill up all mandatory fields', 'error');
			} else {
				swal({
					title: 'Confirmation',
					text: 'This action will update the setting data and configuration, please confirm',
					icon: 'warning',
					buttons: ['No', 'Yes'],
					dangerMode: true,
				}).then((confirmAction) => {
					if (confirmAction) {
						setFormIsdirty(false);
						_postTransaction();
					}
				});
			}
			setLoading(true);
		},
	});

	//  Methods
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

		if (goalTypeCommnunicationRecordDepositListData.length === 0) {
			return true;
		}

		if (goalTypeCommnunicationRecordDepositListData.filter((obj: any) => obj.goalTypeName === GoalSettingCommons.DEPOSIT).length !== 0) {
			if (
				goalParameterAmount.value === '' ||
				goalParameterAmount.value === undefined ||
				goalParameterAmount.value === 0 ||
				goalParameterAmount.length === 0
			) {
				return true;
			}
		}

		if (goalTypeCommnunicationRecordDepositListData.filter((obj: any) => obj.goalTypeName === GoalSettingCommons.COMMUNICATION_RECORD).length !== 0) {
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

	const _dispatchData = (
		goalTypeCommunicationRecordListResponseModel: Array<GoalTypeCommunicationRecordUdtModel>,
		goalTypeDepositListResponseModel: Array<GoalTypeDepositUdtModel>,
		goalTypeDepositCurrencyMinMaxListResponseModel: Array<GoalTypeDepositCurrencyMinMaxUdtModel>,
		communicationRecordDepositLisResponseModel: Array<CommunicationRecordDepositListModel>,
		activeEndedCampaignListResponseModel: Array<ActiveEndedCampaignListModel>,
		campaignGoalSettingListModel: CampaignGoalSettingListModel
	) => {
		//Header Details
		dispatch(campaignGoalSetting.actions.goalTypeCampaignGoalSettingByIdData(campaignGoalSettingListModel));

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

		//Active Ended Campaign
		dispatch(campaignGoalSetting.actions.goalTypeActiveEndedCampaignList(activeEndedCampaignListResponseModel));
	};

	const _getCampaignGoalSettingById = () => {
		setTimeout(() => {
			setRowData([]);
			//FETCH TO API
			const messagingHub = hubConnection.createHubConnenction();
			messagingHub
				.start()
				.then(() => {
					// CHECKING STATE CONNECTION
					if (messagingHub.state === HubConnected) {
						const request: CampaignGoalSettingIdRequestModel = {
							campaignSettingId: _getGoalSettingId(),
							userId: userAccessId.toString(),
							queueId: Guid.create().toString(),
						};

						SendGetCampaignGoalSettingById(request)
							.then((response) => {
								// IF REQUEST IS SUCCESS THEN CONSUME CALLBACK API
								if (response.status === successResponse) {
									messagingHub.on(request.queueId.toString(), (message) => {
										GetCampaignGoalSettingById(message.cacheId)
											.then((data) => {
												let responseData = data.data;

												formik.setFieldValue('settingName', responseData.campaignGoalSettingList.campaignSettingName);
												formik.setFieldValue('settingDescription', responseData.campaignGoalSettingList.campaignSettingDescription);
												setSelectedSettingStatus(
													responseData.campaignGoalSettingList.campaignSettingStatus === 'True'
														? {label: GoalSettingCommons.ACTIVE, value: CampaignSettingStatus.Active}
														: {label: GoalSettingCommons.INACTIVE, value: CampaignSettingStatus.Inactive}
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
													responseData.campaignList,
													responseData.campaignGoalSettingList
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
										if (messagingHub.state === HubConnected) {
											messagingHub.stop();
											setLoading(false);
										}
									}, 30000);
								} else {
									messagingHub.stop();
									swal(GoalSettingCommons.FAILED, response.data.message, 'error');
								}
							})
							.catch(() => {
								messagingHub.stop();
								swal(GoalSettingCommons.FAILED, 'Problem in getting message type list', 'error');
							});
					}
				})
				.catch((err) => console.log('Error while starting connection: ' + err));
		}, 1000);
	};

	const _clearStorage = () => {
		setSelectedGoalAmount(0);
		setRowData([]);
		dispatch(campaignGoalSetting.actions.goalTypeCommnunicationRecordDepositList([]));
		dispatch(campaignGoalSetting.actions.goalTypeCommunicationRecordList([]));
		dispatch(campaignGoalSetting.actions.goalTypeDepositCurrencyList([]));
		dispatch(campaignGoalSetting.actions.goalTypeDepositList([]));
		dispatch(campaignGoalSetting.actions.goalTypeActiveEndedCampaignList([]));
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

	const removeGoalTypeConfig = (communicationRecordDepositId: number, goalTypeName: string, paramGoalTypeGuidId: string) => {
		if (isCamapaigActiveEnded === false) {
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

			if (goalTypeName === GoalSettingCommons.COMMUNICATION_RECORD) {
				let removeCommunicationRecord = [];

				removeCommunicationRecord = goalTypeCommunicationRecordListData.filter(
					(obj: any) => obj.goalTypeName !== goalTypeName && obj.communicationGuid !== paramGoalTypeGuidId
				);

				dispatch(
					campaignGoalSetting.actions.goalTypeCommunicationRecordList(removeCommunicationRecord !== undefined ? removeCommunicationRecord : [])
				);
			} else {
				//Deposit
				let removeDeposit = [];

				removeDeposit = goalTypeDepositListData.filter((obj: any) => obj.goalTypeName !== goalTypeName && obj.depositGuid !== paramGoalTypeGuidId);

				dispatch(campaignGoalSetting.actions.goalTypeDepositList(removeDeposit));

				//Currency
				let removeCurrency = [];

				removeCurrency = goalTypeDepositCurrencyListData.filter((obj: any) => obj.depositGuid !== paramGoalTypeGuidId);

				dispatch(campaignGoalSetting.actions.goalTypeDepositCurrencyList(removeCurrency !== undefined ? removeCurrency : []));
			}
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
		setRowData(goalTypeCommnunicationRecordDepositListData);
		params.api.sizeColumnsToFit();
	};

	const onGridCampaignReady = (params: any) => {
		setRowCampaignData(goalTypeActiveEndedCampaignListData);
	};

	const _back = () => {
		setFormIsdirty(false);
		swal({
			title: 'Confirmation',
			text: 'Any changes will be discarded, please confirm',
			icon: 'warning',
			buttons: ['No', 'Yes'],
			dangerMode: true,
		}).then((confirmAction) => {
			if (confirmAction) {
				setFormIsdirty(false);
				_clearStorage();
				history.push('/campaign-management/campaign-setting/campaign-goal');
			} else {
				setFormIsdirty(true);
			}
		});
	};

	const _postTransaction = () => {
		setTimeout(() => {
			//FETCH TO API
			const messagingHub = hubConnection.createHubConnenction();
			messagingHub
				.start()
				.then(() => {
					// CHECKING STATE CONNECTION
					if (messagingHub.state === HubConnected) {
						const request: CampaignGoalSettingRequestModel = {
							userId: userAccessId.toString(),
							queueId: Guid.create().toString(),
							campaignSettingId: _getGoalSettingId(),
							campaignSettingName: formik.values.settingName,
							campaignSettingDescription: formik.values.settingDescription,
							isActive: selectedSettingStatus?.value === CampaignSettingStatus.Active ? true : false,
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
								if (response.status === successResponse) {
									messagingHub.on(request.queueId.toString(), (message) => {
										let resultData = JSON.parse(message.remarks);

										if (resultData.Status === successResponse) {
											swal(GoalSettingCommons.SUCCESS, 'Transaction successfully submitted', 'success');
											_clearStorage();
											let campaignSettingId = resultData.Data;

											history.push(`/campaign-management/campaign-setting/view-campaign-goal/${campaignSettingId}`);
										} else {
											swal(GoalSettingCommons.FAILED, 'Problem connecting to the server, Please refresh', 'error');
											_clearStorage();
										}

										messagingHub.off(request.queueId.toString());
										messagingHub.stop();
									});

									setTimeout(() => {
										if (messagingHub.state === HubConnected) {
											messagingHub.stop();
											setLoading(false);
										}
									}, 30000);
								} else {
									messagingHub.stop();
									swal(GoalSettingCommons.FAILED, response.data.message, 'error');
								}
							})
							.catch(() => {
								messagingHub.stop();
								swal(GoalSettingCommons.FAILED, 'Problem in adding goal type', 'error');
							});
					}
				})
				.catch((err) => console.log('Error while starting connection: ' + err));
		}, 1000);
	};

	const _closeModal = () => {
		setFormIsdirty(false);

		if (isCamapaigActiveEnded === true) {
			setModalShow(false);
			setModalViewShow(false);
			setFormIsdirty(false);
		} else {
			swal({
				title: 'Confirmation',
				text: 'Any changes will be discarded, please confirm',
				icon: 'warning',
				buttons: ['No', 'Yes'],
				dangerMode: true,
			}).then((confirmAction) => {
				if (confirmAction) {
					setModalShow(false);
					setModalViewShow(false);
					setFormIsdirty(true);
				}
			});
		}
	};

	const _viewGoalTypeConfig = (campaignSettingId: number, goalTypeName: string, paramGoalTypeGuidId: string) => {
		setCampaignSettingId(campaignSettingId);
		setGoalTypeName(goalTypeName);
		setModalViewShow(true);
		setGoalTypeGuidId(paramGoalTypeGuidId);
	};

	const _viewCampaign = (campaignId: number) => {
		const win: any = window.open(`/campaign-management/campaign/view/${campaignId}`, '_blank');
		win.focus();
	};

	const columnCampaignDefs = [
		{headerName: GoalSettingHeaders.HEADER_NO, data: GoalSettingFields.FIELD_NO, width: 100},
		{
			headerName: GoalSettingHeaders.HEADER_CAMPAIGN_NAME,
			data: GoalSettingFields.FIELD_CAMPAIGN_NAME,
			cellRenderer: (params: any) => (
				<>
					<GridLinkButton
						access={userAccess.includes(USER_CLAIMS.ViewGoalSettingRead)}
						title={params.data.campaignName}
						disabled={false}
						onClick={() => _viewCampaign(params.data.campaignId)}
					/>
				</>
			),
		},
		{headerName: GoalSettingHeaders.HEADER_CAMPAIGN_STATUS, data: GoalSettingFields.FIELD_CAMPAIGN_STATUS},
		{headerName: GoalSettingHeaders.HEADER_CAMPAIGN_REPORT_PERIOD, data: GoalSettingFields.FIELD_CAMPAIGN_REPORT_PERIOD, width: 300},
	];

	const columnDefs = [
		{headerName: GoalSettingHeaders.HEADER_SEQUENCE, data: GoalSettingFields.FIELD_SEQUENCE, sort: GoalSettingCommons.ASC as 'asc'},
		{
			headerName: GoalSettingHeaders.HEADER_GOAL_TYPE,
			data: GoalSettingFields.FIELD_GOAL_TYPE,
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
		{headerName: GoalSettingHeaders.HEADER_DATA_SOURCE, data: GoalSettingFields.FIELD_DATA_SOURCE},
		{headerName: GoalSettingHeaders.HEADER_PERIOD, data: GoalSettingFields.FIELD_PERIOD},
		{
			headerName: GoalSettingHeaders.HEADER_ACTION,
			data: GoalSettingFields.FIELD_POSITION,
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
										isDisable={isCamapaigActiveEnded}
										onClick={() => _edit(params.data.goalTypeName, params.data.goalTypeGuid)}
									/>
								</div>
								<div className='me-4'>
									<TableIconButton
										access={userAccess.includes(USER_CLAIMS.ViewGoalSettingWrite)}
										faIcon={faTrash}
										iconColor={isCamapaigActiveEnded === true ? '' : 'text-danger'}
										isDisable={isCamapaigActiveEnded}
										toolTipText={'Remove'}
										onClick={() =>
											removeGoalTypeConfig(params.data.goalTypeCommunicationRecordDepositId, params.data.goalTypeName, params.data.goalTypeGuid)
										}
									/>
								</div>
							</div>
						</ButtonGroup>
					) : null}
				</>
			),
		},
	];

	const _edit = (goalTypeName: string, paramGoalTypeGuidId: string) => {
		if (isCamapaigActiveEnded === false) {
			setAction('Edit');
			setModalShow(true);
			setGoalTypeName(goalTypeName);
			setGoalTypeGuidId(paramGoalTypeGuidId);
		}
	};

	const _add = () => {
		setModalShow(true);
		setAction('Add');
	};

	//	View
	return (
		<FormContainer onSubmit={formik.handleSubmit}>
			<MainContainer>
				<Prompt when={formIsdirty} message='Any changes will be discarded, please confirm?'></Prompt>
				<FormHeader headerLabel={'Edit Campaign Goal Setting'} />
				<ContentContainer>
					<FormGroupContainer>
						<div className='col-lg-3'>
							<label className='form-label'>Setting Name</label>
							<input
								type='text'
								className='form-control form-control-sm'
								aria-label='Setting Name'
								{...formik.getFieldProps('settingName')}
								disabled={isCamapaigActiveEnded}
							/>
						</div>
						<div className='col-lg-6'>
							<label className='form-label'>Setting Description</label>
							<input
								type='text'
								className='form-control form-control-sm'
								aria-label='Setting Description'
								{...formik.getFieldProps('settingDescription')}
								disabled={isCamapaigActiveEnded}
							/>
						</div>
						<div className='col-lg-3'>
							<label className='form-label'>Setting Status</label>
							<Select
								isDisabled={isCamapaigActiveEnded}
								size='small'
								style={{width: '100%'}}
								options={CommonLookups('settingStatuses')}
								onChange={onChangeSettingStatus}
								value={selectedSettingStatus}
							/>
						</div>
					</FormGroupContainer>

					<FormGroupContainer>
						<div className='form-group row mt-9 ml-7'>
							<div className='form-group col-md-3 mb-5'>
								<h2 className='form-label '>Created Date</h2>
								<p className='form-label  fw-bolder'>
									{useFormattedDate(
										goalTypeCampaignGoalSettingByIdData && goalTypeCampaignGoalSettingByIdData.createdDate
											? goalTypeCampaignGoalSettingByIdData.createdDate
											: ''
									)}
								</p>
							</div>
							<div className='form-group row col-md-3 mb-5'>
								<label className='form-label '>Created By</label>
								<label className='form-label fw-bolder'>{goalTypeCampaignGoalSettingByIdData?.createdBy}</label>
							</div>
							<div className='form-group row col-md-3 mb-5'>
								<label className='form-label '>Last Modified Date</label>
								<p className='form-label fw-bolder'>
									{' '}
									{useFormattedDate(
										goalTypeCampaignGoalSettingByIdData && goalTypeCampaignGoalSettingByIdData.updatedDate
											? goalTypeCampaignGoalSettingByIdData.updatedDate
											: ''
									)}
								</p>
							</div>
							<div className='form-group row col-md-3 mb-5'>
								<label className='form-label '>Last Modified By</label>
								<label className='form-label fw-bolder'>{goalTypeCampaignGoalSettingByIdData?.updatedBy}</label>
							</div>
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
							//enableRangeSelection={true} //deprecated in AgGridReactv32.0.0
							pagination={true}
							paginationPageSize={10}
							columnDefs={columnDefs}
						/>
					</div>
					<FieldContainer>
						<ButtonsContainer>
							<DefaultPrimaryButton
								access={userAccess.includes(USER_CLAIMS.ViewGoalSettingWrite)}
								isDisable={isCamapaigActiveEnded}
								title={'Add'}
								onClick={() => _add()}
							/>
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
										: goalTypeCommnunicationRecordDepositListData.filter((obj: any) => obj.goalTypeName === GoalSettingCommons.DEPOSIT).length ===
												0 ||
										  goalTypeCommnunicationRecordDepositListData === undefined ||
										  isCamapaigActiveEnded === true
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
										: goalTypeCommnunicationRecordDepositListData.filter((obj: any) => obj.goalTypeName === GoalSettingCommons.COMMUNICATION_RECORD)
												.length === 0 || isCamapaigActiveEnded === true
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
					{goalTypeActiveEndedCampaignListData !== undefined ? (
						goalTypeActiveEndedCampaignListData.length !== 0 && (
							<>
								<div className='card-title mb-5'>
									<h5 className='fw-bolder m-0'>Active and Ended Campaign</h5>
								</div>
								<div className='ag-theme-quartz' style={{height: 300, width: '100%'}}>
									<AgGridReact
										rowData={rowCampaignData}
										defaultColDef={{
											sortable: true,
											resizable: true,
										}}
										components={{
											tableLoader: tableLoader,
										}}
										onGridReady={onGridCampaignReady}
										rowBuffer={0}
										//enableRangeSelection={true} //deprecated in AgGridReactv32.0.0
										pagination={true}
										paginationPageSize={10}
										columnDefs={columnCampaignDefs}
									/>
								</div>
								<hr />
							</>
						)
					) : (
						<></>
					)}
					<PaddedContainer>
						<FieldContainer>
							<ButtonsContainer>
								<LoaderButton
									access={userAccess.includes(USER_CLAIMS.ViewGoalSettingWrite)}
									loading={formik.isSubmitting}
									title={'Submit'}
									loadingTitle={' Please wait... '}
									disabled={
										goalTypeActiveEndedCampaignListData === undefined
											? false
											: goalTypeActiveEndedCampaignListData.filter(
													(obj: any) => obj.campaignStatus === GoalSettingCommons.ACTIVE || obj.campaignStatus === 'Ended'
											  ).length > 0
									}
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

export default EditGoalSetting;

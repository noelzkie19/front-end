import {faPencilAlt, faTrash} from '@fortawesome/free-solid-svg-icons';
import {AgGridReact} from 'ag-grid-react';
import {useFormik} from 'formik';
import {Guid} from 'guid-typescript';
import React, {useEffect, useState} from 'react';
import {ButtonGroup} from 'react-bootstrap-v5';
import {shallowEqual, useDispatch, useSelector} from 'react-redux';
import {useHistory} from 'react-router-dom';
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
	FieldContainer,
	FormContainer,
	FormGroupContainer,
	FormHeader,
	GridLinkButton,
	MainContainer,
	PaddedContainer,
	TableIconButton,
} from '../../../../custom-components';
import {useFormattedDate, useMasterReferenceOption} from '../../../../custom-functions';
import CommonLookups from '../../../../custom-functions/CommonLookups';
import {
	CampaignSettingStatus,
	GoalSettingCommons,
	GoalSettingFields,
	GoalSettingHeaders,
	MasterReference,
} from '../../../system/components/constants/CampaignSetting';
import {USER_CLAIMS} from '../../../user-management/components/constants/UserClaims';
import {
	ActiveEndedCampaignListModel,
	CampaignGoalSettingIdRequestModel,
	CampaignGoalSettingListModel,
	CommunicationRecordDepositListModel,
	GoalTypeCommunicationRecordUdtModel,
	GoalTypeDepositCurrencyMinMaxUdtModel,
	GoalTypeDepositUdtModel,
} from '../models';
import * as campaignGoalSetting from '../redux/GoalSettingRedux';
import {GetCampaignGoalSettingById, SendGetCampaignGoalSettingById} from '../service/CampaignGoalSettingApi';
import ViewGoalTypeConfigModal from './ViewGoalTypeConfigModal';

const initialValues = {
	settingName: '',
	settingDescription: '',
};

const FormSchema = Yup.object().shape({
	name: Yup.string(),
});

const ViewGoalSetting: React.FC = () => {
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
	const goalTypeActiveEndedCampaignListData = useSelector<RootState>(
		({campaignGoalSetting}) => campaignGoalSetting.goalTypeActiveEndedCampaignList,
		shallowEqual
	) as any;
	const goalTypeCampaignGoalSettingByIdData = useSelector<RootState>(
		({campaignGoalSetting}) => campaignGoalSetting.goalTypeCampaignGoalSettingByIdData,
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
	const [goalParameterAmount, setGoalParameterAmount] = useState<string | any>('');
	const [goalParameterCount, setGoalParameterCount] = useState<string | any>('');
	const [campaignSettingId, setCampaignSettingId] = useState<number | any>('');
	const [goalTypeName, setGoalTypeName] = useState<string | any>('');
	const [goalTypeGuidId, setGoalTypeGuidId] = useState<string | any>('');

	//  Variables
	const history = useHistory();
	const dispatch = useDispatch();
	const masterReference = useMasterReferenceOption(`${MasterReference.GoalParameterCount},${MasterReference.GoalParameterAmount}`);
	const FOUR = 4;

	//  Watcher
	useEffect(() => {
		setModalShow(false);
		setRowData(goalTypeCommnunicationRecordDepositListData);
	}, [goalTypeCommnunicationRecordDepositListData]);

	useEffect(() => {
		setRowCampaignData(goalTypeActiveEndedCampaignListData);
	}, [goalTypeActiveEndedCampaignListData]);

	useEffect(() => {
		_getCampaignGoalSettingById();

		return () => {
			_clearStorage();
		};
	}, []);

	//  Formik form post
	const formik = useFormik({
		initialValues,
		validationSchema: FormSchema,
		onSubmit: async (values, {setStatus, setSubmitting, resetForm}) => {
			setLoading(true);
		},
	});

	//  Methods
	const _clearStorage = () => {
		dispatch(campaignGoalSetting.actions.goalTypeCommnunicationRecordDepositList([]));
		dispatch(campaignGoalSetting.actions.goalTypeCommunicationRecordList([]));
		dispatch(campaignGoalSetting.actions.goalTypeDepositCurrencyList([]));
		dispatch(campaignGoalSetting.actions.goalTypeDepositList([]));
	};

	const _dispatchApiResponseData = (
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
		dispatch(campaignGoalSetting.actions.goalTypeCommnunicationRecordDepositList(communicationRecordDepositLisResponseModel));

		//Communication Record
		goalTypeCommunicationRecordListResponseModel.forEach((c) => {
			let communincationGuid = communicationRecordDepositLisResponseModel
				.filter((obj) => obj.goalTypeId === c.goalTypeId && obj.goalTypeCommunicationRecordDepositId === c.goalTypeCommunicationRecordId)
				.map((obj) => obj.goalTypeGuid)
				.toString();
			c.communicationGuid = communincationGuid;
		});
		dispatch(campaignGoalSetting.actions.goalTypeCommunicationRecordList(goalTypeCommunicationRecordListResponseModel));

		//Deposit
		goalTypeDepositListResponseModel.forEach((d) => {
			d.depositGuid = communicationRecordDepositLisResponseModel
				.filter((obj) => obj.goalTypeId === d.goalTypeId && obj.goalTypeCommunicationRecordDepositId === d.goalTypeDepositId)
				.map((obj) => obj.goalTypeGuid)
				.toString();
		});
		dispatch(campaignGoalSetting.actions.goalTypeDepositList(goalTypeDepositListResponseModel));

		//Deposit Currency
		goalTypeDepositCurrencyMinMaxListResponseModel.forEach((c) => {
			c.depositGuid = goalTypeDepositListResponseModel
				.filter((d) => d.goalTypeDepositId === c.goalTypeDepositId)
				.map((c) => c.depositGuid)
				.toString();
		});
		dispatch(campaignGoalSetting.actions.goalTypeDepositCurrencyList(goalTypeDepositCurrencyMinMaxListResponseModel));

		//Active Ended Campaign
		dispatch(campaignGoalSetting.actions.goalTypeActiveEndedCampaignList(activeEndedCampaignListResponseModel));
	};

	const _getGoalSettingId = () => {
		let pageId: number = 0;

		const pathArray = window.location.pathname.split('/');

		if (pathArray.length >= FOUR) {
			pageId = parseInt(pathArray[FOUR]);
		} else {
			pageId = 0;
		}

		return pageId;
	};

	const _getCampaignGoalSettingById = () => {
		//Clear Storage
		_clearStorage();

		setTimeout(() => {
			//FETCH TO API
			const messagingHub = hubConnection.createHubConnenction();
			messagingHub
				.start()
				.then(() => {
					// CHECKING STATE CONNECTION
					if (messagingHub.state === HubConnected) {
						let campaignSettingId = _getGoalSettingId();

						const request: CampaignGoalSettingIdRequestModel = {
							campaignSettingId: campaignSettingId,
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

												_clearStorage();

												formik.setFieldValue('settingName', responseData.campaignGoalSettingList.campaignSettingName);
												formik.setFieldValue('settingDescription', responseData.campaignGoalSettingList.campaignSettingDescription);
												setSelectedSettingStatus(
													responseData.campaignGoalSettingList.campaignSettingStatus === 'True'
														? {label: GoalSettingCommons.ACTIVE, value: CampaignSettingStatus.Active}
														: {label: GoalSettingCommons.INACTIVE, value: CampaignSettingStatus.Inactive}
												);
												setGoalParameterAmount({
													label: responseData.campaignGoalSettingList.goalParameterAmountName,
													value: responseData.campaignGoalSettingList.goalParameterAmountId,
												});
												setGoalParameterCount({
													label: responseData.campaignGoalSettingList.goalParameterCountName,
													value: responseData.campaignGoalSettingList.goalParameterCountId,
												});

												_dispatchApiResponseData(
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
	const onChangeGoalParameterAmount = (val: string | any) => {
		setGoalParameterAmount(val);
	};

	const onChangeGoalParameterCount = (val: string | any) => {
		setGoalParameterCount(val);
	};

	const onChangeSettingStatus = (params: LookupModel) => {
		console.log(params);
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
		params.api.paginationGoToPage(FOUR);

		setRowData(goalTypeCommnunicationRecordDepositListData);
		params.api.sizeColumnsToFit();
	};

	const onGridCampaignReady = (params: any) => {
		setRowCampaignData(goalTypeActiveEndedCampaignListData);
	};

	const _editCampaignGoalSetting = () => {
		const win: any = window.open(`/campaign-management/campaign-setting/edit-campaign-goal/${_getGoalSettingId()}`, '_blank');
		win.focus();
	};

	const _closeModal = () => {
		setModalShow(false);
	};

	const _viewGoalTypeConfig = (campaignSettingId: number, goalTypeName: string, paramGoalTypeGuidId: string) => {
		setCampaignSettingId(campaignSettingId);
		setGoalTypeName(goalTypeName);
		setModalShow(true);
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
		{headerName: GoalSettingHeaders.HEADER_CAMPAIGN_SETTING_ID, data: GoalSettingFields.FIELD_CAMPAIGN_SETTING_ID, hide: true},
		{headerName: GoalSettingHeaders.HEADER_SEQUENCE, data: GoalSettingFields.FIELD_SEQUENCE, width: 150, sort: GoalSettingCommons.ASC as 'asc'},
		{
			headerName: GoalSettingHeaders.HEADER_GOAL_TYPE,
			data: GoalSettingFields.FIELD_GOAL_TYPE,
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
										access={userAccess.includes(USER_CLAIMS.ViewAutoTaggingWrite)}
										isDisable={true}
										faIcon={faPencilAlt}
										toolTipText={'Edit'}
										onClick={() => console.log('edit')}
									/>
								</div>
								<div className='me-4'>
									<TableIconButton
										access={userAccess.includes(USER_CLAIMS.ViewAutoTaggingWrite)}
										faIcon={faTrash}
										isDisable={true}
										toolTipText={'Remove'}
										onClick={() => console.log('remove')}
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
		setModalShow(true);
	};

	//  Return
	return (
		<FormContainer onSubmit={formik.handleSubmit}>
			<MainContainer>
				<FormHeader headerLabel={'View Campaign Goal Setting'} />
				<ContentContainer>
					<FormGroupContainer>
						<div className='col-lg-3'>
							<label className='form-label'>Setting Name</label>
							<input
								type='text'
								className='form-control form-control-sm'
								aria-label='Setting Name'
								{...formik.getFieldProps('settingName')}
								disabled
							/>
						</div>
						<div className='col-lg-6'>
							<label className='form-label'>Setting Description</label>
							<input
								type='text'
								className='form-control form-control-sm'
								aria-label='Setting Description'
								{...formik.getFieldProps('settingDescription')}
								disabled
							/>
						</div>
						<div className='col-lg-3'>
							<label className='form-label'>Setting Status</label>
							<Select
								isDisabled={true}
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
								isDisable={true}
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
								isDisabled={true}
								size='small'
								style={{width: '100%'}}
								options={masterReference.filter((obj) => obj.masterReferenceParentId == 47).map((obj) => obj.options)}
								onChange={onChangeGoalParameterAmount}
								value={goalParameterAmount}
							/>
						</div>
						<div className='col-lg-4'>
							<label className='form-label'>Count</label>
							<Select
								isDisabled={true}
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
										enableRangeSelection={true}
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
								<DefaultPrimaryButton
									access={userAccess.includes(USER_CLAIMS.ViewGoalSettingWrite)}
									title={'Edit Setting'}
									isDisable={
										goalTypeActiveEndedCampaignListData === undefined
											? false
											: goalTypeActiveEndedCampaignListData.filter(
													(obj: any) => obj.campaignStatus === GoalSettingCommons.ACTIVE || obj.campaignStatus === 'Ended'
											  ).length > 0
									}
									onClick={_editCampaignGoalSetting}
								/>
							</ButtonsContainer>
						</FieldContainer>
					</PaddedContainer>
				</ContentContainer>

				<ViewGoalTypeConfigModal
					showFormView={modalShow}
					closeModal={_closeModal}
					campaignSettingId={campaignSettingId}
					goalTypeGuidId={goalTypeGuidId}
					goalTypeName={goalTypeName}
				/>
			</MainContainer>
		</FormContainer>
	);
};

export default ViewGoalSetting;

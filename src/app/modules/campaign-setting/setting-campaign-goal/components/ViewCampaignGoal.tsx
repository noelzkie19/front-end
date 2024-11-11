import { faPencilAlt, faTrash } from '@fortawesome/free-solid-svg-icons';
import { AgGridReact } from 'ag-grid-react';
import { useFormik } from 'formik';
import { Guid } from 'guid-typescript';
import React, { useEffect, useState } from 'react';
import { ButtonGroup } from 'react-bootstrap-v5';
import { shallowEqual, useSelector } from 'react-redux';
import { useHistory, useParams } from 'react-router-dom';
import Select from 'react-select';
import swal from 'sweetalert';
import * as Yup from 'yup';
import { RootState } from '../../../../../setup';
import * as hubConnection from '../../../../../setup/hub/MessagingHub';
import { pageMode } from '../../../../constants/Constants';
import useConstant from '../../../../constants/useConstant';
import {
	ContentContainer,
	DefaultSecondaryButton,
	FooterContainer,
	FormContainer,
	FormGroupContainer,
	FormHeader,
	GridLinkButton,
	MainContainer,
	PaddedContainer,
	TableIconButton
} from '../../../../custom-components';
import { useMasterReferenceOption } from '../../../../custom-functions';
import CommonLookups from '../../../../custom-functions/CommonLookups';
import { usePromptOnUnload } from '../../../../custom-helpers';
import { LookupModel } from '../../../../shared-models/LookupModel';
import { GoalSettingFields, GoalSettingHeaders } from '../../../system/components/constants/CampaignSetting';
import { USER_CLAIMS } from '../../../user-management/components/constants/UserClaims';
import useCampaignSettingConstant from '../../constants/useCampaignSettingConstant';
import { ActiveEndedCampaignListModel, GoalTypeGameActivityUdtModel } from '../models';
import { GoalTypeCommunicationRecordUdtModel } from '../models/GoalTypeCommunicationRecordUdtModel';
import { GoalTypeDepositCurrencyMinMaxUdtModel } from '../models/GoalTypeDepositCurrencyMinMaxUdtModel';
import { GoalTypeDepositUdtModel } from '../models/GoalTypeDepositUdtModel';
import { GoalTypeGameActivityCurrMinMaxUdtModel } from '../models/GoalTypeGameActivityCurrMinMaxUdtModel';
import { GoalTypeListConfigurationModel } from '../models/GoalTypeListConfigurationModel';
import {
	GetCampaignGoalSettingByIdDetails,
	GetCampaignGoalSettingByIdDetailsResult,
	SendCheckCampaignGoalSettingByNameExist
} from '../service/CampaignGoalApi';
import AddEditGoalTypeConfigModal from './shared/components/AddEditGoalTypeConfigModal';
import SkeletonLoading from './shared/components/SkeletonLoading';
import { ColDef, ColGroupDef } from 'ag-grid-community';

const initialValues = {
	settingName: '',
	settingDescription: '',
};

const FormSchema = Yup.object().shape({
	name: Yup.string(),
});

const ViewCampaignGoal: React.FC = () => {
	//	Redux
	const userAccess = useSelector<RootState>(({ auth }) => auth.access, shallowEqual) as string;
	const userAccessId = useSelector<RootState>(({ auth }) => auth.userId, shallowEqual) as number;

	//	hooks
	const history = useHistory();
	const { successResponse, HubConnected, SwalCampaignMessage } = useConstant();
	const { DropdownMasterReference } = useCampaignSettingConstant();
	usePromptOnUnload(false, 'Any changes will be discarded, please confirm?');

	const masterRefDetails = useMasterReferenceOption(`${DropdownMasterReference.goalParameterAmount}, ${DropdownMasterReference.goalParameterCount}`);
	const goalViewParameterOptions = masterRefDetails
		.filter((obj) => obj.masterReferenceParentId === DropdownMasterReference.goalParameterAmount)
		.map((obj) => obj.options);

	//	States
	const [rowData, setRowData] = useState<Array<GoalTypeListConfigurationModel>>([]);
	const [selectedSettingStatus, setSelectedSettingStatus] = useState<LookupModel | null>();
	const [goalParameterCount, setGoalParameterCount] = useState<any>('');
	const [goalParameterAmount, setGoalParameterAmount] = useState<any>('');
	const [selectedGoalAmount, setSelectedGoalAmount] = useState<number>(0);
	const [depositTypeData, setDepositTypeData] = useState<Array<GoalTypeDepositUdtModel>>([]);
	const [depositTypeMinMaxData, setDepositTypeMinMaxData] = useState<Array<GoalTypeDepositCurrencyMinMaxUdtModel>>([]);
	const [gameActivityTypeData, setGameActivityTypeData] = useState<Array<GoalTypeGameActivityUdtModel>>([]);
	const [gameActivityTypeMinData, setGameActivityTypeMinData] = useState<Array<GoalTypeGameActivityCurrMinMaxUdtModel>>([]);
	const [communicationRecordTypeData, setCommunicationRecordTypeData] = useState<Array<GoalTypeCommunicationRecordUdtModel>>([]);
	const [viewGoalTypeActiveEndedCampaignListData, setViewGoalTypeActiveEndedCampaignListData] = useState<Array<ActiveEndedCampaignListModel>>([]);
	const [campaignGoalRowCampaignData, setCampaignGoalRowCampaignData] = useState<Array<ActiveEndedCampaignListModel>>([]);
	const [createdBy, setCreatedBy] = useState<any>('');
	const [createdDate, setCreatedDate] = useState<any>('');
	const [updatedDate, setUpdatedDate] = useState<any>('');
	const [updatedBy, setUpdatedBy] = useState<any>('');
	const [addEditModalShow, setAddEditModalShow] = useState<boolean>(false);
	const [goalTypeGuidId, setGoalTypeGuidId] = useState<any>('');
	const [goalTypeName, setGoalTypeName] = useState<any>('');
	const [action, setAction] = useState<any>('');
	const [actionPage, setActionPage] = useState<any>('');
	const [goalTypeConfigId, setGoalTypeConfigId] = useState<any>();
	const [isViewMode, setIsViewMode] = useState<boolean>(false);

	const { id }: { id: number } = useParams();
	const tableLoader = (data: any) => {
		return (
			<div className='ag-custom-loading-cell' style={{ paddingLeft: '10px', lineHeight: '25px' }}>
				<i className='fas fa-spinner fa-pulse'></i> <span> {data.loadingMessage}</span>
			</div>
		);
	};

	const _viewCampaign = (campaignId: number) => {
		const campaignUrl = `/campaign-management/campaign/view/${campaignId}`;
		let campaign: any = window.open(campaignUrl, '_blank');
		campaign.focus();
	};
	const cellRendererCampaignName = (params: any) => {
		return (
			<GridLinkButton
				access={userAccess.includes(USER_CLAIMS.ViewGoalSettingRead)}
				title={params.data.campaignName}
				disabled={false}
				onClick={() => _viewCampaign(params.data.campaignId)}
			/>
		)
	}
	const columnViewGoalCampaignDefs = [
		{ headerName: GoalSettingHeaders.HEADER_NO, data: GoalSettingFields.FIELD_NO, width: 100 },
		{
			headerName: GoalSettingHeaders.HEADER_CAMPAIGN_NAME,
			data: GoalSettingFields.FIELD_CAMPAIGN_NAME,
			cellRenderer: cellRendererCampaignName
		},
		{ headerName: GoalSettingHeaders.HEADER_CAMPAIGN_STATUS, data: GoalSettingFields.FIELD_CAMPAIGN_STATUS },
		{ headerName: GoalSettingHeaders.HEADER_CAMPAIGN_REPORT_PERIOD, data: GoalSettingFields.FIELD_CAMPAIGN_REPORT_PERIOD, width: 300 },
	];
	const statusOption = CommonLookups('settingStatuses');
	//	Effects
	useEffect(() => {
		if (id > 0) {
			//	view
			setSelectedGoalAmount(0);
			setActionPage('view');
			getViewCampaignGoalDetailsById();
		}
	}, []);
	const onViewGoalGridCampaignReady = (params: any) => {
		setCampaignGoalRowCampaignData(viewGoalTypeActiveEndedCampaignListData);
	};
	const cellRendererGoalTypeName = (params: any) => {
		return (
			<GridLinkButton
				access={userAccess.includes(USER_CLAIMS.ViewGoalSettingRead)}
				title={params.data.goalName}
				disabled={false}
				onClick={() => viewGoalTypeConfig(params.data.goalTypeName, params.data.goalTypeGuid, params.data.goalTypeCommunicationRecordDepositId)}
			/>
		)
	}
	const cellRendererGoalTypeDataSourceName = (params: any) => {
		return (
			<>
				{params.data.intervalRelationalOperatorName} {params.data.intervalSourceName ? ' - ' + params.data.intervalSourceName : ''}
				{params.data.intervalNumber === 0 ? '' : ' - ' + params.data.intervalNumber}
			</>
		)
	}
	const cellRendererGoalTypePeriodName = (params: any) => {
		return (<>
			{params.data.messageResponseId != 0 ? (
				<ButtonGroup aria-label='Basic example'>
					<div className='d-flex justify-content-center flex-shrink-0'>
						<div className='me-4'>
							<TableIconButton access={true} faIcon={faPencilAlt} isDisable={true} onClick={() => null} />
						</div>
						<div className='me-4'>
							<TableIconButton access={true} faIcon={faTrash} iconColor={'text-danger'} isDisable={true} onClick={() => null} />
						</div>
					</div>
				</ButtonGroup>
			) : null}
		</>)
	}
	//	Pagination and grid
	const columnDefs : (ColDef<GoalTypeListConfigurationModel> | ColGroupDef<GoalTypeListConfigurationModel>)[] = [
		{ headerName: 'Goal Type Name', field: 'goalTypeName' },
		{
			headerName: 'Goal Type',
			field: 'goalName',
			width: 400,
			cellRenderer: cellRendererGoalTypeName
		},
		{ headerName: 'Data Source', field: 'goalTypeDataSourceName' },
		{
			headerName: 'Interval',
			field: 'intervalNumber',
			cellRenderer: cellRendererGoalTypeDataSourceName
		},
		{ headerName: 'Period', field: 'goalTypePeriodName' },
		{
			headerName: 'Action',
			cellRenderer: cellRendererGoalTypePeriodName
		},
	];

	//	Methods
	const onChangeGoalParameterCount = (val: any) => {
		setGoalParameterCount(val);
	};

	const onChangeGoalParameterAmount = (val: any) => {
		setGoalParameterAmount(val);
	};

	const handleChangeStatus = (params: LookupModel) => {
		setSelectedSettingStatus(params);
	};

	const viewGoalTypeConfig = (paramGoalTypeName: string, paramGoalTypeGuidId: string, paramGoalTypeConfigId: any) => {
		setAction('View');
		setAddEditModalShow(true);
		setGoalTypeName(paramGoalTypeName);
		setGoalTypeGuidId(paramGoalTypeGuidId);
		setGoalTypeConfigId(paramGoalTypeConfigId);
		setIsViewMode(true);
	};

	const validateViewCampaignForm = () => {
		let isError: boolean = false;
		//Mandatory  Fields
		if (formik.values.settingName === '' ||
			formik.values.settingDescription === '' ||
			selectedSettingStatus?.value === '' || selectedSettingStatus?.value === undefined) {
			return true;
		}
		return isError;
	};

	const back = () => {
		history.push('/campaign-management/campaign-setting/campaign-goal');
	};

	const onGridReady = (params: any) => {
		params.api.paginationGoToPage(4);
		params.api.sizeColumnsToFit();
	};

	//	Formik post
	const formik = useFormik({
		initialValues,
		validationSchema: FormSchema,
		onSubmit: async (values, { setStatus, setSubmitting, resetForm }) => {
			setSubmitting(true);

			if (validateViewCampaignForm() === true) {
				swal('Error', 'Unable to proceed, kindly fill up all mandatory fields', 'error');
				setSubmitting(false);
				return;
			}
			SendCheckCampaignGoalSettingByNameExist({ CampaignSettingId: id, CampaignSettingName: formik.values.settingName })
				.then((response) => {
					if (response.status !== successResponse) {
						swal('Failed', 'Connection error Please close the form and try again 1', 'error');
						return;
					}
					let result = response.data;

					if (result) {
						swal(SwalCampaignMessage.titleError, SwalCampaignMessage.textDuplicateSettingName, SwalCampaignMessage.iconError);
						return
					}
					swal({
						title: SwalCampaignMessage.titleConfirmation,
						text: SwalCampaignMessage.textConfirmCampaign,
						icon: 'warning',
						buttons: ['No', 'Yes'],
						dangerMode: true,
					}).then((willUpdate) => {
						if (willUpdate) {
							return
						}
					});
				})
				.catch(() => {
					swal('Failed', 'Connection error Please close the form and try again 2', 'error');
				});
			setSubmitting(false);
		},
	});

	const assignValuesFromGetViewCampaignById = (responseData: any) => {
		formik.setFieldValue('settingName', responseData.campaignGoalSettingList.campaignSettingName);
		formik.setFieldValue('settingDescription', responseData.campaignGoalSettingList.campaignSettingDescription);

		setCreatedBy(responseData.campaignGoalSettingList.createdBy);
		setCreatedDate(responseData.campaignGoalSettingList.createdDate);
		setUpdatedBy(responseData.campaignGoalSettingList.updatedBy);
		setUpdatedDate(responseData.campaignGoalSettingList.updatedDate);

		setRowData(responseData.goalTypeCommunicationRecordDepositList);
		setCommunicationRecordTypeData(responseData.goalTypeCommunicationRecordList);

		setSelectedSettingStatus(
			responseData.campaignGoalSettingList.campaignSettingStatus === 'True'
				? { label: 'Active', value: '1' }
				: { label: 'Inactive', value: '0' }
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

		setGameActivityTypeData(responseData.goalTypeGameActivityTypeList);
		setGameActivityTypeMinData(responseData.goalTypeGameActivityCurrencyMinMaxList);
		setDepositTypeData(responseData.goalTypeDepositList);
		setDepositTypeMinMaxData(responseData.goalTypeDepositCurrencyMinMaxList);
		setViewGoalTypeActiveEndedCampaignListData(responseData.campaignList);
	}

	const getViewCampaignGoalDetailsById = () => {
		const messagingHub = hubConnection.createHubConnenction();
		messagingHub.start().then(() => {
			if (messagingHub.state !== HubConnected) {
				return;
			}

			const request = {
				campaignSettingId: id,
				userId: userAccessId.toString(),
				queueId: Guid.create().toString(),
			};

			GetCampaignGoalSettingByIdDetails(request)
				.then((response) => {
					if (response.status === successResponse) {
						const handleMessage = (message: any) => {
							GetCampaignGoalSettingByIdDetailsResult(message.cacheId)
								.then((data) => {
									assignValuesFromGetViewCampaignById(data.data);
								})


							messagingHub.off(request.queueId.toString());
							messagingHub.stop();
						};

						messagingHub.on(request.queueId.toString(), handleMessage);

						setTimeout(() => {
							if (messagingHub.state === HubConnected) {
								messagingHub.stop();
							}
						}, 30000);
					} else {
						messagingHub.stop();
						swal(SwalCampaignMessage.titleFailed, response.data.message, 'error');
					}
				})
				.catch(() => {
					messagingHub.stop();
					swal(SwalCampaignMessage.titleFailed, 'Problem in getting message type list', 'error');
				});
		})
			.catch((err) => console.log('Error while starting connection: ' + err));
	};

	const _addEditCloseModal = () => {
		setAddEditModalShow(false);
	};
	return (
		<MainContainer>
			<FormContainer onSubmit={formik.handleSubmit}>
				<FormHeader headerLabel={`View Campaign Goal Setting`} />
				<ContentContainer>
					{actionPage === pageMode.view && id > 0 && rowData.length === 0 && <SkeletonLoading />}

					{actionPage === pageMode.view && rowData.length > 0 && formik.values.settingName !== '' && (
						<>
							<FormGroupContainer>
								<div className='col-lg-4'>
									<label className='col-form-label required'>Setting Name</label>
									<input
										type='text'
										className='form-control form-control-sm'
										aria-label='Setting Name'
										{...formik.getFieldProps('settingName')}
										disabled
									/>
								</div>
								<div className='col-lg-5'>
									<label className='col-form-label required'>Setting Description</label>
									<input
										type='text'
										className='form-control form-control-sm'
										aria-label='Setting Description'
										{...formik.getFieldProps('settingDescription')}
										disabled
									/>
								</div>
								<div className='col-lg-3'>
									<label className='col-form-label required'>Setting Status</label>
									<Select
										size='small'
										style={{ width: '100%' }}
										options={statusOption}
										onChange={handleChangeStatus}
										value={selectedSettingStatus}
										isDisabled={true}
									/>
								</div>
							</FormGroupContainer>
							<FormGroupContainer>
								<div className='col-lg-3'>
									<label className='col-form-label'>Created Date</label>
									<p>{createdDate}</p>
								</div>
								<div className='col-lg-3'>
									<label className='col-form-label'>Created By</label>
									<p>{createdBy}</p>
								</div>
								<div className='col-lg-3'>
									<label className='col-form-label'>Last Modified Date</label>
									<p>{updatedDate}</p>
								</div>
								<div className='col-lg-3'>
									<label className='col-form-label'>Last Modified By</label>
									<p>{updatedBy}</p>
								</div>
							</FormGroupContainer>

							{/* <Separator /> */}
							<div className='separator separator-dashed my-5 sept'></div>
							<div className='col-lg-12'>
								<p className='form-control-plaintext fw-bolder required'>Goal Type Configuration</p>
							</div>

							<div className='ag-theme-quartz campaign-grid' style={{ height: 300, width: '100%' }}>
								<AgGridReact
									rowData={rowData}
									defaultColDef={{
										sortable: true,
										resizable: true,
									}}
									onGridReady={onGridReady}
									rowBuffer={0}
									enableRangeSelection={true}
									pagination={true}
									paginationPageSize={10}
									columnDefs={columnDefs}
								/>
							</div>

							{/* <Separator /> */}
							<div className='separator separator-dashed my-5'></div>
							<div className='col-lg-12'>
								<label className='form-label'>
									<b>Goal Parameters</b>
								</label>
							</div>
							<FormGroupContainer>
								<div className='col-lg-4'>
									<label className='col-form-label'>Amount</label>
									<Select
										isDisabled={true}
										size='small'
										style={{ width: '100%' }}
										options={
											selectedGoalAmount != 0 ? goalViewParameterOptions.filter((obj: any) => obj.value == selectedGoalAmount) : goalViewParameterOptions
										}
										onChange={onChangeGoalParameterAmount}
										value={goalParameterAmount}
									/>
								</div>
								<div className='col-lg-4'>
									<label className='col-form-label'>Count</label>
									<Select
										// waiting for popup
										isDisabled={true}
										size='small'
										style={{ width: '100%' }}
										options={masterRefDetails
											.filter((obj) => obj.masterReferenceParentId == DropdownMasterReference.goalParameterCount)
											.map((obj) => obj.options)}
										onChange={onChangeGoalParameterCount}
										value={goalParameterCount}
									/>
								</div>
							</FormGroupContainer>

							<AddEditGoalTypeConfigModal
								showForm={addEditModalShow}
								closeModal={_addEditCloseModal}
								action={action}
								goalTypeGuidId={goalTypeGuidId}
								goalTypeName={goalTypeName}
								setRowData={setRowData}
								rowData={rowData}
								setCommunicationRecordTypeData={setCommunicationRecordTypeData}
								communicationRecordTypeData={communicationRecordTypeData}
								setGameActivityTypeData={setGameActivityTypeData}
								gameActivityTypeData={gameActivityTypeData}
								setGameActivityTypeMinData={setGameActivityTypeMinData}
								gameActivityTypeMinData={gameActivityTypeMinData}
								setDepositTypeData={setDepositTypeData}
								depositTypeData={depositTypeData}
								setDepositTypeMinMaxData={setDepositTypeMinMaxData}
								depositTypeMinMaxData={depositTypeMinMaxData}
								goalTypeConfigId={goalTypeConfigId}
								viewMode={isViewMode}
							/>

							<hr />
							{viewGoalTypeActiveEndedCampaignListData !== undefined ? (
								viewGoalTypeActiveEndedCampaignListData.length !== 0 && (
									<>
										<div className='card-title mb-5'>
											<h5 className='fw-bolder m-0'>Active and Ended Campaign</h5>
										</div>
										<div className='ag-theme-quartz' style={{ height: 301, width: '100%' }}>
											<AgGridReact
												rowData={campaignGoalRowCampaignData}
												defaultColDef={{
													sortable: true,
													resizable: true,
												}}
												components={{
													tableLoader: tableLoader,
												}}
												onGridReady={onViewGoalGridCampaignReady}
												rowBuffer={0}
												enableRangeSelection={true}
												pagination={true}
												paginationPageSize={10}
												columnDefs={columnViewGoalCampaignDefs}
											/>
										</div>
										<hr />
									</>
								)
							) : (
								<></>
							)}
						</>
					)}
				</ContentContainer>
				<FooterContainer>
					<PaddedContainer>
						<DefaultSecondaryButton access={userAccess.includes(USER_CLAIMS.ViewGoalSettingRead)} title={'Back'} onClick={back} />
					</PaddedContainer>
				</FooterContainer>
			</FormContainer>
		</MainContainer>
	);
};

export default ViewCampaignGoal;

import {faClone, faPencilAlt} from '@fortawesome/free-solid-svg-icons';
import {AgGridReact} from 'ag-grid-react';
import {useFormik} from 'formik';
import {Guid} from 'guid-typescript';
import moment from 'moment';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {ButtonGroup} from 'react-bootstrap-v5';
import {shallowEqual, useDispatch, useSelector} from 'react-redux';
import {useHistory} from 'react-router-dom';
import Select from 'react-select';
import swal from 'sweetalert';
import {RootState} from '../../../../../setup';
import * as hubConnection from '../../../../../setup/hub/MessagingHub';
import gridOverlayTemplate, { gridOverlayNoRowsTemplate } from '../../../../common-template/gridTemplates';
import {LookupModel} from '../../../../common/model';
import useConstant from '../../../../constants/useConstant';
import {
	ButtonsContainer,
	ContentContainer,
	DefaultButton,
	DefaultSecondaryButton,
	FieldContainer,
	FormContainer,
	FormGroupContainer,
	FormHeader,
	GridLinkLabel,
	LoaderButton,
	MainContainer,
	TableIconButton,
} from '../../../../custom-components';
import DefaultDateRangePicker from '../../../../custom-components/date-range-pickers/DefaultDateRangePicker';
import DefaultGridPagination from '../../../../custom-components/grid-pagination/DefaultGridPagination';
import CommonLookups from '../../../../custom-functions/CommonLookups';
import {CampaignSettingStatus, CampaignSettingStatusId, SwalDetails} from '../../../system/components/constants/CampaignSetting';
import {USER_CLAIMS} from '../../../user-management/components/constants/UserClaims';
import {CampaignGoalSettingByFilterRequestModel, CampaignGoalSettingListModel} from '../models';
import * as campaignGoalSetting from '../redux/GoalSettingRedux';
import {GetCampaignGoalSettingByFilter, SendGetCampaignGoalSettingByFilter} from '../service/CampaignGoalSettingApi';
import { ColDef, ColGroupDef } from 'ag-grid-community';

const initialValues = {
	settingName: '',
};

const GoalSettingList: React.FC = () => {
	// Get redux store
	const userAccess = useSelector<RootState>(({auth}) => auth.access, shallowEqual) as string;
	const userAccessId = useSelector<RootState>(({auth}) => auth.userId, shallowEqual) as number;
	const {HubConnected, successResponse} = useConstant();

	//	States
	const gridRef: any = useRef();
	const [selectedSettingStatus, setSelectedSettingStatus] = useState<LookupModel | null>();
	const [filterSettingStatus, setFilterSettingStatus] = useState<LookupModel | null>();
	const [loading, setLoading] = useState<boolean>(false);
	const [gridApi, setGridApi] = useState<any | null>(null);
	const [rowData, setRowData] = useState<Array<CampaignGoalSettingListModel>>([]);
	const [filterCreatedDate, setFilterCreatedDate] = useState<any>();
	const [filterCreatedStartDate, setFilterCreatedStartDate] = useState<string>('');
	const [filterCreatedEndDate, setFilterCreatedEndDate] = useState<string>('');
	const [gridColumnApi, setGridColumnApi] = useState(null);
	const [pageSize, setPageSize] = useState<number>(10);
	const [sortColumn, setSortColumn] = useState<string>('');
	const [sortOrder, setSortOrder] = useState<string>('');
	const [currentPage, setCurrentPage] = useState<number>(1);
	const [recordCount, setRecordCount] = useState<number>(0);
	const [filterCampaignSettingName, setFilterCampaignSettingName] = useState<any>(null);
	const [goalSettingList, setGoalSettingList] = useState<Array<CampaignGoalSettingListModel>>([]);

	//	Watchers
	useEffect(() => {
		setRowData(goalSettingList);
	}, [goalSettingList]);

	useEffect(() => {
		clearFields();
	}, []);

	useEffect(() => {
		if (!loading && rowData.length === 0) {
			if (document.getElementById('mlab-grid-loading-overlay') as HTMLInputElement) {
				(document.getElementById('mlab-grid-loading-overlay') as HTMLInputElement).innerText = 'No Rows To Show';
			}
		} else {
			if (document.getElementById('mlab-grid-loading-overlay') as HTMLInputElement) {
				(document.getElementById('mlab-grid-loading-overlay') as HTMLInputElement).innerText = 'Please wait while your items are loading';
			}
		}
	}, [loading]);

	//	Variables
	const history = useHistory();
	const dispatch = useDispatch();

	//	Formik form post
	const formik = useFormik({
		initialValues,
		onSubmit: async (values, {setStatus, setSubmitting, resetForm}) => {
			setLoading(true);
			setCurrentPage(1);
			_getCampaignGoalSettingByFilter(pageSize, 1, sortColumn, sortOrder);
		},
	});

	//	Methods
	const onChangeSettingNameFilter = (data: any) => {
		setFilterCampaignSettingName(data.target.value);
	};

	const clearFields = () => {
		setFilterCampaignSettingName('');
		setFilterCreatedDate('');
		setFilterCreatedStartDate('');
		setFilterCreatedEndDate('');
		setRecordCount(0);
		setCurrentPage(1);
		setPageSize(10);
		setSelectedSettingStatus({label: 'Select All', value: ''});
	};

	const _clearStorage = () => {
		dispatch(campaignGoalSetting.actions.goalTypeCommnunicationRecordDepositList([]));
		dispatch(campaignGoalSetting.actions.goalTypeCommunicationRecordList([]));
		dispatch(campaignGoalSetting.actions.goalTypeDepositCurrencyList([]));
		dispatch(campaignGoalSetting.actions.goalTypeDepositList([]));
		dispatch(campaignGoalSetting.actions.goalTypeActiveEndedCampaignList([]));
	};

	const _viewCampaignGoalSetting = (campaignSettingId: number) => {
		const win: any = window.open(`/campaign-management/campaign-setting/view-campaign-goal/${campaignSettingId}`, '_blank');
		win.focus();
	};

	const _editCampaignGoalSetting = (campaignSettingId: number) => {
		const win: any = window.open(`/campaign-management/campaign-setting/edit-campaign-goal/${campaignSettingId}`, '_blank');
		win.focus();
	};

	const _cloneCampaignGoalSetting = (campaignSettingId: number) => {
		_clearStorage();
		// const win: any = window.open(`/campaign-management/campaign-setting/add-campaign-goal/${campaignSettingId}`, '_blank');

		window.open('/campaign-management/campaign-setting/clone-campaign-goal/' + campaignSettingId);
		// win.focus();
	};

	const _addCapaignGoalSetting = () => {
		_clearStorage();
		const win: any = window.open(`/campaign-management/campaign-setting/add-campaign-goal`, '_blank');
		win.focus();
	};

	const _getCampaignGoalSettingByFilter = (goalSettingPageSize: number, currentPage: number, sortColumn: string, sortOrder: string) => {
		setGoalSettingList([]);
		setLoading(true);
		setTimeout(() => {
			//FETCH TO API
			const messagingHub = hubConnection.createHubConnenction();
			messagingHub
				.start()
				.then(() => {
					// CHECKING STATE CONNECTION
					let status = CampaignSettingStatusId.Active_Inactive;
					if (selectedSettingStatus?.value == undefined || selectedSettingStatus?.value === '') {
						status = CampaignSettingStatusId.Active_Inactive; //Both active and inactive
					} else if (selectedSettingStatus?.value === CampaignSettingStatus.Active) {
						status = CampaignSettingStatusId.Active; //Active
					} else {
						status = CampaignSettingStatusId.Inactive; //Inactive
					}

					if (messagingHub.state === HubConnected) {
						const request: CampaignGoalSettingByFilterRequestModel = {
							campaignSettingName: filterCampaignSettingName != '' ? filterCampaignSettingName : null,
							isActive: status,
							dateFrom: filterCreatedStartDate,
							dateTo: filterCreatedEndDate,
							offsetValue: (currentPage - 1) * goalSettingPageSize,
							pageSize: goalSettingPageSize,
							sortColumn: sortColumn,
							sortOrder: sortOrder,
							queueId: Guid.create().toString(),
							userId: userAccessId.toString(),
						};
						SendGetCampaignGoalSettingByFilter(request)
							.then((response) => {
								// IF REQUEST IS SUCCESS THEN CONSUME CALLBACK API
								if (response.status === successResponse) {
									messagingHub.on(request.queueId.toString(), (message) => {
										GetCampaignGoalSettingByFilter(message.cacheId)
											.then((data) => {
												let responseData = data.data;
												setGoalSettingList(responseData.campaignGoalSettingList);
												setRecordCount(responseData.totalRecordCount);
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
									}, 1800000);
								} else {
									messagingHub.stop();
									swal(SwalDetails.FailedTitle, response.data.message, SwalDetails.ErrorIcon);
								}
							})
							.catch(() => {
								messagingHub.stop();
								swal(SwalDetails.FailedTitle, 'Problem in getting message type list', SwalDetails.ErrorIcon);
							});
					}
				})
				.catch((err) => console.log('Error while starting connection: ' + err));
		}, 1000);
	};

	const onChangeCreatedDate = (val: any) => {
		if (val != undefined) {
			setFilterCreatedDate(val);
			setFilterCreatedStartDate(val[0]);
			setFilterCreatedEndDate(val[1]);
		}
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
		gridRef.current.api.sizeColumnsToFit();
		setGridColumnApi(params.columnApi);
		params.api.paginationGoToPage(4);
		setRowData(goalSettingList);
		params.api.sizeColumnsToFit();
	};

	const onSort = (e: any) => {
		if (goalSettingList != undefined && goalSettingList.length > 0) {
			var sortDetail = e.api.getSortModel();
			if (sortDetail[0] != undefined) {
				setSortColumn(sortDetail[0]?.colId);
				setSortOrder(sortDetail[0]?.sort);
			} else {
				setSortColumn('');
				setSortOrder('');
			}
		}
	};

	//	Custom pagination methods
	const onPageSizeChanged = () => {
		var value: string = (document.getElementById('page-size') as HTMLInputElement).value;
		setPageSize(Number(value));
		setCurrentPage(1);
		_getCampaignGoalSettingByFilter(Number(value), 1, sortColumn, sortOrder);
	};

	const onClickFirst = () => {
		if (currentPage > 1) {
			setCurrentPage(1);
			_getCampaignGoalSettingByFilter(pageSize, 1, sortColumn, sortOrder);
		}
	};

	const onClickPrevious = () => {
		if (currentPage > 1) {
			setCurrentPage(currentPage - 1);
			_getCampaignGoalSettingByFilter(pageSize, currentPage - 1, sortColumn, sortOrder);
		}
	};

	const onClickNext = () => {
		if (totalPage() > currentPage) {
			setCurrentPage(currentPage + 1);
			_getCampaignGoalSettingByFilter(pageSize, currentPage + 1, sortColumn, sortOrder);
		}
	};

	const onClickLast = () => {
		if (totalPage() > currentPage) {
			setCurrentPage(totalPage());
			_getCampaignGoalSettingByFilter(pageSize, totalPage(), sortColumn, sortOrder);
		}
	};

	const totalPage = () => {
		return Math.ceil(recordCount / pageSize) | 0;
	};

	const onHide = useCallback(() => {
		gridRef.current.api.hideOverlay();
	}, []);

	const onShowLoading = useCallback(() => {
		gridRef.current.api.showLoadingOverlay();
	}, []);

	const columnDefs : (ColDef<CampaignGoalSettingListModel> | ColGroupDef<CampaignGoalSettingListModel>)[] = [
		{headerName: 'No', valueGetter: ('node.rowIndex + 1 + ' + (currentPage - 1) * pageSize).toString(), sortable: false, width: 60},
		{
			headerName: 'Setting Name',
			field: 'campaignSettingName',
			width: 400,
			cellRenderer: (params: any) => (
				<>
					<GridLinkLabel
						access={userAccess.includes(USER_CLAIMS.ViewGoalSettingRead)}
						title={params.data.campaignSettingName}
						disabled={false}
						onClick={() => _viewCampaignGoalSetting(params.data.campaignSettingId)}
					/>
				</>
			),
		},
		{headerName: 'Setting Status', field: 'campaignSettingStatus'},
		{
			headerName: 'Created Date',
			field: 'createdDate',
			autoHeight: true,
			cellRenderer: (params: any) => <>{moment(params.data.createdDate).format('MM/D/yyyy HH:mm')}</>,
		},
		{headerName: 'Created By', field: 'createdBy', autoHeight: true},
		{
			headerName: 'Last Modified Date',
			field: 'updatedDate',
			autoHeight: true,
			cellRenderer: (params: any) => <>{params.data.updatedDate !== null && moment(params.data.updatedDate).format('MM/D/yyyy HH:mm')}</>,
		},
		{headerName: 'Last Modified By', field: 'updatedBy', autoHeight: true},
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
										onClick={() => _editCampaignGoalSetting(params.data.campaignSettingId)}
									/>
								</div>
								<div className='me-4'>
									<TableIconButton
										access={userAccess.includes(USER_CLAIMS.ViewGoalSettingWrite)}
										faIcon={faClone}
										toolTipText={'Clone'}
										onClick={() => _cloneCampaignGoalSetting(params.data.campaignSettingId)}
									/>
								</div>
							</div>
						</ButtonGroup>
					) : null}
				</>
			),
		},
	];

	//	Return
	return (
		<FormContainer onSubmit={formik.handleSubmit}>
			<MainContainer>
				<FormHeader headerLabel={'Search Campaign Goal Setting'} />
				<ContentContainer>
					<FormGroupContainer>
						<div className='col-lg-3'>
							<label className='form-label'>Setting Name</label>
							<input
								type='text'
								className='form-control form-control-sm'
								aria-label='Setting Name'
								value={filterCampaignSettingName}
								onChange={onChangeSettingNameFilter}
							/>
						</div>

						<div className='col-lg-3'>
							<label className='form-label'>Setting Status</label>
							<Select
								size='small'
								style={{width: '100%'}}
								options={CommonLookups('statusesWithDefault')}
								onChange={onChangeSettingStatus}
								value={selectedSettingStatus}
							/>
						</div>
						<div className='col-lg-3'>
							<label className='form-label'>Created Date</label>
							<DefaultDateRangePicker format='yyyy-MM-dd HH:mm:ss' maxDays={180} onChange={onChangeCreatedDate} value={filterCreatedDate} />
						</div>
					</FormGroupContainer>

					<FieldContainer>
						<FieldContainer>
							<ButtonsContainer>
								<LoaderButton
									access={userAccess.includes(USER_CLAIMS.ViewGoalSettingRead)}
									loading={loading}
									title={'Search'}
									loadingTitle={' Please wait...'}
									disabled={formik.isSubmitting}
								/>
								<DefaultSecondaryButton
									access={userAccess.includes(USER_CLAIMS.ViewGoalSettingWrite)}
									title={'Clear'}
									onClick={() => clearFields()}
								/>
								<DefaultButton
									access={userAccess.includes(USER_CLAIMS.ViewGoalSettingWrite)}
									title={'Add Campaign Goal Setting'}
									onClick={_addCapaignGoalSetting}
								/>
							</ButtonsContainer>
						</FieldContainer>
					</FieldContainer>

					<div className='ag-theme-quartz' style={{height: 400, width: '100%', marginBottom: '50px'}}>
						<AgGridReact
							ref={gridRef}
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
							pagination={false}
							paginationPageSize={pageSize}
							columnDefs={columnDefs}
							overlayNoRowsTemplate={gridOverlayNoRowsTemplate}
							onSortChanged={(e) => onSort(e)}
						/>

						<DefaultGridPagination
							recordCount={recordCount}
							currentPage={currentPage}
							pageSize={pageSize}
							onClickFirst={onClickFirst}
							onClickPrevious={onClickPrevious}
							onClickNext={onClickNext}
							onClickLast={onClickLast}
							onPageSizeChanged={onPageSizeChanged}
						/>
					</div>
				</ContentContainer>
			</MainContainer>
		</FormContainer>
	);
};

export default GoalSettingList;

import {faClone, faPencilAlt} from '@fortawesome/free-solid-svg-icons';
import {AgGridReact} from 'ag-grid-react';
import {useFormik} from 'formik';
import {Guid} from 'guid-typescript';
import moment from 'moment';
import React, {useEffect, useRef, useState} from 'react';
import {ButtonGroup} from 'react-bootstrap-v5';
import {shallowEqual, useDispatch, useSelector} from 'react-redux';
import Select from 'react-select';
import swal from 'sweetalert';
import {RootState} from '../../../../../setup';
import * as hubConnection from '../../../../../setup/hub/MessagingHub';
import gridOverlayTemplate, { gridOverlayNoRowsTemplate } from '../../../../common-template/gridTemplates';
import {LookupModel} from '../../../../common/model/LookupModel';
import {ElementStyle} from '../../../../constants/Constants';
import useConstant from '../../../../constants/useConstant';
import {
	ButtonsContainer,
	ContentContainer,
	FieldContainer,
	FormContainer,
	FormGroupContainer,
	FormHeader,
	MainContainer,
	MlabButton,
	TableIconButton,
} from '../../../../custom-components';
import DefaultDateRangePicker from '../../../../custom-components/date-range-pickers/DefaultDateRangePicker';
import DefaultGridPagination from '../../../../custom-components/grid-pagination/DefaultGridPagination';
import CommonLookups from '../../../../custom-functions/CommonLookups';
import {PointIncentiveSettingFields, PointIncentiveSettingHeaders} from '../../../system/components/constants/CampaignSetting';
import {USER_CLAIMS} from '../../../user-management/components/constants/UserClaims';
import * as campaignSetting from '../../redux/AutoTaggingRedux';
//service
import {getCampaignSettingList, getCampaignSettingListResult} from '../../redux/AutoTaggingService';
import {PointIncentiveFiltersRequestModel} from '../models/request/PointIncentiveFiltersRequestModel';
//model sources
import {CampaignSettingListResponseModel} from '../models/response/CampaignSettingListResponseModel';
import { ColDef, ColGroupDef } from 'ag-grid-community';

const initialValues = {
	//
};

const PointIncentiveDetails: React.FC = () => {
	//  CONSTANTS
	const PointIncentiveSetting = 44; // campaignSettingTypeId for Point Incentive
	const ASC = 'ASC';

	//  Get redux store
	const userAccess = useSelector<RootState>(({auth}) => auth.access, shallowEqual) as string;
	const userAccessId = useSelector<RootState>(({auth}) => auth.userId, shallowEqual) as number;
	const {successResponse} = useConstant();
	const dispatch = useDispatch();
	const pointToValue = 41;

	//  States
	const gridRef: any = useRef();
	const [selectedSettingStatus, setSelectedSettingStatus] = useState<LookupModel | null>();
	const [selectedSettingType, setSelectedSettingType] = useState<string | any>('');

	const [filterCreatedDate, setFilterCreatedDate] = useState<any>('');
	const [filterDateFrom, setFilterDateFrom] = useState<string>('');
	const [filterDateTo, setFilterDateTo] = useState<string>('');
	const [filterCampaignSettingName, setFilterCampaignSettingName] = useState<any>(null);

	const [gridApi, setGridApi] = useState<any | null>(null);

	const [loading, setLoading] = useState<boolean>(false);
	const [campaignSettingList, setCampaignSettingList] = useState<Array<CampaignSettingListResponseModel>>([]);
	const [pageSize, setPageSize] = useState<number>(10);
	const [currentPage, setCurrentPage] = useState<number>(1);
	const [recordCount, setRecordCount] = useState<number>(0);
	const [sortOrder, setSortOrder] = useState<string>(ASC);
	const [sortColumn, setSortColumn] = useState<string>('CampaignSettingId');
	const [gridColumnApi, setGridColumnApi] = useState(null);

	//  Watchers
	const onGridReady = (params: any) => {
		setGridApi(params.api);
		setGridColumnApi(params.columnApi);
		params.api.paginationGoToPage(4);
		params.api.sizeColumnsToFit();
		gridRef.current.api.sizeColumnsToFit();
	};

	const onChangeSettingStatus = (data: LookupModel) => {
		if (data) {
			setSelectedSettingStatus(data);
		}
	};

	const onChangeSettingType = (params: string) => {
		setSelectedSettingType(params);
	};

	const tableLoader = (data: any) => {
		return (
			<div className='ag-custom-loading-cell' style={{paddingLeft: '10px', lineHeight: '25px'}}>
				<i className='fas fa-spinner fa-pulse'></i> <span> {data.loadingMessage}</span>
			</div>
		);
	};

	//  Formik form post
	const formik = useFormik({
		initialValues,
		onSubmit: async () => {
			setLoading(true);
			setCurrentPage(1);
			getPointIncentiveList(pageSize, 1);
		},
	});

	//  Methods
	function onChangeCreatedDate(data: any) {
		if (data != undefined) {
			setFilterCreatedDate(data);
			setFilterDateFrom(data[0]);
			setFilterDateTo(data[1]);
		}
	}

	const onSort = (e: any) => {
		if (campaignSettingList != undefined && campaignSettingList.length > 0) {
			let sortDetail = e.api.getSortModel();
			if (sortDetail[0] != undefined) {
				setSortColumn(sortDetail[0]?.colId);
				setSortOrder(sortDetail[0]?.sort);
			} else {
				setSortColumn('');
				setSortOrder('');
			}
		}
	};

	const onClickFirst = () => {
		if (currentPage > 1) {
			setCurrentPage(1);
			getPointIncentiveList(pageSize, 1);
		}
	};

	const onClickPrevious = () => {
		if (currentPage > 1) {
			setCurrentPage(currentPage - 1);
			getPointIncentiveList(pageSize, currentPage - 1);
		}
	};

	const onClickNext = () => {
		if (totalPage() > currentPage) {
			setCurrentPage(currentPage + 1);
			getPointIncentiveList(pageSize, currentPage + 1);
		}
	};

	const onClickLast = () => {
		if (totalPage() > currentPage) {
			setCurrentPage(totalPage());
			getPointIncentiveList(pageSize, totalPage());
		}
	};

	const totalPage = () => {
		return Math.ceil(recordCount / pageSize) | 0;
	};

	const onPageSizeChanged = () => {
		let value: string = (document.getElementById('page-size') as HTMLInputElement).value;

		setPageSize(Number(value));
		setCurrentPage(1);

		getPointIncentiveList(value, 1);
	};

	function getPointIncentiveList(pagesize: any, currentpage: any) {
		setCampaignSettingList([]);
		setLoading(true);
		const messagingHub = hubConnection.createHubConnenction();

		setTimeout(() => {
			messagingHub.start().then(() => {
				const pointIncentiveRequest: PointIncentiveFiltersRequestModel = {
					dateFrom: filterDateFrom,
					dateTo: filterDateTo,
					pageSize: pagesize,
					offsetValue: (currentpage - 1) * pagesize,
					sortColumn: 'CampaignSettingId',
					sortOrder: 'ASC',
					userId: userAccessId.toString(),
					queueId: Guid.create().toString(),
					campaignSettingName: filterCampaignSettingName != '' ? filterCampaignSettingName : null,
					campaignSettingTypeId: PointIncentiveSetting, //FIXED for POINT INCENTIVE
					isActive: selectedSettingStatus?.value != undefined ? parseInt(selectedSettingStatus?.value) : undefined, //default to get active and inactive.,
					createdDate: filterCreatedDate ? filterCreatedDate.toString() : null,
					settingTypeId: selectedSettingType?.value != undefined ? parseInt(selectedSettingType?.value) : undefined,
				};
				getCampaignSettingList(pointIncentiveRequest).then((response) => {
					if (response.status === successResponse) {
						messagingHub.on(pointIncentiveRequest.queueId.toString(), (message) => {
							getCampaignSettingListResult(message.cacheId)
								.then((returnData) => {
									let feedbackData = Object.assign(new Array<CampaignSettingListResponseModel>(), returnData.data);
									setCampaignSettingList(feedbackData);
									let count = feedbackData.length > 0 ? feedbackData[0].recordCount : 0;
									setRecordCount(count);

									dispatch(campaignSetting.actions.getCampaignSettingList(returnData.data));

									setCampaignSettingList(feedbackData);
									messagingHub.off(pointIncentiveRequest.queueId.toString());
									messagingHub.stop();

									setLoading(false);
								})
								.catch(() => {
									swal('Failed', 'getCampaignSettingListResult', 'error');
									setLoading(false);
								});
						});
					} else {
						swal('Failed', response.data.message, 'error');
						setLoading(false);
					}
				});
			});
		}, 1000);
	}

	const goToEditPage = (data: any) => {
		if (data.data.settingTypeId == pointToValue) {
			window.open('/campaign-management/campaign-setting/edit-point-incentive/' + data.data.campaignSettingId);
		} else {
			window.open('/campaign-management/campaign-setting/edit-goal-parameter/' + data.data.campaignSettingId);
		}
	};

	const goToViewPage = (data: any) => {
		window.open('/campaign-management/campaign-setting/view-point-incentive/' + data.data.campaignSettingId);
	};

	const cloneDetailsPage = (data: any) => {
		if (data.data.settingTypeId == 40) {
			//goal parameter
			window.open('/campaign-management/campaign-setting/add-goal-parameter/?action=clone&id=' + data.data.campaignSettingId);
		} else {
			// point to value
			window.open('/campaign-management/campaign-setting/add-point-incentive/?action=clone&id=' + data.data.campaignSettingId);
		}
	};
	const columnDefs : (ColDef<CampaignSettingListResponseModel> | ColGroupDef<CampaignSettingListResponseModel>)[] =[
		{headerName: PointIncentiveSettingHeaders.HEADER_NO, valueGetter: ('node.rowIndex + 1 + ' + (currentPage - 1) * pageSize).toString(), width: 100},

		{
			headerName: PointIncentiveSettingHeaders.HEADER_SETTING_NAME,
			field: PointIncentiveSettingFields.FIELD_SETTING_NAME,
			width: 500,
			cellClass: 'btn-link cursor-pointer',
			cellRenderer: (params: any) => (
				<>
					{params.data.campaignSettingId != 0 ? (
						<ButtonGroup aria-label='Basic example'>
							<div className='d-flex justify-content-center flex-shrink-0 shadow-none'>
								<label
									className='btn-link cursor-pointer'
									onClick={() => {
										goToViewPage(params);
									}}
								>
									{params.data.campaignSettingName}
								</label>
							</div>
						</ButtonGroup>
					) : null}
				</>
			),
		},

		{
			headerName: PointIncentiveSettingHeaders.HEADER_SETTING_STATUS,
			field: PointIncentiveSettingFields.FIELD_SETTING_STATUS,
			autoHeight: true,
		},

		{headerName: PointIncentiveSettingHeaders.HEADER_SETTING_TYPE, field: PointIncentiveSettingFields.FIELD_SETTING_TYPE, autoHeight: true},

		{
			headerName: PointIncentiveSettingHeaders.HEADER_CREATED_DATE,
			field: PointIncentiveSettingFields.FIELD_CREATED_DATE,
			autoHeight: true,
			cellRenderer: (params: any) => <>{moment(params.data.createdDate).format('MM/D/yyyy HH:mm')}</>,
		},

		{
			headerName: PointIncentiveSettingHeaders.HEADER_CREATED_BY,
			field: PointIncentiveSettingFields.FIELD_CREATED_BY,
			autoHeight: true,
		},

		{
			headerName: PointIncentiveSettingHeaders.HEADER_LAST_MODIFIED_DATE,
			field: PointIncentiveSettingFields.FIELD_UPDATED_DATE,
			autoHeight: true,
			cellRenderer: (params: any) => (
				<>{params.data.updatedDate != undefined ? moment(params.data.updatedDate).format('MM/D/yyyy HH:mm') : ''}</>
			),
		},

		{
			headerName: PointIncentiveSettingHeaders.HEADER_LAST_MODIFIED_BY,
			field: PointIncentiveSettingFields.FIELD_UPDATED_BY,
			autoHeight: true,
		},

		{
			headerName: PointIncentiveSettingHeaders.HEADER_ACTION,
			width: 150,
			autoHeight: true,
			cellRenderer: (params: any) => (
				<>
					{params.data.messageResponseId != 0 ? (
						<ButtonGroup aria-label='Basic example'>
							<div className='d-flex justify-content-center flex-shrink-0'>
								<div className='me-4'>
									<TableIconButton
										access={userAccess.includes(USER_CLAIMS.IncentiveGoalSettingWrite)}
										faIcon={faPencilAlt}
										toolTipText={'Edit'}
										onClick={() => {
											goToEditPage(params);
										}}
									/>
								</div>
								<div className='me-4'>
									<TableIconButton
										access={userAccess.includes(USER_CLAIMS.IncentiveGoalSettingWrite)}
										faIcon={faClone}
										toolTipText={'Clone'}
										onClick={() => {
											cloneDetailsPage(params);
										}}
									/>
								</div>
							</div>
						</ButtonGroup>
					) : null}
				</>
			),
		},
	];

	useEffect(() => {
		dispatch(campaignSetting.actions.getCampaignSettingList([]));
		setSelectedSettingStatus({value: '', label: 'Select All'});
		setSelectedSettingType({value: '', label: 'Select All'});
	}, []);

	useEffect(() => {
		if (!loading && campaignSettingList.length === 0) {
			if (document.getElementById('mlab-grid-loading-overlay') as HTMLInputElement) {
				(document.getElementById('mlab-grid-loading-overlay') as HTMLInputElement).innerText = 'No Rows To Show';
			}
		} else {
			if (document.getElementById('mlab-grid-loading-overlay') as HTMLInputElement) {
				(document.getElementById('mlab-grid-loading-overlay') as HTMLInputElement).innerText = 'Please wait while your items are loading';
			}
		}
	}, [loading]);

	const onChangeSettingNameFilter = (data: any) => {
		setFilterCampaignSettingName(data.target.value);
	};

	const clearFields = () => {
		setFilterCampaignSettingName('');
		setFilterCreatedDate('');
		setFilterDateFrom('');
		setFilterDateTo('');
		setSelectedSettingStatus({value: '', label: 'Select All'});
		setSelectedSettingType({value: '', label: 'Select All'});
	};

	//  View
	return (
		<FormContainer onSubmit={formik.handleSubmit}>
			<MainContainer>
				<FormHeader headerLabel={'Search Point Incentive Setting'} />
				<ContentContainer>
					<FormGroupContainer>
						<div className='col-lg-3'>
							<label className='form-label'>Setting Name</label>
							<input
								type='text'
								autoComplete='off'
								className='form-control form-control-sm'
								aria-label='Setting Name'
								{...formik.getFieldProps('campaignSettingName')}
								value={filterCampaignSettingName}
								onChange={onChangeSettingNameFilter}
							/>
						</div>

						<div className='col-lg-2'>
							<label className='form-label'>Setting Status</label>
							<Select
								size='small'
								style={{width: '100%'}}
								options={CommonLookups('statusesWithDefault')}
								onChange={onChangeSettingStatus}
								value={selectedSettingStatus}
							/>
						</div>
						<div className='col-lg-2'>
							<label className='form-label'>Setting Type</label>
							<Select
								size='small'
								style={{width: '100%'}}
								options={CommonLookups('settingTypeWithDefault')}
								onChange={onChangeSettingType}
								value={selectedSettingType}
							/>
						</div>
						<div className='col-lg-2'>
							<label className='form-label'>Created Date</label>
							<DefaultDateRangePicker format='yyyy-MM-dd HH:mm:ss' maxDays={180} onChange={onChangeCreatedDate} value={filterCreatedDate} />
						</div>
					</FormGroupContainer>
					<FieldContainer>
						<FieldContainer>
							<ButtonsContainer>
								<MlabButton
									access={userAccess.includes(USER_CLAIMS.IncentiveGoalSettingRead)}
									size={'sm'}
									label={'Search'}
									style={ElementStyle.primary}
									type={'submit'}
									weight={'solid'}
									loading={loading}
									disabled={loading}
									loadingTitle={' Please wait...'}
									onClick={() => formik.handleSubmit()}
								/>

								<MlabButton
									access={userAccess.includes(USER_CLAIMS.IncentiveGoalSettingRead)}
									size={'sm'}
									label={'Clear'}
									style={ElementStyle.secondary}
									type={'button'}
									weight={'solid'}
									onClick={() => clearFields()}
								/>

								<MlabButton
									access={userAccess.includes(USER_CLAIMS.IncentiveGoalSettingWrite)}
									size={'sm'}
									label={'Add Goal Parameter to Point'}
									style={ElementStyle.primary}
									type={'button'}
									weight={'solid'}
									onClick={() => window.open('/campaign-management/campaign-setting/add-goal-parameter')}
								/>

								<MlabButton
									access={userAccess.includes(USER_CLAIMS.IncentiveGoalSettingWrite)}
									size={'sm'}
									label={'Add Point to Incentive Value'}
									style={ElementStyle.primary}
									type={'button'}
									weight={'solid'}
									onClick={() => window.open('/campaign-management/campaign-setting/add-point-incentive')}
								/>
							</ButtonsContainer>
						</FieldContainer>
					</FieldContainer>

					<div className='ag-theme-quartz' style={{height: 400, width: '100%'}}>
						<AgGridReact
							ref={gridRef}
							rowData={campaignSettingList}
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

export default PointIncentiveDetails;

import {faClone, faPencilAlt} from '@fortawesome/free-solid-svg-icons';
import {AgGridReact} from 'ag-grid-react';
import 'datatables.net';
import 'datatables.net-dt';
import {useFormik} from 'formik';
import {Guid} from 'guid-typescript';
import $ from 'jquery';
import moment from 'moment';
import React, {useEffect, useRef, useState} from 'react';
import {ButtonGroup} from 'react-bootstrap-v5';
import {shallowEqual, useDispatch, useSelector} from 'react-redux';
import Select from 'react-select';
import swal from 'sweetalert';
import {RootState} from '../../../../../setup';
import * as hubConnection from '../../../../../setup/hub/MessagingHub';
import '../../../../../_metronic/assets/css/datatables.min.css';
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
import {USER_CLAIMS} from '../../../user-management/components/constants/UserClaims';
import useCampaignSettingConstants from '../../constants/useCampaignSettingConstant';
import * as campaignSetting from '../../redux/AutoTaggingRedux';
//service
import {getCampaignSettingList, getCampaignSettingListResult} from '../../redux/AutoTaggingService';
import {AutoTaggingPointIncentiveFilterRequestModel} from '../models/request/AutoTaggingFiltersRequestModel';
import {CampaignSettingListResponseModel} from '../models/response/CampaignSettingListResponseModel';
import {TaggingConfigurationModel} from '../models/TaggingConfigurationModel';
import {UserTaggingModel} from '../models/UserTaggingModel';
import { ColDef, ColGroupDef } from 'ag-grid-community';

const initialValues = {
	campaignSettingId: 0,
	campaignSettingName: '',
	campaignSettingDescription: '',
	settingTypeId: 0,
	isActive: 0,
	campaignSettingTypeId: 43,
	goalParameterAmountId: 0,
	goalParameterCountId: 0,

	taggingConfigurationList: Array<TaggingConfigurationModel>(),
	userTaggingList: Array<UserTaggingModel>(),
	createdBy: '',
	createdDate: '',
	updatedBy: '',
	updatedDate: '',
};

const AutoTaggingDetails: React.FC = () => {
	//  Get redux store
	const userAccess = useSelector<RootState>(({auth}) => auth.access, shallowEqual) as string;
	const userAccessId = useSelector<RootState>(({auth}) => auth.userId, shallowEqual) as number;
	const dispatch = useDispatch();

	//  Constants
	const {successResponse, HubConnected} = useConstant();
	const {CampaignSettingTypes, LARGE, EDIT, ASC, CAMPAIGNSETTINGID} = useCampaignSettingConstants();

	//   STATES
	const gridRef: any = useRef();
	const [loading, setLoading] = useState(false);
	const [campaignSettingList, setCampaignSettingList] = useState<Array<CampaignSettingListResponseModel>>([]);
	const [pageSize, setPageSize] = useState<number>(10);
	const [currentPage, setCurrentPage] = useState<number>(1);
	const [recordCount, setRecordCount] = useState<number>(0);
	const [sortOrder, setSortOrder] = useState<string>(ASC);
	const [sortColumn, setSortColumn] = useState<string>(CAMPAIGNSETTINGID);

	//  FILTER
	const [filterCreatedDate, setFilterCreatedDate] = useState<any>(null);
	const [filterDateFrom, setFilterDateFrom] = useState<string>('');
	const [filterDateTo, setFilterDateTo] = useState<string>('');
	const [filterCampaignSettingName, setFilterCampaignSettingName] = useState<any>(null);
	const [filterIsActive, setFilterIsActive] = useState<string>('');
	const [filterSettingStatus, setFilterSettingStatus] = useState<LookupModel | null>();

	const [gridApi, setGridApi] = useState<any | null>(null);
	const [gridColumnApi, setGridColumnApi] = useState(null);

	//  Watchers
	useEffect(() => {
		setRecordCount(0);
		clearFields();
		dispatch(campaignSetting.actions.getCampaignSettingList([]));
		setFilterSettingStatus({value: '', label: 'Select All'});
	}, []);

	const onGridReady = (params: any) => {
		setGridApi(params.api);
		setGridColumnApi(params.columnApi);
		params.api.paginationGoToPage(4);
		params.api.sizeColumnsToFit();
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
			getAutoTaggingList(pageSize, 1);
		},
	});

	const onPageSizeChanged = () => {
		let value: string = (document.getElementById('page-size') as HTMLInputElement).value;

		setPageSize(Number(value));
		setCurrentPage(1);
		getAutoTaggingList(value, 1);
	};

	const onClickFirst = () => {
		if (currentPage > 1) {
			setCurrentPage(1);

			getAutoTaggingList(pageSize, 1);
		}
	};

	const onClickPrevious = () => {
		if (currentPage > 1) {
			setCurrentPage(currentPage - 1);
			getAutoTaggingList(pageSize, currentPage - 1);
		}
	};

	const onClickNext = () => {
		if (totalPage() > currentPage) {
			setCurrentPage(currentPage + 1);
			getAutoTaggingList(pageSize, currentPage + 1);
		}
	};

	const onClickLast = () => {
		if (totalPage() > currentPage) {
			setCurrentPage(totalPage());
			getAutoTaggingList(pageSize, totalPage());
		}
	};

	const totalPage = () => {
		return Math.ceil(recordCount / pageSize) | 0;
	};

	//  Methods
	const clearData = () => {
		dispatch(campaignSetting.actions.getTaggingConfigByList([]));
		dispatch(campaignSetting.actions.getUsersConfigByList([]));
		dispatch(campaignSetting.actions.getAutoTaggingDetailsById(initialValues));
	};

	const clearFields = () => {
		setFilterCampaignSettingName('');
		setFilterCreatedDate('');
		setFilterDateFrom('');
		setFilterDateTo('');
		setRecordCount(0);
		setCurrentPage(1);
		setPageSize(10);
		setFilterSettingStatus({value: '', label: 'Select All'});
	};

	const cloneDetailsPage = (data: any) => {
		clearData();
		window.open('/campaign-management/campaign-setting/add-auto-tagging/?action=clone&id=' + data.data.campaignSettingId);
	};

	const onSort = (e: any) => {
		if (campaignSettingList !== undefined && campaignSettingList.length > 0) {
			let sortDetail = e.api.getSortModel();
			if (sortDetail[0] !== undefined) {
				setSortColumn(sortDetail[0]?.colId);
				setSortOrder(sortDetail[0]?.sort);
			} else {
				setSortColumn('');
				setSortOrder('');
			}
		}
	};

	function getAutoTaggingList(page: any, currentpage: any) {
		setCampaignSettingList([]);
		setLoading(true);

		const messagingHub = hubConnection.createHubConnenction();
		setTimeout(() => {
			messagingHub.start().then(() => {
				const autoTaggingRequest: AutoTaggingPointIncentiveFilterRequestModel = {
					dateFrom: filterDateFrom,
					dateTo: filterDateTo,
					pageSize: page,
					offsetValue: (currentpage - 1) * page,
					sortColumn: 'CampaignSettingId',
					sortOrder: ASC,
					userId: userAccessId.toString(),
					queueId: Guid.create().toString(),
					campaignSettingName: filterCampaignSettingName !== '' ? filterCampaignSettingName : null,
					campaignSettingTypeId: CampaignSettingTypes.autoTaggingSettingTypeId, //FIXED for Auto Tagging
					isActive: filterSettingStatus?.value !== undefined ? parseInt(filterSettingStatus?.value) : undefined, //default to get active and inactive
					createdDate: filterCreatedDate ? filterCreatedDate.toString() : null,
				};
				getCampaignSettingList(autoTaggingRequest).then((response) => {
					if (response.status === successResponse) {
						messagingHub.on(autoTaggingRequest.queueId.toString(), (message) => {
							getCampaignSettingListResult(message.cacheId)
								.then((returnData) => {
									let feedbackData = Object.assign(new Array<CampaignSettingListResponseModel>(), returnData.data);
									setCampaignSettingList(feedbackData);
									let count = feedbackData.length > 0 ? feedbackData[0].recordCount : 0;
									setRecordCount(count);

									dispatch(campaignSetting.actions.getCampaignSettingList(returnData.data));

									messagingHub.off(autoTaggingRequest.queueId.toString());
									messagingHub.stop();

									setLoading(false);
								})
								.catch(() => {
									swal('Failed', 'getCampaignSettingListResult', 'error');
									setLoading(false);
								});
						});

						setTimeout(() => {
							if (messagingHub.state === HubConnected) {
								messagingHub.stop();
							}
						}, 30000);
					} else {
						swal('Failed', response.data.message, 'error');
						setLoading(false);
						messagingHub.stop();
					}
				});
			});
		}, 1000);
	}

	const columnDefs : (ColDef<CampaignSettingListResponseModel> | ColGroupDef<CampaignSettingListResponseModel>)[] =[
		{headerName: 'No', valueGetter: ('node.rowIndex + 1 + ' + (currentPage - 1) * pageSize).toString(), width: 90},
		{
			headerName: 'Setting Name',
			field: 'CampaignSettingName',
			cellClass: 'btn-link cursor-pointer',
			width: 320,
			cellRenderer: (params: any) => (
				<>
					{params.data.campaignSettingId !== 0 ? (
						<ButtonGroup aria-label='Basic example'>
							<div className='d-flex justify-content-center flex-shrink-0 shadow-none'>
								<label className='btn-link cursor-pointer' onClick={() => onOpenAutoTaggingDetails(params.data.campaignSettingId, 'view')}>
									{params.data.campaignSettingName}
								</label>
							</div>
						</ButtonGroup>
					) : null}
				</>
			),
		},

		{headerName: 'Setting Status', field: 'SettingStatusName'},

		{
			headerName: 'Created Date',
			field: 'CreatedDate',
			cellRenderer: (params: any) => <>{moment(params.data.createdDate).format('MM/D/yyyy HH:mm')}</>,
		},

		{headerName: 'Created By', field: 'CreatedBy'},

		{
			headerName: 'Last Modified Date',
			field: 'UpdatedDate',
			cellRenderer: (params: any) => (
				<>{params.data.updatedDate !== undefined ? moment(params.data.updatedDate).format('MM/D/yyyy HH:mm') : ''}</>
			),
		},

		{headerName: 'Last Modified By', field: 'UpdatedBy'},

		{
			headerName: 'Action',
			width: 100,
			cellRenderer: (params: any) => (
				<>
					{params.data.campaignSettingId !== 0 ? (
						<ButtonGroup aria-label='Basic example'>
							<div className='d-flex justify-content-center flex-shrink-0 shadow-none'>
								<div className='me-4'>
									<TableIconButton
										access={userAccess.includes(USER_CLAIMS.SearchAutoTaggingWrite)}
										faIcon={faPencilAlt}
										toolTipText={'Edit'}
										onClick={() => onOpenAutoTaggingDetails(params.data.campaignSettingId, 'edit')}
									/>
								</div>
								<div className='me-4'>
									<TableIconButton
										access={userAccess.includes(USER_CLAIMS.SearchAutoTaggingWrite)}
										faIcon={faClone}
										toolTipText={'Clone'}
										onClick={() => cloneDetailsPage(params)}
									/>
								</div>
							</div>
						</ButtonGroup>
					) : null}
				</>
			),
		},
	];

	//  FILTER EVENTS
	const onChangeSettingNameFilter = (data: any) => {
		setFilterCampaignSettingName(data.target.value);
	};

	const onChangeSettingStatus = (data: LookupModel) => {
		if (data) {
			setFilterSettingStatus(data);
		}
	};

	function onChangeCreatedDate(data: any) {
		if (data !== undefined) {
			setFilterCreatedDate(data);
			setFilterDateFrom(data[0]);
			setFilterDateTo(data[1]);
		}
	}

	const onOpenAutoTaggingDetails = (id: string, action: string) => {
		if (action === 'edit') {
			window.open('/campaign-management/campaign-setting/edit-auto-tagging/' + id);
		} else window.open('/campaign-management/campaign-setting/view-auto-tagging/' + id);
	};

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

	useEffect(() => {
		const table = $('.table-autoTagging').find('table').DataTable();
		table.clear();
		table.rows.add(campaignSettingList);
		table
			.on('order.dt search.dt', function () {
				table
					.column(0, {search: 'applied', order: 'applied'})
					.nodes()
					.each(function (cell, i) {
						cell.innerHTML = i + 1;
					});
			})
			.draw();
			
		dispatch(campaignSetting.actions.getCampaignSettingList(campaignSettingList));
	}, [campaignSettingList]);

	//  Views
	return (
		<FormContainer onSubmit={formik.handleSubmit}>
			<MainContainer>
				<FormHeader headerLabel={'Search Auto Tagging Setting'} />
				<ContentContainer>
					<FormGroupContainer>
						<div className='col-lg-4'>
							<label className='form-label'>Setting Name</label>
							<input type='text' className='form-control form-control-sm' value={filterCampaignSettingName} onChange={onChangeSettingNameFilter} />
						</div>

						<div className='col-lg-2'>
							<label className='form-label'>Setting Status</label>
							<Select
								size='small'
								style={{width: '100%'}}
								options={CommonLookups('statusesWithDefault')}
								onChange={onChangeSettingStatus}
								value={filterSettingStatus}
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
									access={userAccess.includes(USER_CLAIMS.SearchAutoTaggingRead)}
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
									access={userAccess.includes(USER_CLAIMS.SearchAutoTaggingRead)}
									size={'sm'}
									label={'Clear'}
									style={ElementStyle.secondary}
									type={'button'}
									weight={'solid'}
									onClick={() => clearFields()}
								/>

								<MlabButton
									access={userAccess.includes(USER_CLAIMS.SearchAutoTaggingWrite)}
									size={'sm'}
									label={'Add Auto Tagging Setting'}
									style={ElementStyle.primary}
									type={'button'}
									weight={'solid'}
									onClick={() => window.open('/campaign-management/campaign-setting/add-auto-tagging')}
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
							overlayNoRowsTemplate={gridOverlayNoRowsTemplate}
							columnDefs={columnDefs}
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

export default AutoTaggingDetails;

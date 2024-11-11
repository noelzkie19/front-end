import {AgGridReact} from 'ag-grid-react';
import {Guid} from 'guid-typescript';
import React, {useRef, useState} from 'react';
import {shallowEqual, useSelector} from 'react-redux';
import swal from 'sweetalert';
import {RootState} from '../../../../../setup';
import * as hubConnection from '../../../../../setup/hub/MessagingHub';
import {ElementStyle, HttpStatusCodeEnum} from '../../../../constants/Constants';
import {
	ButtonsContainer,
	ContentContainer,
	DefaultDateRangePicker,
	FormGroupContainer,
	FormHeader,
	MainContainer,
	MlabButton,
} from '../../../../custom-components';
import DefaultGridPagination from '../../../../custom-components/grid-pagination/DefaultGridPagination';
import {formatDate} from '../../../../custom-functions/helper/dateHelper';
import {USER_CLAIMS} from '../../../user-management/components/constants/UserClaims';
import {CustomEventFilterModel, CustomEventFilterResponseModel} from '../models';
import {getCampaignCustomEventSettingList, getCampaignCustomEventSettingListResult} from '../services/CampaignCustomEventSettingService';
import AddCustomEventModal from './AddCustomEventModal';

const CustomEventList: React.FC = () => {
	// States
	const gridRef: any = useRef();
	const userAccessId = useSelector<RootState>(({auth}) => auth.userId, shallowEqual) as number;
	const userAccess = useSelector<RootState>(({auth}) => auth.access, shallowEqual) as string;
	const [loading, setLoading] = useState(false);
	const [isEditFlag] = useState(false);
	const [showModal, setShowModal] = useState(false);
	const [eventList, setEventList] = useState<Array<any>>([]);
	const [eventNameFilter, setEventNameFilter] = useState('');
	const [createdDateFilter, setCreatedDatefilter] = useState(['', '']);
	const [pageSize, setPageSize] = useState<number>(10);
	const [currentPage, setCurrentPage] = useState<number>(1);
	const [recordCount, setRecordCount] = useState<number>(0);
	const [sortOrder, setSortOrder] = useState<string>('ASC');
	const [sortColumn, setSortColumn] = useState<string>('CampaignEventSettingId');

	const columnDefs = [
		{headerName: 'No', field: 'campaignEventSettingId'},
		{headerName: 'Custom Event Name', field: 'customEventName'},
		{headerName: 'Created Date', field: 'createdDate', cellRenderer: (params: any) => formatDate(params.data.createdDate)},
		{headerName: 'Created By', field: 'createdByName'},
	];

	// Methods
	const handleEventNameFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setEventNameFilter(event.target.value);
	};

	const handleCreatedDateFilterChange = (dateRange: any) => {
		setCreatedDatefilter(dateRange);
	};

	const onPageSizeChanged = () => {
		const value: string = (document.getElementById('page-size') as HTMLInputElement).value;
		setPageSize(Number(value));
		setCurrentPage(1);

		if (eventList != undefined && eventList.length > 0) {
			paginationLoadList(Number(value), 1, sortColumn, sortOrder);
		}
	};

	const onClickFirst = () => {
		if (currentPage > 1) {
			setCurrentPage(1);
			paginationLoadList(pageSize, 1, sortColumn, sortOrder);
		}
	};

	const onClickPrevious = () => {
		if (currentPage > 1) {
			setCurrentPage(currentPage - 1);
			paginationLoadList(pageSize, currentPage - 1, sortColumn, sortOrder);
		}
	};

	const onClickNext = () => {
		if (totalPage() > currentPage) {
			setCurrentPage(currentPage + 1);
			paginationLoadList(pageSize, currentPage + 1, sortColumn, sortOrder);
		}
	};

	const onClickLast = () => {
		if (totalPage() > currentPage) {
			setCurrentPage(totalPage());
			paginationLoadList(pageSize, totalPage(), sortColumn, sortOrder);
		}
	};

	const totalPage = () => {
		return Math.ceil(recordCount / pageSize) | 0;
	};

	const onSort = (e: any) => {
		if (eventList != undefined && eventList.length > 0) {
			const sortDetail = e.api.getSortModel();
			if (sortDetail[0] != undefined) {
				setSortColumn(sortDetail[0]?.colId);
				setSortOrder(sortDetail[0]?.sort);
				loadCustomEventList();
			} else {
				setSortColumn('');
				setSortOrder('');
				loadCustomEventList();
			}
		}
	};

	const handleSearch = () => {
		setCurrentPage(1);
		let request: CustomEventFilterModel = {
			customEventName: eventNameFilter,
			dateFrom: createdDateFilter[0],
			dateTo: createdDateFilter[1],
			pageSize: pageSize,
			offsetValue: 0,
			sortColumn: sortColumn,
			sortOrder: sortOrder,
			queueId: Guid.create().toString(),
			userId: userAccessId.toString(),
		};
		loadCustomEventList(request);
	};

	const handleClear = () => {
		setEventNameFilter('');
		setCreatedDatefilter([]);
		setEventList([]);
		setRecordCount(0);
		setCurrentPage(1);
	};

	const addNew = () => {
		setShowModal(true);
	};

	const paginationLoadList = (_pageSize: number, _currentPage: number, _sortColumn: string, _sortOrder: string) => {
		const request: any = {
			pageSize: _pageSize,
			offsetValue: (_currentPage - 1) * _pageSize,
			sortColumn: _sortColumn,
			sortOrder: _sortOrder,
			userId: userAccessId.toString(),
			queueId: Guid.create().toString(),
		};

		loadCustomEventList(request);
	};

	const loadCustomEventList = (requestParam?: CustomEventFilterModel) => {
		let request: CustomEventFilterModel = {
			customEventName: eventNameFilter,
			dateFrom: createdDateFilter[0],
			dateTo: createdDateFilter[1],
			pageSize: pageSize,
			offsetValue: (currentPage - 1) * pageSize,
			sortColumn: sortColumn,
			sortOrder: sortOrder,
			queueId: Guid.create().toString(),
			userId: userAccessId.toString(),
		};

		if (requestParam) {
			request = requestParam;
		}
		setLoading(true);
		onBtShowLoading();
		setTimeout(() => {
			const messagingHub = hubConnection.createHubConnenction();
			messagingHub
				.start()
				.then(() => {
					if (messagingHub.state === 'Connected') {
						getCampaignCustomEventSettingList(request)
							.then((response) => {
								if (response.status === HttpStatusCodeEnum.Ok) {
									messagingHub.on(request.queueId.toString(), (message) => {
										getCampaignCustomEventSettingListResult(message.cacheId).then((data) => {
											let resultData = Object.assign({}, data.data as CustomEventFilterResponseModel);
											setEventList(resultData.campaignCustomEventSettingList);
											setRecordCount(resultData.totalRecordCount);
											setLoading(false);
											onBtHide();
											if (resultData.totalRecordCount === 0) {
												swal('Custom Event Setting', 'No Rows To Show', 'info');
											}
											messagingHub.off(request.queueId.toString());
											messagingHub.stop();
										});
									});
									setTimeout(() => {
										if (messagingHub.state === 'Connected') {
											messagingHub.stop();
										}
									}, 30000);
								} else {
									messagingHub.stop();
									setLoading(false);
									onBtHide();
								}
							})
							.catch(() => {
								setLoading(false);
								onBtHide();
							});
					}
				})
				.catch(() => {
					messagingHub.stop();
					setLoading(false);
					onBtHide();
				});
		}, 1000);
	};

	const toggleModal = () => {
		setShowModal(!showModal);
	};

	const saveComplete = () => {
		toggleModal();
		handleClear();
		handleSearch();
	};

	const onGridReady = () => {
		resizeColumns();
	};

	const onBtShowLoading = () => {
		gridRef.current.api.showLoadingOverlay();
	};

	const onBtHide = () => {
		gridRef.current.api.hideOverlay();
	};

	const resizeColumns = () => {
		gridRef.current.api.sizeColumnsToFit();
	};
	return (
		<>
			<MainContainer>
				<FormHeader headerLabel={'Search Campaign Custom Event'} />
				<ContentContainer>
					<FormGroupContainer>
						<div className='col-md-3'>
							<label className='form-label-sm mb-2'>Custom Event Name</label>
							<input type='text' value={eventNameFilter} onChange={handleEventNameFilterChange} className='form-control form-control-sm' />
						</div>

						<div className='col-md-3'>
							<label className='form-label-sm mb-2'>Created Date</label>
							<DefaultDateRangePicker format='yyyy-MM-dd HH:mm:ss' maxDays={180} onChange={handleCreatedDateFilterChange} value={createdDateFilter} />
						</div>
					</FormGroupContainer>
					<FormGroupContainer>
						<ButtonsContainer>
							<MlabButton
								access={userAccess.includes(USER_CLAIMS.CustomEventSettingRead)}
								size={'sm'}
								label={'Search'}
								style={ElementStyle.primary}
								type={'button'}
								weight={'solid'}
								loading={loading}
								disabled={loading}
								loadingTitle={' Please wait...'}
								onClick={handleSearch}
							/>
							<MlabButton
								access={userAccess.includes(USER_CLAIMS.CustomEventSettingRead)}
								size={'sm'}
								label={'Clear'}
								style={ElementStyle.secondary}
								type={'button'}
								weight={'solid'}
								onClick={handleClear}
							/>

							<MlabButton
								access={userAccess.includes(USER_CLAIMS.CustomEventSettingWrite)}
								size={'sm'}
								label={'Add Airship Custom Event'}
								style={ElementStyle.primary}
								type={'button'}
								weight={'solid'}
								loading={loading}
								disabled={loading}
								loadingTitle={' Please wait...'}
								onClick={addNew}
							/>
						</ButtonsContainer>
					</FormGroupContainer>

					<FormGroupContainer>
						<div className='ag-theme-quartz' style={{height: 400, width: '100%', marginBottom: '50px'}}>
							<AgGridReact
								ref={gridRef}
								rowData={eventList}
								rowStyle={{userSelect: 'text'}}
								defaultColDef={{
									sortable: true,
									resizable: true,
								}}
								onGridReady={onGridReady}
								rowBuffer={0}
								enableRangeSelection={true}
								pagination={false}
								paginationPageSize={pageSize}
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
					</FormGroupContainer>
				</ContentContainer>
			</MainContainer>

			<AddCustomEventModal
				title='Add Custom Event'
				isEditMode={isEditFlag}
				modal={showModal}
				rowData={[]}
				closeModal={toggleModal}
				configInfo={undefined}
				confirmSave={saveComplete}
			/>
		</>
	);
};

export default CustomEventList;

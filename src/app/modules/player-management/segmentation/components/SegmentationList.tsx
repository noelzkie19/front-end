import { faClone, faExchangeAlt, faPencilAlt } from '@fortawesome/free-solid-svg-icons';
import { Guid } from 'guid-typescript';
import { useEffect, useRef, useState } from 'react';
import { ButtonGroup } from 'react-bootstrap-v5';
import { shallowEqual, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import Switch from 'react-switch';
import swal from 'sweetalert';
import { RootState } from '../../../../../setup';
import * as hubConnection from '../../../../../setup/hub/MessagingHub';
import { ElementStyle, HttpStatusCodeEnum, PROMPT_MESSAGES } from '../../../../constants/Constants';
import useConstant from '../../../../constants/useConstant';
import {
	ButtonsContainer,
	ContentContainer,
	FormGroupContainer,
	FormHeader,
	GridWithLoaderAndPagination,
	MainContainer,
	MlabButton,
	TableIconButton
} from '../../../../custom-components';
import { FILTER_STATUS_OPTIONS_SELECT_ALL } from '../../../system/components/constants/SelectOptions';
import { USER_CLAIMS } from '../../../user-management/components/constants/UserClaims';
import { SegmentFilterRequestModel, SegmentListModel } from '../models';
import {
	deactivateSegmentation,
	getSegmentationList,
	getSegmentationListResult,
	triggerVarianceDistributionService
} from '../redux/SegmentationService';
import useSegmentConstant from '../useSegmentConstant';
import { useSegmentTypeOptions } from './shared/hooks';


const SegmentationList: React.FC = () => {
	//	Constants
	const {SegmentTypes} = useSegmentConstant();
	const {successResponse, HubConnected} = useConstant();
	// States and Variables
	const userAccess = useSelector<RootState>(({auth}) => auth.access, shallowEqual) as string;
	const userAccessId = useSelector<RootState>(({auth}) => auth.userId, shallowEqual) as number;
	const history = useHistory();
	const gridRef: any = useRef();

	//component states
	const [gridApi, setGridApi] = useState<any>();
	const [loading, setLoading] = useState<boolean>(false);
	const [segmentNameFilter, setSegmentNameFilter] = useState<string>('');
	const [segmentStatusFilter, setSegmentStatusFilter] = useState<string>('');
	const [segmentTypeFilter, setSegmentTypeFilter] = useState<string>('');
	const [segmentListState, setSegmentListState] = useState<Array<SegmentListModel>>([]);

	//server-side pagination states
	const [pageSize, setPageSize] = useState<number>(10);
	const [currentPage, setCurrentPage] = useState<number>(1);
	const [recordCount, setRecordCount] = useState<number>(0);
	const [sortOrder, setSortOrder] = useState<string>('ASC');
	const [sortColumn, setSortColumn] = useState<string>('SegmentId');

	//	Effects
	useEffect(() => {
		console.log('loading ', loading, segmentListState);
		if (!loading && segmentListState && segmentListState.length === 0) {
			if (document.getElementById('mlab-grid-loading-overlay') as HTMLInputElement) {
				(document.getElementById('mlab-grid-loading-overlay') as HTMLInputElement).innerText = 'No Rows To Show';
			}
		} else if (loading) {
			if (document.getElementById('mlab-grid-loading-overlay') as HTMLInputElement) {
				(document.getElementById('mlab-grid-loading-overlay') as HTMLInputElement).innerText = 'Please wait while your items are loading';
			}
		}
	}, [loading]);

	// Hooks
	const {segmentTypeOption} = useSegmentTypeOptions();

	// Table events
	const onPageSizeChanged = () => {
		const value: string = (document.getElementById('page-size') as HTMLInputElement).value;
		setPageSize(Number(value));
		setCurrentPage(1);

		if (segmentListState != undefined && segmentListState.length > 0) {
			paginationSearchSegments(Number(value), 1, sortColumn, sortOrder);
		}
	};

	const onClickFirst = () => {
		if (currentPage > 1) {
			setCurrentPage(1);
			paginationSearchSegments(pageSize, 1, sortColumn, sortOrder);
		}
	};

	const onClickPrevious = () => {
		if (currentPage > 1) {
			setCurrentPage(currentPage - 1);
			paginationSearchSegments(pageSize, currentPage - 1, sortColumn, sortOrder);
		}
	};

	const onClickNext = () => {
		if (totalPage() > currentPage) {
			setCurrentPage(currentPage + 1);
			paginationSearchSegments(pageSize, currentPage + 1, sortColumn, sortOrder);
		}
	};

	const onClickLast = () => {
		if (totalPage() > currentPage) {
			setCurrentPage(totalPage());
			paginationSearchSegments(pageSize, totalPage(), sortColumn, sortOrder);
		}
	};

	const totalPage = () => {
		return Math.ceil(recordCount / pageSize) | 0;
	};

	const onSort = (e: any) => {
		if (segmentListState != undefined && segmentListState.length > 0) {
			const sortDetail = e.api.getSortModel();
			if (sortDetail[0] != undefined) {
				setSortColumn(sortDetail[0]?.colId);
				setSortOrder(sortDetail[0]?.sort);
				searchSegments();
			} else {
				setSortColumn('');
				setSortOrder('');
				searchSegments();
			}
		}
	};

	const onGridReady = (params: any) => {
		setGridApi(params.api);
		params.api.sizeColumnsToFit();
	};

	const onBtShowLoading = () => {
		//gridApi && gridApi.showLoadingOverlay();
	};

	const onBtShowNoRows = () => {
		gridApi && gridApi.showNoRowsOverlay();
	};

	const onBtHide = () => {
		gridApi && gridApi.hideOverlay();
	};

	// Api Methods
	const searchSegments = (requestParam?: SegmentFilterRequestModel) => {
		let request: SegmentFilterRequestModel = {
			queueId: Guid.create().toString(),
			userId: userAccessId.toString(),
			segmentName: segmentNameFilter,
			segmentTypeId: segmentTypeFilter,
			segmentStatus: segmentStatusFilter === '' ? undefined : segmentStatusFilter && segmentStatusFilter === 'true' ? true : false,
			pageSize: pageSize,
			offsetValue: (1 - 1) * pageSize,
			sortColumn: sortColumn,
			sortOrder: sortOrder,
		};

		if (requestParam) {
			request = requestParam;
		} else {
			setCurrentPage(1);
		}

		setLoading(true);
		onBtShowLoading();
		setSegmentListState([]); //to clear and display loading page
		setTimeout(() => {
			const messagingHub = hubConnection.createHubConnenction();
			messagingHub
				.start()
				.then(() => {
					if (messagingHub.state === HubConnected) {
						getSegmentationList(request)
							.then((response) => {
								if (response.status === successResponse) {
									messagingHub.on(request.queueId.toString(), (message) => {
										getSegmentationListResult(message.cacheId)
											.then((data) => {
												console.log('--- segmentation list');
												console.log(data);

												setSegmentListState(data.data.segments);
												setRecordCount(data.data.recordCount);
												setLoading(false);
												onBtHide();
												messagingHub.off(request.queueId.toString());
												messagingHub.stop();
											})
											.catch(() => {});
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

	const paginationSearchSegments = (_pageSize: number, _currentPage: number, _sortColumn: string, _sortOrder: string) => {
		const request: SegmentFilterRequestModel = {
			queueId: Guid.create().toString(),
			userId: userAccessId.toString(),
			segmentName: segmentNameFilter,
			segmentTypeId: segmentTypeFilter,
			segmentStatus: segmentStatusFilter === '' ? undefined : segmentStatusFilter && segmentStatusFilter === 'true' ? true : false,
			pageSize: _pageSize,
			offsetValue: (_currentPage - 1) * _pageSize,
			sortColumn: _sortColumn,
			sortOrder: _sortOrder,
		};

		searchSegments(request);
	};

	// Page Redirection
	const createNewSegment = () => {
		window.open('/player-management/create-segment');
	};

	const editSegment = (params: any) => {
		if (!((params.data.isActive && params.data.segmentTypeId.toString() === SegmentTypes.Distribution) || params.data.isReactivated)) {
			window.open('/player-management/segment/edit/' + params.data.segmentId);
		}
	};

	const cloneSegment = (params: any) => {
		window.open('/player-management/segment/clone/' + params.data.segmentId);
	};

	const convertSegmentToStatic = (params: any) => {
		if (!(params.data.segmentTypeId.toString() === SegmentTypes.Distribution)) {
			window.open('/player-management/segment/tostatic/' + params.data.segmentId);
		}
	};

	const viewSegment = (_segmentId: string) => {
		window.open('/player-management/segment/view/' + _segmentId);
	};

	// Events
	const handleNameFilterChange = (event: any) => {
		setSegmentNameFilter(event.target.value);
	};

	const handleStatusFilterChange = (event: any) => {
		setSegmentStatusFilter(event.target.value);
	};

	const handleTypeFilterChange = (_distributionType: string) => {
		setSegmentTypeFilter(_distributionType);
	};

	const handleDeactivate = (val: any) => {
		const title = val.isActive === true || val.isActive === 'True' ? 'Deactivate' : 'Activate';
		swal({
			title: title,
			text: PROMPT_MESSAGES.ConfirmDeactivateActivateMessage(title),
			icon: 'warning',
			buttons: ['Cancel', 'Confirm'],
			dangerMode: true,
		}).then((willDelete) => {
			if (willDelete) {
				//run distribution service if segment is changed to active status
				if (!val.isActive) {
					triggerVarianceDistributionService({segmentId: val.segmentId, userId: userAccessId});
				}
				//	deactivate
				deactivateSegmentation(val.segmentId, userAccessId).then((response) => {
					if (response.status === HttpStatusCodeEnum.Ok) {
						searchSegments();
					} else {
						swal(PROMPT_MESSAGES.FailedValidationTitle, 'Error Deactivating Segmentation', 'error');
					}
				});
			}
		});
	};

	// Column and header
	const columnDefs = [
		{headerName: 'No', field: 'segmentId', sort: 'asc' as 'asc'},
		{
			headerName: 'Segment Name',
			field: 'segmentName',
			cellRenderer: (params: any) => (
				<label
					className='btn-link cursor-pointer'
					onClick={() => {
						viewSegment(params.data.segmentId);
					}}
				>
					{params.data.segmentName}
				</label>
			),
		},
		{headerName: 'Segment Description', field: 'segmentDescription'},
		{
			headerName: 'Segment Status',
			field: 'isActive',
			cellRenderer: (params: any) => (
				<Switch
					disabled={!userAccess.includes(USER_CLAIMS.CreateSegmentationWrite)}
					checked={params.data.isActive}
					onChange={() => handleDeactivate(params.data)}
					handleDiameter={28}
					offColor='#E4E6EF'
					onColor='#3699FF'
					offHandleColor='#3699FF'
					onHandleColor='#b8bac1'
					height={30}
					width={100}
					borderRadius={6}
					uncheckedIcon={
						<div
							style={{
								display: 'flex',
								justifyContent: 'center',
								alignItems: 'center',
								height: '100%',
								fontSize: 12,
								color: 'black',
								paddingRight: 25,
							}}
						>
							Inactive
						</div>
					}
					checkedIcon={
						<div
							style={{
								display: 'flex',
								justifyContent: 'center',
								alignItems: 'center',
								height: '100%',
								fontSize: 12,
								color: 'white',
								paddingLeft: 25,
							}}
						>
							Active
						</div>
					}
					className='react-switch'
					id='small-radius-switch'
				/>
			),
		},
		{
			headerName: 'Segment Type',
			field: 'segmentTypeId',
			cellRenderer: (params: any) => (
				<label>{params.data.segmentTypeId.toString() === SegmentTypes.Distribution ? 'Distribution' : 'Normal'}</label>
			),
		},
		{
			headerName: 'Action',
			field: 'id',
			cellRenderer: (params: any) => (
				<>
					<ButtonGroup aria-label='Basic example'>
						<div className='d-flex justify-content-center flex-shrink-0'>
							{(userAccess.includes(USER_CLAIMS.SegmentationWrite) || userAccess.includes(USER_CLAIMS.CreateSegmentationWrite)) && (
								<div className='me-4'>
									<TableIconButton
										access={true}
										faIcon={faPencilAlt}
										isDisable={
											(params.data.isActive && params.data.segmentTypeId.toString() === SegmentTypes.Distribution) || params.data.isReactivated
										}
										toolTipText={'Edit'}
										onClick={() => editSegment(params)}
									/>
								</div>
							)}
							{(userAccess.includes(USER_CLAIMS.SegmentationWrite) || userAccess.includes(USER_CLAIMS.CreateSegmentationWrite)) && (
								<div className='me-4'>
									<TableIconButton access={true} faIcon={faClone} toolTipText={'Clone'} onClick={() => cloneSegment(params)} isDisable={false} />
								</div>
							)}
							{(userAccess.includes(USER_CLAIMS.SegmentationWrite) || userAccess.includes(USER_CLAIMS.SetSegmentationToStaticWrite)) && (
								<div className='me-4'>
									<TableIconButton
										access={true}
										faIcon={faExchangeAlt}
										toolTipText={'Convert to Static'}
										onClick={() => convertSegmentToStatic(params)}
										isDisable={params.data.segmentTypeId.toString() === SegmentTypes.Distribution || (params.data.hasTableau && !params.data.isTableauSegmentHasPlayers) }
									/>
								</div>
							)}
						</div>
					</ButtonGroup>
				</>
			),
		},
	];

	return (
		<MainContainer>
			<FormHeader headerLabel={'Manage Segments'} />
			<ContentContainer>
				<FormGroupContainer>
					<div className='col-lg-4'>
						<label>Segment Name</label>
						<input
							type='text'
							className='form-control form-control-sm'
							placeholder='Segment Name'
							value={segmentNameFilter}
							onChange={handleNameFilterChange}
						/>
					</div>
					<div className='col-lg-4'>
						<label>Segment Status</label>
						<select className='form-select form-select-sm' aria-label='Select status' value={segmentStatusFilter} onChange={handleStatusFilterChange}>
							{FILTER_STATUS_OPTIONS_SELECT_ALL.map((item, index) => (
								<option key={index} value={item.value.toString()}>
									{item.label}
								</option>
							))}
						</select>
					</div>
					<div className='col-lg-4'>
						<label>Segment Type</label>
						<select
							className='form-select form-select-sm'
							aria-label='Select Type'
							value={segmentTypeFilter}
							onChange={(e) => handleTypeFilterChange(e.target.value)}
						>
							{segmentTypeOption
								.concat({label: 'Select All', value: ''})
								.reverse()
								.map((item, index) => (
									<option key={index} value={item.value.toString()}>
										{item.label}
									</option>
								))}
						</select>
					</div>
				</FormGroupContainer>
				<FormGroupContainer>
					<ButtonsContainer>
						<MlabButton
							type={'submit'}
							weight={'solid'}
							style={ElementStyle.primary}
							access={userAccess.includes(USER_CLAIMS.SegmentationRead)}
							loading={loading}
							label={'Search'}
							loadingTitle={' Please wait...'}
							disabled={loading}
							onClick={() => searchSegments()}
						/>
						<MlabButton
							type={'button'}
							weight={'solid'}
							style={ElementStyle.primary}
							access={userAccess.includes(USER_CLAIMS.SegmentationWrite)}
							label={'Create New'}
							onClick={() => createNewSegment()}
						/>
					</ButtonsContainer>
				</FormGroupContainer>
				<FormGroupContainer>
					<div>
						{/* To sync grid loading with other modules, use this component */}
						<GridWithLoaderAndPagination
							gridRef={gridRef}
							rowData={segmentListState}
							columnDefs={columnDefs}
							sortColumn={sortColumn}
							sortOrder={sortOrder}
							isLoading={loading}
							height={400}
							onSortChanged={(e: any) => onSort(e)}
							//pagination details
							recordCount={recordCount}
							currentPage={currentPage}
							pageSize={pageSize}
							onClickFirst={onClickFirst}
							onClickPrevious={onClickPrevious}
							onClickNext={onClickNext}
							onClickLast={onClickLast}
							onPageSizeChanged={onPageSizeChanged}
							noTopPad={true}
						></GridWithLoaderAndPagination>
					</div>
				</FormGroupContainer>
			</ContentContainer>
		</MainContainer>
	);
};

export default SegmentationList;

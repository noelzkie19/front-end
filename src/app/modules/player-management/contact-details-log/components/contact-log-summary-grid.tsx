import { AgGridReact } from 'ag-grid-react';
import { Guid } from 'guid-typescript';
import { useEffect, useState } from 'react';
import { ButtonGroup } from 'react-bootstrap-v5';
import { shallowEqual, useSelector } from 'react-redux';
import swal from 'sweetalert';
import { RootState } from '../../../../../setup';
import * as hubConnection from '../../../../../setup/hub/MessagingHub';
import useConstant from '../../../../constants/useConstant';
import { DefaultGridPagination, FormGroupContainer } from '../../../../custom-components';
import { ContactLogListRequestModel } from '../models/ContactLogListRequestModel';
import { ContactLogSummaryModel } from '../models/ContactLogSummaryModel';
import { ContactLogSummaryResponseModel } from '../models/ContactLogSummaryResponseModel';
import { getViewContactLogList, getViewContactLogListResult } from '../redux/ContactDetailsLogService';
import { ColDef, ColGroupDef } from 'ag-grid-community';

interface TableListModel {
	tabType: string;
	label: string;
	id?: number;
	guid: string;
	description: string;
	recordCount?: number;
	teamId?: string;
}

type Props = {
	tabType?: string;
	onClickTeam: (a: TableListModel) => void;
	onSearchValue?: ContactLogListRequestModel;
	tabList?: TableListModel;
};

export const ContactLogSummaryGrid = (props: Props) => {
	const [pageSize, setPageSize] = useState<number>(10);
	const [currentPage, setCurrentPage] = useState<number>(1);
	const [recordCount, setRecordCount] = useState<number>(0);
	const [sortOrder, setSortOrder] = useState<string>('asc');
	const [sortColumn, setSortColumn] = useState<string>('teamName');
	const [contactLogSummaryList, setContactLogSummaryList] = useState<Array<ContactLogSummaryModel>>([]);
	const userAccessId = useSelector<RootState>(({auth}) => auth.userId, shallowEqual) as number;
	const [loading, setLoading] = useState(false);
	const [gridApi, setGridApi] = useState<any>();
	const {HubConnected, successResponse} = useConstant()

	//   GRID DETAILS
	const columnDefs : (ColDef<ContactLogSummaryModel> | ColGroupDef<ContactLogSummaryModel>)[] = [
		{headerName: 'No', valueGetter: ('node.rowIndex + 1 + ' + (currentPage - 1) * pageSize).toString(), sortable: false, width: 60},
		{
			headerName: 'Team Name',
			field: 'teamName',
			minWidth: 400,
			cellClass: 'btn-link cursor-pointer',
			cellRenderer: (params: any) => (
				<ButtonGroup aria-label='Basic example'>
				<div className='d-flex justify-content-center flex-shrink-0 shadow-none'>
				<label className='btn-link cursor-pointer'
					onClick={() => {
						onClickRow(params.data);
					}}
				>
				<a href={'#' + params.data.teamName}>{params.data.teamName}</a>
				</label>
				</div>
			</ButtonGroup>
			),
		},
		{headerName: 'Total Unique User', field: 'totalUniqueUserCount', minWidth: 100},
		{headerName: 'Total Unique Player', field: 'totalUniquePlayerCount', minWidth: 100},
	];
	
	const onClickFirst = () => {
		if (currentPage > 1) {
			setCurrentPage(1);
			loadContactLogSummaryList(pageSize, 1, sortColumn, sortOrder);
		}
	};

	const onClickPrevious = () => {
		if (currentPage > 1) {
			setCurrentPage(currentPage - 1);
			loadContactLogSummaryList(pageSize, 1, sortColumn, sortOrder);
		}
	};

	const onClickNext = () => {
		if (totalPage() > currentPage) {
			setCurrentPage(currentPage + 1);
			loadContactLogSummaryList(pageSize, currentPage + 1, sortColumn, sortOrder);
		}
	};

	const onClickLast = () => {
		if (totalPage() > currentPage) {
			setCurrentPage(totalPage());
			loadContactLogSummaryList(pageSize, totalPage(), sortColumn, sortOrder);
		}
	};

	const totalPage = () => {
		return Math.ceil(recordCount / pageSize) | 0;
	};
	const onPageSizeChanged = (value: any) => {
		setPageSize(Number(value));
		setCurrentPage(1);
		if (contactLogSummaryList != undefined && contactLogSummaryList.length > 0) {
			loadContactLogSummaryList(Number(value), 1, sortColumn, sortOrder);
		}
	};
	const onClickRow = (params: any) => {
		const request: TableListModel = {
			label: params.teamName,
			description: params.teamName,
			tabType: 'team',
			id: params.teamId,
			guid: Guid.create().toString(),
			teamId: params.teamId,
		};

		if (props != undefined) props.onClickTeam(request);
	};
	//  WATCHERS
	const onGridReady = (params: any) => {
		setGridApi(params.api);
		params.api.sizeColumnsToFit();
	};
	
	useEffect(() => {
		  try {
			if (props.onSearchValue !== undefined) {
			   loadContactLogSummaryList(pageSize, currentPage, sortColumn, sortOrder)
			   console.log(loading)
			}
		  } catch (error: any) {
			console.error(error);
		  }
		console.clear();
	  }, [props.onSearchValue]);


	const loadContactLogSummaryList = (pageSize: number, currentPage: number, sortColumn: string, sortOrder: string) => {
		setLoading(true);
		const messagingHub = hubConnection.createHubConnenction();
		
		messagingHub.start()
		  .then(() => {
			if (messagingHub.state === HubConnected) {
			  fetchContactLogList(props, {currentPage, pageSize}, {sortColumn, sortOrder}, userAccessId, gridApi, messagingHub)
				.catch((error) => {
				  swal('Failed', 'An error occurred while fetching the contact log list', 'error');
				});
			} else {
			  setLoading(false);
			  swal('Failed', 'Problem connecting to the server, Please refresh', 'error');
			}
		  })
		  .catch((error) => {
			swal('Failed', 'Problem connecting to the server, Please refresh', 'error');
		  })
		  .finally(() => {
			setLoading(false);
		  });
	  };
	  
	  

	async function fetchContactLogList(props: Props, pagination: {currentPage: number, pageSize: number}, sorting: {sortColumn: string, sortOrder: string}, userAccessId: number, gridApi: any, messagingHub: any) {
		
		const request = createContactLogListRequest(props, pagination, sorting, userAccessId);
	  
		gridApi.showLoadingOverlay();
		try {
			const response = await getViewContactLogList(request);
			if (response.status === successResponse) {
				  messagingHub.on(request.queueId.toString(), (message: any) => {
					getViewContactLogListResult(message.cacheId)
					  .then((result) => {
						let resultData = Object.assign({}, result.data as ContactLogSummaryResponseModel);
						setRecordCount(resultData.recordCount);
						setContactLogSummaryList(resultData.contactLogSummaryList);
						setLoading(false);
						gridApi.hideOverlay();
						gridApi.showNoRowsOverlay();
			
						if (props.tabList !== undefined) {
						  props.tabList.recordCount = resultData.recordCount;
						}
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
					  gridApi.hideOverlay();
					}
				  }, 30000);
				} else {
				  messagingHub.stop();
				  swal('Failed', response.data.message, 'error');
				  gridApi.hideOverlay();
				}
		} catch (error) {
			console.log('Error found ', error);
		}
}

	function createContactLogListRequest(props: Props, pagination: {currentPage: number, pageSize: number}, sorting: {sortColumn: string, sortOrder: string}, userAccessId: number) {
		const request: ContactLogListRequestModel = {
			actionDateFrom: props.onSearchValue?.actionDateFrom ?? new Date(),
			actionDateTo: props.onSearchValue?.actionDateTo ?? new Date(),
			offsetValue: (pagination.currentPage - 1) * pagination.pageSize,
			pageSize: pagination.pageSize,
			sortColumn: sorting.sortColumn ?? 'teamName',
			sortOrder: sorting.sortOrder ?? 'asc',
			teamIds: props.onSearchValue?.teamIds ?? '',
			userIds: props.onSearchValue?.userIds ?? '',
			userId: userAccessId.toString(),
			queueId: Guid.create().toString(),
		};
	
		return request;
	}
	
	
	const tableLoader = (data: any) => {
		return (
			<div className='ag-custom-loading-cell' style={{paddingLeft: '10px', lineHeight: '25px'}}>
				<i className='fas fa-spinner fa-pulse'></i> <span> {data.loadingMessage}</span>
			</div>
		);
	};
	const onSort = (e: any) => {
		if (contactLogSummaryList != undefined && contactLogSummaryList.length > 0) {
			var sortDetail = e.api.getSortModel();
			if (sortDetail[0] != undefined) {
				setSortColumn(sortDetail[0]?.colId);
				setSortOrder(sortDetail[0]?.sort);
				loadContactLogSummaryList(pageSize, currentPage, sortDetail[0]?.colId, sortDetail[0]?.sort);
			} else {
				setSortColumn('');
				setSortOrder('');
				loadContactLogSummaryList(pageSize, currentPage, '', '');
			}
		}
	};
	return (
		<FormGroupContainer>
			<div className='ag-theme-quartz mt-2' style={{height: 300, width: '100%'}}>
				<AgGridReact
					rowData={contactLogSummaryList}
					defaultColDef={{
						sortable: true,
						resizable: true,
					}}
					components={{
						tableLoader: tableLoader,
					}}
					onGridReady={onGridReady}
					onRowValueChanged={onGridReady}
					rowBuffer={0}
					//enableRangeSelection={true} //deprecated in AgGridReactver.32.0.0
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
					onPageSizeChanged={(e) => onPageSizeChanged(e)}
				/>
			</div>
		</FormGroupContainer>
	);
};

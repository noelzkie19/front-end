import { AgGridReact } from 'ag-grid-react';
import { Guid } from 'guid-typescript';
import { useEffect, useState } from 'react';
import { ButtonGroup } from 'react-bootstrap-v5';
import { DefaultGridPagination, FormGroupContainer } from '../../../../custom-components';
import { ContactLogListRequestModel } from '../models/ContactLogListRequestModel';
import { ContactLogTeamListRequestModel } from '../models/ContactLogTeamListRequestModel';
import { ContactLogTeamResponseModel } from '../models/ContactLogTeamListResponseModel';
import { ContactLogTeamModel } from '../models/ContactLogTeamModel';
import { ContactLogUserResponseModel } from '../models/ContactLogUserListResponseModel';
import { ContactLogUserModel } from '../models/ContactLogUserModel';
import { getViewContactLogTeamList, getViewContactLogUserList } from '../redux/ContactDetailsLogService';
import { ColDef, ColGroupDef } from 'ag-grid-community';


interface TableListModel {
	tabType: string;
	label: string;
	id?: number;
	guid: string;
	recordCount?: number;
	description: string;
	teamId?: string;
}

type Props = {
	tabList?: TableListModel;
	tabType?: string;
	onClickUser: (note: TableListModel) => void;
	onSearchValue?: ContactLogListRequestModel;
};
export const ContactLogDetailsGrid = (props: Props) => {
	const [pageSize, setPageSize] = useState<number>(10);
	const [currentPage, setCurrentPage] = useState<number>(1);
	const [recordCount, setRecordCount] = useState<number>(0);
	const [sortOrder, setSortOrder] = useState<string>('');
	const [sortColumn, setSortColumn] = useState<string>('');
	const [contactLogUserList, setContactLogUserList] = useState<Array<ContactLogUserModel>>();
	const [contactLogTeamList, setContactLogTeamList] = useState<Array<ContactLogTeamModel>>();
	const [selectedTeamId, setSelectedTeamId] = useState<number>();
	const [selectedUserId, setSelectedUserId] = useState<number>();
	const [parentName, setParentName] = useState<string>();
	const [gridApi, setGridApi] = useState<any>();

	//   GRID DETAILS

	const teamColumnDefs : (ColDef<ContactLogTeamModel> | ColGroupDef<ContactLogTeamModel>)[] = 	[
		{headerName: 'No', valueGetter: ('node.rowIndex + 1 + ' + (currentPage - 1) * pageSize).toString(), sortable: false, width: 60},
		{
			headerName: 'User Full Name',
			field: 'userFullName',
			width: 300,
			cellRenderer: (params: any) => (
					<ButtonGroup aria-label='Basic example'>
						<div className='d-flex justify-content-center flex-shrink-0 shadow-none'>
						<label
							className='btn-link cursor-pointer'
							onClick={() => {
								onClickUser(params.data);
							}}
						>
							{params.data.userFullName}
						</label>
						</div>
					</ButtonGroup>
				),
		},
		{headerName: 'Total Click Mobile Number', field: 'totalClickMobileCount', width: 200},
		{headerName: 'Total Click Email Address', field: 'totalClickEmailCount', width: 200},
		{headerName: 'Total Unique Player', field: 'totalUniquePlayerCount', width: 200},
	];
	const userColumnDefs : (ColDef<ContactLogUserModel> | ColGroupDef<ContactLogUserModel>)[] = [
		{headerName: 'No', valueGetter: ('node.rowIndex + 1 + ' + (currentPage - 1) * pageSize).toString(), sortable: false, width: 100},
		{headerName: 'User Full Name', field: 'userFullName', width: 250},
		{headerName: 'Player Username', field: 'userName', width: 250},
		{headerName: 'Brand', field: 'brand', width: 200},
		{headerName: 'Currency', field: 'currency', width: 200},
		{headerName: 'VIP Level', field: 'vipLevel', width: 200},
		{headerName: 'Action Date', field: 'actionDate', width: 200},
		{headerName: 'Viewed Data', field: 'viewData', width: 200},
	];
	const onClickFirst = () => {
		if (currentPage > 1) {
			setCurrentPage(1);
			loadContactLogGrid(pageSize, 1, sortColumn, sortOrder);
		}
	};

	const onClickPrevious = () => {
		if (currentPage > 1) {
			setCurrentPage(currentPage - 1);
			loadContactLogGrid(pageSize, 1, sortColumn, sortOrder);
		}
	};

	const onClickNext = () => {
		if (totalPage() > currentPage) {
			setCurrentPage(currentPage + 1);
			loadContactLogGrid(pageSize, currentPage + 1, sortColumn, sortOrder);
		}
	};

	const onClickLast = () => {
		if (totalPage() > currentPage) {
			setCurrentPage(totalPage());
			loadContactLogGrid(pageSize, totalPage(), sortColumn, sortOrder);
		}
	};

	const totalPage = () => {
		return Math.ceil(recordCount / pageSize) | 0;
	};
	const onPageSizeChanged = (value: any) => {
		setPageSize(Number(value));
		setCurrentPage(1);
		if (contactLogTeamList != undefined || contactLogUserList != undefined) {
			loadContactLogGrid(Number(value), 1, sortColumn, sortOrder);
		}
	};
	//  WATCHERS
	const onGridReady = (params: any) => {
		setGridApi(params.api);
		// setGridColumnApi(params.columnApi);
		params.api.sizeColumnsToFit();
	};
	useEffect(() => {
		setParentName(props.tabList?.label);
		loadContactLogGrid(pageSize, 1, sortColumn, sortOrder);
	}, []);

	const loadContactLogGrid = (pageSize: number, currentPage: number, sortColumn: string, sortOrder: string) => {
		if (props.tabType == 'team') {
			setSelectedTeamId(props.tabList?.id);
			loadContactLogTeamList(pageSize, currentPage, sortColumn, sortOrder);
		} else {
			setSelectedUserId(props.tabList?.id);
			loadContactLogUserList(pageSize, currentPage, sortColumn, sortOrder);
		}
	};
	const loadContactLogTeamList = (pageSize: number, currentPage: number, sortColumn: string, sortOrder: string) => {
		const request: ContactLogListRequestModel = {
			actionDateFrom: props.onSearchValue ? props.onSearchValue?.actionDateFrom : new Date(),
			actionDateTo: props.onSearchValue ? props.onSearchValue?.actionDateTo : new Date(),
			offsetValue: (currentPage - 1) * pageSize,
			pageSize: pageSize,
			teamIds: props.tabList?.id ? props.tabList?.id?.toString() : '',
			sortColumn: sortColumn == '' ? 'userFullName' : sortColumn,
			sortOrder: sortOrder == '' ? 'asc' : sortOrder,
			userIds: props.onSearchValue ? props.onSearchValue.userIds : '',
			queueId: '',
			userId: '',
		};
		getViewContactLogTeamList(request).then((response) => {
			if (response.status === 200) {
				let resultData = Object.assign({}, response.data as ContactLogTeamResponseModel);
				setRecordCount(resultData.recordCount);
				setContactLogTeamList(resultData.contactLogTeamList);
				if (props.tabList != undefined) props.tabList.recordCount = resultData.recordCount;
			}
		});
	};
	const loadContactLogUserList = (pageSize: number, currentPage: number, sortColumn: string, sortOrder: string) => {
		const request: ContactLogListRequestModel = {
			actionDateFrom: props.onSearchValue ? props.onSearchValue?.actionDateFrom : new Date(),
			actionDateTo: props.onSearchValue ? props.onSearchValue?.actionDateTo : new Date(),
			offsetValue: (currentPage - 1) * pageSize,
			pageSize: pageSize,
			teamIds: props.tabList?.teamId?.toString() || '',
			sortColumn: sortColumn == '' ? 'actionDate' : sortColumn,
			sortOrder: sortOrder == '' ? 'desc' : sortOrder,
			userIds: props.tabList?.id ? props.tabList?.id?.toString() : '',
			queueId: '',
			userId: '',
		};
		getViewContactLogUserList(request).then((response) => {
			if (response.status === 200) {
				let resultData = Object.assign({}, response.data as ContactLogUserResponseModel);
				setRecordCount(resultData.recordCount);
				setContactLogUserList(resultData.contactLogUserList);
				if (props.tabList != undefined) props.tabList.recordCount = resultData.recordCount;
			}
		});
	};
	const onClickUser = (params: any) => {
		const request: TableListModel = {
			label: params.userFullName,
			description: parentName + ' - ' + params.userFullName,
			tabType: 'user',
			id: params.userId,
			guid: Guid.create().toString(),
			teamId: props.tabList?.teamId || '',
		};
		if (props != undefined) props?.onClickUser(request);
	};
	const tableLoader = (data: any) => {
		return (
			<div className='ag-custom-loading-cell' style={{paddingLeft: '10px', lineHeight: '25px'}}>
				<i className='fas fa-spinner fa-pulse'></i> <span> {data.loadingMessage}</span>
			</div>
		);
	};
	const onSort = (e: any) => {
		if (contactLogTeamList != undefined || contactLogUserList != undefined) {
			var sortDetail = e.api.getSortModel();
			if (sortDetail[0] != undefined) {
				setSortColumn(sortDetail[0]?.colId);
				setSortOrder(sortDetail[0]?.sort);
				loadContactLogGrid(pageSize, currentPage, sortDetail[0]?.colId, sortDetail[0]?.sort);
			} else {
				setSortColumn('');
				setSortOrder('');
				loadContactLogGrid(pageSize, currentPage, '', '');
			}
		}
	};
	return (
		<FormGroupContainer>
			<div className='ag-theme-quartz mt-2' style={{height: 300, width: '100%'}}>
				{props.tabType == 'team' && (
					<AgGridReact
						rowData={contactLogTeamList}
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
						columnDefs={teamColumnDefs}
						onSortChanged={(e) => onSort(e)}
					/>
				)}
				{props.tabType == 'user' && (
					<AgGridReact
						rowData={contactLogUserList}
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
						columnDefs={userColumnDefs}
						onSortChanged={(e) => onSort(e)}
					/>
				)}

				<DefaultGridPagination
					recordCount={recordCount}
					currentPage={currentPage}
					pageSize={pageSize}
					onClickFirst={onClickFirst}
					onClickPrevious={onClickPrevious}
					onClickNext={onClickNext}
					onClickLast={onClickLast}
					onPageSizeChanged={(e: any) => onPageSizeChanged(e)}
				/>
			</div>
		</FormGroupContainer>
	);
};

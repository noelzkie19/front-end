import {faEdit, faUserTag} from '@fortawesome/free-solid-svg-icons';
import {AgGridReact} from 'ag-grid-react';
import {useContext, useEffect, useRef, useState} from 'react';
import {Col, Row} from 'react-bootstrap-v5';
import {shallowEqual, useSelector} from 'react-redux';
import {RootState} from '../../../../../setup';
import gridOverlayTemplate, {gridOverlayNoRowsTemplate} from '../../../../common-template/gridTemplates';
import {SetGridCustomDisplayAsync} from '../../../../common/services/userGridCustomDisplay';
import {DefaultGridPagination, FormGroupContainer, MainContainer, TableIconButton} from '../../../../custom-components';
import useFnsDateFormatter from '../../../../custom-functions/helper/useFnsDateFormatter';
import {LookupModel} from '../../../../shared-models/LookupModel';
import {PaginationModel} from '../../../../shared-models/PaginationModel';
import {DefaultPageSetup} from '../../../system/components/constants/PlayerConfigEnums';
import useTicketConstant from '../../constants/TicketConstant';
import {TicketContext} from '../../context/TicketContext';
import {SearchFilterCustomLookupModel} from '../../models/SearchFilterCustomLookupModel';
import {GetAssigneeListRequestModel} from '../../models/request/GetAssigneeListRequestModel';
import {TicketDetailsRequestModel} from '../../models/request/TicketDetailsRequestModel';
import {SearchTicketResponseModel} from '../../models/response/SearchTicketResponseModel';
import {DynamicTicketModel} from '../../models/ticket-config/DynamicTicketModel';
import EditTicketModal from './modals/EditTicketModal';

interface TicketProps {
	searchTicketData: SearchTicketResponseModel;
	ticketTypeList: Array<SearchFilterCustomLookupModel>;
	loadTicketList: (_sortColumn?: string, _sortOrder?: string, _offsetValue?: number, _pageSize?: number) => void;
	setPagination: (page: PaginationModel) => void;
	isAutoRefresh: boolean;
	statuses: Array<LookupModel>;
}

const TicketGrid: React.FC<TicketProps> = ({
	searchTicketData,
	ticketTypeList,
	loadTicketList,
	setPagination,
	isAutoRefresh,
	statuses,
}: TicketProps) => {
	// ag grid
	const [rowData, setRowData] = useState<any>([]);
	const [gridApi, setGridApi] = useState<any>();
	const [gridColumnApi, setGridColumnApi] = useState<any>();
	const [columnDefs, setColumnDefs] = useState<Array<any>>([]);
	const [showReAssignModal, setShowReAssignModal] = useState<boolean>(false);
	const [dynamicTicketForm, setDynamicTicketForm] = useState<any>();
	const [fieldMapping, setFieldMapping] = useState<any>();
	const userId = useSelector<RootState>(({auth}) => auth.userId, shallowEqual) as string;
	const {mlabFormatDate} = useFnsDateFormatter();
	let ticketTypes: Array<SearchFilterCustomLookupModel> = ticketTypeList;
	const [ticketStatus, setTicketStatus] = useState<any>();
	const {TICKET_FIELD, TICKET_STATUSES} = useTicketConstant();
	const [ticketTypeId, setTicketTypeId] = useState<any>();
	const [ticketCode, setTicketCode] = useState<any>();
	const [gridHeight, setGridHeight] = useState<number>(500);
	const {getAssigneeListAsync, assigneeList, getTicketInformationByTicketCodeAsync, ticketInformation, getFieldMappingAsync, ticketFieldMapping} =
		useContext(TicketContext);

	// sort and pagination
	const [pageSize, setPageSize] = useState<number>(DefaultPageSetup.pageSizeDefault);
	const [currentPage, setCurrentPage] = useState<number>(1);
	const [sortOrder, setSortOrder] = useState<string>('DESC');
	const [sortColumn, setSortColumn] = useState<string>('lastModifiedDate');
	const gridRef: any = useRef();

	const defaultPageSize = 10;

	useEffect(() => {
		loadUserGridCustomDisplay();
	}, []);

	useEffect(() => {
		if (!isAutoRefresh) {
			setPagination({
				currentPage: currentPage,
				pageSize: pageSize,
				offsetValue: (currentPage - 1) * pageSize,
				sortColumn: sortColumn,
				sortOrder: sortOrder,
			});
		}
	}, [pageSize, currentPage, sortOrder, sortColumn]);

	useEffect(() => {
		if (isAutoRefresh) {
			setPageSize(10);
			setCurrentPage(1);
			setSortOrder('DESC');
			setSortColumn('CreatedDate');
		}
	}, [isAutoRefresh]);

	useEffect(() => {
		if (isAutoRefresh) {
			gridColumnApi.resetColumnState();
		}
		const ticketList = searchTicketData?.ticketList;
		ticketTypes?.forEach((tTypes: any) => {
			ticketList
				?.filter((tType: any) => tType.ticketType === tTypes.label)
				.map((x: any) => {
					x.ticketTypeId = tTypes.value;
					x.callSign = tTypes.code;
					x.createdDate = mlabFormatDate(x.createdDate);
					x.lastModifiedDate = mlabFormatDate(x.lastModifiedDate);
					x.statusId = Number(filterStatus(x.status)?.value ?? '0');
				});
		});

		const rowCountbyPagination = currentPage * pageSize - pageSize;
		const numberedTicketList = ticketList?.reduce((acc: any, curr: any, idx: number) => {
			let numberColumn = rowCountbyPagination + idx + 1;
			acc.push({...curr, rowNumber: numberColumn});
			return acc;
		}, []);
		setRowData(numberedTicketList);
	}, [searchTicketData]);

	useEffect(() => {
		if (Object.keys(ticketInformation).length > 0 && ticketInformation.ticketId > 0) {
			const ticketDetails: DynamicTicketModel[] = [];
			ticketInformation.ticketDetails.forEach((x) => {
				ticketDetails.push({
					fieldId: x.ticketFieldId,
					fieldMappingId: x.ticketTypeFieldMappingId,
					fieldName: x.ticketFieldName,
					fieldValue: x.ticketTypeFieldMappingValue,
				});
			});
			const player = ticketInformation.ticketPlayerIds.length > 0 ? ticketInformation.ticketPlayerIds[0] : null;
			const mlabPlayerId = player ? player.mlabPlayerId : 0;
			const paymentMethod = ticketDetails?.find((ticketForm: DynamicTicketModel) => ticketForm.fieldId === TICKET_FIELD.PaymentMethodId);
			const paymentMethodId = paymentMethod ? parseInt(paymentMethod.fieldValue) : 0;
			const departmentId = parseInt(
				ticketDetails?.find((ticketForm: DynamicTicketModel) => ticketForm.fieldId === TICKET_FIELD.Department)?.fieldValue ?? '0'
			);
			const ticketStatusId = parseInt(
				ticketDetails?.find((ticketForm: DynamicTicketModel) => ticketForm.fieldId === TICKET_FIELD.StatusId)?.fieldValue ?? '0'
			);
			const adjAmount = parseFloat(
				ticketDetails?.find((ticketForm: DynamicTicketModel) => ticketForm.fieldId === TICKET_FIELD.AdjustmentAmount)?.fieldValue ?? '0'
			);
			const assigneeRequest: GetAssigneeListRequestModel = {
				statusId: parseInt(ticketStatus?.statusId ?? 0),
				ticketTypeId: ticketInformation.ticketTypeId,
				paymentMethodId: paymentMethodId,
				mlabPlayerId: mlabPlayerId,
				ticketId: ticketInformation.ticketId,
				departmentId: departmentId,
				adjustmentAmount: ticketStatusId === TICKET_STATUSES.ForAdjustment ? adjAmount : 0,
			};

			getAssigneeListAsync(assigneeRequest);
			getFieldMappingAsync(ticketTypeId?.toString() ?? '0');

			setDynamicTicketForm(ticketDetails);
		}
	}, [ticketInformation]);

	useEffect(() => {
		if (ticketFieldMapping?.length > 0) {
			setFieldMapping(ticketFieldMapping.filter((x: any) => x.fieldId === TICKET_FIELD.Assignee));
		}
	}, [ticketFieldMapping]);

	const filterStatus = (status: any) => {
		return statuses.find((i) => i.label === status);
	};

	const onGridReady = (params: any) => {
		params.api.applyColumnState({
			state: defaultColumns,
			applyOrder: true,
		});
		setGridApi(params.api);
		setGridColumnApi(params.columnApi);
		params.api.sizeColumnsToFit();
		gridRef.current.api.hideOverlay();
	};

	const actionButtons = (_params: any) => {
		const rowDetails = _params.data;
		return (
			<Row>
				<Col lg={6}>
					<TableIconButton
						access={true}
						faIcon={faEdit}
						toolTipText={'Edit Page'}
						onClick={() => window.open('/ticket-management/edit-ticket/' + rowDetails.callSign + '-' + rowDetails.ticketTypeSequenceId, '_blank')}
						isDisable={false}
					/>
				</Col>
				<Col lg={6}>
					<TableIconButton
						access={true}
						faIcon={faUserTag}
						toolTipText={'Re-assign'}
						onClick={() => showReassignModal(rowDetails.ticketTypeId, rowDetails.ticketTypeSequenceId, rowDetails)}
						isDisable={false}
					/>
				</Col>
			</Row>
		);
	};

	const renderTicketCode = (_params: any) => {
		return _params.data.callSign + '-' + _params.data.ticketTypeSequenceId;
	};

	const renderViewTicket = (_params: any) => {
		const rowDetails = _params.data;
		return (
			<a
				className='cursor-pointer'
				href={'/ticket-management/view-ticket/' + rowDetails.callSign + '-' + rowDetails.ticketTypeSequenceId}
				rel='noreferrer'
				target='_blank'
			>
				{rowDetails.summary}
			</a>
		);
	};

	const customComparator = () => {
		if (!searchTicketData) return;
		return searchTicketData.ticketList ?? [];
	};

	const defaultColumns = [
		{headerName: 'Action', field: 'Action', width: 80, cellRenderer: actionButtons, sortable: false, isPinned: true},
		{headerName: 'No', field: 'rowNumber', width: 60, sortable: false, isPinned: true, comparator: customComparator},
		{headerName: 'Ticket Type', field: 'ticketType', minWidth: 150, comparator: customComparator},
		{
			headerName: 'Ticket Code',
			field: 'ticketTypeSequenceId',
			minWidth: 130,
			valueFormatter: renderTicketCode,
			isPinned: true,
			comparator: customComparator,
		},
		{headerName: 'Summary', field: 'summary', minWidth: 200, cellRenderer: renderViewTicket, comparator: customComparator},
		{headerName: 'Status', field: 'status', minWidth: 150, comparator: customComparator},
		{headerName: 'Reporter', field: 'reporter', minWidth: 150, comparator: customComparator},
		{headerName: 'Assignee', field: 'assignee', minWidth: 150, comparator: customComparator},
		{headerName: 'Currency', field: 'currency', minWidth: 150, comparator: customComparator},
		{headerName: 'Method Currency', field: 'methodCurrency', minWidth: 150, comparator: customComparator},
		{headerName: 'VIP Group', field: 'vipGroup', minWidth: 100, comparator: customComparator},
		{headerName: 'VIP Level', field: 'vipLevel', minWidth: 120, comparator: customComparator},
		{headerName: 'User List - Teams', field: 'userListTeams', minWidth: 150, comparator: customComparator},
		{headerName: 'Duration', field: 'duration', minWidth: 100, comparator: customComparator},
		{headerName: 'Created Date', field: 'createdDate', minWidth: 170, isPinned: true, comparator: customComparator},
		{headerName: 'Last Modified Date', field: 'lastModifiedDate', minWidth: 170, comparator: customComparator},
		{headerName: 'Last Modified By', field: 'lastModifiedBy', minWidth: 150, comparator: customComparator},
	];

	// Re-assing Modal
	const showReassignModal = async (ticketTypeId: any, sequenceId: any, rowData: any) => {
		setTicketStatus({
			statusId: rowData.statusId,
			statusName: rowData.status,
		});
		setTicketTypeId(rowData.ticketTypeId);
		setTicketCode(rowData.callSign + '-' + sequenceId);

		const ticketDetailsRequest: TicketDetailsRequestModel = {
			ticketTypeSequenceId: sequenceId,
			ticketTypeId: ticketTypeId,
		};
		getTicketInformationByTicketCodeAsync(ticketDetailsRequest);
		setShowReAssignModal(true);
	};

	const handleCloseModal = () => {
		setShowReAssignModal(false);
	};

	const refreshGridOnCloseModal = () => {
		loadTicketList();
		setShowReAssignModal(false);
	};

	//--------------END HERE------------------

	// GRID AND PAGINATION
	const onSort = (e: any) => {
		if (searchTicketData.ticketList != undefined && searchTicketData.ticketList.length > 0) {
			const sortDetail = e.api.getSortModel();
			if (sortDetail[0] != undefined) {
				setSortColumn(sortDetail[0]?.colId);
				setSortOrder(sortDetail[0]?.sort);
				loadTicketList(sortDetail[0]?.colId, sortDetail[0]?.sort, (currentPage - 1) * pageSize, pageSize);
			} else {
				setSortColumn('');
				setSortOrder('');
				loadTicketList();
			}
		}
	};

	const paginationLoadTicketList = (_sortColumn: string, _sortOrder: string, _currentPage: number, _pageSize: number) => {
		loadTicketList(_sortColumn, _sortOrder, (_currentPage - 1) * _pageSize, _pageSize);
	};

	const onPageSizeChanged = (e: any) => {
		setPageSize(parseInt(e));
		setCurrentPage(1);
		const value: string = (document.getElementById('page-size') as HTMLInputElement).value;

		if (searchTicketData !== undefined) {
			if (searchTicketData.ticketList !== undefined && searchTicketData?.ticketList.length > 0) {
				loadTicketList(sortColumn, sortOrder, 0, parseInt(e));
			}
		}

		switch (Number(value)) {
			case defaultPageSize:
				setGridHeight(500);
				break;
			case 50:
				setGridHeight(800);
				break;
			default:
				setGridHeight(1200);
				break;
		}
	};
	const totalPage = () => {
		return Math.ceil((searchTicketData?.rowCount ?? 0) / pageSize) | 0;
	};
	const onClickFirst = () => {
		if (currentPage > 1) {
			setCurrentPage(1);
			paginationLoadTicketList(sortColumn, sortOrder, 1, pageSize);
		}
	};

	const onClickPrevious = () => {
		if (currentPage > 1) {
			setCurrentPage(currentPage - 1);
			paginationLoadTicketList(sortColumn, sortOrder, currentPage - 1, pageSize);
		}
	};

	const onClickNext = () => {
		if (totalPage() > currentPage) {
			setCurrentPage(currentPage + 1);
			paginationLoadTicketList(sortColumn, sortOrder, currentPage + 1, pageSize);
		}
	};

	const onClickLast = () => {
		if (totalPage() > currentPage) {
			setCurrentPage(totalPage());
			paginationLoadTicketList(sortColumn, sortOrder, totalPage(), pageSize);
		}
	};

	const loadUserGridCustomDisplay = async () => {
		const gridColumns = await SetGridCustomDisplayAsync(defaultColumns, parseInt(userId));
		setColumnDefs(gridColumns.defaultColumns);
	};

	const onUpdateGridCustomDisplay = async () => {
		gridRef.current.api.showLoadingOverlay();
	};

	const onSubmitGridCustomDisplay = async () => {
		await loadUserGridCustomDisplay();
		gridApi.hideOverlay();
	};
	//--------------END HERE------------------
	return (
		<MainContainer>
			<FormGroupContainer>
				<div className='ag-theme-quartz' style={{height: gridHeight, width: '100%', marginBottom: '50px'}}>
					<AgGridReact
						rowStyle={{userSelect: 'text'}}
						rowData={rowData}
						defaultColDef={{
							sortable: true,
							resizable: true,
						}}
						onSortChanged={(e) => onSort(e)}
						onGridReady={onGridReady}
						columnDefs={columnDefs}
						alwaysShowHorizontalScroll={false}
						animateRows={true}
						paginationPageSize={pageSize}
						rowBuffer={0}
						rowSelection={'multiple'}
						pagination={false}
						overlayNoRowsTemplate={gridOverlayNoRowsTemplate}
						overlayLoadingTemplate={gridOverlayTemplate}
						ref={gridRef}
					/>
					<DefaultGridPagination
						recordCount={searchTicketData?.rowCount ?? 0}
						currentPage={currentPage}
						pageSize={pageSize}
						onClickFirst={onClickFirst}
						onClickPrevious={onClickPrevious}
						onClickNext={onClickNext}
						onClickLast={onClickLast}
						onPageSizeChanged={onPageSizeChanged}
						onUpdateGridCustomDisplay={onUpdateGridCustomDisplay}
						onSubmitGridCustomDisplay={onSubmitGridCustomDisplay}
						defaultColumns={defaultColumns}
					/>
				</div>
			</FormGroupContainer>
			<EditTicketModal
				showModal={showReAssignModal}
				ticketStatus={ticketStatus}
				handleCloseModal={handleCloseModal}
				fieldMapping={fieldMapping}
				dynamicTicketForm={dynamicTicketForm}
				userId={userId}
				fromSearchPage={true}
				handleSubmitModal={refreshGridOnCloseModal}
				ticketCode={ticketCode}
				assigneeList={assigneeList}
			/>
		</MainContainer>
	);
};

export default TicketGrid;

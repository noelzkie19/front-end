import {AgGridReact} from 'ag-grid-react';
import {Guid} from 'guid-typescript';
import {useContext, useEffect, useRef, useState} from 'react';
import {shallowEqual, useSelector} from 'react-redux';
import {RootState} from '../../../../../../../../../setup';
import gridOverlayTemplate, {gridOverlayNoRowsTemplate} from '../../../../../../../../common-template/gridTemplates';
import {DefaultGridPagination, FormGroupContainer, MainContainer} from '../../../../../../../../custom-components';
import useFnsDateFormatter from '../../../../../../../../custom-functions/helper/useFnsDateFormatter';
import {DefaultPageSetup} from '../../../../../../../system/components/constants/PlayerConfigEnums';
import {TicketContext} from '../../../../../../context/TicketContext';

const TicketHistoryGrid: React.FC = () => {
	const [rowData, setRowData] = useState<any>();
	const {ticketInformation, ticketHistoryAsync, ticketHistoryData, setHistoryFilters} = useContext(TicketContext);

	// sort and pagination
	const [pageSize, setPageSize] = useState<number>(DefaultPageSetup.pageSizeDefault);
	const [currentPage, setCurrentPage] = useState<number>(1);
	const [sortOrder, setSortOrder] = useState<string>('DESC');
	const [sortColumn, setSortColumn] = useState<string>('LastModifiedDate');
	const [gridHeight, setGridHeight] = useState<number>(500);
	const gridRef: any = useRef();

	// date formatter
	const {mlabFormatDate} = useFnsDateFormatter();
	// user Id
	const userId = useSelector<RootState>(({auth}) => auth.userId, shallowEqual) as string;

	const defaultPageSize = 10;

	const renderLastModifiedDate = (_params: any) => {
		return mlabFormatDate(_params.data.lastModifiedDate);
	};

	const columnDefs = [
		{headerName: 'FieldName', field: 'fieldName', width: 150},
		{headerName: 'From', field: 'oldValue', width: 150},
		{headerName: 'To', field: 'newValue', minWidth: 150},
		{headerName: 'Last Modified Date', field: 'lastModifiedDate', minWidth: 150, sortable: false, valueFormatter: renderLastModifiedDate},
		{headerName: 'Last Modified By', field: 'lastModifiedBy', minWidth: 150},
	];

	useEffect(() => {
		if (ticketInformation && ticketInformation.ticketId > 0) {
			getTicketHistory();
		}
	}, [ticketInformation]);

	useEffect(() => {
		if (ticketHistoryData) {
			const historyData = ticketHistoryData?.ticketHistoryDetailsList ?? [];
			if (historyData.length > 0) {
				let historyDataFormat: any = [];
				historyData.forEach((x: any) => {
					historyDataFormat.push({
						fieldName: x.fieldName,
						oldValue: x.from,
						newValue: x.to,
						lastModifiedDate: x.lastModifiedDate,
						lastModifiedBy: x.lastModifiedBy,
					});
				});
				setRowData(historyDataFormat);
			}
		}
	}, [ticketHistoryData]);

	const onGridReady = (params: any) => {
		params.api.sizeColumnsToFit();
	};

	const getTicketHistory = (_sortColumn?: string, _sortOrder?: string, _offsetValue?: number, _pageSize?: number) => {
		const request: any = {
			ticketId: ticketInformation.ticketId,
			ticketTypeId: ticketInformation.ticketTypeId,
			sortOrder: _sortOrder ?? sortOrder,
			sortColumn: _sortColumn ?? sortColumn,
			offsetValue: _offsetValue ?? (currentPage - 1) * pageSize,
			pageSize: _pageSize ?? pageSize,
			userId: userId.toString() ?? '0',
			queueId: Guid.create().toString(),
		};
		setHistoryFilters(request);
		ticketHistoryAsync(request);
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

	const totalPage = () => {
		return Math.ceil((ticketHistoryData?.rowCount ?? 0) / pageSize) | 0;
	};

	const paginationLoadTicketList = (_sortColumn: string, _sortOrder: string, _currentPage: number, _pageSize: number) => {
		loadTicketList(_sortColumn, _sortOrder, (_currentPage - 1) * _pageSize, _pageSize);
	};

	const loadTicketList = (_sortColumn?: string, _sortOrder?: string, _offsetValue?: number, _pageSize?: number) => {
		if (ticketInformation && ticketInformation.ticketId > 0) {
			getTicketHistory(_sortColumn, _sortOrder, _offsetValue, _pageSize);
		}
	};

	const onSort = (e: any) => {
		const sortHistoryDetail = e.api.getSortModel();
		if (sortHistoryDetail[0] != undefined) {
			sortAction(sortHistoryDetail[0]?.colId, sortHistoryDetail[0]?.sort);
		} else {
			defaultSortAction();
		}
	};

	const sortAction = (colId: any, sort: any) => {
		setSortColumn(colId);
		setSortOrder(sort);
		loadTicketList(colId, sort, (currentPage - 1) * pageSize, pageSize);
	};

	const defaultSortAction = () => {
		setSortColumn('');
		setSortOrder('');
		loadTicketList('LastModifiedDate', 'DESC', (currentPage - 1) * pageSize, pageSize);
	};

	const onPageSizeChanged = (e: any) => {
		setPageSize(parseInt(e));
		setCurrentPage(1);
		const value: string = (document.getElementById('page-size') as HTMLInputElement).value;

		if (ticketHistoryData !== undefined) {
			if (ticketHistoryData.ticketHistoryDetailsList !== undefined && ticketHistoryData?.ticketHistoryDetailsList.length > 0) {
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
						columnDefs={columnDefs}
						onSortChanged={(e) => onSort(e)}
						onGridReady={onGridReady}
						alwaysShowHorizontalScroll={false}
						animateRows={true}
						paginationPageSize={pageSize}
						rowBuffer={0}
						enableRangeSelection={true}
						pagination={false}
						overlayNoRowsTemplate={gridOverlayNoRowsTemplate}
						overlayLoadingTemplate={gridOverlayTemplate}
						ref={gridRef}
					/>
					<DefaultGridPagination
						recordCount={ticketHistoryData?.rowCount ?? 0}
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
		</MainContainer>
	);
};
export default TicketHistoryGrid;

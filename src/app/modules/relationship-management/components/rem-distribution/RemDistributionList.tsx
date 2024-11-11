import {AgGridReact} from 'ag-grid-react';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {shallowEqual, useSelector} from 'react-redux';
import {RootState} from '../../../../../setup';
import gridOverlayTemplate, { gridOverlayNoRowsTemplate } from '../../../../common-template/gridTemplates';
import {ElementStyle} from '../../../../constants/Constants';
import {ButtonsContainer, DefaultGridPagination, FormGroupContainer, MainContainer, MlabButton} from '../../../../custom-components';
import {PaginationModel} from '../../../../shared-models/PaginationModel';
import {USER_CLAIMS} from '../../../user-management/components/constants/UserClaims';
import {RemDistributionListResponse} from '../../models/response/RemDistributionListResponse';
import {RemDistributionModel} from '../../models/response/RemDistributionModel';

type RemDistributionListProps = {
	columnDefs: Array<any>;
	remDistribution: RemDistributionListResponse;
	pagination: PaginationModel;
	loading: boolean;
	children?: React.ReactNode;
	toggleFilter: () => void;
	search: (param: PaginationModel) => void;
	assignRemProfile: (distributionData: RemDistributionModel[]) => void;
};

const RemDistributionList = ({
	columnDefs,
	remDistribution,
	pagination,
	loading,
	children,
	toggleFilter,
	search,
	assignRemProfile,
}: RemDistributionListProps) => {
	// States
	const gridRef: any = useRef();
	const userAccess = useSelector<RootState>(({auth}) => auth.access, shallowEqual) as string;
	const [gridApi, setGridApi] = useState<any>();
	const [pageSize, setPageSize] = useState<number>(10);
	const [currentPage, setCurrentPage] = useState<number>(1);
	const [sortOrder, setSortOrder] = useState<string>('');
	const [sortColumn, setSortColumn] = useState<string>('');
	const [selectedRows, setSelectedRows] = useState<Array<RemDistributionModel>>([]);
	const [bulkAssignLabel, setBulkAssignLabel] = useState('Assign');
	const [bulkAssignAccess, setBulkAssignAccess] = useState(true);

	// Effects
	useEffect(() => {
		if (!loading && remDistribution.recordCount === 0) {
			if (document.getElementById('mlab-grid-loading-overlay') as HTMLInputElement) {
				(document.getElementById('mlab-grid-loading-overlay') as HTMLInputElement).innerText = 'No Rows To Show';
			}
		} else if (document.getElementById('mlab-grid-loading-overlay') as HTMLInputElement) {
			(document.getElementById('mlab-grid-loading-overlay') as HTMLInputElement).innerText = 'Please wait while your items are loading';
		}
	}, [loading]);

	useEffect(() => {
		if (remDistribution.remDistributionList.length === 0) {
			resetBulkActions();
		}
	}, [remDistribution]);

	useEffect(() => {
		setPageSize(pagination.pageSize);
		setCurrentPage(pagination.currentPage);
		setSortOrder(pagination.sortOrder);
		setSortColumn(pagination.sortColumn);
	}, [pagination]);

	useEffect(() => {
		if (selectedRows.length > 1) {
			let bulkAccess = true;
			let bulkLabel = selectedRows[0].remProfileId > 0 ? 'Reassign' : 'Assign';

			// Check if selected items have different assign status. Disable if different
			const assignStatuses = new Set(selectedRows.map((i: RemDistributionModel) => i.assignStatus));
			if (assignStatuses.size > 1) {
				bulkAccess = false;
			}

			setBulkAssignLabel(bulkLabel);
			setBulkAssignAccess(bulkAccess);
		} else {
			setBulkAssignAccess(false);
		}
	}, [selectedRows]);

	// Methods
	const handleSearch = (_currentPage: number, _pageSize: number, _sortColumn: string, _sortOrder: string) => {
		const searchParam: PaginationModel = {
			currentPage: _currentPage,
			offsetValue: (_currentPage - 1) * _pageSize,
			pageSize: _pageSize,
			sortColumn: _sortColumn,
			sortOrder: _sortOrder,
		};
		search(searchParam);
		resetBulkActions();
	};

	const resetBulkActions = useCallback(() => {
		setBulkAssignAccess(false);
		setBulkAssignLabel('Assign');
		setSelectedRows([]);
	}, []);

	const handleBulkAssigment = () => {
		assignRemProfile(selectedRows);
	};

	const onGridReady = (params: any) => {
		setGridApi(params.api);
	};

	const onSort = async (e: any) => {
		setCurrentPage(1);
		if (remDistribution.remDistributionList && remDistribution.recordCount > 0) {
			const sortDetail = e.api.getSortModel();
			if (sortDetail[0] != undefined) {
				setSortColumn(sortDetail[0]?.colId);
				setSortOrder(sortDetail[0]?.sort);
				handleSearch(currentPage, pageSize, sortDetail[0]?.colId, sortDetail[0]?.sort);
			} else {
				setSortColumn('');
				setSortOrder('');
				handleSearch(currentPage, pageSize, '', '');
			}
		}
	};

	const onPageSizeChanged = () => {
		const rowData = remDistribution.remDistributionList;
		const value: string = (document.getElementById('page-size') as HTMLInputElement).value;
		setPageSize(Number(value));
		setCurrentPage(1);

		if (rowData != undefined && rowData.length > 0) {
			handleSearch(1, Number(value), sortColumn, sortOrder);
		}
	};

	const onClickFirst = () => {
		if (currentPage > 1) {
			setCurrentPage(1);
			handleSearch(1, pageSize, sortColumn, sortOrder);
		}
	};

	const onClickPrevious = () => {
		if (currentPage > 1) {
			setCurrentPage(currentPage - 1);
			handleSearch(currentPage - 1, pageSize, sortColumn, sortOrder);
		}
	};

	const onClickNext = () => {
		if (totalPage() > currentPage) {
			setCurrentPage(currentPage + 1);
			handleSearch(currentPage + 1, pageSize, sortColumn, sortOrder);
		}
	};

	const onClickLast = () => {
		if (totalPage() > currentPage) {
			const maxPage = totalPage();
			setCurrentPage(maxPage);
			handleSearch(maxPage, pageSize, sortColumn, sortOrder);
		}
	};

	const totalPage = () => {
		return Math.ceil(remDistribution.recordCount / pageSize) | 0;
	};

	const onSelectionChanged = () => {
		if(gridApi){
			const selectedRows =  gridApi.getSelectedRows();
			setSelectedRows(selectedRows);
		}
	};

	return (
		<MainContainer>
			<div className='card-body p-5'>
				<FormGroupContainer>
					<ButtonsContainer>
						<div className='flex-grow-1'>
							<MlabButton type={'button'} label={'Filter'} access={true} style={ElementStyle.primary} weight={'solid'} onClick={toggleFilter}>
								<i className='bi bi-funnel-fill fs-5 text-secondary'></i> Filter
							</MlabButton>
						</div>
						{selectedRows && selectedRows.length > 1 && (
							<div className='p-2 '>
								<MlabButton
									label={bulkAssignLabel}
									access={bulkAssignAccess}
									size={'sm'}
									type={'button'}
									weight={'solid'}
									style={ElementStyle.primary}
									onClick={handleBulkAssigment}
									disabled={loading || !userAccess.includes(USER_CLAIMS.RemDistributionWrite)}
								/>
							</div>
						)}
					</ButtonsContainer>
				</FormGroupContainer>
				<div className='separator separator-dashed my-3'></div>
				<FormGroupContainer>
					<div className='ag-theme-quartz' style={{height: 500, width: '100%', marginBottom: '50px'}}>
						<AgGridReact
							rowStyle={{userSelect: 'text'}}
							rowData={remDistribution.remDistributionList}
							defaultColDef={{
								sortable: true,
								resizable: true,
							}}
							suppressExcelExport={true}
							rowSelection={'multiple'}
							alwaysShowHorizontalScroll={false}
							animateRows={true}
							onGridReady={onGridReady}
							rowBuffer={0}
							enableRangeSelection={true}
							pagination={false}
							paginationPageSize={pageSize}
							onSelectionChanged={onSelectionChanged}
							onSortChanged={(e) => onSort(e)}
							columnDefs={columnDefs}
							overlayNoRowsTemplate={gridOverlayNoRowsTemplate}
							ref={gridRef}
						/>

						<DefaultGridPagination
							recordCount={remDistribution.recordCount}
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
				{children}
			</div>
		</MainContainer>
	);
};

export default RemDistributionList;

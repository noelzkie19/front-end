import React, {useCallback} from 'react';
import './GridPagination.css';

interface Props {
	recordCount: number;
	gridCurrentPage: number;
	gridPageSize: number;
	setGridPageSize: any;
	gridTotalPages: number;

	customId?: any;
	gridRef: any;
	hidePageSize?: boolean;
}

const LocalGridPagination: React.FC<Props> = ({
	recordCount,
	gridCurrentPage,
	gridPageSize,
	setGridPageSize,
	gridTotalPages,
	customId,
	gridRef,
	hidePageSize,
}) => {
	const isFirstActive = (currentPage: number) => {
		return currentPage <= 1;
	};

	const isLastActive = (recordCount: number, currentPage: number, pageSize: number) => {
		var totalPage = gridTotalPages;
		return totalPage === currentPage || recordCount === 0;
	};

	const getRecordStart = (recordCount: number, currentPage: number, pageSize: number) => {
		if (recordCount > 0) return (currentPage - 1) * pageSize + 1;
		else return 0;
	};

	const getRecordEnd = (recordCount: number, currentPage: number, pageSize: number) => {
		if (recordCount > 0 && recordCount > pageSize)
			if (recordCount > pageSize * currentPage) {
				return (currentPage - 1) * pageSize + pageSize;
			} else {
				return recordCount;
			}
		else return recordCount;
	};

	const setBtnFirstStatus = (currentPage: number) => {
		return isFirstActive(currentPage) ? 'ag-paging-button ag-disabled' : 'ag-paging-button';
	};

	const setBtnLastStatus = (recordCount: number, currentPage: number, pageSize: number) => {
		return isLastActive(recordCount, currentPage, pageSize) ? 'ag-paging-button ag-disabled' : 'ag-paging-button';
	};

	const onBtFirst = useCallback(() => {
		gridRef.current.api.paginationGoToFirstPage();
	}, []);

	const onBtLast = useCallback(() => {
		gridRef.current.api.paginationGoToLastPage();
	}, []);

	const onBtNext = useCallback(() => {
		gridRef.current.api.paginationGoToNextPage();
	}, []);

	const onBtPrevious = useCallback(() => {
		gridRef.current.api.paginationGoToPreviousPage();
	}, []);

	const onPageSizeChanged = () => {
		const elemId = customId ? 'page-size-' + customId : 'page-size';
		const value: string = (document.getElementById(elemId) as HTMLInputElement).value;
		setGridPageSize(Number(value));
		gridRef.current.api.paginationSetPageSize(Number(value));
		gridRef.current.api.paginationGoToFirstPage();
	};

	return (
		<>
			<div className='mlab-grid-pagination'>
				<div className='mlab-grid-pagination-summary-panel float-start p-2'>
					<div style={{float: 'left', marginLeft: 10}}>
						{!hidePageSize && (
							<>
								Show
								<select onChange={onPageSizeChanged} id={customId ? 'page-size-' + customId : 'page-size'} style={{margin: 5}} value={gridPageSize}>
									<option value='10'>10</option>
									<option value='50'>50</option>
									<option value='100'>100</option>
								</select>
								entries
							</>
						)}
					</div>
				</div>
				<div className='mlab-grid-pagination-summary-panel'>
					<span className='value' id='lbPageSize' />
					<div className={setBtnFirstStatus(gridCurrentPage)} role='button' aria-label='First Page' onClick={onBtFirst}>
						<span className='ag-icon ag-icon-first' unselectable='on' role='presentation'></span>
					</div>
					<div className={setBtnFirstStatus(gridCurrentPage)} role='button' aria-label='Previous Page' onClick={onBtPrevious}>
						<span className='ag-icon ag-icon-previous' unselectable='on' role='presentation'></span>
					</div>
					<span>
						Page <b>{gridCurrentPage}</b> of <b>{gridTotalPages}</b>
					</span>
					<div className={setBtnLastStatus(recordCount, gridCurrentPage, gridPageSize)} role='button' aria-label='Next Page' onClick={onBtNext}>
						<span className='ag-icon ag-icon-next' unselectable='on' role='presentation'></span>
					</div>
					<div className={setBtnLastStatus(recordCount, gridCurrentPage, gridPageSize)} role='button' aria-label='Last Page' onClick={onBtLast}>
						<span className='ag-icon ag-icon-last' unselectable='on' role='presentation'></span>
					</div>
				</div>

				<div className='mlab-grid-pagination-summary-panel'>
					<span>
						<b> {getRecordStart(recordCount, gridCurrentPage, gridPageSize)} </b> to{' '}
						<b>{getRecordEnd(recordCount, gridCurrentPage, gridPageSize)} </b> of <b>{recordCount}</b>
					</span>
				</div>
			</div>
		</>
	);
};

export default LocalGridPagination;

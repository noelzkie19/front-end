import {faCog} from '@fortawesome/free-solid-svg-icons';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import React, {useEffect, useState} from 'react';
import UserGridCustomDisplayModal from '../modals/UserGridCustomDisplayModal';
import './GridPagination.css';

interface Props {
	recordCount: number;
	currentPage: number;
	pageSize: number;
	onClickFirst: () => void;
	onClickPrevious: () => void;
	onClickNext: () => void;
	onClickLast: () => void;
	onPageSizeChanged?: (event?: any) => void;
	onUpdateGridCustomDisplay?: () => void;
	onSubmitGridCustomDisplay?: () => void;
	defaultColumns?: any;
	pageSizes?: number[];
	customId?: any;
	showPageSizeChange?: any;
}

const isFirstActive = (currentPage: number) => {
	return currentPage <= 1;
};

const isLastActive = (recordCount: number, currentPage: number, pageSize: number) => {
	var totalPage = getTotalPage(recordCount, pageSize);
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

const getTotalPage = (recordCount: number, pageSize: number) => {
	return Math.ceil(recordCount / pageSize) | 0;
};

const setBtnFirstStatus = (currentPage: number) => {
	return isFirstActive(currentPage) ? 'ag-paging-button ag-disabled' : 'ag-paging-button';
};

const setBtnLastStatus = (recordCount: number, currentPage: number, pageSize: number) => {
	return isLastActive(recordCount, currentPage, pageSize) ? 'ag-paging-button ag-disabled' : 'ag-paging-button';
};

const DefaultGridPagination: React.FC<Props> = ({
	recordCount,
	currentPage,
	pageSize,
	onClickFirst,
	onClickPrevious,
	onClickNext,
	onClickLast,
	onPageSizeChanged,
	onUpdateGridCustomDisplay,
	onSubmitGridCustomDisplay,
	defaultColumns,
	pageSizes,
	customId,
	showPageSizeChange,
}) => {
	const [pageSizeValue, setPageSizeValue] = useState(pageSize);
	const [modalShow, setModalShow] = useState<boolean>(false);

	useEffect(() => {
		setPageSizeValue(pageSize);
	}, [pageSize]);

	const handlePageSizeChange = (event: any) => {
		onPageSizeChanged && onPageSizeChanged(event.target.value);
	};

	const _closeModal = () => {
		setModalShow(false);
	};

	return (
		<>
			<div className='mlab-grid-pagination'>
				{showPageSizeChange !== false
					? onPageSizeChanged && (
							<div className='mlab-grid-pagination-summary-panel float-start p-2'>
								{onSubmitGridCustomDisplay != undefined ? (
									<div style={{float: 'left', margin: '0 10px'}}>
										<div
											className='btn btn-icon w-auto px-0 btn-active-color-primary'
											style={{marginTop: -5}}
											title='Customize Display'
											onClick={() => setModalShow(true)}
										>
											<FontAwesomeIcon icon={faCog} size='lg' />
										</div>
									</div>
								) : (
									''
								)}

								<div style={{float: 'left', marginLeft: 10}}>
									Show
									<select
										onChange={handlePageSizeChange}
										id={customId ? 'page-size-' + customId : 'page-size'}
										style={{margin: 5}}
										value={pageSizeValue}
									>
										{pageSizes != undefined ? (
											pageSizes &&
											pageSizes.map((item: number) => (
												<option key={item} value={item}>
													{item}
												</option>
											))
										) : (
											<>
												<option value='10'>10</option>
												<option value='50'>50</option>
												<option value='100'>100</option>
											</>
										)}
									</select>
									entries
								</div>
							</div>
					  )
					: ''}

				<div className='mlab-grid-pagination-summary-panel'>
					<div className={setBtnFirstStatus(currentPage)} role='button' aria-label='First Page' onClick={onClickFirst}>
						<span className='ag-icon ag-icon-first' unselectable='on' role='presentation'></span>
					</div>
					<div className={setBtnFirstStatus(currentPage)} role='button' aria-label='Previous Page' onClick={onClickPrevious}>
						<span className='ag-icon ag-icon-previous' unselectable='on' role='presentation'></span>
					</div>
					<span>
						Page <b>{recordCount == 0 ? 0 : currentPage}</b> of <b>{getTotalPage(recordCount, pageSize)}</b>
					</span>
					<div className={setBtnLastStatus(recordCount, currentPage, pageSize)} role='button' aria-label='Next Page' onClick={onClickNext}>
						<span className='ag-icon ag-icon-next' unselectable='on' role='presentation'></span>
					</div>
					<div className={setBtnLastStatus(recordCount, currentPage, pageSize)} role='button' aria-label='Last Page' onClick={onClickLast}>
						<span className='ag-icon ag-icon-last' unselectable='on' role='presentation'></span>
					</div>
				</div>

				<div className='mlab-grid-pagination-summary-panel'>
					<span>
						<b>{getRecordStart(recordCount, currentPage, pageSize)}</b> to <b>{getRecordEnd(recordCount, currentPage, pageSize)}</b> of{' '}
						<b>{recordCount}</b>
					</span>
				</div>
			</div>

			{onSubmitGridCustomDisplay != undefined ? (
				<UserGridCustomDisplayModal
					showForm={modalShow}
					onUpdate={onUpdateGridCustomDisplay ?? _closeModal}
					defaultColumns={defaultColumns}
					submitModal={onSubmitGridCustomDisplay ?? _closeModal}
					closeModal={() => setModalShow(false)}
				/>
			) : (
				''
			)}
		</>
	);
};

export default DefaultGridPagination;

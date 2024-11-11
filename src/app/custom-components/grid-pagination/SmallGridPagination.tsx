import React, {useState} from 'react';
import {Col, Row} from 'react-bootstrap-v5';
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
	onUpdateGridCustomDisplay?: () => void;
	onSubmitGridCustomDisplay?: () => void;
	defaultColumns?: any;
}

const getRecordFromStart = (recordCount: number, currentPage: number, pageSize: number) => {
	if (recordCount > 0) return (currentPage - 1) * pageSize + 1;
	else return 0;
};

const getRecordFromEnd = (recordCount: number, currentPage: number, pageSize: number) => {
	if (recordCount > 0 && recordCount > pageSize)
		if (recordCount > pageSize * currentPage) {
			return (currentPage - 1) * pageSize + pageSize;
		} else {
			return recordCount;
		}
	else return recordCount;
};

const isFirstActive = (currentPage: number) => {
	return currentPage <= 1;
};

const isLastActive = (recordCount: number, currentPage: number, pageSize: number) => {
	let totalPage = getTotalPage(recordCount, pageSize);
	return totalPage === currentPage || recordCount === 0;
};

const setBtnLastStatus = (recordCount: number, currentPage: number, pageSize: number) => {
	return isLastActive(recordCount, currentPage, pageSize) ? 'ag-paging-button ag-disabled' : 'ag-paging-button';
};

const setBtnFirstStatus = (currentPage: number) => {
	return isFirstActive(currentPage) ? 'ag-paging-button ag-disabled' : 'ag-paging-button';
};

const getTotalPage = (recordCount: number, pageSize: number) => {
	return Math.ceil(recordCount / pageSize) | 0;
};

const SmallGridPagination: React.FC<Props> = ({
	recordCount,
	currentPage,
	pageSize,
	onClickFirst,
	onClickPrevious,
	onClickNext,
	onClickLast,
	onUpdateGridCustomDisplay,
	onSubmitGridCustomDisplay,
	defaultColumns,
}) => {
	const [modalShow, setModalShow] = useState<boolean>(false);

	const _closeModal = () => {
		setModalShow(false);
	};

	return (
		<>
			<div className='mlab-small-grid-pagination'>
				<Row>
					<Col lg={4} md={4} sm={4}>
						<div className='mlab-small-grid-pagination-summary-panel'>
							<span>
								<b>{getRecordFromStart(recordCount, currentPage, pageSize)}</b> to <b>{getRecordFromEnd(recordCount, currentPage, pageSize)}</b> of{' '}
								<b>{recordCount}</b>
							</span>
						</div>
					</Col>
					<Col lg={8} md={8} sm={8}>
						<div className='mlab-small-grid-pagination-summary-panel'>
							<button className={setBtnFirstStatus(currentPage)} aria-label='First Page' onClick={onClickFirst}>
								<span className='ag-icon ag-icon-first'></span>
							</button>
							<button className={setBtnFirstStatus(currentPage)} aria-label='Previous Page' onClick={onClickPrevious}>
								<span className='ag-icon ag-icon-previous'></span>
							</button>
							<span>
								Page <b>{recordCount == 0 ? 0 : currentPage}</b> of <b>{getTotalPage(recordCount, pageSize)}</b>
							</span>
							<button className={setBtnLastStatus(recordCount, currentPage, pageSize)} aria-label='Next Page' onClick={onClickNext}>
								<span className='ag-icon ag-icon-next'></span>
							</button>
							<button className={setBtnLastStatus(recordCount, currentPage, pageSize)} aria-label='Last Page' onClick={onClickLast}>
								<span className='ag-icon ag-icon-last'></span>
							</button>
						</div>
					</Col>
				</Row>
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

export default SmallGridPagination;

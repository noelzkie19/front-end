import React, {useState, useEffect, useRef} from 'react';
import {AgGridReact} from 'ag-grid-react';
import gridOverlayTemplate, {gridOverlayNoRowsTemplate} from '../../../common-template/gridTemplates';
import {GenerateCommunicationReviewGrid} from '../services/CommunicationReviewReportApi';
import {CommunicationReviewGridModel} from './models/CommunicationReviewGridModel';
import swal from 'sweetalert';
import {PaginationModel} from '../../../common/model';
import {DefaultGridPagination} from '../../../custom-components';

const CommunicationReviewReportGrid = ({accordionIdx, showGrid, request, targetRevieweeId}: any) => {
	const [gridData, setGridData] = useState<CommunicationReviewGridModel[]>([]);
	const [paginatedGridData, setPaginatedGridData] = useState([]);
	const gridRef: any = useRef();
	const [pagination, setPagination] = useState<PaginationModel>({
		pageSize: 20,
		currentPage: 1,
		recordCount: 1,
		sortOrder: 'DESC',
		sortColumn: 'ISNULL(st.UpdatedDate, st.CreatedDate)',
	});
	useEffect(() => {
		if (!showGrid) return;
		if (!request) return;

		const gridRequest = {...request, revieweeIds: targetRevieweeId.toString()};
		GenerateCommunicationReviewGrid(gridRequest)
			.then(({data}) => {
				setGridData(data);
			})
			.catch((err) => {
				swal('Failed', 'Problem in exporting list', 'error');
			});

		return () => {};
	}, [showGrid]);

	useEffect(() => {
		paginatedDisplay();
		return () => {};
	}, [gridData, pagination]);

	const communicationIdRenderer = ({data}: any) => {
		return (
			<a
				className='cursor-pointer'
				href={'/case-management/service-case/' + data.caseID + '#' + data.communicationId}
				rel='noreferrer'
				target='_blank'
			>
				{data.communicationId}
			</a>
		);
	};

	const gridOptions: {
		columnDefs: any[];
	} = {
		columnDefs: [
			{
				headerName: 'No.',
				field: 'No',
				width: 75,				
				// pinned: 'left'
			},
			{
				headerName: 'Review ID',
				field: 'reviewId',
				autoWidth: true,
			},
			{
				headerName: 'Review Period ',
				field: 'reviewPeriodName',
			},
			{
				headerName: 'Review Date',
				field: 'reviewDate',
				autoWidth: true,
			},
			{
				headerName: 'Communication Created Date',
				field: 'commCreateDate',
				autoWidth: true,
			},
			{
				headerName: 'Communication ID',
				field: 'communicationId',
				autoWidth: true,
				cellRenderer: communicationIdRenderer,
			},
			{
				headerName: 'External ID',
				field: 'externalId',
			},
			{
				headerName: 'Topic ',
				field: 'topicName',
				autoWidth: true,
			},
			{
				headerName: 'Sub Topic ',
				field: 'subTopicName',
				autoWidth: true,
			},
			{
				headerName: 'Review Score ',
				field: 'reviewScore',
				autoWidth: true,
			},
			{
				headerName: 'Summary ',
				field: 'summary',
				autoWidth: true,
			},
			{
				headerName: 'Reviewer',
				field: 'reviewer',
				autoWidth: true,
			},
		],
	};

	const paginatedDisplay = () => {
		const filteredData = gridData.reduce((acc: any, curr: any, idx: number) => {
			let maxIndex = pagination.currentPage * pagination.pageSize - 1;
			let minIndex = maxIndex - pagination.pageSize + 1;
			if (idx >= minIndex && idx <= maxIndex) {
				acc.push(curr);
			}
			return acc;
		}, []);

		const sortedData = filteredData.sort((a: any, b: any) => {
			let dateA: any = new Date(a.ReviewDate);
			let dateB: any = new Date(b.ReviewDate);

			return dateB - dateA;
		});

		//Manually Add "No." Column
		const rowCountbyPagination = pagination.currentPage * pagination.pageSize - pagination.pageSize
		const numberedData = sortedData.reduce((acc :any, curr :any, idx :number) => {
			let numberColumn = rowCountbyPagination + idx + 1
			acc.push({No: numberColumn ,...curr})
			return acc;
		},[])
		setPaginatedGridData(numberedData);
	};

	const onPageSizeChanged = (newPageSize: string) => {
		const newPagination = {...pagination, pageSize: Number(newPageSize), currentPage: 1};
		setPagination(newPagination);
	};

	const onClickFirst = () => {
		if (pagination.currentPage < 1) return;
		const newPagination = {...pagination, currentPage: 1};
		setPagination(newPagination);
	};

	const onClickPrevious = () => {
		if (pagination.currentPage < 1) return;
		const newPagination = {...pagination, currentPage: pagination.currentPage - 1};
		setPagination(newPagination);
	};

	const onClickNext = () => {
		if (totalPage() < pagination.currentPage) return;
		const newPagination = {...pagination, currentPage: pagination.currentPage + 1};
		setPagination(newPagination);
	};

	const onClickLast = () => {
		if (totalPage() < pagination.currentPage) return;
		const newPagination = {...pagination, currentPage: totalPage()};
		setPagination(newPagination);
	};

	const totalPage = () => {
		return Math.ceil(gridData.length / pagination.pageSize) | 0;
	};
	return (
		<div className='ag-theme-quartz' style={{height: 300, width: '100%'}}>
			<AgGridReact
				rowStyle={{userSelect: 'text'}}
				rowData={paginatedGridData}
				defaultColDef={{
					sortable: true,
					resizable: true,
				}}
				columnDefs={gridOptions.columnDefs}
				rowSelection={'multiple'}
				alwaysShowHorizontalScroll={false}
				animateRows={true}
				rowBuffer={0}
				pagination={false}
				overlayNoRowsTemplate={gridOverlayNoRowsTemplate}
				overlayLoadingTemplate={gridOverlayTemplate}
				ref={gridRef}
			/>
			<DefaultGridPagination
				recordCount={gridData.length}
				currentPage={pagination.currentPage}
				pageSize={pagination.pageSize}
				onClickFirst={onClickFirst}
				onClickPrevious={onClickPrevious}
				onClickNext={onClickNext}
				onClickLast={onClickLast}
				onPageSizeChanged={(newPageSize) => {
					onPageSizeChanged(newPageSize);
				}}
				pageSizes={[20, 30, 50, 100]}
			/>
		</div>
	);
};

export default CommunicationReviewReportGrid;

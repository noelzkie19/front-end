import {AgGridReact} from 'ag-grid-react';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {FormGroupContainer, LocalGridPagination} from '../../../../custom-components';
import {ChatStatisticsAgentSegment} from '../../models/response/ChatStatisticsAgentSegment';
import { ColDef, ColGroupDef } from 'ag-grid-community';

interface ChatStatisticProps {
	chatAgentSegment?: Array<ChatStatisticsAgentSegment>;
	recordCount?: number;
	isLoading?: boolean;
}

const styles = {
	boxHeader: {
		padding: '10px 0px 10px 0px',
	},
	subHeaderPaading: {
		paddingLeft: '0px',
	},
};

const ChatStatisticAgentSegment: React.FC<ChatStatisticProps> = ({chatAgentSegment, recordCount, isLoading}) => {
	const gridRef: any = useRef();
	//	Pagination
	const [gridPageSize, setGridPageSize] = useState<number>(5);
	const [gridCurrentPage, setGridCurrentPage] = useState<number>(1);
	const [gridTotalPages, setGridTotalPages] = useState<number>(1);

	const customAgentSegmentPageSizeElementId = 'agent-segment';
	const gridOverlayTemplate =
		'<span class="ag-overlay-loading-center"><span id="agent-grid-loading-overlay">Please wait while your items are loading</span></span>';
	const gridOverlayNoRowsTemplate = '<span class="ag-overlay-loading-center"><span id="agent-grid-loading-overlay">No Rows To Show</span></span>';

	const onGridReady = (params: any) => {
		params.api.paginationGoToPage(1);
		params.api.sizeColumnsToFit();
	};

	const onPaginationChanged = useCallback(() => {
		if (gridRef.current.api) {
			//new implem
			setGridPageSize(gridRef.current.api.paginationGetPageSize());
			setGridCurrentPage(gridRef.current.api.paginationGetCurrentPage() + 1);
			setGridTotalPages(gridRef.current.api.paginationGetTotalPages());
		}
	}, []);

	//	Table/Grid

	useEffect(() => {
		if (!isLoading && (chatAgentSegment === undefined || recordCount === 0)) {
			if (document.getElementById('agent-grid-loading-overlay') as HTMLInputElement) {
				(document.getElementById('agent-grid-loading-overlay') as HTMLInputElement).innerText = 'No Rows To Show';
			}
		} else if (document.getElementById('agent-grid-loading-overlay') as HTMLInputElement) {
			(document.getElementById('agent-grid-loading-overlay') as HTMLInputElement).innerText = 'Please wait while your items are loading';
		}
	}, [isLoading]);

	const agentSegmentColumnDefs : (ColDef<ChatStatisticsAgentSegment> | ColGroupDef<ChatStatisticsAgentSegment>)[] = [
		{
			headerName: 'ID',
			field: 'id',
			width: 70,
			sortable: true,
		},
		{headerName: 'Index', field: 'index', width: 80, sortable: true},
		{headerName: 'ConversationID', field: 'conversationId', width: 140, sortable: true},
		{headerName: 'AgentID', field: 'agentID', width: 100, sortable: true},
		{headerName: 'AgentLoginName', field: 'agentLoginName', width: 120, sortable: true},
		{headerName: 'StartTime', field: 'startTime', width: 120, sortable: true},
		{headerName: 'EndTime', field: 'endTime', width: 120, sortable: true},
		{headerName: 'Duration', field: 'duration', width: 100, sortable: true},
		{headerName: 'IsFirstSegment', field: 'isFirstSegment', width: 120, sortable: true},
		{headerName: 'IsLastSegment', field: 'isLastSegment', width: 120, sortable: true},
		{headerName: 'WaitTime', field: 'waitTime', width: 100, sortable: true},
		{headerName: 'ContactDuration', field: 'contactDuration', width: 120, sortable: true},
		{headerName: 'ResponseCount', field: 'responseCount', width: 120, sortable: true},
		{headerName: 'TotalResponseTime', field: 'totalResponseTime', width: 130, sortable: true},
		{headerName: 'ResponseCycleCount', field: 'responseCycleCount', width: 140, sortable: true},
		{headerName: 'AvgResponseTime', field: 'avgResponseTime', width: 130, sortable: true},
	];

	return (
		<div>
			<FormGroupContainer>
				<span className='fw-bolder mt-2' style={styles.boxHeader}>
					Agent Segment
				</span>

				<div className='ag-theme-balham mb-13' style={{height: 170, width: '100%'}}>
					<AgGridReact
						rowData={chatAgentSegment}
						defaultColDef={{
							sortable: true,
							resizable: true,
						}}
						onGridReady={onGridReady}
						rowBuffer={0}
						onPaginationChanged={onPaginationChanged}
						columnDefs={agentSegmentColumnDefs}
						ref={gridRef}
						paginationPageSize={gridPageSize}
						pagination={true}
						suppressPaginationPanel={true}
						suppressScrollOnNewData={true}
						overlayNoRowsTemplate={gridOverlayNoRowsTemplate}
						overlayLoadingTemplate={gridOverlayTemplate}
					/>
					<LocalGridPagination
						setGridPageSize={setGridPageSize}
						recordCount={recordCount ?? 0}
						gridCurrentPage={recordCount === 0 ? 0 : gridCurrentPage}
						gridPageSize={gridPageSize}
						gridTotalPages={gridTotalPages}
						gridRef={gridRef}
						customId={customAgentSegmentPageSizeElementId}
						hidePageSize={true}
					/>
				</div>
			</FormGroupContainer>
		</div>
	);
};

export default ChatStatisticAgentSegment;

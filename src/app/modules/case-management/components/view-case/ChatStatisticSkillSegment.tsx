import {AgGridReact} from 'ag-grid-react';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {FormGroupContainer, LocalGridPagination} from '../../../../custom-components';
import {ChatStatisticsSkillSegment} from '../../models/response/ChatStatisticsSkillSegment';
import { ColDef, ColGroupDef } from 'ag-grid-community';

interface ChatStatisticProps {
	chatSkillSegment?: Array<ChatStatisticsSkillSegment>;
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

const ChatStatisticSkillSegment: React.FC<ChatStatisticProps> = ({chatSkillSegment, recordCount, isLoading}) => {
	const gridRefChatStatistic: any = useRef();
	//	Pagination
	const [gridPageSize, setGridPageSize] = useState<number>(5);
	const [gridCurrentPage, setGridCurrentPage] = useState<number>(1);
	const [gridTotalPages, setGridTotalPages] = useState<number>(1);

	const customSkillSegmentPageSizeElementId = 'skill-segment';

	const gridOverlayTemplate =
		'<span class="ag-overlay-loading-center"><span id="skill-grid-loading-overlay">Please wait while your items are loading</span></span>';
	const gridOverlayNoRowsTemplate = '<span class="ag-overlay-loading-center"><span id="skill-grid-loading-overlay">No Rows To Show</span></span>';

	const onGridReady = (params: any) => {
		params.api.paginationGoToPage(1);
		params.api.sizeColumnsToFit();
	};

	const onPaginationChanged = useCallback(() => {
		if (gridRefChatStatistic.current.api) {
			//new implem
			setGridPageSize(gridRefChatStatistic.current.api.paginationGetPageSize());
			setGridCurrentPage(gridRefChatStatistic.current.api.paginationGetCurrentPage() + 1);
			setGridTotalPages(gridRefChatStatistic.current.api.paginationGetTotalPages());
		}
	}, []);

	useEffect(() => {
		if (!isLoading && (chatSkillSegment === undefined || recordCount === 0)) {
			if (document.getElementById('skill-grid-loading-overlay') as HTMLInputElement) {
				(document.getElementById('skill-grid-loading-overlay') as HTMLInputElement).innerText = 'No Rows To Show';
			}
		} else if (document.getElementById('skill-grid-loading-overlay') as HTMLInputElement) {
			(document.getElementById('skill-grid-loading-overlay') as HTMLInputElement).innerText = 'Please wait while your items are loading';
		}
	}, [isLoading]);

	//	Table/Grid

	const skillSegmentColumnDefs : (ColDef<ChatStatisticsSkillSegment> | ColGroupDef<ChatStatisticsSkillSegment>)[] =[
		{
			headerName: 'Index',
			field: 'index',
			width: 70,
			sortable: true,
		},
		{headerName: 'ConversationId', field: 'conversationId', width: 260, sortable: true},
		{headerName: 'SkillId', field: 'skillId', width: 100, sortable: true},
		{headerName: 'SkillName', field: 'skillName', width: 100, sortable: true},
		{headerName: 'StartTime', field: 'startTime', width: 150, sortable: true},
		{headerName: 'EndTime', field: 'endTime', width: 150, sortable: true},
		{headerName: 'Duration', field: 'duration', width: 100, sortable: true},
		{headerName: 'IsFirstSegment', field: 'isFirstSegment', width: 120, sortable: true},
		{headerName: 'IsLastSegment', field: 'isLastSegment', width: 120, sortable: true},
	];

	return (
		<div>
			<FormGroupContainer>
				<span className='fw-bolder mt-2' style={styles.boxHeader}>
					Skill Segment
				</span>

				<div className='ag-theme-balham mb-13' style={{height: 170, width: '100%'}}>
					<AgGridReact
						rowData={chatSkillSegment}
						defaultColDef={{
							sortable: true,
							resizable: true,
						}}
						onGridReady={onGridReady}
						rowBuffer={0}
						onPaginationChanged={onPaginationChanged}
						columnDefs={skillSegmentColumnDefs}
						ref={gridRefChatStatistic}
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
						gridRef={gridRefChatStatistic}
						customId={customSkillSegmentPageSizeElementId}
					/>
				</div>
			</FormGroupContainer>
		</div>
	);
};

export default ChatStatisticSkillSegment;

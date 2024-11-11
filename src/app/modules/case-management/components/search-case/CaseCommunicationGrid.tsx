import {CellClickedEvent, IsRowSelectable} from 'ag-grid-community';
import {AgGridReact} from 'ag-grid-react';
import {useContext, useEffect, useMemo, useRef, useState} from 'react';
import {OverlayTrigger, Tooltip} from 'react-bootstrap-v5';
import gridOverlayTemplate, {gridOverlayNoRowsTemplate} from '../../../../common-template/gridTemplates';
import {CaseStatusEnum, CaseTypeName} from '../../../../constants/Constants';
import useConstant from '../../../../constants/useConstant';
import {DefaultGridPagination, FormGroupContainer} from '../../../../custom-components';
import useFnsDateFormatter from '../../../../custom-functions/helper/useFnsDateFormatter';
import {PaginationModel} from '../../../../shared-models/PaginationModel';
import {CaseCommunicationFilterListResponseModel} from '../../models/CaseCommunicationFilterListResponseModel';
import {CaseCommunicationFilterModel} from '../../models/CaseCommunicationFilterModel';
import {CaseCommunicationFilterResponseModel} from '../../models/CaseCommunicationFilterResponseModel';

import {CaseCommunicationContext} from '../../context/CaseCommunicationContext';
import '../../css/SearchCase.css';

type CaseCommunicationGridProps = {
	loading: boolean;
	caseCommunicationFilterResponse: CaseCommunicationFilterResponseModel;
	searchFilter: CaseCommunicationFilterModel;
	searchCaseCommPagination: (pagination: PaginationModel) => void;
	rowSelectedCaseCommunication: (param: Array<CaseCommunicationFilterListResponseModel>) => void;
	// viewPostChatSurvey: (param: any) => void;
};

const CaseCommunicationGrid: React.FC<CaseCommunicationGridProps> = ({
	loading,
	caseCommunicationFilterResponse,
	searchFilter,
	searchCaseCommPagination,
	rowSelectedCaseCommunication,
}: CaseCommunicationGridProps) => {
	const [gridApi, setGridApi] = useState<any>();
	const {
		setColumnFields,
		isUpdateGridCustomDisplay,
		setIsUpgradeGridDisplay,
		isSubmitGridCustomDisplay,
		setIsSubmitGridDisplay,
		columnDefs,
		resetColumnDefs,
	} = useContext(CaseCommunicationContext);
	const gridRef: any = useRef();
	const [pagination, setPagination] = useState<PaginationModel>({
		pageSize: 10,
		currentPage: 1,
		offsetValue: 0,
		sortOrder: 'DESC',
		sortColumn: 'CreatedDate',
	});
	const onGridReady = (params: any) => {
		setGridApi(params.api);
	};

	const {mlabFormatDate} = useFnsDateFormatter();
	const {message} = useConstant();
	const [gridColumnDefs, setGridColumnDefs] = useState<Array<any>>([]);

	const renderServiceCaseCommIdGrid = (_params: any) => (
		<>
			{_params.data.CaseType === CaseTypeName.CustomerService ? (
				<a
					className='cursor-pointer'
					href={'/case-management/service-case/' + _params.data.CaseInformatIonId + '#' + _params.data.CaseCommunicationId}
					rel='noreferrer'
					target='_blank'
				>
					{_params.data.CaseCommunicationId}
				</a>
			) : (
				<a
					className='cursor-pointer'
					href={'/campaign-workspace/view-communication/' + _params.data.CaseCommunicationId}
					rel='noreferrer'
					target='_blank'
				>
					{_params.data.CaseCommunicationId}
				</a>
			)}
		</>
	);

	const renderServiceCaseCommCaseIdGrid = (_params: any) => (
		<>
			{_params.data.CaseType === CaseTypeName.CustomerService ? (
				<a className='cursor-pointer' href={'/case-management/service-case/' + _params.data.CaseInformatIonId} rel='noreferrer' target='_blank'>
					{_params.data.CaseInformatIonId}
				</a>
			) : (
				<a className='cursor-pointer' href={'/campaign-workspace/view-case/' + _params.data.CaseInformatIonId} rel='noreferrer' target='_blank'>
					{_params.data.CaseInformatIonId}
				</a>
			)}
		</>
	);

	const renderCampaignNameGrid = (_params: any) => (
		<>
			{_params.data.CampaignName && _params.data.CampaignName.split(',').length > 1 ? (
				<OverlayTrigger placement='right' delay={{show: 250, hide: 400}} overlay={renderTooltip(_params)}>
					<a href='#'>Campaign List</a>
				</OverlayTrigger>
			) : (
				<span>{_params.data.CampaignName}</span>
			)}
		</>
	);

	const renderCommunicationOwnerTeamNameGrid = (_params: any) => (
		<>
			{_params.data.CommunicationOwnerTeamName ? (
				<OverlayTrigger placement='left' delay={{show: 250, hide: 400}} overlay={renderTeamTooltip(_params)}>
					<a href='#'>Team List</a>
				</OverlayTrigger>
			) : (
				<span></span>
			)}
		</>
	);

	const renderTooltip = (params: any) => (
		<Tooltip id='campaign-list-button-tooltip'>
			{params.data.CampaignName.split(',').map((x: string) => {
				return (
					<label className='row col-form-label col-sm' key={x}>
						{x}
					</label>
				);
			})}
		</Tooltip>
	);
	const renderTeamTooltip = (params: any) => (
		<Tooltip id='button-tooltip'>
			{params.data.CommunicationOwnerTeamName.split(',').map((x: string) => {
				return (
					<label className='row col-form-label col-sm' key={x}>
						{x}
					</label>
				);
			})}
		</Tooltip>
	);
	const renderStartDateGrid = (_params: any) => {
		// return format
		return mlabFormatDate(_params.data.CommunicationStartDate);
	};
	const renderEndDateGrid = (_params: any) => {
		// return format
		return mlabFormatDate(_params.data.CommunicationEndDate);
	};
	const renderReportedDateGrid = (_params: any) => {
		// return format
		const reportedDateParams: any = _params.data.ReportedDate;
		if (reportedDateParams !== '0001-01-01T00:00:00') {
			return mlabFormatDate(reportedDateParams);
		} else {
			return '';
		}
	};
	const gridOptions = {
		columnDefs: [
			{
				width: 200,
				minWidth: 180,
				headerCheckboxSelection: true,
				headerCheckboxSelectionFilteredOnly: true,
				checkboxSelection: true,
				lockPinned: true,
				cellClass: 'locked-pinned',
				wrapText: true,
				headerName: 'Case Type',
				field: 'CaseType',
				showDisabledCheckboxes: false,
				isPinned: true,
				order: 0,
			},
			{headerName: 'Brand', field: 'Brand', minWidth: 100, isPinned: true, order: 1},
			{headerName: 'Username', field: 'UserName', isPinned: true, order: 2},
			{
				headerName: 'Communication ID',
				field: 'CaseCommunicationId',
				minWidth: 100,
				cellRenderer: renderServiceCaseCommIdGrid,
				isPinned: true,
				order: 3,
			},
			{
				headerName: 'Communication Start Date',
				field: 'CommunicationStartDate',
				valueFormatter: renderStartDateGrid,
				isPinned: true,
				order: 4,
			},
			{headerName: 'Communication Owner', field: 'CommunicationOwner', isPinned: true, order: 5},
			{headerName: 'VIP Level', field: 'VIPLevel', minWidth: 100, order: 6},
			{headerName: 'Currency', field: 'Currencies', order: 7},
			{headerName: 'Case Status', field: 'CaseStatus', minWidth: 100, order: 8},

			{
				headerName: 'Case ID',
				field: 'CaseInformatIonId',
				minWidth: 100,
				cellRenderer: renderServiceCaseCommCaseIdGrid,
				order: 9,
			},
			{headerName: 'External ID', field: 'ExternalCommunicationId', minWidth: 200, order: 10},
			{
				headerName: 'Campaign Name',
				field: 'CampaignName',
				cellRenderer: renderCampaignNameGrid,
				minWidth: 200,
				order: 11,
			},
			{headerName: 'Duration', field: 'Duration', minWidth: 100, order: 12},
			{headerName: 'Subject', field: 'Subject', order: 13},

			{
				headerName: 'Communication End Date',
				field: 'CommunicationEndDate',
				valueFormatter: renderEndDateGrid,
				order: 14,
			},
			{headerName: 'Notes', field: 'Notes', order: 15},
			{headerName: 'Topic', field: 'Topic', order: 16},
			{headerName: 'Subtopic', field: 'Subtopic', order: 17},
			{headerName: 'Message Type', field: 'MessageType', width: 100, order: 18},
			{
				headerName: 'Communication Owner Team',
				field: 'CommunicationOwnerTeamName',
				cellRenderer: renderCommunicationOwnerTeamNameGrid,
				order: 19,
			},
			{
				headerName: 'Reported Date',
				field: 'ReportedDate',
				valueFormatter: renderReportedDateGrid,
				order: 20,
			},
			{
				headerName: 'Abandoned Agent',
				field: 'IsLastAgentAbandonedAssigned',
				minWidth: 100,
				order: 21,
			},
			{
				headerName: 'Abandoned Queue',
				field: 'IsLastSkillAbandonedQueue',
				minWidth: 100,
				order: 22,
			},
			{
				headerName: 'Last Skill Team',
				field: 'LatestSkillTeamName',
				minWidth: 100,
				order: 23,
			},
		],
	};

	const onSort = (e: any) => {
		if (
			caseCommunicationFilterResponse.caseCommunicationFilterList !== undefined &&
			caseCommunicationFilterResponse.caseCommunicationFilterList.length > 0
		) {
			const sortDetail = e.api.getSortModel();
			if (sortDetail[0] !== undefined) {
				const newPagination = {...pagination, sortColumn: sortDetail[0]?.colId, sortOrder: sortDetail[0]?.sort};
				setPagination(newPagination);
				searchCaseCommPagination(newPagination);
			} else {
				const newPagination = {...pagination, sortColumn: 'CreatedDate', sortOrder: 'DESC'};
				setPagination(newPagination);
				searchCaseCommPagination(newPagination);
			}
		}
	};
	const onPageSizeChanged = () => {
		const value: string = (document.getElementById('page-size') as HTMLInputElement).value;
		const newPagination = {...pagination, pageSize: Number(value), currentPage: 1};
		setPagination(newPagination);

		if (
			caseCommunicationFilterResponse.caseCommunicationFilterList !== undefined &&
			caseCommunicationFilterResponse.caseCommunicationFilterList.length > 0
		) {
			searchCaseCommPagination(newPagination);
		}
	};
	const onClickFirst = () => {
		if (pagination.currentPage > 1) {
			const newPagination = {...pagination, currentPage: 1};
			setPagination(newPagination);
			searchCaseCommPagination(newPagination);
		}
	};

	const onClickPrevious = () => {
		if (pagination.currentPage > 1) {
			const newPagination = {...pagination, currentPage: pagination.currentPage - 1};
			setPagination(newPagination);
			searchCaseCommPagination(newPagination);
		}
	};

	const onCellClicked = (params: CellClickedEvent) => rowSelectedCaseCommunication(gridApi.getSelectedRows());


	const onRowSelected = (event: any) => {   
		const { data, node } = event;   // Custom logic to prevent selection for certain rows
		if (!data.isSelectable) {     
			node.setSelected(false); // Deselect row programmatically 
		} 
		return !!data && data.CaseStatus === CaseStatusEnum[46];
	};

	const onClickNext = () => {
		if (totalPage() > pagination.currentPage) {
			const newPagination = {...pagination, currentPage: pagination.currentPage + 1};
			setPagination(newPagination);
			searchCaseCommPagination(newPagination);
		}
	};

	const onClickLast = () => {
		if (totalPage() > pagination.currentPage) {
			const newPagination = {...pagination, currentPage: totalPage()};
			setPagination(newPagination);
			searchCaseCommPagination(newPagination);
		}
	};
	// Side Effects
	useEffect(() => {
		if (
			!loading &&
			((caseCommunicationFilterResponse.caseCommunicationFilterList && caseCommunicationFilterResponse.caseCommunicationFilterList.length === 0) ||
				caseCommunicationFilterResponse.caseCommunicationFilterList === undefined)
		) {
			if (document.getElementById('mlab-grid-loading-overlay') as HTMLInputElement) {
				(document.getElementById('mlab-grid-loading-overlay') as HTMLInputElement).innerText = message.gridMessage.gridNoRowsToShow;
			}
		} else if ((document.getElementById('mlab-grid-loading-overlay') as HTMLInputElement) && loading) {
			(document.getElementById('mlab-grid-loading-overlay') as HTMLInputElement).innerText = message.gridMessage.gridLoading;
		}
	}, [loading]);

	const totalPage = () => {
		return Math.ceil(caseCommunicationFilterResponse.recordCount / pagination.pageSize) | 0;
	};

	useEffect(() => {
		setColumnFields(gridOptions.columnDefs);
	}, []);

	useEffect(() => {
		if (isUpdateGridCustomDisplay) {
			gridRef.current.api.showLoadingOverlay();
			setIsUpgradeGridDisplay(false);
		}
	}, [isUpdateGridCustomDisplay]);

	useEffect(() => {
		if (isSubmitGridCustomDisplay) {
			setIsSubmitGridDisplay(false);
		}
	}, [isSubmitGridCustomDisplay]);

	useEffect(() => {
		if (columnDefs?.length > 0) {
			setGridColumnDefs(columnDefs);
			gridApi.hideOverlay();
			setIsSubmitGridDisplay(false);
			resetColumnDefs([]);
		}
	}, [columnDefs]);

	const sortedColumnDefs = useMemo(() => {
		return [...gridColumnDefs].sort((a, b) => a.order - b.order);
	}, [gridColumnDefs]);

	return (
		<FormGroupContainer>
			<div className='ag-theme-quartz' style={{height: 500, width: '100%', marginBottom: '50px'}}>
				<AgGridReact
					rowStyle={{userSelect: 'text'}}
					rowData={caseCommunicationFilterResponse.caseCommunicationFilterList}
					defaultColDef={{
						sortable: true,
						resizable: true,
					}}
					suppressExcelExport={true}
					rowSelection={'multiple'}
					alwaysShowHorizontalScroll={false}
					animateRows={true}
					onCellClicked={onCellClicked}
					onGridReady={onGridReady}
					rowBuffer={0}
					onRowSelected={onRowSelected}
					pagination={false}
					paginationPageSize={caseCommunicationFilterResponse.recordCount}
					columnDefs={sortedColumnDefs}
					onSortChanged={(e) => onSort(e)}
					overlayNoRowsTemplate={gridOverlayNoRowsTemplate}
					overlayLoadingTemplate={gridOverlayTemplate}
					ref={gridRef}
				/>

				<DefaultGridPagination
					recordCount={caseCommunicationFilterResponse.recordCount}
					currentPage={pagination.currentPage}
					pageSize={pagination.pageSize}
					onClickFirst={onClickFirst}
					onClickPrevious={onClickPrevious}
					onClickNext={onClickNext}
					onClickLast={onClickLast}
					onPageSizeChanged={onPageSizeChanged}
				/>
			</div>
		</FormGroupContainer>
	);
};

export default CaseCommunicationGrid;

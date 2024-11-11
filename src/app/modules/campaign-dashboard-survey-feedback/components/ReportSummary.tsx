import {AgGridReact} from 'ag-grid-react';
import useFnsDateFormatter from '../../../custom-functions/helper/useFnsDateFormatter';
import {SurveyAndFeedbackReportSummaryReponseModel} from '../models';
import { ColDef, ColGroupDef } from 'ag-grid-community';

type SummaryProps = {
	summary: SurveyAndFeedbackReportSummaryReponseModel;
};

const ReportSummary: React.FC<SummaryProps> = (props: SummaryProps) => {
	const {mlabFormatDate} = useFnsDateFormatter();

	const formatReportDateRender = (date: any) => {
		return typeof date !== 'undefined' && date !== '' ? mlabFormatDate(date) : null;
	};

	const customCellStartDateRender = (params: any) => {
		const {data} = params;
		const formattedDate = formatReportDateRender(data.startDate);

		return <>{formattedDate}</>;
	};

	const customCellEndDateRender = (params: any) => {
		const {data} = params;
		const formattedDate = formatReportDateRender(data.endDate);

		return <>{formattedDate}</>;
	};

	const columnDefs : (ColDef<SurveyAndFeedbackReportSummaryReponseModel> | ColGroupDef<SurveyAndFeedbackReportSummaryReponseModel>)[] =[
		{
			headerName: 'Start Date',
			field: 'startDate',
			cellRenderer: customCellStartDateRender,
		},
		{
			headerName: 'End Date',
			field: 'endDate',
			cellRenderer: customCellEndDateRender,
		},
		{
			headerName: 'Campaign Type',
			field: 'campaignType',
		},
		{
			headerName: 'Campaign Report Period',
			field: 'campaignReportPeriod',
			cellRenderer: (params: any) => {
				return params.data.campaignReportPeriod > 0 ? '+' + params.data.campaignReportPeriod : '';
			},
		},
		{
			headerName: 'Campaign ID',
			field: 'campaignId',
			cellRenderer: (params: any) => {
				return params.data.campaignId > 0 ? params.data.campaignId : '';
			},
		},
		{headerName: 'Campaign Name', field: 'campaignName'},
		{headerName: 'Campaign Status', field: 'campaignStatus'},
		{headerName: 'Campaign Brand', field: 'brand'},
		{headerName: 'Currency', field: 'currency'},
	];

	const onGridReady = (params: any) => {
		params.api.sizeColumnsToFit();
	};

	return (
		<div className='ag-theme-quartz' style={{height: 100, width: '100%'}}>
			<AgGridReact
				rowData={[props.summary]}
				defaultColDef={{
					sortable: true,
					resizable: true,
				}}
				components={{
					tableLoader: tableLoader,
				}}
				onGridReady={onGridReady}
				rowBuffer={0}
				enableRangeSelection={true}
				pagination={false}
				paginationPageSize={1}
				columnDefs={columnDefs}
			/>
		</div>
	);
};

const tableLoader = (data: any) => {
	return (
		<div className='ag-custom-loading-cell' style={{paddingLeft: '10px', lineHeight: '25px'}}>
			<i className='fas fa-spinner fa-pulse'></i> <span> {data.loadingMessage}</span>
		</div>
	);
};
export default ReportSummary;

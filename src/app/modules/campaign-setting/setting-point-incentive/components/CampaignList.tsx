import {AgGridReact} from 'ag-grid-react';
import 'datatables.net';
import 'datatables.net-dt';
import React, {useState} from 'react';
import {ButtonGroup} from 'react-bootstrap-v5';
import {FormGroupContainer} from '../../../../custom-components';
import {CampaignPeriodDetailsModel} from '../../setting-auto-tagging/models/CampaignPeriodDetailsModel';
import { ColDef, ColGroupDef } from 'ag-grid-community';

interface Props {
	campaignPeriodList: Array<CampaignPeriodDetailsModel>;
}

const CampaignList: React.FC<Props> = ({campaignPeriodList}) => {
	//  STATE
	const [gridApi, setGridApi] = useState<any | null>(null);
	const [gridColumnApi, setGridColumnApi] = useState(null);

	//  GRID DETAILS
	const columnDefsCampaign : (ColDef<CampaignPeriodDetailsModel> | ColGroupDef<CampaignPeriodDetailsModel>)[] =[
		{headerName: 'No', valueGetter: 'node.rowIndex + 1'.toString()},
		{
			headerName: 'Campaign Name',
			field: 'campaignName',
			cellRenderer: (params: any) => (
				<>
					{params.data.rangeNo != 0 ? (
						<ButtonGroup aria-label='Basic example'>
							<div className='d-flex justify-content-center flex-shrink-0 shadow-none'>
								<label
									className='btn-link cursor-pointer'
									onClick={() => {
										openCampaign(params.data.campaignId);
									}}
								>
									{params.data.campaignName}
								</label>
							</div>
						</ButtonGroup>
					) : null}
				</>
			),
		},
		{headerName: 'Campaign Status', field: 'campaignStatus'},
		{headerName: 'Campaign Report Period', field: 'campaignPeriod'},
	];

	//  METHODS

	const openCampaign = (id: any) => {
		window.open('/campaign-management/campaign/view/' + id, '_blank');
	};

	//  WATCHERS
	const onGridReady = (params: any) => {
		params.api.sizeColumnsToFit();
		setGridApi(params.api);
		setGridColumnApi(params.columnApi);
	};

	return (
		<div>
			<div className='card-title mt-5 mb-5'>
				<h5 className='fw-bolder m-0'>Active and Ended Campaign</h5>
			</div>
			<FormGroupContainer>
				{/* table */}
				<div className='ag-theme-quartz' style={{height: 300, width: '100%'}}>
					<AgGridReact
						rowData={campaignPeriodList}
						defaultColDef={{
							sortable: true,
							resizable: true,
						}}
						onGridReady={onGridReady}
						rowBuffer={0}
						enableRangeSelection={true}
						columnDefs={columnDefsCampaign}
					/>
				</div>
			</FormGroupContainer>
		</div>
	);
};

export default CampaignList;

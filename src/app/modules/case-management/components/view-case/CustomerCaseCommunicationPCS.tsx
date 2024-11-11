import {AgGridReact} from 'ag-grid-react';
import React from 'react';

interface Props {
	pcsData?: any;
}

export const CustomerCaseCommunicationPCS: React.FC<Props> = ({pcsData}) => {
	const onGridReady = (params: any) => {
		params.api.paginationGoToPage(4);
		params.api.sizeColumnsToFit();
	};

	const columnDefs = [
		{headerName: 'Question', field: 'question', width: 500},
		{headerName: 'Answer', field: 'answer'},
	];

	return (
		<div className='row'>
			<div className='pcs-list ag-theme-quartz mt-3' style={{height: 400, width: '80%', marginBottom: 20}}>
				<AgGridReact
					rowData={pcsData}
					defaultColDef={{
						sortable: true,
						resizable: true,
					}}
					onGridReady={onGridReady}
					rowBuffer={0}
					pagination={false}
					paginationPageSize={10}
					columnDefs={columnDefs}
				/>
			</div>
		</div>
	);
};

export default CustomerCaseCommunicationPCS;

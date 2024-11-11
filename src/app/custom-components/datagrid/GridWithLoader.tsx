import {AgGridReact} from 'ag-grid-react';
import React, {useEffect, useRef, useState} from 'react';
import gridOverlayTemplate from '../../common-template/gridTemplates';

interface Props {
	rowData: any;
	columnDefs: any;
	sortColumn?: any;
	sortOrder?: any;
	isLoading?: boolean;
	height?: number;
	onSortChanged: (e: any) => void;
	setLoading?: any;
}

const GridWithLoader: React.FC<Props> = ({rowData, columnDefs, sortColumn, sortOrder, isLoading, height, onSortChanged}) => {
	const gridRef: any = useRef();
	const [gridApi, setGridApi] = useState<any | null>(null);
	const [gridColumnApi, setGridColumnApi] = useState(null);
	const [sortedColumn, setSortedColumn] = useState<string>(sortColumn);
	const [sortedOrder, setSortedOrder] = useState<string>(sortOrder);
	const [loading, setLoading] = useState(isLoading);

	const onGridReady = (params: any) => {
		setGridApi(params.api);
		setGridColumnApi(params.columnApi);
		params.api.sizeColumnsToFit();
	};

	useEffect(() => {
		if (!loading && (rowData === undefined || rowData.length === 0)) {
			if (document.getElementById('mlab-grid-loading-overlay') as HTMLInputElement) {
				(document.getElementById('mlab-grid-loading-overlay') as HTMLInputElement).innerText = 'No Rows To Show';
			}
		} else {
			if (document.getElementById('mlab-grid-loading-overlay') as HTMLInputElement) {
				(document.getElementById('mlab-grid-loading-overlay') as HTMLInputElement).innerText = 'Please wait while your items are loading';
			}
		}
	}, [loading]);

	return (
		<div className='ag-theme-quartz pt-10' style={{height: height ? height : 400, width: '100%'}}>
			<AgGridReact
				rowData={rowData}
				defaultColDef={{
					sortable: true,
					resizable: true,
				}}
				onGridReady={onGridReady}
				rowBuffer={0}
				enableRangeSelection={true}
				pagination={false}
				columnDefs={columnDefs}
				onSortChanged={onSortChanged}
				overlayNoRowsTemplate={gridOverlayTemplate}
				ref={gridRef}
			/>
		</div>
	);
};

export default GridWithLoader;

import {AgGridReact} from 'ag-grid-react';
import React, {useEffect, useState} from 'react';
import { gridOverlayNoRowsTemplate } from '../../common-template/gridTemplates';
import DefaultGridPagination from '../grid-pagination/DefaultGridPagination';

interface Props {
	rowData: any;
	columnDefs: any;
	sortColumn?: any;
	sortOrder?: any;
	isLoading: boolean;
	height?: number;
	onSortChanged: (e: any) => void;

	rowClassRules?: any;
	recordCount?: any;
	currentPage?: any;
	pageSize?: any;
	onClickFirst: () => void;
	onClickNext: () => void;
	onClickLast: () => void;
	onPageSizeChanged: () => void;
	onClickPrevious: () => void;
	gridRef: any;
	noTopPad?: any;
	customId?: any;
	isRowSelectionMultiple?:boolean;
	onSelectionChanged?: (e: any) => void;
	onRowSelected?: (e: any) => void;
	
}

const GridWithLoaderAndPagination: React.FC<Props> = ({
	rowData,
	columnDefs,
	sortColumn,
	sortOrder,
	isLoading,
	height,
	onSortChanged,
	rowClassRules,
	recordCount,
	currentPage,
	pageSize,
	onClickFirst,
	onClickNext,
	onClickLast,
	onPageSizeChanged,
	onClickPrevious,
	gridRef,
	noTopPad,
	customId,
	isRowSelectionMultiple,
	onSelectionChanged,
	onRowSelected
}) => {
	// const gridRef: any = useRef();
	const [gridApi, setGridApi] = useState<any | null>(null);
	const [gridColumnApi, setGridColumnApi] = useState(null);
	const [sortedColumn, setSortedColumn] = useState<string>(sortColumn);
	const [sortedOrder, setSortedOrder] = useState<string>(sortOrder);
	const [loading, setLoading] = useState(isLoading);

	const onGridReady = (params: any) => {
		setGridApi(params.api);
		setGridColumnApi(params.columnApi);
		params.api.paginationGoToPage(4);
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
        // <div className='ag-theme-quartz pt-10'  style={{height: height ? height : 400, width: '100%'}}>
        (<div className={`ag-theme-quartz ${noTopPad ? '' : 'pt-10'}`} style={{height: height ? height : 400, width: '100%'}}>
            <AgGridReact
				rowData={rowData}
				defaultColDef={{
					sortable: true,
					resizable: true,
				}}
				onGridReady={onGridReady}
				rowBuffer={0}
				//enableRangeSelection={true} //deprecated in AgGridReactver.32.0.0
				pagination={false}
				columnDefs={columnDefs}
				onSortChanged={onSortChanged}
				overlayNoRowsTemplate={gridOverlayNoRowsTemplate}
				ref={gridRef}
				rowClassRules={rowClassRules}
				rowSelection={ isRowSelectionMultiple ? 'multiple':'single'}
				onSelectionChanged={onSelectionChanged}
				onRowSelected={onRowSelected}
			/>
            <DefaultGridPagination
				recordCount={recordCount}
				currentPage={currentPage}
				pageSize={pageSize}
				onClickFirst={onClickFirst}
				onClickPrevious={onClickPrevious}
				onClickNext={onClickNext}
				onClickLast={onClickLast}
				onPageSizeChanged={onPageSizeChanged}
				customId={customId}
			/>
        </div>)
    );
};

export default GridWithLoaderAndPagination;

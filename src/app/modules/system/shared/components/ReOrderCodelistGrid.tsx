import {AgGridReact} from 'ag-grid-react';
import React from 'react';

type ReOrderGridProps = {
	rowData: [];
	rowDragManaged?: boolean;
	suppressMoveWhenRowDragging?: boolean;
	immutableData?: boolean;
	onRowDragEnd: (e: any) => void;
	animateRows?: boolean;
	onGridReady: (e: any) => void;
	enableRangeSelection?: boolean;
	getRowNodeId: any;
	columnDefs: any;
}

const ReOrderCodelistGrid: React.FC<ReOrderGridProps> = (props: ReOrderGridProps) => {
	return (
		<AgGridReact
			rowData={props.rowData}
			rowDragManaged={props.rowDragManaged}
			suppressMoveWhenRowDragging={props.suppressMoveWhenRowDragging}
			onRowDragEnd={props.onRowDragEnd}
			animateRows={props.animateRows}
			onGridReady={props.onGridReady}
			enableRangeSelection={props.enableRangeSelection}
			getRowId={props.getRowNodeId}
			columnDefs={props.columnDefs}
		/>
	);
};

export {ReOrderCodelistGrid};

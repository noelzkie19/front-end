import {ICellRendererParams} from 'ag-grid-community';

export default (props: ICellRendererParams) => {
	const rowIndex = props.node.rowIndex ?? -1;
	return <>{rowIndex + 1}</>;
};

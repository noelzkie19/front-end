import {AgGridReact} from 'ag-grid-react';
import {useEffect, useState} from 'react';
import {Button, Modal} from 'react-bootstrap';
import swal from 'sweetalert';
import useConstant from '../../constants/useConstant';

type ModalProps<T> = {
	modalName: string;
	orderList: Array<T>;
	columnList: Array<any>;
	modal: boolean;
	toggle: () => void;
	saveReorder: (list: Array<T>) => void;
};

const ReorderListModal = <T extends object>(props: ModalProps<T>) => {
	// States
	const [newOrderList, setNewOrderList] = useState(props.orderList);
	const [newColumnList, setNewColumnList] = useState(props.columnList);
	const [gridApi, setGridApi] = useState<any>();
	const [gridColumnApi, setGridColumnApi] = useState(null);
	const {SwalConfirmMessage} = useConstant();

	// Effects
	useEffect(() => {
		if (props.modal) {
			setNewOrderList(props.orderList);
			setNewColumnList(props.columnList);
			console.log(newColumnList)
			console.log(newOrderList)
		}
	}, [props.modal]);

	// Methods
	const confirmClose = () => {
		swal({
			title: 'Confirmation',
			text: 'Any changes will be discarded, please confirm',
			icon: 'warning',
			buttons: {
				cancel: {
					text: SwalConfirmMessage.btnNo,
					value: null,
					visible: true,
				},
				confirm: {
					text: SwalConfirmMessage.btnYes,
					value: true,
					visible: true,
				},
			},
			dangerMode: true,
		}).then((willCreate) => {
			if (willCreate) {
				handleClose();
			}
		});
	};

	const handleClose = () => {
		props.toggle();
	};

	const handleSaveChanges = () => {
		handleClose();
		props.saveReorder(newOrderList);
	};

	const onGridReady = (params: any) => {
		setGridApi(params.api);
		setGridColumnApi(params.columnApi);
		params.api.sizeColumnsToFit();
	};

	const handleReorder = () => {
		let rowData: any[] = [];
		if (gridApi !== null) {
			gridApi.forEachNode((node: any) => rowData.push(node.data));
			console.log('rowData', rowData);
			const colName = props.columnList[0];
			const newOrder = rowData.map((el, index) => {
				const a: any = {...el, [colName['data']]: index + 1};
				return a;
			});
			console.log('newOrder', newOrder);
			setNewOrderList([...newOrder]);
		}
	};

	const getRowNodeId = (data: any) => {
		return data.id;
	};

	const columnDefs = newColumnList.map((item, index) => ({
		headerName: item.title,
		field: item.field,
		resizable: true,
		...(item.cellRenderer ? { cellRenderer: item.cellRenderer } : {}),
		...(index === 0 ? { rowDrag: true } : {}),
	}));

	return (
		<Modal show={props.modal} size={'lg'} onHide={handleClose} centered>
			<Modal.Header>
				<Modal.Title>{props.modalName}</Modal.Title>
			</Modal.Header>
			<Modal.Body>
				<div className='ag-theme-quartz' style={{height: '400px', width: '100%'}}>
					<AgGridReact
						rowData={newOrderList}
						onGridReady={onGridReady}
						columnDefs={columnDefs}
						defaultColDef={{
							initialWidth: 100,
							sortable: true,
							resizable: true,
							filter: true,
						}}
						rowDragManaged={true}
						animateRows={true}
						onRowDragEnd={handleReorder}
					>
					</AgGridReact>

				</div>
			</Modal.Body>
			<Modal.Footer className='d-flex'>
				<Button variant='primary' className='btn btn-primary btn-sm me-2' onClick={handleSaveChanges}>
					Submit
				</Button>
				<Button className='btn btn-secondary btn-sm' onClick={confirmClose}>
					Close
				</Button>
			</Modal.Footer>
		</Modal>
	);
};

export default ReorderListModal;

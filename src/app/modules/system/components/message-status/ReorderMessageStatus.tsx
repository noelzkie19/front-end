import { Guid } from 'guid-typescript';
import React, { useCallback, useEffect, useState } from 'react';
import { ModalFooter } from 'react-bootstrap-v5';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import swal from 'sweetalert';
import { RootState } from '../../../../../setup';
import * as hubConnection from '../../../../../setup/hub/MessagingHub';
import useConstant from '../../../../constants/useConstant';
import { ContentContainer, DefaultButton, DefaultSecondaryButton, FormModal, MainContainer } from '../../../../custom-components';
import { GetMessageStatusListResponse, MessageStatusTypesModel } from '../../models';
import { GetMessageStatusListRequest } from '../../models/requests/GetMessageStatusListRequest';
import * as system from '../../redux/SystemRedux';
import { getMessageStatusList, sendGetMessageStatusList } from '../../redux/SystemService';
import { ReOrderCodelistGrid } from '../../shared/components/ReOrderCodelistGrid';

// -- INTERFACES -- //
interface Props {
	showForm: boolean;
	closeModal: () => void;
	messageTypeId: number;
}

const ReorderMessageStatus: React.FC<Props> = ({showForm, closeModal, messageTypeId}) => {
	// -----------------------------------------------------------------
	// GET REDUX STORE
	// -----------------------------------------------------------------
	const userAccessId = useSelector<RootState>(({auth}) => auth.userId, shallowEqual) as number;
	const systemData = useSelector<RootState>(({system}) => system.getMessageStatusList, shallowEqual) as any;

	const dispatch = useDispatch();
	const {SwalFailedMessage, SwalServerErrorMessage, SwalMessageStatusMessage, HubConnected, successResponse} = useConstant();
	const messagingHub = hubConnection.createHubConnenction();

	// -----------------------------------------------------------------
	// VARIABLES
	// -----------------------------------------------------------------
	// -----------------------------------------------------------------
	// STATES
	// -----------------------------------------------------------------
	const [rowData, setRowData] = useState<any>([]);
	const [gridApi, setGridApi] = useState<any>(null);

	// -----------------------------------------------------------------
	// MOUNTED
	// -----------------------------------------------------------------
	const onReorderMessageStatusGridReady = (params: any) => {
		setGridApi(params.api);
		params.api.sizeColumnsToFit();
		setRowData(systemData);
	};

	// -----------------------------------------------------------------
	// WATCHERS
	// -----------------------------------------------------------------
	useEffect(() => {
		if (showForm === true) {
			getReorderMessageStatus();
		}
	}, [showForm]);

	// -----------------------------------------------------------------
	// TABLE COMPONENTS
	// -----------------------------------------------------------------

	const renderReorderMessageStatusName = (_props: any) => (
		<>
			{_props
				? _props.data.messageStatusTypes.map((x: MessageStatusTypesModel) => (
						<div key={x.messageStatusId} style={{height: 'auto', whiteSpace: 'pre-wrap', overflowWrap: 'break-word'}}>
							{x.messageTypeName}
						</div>
				  ))
				: null}
		</>
	);

	// -- TABLE HEADERS AND COLUMNS --//
	const columnDefs = [
		{
			headerName: 'Order',
			field: 'position',
			rowDrag: true,
			valueGetter: (params: any) => {
				const rowIndex = params.node?.rowIndex ?? -1; // Default to -1 if undefined
				return rowIndex >= 0 ? rowIndex + 1 : null; // Return ID if rowIndex is valid
			  }, 
	
		},
		{headerName: 'Message Status Name', field: 'messageStatusName'},
		{
			headerName: 'Included To Message Type',
			field: 'messageStatusTypes',
			autoHeight: true,
			cellRenderer: renderReorderMessageStatusName,
		},
	];

	const onReorderMessageStatusRowDragEnd = (event: any) => {
		const movingNode = event.node;
		const overNode = event.overNode;
		const rowNeedsToMove = movingNode !== overNode;

		if (rowNeedsToMove) {
			const movingData = movingNode.data;
			const overData = overNode.data;

			const fromIndex = rowData.indexOf(movingData);
			const toIndex = rowData.indexOf(overData);
			const newStore = rowData.slice();

			moveInArray(newStore, fromIndex, toIndex);
			gridApi.setRowData(newStore);
			gridApi.clearFocusedCell();
		}
		function moveInArray(arr: any, fromIndex: number, toIndex: number) {
			const element = arr[fromIndex];
			arr.splice(fromIndex, 1);
			arr.splice(toIndex, 0, element);
			setRowData(arr);
		}
	};

	const geReorderMessageStatustRowNodeId = useCallback(
		(params: any) => String(params.data.messageStatusId),
		[],
	);

	const getReorderMessageStatusGateway = (_request: GetMessageStatusListRequest) => {
		sendGetMessageStatusList(_request)
			.then((response) => {
				if (response.status === successResponse) {
					messagingHub.on(_request.queueId.toString(), (message) => {
						getMessageStatusList(message.cacheId)
							.then((data) => {
								let resultData = Object.assign(new Array<GetMessageStatusListResponse>(), data.data);
								dispatch(system.actions.getMessageStatusList(resultData));
							})
							.catch(() => {
								swal(SwalFailedMessage.title, SwalMessageStatusMessage.textErrorMessageStatusList, SwalFailedMessage.icon);
							});
						messagingHub.off(_request.queueId.toString());
						messagingHub.stop();
					});

					setTimeout(() => {
						if (messagingHub.state === HubConnected) {
							messagingHub.stop();
						}
					}, 30000);
				} else {
					messagingHub.stop();
					swal(SwalFailedMessage.title, response.data.message, SwalFailedMessage.icon);
				}
			})
			.catch(() => {
				messagingHub.stop();
				swal(SwalFailedMessage.title, SwalMessageStatusMessage.textErrorMessageStatusList, SwalFailedMessage.icon);
			});
	};

	const getReorderMessageStatus = () => {
		setTimeout(() => {
			messagingHub
				.start()
				.then(() => {
					if (messagingHub.state === HubConnected) {
						const request: GetMessageStatusListRequest = {
							queueId: Guid.create().toString(),
							userId: userAccessId.toString(),
							messageStatusName: '',
							messageStatusStatus: '',
							messageTypeId: 0,
							messageTypeIds: messageTypeId === 0 ? '' : messageTypeId.toString(),
						};
						getReorderMessageStatusGateway(request);
					} else {
						swal(SwalServerErrorMessage.title, SwalServerErrorMessage.textError, SwalServerErrorMessage.icon);
					}
				})
				.catch((err) => console.log('Error while starting connection: ' + err));
		}, 1000);
	};

	const _dispatchReorderMessageStatusTransaction = () => {
		let updatedOrder = Array<GetMessageStatusListResponse>();
		rowData.forEach((item: GetMessageStatusListResponse, index: number) => {
			const messageResponseObj: GetMessageStatusListResponse = {
				messageStatusId: item.messageStatusId,
				messageStatusName: item.messageStatusName,
				messageStatusStatus: item.messageStatusStatus,
				messageStatusTypes: item.messageStatusTypes,
				position: index + 1,
				action: 'REORDER',
			};
			updatedOrder.push(messageResponseObj);
		});

		dispatch(system.actions.getMessageStatusList(updatedOrder));
		dispatch(system.actions.postMessageStatusList(updatedOrder));
	};

	return (
		<FormModal headerTitle={'Change Order Message Status'} haveFooter={false} show={showForm}>
			<MainContainer>
				<ContentContainer>
					<div className='ag-theme-quartz' style={{height: 400, width: '100%'}}>
						<ReOrderCodelistGrid
							rowData={rowData}
							rowDragManaged={true}
							suppressMoveWhenRowDragging={true}
							immutableData={true}
							onRowDragEnd={onReorderMessageStatusRowDragEnd}
							animateRows={true}
							onGridReady={onReorderMessageStatusGridReady}
							enableRangeSelection={true}
							getRowNodeId={geReorderMessageStatustRowNodeId}
							columnDefs={columnDefs}
						/>
					</div>
				</ContentContainer>
			</MainContainer>
			<ModalFooter style={{border: 0}}>
				<DefaultButton access={true} title={'Submit'} onClick={() => _dispatchReorderMessageStatusTransaction()} />
				<DefaultSecondaryButton access={true} title={'Close'} onClick={closeModal} />
			</ModalFooter>
		</FormModal>
	);
};

export default ReorderMessageStatus;

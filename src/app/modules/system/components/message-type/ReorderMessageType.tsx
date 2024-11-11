import {Guid} from 'guid-typescript';
import React, {useCallback, useEffect, useState} from 'react';
import {ModalFooter} from 'react-bootstrap-v5';
import {shallowEqual, useDispatch, useSelector} from 'react-redux';
import swal from 'sweetalert';
import {RootState} from '../../../../../setup';
import * as hubConnection from '../../../../../setup/hub/MessagingHub';
import {ContentContainer, DefaultButton, DefaultSecondaryButton, FormModal, MainContainer} from '../../../../custom-components';
import {MessageTypeListRequest, MessageTypeListResponse, MessageTypePostRequest} from '../../models';
import * as system from '../../redux/SystemRedux';
import {getMessageTypeList, sendGetMessageTypeList} from '../../redux/SystemService';
import useConstant from '../../../../constants/useConstant';
import {ReOrderCodelistGrid} from '../../shared/components/ReOrderCodelistGrid';

// -- INTERFACES -- //
interface Props {
	showForm: boolean;
	closeModal: () => void;
}

const ReorderMessageType: React.FC<Props> = ({showForm, closeModal}) => {
	// -----------------------------------------------------------------
	// GET REDUX STORE
	// -----------------------------------------------------------------
	const userAccessId = useSelector<RootState>(({auth}) => auth.userId, shallowEqual) as number;
	const systemData = useSelector<RootState>(({system}) => system.getMessageTypeList, shallowEqual) as any;
	const dispatch = useDispatch();
	const {SwalFailedMessage, SwalMessageTypeMessage, SwalServerErrorMessage, successResponse, HubConnected} = useConstant();

	// -----------------------------------------------------------------
	// VARIABLES
	// -----------------------------------------------------------------
	const messagingHub = hubConnection.createHubConnenction();

	// -----------------------------------------------------------------
	// STATES
	// -----------------------------------------------------------------
	const [rowData, setRowData] = useState<any>([]);
	const [gridApi, setGridApi] = useState<any>(null);

	// -----------------------------------------------------------------
	// MOUNTED
	// -----------------------------------------------------------------
	const onGridReadyMessageTypeReoder = (params: any) => {
		setGridApi(params.api);
		params.api.sizeColumnsToFit();
		setRowData(systemData);
	};

	// -----------------------------------------------------------------
	// WATCHERS
	// -----------------------------------------------------------------

	useEffect(() => {
		if (showForm === true) {
			getMessageTypeReoderList();
		}
	}, [showForm]);

	// -----------------------------------------------------------------
	// TABLE COMPONENTS
	// -----------------------------------------------------------------

	const renderReorderMessageTypeRowIndex = (_props: any) => <>{_props ? <div>{_props.rowIndex + 1}</div> : null}</>;

	// -- TABLE HEADERS AND COLUMNS --//
	const columnDefs = [
		{
			headerName: 'Order',
			field: 'position',
			rowDrag: true,
		},
		{headerName: 'Message Type Name', field: 'messageTypeName'},
	];

	// -----------------------------------------------------------------
	// METHODS
	// -----------------------------------------------------------------

	const onRowDragEndMessageTypeReorder = (event: any) => {
		const messageTypeReordermovingNode = event.node;
		const messageTypeReorderOverNode = event.overNode;
		const rowNeedsToMove = messageTypeReordermovingNode !== messageTypeReorderOverNode;

		if (rowNeedsToMove) {
			const movingDataMessageTypeReorder = messageTypeReordermovingNode.data;
			const overDataMessageTypeReorder = messageTypeReorderOverNode.data;

			const fromIndex = rowData.indexOf(movingDataMessageTypeReorder);
			const toIndex = rowData.indexOf(overDataMessageTypeReorder);
			const newStore = rowData.slice();

			messageTypeReorderMoveInArray(newStore, fromIndex, toIndex);
			gridApi.setRowData(newStore);
			gridApi.clearFocusedCell();
		}

		function messageTypeReorderMoveInArray(arr: any, fromIndex: number, toIndex: number) {
			const element = arr[fromIndex];
			arr.splice(fromIndex, 1);
			arr.splice(toIndex, 0, element);
			setRowData(arr);
		}
	};

	const getMessageTypeRowNodeId = useCallback(
		(params: any) => params.data.messageTypeId,
		[],
	  );

	const getMessageTypeReoderListGateway = () => {
		const _messageTypeReorderListRequest: MessageTypeListRequest = {
			queueId: Guid.create().toString(),
			userId: userAccessId.toString(),
			messageTypeName: '',
			messageTypeStatus: '',
		};

		sendGetMessageTypeList(_messageTypeReorderListRequest)
			.then((response) => {
				if (response.status === successResponse) {
					messagingHub.on(_messageTypeReorderListRequest.queueId.toString(), (message) => {
						getMessageTypeList(message.cacheId)
							.then((data) => {
								let resultData = Object.assign(new Array<MessageTypeListResponse>(), data.data);
								dispatch(system.actions.getMessageTypeList(resultData));
							})
							.catch(() => {
								swal(SwalFailedMessage.title, SwalMessageTypeMessage.textErrorMessageTypeList, SwalFailedMessage.icon);
							});
						messagingHub.off(_messageTypeReorderListRequest.queueId.toString());
						messagingHub.stop();
					});

					setTimeout(() => {
						if (messagingHub.state === HubConnected) {
							messagingHub.stop();
						}
					}, 30000);
				} else {
					messagingHub.stop();
					swal(SwalServerErrorMessage.title, response.data.message, SwalServerErrorMessage.icon);
				}
			})
			.catch(() => {
				messagingHub.stop();
				swal(SwalFailedMessage.title, SwalMessageTypeMessage.textErrorMessageTypeList, SwalFailedMessage.icon);
			});
	};

	const getMessageTypeReoderList = () => {
		setTimeout(() => {
			messagingHub
				.start()
				.then(() => {
					if (messagingHub.state === HubConnected) {
						getMessageTypeReoderListGateway();
					} else {
						swal(SwalServerErrorMessage.title, SwalServerErrorMessage.textError, SwalServerErrorMessage.icon);
					}
				})
				.catch((err) => console.log('Error while starting connection: ' + err));
		}, 1000);
	};

	const _dispatchTransactionMessageTypeReorder = () => {
		let updatedOrderTable = Array<MessageTypeListResponse>();
		let updateOrderPost = Array<MessageTypePostRequest>();

		rowData.forEach((item: MessageTypeListResponse, index: number) => {
			const tableData: MessageTypeListResponse = {
				messageTypeId: item.messageTypeId,
				messageTypeName: item.messageTypeName,
				messageTypeStatus: item.messageTypeStatus,
				messageChannelTypeName: item.messageChannelTypeName,
				channelTypeId: item.channelTypeId,
				messageGroupId: item.messageGroupId,
				messageGroupName: item.messageGroupName,
				position: index + 1,
			};
			updatedOrderTable.push(tableData);
		});

		dispatch(system.actions.getMessageTypeList(updatedOrderTable));

		rowData.forEach((tableItem: MessageTypeListResponse, index: number) => {
			const postRequest: MessageTypePostRequest = {
				id: tableItem.messageTypeId ?? 0,
				messageTypeName: tableItem.messageTypeName,
				codeListId: 3,
				position: index + 1,
				isActive: tableItem.messageTypeStatus,
				channelTypeId: tableItem.channelTypeId,
				messageGroupId: tableItem.messageGroupId,
				createdBy: userAccessId,
				updatedBy: userAccessId,
				action: 'REORDER',
			};
			updateOrderPost.push(postRequest);
		});

		dispatch(system.actions.postMessageTypeList(updateOrderPost));
	};

	return (
		<FormModal headerTitle={'Change Message Type'} haveFooter={false} show={showForm}>
			<MainContainer>
				<ContentContainer>
					<div className='ag-theme-quartz' style={{height: 400, width: '100%'}}>
						<ReOrderCodelistGrid
							rowData={rowData}
							rowDragManaged={true}
							suppressMoveWhenRowDragging={true}
							immutableData={true}
							onRowDragEnd={onRowDragEndMessageTypeReorder}
							animateRows={true}
							onGridReady={onGridReadyMessageTypeReoder}
							enableRangeSelection={true}
							getRowNodeId={getMessageTypeRowNodeId}
							columnDefs={columnDefs}
						/>
					</div>
				</ContentContainer>
				<ModalFooter style={{border: 0}}>
					<DefaultButton access={true} title={'Submit'} onClick={() => _dispatchTransactionMessageTypeReorder()} />
					<DefaultSecondaryButton access={true} title={'Close'} onClick={closeModal} />
				</ModalFooter>
			</MainContainer>
		</FormModal>
	);
};

export default ReorderMessageType;

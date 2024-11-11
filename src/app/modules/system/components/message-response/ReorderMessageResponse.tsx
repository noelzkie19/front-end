import {Guid} from 'guid-typescript';
import React, {useCallback, useEffect, useState} from 'react';
import {ModalFooter} from 'react-bootstrap-v5';
import {shallowEqual, useDispatch, useSelector} from 'react-redux';
import swal from 'sweetalert';
import {RootState} from '../../../../../setup';
import * as hubConnection from '../../../../../setup/hub/MessagingHub';
import {ContentContainer, DefaultButton, DefaultSecondaryButton, FormModal, MainContainer} from '../../../../custom-components';
import {MessageResponseList, MessageResponseStatuses} from '../../models';
import {GetMessageResponseList} from '../../models/requests/GetMessageResponseList';
import * as system from '../../redux/SystemRedux';
import {getMessageResponseList, sendGetMessageResponseList} from '../../redux/SystemService';
import useConstant from '../../../../constants/useConstant';
import {ReOrderCodelistGrid} from '../../shared/components/ReOrderCodelistGrid';

// -- INTERFACES -- //
interface Props {
	showForm: boolean;
	closeModal: () => void;
	messageStatusId: number;
}

const ReorderMessageResponse: React.FC<Props> = ({showForm, closeModal, messageStatusId}) => {
	// GET REDUX STORE
	const userAccessId = useSelector<RootState>(({auth}) => auth.userId, shallowEqual) as number;
	const systemData = useSelector<RootState>(({system}) => system.getMessageResponseList, shallowEqual) as any;

	const dispatch = useDispatch();
	const {successResponse, HubConnected, SwalFailedMessage, SwalServerErrorMessage, SwalMessageResponseMessage} = useConstant();
	const messagingHub = hubConnection.createHubConnenction();

	// STATES
	const [rowData, setRowData] = useState<any>([]);
	const [gridApi, setGridApi] = useState<any>(null);

	// MOUNTED
	const onReorderMessageResponseGridReady = (params: any) => {
		setGridApi(params.api);
		params.api.sizeColumnsToFit();
		setRowData(systemData);
	};

	useEffect(() => {
		if (showForm === true) {
			getReorderMessageResponseList();
		}
	}, [showForm]);

	const renderReorderMessageResponseAction = (_props: any) => (
		<>
			{_props
				? _props.data.messageResponseStatuses.map((messageResponseStatusesObj: MessageResponseStatuses) => (
						<div key={messageResponseStatusesObj.messageStatusId} style={{height: 'auto', whiteSpace: 'pre-wrap', overflowWrap: 'break-word'}}>
							{messageResponseStatusesObj.messageStatusId === messageStatusId ? null : messageResponseStatusesObj.messageStatusName}
						</div>
				  ))
				: null}
		</>
	);

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
		{headerName: 'Message Response Name', field: 'messageResponseName'},
		{
			headerName: 'Included To Message Status',
			field: 'messageResponseStatuses',
			autoHeight: true,
			cellRenderer: renderReorderMessageResponseAction,
		},
	];

	const onRowReorderMessageReponseDragEnd = (event: any) => {
		const movingNodeReorderMessageResponse = event.node;
		const overNodeMessageResponse = event.overNode;
		const rowNeedsToMoveReorderMessageResponse = movingNodeReorderMessageResponse !== overNodeMessageResponse;

		if (rowNeedsToMoveReorderMessageResponse) {
			const reorderMessageResponseMovingData = movingNodeReorderMessageResponse.data;
			const reoderMessageResponseOverData = overNodeMessageResponse.data;

			const fromIndexMessageResponse = rowData.indexOf(reorderMessageResponseMovingData);
			const toIndexMessageResponse = rowData.indexOf(reoderMessageResponseOverData);
			const newMessageResponseReorderStore = rowData.slice();

			messageResponseReordermoveInArray(newMessageResponseReorderStore, fromIndexMessageResponse, toIndexMessageResponse);
			gridApi.setRowData(newMessageResponseReorderStore);
			gridApi.clearFocusedCell();
		}

		function messageResponseReordermoveInArray(messageResponseArr: any, fromIndex: number, toIndex: number) {
			const element = messageResponseArr[fromIndex];
			messageResponseArr.splice(fromIndex, 1);
			messageResponseArr.splice(toIndex, 0, element);
			setRowData(messageResponseArr);
		}
	};

	const getReorderMessageResponseRowNodeId = useCallback(
		(params: any) => String(params.data.messageResponseId),
		[],
	  );

	const getReorderMessageResponseListGateway = (_request: GetMessageResponseList) => {
		sendGetMessageResponseList(_request)
			.then((response) => {
				// IF REQUEST IS SUCCESS THEN CONSUME CALLBACK API
				if (response.status === successResponse) {
					messagingHub.on(_request.queueId.toString(), (message) => {
						// CALLBACK API
						getMessageResponseList(message.cacheId)
							.then((data) => {
								let resultData = Object.assign(new Array<MessageResponseList>(), data.data);
								dispatch(system.actions.getMessageResponseList(resultData));
							})
							.catch(() => {
								swal(SwalFailedMessage.title, SwalMessageResponseMessage.textErrorMessageResponseList, SwalFailedMessage.icon);
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
					swal(SwalServerErrorMessage.title, response.data.message, SwalServerErrorMessage.icon);
				}
			})
			.catch(() => {
				messagingHub.stop();
				swal(SwalFailedMessage.title, SwalMessageResponseMessage.textErrorMessageResponseList, SwalFailedMessage.icon);
			});
	};

	const getReorderMessageResponseList = () => {
		setTimeout(() => {
			//FETCH TO API
			messagingHub
				.start()
				.then(() => {
					if (messagingHub.state === HubConnected) {
						const request: GetMessageResponseList = {
							queueId: Guid.create().toString(),
							userId: userAccessId.toString(),
							messageResponseName: '',
							messageResponseStatus: '',
							messageStatusIds: messageStatusId.toString(),
							messageStatusId: 0,
						};
						getReorderMessageResponseListGateway(request);
					} else {
						swal(SwalServerErrorMessage.title, SwalServerErrorMessage.textError, SwalServerErrorMessage.icon);
					}
				})
				.catch((err) => console.log('Error while starting connection: ' + err));
		}, 1000);
	};

	const _dispatchReorderMessageResponseTransaction = () => {
		let updatedOrder = Array<MessageResponseList>();

		// -- UPDATE POSITION GET POSITION BASED ON INDEX-- //
		rowData.forEach((item: MessageResponseList, index: number) => {
			const reorderMessageResponseObj: MessageResponseList = {
				messageResponseId: item.messageResponseId,
				messageResponseName: item.messageResponseName,
				messageStatusId: item.messageStatusId,
				position: index + 1,
				messageResponseStatus: item.messageResponseStatus,
				messageResponseStatuses: item.messageResponseStatuses,
				messageResponseTypes: item?.messageResponseTypes,
				action: 'REORDER',
			};
			updatedOrder.push(reorderMessageResponseObj);
		});
		dispatch(system.actions.getMessageResponseList(updatedOrder));
		dispatch(system.actions.postMessageResponseList(updatedOrder));
	};

	return (
		<FormModal headerTitle={'Change Order Message Response'} haveFooter={false} show={showForm}>
			<MainContainer>
				<ContentContainer>
					<div className='ag-theme-quartz' style={{height: 400, width: '100%'}}>
						<ReOrderCodelistGrid
							rowData={rowData}
							rowDragManaged={true}
							suppressMoveWhenRowDragging={true}
							immutableData={true}
							onRowDragEnd={onRowReorderMessageReponseDragEnd}
							animateRows={true}
							onGridReady={onReorderMessageResponseGridReady}
							enableRangeSelection={true}
							getRowNodeId={getReorderMessageResponseRowNodeId}
							columnDefs={columnDefs}
						/>
					</div>
				</ContentContainer>
			</MainContainer>

			<ModalFooter style={{border: 0}}>
				<DefaultButton access={true} title={'Submit'} onClick={() => _dispatchReorderMessageResponseTransaction()} />
				<DefaultSecondaryButton access={true} title={'Close'} onClick={closeModal} />
			</ModalFooter>
		</FormModal>
	);
};

export default ReorderMessageResponse;

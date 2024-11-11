import { Guid } from 'guid-typescript';
import React, { useCallback, useEffect, useState } from 'react';
import { ModalFooter } from 'react-bootstrap-v5';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import swal from 'sweetalert';
import { RootState } from '../../../../../setup';
import * as hubConnection from '../../../../../setup/hub/MessagingHub';
import useConstant from '../../../../constants/useConstant';
import { ContentContainer, DefaultButton, DefaultSecondaryButton, FormModal, MainContainer } from '../../../../custom-components';
import { FeedbackTypeFilterModel, FeedBackTypeResponse } from '../../models';
import * as system from '../../redux/SystemRedux';
import { getFeedbackCategoryListResult, getFeedbackTypeList } from '../../redux/SystemService';
import { ReOrderCodelistGrid } from '../../shared/components/ReOrderCodelistGrid';

// -- INTERFACES -- //
interface Props {
	showForm: boolean;
	closeModal: () => void;
}

const ReorderFeedBacktype: React.FC<Props> = ({showForm, closeModal}) => {
	// GET REDUX STORE
	const userAccessId = useSelector<RootState>(({auth}) => auth.userId, shallowEqual) as number;
	const systemData = useSelector<RootState>(({system}) => system.getFeedbackTypes, shallowEqual) as any;

	const dispatch = useDispatch();
	const {successResponse, HubConnected, SwalServerErrorMessage, SwalFailedMessage, SwalFeedbackMessage} = useConstant();
	const messagingHub = hubConnection.createHubConnenction();

	// STATES
	const [rowData, setRowData] = useState<any>([]);
	const [gridApi, setGridApi] = useState<any>(null);

	// MOUNTED
	const onGridReadyFeedbackType = (params: any) => {
		setGridApi(params.api);
		params.api.sizeColumnsToFit();
		setRowData(systemData);
	};

	// WATCHERS
	useEffect(() => {
		if (showForm === true) {
			getFeedbackTypeReorderList();
		}
	}, [showForm]);

	const renderReorderFeedbackTypeRowId = (_props: any) => <>{_props ? <div>{_props.rowIndex + 1}</div> : null}</>;

	// TABLE COMPONENTS
	const columnDefs = [
		{
			headerName: 'Order',
			field: 'position',
			rowDrag: true,
		},
		{headerName: 'Feedback Type Name', field: 'feedbackTypeName'},
	];

	// METHODS

	const onRowDragEndAfterFeedbackTypeReorder = (event: any) => {
		const feedbackTypeReorderMovingNode = event.node;
		const feedbackTypeReOrderOverNode = event.overNode;
		const feedbackTypeReorderRowNeedsToMove = feedbackTypeReorderMovingNode !== feedbackTypeReOrderOverNode;

		if (feedbackTypeReorderRowNeedsToMove) {
			const movingDataFeedbackTypeReorder = feedbackTypeReorderMovingNode.data;
			const overDataFeedbackTypeReorder = feedbackTypeReOrderOverNode.data;

			const fromIndex = rowData.indexOf(movingDataFeedbackTypeReorder);
			const toIndex = rowData.indexOf(overDataFeedbackTypeReorder);
			const newStore = rowData.slice();

			feedbackTypeReorderMoveInArray(newStore, fromIndex, toIndex);
			gridApi.setRowData(newStore);
			gridApi.clearFocusedCell();
		}

		function feedbackTypeReorderMoveInArray(arr: any, fromIndex: number, toIndex: number) {
			const element = arr[fromIndex];
			arr.splice(fromIndex, 1);
			arr.splice(toIndex, 0, element);
			setRowData(arr);
		}
	};

	const getFeedbackTypeReorderRowNodeId = useCallback(
		(params: any) => String(params.data.feedbackTypeId),
		[],
	  );

	const getFeedbackTypeReorderListCallback = (_cacheId: string) => {
		getFeedbackCategoryListResult(_cacheId)
			.then((data) => {
				let resultData = Object.assign(new Array<FeedBackTypeResponse>(), data.data);
				dispatch(system.actions.getFeedbackTypes(resultData));
			})
			.catch((err) => console.log('Error while starting connection: ' + err));
	};

	const getFeedbackTypeReorderList = () => {
		setTimeout(() => {
			messagingHub
				.start()
				.then(() => {
					if (messagingHub.state === HubConnected) {
						getFeedbackTypeReorderListGateway();
					} else {
						swal(SwalServerErrorMessage.title, SwalServerErrorMessage.textError, SwalServerErrorMessage.icon);
					}
				})
				.catch((err) => console.log('Error while starting connection: ' + err));
		}, 1000);
	};

	const _dispatchTransactionFeedbackTypeActions = () => {
		let updateOrderPost = Array<FeedBackTypeResponse>();

		rowData.forEach((item: FeedBackTypeResponse, index: number) => {
			const tableData: FeedBackTypeResponse = {
				codeListId: item.codeListId,
				codeListName: item.codeListName,
				feedbackTypeId: item.feedbackTypeId,
				feedbackTypeName: item.feedbackTypeName,
				feedbackTypeStatus: item.feedbackTypeStatus,
				position: index + 1,
				action: 'REORDER',
			};
			updateOrderPost.push(tableData);
		});

		// DISPATCH TOPIC TABLE REDUX
		dispatch(system.actions.getFeedbackTypes(updateOrderPost));
		dispatch(system.actions.postFeedbackTypes(updateOrderPost));
	};

	const getFeedbackTypeReorderListGateway = () => {
		const request: FeedbackTypeFilterModel = {
			userId: userAccessId.toString(),
			queueId: Guid.create().toString(),
			feedbackTypeName: null,
			feedbackTypeStatus: null,
		};

		getFeedbackTypeList(request)
			.then((response) => {
				if (response.status === successResponse) {
					messagingHub.on(request.queueId.toString(), (message) => {
						getFeedbackTypeReorderListCallback(message.cacheId);
						stopMessagingHub(request.queueId.toString())
					});

					setTimeout(() => {
						if (messagingHub.state === HubConnected) {
							messagingHub.stop();
						}
					}, 30000);
				} else {
					swal(SwalServerErrorMessage.title, response.data.message, SwalServerErrorMessage.icon);
					stopMessagingHub()
				}
			})
			.catch(() => {
				swal(SwalFailedMessage.title, SwalFeedbackMessage.textErrorFeedbackList('feedback type'), SwalFailedMessage.icon);
				stopMessagingHub()
			});
	};

	const stopMessagingHub = (queueId? : any) => {
		if(queueId) {
			messagingHub.off(queueId);
			messagingHub.stop();
		}
		else{
			messagingHub.stop();
		}
	}

	return (
		<FormModal headerTitle={'Change Order Feedback Type'} haveFooter={false} show={showForm}>
			<MainContainer>
				<ContentContainer>
					<div className='ag-theme-quartz' style={{height: 400, width: '100%'}}>
						<ReOrderCodelistGrid
							rowData={rowData}
							rowDragManaged={true}
							suppressMoveWhenRowDragging={true}
							immutableData={true}
							onRowDragEnd={onRowDragEndAfterFeedbackTypeReorder}
							animateRows={true}
							onGridReady={onGridReadyFeedbackType}
							enableRangeSelection={true}
							getRowNodeId={getFeedbackTypeReorderRowNodeId}
							columnDefs={columnDefs}
						/>
					</div>
				</ContentContainer>
			</MainContainer>

			<ModalFooter style={{border: 0}}>
				<DefaultButton access={true} title={'Submit'} onClick={() => _dispatchTransactionFeedbackTypeActions()} />
				<DefaultSecondaryButton access={true} title={'Close'} onClick={closeModal} />
			</ModalFooter>
		</FormModal>
	);
};

export default ReorderFeedBacktype;
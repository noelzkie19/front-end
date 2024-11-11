import {AgGridReact} from 'ag-grid-react';
import {Guid} from 'guid-typescript';
import React, {useEffect, useState} from 'react';
import {ModalFooter} from 'react-bootstrap-v5';
import {shallowEqual, useDispatch, useSelector} from 'react-redux';
import swal from 'sweetalert';
import {RootState} from '../../../../../setup';
import * as hubConnection from '../../../../../setup/hub/MessagingHub';
import {ContentContainer, DefaultPrimaryButton, DefaultSecondaryButton, FormModal, MainContainer} from '../../../../custom-components';
import {SubtopicPostModel, SubtopicRequestModel, SubtopicResponseModel} from '../../models';
import {SubtopicListResponseModel} from '../../models/response/SubtopicListResponseModel';
import * as system from '../../redux/SystemRedux';
import {getSubtopicListRequest, sendSubtopicListRequest} from '../../redux/SystemService';

// -- INTERFACES -- //
interface Props {
	showForm: boolean;
	closeModal: () => void;
	pageTopicId: number;
	codeListStatus: string;
}

const ReorderSubTopic: React.FC<Props> = ({showForm, closeModal, pageTopicId, codeListStatus}) => {
	// GET REDUX STORE
	const userAccess = useSelector<RootState>(({auth}) => auth.access, shallowEqual) as string;
	const subTopicData = useSelector<RootState>(({system}) => system.getSubtopicList, shallowEqual) as any;
	const subTopicPostData = useSelector<RootState>(({system}) => system.postSubTopic, shallowEqual) as any;
	const userAccessId = useSelector<RootState>(({auth}) => auth.userId, shallowEqual) as number;
	const dispatch = useDispatch();
	// VARIABLES
	const postedData = subTopicPostData ? subTopicPostData : [];
	// STATES
	const [rowData, setRowData] = useState<Array<SubtopicResponseModel> | any>([]);
	const [gridApi, setGridApi] = useState<any | null>(null);
	const [gridColumnApi, setGridColumnApi] = useState(null);
	const [loading, setLoading] = useState<boolean>(false);

	// MOUNTED
	const onGridReady = (params: any) => {
		setGridApi(params.api);
		setGridColumnApi(params.columnApi);
		params.api.sizeColumnsToFit();
		setRowData(subTopicData);
	};

	useEffect(() => {
		if (showForm === true) {
			_getSubtopicList('', '', '', '', '');
		}
	}, [showForm]);

	// TABLE COMPONENTS
	// -- TABLE HEADERS AND COLUMNS --//
	const columnDefs = [
		{
			headerName: 'Order',
			field: 'position',
			rowDrag: true,
			cellRenderer: (params: any) => <>{params ? <div>{params.rowIndex + 1}</div> : null}</>,
		},
		{headerName: 'Subtopic Name', field: 'subTopicName'},
	];

	// METHODS

	const _getSubtopicList = (subtopicName: string, status: string, topicIds: string, currencyIds: string, brandIds: string) => {
		setTimeout(() => {
			//FETCH TO API
			const messagingHub = hubConnection.createHubConnenction();
			messagingHub
				.start()
				.then(() => {
					// CHECKING STATE CONNECTION
					if (messagingHub.state === 'Connected') {
						// PARAMETER TO PASS ON API GATEWAY //
						const request: SubtopicRequestModel = {
							queueId: Guid.create().toString(),
							userId: userAccessId.toString(),
							subtopicName: null,
							status: codeListStatus,
							topicId: pageTopicId,
							topicIds: '',
							currencyIds: '',
							brandIds: '',
							caseTypeId: null,
							pageSize: 1000,
							offsetValue: 0,
							sortColumn: 'position',
							sortOrder: 'asc',
						};

						// REQUEST FIRST TO GATEWAY IF TRANSACTION WAS VALID
						sendSubtopicListRequest(request)
							.then((response) => {
								// IF REQUEST IS SUCCESS THEN CONSUME CALLBACK API
								if (response.status === 200) {
									messagingHub.on(request.queueId.toString(), (message) => {
										// --  CALLBACK API -- //
										getSubtopicListRequest(message.cacheId)
											.then((data) => {
												let resultData = Object.assign(new Array<SubtopicListResponseModel>(), data.data);

												dispatch(system.actions.getSubtopicList(resultData.subtopicList));
											})
											.catch(() => {
												setLoading(false);
											});
										messagingHub.off(request.queueId.toString());
										messagingHub.stop();
									});

									setTimeout(() => {
										if (messagingHub.state === 'Connected') {
											messagingHub.stop();
											setLoading(false);
										}
									}, 30000);
								} else {
									messagingHub.stop();
									swal('Failed', response.data.message, 'error');
								}
							})
							.catch(() => {
								messagingHub.stop();
								swal('Failed', 'Problem in getting topic list', 'error');
							});
					} else {
						swal('Failed', 'Problem connecting to the server, Please refresh', 'error');
					}
				})
				.catch((err) => console.log('Error while starting connection: ' + err));
		}, 1000);
	};

	const onRowDragEnd = (event: any) => {
		var movingNode = event.node;
		var overNode = event.overNode;
		var rowNeedsToMove = movingNode !== overNode;

		if (rowNeedsToMove) {
			var movingData = movingNode.data;
			var overData = overNode.data;

			var fromIndex = rowData.indexOf(movingData);
			var toIndex = rowData.indexOf(overData);
			var newStore = rowData.slice();

			moveInArray(newStore, fromIndex, toIndex);
			gridApi.setRowData(newStore);
			gridApi.clearFocusedCell();
		}

		function moveInArray(arr: any, fromIndex: number, toIndex: number) {
			var element = arr[fromIndex];
			arr.splice(fromIndex, 1);
			arr.splice(toIndex, 0, element);
			setRowData(arr);
		}
	};

	const getRowNodeId = (data: any) => {
		return data.id;
	};

	const _dispatchTransaction = () => {
		let updatedSubtopicOrder = Array<SubtopicResponseModel>();
		let updatePostSubtopicOrder = Array<SubtopicPostModel>();

		// -- UPDATE POSITION GET POSITION BASED ON INDEX-- //
		rowData.forEach((item: SubtopicResponseModel, index: any) => {
			const x: SubtopicResponseModel = {
				id: item.id,
				subTopicName: item.subTopicName,
				isActive: item.isActive,
				position: index + 1,
				topicId: item.topicId,
				brand: item.brand,
				currency: item.currency,
				topic: item.topic,
			};
			updatedSubtopicOrder.push(x);
		});

		// -- UPDATE POSITION ON POST -- //
		rowData.forEach((item: SubtopicPostModel, index: any) => {
			const x: SubtopicPostModel = {
				id: item.id,
				subTopicName: item.subTopicName,
				isActive: item.isActive,
				position: index + 1,
				topicId: item.topicId,
				brand: item.brand,
				currency: item.currency,
				topic: item.topic,
			};
			updatePostSubtopicOrder.push(x);
		});

		dispatch(system.actions.postSubTopic(updatePostSubtopicOrder));
		dispatch(system.actions.getSubtopicList([])); //TODO
	};

	return (
		<FormModal headerTitle={'Change order Subtopic'} haveFooter={false} show={showForm}>
			<MainContainer>
				<ContentContainer>
					<div className='ag-theme-quartz' style={{height: 400, width: '100%'}}>
						<AgGridReact
							rowData={rowData}
							rowDragManaged={true}
							suppressMoveWhenRowDragging={true}
							onRowDragEnd={onRowDragEnd}
							animateRows={true}
							onGridReady={onGridReady}
							//enableRangeSelection={true} //deprecated in AgGridReactver.32.0.0
							getRowId={getRowNodeId}
							columnDefs={columnDefs}
						/>
					</div>
				</ContentContainer>
			</MainContainer>

			<ModalFooter style={{border: 0}}>
				<DefaultPrimaryButton access={true} title={'Submit'} onClick={() => _dispatchTransaction()} />
				<DefaultSecondaryButton access={true} title={'Close'} onClick={closeModal} />
			</ModalFooter>
		</FormModal>
	);
};

export default ReorderSubTopic;

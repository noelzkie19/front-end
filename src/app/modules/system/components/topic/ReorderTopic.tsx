import {AgGridReact} from 'ag-grid-react';
import {Guid} from 'guid-typescript';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {ModalFooter} from 'react-bootstrap-v5';
import {shallowEqual, useSelector} from 'react-redux';
import swal from 'sweetalert';
import {RootState} from '../../../../../setup';
import * as hubConnection from '../../../../../setup/hub/MessagingHub';
import {ElementStyle} from '../../../../constants/Constants';
import useConstant from '../../../../constants/useConstant';
import {ContentContainer, FormModal, MainContainer, MlabButton} from '../../../../custom-components';
import {IAuthState} from '../../../auth';
import {USER_CLAIMS} from '../../../user-management/components/constants/UserClaims';
import {GetTopicOrderResponseModel, TopicRequestModel, UpdateTopicOrderRequestModel} from '../../models';
import {SendGetTopicOrder, SendUpdateTopicOrder} from '../../redux/SystemService';
import { ColDef, ColGroupDef } from 'ag-grid-community';

// -- INTERFACES -- //
interface Props {
	showForm: boolean;
	topicFilter?: TopicRequestModel;
	setModalReorderShow: (e: boolean) => void;
	searchTopicList: () => void;
}

const ReorderTopic: React.FC<Props> = (Props) => {
	let {showForm, setModalReorderShow, searchTopicList} = Props;

	/**
	 *  ? Redux
	 */
	const {access, userId} = useSelector<RootState>(({auth}) => auth, shallowEqual) as IAuthState;

	/**
	 *  ? Constant
	 */
	const {successResponse, HubConnected} = useConstant();
	const gridRef: any = useRef();

	/**
	 *  ? States
	 */
	const [rowData, setRowData] = useState<Array<GetTopicOrderResponseModel>>([]);
	const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

	/**
	 *  ? Mounted
	 */
	const onReorderTopicGridReady = (params: any) => {
		params.api.sizeColumnsToFit();
	};

	useEffect(() => {
		if (showForm === true) {
			_getReoderTopicList();
		}
	}, [showForm]);

	/**
	 *  ? Methods
	 */
	const onReorderTopicRowDragEnd = (event: any) => {
		let movingNode = event.node;
		let overNode = event.overNode;
		let rowNeedsToMove = movingNode !== overNode;

		if (rowNeedsToMove) {
			switchPositionsFromTo(movingNode.data, overNode.data);
		}
	};

	const switchPositionsFromTo = (fromData: GetTopicOrderResponseModel, toData: GetTopicOrderResponseModel) => {
		let requestFromRow: GetTopicOrderResponseModel = {
			topicId: fromData.topicId,
			topicName: fromData.topicName,
			position: toData.position,
			caseTypeName: fromData.caseTypeName,
			topicStatus: fromData.topicStatus,
		};

		let requestToRow: GetTopicOrderResponseModel = {
			topicId: toData.topicId,
			topicName: toData.topicName,
			position: fromData.position,
			caseTypeName: toData.caseTypeName,
			topicStatus: toData.topicStatus,
		};

		// // -- display purposes
		let filterData = rowData.filter((x) => x.topicId !== toData.topicId && x.topicId !== fromData.topicId);
		let combinedData = [...filterData, requestFromRow, requestToRow];
		let sortedDataByPositionNumber = sortDataByPosition(combinedData);
		setRowData(sortedDataByPositionNumber);
	};

	function sortDataByPosition(_dataToSort: GetTopicOrderResponseModel[]) {
		let sortedData = Object.assign(_dataToSort, {}).sort((a: any, b: any) => a.position - b.position);
		return sortedData;
	}

	const getReorderTopicRowNodeId = useCallback(
		(params: any) => String(params.data.topicId),
		[],
	  );

	/**
	 *  ? Api Method
	 */

	const _getReoderTopicList = () => {
		SendGetTopicOrder()
			.then((response) => {
				if (response.status === successResponse) {
					setRowData(response.data);
				} else {
					console.log('Problem in getting post chat survey lookups');
				}
			})
			.catch(() => {
				console.log('Problem in getting post chat survey lookups');
			});
	};

	const submitUpdateTopicOrderResultAction = (_statusReposponse: number) => {
		if (_statusReposponse === successResponse) {
			swal('Success', 'Transaction successfully submitted', 'success')
				.then((onSuccess) => {
					if (onSuccess) {
						setModalReorderShow(false);
						setIsSubmitting(false);
						searchTopicList();
					}
				})
				.catch(() => {});
		} else {
			swal('Failed', 'Problem connecting to the server, Please refresh', 'error').catch(() => {});
			setIsSubmitting(false);
		}
	};

	async function submitUpdateOrderRequest() {
		const request: UpdateTopicOrderRequestModel = {
			queueId: Guid.create().toString(),
			topicOrderType: rowData.map((tOt) => {
				return {
					topicId: tOt.topicId,
					position: tOt.position,
				};
			}),
			userId: userId?.toString() ?? '0',
		};

		return request;
	}

	const submitUpdateOrder = () => {
		setIsSubmitting(true);
		setTimeout(() => {
			const messagingHub = hubConnection.createHubConnenction();
			messagingHub
				.start()
				.then(async () => {
					if (messagingHub.state === HubConnected) {
						let reorderRequest = await submitUpdateOrderRequest();

						SendUpdateTopicOrder(reorderRequest)
							.then((response) => {
								if (response.status === successResponse) {
									messagingHub.on(reorderRequest.queueId.toString(), (message) => {
										let resultData = JSON.parse(message.remarks);
										submitUpdateTopicOrderResultAction(resultData.Status);
										messagingHub.off(reorderRequest.queueId.toString());
										messagingHub.stop().catch(() => {});
									});
								}
							})
							.catch(() => {
								messagingHub.stop().catch(() => {});
								swal('Failed', 'Problem in Connection on Gateway', 'error').catch(() => {});
								setIsSubmitting(false);
							});
					}
				})
				.catch((err) => console.log('Error while starting connection: ' + err));
		}, 1000);
	};

	const closeReorderTopic = () => {
		swal({
			title: 'Confirmation',
			text: 'Any changes will be discarded, please confirm',
			icon: 'warning',
			buttons: ['No', 'Yes'],
			dangerMode: true,
		})
			.then((willUpdate) => {
				if (willUpdate) {
					setModalReorderShow(false);
					searchTopicList();
				}
			})
			.catch(() => {});
	};

	const confirmReorderTopic = () => {
		swal({
			title: 'Confirmation',
			text: 'This action will save the changes made. Please confirm',
			icon: 'warning',
			buttons: ['No', 'Yes'],
			dangerMode: true,
		})
			.then((willUpdate) => {
				if (willUpdate) {
					submitUpdateOrder();
				}
			})
			.catch(() => {});
	};

	/**
	 *  Table and Headers
	 */
	const reorderTopicColumnDefs: (ColDef<GetTopicOrderResponseModel> | ColGroupDef<GetTopicOrderResponseModel>)[] =  [
		{
			headerName: 'Order',
			field: 'position',
			rowDrag: true,
		},
		{headerName: 'Case Type', field: 'caseTypeName'},
		{headerName: 'Topic Name', field: 'topicName'},
		{headerName: 'Status', field: 'topicStatus'},
	];

	return (
		<FormModal headerTitle={'Change order Topic'} haveFooter={false} show={showForm}>
			<MainContainer>
				<ContentContainer>
					<div className='ag-theme-quartz' style={{height: 400, width: '100%'}}>
						<AgGridReact
							rowData={rowData}
							rowDragManaged={true}
							suppressMoveWhenRowDragging={true}
							onRowDragEnd={onReorderTopicRowDragEnd}
							animateRows={true}
							onGridReady={onReorderTopicGridReady}
							//enableRangeSelection={true} //deprecated in AgGridReactver.32.0.0
							getRowId={getReorderTopicRowNodeId}
							columnDefs={reorderTopicColumnDefs}
							ref={gridRef}
						/>
					</div>
				</ContentContainer>
			</MainContainer>

			<ModalFooter style={{border: 0}}>
				<MlabButton
					access={access?.includes(USER_CLAIMS.TopicWrite)}
					size={'sm'}
					label={'Submit'}
					style={ElementStyle.primary}
					type={'button'}
					weight={'solid'}
					loading={isSubmitting}
					disabled={isSubmitting}
					loadingTitle={' Please wait...'}
					onClick={confirmReorderTopic}
				/>
				<MlabButton
					access={access?.includes(USER_CLAIMS.TopicRead)}
					size={'sm'}
					label={'Close'}
					style={ElementStyle.secondary}
					type={'button'}
					weight={'solid'}
					loading={isSubmitting}
					disabled={isSubmitting}
					loadingTitle={' Please wait...'}
					onClick={closeReorderTopic}
				/>
			</ModalFooter>
		</FormModal>
	);
};

export default ReorderTopic;

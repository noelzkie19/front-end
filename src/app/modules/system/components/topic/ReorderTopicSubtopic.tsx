import React, {useCallback, useEffect, useRef, useState} from 'react';
import {ModalFooter} from 'react-bootstrap-v5';
import {shallowEqual, useSelector} from 'react-redux';
import {RootState} from '../../../../../setup';
import {ElementStyle} from '../../../../constants/Constants';
import {ContentContainer, FormModal, MainContainer, MlabButton} from '../../../../custom-components';
import {IAuthState} from '../../../auth';
import {USER_CLAIMS} from '../../../user-management/components/constants/UserClaims';
import swal from 'sweetalert';
import {SendGetSubtopicOrder, SendUpdateSubtopicOrder} from '../../redux/SystemService';
import {GetSubtopicOrderUdtViewModel, UpdateSubtopicOrderRequestModel} from '../../models';
import useConstant from '../../../../constants/useConstant';
import {AgGridReact} from 'ag-grid-react';
import {Guid} from 'guid-typescript';
import * as hubConnection from '../../../../../setup/hub/MessagingHub';
import { ColDef, ColGroupDef } from 'ag-grid-community';

interface Props {
	showForm: boolean;
	setModalReorderSubtopicShow: (e: boolean) => void;
	topicId: number;
}

const ReorderTopicSubtopic: React.FC<Props> = ({showForm, setModalReorderSubtopicShow, topicId}) => {
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
	const [rowData, setRowData] = useState<Array<GetSubtopicOrderUdtViewModel>>([]);
	const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

	/**
	 *  ? Mounted
	 */
	useEffect(() => {
		if (showForm === true) {
			_getSubTopicList();
		} else {
			setRowData([]);
		}
	}, [showForm]);

	const onGridReady = (params: any) => {
		params.api.sizeColumnsToFit();
	};

	/**
	 *  ? Api Methods
	 */
	const _getSubTopicList = () => {
		SendGetSubtopicOrder(topicId)
			.then((response) => {
				if (response.status === successResponse) {
					setRowData(response.data);
				} else {
					console.log('Problem in getting post chat survey lookups');
				}
			})
			.catch(() => {
				//disableSplashScreen()
				console.log('Problem in getting post chat survey lookups');
			});
	};

	/**
	 *  ? Methods
	 */

	const onRowDragEnd = (event: any) => {
		let movingNode = event.node;
		let overNode = event.overNode;
		let rowNeedsToMove = movingNode !== overNode;

		if (rowNeedsToMove) {
			switchPositionsFromTo(movingNode.data, overNode.data);
		}
	};

	const switchPositionsFromTo = (fromData: GetSubtopicOrderUdtViewModel, toData: GetSubtopicOrderUdtViewModel) => {
		let requestFromRow: GetSubtopicOrderUdtViewModel = {
			subtopicId: fromData.subtopicId,
			isActive: fromData.isActive,
			position: toData.position,
			statusName: fromData.statusName,
			subtopicName: fromData.subtopicName,
			topicId: fromData.topicId,
			topicName: fromData.topicName,
		};

		let requestToRow: GetSubtopicOrderUdtViewModel = {
			subtopicId: toData.subtopicId,
			isActive: toData.isActive,
			position: fromData.position,
			statusName: toData.statusName,
			subtopicName: toData.subtopicName,
			topicId: toData.topicId,
			topicName: toData.topicName,
		};

		// // -- display purposes
		let filterData = rowData.filter((x) => x.subtopicId !== toData.subtopicId && x.subtopicId !== fromData.subtopicId);
		let combinedData = [...filterData, requestFromRow, requestToRow].sort((a, b) => a.position - b.position);
		setRowData([...combinedData]);
	};

	const confirmReorderSubTopic = () => {
		swal({
			title: 'Confirmation',
			text: 'This action will save the changes made. Please confirm',
			icon: 'warning',
			buttons: ['No', 'Yes'],
			dangerMode: true,
		})
			.then((willUpdate) => {
				if (willUpdate) {
					submitReorderSubtopic();
				}
			})
			.catch(() => {});
	};

	async function submitReoderRequest() {
		const request: UpdateSubtopicOrderRequestModel = {
			queueId: Guid.create().toString(),
			userId: userId?.toString() ?? '0',
			subtopicOrderType: rowData.map((x, index) => {
				return {
					subtopicId: x.subtopicId,
					topicId: x.topicId,
					position: x.position,
				};
			}),
		};

		return request;
	}

	const submitReorderSubtopicResultAction = (_reOderSubtopicResponse: number) => {
		if (_reOderSubtopicResponse === successResponse) {
			swal('Success', 'Transaction successfully submitted', 'success')
				.then((onSuccess) => {
					if (onSuccess) {
						setModalReorderSubtopicShow(false);
						setIsSubmitting(false);
					}
				})
				.catch(() => {});
		} else {
			swal('Failed', 'Problem connecting to the server, Please refresh', 'error').catch(() => {});
			setIsSubmitting(false);
		}
	};

	const submitReorderSubtopic = () => {
		setIsSubmitting(true);
		setTimeout(() => {
			const messagingHub = hubConnection.createHubConnenction();
			messagingHub
				.start()
				.then(async () => {
					if (messagingHub.state === HubConnected) {
						let reorderSubtopicRequest = await submitReoderRequest();

						SendUpdateSubtopicOrder(reorderSubtopicRequest)
							.then((response) => {
								if (response.status === successResponse) {
									messagingHub.on(reorderSubtopicRequest.queueId.toString(), (message) => {
										let resultData = JSON.parse(message.remarks);
										submitReorderSubtopicResultAction(resultData.Status);
										messagingHub.off(reorderSubtopicRequest.queueId.toString());
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

	const getRowNodeId = useCallback(
		(params: any) => String(params.data.subtopicId),
		[],
	  );

	const closeReorderSubtopic = () => {
		swal({
			title: 'Confirmation',
			text: 'Any changes will be discarded, please confirm',
			icon: 'warning',
			buttons: ['No', 'Yes'],
			dangerMode: true,
		})
			.then((willUpdate) => {
				if (willUpdate) {
					setRowData([]);
					setModalReorderSubtopicShow(false);
				}
			})
			.catch(() => {});
	};

	/**
	 *  Table and Headers
	 */
	const columnDefs: (ColDef<GetSubtopicOrderUdtViewModel> | ColGroupDef<GetSubtopicOrderUdtViewModel>)[] =  [
		{
			headerName: 'Order',
			field: 'position',
			rowDrag: true,
		},
		{headerName: 'Subtopic Name', field: 'subtopicName'},
		{headerName: 'Status', field: 'statusName'},
		{headerName: 'Topic', field: 'topicName'},
	];

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
							ref={gridRef}
						/>
					</div>
				</ContentContainer>
			</MainContainer>

			<ModalFooter style={{border: 0}}>
				<MlabButton
					access={access?.includes(USER_CLAIMS.SubtopicWrite)}
					size={'sm'}
					label={'Submit'}
					style={ElementStyle.primary}
					type={'button'}
					weight={'solid'}
					loading={isSubmitting}
					disabled={isSubmitting}
					loadingTitle={' Please wait...'}
					onClick={confirmReorderSubTopic}
				/>
				<MlabButton
					access={access?.includes(USER_CLAIMS.SubtopicRead)}
					size={'sm'}
					label={'Close'}
					style={ElementStyle.secondary}
					type={'button'}
					weight={'solid'}
					loading={isSubmitting}
					disabled={isSubmitting}
					loadingTitle={' Please wait...'}
					onClick={closeReorderSubtopic}
				/>
			</ModalFooter>
		</FormModal>
	);
};

export default ReorderTopicSubtopic;

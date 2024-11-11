import {AgGridReact} from 'ag-grid-react';
import {useFormik} from 'formik';
import React, {useEffect, useState} from 'react';
import {ModalFooter} from 'react-bootstrap-v5';
import {shallowEqual, useDispatch, useSelector} from 'react-redux';
import {useHistory} from 'react-router-dom';
import swal from 'sweetalert';
import {RootState} from '../../../../../setup';
import * as hubConnection from '../../../../../setup/hub/MessagingHub';
import * as InternetConnectionHandler from '../../../../../setup/internet-connection/InternetConnectionHandler';
import * as sessionHandler from '../../../../../setup/session/SessionHandler';
import {ContentContainer, DefaultPrimaryButton, DefaultSecondaryButton, FormContainer, FormModal, MainContainer} from '../../../../custom-components';
import {USER_CLAIMS} from '../../../user-management/components/constants/UserClaims';
import * as campaignSetting from '../../redux/AutoTaggingRedux';
import {TaggingConfigurationModel} from '../models/TaggingConfigurationModel';

interface Props {
	showForm: boolean;
	closeModal: () => void;
	showHeader?: boolean;
	modalAction: string;
}

const initialValues = {
	taggingConfigurationList: Array<TaggingConfigurationModel>(),
};

const AutoTaggingPriority: React.FC<Props> = ({showForm, closeModal}) => {
	//  Get redux store
	const userAccess = useSelector<RootState>(({auth}) => auth.access, shallowEqual) as string;
	const postData = useSelector<RootState>(({system}) => system.postMessageResponseList, shallowEqual) as any;
	const userAccessId = useSelector<RootState>(({auth}) => auth.userId, shallowEqual) as number;
	const expiresIn = useSelector<RootState>(({auth}) => auth.expiresIn, shallowEqual) as string;
	const history = useHistory();
	const messagingHub = hubConnection.createHubConnenction();
	const dispatch = useDispatch();

	const getTaggingConfigListState = useSelector<RootState>(
		({campaignSetting}) => campaignSetting.getTaggingConfigByList,
		shallowEqual
	) as TaggingConfigurationModel[];

	const [modalSize, setModalSize] = useState('md');
	const [rowData, setRowData] = useState<Array<TaggingConfigurationModel> | any>([]);

	const [gridApi, setGridApi] = useState<any | null>(null);
	const [gridColumnApi, setGridColumnApi] = useState(null);

	useEffect(() => {
		setRowData(getTaggingConfigListState);
	}, [showForm]);

	const closeModalForm = () => {
		swal({
			title: 'Confirmation',
			text: 'Any changes will be discarded, please confirm',
			icon: 'warning',
			buttons: ['No', 'Yes'],
			dangerMode: true,
		}).then((willClose) => {
			if (willClose) {
				closeModal();
			}
		});
	};

	// table content
	const columnDefs = [
		{
			headerName: 'Priority',
			field: 'priorityNumber',
			rowDrag: true,
			width: 100,
			autoWidth: true,
			cellRenderer: (params: any) => <>{params ? <div>{params.rowIndex + 1}</div> : null}</>,
		},
		{headerName: 'Configuration Name', field: 'taggingConfigurationName'},
	];

	const dispatchTransaction = () => {
		let updatedTopicOrder = Array<TaggingConfigurationModel>();

		// -- UPDATE POSITION GET POSITION BASED ON INDEX-- //
		rowData.forEach((item: TaggingConfigurationModel, index: number) => {
			const x: TaggingConfigurationModel = {
				taggingConfigurationId: item.taggingConfigurationId,
				taggingConfigurationName: item.taggingConfigurationName,
				campaignSettingId: item.campaignSettingId,
				segmentName: item.segmentName,
				priorityNumber: index + 1,
				segmentId: item.segmentId,
				action: 'REORDER',
			};
			updatedTopicOrder.push(x);
		});
		dispatch(campaignSetting.actions.getTaggingConfigByList(updatedTopicOrder));
		closeModal();
	};

	const onRowDragEnd = (event: any) => {
		var movingNode = event.node;
		var overNode = event.overNode;
		var rowNeedsToMove = movingNode !== overNode;

		if (rowNeedsToMove) {
			var movingData = movingNode.data;
			var overData = overNode == undefined ? 1 : overNode.data;

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

	useEffect(() => {
		if (showForm === true) {
			setRowData(
				getTaggingConfigListState.sort((s: any, t: any) => {
					return parseInt(s.priorityNumber) - parseInt(t.priorityNumber);
				})
			);
		}
	}, [showForm]);

	const getRowNodeId = (data: any) => {
		return data.priorityNumber;
	};

	const onGridReady = (params: any) => {
		setGridApi(params.api);
		setGridColumnApi(params.columnApi);
		params.api.sizeColumnsToFit();
		setRowData(getTaggingConfigListState);
	};

	const formik = useFormik({
		initialValues,
		onSubmit: () => {
			if (InternetConnectionHandler.isSlowConnection(history) === true) {
				return;
			}
			if (sessionHandler.isSessionExpired(expiresIn, history) === true) {
				return;
			}
		},
	});

	return (
		<FormModal customSize={modalSize} headerTitle={'Change Auto Tagging Configuration Priority'} haveFooter={false} show={showForm}>
			<FormContainer onSubmit={formik.handleSubmit}>
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
								//enableRangeSelection={true} //deprecated in AgGridReactv32.0.0
								getRowId={getRowNodeId}
								columnDefs={columnDefs}
							/>
						</div>
					</ContentContainer>
				</MainContainer>
				<ModalFooter style={{border: 0, float: 'right'}}>
					<DefaultPrimaryButton
						title={'Submit'}
						access={userAccess.includes(USER_CLAIMS.UpdateAutoTaggingWrite)}
						isDisable={false}
						onClick={() => dispatchTransaction()}
					/>
					<DefaultSecondaryButton
						access={userAccess.includes(USER_CLAIMS.UpdateAutoTaggingRead)}
						title={'Close'}
						onClick={closeModalForm}
						isDisable={false}
					/>
				</ModalFooter>
			</FormContainer>
		</FormModal>
	);
};

export default AutoTaggingPriority;

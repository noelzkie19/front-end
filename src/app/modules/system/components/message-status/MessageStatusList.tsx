import {AgGridReact} from 'ag-grid-react';
import {useFormik} from 'formik';
import {Guid} from 'guid-typescript';
import React, {useEffect, useState} from 'react';
import {ButtonGroup, Col, Row} from 'react-bootstrap-v5';
import {shallowEqual, useDispatch, useSelector} from 'react-redux';
import {useHistory, useParams} from 'react-router-dom';
import Select from 'react-select';
import swal from 'sweetalert';
import {RootState} from '../../../../../setup';
import * as hubConnection from '../../../../../setup/hub/MessagingHub';
import {ElementStyle} from '../../../../constants/Constants';
import useConstant from '../../../../constants/useConstant';
import {
	BasicTextInput,
	ButtonsContainer,
	ContentContainer,
	DefaultSecondaryButton,
	DefaultTableButton,
	FieldContainer,
	FieldLabel,
	FooterContainer,
	FormHeader,
	MainContainer,
	MlabButton,
	PaddedContainer,
} from '../../../../custom-components';
import {IAuthState} from '../../../auth';
import {USER_CLAIMS} from '../../../user-management/components/constants/UserClaims';
import {AddMessageStatusRequest, MessageStatusPostRequest, MessageStatusTypesModel, OptionsSelectedModel} from '../../models';
import {GetMessageStatusListRequest} from '../../models/requests/GetMessageStatusListRequest';
import {GetMessageStatusListResponse} from '../../models/response/GetMessageStatusListResponse';
import * as system from '../../redux/SystemRedux';
import {getMessageStatusList, sendAddMessageStatusList, sendGetMessageStatusList} from '../../redux/SystemService';
import {useSystemOptionHooks} from '../../shared';
import {SystemCodeListHeader} from '../../shared/components';
import '../sub-topic/SubTopic.css';
import CreateMessageStatus from './CreateMessageStatus';
import ReorderMessageStatus from './ReorderMessageStatus';
import EditMessageStatus from './EditMessageStatus';
import { ColDef, ColGroupDef } from 'ag-grid-community';

const initialValues = {
	messageStatusName: '',
};

const MessageStatusList: React.FC = () => {
	/**
	 *  ? Redux
	 */
	const systemData = useSelector<RootState>(({system}) => system.getMessageStatusList, shallowEqual) as any;
	const postData = useSelector<RootState>(({system}) => system.postMessageStatusList, shallowEqual) as any;
	const {access, userId} = useSelector<RootState>(({auth}) => auth, shallowEqual) as IAuthState;
	const messagingHub = hubConnection.createHubConnenction();
	const {getMessageTypeOptionList, messageTypeOptionList} = useSystemOptionHooks();

	let messageStatusStatusOption = [
		{value: '1', label: 'Active'},
		{value: '2', label: 'Inactive'},
	];

	/**
	 *  ? Variables // Trigger sonarcloud
	 */
	const dispatch = useDispatch();
	const {
		SwalFailedMessage,
		SwalServerErrorMessage,
		SwalMessageTypeMessage,
		SwalMessageStatusMessage,
		SwalSuccessMessage,
		HubConnected,
		successResponse,
	} = useConstant();
	const history = useHistory();
	let userIdOnInt = userId ? parseInt(userId) : 0;

	/**
	 *  ? Hooks
	 */
	const {getSystemCodelist, codeListInfo} = useSystemOptionHooks();
	const {messageTypeParentId} = useParams();

	/**
	 *  ? States
	 */
	const [selectedStatuses, setSelectedStatuses] = useState<any>('');
	const [selectedMessageType, setSelectedMessageType] = useState<any>('');
	const [modalShow, setModalShow] = useState<boolean>(false);
	const [modalReorderShow, setModalReorderShow] = useState<boolean>(false);
	const [gridApi, setGridApi] = useState<any>(null);
	const [rowData, setRowData] = useState<Array<GetMessageStatusListResponse>>([]);
	const [modalEditShow, setModalEditShow] = useState<boolean>(false);
	const [dataId, setDataId] = useState<number>(0);
	const [messageStatusName, setMessageStatusName] = useState<string>('');
	const [isMessageStatusListLoading, setIsMessageStatusListLoading] = useState<boolean>(false);

	useEffect(() => {
		getSystemCodelist(4);
		_clearMessageStatisListReduxStorage();
		_getMessageStatusList('', '', '');
		getMessageTypeOptionList('');
	}, []);

	useEffect(() => {
		setRowData(systemData);
	}, [systemData]);

	useEffect(() => {
		setModalShow(false);
		setModalReorderShow(false);
		setRowData(systemData);
		setModalEditShow(false);
	}, [postData]);

	const onGridReady = (params: any) => {
		setGridApi(params.api);
		params.api.paginationGoToPage(4);
		setRowData(systemData);
		params.api.sizeColumnsToFit();
	};

	const _clearMessageStatisListReduxStorage = () => {
		dispatch(system.actions.getMessageStatusList([]));
		dispatch(system.actions.postMessageStatusList([]));
	};

	/**
	 *  ? Formik Form
	 */
	const formik = useFormik({
		initialValues,
		onSubmit: (values, {setStatus, setSubmitting, resetForm}) => {
			setSubmitting(true);

			// -- CHECK IF THERE IS PENDING ACTION NEED TO BE POST -- //
			const isProcced = _checkMessageStatusTransaction('SEARCH');

			let selectedStatus: string = Object.assign(Array<OptionsSelectedModel>(), selectedStatuses)
				.map((el: any) => el.value)
				.join(',');
			let selectedMessageTypes: string = Object.assign(Array<OptionsSelectedModel>(), selectedMessageType)
				.map((el: any) => el.value)
				.join(',');

			let poststatus: string = '';

			if (selectedStatus.toString() === '1') {
				poststatus = 'true';
			} else if (selectedStatus.toString() === '2') {
				poststatus = 'false';
			} else {
				poststatus = '';
			}

			if (isProcced) {
				// CLEAN FIRST REDUX STORAGE
				_clearMessageStatisListReduxStorage();
				_getMessageStatusList(messageStatusName, poststatus, selectedMessageTypes);
			} else {
				swal({
					title: 'Confirmation',
					text: 'Any changes will be discarded, please confirm',
					icon: 'warning',
					buttons: ['No', 'Yes'],
					dangerMode: true,
				}).then((willUpdate) => {
					if (willUpdate) {
						_getMessageStatusList(messageStatusName, poststatus, selectedMessageTypes);
					}
				});
			}

			//resetForm()
			setSubmitting(false);
		},
	});

	/**
	 *  ? API Methods
	 */

	/**
	 *  ? Events
	 */

	const onChangeSelectedStatues = (val: string) => {
		setSelectedStatuses(val);
	};
	const onChangeSelectedMessageTypes = (val: string) => {
		setSelectedMessageType(val);
	};

	const onPageSizeChanged = () => {
		const pageSize: any = document.getElementById('page-size');
		gridApi.paginationSetPageSize(Number(pageSize.value));
	};

	const _getMessageStatusListGateway = (_request: GetMessageStatusListRequest) => {
		sendGetMessageStatusList(_request)
			.then((response) => {
				if (response.status === successResponse) {
					messagingHub.on(_request.queueId.toString(), (message) => {
						getMessageStatusList(message.cacheId)
							.then((data) => {
								let resultData = Object.assign(new Array<GetMessageStatusListResponse>(), data.data);
								_clearMessageStatisListReduxStorage();
								dispatch(system.actions.getMessageStatusList(resultData));
							})
							.catch(() => {
								console.log('error on loading message status list');
							});
						messagingHub.off(_request.queueId.toString());
						messagingHub.stop();
					});
				}
			})
			.catch(() => {
				messagingHub.stop();
				swal(SwalFailedMessage.title, SwalMessageStatusMessage.textErrorMessageStatusList, SwalFailedMessage.icon);
			});
	};

	const _reorderMessageStatus = () => {
		const isProcced = _checkMessageStatusTransaction('REORDER');

		if (isProcced) {
			setModalReorderShow(true);
		} else {
			swal({
				title: 'Confirmation',
				text: 'Pending actions not posted will be lost if you proceed, please confirm',
				icon: 'warning',
				buttons: ['No', 'Yes'],
				dangerMode: true,
			}).then((willUpdate) => {
				if (willUpdate) {
					_clearMessageStatisListReduxStorage();
					_getMessageStatusList('', '', '');
				}
			});
		}
	};

	const _deactivate = (data: GetMessageStatusListResponse) => {
		const isProcced = _checkMessageStatusTransaction('DEACTIVATE');
		if (isProcced) {
			//NEW STATUS
			const newStatus = data.messageStatusStatus.toString() === 'true' ? false : true;

			// FIRST GET INDEXT OF ITEM
			const postIndex = postData.findIndex((messageType: GetMessageStatusListResponse) => messageType.messageStatusId === data.messageStatusId);

			//  -- PARAMETER FOR TABLE STORE -- //
			const request: GetMessageStatusListResponse = {
				messageStatusId: data.messageStatusId,
				messageStatusName: data.messageStatusName,
				messageStatusTypes: data.messageStatusTypes,
				position: data.position,
				messageStatusStatus: newStatus,
				action: 'DEACTIVATE',
			};

			// REMOVE DATA FROM TABLE BEFORE REINSERT ON REDUX STORE
			let filterData = systemData.filter((x: GetMessageStatusListResponse) => x.messageStatusId != data.messageStatusId);
			// REINSERT UPDATED DATA
			let DataToTable = [...filterData, request];
			//DISPATCH DATA TO TABLE STORE
			dispatch(system.actions.getMessageStatusList(DataToTable));

			// -- DISPATCH FOR POSTING OF DATA --//
			// CHECKING ON INSERT OR UPDATE
			if (postIndex < 0) {
				// IF NOT EXIST THEN ADD
				const newDataToStore = postData.concat(request);
				dispatch(system.actions.postMessageStatusList(newDataToStore));
			} else {
				// IF EXISIST THEN REMOVE FIRST
				let filteredData = postData.filter((x: GetMessageStatusListResponse) => x.messageStatusId != data.messageStatusId);
				let updatedPostData = [...filteredData, request];
				dispatch(system.actions.postMessageStatusList(updatedPostData));
			}
		} else {
			// IF ANOTHER TRANSACTION EXIST THEN VERIFY EXISTING TRANSACTION WILL BE REMOVED AND TABLE WILL BE BACK TO ORIGINAL STATE
			swal({
				title: 'Confirmation',
				text: 'Pending actions not posted will be lost if your proceed, please confirm',
				icon: 'warning',
				buttons: ['No', 'Yes'],
				dangerMode: true,
			}).then((willUpdate) => {
				if (willUpdate) {
					dispatch(system.actions.getMessageStatusList([]));
					dispatch(system.actions.postMessageStatusList([]));
					_getMessageStatusList('', '', '');
				}
			});
		}
	};

	const getMessageTypeIdsRequest = async (_messageTypeIds: string) => {
		let paramMessageTypeParentId = messageTypeParentId === undefined ? '' : messageTypeParentId;

		let concatMessageTypeIdsRequest = _messageTypeIds === '' ? paramMessageTypeParentId : _messageTypeIds + ',' + paramMessageTypeParentId;

		return concatMessageTypeIdsRequest;
	};

	const _getMessageStatusList = (name: string, status: string, messageTypeIds: string) => {
		setTimeout(() => {
			messagingHub
				.start()
				.then(async () => {
					if (messagingHub.state === HubConnected) {
						let _getMessageTypeIdsRequest = await getMessageTypeIdsRequest(messageTypeIds);
						const getMessageStatusListRequest: GetMessageStatusListRequest = {
							queueId: Guid.create().toString(),
							userId: userId?.toString() ?? '0',
							messageStatusName: name,
							messageStatusStatus: status,
							messageTypeId: 0,
							messageTypeIds: _getMessageTypeIdsRequest,
						};

						_getMessageStatusListGateway(getMessageStatusListRequest);
					} else {
						swal(SwalServerErrorMessage.title, SwalServerErrorMessage.textError, SwalServerErrorMessage.icon);
					}
				})
				.catch((err) => console.log('Error while starting connection: ' + err));
		}, 1000);
	};

	const _add = () => {
		const isProcced = _checkMessageStatusTransaction('ADD');
		if (isProcced) {
			setModalShow(true);
		} else {
			swal({
				title: 'Confirmation',
				text: 'Pending actions not posted will be lost if your proceed, please confirm',
				icon: 'warning',
				buttons: ['No', 'Yes'],
				dangerMode: true,
			}).then((willUpdate) => {
				if (willUpdate) {
					dispatch(system.actions.getMessageStatusList([]));
					dispatch(system.actions.postMessageStatusList([]));
					_getMessageStatusList('', '', '');
				}
			});
		}
	};
	const _checkMessageStatusTransaction = (action: string) => {
		//-- CHECK TRANSACTION IF THERE IS OTHER PENDING TRANSACTION -- //
		let toPostData = postData ? postData : [];
		if (toPostData.length === 0) {
			return true;
		} else {
			const isExist = toPostData.some((item: GetMessageStatusListResponse) => item.action === action);
			return isExist;
		}
	};
	const _edit = (id: number) => {
		const isProceed = _checkMessageStatusTransaction('EDIT');

		if (isProceed) {
			setDataId(id);
			setModalEditShow(true);
		} else {
			// IF ANOTHER TRANSACTION EXIST THEN VERIFY EXISTING TRANSACTION WILL BE REMOVED AND TABLE WILL BE BACK TO ORIGINAL STATE
			swal({
				title: 'Confirmation',
				text: 'Pending actions not posted will be lost if your proceed, please confirm',
				icon: 'warning',
				buttons: ['No', 'Yes'],
				dangerMode: true,
			}).then((willUpdate) => {
				if (willUpdate) {
					_clearMessageStatisListReduxStorage();
					_getMessageStatusList('', '', '');
					setModalEditShow(true);
				}
			});
		}
	};

	const postMessageStatusTransactionRequest = async () => {
		let updatedPostData = Array<MessageStatusPostRequest>();
		postData.forEach((item: GetMessageStatusListResponse) => {
			const requestData: MessageStatusPostRequest = {
				id: item.messageStatusId,
				messageStatusName: item.messageStatusName,
				messageTypeId: messageTypeParentId === 0 ? item.messageStatusTypes[0].messageTypeId : messageTypeParentId,
				messageTypeIds: item.messageStatusTypes.map((el: any) => el.messageTypeId.toString()),
				position: item.position,
				isActive: item.messageStatusStatus,
				updatedBy: userId ? parseInt(userId) : 0,
				createdBy: userIdOnInt,
			};
			updatedPostData.push(requestData);
		});

		// // -- REQUEST PARAMETER -- //
		const request: AddMessageStatusRequest = {
			queueId: Guid.create().toString(),
			userId: userId?.toString() ?? '0',
			codeListId: 4,
			isActive: true,
			messageStatus: updatedPostData,
		};

		return request;
	};

	const postMessageStatusTransactionActionAfterPost = (_resultStatus: number) => {
		if (_resultStatus === successResponse) {
			swal(SwalSuccessMessage.title, SwalSuccessMessage.textSuccess, SwalSuccessMessage.icon);
			_getMessageStatusList('', '', '');
			_clearMessageStatisListReduxStorage();
		} else {
			swal(SwalServerErrorMessage.title, SwalServerErrorMessage.textError, SwalServerErrorMessage.icon);
			_getMessageStatusList('', '', '');
			_clearMessageStatisListReduxStorage();
		}
	};

	const postMessageStatusTransactionGateway = (_postMessageStatusRequest: AddMessageStatusRequest) => {
		setTimeout(() => {
			setIsMessageStatusListLoading(true);
			messagingHub
				.start()
				.then(() => {
					if (messagingHub.state === HubConnected) {
						sendAddMessageStatusList(_postMessageStatusRequest)
							.then((response) => {
								if (response.status === successResponse) {
									messagingHub.on(_postMessageStatusRequest.queueId.toString(), (message) => {
										let resultData = JSON.parse(message.remarks);

										postMessageStatusTransactionActionAfterPost(resultData.Status);
										messagingHub.off(_postMessageStatusRequest.queueId.toString());
										messagingHub.stop();
										setIsMessageStatusListLoading(false);
									});
								} else {
									messagingHub.stop();
									swal(SwalFailedMessage.title, response.data.message, SwalFailedMessage.icon);
									_getMessageStatusList('', '', '');
									_clearMessageStatisListReduxStorage();
									setIsMessageStatusListLoading(false);
								}
							})
							.catch(() => {
								messagingHub.stop();
								swal(SwalFailedMessage.title, SwalMessageTypeMessage.textErrorMessageTypeList, SwalFailedMessage.icon);
								setIsMessageStatusListLoading(false);
							});
					} else {
						swal(SwalServerErrorMessage.title, SwalServerErrorMessage.textError, SwalServerErrorMessage.icon);
						setIsMessageStatusListLoading(false);
					}
				})
				.catch((err) => console.log('Error while starting connection: ' + err));
		}, 1000);
	};

	const _postMessageStatusTransaction = () => {
		swal({
			title: 'Confirmation',
			text: 'This action will update the Code List, please confirm',
			icon: 'warning',
			buttons: ['No', 'Yes'],
			dangerMode: true,
		}).then(async (willUpdate) => {
			if (willUpdate) {
				let _postMessageStatusRequest = await postMessageStatusTransactionRequest();
				postMessageStatusTransactionGateway(_postMessageStatusRequest);
			}
		});
	};

	const _back = () => {
		swal({
			title: 'Confirmation',
			text: 'Any changes will be discarded, please confirm',
			icon: 'warning',
			buttons: ['No', 'Yes'],
			dangerMode: true,
		}).then((willUpdate) => {
			if (willUpdate) {
				_clearMessageStatisListReduxStorage();

				if (messageTypeParentId === 0) {
					history.push('/system/code-list');
				} else {
					history.push('/system/message-type-list');
				}
			}
		});
	};
	const _view = (id: number) => {
		swal({
			title: 'Confirmation',
			text: 'Any changes will be discarded, please confirm',
			icon: 'warning',
			buttons: ['No', 'Yes'],
			dangerMode: true,
		}).then((willUpdate) => {
			if (willUpdate) {
				_clearMessageStatisListReduxStorage();
				history.push(`/system/message-response-list/${id}`);
			}
		});
	};
	const _closeModals = () => {
		swal({
			title: 'Confirmation',
			text: 'Any changes will be discarded, please confirm',
			icon: 'warning',
			buttons: ['No', 'Yes'],
			dangerMode: true,
		}).then((willUpdate) => {
			if (willUpdate) {
				setModalReorderShow(false);
				setModalShow(false);
				setModalEditShow(false);
			}
		});
	};

	/**
	 *  ? Local Components
	 */
	const renderMessageStatusListPosition = (_props: any) => <>{_props ? <div>{_props.data.position.toString()}</div> : null}</>;

	const renderMessageStatusStatus = (_props: any) => (
		<>{_props ? <div>{_props.data.messageStatusStatus === true ? 'Active' : 'Inactive'}</div> : null}</>
	);

	const renderMesssageStatusListIncludedMessageType = (_props: any) => (
		<>
			{_props
				? _props.data.messageStatusTypes.map((messageStatusTypeObj: MessageStatusTypesModel) => (
						<div key={messageStatusTypeObj.messageTypeId} style={{height: 'auto', whiteSpace: 'pre-wrap', overflowWrap: 'break-word'}}>
							{messageStatusTypeObj.messageTypeId === messageTypeParentId ? null : messageStatusTypeObj.messageTypeName}
						</div>
				  ))
				: null}
		</>
	);

	const renderMessageStatusListAction = (_props: any) => (
		<>
			{_props.data.messageStatusId != 0 ? (
				<ButtonGroup aria-label='Basic example'>
					<div className='d-flex justify-content-center flex-shrink-0'>
						<DefaultTableButton
							access={access?.includes(USER_CLAIMS.MessageStatusWrite)}
							title={_props.data.messageStatusStatus === true ? 'Deactivate' : 'Activate'}
							onClick={() => _deactivate(_props.data)}
							customWidth={'90px'}
						/>
						<DefaultTableButton
							access={access?.includes(USER_CLAIMS.MessageStatusWrite)}
							title={'Edit'}
							onClick={() => _edit(_props.data.messageStatusId)}
						/>
						<DefaultTableButton
							access={access?.includes(USER_CLAIMS.MessageStatusRead)}
							title={'View Message Response'}
							onClick={() => _view(_props.data.messageStatusId)}
						/>
					</div>
				</ButtonGroup>
			) : null}
		</>
	);

	const lowerCaseMessageStatusName = (valueA: string, valueB: string) => {
		return valueA.toLowerCase().localeCompare(valueB.toLowerCase());
	};

	// TABLE CONTENT
	const columnDefs : (ColDef<GetMessageStatusListResponse> | ColGroupDef<GetMessageStatusListResponse>)[] =  [
		{
			headerName: 'Order',
			field: 'position',
			sort: 'asc' as 'asc',
			width: 100,
			cellRenderer: renderMessageStatusListPosition,
		},
		{headerName: 'Message Status Name', field: 'messageStatusName', comparator: lowerCaseMessageStatusName},
		{
			headerName: 'Message Status Status',
			field: 'messageStatusStatus',
			cellRenderer: renderMessageStatusStatus,
		},
		{
			headerName: 'Included To Message Type',
			field: 'messageStatusTypes',
			autoHeight: true,
			cellRenderer: renderMesssageStatusListIncludedMessageType,
		},
		{
			headerName: 'Action',
			field: 'position',
			width: 500,
			cellRenderer: renderMessageStatusListAction,
		},
	];

	const renderMessageStatusPageSize = () => (
		<FieldContainer>
			<div className='example-header mt-5'>
				Show
				<select onChange={() => onPageSizeChanged()} id='page-size' style={{margin: 5}}>
					<option value='10' selected={true}>
						10
					</option>
					<option value='100'>100</option>
					<option value='500'>500</option>
					<option value='1000'>1000</option>
				</select>
				entries
			</div>
		</FieldContainer>
	);

	// RETURN
	return (
		<MainContainer>
			<FormHeader headerLabel={'Search Message Status'} />
			<ContentContainer>
				<SystemCodeListHeader codeListInfo={codeListInfo} />
				<div className='separator border-4 my-8' />
				<Row>
					<Col sm={4}>
						<FieldContainer>
							<FieldLabel title={'Message Status Name'} />
							<BasicTextInput
								ariaLabel='Message Status Name'
								value={messageStatusName}
								disabled={false}
								onChange={(e) => setMessageStatusName(e.target.value)}
							/>
						</FieldContainer>
					</Col>
					<Col sm={4}>
						<FieldContainer>
							<FieldLabel title={'Message Status Status'} />
							<div className='col-sm-12'>
								<Select
									isMulti
									size='small'
									style={{width: '100%'}}
									options={messageStatusStatusOption}
									onChange={onChangeSelectedStatues}
									value={selectedStatuses}
								/>
							</div>
						</FieldContainer>
					</Col>
					<Col sm={4}>
						<FieldContainer>
							<FieldLabel title={'Included to Message Type'} />
							<div className='col-sm-12'>
								<Select
									isMulti
									size='small'
									style={{width: '100%'}}
									options={messageTypeOptionList}
									onChange={onChangeSelectedMessageTypes}
									value={selectedMessageType}
								/>
							</div>
						</FieldContainer>
					</Col>
				</Row>
				<ButtonsContainer>
					<MlabButton
						access={access?.includes(USER_CLAIMS.MessageStatusRead)}
						size={'sm'}
						label={'Search'}
						style={ElementStyle.primary}
						type={'button'}
						weight={'solid'}
						onClick={formik.handleSubmit}
						loading={formik.isSubmitting}
						loadingTitle={'Please wait ...'}
						disabled={formik.isSubmitting}
					/>
					<DefaultSecondaryButton access={access?.includes(USER_CLAIMS.MessageStatusWrite)} title={'Add New'} onClick={() => _add()} />
					<DefaultSecondaryButton
						access={access?.includes(USER_CLAIMS.MessageResponseWrite)}
						title={'Change Order'}
						onClick={() => _reorderMessageStatus()}
					/>
				</ButtonsContainer>
				{renderMessageStatusPageSize}
				<div className='ag-theme-quartz' style={{height: 400, width: '100%'}}>
					<AgGridReact
						rowData={rowData}
						defaultColDef={{
							sortable: true,
							resizable: true,
						}}
						animateRows={true}
						onGridReady={onGridReady}
						rowBuffer={0}
						//enableRangeSelection={true} //deprecated in AgGridReactver.32.0.0
						pagination={true}
						paginationPageSize={10}
						paginationPageSizeSelector={false}
						columnDefs={columnDefs}
					/>
				</div>
			</ContentContainer>

			<FooterContainer>
				<PaddedContainer>
					<MlabButton
						access={access?.includes(USER_CLAIMS.MessageStatusWrite)}
						size={'sm'}
						label={'Save'}
						style={ElementStyle.primary}
						type={'button'}
						weight={'solid'}
						onClick={_postMessageStatusTransaction}
						loading={isMessageStatusListLoading}
						loadingTitle={'Please wait ...'}
						disabled={isMessageStatusListLoading}
					/>
					<DefaultSecondaryButton access={access?.includes(USER_CLAIMS.MessageStatusRead)} title={'Back'} onClick={_back} />
				</PaddedContainer>
			</FooterContainer>

			{/* modal for add topic*/}
			<CreateMessageStatus messageTypeId={messageTypeParentId} showForm={modalShow} closeModal={_closeModals} />
			{/* end modal for add topic */}

			{/* modal for reorder topic*/}
			<ReorderMessageStatus messageTypeId={messageTypeParentId} showForm={modalReorderShow} closeModal={_closeModals} />
			{/* end modal for reorder topic */}

			{/* modal for reorder topic*/}
			<EditMessageStatus messageTypeId={messageTypeParentId} Id={dataId} showForm={modalEditShow} closeModal={_closeModals} />
			{/* end modal for reorder topic */}
		</MainContainer>
	);
};

export default MessageStatusList;

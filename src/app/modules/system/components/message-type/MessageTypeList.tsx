import {AgGridReact} from 'ag-grid-react';
import {useFormik} from 'formik';
import {Guid} from 'guid-typescript';
import React, {useEffect, useState} from 'react';
import {ButtonGroup, Col, Row} from 'react-bootstrap-v5';
import {shallowEqual, useDispatch, useSelector} from 'react-redux';
import {useHistory} from 'react-router-dom';
import Select from 'react-select';
import swal from 'sweetalert';
import * as Yup from 'yup';
import {RootState} from '../../../../../setup';
import * as hubConnection from '../../../../../setup/hub/MessagingHub';
import {ElementStyle, PROMPT_MESSAGES} from '../../../../constants/Constants';
import useConstant from '../../../../constants/useConstant';
import {
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
	SearchTextInput,
} from '../../../../custom-components';
import {USER_CLAIMS} from '../../../user-management/components/constants/UserClaims';
import {AddMessageListRequest, MessageTypeListRequest, MessageTypeListResponse, MessageTypePostRequest, OptionsSelectedModel} from '../../models';
import * as system from '../../redux/SystemRedux';
import {getMessageTypeList, sendAddMessageList, sendGetMessageTypeList} from '../../redux/SystemService';
import {useSystemOptionHooks} from '../../shared';
import {SystemCodeListHeader} from '../../shared/components';
import '../sub-topic/SubTopic.css';
import EditMessageType from './EditMessageType';
import CreateMessageType from './CreateMessageType';
import ReorderMessageType from './ReorderMessageType';
import { ColDef, ColGroupDef } from 'ag-grid-community';

const FilterSchema = Yup.object().shape({
	messageTypeName: Yup.string(),
});

const initialValues = {
	messageTypeName: '',
};

const MessageTypeList: React.FC = () => {
	/**
	 *  ? Connections
	 */
	const messagingHub = hubConnection.createHubConnenction();

	// Redux
	const systemData = useSelector<RootState>(({system}) => system.getMessageTypeList, shallowEqual) as any;
	const postData = useSelector<RootState>(({system}) => system.postMessageTypeList, shallowEqual) as any;
	const userAccessId = useSelector<RootState>(({auth}) => auth.userId, shallowEqual) as number;
	const userAccess = useSelector<RootState>(({auth}) => auth.access, shallowEqual) as string;
	const dispatch = useDispatch();
	const {SwalFailedMessage, SwalConfirmMessage, SwalServerErrorMessage, SwalMessageTypeMessage, SwalSuccessMessage, successResponse, HubConnected} =
		useConstant();
	// States
	const [selectedStatuses, setSelectedStatuses] = useState<any>('');
	const [messageTypeInfo, setMessageTypeInfo] = useState<MessageTypeListResponse | undefined>();
	const [modalShow, setModalShow] = useState<boolean>(false);
	const [modalReorderShow, setModalReorderShow] = useState<boolean>(false);
	const [gridApi, setGridApi] = useState<any | null>(null);
	const [rowData, setRowData] = useState<Array<MessageTypeListResponse>>([]);
	const [editMessageTypeShow, setEditMessageTypeShow] = useState<boolean>(false);

	const [editMode, setEditMode] = useState(false);

	// VARIABLES
	const history = useHistory();
	let {getSystemCodelist, codeListInfo} = useSystemOptionHooks();

	// WATHCERS
	useEffect(() => {
		setRowData(systemData);
	}, [systemData]);

	// THIS WILL CHECK IF ACTION TABLES HAVE CHANGE
	useEffect(() => {
		setModalReorderShow(false);
		setModalShow(false);
		setRowData(systemData);
	}, [postData]);

	// MOUNTED
	useEffect(() => {
		clearMessageTypeListStorage();
		loadGetMessageTypeList('', '');
		getSystemCodelist(3);
	}, []);

	const onMessageTypeListGridReady = (params: any) => {
		setGridApi(params.api);
		params.api.paginationGoToPage(4);
		setRowData(systemData);
		params.api.sizeColumnsToFit();
	};

	const messageTypeListBackToCodeList = () => {
		swal({
			title: PROMPT_MESSAGES.ConfirmCloseTitle,
			text: PROMPT_MESSAGES.ConfirmCloseMessage,
			icon: SwalConfirmMessage.icon,
			buttons: [SwalConfirmMessage.btnNo, SwalConfirmMessage.btnYes],
			dangerMode: true,
		}).then((willUpdate) => {
			if (willUpdate) {
				clearMessageTypeListStorage();
				history.push('/system/code-list');
			}
		});
	};

	const viewMessageStatusList = (_id: number) => {
		swal({
			title: PROMPT_MESSAGES.ConfirmCloseTitle,
			text: PROMPT_MESSAGES.ConfirmCloseMessage,
			icon: SwalConfirmMessage.icon,
			buttons: [SwalConfirmMessage.btnNo, SwalConfirmMessage.btnYes],
			dangerMode: true,
		}).then((willUpdate) => {
			if (willUpdate) {
				clearMessageTypeListStorage();
				history.push(`/system/message-status-list/${_id}`);
			}
		});
	};

	const clearMessageTypeListStorage = () => {
		dispatch(system.actions.getMessageTypeList([]));
		dispatch(system.actions.postMessageTypeList([]));
	};

	// FORMIK FORM POST
	const formik = useFormik({
		initialValues,
		validationSchema: FilterSchema,
		onSubmit: (values, {setStatus, setSubmitting, resetForm}) => {
			setSubmitting(true);

			// -- CHECK IF THERE IS PENDING ACTION NEED TO BE POST -- //
			const isProcced = validateMessageTypeTransaction('SEARCH');

			let postmessageTypeName: string = values.messageTypeName === '' ? '' : values.messageTypeName;
			let selectedStatus: string = Object.assign(Array<OptionsSelectedModel>(), selectedStatuses)
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
				clearMessageTypeListStorage();
				loadGetMessageTypeList(postmessageTypeName, poststatus);
			} else {
				swal({
					title: PROMPT_MESSAGES.ConfirmCloseTitle,
					text: PROMPT_MESSAGES.ConfirmCloseMessage,
					icon: SwalConfirmMessage.icon,
					buttons: [SwalConfirmMessage.btnNo, SwalConfirmMessage.btnYes],
					dangerMode: true,
				}).then((willUpdate) => {
					if (willUpdate) {
						clearMessageTypeListStorage();
						loadGetMessageTypeList(postmessageTypeName, poststatus);
					}
				});
			}

			//resetForm()
			setSubmitting(false);
		},
	});

	// METHODS
	const reloadListData = () => {
		setRowData(systemData);
	};
	const onChangeSelectedStatues = (val: string) => {
		setSelectedStatuses(val);
	};
	const onPageSizeChanged = () => {
		const pageSize: any = document.getElementById('page-size');
		gridApi.paginationSetPageSize(Number(pageSize.value));
	};
	const reorderMessageTypeList = () => {
		const isProcced = validateMessageTypeTransaction('REORDER');

		if (isProcced) {
			setModalReorderShow(true);
		} else {
			swal({
				title: PROMPT_MESSAGES.ConfirmCloseTitle,
				text: PROMPT_MESSAGES.ConfirmCloseMessage,
				icon: SwalConfirmMessage.icon,
				buttons: [SwalConfirmMessage.btnNo, SwalConfirmMessage.btnYes],
				dangerMode: true,
			}).then((willUpdate) => {
				if (willUpdate) {
					clearMessageTypeListStorage();
					loadGetMessageTypeList('', '');
				}
			});
		}
	};

	const sendGetMessageTypeListGateway = (_request: MessageTypeListRequest) => {
		sendGetMessageTypeList(_request)
			.then((response) => {
				if (response.status === successResponse) {
					messagingHub.on(_request.queueId.toString(), (message) => {
						getMessageTypeList(message.cacheId)
							.then((data) => {
								let resultData = Object.assign(new Array<MessageTypeListResponse>(), data.data);
								dispatch(system.actions.getMessageTypeList(resultData));
							})
							.catch(() => {});
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
				swal(SwalFailedMessage.title, SwalMessageTypeMessage.textErrorMessageTypeList, SwalFailedMessage.icon);
			});
	};

	const loadGetMessageTypeList = (name: string, status: string) => {
		setTimeout(() => {
			messagingHub
				.start()
				.then(() => {
					if (messagingHub.state === HubConnected) {
						const request: MessageTypeListRequest = {
							queueId: Guid.create().toString(),
							userId: userAccessId.toString(),
							messageTypeName: name,
							messageTypeStatus: status,
						};
						sendGetMessageTypeListGateway(request);
					} else {
						swal(SwalServerErrorMessage.title, SwalServerErrorMessage.textError, SwalServerErrorMessage.icon);
					}
				})
				.catch((err) => console.log('Error while starting connection: ' + err));
		}, 1000);
	};

	const messageTypeListChangeStatus = (data: MessageTypeListResponse) => {
		const isProcced = validateMessageTypeTransaction('CHANGE_STATUS');

		if (isProcced) {
			const request: MessageTypeListResponse = {
				messageTypeId: data.messageTypeId,
				messageTypeName: data.messageTypeName,
				messageTypeStatus: !data.messageTypeStatus,
				position: data.position,
				messageChannelTypeName: data.messageChannelTypeName,
				channelTypeId: data.channelTypeId,
				messageGroupId: data.messageGroupId,
				messageGroupName: data.messageGroupName,
			};

			let filterData = systemData.filter((x: MessageTypeListResponse) => x.messageTypeId != data.messageTypeId);
			let DataToTable = [request, ...filterData];
			dispatch(system.actions.getMessageTypeList(DataToTable));
			const postIndex = postData.findIndex((messageType: MessageTypePostRequest) => messageType.id === data.messageTypeId);

			const postRequest: MessageTypePostRequest = {
				id: request.messageTypeId ?? 0,
				messageTypeName: data.messageTypeName,
				codeListId: 3,
				position: data.position,
				isActive: !data.messageTypeStatus,
				channelTypeId: data.channelTypeId,
				messageGroupId: data.messageGroupId,
				createdBy: userAccessId,
				updatedBy: userAccessId,
				action: 'CHANGE_STATUS',
			};

			if (postIndex < 0) {
				const newDataToStore = postData.concat(postRequest);
				dispatch(system.actions.postMessageTypeList(newDataToStore));
			} else {
				let filteredData = postData.filter((x: MessageTypePostRequest) => x.id != data.messageTypeId);
				let updatedPostData = [postRequest, ...filteredData];
				dispatch(system.actions.postMessageTypeList(updatedPostData));
			}
		} else {
			swal({
				title: PROMPT_MESSAGES.ConfirmCloseTitle,
				text: PROMPT_MESSAGES.ConfirmCloseMessage,
				icon: SwalConfirmMessage.icon,
				buttons: [SwalConfirmMessage.btnNo, SwalConfirmMessage.btnYes],
				dangerMode: true,
			}).then((willUpdate) => {
				if (willUpdate) {
					dispatch(system.actions.getMessageTypeList([]));
					dispatch(system.actions.postMessageTypeList([]));
					loadGetMessageTypeList('', '');
				}
			});
		}
	};

	const addMessageTypeToShowModal = () => {
		setEditMode(false);
		const isProcced = validateMessageTypeTransaction('ADD');

		if (isProcced) {
			setModalShow(true);
		} else {
			swal({
				title: PROMPT_MESSAGES.ConfirmCloseTitle,
				text: PROMPT_MESSAGES.ConfirmCloseMessage,
				icon: SwalConfirmMessage.icon,
				buttons: [SwalConfirmMessage.btnNo, SwalConfirmMessage.btnYes],
				dangerMode: true,
			}).then((willUpdate) => {
				if (willUpdate) {
					dispatch(system.actions.getMessageTypeList([]));
					dispatch(system.actions.postMessageTypeList([]));
					loadGetMessageTypeList('', '');
				}
			});
		}
	};

	const editMessageTypeData = (data: any) => {
		setModalShow(true);
		setEditMode(true);

		const messageTypeItem = rowData.find((i) => i.messageTypeId == data.messageTypeId);
		if (messageTypeItem != undefined) {
			setMessageTypeInfo(messageTypeItem);
		} else {
			swal(SwalFailedMessage.title, SwalMessageTypeMessage.textErrorMessageTypeList, SwalFailedMessage.icon);
		}
	};

	const validateMessageTypeTransaction = (action: string) => {
		let toPostData = postData ? postData : [];
		if (toPostData.length === 0) {
			return true;
		} else {
			const isExist = toPostData.some((item: MessageTypePostRequest) => item.action === action);
			return isExist;
		}
	};

	const closedMessageTypeListModals = () => {
		swal({
			title: PROMPT_MESSAGES.ConfirmCloseTitle,
			text: PROMPT_MESSAGES.ConfirmCloseMessage,
			icon: SwalConfirmMessage.icon,
			buttons: [SwalConfirmMessage.btnNo, SwalConfirmMessage.btnYes],
			dangerMode: true,
		}).then((willUpdate) => {
			if (willUpdate) {
				setModalReorderShow(false);
				setModalShow(false);
			}
		});
	};

	const postMessageTypeTransactionGatewayAction = (_status: number) => {
		if (_status === successResponse) {
			swal(SwalSuccessMessage.title, SwalSuccessMessage.textSuccess, SwalSuccessMessage.icon);
			loadGetMessageTypeList('', '');
			clearMessageTypeListStorage();
		} else {
			swal(SwalServerErrorMessage.title, SwalServerErrorMessage.textError, SwalServerErrorMessage.icon);
			loadGetMessageTypeList('', '');
			clearMessageTypeListStorage();
		}
	};

	const postMessageTypeTransactionGateway = (_request: AddMessageListRequest) => {
		setTimeout(() => {
			messagingHub
				.start()
				.then(() => {
					if (messagingHub.state === HubConnected) {
						sendAddMessageList(_request)
							.then((response) => {
								if (response.status === successResponse) {
									messagingHub.on(_request.queueId.toString(), (message) => {
										let resultData = JSON.parse(message.remarks);
										postMessageTypeTransactionGatewayAction(resultData.Status);
									});

									setTimeout(() => {
										if (messagingHub.state === HubConnected) {
											messagingHub.stop();
										}
									}, 30000);
								}
							})
							.catch(() => {
								messagingHub.stop();
								swal(SwalFailedMessage.title, SwalMessageTypeMessage.textErrorMessageTypeList, SwalFailedMessage.icon);
							});
					}
				})
				.catch((err) => console.log('Error while starting connection: ' + err));
		}, 1000);
	};

	const postMessageTypeTransasctions = () => {
		swal({
			title: 'Confirmation',
			text: 'This action will update the Code List, please confirm',
			icon: 'warning',
			buttons: ['No', 'Yes'],
			dangerMode: true,
		}).then((willUpdate) => {
			if (willUpdate) {
				const request: AddMessageListRequest = {
					queueId: Guid.create().toString(),
					userId: userAccessId.toString(),
					codeListId: 3,
					isActive: true,
					messageTypes: postData,
				};

				postMessageTypeTransactionGateway(request);
			}
		});
		setEditMode(false);
	};

	/**
	 *  ? Local Components
	 */
	const displayMessageTypePosition = (_props: any) => <>{_props ? <div>{_props.data.position}</div> : null}</>;
	const displayMessageTypeStatus = (_props: any) => (
		<>{_props ? <div>{_props.data.messageTypeStatus === true ? 'Active' : 'Inactive'}</div> : null}</>
	);
	const displayRenderMessageTypeAction = (_props: any) => (
		<>
			{_props.data.messageTypeId != 0 ? (
				<ButtonGroup aria-label='Basic example'>
					<div className='d-flex justify-content-center flex-shrink-0'>
						<DefaultTableButton
							access={userAccess.includes(USER_CLAIMS.MessageTypeWrite)}
							title={_props.data.messageTypeStatus === true ? 'Deactivate' : 'Activate'}
							onClick={() => messageTypeListChangeStatus(_props.data)}
							customWidth={'90px'}
						/>
						<DefaultTableButton
							access={userAccess.includes(USER_CLAIMS.MessageTypeWrite)}
							title={'Edit'}
							onClick={() => editMessageTypeData(_props.data)}
						/>
						<DefaultTableButton
							access={userAccess.includes(USER_CLAIMS.MessageStatusRead)}
							title={'View Message Status'}
							onClick={() => viewMessageStatusList(_props.data.messageTypeId)}
						/>
					</div>
				</ButtonGroup>
			) : null}
		</>
	);

	const messageTypePageEntries = () => (
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
	);

	const lowerCaseMessageTypeName = (valueA: string, valueB: string) => {
		return valueA.toLowerCase().localeCompare(valueB.toLowerCase());
	};

	// TABLE CONTENT
	const columnDefs : (ColDef<MessageTypeListResponse> | ColGroupDef<MessageTypeListResponse>)[] =  [
		{
			headerName: 'Order',
			field:  'position',
			sort: 'asc' as 'asc',
			cellRenderer: displayMessageTypePosition,
		},
		{headerName: 'Message Type Name', field:  'messageTypeName', comparator: lowerCaseMessageTypeName},
		{headerName: 'Message Group', field:  'messageGroupName'},
		{
			headerName: 'Message Type Status',
			field:  'messageTypeStatus',
			cellRenderer: displayMessageTypeStatus,
		},
		{headerName: 'Channel Type', field:  'messageChannelTypeName'},
		{
			headerName: 'Action',
			field:  'position',
			sortable: false,
			cellRenderer: displayRenderMessageTypeAction,
		},
	];

	// RETURN
	return (
		<MainContainer>
			<FormHeader headerLabel={'Search Message Type'} />
			<ContentContainer>
				<SystemCodeListHeader codeListInfo={codeListInfo} />
				<div className='separator border-4 my-8' />
				<Row>
					<Col sm={4}>
						<FieldContainer>
							<FieldLabel title={'Message Type Name'} />
							<SearchTextInput fieldSize={'12'} ariaLabel={'Message Type Name'} {...formik.getFieldProps('messageTypeName')} />
						</FieldContainer>
					</Col>
					<Col sm={4}>
						<FieldContainer>
							<FieldLabel title={'Message Type Status'} />
							<div>
								<Select
									className='col-lg-12'
									menuPlacement='auto'
									menuPosition='fixed'
									isMulti
									size='small'
									style={{width: '100%'}}
									options={[
										{value: '1', label: 'Active'},
										{value: '2', label: 'Inactive'},
									]}
									onChange={onChangeSelectedStatues}
									value={selectedStatuses}
								/>
							</div>
						</FieldContainer>
					</Col>
				</Row>

				<ButtonsContainer>
					<MlabButton
						access={userAccess?.includes(USER_CLAIMS.MessageTypeRead)}
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
					<DefaultSecondaryButton
						access={userAccess.includes(USER_CLAIMS.MessageTypeWrite)}
						title={'Add New'}
						onClick={() => addMessageTypeToShowModal()}
					/>
					<DefaultSecondaryButton
						access={userAccess.includes(USER_CLAIMS.MessageTypeWrite)}
						title={'Change Order'}
						onClick={() => reorderMessageTypeList()}
					/>
				</ButtonsContainer>

				<FieldContainer>{messageTypePageEntries()}</FieldContainer>

				<div className='ag-theme-quartz' style={{height: 400, width: '100%'}}>
					<AgGridReact
						rowData={rowData}
						defaultColDef={{
							sortable: true,
							resizable: true,
						}}
						onGridReady={onMessageTypeListGridReady}
						rowBuffer={0}
						//enableRangeSelection={true} //deprecated in AgGridReactver.32.0.0
						pagination={true}
						paginationPageSizeSelector={false}
						paginationPageSize={10}
						columnDefs={columnDefs}
					/>
				</div>
			</ContentContainer>

			<FooterContainer>
				<PaddedContainer>
					<MlabButton
						access={userAccess?.includes(USER_CLAIMS.MessageTypeWrite)}
						size={'sm'}
						label={'Submit'}
						style={ElementStyle.primary}
						type={'button'}
						weight={'solid'}
						loading={false}
						disabled={false}
						loadingTitle={'Please wait...'}
						onClick={postMessageTypeTransasctions}
					/>
					<MlabButton
						access={userAccess?.includes(USER_CLAIMS.MessageTypeWrite)}
						size={'sm'}
						label={'Back'}
						style={ElementStyle.secondary}
						type={'button'}
						weight={'solid'}
						loading={false}
						disabled={false}
						loadingTitle={'Please wait...'}
						onClick={messageTypeListBackToCodeList}
					/>
				</PaddedContainer>
			</FooterContainer>

			{/* modal for add topic*/}
			<CreateMessageType
				reloadData={reloadListData}
				editMode={editMode}
				messageType={messageTypeInfo}
				showForm={modalShow}
				closeModal={closedMessageTypeListModals}
			/>
			{/* end modal for add topic */}

			{/* modal for reorder topic*/}
			<ReorderMessageType showForm={modalReorderShow} closeModal={closedMessageTypeListModals} />
			{/* end modal for reorder topic */}

			<EditMessageType data={messageTypeInfo} setModalShow={setEditMessageTypeShow} showForm={editMessageTypeShow} />
		</MainContainer>
	);
};

export default MessageTypeList;

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
import {PROMPT_MESSAGES} from '../../../../constants/Constants';
import useConstant from '../../../../constants/useConstant';
import {
	ButtonsContainer,
	ContentContainer,
	DefaultButton,
	DefaultSecondaryButton,
	DefaultTableButton,
	FieldContainer,
	FieldLabel,
	FooterContainer,
	FormContainer,
	FormHeader,
	LoaderButton,
	MainContainer,
	PaddedContainer,
	SearchTextInput,
} from '../../../../custom-components';
import {useCodeListInfo, useFormattedDate, useMessageStatus} from '../../../../custom-functions';
import {USER_CLAIMS} from '../../../user-management/components/constants/UserClaims';
import {GetCodeListByIdRequest, MessageResponseList, MessageResponseStatuses, MessageResponseTypesModel, OptionsSelectedModel} from '../../models';
import {AddMessageResponseModel} from '../../models/requests/AddMessageResponseModel';
import {GetMessageResponseList} from '../../models/requests/GetMessageResponseList';
import {SubmitAddMessageResponse} from '../../models/requests/SubmitAddMessageResponse';
import * as system from '../../redux/SystemRedux';
import {
	getCodeListById,
	getMessageResponseList,
	sendAddMessageResponseList,
	sendCodeListById,
	sendGetMessageResponseList,
} from '../../redux/SystemService';
import '../sub-topic/SubTopic.css';
import CreateMessageResponse from './CreateMessageResponse';
import ReorderMessageResponse from './ReorderMessageResponse';
import EditMessageResponse from './EditMessageResponse';
import { ColDef, ColGroupDef } from 'ag-grid-community';


const FilterSchema = Yup.object().shape({
	messageResponseName: Yup.string(),
});

const initialValues = {
	messageResponseName: '',
};

const MessageResponseLists: React.FC = () => {
	// GET REDUX STORE
	const userAccess = useSelector<RootState>(({auth}) => auth.access, shallowEqual) as string;
	const systemData = useSelector<RootState>(({system}) => system.getMessageResponseList, shallowEqual) as any;
	const postData = useSelector<RootState>(({system}) => system.postMessageResponseList, shallowEqual) as any;
	const userAccessId = useSelector<RootState>(({auth}) => auth.userId, shallowEqual) as number;

	const dispatch = useDispatch();
	const {
		successResponse,
		HubConnected,
		SwalFailedMessage,
		SwalConfirmMessage,
		SwalServerErrorMessage,
		SwalMessageResponseMessage,
		SwalSuccessMessage,
	} = useConstant();
	// STATES
	const [selectedStatuses, setSelectedStatuses] = useState<any>('');
	const [selectedMessageStatus, setSelectedMessageStatus] = useState<any>('');
	const [codelistStatus, setCodeListStatus] = useState<any>('');
	const [loading, setLoading] = useState<boolean>(false);
	const [modalShow, setModalShow] = useState<boolean>(false);
	const [modalReorderShow, setModalReorderShow] = useState<boolean>(false);
	const [gridApi, setGridApi] = useState<any>(null);
	const [rowData, setRowData] = useState<Array<MessageResponseList>>([]);
	const [editModalShow, setEditModalShow] = useState<boolean>(false);
	const [dataId, setDataId] = useState<number>(0);
	const [condeInfo, setCondeInfo] = useState<any>([]);

	// VARIABLES
	const history = useHistory();
	const codeListData: any = useCodeListInfo(5);

	// WATHCERS

	// MOUNTED
	useEffect(() => {
		// CLEAR ALL DATA
		_clearStorage();
		_getList('', '');
	}, []);

	// THIS WILL CHECK IF TABLE DATA HAVE CHANGE
	useEffect(() => {
		setRowData(systemData);
	}, [systemData]);

	// THIS WILL CHECK IF ACTION TABLES HAVE CHANGE
	useEffect(() => {
		setModalShow(false);
		setRowData(systemData);
		setModalReorderShow(false);
		setEditModalShow(false);
	}, [postData]);

	useEffect(() => {
		if (condeInfo !== undefined) {
			let data = condeInfo.isActive === true ? {value: '1', label: 'Active'} : {value: '2', label: 'Inactive'};
			setCodeListStatus(data);
		}
	}, [condeInfo]);

	// THIS WILL CHECK CODE LIST INFO TO BE USE ON HEADERS
	useEffect(() => {
		setCondeInfo(codeListData);
	}, [codeListData]);

	const onGridReady = (params: any) => {
		setGridApi(params.api);
		params.api.paginationGoToPage(4);
		setRowData(systemData);
		params.api.sizeColumnsToFit();
	};

	// FORMIK FORM POST
	const formik = useFormik({
		initialValues,
		validationSchema: FilterSchema,
		onSubmit: (values, {setStatus, setSubmitting, resetForm}) => {
			setSubmitting(true);
			setLoading(true);

			// -- CHECK IF THERE IS PENDING ACTION NEED TO BE POST -- //
			const isProcced = _checkTransactions('SEARCH');
			// let selected: string = (selectedStatuses ? selectedStatuses.value.toString() : null)

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
				_clearStorage();
				// -- FETCH API -- //

				_getList(values.messageResponseName, poststatus);
			} else {
				swal({
					title: PROMPT_MESSAGES.ConfirmCloseTitle,
					text: PROMPT_MESSAGES.ConfirmCloseMessage,
					icon: SwalConfirmMessage.icon,
					buttons: [SwalConfirmMessage.btnNo, SwalConfirmMessage.btnYes],
					dangerMode: true,
				}).then((willUpdate) => {
					if (willUpdate) {
						_getList(values.messageResponseName, poststatus);
					}
				});
			}

			//resetForm()
			setSubmitting(false);
			setLoading(false);
		},
	});

	// METHODS
	const onPageSizeChanged = () => {
		let pageSize: any = document.getElementById('page-size');
		gridApi.paginationSetPageSize(Number(pageSize.value));
	};
	const _statusReorder = () => {
		const isProcced = _checkTransactions('REORDER');

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
					_clearStorage();
					_getList('', '');
				}
			});
		}
	};

	const onChangeSelectedStatues = (val: string) => {
		setSelectedStatuses(val);
	};
	const onChangeSelectedMessageStatus = (val: string) => {
		setSelectedMessageStatus(val);
	};
	const onChangeResponseCodeListStatus = (val: string) => {
		setCodeListStatus(val);
	};

	const _getList = (name: string, status: string) => {
		setTimeout(() => {
			//FETCH TO API
			const messagingHub = hubConnection.createHubConnenction();
			messagingHub
				.start()
				.then(() => {
					// CHECKING STATE CONNECTION
					if (messagingHub.state === HubConnected) {
						let messageStatusIds = Object.assign(Array<OptionsSelectedModel>(), selectedMessageStatus)
							.map((el: any) => el.value)
							.join(',');

						// PARAMETER TO PASS ON API GATEWAY //
						const request: GetMessageResponseList = {
							queueId: Guid.create().toString(),
							userId: userAccessId.toString(),
							messageResponseName: name,
							messageResponseStatus: status,
							messageStatusId: 0,
							messageStatusIds:
								messageStatusIds === ''
									? _getMessageStatusId().toString() === '0'
										? ''
										: _getMessageStatusId().toString()
									: messageStatusIds + ',' + _getMessageStatusId().toString(),
						};

						// REQUEST FIRST TO GATEWAY IF TRANSACTION WAS VALID
						sendGetMessageResponseList(request)
							.then((msgResponseList) => {
								// IF REQUEST IS SUCCESS THEN CONSUME CALLBACK API
								if (msgResponseList.status === successResponse) {
									messagingHub.on(request.queueId.toString(), (message) => {
										// CALLBACK API
										getMessageResponseList(message.cacheId)
											.then((dataResp) => {
												let resultData = Object.assign(new Array<MessageResponseList>(), dataResp.data);
												dispatch(system.actions.getMessageResponseList(resultData));
											})
											.catch(() => {
												setLoading(false);
											});
										messagingHub.off(request.queueId.toString());
										messagingHub.stop();
									});

									setTimeout(() => {
										if (messagingHub.state === HubConnected) {
											messagingHub.stop();
											setLoading(false);
										}
									}, 30000);
								} else {
									messagingHub.stop();
									swal(SwalServerErrorMessage.title, msgResponseList.data.message, SwalServerErrorMessage.icon);
								}
							})
							.catch(() => {
								messagingHub.stop();
								swal(SwalFailedMessage.title, SwalMessageResponseMessage.textErrorMessageResponseList, SwalFailedMessage.icon);
							});
					} else {
						swal(SwalServerErrorMessage.title, SwalServerErrorMessage.textError, SwalServerErrorMessage.icon);
					}
				})
				.catch((err) => console.log('Error while starting connection: ' + err));
		}, 1000);
	};
	const _deactivate = (data: MessageResponseList) => {
		const isProcced = _checkTransactions('CHANGE_STATUS');

		if (isProcced) {
			//NEW STATUS
			const newStatus = data.messageResponseStatus === true ? false : true;

			// FIRST GET INDEXT OF ITEM
			const postIndex = postData.findIndex((messageResponse: MessageResponseList) => messageResponse.messageResponseId === data.messageResponseId);

			//  -- PARAMETER FOR TABLE STORE -- //
			const request: MessageResponseList = {
				messageResponseId: data.messageResponseId,
				messageResponseName: data.messageResponseName,
				messageStatusId: data.messageStatusId,
				position: data.position,
				messageResponseStatus: newStatus,
				messageResponseStatuses: data.messageResponseStatuses,
				messageResponseTypes: data.messageResponseTypes,
				action: 'CHANGE_STATUS',
			};

			// REMOVE DATA FROM TANBLE BEFORE REINSERT ON REDUX STORE
			let filterData = systemData.filter((x: MessageResponseList) => x.messageResponseId != data.messageResponseId);
			// REINSERT UPDATED DATA
			let DataToTable = [...filterData, request];
			//DISPATCH DATA TO TABLE STORE
			dispatch(system.actions.getMessageResponseList(DataToTable));

			// CHECKING ON INSERT OR UPDATE
			if (postIndex < 0) {
				// IF NOT EXIST THEN ADD
				const newDataToStore = postData.concat(request);
				dispatch(system.actions.postMessageResponseList(newDataToStore));
			} else {
				// IF EXISIST THEN REMOVE FIRST
				let filteredData = postData.filter((x: MessageResponseList) => x.messageResponseId != data.messageResponseId);
				let updatedPostData = [...filteredData, request];
				dispatch(system.actions.postMessageResponseList(updatedPostData));
			}
		} else {
			// IF ANOTHER TRANSACTION EXIST THEN VERIFY EXISTING TRANSACTION WILL BE REMOVED AND TABLE WILL BE BACK TO ORIGINAL STATE
			swal({
				title: PROMPT_MESSAGES.ConfirmCloseTitle,
				text: PROMPT_MESSAGES.ConfirmCloseMessage,
				icon: SwalConfirmMessage.icon,
				buttons: [SwalConfirmMessage.btnNo, SwalConfirmMessage.btnYes],
				dangerMode: true,
			}).then((willUpdate) => {
				if (willUpdate) {
					dispatch(system.actions.getMessageResponseList([]));
					dispatch(system.actions.postMessageResponseList([]));
					_getList('', '');
				}
			});
		}
	};
	const _add = () => {
		const isProcced = _checkTransactions('ADD');

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
					dispatch(system.actions.getMessageResponseList([]));
					dispatch(system.actions.postMessageResponseList([]));
					_getList('', '');
				}
			});
		}
	};

	const _checkTransactions = (action: string) => {
		//-- CHECK TRANSACTION IF THERE IS OTHER PENDING TRANSACTION -- //
		let toPostData = postData ? postData : [];
		if (toPostData.length === 0) {
			return true;
		} else {
			const isExist = toPostData.some((item: MessageResponseList) => item.action === action);
			return isExist;
		}
	};
	const getCodeListInfo = () => {
		setTimeout(() => {
			const messagingHub = hubConnection.createHubConnenction();
			messagingHub.start().then(() => {
				const request: GetCodeListByIdRequest = {
					queueId: Guid.create().toString(),
					userId: userAccessId.toString(),
					codeListId: 5,
				};

				sendCodeListById(request)
					.then((respCodeList) => {
						if (respCodeList.status === successResponse) {
							messagingHub.on(request.queueId.toString(), (message) => {
								getCodeListById(message.cacheId)
									.then((returnDataList) => {
										const data = Object.assign(returnDataList.data);
										setCondeInfo(data);
									})
									.catch(() => {
										setLoading(false);
									});
								messagingHub.off(request.queueId.toString());
							});

							setTimeout(() => {
								if (messagingHub.state === HubConnected) {
									messagingHub.stop();
									setLoading(false);
								}
							}, 30000);
						} else {
							messagingHub.stop();
							swal(SwalServerErrorMessage.title, respCodeList.data.message, SwalServerErrorMessage.icon);
						}
					})
					.catch(() => {
						messagingHub.stop();
						swal(SwalFailedMessage.title, SwalMessageResponseMessage.textErrorMessageResponseList, SwalFailedMessage.icon);
					});
			});
		}, 1000);
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
				// CHECK PAGE CAME FROM NAVIGATE IF 0 THEN GO TO CODE LIST ELSE MESSAGE TYPES
				if (_getMessageStatusId() === 0) {
					_clearStorage();
					history.push('/system/code-list');
				} else {
					_clearStorage();
					history.push('/system/message-status-list');
				}
			}
		});
	};

	const _postTransaction = () => {
		swal({
			title: 'Confirmation',
			text: 'This action will update the Code List, please confirm',
			icon: 'warning',
			buttons: ['No', 'Yes'],
			dangerMode: true,
		}).then((willUpdate) => {
			if (willUpdate) {
				let updatedPostData = Array<AddMessageResponseModel>();

				// -- REMOLDING OF PARAMETER DUE TO BACKEND CHANGE OF PARAMETERS -- //
				postData.forEach((item: MessageResponseList) => {
					const requestData: AddMessageResponseModel = {
						id: item.messageResponseId,
						messageResponseName: item.messageResponseName,
						messageStatusIds: item.messageResponseStatuses.map((el: any) => el.messageStatusId.toString()),
						messageStatusId:
							_getMessageStatusId() === 0 && item.messageResponseStatuses.length > 0
								? item.messageResponseStatuses[0].messageStatusId
								: _getMessageStatusId(),
						position: item.position,
						isActive: item.messageResponseStatus,
						updatedBy: userAccessId,
						createdBy: userAccessId,
					};
					updatedPostData.push(requestData);
				});

				// // -- REQUEST PARAMETER -- //
				const requestTrans: SubmitAddMessageResponse = {
					queueId: Guid.create().toString(),
					codeListId: 5,
					isActive: codelistStatus.value.toString() === '1' ? true : false,
					userId: userAccessId.toString(),
					messageResponses: updatedPostData,
				};
				setTimeout(() => {
					const messagingHub = hubConnection.createHubConnenction();
					messagingHub
						.start()
						.then(() => {
							// CHECKING STATE CONNECTION
							if (messagingHub.state === HubConnected) {
								// REQUEST FIRST TO GATEWAY IF TRANSACTION WAS VALID
								sendAddMessageResponseList(requestTrans)
									.then((response) => {
										// IF REQUEST IS SUCCESS THEN CONSUME CALLBACK API
										if (response.status === successResponse) {
											messagingHub.on(requestTrans.queueId.toString(), (message) => {
												let resultData = JSON.parse(message.remarks);

												if (resultData.Status === successResponse) {
													swal(SwalSuccessMessage.title, SwalSuccessMessage.textSuccess, SwalSuccessMessage.icon);
													_clearStorage();
													getCodeListInfo();
													_getList('', '');
												} else {
													swal(SwalServerErrorMessage.title, SwalServerErrorMessage.textError, SwalServerErrorMessage.icon);
													_clearStorage();
													getCodeListInfo();
													_getList('', '');
												}

												messagingHub.off(requestTrans.queueId.toString());
												messagingHub.stop();
											});

											setTimeout(() => {
												if (messagingHub.state === HubConnected) {
													messagingHub.stop();
													setLoading(false);
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
							} else {
								swal(SwalServerErrorMessage.title, SwalServerErrorMessage.textError, SwalServerErrorMessage.icon);
							}
						})
						.catch((err) => console.log('Error while starting connection: ' + err));
				}, 1000);
			}
		});
	};
	const _edit = (id: number) => {
		const isProceed = _checkTransactions('EDIT');

		if (isProceed) {
			setDataId(id);
			setEditModalShow(true);
		} else {
			// IF ANOTHER TRANSACTION EXIST THEN VERIFY EXISTING TRANSACTION WILL BE REMOVED AND TABLE WILL BE BACK TO ORIGINAL STATE
			swal({
				title: PROMPT_MESSAGES.ConfirmCloseTitle,
				text: PROMPT_MESSAGES.ConfirmCloseMessage,
				icon: SwalConfirmMessage.icon,
				buttons: [SwalConfirmMessage.btnNo, SwalConfirmMessage.btnYes],
				dangerMode: true,
			}).then((willUpdate) => {
				if (willUpdate) {
					_clearStorage();
					_getList('', '');
					setDataId(id);
					setEditModalShow(true);
				}
			});
		}
	};
	const _clearStorage = () => {
		dispatch(system.actions.getMessageResponseList([]));
		dispatch(system.actions.postMessageResponseList([]));
	};
	const _getMessageStatusId = () => {
		let pageId: number = 0;

		const pathArray = window.location.pathname.split('/');
		if (pathArray.length >= 4) {
			pageId = parseInt(pathArray[3]);
		}
		return pageId;
	};
	const _closeModals = () => {
		swal({
			title: PROMPT_MESSAGES.ConfirmCloseTitle,
			text: PROMPT_MESSAGES.ConfirmCloseMessage,
			icon: SwalConfirmMessage.icon,
			buttons: [SwalConfirmMessage.btnNo, SwalConfirmMessage.btnYes],
			dangerMode: true,
		}).then((willUpdate) => {
			if (willUpdate) {
				setModalShow(false);
				setEditModalShow(false);
			}
		});
	};

	const _closeReoderModal = () => {
		swal({
			title: PROMPT_MESSAGES.ConfirmCloseTitle,
			text: PROMPT_MESSAGES.ConfirmCloseMessage,
			icon: SwalConfirmMessage.icon,
			buttons: [SwalConfirmMessage.btnNo, SwalConfirmMessage.btnYes],
			dangerMode: true,
		}).then((willUpdate) => {
			if (willUpdate) {
				setModalReorderShow(false);
				_getList('', '');
			}
		});
	};

	const lowerCaseMessageResponseName = (valueA: string, valueB: string) => {
		return valueA.toLowerCase().localeCompare(valueB.toLowerCase());
	};

	// TABLE CONTENT
	const columnDefs : (ColDef<MessageResponseList> | ColGroupDef<MessageResponseList>)[] =  [
		{
			headerName: 'Order',
			field: 'position',
			maxWidth: 100,
			sort: 'asc' as 'asc',
			cellRenderer: (params: any) => <>{params ? <div>{params.data.position.toString()}</div> : null}</>,
		},
		{headerName: 'Message Response Name', field: 'messageResponseName', comparator: lowerCaseMessageResponseName},
		{
			headerName: 'Message Response Status',
			field: 'messageResponseStatus',
			cellRenderer: (params: any) => <>{params ? <div>{params.data.messageResponseStatus === true ? 'Active' : 'Inactive'}</div> : null}</>,
		},
		{
			headerName: 'Included To Message Status',
			field: 'messageResponseStatuses',
			autoHeight: true,
			minWidth: 350,
			cellRenderer: (params: any) =>
				params ? (
					<div style={{height: 'auto', whiteSpace: 'pre-wrap', overflowWrap: 'break-word'}}>
						{params.data.messageResponseStatuses.map((x: MessageResponseStatuses, idx: number) =>
							x.messageStatusId === _getMessageStatusId()
								? null
								: `${x.messageStatusName}${idx !== params.data.messageResponseStatuses.length - 1 ? ', ' : ''}`
						)}
					</div>
				) : null,
		},

		{
			headerName: 'Message Type',
			field: 'messageResponseTypes',
			autoHeight: true,
			minWidth: 340,
			cellRenderer: (params: any) => (
				<>
					{params ? (
						<div style={{height: 'auto', whiteSpace: 'pre-wrap', overflowWrap: 'break-word'}}>
							{params.data?.messageResponseTypes?.map((x: MessageResponseTypesModel) => x.messageTypeName)}
						</div>
					) : null}
				</>
			),
		},
		{
			headerName: 'Action',
			field: 'position',
			cellRenderer: (params: any) => (
				<>
					{params.data.messageResponseId != 0 ? (
						<ButtonGroup aria-label='Basic example'>
							<div className='d-flex justify-content-center flex-shrink-0'>
								<div style={{width: 100}}>
									<DefaultTableButton
										access={userAccess.includes(USER_CLAIMS.MessageResponseWrite)}
										title={params.data.messageResponseStatus === true ? 'Deactivate' : 'Activate'}
										onClick={() => _deactivate(params.data)}
									/>
								</div>
								<div>
									<DefaultTableButton
										access={userAccess.includes(USER_CLAIMS.MessageResponseWrite)}
										title={'Edit'}
										onClick={() => _edit(params.data.messageResponseId)}
									/>
								</div>
							</div>
						</ButtonGroup>
					) : null}
				</>
			),
		},
	];
	// RETURN
	return (
		<FormContainer onSubmit={formik.handleSubmit}>
			<MainContainer>
				<FormHeader headerLabel={'Search Message Response'} />
				<ContentContainer>
					<Row>
						<Col sm={2}>Code List Name</Col>
						<Col sm={2}>Code List Type</Col>
						<Col sm={2}>Parent</Col>
						<Col sm={2}>Field Type</Col>
						<Col sm={2}>Code List Status</Col>
					</Row>
					<Row>
						<Col sm={2}>
							<b>{condeInfo ? condeInfo.codeListName : ''}</b>
						</Col>
						<Col sm={2}>
							<b>{condeInfo ? condeInfo.codeListTypeName : ''}</b>
						</Col>
						<Col sm={2}>
							<b>{condeInfo ? condeInfo.parentCodeListName : ''}</b>
						</Col>
						<Col sm={2}>
							<b>{condeInfo ? condeInfo.fieldTypeName : ''}</b>
						</Col>
						<Col sm={2}>
							<Select
								native
								size='small'
								style={{width: '100%'}}
								options={[
									{value: '1', label: 'Active'},
									{value: '2', label: 'Inactive'},
								]}
								onChange={onChangeResponseCodeListStatus}
								value={codelistStatus}
							/>
						</Col>
					</Row>
					<div style={{marginTop: 10}}>
						<Row>
							<Col sm={2}>Created Date</Col>
							<Col sm={2}>Created By</Col>
							<Col sm={2}>Last Modified Date</Col>
							<Col sm={2}>Modified By</Col>
						</Row>
						<Row>
							<Col sm={2}>
								<b>{useFormattedDate(condeInfo ? condeInfo.createdDate : '')} </b>
							</Col>
							<Col sm={2}>
								<b>{condeInfo ? condeInfo.createdByName : ''}</b>
							</Col>
							<Col sm={2}>
								<b>{useFormattedDate(condeInfo ? condeInfo.updatedDate : '')}</b>
							</Col>
							<Col sm={2}>
								<b>{condeInfo ? condeInfo.updatedByName : ''}</b>
							</Col>
						</Row>
					</div>
					<div className='separator border-4 my-8' />
					<Row>
						<Col sm={4}>
							<FieldContainer>
								<FieldLabel title={'Message Response Name'} />
								<SearchTextInput fieldSize={'12'} ariaLabel={'Message Response Name'} {...formik.getFieldProps('messageResponseName')} />
							</FieldContainer>
						</Col>
						<Col sm={3}>
							<FieldContainer>
								<FieldLabel title={'Message Response Status'} />
								<div className='col-sm-12'>
									<Select
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
						<Col sm={5}>
							<FieldContainer>
								<FieldLabel title={'Included to Message Status'} />
								<div className='col-sm-12'>
									<Select
										isMulti
										size='small'
										style={{width: '100%'}}
										options={useMessageStatus(_getMessageStatusId())}
										onChange={onChangeSelectedMessageStatus}
										value={selectedMessageStatus}
									/>
								</div>
							</FieldContainer>
						</Col>
					</Row>

					<ButtonsContainer>
						<LoaderButton
							access={userAccess.includes(USER_CLAIMS.MessageResponseRead)}
							loading={loading}
							title={'Search'}
							loadingTitle={' Please wait...'}
							disabled={formik.isSubmitting}
						/>
						<DefaultSecondaryButton access={userAccess.includes(USER_CLAIMS.MessageResponseWrite)} title={'Add New'} onClick={() => _add()} />
						<DefaultSecondaryButton
							access={userAccess.includes(USER_CLAIMS.MessageResponseWrite)}
							title={'Change Order'}
							onClick={() => _statusReorder()}
						/>
					</ButtonsContainer>

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

					<div className='ag-theme-quartz' style={{height: 400, width: '100%'}}>
						<AgGridReact
							rowData={rowData}
							defaultColDef={{
								sortable: true,
								resizable: true,
							}}
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
						<DefaultButton access={userAccess.includes(USER_CLAIMS.MessageResponseWrite)} title={'Submit'} onClick={_postTransaction} />
						<DefaultSecondaryButton access={userAccess.includes(USER_CLAIMS.MessageResponseRead)} title={'Back'} onClick={_back} />
					</PaddedContainer>
				</FooterContainer>

				{/* modal for add topic*/}
				<CreateMessageResponse messageStatusId={_getMessageStatusId()} showForm={modalShow} closeModal={_closeModals} />
				{/* end modal for add topic */}

				{/* modal for reorder topic*/}
				<ReorderMessageResponse messageStatusId={_getMessageStatusId()} showForm={modalReorderShow} closeModal={_closeReoderModal} />
				{/* end modal for reorder topic */}

				<EditMessageResponse messageStatusId={_getMessageStatusId()} Id={dataId} showForm={editModalShow} closeModal={_closeModals} />
			</MainContainer>
		</FormContainer>
	);
};

export default MessageResponseLists;

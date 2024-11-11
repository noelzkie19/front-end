import {HubConnection} from '@microsoft/signalr';
import {AgGridReact} from 'ag-grid-react';
import {AxiosResponse} from 'axios';
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
	BasicFieldLabel,
	ButtonsContainer,
	ContentContainer,
	DefaultButton,
	DefaultSecondaryButton,
	DefaultTableButton,
	FieldContainer,
	FooterContainer,
	FormContainer,
	FormHeader,
	LoaderButton,
	MainContainer,
	PaddedContainer,
	SearchTextInput,
} from '../../../../custom-components';
import {useCodeListInfo, useFormattedDate} from '../../../../custom-functions';
import useSystemHooks from '../../../../custom-functions/system/useSystemHooks';
import {USER_CLAIMS} from '../../../user-management/components/constants/UserClaims';
import {
	AddFeedbackTypeRequestModel,
	FeedbackTypeFilterModel,
	FeedBackTypeResponse,
	OptionsSelectedModel,
} from '../../models';
import {FeedBackTypePostModel} from '../../models/requests/FeedBackTypePostModel';
import * as system from '../../redux/SystemRedux';
import {addFeedbackTypeList} from '../../redux/SystemService';
import '../sub-topic/SubTopic.css';
import AddFeedBackTypes from './AddFeedBackTypes';
import ReorderFeedBacktype from './ReorderFeedBacktype';
import UpdateFeedBackType from './UpdateFeedBackType';
import { ColDef, ColGroupDef } from 'ag-grid-community';

const FilterSchema = Yup.object().shape({
	messageTypeName: Yup.string(),
});

const initialValues = {
	feedbackTypeName: '',
};

const FeedBacktypeList: React.FC = () => {
	// GET REDUX STORE
	const userAccess = useSelector<RootState>(({auth}) => auth.access, shallowEqual) as string;
	const systemData = useSelector<RootState>(({system}) => system.getFeedbackTypes, shallowEqual) as any;
	const postData = useSelector<RootState>(({system}) => system.postFeedbackTypes, shallowEqual) as any;
	const userAccessId = useSelector<RootState>(({auth}) => auth.userId, shallowEqual) as number;

	const dispatch = useDispatch();
	const {successResponse, HubConnected, SwalSuccessMessage, SwalServerErrorMessage, SwalFailedMessage, SwalConfirmMessage, SwalFeedbackMessage} =
		useConstant();
	const {getFeedbackTypeListInfo} = useSystemHooks();
	// STATES
	const [selectedStatuses, setSelectedStatuses] = useState<any>('');
	const [codelistStatus, setCodelistStatus] = useState<any>('');
	const [loading, setLoading] = useState<boolean>(false);
	const [modalShow, setModalShow] = useState<boolean>(false);
	const [modalReorderShow, setModalReorderShow] = useState<boolean>(false);
	const [modalEditShow, setModalEditShow] = useState<boolean>(false);
	const [gridApi, setGridApi] = useState<any>(null);
	const [rowData, setRowData] = useState<Array<FeedBackTypeResponse>>([]);
	const [dataId, setDataId] = useState<number>(0);
	const [feedbackTypeCondeInfo, setFeedbackTypeCondeInfo] = useState<any>([]);

	// VARIABLES
	const history = useHistory();
	const codeListData: any = useCodeListInfo(6);

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

	useEffect(() => {
		if (feedbackTypeCondeInfo !== undefined) {
			let data = feedbackTypeCondeInfo.isActive === true ? {value: '1', label: 'Active'} : {value: '2', label: 'Inactive'};
			setCodelistStatus(data);
		}
	}, [feedbackTypeCondeInfo]);

	// THIS WILL CHECK CODE LIST INFO TO BE USE ON HEADERS
	useEffect(() => {
		setFeedbackTypeCondeInfo(codeListData);
	}, [codeListData]);

	// THIS WILL CHECK IF ACTION TABLES HAVE CHANGE
	useEffect(() => {
		setModalReorderShow(false);
		setModalShow(false);
		setRowData(systemData);
		setModalEditShow(false);
	}, [postData]);

	const onGridReady = (params: any) => {
		setGridApi(params.api);
		params.api.paginationGoToPage(4);
		setRowData(systemData);
		params.api.sizeColumnsToFit();
	};

	const _back = () => {
		swal({
			title: PROMPT_MESSAGES.ConfirmCloseTitle,
			text: PROMPT_MESSAGES.ConfirmCloseMessage,
			icon: SwalConfirmMessage.icon,
			buttons: [SwalConfirmMessage.btnNo, SwalConfirmMessage.btnYes],
			dangerMode: true,
		}).then((willUpdate) => {
			if (willUpdate) {
				_clearStorage();
				history.push('/system/code-list');
			}
		});
	};

	const _view = (id: number) => {
		swal({
			title: PROMPT_MESSAGES.ConfirmCloseTitle,
			text: PROMPT_MESSAGES.ConfirmCloseMessage,
			icon: SwalConfirmMessage.icon,
			buttons: [SwalConfirmMessage.btnNo, SwalConfirmMessage.btnYes],
			dangerMode: true,
		}).then((willUpdate) => {
			if (willUpdate) {
				_clearStorage();
				history.push(`/system/feedback-category-list/${id}`);
			}
		});
	};

	const _clearStorage = () => {
		dispatch(system.actions.getFeedbackTypes([]));
		dispatch(system.actions.postFeedbackTypes([]));
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

			let name: string = values.feedbackTypeName === '' ? '' : values.feedbackTypeName;

			let selectedStatus: string = Object.assign(Array<OptionsSelectedModel>(), selectedStatuses)
				.map((el: OptionsSelectedModel) => el.value)
				.join(',');

			let status: string = '';

			if (selectedStatus.toString() === '1') {
				status = '1';
			} else if (selectedStatus.toString() === '0') {
				status = '0';
			} else {
				status = '';
			}

			if (isProcced) {
				// CLEAN FIRST REDUX STORAGE
				_clearStorage();
				// -- FETCH API -- //
				_getList(name, status);
			} else {
				swal({
					title: PROMPT_MESSAGES.ConfirmCloseTitle,
					text: PROMPT_MESSAGES.ConfirmCloseMessage,
					icon: SwalConfirmMessage.icon,
					buttons: [SwalConfirmMessage.btnNo, SwalConfirmMessage.btnYes],
					dangerMode: true,
				}).then((willUpdate) => {
					if (willUpdate) {
						_getList(name, status);
					}
				});
			}

			//resetForm()
			setSubmitting(false);
			setLoading(false);
		},
	});

	// METHODS
	const onChangeSelectedStatues = (val: string) => {
		setSelectedStatuses(val);
	};
	const onChangeCodeListStatus = (val: string) => {
		setCodelistStatus(val);
	};
	const onPageSizeChanged = () => {
		const pageSize: any = document.getElementById('page-size');
		gridApi.paginationSetPageSize(Number(pageSize.value));
	};
	const _reorder = () => {
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
	const _getList = (name: string, status: string) => {
		const request: FeedbackTypeFilterModel = {
			userId: userAccessId.toString(),
			queueId: Guid.create().toString(),
			feedbackTypeName: name === '' ? null : name,
			feedbackTypeStatus: status === '' ? null : status,
		};
		getFeedbackTypeListInfo(request, 'list');
	};
	const _changeStatus = (data: FeedBackTypeResponse) => {
		const isProcced = _checkTransactions('CHANGE_STATUS');

		const newStatus = data.feedbackTypeStatus === 'true' ? 'false' : 'true';

		if (isProcced) {
			// ----------------------------------- DISPATCH OF DATA FOR TABLE AND POST REDUX-----------------------------------------//

			const request: FeedBackTypeResponse = {
				codeListId: data.codeListId,
				codeListName: data.codeListName,
				feedbackTypeId: data.feedbackTypeId,
				feedbackTypeName: data.feedbackTypeName,
				feedbackTypeStatus: newStatus,
				position: data.position,
				action: 'CHANGE_STATUS',
			};

			// REMOVE DATA FROM TANBLE BEFORE REINSERT ON REDUX STORE
			let filterData = systemData.filter((x: FeedBackTypeResponse) => x.feedbackTypeId != data.feedbackTypeId);
			// REINSERT UPDATED DATA
			let DataToTable = [...filterData, request];
			//DISPATCH DATA TO TABLE STORE
			dispatch(system.actions.getFeedbackTypes(DataToTable));

			// FIRST GET INDEXT OF ITEM
			const postIndex = postData.findIndex((x: FeedBackTypeResponse) => x.feedbackTypeId === data.feedbackTypeId);

			// CHECKING ON INSERT OR UPDATE
			if (postIndex < 0) {
				// IF NOT EXIST THEN ADD
				const newDataToStore = postData.concat(request);
				dispatch(system.actions.postFeedbackTypes(newDataToStore));
			} else {
				// IF EXISIST THEN REMOVE FIRST
				let filteredData = postData.filter((x: FeedBackTypeResponse) => x.feedbackTypeId != data.feedbackTypeId);
				let updatedPostData = [...filteredData, request];
				dispatch(system.actions.postFeedbackTypes(updatedPostData));
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
					dispatch(system.actions.getFeedbackTypes([]));
					dispatch(system.actions.postFeedbackTypes([]));
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
					dispatch(system.actions.getFeedbackTypes([]));
					dispatch(system.actions.postFeedbackTypes([]));
					_getList('', '');
					setModalShow(true);
				}
			});
		}
	};
	const _checkTransactions = (action: string) => {
		//-- CHECK TRANSACTION IF THERE IS OTHER PENDING TRANSACTION -- //
		let toPostData = postData || [];
		if (toPostData.length === 0) {
			return true;
		} else {
			const isExist = toPostData.some((item: FeedBackTypeResponse) => item.action === action);
			return isExist;
		}
	};
	const _validatePostTransaction = () => {
		let isError: boolean = false;

		if (codelistStatus === null) {
			swal('Failed', 'Please Choose ', 'error');
		}
	};

	const _edit = (id: number) => {
		setDataId(id);
		setModalEditShow(true);
	};

	const _handleCloseModal = () => {
		swal({
			title: PROMPT_MESSAGES.ConfirmCloseTitle,
			text: PROMPT_MESSAGES.ConfirmCloseMessage,
			icon: SwalConfirmMessage.icon,
			buttons: [SwalConfirmMessage.btnNo, SwalConfirmMessage.btnYes],
			dangerMode: true,
		}).then((willCreate) => {
			if (willCreate) {
				setModalShow(false);
				setModalEditShow(false);
				setModalReorderShow(false);
			}
		});
	};

	const _timeoutHandler = (messagingHub: any) => {
		setTimeout(() => {
			if (messagingHub.state === HubConnected) {
				messagingHub.stop();
				setLoading(false);
			}
		}, 30000);
	};

	async function _createAddFeedbackTypeRequest() {
		let updatedPostData = Array<FeedBackTypePostModel>();

		// -- REMOLDING OF PARAMETER DUE TO BACKEND CHANGE OF PARAMETERS -- //
		postData.forEach((item: FeedBackTypeResponse) => {
			const requestData: FeedBackTypePostModel = {
				feedbackTypeId: item.feedbackTypeId,
				feedbackTypeName: item.feedbackTypeName,
				position: item.position,
				feedbackTypeStatus: item.feedbackTypeStatus === 'true' ? '1' : '2',
				updatedBy: userAccessId,
				createdBy: userAccessId,
			};
			updatedPostData.push(requestData);
		});

		// // -- REQUEST PARAMETER -- //
		const request: AddFeedbackTypeRequestModel = {
			codeListId: 6,
			codeListStatus: codelistStatus.value,
			feedbackType: updatedPostData,
			queueId: Guid.create().toString(),
			userId: userAccessId.toString(),
		};

		return request;
	}

	const processAddFeedbackTypeListReturn = (messagingHub: HubConnection, response: AxiosResponse<any>, request: AddFeedbackTypeRequestModel) => {
		// IF REQUEST IS SUCCESS THEN CONSUME CALLBACK API
		if (response.status === successResponse) {
			messagingHub.on(request.queueId.toString(), (message) => {
				let resultData = JSON.parse(message.remarks);
				if (resultData.Status === successResponse) {
					swal(SwalSuccessMessage.title, SwalSuccessMessage.textSuccess, SwalSuccessMessage.icon);
					_getList('', '');
					_clearStorage();
				} else {
					swal(SwalServerErrorMessage.title, SwalServerErrorMessage.textError, SwalServerErrorMessage.icon);
				}
				setLoading(false);
				messagingHub.off(request.queueId.toString());
				messagingHub.stop();
			});
			_timeoutHandler(messagingHub);
		} else {
			swal(SwalServerErrorMessage.title, response.data.message, SwalServerErrorMessage.icon);
			messagingHub.stop();
		}
	};

	const _postTransaction = () => {
		swal({
			title: PROMPT_MESSAGES.ConfirmSubmitTitle,
			text: PROMPT_MESSAGES.ConfirmSubmitMessageEdit,
			icon: SwalConfirmMessage.icon,
			buttons: [SwalConfirmMessage.btnNo, SwalConfirmMessage.btnYes],
			dangerMode: true,
		}).then(async (willUpdate) => {
			if (willUpdate) {
				const request = await _createAddFeedbackTypeRequest();
				setTimeout(() => {
					const messagingHub = hubConnection.createHubConnenction();
					messagingHub
						.start()
						.then(() => {
							// CHECKING STATE CONNECTION
							if (messagingHub.state === HubConnected) {
								// REQUEST FIRST TO GATEWAY IF TRANSACTION WAS VALID
								addFeedbackTypeList(request)
									.then((response) => {
										processAddFeedbackTypeListReturn(messagingHub, response, request);
									})
									.catch(() => {
										swal(SwalFailedMessage.title, SwalFeedbackMessage.textErrorFeedbackList('feedback type'), SwalFailedMessage.icon);
										messagingHub.stop();
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

	const feedbackTypeListOrder = (params: any) => <>{params ? <div>{params.data.position}</div> : null}</>;
	const feedbackTypeListStatus = (params: any) => (
		<>{params ? <div>{params.data.feedbackTypeStatus === 'true' ? 'Active' : 'Inactive'}</div> : null}</>
	);
	const feedbackTypeListAction = (params: any) => (
		<>
			{params.data.feedbackTypeId != 0 ? (
				<ButtonGroup aria-label='Basic example'>
					<div className='d-flex justify-content-center flex-shrink-0'>
						<div style={{minWidth: 100}}>
							<DefaultTableButton
								className={'btn btn-outline-dark btn-sm px-4 btn-mlab-custom'}
								access={userAccess.includes(USER_CLAIMS.FeedbackTypeWrite)}
								title={params.data.feedbackTypeStatus === 'true' ? 'Deactivate' : 'Activate'}
								onClick={() => _changeStatus(params.data)}
							/>
						</div>
						<DefaultTableButton
							access={userAccess.includes(USER_CLAIMS.FeedbackTypeRead)}
							title={'View Feedback Category'}
							onClick={() => _view(params.data.feedbackTypeId)}
						/>
					</div>
				</ButtonGroup>
			) : null}
		</>
	);

	const lowerCaseFeedbackTypeName = (valueA: string, valueB: string) => {
		return valueA.toLowerCase().localeCompare(valueB.toLowerCase());
	};

	// TABLE CONTENT
	const columnDefs : (ColDef<FeedBackTypeResponse> | ColGroupDef<FeedBackTypeResponse>)[] =  [
		{
			headerName: 'Order',
			field: 'position',
			sort: 'asc' as 'asc',
			cellRenderer: feedbackTypeListOrder,
		},
		{headerName: 'Feedback Type Name', field: 'feedbackTypeName', comparator: lowerCaseFeedbackTypeName},
		{
			headerName: 'Feedback Type Status',
			field: 'feedbackTypeStatus',
			cellRenderer: feedbackTypeListStatus,
		},
		{
			headerName: 'Action',
			field: 'position',
			minWidth: 350,
			cellRenderer: feedbackTypeListAction,
		},
	];
	// RETURN
	return (
		<FormContainer onSubmit={formik.handleSubmit}>
			<MainContainer>
				<FormHeader headerLabel={'Edit Feedback Type'} />
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
							<b>{feedbackTypeCondeInfo ? feedbackTypeCondeInfo.codeListName : ''}</b>
						</Col>
						<Col sm={2}>
							<b>{feedbackTypeCondeInfo ? feedbackTypeCondeInfo.codeListTypeName : ''}</b>
						</Col>
						<Col sm={2}>
							<b>{feedbackTypeCondeInfo ? feedbackTypeCondeInfo.parentCodeListName : ''}</b>
						</Col>
						<Col sm={2}>
							<b>{feedbackTypeCondeInfo ? feedbackTypeCondeInfo.fieldTypeName : ''}</b>
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
								onChange={onChangeCodeListStatus}
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
							<Col sm={2}></Col>
						</Row>
						<Row>
							<Col sm={2}>
								<b>{useFormattedDate(feedbackTypeCondeInfo?.createdDate ? feedbackTypeCondeInfo.createdDate : '')}</b>
							</Col>
							<Col sm={2}>
								<b>{feedbackTypeCondeInfo ? feedbackTypeCondeInfo.createdByName : ''}</b>
							</Col>
							<Col sm={2}>
								<b>{useFormattedDate(feedbackTypeCondeInfo?.updatedDate ? feedbackTypeCondeInfo?.updatedDate : '')}</b>
							</Col>
							<Col sm={2}>
								<b>{feedbackTypeCondeInfo ? feedbackTypeCondeInfo.updatedByName : ''}</b>
							</Col>
							<Col sm={2}></Col>
						</Row>
					</div>
					<div className='separator border-4 my-8' />
					<Row>
						<Col sm={4}>
							<FieldContainer>
								<BasicFieldLabel title='Feedback Type Name' />
								<SearchTextInput fieldSize={'12'} ariaLabel={'Feedback Type Name'} {...formik.getFieldProps('feedbackTypeName')} />
							</FieldContainer>
						</Col>
						<Col sm={3}>
							<FieldContainer>
								<BasicFieldLabel title='Feedback Type Status' />
								<div className='col-sm-12'>
									<Select
										isMulti
										size='small'
										style={{width: '100%'}}
										options={[
											{value: '1', label: 'Active'},
											{value: '0', label: 'Inactive'},
										]}
										onChange={onChangeSelectedStatues}
										value={selectedStatuses}
									/>
								</div>
							</FieldContainer>
						</Col>
					</Row>
					<div>
						<ButtonsContainer>
							<LoaderButton
								access={userAccess.includes(USER_CLAIMS.FeedbackTypeRead)}
								loading={loading}
								title={'Search'}
								loadingTitle={' Please wait...'}
								disabled={formik.isSubmitting}
							/>
							<DefaultSecondaryButton access={userAccess.includes(USER_CLAIMS.FeedbackTypeWrite)} title={'Add New'} onClick={() => _add()} />
							<DefaultSecondaryButton access={userAccess.includes(USER_CLAIMS.FeedbackTypeWrite)} title={'Change Order'} onClick={() => _reorder()} />
						</ButtonsContainer>
					</div>

					<FieldContainer>
						<div className='example-header mt-5'>
							Show{''}
							<select onChange={() => onPageSizeChanged()} id='page-size' style={{margin: 5}}>
								<option value='10' selected={true}>
									10
								</option>
								<option value='100'>100</option>
								<option value='500'>500</option>
								<option value='1000'>1000</option>
							</select>
							{/*
							 */}
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
						<DefaultButton access={userAccess.includes(USER_CLAIMS.FeedbackTypeWrite)} title={'Submit'} onClick={_postTransaction} />
						<DefaultSecondaryButton access={userAccess.includes(USER_CLAIMS.FeedbackTypeRead)} title={'Back'} onClick={_back} />
					</PaddedContainer>
				</FooterContainer>

				<AddFeedBackTypes showForm={modalShow} closeModal={() => _handleCloseModal()} />

				<ReorderFeedBacktype showForm={modalReorderShow} closeModal={() => _handleCloseModal()} />

				<UpdateFeedBackType Id={dataId} showForm={modalEditShow} closeModal={() => _handleCloseModal()} />
			</MainContainer>
		</FormContainer>
	);
};

export default FeedBacktypeList;

import {AgGridReact} from 'ag-grid-react';
import 'datatables.net';
import 'datatables.net-dt';
import {Guid} from 'guid-typescript';
import React, {useEffect, useState} from 'react';
import {shallowEqual, useDispatch, useSelector} from 'react-redux';
import {useHistory} from 'react-router-dom';
import swal from 'sweetalert';
import {RootState} from '../../../../../setup';
import * as hubConnection from '../../../../../setup/hub/MessagingHub';
import {PROMPT_MESSAGES} from '../../../../constants/Constants';
import useConstant from '../../../../constants/useConstant';
import {
	ButtonsContainer,
	ContentContainer,
	DefaultButton,
	DefaultPrimaryButton,
	DefaultSecondaryButton,
	DefaultTableButton,
	FormGroupContainer,
	FormHeader,
	MainContainer,
	PaddedContainer,
} from '../../../../custom-components';
import FooterContainer from '../../../../custom-components/containers/FooterContainer';
import ReorderListModal from '../../../../custom-components/modals/ReorderListModal';
import {useFormattedDate} from '../../../../custom-functions';
import {disableSplashScreen, enableSplashScreen} from '../../../../utils/helper';
import {USER_CLAIMS} from '../../../user-management/components/constants/UserClaims';
import {GetSurveyQuestionByIdRequestModel} from '../../models';
import {SurveyQuestionAnswerModel} from '../../models/SurveyQuestionAnswerModel';
import {SurveyQuestionModel} from '../../models/SurveyQuestionModel';
import {SaveSurveyQuestionRequestModel} from '../../models/requests/SaveSurveyQuestionRequestModel';
import * as systemManagement from '../../redux/SystemRedux';
import {getSurveyQuestionById, getSurveyQuestionByIdResult, saveSurveyQuestion, saveSurveyQuestionResult} from '../../redux/SystemService';
import {FILTER_STATUS_OPTIONS, STATUS_OPTIONS} from '../constants/SelectOptions';
import CreateQuestionAnswerModal from './modals/CreateQuestionAnswerModal';
import { ColDef, ColGroupDef } from 'ag-grid-community';

const reorderColumns = [
	{
		title: 'Order',
		field:  'orderNo',
	},
	{
		title: 'Survey Answer Name',
		field:  'name',
	},
];

const columnDefs = [
	{headerName: 'Order', field: 'orderNo', rowDrag: true},
	{headerName: 'Subtopic Name', field: 'name'},
];
const EditSurveyQuestion: React.FC = () => {
	let questionId: string = '';
	// Get Redux Store
	const messagingHub = hubConnection.createHubConnenction();
	const userAccessId = useSelector<RootState>(({auth}) => auth.userId, shallowEqual) as number;
	const history = useHistory();

	// States
	const dispatch = useDispatch();
	const userAccess = useSelector<RootState>(({auth}) => auth.access, shallowEqual) as string;
	const [showTable, setShowTable] = useState(false);
	const [pageId, setPageId] = useState('');
	const [statusField, setStatusField] = useState('true');
	const [answerList, setAnswerList] = useState<Array<SurveyQuestionAnswerModel>>([]);
	const [showAddAnswerModal, setShowAddAnswerModal] = useState(false);
	const [showReorderModal, setShowReorderModal] = useState(false);
	const [answerNameFilter, setAnswerNameFilter] = useState('');
	const [answerStatusFilter, setAnswerStatusFilter] = useState('');
	const [surveyQuestionInfo, setSurveyQuestionInfo] = useState<SurveyQuestionModel>();
	const [addCount, setAddCount] = useState(0);
	const [reorderFlag, setReorderFlag] = useState(false);

	const answerListState = useSelector<RootState>(({system}) => system.questionAnswers, shallowEqual) as SurveyQuestionAnswerModel[];
	const {HubConnected, successResponse, SwalConfirmMessage} = useConstant();

	// Effects
	useEffect(() => {
		const pathArray = window.location.pathname.split('/');
		if (pathArray.length >= 4) {
			questionId = pathArray[3];
			setPageId(questionId);
			getSurveyQuestionInfo();
		}
	}, []);

	useEffect(() => {
		setAddCount(answerListState.filter((i) => i.id === 0).length);
		setAnswerList(answerListState);
	}, [answerListState]);

	const getSurveyQuestionByIdResultCallback = (_cacheId: string) => {
		getSurveyQuestionByIdResult(_cacheId)
			.then((returnData) => {
				const item = returnData.data;
				if (item === undefined) {
					swal('ERROR', 'Cannot find Survey Question', 'error').catch(() => {});
				} else {
					const data = Object.assign(returnData.data);
					setSurveyQuestionInfo(data);
					setStatusField(data.isActive.toString());
					//setAnswerList(data.surveyQuestionAnswers)
					dispatch(systemManagement.actions.getSurveyQuestionAnswers(data.surveyQuestionAnswers));
					if (item.fieldTypeName !== 'Text Input' && item.fieldTypeName !== 'Multiline Text Input') {
						// Do not load Table if fieldtype is text or textarea
						setShowTable(true);
					}
				}
			})
			.catch(() => {});
	};

	// Methods
	const getSurveyQuestionInfo = () => {
		enableSplashScreen();
		messagingHub
			.start()
			.then(() => {
				const request: GetSurveyQuestionByIdRequestModel = {
					surveyQuestionId: +questionId,
					userId: userAccessId.toString(),
					queueId: Guid.create().toString(),
				};
				getSurveyQuestionById(request)
					.then(() => {
						messagingHub.on(request.queueId.toString(), (message) => {
							getSurveyQuestionByIdResultCallback(message.cacheId);
							messagingHub.off(request.queueId.toString());
						});

						setTimeout(() => {
							if (messagingHub.state === HubConnected) {
								messagingHub.stop().catch(() => {});
							}
						}, 30000);
					})
					.catch(() => {});
				disableSplashScreen();
			})
			.catch(() => {});
	};

	const getSurveyQuestionByIdResultCallbackApi = (_cacheId: string, callback?: any) => {
		getSurveyQuestionByIdResult(_cacheId)
			.then((returnData) => {
				const item = returnData.data;
				if (item === undefined) {
					swal('ERROR', 'Cannot find Survey Question', 'error').catch(() => {});
				} else {
					const data = Object.assign(returnData.data);
					dispatch(systemManagement.actions.getSurveyQuestionAnswers(data.surveyQuestionAnswers));
					if (callback) {
						callback();
					}
				}
			})
			.catch(() => {});
	};

	const getSurveyQuestionList = (callback?: any) => {
		messagingHub
			.start()
			.then(() => {
				const request: GetSurveyQuestionByIdRequestModel = {
					surveyQuestionId: +pageId,
					userId: userAccessId.toString(),
					queueId: Guid.create().toString(),
				};
				getSurveyQuestionById(request)
					.then(() => {
						messagingHub.on(request.queueId.toString(), (message) => {
							getSurveyQuestionByIdResultCallbackApi(message.cacheId, callback);
							messagingHub.off(request.queueId.toString());
						});

						setTimeout(() => {
							if (messagingHub.state === HubConnected) {
								messagingHub.stop().catch(() => {});
							}
						}, 30000);
					})
					.catch(() => {});
				disableSplashScreen();
			})
			.catch(() => {});
	};

	const handleSearchAnswer = () => {
		if (surveyQuestionInfo !== undefined) {
			const filteredList = answerListState.filter(
				(i) =>
					(answerNameFilter === '' || i.name.includes(answerNameFilter)) &&
					(answerStatusFilter === '' || i.status === (answerStatusFilter !== 'false'))
			);

			setAnswerList([...filteredList]);
		}
	};

	const handleShowAddAnswerModal = () => {
		if (reorderFlag) {
			swal({
				title: 'Confirmation',
				text: 'Pending actions not posted will be lost if you proceed, please confirm',
				icon: 'warning',
				buttons: [SwalConfirmMessage.btnNo, SwalConfirmMessage.btnYes],
				dangerMode: true,
			})
				.then((willRedirect) => {
					if (willRedirect) {
						getSurveyQuestionList();
						handleShowAddModal();
					}
				})
				.catch(() => {});
		} else {
			handleShowAddModal();
		}
	};

	const handleShowAddModal = () => {
		setShowAddAnswerModal(!showAddAnswerModal);
	};

	const confirmChangeOrder = () => {
		if (addCount > 0) {
			swal({
				title: 'Confirmation',
				text: 'Pending actions not posted will be lost if you proceed, please confirm',
				icon: 'warning',
				buttons: [SwalConfirmMessage.btnNo, SwalConfirmMessage.btnYes],
				dangerMode: true,
			})
				.then((willRedirect) => {
					if (willRedirect) {
						setReorderFlag(true);
						getSurveyQuestionList(handleChangeOrder);
					}
				})
				.catch(() => {});
		} else {
			setReorderFlag(true);
			handleChangeOrder();
		}
	};

	const handleChangeOrder = () => {
		setShowReorderModal(!showReorderModal);
	};

	const handleDeactivate = (data: any) => {
		const item = answerListState.find((i) => i.name === data.name);
		if (item !== undefined) {
			item.status = !item.status;
			const newList = answerListState.map((cat: SurveyQuestionAnswerModel) => {
				if (item.name !== cat.name) {
					return cat;
				}
				return {...cat, item};
			});
			dispatch(systemManagement.actions.getSurveyQuestionAnswers(newList));
		}
	};

	const handleCreateSurveyAnswer = (val: SurveyQuestionAnswerModel) => {
		handleShowAddModal();
		val.orderNo = answerListState && answerListState.length > 0 ? Math.max(...answerListState.map((i) => i.orderNo)) + 1 : 1;
		val.questionId = +pageId;
		dispatch(systemManagement.actions.getSurveyQuestionAnswers([...answerListState, val]));
	};

	const handleSaveReorderAnswer = (val: Array<SurveyQuestionAnswerModel>) => {
		dispatch(systemManagement.actions.getSurveyQuestionAnswers(val));
	};

	const onGridReady = (params: any) => {
		params.api.sizeColumnsToFit();
	};

	const handleQuestionStatusFieldOnChange = (e: any) => {
		setStatusField(e.target.value);
	};

	const handleAnswerNameFilterOnchange = (val: any) => {
		setAnswerNameFilter(val.target.value);
	};

	const handleAnswerStatusFilterOnchange = (val: any) => {
		setAnswerStatusFilter(val.target.value);
	};

	const answerListAction = (params: any) => 
		<DefaultTableButton
			className={'btn btn-outline-dark btn-sm px-4 btn-mlab-custom'}
			access={userAccess.includes(USER_CLAIMS.SurveyQuestionAndAnswerWrite)}
			title={params.data.status === true || params.data.status === 'true' ? 'Deactivate' : 'Activate'}
			onClick={() => handleDeactivate(params.data)}
		/>
		
	const confirmSubmitForm = () => {
		swal({
			title: PROMPT_MESSAGES.ConfirmSubmitTitle,
			text: PROMPT_MESSAGES.ConfirmSubmitMessage('Survey Question'),
			icon: 'warning',
			buttons: {
				cancel: {
					text: SwalConfirmMessage.btnNo,
					value: null,
					visible: true,
				},confirm: {
					text: SwalConfirmMessage.btnYes,
					value: true,
					visible: true,
				},
			},
			dangerMode: true,
		})
			.then((willCreate) => {
				if (willCreate) {
					submitSurveyQuestionForm();
				}
			})
			.catch(() => {});
	};

	const saveSurveyQuestionResultCallback = (_cacheId: string) => {
		saveSurveyQuestionResult(_cacheId)
			.then((returnData) => {
				if (returnData.data.status === successResponse) {
					history.push('/system/survey-question-list');
				} else {
					swal('Failed', returnData.data.message, 'error').catch(() => {});
				}
			})
			.catch(() => {});
	};

	const submitSurveyQuestionForm = () => {
		const formItem: SaveSurveyQuestionRequestModel = {
			surveyQuestionId: +pageId,
			surveyQuestionName: surveyQuestionInfo !== undefined ? surveyQuestionInfo?.surveyQuestionName : '',
			isActive: statusField === 'true',
			fieldTypeId: surveyQuestionInfo !== undefined ? 1 : 0,
			surveyQuestionAnswers: answerListState,
			queueId: Guid.create().toString(),
			userId: userAccessId.toString(),
		};
		messagingHub
			.start()
			.then(() => {
				saveSurveyQuestion(formItem)
					.then((response) => {
						// IF REQUEST IS SUCCESS THEN CONSUME CALLBACK API
						if (response.status === successResponse) {
							messagingHub.on(formItem.queueId.toString(), (message) => {
								saveSurveyQuestionResultCallback(message.cacheId);
							});

							setTimeout(() => {
								if (messagingHub.state === HubConnected) {
									messagingHub.stop().catch(() => {});
								}
							}, 30000);
						} else {
							messagingHub.stop().catch(() => {});
							swal('Failed', response.data.message, 'error').catch(() => {});
						}
					})
					.catch(() => {
						messagingHub.stop().catch(() => {});
						swal('Failed', 'Problem in getting feedback category info', 'error').catch(() => {});
					});
			})
			.catch(() => {});
	};

	const handleBackButton = () => {
		swal({
			title: PROMPT_MESSAGES.ConfirmCloseTitle,
			text: PROMPT_MESSAGES.ConfirmCloseMessage,
			icon: 'warning',
			buttons: {
				cancel: {
					text: SwalConfirmMessage.btnNo,
					value: null,
					visible: true,
				},confirm: {
					text: SwalConfirmMessage.btnYes,
					value: true,
					visible: true,
				},
			},
			dangerMode: true,
		})
			.then((willCreate) => {
				if (willCreate) {
					history.push('/system/survey-question-list');
				}
			})
			.catch(() => {});
	};

	const columnDefs : (ColDef<SurveyQuestionAnswerModel> | ColGroupDef<SurveyQuestionAnswerModel>)[] = [
		{
			headerName:'Order',
			field:  'orderNo',
			sort: 'asc' as 'asc'
		},
		{
			headerName:'Survey Answer Name',
			field:  'name'
		},
		{
			headerName: 'Survey Answer Status',
			field:  'status',
			cellRenderer: (params: any) => (params.data.status ? 'Active' : 'Inactive')
		},
		{
			minWidth: 300,
			headerName: 'Action',
			cellRenderer: answerListAction
		}
	]

	return (
		<>
			<MainContainer>
				<FormHeader headerLabel={'Edit Survey Question'} />
				<ContentContainer>
					<FormGroupContainer>
						<div className='col-lg-3'>
							<label htmlFor='survey-question-name'>Survey Question Name</label>
							<p id='survey-question-name' className='form-control-plaintext fw-bolder'>{surveyQuestionInfo?.surveyQuestionName}</p>
						</div>
						<div className='col-lg-3'>
							<label htmlFor='field-type'>Field Type</label>
							<p id='field-type' className='form-control-plaintext fw-bolder'>{surveyQuestionInfo?.fieldTypeName}</p>
						</div>
						<div className='col-lg-3'>
							<label htmlFor='status'>Status</label>
							<select id='status'
								className='form-select form-select-sm'
								aria-label='Select status'
								value={statusField}
								onChange={handleQuestionStatusFieldOnChange}
							>
								{STATUS_OPTIONS.map((item) => (
									<option key={item.value.toString()} value={item.value.toString()}>
										{item.label}
									</option>
								))}
							</select>
						</div>
					</FormGroupContainer>
					<FormGroupContainer>
						<div className='col-lg-3'>
							<label htmlFor='created-date'>Created Date</label>
							<p id='created-date' className='form-control-plaintext fw-bolder'>{useFormattedDate(surveyQuestionInfo?.createdDate ?? '')}</p>
						</div>
						<div className='col-lg-3'>
							<label htmlFor='created-by'>Created By</label>
							<p id='created-by' className='form-control-plaintext fw-bolder'>{surveyQuestionInfo?.createdByName ?? ''}</p>
						</div>
						<div className='col-lg-3'>
							<label htmlFor='last-modified-date'>Last Modified Date</label>
							<p id='last-modified-date' className='form-control-plaintext fw-bolder'>{useFormattedDate(surveyQuestionInfo?.updatedDate ?? '')}</p>
						</div>
						<div className='col-lg-3'>
							<label htmlFor='modified-by'>Modified By</label>
							<p id='modified-by' className='form-control-plaintext fw-bolder'>{surveyQuestionInfo?.updatedByName ?? ''}</p>
						</div>
					</FormGroupContainer>

					{showTable && (
						<>
							<hr className='my-3' />
							<FormGroupContainer>
								<label htmlFor='survey-answer-name' className='col-lg-2 col-form-label text-lg-right'>Survey Answer Name</label>
								<div id='survey-answer-name' className='col-lg-2'>
									<input
										type='text'
										className='form-control form-control-sm'
										placeholder='Answer Name'
										value={answerNameFilter}
										onChange={handleAnswerNameFilterOnchange}
									/>
								</div>
								<label htmlFor='survey-answer-status' className='col-lg-2 col-form-label text-lg-right'>Survey Answer Status</label>
								<div id='survey-answer-status' className='col-lg-2'>
									<select
										className='form-select form-select-sm'
										aria-label='Select status'
										value={answerStatusFilter}
										onChange={handleAnswerStatusFilterOnchange}
									>
										{FILTER_STATUS_OPTIONS.map((item) => (
											<option key={item.value.toString()} value={item.value.toString()}>
												{item.label}
											</option>
										))}
									</select>
								</div>
							</FormGroupContainer>
							<FormGroupContainer>
								<ButtonsContainer>
									<DefaultButton
										access={userAccess.includes(USER_CLAIMS.SurveyQuestionAndAnswerRead)}
										title={'Search'}
										onClick={handleSearchAnswer}
									/>
									<DefaultSecondaryButton
										access={userAccess.includes(USER_CLAIMS.SurveyQuestionAndAnswerWrite)}
										title={'Add New'}
										onClick={handleShowAddAnswerModal}
									/>
									<DefaultSecondaryButton
										access={userAccess.includes(USER_CLAIMS.SurveyQuestionAndAnswerWrite)}
										title={'Change Order'}
										onClick={confirmChangeOrder}
									/>
								</ButtonsContainer>
							</FormGroupContainer>
							<FormGroupContainer>
								<div className='ag-theme-quartz' style={{height: 400, width: '100%', marginTop: '10px'}}>
									<AgGridReact
										rowData={answerList}
										columnDefs={columnDefs}
										defaultColDef={{
											sortable: true,
											resizable: true,
										}}
										animateRows={true}
										onGridReady={onGridReady}
										rowBuffer={0}
										//enableRangeSelection={true} //deprecated in AgGridReactver.32.0.0
										paginationPageSizeSelector={false}
										pagination={true}
										paginationPageSize={10}
									>
									</AgGridReact>
								</div>
							</FormGroupContainer>
						</>
					)}
				</ContentContainer>
				<FooterContainer>
					<PaddedContainer>
						<DefaultPrimaryButton
							access={userAccess.includes(USER_CLAIMS.SurveyQuestionAndAnswerWrite)}
							title={'Submit'}
							onClick={confirmSubmitForm}
						/>
						<DefaultSecondaryButton access={userAccess.includes(USER_CLAIMS.SurveyQuestionAndAnswerRead)} title={'Back'} onClick={handleBackButton} />
					</PaddedContainer>
				</FooterContainer>
			</MainContainer>
			<CreateQuestionAnswerModal answer={null} modal={showAddAnswerModal} toggle={handleShowAddAnswerModal} saveAnswer={handleCreateSurveyAnswer} />
			<ReorderListModal
				modalName='Change Order Survey Answer'
				orderList={answerListState}
				columnList={reorderColumns}
				modal={showReorderModal}
				toggle={handleChangeOrder}
				saveReorder={handleSaveReorderAnswer}
			/>
		</>
	);
};

export default EditSurveyQuestion;
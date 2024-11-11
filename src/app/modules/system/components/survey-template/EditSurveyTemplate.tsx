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
import {HttpStatusCodeEnum, PROMPT_MESSAGES} from '../../../../constants/Constants';
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
import {SurveyQuestionModel} from '../../models';
import {SurveyQuestionFilterModel} from '../../models/SurveyQuestionFilterModel';
import {SurveyTemplateQuestionModel} from '../../models/SurveyTemplateQuestionModel';
import {SurveyTemplateQuestionRequestModel} from '../../models/SurveyTemplateQuestionRequestModel';
import {SurveyTemplateRequestModel} from '../../models/SurveyTemplateRequestModel';
import {GetSurveyTemplateByIdRequestModel} from '../../models/requests/GetSurveyTemplateByIdRequestModel';
import * as systemManagement from '../../redux/SystemRedux';
import {
	getSurveyQuestionList,
	getSurveyQuestionListResult,
	getSurveyTemplateById,
	getSurveyTemplateByIdResult,
	saveSurveyTemplate,
	saveSurveyTemplateResult,
} from '../../redux/SystemService';
import {FILTER_STATUS_OPTIONS, FILTER_STATUS_OPTIONS_YESNO, STATUS_OPTIONS} from '../constants/SelectOptions';
import CreateTemplateQuestionModal from './modals/CreateTemplateQuestionModal';
import { ColDef, ColGroupDef } from 'ag-grid-community';

const reorderColumns = [
	{
		title: 'Order',
		field:  'orderNo',
	},
	{
		title: 'Survey Question',
		field:  'surveyQuestionName',
	},
	{
		title: 'Mandatory Question',
		field:  'isMandatory',
		cellRenderer: (params: any) => <>{params ? <div>{params.data.isMandatory === true ? 'Yes' : 'No'}</div> : ''} </>,
	},
];

const EditSurveyTemplate: React.FC = () => {
	let templateId: string = '';
	// Redux
	const messagingHub = hubConnection.createHubConnenction();
	const userAccessId = useSelector<RootState>(({auth}) => auth.userId, shallowEqual) as number;
	const history = useHistory();

	// States
	const [pageId, setPageId] = useState('');
	const dispatch = useDispatch();
	const userAccess = useSelector<RootState>(({auth}) => auth.access, shallowEqual) as string;
	const [statusField, setStatusField] = useState('1');
	const [questionListHolder, setQuestionListHolder] = useState<Array<SurveyTemplateQuestionModel>>([]);
	const [showAddQuestionModal, setShowAddQuestionModal] = useState(false);
	const [showReorderModal, setShowReorderModal] = useState(false);
	const [questionNameFilter, setQuestionNameFilter] = useState('');
	const [questionStatusFilter, setQuestionStatusFilter] = useState('');
	const [mandatoryFilter, setMandatoryFilter] = useState('');
	const [surveyTemplateInfo, setSurveyTemplateInfo] = useState<SurveyTemplateRequestModel>();
	const [addCount, setAddCount] = useState(0);
	const [reorderFlag, setReorderFlag] = useState(false);

	const questionListState = useSelector<RootState>(({system}) => system.templateQuestions, shallowEqual) as SurveyTemplateQuestionModel[];
	const {successResponse, HubConnected, SwalServerErrorMessage, SwalFailedMessage, SwalConfirmMessage} = useConstant();

	// Effects
	useEffect(() => {
		const pathArray = window.location.pathname.split('/');
		if (pathArray.length >= 4) {
			templateId = pathArray[3];
			setPageId(templateId);
			getSurveyTemplateInfo();
		}
	}, []);

	useEffect(() => {
		setQuestionListHolder(questionListState);
		if (questionListState) {
			setAddCount(questionListState.filter((i) => i.id === 0).length);
		}
	}, [questionListState]);

	// Methods
	const getSurveyTemplateInfo = () => {
		enableSplashScreen();
		messagingHub
			.start()
			.then(() => {
				const request: GetSurveyTemplateByIdRequestModel = {
					surveyTemplateId: +templateId,
					userId: userAccessId.toString(),
					queueId: Guid.create().toString(),
				};
				getSurveyTemplateById(request)
					.then(() => {
						messagingHub.on(request.queueId.toString(), (message) => {
							getSurveyTemplateByIdResult(message.cacheId)
								.then((returnData) => {
									const item = returnData.data;
									if (item === undefined) {
										swal('ERROR', 'Cannot find Survey Template', 'error').catch(() => {});
									} else {
										const data = Object.assign(returnData.data);
										setSurveyTemplateInfo(data);
										setStatusField(data.surveyTemplateStatus.toString());
										dispatch(systemManagement.actions.getSurveyTemplateQuestions(data.surveyTemplateQuestions));
									}
								})
								.catch(() => {});
							messagingHub.off(request.queueId.toString());
						});

						setTimeout(() => {
							if (messagingHub.state === HubConnected) {
								messagingHub.stop().catch(() => {});
							}
						}, 30000);
					})
					.catch(() => {});

				const searchRequest: SurveyQuestionFilterModel = {
					userId: userAccessId.toString(),
					queueId: Guid.create().toString(),
					questionName: '',
					status: '',
					answerName: '',
				};
				getSurveyQuestionList(searchRequest)
					.then((response) => {
						if (response.status === successResponse) {
							messagingHub.on(searchRequest.queueId.toString(), (message) => {
								getSurveyQuestionListResult(message.cacheId)
									.then((returnData) => {
										let feedbackData = Object.assign(new Array<SurveyQuestionModel>(), returnData.data);
										dispatch(systemManagement.actions.getSurveyQuestionList(feedbackData));
										messagingHub.off(searchRequest.queueId.toString());
										disableSplashScreen();
									})
									.catch(() => {
										swal('Failed', 'getSurveyQuestionListResult', 'error').catch(() => {});
										disableSplashScreen();
									});
							});
						} else {
							swal('Failed', response.data.message, 'error').catch(() => {});
							disableSplashScreen();
						}
					})
					.catch(() => {});
			})
			.catch(() => {});
	};

	const getSurveyTemplateByIdResultCallback = (_cacheId: string, callback?: any) => {
		getSurveyTemplateByIdResult(_cacheId)
			.then((returnData) => {
				const item = returnData.data;
				if (item === undefined) {
					swal('ERROR', 'Cannot find Survey Template', 'error').catch(() => {});
				} else {
					const data = Object.assign(returnData.data);
					dispatch(systemManagement.actions.getSurveyTemplateQuestions(data.surveyTemplateQuestions));
					if (callback) {
						callback();
					}
				}
				disableSplashScreen();
			})
			.catch(() => {});
	};

	const getTemplateQuestionsList = (callback?: any) => {
		messagingHub
			.start()
			.then(() => {
				const request: GetSurveyTemplateByIdRequestModel = {
					surveyTemplateId: +pageId,
					userId: userAccessId.toString(),
					queueId: Guid.create().toString(),
				};
				getSurveyTemplateById(request)
					.then(() => {
						messagingHub.on(request.queueId.toString(), (message) => {
							getSurveyTemplateByIdResultCallback(message.cacheId);
							messagingHub.off(request.queueId.toString());
							messagingHub.stop().catch(() => {});
						});

						setTimeout(() => {
							if (messagingHub.state === HubConnected) {
								messagingHub.stop().catch(() => {});
								disableSplashScreen();
							}
						}, 30000);
					})
					.catch(() => {});
			})
			.catch(() => {});
	};

	const handleQuestionNameFilter = (event: any) => {
		setQuestionNameFilter(event.target.value);
	};

	const handleStatusFilter = (event: any) => {
		setQuestionStatusFilter(event.target.value);
	};

	const handleMandatoryFilter = (event: any) => {
		setMandatoryFilter(event.target.value);
	};

	const handleSearchQuestion = () => {
		if (questionNameFilter.trim() === '' && questionStatusFilter.trim() === '' && mandatoryFilter.trim() === '') {
			setQuestionListHolder(questionListState);
		} else {
			const filteredResult = questionListState.filter(
				(i: SurveyTemplateQuestionModel) =>
					(questionNameFilter.trim() === '' || i.surveyQuestionName?.toLowerCase().includes(questionNameFilter.toLowerCase())) &&
					(questionStatusFilter.trim() === '' || i.surveyQuestionStatus.toString().toLowerCase() === questionStatusFilter) &&
					(mandatoryFilter.trim() === '' || i.isMandatory.toString() === mandatoryFilter)
			);
			setQuestionListHolder(filteredResult);
		}
	};

	const handleAddNewQuestion = () => {
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
						getTemplateQuestionsList();
						handleShowAddModal();
					}
				})
				.catch(() => {});
		} else {
			handleShowAddModal();
		}
	};

	const handleShowAddModal = () => {
		setShowAddQuestionModal(!showAddQuestionModal);
	};

	const handleChangeOrder = () => {
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
						getTemplateQuestionsList(handleShowReorderModal);
					}
				})
				.catch(() => {});
		} else {
			setReorderFlag(true);
			handleShowReorderModal();
		}
	};

	const handleShowReorderModal = () => {
		setShowReorderModal(!showReorderModal);
	};

	const handleDeactivate = (data: any) => {
		const item = questionListState.find((i) => i.surveyQuestionId === data.surveyQuestionId);
		if (item !== undefined) {
			item.surveyQuestionStatus = !item.surveyQuestionStatus;
			const newList = questionListState.map((cat: SurveyTemplateQuestionModel) => {
				if (item.surveyQuestionId !== cat.surveyQuestionId) {
					return cat;
				}
				return {...cat, item};
			});
			dispatch(systemManagement.actions.getSurveyTemplateQuestions(newList));
		}
	};

	const handleSetMandatoryQuestion = (data: any) => {
		let newQuestionListState = questionListState ?? [];

		const mandaItem = newQuestionListState.find((i) => i.surveyQuestionId === data.surveyQuestionId);
		if (mandaItem !== undefined) {
			mandaItem.isMandatory = !mandaItem.isMandatory;
			const newList = newQuestionListState.map((cat: SurveyTemplateQuestionModel) => {
				if (mandaItem.surveyQuestionId !== cat.surveyQuestionId) {
					return cat;
				}
				return {...cat, mandaItem};
			});
			dispatch(systemManagement.actions.getSurveyTemplateQuestions(newList));
		}
	};

	const handleRemoveQuestion = (val: any) => {
		swal({
			title: PROMPT_MESSAGES.ConfirmRemoveTitle,
			text: PROMPT_MESSAGES.ConfirmRemoveMessage('Survey Question'),
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
					const newList =
						questionListState?.filter((i) => {
							return i.surveyQuestionId !== val.surveyQuestionId;
						}) ?? [];
					dispatch(systemManagement.actions.getSurveyTemplateQuestions(newList));
				}
			})
			.catch(() => {});
	};

	const handleSaveSurveyTemplateQuestion = (val: SurveyTemplateQuestionModel) => {
		handleShowAddModal();
		val.orderNo = questionListState && questionListState.length > 0 ? Math.max(...questionListState.map((i) => i.orderNo)) + 1 : 1; //questionListState.length + 1
		val.surveyTemplateId = +pageId;
		dispatch(systemManagement.actions.getSurveyTemplateQuestions([...questionListState, val]));
	};

	const handleSaveReorderQuestion = (val: Array<SurveyTemplateQuestionModel>) => {
		dispatch(systemManagement.actions.getSurveyTemplateQuestions(val));
	};

	const confirmSubmitForm = () => {
		swal({
			title: PROMPT_MESSAGES.ConfirmSubmitTitle,
			text: PROMPT_MESSAGES.ConfirmSubmitMessage('Survey Template'),
			icon: 'warning',
			buttons: {
				cancel: {
					text: SwalConfirmMessage.btnNo,
					value: null,
					visible: true,
				},
				confirm: {
					text: SwalConfirmMessage.btnYes,
					value: true,
					visible: true,
				},
			},
			dangerMode: true,
		})
			.then((willCreate) => {
				if (willCreate) {
					submitSurveyTemplateForm();
				}
			})
			.catch(() => {});
	};

	const submitSurveyTemplateForm = () => {
		const formItem: SurveyTemplateRequestModel = {
			surveyTemplateId: Number(pageId),
			surveyTemplateName: surveyTemplateInfo !== undefined ? surveyTemplateInfo?.surveyTemplateName : '',
			surveyTemplateStatus: statusField === 'true',
			surveyTemplateDescription: '',
			caseTypeId: surveyTemplateInfo !== undefined ? surveyTemplateInfo?.caseTypeId : 0,
			messageTypeId: surveyTemplateInfo !== undefined ? surveyTemplateInfo?.messageTypeId : 0,
			surveyTemplateQuestions: questionListState.map((i) => {
				const item: SurveyTemplateQuestionRequestModel = {
					id: i.id,
					surveyTemplateId: i.surveyTemplateId,
					surveyQuestionId: i.surveyQuestionId,
					orderNo: i.orderNo,
					status: i.surveyQuestionStatus,
					isMandatory: i.isMandatory,
				};
				return item;
			}),
			queueId: Guid.create().toString(),
			userId: userAccessId.toString(),
		};

		messagingHub
			.start()
			.then(() => {
				saveSurveyTemplate(formItem)
					.then((response) => {
						// IF REQUEST IS SUCCESS THEN CONSUME CALLBACK API
						if (response.status === HttpStatusCodeEnum.Ok) {
							messagingHub.on(formItem.queueId.toString(), (message) => {
								saveSurveyTemplateResult(message.cacheId)
									.then(() => {
										messagingHub.off(formItem.queueId.toString());
										history.push('/system/survey-template-list');
									})
									.catch(() => {
										messagingHub.off(formItem.queueId.toString());
									});
							});

							setTimeout(() => {
								if (messagingHub.state === HubConnected) {
									messagingHub.stop().catch(() => {});
								}
							}, 30000);
						} else {
							messagingHub.stop().catch(() => {});
							swal(SwalServerErrorMessage.title, response.data.message, SwalServerErrorMessage.icon).catch(() => {});
						}
					})
					.catch(() => {
						messagingHub.stop().catch(() => {});
						swal(SwalFailedMessage.title, 'Problem in getting  suvey template', SwalFailedMessage.icon).catch(() => {});
					});
			})
			.catch(() => {});
	};

	const onGridReady = (params: any) => {
		params.api.sizeColumnsToFit();
	};

	const handleBackToSurveyTemplateList = () => {
		swal({
			title: PROMPT_MESSAGES.ConfirmCloseTitle,
			text: PROMPT_MESSAGES.ConfirmCloseMessage,
			icon: SwalConfirmMessage.icon,
			buttons: [SwalConfirmMessage.btnNo, SwalConfirmMessage.btnYes],
			dangerMode: true,
		})
			.then((backToList) => {
				if (backToList) {
					history.push('/system/survey-template-list');
				}
			})
			.catch(() => {});
	};

	const questionListAction = (params: any) => 
		<>
			<DefaultTableButton
				className={'btn btn-outline-dark btn-sm px-4 btn-mlab-custom'}
				access={userAccess.includes(USER_CLAIMS.SurveyTemplateWrite)}
				title={params.data.surveyQuestionStatus === true ? 'Deactivate' : 'Activate'}
				onClick={() => handleDeactivate(params.data)}
			/>{' '}
			<DefaultTableButton
				className={'btn btn-outline-dark btn-sm px-4 btn-mlab-custom-lg'}
				access={userAccess.includes(USER_CLAIMS.SurveyTemplateWrite)}
				title={params.data.isMandatory ? 'Set as optional' : 'Set as mandatory'}
				onClick={() => handleSetMandatoryQuestion(params.data)}
			/>{' '}
			<DefaultTableButton
				access={userAccess.includes(USER_CLAIMS.SurveyTemplateWrite)}
				title={'Remove'}
				onClick={() => handleRemoveQuestion(params.data)}
			/>
		</>

	const columnDefs : (ColDef<SurveyTemplateQuestionModel> | ColGroupDef<SurveyTemplateQuestionModel>)[] = [
		{
			width: 75,
			headerName: 'Order',
			field:  'orderNo',
			sort: 'asc' as 'asc'
		},
		{
			headerName: 'Survey Question Name',
			field:  'surveyQuestionName',
		},
		{
			width: 100,
			headerName: 'Status',
			field:  'surveyQuestionStatus',
			cellRenderer: (params: any) => (params.data.surveyQuestionStatus === true ? 'Active' : 'Inactive')
		},
		{
			width: 150,
			headerName: 'Field Type',
			field:  'surveyQuestionFieldTypeName'
		},
		{
			headerName: 'Last Updated',
			field:  'surveyQuestionUpdatedDate',
			cellRenderer: (params: any) => {
				if (params.data.surveyQuestionUpdatedBy && params.data.surveyQuestionUpdatedDate) {
					const formattedDate = new Date(params.data.surveyQuestionUpdatedDate);
					return (
						formattedDate.getMonth() +
						1 +
						'/' +
						formattedDate.getDate() +
						'/' +
						formattedDate.getFullYear() +
						' ' +
						formattedDate.toLocaleTimeString()
					);
				} else {
					return '';
				}
			}
		},
		{
			headerName: 'Updated By',
			field:  'surveyQuestionUpdatedBy'
		},
		{
			headerName: 'Mandatory Question',
			field:  'isMandatory',
			cellRenderer: (params: any) => (params.data.isMandatory === true || params.data.isMandatory === 'True' ? 'Yes' : 'No')
		},
		{
			width: 350,
			headerName: 'Action',
			field:  'id',
			cellRenderer: questionListAction
		}
	]

	return (
		<>
			<MainContainer>
				<FormHeader headerLabel={'Edit Survey Template'} />
				<ContentContainer>
					<FormGroupContainer>
						<div className='col-lg-3'>
							<label htmlFor='survey-template-name'>Survey Template Name</label>
							<p id='survey-template-name' className='form-control-plaintext fw-bolder'>{surveyTemplateInfo?.surveyTemplateName}</p>
						</div>
						<div className='col-lg-3'>
							<label htmlFor='status'>Status</label>
							<select
								id='status'
								className='form-select form-select-sm'
								aria-label='Select status'
								value={statusField}
								onChange={(e) => setStatusField(e.target.value.toString())}
							>
								{STATUS_OPTIONS.map((item) => (
									<option key={item.value?.toString()} value={item.value.toString()}>
										{item.label}
									</option>
								))}
							</select>
						</div>
					</FormGroupContainer>
					<FormGroupContainer>
						<div className='col-lg-3'>
							<label htmlFor='created-date'>Created Date</label>
							<p id='created-date' className='form-control-plaintext fw-bolder'>{useFormattedDate(surveyTemplateInfo?.createdDate ?? '')}</p>
						</div>
						<div className='col-lg-3'>
							<label htmlFor='created-by'>Created By</label>
							<p id='created-by' className='form-control-plaintext fw-bolder'>{surveyTemplateInfo?.createdByName ?? ''}</p>
						</div>
						<div className='col-lg-3'>
							<label htmlFor='last-modified-date'>Last Modified Date</label>
							<p id='last-modified-date' className='form-control-plaintext fw-bolder'>{useFormattedDate(surveyTemplateInfo?.updatedDate ?? '')}</p>
						</div>
						<div className='col-lg-3'>
							<label htmlFor='modified-by'>Modified By</label>
							<p id='modified-by' className='form-control-plaintext fw-bolder'>{surveyTemplateInfo?.updatedByName ?? ''}</p>
						</div>
					</FormGroupContainer>
					<hr className='my-3' />
					<FormGroupContainer>
						<label htmlFor='survey-question-name' className='col-lg-2 col-form-label text-lg-right'>Survey Question Name</label>
						<div className='col-lg-2'>
							<input
								id='survey-question-name'
								type='text'
								className='form-control form-control-sm'
								placeholder='Question Name'
								value={questionNameFilter}
								onChange={handleQuestionNameFilter}
							/>
						</div>
						<label htmlFor='survey-question-status' className='col-lg-2 col-form-label text-lg-right'>Survey Question Status</label>
						<div className='col-lg-2'>
							<select id='survey-question-status' className='form-select form-select-sm' aria-label='Select status' value={questionStatusFilter} onChange={handleStatusFilter}>
								{FILTER_STATUS_OPTIONS.map((item) => (
									<option key={item.value?.toString()} value={item.value.toString()}>
										{item.label}
									</option>
								))}
							</select>
						</div>

						<label htmlFor='mandatory-question' className='col-lg-2 col-form-label text-lg-right'>Mandatory Question</label>
						<div className='col-lg-2'>
							<select id='mandatory-question' className='form-select form-select-sm' aria-label='Select status' value={mandatoryFilter} onChange={handleMandatoryFilter}>
								{FILTER_STATUS_OPTIONS_YESNO.map((item) => (
									<option key={item.value?.toString()} value={item.value.toString()}>
										{item.label}
									</option>
								))}
							</select>
						</div>
					</FormGroupContainer>
					<FormGroupContainer>
						<ButtonsContainer>
							<DefaultButton access={userAccess.includes(USER_CLAIMS.SurveyTemplateWrite)} title={'Search'} onClick={handleSearchQuestion} />
							<DefaultSecondaryButton
								access={userAccess.includes(USER_CLAIMS.SurveyTemplateWrite)}
								title={'Add New'}
								onClick={handleAddNewQuestion}
							/>
							<DefaultSecondaryButton
								access={userAccess.includes(USER_CLAIMS.SurveyTemplateWrite)}
								title={'Change Order'}
								onClick={handleChangeOrder}
							/>
						</ButtonsContainer>
					</FormGroupContainer>
					<FormGroupContainer>
						<div className='ag-theme-quartz' style={{height: 400, width: '100%'}}>
							<AgGridReact
								rowData={questionListHolder}
								columnDefs={columnDefs}
								defaultColDef={{
									sortable: true,
									resizable: true,
								}}
								animateRows={true}
								onGridReady={onGridReady}
								rowBuffer={0}
								//enableRangeSelection={true} //deprecated in AgGridReactver.32.0.0
								pagination={true}
								paginationPageSizeSelector={false}
								paginationPageSize={10}
							>
							</AgGridReact>
						</div>
					</FormGroupContainer>
				</ContentContainer>
				<FooterContainer>
					<PaddedContainer>
						<DefaultPrimaryButton access={userAccess.includes(USER_CLAIMS.SurveyTemplateWrite)} title={'Submit'} onClick={confirmSubmitForm} />
						<DefaultSecondaryButton
							access={userAccess.includes(USER_CLAIMS.SurveyTemplateWrite)}
							title={'Back'}
							onClick={handleBackToSurveyTemplateList}
						/>
					</PaddedContainer>
				</FooterContainer>
			</MainContainer>
			<CreateTemplateQuestionModal
				modal={showAddQuestionModal}
				toggle={handleAddNewQuestion}
				saveQuestion={handleSaveSurveyTemplateQuestion}
			/>
			<ReorderListModal
				modalName='Change Order Survey Question'
				orderList={questionListState}
				columnList={reorderColumns}
				modal={showReorderModal}
				toggle={handleChangeOrder}
				saveReorder={handleSaveReorderQuestion}
			/>
		</>
	);
};

export default EditSurveyTemplate;
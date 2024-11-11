import 'datatables.net';
import 'datatables.net-dt';
import {Guid} from 'guid-typescript';
import $ from 'jquery';
import React, { useEffect, useState} from 'react';
import ReactDOM from 'react-dom';
import {shallowEqual, useDispatch, useSelector} from 'react-redux';
import {useHistory} from 'react-router-dom';
import swal from 'sweetalert';
import '../../../../../_metronic/assets/css/datatables.min.css';
import {RootState} from '../../../../../setup';
import * as hubConnection from '../../../../../setup/hub/MessagingHub';
import * as sessionHandler from '../../../../../setup/session/SessionHandler';
import useConstant from '../../../../constants/useConstant';
import {ButtonsContainer, ContentContainer, DefaultButton, FormHeader, MainContainer} from '../../../../custom-components';
import {USER_CLAIMS} from '../../../user-management/components/constants/UserClaims';
import {GetTopiCaseTypeModel} from '../../models';
import {CodeListModel} from '../../models/CodeListModel';
import {CodeListTypeModel} from '../../models/CodeListTypeModel';
import {FieldTypeModel} from '../../models/FieldTypeModel';
import {RequestModel} from '../../models/RequestModel';
import {SelectOptionModel} from '../../models/SelectOptionModel';
import * as systemManagement from '../../redux/SystemRedux';
import {getCodeList, getCodeListResult, getCodeListType, getFieldType} from '../../redux/SystemService';
import CreateCodeListModal from './modals/CreateCodeListModal';
import CreateCodeListTypeModal from './modals/CreateCodeListTypeModal';

const CodeList: React.FC = () => {
	// // -----------------------------------------------------------------
	// // STATES
	// // -----------------------------------------------------------------
	const messagingHub = hubConnection.createHubConnenction();
	const dispatch = useDispatch();
	const userAccess = useSelector<RootState>(({auth}) => auth.access, shallowEqual) as string;
	const userAccessId = useSelector<RootState>(({auth}) => auth.userId, shallowEqual) as number;
	const expiresIn = useSelector<RootState>(({auth}) => auth.expiresIn, shallowEqual) as string;
	const codeListState = useSelector<RootState>(({system}) => system.codeList, shallowEqual) as CodeListModel[];
	const codeListTypesState = useSelector<RootState>(({system}) => system.codeListType, shallowEqual) as CodeListTypeModel[];
	const fieldTypesState = useSelector<RootState>(({system}) => system.fieldType, shallowEqual) as FieldTypeModel[];

	const [codeListOptions, setCodeListOptions] = useState<Array<SelectOptionModel>>([]);
	const [codeListTypes, setCodeListTypes] = useState<Array<SelectOptionModel>>([]);
	const [fieldTypes, setFieldTypes] = useState<Array<SelectOptionModel>>([]);

	const history = useHistory();

	const [showAddModal, setShowAddModal] = useState(false);
	const [showCodeListTypeModal, setShowCodeListTypeModal] = useState(false);
	const {successResponse, HubConnected} = useConstant();
	const [loading, setLoading] = useState(true);

	// // -----------------------------------------------------------------
	// // EFFECTS
	// // -----------------------------------------------------------------
	useEffect(() => {
		if (sessionHandler.isSessionExpired(expiresIn, history)) {
			return;
		}
		initializeCodeListTable();
	}, []);

	useEffect(() => {
		if (codeListTypesState != undefined) {
			setCodeListOptions([
				...codeListState.map((i) => {
					const option: any = {
						value: i.id,
						label: i.codeListName,
					};
					return option;
				}),
			]);

			const table = $('.table-code-list').find('table').DataTable();
			table.clear();
			table.rows.add(codeListState);
			table
				.on('order.dt search.dt', function () {
					table
						.column(0, {search: 'applied', order: 'applied'})
						.nodes()
						.each(function (cell, i) {
							cell.innerHTML = i + 1;
						});
				})
				.draw();
		}
	}, [codeListState]);

	useEffect(() => {
		if (codeListTypesState != undefined) {
			setCodeListTypes([
				...codeListTypesState.map((i) => {
					const option: any = {
						value: i.id,
						label: i.codeListTypeName,
					};
					return option;
				}),
			]);
		}
	}, [codeListTypesState]);

	useEffect(() => {
		if (fieldTypesState != undefined) {
			setFieldTypes([
				...fieldTypesState.map((i) => {
					const option: any = {
						value: i.id,
						label: i.fieldTypeName,
					};
					return option;
				}),
			]);
		}
	}, [fieldTypesState]);

	// // -----------------------------------------------------------------
	// // COLUMNS CONFIGURATIONS
	// // -----------------------------------------------------------------
	const columns = [
		{
			title: 'No',
			data: 'id',
			className: 'align-middle',
		},
		{
			title: 'Code List Name',
			data: 'codeListName',
			className: 'align-middle',
		},
		{
			title: 'Code List Status',
			data: 'isActive',
			className: 'align-middle',
			render: function (data: any, row: any) {
				let statusFlag: string;
				statusFlag = '';
				if (data === true) {
					statusFlag = 'Active';
				} else if (data === false) {
					statusFlag = 'Inactive';
				}
				return statusFlag;
			},
		},
		{
			title: 'Code List Type',
			data: 'codeListTypeName',
			className: 'align-middle',
		},
		{
			title: 'Parent',
			data: 'parentCodeListName',
			className: 'align-middle',
		},
		{
			title: 'Action',
			data: null,
			fnCreatedCell: (nTd: any, data: any) => {
				const renderEditButton = () => (
					<div className='d-flex justify-content-center flex-shrink-0'>
						<button onClick={() => handleButtonClick(data)}
							onKeyDown={(event) => {
								if (event.key === 'Enter' || event.key === ' ') {
									handleButtonClick(data);
								}
							}}
							className='btn btn-outline-dark btn-sm px-4'>
							Edit
						</button>
					</div>
				);

				ReactDOM.render(renderEditButton(), nTd);
				return null;
			},
		},
	];

	const CODE_LIST_ROUTE: Array<{id: number; route: string; view: boolean; edit: boolean}> = [
		{
			id: 1,
			route: '/system/topic-list',
			view: userAccess.includes(USER_CLAIMS.TopicRead),
			edit: userAccess.includes(USER_CLAIMS.TopicWrite),
		},
		{
			id: 2,
			route: '/system/sub-topic-list',
			view: userAccess.includes(USER_CLAIMS.SubtopicRead),
			edit: userAccess.includes(USER_CLAIMS.SubtopicWrite),
		},
		{
			id: 3,
			route: '/system/message-type-list',
			view: userAccess.includes(USER_CLAIMS.MessageTypeRead),
			edit: userAccess.includes(USER_CLAIMS.MessageTypeWrite),
		},
		{
			id: 4,
			route: '/system/message-status-list',
			view: userAccess.includes(USER_CLAIMS.MessageStatusRead),
			edit: userAccess.includes(USER_CLAIMS.MessageStatusWrite),
		},
		{
			id: 5,
			route: '/system/message-response-list',
			view: userAccess.includes(USER_CLAIMS.MessageResponseRead),
			edit: userAccess.includes(USER_CLAIMS.MessageTypeWrite),
		},
		{
			id: 6,
			route: '/system/feedback-type-list',
			view: userAccess.includes(USER_CLAIMS.FeedbackTypeRead),
			edit: userAccess.includes(USER_CLAIMS.FeedbackTypeWrite),
		},
		{
			id: 7,
			route: '/system/feedback-category-list',
			view: userAccess.includes(USER_CLAIMS.FeedbackCategoryRead),
			edit: userAccess.includes(USER_CLAIMS.FeedbackCategoryWrite),
		},
		{
			id: 8,
			route: '/system/feedback-answer-list',
			view: userAccess.includes(USER_CLAIMS.FeedbackAnswerRead),
			edit: userAccess.includes(USER_CLAIMS.FeedbackAnswerWrite),
		},
	];
	// // -----------------------------------------------------------------
	// // METHODS
	// // -----------------------------------------------------------------

	async function getCodeListSvc () {
		const codeListRqst: RequestModel = {
			userId: userAccessId.toString(),
			queueId: Guid.create().toString(),
		};
		// Get Code List
		getCodeList(codeListRqst).then((response) => {
			if (response.status === successResponse) {
				messagingHub.on(codeListRqst.queueId.toString(), (message) => {
					getCodeListResult(message.cacheId)
						.then((returnData) => {
							let codeListData = Object.assign(new Array<CodeListModel>(), returnData.data);
							codeListData = codeListData.filter((i) => {
								const routeInfo = CODE_LIST_ROUTE.find((x) => x.id === i.id);
								return routeInfo && (routeInfo.view || routeInfo.edit);
							});
							dispatch(systemManagement.actions.GetAllCodeList(codeListData));
					
							setLoading(false)
							messagingHub.off(codeListRqst.queueId.toString());
							messagingHub.stop();
						})
						.catch(() => {
							swal('Failed', 'getCodeListResult', 'error');
						
							setLoading(false)
						});
				});
			} else {
				swal('Failed', response.data.message, 'error');
			
				setLoading(false)
			}
		});
	}

	async function getCodeListTypeSvc() {
		// Get Code List Type
		const codeListTypeRqst: RequestModel = {
			userId: userAccessId.toString(),
			queueId: Guid.create().toString(),
		};

		getCodeListType(codeListTypeRqst).then((response) => {
			if (response.status === successResponse) {
				dispatch(systemManagement.actions.GetAllCodeListType(response.data));
			} else {
				swal('Failed - GetCodeListType', response.data.message, 'error');
			}
		});
	}

	async function getFieldTypeSvc () {
		// Get Field Type
		getFieldType().then((response) => {
			if (response.status === successResponse) {
				dispatch(systemManagement.actions.GetAllFieldType(response.data));
			} else {
				swal('Failed', response.data.message, 'error');
			}
		});
	}

	const initializeCodeListTable = () => {
		$('#table-code-list').DataTable({
			retrieve: true,
			dom: '<"table-code-list"tlip>',
			columns,
			data: codeListState,
			ordering: true,
			paging: true,
			pagingType: 'full_numbers',
			pageLength: 10,
			order: [[0, 'asc']],
			language: {
				emptyTable: `<div style="text-align: center; border: 1px solid #b7b7b7; padding: 5px 5px; margin: 7em auto; width: fit-content; box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.1); border-radius: 4px; font-family: Arial, sans-serif; color: #585858;">
							${loading ? 'Please wait while your items are loading' : 'No Rows To Show'}
							</div>`,
			},
		});

		setTimeout(() => {
			messagingHub
				.start()
				.then(async () => {
					if (messagingHub.state === HubConnected) {
						await getCodeListSvc();
						await getCodeListTypeSvc();
						await getFieldTypeSvc();
					} else {
						swal('Failed', 'Problem connecting to the server, Please refresh', 'error');
					}
				})
				.catch((err) => console.log('Error while starting connection: ' + err));
		}, 1000);
	};

	const toggleAddCodeListModal = () => {
		setShowAddModal(!showAddModal);
	};

	const toggleAddCodeListTypeModal = () => {
		setShowCodeListTypeModal(!showCodeListTypeModal);
	};

	const addCodeList = () => {
		toggleAddCodeListModal();
	};

	const addCodeListType = () => {
		toggleAddCodeListTypeModal();
	};

	const saveCodeListCompleted = () => {
		initializeCodeListTable();
		toggleAddCodeListModal();
	};

	const saveCodeListTypeCompleted = () => {
		initializeCodeListTable();
		toggleAddCodeListTypeModal();
	};

	const topicRedirectAction = () => {
		const clear: GetTopiCaseTypeModel = {
			caseTypeId: 0,
			caseTypeName: '',
			topicId: 0,
			topicName: '',
		};

		dispatch(systemManagement.actions.getTopicCaseTypeInfo(clear));
	};

	function handleButtonClick(data: any) {
		const routeInfo = CODE_LIST_ROUTE.find((i) => i.id === data.id);
		if (routeInfo?.id === 2) {
			topicRedirectAction();
		}
		history.push(routeInfo?.route);
	}
	return (
		<>
			<MainContainer>
					<FormHeader headerLabel={'Code List'} />
					<ContentContainer>
						<ButtonsContainer>
							<DefaultButton
								access={false} //Hide button temporarily for MVP
								title={'Add Code List'}
								onClick={addCodeList}
							/>
							<DefaultButton
								access={false} //Hide button temporarily for MVP
								title={'Add Code List Type'}
								onClick={addCodeListType}
							/>
						</ButtonsContainer>
						
						<table id='table-code-list' className='table table-hover table-rounded table-striped border gy-3 gs-3' style={{minHeight: '300px'}} />
					</ContentContainer>
				</MainContainer>
				<CreateCodeListModal
					modal={showAddModal}
					toggle={toggleAddCodeListModal}
					codeList={codeListOptions}
					codeListTypes={codeListTypes}
					fieldTypes={fieldTypes}
					saveCodeList={saveCodeListCompleted}
				/>
				<CreateCodeListTypeModal
					modal={showCodeListTypeModal}
					codeListTypes={codeListTypes}
					toggle={toggleAddCodeListTypeModal}
					saveCodeListType={saveCodeListTypeCompleted}
				/>
		</>
	);
};

export default CodeList;
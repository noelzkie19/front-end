import 'datatables.net';
import 'datatables.net-dt';
import $ from 'jquery';
import React, { useEffect, useRef, useState} from 'react';
import {shallowEqual, useDispatch, useSelector} from 'react-redux';
import swal from 'sweetalert';
import '../../../../../_metronic/assets/css/datatables.min.css';
import {RootState} from '../../../../../setup';
import {
	ButtonsContainer,
	ContentContainer,
	DefaultButton,
	DefaultTableButton,
	FormGroupContainer,
	FormHeader,
	MainContainer,
} from '../../../../custom-components';
import {USER_CLAIMS} from '../../../user-management/components/constants/UserClaims';
import {SurveyTemplateModel} from '../../models/SurveyTemplateModel';
import {FILTER_STATUS_OPTIONS} from '../constants/SelectOptions';

import {AgGridReact} from 'ag-grid-react';
import {Guid} from 'guid-typescript';
import {useHistory} from 'react-router-dom';
import * as hubConnection from '../../../../../setup/hub/MessagingHub';
import {PROMPT_MESSAGES} from '../../../../constants/Constants';
import useConstant from '../../../../constants/useConstant';
import {CaseTypeModel, MessageTypeListResponse} from '../../models';
import {SurveyTemplateFilterModel} from '../../models/requests/SurveyTemplateFilterModel';
import * as systemManagement from '../../redux/SystemRedux';
import {
	deactivateSurveyTemplate,
	getAllCaseType,
	getAllMessageType,
	getSurveyTemplateList,
	getSurveyTemplateListResult,
} from '../../redux/SystemService';
import CreateSurveyTemplateModal from './modals/CreateSurveyTemplateModal';
import gridOverlayTemplate from '../../../../common-template/gridTemplates';
import { ColDef, ColGroupDef } from 'ag-grid-community';


const initialValues = {
	id: 1,
	name: '',
	status: true,
	description: '',
	caseTypeId: 1,
	caseType: '',
	messageTypeId: 1,
	messageType: '',
	createdBy: 1,
};

const SurveyTemplateList: React.FC = () => {
	/**
	 *  ? States
	 */
	const messagingHub = hubConnection.createHubConnenction();
	const dispatch = useDispatch();
	const gridRef: any = useRef();
	const history = useHistory();
	const userAccess = useSelector<RootState>(({auth}) => auth.access, shallowEqual) as string;
	const userAccessId = useSelector<RootState>(({auth}) => auth.userId, shallowEqual) as number;
	const [surveyTemplate, setSurveyTemplate] = useState<SurveyTemplateModel>(initialValues);
	const [surveyTemplateId, setSurveyTemplateId] = useState<number>(0);
	const [surveyTemplateList, setSurveyTemplateList] = useState<Array<SurveyTemplateModel>>([]);
	const [showAddModal, setShowAddModal] = useState(false);
	const [cloneMode, setCloneMode] = useState(false);
	const [nameFilter, setNameFilter] = useState('');
	const [statusFilter, setStatusFilter] = useState('');
	const [questionFilter, setQuestionFilter] = useState('');
	const [caseTypeList, setCaseTypeList] = useState<Array<CaseTypeModel>>(Object.assign(new Array<CaseTypeModel>(), []));
	const [messageTypeList, setMessageTypeList] = useState<Array<MessageTypeListResponse>>(Object.assign(new Array<MessageTypeListResponse>(), []));
	const templateListState = useSelector<RootState>(({system}) => system.surveyTemplateList, shallowEqual) as SurveyTemplateModel[];
	const {successResponse,  SwalFailedMessage} = useConstant();
	const [loading, setLoading] = useState(false)


	useEffect(() => {
		loadDropdownLists();
		loadSurveyTemplateList();
	}, []);

	useEffect(() => {
		const overlayElementTemplate = document.getElementById('mlab-grid-loading-overlay') as HTMLInputElement;
		
		if (overlayElementTemplate) {
			if (!loading && (templateListState === undefined || templateListState.length === 0)) {
				overlayElementTemplate.innerText = 'No Rows To Show';
			} else {
				overlayElementTemplate.innerText = 'Please wait while your items are loading';
			}
		}
	}, [loading]);
	

	useEffect(() => {
		const table = $('.table-survey-templates').find('table').DataTable();
		table.clear();
		table.rows.add(surveyTemplateList);
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
	}, [surveyTemplateList]);

	useEffect(() => {
		setSurveyTemplateList(templateListState);
	}, [templateListState]);


	const loadDropdownLists = () => {
		getAllCaseType()
			.then((response) => {
				if (response.status === successResponse) {
					setCaseTypeList(response.data);
				} else {
					swal('Failed', 'Error getting Case Type List', 'error').catch(() => {});
				}
			})
			.catch(() => {});

		getAllMessageType()
			.then((response) => {
				if (response.status === successResponse) {
					setMessageTypeList(response.data);
				} else {
					swal('Failed', 'Error getting Message Type List', 'error').catch(() => {});
				}
			})
			.catch(() => {});
	};

	const loadSurveyTemplateList = () => {
		setLoading(true)
		dispatch(systemManagement.actions.getSurveyTemplateList([]));
		messagingHub
			.start()
			.then(() => {
				const searchRequest: SurveyTemplateFilterModel = {
					userId: userAccessId.toString(),
					queueId: Guid.create().toString(),
					templateName: nameFilter.trim(),
					templateStatus: statusFilter.trim(),
					questionName: questionFilter.trim(),
				};
				getSurveyTemplateList(searchRequest)
					.then((response) => {
						if (response.status === successResponse) {
							messagingHub.on(searchRequest.queueId.toString(), (message) => {
								getSurveyTemplateListResult(message.cacheId)
									.then((returnData) => {
										let feedbackData = Object.assign(new Array<SurveyTemplateModel>(), returnData.data);
										dispatch(systemManagement.actions.getSurveyTemplateList(feedbackData));
										messagingHub.off(searchRequest.queueId.toString());
										messagingHub.stop().catch(() => {});
										setLoading(false)
									})
									.catch(() => {
										swal(SwalFailedMessage.title, SwalFailedMessage.textSurveyTemplateProblem, SwalFailedMessage.icon).catch(() => {});
										setLoading(false)
									});
							});
						} else {
							swal(SwalFailedMessage.title, response.data.message, SwalFailedMessage.icon).catch(() => {});
							setLoading(false)
						}
					})
					.catch(() => {
						console.log('Problem in getting survey template list');
						setLoading(false)
					});
			})
			.catch(() => {});
	};

	const handleNameFilterOnChange = (event: any) => {
		setNameFilter(event.target.value);
	};

	const handleStatusFilterOnChange = (event: any) => {
		setStatusFilter(event.target.value);
	};

	const handleQuestionFilterOnChange = (event: any) => {
		setQuestionFilter(event.target.value);
	};

	const handleSearch = () => {
		loadSurveyTemplateList();
	};

	const addSurveyTemplate = () => {
		setCloneMode(false);
		setShowAddModal(!showAddModal);
	};

	const saveSurveyTemplate = () => {
		//RELOAD TEMPLATE LIST
		loadSurveyTemplateList();
	};

	const cloneSurveyTemplate = (val: any) => {
		setSurveyTemplateId(val.surveyTemplateId);
		setSurveyTemplate(val);
		setCloneMode(true);
		setShowAddModal(!showAddModal);
	};

	const onGridReady = (params: any) => {
		params.api.sizeColumnsToFit();
	};
	const handleDeactivate = (val: any) => {
		const title = val.surveyTemplateStatus === true || val.surveyTemplateStatus === 'True' ? 'Deactivate' : 'Activate';
		swal({
			title: title,
			text: PROMPT_MESSAGES.ConfirmDeactivateActivateMessage(title),
			icon: 'warning',
			buttons: ['Cancel', 'Confirm'],
			dangerMode: true,
		})
			.then((willDelete) => {
				if (willDelete) {
					deactivateSurveyTemplate(val.surveyTemplateId)
						.then((response) => {
							if (response.status === successResponse) {
								loadSurveyTemplateList();
							} else {
								swal(PROMPT_MESSAGES.FailedValidationTitle, 'Error Deactivating Survey Template', 'error').catch(() => {});
							}
						})
						.catch(() => {
							console.log('Error Deactivating Survey Template');
						});
				}
			})
			.catch(() => {});
	};

	const handleEditSurveyTemplate = (id: string) => {
		history.push('/system/edit-survey-template/' + id);
	};

	const templateListAction = (params: any) => 
	<>
		<DefaultTableButton
			className={'btn btn-outline-dark btn-sm px-4 btn-mlab-custom'}
			access={userAccess.includes(USER_CLAIMS.SurveyTemplateWrite)}
			title={params.data.surveyTemplateStatus === true || params.data.surveyTemplateStatus === 'True' ? 'Deactivate' : 'Activate'}
			onClick={() => handleDeactivate(params.data)}
		/>{' '}
		<DefaultTableButton
			access={userAccess.includes(USER_CLAIMS.SurveyTemplateWrite)}
			title={'Edit'}
			onClick={() => handleEditSurveyTemplate(params.data.surveyTemplateId)}
		/>{' '}
		<DefaultTableButton
			access={userAccess.includes(USER_CLAIMS.SurveyTemplateWrite)}
			title={'Clone'}
			onClick={() => cloneSurveyTemplate(params.data)}
		/>
	</>

	const columnDefs : (ColDef<SurveyTemplateModel> | ColGroupDef<SurveyTemplateModel>)[] = [
		{
			width: 80, 
			headerName: 'No',
			cellRenderer: (params: any) => params.data.surveyTemplateId,
			sort: 'asc' as 'asc'
		},
		{
			width: 200,
			headerName: 'Survey Template Name',
			cellRenderer: (params: any) => params.data.surveyTemplateName,
		},
		{
			width: 200,
			headerName: 'Survey Template Status',
			field:  'status', 
			cellRenderer: (params: any) => params.data.surveyTemplateStatus === true || params.data.surveyTemplateStatus === 'True' ? 'Active' : 'Inactive'
		},
		{
			width: 250, 
			headerName: 'Survey Template Description',
			cellRenderer: (params: any) => params.data.surveyTemplateDescription,
		},
		{
			width: 200,
			headerName: 'Case Type',
			cellRenderer: (params: any) => params.data.caseTypeName,
		},
		{
			width: 200,
			headerName: 'Message Type',
			cellRenderer: (params: any) => params.data.messageTypeName,
		},
		{
			width: 300,
			headerName: 'Action',
			cellRenderer: templateListAction
		}
	]

	return (
		<>
			<MainContainer>
				<FormHeader headerLabel={'Search Survey Template'} />
				<ContentContainer>
					<FormGroupContainer>
						<div className='col-lg-4'>
							<label htmlFor='view-survey-template-name'>Survey Template Name</label>
							<input
								id='view-survey-template-name'
								type='text'
								className='form-control form-control-sm'
								aria-label='Template Name'
								value={nameFilter}
								onChange={handleNameFilterOnChange}
							/>
						</div>
						<div className='col-lg-4'>
							<label htmlFor='view-survey-template-status'>Survey Template Status</label>
							<select id='view-survey-template-status' className='form-select  form-select-sm' aria-label='Select status' value={statusFilter} onChange={handleStatusFilterOnChange}>
								{FILTER_STATUS_OPTIONS.map((item) => (
									<option key={item.value.toString()} value={item.value.toString()}>
										{item.label}
									</option>
								))}
							</select>
						</div>
						<div className='col-lg-4'>
							<label htmlFor='view-survey-template-question-name'>Survey Question Name</label>
							<input
								id='view-survey-template-question-name'
								type='text'
								className='form-control form-control-sm'
								aria-label='Question Name'
								value={questionFilter}
								onChange={handleQuestionFilterOnChange}
							/>
						</div>
					</FormGroupContainer>
					<ButtonsContainer>
						<DefaultButton access={userAccess.includes(USER_CLAIMS.SurveyTemplateRead)} title={'Search'} onClick={handleSearch} />
						<DefaultButton access={userAccess.includes(USER_CLAIMS.SurveyTemplateWrite)} title={'Add Survey Template'} onClick={addSurveyTemplate} />
					</ButtonsContainer>
					{/* <table
            id='table-survey-templates'
            className='table table-hover table-rounded table-striped border gy-3 gs-3'
          /> */}
					<FormGroupContainer>
						<div className='ag-theme-quartz' style={{height: 400, width: '100%'}}>
							<AgGridReact
								ref={gridRef}
								rowData={templateListState}
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
								overlayNoRowsTemplate={gridOverlayTemplate}
							>
							</AgGridReact>
						</div>
					</FormGroupContainer>
				</ContentContainer>
			</MainContainer>
			<CreateSurveyTemplateModal
				isClone={cloneMode}
				modal={showAddModal}
				surveyTemplate={surveyTemplate}
				toggle={addSurveyTemplate}
				saveSurveyTemplate={saveSurveyTemplate}
				caseTypeList={caseTypeList}
				messageTypeList={messageTypeList}
				surveyTemplateId={surveyTemplateId}
			/>
		</>
	);
};

export default SurveyTemplateList;
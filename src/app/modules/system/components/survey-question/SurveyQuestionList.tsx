import 'datatables.net';
import 'datatables.net-dt';
import {useFormik} from 'formik';
import React, {useEffect, useState} from 'react';
import {shallowEqual, useDispatch, useSelector} from 'react-redux';
import {useHistory} from 'react-router-dom';
import swal from 'sweetalert';
import * as Yup from 'yup';
import '../../../../../_metronic/assets/css/datatables.min.css';
import {RootState} from '../../../../../setup';
import * as hubConnection from '../../../../../setup/hub/MessagingHub';
import {USER_CLAIMS} from '../../../user-management/components/constants/UserClaims';
import {SurveyQuestionModel} from '../../models/SurveyQuestionModel';

import {
	ButtonsContainer,
	ContentContainer,
	DefaultButton,
	DefaultSecondaryButton,
	DefaultTableButton,
	FormContainer,
	FormGroupContainer,
	FormHeader,
	MainContainer,
} from '../../../../custom-components';

import {AgGridReact} from 'ag-grid-react';
import {Guid} from 'guid-typescript';
import {PROMPT_MESSAGES} from '../../../../constants/Constants';
import useConstant from '../../../../constants/useConstant';
import {SurveyQuestionFilterModel} from '../../models/requests/SurveyQuestionFilterModel';
import * as systemManagement from '../../redux/SystemRedux';
import {deactivateSurveyQuestion, getFieldType, getSurveyQuestionList, getSurveyQuestionListResult} from '../../redux/SystemService';
import {FILTER_STATUS_OPTIONS} from '../constants/SelectOptions';
import CreateSurveyQuestionModal from './modals/CreateSurveyQuestionModal';
import gridOverlayTemplate from '../../../../common-template/gridTemplates';
import { ColDef, ColGroupDef } from 'ag-grid-community';

const surveyQuestionFilterSchema = Yup.object().shape({
	questionName: Yup.string(),
	status: Yup.string(),
	answerName: Yup.string(),
	queueId: Yup.string(),
	userId: Yup.string(),
});

const initialValues = {
	questionName: '',
	status: '',
	answerName: '',
	queueId: '',
	userId: '',
};

const SurveyQuestionList: React.FC = () => {
	// States
	const messagingHub = hubConnection.createHubConnenction();
	const dispatch = useDispatch();
	const history = useHistory();
	const [showAddModal, setShowAddModal] = useState(false);
	const userAccess = useSelector<RootState>(({auth}) => auth.access, shallowEqual) as string;
	const userAccessId = useSelector<RootState>(({auth}) => auth.userId, shallowEqual) as number;
	const [nameFilter, setNameFilter] = useState('');
	const [statusFilter, setStatusFilter] = useState('');
	const [answerFilter, setAnswerFilter] = useState('');
	const questionListState = useSelector<RootState>(({system}) => system.surveyQuestionList, shallowEqual) as SurveyQuestionModel[];
	const {successResponse, SwalConfirmMessage, SwalServerErrorMessage} = useConstant();
	const [loading, setLoading] = useState(false)

	// Formik
	const formik = useFormik({
		initialValues,
		validationSchema: surveyQuestionFilterSchema,
		onSubmit: (values, {setSubmitting}) => {
			loadSurveyQuestionList();
			setSubmitting(false);
		},
	});

	// Effects
	useEffect(() => {
		loadFieldTypes();
		loadSurveyQuestionList();
	}, []);

	useEffect(() => {
		const overlayElement = document.getElementById('mlab-grid-loading-overlay') as HTMLInputElement;
		
		if (overlayElement) {
			if (!loading && (questionListState === undefined || questionListState.length === 0)) {
				overlayElement.innerText = 'No Rows To Show';
			} else {
				overlayElement.innerText = 'Please wait while your items are loading';
			}
		}
	}, [loading]);
	

	// Methods
	const loadFieldTypes = () => {
		// Get Field Type
		getFieldType()
			.then((response) => {
				if (response.status === successResponse) {
					dispatch(systemManagement.actions.GetAllFieldType(response.data));
				} else {
					swal('Failed', response.data.message, 'error').catch(() => {});
				}
			})
			.catch(() => {});
	};

	const loadSurveyQuestionList = () => {
		setLoading(true)
		dispatch(systemManagement.actions.getSurveyQuestionList([]));
		messagingHub
			.start()
			.then(() => {
				const searchRequest: SurveyQuestionFilterModel = {
					userId: userAccessId.toString(),
					queueId: Guid.create().toString(),
					questionsName: nameFilter.trim(),
					questionsStatus: statusFilter.trim(),
					answerName: answerFilter.trim(),
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
										messagingHub.stop().catch(() => {});
										setLoading(false)
									})
									.catch(() => {
										swal(SwalServerErrorMessage.title, SwalServerErrorMessage.textError, SwalServerErrorMessage.icon).catch(() => {});
										setLoading(false)
									});
							});
						} else {
							swal(SwalServerErrorMessage.title, response.data.message, SwalServerErrorMessage.icon).catch(() => {});
							setLoading(false)
						}
					})
					.catch(() => {});
			})
			.catch(() => {});
	};

	const handleShowAddModal = () => {
		setShowAddModal(!showAddModal);
	};

	const handleNameFilterOnChange = (event: any) => {
		setNameFilter(event.target.value);
	};

	const handleStatusFilterOnChange = (event: any) => {
		setStatusFilter(event.target.value);
	};

	const handleAnswerFilterOnChange = (event: any) => {
		setAnswerFilter(event.target.value);
	};

	const handleDeactivate = (val: any) => {
		swal({
			title:
				val.surveyQuestionStatus === true || val.surveyQuestionStatus === 'True'
					? PROMPT_MESSAGES.ConfirmDeactivateTitle
					: PROMPT_MESSAGES.ConfirmActivateTitle,
			text: PROMPT_MESSAGES.ConfirmDeactivateActivateMessage(
				val.surveyQuestionStatus === true || val.surveyQuestionStatus === 'True' ? 'Inactive' : 'Active'
			),
			icon: SwalConfirmMessage.icon,
			buttons: [SwalConfirmMessage.btnCancel, SwalConfirmMessage.btnConfirm],
			dangerMode: true,
		})
			.then((willDelete) => {
				if (willDelete) {
					deactivateSurveyQuestion(val.surveyQuestionId)
						.then((response) => {
							if (response.status === successResponse) {
								loadSurveyQuestionList();
							} else {
								swal(PROMPT_MESSAGES.FailedValidationTitle, 'Error Deactivating Survey Question', 'error').catch(() => {});
							}
						})
						.catch(() => {});
				}
			})
			.catch(() => {});
	};

	const ClearFilter = () => {
		setNameFilter('');
		setStatusFilter('');
		setAnswerFilter('');
		formik.resetForm({});
	};

	const handleSearch = () => {
		formik.submitForm().catch(() => {});
	};

	const handleAddSurveyQuestion = () => {
		handleShowAddModal();
		formik.resetForm();
		formik.submitForm().catch(() => {});
	};

	const saveSurveyQuestion = () => {
		handleShowAddModal();
		loadSurveyQuestionList();
	};

	const onGridReady = (params: any) => {
		params.api.sizeColumnsToFit();
	};
	const handleEditSurveyQuestion = (id: string) => {
		history.push('/system/edit-survey-question/' + id);
	};

	const questionListAction = (params: any) => 
		<>
			<DefaultTableButton
				access={userAccess.includes(USER_CLAIMS.SurveyQuestionAndAnswerWrite)}
				className='btn btn-outline-dark btn-sm px-4 btn-mlab-custom'
				title={params.data.surveyQuestionStatus === true || params.data.surveyQuestionStatus === 'True' ? 'Deactivate' : 'Activate'}
				onClick={() => handleDeactivate(params.data)}
			/>{' '}
			<DefaultTableButton
				access={userAccess.includes(USER_CLAIMS.SurveyQuestionAndAnswerWrite)}
				title={'Edit'}
				onClick={() => handleEditSurveyQuestion(params.data.surveyQuestionId)}
			/>
		</>

	const lowerCaseSurveyQuestionName = (valueA: string, valueB: string) => {
        return valueA.toLowerCase().localeCompare(valueB.toLowerCase());
    };

	const columnDefs: (ColDef<SurveyQuestionModel> | ColGroupDef<SurveyQuestionModel>)[] = [
		{
			headerName:'No',
			field: 'surveyQuestionId',
			sort: 'asc' as 'asc'
		},
		{
			headerName: 'Survey Question Name',
			field: 'surveyQuestionName',
			comparator: lowerCaseSurveyQuestionName
		},
		{
			headerName: 'Field Type',
			field: 'fieldTypeName'
		},
		{
			headerName: 'Survey Answer Status',
			cellRenderer: (params: any) => params.data.surveyQuestionStatus === true || params.data.surveyQuestionStatus === 'True' ? 'Active' : 'Inactive'
		},
		{
			width: 300,
			headerName: 'Action',
			cellRenderer: questionListAction
		}
	]

	return (
		<>
			<FormContainer onSubmit={formik.handleSubmit}>
				<MainContainer>
					<FormHeader headerLabel={'Search Survey Questions'} />
					<ContentContainer>
						<FormGroupContainer>
							<div className='col-lg-4'>
								<label htmlFor='view-survey-question-name'>Survey Question Name</label>
								<input
									id='view-survey-question-name'
									type='text'
									className='form-control form-control-sm'
									aria-label='Operator Name'
									value={nameFilter}
									onChange={handleNameFilterOnChange}
								/>
							</div>
							<div className='col-lg-4'>
								<label htmlFor='view-survey-question-status'>Survey Question Status</label>
								<select id='view-survey-question-status' className='form-select  form-select-sm' aria-label='Select status' value={statusFilter} onChange={handleStatusFilterOnChange}>
									{FILTER_STATUS_OPTIONS.map((item, index) => (
										<option key={item.value.toString()} value={item.value.toString()}>
											{item.label}
										</option>
									))}
								</select>
							</div>
							<div className='col-lg-4'>
								<label htmlFor='view-survey-answer-name'>Survey Answer Name</label>
								<input
									id='view-survey-answer-name'
									type='text'
									className='form-control form-control-sm'
									aria-label='Brand Name'
									value={answerFilter}
									onChange={handleAnswerFilterOnChange}
								/>
							</div>
						</FormGroupContainer>
						<ButtonsContainer>
							<DefaultButton access={userAccess.includes(USER_CLAIMS.SurveyQuestionAndAnswerRead)} title={'Search'} onClick={handleSearch} />
							<DefaultSecondaryButton access={userAccess.includes(USER_CLAIMS.SurveyQuestionAndAnswerRead)} title={'Clear'} onClick={ClearFilter} />
							<DefaultButton
								access={userAccess.includes(USER_CLAIMS.SurveyQuestionAndAnswerWrite)}
								title={'Add Survey Question'}
								onClick={handleAddSurveyQuestion}
							/>
						</ButtonsContainer>
						<FormGroupContainer>
							<div className='ag-theme-quartz' style={{height: 400, width: '100%'}}>
								<AgGridReact
									rowData={questionListState}
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
									paginationPageSize={10}
									paginationPageSizeSelector={false}
									overlayNoRowsTemplate={gridOverlayTemplate}
								>
								</AgGridReact>
							</div>
						</FormGroupContainer>
					</ContentContainer>
				</MainContainer>
			</FormContainer>
			<CreateSurveyQuestionModal modal={showAddModal} toggle={handleShowAddModal} saveSurveyQuestion={saveSurveyQuestion} />
		</>
	);
};

export default SurveyQuestionList;
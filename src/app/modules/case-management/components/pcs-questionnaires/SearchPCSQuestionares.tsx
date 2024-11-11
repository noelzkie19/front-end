import {faEye, faPencilAlt, faPlus} from '@fortawesome/free-solid-svg-icons';
import {ColDef, ColGroupDef} from 'ag-grid-community';
import {AgGridReact} from 'ag-grid-react';
import {Guid} from 'guid-typescript';
import moment from 'moment';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {ButtonGroup, Col, Row} from 'react-bootstrap-v5';
import {shallowEqual, useSelector} from 'react-redux';
import Select from 'react-select';
import swal from 'sweetalert';
import {RootState} from '../../../../../setup';
import {ElementStyle} from '../../../../constants/Constants';
import useConstant from '../../../../constants/useConstant';
import {
	BasicLabel,
	DefaultDateRangePicker,
	DefaultGridPagination,
	FormHeader,
	MainContainer,
	MlabButton,
	TableIconButton,
} from '../../../../custom-components';
import useFnsDateFormatter from '../../../../custom-functions/helper/useFnsDateFormatter';
import {IAuthState} from '../../../auth';
import {OptionsSelectedModel} from '../../../system/models';
import {SkillsResponseModel} from '../../../system/models/response/SkillsResponseModel';
import {useSystemOptionHooks} from '../../../system/shared';
import {USER_CLAIMS} from '../../../user-management/components/constants/UserClaims';
import {
	CaseManagementPCSCommunicationByFilterRequestModel,
	CaseManagementPCSCommunicationResponseModel,
	PCSCommunicationQuestionsResponseModel,
	PCSCommunicationQuestionsWithAnswersUdtModel,
	PCSQuestionaireListByFilterRequestModel,
} from '../../models';
import {
	getCaseManagementPCSCommunicationByFilter,
	getCaseManagementPCSQuestionsByFilter,
	getPCSQuestionaireListCsv,
} from '../../services/CustomerCaseApi';
import {AddSummaryAndActionModal, EditSummaryAndActionModal, PCSQuestionDetailAccordion, ViewSummaryAndActionModal} from '../../shared/components';
import {useCaseManagementHooks} from '../../shared/hooks/useCaseManagementHooks';
import useCaseManagementConstant from '../../useCaseManagementConstant';

/**
 *  ? Local Interface
 */

interface PCSQuestions {
	questionId: string;
	questionMessageEN?: string;
	freeText?: boolean;
}

interface PCSAnswers {
	questionId?: string;
	answer?: string;
}

interface PCSSelectedAnswerOptions {
	options: Array<any>;
	questionId?: string;
	answer?: string;
	freeText?: boolean;
}

interface PCSObjAnswers {
	questionId?: string;
	options: any;
}

const SearchPCSQuestionares: React.FC = () => {
	/**
	 *  ? Redux
	 */
	const {access, userId} = useSelector<RootState>(({auth}) => auth, shallowEqual) as IAuthState;

	/**
	 *  ? States
	 */
	const [pcsCommunications, setPcsCommunications] = useState<Array<CaseManagementPCSCommunicationResponseModel>>([]);
	const [pcsCommunicationQuestions, setPcsCommunicationQuestions] = useState<Array<PCSCommunicationQuestionsResponseModel>>([]);
	const [rowBuff, setRowBuff] = useState<number>(0);
	const [selectedBrand, setSelectedBrand] = useState<string | any>('');
	const [selectedCommunicationProvider, setSelectedCommunicationProvider] = useState<string | any>([]);
	const [selectedSkill, setSelectedSkill] = useState<string | any>('');
	const [selectedAction, setSelectedAction] = useState<string | any>('');
	const [selectedStartEndPeriod, setSelectedStartEndPeriod] = useState<any>();
	const [selectedStartDate, setSelectedStartDate] = useState<string | any>('');
	const [selectedEndDate, setSelectedEndDate] = useState<string | any>('');
	const [pcsQuestionsList, setPcsQuestionsList] = useState<Array<PCSQuestions>>([]);
	const [pcsAnswers, setPcsAnswers] = useState<Array<PCSAnswers>>([]);
	const [postPcsQuestionAnswer, setPostPcsQuestionAnswer] = useState<Array<PCSCommunicationQuestionsWithAnswersUdtModel>>([]);
	const [pcsSelectedOptions, setPcsSelectedOptions] = useState<Array<PCSSelectedAnswerOptions>>([]);
	const [addModalShow, setAddModalShow] = useState<boolean>(false);
	const [editModalShow, setEditModalShow] = useState<boolean>(false);
	const [viewModalShow, setViewModalShow] = useState<boolean>(false);
	const [chatSurveyId, setChatSurveyId] = useState<number>(0);
	const [communicationId, setCommunicationId] = useState<number>(0);
	const [pageSize, setPageSize] = useState<number>(30);
	const [currentPage, setCurrentPage] = useState<number>(1);
	const [recordCount, setRecordCount] = useState<number>(0);
	const [sortOrder, setSortOrder] = useState<string>('desc');
	const [sortColumn, setSortColumn] = useState<string>('cc.StartCommunicationDate');
	const [gridApi, setGridApi] = useState<any>();
	const [license, setLicense] = useState<string>('');
	const [messageTypeId, setMessageTypeId] = useState<string>('');
	const [skillListOptions, setSkillListOptions] = useState<Array<SkillsResponseModel>>([]);
	const [hasOpenPCS, setHasOpenPCS] = useState<boolean>(false);

	const [isLoadingFirstFilter, setIsLoadingFirstFilter] = useState<boolean>(false);
	const [isLoadingSecondFilter, setIsLoadingSecondFilter] = useState<boolean>(false);
	const [isExportingFilter, setIsExportingFilter] = useState<boolean>(false);
	const [disableFilterButton, setDisableFilterButton] = useState<boolean>(true);
	const gridRef: any = useRef();

	const {mlabFormatDate} = useFnsDateFormatter();

	/**
	 *  ? Hooks
	 */
	const {
		getBrandOptions,
		brandOptionList,
		getPostChatSurveyOptions,
		postChatSurveyOptions,
		getPCSCommunicationProviderOptions,
		pcsCommunicationProviderOption,
	} = useSystemOptionHooks();
	const {getCommunicationProviders, communicationProviderOptions, getActionOptions, actionOptions} = useCaseManagementHooks();
	const {HubConnected, successResponse, SwalFailedMessage, SwalConfirmMessage, message} = useConstant();
	const {pcsOptions} = useCaseManagementConstant();

	/**
	 *  ? Mounted
	 */

	// Mounted
	useEffect(() => {
		if (access?.includes(USER_CLAIMS.PCSQuestionnairesRead) === false) {
			//redirect to access denied page
			window.location.href = '/error/401';
		}
	}, []);

	useEffect(() => {
		getBrandOptions();
		getCommunicationProviders();
		getPostChatSurveyOptions();
		getActionOptions();
		getPCSCommunicationProviderOptions();
		setRowBuff(50000);
	}, []);

	const onGridReady = useCallback((params) => {
		params.api.sizeColumnsToFit();
		setGridApi(params.api);
	}, []);

	useEffect(() => {
		const skills = postChatSurveyOptions.skillsByLicense.filter(
			(skillsByLicenseObj) =>
				skillsByLicenseObj.license === license &&
				skillsByLicenseObj.messageTypeId === parseInt(messageTypeId) &&
				skillsByLicenseObj.brandId === parseInt(selectedBrand?.value)
		);
		setSkillListOptions(skills);
	}, [license]);

	useEffect(() => {
		triggerResize();
	}, [pcsCommunications]);
	/**
	 *  ? Events
	 */
	const onChangeBrand = useCallback(
		(event: any) => {
			setSelectedBrand(event);
		},
		[selectedBrand]
	);

	const onChangeCommunicationProvider = useCallback(
		(event: any) => {
			let splitValueOfEvent = event.value.split(',');
			setMessageTypeId(splitValueOfEvent[0].toString());
			setLicense(splitValueOfEvent[1].toString());
			setSelectedCommunicationProvider(event);
			setSkillListOptions([]);
			setSelectedSkill([]);
		},

		[selectedCommunicationProvider]
	);

	const onChangeSkill = useCallback(
		(event: any) => {
			setSelectedSkill(event);
		},
		[selectedSkill]
	);

	const onChangeAction = useCallback(
		(event: any) => {
			setSelectedAction(event);
		},
		[selectedAction]
	);

	const onChangeStartEndPeriod = useCallback(
		(event: any) => {
			setSelectedStartEndPeriod(event);
			setSelectedStartDate(event[0]);
			setSelectedEndDate(event[1]);
		},
		[selectedStartEndPeriod]
	);

	const onChangeMultipleQuestionAnswer = (_questionId: string, _event: any, _isFreeText?: boolean) => {
		let pcsParamsArray: Array<PCSSelectedAnswerOptions> = [];
		_event.forEach((multipleAnswers: any) => {
			let passedPcsParam: PCSSelectedAnswerOptions = {
				options: multipleAnswers,
				questionId: _questionId,
				answer: multipleAnswers.value,
				freeText: _isFreeText,
			};
			pcsParamsArray.push(passedPcsParam);
		});
		setPcsSelectedOptions([...pcsSelectedOptions.filter((obj) => obj.questionId !== _questionId), ...pcsParamsArray]);
	};

	const onChangeQuestionAnswer = (_questionId: string, _event: any, _isFreeText?: boolean) => {
		let pcsSingleSelectionParam: PCSSelectedAnswerOptions = {options: _event, questionId: _questionId, answer: _event.value, freeText: _isFreeText};
		setPcsSelectedOptions([...pcsSelectedOptions.filter((obj) => obj.questionId !== _questionId), pcsSingleSelectionParam]);
	};

	const onSummaryAndActionAddClick = (id: number, comId: number) => {
		setChatSurveyId(id);
		setCommunicationId(comId);
		setAddModalShow(true);
	};
	const onAddModalClose = () => {
		setAddModalShow(false);
	};
	const onSummaryAndActionEditClick = (id: number, comId: number) => {
		setChatSurveyId(id);
		setCommunicationId(comId);
		setEditModalShow(true);
	};
	const onEditModalClose = () => {
		setEditModalShow(false);
	};
	const onSummaryAndActionViewClick = (id: number, comId: number) => {
		setChatSurveyId(id);
		setCommunicationId(comId);
		setViewModalShow(true);
	};

	const addActionUpdate = (actionStatement: string = '', communicationId: number = 0) => {
		let updatedPcsCommunication = pcsCommunications.reduce((acc: any, curr: any) => {
			if (curr.caseCommunicationId === communicationId) {
				curr.action = actionStatement;
			}
			acc.push(curr);
			return acc;
		}, []);
		setPcsCommunications(updatedPcsCommunication);
	};
	const onViewModalClose = () => setViewModalShow(false);
	/**
	 *  ? Table Events
	 */
	const onClickFirst = () => {
		if (currentPage > 1) {
			setCurrentPage(1);
			postSecondSearchQuestionFilter(pageSize, 1, sortColumn, sortOrder);
		}
	};

	const onClickPrevious = () => {
		if (currentPage > 1) {
			setCurrentPage(currentPage - 1);
			postSecondSearchQuestionFilter(pageSize, currentPage - 1, sortColumn, sortOrder);
		}
	};

	const onClickNext = () => {
		if (totalPage() > currentPage) {
			setCurrentPage(currentPage + 1);
			postSecondSearchQuestionFilter(pageSize, currentPage + 1, sortColumn, sortOrder);
		}
	};

	const onClickLast = () => {
		if (totalPage() > currentPage) {
			setCurrentPage(totalPage());
			postSecondSearchQuestionFilter(pageSize, totalPage(), sortColumn, sortOrder);
		}
	};

	const totalPage = () => {
		return Math.ceil(recordCount / pageSize) | 0;
	};
	const onSort = (e: any) => {
		if (pcsCommunications !== undefined && pcsCommunications.length > 0) {
			let sortDetail = e.api.getSortModel();
			if (sortDetail[0] !== undefined) {
				setSortColumn(sortDetail[0]?.colId);
				setSortOrder(sortDetail[0]?.sort);
				postSecondSearchQuestionFilter(pageSize, currentPage, sortDetail[0]?.colId, sortDetail[0]?.sort);
			} else {
				setSortColumn('cc.StartCommunicationDate');
				setSortOrder('asc');
				postSecondSearchQuestionFilter(pageSize, currentPage, 'cc.StartCommunicationDate', 'asc');
			}
		}
	};

	const onPageSizeChanged = () => {
		let pageSize: any | null = document.getElementById('page-size');
		setPageSize(Number(pageSize.value));
		setCurrentPage(1);
		gridApi.paginationSetPageSize(Number(pageSize.value));
		if (pcsCommunications !== undefined && pcsCommunications.length > 0) {
			postSecondSearchQuestionFilter(Number(pageSize.value), 1, sortColumn, sortOrder);
		}
	};

	/**
	 *  ? Methods
	 */
	const postFirstSearchQuestionFilter = () => {
		setPcsAnswers([]);
		if (
			selectedBrand === '' ||
			selectedBrand.length === 0 ||
			messageTypeId === '' ||
			license === '' ||
			selectedSkill.length === 0 ||
			selectedSkill === ''
		) {
			return swal(SwalFailedMessage.title, SwalFailedMessage.textMandatory, SwalFailedMessage.icon);
		}

		if (selectedStartDate !== undefined && selectedEndDate !== undefined) {
			let formatedStartDate: any = moment(selectedStartDate).startOf('day');
			let formatedEndDate: any = moment(selectedEndDate.toString()).startOf('day');
			let totalDateDiff = formatedEndDate.diff(formatedStartDate, 'days');

			let currentDate = moment().startOf('day');

			let totalDateDiffCurrentToEndDate = currentDate.diff(formatedEndDate, 'day');
			let totalDateDiffCurrentToStartDate = currentDate.diff(formatedStartDate, 'day');

			if (totalDateDiffCurrentToStartDate > 180 || totalDateDiffCurrentToEndDate > 180) {
				return swal(
					SwalFailedMessage.title,
					'Unable to proceed. Can only view records for the last 180 days from current date and maximum date range is 31 days',
					SwalFailedMessage.icon
				);
			}

			if (totalDateDiff > 31) {
				return swal(
					SwalFailedMessage.title,
					'Unable to proceed. Can only view records for the last 180 days from current date and maximum date range is 31 days',
					SwalFailedMessage.icon
				);
			}
		}

		setIsLoadingFirstFilter(true);
		const request: PCSQuestionaireListByFilterRequestModel = {
			queueId: Guid.create().toString(),
			userId: userId?.toString() || '0',
			brandId: selectedBrand.value,
			license: license,
			messageTypeId: messageTypeId,
			endDate: mlabFormatDate(selectedEndDate !== undefined ? selectedEndDate.toString() : '', 'MM/d/yyyy HH:mm:ss'),
			startDate: mlabFormatDate(selectedStartDate !== undefined ? selectedStartDate.toString() : '', 'MM/d/yyyy HH:mm:ss'),
			skillId: selectedSkill.value === undefined ? null : selectedSkill.value.toString(),
			summaryAction: selectedAction !== '' ? selectedAction.value : null,
			pcsCommunicationQuestionAnswerType: [],
		};

		getCaseManagementPCSQuestionsByFilter(request)
			.then((response) => {
				if (response.status === successResponse) {
					if (response.data.length === 0) {
						setPcsQuestionsList([]);
						setPcsAnswers([]);
						return swal(SwalFailedMessage.title, 'No Rows To Show', 'info');
					} else {
						let uniqQuestionsId = response.data.map((obj: PCSQuestions) => obj.questionId).filter((val, id, array) => array.indexOf(val) === id);

						let questionsArray: Array<PCSQuestions> = [];
						uniqQuestionsId.forEach((item) => {
							let questionsItem: PCSQuestions = {
								questionId: item,
								questionMessageEN: response.data.find((obj) => obj.questionId === item)?.questionMessageEN,
								freeText: response.data.find((obj) => obj.questionId === item)?.freeText,
							};
							questionsArray.push(questionsItem);
						});
						setPcsQuestionsList(questionsArray);
						let answerArray: Array<PCSAnswers> = [];
						response.data.forEach((item) => {
							let answerItem: PCSAnswers = {
								questionId: item.questionId,
								answer: item.answer,
							};
							answerArray.push(answerItem);
						});
						setPcsAnswers(answerArray);
					}

					setIsLoadingFirstFilter(false);
				}
			})
			.catch(() => {
				swal('Failed', 'Problem in getting getCaseManagementPCSQuestionsByFilter', 'error');
				setIsLoadingFirstFilter(false);
			});
		setIsLoadingFirstFilter(false);
	};

	const injectNullQuestionIds = () => {
		//Logic inject question Ids with out answers
		return pcsQuestionsList.reduce((acc: any, curr) => {
			let hasFreeTextAnswer = pcsSelectedOptions.find((selected) => selected.questionId === curr.questionId);
			if (!hasFreeTextAnswer) {
				acc.push({
					questionId: curr.questionId,
					answer: null,
				});
			}
			return acc;
		}, []);
	};

	const postSecondSearchQuestionFilter = (_pageSize: number, _currentPage: number, _sortColumn: string, _sortOrder: string) => {
		let questionIdInjection = injectNullQuestionIds();

		setIsLoadingSecondFilter(true);
		const request: CaseManagementPCSCommunicationByFilterRequestModel = {
			queueId: Guid.create().toString(),
			userId: userId?.toString() || '0',
			brandId: selectedBrand.value,
			license: license,
			messageTypeId: messageTypeId,
			endDate: mlabFormatDate(selectedEndDate !== undefined ? selectedEndDate.toString() : '', 'MM/d/yyyy HH:mm:ss'),
			startDate: mlabFormatDate(selectedStartDate !== undefined ? selectedStartDate.toString() : '', 'MM/d/yyyy HH:mm:ss'),
			skillId: selectedSkill.value === undefined ? null : selectedSkill.value.toString(),
			summaryAction: selectedAction.value,
			offsetValue: (_currentPage - 1) * _pageSize,
			pageSize: _pageSize,
			sortColumn: _sortColumn,
			sortOrder: _sortOrder,
			pcsCommunicationQuestionAnswerType: [...questionIdInjection, ...pcsSelectedOptions].map((allAnsweredQuestions) => {
				return {
					questionId: allAnsweredQuestions.questionId,
					answer: allAnsweredQuestions.answer,
				};
			}),
		};

		getCaseManagementPCSCommunicationByFilter(request)
			.then((response) => {
				if (response.status === successResponse) {
					let caseManagementPCSCommunications = response.data.caseManagementPCSCommunications.map((item) => ({...item, isOpen: true}));
					setPcsCommunications(caseManagementPCSCommunications);
					setRecordCount(response.data.recordCount);
					setIsLoadingSecondFilter(false);
					setDisableFilterButton(false);
				}
			})
			.catch(() => {
				setIsLoadingSecondFilter(false);
				setDisableFilterButton(true);
				swal('Failed', 'Problem in getting getCaseManagementPCSQuestionsByFilter', 'error');
			});
	};

	const onExportToCSV = () => {
		if (selectedBrand === '' || selectedBrand.length === 0) {
			return swal(SwalFailedMessage.title, SwalFailedMessage.textMandatory, SwalFailedMessage.icon);
		}

		setIsExportingFilter(true);
		let _selectedActions: string = Object.assign(Array<OptionsSelectedModel>(), selectedAction)
			.map((el: any) => el.value)
			.join(',');

		let questionIdInjection = injectNullQuestionIds();

		const request: PCSQuestionaireListByFilterRequestModel = {
			queueId: Guid.create().toString(),
			userId: userId?.toString() || '0',
			brandId: selectedBrand.value,
			endDate: mlabFormatDate(selectedEndDate !== undefined ? selectedEndDate.toString() : '', 'MM/d/yyyy HH:mm:ss'),
			startDate: mlabFormatDate(selectedStartDate !== undefined ? selectedStartDate.toString() : '', 'MM/d/yyyy HH:mm:ss'),
			skillId: selectedSkill.value === undefined ? null : selectedSkill.value.toString(),
			summaryAction: _selectedActions,
			license: license,
			pcsCommunicationQuestionAnswerType: [...questionIdInjection, ...pcsSelectedOptions].map((allAnsweredQuestions) => {
				return {
					questionId: allAnsweredQuestions.questionId,
					answer: allAnsweredQuestions.answer,
				};
			}),
		};

		getPCSQuestionaireListCsv(request)
			.then((response) => {
				const url = window.URL.createObjectURL(new Blob([response.data]));
				const link = document.createElement('a');
				link.href = url;
				link.setAttribute('download', 'PCS_Q&A.csv');
				document.body.appendChild(link);
				link.click();
				setIsExportingFilter(false);
			})
			.catch(() => {
				swal('Failed', 'Problem in onExportToCSV', 'error');
				setIsExportingFilter(false);
			});
	};

	const triggerFinalSearchQuestionFilter = () => {
		postSecondSearchQuestionFilter(pageSize, 1, sortColumn, sortOrder);
	};

	const clearFirstSearhQuestionFilter = () => {
		setSelectedBrand([]);
		setSelectedCommunicationProvider([]);
		setSelectedSkill([]);
		setSelectedAction('');
		setSelectedStartEndPeriod([]);
		setLicense('');
		setMessageTypeId('');
		setPcsQuestionsList([]);
		setPcsAnswers([]);
		setPcsSelectedOptions([]);
	};

	const resetSecondFilter = () => {
		setPcsSelectedOptions([]);
	};

	const triggerResize = () => {
		//logic to resize AGGrid column for CommunicationID
		let openPCS = pcsCommunications.some((pcsObj: CaseManagementPCSCommunicationResponseModel) => pcsObj.isOpen === true);
		setHasOpenPCS(openPCS);
	};

	/**
	 *  ? Tables and Headers
	 */

	const externalIdRenderer = ({data}: any) => {
		return (
			<a
				className='cursor-pointer'
				href={'/case-management/service-case/' + data.caseId + '#' + data.caseCommunicationId}
				rel='noreferrer'
				target='_blank'
			>
				{data.externalId}
			</a>
		);
	};

	const questionAccordionRenderer = ({data}: any) => {
		return <PCSQuestionDetailAccordion data={data} resize={triggerResize} />;
	};
	const columnDefs: (ColDef<CaseManagementPCSCommunicationResponseModel> | ColGroupDef<CaseManagementPCSCommunicationResponseModel>)[] = [
		{
			headerName: 'Summary And Action',
			sortable: false,
			cellRenderer: (params: any) => (
				<>
					<ButtonGroup aria-label='Basic example'>
						<div className='d-flex justify-content-center flex-shrink-0'>
							<div className='me-4'>
								{params.data.action === '' || params.data.action === null || params.data.action === undefined ? (
									<TableIconButton
										access={true}
										faIcon={faPlus}
										toolTipText={'Add'}
										onClick={() => onSummaryAndActionAddClick(params.data.chatSurveyId, params.data.caseCommunicationId)}
										isDisable={false}
									/>
								) : (
									<TableIconButton
										access={true}
										faIcon={faPencilAlt}
										toolTipText={'Edit'}
										onClick={() => onSummaryAndActionEditClick(params.data.chatSurveyId, params.data.caseCommunicationId)}
										isDisable={false}
									/>
								)}
							</div>
							<div className='me-4'>
								{params.data.action !== '' && params.data.action !== null && params.data.action !== undefined ? (
									<TableIconButton
										access={true}
										faIcon={faEye}
										toolTipText={'View'}
										onClick={() => onSummaryAndActionViewClick(params.data.chatSurveyId, params.data.caseCommunicationId)}
										isDisable={false}
									/>
								) : (
									<></>
								)}
							</div>
						</div>
					</ButtonGroup>
				</>
			),
		},
		{
			headerName: 'Communication ID',
			field: 'caseCommunicationId',
			autoHeight: true,
			width: hasOpenPCS ? 800 : 175,
			cellRenderer: questionAccordionRenderer,
		},
		{
			headerName: 'External Id',
			field: 'externalId',
			cellRenderer: externalIdRenderer,
		},
		{
			headerName: 'Player',
			field: 'playerName',
		},
		{
			headerName: 'Communication Owner',
			field: 'communicationOwner',
		},
		{
			headerName: 'Topic',
			field: 'topicName',
		},
		{
			headerName: 'Subtopic',
			field: 'subtopicName',
		},
		{
			headerName: 'Communication Start Date',
			field: 'communicationStartDate',
			// autoWidth: true,
			cellRenderer: (params: any) => {
				return params.data.communicationStartDate ? moment(new Date(params.data.communicationStartDate)).format('DD/MM/YYYY HH:mm:ss') : '';
			},
			sortable: true,
		},
	];
	const pcsMultipleAnswers = (data: any, object: any) => {
		const result = data.filter((obj: any) => obj.questionId === object.questionId).flatMap((x: any) => [{label: x.answer, value: x.answer}]);

		return result;
	};

	return (
		<>
			{/* First Section of filters */}
			<MainContainer>
				<FormHeader headerLabel={'Search Questionnaires'} />
				<div style={{margin: 20}}>
					<Row style={{margin: 20}}>
						<Col sm={4}>
							<label className='form-label-sm required'>Brand</label>
							<Select size='small' style={{width: '100%'}} options={brandOptionList} onChange={onChangeBrand} value={selectedBrand} />
						</Col>
						<Col sm={4}>
							<label className='form-label-sm required'>Communication Provider</label>
							<Select
								size='small'
								style={{width: '100%'}}
								options={pcsCommunicationProviderOption.flatMap((obj) => [
									{
										label: obj.messageTypeName + '(' + obj.licenseId + ')',
										value: obj.messageTypeId + ',' + obj.licenseId,
									},
								])}
								onChange={onChangeCommunicationProvider}
								value={selectedCommunicationProvider}
							/>
						</Col>
						<Col sm={4}>
							<label className='form-label-sm required'>Skill</label>
							<Select size='small' style={{width: '100%'}} options={skillListOptions} onChange={onChangeSkill} value={selectedSkill} />
						</Col>
					</Row>
					<Row style={{margin: 20}}>
						<Col sm={4}>
							<BasicLabel title={'Summary And Action'} />
							<Select size='small' style={{width: '100%'}} options={pcsOptions} onChange={onChangeAction} value={selectedAction} />
						</Col>
						<Col sm={4}>
							<BasicLabel title={'Communication Start Date Range'} />
							<DefaultDateRangePicker
								disablePreviousDate={false}
								format='dd/MM/yyyy HH:mm:ss'
								onChange={onChangeStartEndPeriod}
								value={selectedStartEndPeriod}
								maxDays={180}
								isDisabled={false}
								customPlaceHolder='DD/mm/yyyy HH:mm:ss ~ DD/mm/yyyy HH:mm:ss'
							/>
						</Col>
					</Row>
					<Row style={{marginLeft: 20}}>
						<Col sm={12}>
							<MlabButton
								access={true}
								size={'sm'}
								label={'Search'}
								style={ElementStyle.primary}
								type={'button'}
								weight={'solid'}
								loading={isLoadingFirstFilter}
								disabled={!access?.includes(USER_CLAIMS.PCSQuestionnairesWrite)}
								loadingTitle={' Please wait...'}
								onClick={postFirstSearchQuestionFilter}
							/>
							<MlabButton
								access={true}
								size={'sm'}
								label={'Clear'}
								style={ElementStyle.secondary}
								type={'button'}
								weight={'solid'}
								loading={isLoadingFirstFilter}
								disabled={isLoadingFirstFilter}
								loadingTitle={' Please wait...'}
								onClick={clearFirstSearhQuestionFilter}
							/>

							<MlabButton
								access={access?.includes(USER_CLAIMS.PCSQuestionnairesRead)}
								size={'sm'}
								label={'Export to CSV'}
								style={ElementStyle.primary}
								type={'button'}
								weight={'solid'}
								loading={isExportingFilter}
								disabled={disableFilterButton}
								loadingTitle={' Please wait...'}
								onClick={onExportToCSV}
							/>
						</Col>
					</Row>
				</div>
			</MainContainer>
			<div style={{margin: 20}} />
			{/* Second Section of filters */}
			{pcsQuestionsList.length !== 0 && (
				<MainContainer>
					<div style={{margin: 20}}>
						<Row style={{margin: 10}}>
							<Col sm={3}>
								<label className='fw-bolder'>Question ID</label>
							</Col>
							<Col sm={4}>
								<label className='fw-bolder'>Question</label>
							</Col>
							<Col sm={4}>
								<label className='fw-bolder'>Answer</label>
							</Col>
						</Row>
						{pcsQuestionsList.map((questionsObj) => {
							return (
								<Row key={questionsObj.questionId} style={{margin: 10}}>
									<Col sm={3}>
										<label className='fw-bolder' key={questionsObj.questionId}>
											{questionsObj.questionId}
										</label>
									</Col>
									<Col sm={4} key={questionsObj.questionId}>
										<label className='fw-bolder' key={questionsObj.questionId}>
											{questionsObj.questionMessageEN}
										</label>
									</Col>
									<Col sm={4}>
										{questionsObj.freeText === false && (
											<Select
												isMulti
												isSearchable={false}
												size='small'
												style={{width: '100%'}}
												options={pcsMultipleAnswers(pcsAnswers, questionsObj)}
												onChange={(e: any) => onChangeMultipleQuestionAnswer(questionsObj.questionId, e, questionsObj.freeText)}
												value={pcsSelectedOptions.filter((obj) => obj.questionId === questionsObj.questionId).map((optionsObj) => optionsObj.options)}
											/>
										)}
										{questionsObj.freeText === true && (
											<Select
												size='small'
												style={{width: '100%'}}
												options={pcsOptions}
												onChange={(e: any) => onChangeQuestionAnswer(questionsObj.questionId, e, questionsObj.freeText)}
												value={pcsSelectedOptions.filter((obj) => obj.questionId === questionsObj.questionId).map((optionsObj) => optionsObj.options)}
											/>
										)}
									</Col>
								</Row>
							);
						})}
						<Row style={{marginLeft: 20}}>
							<Col sm={12}>
								<MlabButton
									access={access?.includes(USER_CLAIMS.PCSQuestionnairesRead)}
									size={'sm'}
									label={'Filter'}
									style={ElementStyle.primary}
									type={'button'}
									weight={'solid'}
									loading={isLoadingSecondFilter}
									disabled={isLoadingSecondFilter}
									loadingTitle={' Please wait...'}
									onClick={triggerFinalSearchQuestionFilter}
								/>
								<MlabButton
									access={access?.includes(USER_CLAIMS.PCSQuestionnairesRead)}
									size={'sm'}
									label={'Reset'}
									style={ElementStyle.secondary}
									type={'button'}
									weight={'solid'}
									loading={isLoadingSecondFilter}
									disabled={isLoadingSecondFilter}
									loadingTitle={' Please wait...'}
									onClick={resetSecondFilter}
								/>
							</Col>
						</Row>
					</div>
				</MainContainer>
			)}

			<div style={{margin: 20}} />
			<MainContainer>
				<div style={{margin: 20}}>
					<div className='ag-theme-quartz' style={{height: 800, width: '100%'}}>
						<AgGridReact
							rowData={pcsCommunications}
							defaultColDef={{
								sortable: false,
								resizable: true,
							}}
							onGridReady={onGridReady}
							rowBuffer={rowBuff}
							rowSelection={'multiple'}
							pagination={false}
							paginationPageSize={pageSize}
							columnDefs={columnDefs}
							onSortChanged={(e) => onSort(e)}
							ref={gridRef}
						/>

						<DefaultGridPagination
							recordCount={recordCount}
							currentPage={currentPage}
							pageSize={pageSize}
							onClickFirst={onClickFirst}
							onClickPrevious={onClickPrevious}
							onClickNext={onClickNext}
							onClickLast={onClickLast}
							onPageSizeChanged={onPageSizeChanged}
							pageSizes={[20, 30]}
						/>
					</div>
				</div>
			</MainContainer>
			<AddSummaryAndActionModal
				communicationId={communicationId}
				chatSurveyId={chatSurveyId}
				closeModal={onAddModalClose}
				showForm={addModalShow}
				addActionUpdate={addActionUpdate}
			></AddSummaryAndActionModal>
			<EditSummaryAndActionModal
				communicationId={communicationId}
				chatSurveyId={chatSurveyId}
				closeModal={onEditModalClose}
				showForm={editModalShow}
			></EditSummaryAndActionModal>
			<ViewSummaryAndActionModal
				communicationId={communicationId}
				chatSurveyId={chatSurveyId}
				closeModal={onViewModalClose}
				showForm={viewModalShow}
			></ViewSummaryAndActionModal>
		</>
	);
};

export default SearchPCSQuestionares;

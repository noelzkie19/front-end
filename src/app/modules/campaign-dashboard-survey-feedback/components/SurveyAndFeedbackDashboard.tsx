import {Guid} from 'guid-typescript';
import moment from 'moment';
import {useEffect, useState} from 'react';
import {shallowEqual, useSelector} from 'react-redux';
import Select from 'react-select';
import {DateRangePicker} from 'rsuite';
import swal from 'sweetalert';
import {FeedbackResultChart, FeedbackResultTable, ReportSummary, SurveyResultChart, SurveyResultTable} from '.';
import {RootState} from '../../../../setup';
import * as hubConnection from '../../../../setup/hub/MessagingHub';
import {LookupModel, MasterReferenceOptionModel} from '../../../common/model';
import {ElementStyle, PROMPT_MESSAGES} from '../../../constants/Constants';
import useConstant from '../../../constants/useConstant';
import {ButtonsContainer, ContentContainer, FormGroupContainer, FormHeader, MainContainer, MlabButton} from '../../../custom-components';
import {useMasterReferenceOption} from '../../../custom-functions';
import CommonLookups from '../../../custom-functions/CommonLookups';
import {getAllCampaignsList} from '../../campaign-agent-workspace/redux/AgentWorkspaceService';
import {USER_CLAIMS} from '../../user-management/components/constants/UserClaims';
import {
	SurveyAndFeedbackExportModel,
	SurveyAndFeedbackRequestModel,
	SurveyAndFeedbackResultResponseModel,
	SurveyAndFeedbackResultResponseModelFactory,
	SurveyResultChartModel,
	SurveyResultResponseModel,
} from '../models';
import {ExportDataModel} from '../models/ExportDataModel';
import {
	CampaignCommunicationFeedbackReponseModel,
	CampaignCommunicationFeedbackReponseModelFactory,
} from '../models/response/CampaignCommunicationFeedbackReponseModel';
import {
	CampaignCommunicationSurveyResponseModel,
	CampaignCommunicationSurveyResponseModelFactory,
} from '../models/response/CampaignCommunicationSurveyResponseModel';
import ExportData, {ExportExcelMultiSheet} from '../services/ExportData';
import {getSurveyAndFeedbackReport, getSurveyAndFeedbackReportResult} from '../services/SurveyAndFeedbackReportService';

const SurveyAndFeedbackDashboard: React.FC = () => {
	//Redux
	const userAccess = useSelector<RootState>(({auth}) => auth.access, shallowEqual) as string;
	const userAccessId = useSelector<RootState>(({auth}) => auth.userId, shallowEqual) as number;

	//States
	const [loading, setLoading] = useState(false);
	const [showResult, setShowResult] = useState(false);
	const [disableDatepicker, setDisableDatepicker] = useState(false);
	const [campaignDropdownList, setCampaignDropdownList] = useState<Array<LookupModel>>([]);
	const [timePeriodList] = useState<Array<LookupModel>>([
		{value: 'registrationDate', label: 'Registration Date'},
		{value: 'taggedDate', label: 'Tagged Date'},
		{value: 'playerAddedtoCampaign', label: 'Player Added to Campaign'},
		{value: 'all', label: 'All'},
	]);
	const [periodSelectionList] = useState<Array<LookupModel>>([
		{value: 'all', label: 'All'},
		{value: 'today', label: 'Today'},
		{value: 'yesterday', label: 'Yesterday'},
		{value: 'lastweek', label: 'Last Week'},
		{value: 'custom', label: 'Custom'},
	]);
	const [exportToList] = useState<Array<LookupModel>>([
		{value: 'csv', label: 'CSV'},
		{value: 'xlsx', label: 'Excel'},
	]);

	const campaignTypeOptions = useMasterReferenceOption('34')
		.filter((x: MasterReferenceOptionModel) => x.masterReferenceParentId === 34)
		.map((x: MasterReferenceOptionModel) => x.options);

	const [filterCampaignType, setFilterCampaignType] = useState<any>();
	const [filterCampaignName, setFilterCampaignName] = useState<any>();
	const [filterCurrency, setFilterCurrency] = useState<LookupModel>();
	const [filterTimePeriod, setFilterTimePeriod] = useState<LookupModel>({value: 'registrationDate', label: 'Registration Date'});
	const [filterPeriodSelection, setFilterPeriodSelection] = useState<LookupModel>({value: 'today', label: 'Today'});
	const [filterReportDateRange, setFilterReportDateRange] = useState<any>([new Date(), new Date()]);
	const [filterIncludeDiscardPlayerTo, setFilterIncludeDiscardPlayerTo] = useState(false);
	const [filterSurveyQuestion, setFilterSurveyQuestion] = useState<LookupModel>({ label: '', value: '' });
	const [exportToFeedback, setExportToFeedback] = useState<LookupModel>({value: 'csv', label: 'CSV'});
	const [exportToSurvey, setExportToSurvey] = useState<LookupModel>({value: 'csv', label: 'CSV'});
	const [exportReportParameters, setExportReportParameters] = useState<SurveyAndFeedbackExportModel>();
	const [reportData, setReportData] = useState<SurveyAndFeedbackResultResponseModel>(SurveyAndFeedbackResultResponseModelFactory());
	const [surveyQuestionsList, setSurveyQuestionsList] = useState<Array<LookupModel>>([]);
	const [filteredSurveyResult, setFilteredSurveyResult] = useState<Array<SurveyResultResponseModel>>([]);
	const [filteredSurveyChartData, setFilteredSurveyChartData] = useState<SurveyResultChartModel>({
		data1: [],
		data2: [],
		category: [],
	} as SurveyResultChartModel);

	//Constants
	let customVal: string = 'custom';
	const {successResponse, HubConnected} = useConstant();

	// Mounted
	useEffect(() => {
		loadAllCampaign();
	}, [filterCampaignType]);

	// Watchers
	useEffect(() => {
		let periodSel: LookupModel = filterPeriodSelection;
		if (periodSel.value !== customVal) {
			setDisableDatepicker(true);
		}
	}, [filterPeriodSelection]);

	useEffect(() => {
		if (reportData?.surveyResult) {
			const distinctQuestions = Array.from(new Set(reportData.surveyResult.map((i) => i.surveyQuestionId)));
			const chartData = distinctQuestions.map((i) => {
				const item: LookupModel = {
					label: reportData.surveyResult.find((j) => j.surveyQuestionId === i)?.surveyQuestionName ?? '',
					value: i.toString(),
				};
				return item;
			});
			setSurveyQuestionsList(chartData);
		}
	}, [reportData]);

	const loadAllCampaign = () => {
		setFilterCampaignName(null);
		getAllCampaignsList(parseInt(filterCampaignType ? filterCampaignType.value : '0')).then((response) => {
			if (response.status === successResponse) {
				let resultData = Object.assign(new Array<LookupModel>(), response.data);
				setCampaignDropdownList(resultData);
			} else {
				swal('Failed', 'Error getting Campaign List', 'error');
			}
		});
	};

	// Events
	const onChangeCampaignType = (val: LookupModel) => {
		setFilterCampaignType(val);
	};

	const onChangeCampaignName = (val: LookupModel) => {
		setFilterCampaignName(val);
	};

	const onChangeCurrency = (val: LookupModel) => {
		setFilterCurrency(val);
	};

	const onChangeTimePeriod = (val: LookupModel) => {
		setFilterTimePeriod(val);
		if (val.value === 'all') {
			onChangePeriodSelection({value: 'all', label: 'All'});
		}
	};

	const onChangePeriodSelection = (val: LookupModel) => {
		setFilterPeriodSelection(val);
		switch (val.value) {
			case 'all':
				setFilterReportDateRange([undefined, undefined]);
				break;
			case 'today':
				setDisableDatepicker(false);
				setFilterReportDateRange([new Date(), new Date()]);
				setDisableDatepicker(true);
				break;
			case 'yesterday':
				setDisableDatepicker(false);
				setFilterReportDateRange([new Date(moment().subtract(1, 'days').toString()), new Date(moment().subtract(1, 'days').toString())]);
				setDisableDatepicker(true);
				break;
			case 'lastweek':
				setDisableDatepicker(false);
				setDisableDatepicker(true);
				moment.updateLocale('en', {
					week: {
						dow: 1,
					},
				});
				setFilterReportDateRange([
					new Date(moment().startOf('week').subtract(7, 'days').toString()),
					new Date(moment().endOf('week').subtract(7, 'days').toString()),
				]);
				break;
			case 'custom':
				setDisableDatepicker(false);
				setFilterReportDateRange([]);
				break;
			default:
				break;
		}
	};

	const onChangeCreatedDate = (val: any) => {
		setFilterReportDateRange(val);
	};

	const onChangeDiscardPlayerTo = () => {
		setFilterIncludeDiscardPlayerTo(!filterIncludeDiscardPlayerTo);
	};

	const onChangeFeedbackExportTo = (val: any) => {
		setExportToFeedback(val);
	};

	const onChangeSurveyExportTo = (val: any) => {
		setExportToSurvey(val);
	};

	const onChangeSurveyQuestion = (val: LookupModel) => {
		setFilterSurveyQuestion(val);
	};

	const validateRequest = () => {
		if (filterCampaignName == undefined || filterCurrency == undefined) {
			swal(PROMPT_MESSAGES.FailedValidationTitle, 'Unable to proceed, kindly fill up the mandatory fields', 'error');
			return false;
		}

		return true;
	};

	// Methods
	const clearData = () => {
		setFilterSurveyQuestion({ label: '', value: '' });
		setSurveyQuestionsList([]);
		setFilteredSurveyResult([]);
	};

	const generateReport = async () => {
		setLoading(true);
		if (!validateRequest()) {
			setLoading(false);
			return;
		}

		const request = createRequest();
		
		const filterExport = createFilterExport();

		setExportReportParameters(filterExport);
		setReportData(SurveyAndFeedbackResultResponseModelFactory());
		clearData();

		setTimeout(() => {
			 getSurveyFeedbackReportOnGenerateReport(request)
		}, 1000);
	};

	const createFilterExport = () => {
		return {
			CampaignType: filterCampaignType?.label || '',
			CampaignName: filterCampaignName?.label || '',
			Currency: filterCurrency?.label || '',
			TimePeriod: filterTimePeriod?.label || '',
			PeriodSelection: filterPeriodSelection?.label || '',
			IncludeDiscardPlayerTo: filterIncludeDiscardPlayerTo ? 'YES' : 'NO',
			DateStart: filterReportDateRange[0],
			DateEnd: filterReportDateRange[1],
		}
	}

	const createRequest = () => {
		return {
			campaignId: Number(filterCampaignName?.value ?? 0),
			currencyId: Number(filterCurrency?.value ?? 0),
			registrationDateStart: filterTimePeriod.value === 'all' || filterTimePeriod.value === 'registrationDate' ? filterReportDateRange[0] : undefined,
			registrationDateEnd: filterTimePeriod.value === 'all' || filterTimePeriod.value === 'registrationDate' ? filterReportDateRange[1] : undefined,
			taggedDateStart: filterTimePeriod.value === 'all' || filterTimePeriod.value === 'taggedDate' ? filterReportDateRange[0] : undefined,
			taggedDateEnd: filterTimePeriod.value === 'all' || filterTimePeriod.value === 'taggedDate' ? filterReportDateRange[1] : undefined,
			addedToCampaignStart: filterTimePeriod.value === 'all' || filterTimePeriod.value === 'playerAddedtoCampaign' ? filterReportDateRange[0] : undefined, 
			addedToCampaignEnd: filterTimePeriod.value === 'all' || filterTimePeriod.value === 'playerAddedtoCampaign' ? filterReportDateRange[1] : undefined, 
			includeDiscardPlayerTo: filterIncludeDiscardPlayerTo,
			queueId: Guid.create().toString(),
			userId: userAccessId.toString(),
			campaignTypeId: filterCampaignType ? parseInt(filterCampaignType.value) : 0,
		}
	}

	const getSurveyFeedbackReportOnGenerateReport = (request: SurveyAndFeedbackRequestModel) => {
		const messagingHub = hubConnection.createHubConnenction();
		messagingHub
			.start()
			.then(() => {
				if (messagingHub.state === HubConnected) {
					getSurveyAndFeedbackReport(request)
						.then((response) => {
							if (response.status === successResponse) {
								messagingHub.on(request.queueId.toString(), (message) => {
									getSurveyAndFeedbackReportResult(message.cacheId)
										.then((returnData) => {
											let resultData: SurveyAndFeedbackResultResponseModel = { ...returnData.data };
											setReportData(resultData);
											setShowResult(true);
											setLoading(false);
											if (resultData.feedbackResultSummary.length === 0) {
												swal('Survey And Feedback Report', 'No Rows To Show', 'info');
											}
											messagingHub.off(request.queueId.toString());
											messagingHub.stop();
										})
										.catch(() => {
											setLoading(false);
										});
								});
							}
						})
						.catch(() => {
							setLoading(false);
						});
				}
			})
			.catch(() => {
				messagingHub.stop();
				setLoading(false);
			});
	}

	const showSurveyReport = () => {
		const filteredAnswers = reportData.surveyResult.filter((i) => i.surveyQuestionId === Number(filterSurveyQuestion?.value));
		const surveyChartData: SurveyResultChartModel = {
			category: filteredAnswers.map((i) => i.surveyAnswer),
			data1: filteredAnswers.map((i) => i.ftd),
			data2: filteredAnswers.map((i) => i.count),
		};
		setFilteredSurveyResult(filteredAnswers);
		setFilteredSurveyChartData(surveyChartData);
	};

	const exportFeedbackReport = async () => {
		if (reportData.feedbackResult.length > 0) {
			const format = exportToFeedback?.value ?? 'xlsx';

			ExportData([exportReportParameters], [reportData.reportSummary], reportData.feedbackResult, true, format, 'Feedback_CategoryAnswer');
		}
	};

	const exportSurveyReport = async () => {
		if (reportData.surveyResult.length > 0) {
			const format = exportToSurvey?.value ?? 'xlsx';
			ExportData([exportReportParameters], [reportData.reportSummary], filteredSurveyResult, true, format, 'Survey_QuestionAnswer');
		}
	};
	const exportCommunicationExcelReport = async () => {
		reportData?.campaignCommunicationSurveyResult.map((cat: CampaignCommunicationSurveyResponseModel) => {
			cat.surveyAnswers = cat.surveyAnswers.replace(/\n/g, '');
			return {...cat};
		});
		reportData?.campaignCommunicationFeedbackResult.map((cat: CampaignCommunicationFeedbackReponseModel) => {
			cat.feedbackAnswer = cat.feedbackAnswer.replace(/\n/g, '');
			return {...cat};
		});
		const dataResult: Array<ExportDataModel> = [
			{
				detail:
					reportData.campaignCommunicationSurveyResult.length > 0
						? reportData.campaignCommunicationSurveyResult
						: [CampaignCommunicationSurveyResponseModelFactory()],
				sheetName: 'CommunicationSurveys',
			},
			{
				detail:
					reportData.campaignCommunicationFeedbackResult.length > 0
						? reportData.campaignCommunicationFeedbackResult
						: [CampaignCommunicationFeedbackReponseModelFactory()],
				sheetName: 'CommunicationFeedbacks',
			},
		];
		ExportExcelMultiSheet(dataResult, 'Campaign Communication Records', true);
	};

	return (
		<>
			<MainContainer>
				<FormHeader headerLabel={'Survey and Feedback Report'} />
				<ContentContainer>
					<FormGroupContainer>
						<div className='col-lg-2'>
							<div className='form-control-label mb-2 required'>Campaign Type</div>
							<Select size='small' style={{width: '100%'}} options={campaignTypeOptions} onChange={onChangeCampaignType} value={filterCampaignType} />
						</div>
						<div className='col-lg-5'>
							<div className='form-control-label mb-2 required'>Campaign Name</div>
							<Select
								size='small'
								style={{width: '100%'}}
								options={campaignDropdownList}
								onChange={onChangeCampaignName}
								value={filterCampaignName}
							/>
						</div>
						<div className='col-lg-3'>
							<div className='form-control-label mb-2 required'>Currency</div>
							<Select size='small' style={{width: '100%'}} options={CommonLookups('currencies')} onChange={onChangeCurrency} value={filterCurrency} />
						</div>
					</FormGroupContainer>
					<FormGroupContainer>
						<div className='col-lg-2 mt-2'>
							<div className='form-control-label'>Time Period</div>
							<Select size='small' style={{width: '100%'}} options={timePeriodList} onChange={onChangeTimePeriod} value={filterTimePeriod} />
						</div>
						{filterTimePeriod && filterTimePeriod.value !== 'all' && (
							<div className='col-lg-2 mt-8'>
								<div></div>
								<Select
									size='small'
									style={{width: '100%'}}
									options={periodSelectionList}
									onChange={onChangePeriodSelection}
									value={filterPeriodSelection}
								/>
							</div>
						)}
						{filterPeriodSelection && filterPeriodSelection.value !== 'all' && (
							<div className='col-lg-3 mt-2'>
								<div></div>
								<DateRangePicker
									className='mt-6'
									format='yyyy-MM-dd'
									onChange={onChangeCreatedDate}
									style={{width: '100%'}}
									value={filterReportDateRange}
									disabled={disableDatepicker}
									placement='auto'
								/>
							</div>
						)}
						<div className='col-lg-2 mt-2'>
							<div className='form-check form-switch form-check-custom form-check-solid mt-6'>
								<div className='form-check-label me-3'>Include Discard Player To</div>
								<input
									className='form-check-input'
									type='checkbox'
									value=''
									id='playerClaimRead'
									checked={filterIncludeDiscardPlayerTo}
									onChange={onChangeDiscardPlayerTo}
									disabled={false}
								/>
							</div>
						</div>
					</FormGroupContainer>
					<FormGroupContainer>
						<ButtonsContainer>
							<MlabButton
								access={userAccess.includes(USER_CLAIMS.SurveyAndFeedbackRead)}
								label='Generate'
								style={ElementStyle.primary}
								type={'submit'}
								weight={'solid'}
								size={'sm'}
								loading={loading}
								loadingTitle={'Please wait...'}
								disabled={loading}
								onClick={generateReport}
							/>
						</ButtonsContainer>
					</FormGroupContainer>
				</ContentContainer>
			</MainContainer>
			{showResult && (
				<>
					<div className='card card-custom mt-2'>
						<ContentContainer>
							<FormGroupContainer>
								<ReportSummary summary={reportData.reportSummary} />
							</FormGroupContainer>
						</ContentContainer>
					</div>
					<div className='card card-custom mt-2'>
						<ContentContainer>
							<FormGroupContainer>
								<ButtonsContainer>
									<div className='flex-grow-2 mx-2'>Export To</div>

									<div className='flex-grow-2 w-25 mx-2'>
										<Select
											size='small'
											style={{width: '100%'}}
											options={exportToList}
											onChange={onChangeFeedbackExportTo}
											value={exportToFeedback}
										/>
									</div>

									<div className='flex-grow-2  mx-2'>
										<MlabButton
											access={userAccess.includes(USER_CLAIMS.SurveyAndFeedbackRead)}
											label='Export'
											style={ElementStyle.primary}
											type={'submit'}
											weight={'solid'}
											size={'sm'}
											loading={loading}
											loadingTitle={'Please wait...'}
											disabled={loading}
											onClick={exportFeedbackReport}
										/>
									</div>
									<div className='flex-grow-2  mx-2'>
										<MlabButton
											access={userAccess.includes(USER_CLAIMS.SurveyAndFeedbackRead)}
											label='Generate Communication Records'
											style={ElementStyle.primary}
											type={'submit'}
											weight={'solid'}
											size={'sm'}
											loading={loading}
											loadingTitle={'Please wait...'}
											disabled={loading}
											onClick={exportCommunicationExcelReport}
										/>
									</div>
								</ButtonsContainer>
								<div className='separator separator-dashed my-2'></div>
							</FormGroupContainer>
							<FormGroupContainer>
								<div className='col-lg-5'>
									<FeedbackResultChart title={`Feedback Category (${filterCurrency?.label})`} reportData={reportData.feedbackResultSummary} />
								</div>
								<div className='col-lg-7'>
									<FeedbackResultTable title='Players Feedback Table' data={reportData.feedbackResult} />
								</div>
							</FormGroupContainer>
						</ContentContainer>
					</div>
					<div className='card card-custom mt-2'>
						<ContentContainer>
							<FormGroupContainer>
								<ButtonsContainer>
									<div className='flex-grow-2 mx-2'>Survey Question and Answer</div>
									<div className='flex-grow-2 w-25 mx-2'>
										<Select
											size='small'
											style={{width: '100%'}}
											options={surveyQuestionsList}
											onChange={onChangeSurveyQuestion}
											value={filterSurveyQuestion}
										/>
									</div>

									<div className='flex-grow-2 mx-2 me-auto'>
										<MlabButton
											access={userAccess.includes(USER_CLAIMS.SurveyAndFeedbackRead)}
											label='Show'
											style={ElementStyle.primary}
											type={'submit'}
											weight={'solid'}
											size={'sm'}
											loading={loading}
											loadingTitle={'Please wait...'}
											disabled={loading}
											onClick={showSurveyReport}
										/>
									</div>
									{filteredSurveyResult && filteredSurveyResult.length > 0 && (
										<>
											<div className='flex-grow-2 mx-2'>Export To</div>
											<div className='flex-grow-2 w-25 mx-2'>
												<Select
													size='small'
													style={{width: '100%'}}
													options={exportToList}
													onChange={onChangeSurveyExportTo}
													value={exportToSurvey}
												/>
											</div>
											<div className='flex-grow-2  mx-2'>
												<MlabButton
													access={userAccess.includes(USER_CLAIMS.SurveyAndFeedbackRead)}
													label='Export'
													style={ElementStyle.primary}
													type={'submit'}
													weight={'solid'}
													size={'sm'}
													loading={loading}
													loadingTitle={'Please wait...'}
													disabled={loading}
													onClick={exportSurveyReport}
												/>
											</div>
										</>
									)}
								</ButtonsContainer>
								<div className='separator separator-dashed my-2'></div>
							</FormGroupContainer>
							{filteredSurveyResult && filteredSurveyResult.length > 0 && (
								<FormGroupContainer>
									<div className='col-lg-5'>
										<SurveyResultChart data={filteredSurveyChartData} />
									</div>
									<div className='col-lg-7'>
										<SurveyResultTable title='Survey Result Table' data={filteredSurveyResult} />
									</div>
								</FormGroupContainer>
							)}
						</ContentContainer>
					</div>
				</>
			)}
		</>
	);
};

export default SurveyAndFeedbackDashboard;

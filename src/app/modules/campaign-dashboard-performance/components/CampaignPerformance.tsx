import {AgGridReact} from 'ag-grid-react';
import * as FileSaver from 'file-saver';
import {useFormik} from 'formik';
import {Guid} from 'guid-typescript';
import moment from 'moment';
import {useEffect, useState} from 'react';
import {shallowEqual, useSelector} from 'react-redux';
import Select from 'react-select';
import swal from 'sweetalert';
import * as XLSX from 'xlsx';
import * as Yup from 'yup';
import {RootState} from '../../../../setup';
import * as hubConnection from '../../../../setup/hub/MessagingHub';
import {MasterReferenceOptionModel} from '../../../common/model';
import {ElementStyle} from '../../../constants/Constants';
import {
	ButtonsContainer,
	ContentContainer,
	FormContainer,
	FormGroupContainer,
	FormHeader,
	MainContainer,
	MlabButton,
} from '../../../custom-components';
import DefaultDateRangePicker from '../../../custom-components/date-range-pickers/DefaultDateRangePicker';
import {useMasterReferenceOption} from '../../../custom-functions';
//Services
import {
	GetCampaignPerformanceFilter,
	getCampaignPerformanceList,
	getCampaignPerformanceListResult,
} from '../../campaign-dashboard-performance/services/CampaignPerformanceService';
import ContactableRateChart from '../components/ContactableRateChart';
import ContactableRateTable from '../components/ContactableRateTable';
import DistributionOfMessageChart from '../components/DistributionOfMessageChart';
import DistributionOfMessageTable from '../components/DistributionOfMessageTable';
import FtdPercentageChart from '../components/FtdPercentageChart';
import FtdPercentageTable from '../components/FtdPercentageTable';
import PeConversionGoalChart from '../components/PeConversionGoalChart';
import PeConversionGoalTable from '../components/PeConversionGoalTable';
import {CampaignPerformanceExportRequestModel} from '../models/request/CampaignPerformanceExportRequestModel';
//Models
import useConstant from '../../../constants/useConstant';
import useFnsDateFormatter from '../../../custom-functions/helper/useFnsDateFormatter';
import {CampaignPerformanceDetailResponseModel} from '../models/response/CampaignPerformanceDetailResponseModel';
import {CampaignPerformanceFilterResponseModel} from '../models/response/CampaignPerformanceFilterResponseModel';
import {ContactableRateResponseModel} from '../models/response/ContactableRateResponseModel';
import {DistributionOfMessagePerCurrencyResponseModel} from '../models/response/DistributionOfMessagePerCurrencyResponseModel';
import {FtdPercentageResponseModel} from '../models/response/FtdPercentageResponseModel';
import {PeConversionDetailResponseModel} from '../models/response/PeConversionDetailResponseModel';
import {PeConversionListResponseModel} from '../models/response/PeConversionListResponseModel';
import { ColDef, ColGroupDef } from 'ag-grid-community';


interface DropdownOption {
	value: string;
	label: string;
}

const initialValues = {
	timePeriod: '',
	periodSelection: '',
	dateFieldStart: '',
	dateFieldEnd: '',
	campaignId: '',
	campaignGoalId: '',
	IncludeDiscardPlayerTo: '',
};

const campaignPerformanceFilterSchema = Yup.object().shape({
	timePeriod: Yup.string(),
	periodSelection: Yup.string(),
	dateFieldStart: Yup.string(),
	dateFieldEnd: Yup.string(),
	campaignId: Yup.number(),
	campaignGoalId: Yup.number(),
	IncludeDiscardPlayerTo: Yup.boolean(),
});

const CampaignPerformance: React.FC = () => {
	const userAccessId = useSelector<RootState>(({auth}) => auth.userId, shallowEqual) as number;
	const [loading, setLoading] = useState(false);
	const [rowData, setRowData] = useState<Array<CampaignPerformanceDetailResponseModel>>([]);
	const [peConversionGoalList, setPeConversionGoalList] = useState<Array<PeConversionListResponseModel>>([]);
	const [ftdPercentageData, setftdPercentageData] = useState<Array<FtdPercentageResponseModel>>([]);
	const [distributionOfMessageData, setdistributionOfMessageData] = useState<Array<DistributionOfMessagePerCurrencyResponseModel>>([]);
	const [contactableData, setContactableData] = useState<Array<ContactableRateResponseModel>>([]);
	const [peConversionGoalData, setPeConversionGoalData] = useState<Array<PeConversionDetailResponseModel>>([]);
	const [campaignPerformanceFilterExportData, setCampaignPerformanceFilterExportData] = useState<Array<CampaignPerformanceExportRequestModel>>([]);


	//campaigns
	const [campaigns, setCampaigns] = useState<Array<DropdownOption>>([]);
	const [campaignPerformanceFilters, setCampaignPerformanceFilters] = useState<CampaignPerformanceFilterResponseModel>();
	const [selectedCampaignId, setSelectedCampaignId] = useState<any>(null);

	//campaign type
	//const [campaignTypes, setCampaignTypes] = useState<Array<DropdownOption>>([]);
	const [selectedCampaignTypeId, setSelectedCampaignTypeId] = useState<DropdownOption>();
	const campaignTypeOptions = useMasterReferenceOption('34')
		.filter((x: MasterReferenceOptionModel) => x.masterReferenceParentId === 34)
		.map((x: MasterReferenceOptionModel) => x.options);

	//campaign goals
	const [campaignGoals, setCampaignGoals] = useState<Array<DropdownOption>>([]);
	const [selectedCampaignGoalId, setSelectedCampaignGoalId] = useState<DropdownOption>();

	//time period and period selection
	const [selectedTimePeriodId, setSelectedTimePeriodId] = useState<DropdownOption>({value: '1', label: 'Registration Date'});
	const [selectedPeriodSelectionId, setSelectedPeriodSelectionId] = useState<DropdownOption>({value: '1', label: 'Today'});
	const [filterIncludeDiscardPlayerTo, setFilterIncludeDiscardPlayerTo] = useState(false);
	const [filterConvertToUSD, setFilterConvertToUSD] = useState(false);

	//sub graph table
	const [selectedSubGraphId, setSelectedSubGraphId] = useState<DropdownOption>({value: '0', label: 'FTD Percentage'});
	const [forExportSubGraphId, setForExportSubGraphId] = useState(0);

	//Show/Hide
	const [showDateSelection, setShowDateSelection] = useState(true);
	const [showPeConversionGoal, setPeConversionGoal] = useState(false);
	const [showFtdPercentage, setShowFtdPercentage] = useState(false);
	const [showDistributionOfMessage, setShowDistributionOfMessage] = useState(false);
	const [showContactableRate, setShowContactableRate] = useState(false);

	//Date Field
	const [filterDateField, setFilterDateField] = useState<any>([new Date(), new Date()]);
	const [filterDateFieldStartDate, setFilterDateFieldStartDate] = useState<string>('');
	const [filterDateFieldEndDate, setFilterDateFieldEndDate] = useState<string>('');

	//Exports
	const [selectedPeConversionExportType, setSelectedPeConversionExportType] = useState<DropdownOption>({value: '0', label: 'CSV'});
	const [selectedSubGraphExportType, setSelectedSubGraphExportType] = useState<DropdownOption>({value: '0', label: 'CSV'});
	const [isDateDisable, setIsDateDisable] = useState<boolean>(true);

	//Constants
	const { HubConnected,successResponse, SwalFailedMessage, SwalServerErrorMessage, CSVConvertorHeaders } = useConstant();
	let customVal: string = '4';
	const {mlabFormatDate} = useFnsDateFormatter();


	// -----------------------------------------------------------------
	// WATCHERS
	// -----------------------------------------------------------------

	useEffect(() => {
		let periodSel: DropdownOption = selectedPeriodSelectionId;
		if (periodSel.value !== customVal) {
			setIsDateDisable(true);
		}
	}, [selectedPeriodSelectionId]);

	// -----------------------------------------------------------------
	// FORMIK FORM POST
	// -----------------------------------------------------------------

	const createRequest = () => {
		return {
			queueId: Guid.create().toString(),
			userId: userAccessId.toString(),
			timePeriod: parseInt(selectedTimePeriodId.value),
			periodSelection: parseInt(selectedPeriodSelectionId.value),
			dateFieldStart: filterDateFieldStartDate === '' ? undefined : filterDateFieldStartDate,
			dateFieldEnd: filterDateFieldEndDate === '' ? undefined : filterDateFieldEndDate,
			campaignId: parseInt(selectedCampaignId.value),
			campaignGoalId: typeof selectedCampaignGoalId === 'undefined' ? 0 : parseInt(selectedCampaignGoalId.value),
			includeDiscardPlayerTo: filterIncludeDiscardPlayerTo,
			campaignTypeId: selectedCampaignTypeId ? parseInt(selectedCampaignTypeId?.value) : undefined,
		};
	}

	const createRequestExport = () => {
		return {
			timePeriod: selectedTimePeriodId.label,
			periodSelection: selectedPeriodSelectionId.label,
			dateFieldStart: filterDateFieldStartDate === '' ? undefined : filterDateFieldStartDate,
			dateFieldEnd: filterDateFieldEndDate === '' ? undefined : filterDateFieldEndDate,
			campaignType: selectedCampaignTypeId ? selectedCampaignTypeId?.label : '',
			campaignName: selectedCampaignId.label,
			campaignGoal: selectedCampaignGoalId?.label!,
			includeDiscardPlayerTo: filterIncludeDiscardPlayerTo === true ? 'YES' : 'NO',
		};
	}

	const formik = useFormik({
		initialValues,
		validationSchema: campaignPerformanceFilterSchema,
		onSubmit: async (values, {setStatus, setSubmitting, resetForm}) => {
			setLoading(true);
			setTimeout(() => {
				if (typeof selectedCampaignId === 'undefined' || typeof selectedCampaignGoalId === 'undefined' ||  selectedCampaignTypeId === null) {
					swal(SwalFailedMessage.title, SwalFailedMessage.textMandatory, SwalFailedMessage.icon);
					setLoading(false);
					setSubmitting(false);
					return;
				}

				let requestList = new Array<CampaignPerformanceExportRequestModel>();

				let request = createRequest();
				let requestExport = createRequestExport();


				requestList.push(requestExport);
				setCampaignPerformanceFilterExportData(requestList);

				setTimeout(() => {
					const messagingHub = hubConnection.createHubConnenction();
					messagingHub
						.start()
						.then(() => {
							if (messagingHub.state === HubConnected) {
								getCampaignPerformanceListOnSubmit(request, messagingHub)								
							} else {
								messagingHub.stop();
								swal(SwalServerErrorMessage.title, SwalServerErrorMessage.textError, SwalServerErrorMessage.icon);
							}
						})
						.catch((err) => console.log('Error while starting connection: ' + err));
				}, 1000);
			}, 1000);
		},
	});

	const getCampaignPerformanceListOnSubmit = (request: any, messagingHub: any) => {
			getCampaignPerformanceList(request)
					.then((response) => {
						if (response.status === successResponse) {
							messagingHub.on(request.queueId.toString(), (message: any) => {
								getCampaignPerformanceListResult(message.cacheId)
									.then((data) => {
										let resultData = { ...data.data };

										setRowData(resultData.campaignDetail!);
										setPeConversionGoalData(resultData.peConversionGoalChart);
										setPeConversionGoalList(resultData.peConversionGoalTable);
										setftdPercentageData(resultData.ftdPercentage);
										setdistributionOfMessageData(resultData.distributionOfMessage);
										setContactableData(resultData.contactableRate);
										setPeConversionGoal(true);
										setSelectedSubGraphId({value: '0', label: 'FTD Percentage'});
										setShowFtdPercentage(true);
										setShowDistributionOfMessage(false);
										setShowContactableRate(false);

										setLoading(false);
										formik.setSubmitting(false);
									})
									.catch(() => {
										setLoading(false);
										formik.setSubmitting(false);
									});
								messagingHub.off(request.queueId.toString());
								messagingHub.stop();
							});

							setTimeout(() => {
								if (messagingHub.state === HubConnected) {
									messagingHub.stop();
									setLoading(false);
									formik.setSubmitting(false);
								}
							}, 30000);
						} else {
							messagingHub.stop();
							swal('Failed', response.data.message, 'error');
						}
					})
					.catch(() => {
						messagingHub.stop();
						swal(SwalFailedMessage.title, SwalFailedMessage.textCampaignPerformanceDataError, SwalFailedMessage.icon);
						setLoading(false);
						formik.setSubmitting(false);
					});
	}

	//	To get list of campaign based on selected Campaign Type
	useEffect(() => {
		setSelectedCampaignId(null);
		setSelectedCampaignGoalId(undefined);
		getCampaignNameFilterList();
	}, [selectedCampaignTypeId]);

	const getCampaignNameFilterList = () => {
		if (selectedCampaignTypeId?.value) {
			GetCampaignPerformanceFilter(parseInt(selectedCampaignTypeId.value)).then((response) => {
				if (response.status === successResponse) {
					if (response.data.campaigns && response.data.campaigns.length > 0) {
						let campaignOptions = Array<DropdownOption>();
						response.data.campaigns.forEach((item) => {
							let dropdownOption: DropdownOption = {
								value: item.campaignId.toString(),
								label: item.campaignName,
							};
							campaignOptions.push(dropdownOption);
						});
						setCampaigns(campaignOptions);
					}

					setCampaignPerformanceFilters(response.data);
				}
			});
		}
	};

	const onChangeDiscardPlayerTo = () => {
		setFilterIncludeDiscardPlayerTo(!filterIncludeDiscardPlayerTo);
	};
	const onChangeConvertToUSD = () => {
		setFilterConvertToUSD(!filterConvertToUSD);
	};

	function onChangeSelectedCampaigId(val: DropdownOption) {
		setSelectedCampaignId(val);
		setSelectedCampaignGoalId(undefined);

		let campaign = JSON.parse(JSON.stringify(val));
		let campaignId = parseInt(campaign.value);

		if (campaignId) {
			if (campaignPerformanceFilters) {
				let results = campaignPerformanceFilters?.campaignGoals?.filter((x) => x.campaignId === campaignId);
				let campaignGoalOptions = Array<DropdownOption>();

				if (results) {
					results.forEach((item) => {
						let dropdownOption: DropdownOption = {
							value: item.campaignGoalId.toString(),
							label: item.campaignGoalName,
						};
						campaignGoalOptions.push(dropdownOption);
					});
					setCampaignGoals(campaignGoalOptions);
					let defaultGoal = campaignPerformanceFilters.campaignGoals.find((x) => x.campaignId === campaignId && x.isPrimary === true);
					if (defaultGoal) {
						let dropdownOptionDefault: DropdownOption = {
							value: defaultGoal.campaignGoalId.toString(),
							label: defaultGoal.campaignGoalName,
						};
						setSelectedCampaignGoalId(dropdownOptionDefault);
					}
				}
			}
		}
	}

	function onChangeSelectedCampaignTypeId(val: DropdownOption) {
		setSelectedCampaignTypeId(val);
		setSelectedCampaignId(null);
	}

	function onChangeSelectedCampaigGoalId(val: DropdownOption) {
		setSelectedCampaignGoalId(val);
	}

	function onShowSubGraph() {
		setShowFtdPercentage(false);
		setShowDistributionOfMessage(false);
		setShowContactableRate(false);

		let graphSelectedId = parseInt(selectedSubGraphId.value);
		if (graphSelectedId === 0) {
			setShowFtdPercentage(true);
		} else if (graphSelectedId === 1) {
			setShowDistributionOfMessage(true);
		} else if (graphSelectedId === 2) {
			setShowContactableRate(true);
		}
		setForExportSubGraphId(graphSelectedId);
	}

	function onChangeSelectedPeConversionExportType(val: DropdownOption) {
		setSelectedPeConversionExportType(val);
	}
	function onChangeSelectedSubGraphExportType(val: DropdownOption) {
		setSelectedSubGraphExportType(val);
	}

	function onPeConversionExport() {
		let exportTypeId = parseInt(selectedPeConversionExportType.value);

		if (peConversionGoalList.length === 0 || peConversionGoalList === null) {
			swal(SwalFailedMessage.title, SwalFailedMessage.textNoDataFound, SwalFailedMessage.icon);
			return;
		}

		if (exportTypeId === 0) {
			JSONToCSVConvertor(campaignPerformanceFilterExportData, rowData, peConversionGoalList, 'Campaign Goal Performance', true);
		} else {
			JSONToExcelConvertor(
				JSON.stringify(campaignPerformanceFilterExportData),
				JSON.stringify(rowData),
				JSON.stringify(peConversionGoalList),
				CSVConvertorHeaders.CampaignGoalPerformance,
				true
			);
		}
	}

	const noExportTypeId = (graphSelectedId: number) => {
		if (graphSelectedId === 0) {
			if (ftdPercentageData.length === 0 || ftdPercentageData === null) {
				swal(SwalFailedMessage.title, SwalFailedMessage.textNoDataFound, SwalFailedMessage.icon);
				return;
			}
			JSONToCSVConvertor(campaignPerformanceFilterExportData, rowData, ftdPercentageData, CSVConvertorHeaders.FTDPercentage, true);
		} else if (graphSelectedId === 1) {
			if (distributionOfMessageData.length === 0 || distributionOfMessageData === null) {
				swal(SwalFailedMessage.title, SwalFailedMessage.textNoDataFound, SwalFailedMessage.icon);
				return;
			}
			JSONToCSVConvertor(
				campaignPerformanceFilterExportData,
				rowData,
				distributionOfMessageData,
				CSVConvertorHeaders.DistributionMessageStatusByCurrency,
				true
			);
		} else if (graphSelectedId === 2) {
			if (contactableData.length === 0 || contactableData === null) {
				swal(SwalFailedMessage.title, SwalFailedMessage.textNoDataFound, SwalFailedMessage.icon);
				return;
			}
			JSONToCSVConvertor(campaignPerformanceFilterExportData, rowData, contactableData, CSVConvertorHeaders.ContactableRate, true);
		}
	}

	const hasExportTypeId = (graphSelectedId: number) => {
		if (graphSelectedId === 0) {
			if (ftdPercentageData.length === 0 || ftdPercentageData === null) {
				swal(SwalFailedMessage.title, SwalFailedMessage.textNoDataFound, SwalFailedMessage.icon);
				return;
			}
			JSONToExcelConvertor(
				JSON.stringify(campaignPerformanceFilterExportData),
				JSON.stringify(rowData),
				JSON.stringify(ftdPercentageData),
				CSVConvertorHeaders.FTDPercentage,
				true
			);
		} else if (graphSelectedId === 1) {
			if (distributionOfMessageData.length === 0 || distributionOfMessageData === null) {
				swal(SwalFailedMessage.title, SwalFailedMessage.textNoDataFound, SwalFailedMessage.icon);
				return;
			}
			JSONToExcelConvertor(
				JSON.stringify(campaignPerformanceFilterExportData),
				JSON.stringify(rowData),
				JSON.stringify(distributionOfMessageData),
				CSVConvertorHeaders.DistributionMessageStatusByCurrency,
				true
			);
		} else if (graphSelectedId === 2) {
			if (contactableData.length === 0 || contactableData === null) {
				swal(SwalFailedMessage.title, SwalFailedMessage.textNoDataFound, SwalFailedMessage.icon);
				return;
			}
			JSONToExcelConvertor(
				JSON.stringify(campaignPerformanceFilterExportData),
				JSON.stringify(rowData),
				JSON.stringify(contactableData),
				CSVConvertorHeaders.ContactableRate,
				true
			);
		}
	}
	
	function onSubGraphExport() {
		let exportTypeId = parseInt(selectedSubGraphExportType.value);
		let graphSelectedId = forExportSubGraphId;


		if (exportTypeId === 0) {
			noExportTypeId(graphSelectedId)
		} else {
			hasExportTypeId(graphSelectedId)
		}
	}

	function onChangeTimePeriod(val: DropdownOption) {
		setSelectedTimePeriodId(val);
		let timePeriod = JSON.parse(JSON.stringify(val));
		let timePeriodId = parseInt(timePeriod.value);

		if (timePeriodId === 0) {
			onChangePeriodSelection({value: '0', label: 'All'});
		} else {
			onChangePeriodSelection({value: '1', label: 'Today'});
		}
	}

	function onChangePeriodSelection(val: DropdownOption) {
		setSelectedPeriodSelectionId(val);

		let periodSelection = JSON.parse(JSON.stringify(val));
		let periodSelectionId = parseInt(periodSelection.value);
		let all: string = '0';
		let today: string = '1';
		let yesterday: string = '2';
		let lastWeek: string = '3';
		let custom: string = '4';

		setShowDateSelection(false);

		if (periodSelectionId !== 0) {
			setShowDateSelection(true);
		}

		switch (val.value) {
			case all:
				setFilterDateField([undefined, undefined]);
				break;
			case today:
				setFilterDateField([new Date(), new Date()]);
				break;
			case yesterday:
				setFilterDateField([new Date(moment().subtract(1, 'days').toString()), new Date(moment().subtract(1, 'days').toString())]);
				break;
			case lastWeek:
				moment.updateLocale('en', {
					week: {
						dow: 1,
					},
				});
				setFilterDateField([
					new Date(moment().startOf('week').subtract(7, 'days').toString()),
					new Date(moment().endOf('week').subtract(7, 'days').toString()),
				]);
				break;
			case custom:
				setFilterDateField([]);
				setIsDateDisable(false);
				break;
			default:
				break;
		}
	}

	function onChangeSelectedGraph(val: DropdownOption) {
		setSelectedSubGraphId(val);
	}

	const onGridReady = (params: any) => {
		params.api.sizeColumnsToFit();
	};

	const tableLoader = (data: any) => {
		return (
			<div className='ag-custom-loading-cell' style={{paddingLeft: '10px', lineHeight: '25px'}}>
				<i className='fas fa-spinner fa-pulse'></i> <span> {data.loadingMessage}</span>
			</div>
		);
	};

	function onChangeDateField(val: any) {
		if (val != undefined) {
			setFilterDateField(val);
			setFilterDateFieldStartDate(val[0]);
			setFilterDateFieldEndDate(val[1]);
		}
	}

	function appendDataToExcelExport(CSV: string, ShowLabel: boolean, data: any): string {
		let arrData = typeof data !== 'object' ? JSON.parse(data) : data;

		//This condition will generate the Label/Header
		if (ShowLabel) {
			let row = '';
			for (let index in arrData[0]) {
				row += index + '|';
			}

			let newSlicedRow = row.slice(0, -1);
			CSV += newSlicedRow + '\r\n';
		}

		for (const rowData of arrData) {
			let row = '';
			// 2nd loop will extract each column and convert it into a string comma-separated
			for (const value of Object.values(rowData)) {
				row += value + '|';
			}
			let slicedRow = row.slice(0, row.length - 1);
			CSV += slicedRow + '\r\n';
		}
		
		return CSV;
	}

	const JSONToCSVConvertor = (FilterData: any, Summary: any, Detail: any, ReportTitle: string, ShowLabel: boolean) => {
		let CSV = '';

		const fileType = 'text/csv; charset=utf-18';
		const fileExtension = '.csv';

		const filterData = XLSX.utils.json_to_sheet(FilterData);
		CSV += XLSX.utils.sheet_to_csv(filterData) + '\r\n';

		const summaryData = XLSX.utils.json_to_sheet(Summary);
		CSV += XLSX.utils.sheet_to_csv(summaryData) + '\r\n';

		const detailData = XLSX.utils.json_to_sheet(Detail);
		CSV += XLSX.utils.sheet_to_csv(detailData);

		FileSaver.saveAs(new Blob(['\uFEFF' + CSV], {type: fileType}), ReportTitle + fileExtension);
	};

	const JSONToExcelConvertor = (FilterData: any, Summary: any, Detail: any, ReportTitle: string, ShowLabel: boolean) => {
		//If JSONData is not an object then JSON.parse will parse the JSON string in an Object

		let CSV = '';
		CSV = appendDataToExcelExport(CSV, ShowLabel, FilterData);
		CSV = appendDataToExcelExport(CSV, ShowLabel, Summary);
		CSV = appendDataToExcelExport(CSV, ShowLabel, Detail);

		if (CSV === '') {
			alert('Invalid data');
			return;
		}
		const arrayOfArrayCsv = CSV.split('\n').map((row: string) => {
			return row.split('|');
		});

		const fileType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
		const fileExtension = '.xlsx';

		const wsSummary = XLSX.utils.aoa_to_sheet(arrayOfArrayCsv);
		const wb = XLSX.utils.book_new();
		XLSX.utils.book_append_sheet(wb, wsSummary, 'Data');
		const excelBuffer = XLSX.write(wb, {bookType: 'xlsx', type: 'array'});
		const data = new Blob([excelBuffer], {type: fileType});
		FileSaver.saveAs(data, ReportTitle + fileExtension);
	};

	// TABLE CONTENT
	// -----------------------------------------------------------------

	const customCellStartDateRender = (params: any) => {
		const { data } = params;
		const formattedDate = formatDateRender(data.startDate);
	
		return <>{formattedDate}</>;
	  };

	  const customCellEndDateRender = (params: any) => {
		const { data } = params;
		const formattedDate = formatDateRender(data.endDate);
	
		return <>{formattedDate}</>;
	  };


	const formatDateRender = (date: any) => {
		return typeof date !== 'undefined' ? mlabFormatDate(date) : null;
	  };

	const columnDefs : (ColDef<CampaignPerformanceDetailResponseModel> | ColGroupDef<CampaignPerformanceDetailResponseModel>)[] =[
		{
			headerName: 'Start Date',
			field: 'startDate',
			cellRenderer:customCellStartDateRender,
		
		},
		{
			headerName: 'End Date',
			field: 'endDate',
			cellRenderer: customCellEndDateRender,
			
		},
		{headerName: 'Campaign Type', field: 'campaignType'},
		{headerName: 'Campaign Report Period', field: 'campaignReportPeriod'},
		{headerName: 'Campaign ID', field: 'campaignId'},
		{headerName: 'Campaign Name', field: 'campaignName'},
		{headerName: 'Campaign Status', field: 'campaignStatus'},
		{headerName: 'Campaign Brand', field: 'brand'},
		{headerName: 'Currency', field: 'currency'},
		{headerName: 'Tagged Agent Count', field: 'taggedAgentCount'},
		{headerName: 'Player Count', field: 'playerCount'},
		{headerName: 'Call List Count', field: 'callListCount'},
	];

	return (
		<>
			<FormContainer onSubmit={formik.handleSubmit}>
				<MainContainer>
					<FormHeader headerLabel={'Campaign Performance'} />
					<ContentContainer>
						<FormGroupContainer>
							<div className='col-lg-2'>
								<label className='form-control-label required mb-2'>Campaign Type</label>
								<Select
									size='small'
									style={{width: '100%'}}
									options={campaignTypeOptions}
									onChange={onChangeSelectedCampaignTypeId}
									value={selectedCampaignTypeId}
								/>
							</div>
							<div className='col-lg-5'>
								<label className='form-control-label required mb-2'>Campaign Name</label>
								<Select size='small' style={{width: '100%'}} options={campaigns} onChange={onChangeSelectedCampaigId} value={selectedCampaignId} />
							</div>
							<div className='col-lg-3'>
								<label className='form-control-label mb-2 required'>Campaign Goal</label>
								<Select
									size='small'
									style={{width: '100%'}}
									options={campaignGoals}
									onChange={onChangeSelectedCampaigGoalId}
									value={selectedCampaignGoalId}
								/>
							</div>
						</FormGroupContainer>
						<FormGroupContainer>
							<div className='col-lg-2 mt-2'>
								<label className='form-control-label'>Time Period</label>
								<Select
									size='small'
									style={{width: '100%'}}
									options={[
										{value: '0', label: 'All'},
										{value: '1', label: 'Registration Date'},
										{value: '2', label: 'Tagged Date'},
									]}
									onChange={onChangeTimePeriod}
									value={selectedTimePeriodId}
								/>
							</div>
							{selectedTimePeriodId && selectedTimePeriodId.value !== '0' && (
								<div className='col-lg-2 mt-2'>
									<label></label>
									<Select
										size='small'
										style={{width: '100%'}}
										options={[
											{value: '0', label: 'All'},
											{value: '1', label: 'Today'},
											{value: '2', label: 'Yesterday'},
											{value: '3', label: 'Last Week'},
											{value: '4', label: 'Custom'},
										]}
										onChange={onChangePeriodSelection}
										value={selectedPeriodSelectionId}
									/>
								</div>
							)}

							{showDateSelection && (
								<div className='col-lg-3 mt-8'>
									<DefaultDateRangePicker
										format='yyyy-MM-dd'
										maxDays={180}
										onChange={onChangeDateField}
										value={filterDateField}
										isDisabled={isDateDisable}
									/>
								</div>
							)}

							<div className='col-lg-2 mt-2'>
								<div className='form-check form-switch form-check-custom form-check-solid mt-6'>
									<label className='form-check-label me-3'>Include Discard Player To</label>
									<input
										className='form-check-input'
										type='checkbox'
										value=''
										id=''
										checked={filterIncludeDiscardPlayerTo}
										onChange={onChangeDiscardPlayerTo}
										disabled={false}
									/>
								</div>
							</div>
							<div className='d-flex bd-highlight my-4'>
								<button type='submit' className='btn btn-primary btn-sm me-2'>
									{!loading && <span className='indicator-label'>Generate</span>}
									{loading && (
										<span className='indicator-progress' style={{display: 'block'}}>
											Please wait...
											<span className='spinner-border spinner-border-sm align-middle ms-2'></span>
										</span>
									)}
								</button>
							</div>
						</FormGroupContainer>
						<FormGroupContainer>
							<div className='ag-theme-quartz' style={{height: 200, width: '100%', marginBottom: '50px'}}>
								<AgGridReact
									rowData={rowData}
									defaultColDef={{
										sortable: true,
										resizable: true,
									}}
									components={{
										tableLoader: tableLoader,
									}}
									onGridReady={onGridReady}
									rowBuffer={0}
									enableRangeSelection={true}
									pagination={false}
									paginationPageSize={1}
									columnDefs={columnDefs}
								/>
							</div>
						</FormGroupContainer>
					</ContentContainer>
				</MainContainer>
				<br />
				<MainContainer>
					<ContentContainer>
						<FormGroupContainer>
							<ButtonsContainer>
								<label className='flex-grow-2 mx-2'>Export To</label>

								<div className='flex-grow-2 w-25 mx-2'>
									<Select
										size='small'
										style={{width: '100%'}}
										options={[
											{value: '0', label: 'CSV'},
											{value: '1', label: 'Excel'},
										]}
										onChange={onChangeSelectedPeConversionExportType}
										value={selectedPeConversionExportType}
									/>
								</div>

								<div className='flex-grow-2  mx-2'>
									<MlabButton
										access={true}
										label='Export'
										style={ElementStyle.secondary}
										type={'button'}
										weight={'solid'}
										size={'sm'}
										onClick={onPeConversionExport}
									/>
								</div>
								<div className='col-lg-2'>
									<div className='form-check form-switch form-check-custom form-check-solid mt-2'>
										<label className='form-check-label me-3'>Convert to USD</label>
										<input className='form-check-input' type='checkbox' value='' id='' checked={filterConvertToUSD} onChange={onChangeConvertToUSD} />
									</div>
								</div>
							</ButtonsContainer>

							{showPeConversionGoal && (
								<>
									<div className='col-lg-5'>
										<PeConversionGoalChart
											title={selectedCampaignGoalId?.label !== undefined ? selectedCampaignGoalId.label : ''}
											data={peConversionGoalData}
											titleDesc={
												campaignPerformanceFilters !== undefined
													? campaignPerformanceFilters?.campaignGoals?.find(
															(x) => x.campaignGoalId === (selectedCampaignGoalId?.value !== undefined ? parseInt(selectedCampaignGoalId?.value) : 0)
													  )?.campaignGoalDesc
													: ''
											}
										/>
									</div>
									<div className='col-lg-7'>
										<PeConversionGoalTable title='' data={peConversionGoalList} isUSD={filterConvertToUSD} />
									</div>
								</>
							)}
						</FormGroupContainer>
					</ContentContainer>
				</MainContainer>
				<br />

				<MainContainer>
					<ContentContainer>
						<FormGroupContainer>
							<ButtonsContainer>
								<label className='flex-grow-2 mx-2'>Predefined Graph and Table</label>

								<div className='flex-grow-2 w-25 mx-2'>
									<Select
										size='small'
										style={{width: '100%'}}
										options={[
											{value: '0', label: 'FTD Percentage'},
											{value: '1', label: 'Distribution of Message Status by Currency'},
											{value: '2', label: 'Contactable Rate'},
										]}
										onChange={onChangeSelectedGraph}
										value={selectedSubGraphId}
									/>
								</div>

								<div className='flex-grow-2  mx-2'>
									<MlabButton
										access={true}
										label='Show'
										style={ElementStyle.secondary}
										type={'button'}
										weight={'solid'}
										size={'sm'}
										loadingTitle={'Please wait...'}
										onClick={onShowSubGraph}
									/>
								</div>

								<label className='flex-grow-2 mx-2'>Export To</label>

								<div className='flex-grow-2 w-25 mx-2'>
									<Select
										size='small'
										style={{width: '100%'}}
										options={[
											{value: '0', label: 'CSV'},
											{value: '1', label: 'Excel'},
										]}
										onChange={onChangeSelectedSubGraphExportType}
										value={selectedSubGraphExportType}
									/>
								</div>

								<div className='flex-grow-2  mx-2'>
									<MlabButton
										access={true}
										label='Export'
										style={ElementStyle.secondary}
										type={'button'}
										weight={'solid'}
										size={'sm'}
										loadingTitle={'Please wait...'}
										onClick={onSubGraphExport}
									/>
								</div>
							</ButtonsContainer>
						</FormGroupContainer>

						{showFtdPercentage && (
							<FormGroupContainer>
								<div className='col-lg-5'>
									<FtdPercentageChart title={`FTD Percentage`} data={ftdPercentageData} />
								</div>
								<div className='col-lg-7'>
									<FtdPercentageTable title='' data={ftdPercentageData} />
								</div>
							</FormGroupContainer>
						)}

						{showDistributionOfMessage && (
							<FormGroupContainer>
								<div className='col-lg-5'>
									<DistributionOfMessageChart title={`Distribution of Message Status by Currency`} data={distributionOfMessageData} />
								</div>
								<div className='col-lg-7'>
									<DistributionOfMessageTable title='' data={distributionOfMessageData} />
								</div>
							</FormGroupContainer>
						)}

						{showContactableRate && (
							<FormGroupContainer>
								<div className='col-lg-5'>
									<ContactableRateChart title={`Contactable Rate`} data={contactableData} />
								</div>
								<div className='col-lg-7'>
									<ContactableRateTable title='' data={contactableData} />
								</div>
							</FormGroupContainer>
						)}
					</ContentContainer>
				</MainContainer>
			</FormContainer>
		</>
	);
};

export default CampaignPerformance;

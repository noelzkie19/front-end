import React , { useContext, useEffect, useState} from 'react';
import {shallowEqual, useSelector} from 'react-redux';
import swal from 'sweetalert';
import '../../../../../_metronic/assets/sass/core/components/_variables.scss';
import {RootState} from '../../../../../setup';
import { ElementStyle, FILTER_DISPLAY_MESSAGES, HttpStatusCodeEnum, PROMPT_MESSAGES} from '../../../../constants/Constants';
import useConstant from '../../../../constants/useConstant';
import {ButtonsContainer, FormGroupContainer, MlabButton} from '../../../../custom-components';
import CommonLookups from '../../../../custom-functions/CommonLookups';
import useFnsDateFormatter from '../../../../custom-functions/helper/useFnsDateFormatter';
import {LookupModel} from '../../../../shared-models/LookupModel';
import {getCampaignByCaseTypeId} from '../../../campaign-agent-workspace/redux/AgentWorkspaceService';
import {useCommunicationReviewReportHooks} from '../../../reports/hooks/useCommunicationReviewReportHooks';
import {USER_CLAIMS} from '../../../user-management/components/constants/UserClaims';
import TopicSubtopicFilter from '../../modals/TopicSubtopicFilter';
import {CaseCommunicationFilterListResponseModel} from '../../models/CaseCommunicationFilterListResponseModel';
import {CaseCommunicationFilterModel} from '../../models/CaseCommunicationFilterModel';
import {CaseCommunicationOwnerList} from '../../models/CommunicationOwnerList';
import {TopicSubtopicFilterModel} from '../../models/TopicSubtopicFilterModel';
import {GetCommunicationOwner} from '../../services/CustomerCaseApi';
import UserGridCustomDisplayModal from '../../../../custom-components/modals/UserGridCustomDisplayModal';
import { CaseCommunicationContext } from '../../context/CaseCommunicationContext';
import DynamicFilter from '../../../../custom-components/dynamic-filters/DynamicFilter';
import { useCaseManagementHooks } from '../../shared/hooks/useCaseManagementHooks';
import { IAuthState } from '../../../auth';

const PLAYER_USER_OPTIONS = [
	{
		label: 'Player ID',
		value: 'PlayerID',
	},
	{
		label: 'User Name',
		value: 'Username',
	},
];

const CASE_COMM_OPTIONS = [
	{
		label: 'Case ID',
		value: 'CaseID',
	},
	{
		label: 'Communication ID',
		value: 'CommID',
	},
];
type CaseCommunicationFilterProps = {
	loading: boolean;
	searchCaseCommunication: (filter: CaseCommunicationFilterModel) => void;
	clearFilter: () => void;
	exportToCSV: (filter: CaseCommunicationFilterModel) => void;
	reopenCaseCommunication: () => void;
	rowSelectedCaseCommunication: Array<CaseCommunicationFilterListResponseModel>;

};
const CaseCommunicationFilter: React.FC<CaseCommunicationFilterProps> = ({
	loading,
	clearFilter,
	searchCaseCommunication,
	exportToCSV,
	reopenCaseCommunication,
	rowSelectedCaseCommunication
}: CaseCommunicationFilterProps) => {
	const userAccess = useSelector<RootState>(({auth}) => auth.access, shallowEqual) as string;

	const [brandIdFilter, setBrandIdFilter] = useState<any>();
	const [campaignIdFilter, setCampaignIdFilter] = useState<any>();
	const [currencyIdFilter, setCurrencyIdFilter] = useState<Array<any>>([]);
	const [teamIdFilter, setTeamIdFilter] = useState<any>();
	const [subjectFilter, setSubjectFilter] = useState<any>('');
	const [notesFilter, setNotesFilter] = useState<any>('');
	const [caseTypeIdFilter, setCaseTypeIdFilter] = useState<any>();
	const [messageTypeIdFilter, setMessageTypeIdFilter] = useState<Array<any>>([]);
	const [vipLevelIdFilter, setVipLevelIdFilter] = useState<Array<LookupModel>>([]);
	const [externalIdFilter, setExternalIdFilter] = useState('');
	const [caseStatusIdFilter, setCaseStatusIdFilter] = useState<Array<LookupModel>>([]);
	const [communicationOwnerIdFilter, setCommunicationOwnerIdFilter] = useState<Array<LookupModel>>([]);
	const [playerIdUsernameFilter, setPlayerIdUsernameFilter] = useState('');
	const [caseIdCommunicationIdFilter, setCaseIdCommunicationIdFilter] = useState('');
	const [caseCommCreateDateFromFilter, setCaseCommCreateDateFromFilter] = useState<string>('');
	const [caseCommCreateDateToFilter, setCaseCommCreateDateToFilter] = useState<string>('');
	const [serviceCaseCommDuration, setServiceCaseCommDuration] = useState<number>(0);

	const [selectedPlayerUserOption, setSelectedPlayerUserOption] = useState<any>();
	const [selectedCaseCommOption, setSelectedCaseCommOption] = useState<any>();
	const [communicationOwnerOptions, setCommunicationOwnerOptions] = useState<Array<LookupModel>>([]);

	const [topicSubtopicFilter, setTopicSubtopicFilter] = useState<Array<TopicSubtopicFilterModel>>([]);
	const [disableTopicSubtopicFilter, setDisableTopicSubtopicFilter] = useState<boolean>(true);
	const [resetTopicSubtopicFilter, setResetTopicSubtopicFilter] = useState<boolean>(false);
	const [topicSubtopicModalShow, setTopicSubtopicModalShow] = useState<boolean>(false);
	const [topicSubtopicDisplay, setTopicSubtopicDisplay] = useState('');
	const [campaignOptions, setCampaignOptions] = useState<Array<LookupModel>>([]);

	const [topicFilter, setTopicFilter] = useState('');
	const [subtopicFilter, setSubtopicFilter] = useState('');

	const [dateBy, setDateBy] = useState<any>();
	const [enableDateRangePicker, setEnableDateRangePicker] = useState<boolean>(true);
	const [modalShow, setModalShow] = useState<boolean>(false);
	const [selectedFilters, setSelectedFilters] = useState<Array<any>>([]);
	const [campaignNameDisable, setCampaignNameDisable] = useState<boolean>(true);
	const caseTypeOptions = CommonLookups('caseTypes')
	const caseStatusOptions = CommonLookups('caseStatuses')
	const [resetFilter, setResetFilter] = useState(false);
	const {userId} = useSelector<RootState>(({auth}) => auth, shallowEqual) as IAuthState;
	const [currentValue, setCurrentValue] = useState<any>(null);
	const abandonedAgendOptions = CommonLookups('isLastAgentAbandonedAssigned');
	const [isAgentAbandoned, setIsAgentAbandoned] = useState<any>(null);
	const [isAgentAbandonedQueue, setIsAgentAbandonedQueue] = useState<boolean>(false);
	const [isAgentAbandonedDisabled, setIsAgentAbandonedDisabled] = useState<boolean>(true);
	const [isAbandonedQueueDisabled, setIsAbandonedQueueDisabled] = useState<boolean>(true);
	const [isDateByRequired, setIsDateByRequired] = useState<boolean>(false);
	const [clearText, setClearText] = useState<boolean>(false);
	/**
	 *  ? Hooks
	 */
	const {mlabFormatDate} = useFnsDateFormatter();
	const {getTeamListOptions, teamListOptions} = useCommunicationReviewReportHooks();

	const {successResponse, SearchCaseAndCommunication, message} = useConstant();

	const {defaultColumns , setIsUpgradeGridDisplay , setIsSubmitGridDisplay, setFilterFields, filterDefs, resetFilterDefs , dateOptions , currencyOptions , brandOptions , messageTypeOptions , vipLevelOptions , fetchAllOptions , fetchingGridColumnDisplay } = useContext(CaseCommunicationContext)
	const { getGridAndFilterDisplay } = useCaseManagementHooks()
	useEffect(() => {
		getAllCommunicationOwner();
		getTeamListOptions();
		setFilterFields(defaultFields)

	}, []);

	useEffect(() => {
		if (topicSubtopicFilter.length > 0) {
			const topicList = topicSubtopicFilter.map((x: any) => x.topicLanguageId).join(', ');
			const subtopicList = topicSubtopicFilter.map((x: any) => x.subtopicLanguageId).join(', ');
			const isSelectedAll = topicSubtopicFilter.find((x: any) => x.topicLanguageId == 0);

			const [topicValue, subtopicValue] = [
				isSelectedAll ? 'All' : topicList.split(',').length.toString(),
				isSelectedAll ? 'All' : subtopicList.split(',').length.toString(),
			];

			setTopicSubtopicDisplay(FILTER_DISPLAY_MESSAGES.WithAddedFilter(topicValue, subtopicValue));
			setTopicFilter(topicList);
			setSubtopicFilter(subtopicList);
			setResetTopicSubtopicFilter(false);
		} else {
			setTopicSubtopicDisplay(FILTER_DISPLAY_MESSAGES.NoAddedFilter);
			setTopicFilter('');
			setSubtopicFilter('');
		}
	}, [topicSubtopicFilter]);

	const getAllCommunicationOwner = () => {
		GetCommunicationOwner()
			.then((response) => {
				if (response.status === successResponse) {
					let commOwnerOptions = Object.assign(new Array<CaseCommunicationOwnerList>(), response.data);
					let _commOwnerList = new Array<LookupModel>();
					commOwnerOptions.forEach((element) => {
						_commOwnerList.push({
							label: element.fullName,
							value: element.userId.toString(),
						} as LookupModel);
					});
					setCommunicationOwnerOptions(_commOwnerList);
				} else {
					// disableSplashScreen()
					console.log('Problem in message type list');
				}
			})
			.catch(() => {
				//disableSplashScreen()
				console.log('Problem in message type brand list');
			});
	};

	const loadCampaignFilterList = (caseTypeId: number) => {
		getCampaignByCaseTypeId(caseTypeId).then((response) => {
			if (response.status === HttpStatusCodeEnum.Ok) {
				const list = response.data.map(
					(i) =>
					({
						value: i.value?.toString(),
						label: i.label,
					} as LookupModel)
				);
				setCampaignOptions(list);
			}
		});
	};

	const getMessageTypeIdFilter = () => {
		return messageTypeIdFilter.map((i) => i.value).join(',') ?? '';
	};
	const getVipLevelIdFilter = () => {
		return vipLevelIdFilter.map((i) => i.value).join(',') ?? '';
	};
	const getCaseStatusIdFilter = () => {
		return caseStatusIdFilter.map((i) => i.value).join(',') ?? '';
	};
	const getCurrencyIdFilter = () => {
		return currencyIdFilter.map((i) => i.value).join(',') ?? '';
	};

	const serviceCaseCommunicationSearchRequest = async () => {
		
		const filterServiceCaseCommunication: CaseCommunicationFilterModel = {
			brandId: Number(brandIdFilter?.value ?? '0'),
			caseTypeIds: Number(caseTypeIdFilter?.value ?? '0'),
			messageTypeIds: getMessageTypeIdFilter(),
			vipLevelIds: getVipLevelIdFilter(),
			dateByFrom: mlabFormatDate(caseCommCreateDateFromFilter, 'MM/d/yyyy HH:mm:ss'),
			dateByTo: mlabFormatDate(caseCommCreateDateToFilter, 'MM/d/yyyy HH:mm:ss'),
			caseStatusIds: getCaseStatusIdFilter(),
			communicationOwners: communicationOwnerIdFilter.map((i) => i.value).join(',') ?? '',
			externalId: externalIdFilter,
			playerIds: selectedPlayerUserOption?.value === PLAYER_USER_OPTIONS[0].value ? playerIdUsernameFilter : '',
			usernames: selectedPlayerUserOption?.value === PLAYER_USER_OPTIONS[1].value ? playerIdUsernameFilter : '',
			caseId: selectedCaseCommOption?.value === CASE_COMM_OPTIONS[0].value ? caseIdCommunicationIdFilter : '',
			communicationId: selectedCaseCommOption?.value === CASE_COMM_OPTIONS[1].value ? caseIdCommunicationIdFilter : '',
			topicLanguageIds: topicFilter,
			subtopicLanguageIds: subtopicFilter,
			duration: serviceCaseCommDuration,
			campaignId: campaignIdFilter ? campaignIdFilter.value : 0,
			communicationOwnerTeamId: teamIdFilter ? teamIdFilter.value : 0,
			currencyIds: getCurrencyIdFilter(),
			subject: subjectFilter,
			notes: notesFilter,
			dateBy: dateBy ? dateBy.value : 0,
			isLastAgentAbandonedAssigned:  getMessageTypeIdFilter().includes(SearchCaseAndCommunication.LivePersonMessageTypeId) ? isAgentAbandoned : null,
            isLastSkillAbandonedQueue: isAgentAbandonedQueue ? 'Yes' : null,
		};

		return filterServiceCaseCommunication;
	};

	// Methods
	const handleSearchServiceCaseCommunication = async () => {
		let searchServiceCaseCommunicationRequest = await serviceCaseCommunicationSearchRequest();

		if (validateSearch(searchServiceCaseCommunicationRequest)) {
			searchCaseCommunication(searchServiceCaseCommunicationRequest);
		}
	};

	const validateBrandId = (brandId: any) => {
		return brandId === null || brandId === undefined || brandId === 0;
	};
	const validateCaseTypeIds = (caseTypeId: any) => {
		return caseTypeId === null || caseTypeId === undefined || caseTypeId === 0;
	};
	const validateCampaignId = (campaignId: any) => {
		return campaignId === null || campaignId === undefined || campaignId === 0;
	};
	const validateMessageTypeIds = (messageTypeIds: any) => {
		return messageTypeIds === null || messageTypeIds === undefined || messageTypeIds.length === 0;
	};
	const validateVipLevelIds = (vipLevelIds: any) => {
		return vipLevelIds === null || vipLevelIds === undefined || vipLevelIds.length === 0;
	};
	
	const isNullOrEmpty = (value: any, allowZero: boolean = false) => {
		if (!allowZero && (value === 0)) return true;
		return value === null || value === undefined || value === '' || (Array.isArray(value) && value.length === 0);
	};
	
	
	const validateSearch = (filter: CaseCommunicationFilterModel) => {
		
		const noBrand = validateBrandId(filter.brandId);
		const noCaseTypes = validateCaseTypeIds(filter.caseTypeIds);
		const noCampaign = validateCampaignId(filter.campaignId);
		const noMessageType = validateMessageTypeIds(filter.messageTypeIds);
		const noVIPLevel = validateVipLevelIds(filter.vipLevelIds);
	
		const noStartDate = isNullOrEmpty(filter.dateByFrom);
		const noEndDate = isNullOrEmpty(filter.dateByTo);
	
		const noDateToAbandonedQueue = filter.isLastSkillAbandonedQueue === 'Yes' && (noEndDate || noStartDate);
	
		const emptyFields = [
			noBrand, noCaseTypes, noCampaign, noMessageType, noVIPLevel, noStartDate, noEndDate,
			isNullOrEmpty(filter.caseStatusIds), isNullOrEmpty(filter.communicationOwners),
			isNullOrEmpty(filter.externalId), isNullOrEmpty(filter.duration, false), 
			isNullOrEmpty(filter.communicationOwnerTeamId, false), 
			isNullOrEmpty(filter.currencyIds), isNullOrEmpty(filter.playerIds),
			isNullOrEmpty(filter.caseId), isNullOrEmpty(filter.subject), isNullOrEmpty(filter.notes)
		];
	
		if (emptyFields.every(Boolean)) {
			swal(PROMPT_MESSAGES.FailedValidationTitle, 'Please populate at least one Search filter', 'error');
			return false;
		}
	
		if (noDateToAbandonedQueue) {
			swal(PROMPT_MESSAGES.FailedValidationTitle, message.requiredFields, 'error');
			return false;
		}
	
		return true;
	};
	



	const handleClear = () => {
		setBrandIdFilter(null);
		setCaseTypeIdFilter(null);
		setMessageTypeIdFilter([]);
		setVipLevelIdFilter([]);
		setCaseStatusIdFilter([]);
		setCommunicationOwnerIdFilter([]);
		setSelectedPlayerUserOption(null);
		setPlayerIdUsernameFilter('');
		setCaseIdCommunicationIdFilter('');
		setSelectedPlayerUserOption(null);
		setSelectedCaseCommOption(null);
		setSubtopicFilter('');
		setTopicFilter('');
		setTopicSubtopicFilter([]);
		setResetTopicSubtopicFilter(true);
		setServiceCaseCommDuration(0);
		clearFilter();
		setCurrencyIdFilter([]);
		setSubjectFilter('');
		setNotesFilter('');
		setCampaignIdFilter('');
		setTeamIdFilter('');
		setCampaignOptions([]);
		setDateBy([]);
		setEnableDateRangePicker(true);
		setResetFilter(true)
		setIsAgentAbandoned(null)
		setIsAgentAbandonedQueue(false);
		setIsAgentAbandonedDisabled(true)
		setIsAbandonedQueueDisabled(true)
		setIsDateByRequired(false);
		setCaseCommCreateDateFromFilter('');
		setCaseCommCreateDateToFilter('');
		setExternalIdFilter('')
		setClearText(true);
	};

	const handleExportServiceCaseCommunicationToCSV = async () => {
		let searchCaseCommunicationExportCsvRequest = await serviceCaseCommunicationSearchRequest();

		if (validateSearch(searchCaseCommunicationExportCsvRequest)) {
			exportToCSV(searchCaseCommunicationExportCsvRequest);
		}
	};

	function handleReopenCase() {
		reopenCaseCommunication();
	}

	const createNewCase = () => {
		const win: any = window.open(`/case-management/create-case`, '_blank');
		win.focus();
	};

	const onChangeCreatedDate = (val: any) => {
		
		if (val !== undefined && val.length > 0) {
			setCaseCommCreateDateFromFilter(val[0]);
			setCaseCommCreateDateToFilter(val[1]);
		} else {
			
			setCaseCommCreateDateFromFilter('');
			setCaseCommCreateDateToFilter('');
			setDateByFilter(undefined)
		}
	};

	const handleChangeMessageType = (val: any) => {
		setMessageTypeIdFilter(val);
		
		const hasLivePerson = val.find((lp: any) => lp.label === SearchCaseAndCommunication.LivePersonField);
		if (hasLivePerson?.label === SearchCaseAndCommunication.LivePersonField) {
			
			setIsAgentAbandonedDisabled(false)
		}
		else {
			setIsAgentAbandoned('')
			setIsAgentAbandonedDisabled(true)
			setIsDateByRequired(false)
			setIsAgentAbandonedQueue(false)
			setIsAbandonedQueueDisabled(true)
			
		}
	}

	const handleCommunicationOwnerTeam = (val: any) => {
		setTeamIdFilter(val)
	}

	useEffect(() =>{
		
		if (teamIdFilter && !isAgentAbandonedDisabled) {
			setIsAbandonedQueueDisabled(false)
		}
		else{
			setIsAbandonedQueueDisabled(true)
			setIsAgentAbandonedQueue(false)
			setIsAgentAbandoned(null)

		}
	},[teamIdFilter, isAgentAbandonedDisabled])

	const handleChangeCaseType = (val: any) => {
		if (caseTypeIdFilter != val && topicSubtopicFilter.length > 0) {
			swal({
				title: PROMPT_MESSAGES.ConfirmClearTitle,
				text: PROMPT_MESSAGES.ConfirmClearMessage('existing topic/subtopic selection'),
				icon: 'warning',
				buttons: ['No', 'Yes'],
				dangerMode: true,
			}).then((toConfirm) => {
				if (toConfirm) {
					setTopicSubtopicFilter([]);
					setCaseTypeIdFilter(val);
					setDisableTopicSubtopicFilter(false);
					setResetTopicSubtopicFilter(true);
					setCampaignNameDisable(false)
				}
			});
		} else {
			setCaseTypeIdFilter(val);
			setDisableTopicSubtopicFilter(false);
			setCampaignOptions([]);
			loadCampaignFilterList(val.value);
			setCampaignNameDisable(false)
		}
	};

	const handleTopicSubtopicFilter = () => {
		setTopicSubtopicModalShow(true);
	};

	const TopicSubtopicModalClose = () => setTopicSubtopicModalShow(false);

	const setDateByFilter = (value: any) => {
		setDateBy(value);
		setEnableDateRangePicker(false);
	}


	const handleCustomizeDisplay = async () => {
		setModalShow(true);
		
	};

	const updateGridCustomDisplay = () =>{
		setIsUpgradeGridDisplay(true)
		setModalShow(false)
	}

	const submitGridCustomDisplay = () =>{
		setIsSubmitGridDisplay(true)
		setModalShow(false)
		getGridAndFilterDisplay(defaultFields.filterDefault , defaultColumns , userId)
		
	}
	
	const defaultFields = {
		filterDefault : [
			{headerName: 'Brand', field: 'brandId', isPinned: true , displayFieldDependency: null, order: 0 },
			{headerName: 'Case Type', field: 'caseTypeId' , isPinned: true , displayFieldDependency: null, order: 1 },
			{headerName: 'Date By', field: 'dateBy' , isPinned: true , displayFieldDependency: null, order: 2 },
			{headerName: 'Campaign Name', field: 'campaignId' , displayFieldDependency: null, order: 3},
			{headerName: 'Message Type', field: 'messageTypeId' , displayFieldDependency: null, isParentDependency: false, order: 4 },
			{headerName: 'Abandoned Agent', field: 'isLastAgentAbandonedAssigned', displayFieldDependency: 'messageTypeId', order: 5 },
			{headerName: 'Communication Owner Team', field: 'communicationOwnerTeamId' , displayFieldDependency: null, order: 6 },
			{headerName: 'VIP Level', field: 'vipLevelId' , displayFieldDependency: null, order: 7 },
			{headerName: 'External ID', field: 'externalId' , displayFieldDependency: null, order: 8 },
			{headerName: 'Minimum Duration', field: 'minimumDurationId' , displayFieldDependency: null, order: 9 },
			{headerName: 'Currency', field: 'currencyId' , displayFieldDependency: null, order: 10},
			{headerName: 'Case Status', field: 'caseStatusId' , displayFieldDependency: null, order: 11 },
			{headerName: 'Player ID or User Name', field: 'playerId' , displayFieldDependency: null, order: 12},
			{headerName: 'Case ID or Communication ID', field: 'caseId' , displayFieldDependency: null, order: 13},
			{headerName: 'Communication Owner', field: 'communicationOwnersId' , displayFieldDependency: null, order: 14 },
			{headerName: 'Subject', field: 'subjectId' , displayFieldDependency: null, order: 15},
			{headerName: 'Notes', field: 'notesId' , displayFieldDependency: null, order: 16},
			{headerName: 'Topic/Subtopic Filter', field: 'subTopic' , displayFieldDependency: null, order: 17},
		]
	}

	useEffect(() =>{
		if(filterDefs && filterDefs.length > 0){
			const selectedFilters = newFilters
			.filter(filter => filterDefs.some((defaultFilter: any) => defaultFilter.field === filter.fieldId))
			.sort((a, b) => {
				const filterA = filterDefs.find((defaultFilter: any) => defaultFilter.field === a.fieldId);
				const filterB = filterDefs.find((defaultFilter: any) => defaultFilter.field === b.fieldId);
				return filterA.order - filterB.order;
			});

			const sortedNewFilters = [...newFilters].sort((a, b) => a.order - b.order);
			const filters = selectedFilters.length > 0 ? selectedFilters : sortedNewFilters
			setSelectedFilters(filters);
			setOptions(filters)
			resetFilterDefs([])
			setCampaignNameDisable(true)
			
		}

	},[filterDefs])


	const handleAbandonedQueueCheckbox= (val: any) => {
		setIsAgentAbandonedQueue(val)
		
		if (val) {
			setIsDateByRequired(true)
		}
		else
		    setIsDateByRequired(false)
	}

	const newFilters = [
		{
			fieldId: 'brandId',
			label: 'Brand',
			onChange: (val: any) => setBrandIdFilter(val),
			option: [],
			type: 'select',
			order: 0
		},
		{
			fieldId: 'caseTypeId',
			label: 'Case Type',
			onChange: (val: any) => handleChangeCaseType(val),
			option: [],
			type: 'select',
			order: 1
		},
		{
			fieldId: 'dateBy',
			isRequired: isDateByRequired,
			isMulti: false,
			label: 'Date By',
			option: [],
			onChange: (val: any) => setDateByFilter(val),
			format: 'dd/MM/yyyy HH:mm:ss',
			dateChange: onChangeCreatedDate,
			style: {width: '100%'},
			disabled:enableDateRangePicker,
			type: 'date-select',
			order: 2
		},
		{
			fieldId: 'campaignId',
			showToolTip: true,
			tooltipText: 'Please select Campaign Name',
			isRequired: false,
			isMulti: false,
			label: 'Campaign Name',
			options: [],
			isDisabled: campaignNameDisable,
			onChange: (val: any) => setCampaignIdFilter(val),
			type: 'select',
			order: 3
		},
		{
			fieldId: 'messageTypeId',
			isRequired: false,
			isMulti: true,
			label: 'Message Type',
			options: [],
			onChange: (val: any) => handleChangeMessageType(val),
			type: 'select',
			order: 4
		},
		{
			fieldId: 'isLastAgentAbandonedAssigned',
			isRequired: false,
			label: 'Abandoned Agent',
			hasDataClearDependency: true,
			options: [],
			isDisabled: isAgentAbandonedDisabled,
			onChange: (e: any) => setIsAgentAbandoned(e.label),
			type: 'select',
			order: 5
		},
		{
			fieldId: 'communicationOwnerTeamId',
			isRequired: false,
			isMulti: false,
			label: '',
			selectGroupTitle: 'Communication Owner Team',
			subElementLabel: 'Include Abandoned Queue of selected Team',
		
			onChangeSubElement: (val: any) => handleAbandonedQueueCheckbox(val),
			options: [],
			onChange: (val: any) => handleCommunicationOwnerTeam(val),
			isDisabledSubElement: isAbandonedQueueDisabled,
			type: 'select-with-checkbox-group',
			order: 6
		},

		{
			fieldId: 'vipLevelId',
			isRequired: false,
			isMulti: true,
			label: 'VIP Level',
			options: [],
			onChange: (val: any) => setVipLevelIdFilter(val),
			type: 'select',
			order: 7
		},
		{
			fieldId: 'externalId',
			label: 'External Id',
			onChange: (val: any) => setExternalIdFilter(val),
			type: 'text',
			order: 8
		},
		{
			fieldId: 'minimumDurationId',
			inputType: 'number',
			title: 'Minimum Duration',
			ariaLabel: 'Minimum Duration',
			disabled: false,
			inputChange: (e: any) => setServiceCaseCommDuration(e.target.value),
			type: 'input',
			order: 9
		},
		
		{
			fieldId: 'currencyId',
			isRequired: false,
			isMulti: true,
			label: 'Currency',
			options: [],
			onChange: (val: any) => setCurrencyIdFilter(val),
			type: 'select',
			order: 10
		},
		{
			fieldId: 'caseStatusId',
			isRequired: false,
			isMulti: true,
			label: 'Case Status',
			options: [],
			onChange: (val: any) => setCaseStatusIdFilter(val),
			type: 'select',
			order: 11
		},
		{
			fieldId: 'playerId',
			label: '',
			isRequired: false,
			isMulti: false,
			option: [],
			onChange:(val: any) => setSelectedPlayerUserOption(val),
			inputGroupTitle: 'Player ID or User Name',
			textAreaChange: (val: any) => setPlayerIdUsernameFilter(val),
			type: 'input-group',
			order: 12
		}, 
		{
			fieldId: 'caseId',
			inputGroupTitle: 'Case ID or Communication ID',
			label: '',
			isRequired: false,
			isMulti: false,
			options: [],
			onChange:(val: any) => setSelectedCaseCommOption(val),
			textAreaChange:(val: any) => setCaseIdCommunicationIdFilter(val),
			type: 'input-group',
			order: 13
		},
		{
			fieldId: 'communicationOwnersId',
			isRequired: false,
			isMulti: true,
			label: 'Communication Owner',
			options: [],
			onChange: (val: any) => setCommunicationOwnerIdFilter(val),
			type: 'select',
			order: 14
		},
		{
			fieldId: 'subjectId',
			type: 'text',
			label: 'Subject',
			onChange: (val: any) => setSubjectFilter(val),
			order: 15
		},
		{
			fieldId: 'notesId',
			label: 'Notes',
			onChange: (val: any) => setNotesFilter(val),
			type: 'text',
			order: 16
		},
		{
			fieldId: 'subTopic',
			buttonDisplay: topicSubtopicDisplay,
			disabled: disableTopicSubtopicFilter,
			handleButtonClick: handleTopicSubtopicFilter,
			type: 'button',
			order: 17
		}
	
	]

	useEffect(() => {
		setOptions(selectedFilters)
	}, [
		campaignNameDisable, 
		enableDateRangePicker, 
		fetchAllOptions, 
		campaignOptions, 
		teamListOptions, 
		currencyOptions, 
		brandOptions, 
		caseTypeOptions, 
		dateOptions, 
		PLAYER_USER_OPTIONS, 
		CASE_COMM_OPTIONS,
		disableTopicSubtopicFilter,
		isAgentAbandonedDisabled,
		isAbandonedQueueDisabled,
		isDateByRequired,
		abandonedAgendOptions,
		isAgentAbandoned,
		

	]);

	const setOptions = (selectedFilters: any) => {
		if (fetchAllOptions || (campaignOptions.length > 0 || teamListOptions.length > 0 || currencyOptions.length > 0 || dateOptions.length > 0
			|| brandOptions.length > 0 ||  caseTypeOptions.length > 0 || dateOptions.length > 0 || PLAYER_USER_OPTIONS.length > 0 || CASE_COMM_OPTIONS.length > 0)) {
			
			const optionsConfig: any = {
				caseTypeId: { option: caseTypeOptions },
				brandId: { option: brandOptions },
				campaignId: { isDisabled: campaignNameDisable, option: campaignOptions },
				messageTypeId: { option: messageTypeOptions },
				vipLevelId: { option: vipLevelOptions },
				dateBy: { disabled: enableDateRangePicker, option: dateOptions, isRequired: isDateByRequired  },
				caseStatusId: { option: caseStatusOptions },
				communicationOwnersId: { option: communicationOwnerOptions },
				communicationOwnerTeamId: { option: teamListOptions, isDisabledSubElement: isAbandonedQueueDisabled },
				currencyId: { option: currencyOptions },
				caseId: { option: CASE_COMM_OPTIONS },
				playerId: { option: PLAYER_USER_OPTIONS },
				subTopic: { disabled: disableTopicSubtopicFilter},
				isLastAgentAbandonedAssigned: {isDisabled: isAgentAbandonedDisabled, option: abandonedAgendOptions, hasDataClearDependency: isAgentAbandonedDisabled},
			
			};

			if(selectedFilters.length > 0) {
				const newSelectedFilter = selectedFilters.map((filter: any) => {
					const config = optionsConfig[filter.fieldId];
					// Only update if the option or property is different
					if (config) {
						const isDifferent = Object.keys(config).some(key => filter[key] !== config[key]);
						return isDifferent ? { ...filter, ...config } : filter;
					}
					return filter;
				});
	
				setSelectedFilters((prevSelectedFilters) => {
					// Only update if the newSelectedFilter is different from the previous selected filters
					const isDifferent = JSON.stringify(prevSelectedFilters) !== JSON.stringify(newSelectedFilter);
					return isDifferent ? newSelectedFilter : prevSelectedFilters;
				});
			}
		}
	}
	useEffect(() =>{
		if(resetFilter){
			setResetFilter(false)
		}
	},[resetFilter])

	const setCurrentSectionValue = (val: any) => {
		setCurrentValue(val)
	}

	return (
		<>
			<FormGroupContainer>
				<div className='accordion mb-5' id='kt_accordion_1'>
					<div className='accordion-item'>
						<h2 className='accordion-header' id='kt_accordion_1_header_1'>
							<button
								className='accordion-button fs-4 fw-bold collapsed'
								type='button'
								data-bs-toggle='collapse'
								data-bs-target='#kt_accordion_1_body_1'
								aria-expanded='false'
								aria-controls='kt_accordion_1_body_1'
							>
								Basic Filters
							</button>
						</h2>
						<div
							id='kt_accordion_1_body_1'
							className='accordion-collapse collapse show '
							aria-labelledby='kt_accordion_1_header_1'
							data-bs-parent='#kt_accordion_1'
						>
							  <div className='accordion-body row'>
							     {selectedFilters.map((filter) => (
									<div key={filter.fieldId} className='col-lg-3 col-md-3 col-sm-6 my-2'>
										<DynamicFilter onChange={filter.onChange}
										label={filter.label} 
										type={filter.type} 
										option={filter.option}
										showToolTip={filter.showToolTip}
										tooltipText={filter.tooltipText}
										isRequired={filter.isRequired}
										isMulti={filter.isMulti}
										isDisabled={filter.isDisabled}
										format={filter.format}
										dateChange={filter.dateChange}
										style={filter.style}
										disabled={filter.disabled}
										ariaLabel={filter.ariaLabel}
										inputType={filter.inputType}
										title={filter.title}
										inputChange={filter.inputChange}
										inputGroupTitle={filter.inputGroupTitle}
										textAreaChange={filter.textAreaChange}
										resetFilter={resetFilter}
										handleButtonClick={filter.handleButtonClick}
										buttonDisplay={filter.buttonDisplay}
										subElementLabel={filter.subElementLabel}
										selectGroupTitle={filter.selectGroupTitle}
										isDisabledSubElement ={filter.isDisabledSubElement}
										onChangeSubElement={filter.onChangeSubElement}
										hasDataClearDependency={filter.hasDataClearDependency}
										clearTextField={clearText}
										 />
									</div>
								))}
								
								
							</div>
						</div>
					</div>
				</div>
				<TopicSubtopicFilter
					showForm={topicSubtopicModalShow}
					caseTypeFilter={caseTypeIdFilter}
					resetCaseTypeFilter={resetTopicSubtopicFilter}
					setTopicSubtopicFilter={setTopicSubtopicFilter}
					closeModal={TopicSubtopicModalClose}
				/>
				<UserGridCustomDisplayModal
					showForm={modalShow}
					onUpdate={updateGridCustomDisplay}
					defaultColumns={defaultColumns}
					submitModal={submitGridCustomDisplay}
					closeModal={() => setModalShow(false)}
					defaultFilters={defaultFields}
					isWithSection= {true}
					setCurrentSection={setCurrentSectionValue}
					currentSectionValue={currentValue}
				/>
			</FormGroupContainer>
			<ButtonsContainer>
				<MlabButton
					access={true}
					label='Search'
					style={ElementStyle.primary}
					type={'button'}
					weight={'solid'}
					size={'sm'}
					loading={loading}
					loadingTitle={'Please wait...'}
					disabled={loading || !userAccess?.includes(USER_CLAIMS.SearchCaseCommunicationWrite) || fetchingGridColumnDisplay}
					onClick={handleSearchServiceCaseCommunication}
				/>
				<MlabButton
					access={true}
					label='Clear'
					style={ElementStyle.secondary}
					type={'button'}
					weight={'solid'}
					size={'sm'}
					loading={loading}
					loadingTitle={'Please wait...'}
					disabled={loading}
					onClick={handleClear}
				/>
				<MlabButton
					access={userAccess.includes(USER_CLAIMS.CreateCustomerCaseWrite) || userAccess.includes(USER_CLAIMS.CreateCaseonBehalfRead)}
					label='Create Case'
					style={ElementStyle.primary}
					type={'button'}
					weight={'solid'}
					size={'sm'}
					loading={loading}
					loadingTitle={'Please wait...'}
					disabled={loading}
					onClick={createNewCase}
				/>
				<MlabButton
					access={true}
					label='Export'
					style={ElementStyle.primary}
					type={'button'}
					weight={'solid'}
					size={'sm'}
					loading={loading}
					loadingTitle={'Please wait...'}
					disabled={loading}
					onClick={handleExportServiceCaseCommunicationToCSV}
				/>
				<MlabButton
					access={true}
					label='Customize Display'
					style={ElementStyle.primary}
					type={'button'}
					weight={'solid'}
					size={'sm'}
					loading={loading}
					loadingTitle={'Please wait...'}
					disabled={loading}
					onClick={handleCustomizeDisplay}
				/>
				{rowSelectedCaseCommunication.length > 1 && (
					<MlabButton
						access={userAccess?.includes(USER_CLAIMS.ReopenCaseWrite)}
						label='Reopen Case'
						style={ElementStyle.primary}
						type={'button'}
						weight={'solid'}
						size={'sm'}
						loading={loading}
						loadingTitle={'Please wait...'}
						disabled={loading}
						onClick={handleReopenCase}
						additionalClassStyle={'ml-auto'}
					/>
				)}
			</ButtonsContainer>
		</>
	);
};

export default CaseCommunicationFilter;

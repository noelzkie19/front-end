import { Guid } from 'guid-typescript';
import { useEffect, useState } from 'react';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import Select from 'react-select';
import swal from 'sweetalert';
import { RootState } from '../../../../setup';
import { LookupModel } from '../../../common/model';
import { AccordionHeaderType, ElementStyle, HttpStatusCodeEnum, PROMPT_MESSAGES } from '../../../constants/Constants';
import useConstant from '../../../constants/useConstant';
import { FilterAccordion, FormGroupContainer, MlabButton } from '../../../custom-components';
import DefaultDateRangePicker from '../../../custom-components/date-range-pickers/DefaultDateRangePicker';
import { useCurrencies } from '../../../custom-functions';
import CommonLookups from '../../../custom-functions/CommonLookups';
import useFnsDateFormatter from '../../../custom-functions/helper/useFnsDateFormatter';
import { getAllCampaignType } from '../../campaign-management/redux/CampaignManagementService';
import { getTaggingUsers } from '../../campaign-setting/redux/AutoTaggingService';
import { useSegmentLookups } from '../../player-management/segmentation/components/shared/hooks';
import { USER_CLAIMS } from '../../user-management/components/constants/UserClaims';
import { CampaignPlayerFilterRequestModel, CampaignPlayerFilterResponseModel } from '../models';
import * as agentWorkspaceManagement from '../redux/AgentWorkspaceRedux';
import {
	exportToCsv,
	getAllCampaignsList,
	getCampaignAgentsList,
	getCampaignPlayerListFilter,
	getMessageStatusResponseList,
} from '../redux/AgentWorkspaceService';
import '../styles/agentworkspace.css';

export const AgentWorkspaceFilter = () => {
	// States
	const dispatch = useDispatch();
	const [isLeader, setIsLeader] = useState(false);
	const [filterCampaignTypeId, setFilterCampaignTypeId] = useState<any>('');
	const [filterCampaignId, setFilterCampaignId] = useState<any>('');
	const [filterCampaignStatus, setFilterCampaignStatus] = useState('');
	const [filterAgents, setFilterAgents] = useState([]);
	const [filterPlayerId, setFilterPlayerId] = useState('');
	const [filterUserName, setFilterUserName] = useState('');
	const [filterPlayerStatus, setFilterPlayerStatus] = useState('');
	const [filterMobileNumber, setFilterMobileNumber] = useState('');
	const [filterDeposited, setFilterDeposited] = useState([]);
	const [filterCurrency, setFilterCurrency] = useState([]);
	const [filterMarketingSource, setFilterMarketingSource] = useState('');
	const [filterRegisteredDate, setFilterRegisteredDate] = useState([]);
	const [filterFTDAmountFrom, setFilterFTDAmountFrom] = useState('');
	const [filterFTDAmountTo, setFilterFTDAmountTo] = useState('');
	const [filterFTDDate, setFilterFTDDate] = useState([]);
	const [filterMessageStatusResponse, setFilterMessageStatusResponse] = useState([]);
	const [filterTaggedDate, setFilterTaggedDate] = useState([]);
	const [filterCallListNotes, setFilterCallListNotes] = useState('');
	const [filterCallCaseCreatedDate, setFilterCallCaseCreatedDate] = useState([]);
	const [filterPrimaryGoalReached, setFilterPrimaryGoalReached] = useState([]);
	const [filterPrimaryGoalCountFrom, setFilterPrimaryGoalCountFrom] = useState('');
	const [filterPrimaryGoalCountTo, setFilterPrimaryGoalCountTo] = useState('');
	const [filterPrimaryGoalAmountFrom, setFilterPrimaryGoalAmountFrom] = useState('');
	const [filterPrimaryGoalAmountTo, setFilterPrimaryGoalAmountTo] = useState('');
	const [filterLastLoginDate, setFilterLastLoginDate] = useState([]);
	const [filterInitialDepositAmount, setFilterInitialDepositAmount] = useState('');
	const [filterInitialDepositDate, setFilterInitialDepositDate] = useState<any>([]);
	const [filterInitialDepositMethod, setFilterInitialDepositMethod] = useState([]);
	const [filterInitialDeposited, setFilterInitialDeposited] = useState([]);
	const [filterMobileVerificationStatus, setFilterMobileVerificationStatus] = useState<any>();

	const userAccessId = useSelector<RootState>(({ auth }) => auth.userId, shallowEqual) as number;
	const userAccess = useSelector<RootState>(({ auth }) => auth.access, shallowEqual) as string;
	const loading = useSelector<RootState>(({ agentWorkspace }) => agentWorkspace.loading, shallowEqual) as boolean;
	const loadList = useSelector<RootState>(({ agentWorkspace }) => agentWorkspace.loadList, shallowEqual) as string;
	const filterResponseState = useSelector<RootState>(
		({ agentWorkspace }) => agentWorkspace.filterResponse,
		shallowEqual
	) as CampaignPlayerFilterResponseModel;
	const pageSize = useSelector<RootState>(({ agentWorkspace }) => agentWorkspace.pageSize, shallowEqual) as number;
	const currentPage = useSelector<RootState>(({ agentWorkspace }) => agentWorkspace.currentPage, shallowEqual) as number;
	const sortColumn = useSelector<RootState>(({ agentWorkspace }) => agentWorkspace.sortColumn, shallowEqual) as string;
	const sortOrder = useSelector<RootState>(({ agentWorkspace }) => agentWorkspace.sortOrder, shallowEqual) as string;
	const currentUserFullName = useSelector<RootState>(({ auth }) => auth.fullName, shallowEqual) as string;

	const YESNO_OPTIONS = [
		{ value: '1', label: 'YES' },
		{ value: '0', label: 'NO' },
	];

	const { MLAB_FORMATS, properFormatDateHourMinSec } = useConstant();
	const { mlabFormatDate } = useFnsDateFormatter();

	// for data access restriction
	const currencyList = useCurrencies(userAccessId);
	const { getSegmentLookup } = useSegmentLookups();

	const [campaignTypeOptions, setCampaignTypeOptions] = useState<Array<LookupModel>>([]);
	const [campaignOptions, setCampaignOptions] = useState<Array<LookupModel>>([]);

	const [campaignAgentsOptions, setCampaignAgentsOptions] = useState<Array<LookupModel>>([]);
	const [messageStatusResponseOptions, setMessageStatusResponseOptions] = useState<Array<LookupModel>>([]);

	// Side Effects
	useEffect(() => {
		//clear player list in redux
		dispatch(agentWorkspaceManagement.actions.clear());
		loadDropdowns();

		if (userAccess.includes(USER_CLAIMS.ViewAllPlayersRead)) {
			setIsLeader(true);
			const defaultVal = [{ value: userAccessId, label: currentUserFullName }] as any;
			setFilterAgents(defaultVal);
		} else {
			setIsLeader(false);
		}
	}, []);

	useEffect(() => {
		loadCampaignFilterList();
	}, [filterCampaignTypeId]);

	useEffect(() => {
		loadCampaignAgents();
		loadMessageStatusResponse();
	}, [filterCampaignId]);

	useEffect(() => {
		if (loadList !== '' && filterCampaignId != undefined && filterCampaignId != '') {
			loadCampaignPlayers();
			loadCampaignAgents();
		}
	}, [loadList]);

	// START - Filter OnChange Handlers
	const loadDropdowns = () => {
		getAllCampaignType().then((response) => {
			if (response.status === HttpStatusCodeEnum.Ok) {
				setCampaignTypeOptions(response.data);
			}
		});

		getTaggingUsers(21).then((response) => {
			if (response.status === HttpStatusCodeEnum.Ok) {
				const agents = response.data.map(
					(i) =>
					({
						value: i.userId.toString(),
						label: i.fullName,
					} as LookupModel)
				);
				setCampaignAgentsOptions(agents);
			}
		});
	};

	const loadCampaignFilterList = () => {
		if (filterCampaignTypeId?.value) {
			getAllCampaignsList(filterCampaignTypeId.value).then((response) => {
				if (response.status === HttpStatusCodeEnum.Ok) {
					setCampaignOptions(response.data);
				}
			});
		}
	};

	const loadCampaignAgents = () => {
		if (filterCampaignId?.value) {
			const campaignId = filterCampaignId.value;
			getCampaignAgentsList(campaignId).then((response) => {
				if (response.status === HttpStatusCodeEnum.Ok) {
					setCampaignAgentsOptions([{ value: '-1', label: 'None' } as LookupModel, ...response.data]);
				}
			});
		}
	};

	const loadMessageStatusResponse = () => {
		if (filterCampaignId?.value) {
			const campaignId = filterCampaignId.value;
			getMessageStatusResponseList(campaignId).then((response) => {
				if (response.status === HttpStatusCodeEnum.Ok) {
					setMessageStatusResponseOptions(response.data);
				}
			});
			setFilterMessageStatusResponse([]);
		}
	};

	const handleFilterCampaignTypeChange = (val: LookupModel) => {
		setFilterCampaignTypeId(val);
		setFilterCampaignId('');
	};

	const handleFilterCampaignNameChange = (val: LookupModel) => {
		setFilterCampaignId(val);
	};

	const handleFilterAgentsChange = (val: any) => {
		setFilterAgents(val);
	};

	const handleFilterPlayerIdChange = (val: any) => {
		setFilterPlayerId(val.target.value);
	};

	const handleFilterUserNameChange = (val: any) => {
		setFilterUserName(val.target.value);
	};

	const handleFilterPlayerStatusChange = (val: string) => {
		setFilterPlayerStatus(val);
	};

	const handleFilterMobileNumberChange = (val: any) => {
		setFilterMobileNumber(val.target.value);
	};

	const handleFilterDepositedChange = (val: any) => {
		setFilterDeposited(val);
	};

	const handleFilterCurrencyChange = (val: any) => {
		setFilterCurrency(val);
	};

	const handleFilterMarketingSourceChange = (val: any) => {
		setFilterMarketingSource(val.target.value);
	};

	const handleFilterRegisteredDateChange = (val: any) => {
		if (val != undefined) {
			setFilterRegisteredDate(val);
		}
	};

	const handleFilterLastLoginDateChange = (val: any) => {
		if (val != undefined) {
			setFilterLastLoginDate(val);
		}
	};

	const handleFilterFTDAmountFromChange = (val: any) => {
		setFilterFTDAmountFrom(val.target.value);
	};

	const handleFilterFTDAmountToChange = (val: any) => {
		setFilterFTDAmountTo(val.target.value);
	};

	const handleFilterFTDDateChange = (val: any) => {
		if (val != undefined) {
			setFilterFTDDate(val);
		}
	};

	const handleFilterMessageStatusResponseChange = (val: any) => {
		setFilterMessageStatusResponse(val);
	};

	const handleFilterTaggedDateChange = (val: any) => {
		if (val != undefined) {
			setFilterTaggedDate(val);
		}
	};

	const handleFilterCallListNotesChange = (val: any) => {
		setFilterCallListNotes(val.target.value);
	};

	const handleFilterCallCaseCreatedDateChange = (val: any) => {
		if (val != undefined) {
			setFilterCallCaseCreatedDate(val);
		}
	};

	const handleFilterPrimaryGoalReachedChange = (val: any) => {
		setFilterPrimaryGoalReached(val);
	};

	const handleFilterPrimaryGoalCountFromChange = (val: any) => {
		setFilterPrimaryGoalCountFrom(val.target.value);
	};

	const handleFilterPrimaryGoalCountToChange = (val: any) => {
		setFilterPrimaryGoalCountTo(val.target.value);
	};

	const handleFilterPrimaryGoalAmountFromChange = (val: any) => {
		setFilterPrimaryGoalAmountFrom(val.target.value);
	};

	const handleFilterPrimaryGoalAmountToChange = (val: any) => {
		setFilterPrimaryGoalAmountTo(val.target.value);
	};

	const handleFilterInitialDepositAmountChange = (val: any) => {
		setFilterInitialDepositAmount(val.target.value);
	};

	const handleFilterInitialDepositDateChange = (val: any) => {
		if (val != undefined) {
			setFilterInitialDepositDate(val);
		}
	};

	const handleFilterInitialDepositMethodChange = (val: any) => {
		setFilterInitialDepositMethod(val);
	};

	const handleFilterInitialDepositedChange = (val: any) => {
		setFilterInitialDeposited(val);
	};

	const handleFilterMobileVerificationChange = (val: any) => {
		setFilterMobileVerificationStatus(val);
	};

	const handleSearch = () => {
		if (!filterCampaignId || filterCampaignId.value.toString().trim() === '') {
			swal(PROMPT_MESSAGES.FailedValidationTitle, 'Please select Campaign name', 'error');
			dispatch(agentWorkspaceManagement.actions.setLoading(false));
		} else {
			dispatch(agentWorkspaceManagement.actions.setCurrentPage(1));
			dispatch(agentWorkspaceManagement.actions.loadList(Guid.create().toString()));
		}
	};

	const handleClear = () => {
		setFilterCampaignTypeId('');
		setFilterCampaignId('');
		setCampaignOptions([]);
		setFilterCampaignStatus('');
		setFilterAgents([]);
		setFilterPlayerId('');
		setFilterUserName('');
		setFilterPlayerStatus('');
		setFilterMobileNumber('');
		setFilterDeposited([]);
		setFilterCurrency([]);
		setFilterMarketingSource('');
		setFilterRegisteredDate([]);
		setFilterFTDAmountFrom('');
		setFilterFTDAmountTo('');
		setFilterFTDDate([]);
		setFilterMessageStatusResponse([]);
		setFilterTaggedDate([]);
		setFilterCallListNotes('');
		setFilterCallCaseCreatedDate([]);
		setFilterPrimaryGoalReached([]);
		setFilterPrimaryGoalCountFrom('');
		setFilterPrimaryGoalCountTo('');
		setFilterPrimaryGoalAmountFrom('');
		setFilterPrimaryGoalAmountTo('');
		setFilterLastLoginDate([]);
		setFilterInitialDepositAmount('');
		setFilterInitialDepositDate([]);
		setFilterInitialDepositMethod([]);
		setFilterInitialDeposited([]);
		dispatch(agentWorkspaceManagement.actions.clear());
	};

	const getCampaignId = () => {
		let campaignIdTemp;
		if (isLeader) {
			campaignIdTemp = filterCampaignId ? Number(Object.assign({} as LookupModel, filterCampaignId).value) : 0;
		} else {
			campaignIdTemp = Number(filterCampaignId.value);
		}

		return campaignIdTemp;
	};

	const getFilterParams = () => {
		const campaignIdTemp = getCampaignId();

		let messageStatusResponseCombi: string = '';
		if (filterMessageStatusResponse.length > 0) {
			messageStatusResponseCombi =
				filterMessageStatusResponse.map((i: any) => i.value.split('|')[0]).join(',') +
				'|' +
				filterMessageStatusResponse.map((i: any) => i.value.split('|')[1]).join(',');
		}

		let offSetValue = (currentPage - 1) * pageSize;

		const filterRequest: CampaignPlayerFilterRequestModel = {
			campaignId: campaignIdTemp,
			campaignTypeId: filterCampaignTypeId ? Number(Object.assign({} as LookupModel, filterCampaignTypeId).value) : 0,
			campaignStatus: filterCampaignStatus ? Number(Object.assign({} as LookupModel, filterCampaignStatus).value) : 0,
			agentId: isLeader ? filterAgents.map((i: any) => i.value).join(',') : userAccessId.toString(),
			playerId: filterPlayerId, //CSV
			playerStatus: filterPlayerStatus ? Number(Object.assign({} as LookupModel, filterPlayerStatus).value) : 0,
			username: filterUserName, //CSV
			marketingSource: filterMarketingSource, //CSV
			currency: filterCurrency.map((i: any) => i.value).join(','), //CSV, currencyId
			registeredDateStart: mlabFormatDate(filterRegisteredDate[0] ?? '', 'MM/d/yyyy HH:mm:ss'),
			registeredDateEnd: mlabFormatDate(filterRegisteredDate[1] ?? '', 'MM/d/yyyy HH:mm:ss'),
			lastLoginDateStart: filterLastLoginDate[0],
			lastLoginDateEnd: filterLastLoginDate[1],
			deposited: filterDeposited.map((i: any) => i.value).join(','), //CSV, YES/NO
			ftdAmountFrom: filterFTDAmountFrom.trim() === '' ? undefined : Number(filterFTDAmountFrom),
			ftdAmountTo: filterFTDAmountTo.trim() === '' ? undefined : Number(filterFTDAmountTo),
			ftdDateStart: filterFTDDate[0],
			ftdDateEnd: filterFTDDate[1],
			taggedDateStart: mlabFormatDate(filterTaggedDate[0] ?? '', 'MM/d/yyyy HH:mm:ss'),
			taggedDateEnd: mlabFormatDate(filterTaggedDate[1] ?? '', 'MM/d/yyyy HH:mm:ss'),
			primaryGoalReached: filterPrimaryGoalReached.map((i: any) => i.value).join(','), //CSV, YES,NO
			primaryGoalCountFrom: filterPrimaryGoalCountFrom.trim() === '' ? undefined : Number(filterPrimaryGoalCountFrom),
			primaryGoalCountTo: filterPrimaryGoalCountTo.trim() === '' ? undefined : Number(filterPrimaryGoalCountTo),
			primaryGoalAmountFrom: filterPrimaryGoalAmountFrom.trim() === '' ? undefined : Number(filterPrimaryGoalAmountFrom),
			primaryGoalAmountTo: filterPrimaryGoalAmountTo.trim() === '' ? undefined : Number(filterPrimaryGoalAmountTo),
			callListNotes: filterCallListNotes, // with * wildcard search
			mobileNumber: filterMobileNumber, // with * wildcard search
			mobileVerificationStatusId: filterMobileVerificationStatus?.value ?? 0,
			messageResponseAndStatus: messageStatusResponseCombi, // CSV
			callCaseCreatedDateStart: filterCallCaseCreatedDate[0],
			callCaseCreatedDateEnd: filterCallCaseCreatedDate[1],
			initialDepositAmount: filterInitialDepositAmount.trim() === '' ? undefined : Number(filterInitialDepositAmount),
			initialDepositDateStart: mlabFormatDate(filterInitialDepositDate[0], 'MM/d/yyyy HH:mm:ss'),
			initialDepositDateEnd: mlabFormatDate(filterInitialDepositDate[1], 'MM/d/yyyy HH:mm:ss'),
			intialDepositMethod: filterInitialDepositMethod.map((i: any) => i.value).join(','),
			initialDeposited: filterInitialDeposited.map((i: any) => i.value).join(','),
			queueId: Guid.create().toString(),
			userId: userAccessId.toString(),
			pageSize: pageSize,
			offsetValue: offSetValue < 0 ? 0 : offSetValue,
			sortColumn: sortColumn,
			sortOrder: sortOrder,
		};

		console.log('filter request ', filterRequest);
		return filterRequest;
	};

	const loadCampaignPlayers = async () => {
		dispatch(agentWorkspaceManagement.actions.setLoading(true));
		await getCampaignPlayerListFilter(getFilterParams())
			.then((response) => {
				let resultData = { ...response.data } as CampaignPlayerFilterResponseModel;

				dispatch(agentWorkspaceManagement.actions.setFilterResponse(resultData));
				dispatch(agentWorkspaceManagement.actions.setLoading(false));
			})
			.catch((ex: any) => {
				console.log('Error loading getCampaignPlayerListFilter' + ex);
				dispatch(agentWorkspaceManagement.actions.setLoading(false));
			});
	};

	const handleExportToCsv = async () => {
		dispatch(agentWorkspaceManagement.actions.setLoading(true));

		let request = getFilterParams();
		request.pageSize = filterResponseState.recordCount;

		await exportToCsv(request)
			.then((response) => {
				const url = window.URL.createObjectURL(new Blob([response.data]));
				const link = document.createElement('a');
				link.href = url;
				link.setAttribute('download', 'Campaign_Players_Results.csv');
				document.body.appendChild(link);
				link.click();
				dispatch(agentWorkspaceManagement.actions.setLoading(false));
			})
			.catch((ex) => {
				dispatch(agentWorkspaceManagement.actions.setLoading(false));
				swal('Error in Export to CSV', ex.toString(), 'error');
			});
	};

	return (
		<div className='card'>
			<div className='card-body p-5'>
				<FormGroupContainer>
					<h5>
						<i className='bi bi-search'></i> Search Filters
					</h5>
				</FormGroupContainer>
				<div className='separator separator-dashed my-3'></div>
				<div className='d-flex mb-2'>
					<div style={{ marginRight: 5 }}>
						<MlabButton
							access={true}
							label='Search'
							style={ElementStyle.primary}
							type={'button'}
							weight={'solid'}
							size={'sm'}
							loading={loading}
							loadingTitle={'Please wait...'}
							onClick={handleSearch}
							disabled={loading || !(userAccess.includes(USER_CLAIMS.ViewOwnPlayersRead) || userAccess.includes(USER_CLAIMS.ViewAllPlayersRead))}
						/>
					</div>

					<div style={{ marginRight: 5 }}>
						<MlabButton
							access={true}
							label='Clear'
							style={ElementStyle.secondary}
							type={'button'}
							weight={'solid'}
							size={'sm'}
							onClick={handleClear}
							disabled={loading || !(userAccess.includes(USER_CLAIMS.ViewOwnPlayersRead) || userAccess.includes(USER_CLAIMS.ViewAllPlayersRead))}
						/>
					</div>

					{filterResponseState.recordCount > 0 && userAccess.includes(USER_CLAIMS.ExportToCSVAgentWorkSpaceWrite) === true && (
						<MlabButton
							access={userAccess.includes(USER_CLAIMS.ExportToCSVAgentWorkSpaceRead)}
							label='Export to CSV'
							style={ElementStyle.primary}
							type={'button'}
							weight={'solid'}
							size={'sm'}
							onClick={handleExportToCsv}
							disabled={loading}
						/>
					)}
				</div>
				<div className='separator separator-dashed my-3'></div>
				<FormGroupContainer>
					<FilterAccordion type={AccordionHeaderType.light} title='Campaign' icon={<i className='bi bi-chat-quote-fill text-primary fs-3' />}>
						<div className='col-md-12 col-xs-12'>
							<p className='py-0 m-0 my-1 filter-label required fs-7'>Campaign Type</p>
							<Select
								native
								size='small'
								style={{ width: '100%' }}
								menuPortalTarget={document.body}
								styles={{ menuPortal: (base: any) => ({ ...base, zIndex: 9999 }) }}
								options={campaignTypeOptions}
								onChange={handleFilterCampaignTypeChange}
								value={filterCampaignTypeId}
							/>
						</div>
						<div className='col-md-12 col-xs-12'>
							<p className='py-2 m-0 my-1 filter-label required fs-7'>Campaign Name</p>
							<Select
								native
								size='small'
								style={{ width: '100%' }}
								isClearable={isLeader}
								menuPortalTarget={document.body}
								styles={{ menuPortal: (base: any) => ({ ...base, zIndex: 9999 }) }}
								options={campaignOptions}
								onChange={handleFilterCampaignNameChange}
								value={filterCampaignId}
							/>
						</div>

						<div className='col-md-12 col-xs-12'>
							<p className='py-2 m-0 my-1 filter-label fs-7'>Agent Name</p>
							{isLeader && (
								<Select
									native
									isMulti
									size='small'
									style={{ width: '100%' }}
									menuPortalTarget={document.body}
									isClearable={isLeader}
									styles={{ menuPortal: (base: any) => ({ ...base, zIndex: 9999 }) }}
									options={campaignAgentsOptions}
									onChange={handleFilterAgentsChange}
									value={filterAgents}
									isDisabled={!isLeader}
								/>
							)}
							{!isLeader && (
								<input
									type='text'
									disabled
									className='form-control form-control-sm form-control-solid'
									name='CurrentUser'
									value={currentUserFullName}
								/>
							)}
						</div>
					</FilterAccordion>

					<FilterAccordion type={AccordionHeaderType.light} title='Player' icon={<i className='bi bi-person-fill text-primary fs-3' />}>
						<div className='col-md-12 col-xs-12'>
							<p className='py-0 m-0 my-1 filter-label fs-7'>Player ID</p>
							<input
								type='text'
								className='form-control form-control-sm form-control-solid'
								name='city'
								value={filterPlayerId}
								onChange={handleFilterPlayerIdChange}
							/>
						</div>
						<div className='col-md-12 col-xs-12'>
							<p className='py-2 m-0 my-1 filter-label fs-7'>User Name</p>
							<input
								type='text'
								className='form-control form-control-sm form-control-solid'
								name='city'
								value={filterUserName}
								onChange={handleFilterUserNameChange}
							/>
						</div>

						<div className='col-md-12 col-xs-12'>
							<p className='py-2 m-0 my-1 filter-label fs-7'>Status</p>
							<Select
								native
								size='small'
								style={{ width: '100%' }}
								menuPortalTarget={document.body}
								isClearable={true}
								styles={{ menuPortal: (base: any) => ({ ...base, zIndex: 9999 }) }}
								options={CommonLookups('playerStatuses')}
								onChange={handleFilterPlayerStatusChange}
								value={filterPlayerStatus}
							/>
						</div>
						<div className='col-md-12 col-xs-12'>
							<p className='py-2 m-0 my-1 filter-label fs-7'>Mobile Number</p>
							<input
								type='text'
								className='form-control form-control-sm form-control-solid'
								value={filterMobileNumber}
								onChange={handleFilterMobileNumberChange}
							/>
						</div>
						<div className='col-md-12 col-xs-12'>
							<p className='py-2 m-0 my-1 filter-label fs-7'>Mobile Number Verification</p>
							<Select
								native
								size='small'
								style={{ width: '100%' }}
								menuPortalTarget={document.body}
								isClearable={true}
								styles={{ menuPortal: (base: any) => ({ ...base, zIndex: 9999 }) }}
								options={CommonLookups('mobileVerificationStatus')}
								onChange={handleFilterMobileVerificationChange}
								value={filterMobileVerificationStatus}
							/>
						</div>
						<div className='col-md-12 col-xs-12'>
							<p className='py-2 m-0 my-1 filter-label fs-7'>Deposited</p>
							<Select
								native
								isMulti
								size='small'
								style={{ width: '100%' }}
								menuPortalTarget={document.body}
								styles={{ menuPortal: (base: any) => ({ ...base, zIndex: 9999 }) }}
								options={YESNO_OPTIONS}
								onChange={handleFilterDepositedChange}
								value={filterDeposited}
							/>
						</div>
						<div className='col-md-12 col-xs-12'>
							<p className='py-2 m-0 my-1 filter-label fs-7'>Currency</p>
							<Select
								native
								isMulti
								size='small'
								style={{ width: '100%' }}
								menuPortalTarget={document.body}
								styles={{ menuPortal: (base: any) => ({ ...base, zIndex: 9999 }) }}
								options={currencyList}
								onChange={handleFilterCurrencyChange}
								value={filterCurrency}
							/>
						</div>
					</FilterAccordion>

					<FilterAccordion type={AccordionHeaderType.light} title='Call List' icon={<i className='bi bi-journal-text text-primary fs-3' />}>
						<div className='col-md-12 col-xs-12'>
							<p className='py-0 m-0 my-1 filter-label fs-7'>Marketing Source</p>
							<input
								type='text'
								className='form-control form-control-sm form-control-solid'
								value={filterMarketingSource}
								onChange={handleFilterMarketingSourceChange}
							/>
						</div>
						<div className='col-md-12 col-xs-12'>
							<p className='py-2 m-0 my-1 filter-label fs-7'>Registered Date</p>
							<DefaultDateRangePicker
								format={properFormatDateHourMinSec}
								maxDays={180}
								onChange={handleFilterRegisteredDateChange}
								value={filterRegisteredDate}
								customPlaceHolder={MLAB_FORMATS.dateTimePlaceholder}
							/>
						</div>
						<div className='col-md-12 col-xs-12'>
							<p className='py-2 m-0 my-1 filter-label fs-7'>Last Login Date</p>
							<DefaultDateRangePicker
								format={properFormatDateHourMinSec}
								maxDays={180}
								onChange={handleFilterLastLoginDateChange}
								value={filterLastLoginDate}
								customPlaceHolder={MLAB_FORMATS.dateTimePlaceholder}
							/>
						</div>
						<div className='col-md-12 col-xs-12'>
							<p className='py-2 m-0 my-1 filter-label fs-7'>FTD Amount From</p>
							<input
								type='text'
								className='form-control form-control-sm form-control-solid'
								value={filterFTDAmountFrom}
								onChange={handleFilterFTDAmountFromChange}
							/>
						</div>

						<div className='col-md-12 col-xs-12'>
							<p className='py-2 m-0 my-1 filter-label fs-7'>FTD Amount To</p>
							<input
								type='text'
								className='form-control form-control-sm form-control-solid'
								value={filterFTDAmountTo}
								onChange={handleFilterFTDAmountToChange}
							/>
						</div>

						<div className='col-md-12 col-xs-12'>
							<p className='py-2 m-0 my-1 filter-label fs-7'>FTD Date</p>
							<DefaultDateRangePicker
								format={properFormatDateHourMinSec}
								customPlaceHolder={MLAB_FORMATS.dateTimePlaceholder}
								maxDays={180}
								onChange={handleFilterFTDDateChange}
								value={filterFTDDate}
							/>
						</div>
						<div className='col-md-12 col-xs-12'>
							<p className='py-2 m-0 my-1 filter-label fs-7'>Initial Deposit Amount</p>
							<input
								type='number'
								className='form-control form-control-sm form-control-solid'
								value={filterInitialDepositAmount}
								onChange={handleFilterInitialDepositAmountChange}
							/>
						</div>

						<div className='col-md-12 col-xs-12'>
							<p className='py-2 m-0 my-1 filter-label fs-7'>Initial Deposit Date</p>
							<DefaultDateRangePicker
								format={properFormatDateHourMinSec}
								maxDays={180}
								onChange={handleFilterInitialDepositDateChange}
								value={filterInitialDepositDate}
								customPlaceHolder={MLAB_FORMATS.dateTimePlaceholder}
							/>
						</div>

						<div className='col-md-12 col-xs-12'>
							<p className='py-2 m-0 my-1 filter-label fs-7'>Initial Deposit Method</p>
							<Select
								native
								isMulti
								size='small'
								style={{ width: '100%' }}
								menuPortalTarget={document.body}
								styles={{ menuPortal: (base: any) => ({ ...base, zIndex: 9999 }) }}
								options={getSegmentLookup('PaymentMethod')}
								onChange={handleFilterInitialDepositMethodChange}
								value={filterInitialDepositMethod}
							/>
						</div>

						<div className='col-md-12 col-xs-12'>
							<p className='py-2 m-0 my-1 filter-label fs-7'>Initial Deposited</p>
							<Select
								native
								isMulti
								size='small'
								style={{ width: '100%' }}
								menuPortalTarget={document.body}
								styles={{ menuPortal: (base: any) => ({ ...base, zIndex: 9999 }) }}
								options={YESNO_OPTIONS}
								onChange={handleFilterInitialDepositedChange}
								value={filterInitialDeposited}
							/>
						</div>

						<div className='col-md-12 col-xs-12'>
							<p className='py-2 m-0 my-1 filter-label fs-7'>Message Status & Response</p>
							<Select
								native
								size='small'
								isMulti
								style={{ width: '100%' }}
								menuPortalTarget={document.body}
								styles={{ menuPortal: (base: any) => ({ ...base, zIndex: 9999 }) }}
								options={messageStatusResponseOptions}
								onChange={handleFilterMessageStatusResponseChange}
								value={filterMessageStatusResponse}
							/>
						</div>
						<div className='col-md-12 col-xs-12'>
							<p className='py-2 m-0 my-1 filter-label fs-7'>Tagged Date</p>
							<DefaultDateRangePicker
								format={properFormatDateHourMinSec}
								customPlaceHolder={MLAB_FORMATS.dateTimePlaceholder}
								maxDays={180}
								onChange={handleFilterTaggedDateChange}
								value={filterTaggedDate}
							/>
						</div>

						<div className='col-md-12 col-xs-12'>
							<p className='py-2 m-0 my-1 filter-label fs-7'>Call List Notes</p>
							<input
								type='text'
								className='form-control form-control-sm form-control-solid'
								value={filterCallListNotes}
								onChange={handleFilterCallListNotesChange}
							/>
						</div>
						<div className='col-md-12 col-xs-12'>
							<p className='py-2 m-0 my-1 filter-label fs-7'>Call Case Created Date</p>
							<DefaultDateRangePicker
								format={properFormatDateHourMinSec}
								maxDays={180}
								onChange={handleFilterCallCaseCreatedDateChange}
								value={filterCallCaseCreatedDate}
								customPlaceHolder={MLAB_FORMATS.dateTimePlaceholder}
							/>
						</div>

						<div className='col-md-12 col-xs-12'>
							<p className='py-2 m-0 my-1 filter-label fs-7'>Primary Goal Reached</p>
							<Select
								native
								isMulti
								size='small'
								style={{ width: '100%' }}
								menuPortalTarget={document.body}
								styles={{ menuPortal: (base: any) => ({ ...base, zIndex: 9999 }) }}
								options={YESNO_OPTIONS}
								onChange={handleFilterPrimaryGoalReachedChange}
								value={filterPrimaryGoalReached}
							/>
						</div>
						<div className='col-md-12 col-xs-12'>
							<p className='py-2 m-0 my-1 filter-label fs-7'>Primary Goal Count From</p>
							<input
								type='text'
								className='form-control form-control-sm form-control-solid'
								value={filterPrimaryGoalCountFrom}
								onChange={handleFilterPrimaryGoalCountFromChange}
							/>
						</div>

						<div className='col-md-12 col-xs-12'>
							<p className='py-2 m-0 my-1 filter-label fs-7'>Primary Goal Count To</p>
							<input
								type='text'
								className='form-control form-control-sm form-control-solid'
								value={filterPrimaryGoalCountTo}
								onChange={handleFilterPrimaryGoalCountToChange}
							/>
						</div>

						<div className='col-md-12 col-xs-12'>
							<p className='py-2 m-0 my-1 filter-label fs-7'>Primary Goal Amount From</p>
							<input
								type='text'
								className='form-control form-control-sm form-control-solid'
								value={filterPrimaryGoalAmountFrom}
								onChange={handleFilterPrimaryGoalAmountFromChange}
							/>
						</div>

						<div className='col-md-12 col-xs-12'>
							<p className='py-2 m-0 my-1 filter-label fs-7'>Primary Goal Amount To</p>
							<input
								type='text'
								className='form-control form-control-sm form-control-solid'
								value={filterPrimaryGoalAmountTo}
								onChange={handleFilterPrimaryGoalAmountToChange}
							/>
						</div>
					</FilterAccordion>
				</FormGroupContainer>
			</div>
		</div>
	);
};

import {Guid} from 'guid-typescript';
import { useContext, useEffect, useState} from 'react';
import {shallowEqual, useSelector} from 'react-redux';
import swal from 'sweetalert';
import {RootState} from '../../../../../setup';
import * as hubConnection from '../../../../../setup/hub/MessagingHub';
import {CaseStatusEnum, HttpStatusCodeEnum} from '../../../../constants/Constants';
import useConstant from '../../../../constants/useConstant';
import {ContentContainer, MainContainer} from '../../../../custom-components';
import {PaginationModel} from '../../../../shared-models/PaginationModel';
import {IAuthState} from '../../../auth';
import {USER_CLAIMS} from '../../../user-management/components/constants/UserClaims';
import {CaseCommunicationFilterListResponseModel} from '../../models/CaseCommunicationFilterListResponseModel';
import {CaseCommunicationFilterModel, ICaseCommunicationFilterModel} from '../../models/CaseCommunicationFilterModel';
import {CaseCommunicationFilterResponseModel} from '../../models/CaseCommunicationFilterResponseModel';
import {
	ExportCaseCommToCsv,
	changeCustomerServiceCaseCommStatus,
	changeCustomerServiceCaseCommStatusResult,
	getCaseCommunicationList,
	getCaseCommunicationListResult,
} from '../../services/CustomerCaseApi';
import CaseCommunicationFilter from './CaseCommunicationFilter';
import CaseCommunicationGrid from './CaseCommunicationGrid';
import { CaseCommunicationContext } from '../../context/CaseCommunicationContext';
import { useCaseManagementHooks } from '../../shared/hooks/useCaseManagementHooks';

export const CaseCommunicationList = () => {
	const {HubConnected, SwalConfirmMessage} = useConstant();

	const {userId} = useSelector<RootState>(({auth}) => auth, shallowEqual) as IAuthState;
	// GET REDUX STORE
	const userAccess = useSelector<RootState>(({auth}) => auth.access, shallowEqual) as string;
	const [loading, setLoading] = useState(false);
	const [caseCommunicationList, setCaseCommunicationList] = useState<CaseCommunicationFilterResponseModel>({
		caseCommunicationFilterList: [],
		recordCount: 0,
	});

	const [searchFilter, setSearchFilter] = useState<CaseCommunicationFilterModel>({
		brandId: 0,
		caseTypeIds: 0,
		messageTypeIds: '',
		vipLevelIds: '',
		dateByFrom: '',
		dateByTo: '',
		caseStatusIds: '',
		communicationOwners: '',
		externalId: '',
		playerIds: '',
		usernames: '',
		caseId: '',
		communicationId: '',
		duration: 0,
		campaignId: 0,
		communicationOwnerTeamId: 0,
		currencyIds: '',
		notes: '',
		subject: '',
		dateBy: 0,
		isLastSkillAbandonedQueue: '',
		isLastAgentAbandonedAssigned: ''
	});
	const [searchPagination, setSearchPagination] = useState<PaginationModel>({
		pageSize: 10,
		currentPage: 1,
		offsetValue: 0,
		sortOrder: 'DESC',
		sortColumn: 'createddate',
	});
	const [activeTab, setActiveTab] = useState(0);

	const NAV_ITEM_CLASSNAME = 'nav-item nav-link case-communication-nav-item';
	const [selectedCaseCommunication, setSelectedCaseCommunication] = useState<Array<CaseCommunicationFilterListResponseModel>>([]);
	const { getGridAndFilterDisplay } = useCaseManagementHooks()
	const { defaultColumns, defaultFilters } = useContext(CaseCommunicationContext)

	// Mounted
	useEffect(() => {
		if (userAccess.includes(USER_CLAIMS.SearchCaseCommunicationRead) === false) {
			//redirect to access denied page
			window.location.href = '/error/401';
		}
	}, []);

	useEffect(() => {
		if(defaultColumns.length > 0 && defaultFilters.filterDefault.length > 0) {
			getGridAndFilterDisplay(defaultFilters.filterDefault , defaultColumns , userId)
		}
	},[defaultColumns , defaultFilters])

	const setTab = (tabId: number) => {
		setActiveTab(tabId);
	};
	const clearFilters = () => {
		const filter: CaseCommunicationFilterModel = {
			brandId: 0,
			caseTypeIds: 0,
			messageTypeIds: '',
			vipLevelIds: '',
			dateByFrom: '',
			dateByTo: '',
			caseStatusIds: '',
			communicationOwners: '',
			externalId: '',
			playerIds: '',
			usernames: '',
			caseId: '',
			communicationId: '',
			duration: 0,
			campaignId: 0,
			communicationOwnerTeamId: 0,
			currencyIds: '',
			notes: '',
			subject: '',
			dateBy: 0,
			isLastSkillAbandonedQueue: '',
			isLastAgentAbandonedAssigned: ''
		};
		const pagination: PaginationModel = {pageSize: 10, currentPage: 1, offsetValue: 0, sortOrder: 'DESC', sortColumn: 'CreatedDate'};
		setSearchFilter(filter);
		setSearchPagination(pagination);
	};

	const exportToCSV = (filter: CaseCommunicationFilterModel) => {

		setLoading(true);
		const request: ICaseCommunicationFilterModel = {
			...filter,
			...searchPagination,
			queueId: Guid.create().toString(),
			userId: userId ? userId?.toString() : '',
		};
		ExportCaseCommToCsv(request)
			.then((response) => {
				const url = window.URL.createObjectURL(new Blob(['\ufeff', response.data]));
				const link = document.createElement('a');
				link.href = url;
				link.setAttribute('download', `CaseMgmt_SearchCaseResult.csv`);
				document.body.appendChild(link);
				link.click();
				setLoading(false);
			})
			.catch(() => {
				setLoading(false);
				swal('Failed', 'Problem in exporting list', 'error');
			});
	};
	const filterSearch = (filter: CaseCommunicationFilterModel) => {
		searchPagination.offsetValue = 0;
		searchPagination.currentPage = 1;
		const request: ICaseCommunicationFilterModel = {
			...filter,
			...searchPagination,
			offsetValue: 0,
			userId: userId ? userId?.toString() : '',
			queueId: Guid.create().toString(),
		};
		setSearchFilter(filter);
		searchCaseCommunication(request);
	};
	const paginationSearch = (pagination: PaginationModel) => {
		const request: ICaseCommunicationFilterModel = {
			...searchFilter,
			...pagination,
			offsetValue: (pagination.currentPage - 1) * pagination.pageSize,
			userId: userId ? userId?.toString() : '',
			queueId: Guid.create().toString(),
		};
		setSearchPagination(pagination);
		searchCaseCommunication(request);
	};
	const searchCaseCommunication = (request: ICaseCommunicationFilterModel) => {
		setLoading(true);
		setTimeout(() => {
			const messagingHub = hubConnection.createHubConnenction();
			messagingHub.start().then(() => {
				getCaseCommunicationList(request).then((response) => {
					if (response.status !== HttpStatusCodeEnum.Ok) {
						messagingHub.stop();
						return;
					}
					messagingHub.on(request.queueId.toString(), (message) => {
						getCaseCommunicationListResult(message.cacheId)
							.then((data) => {
								let resultData = Object.assign({} as CaseCommunicationFilterResponseModel, data.data);
								setCaseCommunicationList(resultData);
								messagingHub.off(request.queueId.toString());
								messagingHub.stop();
								setLoading(false);
							})
							.catch(() => {
								setLoading(false);
							});
					});
					setTimeout(() => {
						if (messagingHub.state === HubConnected) {
							messagingHub.stop();
						}
					}, 30000);
				});
			});
		}, 1000);
	};
	function rowSelectedCaseCommunication(selectedRows: Array<CaseCommunicationFilterListResponseModel>) {
		setSelectedCaseCommunication(selectedRows);
	}

	function reopenCase() {
		swal({
			title: SwalConfirmMessage.title,
			text: 'This action will change the status of the selected Closed case records to Open. Please confirm',
			icon: SwalConfirmMessage.icon,
			buttons: [SwalConfirmMessage.btnNo, SwalConfirmMessage.btnYes],
			dangerMode: true,
		}).then((willSave) => {
			if (willSave) {
				confirmReOpenCase();
			}
		});
	}
	function confirmReOpenCase() {
		setLoading(true);
		setTimeout(() => {
			const messagingHub = hubConnection.createHubConnenction();
			messagingHub.start().then(() => {
				if (messagingHub.state !== HubConnected) return;
				const request = updateCustomerServiceRequest();
				changeCustomerServiceCaseCommStatus(request).then((response) => {
					if (response.status !== HttpStatusCodeEnum.Ok) {
						messagingHub.stop();
						return;
					}
					changeCustomerServiceCaseCommStatusCallback(messagingHub, request);
					setTimeout(() => {
						if (messagingHub.state === HubConnected) {
							messagingHub.stop();
						}
					}, 30000);
				});
			});
		}, 1000);
	}

	function changeCustomerServiceCaseCommStatusCallback(
		messagingHub: any,
		request: {caseInformationIds: string; caseStatusId: CaseStatusEnum; userId: string; queueId: string}
	) {
		messagingHub.on(request.queueId.toString(), (message: any) => {
			changeCustomerServiceCaseCommStatusResult(message.cacheId)
				.then((data) => {
					messagingHub.off(request.queueId.toString());
					messagingHub.stop();
					setLoading(false);
					changeCustomerServiceSuccess();
				})
				.catch(() => {
					setLoading(false);
				});
		});
	}
	function changeCustomerServiceSuccess() {
		swal('Success', 'Transaction successfully submitted', 'success').then((onSuccess) => {
			if (onSuccess) {
				const request: ICaseCommunicationFilterModel = getFilterRequest();
				searchCaseCommunication(request);
				setSelectedCaseCommunication([]);
			}
		});
	}
	function updateCustomerServiceRequest() {
		return {
			caseInformationIds: getCaseInformationIds(),
			caseStatusId: CaseStatusEnum.Open,
			userId: getUserId(),
			queueId: Guid.create().toString(),
		};
	}
	function getFilterRequest(): ICaseCommunicationFilterModel {
		return {
			...searchFilter,
			...searchPagination,
			offsetValue: (searchPagination.currentPage - 1) * searchPagination.pageSize,
			userId: getUserId(),
			queueId: Guid.create().toString(),
		};
	}
	function getUserId() {
		return userId ? userId?.toString() : '';
	}
	function getCaseInformationIds() {
		return Object.assign(Array<CaseCommunicationFilterListResponseModel>(), selectedCaseCommunication)
			.map((el: any) => el.CaseInformatIonId)
			.join(',');
	}
	
	return (
		<MainContainer>
			<div
				className='card-header cursor-pointer'
				data-bs-toggle='collapse'
				data-bs-target='#kt_account_deactivate'
				aria-expanded='true'
				aria-controls='kt_account_deactivate'
			>
				<div className='card-title m-0'>
					<div className='nav  case-communication-nav'>
						<div
							className={activeTab === 0 ? 'case-tab-active ' + NAV_ITEM_CLASSNAME : NAV_ITEM_CLASSNAME}
							onClick={() => {
								setTab(0);
							}}
							onKeyDown={() => setTab(0)}
						>
							Search Case and Communication
						</div>
					</div>
				</div>
			</div>
			<ContentContainer>
				<CaseCommunicationFilter
					searchCaseCommunication={filterSearch}
					exportToCSV={exportToCSV}
					loading={loading}
					clearFilter={clearFilters}
					rowSelectedCaseCommunication={selectedCaseCommunication}
					reopenCaseCommunication={reopenCase}
				></CaseCommunicationFilter>
				<CaseCommunicationGrid
					loading={loading}
					searchFilter={searchFilter}
					searchCaseCommPagination={paginationSearch}
					caseCommunicationFilterResponse={caseCommunicationList}
					rowSelectedCaseCommunication={rowSelectedCaseCommunication}
				></CaseCommunicationGrid>
			</ContentContainer>
		</MainContainer>
	);
};

export default CaseCommunicationList;

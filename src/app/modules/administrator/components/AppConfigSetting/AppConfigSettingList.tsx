import {useState} from 'react';
import {Guid} from 'guid-typescript';
import {shallowEqual, useSelector} from 'react-redux';
import {RootState} from '../../../../../setup';
import {PaginationModel} from '../../../../common/model';
import {HttpStatusCodeEnum, pageMode, PROMPT_MESSAGES, StatusTypeEnum, ToggleTypeEnum} from '../../../../constants/Constants';
import * as hubConnection from '../../../../../setup/hub/MessagingHub';
import {ContentContainer, FormHeader, MainContainer} from '../../../../custom-components';
import {IAuthState} from '../../../auth';
import useConstant from '../../../../constants/useConstant';
import swal from 'sweetalert';
import {AppConfigSettingResponseModel} from '../../models/response/AppConfigSettingResponseModel';
import {AppConfigSettingFilterModel} from '../../models/AppConfigSettingFilterModel';
import {AppConfigSettingFilterRequestModel} from '../../models/request/AppConfigSettingFilterRequestModel';
import {getAppConfigSettingByFilter, getAppConfigSettingByFilterResult} from '../../redux/AdministratorService';
import {AppConfigSettingFilterResponseModel} from '../../models/response/AppConfigSettingFilterResponseModel';
import AppConfigSettingGrid from './AppConfigSettingGrid';
import AppConfigSettingFilter from './AppConfigSettingFilter';
import EditAppConfigSettingModal from './EditAppConfigSettingModal';

const AppConfigSettingList: React.FC = () => {
	const {HubConnected} = useConstant();
	const {access, userId} = useSelector<RootState>(({auth}) => auth, shallowEqual) as IAuthState;
	const [loading, setLoading] = useState(false);
	const [modalShow, setModalShow] = useState<boolean>(false);
	const [modalAction, setModalAction] = useState<string>('');
	const [appConfigSettingResponseModel, setAppConfigSettingResponseModel] = useState<AppConfigSettingResponseModel>({
		appConfigSettingId: 0,
		applicationId: 0,
		dataType: '',
		key: '',
		value: '',
		userId: 0,
	});

	const [appConfigSettingList, setAppConfigSettingList] = useState<AppConfigSettingFilterResponseModel>({
		recordCount: 0,
		appConfigSettingList: [],
	});

	const [searchFilter, setSearchFilter] = useState<AppConfigSettingFilterModel>({
		appConfigSettingId: 0,
		applicationId: 0,
		dataType: '',
		key: '',
		value: '',
	});

	const [searchPagination, setSearchPagination] = useState<PaginationModel>({
		pageSize: 10,
		currentPage: 1,
		recordCount: 1,
		sortOrder: 'DESC',
		sortColumn: 'ISNULL(st.UpdatedDate, st.CreatedDate)',
	});

	// Methods
	const search = (request: AppConfigSettingFilterRequestModel) => {
		setLoading(true);
		setTimeout(() => {
			const messagingHub = hubConnection.createHubConnenction();
			messagingHub.start().then(() => {
				getAppConfigSettingByFilter(request).then((response) => {
					if (response.status === HttpStatusCodeEnum.Ok) {
						messagingHub.on(request.queueId.toString(), (message) => {
							getAppConfigSettingByFilterResult(message.cacheId)
								.then((data) => {
									let resultData = Object.assign({} as AppConfigSettingFilterResponseModel, data.data);
									setAppConfigSettingList(resultData);
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
					} else {
						messagingHub.stop();
					}
				});
			});
		}, 1000);
	};

	const filterSearch = (filter: AppConfigSettingFilterModel) => {
		const request: AppConfigSettingFilterRequestModel = {
			...filter,
			...searchPagination,
			offsetValue: (searchPagination.currentPage - 1) * searchPagination.pageSize,
			userId: userId ? userId?.toString() : '',
			queueId: Guid.create().toString(),
		};
		setSearchFilter(filter);
		search(request);
	};

	const paginationSearch = (pagination: PaginationModel) => {
		const request: AppConfigSettingFilterRequestModel = {
			...searchFilter,
			...pagination,
			offsetValue: (pagination.currentPage - 1) * pagination.pageSize,
			userId: userId ? userId?.toString() : '',
			queueId: Guid.create().toString(),
		};
		setSearchPagination(pagination);
		search(request);
	};

	const defaultSearch = () => {
		const request: AppConfigSettingFilterRequestModel = {
			...searchFilter,
			...searchPagination,
			offsetValue: (searchPagination.currentPage - 1) * searchPagination.pageSize,
			userId: userId ? userId?.toString() : '',
			queueId: Guid.create().toString(),
		};
		search(request);
	};

	const clearFilters = () => {
		setSearchFilter({
			appConfigSettingId: 0,
			applicationId: 0,
			dataType: '',
			key: '',
			value: '',
		});

		setSearchPagination({
			pageSize: 10,
			currentPage: 1,
			recordCount: 1,
			sortOrder: 'DESC',
			sortColumn: 'ISNULL(st.UpdatedDate, st.CreatedDate)',
		});
	};

	const addSkill = () => {
		setModalAction(pageMode.create);
		setModalShow(true);
	};

	const closeModal = () => setModalShow(false);
	const closeModalAndSearch = () => {
		setModalShow(false);
		defaultSearch();
	};

	const editSkill = (item: any) => {
		setModalAction(pageMode.edit);
		setAppConfigSettingResponseModel(item);
		setModalShow(true);
	};

	return (
		<MainContainer>
			<FormHeader headerLabel={'Search App Config Setting'} />
			<ContentContainer>
				<AppConfigSettingFilter loading={loading} searchAppConfigSetting={filterSearch} clearFilter={clearFilters} />
				<AppConfigSettingGrid
					loading={loading}
					editAppConfigSetting={editSkill}
					searchAppConfigSetting={paginationSearch}
					appConfigSettingResponse={appConfigSettingList}
				/>
				<EditAppConfigSettingModal
					showForm={modalShow}
					closeModal={closeModal}
					closeModalAndSearch={closeModalAndSearch}
					modalAction={modalAction}
					appConfigSettingResponseModel={appConfigSettingResponseModel}
				></EditAppConfigSettingModal>
			</ContentContainer>
		</MainContainer>
	);
};

export default AppConfigSettingList;

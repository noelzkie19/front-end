import {Guid} from 'guid-typescript';
import {useState} from 'react';
import {shallowEqual, useSelector} from 'react-redux';
import swal from 'sweetalert';
import {RootState} from '../../../../../setup';
import * as hubConnection from '../../../../../setup/hub/MessagingHub';
import {PaginationModel} from '../../../../common/model';
import {HttpStatusCodeEnum, PROMPT_MESSAGES, StatusTypeEnum, pageMode} from '../../../../constants/Constants';
import useConstant from '../../../../constants/useConstant';
import {ContentContainer, FormHeader, MainContainer} from '../../../../custom-components';
import {IAuthState} from '../../../auth';
import {SkillFilterModel, SkillFilterRequestModel, SkillFilterResponseModel, SkillToggleRequestModel} from '../../models';
import {getSkillByFilter, getSkillByFilterResult, toggleSkill} from '../../redux/SystemService';
import AddEditSkillModal from './AddEditSkillModal';
import SkillFilter from './SkillFilter';
import SkillGrid from './SkillGrid';

const SkillList: React.FC = () => {
	const {HubConnected, SwalConfirmMessage} = useConstant();
	const {access, userId} = useSelector<RootState>(({auth}) => auth, shallowEqual) as IAuthState;
	const [loading, setLoading] = useState(false);
	const [modalShow, setModalShow] = useState<boolean>(false);
	const [modalAction, setModalAction] = useState<string>('');
	const [skillModelResponse, setSkillModelResponse] = useState<any>(undefined);

	const [skillList, setSkillList] = useState<SkillFilterResponseModel>({
		skillList: [],
		recordCount: 0,
	});

	const [searchFilter, setSearchFilter] = useState<SkillFilterModel>({
		brandId: undefined,
		messageTypeIds: '',
		isActive: undefined,
		licenseId: '',
		skillId: '',
		skillName: '',
	});

	const [searchPagination, setSearchPagination] = useState<PaginationModel>({
		pageSize: 10,
		currentPage: 1,
		recordCount: 1,
		sortOrder: 'DESC',
		sortColumn: 'ISNULL(st.UpdatedDate, st.CreatedDate)',
	});

	// Methods
	const searchSkill = (request: SkillFilterRequestModel) => {
		setLoading(true);
		setTimeout(() => {
			const messagingHub = hubConnection.createHubConnenction();
			messagingHub.start().then(() => {
				getSkillByFilter(request).then((response) => {
					if (response.status === HttpStatusCodeEnum.Ok) {
						messagingHub.on(request.queueId.toString(), (message) => {
							getSkillByFilterResult(message.cacheId)
								.then((data) => {
									let resultData = Object.assign({} as SkillFilterResponseModel, data.data);
									setSkillList(resultData);
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

	const filterSearch = (filter: SkillFilterModel) => {
		const request: SkillFilterRequestModel = {
			...filter,
			...searchPagination,
			offsetValue: (searchPagination.currentPage - 1) * searchPagination.pageSize,
			userId: userId ? userId?.toString() : '',
			queueId: Guid.create().toString(),
		};
		setSearchFilter(filter);
		searchSkill(request);
	};

	const paginationSearch = (pagination: PaginationModel) => {
		const request: SkillFilterRequestModel = {
			...searchFilter,
			...pagination,
			offsetValue: (pagination.currentPage - 1) * pagination.pageSize,
			userId: userId ? userId?.toString() : '',
			queueId: Guid.create().toString(),
		};
		setSearchPagination(pagination);
		searchSkill(request);
	};

	const defaultSearch = () => {
		const request: SkillFilterRequestModel = {
			...searchFilter,
			...searchPagination,
			offsetValue: (searchPagination.currentPage - 1) * searchPagination.pageSize,
			userId: userId ? userId?.toString() : '',
			queueId: Guid.create().toString(),
		};
		searchSkill(request);
	};

	const clearFilters = () => {
		setSearchFilter({
			brandId: undefined,
			messageTypeIds: '',
			isActive: undefined,
			licenseId: '',
			skillId: '',
			skillName: '',
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
		setSkillModelResponse(item);
		setModalShow(true);
	};

	const handleToggleSkill = (item: any) => {
		swal({
			title: PROMPT_MESSAGES.ConfirmCloseTitle,
			text: PROMPT_MESSAGES.ConfirmDeactivateActivateMessage(item.isActive ? StatusTypeEnum.Inactive : StatusTypeEnum.Active),
			icon: 'warning',
			buttons: {
				cancel: {
					text: SwalConfirmMessage.btnNo,
					value: null,
					visible: true,
				},confirm: {
					text: SwalConfirmMessage.btnYes,
					value: true,
					visible: true,
				},
			},
			dangerMode: true,
		}).then(async (confirmRemoveRemProfile) => {
			if (confirmRemoveRemProfile) {
				const request: SkillToggleRequestModel = {
					id: item.id,
					isActive: !item.isActive,
				};

				await toggleSkill(request).then((response) => {
					if (response.status === HttpStatusCodeEnum.Ok) {
						swal(PROMPT_MESSAGES.SuccessTitle, 'Skill successfully updated!', 'success');
						defaultSearch();
					} else {
						swal(PROMPT_MESSAGES.FailedValidationTitle, 'Error updating Skill', 'error');
					}
				});
			}
		});
	};

	return (
		<MainContainer>
			<FormHeader headerLabel={'Search Skill'} />
			<ContentContainer>
				<SkillFilter loading={loading} addNewSkill={addSkill} searchSkill={filterSearch} clearFilter={clearFilters} />
				<SkillGrid loading={loading} editSkill={editSkill} searchSkill={paginationSearch} skillResponse={skillList} toggleSkill={handleToggleSkill} />
				<AddEditSkillModal
					showForm={modalShow}
					closeModal={closeModal}
					closeModalAndSearch={closeModalAndSearch}
					modalAction={modalAction}
					skillModelResponse={skillModelResponse}
				></AddEditSkillModal>
			</ContentContainer>
		</MainContainer>
	);
};

export default SkillList;

import {Guid} from 'guid-typescript';
import {useState} from 'react';
import {shallowEqual, useSelector} from 'react-redux';
import swal from 'sweetalert';
import {RootState} from '../../../../../setup';
import * as hubConnection from '../../../../../setup/hub/MessagingHub';
import {PaginationModel} from '../../../../common/model';
import {HttpStatusCodeEnum, PROMPT_MESSAGES, StatusTypeEnum} from '../../../../constants/Constants';
import useConstant from '../../../../constants/useConstant';
import {ContentContainer, FormHeader, MainContainer} from '../../../../custom-components';
import {IAuthState} from '../../../auth';
import {PostChatSurveyFilterModel, PostChatSurveyFilterRequestModel, PostChatSurveyFilterResponseModel, PostChatSurveyToggleRequestModel} from '../../models';
import {getPostChatSurveyByFilter, getPostChatSurveyByFilterResult, togglePostChatSurvey} from '../../redux/SystemService';
import PostChatSurveyFilter from './PostChatSurveyFilter';
import PostChatSurveyGrid from './PostChatSurveyGrid';
import AddPostChatSurvey from './modals/AddPostChatSurveyModal';
import EditPostChatSurvey from './modals/EditPostChatSurveyModal';
import ViewPostChatSurvey from './modals/ViewPostChatSurveyModal';

const PostChatSurveyList: React.FC = () => {
	const {HubConnected, SwalConfirmMessage} = useConstant();
	const { userId} = useSelector<RootState>(({auth}) => auth, shallowEqual) as IAuthState;
	const [loading, setLoading] = useState(false);
	const [postChatSurveyId, setPostChatSurveyId] = useState<number>(0);
	const [postChatSurveyList, setPostChatSurveyList] = useState<PostChatSurveyFilterResponseModel>({
		postChatSurveyList: [],
		recordCount: 0,
	});
	const [searchFilter, setSearchFilter] = useState<PostChatSurveyFilterModel>({
		brandId: undefined,
		messageTypeId: undefined,
		licenseId: '',
		skillIds: '',
		questionId: '',
		questionMessage: '',
		questionMessageEN: '',
		surveyId: '',
		status: undefined
	});
	const [searchPagination, setSearchPagination] = useState<PaginationModel>({
		pageSize: 10,
		currentPage: 1,
		recordCount: 1,
		sortOrder: 'DESC',
		sortColumn: 'ISNULL(pcs.UpdatedDate, pcs.CreatedDate)',
	});
	const [addModalShow, setAddModalShow] = useState<boolean>(false);
	const [editModalShow, setEditModalShow] = useState<boolean>(false);
	const [viewModalShow, setViewModalShow] = useState<boolean>(false);

	// Methods
	const searchPostChatSurvey = (request: PostChatSurveyFilterRequestModel) => {
		setLoading(true);
		setTimeout(() => {
			const messagingHub = hubConnection.createHubConnenction();
			messagingHub.start().then(() => {
				getPostChatSurveyByFilter(request).then((response) => {
					if (response.status === HttpStatusCodeEnum.Ok) {
						messagingHub.on(request.queueId.toString(), (message) => {
							getPostChatSurveyByFilterResult(message.cacheId)
								.then((data) => {
									let resultData = Object.assign({} as PostChatSurveyFilterResponseModel, data.data);
									setPostChatSurveyList(resultData);
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

	const filterSearch = (filter: PostChatSurveyFilterModel) => {
		const request: PostChatSurveyFilterRequestModel = {
			...filter,
			...searchPagination,
			offsetValue: (searchPagination.currentPage - 1) * searchPagination.pageSize,
			userId: userId ? userId?.toString() : '',
			queueId: Guid.create().toString(),
		};
		setSearchFilter(filter);
		searchPostChatSurvey(request);
	};

	const paginationSearch = (pagination: PaginationModel) => {
		const request: PostChatSurveyFilterRequestModel = {
			...searchFilter,
			...pagination,
			offsetValue: (pagination.currentPage - 1) * pagination.pageSize,
			userId: userId ? userId?.toString() : '',
			queueId: Guid.create().toString(),
		};
		setSearchPagination(pagination);
		searchPostChatSurvey(request);
	};

	const defaultSearch = () => {
		const request: PostChatSurveyFilterRequestModel = {
			...searchFilter,
			...searchPagination,
			offsetValue: (searchPagination.currentPage - 1) * searchPagination.pageSize,
			userId: userId ? userId?.toString() : '',
			queueId: Guid.create().toString(),
		};
		searchPostChatSurvey(request);
	}

	const clearFilters = () => {
		const filter: PostChatSurveyFilterModel = {
			brandId: undefined,
			messageTypeId: undefined,
			licenseId: '',
			skillIds: '',
			questionId: '',
			questionMessage: '',
			questionMessageEN: '',
			surveyId: '',
			status: undefined
		};
		const pagination: PaginationModel = {pageSize: 10, currentPage: 1, recordCount: 1, sortOrder: 'DESC', sortColumn: 'ISNULL(pcs.UpdatedDate, pcs.CreatedDate)'};
		setSearchFilter(filter);
		setSearchPagination(pagination);
	};

	const addPostChatSurvey = () => {
		setAddModalShow(true);
		setEditModalShow(false);
		setViewModalShow(false);
	};

	const editPostChatSurvey = (postChatSurveyId: any) => {
		setPostChatSurveyId(postChatSurveyId);
		setAddModalShow(false);
		setViewModalShow(false);
		setEditModalShow(true);
	};

	
	const viewPostChatSurvey = (item: any) => {
		setPostChatSurveyId(item.postChatSurveyId);
		setAddModalShow(false);
		setEditModalShow(false);
		setViewModalShow(true);
	}

	const handleTogglePostChatSurvey = (item: any) => {
		swal({
			title: PROMPT_MESSAGES.ConfirmCloseTitle,
			text: PROMPT_MESSAGES.ConfirmDeactivateActivateMessage((item.isActive ? StatusTypeEnum.Inactive : StatusTypeEnum.Active)),
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
				const request: PostChatSurveyToggleRequestModel = {
					postChatSurveyId: item.postChatSurveyId,
					isActive: !item.isActive
				};

				await togglePostChatSurvey(request).then((response) => {
					if (response.status === HttpStatusCodeEnum.Ok) {
						swal(PROMPT_MESSAGES.SuccessTitle, 'Post Chat Survey successfully updated!', 'success');
						defaultSearch();
					} else {
						swal(PROMPT_MESSAGES.FailedValidationTitle, 'Error updating Post Chat Survey', 'error');
					}
				});
			}
		});
	}

	const closeModalAndSearch = () => {
		setAddModalShow(false);
		setEditModalShow(false);
		setViewModalShow(false);
		defaultSearch();
	};

	const closeAddModal = () => setAddModalShow(false);
	const closeEditModal = () => setEditModalShow(false);
	const closeViewModal = () => setViewModalShow(false);

	return (
		<MainContainer>
			<FormHeader headerLabel={'Search PCS'} />
			<ContentContainer>
				<PostChatSurveyFilter
					loading={loading}
					addNewPostChatSurvey={addPostChatSurvey}
					clearFilter={clearFilters}
					searchPostChatSurvey={filterSearch}
				/>
				<PostChatSurveyGrid
					loading={loading}
					editPostChatSurvey={editPostChatSurvey}
					postChatSurveyResponse={postChatSurveyList}
					searchPostChatSurvey={paginationSearch}
					togglePostChatSurvey={handleTogglePostChatSurvey}
					viewPostChatSurvey={viewPostChatSurvey}
				/>

				<AddPostChatSurvey showForm={addModalShow} closeModal={closeAddModal} closeModalAndSearch={closeModalAndSearch}/>
				<EditPostChatSurvey showForm={editModalShow} closeModal={closeEditModal} closeModalAndSearch={closeModalAndSearch} postChatSurveyId={postChatSurveyId}/>
				<ViewPostChatSurvey showForm={viewModalShow} closeModal={closeViewModal} postChatSurveyId={postChatSurveyId}  />
			</ContentContainer>
		</MainContainer>
	);
};

export default PostChatSurveyList;
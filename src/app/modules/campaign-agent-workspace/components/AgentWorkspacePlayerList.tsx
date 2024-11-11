import { AgGridReact } from 'ag-grid-react';
import { Guid } from 'guid-typescript';
import { useEffect, useRef, useState } from 'react';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import swal from 'sweetalert';
import { RootState } from '../../../../setup';
import gridOverlayTemplate from '../../../common-template/gridTemplates';
import { SetGridCustomDisplayAsync } from '../../../common/services/userGridCustomDisplay';
import {
	AgentWorkspaceTaggingActionsEnum,
	AgentWorkspaceTaggingTitleEnum,
	CampaignStatusEnum,
	CaseStatusEnum,
	CommunicationTypeEnum,
	ElementStyle,
	GenericStringContantsEnum,
	HttpStatusCodeEnum,
	PROMPT_MESSAGES,
} from '../../../constants/Constants';
import { ButtonsContainer, DefaultTableButton, FormGroupContainer, MainContainer, MlabBadge, MlabButton } from '../../../custom-components';
import DefaultGridPagination from '../../../custom-components/grid-pagination/DefaultGridPagination';

import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import useConstant from '../../../constants/useConstant';
import { formatDate } from '../../../custom-functions/helper/dateHelper';
import useFnsDateFormatter from '../../../custom-functions/helper/useFnsDateFormatter';
import { USER_CLAIMS } from '../../user-management/components/constants/UserClaims';
import {
	CallListNoteRequestModel,
	CallListNoteResponseModel,
	CallListNoteResponseModelFactory,
	CampaignPlayerFilterResponseModel,
	CampaignPlayerResponseModel,
	DiscardPlayerRequestModel,
	TagAgentModel,
	TagAgentRequestModel,
} from '../models';
import { ValidateTagAgentModel } from '../models/request/ValidateTagAgentModel';
import { ValidateTagAgentRequestmodel } from '../models/request/ValidateTagAgentRequestModel';
import * as agentWorkspaceManagement from '../redux/AgentWorkspaceRedux';
import { discardPlayer, saveCallListNote, tagAgent, validateTagAgent } from '../redux/AgentWorkspaceService';
import { AgentWorkspaceRulesService } from '../services/AgentWorkspaceRulesService';
import { CallListNoteModal } from './CallListNoteModal';
import CommunicationHistoryModal from './CommunicationHistoryModal';
import DepositAtteptsModal from './DepositAtteptsModal';
import { TagCallListModal } from './TagCallListModal';
import useAgentWorkspaceConstants from '../constants/useAgentWorkspaceConstants';

type WorkspacePlayerListProps = {
	toggleFilter: () => void;
};
export const AgentWorkspacePlayerList = (props: WorkspacePlayerListProps) => {
	// States
	const dispatch = useDispatch();
	const [gridApi, setGridApi] = useState<any>();
	const [callListNoteModal, setCallListNoteModal] = useState(false);
	const [tagCallListModal, setTagCallListModal] = useState(false);
	const [depositAttemptsModal, setDepositAttemptsModal] = useState(false);
	const [selectedRows, setSelectedRows] = useState<Array<any>>([]);
	const [action, setAction] = useState('');
	const [singleCallListId, setSingleCallListId] = useState(0);
	const [tagModalTitle, setTagModalTitle] = useState('Tag');
	const [lastTaggedDate, setLastTaggedDate] = useState('');
	const [taggedAgent, setTaggedAgent] = useState<number | undefined>();
	const [gridHeight, setGridHeight] = useState<number>(800);
	const [callListIdDeposits, setCallListIdDeposits] = useState<number>(0);
	const [communicationHistoryModal, setCommunicationHistoryModal] = useState(false);
	const [selectedPlayerIdForCommHistoryModal, setSelectedPlayerIdForCommHistoryModal] = useState<string>('0');
	const [selectedCampaignIdForCommHistoryModal, setSelectedCampaignIdForCommHistoryModal] = useState<number>(0);
	const [selectedBrandNameForCommHistoryModal, setSelectedBrandNameForCommHistoryModal] = useState<string>('');

	const userId = useSelector<RootState>(({ auth }) => auth.userId, shallowEqual) as number;
	const userAccess = useSelector<RootState>(({ auth }) => auth.access, shallowEqual) as string;
	const filterResponseState = useSelector<RootState>(
		({ agentWorkspace }) => agentWorkspace.filterResponse,
		shallowEqual
	) as CampaignPlayerFilterResponseModel;
	const filterLoading = useSelector<RootState>(({ agentWorkspace }) => agentWorkspace.loading, shallowEqual) as boolean;
	const pageSize = useSelector<RootState>(({ agentWorkspace }) => agentWorkspace.pageSize, shallowEqual) as number;
	const currentPage = useSelector<RootState>(({ agentWorkspace }) => agentWorkspace.currentPage, shallowEqual) as number;
	const currentUser = useSelector<RootState>(({ agentWorkspace }) => agentWorkspace.currentUser, shallowEqual) as string;

	const [callListNote, setCallListNote] = useState<CallListNoteResponseModel>(CallListNoteResponseModelFactory());

	const [batchTag, setBatchTag] = useState(true);
	const [batchReTag, setBatchReTag] = useState(true);
	const [batchTagToMe, setBatchTagToMe] = useState(true);
	const [batchDiscard, setBatchDiscard] = useState(true);

	const [columnDefs, setColumnDefs] = useState<Array<any>>([]);
	const gridRef: any = useRef();
	const agentWorkspaceRules = new AgentWorkspaceRulesService();
	const { mlabFormatDate } = useFnsDateFormatter();
	const { SwalConfirmMessage, SwalFailedMessage } = useConstant();
	const { CAMPAIGN_STATUS, LABELS, AGENT_WORKSPACE_MODULE, MESSAGES } = useAgentWorkspaceConstants();


	// Watchers
	useEffect(() => {
		loadUserGridCustomDisplay();

		return () => {
			setSelectedRows([]);
			setAction('');
			setSingleCallListId(0);
			dispatch(agentWorkspaceManagement.actions.setFilterResponse({ campaignPlayers: [], recordCount: 0 }));
		};
	}, []);

	useEffect(() => {
		setTimeout(() => {
			if (filterLoading) gridRef.current.api.showLoadingOverlay();
			else gridRef.current.api.hideOverlay();
		}, 10);
	}, [filterLoading]);

	useEffect(() => {
		setBatchTag(true);
		setBatchReTag(true);
		setBatchTagToMe(true);
		setBatchDiscard(true);

		// Individual Batch Action Conditions
		if (selectedRows.length > 1) {
			selectedRows.forEach((item) => {
				// RETAG VALIDATION
				setBatchReTag(agentWorkspaceRules.retagRule(item));
				// TAG VALIDATION
				setBatchTag(agentWorkspaceRules.tagRule(item));
				// TAGTOME VALIDATION
				setBatchTagToMe(agentWorkspaceRules.tagtomeRule(item));
				// DISCARD VALIDATION
				setBatchDiscard(item.campaignStatusId !== CampaignStatusEnum.Completed);
			});
		}
	}, [selectedRows]);

	// Event Methods
	const loadUserGridCustomDisplay = async () => {
		const gridColumns = await SetGridCustomDisplayAsync(defaultColumns, userId);
		setColumnDefs(gridColumns.defaultColumns);
	};

	const onUpdateGridCustomDisplay = async () => {
		gridRef.current.api.showLoadingOverlay();
	};

	const onSubmitGridCustomDisplay = async () => {
		await loadUserGridCustomDisplay();
		gridRef.current.api.hideOverlay();
	};

	const onPageSizeChanged = () => {
		const rowData = filterResponseState.campaignPlayers;
		const value: string = (document.getElementById('page-size') as HTMLInputElement).value;
		dispatch(agentWorkspaceManagement.actions.setPageSize(Number(value)));
		dispatch(agentWorkspaceManagement.actions.setCurrentPage(1));

		if (rowData != undefined && rowData.length > 0) {
			loadPlayerList();
		}

		switch (Number(value)) {
			case AGENT_WORKSPACE_MODULE.SmallestPageSize:
				setGridHeight(600);
				break;
			case AGENT_WORKSPACE_MODULE.DefaultPageSize:
				setGridHeight(800);
				break;
			default:
				setGridHeight(1000);
				break;
		}
	};

	const onClickFirst = () => {
		if (currentPage > 1) {
			dispatch(agentWorkspaceManagement.actions.setCurrentPage(1));
			loadPlayerList();
		}
	};

	const onClickPrevious = () => {
		if (currentPage > 1) {
			dispatch(agentWorkspaceManagement.actions.setCurrentPage(currentPage - 1));
			loadPlayerList();
		}
	};

	const onClickNext = () => {
		if (totalPage() > currentPage) {
			dispatch(agentWorkspaceManagement.actions.setCurrentPage(currentPage + 1));
			loadPlayerList();
		}
	};

	const onClickLast = () => {
		if (totalPage() > currentPage) {
			dispatch(agentWorkspaceManagement.actions.setCurrentPage(totalPage()));
			loadPlayerList();
		}
	};

	const totalPage = () => {
		return Math.ceil(filterResponseState.recordCount / pageSize) | 0;
	};

	const onSort = async (e: any) => {
		await dispatch(agentWorkspaceManagement.actions.setCurrentPage(1));
		if (filterResponseState.campaignPlayers && filterResponseState.campaignPlayers.length > 0) {
			const sortDetail = e.api.getSortModel();
			if (sortDetail[0] != undefined) {
				dispatch(agentWorkspaceManagement.actions.setSortColumn(sortDetail[0]?.colId));
				dispatch(agentWorkspaceManagement.actions.setSortOrder(sortDetail[0]?.sort));
				loadPlayerList();
			} else {
				dispatch(agentWorkspaceManagement.actions.setSortColumn('registeredDate'));
				dispatch(agentWorkspaceManagement.actions.setSortOrder('desc'));
				loadPlayerList();
			}
		}
	};

	const loadPlayerList = () => {
		gridRef.current.api.showLoadingOverlay();
		dispatch(agentWorkspaceManagement.actions.loadList(Guid.create().toString()));
	};

	const onGridReady = (params: any) => {
		setGridApi(params.api);
		params.api.applyColumnState({
			state: [{ colId: 'campaignName' }, { colId: 'username' }, { colId: 'brand' }],
			applyOrder: true,
		});
		gridRef.current.api.hideOverlay();
	};

	const onSelectionChanged = () => {
		const currentSelection = gridApi?.getSelectedRows();
		setSelectedRows(currentSelection);
	};

	const handleToggleFilter = () => {
		props.toggleFilter();
	};

	const handleToggleCallListNoteModal = () => {
		setCallListNoteModal(!callListNoteModal);
	};

	const handleShowDepositAttemptsModal = (callListId: number) => {
		setCallListIdDeposits(callListId);
		toggleDepositAttemptsModal();
	};

	const handleShowCommunicationHistoryModal = () => {
		toggleCommunicationHistoryModal();
	};
	const toggleDepositAttemptsModal = () => {
		setDepositAttemptsModal(!depositAttemptsModal);
	};

	const toggleCommunicationHistoryModal = () => {
		setCommunicationHistoryModal(!communicationHistoryModal)
	};

	// Methods
	const addEditCallListNote = (param: any) => {
		let noteInfo = CallListNoteResponseModelFactory();
		if (param && param.callListNoteId > 0) {
			noteInfo.callListNoteId = param.callListNoteId;
		} else {
			noteInfo.campaignPlayerId = param.callListId;
		}
		setCallListNote(noteInfo);
		handleToggleCallListNoteModal();
	};

	const handleToggleCallListNoteSubmit = async (note: CallListNoteRequestModel) => {
		dispatch(agentWorkspaceManagement.actions.setLoading(true));
		handleToggleCallListNoteModal();

		await saveCallListNote(note)
			.then((response: { status: number }) => {
				if (response.status === HttpStatusCodeEnum.Ok) {
					swal(PROMPT_MESSAGES.SuccessTitle, 'Call List Note succesfully saved!', 'success');
					loadPlayerList();
				}
				dispatch(agentWorkspaceManagement.actions.setLoading(false));
			})
			.catch(() => {
				console.log('Problem in saving call list note');
				dispatch(agentWorkspaceManagement.actions.setLoading(false));
			});
	};

	const validateBatchSelection = () => {
		let isValid = true;

		//Find if there are any players that belongs to a completed campaign
		const completedCampaigns = selectedRows.find((item) => item.campaignStatusId === CAMPAIGN_STATUS.Completed);
		if (completedCampaigns) {
			return false;
		}

		return isValid;
	};

	const handleWorkspaceAction = (action: string, data?: CampaignPlayerResponseModel) => {
		setAction(action);
		let callListId = data ? Number(data.callListId) : 0;
		switch (action) {
			case AgentWorkspaceTaggingActionsEnum.Tag:
				tagNormal('Tag');
				break;
			case AgentWorkspaceTaggingActionsEnum.Retag:
				tagNormal('ReTag');
				break;
			case AgentWorkspaceTaggingActionsEnum.TagToMe:
				handleTagToMeAction(undefined, action, data);
				break;
			case AgentWorkspaceTaggingActionsEnum.Dump:
				handleDiscardAction();
				break;
			case AgentWorkspaceTaggingActionsEnum.TagSingle:
				tagSingle(AgentWorkspaceTaggingTitleEnum.Tag, data);
				break;
			case AgentWorkspaceTaggingActionsEnum.RetagSingle:
				tagSingle(AgentWorkspaceTaggingTitleEnum.ReTag, data);
				break;
			case AgentWorkspaceTaggingActionsEnum.TagToMeSingle:
				setSingleCallListId(callListId);
				handleTagToMeAction(callListId, action, data);
				break;
			case AgentWorkspaceTaggingActionsEnum.Discard:
				setSingleCallListId(data ? Number(callListId) : 0);
				handleDiscardAction(callListId);
				break;
			default:
				break;
		}
	};

	const tagNormal = (modalTitle: string) => {
		setTagModalTitle(modalTitle);
		setLastTaggedDate('');
		setTaggedAgent(undefined);
		toggleAgentTaggingModal();
	};

	const tagSingle = (modalTitle: any, data?: CampaignPlayerResponseModel) => {
		setTagModalTitle(modalTitle);
		setLastTaggedDate(data ? data.taggedDate : '');
		setTaggedAgent(data ? data.agentId : undefined);
		setSingleCallListId(data ? Number(data.callListId) : 0);
		toggleAgentTaggingModal();
	};

	const onHideModal = () => {
		swal({
			title: PROMPT_MESSAGES.ConfirmCloseTitle,
			text: PROMPT_MESSAGES.ConfirmCloseMessage,
			icon: 'warning',
			buttons: {
				cancel: {
					text: SwalConfirmMessage.btnNo,
					value: null,
					visible: true,
				},
				confirm: {
					text: SwalConfirmMessage.btnYes,
					value: true,
					visible: true,
				},
			},
			dangerMode: true,
		}).then((confirmDiscardChanges) => {
			if (confirmDiscardChanges) {
				setTagCallListModal(!tagCallListModal);
			}
		});
	};
	const toggleAgentTaggingModal = () => {
		setTagCallListModal(!tagCallListModal);
	};

	const handleToggleTagCallListSubmit = async (agent: any) => {
		swal({
			title: PROMPT_MESSAGES.ConfirmCloseTitle,
			text: PROMPT_MESSAGES.ConfirmToggleRecordCallList(tagModalTitle),
			icon: 'warning',
			buttons: {
				cancel: {
					text: SwalConfirmMessage.btnNo,
					value: null,
					visible: true,
				},
				confirm: {
					text: SwalConfirmMessage.btnYes,
					value: true,
					visible: true,
				},
			},
			dangerMode: true,
		}).then(async (confirmTagCallList) => {
			if (confirmTagCallList) {
				let request: TagAgentRequestModel = {
					tagList: selectedRows.map((i) => {
						const tagItem: TagAgentModel = {
							campaignPlayerId: i.callListId,
							agentId: agent.value,
							userId: currentUser,
						};
						return tagItem;
					}),
				};

				if (action === 'tag-single' || action === 'retag-single') {
					request.tagList = [
						{
							campaignPlayerId: singleCallListId,
							agentId: agent.value,
							userId: currentUser,
						},
					];
				}

				await submitTagAgent(request);
			}
		});
	};

	const validateAgentTagging = async (request: TagAgentRequestModel) => {
		let requestDatas = Array<ValidateTagAgentModel>();
		let isLeader: number = 0;

		if (userAccess.includes(USER_CLAIMS.ViewAllPlayersWrite) === true) {
			isLeader = 1;
		}

		request.tagList.forEach((item: TagAgentModel) => {
			const x: ValidateTagAgentModel = {
				campaignPlayerId: item.campaignPlayerId,
				userId: userId,
				isLeader: isLeader,
			};
			requestDatas.push(x);
		});

		const validateRequest: ValidateTagAgentRequestmodel = {
			tagList: requestDatas,
		};

		return await validateTagAgent(validateRequest);
	};

	const submitTagAgent = async (request: TagAgentRequestModel) => {
		let isValid = true;
		const response = await validateAgentTagging(request);
		if (response.data && response.data.status !== HttpStatusCodeEnum.Ok) {
			isValid = false;
			swal(PROMPT_MESSAGES.FailedValidationTitle, MESSAGES.TagToAnotherUser, SwalFailedMessage.icon);
		}

		request.tagList.forEach((i) => (i.userId = userId.toString()));

		if (isValid) {
			await tagAgent(request)
				.then((response: any) => {
					if (response.status === HttpStatusCodeEnum.Ok) {
						swal(PROMPT_MESSAGES.SuccessTitle, MESSAGES.TagSuccess, SwalConfirmMessage.icon);
						loadPlayerList();
						toggleAgentTaggingModal();
					}
					dispatch(agentWorkspaceManagement.actions.setLoading(false));
				})
				.catch(() => {
					console.log('Problem in saving call list note');
					dispatch(agentWorkspaceManagement.actions.setLoading(false));
				});
		}
	};

	const handleTagToMeAction = (callListId: any, action: string, data?: any) => {
		swal({
			title: PROMPT_MESSAGES.ConfirmSubmitTitle,
			text: PROMPT_MESSAGES.ConfirmTagToMeActionMessage,
			icon: 'warning',
			buttons: {
				cancel: {
					text: SwalConfirmMessage.btnNo,
					value: null,
					visible: true,
				},
				confirm: {
					text: SwalConfirmMessage.btnYes,
					value: true,
					visible: true,
				},
			},
			dangerMode: true,
		}).then(async (confirmTagToMeAction) => {
			if (confirmTagToMeAction) {
				confirmedPlayerTag(callListId, action, data);
			}
		});
	};

	const confirmedPlayerTag = (callListId: any, action: string, dataSelected?: any) => {
		let request: TagAgentRequestModel = {
			tagList: [],
		};

		const count = selectedRows.length > 0 ? selectedRows.length : 1; //means only 1 selected row if selectedRow array doesn't have value

		if (action === AgentWorkspaceTaggingActionsEnum.TagToMeSingle && count === 1) {
			const tagItem: TagAgentModel = {
				campaignPlayerId: callListId,
				agentId: userId,
				userId: userId.toString(),
			};
			request.tagList.push(tagItem);
			playerValidateAgentTagged(request);
		} else {
			request = {
				tagList: selectedRows.map((i) => {
					const tagItem: TagAgentModel = {
						campaignPlayerId: i.callListId,
						agentId: userId,
						userId: userId.toString(),
					};
					return tagItem;
				}),
			};
			playerValidateAgentTagged(request);
		}
	};

	const playerValidateAgentTagged = async (request: TagAgentRequestModel) => {
		const response = await validateAgentTagging(request);
		if (response.data && response.data.status !== HttpStatusCodeEnum.Ok) {
			swal(PROMPT_MESSAGES.FailedValidationTitle, 'Unable to proceed. The player has been tagged to another user.', 'error');
		} else {
			await tagAgent(request)
				.then((response) => {
					if (response.status === HttpStatusCodeEnum.Ok) {
						swal(PROMPT_MESSAGES.SuccessTitle, 'Player successfully tagged!', 'success');
						setSelectedRows([]);
						gridApi?.deselectAll();
						loadPlayerList();
					}
					dispatch(agentWorkspaceManagement.actions.setLoading(false));
				})
				.catch(() => {
					console.log('Problem in saving tag to me action');
					dispatch(agentWorkspaceManagement.actions.setLoading(false));
				});
		}
	};

	const handleDiscardAction = (callListId: any = undefined) => {
		swal({
			title: PROMPT_MESSAGES.ConfirmSubmitTitle,
			text: PROMPT_MESSAGES.ConfirmDiscardCallListMessage,
			icon: 'warning',
			buttons: {
				cancel: {
					text: SwalConfirmMessage.btnNo,
					value: null,
					visible: true,
				},
				confirm: {
					text: SwalConfirmMessage.btnYes,
					value: true,
					visible: true,
				},
			},
			dangerMode: true,
		}).then(async (confirmDiscardAction) => {
			if (confirmDiscardAction) {
				let request: DiscardPlayerRequestModel = {
					campaignPlayerIds: selectedRows.map((i) => i.callListId).join(','),
					userId: userId,
				};

				if (callListId != undefined) {
					// Discard Single
					request.campaignPlayerIds = callListId.toString();
				}

				await discardPlayer(request)
					.then((response) => {
						if (response.status === HttpStatusCodeEnum.Ok) {
							swal(PROMPT_MESSAGES.SuccessTitle, 'Player successfully tagged!', 'success');
							setSelectedRows([]);
							gridApi?.deselectAll();
							loadPlayerList();
						}
					})
					.catch((ex) => {
						console.log('Problem in saving discard action');
						console.log(ex);
						dispatch(agentWorkspaceManagement.actions.setLoading(false));
					});
			}
		});
	};

	const handleCreateServiceCase = (data: any) => {
		window.open(`/case-management/create-case/${data.playerId}/${data.brand}/${data.username}/${data.campaignId}`, '_blank');
	};
	const handleViewServiceCase = (data: any) => {
		const { campaignId,playerId, brand} = data;
		setSelectedCampaignIdForCommHistoryModal(campaignId)
		setSelectedPlayerIdForCommHistoryModal(playerId)
		setSelectedBrandNameForCommHistoryModal(brand)
		handleShowCommunicationHistoryModal();
	};

	const handleCaseAction = (data: any) => {
		if (data.caseInformationId) {
			window.open('/campaign-workspace/view-case/' + data.caseInformationId, '_blank');
		} else {
			window.open(`/campaign-workspace/create-case/${data.playerId}/${data.campaignId}/${data.brand}`, '_blank');
		}
	};

	const handleCommunicationAction = (data: any) => {
		window.open('/campaign-workspace/add-communication/' + data.caseInformationId, '_blank');
	};

	const renderAgentWorkspaceLastLoginDate = (_data: any) => {
		// eslint-disable-next-line react-hooks/rules-of-hooks
		return mlabFormatDate(_data.data.lastLoginDate);
	};

	const renderAgentWorkspaceFTDDate = (_data: any) => {
		// eslint-disable-next-line react-hooks/rules-of-hooks
		return mlabFormatDate(_data.data.ftdDate);
	};

	const renderAgentWorkspaceLastCallDate = (_data: any) => {
		// eslint-disable-next-line react-hooks/rules-of-hooks
		return mlabFormatDate(_data.data.campaignLastCallDate);
	};

	const customCellPlayerIdRender = (params: any) => {
		const { data } = params;

		return (
			<>
				{userAccess.includes(USER_CLAIMS.PlayerProfileRead) ? (
					<a href={'/player-management/player/profile/' + data.playerId + '/' + data.brand} target='_blank' rel='noreferrer'>
						{data.playerId}
					</a>
				) : (
					data.playerId
				)}
			</>
		);
	};

	const customCellUsernameRender = (params: any) => {
		const { data } = params;

		return (
			<>
				{userAccess.includes(USER_CLAIMS.PlayerProfileRead) ? (
					<a href={'/player-management/player/profile/' + data.playerId + '/' + data.brand} target='_blank' rel='noreferrer'>
						{data.username}
					</a>
				) : (
					data.username
				)}
			</>
		);
	};

	const customCellStatusRender = (params: any) => {
		const { data } = params;

		return (
			<>
				{data.status === 'Active' && <MlabBadge label={data.status} weight={'light'} type={'badge'} style={ElementStyle.success} />}
				{(data.status === 'Incomplete' || data.status === 'Created' || data.status === 'Initial') && (
					<MlabBadge label={data.status} weight={'light'} type={'badge'} style={ElementStyle.primary} />
				)}
				{(data.status === 'Closed by company' ||
					data.status === 'Closed by player' ||
					data.status === 'Self excluded' ||
					data.status === 'Suspended' ||
					data.status === 'Timed out') && <MlabBadge label={data.status} weight={'light'} type={'badge'} style={ElementStyle.danger} />}
			</>
		);
	};

	const customCellCampaignPrimaryGoalRender = (params: any) => {
		const { data } = params;
		let badge = null;

		if (data.campaignPrimaryGoalReached === true) {
			badge = <MlabBadge label={'YES'} weight={'light'} type={'badge'} style={ElementStyle.success} />;
		} else if (data.campaignPrimaryGoalReached === false) {
			badge = <MlabBadge label={'NO'} weight={'light'} type={'badge'} style={ElementStyle.danger} />;
		}

		return <>{badge}</>;
	};

	const customCellIntialDepositedRender = (params: any) => {
		const { data } = params;
		let badge = null;

		if (data.initialDeposited === true) {
			badge = <MlabBadge label={'YES'} weight={'light'} type={'badge'} style={ElementStyle.success} />;
		} else if (data.initialDeposited === false) {
			badge = <MlabBadge label={'NO'} weight={'light'} type={'badge'} style={ElementStyle.danger} />;
		}

		return <>{badge}</>;
	};

	const customCellContactableCaseRender = (params: any) => {
		const { data } = params;

		const contactableCaseCount = data?.contactableCaseCount > 0 ? data.contactableCaseCount : '0';

		return <>{contactableCaseCount}</>;
	};

	const customCellDepositAttemptsRender = (params: any) => {
		const { data } = params;

		if (data.depositAttempts > 0) {
			return (
				<button className='bg-transparent' onClick={() => handleShowDepositAttemptsModal(data.callListId)}>
					{data.depositAttempts}
				</button>
			);
		} else {
			return null; // Return null when depositAttempts is <= 0 to render nothing
		}
	};

	const customMobileNumberVerificationRender = (params: any) => {
		return (
			<div>
				<MlabBadge label={params.data.mobileStatus} weight={(!params.data.mobileStatusCode || params.data.mobileStatusCode === ElementStyle.secondary) ? 'normal' : 'light'} type={'badge'} style={params.data.mobileStatusCode ?? ElementStyle.secondary} />
			</div>
		);
	};

	// Table Columns
	const defaultColumns = [
		{
			field: 'playerId',
			headerName: 'Player ID',
			width: 200,
			minWidth: 180,
			headerCheckboxSelection: true,
			headerCheckboxSelectionFilteredOnly: true,
			checkboxSelection: true,
			pinned: 'left',
			lockPinned: true,
			cellClass: 'locked-pinned',
			wrapText: true,
			isPinned: true,
			cellRenderer: customCellPlayerIdRender,
		},
		{
			field: 'username',
			headerName: 'Username',
			cellRenderer: customCellUsernameRender,
		},
		{
			field: 'status',
			headerName: 'Status',
			cellRenderer: customCellStatusRender,
		},
		{
			field: 'brand',
			headerName: 'Brand',
			cellRenderer: (params: any) => params.data.brand ?? '',
		},
		{
			field: 'currency',
			headerName: 'Currency',
			cellRenderer: (params: any) => params.data.currency ?? '',
		},
		{
			field: 'registeredDate',
			headerName: 'Registered Date',
			cellRenderer: (params: any) => formatDate(params.data.registeredDate),
		},
		{
			field: 'lastLoginDate',
			headerName: 'Last Login Date',
			valueFormatter: renderAgentWorkspaceLastLoginDate,
		},
		{
			field: 'marketingSource',
			headerName: 'Marketing Source',
			cellRenderer: (params: any) => params.data.marketingSource ?? '',
		},
		{
			field: 'mobileStatus',
			headerName: 'Mobile Number Verification',
			cellRenderer: customMobileNumberVerificationRender
		},
		{
			field: 'campaignName',
			headerName: 'Campaign Name',
			cellRenderer: (params: any) => params.data.campaignName ?? '',
		},
		{
			field: 'ftdAmount',
			headerName: 'FTD Amount',
			cellRenderer: (params: any) => params.data.ftdAmount ?? 0,
		},
		{
			field: 'ftdDate',
			headerName: 'FTD Date',
			valueFormatter: renderAgentWorkspaceFTDDate,
		},
		{
			field: 'agentName',
			headerName: 'Agent Name',
			cellRenderer: (params: any) => params.data.agentName ?? '',
		},
		{ field: 'lastCallStatus', headerName: 'Last Call Status' },
		{ field: 'lastCallResponse', headerName: 'Last Call Response' },
		{
			field: 'campaignLastCallDate',
			headerName: 'Last Call Date',
			valueFormatter: renderAgentWorkspaceLastCallDate,
		},
		{
			field: 'campaignPrimaryGoalReached',
			headerName: 'Primary Goal Reached',
			cellRenderer: customCellCampaignPrimaryGoalRender,
		},
		{
			field: 'campaignPrimaryGoalCount',
			headerName: 'Primary Goal Count',
			cellRenderer: (params: any) => params.data.campaignPrimaryGoalCount ?? 0,
		},
		{
			field: 'campaignPrimaryGoalAmount',
			headerName: 'Primary Goal Amount',
			cellRenderer: (params: any) => params.data.campaignPrimaryGoalAmount ?? 0,
		},
		{
			field: 'country',
			headerName: 'Country',
			cellRenderer: (params: any) => params.data.country ?? '',
		},
		{
			field: 'contactableCaseCount',
			headerName: 'Contactable Case Count',
			cellRenderer: customCellContactableCaseRender,
		},
		{
			field: 'campaignLastContactableCaseDate',
			headerName: 'Last Contactable Case Date',
			width: 210,
			cellRenderer: (params: any) => formatDate(params.data.campaignLastContactableCaseDate),
		},
		{
			field: 'callListId',
			headerName: 'Call List ID',
			cellRenderer: (params: any) => params.data.callListId ?? '',
		},
		{
			field: 'initialDepositAmount',
			headerName: 'Initial Deposit Amount',
			cellRenderer: (params: any) => params.data.initialDepositAmount ?? 0,
		},
		{
			field: 'initialDepositDate',
			headerName: 'Initial Deposit Date',
			cellRenderer: (params: any) => formatDate(params.data.initialDepositDate),
		},
		{
			field: 'initialDepositMethod',
			headerName: 'Initial Deposit Method',
			cellRenderer: (params: any) => params.data.initialDepositMethod ?? '',
		},
		{
			field: 'initialDeposited',
			headerName: 'Initial Deposited',
			cellRenderer: customCellIntialDepositedRender,
		},
		{
			field: 'totalDepositAmount',
			headerName: 'Total Deposit Amount',
			cellRenderer: (params: any) => params.data.totalDepositAmount ?? 0,
		},
		{
			field: 'totalDepositCount',
			headerName: 'Total Deposit Count',
			cellRenderer: (params: any) => params.data.totalDepositCount ?? 0,
		},
		{
			field: 'depositAttempts',
			headerName: 'Deposit Attempts',
			cellRenderer: customCellDepositAttemptsRender,
		},
		{
			field: 'callListNotesAction',
			headerName: 'Call List Notes Action',
			sortable: false,
			minWidth: 200,
			cellRenderer: (params: any) => renderCallListNoteAction(params.data),
		},
		{
			field: 'taggingAction',
			headerName: 'Tagging Action',
			sortable: false,
			minWidth: 300,
			cellRenderer: (params: any) => rederTaggingAction(params.data),
		},
		{
			field: 'caseAction',
			headerName: 'Campaign',
			sortable: false,
			minWidth: 150,
			cellRenderer: (params: any) => renderCaseActions(params.data),
		},
		{
			field: 'serviceCaseAction',
			headerName: 'Service Case',
			sortable: false,
			minWidth: 150,
			cellRenderer: (params: any) => renderServiceCaseAction(params.data),
			tooltipField: 'athlete',
			tooltipComponentParams: { color: '#55AA77' }
		},
		{
			field: 'viewServiceCaseAction',
			headerName: 'View Case',
			sortable: false,
			minWidth: 150,
			cellRenderer: (params: any) => renderViewServiceCaseAction(params.data),
		}
	];

	const isCampaignCompletedDisable = (data: CampaignPlayerResponseModel) => {
		if (data.campaignStatusId === CampaignStatusEnum.Completed && data.caseInformationId <= 0) {
			return true;
		}

		if (data.caseInformationId > 0) {
			// View or Create case
			let accessClaim;

			if (data.agentId === userId) {
				if (data.caseInformationId <= 0) {
					accessClaim = USER_CLAIMS.ViewOwnPlayersWrite;
				} else {
					accessClaim = USER_CLAIMS.ViewOwnPlayersRead;
				}
			} else {
				accessClaim = USER_CLAIMS.ViewAllPlayersWrite;
			}

			if (!userAccess.includes(accessClaim)) {
				return true;
			}
		}

		return false;
	};

	const isDisableAddCampaignInfo = (data: CampaignPlayerResponseModel) => {
		if (data.caseInformationId > 0) {
			if (
				data.campaignStatusId === CampaignStatusEnum.Completed ||
				data.caseStatusId === CaseStatusEnum.Closed ||
				(data.agentId === userId && !userAccess.includes(USER_CLAIMS.ViewOwnPlayersWrite)) ||
				(data.agentId !== userId && !userAccess.includes(USER_CLAIMS.ViewAllPlayersWrite))
			) {
				return true;
			} else return false;
		} else {
			return true;
		}
	};

	// Render Components
	const renderCaseActions = (data: CampaignPlayerResponseModel) => {
		// execution plan
		// if campaignStatus = 32 wich is completed then disable
		// if data.caseInformationId > 0 view only
		// if (view own player = yes and view all player = yes)  then yes
		// if (view own player = yes and view all player = no) then yes to own list / no to other list
		// if (view own player = no and view all player = yes) then no to own list / yes to other list
		// if (view own player = no and view all player = no) then no

		//create and view case conditions
		let disable = isCampaignCompletedDisable(data) ?? false;

		// add communication condition
		let disableAdd = isDisableAddCampaignInfo(data) ?? false;
		let buttonLabel = data.caseInformationId > 0 ? LABELS.View_Case : LABELS.Create_Case;
		return (
			<>
				{
					data.caseInformationId > 0 ? (
						<OverlayTrigger placement='top' delay={{ show: 250, hide: 400 }} overlay={renderTooltip(buttonLabel)}>
							<button type="button" className="btn btn-sm" disabled={disable} onClick={() => handleCaseAction(data)}>
								<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 256 256"><path fill="#009ef7" d="M245.48 125.57c-.34-.78-8.66-19.23-27.24-37.81C201 70.54 171.38 50 128 50S55 70.54 37.76 87.76c-18.58 18.58-26.9 37-27.24 37.81a6 6 0 0 0 0 4.88c.34.77 8.66 19.22 27.24 37.8C55 185.47 84.62 206 128 206s73-20.53 90.24-37.75c18.58-18.58 26.9-37 27.24-37.8a6 6 0 0 0 0-4.88M128 194c-31.38 0-58.78-11.42-81.45-33.93A134.77 134.77 0 0 1 22.69 128a134.56 134.56 0 0 1 23.86-32.06C69.22 73.42 96.62 62 128 62s58.78 11.42 81.45 33.94A134.56 134.56 0 0 1 233.31 128C226.94 140.21 195 194 128 194m0-112a46 46 0 1 0 46 46a46.06 46.06 0 0 0-46-46m0 80a34 34 0 1 1 34-34a34 34 0 0 1-34 34" /></svg>
							</button>
						</OverlayTrigger>) : (
						<OverlayTrigger placement='top' delay={{ show: 250, hide: 400 }} overlay={renderTooltip(buttonLabel)}>
							<button type="button" className="btn btn-sm" disabled={disable} onClick={() => handleCaseAction(data)}>
								<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
									<path fill="#009ef7" d="M15 4H5v16h14V8h-4zM3 2.992C3 2.444 3.447 2 3.999 2H16l5 5v13.993A1 1 0 0 1 20.007 22H3.993A1 1 0 0 1 3 21.008zM11 11V8h2v3h3v2h-3v3h-2v-3H8v-2z" /></svg>
							</button>
						</OverlayTrigger>
					)

				}
				{''}
				{
					<OverlayTrigger placement='top' delay={{ show: 250, hide: 400 }} overlay={renderTooltip('Add Communication')}>
						<button type="button" className="btn btn-sm" disabled={disableAdd || data.isWithEmailAndWebPushCommumication == CommunicationTypeEnum.EmailAndWebPushCommumication} onClick={() => handleCommunicationAction(data)}>
							<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="none" stroke="#009ef7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 16v3m0 0v3m0-3h3m-3 0h-3m4-10v-.172a2 2 0 0 0-.586-1.414l-3.828-3.828A2 2 0 0 0 14.172 3H14m6 6h-4a2 2 0 0 1-2-2V3m6 6v3m-6-9H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h6" /></svg>
						</button>
					</OverlayTrigger>
				}
			</>
		);
	};

	const renderServiceCaseAction = (data: CampaignPlayerResponseModel) => {
		let disable = isServiceCaseAddDisable(data) ?? false;
		return (
			<OverlayTrigger placement='top' delay={{ show: 250, hide: 400 }} overlay={renderTooltip('Create Case')}>
				<button type="button" className="btn btn-sm" disabled={disable} onClick={() => handleCreateServiceCase(data)}>
					<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
						<path fill="#009ef7" d="M15 4H5v16h14V8h-4zM3 2.992C3 2.444 3.447 2 3.999 2H16l5 5v13.993A1 1 0 0 1 20.007 22H3.993A1 1 0 0 1 3 21.008zM11 11V8h2v3h3v2h-3v3h-2v-3H8v-2z" /></svg>
				</button>
			</OverlayTrigger>
		);
	}
	const renderViewServiceCaseAction = (data: CampaignPlayerResponseModel) => {
		//disable view comm histor if case is completed, does not have service case and campaign case
		let disable = (!data.hasServiceCase && data.caseInformationId == null) ?? false;
		return (
			<OverlayTrigger placement='top' delay={{ show: 250, hide: 400 }} overlay={renderTooltip('View Case')}>
				<button type="button" className="btn btn-sm" disabled={disable} onClick={() => handleViewServiceCase(data)}>
					<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 256 256"><path fill="#009ef7" d="M245.48 125.57c-.34-.78-8.66-19.23-27.24-37.81C201 70.54 171.38 50 128 50S55 70.54 37.76 87.76c-18.58 18.58-26.9 37-27.24 37.81a6 6 0 0 0 0 4.88c.34.77 8.66 19.22 27.24 37.8C55 185.47 84.62 206 128 206s73-20.53 90.24-37.75c18.58-18.58 26.9-37 27.24-37.8a6 6 0 0 0 0-4.88M128 194c-31.38 0-58.78-11.42-81.45-33.93A134.77 134.77 0 0 1 22.69 128a134.56 134.56 0 0 1 23.86-32.06C69.22 73.42 96.62 62 128 62s58.78 11.42 81.45 33.94A134.56 134.56 0 0 1 233.31 128C226.94 140.21 195 194 128 194m0-112a46 46 0 1 0 46 46a46.06 46.06 0 0 0-46-46m0 80a34 34 0 1 1 34-34a34 34 0 0 1-34 34" /></svg>
				</button>
			</OverlayTrigger>
		);
	}
	const isServiceCaseAddDisable = (data: CampaignPlayerResponseModel) => {
		if (data.campaignStatusId === CampaignStatusEnum.Completed) {
			return true;
		}
		return false;
	}
	const renderTooltip = (message: any) => (
		<Tooltip id='case-list-button-tooltip'>
			<>{message}</>
		</Tooltip>
	);
	const rederTaggingAction = (data: CampaignPlayerResponseModel) => {
		let disable: boolean = false;

		// check  data is  agentId = userid
		if (data.agentId === userId) {
			disable = !userAccess.includes(USER_CLAIMS.ViewOwnPlayersWrite);
		} else {
			disable = !userAccess.includes(USER_CLAIMS.ViewAllPlayersWrite);
		}

		return (
			<>
				{!agentWorkspaceRules.playerHasNoAgentRule(data) && (
					<DefaultTableButton
						access={true}
						isDisabled={
							!agentWorkspaceRules.taggingEnabledRule(data) ||
							disable ||
							data.isWithEmailAndWebPushCommumication == CommunicationTypeEnum.EmailAndWebPushCommumication
						}
						className={'btn btn-outline-primary btn-sm px-4 btn-mlab-custom-sm me-2'}
						title={'ReTag'}
						onClick={() => handleWorkspaceAction('retag-single', data)}
					/>
				)}

				{agentWorkspaceRules.playerHasNoAgentRule(data) && (
					<DefaultTableButton
						access={true}
						isDisabled={
							!agentWorkspaceRules.taggingEnabledRule(data) ||
							disable ||
							data.isWithEmailAndWebPushCommumication == CommunicationTypeEnum.EmailAndWebPushCommumication
						}
						className={'btn btn-outline-primary btn-sm px-4 btn-mlab-custom-sm me-2'}
						title={'Tag'}
						onClick={() => handleWorkspaceAction('tag-single', data)}
					/>
				)}

				<DefaultTableButton
					access={true}
					isDisabled={
						!agentWorkspaceRules.taggingEnabledRule(data) ||
						disable ||
						data.isWithEmailAndWebPushCommumication == CommunicationTypeEnum.EmailAndWebPushCommumication
					}
					className={'btn btn-outline-primary btn-sm px-4 btn-mlab-custom-sm me-2'}
					title={'TagToMe'}
					onClick={() => handleWorkspaceAction('tagtome-single', data)}
				/>

				<DefaultTableButton
					access={true}
					isDisabled={
						data.campaignStatusId === 32 || disable || data.isWithEmailAndWebPushCommumication == CommunicationTypeEnum.EmailAndWebPushCommumication
					}
					className={'btn btn-outline-primary btn-sm px-4 btn-mlab-custom-sm me-2'}
					title={'Discard'}
					onClick={() => handleWorkspaceAction('discard-single', data)}
				/>
			</>
		);
	};

	const renderCallListNoteAction = (data: CampaignPlayerResponseModel) => {
		let disable: boolean = false;

		if (data.campaignStatusId === CAMPAIGN_STATUS.Completed) {
			disable = true;
			// check  data is  agentId = userid
		} else if (data.campaignStatusId !== CAMPAIGN_STATUS.Completed) {
			if (data.agentId === userId) {
				disable = !userAccess.includes(USER_CLAIMS.ViewOwnPlayersWrite);
			} else {
				disable = !userAccess.includes(USER_CLAIMS.ViewAllPlayersWrite);
			}
		}

		return (
			<>
				{
					<DefaultTableButton
						access={true}
						isDisabled={disable}
						title={data.callListNoteId > 0 ? GenericStringContantsEnum.EditLabel : GenericStringContantsEnum.AddLabel}
						onClick={() => addEditCallListNote(data)}
						onKeyDown={(e: any) => {e.preventDefault()}}
					/>
				}
			</>
		);
	};

	return (
		<>
			<MainContainer>
				<div className='card-body p-3'>
					<FormGroupContainer>
						<ButtonsContainer>
							<div className='p-2 flex-grow-1'>
								<MlabButton type={'button'} label={'Filter'} access={true} style={ElementStyle.primary} weight={'solid'} onClick={handleToggleFilter}>
									<i className='bi bi-funnel-fill fs-5 text-secondary'></i> Filter
								</MlabButton>
							</div>
							{selectedRows && selectedRows.length > 1 && validateBatchSelection() && (
								<div className='p-2 '>
									<MlabButton
										label={AgentWorkspaceTaggingTitleEnum.Tag}
										access={userAccess.includes(USER_CLAIMS.ViewAllPlayersRead) && userAccess.includes(USER_CLAIMS.ViewAllPlayersWrite) && batchTag}
										size={'sm'}
										type={'button'}
										weight={'solid'}
										style={ElementStyle.primary}
										onClick={() => handleWorkspaceAction(AgentWorkspaceTaggingActionsEnum.Tag)}
									/>
									<MlabButton
										label={AgentWorkspaceTaggingTitleEnum.ReTag}
										access={
											(userAccess.includes(USER_CLAIMS.ViewOwnPlayersWrite) || userAccess.includes(USER_CLAIMS.ViewAllPlayersWrite)) && batchReTag
										}
										size={'sm'}
										type={'button'}
										weight={'solid'}
										style={ElementStyle.primary}
										onClick={() => handleWorkspaceAction(AgentWorkspaceTaggingActionsEnum.Retag)}
									/>
									<MlabButton
										label={AgentWorkspaceTaggingTitleEnum.TagToMe}
										access={
											userAccess.includes(USER_CLAIMS.ViewAllPlayersRead) && userAccess.includes(USER_CLAIMS.ViewAllPlayersWrite) && batchTagToMe
										}
										size={'sm'}
										type={'button'}
										weight={'solid'}
										style={ElementStyle.primary}
										onClick={() => handleWorkspaceAction(AgentWorkspaceTaggingActionsEnum.TagToMe)}
									/>
									<MlabButton
										label={AgentWorkspaceTaggingTitleEnum.Discard}
										access={
											(userAccess.includes(USER_CLAIMS.ViewOwnPlayersWrite) || userAccess.includes(USER_CLAIMS.ViewAllPlayersWrite)) && batchDiscard
										}
										size={'sm'}
										type={'button'}
										weight={'solid'}
										style={ElementStyle.primary}
										onClick={() => handleWorkspaceAction(AgentWorkspaceTaggingActionsEnum.Dump)}
									/>
								</div>
							)}
						</ButtonsContainer>
					</FormGroupContainer>
					<div className='separator separator-dashed my-3'></div>
					<FormGroupContainer>
						<div className='ag-theme-quartz' style={{ height: gridHeight, width: '100%', marginBottom: '50px' }}>
							<AgGridReact
								rowStyle={{ userSelect: 'text' }}
								rowData={filterResponseState.campaignPlayers}
								defaultColDef={{
									sortable: true,
									resizable: true,
								}}
								rowSelection={'multiple'}
								alwaysShowHorizontalScroll={false}
								animateRows={true}
								onGridReady={onGridReady}
								rowBuffer={0}
								enableRangeSelection={true}
								pagination={false}
								paginationPageSize={pageSize}
								onSelectionChanged={onSelectionChanged}
								onSortChanged={(e) => onSort(e)}
								columnDefs={columnDefs}
								overlayLoadingTemplate={gridOverlayTemplate}
								ref={gridRef}
							/>

							<DefaultGridPagination
								recordCount={filterResponseState.recordCount}
								currentPage={currentPage}
								pageSize={pageSize}
								onClickFirst={onClickFirst}
								onClickPrevious={onClickPrevious}
								onClickNext={onClickNext}
								onClickLast={onClickLast}
								onPageSizeChanged={onPageSizeChanged}
								onUpdateGridCustomDisplay={onUpdateGridCustomDisplay}
								onSubmitGridCustomDisplay={onSubmitGridCustomDisplay}
								defaultColumns={defaultColumns}
								pageSizes={[20, 30, 50, 100]}
							/>
						</div>
					</FormGroupContainer>
				</div>
			</MainContainer>
			<CallListNoteModal
				note={callListNote}
				modal={callListNoteModal}
				toggle={handleToggleCallListNoteModal}
				onSubmmit={handleToggleCallListNoteSubmit}
				onHide={handleToggleCallListNoteModal}
			/>
			<TagCallListModal
				title={tagModalTitle}
				lastTaggedDate={lastTaggedDate}
				agentId={taggedAgent}
				modal={tagCallListModal}
				toggle={toggleAgentTaggingModal}
				onSubmitForm={handleToggleTagCallListSubmit}
				onHide={onHideModal}
			/>
			<CommunicationHistoryModal brandName={selectedBrandNameForCommHistoryModal} playerId={selectedPlayerIdForCommHistoryModal} campaignId={selectedCampaignIdForCommHistoryModal} modal={communicationHistoryModal} toggle={toggleCommunicationHistoryModal} />
			<DepositAtteptsModal callListId={callListIdDeposits} modal={depositAttemptsModal} toggle={toggleDepositAttemptsModal} />
		</>
	);
};

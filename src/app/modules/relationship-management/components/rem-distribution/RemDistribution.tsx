import {Guid} from 'guid-typescript';
import moment from 'moment';
import {useState} from 'react';
import {shallowEqual, useSelector} from 'react-redux';
import swal from 'sweetalert';
import {RootState} from '../../../../../setup';
import * as hubConnection from '../../../../../setup/hub/MessagingHub';
import {ElementStyle, HttpStatusCodeEnum, PROMPT_MESSAGES} from '../../../../constants/Constants';
import {DefaultTableButton, FilterDrawerContainer, MlabButton} from '../../../../custom-components';
import {formatDate} from '../../../../custom-functions/helper/dateHelper';
import useToggle from '../../../../custom-functions/useToggle';
import {PaginationModel} from '../../../../shared-models/PaginationModel';
import {USER_CLAIMS} from '../../../user-management/components/constants/UserClaims';
import {
	RemDistributionAssigmentRequest,
	RemDistributionFilterModel,
	RemDistributionFilterRequest,
	RemDistributionListResponse,
	RemDistributionModel,
	UpsertRemDistributionRequest,
} from '../../models';
import {RemoveRemDistributionRequestModel} from '../../models/request/RemoveRemDistributionRequestModel';
import {ExportRemDistributionToCsv, GetRemDistributionList, GetRemDistributionListResult, RemoveRemDistribution, UpsertRemDistribution} from '../../services/RemDistributionApi';
import {PlayerStatusBadge} from '../../shared/components';
import AssignStatusBadge from '../../shared/components/AssignStatusBadge';
import useRemLookups from '../../shared/hooks/useRemLookups';
import RemDistributionAssignmentModal from './RemDistributionAssignmentModal';
import RemDistributionFilter from './RemDistributionFilter';
import RemDistributionList from './RemDistributionList';
import useConstant from '../../../../constants/useConstant';

const RemDistribution = () => {

	// States
	const remLookups = useRemLookups();
	const userAccess = useSelector<RootState>(({auth}) => auth.access, shallowEqual) as string;
	const userId = useSelector<RootState>(({auth}) => auth.userId, shallowEqual) as number;
	const {status: expanded, toggleStatus: toggleExpanded} = useToggle();
	const { SwalConfirmMessage, ReMAutoDistributionConstants } = useConstant();
	const [loading, setLoading] = useState(false);
	const [remAssignmentModal, setRemAssignmentModal] = useState(false);
	const remAssignmentModalTitle = 'Assignment to ReM Profile';
	const [remAssignmentModalData, setRemAssignmentModalData] = useState<RemDistributionModel[]>([]);
	const [filteredValues, setFilteredValues] = useState<RemDistributionFilterRequest>();
	const [filterValueBackup, setFilterValueBackup] = useState<RemDistributionFilterModel>({
		remProfileId: {value: '', label: ''},
		agentIds: [],
		pseudoNames: [],
		playerId: '',
		userName: '',
		statusId: {value: '', label: ''},
		currencyIds: [],
		brandId: {value: '', label: ''},
		vipLevelIds: [],
		assignStatus: {value: '', label: ''},
		distributionDate: [],
		assignedByIds: [],
	});
	const [paginationValue, setPaginationValue] = useState<PaginationModel>({
		currentPage: 1,
		offsetValue: 0,
		pageSize: 10,
		sortColumn: '',
		sortOrder: '',
	});
	const [remDistributionFilterResponse, setRemDistributionFilterResponse] = useState<RemDistributionListResponse>({
		remDistributionList: [],
		recordCount: 0,
	});
	const customCellPlayerIdRender = (params: any) => {
		const { data } = params;

		return (
		  <>
			{
				userAccess.includes(USER_CLAIMS.PlayerProfileRead) ? 
				(<a href={'/player-management/player/profile/' + data.playerId + '/' + data.brand} target='_blank'>
					{data.playerId}
				</a>)
			: 
				(data.playerId)
			}
		  </>
		);
	};
	const customCellUsernameRender = (params: any) => {
		const { data } = params;

		return (
		  <>
			{
				userAccess.includes(USER_CLAIMS.PlayerProfileRead) ? (
					<a href={'/player-management/player/profile/' + data.playerId + '/' + data.brand} target='_blank'>
						{data.username}
					</a>
				) : (
					data.username
				)
			}
		  </>
		);
	};
	const customCellRemProfileNameRender = (params: any) => {
		const { data } = params;

		return (
		  <>
			{
				userAccess.includes(USER_CLAIMS.PlayerProfileRead) ? (
					<a href={'/relationship-management/view-rem-profile/view/' + data.remProfileId} target='_blank'>
						{data.remProfileName}
					</a>
				) : (
					data.remProfileName
				)
			}
		  </>
		);
	};
	const customCellRemAssignActionRender = (params: any) => {
		const { data } = params;

		return (
		  <>
			<DefaultTableButton
						access={userAccess.includes(USER_CLAIMS.RemDistributionWrite)}
						title={data.remProfileId > 0 ? 'Reassign' : 'Assign'}
						onClick={() => assignRemProfile([data])}
					/>

					{data.remProfileId > 0 && (
						<>
							{' '}
							<DefaultTableButton
								access={userAccess.includes(USER_CLAIMS.RemDistributionWrite)}
								title={'Remove'}
								onClick={() => removeRemProfile(data)}
							/>
						</>
					)}
		  </>
		);
	};
	const customCellPlayerStatusRender = (params: any) => {
		const { data } = params;

		return (
			<PlayerStatusBadge status={data.playerStatus} />
		);
	};
	const remDistributionColDefs = [
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
			cellRenderer: customCellPlayerIdRender
		},
		{
			field: 'vipLevel',
			headerName: 'VIP Level',
			cellRenderer: (params: any) => params.data.vipLevel ?? '',
		},
		{
			field: 'username',
			headerName: 'Username',
			cellRenderer: customCellUsernameRender
				
		},
		{
			field: 'playerStatus',
			headerName: 'Status',
			cellRenderer: customCellPlayerStatusRender
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
			field: 'remProfileName',
			headerName: 'ReM Profile Name',
			cellRenderer: customCellRemProfileNameRender
		},
		{
			field: 'agentName',
			headerName: 'Agent Name',
			cellRenderer: (params: any) => params.data.agentName ?? '',
		},
		{
			field: 'pseudoName',
			headerName: 'Pseudo Name',
			cellRenderer: (params: any) => params.data.pseudoName ?? '',
		},
		{
			field: 'prevReMProfileName',
			headerName: 'Previous ReM Agent Name',
			cellRenderer: (params: any) => params.data.prevReMProfileName ?? '',
			minWidth: 250,
		},
		{
			field: 'assignStatus',
			headerName: 'Assign Status',
			cellRenderer: (params: any) => <AssignStatusBadge assignStatus={params.data.assignStatus} />,
		},
		{
			field: 'distributionDate',
			headerName: 'Distribution Date',
			cellRenderer: (params: any) => formatDate(params.data.distributionDate) ?? '',
		},
		{
			field: 'assignedBy',
			headerName: 'Assigned By',
			cellRenderer: (params: any) => params.data.assignedBy ?? '',
		},
		{
			field: 'assignAction',
			headerName: 'Assign Action',
			sortable: false,
			minWidth: 200,
			cellRenderer: customCellRemAssignActionRender,
		},
	];

	// Methods
	const generateRequestParam = (filterParam?: RemDistributionFilterModel, paginationParam?: PaginationModel) => {
		const filters = filterParam ?? filterValueBackup;
		const pagination = paginationParam ?? paginationValue;
		const request: RemDistributionFilterRequest = {
			remProfileId: filters.remProfileId?.value !== undefined ? Number(filters.remProfileId?.value) : undefined,
			agentIds: filters.agentIds.length > 0 ? filters.agentIds.map((i) => i.value).join(',') : undefined,
			pseudoNames: filters.pseudoNames.length > 0 ? filters.pseudoNames.map((i) => i.label).join(',') : undefined,
			playerId: filters.playerId,
			userName: filters.userName,
			statusId: filters.statusId?.value !== undefined ? Number(filters.statusId?.value) : undefined,
			currencyIds: filters.currencyIds.length > 0 ? filters.currencyIds.map((i) => i.value).join(',') : undefined,
			brandId: filters.brandId?.value !== undefined ? Number(filters.brandId?.value) : undefined,
			vipLevelIds: filters.vipLevelIds.length > 0 ? filters.vipLevelIds.map((i) => i.value).join(',') : undefined,
			assignStatus: filters.assignStatus?.value !== undefined ? (filters.assignStatus?.value === '1' ? true : false) : undefined,
			distributionDateStart: filters.distributionDate[0],
			distributionDateEnd: filters.distributionDate[1],
			assignedByIds: filters.assignedByIds.length > 0 ? filters.assignedByIds.map((i) => i.value).join(',') : undefined,
			currentPage: pagination.currentPage,
			offsetValue: (pagination.currentPage - 1) * pagination.pageSize,
			pageSize: pagination.pageSize,
			sortColumn: pagination.sortColumn,
			sortOrder: pagination.sortOrder,
			queueId: Guid.create().toString(),
			userId: userId.toString(),
		};

		return request;
	};

	const handleFilterSearch = (param: RemDistributionFilterModel) => {
		const resetPaginationValue: PaginationModel = {
			currentPage: 1,
			offsetValue: 0,
			pageSize: 10,
			sortColumn: '',
			sortOrder: '',
		};
		setPaginationValue(resetPaginationValue);
		setFilterValueBackup(param);
		const request = generateRequestParam(param, resetPaginationValue);
		searchRemDistributionList(request);
		setFilteredValues(request);
	};

	const handleExportToCSV = () => {
		let val = filteredValues ?? generateRequestParam()
		val.pageSize = remDistributionFilterResponse.recordCount
		val.offsetValue = 0

		ExportRemDistributionToCsv(val)
			.then((response) => {
				const url = window.URL.createObjectURL(new Blob(["\ufeff",response.data]));
				const link = document.createElement('a');
				link.href = url;
				link.setAttribute('download', `REM Distribution ${moment(new Date()).format("DD/MM/yyyy")}.csv`);
				document.body.appendChild(link);
				link.click();
			})
			.catch(() => {
				swal('Failed', 'Problem in exporting list', 'error');
			});
	}

	const handlePaginationSearch = (param: PaginationModel) => {
		setPaginationValue(param);
		const request = generateRequestParam(undefined, param);
		searchRemDistributionList(request);
	};

	const searchRemDistributionList = (requestParam?: RemDistributionFilterRequest) => {
		const request = requestParam ?? generateRequestParam();

		setLoading(true);
		setRemDistributionFilterResponse({...remDistributionFilterResponse, remDistributionList: []});
		setTimeout(() => {
			const messagingHub = hubConnection.createHubConnenction();
			messagingHub
				.start()
				.then(() => {
					if (messagingHub.state === 'Connected') {
						GetRemDistributionList(request)
							.then((response) => {
								if (response.status === HttpStatusCodeEnum.Ok) {
									messagingHub.on(request.queueId.toString(), (message) => {
										GetRemDistributionListResult(message.cacheId)
											.then((data) => {												
												setRemDistributionFilterResponse(data.data as RemDistributionListResponse);
												setLoading(false);

												messagingHub.off(request.queueId.toString());
												messagingHub.stop();
											})
											.catch(() => {});
									});

									setTimeout(() => {
										if (messagingHub.state === 'Connected') {
											messagingHub.stop();
										}
									}, 30000);
								}
							})
							.catch(() => {
								messagingHub.stop();
								setLoading(false);
							});
					}
				})
				.catch(() => {
					messagingHub.stop();
					setLoading(false);
				});
		}, 1000);
	};

	const assignRemProfile = (distributionData: RemDistributionModel[]) => {
		setRemAssignmentModalData(distributionData);
		setRemAssignmentModal(true);
	};

	const removeRemProfile = async (distributionData: RemDistributionModel) => {
		swal({
			title: PROMPT_MESSAGES.ConfirmCloseTitle,
			text: ReMAutoDistributionConstants.SwalReMAutoDistributionMessage.textRemoveAssignment,
			icon: 'warning',
			buttons: [SwalConfirmMessage.btnNo, SwalConfirmMessage.btnYes],
			dangerMode: true,
		}).then(async (confirmRemoveRemProfile) => {
			if (confirmRemoveRemProfile) {
				const request: RemoveRemDistributionRequestModel = {
					remDistributionId: distributionData.remDistributionId,
					remProfileId: distributionData.remProfileId,
					userId: userId,
					playerId: distributionData.playerId,
					mlabPlayerId: distributionData.mlabPlayerId,
					hasIntegration: distributionData.hasIntegration
				};

				await RemoveRemDistribution(request).then((response) => {
					if (response.status === HttpStatusCodeEnum.Ok) {
						swal(PROMPT_MESSAGES.SuccessTitle, 'ReM Profile successfully removed!', 'success');
						searchRemDistributionList();
					} else {
						swal(PROMPT_MESSAGES.FailedValidationTitle, 'Error Removing ReM Distribution', 'error');
					}
				});
			}
		});
	};

	const toggleRemAssignmentModal = () => {
		setRemAssignmentModal(!remAssignmentModal);
	};

	const onSubmitRemAssignment = async (remAssignmentRequest: RemDistributionAssigmentRequest[]) => {
		const request = remAssignmentRequest.map((i) => {
			const requestItem: UpsertRemDistributionRequest = {
				mlabPlayerId: i.mlabPlayerId,
				playerId: i.playerId,
				createdBy: userId,
				remDistributionId: i.remDistributionId,
				remProfileId: i.remProfileId,
				updatedBy: userId,
				hasIntegration: i.hasIntegration ?? 0
			};
			return requestItem;
		});

		await UpsertRemDistribution(request).then((response) => {
			if (response.status === HttpStatusCodeEnum.Ok) {
				swal(PROMPT_MESSAGES.SuccessTitle, 'Player successfully assigned!', 'success');
				searchRemDistributionList();
				setRemAssignmentModal(false);
			}
		});
	};

	const onHideRemAssignmentModal = () => {
		swal({
			title: PROMPT_MESSAGES.ConfirmCloseTitle,
			text: `This action will discard any changes made. Please confirm`,
			icon: 'warning',
			buttons: {
				cancel: {
					text: 'No',
					value: null,
					visible: true,
				},
				confirm: {
					text: 'Yes',
					value: true,
					visible: true,
				},
			},
			dangerMode: true,
		}).then((confirmDiscardChanges) => {
			if (confirmDiscardChanges) {
				setRemAssignmentModal(!remAssignmentModal);
			}
		});
	};

	const exportCSVBtn = () => {
		return (
			<div style={{marginRight: 5}}>
				<MlabButton
					access={true}
					label='Export to CSV'
					style={ElementStyle.primary}
					type={'button'}
					weight={'solid'}
					size={'sm'}
					onClick={handleExportToCSV}
					disabled={remDistributionFilterResponse.recordCount == 0 || !userAccess.includes(USER_CLAIMS.RemDistributionRead)}
				/>
			</div>
		)
	}
	
	return (
		<FilterDrawerContainer
			toggle={expanded}
			toggleHandle={toggleExpanded}
			filterComponent={<RemDistributionFilter remLookups={remLookups} loading={loading} search={handleFilterSearch} exportToCSV={exportCSVBtn} />}
			contentComponent={
				<RemDistributionList
					columnDefs={remDistributionColDefs}
					search={handlePaginationSearch}
					toggleFilter={toggleExpanded}
					pagination={paginationValue}
					loading={loading}
					remDistribution={remDistributionFilterResponse}
					assignRemProfile={assignRemProfile}
				>
					<RemDistributionAssignmentModal
						modal={remAssignmentModal}
						title={remAssignmentModalTitle}
						distributionData={remAssignmentModalData}
						remProfileOptions={remLookups.activeRemProfileNames}
						onHide={onHideRemAssignmentModal}
						onSubmitForm={onSubmitRemAssignment}
						toggle={toggleRemAssignmentModal}
					/>
				</RemDistributionList>
			}
		/>
	);
};

export default RemDistribution;

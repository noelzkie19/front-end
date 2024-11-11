import {faCogs, faFilter, faUsersCog} from '@fortawesome/free-solid-svg-icons';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {AgGridReact} from 'ag-grid-react';
import {Guid} from 'guid-typescript';
import {useEffect, useRef, useState} from 'react';
import {shallowEqual, useDispatch, useSelector} from 'react-redux';
import swal from 'sweetalert';
import {RootState} from '../../../../setup';
import gridOverlayTemplate from '../../../common-template/gridTemplates';
import {LookupModel} from '../../../common/model';
import {SetGridCustomDisplayAsync} from '../../../common/services/userGridCustomDisplay';
import {CampaignStatusEnum, ElementStyle} from '../../../constants/Constants';
import useConstant from '../../../constants/useConstant';
import {ContentContainer, DefaultGridPagination, MainContainer, MlabBadge} from '../../../custom-components';
import {formatDate} from '../../../custom-functions/helper/dateHelper';
import DepositAtteptsModal from '../../campaign-agent-workspace/components/DepositAtteptsModal';
import {USER_CLAIMS} from '../../user-management/components/constants/UserClaims';
import {CallValidationListResponseModel} from '../models/response/CallValidationListResponseModel';
import {CallValidationResponseModel} from '../models/response/CallValidationResponseModel';
import * as callListValidationMgt from '../redux/CallListValidationRedux';
import CallListValidationFilters from './CallListValidationFilters';
import AgentValidation from './modals/AgentValidation';
import BatchAgentValidations from './modals/BatchAgentValidations';
import BatchLeaderValidations from './modals/BatchLeaderValidations';
import CallEvaluation from './modals/CallEvaluation';
import LeaderJustificationSettings from './modals/LeaderJustificationSettings';
import LeaderValidation from './modals/LeaderValidation';

const CallListValidation: React.FC = () => {
	const [columnDefs, setColumnDefs] = useState<Array<any>>([]);
	const {SwalConfirmMessage} = useConstant();

	const defaultColumns = [
		{
			headerName: 'Campaign Player Id',
			field: 'campaignPlayerId',
			checkboxSelection: true,
			headerCheckboxSelection: true,
			width: 20,
			pinned: 'left',
			lockPinned: true,
			cellClass: 'lock-pinned',
			isPinned: true,
		},
		{headerName: 'Campaign Type', field: 'campaignType', pinned: 'left', lockPinned: true, cellClass: 'lock-pinned', isPinned: true},
		{headerName: 'Campaign Name', field: 'campaignName', pinned: 'left', lockPinned: true, cellClass: 'lock-pinned', isPinned: true},
		{
			headerName: 'Username',
			field: 'username',
			pinned: 'left',
			lockPinned: true,
			cellClass: 'lock-pinned',
			width: 150,
			isPinned: true,
			cellRenderer: (params: any) => (
				<>
					{userAccess.includes(USER_CLAIMS.PlayerProfileRead) ? (
						<a href={'/player-management/player/profile/' + params.data.playerId + '/' + params.data.brand} target='_blank'>
							{params.data.username}
						</a>
					) : (
						params.data.username
					)}
				</>
			),
		},
		{
			field: 'playerId',
			headerName: 'Player ID',
			//cellRenderer: (params: any) => params.data.playerId ?? '',
			cellRenderer: (params: any) => (
				<>
					{userAccess.includes(USER_CLAIMS.PlayerProfileRead) ? (
						<a href={'/player-management/player/profile/' + params.data.playerId + '/' + params.data.brand} target='_blank'>
							{params.data.playerId}
						</a>
					) : (
						params.data.playerId
					)}
				</>
			),
		},
		{
			headerName: 'System Validation',
			field: 'systemValidation',
			cellRenderer: (params: any) => (
				<>
					{params ? (
						<div className='form-check form-switch form-check-custom form-check-solid d-flex justify-content-center flex-shrink-0'>
							<input
								className='form-check-input'
								type='checkbox'
								value=''
								id='playerClaimRead'
								defaultChecked={params.data.systemValidation}
								disabled={true}
							/>
							<label className='form-check-label'>{params.data.systemValidation == true ? 'Y' : 'N'}</label>
						</div>
					) : null}
				</>
			),
		},
		{
			headerName: 'Agent Validation',
			field: 'agentValidation',
			cellRenderer: (params: any) => (
				<>
					{' '}
					{params ? (
						<div className='form-check form-switch form-check-custom form-check-solid d-flex justify-content-center flex-shrink-0'>
							<input
								className='form-check-input'
								type='checkbox'
								value=''
								id='playerClaimRead'
								defaultChecked={params.data.systemValidation === true && params.data.isAgentValidated == false ? true : params.data.agentValidation}
								onClick={() =>
									toggleAgentValidationModal(
										params.data.campaignPlayerId,
										params.data.username,
										params.data.campaignName,
										params.data.isAgentValidated,
										'Parent'
									)
								}
								disabled={
									isDisabledAgentBasedOnCampaignStatus(params.data.campaignStatus) ||
									(!userAccess.includes(USER_CLAIMS.UpdateAllAgentValidationsWrite) && params.data.agentId !== userId)
								}
							/>
							<label className='form-check-label'>{params.data.isAgentValidated == true ? 'Y' : 'N'}</label>
						</div>
					) : null}
				</>
			),
		},
		{
			headerName: 'Leader Validation',
			field: 'leaderValidation',
			cellRenderer: (params: any) => (
				<>
					{params ? (
						<div className='form-check form-switch form-check-custom form-check-solid d-flex justify-content-center flex-shrink-0'>
							<input
								className='form-check-input'
								type='checkbox'
								value=''
								id='playerClaimRead'
								defaultChecked={params.data.systemValidation === true && params.data.isLeaderValidated == false ? true : params.data.leaderValidation}
								onClick={() =>
									toggleLeaderVationModal(
										params.data.campaignPlayerId,
										params.data.username,
										params.data.campaignName,
										params.data.isLeaderValidated,
										'Parent'
									)
								}
								disabled={
									isDisabledLeaderBasedOnCampaignStatus(params.data.campaignStatus) || !userAccess.includes(USER_CLAIMS.UpdateLeaderValidationWrite)
								}
							/>
							<label className='form-check-label'>{params.data.isLeaderValidated == true ? 'Y' : 'N'}</label>
						</div>
					) : null}
				</>
			),
		},
		{
			headerName: 'Call Evaluation',
			field: 'callEvaluationPoint',
			cellRenderer: (params: any) => (
				<>
					{params ? (
						<div className='d-flex justify-content-center flex-shrink-0'>
							<button
								type='button'
								className='btn btn-outline-primary btn-sm align-middle'
								onClick={() => toggleCallEvaluationModal(params.data.campaignPlayerId, params.data.username, params.data.campaignName)}
								disabled={
									isDisabledCallEvaluationBasedOnCampaignStatus(params.data.campaignStatus) ||
									!userAccess.includes(USER_CLAIMS.UpdateCallEvaluationWrite)
								}
							>
								{callEvaluationDisplay(params.data.campaignPlayerId, params.data.callEvaluationPoint)}
							</button>
						</div>
					) : null}
				</>
			),
		},
		{
			headerName: 'Status',
			field: 'playerStatusName',
			cellRenderer: (params: any) => (
				<>
					{params.data.playerStatusName === 'Active' && (
						<MlabBadge label={params.data.playerStatusName} weight={'light'} type={'badge'} style={ElementStyle.success} />
					)}
					{(params.data.playerStatusName === 'Incomplete' ||
						params.data.playerStatusName === 'Created' ||
						params.data.playerStatusName === 'Initial') && (
						<MlabBadge label={params.data.playerStatusName} weight={'light'} type={'badge'} style={ElementStyle.primary} />
					)}
					{(params.data.playerStatusName === 'Closed by company' ||
						params.data.playerStatusName === 'Closed by player' ||
						params.data.playerStatusName === 'Self excluded' ||
						params.data.playerStatusName === 'Suspended' ||
						params.data.playerStatusName === 'Timed out') && (
						<MlabBadge label={params.data.playerStatusName} weight={'light'} type={'badge'} style={ElementStyle.danger} />
					)}
				</>
			),
		},
		{field: 'brand', headerName: 'Brand', cellRenderer: (params: any) => params.data.brand ?? ''},
		{field: 'currency', headerName: 'Currency', cellRenderer: (params: any) => params.data.currency ?? ''},
		{field: 'country', headerName: 'Country', cellRenderer: (params: any) => params.data.country ?? ''},
		{
			headerName: 'Registration Date',
			field: 'registeredDate',
			cellRenderer: (params: any) => <>{formatDate(params.data.registeredDate)}</>,
		},
		{field: 'ftdAmount', headerName: 'FTD Amount', cellRenderer: (params: any) => params.data.ftdAmount ?? 0},
		{
			headerName: 'FTD Date',
			field: 'ftdDate',
			cellRenderer: (params: any) => <>{params.data.ftdAmount !== 0 ? formatDate(params.data.ftdDate) : null}</>,
		},
		{field: 'agentName', headerName: 'Agent Name', cellRenderer: (params: any) => params.data.agentName ?? ''},
		{
			headerName: 'Primary Goal Reached',
			field: 'primaryGoalReached',
			cellRenderer: (params: any) => <>{params ? (params.data.primaryGoalReached == true ? 'Yes' : 'No') : null}</>,
		},
		{field: 'primaryGoalCount', headerName: 'Primary Goal Count', cellRenderer: (params: any) => params.data.primaryGoalCount ?? 0},
		{field: 'primaryGoalAmount', headerName: 'Primary Goal Amount', cellRenderer: (params: any) => params.data.primaryGoalAmount ?? 0},
		{
			field: 'validIncentivePoints',
			headerName: 'Valid Incentive Points',
			cellRenderer: (params: any) => params.data.validIncentivePoints ?? 0,
		},
		{
			field: 'validIncentiveSourced',
			headerName: 'Valid Incentive Source',
			cellRenderer: (params: any) => params.data.validIncentiveSourced ?? 0,
		},
		{
			field: 'validIncentiveSourcedUSD',
			headerName: 'Valid Incentive Source USD',
			cellRenderer: (params: any) => (params.data.validIncentiveSourcedUSD == 0 ? '' : params.data.validIncentiveSourcedUSD),
		},
		{
			field: 'invalidIncentivePoints',
			headerName: 'Invalid Incentive Points',
			cellRenderer: (params: any) => params.data.invalidIncentivePoints ?? 0,
		},
		{
			field: 'invalidIncentiveSource',
			headerName: 'Invalid Incentive Source',
			cellRenderer: (params: any) => params.data.invalidIncentiveSource ?? 0,
		},
		{
			field: 'invalidIncentiveSourceUSD',
			headerName: 'Invalid Incentive Source USD',
			cellRenderer: (params: any) => (params.data.invalidIncentiveSourceUSD == 0 ? '' : params.data.invalidIncentiveSourceUSD),
		},
		{field: 'incentiveValue', headerName: 'Incentive Value', cellRenderer: (params: any) => params.data.incentiveValue ?? 0},
		{
			headerName: 'Last Call Date',
			field: 'lastCallDate',
			cellRenderer: (params: any) => <>{params.data.callCount !== 0 ? formatDate(params.data.lastCallDate) : null}</>,
		},
		{field: 'lastMessageStatus', headerName: 'Last Call Status', cellRenderer: (params: any) => params.data.lastMessageStatus ?? ''},
		{field: 'callCount', headerName: 'Call Case Count', cellRenderer: (params: any) => params.data.callCount ?? 0},
		{
			field: 'contactableCallCount',
			headerName: 'Contactable Call Count',
			cellRenderer: (params: any) => params.data.contactableCallCount ?? 0,
		},
		{
			headerName: 'Agent Validation Notes',
			field: 'agentValidationNotes',
			cellRenderer: (params: any) => (
				<>
					{params.data.agentValidationNotes !== null ? (
						<div className='d-flex justify-content-center flex-shrink-0'>
							{params.data.agentValidationNotes.length >= 10 ? (
								<button
									type='button'
									className='btn btn-outline-primary btn-sm'
									onClick={() => swal('Agent Validation Notes', params.data.agentValidationNotes)}
								>
									{params.data.agentValidationNotes.substr(0, 10) + '...'}
								</button>
							) : (
								params.data.agentValidationNotes
							)}
						</div>
					) : null}
				</>
			),
		},
		{headerName: 'Leader Justification', field: 'leaderJustification'},
		{
			headerName: 'Leader Validation Notes',
			field: 'leaderValidationNotes',
			cellRenderer: (params: any) => (
				<>
					{params.data.leaderValidationNotes !== null ? (
						<div className='d-flex justify-content-center flex-shrink-0'>
							{params.data.leaderValidationNotes.length >= 10 ? (
								<button
									type='button'
									className='btn btn-outline-primary btn-sm'
									onClick={() => swal('Leader Validation Notes', params.data.leaderValidationNotes)}
								>
									{params.data.leaderValidationNotes.substr(0, 10) + '...'}
								</button>
							) : (
								params.data.leaderValidationNotes
							)}
						</div>
					) : null}
				</>
			),
		},
		{
			headerName: 'Call Evaluation Notes',
			field: 'callEvaluationNotes',
			cellRenderer: (params: any) => (
				<>
					{params.data.callEvaluationNotes !== null ? (
						<div className='d-flex justify-content-center flex-shrink-0'>
							{params.data.callEvaluationNotes.length >= 10 ? (
								<button
									type='button'
									className='btn btn-outline-primary btn-sm'
									onClick={() => swal('Call Evaluation Notes', params.data.callEvaluationNotes)}
								>
									{params.data.callEvaluationNotes.substr(0, 10) + '...'}
								</button>
							) : (
								params.data.callEvaluationNotes
							)}
						</div>
					) : null}
				</>
			),
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
		{field: 'totalDepositAmount', headerName: 'Total Deposit Amount', cellRenderer: (params: any) => params.data.totalDepositAmount ?? 0},
		{field: 'totalDepositCount', headerName: 'Total Deposit Count', cellRenderer: (params: any) => params.data.totalDepositCount ?? 0},
		{
			field: 'depositAttempts',
			headerName: 'Deposit Attempts',
			cellRenderer: (params: any) =>
				params.data.depositAttempts > 0 ? (
					<a href='#' onClick={() => handleShowDepositAttemptsModal(params.data.campaignPlayerId)}>
						{params.data.depositAttempts}
					</a>
				) : (
					''
				),
		},
	];

	const gridRef: any = useRef();
	const dispatch = useDispatch();

	// Auth
	const userId = useSelector<RootState>(({auth}) => auth.userId, shallowEqual) as number;
	const userAccess = useSelector<RootState>(({auth}) => auth.access, shallowEqual) as string;

	// States
	const [gridApi, setGridApi] = useState<any>();
	const [isShowFilter, setShowFilters] = useState<boolean>(true);
	const [isAgentMutipleSelection, setIsAgentMutipleSelection] = useState<boolean>(false);
	const [isLeaderMutipleSelection, setIsLeaderMutipleSelection] = useState<boolean>(false);
	const [isLeaderShowBatch, setIsLeaderShowBatch] = useState<boolean>(false);
	const [isAgentShowBatch, setIsAgentShowBatch] = useState<boolean>(false);
	const [showBatchAgentVationModal, setShowBatchAgentValidationModal] = useState(false);
	const [showBatchLeaderVationModal, setShowBatchLeaderValidationModal] = useState(false);
	const [showAgentValidationModal, setShowAgentValidationModal] = useState(false);
	const [showLeaderVationModal, setShowLeaderValidationModal] = useState(false);
	const [showCallEvaluationModal, setShowCallEvaluationMModal] = useState(false);
	const [showLeaderJustificationSettingModal, setLeaderJustificationSettingModal] = useState(false);
	const [depositAttemptsModal, setDepositAttemptsModal] = useState(false);
	const [batchCampaignPlayerIds, setBatchCampaignPlayerIds] = useState<Array<number>>([]);
	const [selectedCampaignPlayerId, setSelectedCampaignPlayerId] = useState<number>(0);
	const [selectedCampaignUsername, setSelectedCampaignUsername] = useState<string>('');
	const [selectedPlayerCampaignName, setSelectedPlayerCampaignName] = useState<string>('');
	const [hasInvalidSystemValidation, setInvalidSystemValidation] = useState(false);
	const [gridHeight, setGridHeight] = useState<number>(800);
	const [selectedRows, setSelectedRows] = useState<Array<any>>([]);
	const [callListIdDeposits, setCallListIdDeposits] = useState<number>(0);

	// Redux
	const loading = useSelector<RootState>(({callList}) => callList.loading, shallowEqual) as boolean;
	const filterResponseState = useSelector<RootState>(({callList}) => callList.filterResponse, shallowEqual) as CallValidationListResponseModel;
	const pageSize = useSelector<RootState>(({callList}) => callList.pageSize, shallowEqual) as number;
	const currentPage = useSelector<RootState>(({callList}) => callList.currentPage, shallowEqual) as number;
	const leaderJustificationSettings = useSelector<RootState>(
		({callList}) => callList.leaderJustificationSettings,
		shallowEqual
	) as Array<LookupModel>;
	const ROOTSOURCE_PARENT = 'Parent';
	const defaultPageSize = 20;

	const toggleBatchAgentVationModal = () => {
		if (!showBatchAgentVationModal === false) {
			gridApi.deselectAll();
		}

		setSelectedCampaignPlayerId(0);
		setSelectedCampaignUsername('');
		setSelectedPlayerCampaignName('');
		setShowBatchAgentValidationModal(!showBatchAgentVationModal);
		dispatch(callListValidationMgt.actions.loadList(Guid.create().toString()));
	};

	const toggleBatchLeaderVationModal = () => {
		if (!showBatchLeaderVationModal === false) {
			gridApi.deselectAll();
		}

		setSelectedCampaignPlayerId(0);
		setSelectedCampaignUsername('');
		setSelectedPlayerCampaignName('');
		setShowBatchLeaderValidationModal(!showBatchLeaderVationModal);
		dispatch(callListValidationMgt.actions.loadList(Guid.create().toString()));
	};

	const toggleJustificationSettingModal = () => {
		setLeaderJustificationSettingModal(!showLeaderJustificationSettingModal);
	};

	const toggleAgentValidationModal = (
		id: number,
		campaignPlayerUsername: string,
		playerCampaignName: string,
		isAgentValidated: Boolean,
		rootSource: string
	) => {
		if (isAgentValidated === true && rootSource === ROOTSOURCE_PARENT) {
			swal({
				title: 'Confirmation',
				text: 'Record has been validated. Please confirm if you want to proceed',
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
			}).then((isYes) => {
				if (isYes) {
					setSelectedCampaignPlayerId(id);
					setSelectedCampaignUsername(campaignPlayerUsername);
					setSelectedPlayerCampaignName(playerCampaignName);
					setShowAgentValidationModal(!showAgentValidationModal);
					dispatch(callListValidationMgt.actions.loadList(Guid.create().toString()));
				}
			});
		} else {
			setSelectedCampaignPlayerId(id);
			setSelectedCampaignUsername(campaignPlayerUsername);
			setSelectedPlayerCampaignName(playerCampaignName);
			setShowAgentValidationModal(!showAgentValidationModal);
			dispatch(callListValidationMgt.actions.loadList(Guid.create().toString()));
		}
	};

	const toggleLeaderVationModal = (
		id: number,
		campaignPlayerUsername: string,
		playerCampaignName: string,
		isLeaderValidated: boolean,
		rootSource: string
	) => {
		if (isLeaderValidated === true && rootSource === ROOTSOURCE_PARENT) {
			swal({
				title: 'Confirmation',
				text: 'Record has been validated. Please confirm if you want to proceed',
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
			}).then((isYes) => {
				if (isYes) {
					setSelectedCampaignPlayerId(id);
					setSelectedCampaignUsername(campaignPlayerUsername);
					setSelectedPlayerCampaignName(playerCampaignName);
					setShowLeaderValidationModal(!showLeaderVationModal);
					dispatch(callListValidationMgt.actions.loadList(Guid.create().toString()));
				}
			});
		} else {
			setSelectedCampaignPlayerId(id);
			setSelectedCampaignUsername(campaignPlayerUsername);
			setSelectedPlayerCampaignName(playerCampaignName);
			setShowLeaderValidationModal(!showLeaderVationModal);
			dispatch(callListValidationMgt.actions.loadList(Guid.create().toString()));
		}
	};

	const toggleCallEvaluationModal = (id: number, campaignPlayerUsername: string, playerCampaignName: string) => {
		setSelectedCampaignPlayerId(id);
		setSelectedCampaignUsername(campaignPlayerUsername);
		setSelectedPlayerCampaignName(playerCampaignName);
		setShowCallEvaluationMModal(!showCallEvaluationModal);
		dispatch(callListValidationMgt.actions.loadList(Guid.create().toString()));
	};

	const handleShowDepositAttemptsModal = (callListId: number) => {
		setCallListIdDeposits(callListId);
		toggleDepositAttemptsModal();
	};

	const toggleDepositAttemptsModal = () => {
		setDepositAttemptsModal(!depositAttemptsModal);
	};

	const loadCallList = () => {
		dispatch(callListValidationMgt.actions.setLoading(true));
		dispatch(callListValidationMgt.actions.loadList(Guid.create().toString()));
	};

	const onClickFirst = () => {
		if (currentPage > 1) {
			dispatch(callListValidationMgt.actions.setCurrentPage(1));
			loadCallList();
		}
	};

	const onClickPrevious = () => {
		if (currentPage > 1) {
			dispatch(callListValidationMgt.actions.setCurrentPage(currentPage - 1));
			loadCallList();
		}
	};

	const onClickNext = () => {
		if (totalPage() > currentPage) {
			dispatch(callListValidationMgt.actions.setCurrentPage(currentPage + 1));
			loadCallList();
		}
	};

	const onClickLast = () => {
		if (totalPage() > currentPage) {
			dispatch(callListValidationMgt.actions.setCurrentPage(totalPage()));
			loadCallList();
		}
	};

	const totalPage = () => {
		return Math.ceil(filterResponseState.recordCount / pageSize) | 0;
	};

	const onPageSizeChanged = () => {
		var rowData = filterResponseState.callValidations;
		var value: string = (document.getElementById('page-size') as HTMLInputElement).value;
		dispatch(callListValidationMgt.actions.setPageSize(Number(value)));
		dispatch(callListValidationMgt.actions.setCurrentPage(1));

		if (rowData != undefined && rowData.length > 0) {
			loadCallList();
		}

		switch (Number(value)) {
			case defaultPageSize:
				setGridHeight(800);
				break;
			default:
				setGridHeight(1200);
				break;
		}
	};

	const onSelectionChanged = () => {
		var selectedRows = gridApi && gridApi.getSelectedRows();
		setSelectedRows(selectedRows);
	};

	const onSort = async (e: any) => {
		var rowData = filterResponseState.callValidations;
		//dispatch(callListValidationMgt.actions.setPageSize(1))

		if (rowData != undefined && rowData.length > 0) {
			var sortDetail = e.api.getSortModel();
			if (sortDetail[0] != undefined) {
				dispatch(callListValidationMgt.actions.setSortColumn(sortDetail[0]?.colId));
				dispatch(callListValidationMgt.actions.setSortOrder(sortDetail[0]?.sort));
				loadCallList();
			} else {
				dispatch(callListValidationMgt.actions.setSortColumn('CampaignPlayerId'));
				dispatch(callListValidationMgt.actions.setSortOrder('ASC'));
				loadCallList();
			}
		}
	};

	const onGridReady = (params: any) => {
		setGridApi(params.api);
	};

	const isDisabledAgentBasedOnCampaignStatus = (status: number): boolean => {
		let isDisabled: boolean = false;

		if (status === CampaignStatusEnum.Onhold || status === CampaignStatusEnum.Completed) {
			isDisabled = true;
		}
		return isDisabled;
	};

	const isDisabledLeaderBasedOnCampaignStatus = (status: number): boolean => {
		let isDisabled: boolean = false;

		if (status === CampaignStatusEnum.Onhold || status === CampaignStatusEnum.Completed) {
			isDisabled = true;
		}
		return isDisabled;
	};

	const isDisabledCallEvaluationBasedOnCampaignStatus = (status: number): boolean => {
		let isDisabled: boolean = false;

		if (status === CampaignStatusEnum.Completed) {
			isDisabled = true;
		}
		return isDisabled;
	};

	const callEvaluationDisplay = (campaignPlayerId: number, callPoint?: number) => {
		let displayResult: string = 'Add';

		if (filterResponseState.callEvaluations) {
			let existCallEvaluation = filterResponseState.callEvaluations.find((x) => x.campaignPlayerId === campaignPlayerId);

			if (existCallEvaluation) {
				if (callPoint === null) {
					displayResult = 'NA';
				} else if (callPoint! >= 0) {
					displayResult = callPoint!.toString();
				}
			}
		}

		return displayResult;
	};

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

	useEffect(() => {
		loadUserGridCustomDisplay();
	}, []);

	useEffect(() => {
		// added interval due to loading overlay issue
		if (gridRef.current.api != null) {
			setTimeout(() => {
				if (loading) gridRef.current.api?.showLoadingOverlay();
				else gridRef.current.api?.hideOverlay();
			}, 10);
		}
	}, [loading]);

	useEffect(() => {
		let batches = Object.assign(new Array<number>(), batchCampaignPlayerIds);
		setIsAgentMutipleSelection(false);
		setIsLeaderMutipleSelection(false);
		setInvalidSystemValidation(false);
		setIsLeaderShowBatch(false);
		setIsAgentShowBatch(false);
		let isSystemValidationEnabledPerPlayer: boolean = false;
		let isMyPlayers: boolean = false;
		let isNotPlayers: boolean = false;
		let currentCampaignStatus: number = 0;
		let currentSelected: Array<CallValidationResponseModel> = Object.assign(new Array<CallValidationResponseModel>(), selectedRows);
		if (currentSelected.length > 0) {
			isMyPlayers = currentSelected.filter((x) => x.agentId === userId).length > 0;
			isNotPlayers = currentSelected.filter((x) => x.agentId !== userId).length > 0;
		}

		if (selectedRows.length > 1) {
			for (let i = 0; i <= selectedRows.length - 1; i++) {
				let row = selectedRows[i];
				let batchItem = batches.find((x) => x === row.campaignPlayerId);
				if (typeof batchItem === 'undefined') {
					batches.push(row.campaignPlayerId);
				}
				currentCampaignStatus = row.campaignStatus;
			}

			let sRows: Array<CallValidationResponseModel> = Object.assign(new Array<CallValidationResponseModel>(), selectedRows);
			let temporaryBatches = Object.assign(new Array<number>(), batches);

			for (let i = 0; i <= temporaryBatches.length - 1; i++) {
				let row = temporaryBatches[i];
				let existItem = sRows.find((x) => x.campaignPlayerId === row);
				if (typeof existItem === 'undefined') {
					batches.splice(i, 1);
				}
			}

			setBatchCampaignPlayerIds(batches);

			if (!isDisabledAgentBasedOnCampaignStatus(currentCampaignStatus)) {
				if (selectedRows.length > 1) {
					setIsAgentShowBatch(true);
					if (userAccess.includes(USER_CLAIMS.UpdateAllAgentValidationsWrite) === true || (isMyPlayers === true && isNotPlayers === false)) {
						setIsAgentMutipleSelection(true);
					}
				}
			}

			if (!isDisabledLeaderBasedOnCampaignStatus(currentCampaignStatus)) {
				if (selectedRows.length > 1) {
					setIsLeaderShowBatch(true);
					if (userAccess.includes(USER_CLAIMS.UpdateLeaderValidationWrite) === true) {
						setIsLeaderMutipleSelection(true);
					}
				}
			}
		} else {
			setBatchCampaignPlayerIds([]);
		}
	}, [selectedRows]);

	return (
		<div className='d-flex flex-column flex-lg-row'>
			{
				<div style={isShowFilter === false ? {display: 'none'} : undefined}>
					<CallListValidationFilters />
				</div>
			}

			{/* CONTENT */}
			<div className='flex-lg-row-fluid'>
				<MainContainer>
					<ContentContainer>
						<div className='d-flex my-4'>
							<div className='d-flex ms-auto p-2 bd-highlight'>
								<button type='button' className='btn btn-primary btn-sm me-2' onClick={() => setShowFilters(!isShowFilter)}>
									{' '}
									<FontAwesomeIcon icon={faFilter} /> {isShowFilter == true ? 'Hide Filters' : 'Show Filters'}
								</button>
								<button
									type='button'
									className='btn btn-primary btn-sm me-2'
									onClick={toggleBatchAgentVationModal}
									disabled={!isAgentMutipleSelection}
									hidden={!isAgentShowBatch}
								>
									{' '}
									<FontAwesomeIcon icon={faUsersCog} /> Agent Validation
								</button>
								<button
									type='button'
									className='btn btn-primary btn-sm me-2'
									onClick={toggleBatchLeaderVationModal}
									disabled={!isLeaderMutipleSelection}
									hidden={!isLeaderShowBatch}
								>
									{' '}
									<FontAwesomeIcon icon={faUsersCog} /> Leader Validation
								</button>
								{userAccess.includes(USER_CLAIMS.UpdateLeaderValidationWrite) === true && (
									<button
										type='button'
										className='btn btn-primary btn-sm me-2'
										onClick={() => setLeaderJustificationSettingModal(!showLeaderJustificationSettingModal)}
									>
										<FontAwesomeIcon icon={faCogs} /> Leader Justification Setting
									</button>
								)}
							</div>
						</div>
						<div className='ag-theme-quartz mt-5' style={{height: gridHeight, width: '100%', marginBottom: '50px', padding: '0 0 28px 0'}}>
							<AgGridReact
								rowData={filterResponseState.callValidations}
								defaultColDef={{
									sortable: true,
									resizable: true,
								}}
								onGridReady={onGridReady}
								rowBuffer={0}
								enableRangeSelection={true}
								pagination={false}
								paginationPageSize={pageSize}
								columnDefs={columnDefs}
								onSortChanged={(e) => onSort(e)}
								rowSelection={'multiple'}
								onSelectionChanged={onSelectionChanged}
								overlayLoadingTemplate={gridOverlayTemplate}
								animateRows={true}
								ref={gridRef}
								rowStyle={{userSelect: 'text'}}
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
					</ContentContainer>
				</MainContainer>
			</div>

			<BatchAgentValidations
				modal={showBatchAgentVationModal}
				toggle={toggleBatchAgentVationModal}
				batchCampaignPlayerIds={batchCampaignPlayerIds}
				selectedAgentValidationDetail={filterResponseState.agentValidations}
				currentData={filterResponseState.callValidations}
			/>
			<BatchLeaderValidations
				modal={showBatchLeaderVationModal}
				toggle={toggleBatchLeaderVationModal}
				batchCampaignPlayerIds={batchCampaignPlayerIds}
				selectedLeaderValidationDetail={filterResponseState.leaderValidations}
				leaderJustificationSettings={leaderJustificationSettings}
				currentData={filterResponseState.callValidations}
			/>
			<LeaderJustificationSettings modal={showLeaderJustificationSettingModal} toggle={toggleJustificationSettingModal} />

			<AgentValidation
				modal={showAgentValidationModal}
				toggle={toggleAgentValidationModal}
				selectedCampaignPlayerId={selectedCampaignPlayerId}
				selectedCampaignUsername={selectedCampaignUsername}
				selectedPlayerCampaignName={selectedPlayerCampaignName}
				selectedAgentValidationDetail={filterResponseState.agentValidations}
			/>
			<LeaderValidation
				modal={showLeaderVationModal}
				toggle={toggleLeaderVationModal}
				selectedCampaignPlayerId={selectedCampaignPlayerId}
				selectedCampaignUsername={selectedCampaignUsername}
				selectedPlayerCampaignName={selectedPlayerCampaignName}
				selectedLeaderValidationDetail={filterResponseState.leaderValidations}
				leaderJustificationSettings={leaderJustificationSettings}
			/>
			<CallEvaluation
				modal={showCallEvaluationModal}
				toggle={toggleCallEvaluationModal}
				selectedCampaignPlayerId={selectedCampaignPlayerId}
				selectedCampaignUsername={selectedCampaignUsername}
				selectedPlayerCampaignName={selectedPlayerCampaignName}
				selectedCallEvaluationDetail={filterResponseState.callEvaluations}
			/>

			<DepositAtteptsModal callListId={callListIdDeposits} modal={depositAttemptsModal} toggle={toggleDepositAttemptsModal} />
		</div>
	);
};

export default CallListValidation;

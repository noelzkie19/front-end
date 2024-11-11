import {faMinusSquare, faPlusSquare} from '@fortawesome/free-solid-svg-icons';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {right} from '@popperjs/core';
import {AgGridReact} from 'ag-grid-react';
import 'datatables.net';
import 'datatables.net-dt';
import {useFormik} from 'formik';
import {Guid} from 'guid-typescript';
import $ from 'jquery';
import React, {useEffect, useState} from 'react';
import {shallowEqual, useDispatch, useSelector} from 'react-redux';
import Select from 'react-select';
import swal from 'sweetalert';
import '../../../../../_metronic/assets/css/datatables.min.css';
import * as hubConnection from '../../../../../setup/hub/MessagingHub';
import {RootState} from '../../../../../setup/redux/RootReducer';
import {LookupModel} from '../../../../common/model';
import {ElementStyle} from '../../../../constants/Constants';
import {FormContainer, MlabButton, NumberTextInput} from '../../../../custom-components';
import DefaultDatePicker from '../../../../custom-components/date-range-pickers/DefaultDatePicker';
import DefaultGridPagination from '../../../../custom-components/grid-pagination/DefaultGridPagination';
import {useMasterReferenceOption} from '../../../../custom-functions';
import CommonLookups from '../../../../custom-functions/CommonLookups';
import useFnsDateFormatter from '../../../../custom-functions/helper/useFnsDateFormatter';
import {SwalDetails} from '../../../system/components/constants/CampaignSetting';
import {MessageResponseList} from '../../../system/models';
import {GetMessageResponseList} from '../../../system/models/requests/GetMessageResponseList';
import {GetMessageStatusListRequest} from '../../../system/models/requests/GetMessageStatusListRequest';
import {GetMessageStatusListResponse} from '../../../system/models/response/GetMessageStatusListResponse';
import * as system from '../../../system/redux/SystemRedux';
import {
	getMessageResponseList,
	getMessageStatusList,
	sendGetMessageResponseList,
	sendGetMessageStatusList,
} from '../../../system/redux/SystemService';
import {useSystemOptionHooks} from '../../../system/shared';
import {USER_CLAIMS} from '../../../user-management/components/constants/UserClaims';
import {UserInfoListModel} from '../../../user-management/models/UserInfoListModel';
import {getUserListOption, getUserLookups} from '../../../user-management/redux/UserManagementService';
import {PLAYER_CONTANTS} from '../../constants/PlayerContants';
import {PlayerCaseModel} from '../../models/PlayerCaseModel';
import {PlayerCaseRequestModel} from '../../models/PlayerCaseRequestModel';
import {GetPlayerCampaignLookups, GetPlayerCaseList} from '../../redux/PlayerManagementService';
import { ColDef, ColGroupDef } from 'ag-grid-community';


const initialValues = {
	caseId: '',
	communicationId: '',
	createdBy: '',
};

const styleHideDetails = {
	display: 'none',
};

interface Props {
	playerId: string;
	brand: string;
	username: string;
	mlabPlayerId: number;
}

let filterTimeout: any;

const PlayerCaseComm: React.FC<Props> = ({playerId, brand, username, mlabPlayerId}) => {
	/**
	 *  ? Redux
	 */
	const userAccess = useSelector<RootState>(({auth}) => auth.access, shallowEqual) as string;
	const userAccessId = useSelector<RootState>(({auth}) => auth.userId, shallowEqual) as number;
	const dispatch = useDispatch();

	/**
	 *  ? Hooks
	 */
	const {getMessageTypeOptionList, messageTypeOptionList} = useSystemOptionHooks();
	const {mlabFormatDate} = useFnsDateFormatter();

	/**
	 *  ? States
	 */
	const [loading, setLoading] = useState(false);
	const [pageSize, setPageSize] = useState<number>(10);
	const [currentPage, setCurrentPage] = useState<number>(1);
	const [recordCount, setRecordCount] = useState<number>(0);
	const [sortOrder, setSortOrder] = useState<string>('');
	const [sortColumn, setSortColumn] = useState<string>('');
	const [caseCommToggle, setCaseCommToggle] = useState<boolean>(false);
	const [filterCreatedDate, setFilterCreatedDate] = useState<any>();
	const [filterCaseStatus, setFilterCaseStatus] = useState<LookupModel | null>();
	const [filterMessageResponse, setFilterMessageResponse] = useState<LookupModel | null>();
	const [filterCaseId, setFilterCaseId] = useState<number | null>(0);
	const [filterMessageType, setFilterMessageType] = useState<LookupModel | null>();
	const [filterCampaignName, setFilterCampaignName] = useState<LookupModel | null>();
	const [filterUser, setFilterUser] = useState<LookupModel | null>();
	const [filterCommId, setFilterCommId] = useState<number | null>(0);
	const [filterMessageStatus, setFilterMessageStatus] = useState<LookupModel | null>();
	const [filterCampaignType, setFilterCampaignType] = useState<LookupModel | null>();
	const [filterCaseType, setFilterCaseType] = useState<LookupModel | null>();
	const [playerCaseList, setPlayerCaseList] = useState<Array<PlayerCaseModel>>([]);
	const [campaignList, setCampaignList] = useState<Array<LookupModel>>([]);
	const [userList, setUserList] = useState<Array<LookupModel>>([]);
	const [messageStatusOptions, setMessageStatusOptions] = useState<Array<LookupModel>>([]);
	const [messageResponsesOptions, setMessageResponsesOptions] = useState<Array<LookupModel>>([]);
	const [campaignTypeOptions, setCampaignTypeOptions] = useState<Array<LookupModel>>([]);
	const messageTypeCLList = CommonLookups('messageTypes');
	const campaignTypeList = useMasterReferenceOption(PLAYER_CONTANTS.MasterReference_Campaign_Type_Parent_Id);

	useEffect(() => {
		loadCreatedBy();
		getMessageTypeOptionList('');
	}, []);

	useEffect(() => {
		if (filterMessageType) {
			setMessageStatusOptions([]);
			setFilterMessageStatus(null);
			filterMessageType.value = messageTypeCLList.find((x) => x.label === filterMessageType.label)?.value;
			_getMessageStatusList(Number(filterMessageType.value));
		}
	}, [filterMessageType]);

	useEffect(() => {
		if (filterMessageStatus) {
			setMessageResponsesOptions([]);
			setFilterMessageResponse(null);
			_getMessageResponseList(Number(filterMessageStatus.value));
		}
	}, [filterMessageStatus]);

	useEffect(() => {
		const table = $('.table-playerCase').find('table').DataTable();
		table.clear();
		table.rows.add(playerCaseList);
		table
			.on('order.dt search.dt', function () {
				table
					.column(0, {search: 'applied', order: 'applied'})
					.nodes()
					.each(function (cell, i) {
						cell.innerHTML = i + 1;
					});
			})
			.draw();
	}, [playerCaseList]);

	useEffect(() => {
		let campaingType = undefined;
		if (filterCampaignType) {
			campaingType = Number(filterCampaignType.value);
		}
		GetPlayerCampaignLookups(campaingType).then((result) => {
			setCampaignList(Object.assign(new Array<LookupModel>(), result.data));
		});
	}, [filterCampaignType]);

	const onGridReady = (params: any) => {
		params.api.sizeColumnsToFit();
	};

	/**
	 *  ? Table And Configs
	 */
	const renderPlayerCaseCommCaseId = (_params: any) => (
		<>
			{userAccess.includes(USER_CLAIMS.ViewCaseRead) ? (
				<a
					href={
						(_params.data.caseTypeId == PLAYER_CONTANTS.CaseType_Campaign_Id ? '/campaign-workspace/view-case/' : '/case-management/service-case/') +
						_params.data.caseId
					}
					target='_blank'
				>
					{_params.data.caseId}
				</a>
			) : (
				_params.data.caseId
			)}
		</>
	);

	const renderPlayerCaseCommId = (_params: any) => (
		<>
			{userAccess.includes(USER_CLAIMS.ViewCommunicationRead) ? (
				<a
					href={
						_params.data.caseTypeId == PLAYER_CONTANTS.CaseType_Campaign_Id
							? '/campaign-workspace/view-communication/' + _params.data.communicationId
							: '/case-management/service-case/' + _params.data.caseId + '#' + _params.data.communicationId
					}
					target='_blank'
				>
					{_params.data.communicationId}
				</a>
			) : (
				_params.data.communicationId
			)}
		</>
	);

	const renderPlayerCaseCreatedDate = (_data: any) => {
		return mlabFormatDate(_data.data.caseCreatedDate, 'yyyy-MM-dd HH:mm');
	};

	const renderPlayerCaseCommCreatedDate = (_data: any) => {
		return mlabFormatDate(_data.data.createdDate, 'yyyy-MM-dd HH:mm');
	};

	const customComparator = (valueA: string, valueB: string) => {
		return valueA.toLowerCase().localeCompare(valueB.toLowerCase());
	};

	const columnDefs : (ColDef<PlayerCaseModel> | ColGroupDef<PlayerCaseModel>)[] = [
		{headerName: 'No', valueGetter: ('node.rowIndex + 1 + ' + (currentPage - 1) * pageSize).toString(), sortable: false, width: 60},
		{headerName: 'Case Type', field: 'caseType'},
		{
			headerName: 'Case ID',
			field: 'caseId',
			width: 100,
			cellRenderer: renderPlayerCaseCommCaseId,
		},
		{headerName: 'Case Status', field: 'caseStatus'},
		{
			headerName: 'Communication ID',
			field: 'communicationId',
			width: 170,
			cellRenderer: renderPlayerCaseCommId,
		},
		{headerName: 'Message Type', field: 'messageType', comparator: customComparator},
		{headerName: 'Message Status', field: 'messageStatus', comparator: customComparator},
		{headerName: 'Message Response', field: 'messageResponse', comparator: customComparator},
		{headerName: 'Campaign Type', field: 'camapaignType', comparator: customComparator},
		{headerName: 'Campaign Name', field: 'campaingName', comparator: customComparator, width: 250},
		{headerName: 'Case Created By', field: 'createdByName', comparator: customComparator},
		{
			headerName: 'Case Created Date',
			field: 'caseCreatedDate',
			width: 260,
			valueFormatter: renderPlayerCaseCreatedDate,
		},
		{headerName: 'Communication Created By', field: 'communicationCreatedBy', comparator: customComparator},
		{
			headerName: 'Communication Created Date',
			field: 'createdDate',
			width: 260,
			valueFormatter: renderPlayerCaseCommCreatedDate,
		},
	];

	const tableLoader = (data: any) => {
		return (
			<div className='ag-custom-loading-cell' style={{paddingLeft: '10px', lineHeight: '25px'}}>
				<i className='fas fa-spinner fa-pulse'></i> <span> {data.loadingMessage}</span>
			</div>
		);
	};

	// -----------------------------------------------------------------
	// METHDODS
	// -----------------------------------------------------------------

	function loadFilteredCreatedBy(filter: string | null) {
		getUserLookups(filter).then((result) => {
			setUserList(Object.assign(new Array<LookupModel>(), result.data));
		});
	}

	function loadCreatedBy() {
		getUserListOption().then((result) => {
			let resultData = Object.assign(new Array<UserInfoListModel>(), result.data);
			let userTempList = Array<LookupModel>();
			//default for administrator
			userTempList.push({
				value: '0',
				label: 'Administrator',
			});
			resultData.forEach((user) => {
				const userOption: LookupModel = {
					value: user.userId.toString(),
					label: user.fullName,
				};
				userTempList.push(userOption);
			});
			setUserList(userTempList.filter((thing, i, arr) => arr.findIndex((t) => t.value === thing.value) === i));
		});
	}

	function onChangeCaseCommCreatedDate(val: any) {
		setFilterCreatedDate(val);
	}

	const onClickToggle = () => {
		setCaseCommToggle(!caseCommToggle);
	};

	async function loadPlayerCaseList(
		pageSize: number,
		currentPage: number,
		sortColumn: string,
		sortOrder: string,
		caseId: number | null,
		commId: number | null
	) {
		const request: PlayerCaseRequestModel = {
			mlabPlayerId: mlabPlayerId,
			brandName: brand,
			createdDate: filterCreatedDate == null ? undefined : mlabFormatDate(filterCreatedDate.toDateString(), 'MM/d/yyyy HH:mm:ss'),
			caseId: caseId == null ? undefined : caseId,
			communicationId: commId == null ? undefined : commId,
			caseStatus: filterCaseStatus == undefined ? undefined : Number(filterCaseStatus.value),
			messageTypeId: filterMessageType == undefined ? undefined : Number(filterMessageType.value),
			messageStatusId: filterMessageStatus == undefined ? undefined : Number(filterMessageStatus.value),
			messageResponseId: filterMessageResponse == undefined ? undefined : Number(filterMessageResponse.value),
			campaignNameId: filterCampaignName == undefined ? undefined : Number(filterCampaignName.value),
			createdBy: filterUser == undefined ? undefined : Number(filterUser.value),
			pageSize: pageSize,
			offsetValue: (currentPage - 1) * pageSize,
			sortColumn: sortColumn,
			sortOrder: sortOrder,
			campaignTypeId: filterCampaignType == undefined ? undefined : Number(filterCampaignType.value),
			caseTypeId: filterCaseType == undefined ? undefined : Number(filterCaseType.value),
		};

		await GetPlayerCaseList(request)
			.then((response) => {
				if (response.status === 200) {
					let playerCases = response.data?.playerCases;
					setRecordCount(response.data.recordCount);
					setPlayerCaseList(playerCases);
					setLoading(false);
				}
			})
			.catch((ex) => {
				setLoading(false);
			});
	}

	const _getMessageStatusList = (messageTypeIdFilter: number) => {
		setTimeout(() => {
			//FETCH TO API
			const messagingHub = hubConnection.createHubConnenction();
			messagingHub
				.start()
				.then(() => {
					// CHECKING STATE CONNECTION
					if (messagingHub.state === 'Connected') {
						// PARAMETER TO PASS ON API GATEWAY //
						const request: GetMessageStatusListRequest = {
							queueId: Guid.create().toString(),
							userId: userAccessId.toString(),
							messageStatusName: '',
							messageStatusStatus: '',
							messageTypeId: messageTypeIdFilter,
							messageTypeIds: '',
						};
						// REQUEST FIRST TO GATEWAY IF TRANSACTION WAS VALID
						sendGetMessageStatusList(request)
							.then((response) => {
								// IF REQUEST IS SUCCESS THEN CONSUME CALLBACK API
								if (response.status === 200) {
									messagingHub.on(request.queueId.toString(), (message) => {
										getMessageStatusList(message.cacheId)
											.then((data) => {
												let resultData = Object.assign(new Array<GetMessageStatusListResponse>(), data.data);
												setMessageStatusOptions(
													Object.assign(new Array<LookupModel>(), resultData).map((item: GetMessageStatusListResponse) => ({
														label: item.messageStatusName,
														value: item.messageStatusId.toString(),
													}))
												);
												dispatch(system.actions.getMessageStatusList(resultData));
											})
											.catch(() => {
												setLoading(false);
											});
										messagingHub.off(request.queueId.toString());
										messagingHub.stop();
									});
									setTimeout(() => {
										if (messagingHub.state === 'Connected') {
											messagingHub.stop();
											setLoading(false);
										}
									}, 30000);
								} else {
									messagingHub.stop();
									swal('Failed', response.data.message, 'error');
								}
							})
							.catch(() => {
								messagingHub.stop();
								swal('Failed', 'Problem in getting message type list', 'error');
							});
					} else {
						swal('Failed', 'Problem connecting to the server, Please refresh', 'error');
					}
				})
				.catch((err) => console.log('Error while starting connection: ' + err));
		}, 1000);
	};

	const _getMessageResponseList = (messageStatusIdFilter: number) => {
		setTimeout(() => {
			//FETCH TO API
			const messagingHub = hubConnection.createHubConnenction();
			messagingHub
				.start()
				.then(() => {
					// CHECKING STATE CONNECTION
					if (messagingHub.state === 'Connected') {
						// PARAMETER TO PASS ON API GATEWAY //
						const request: GetMessageResponseList = {
							queueId: Guid.create().toString(),
							userId: userAccessId.toString(),
							messageResponseName: '',
							messageResponseStatus: '',
							messageStatusId: 0,
							messageStatusIds: messageStatusIdFilter.toString(),
						};

						// REQUEST FIRST TO GATEWAY IF TRANSACTION WAS VALID
						sendGetMessageResponseList(request)
							.then((response) => {
								// IF REQUEST IS SUCCESS THEN CONSUME CALLBACK API
								if (response.status === 200) {
									messagingHub.on(request.queueId.toString(), (message) => {
										// CALLBACK API
										console.log(message.cacheId);
										getMessageResponseList(message.cacheId)
											.then((data) => {
												console.log(data);
												let resultData = Object.assign(new Array<MessageResponseList>(), data.data);
												setMessageResponsesOptions(
													Object.assign(new Array<LookupModel>(), resultData).map((item: MessageResponseList) => ({
														label: item.messageResponseName,
														value: item.messageResponseId.toString(),
													}))
												);
												console.log(resultData);
												dispatch(system.actions.getMessageResponseList(resultData));
											})
											.catch(() => {
												setLoading(false);
											});
										messagingHub.off(request.queueId.toString());
										messagingHub.stop();
									});

									setTimeout(() => {
										if (messagingHub.state === 'Connected') {
											messagingHub.stop();
											setLoading(false);
										}
									}, 30000);
								} else {
									messagingHub.stop();
									swal('Failed', response.data.message, 'error');
								}
							})
							.catch(() => {
								messagingHub.stop();
								swal('Failed', 'Problem in getting message response list', 'error');
							});
					} else {
						swal('Failed', 'Problem connecting to the server, Please refresh', 'error');
					}
				})
				.catch((err) => console.log('Error while starting connection: ' + err));
		}, 1000);
	};

	const onClickClearFilter = () => {
		formik.setFieldValue('caseId', initialValues.caseId);
		formik.setFieldValue('communicationId', initialValues.communicationId);
		formik.setFieldValue('createdBy', initialValues.createdBy);

		setFilterCreatedDate(null);
		setFilterCaseStatus(null);
		setFilterMessageResponse(null);
		setFilterMessageType(null);
		setFilterCampaignName(null);
		setFilterMessageStatus(null);
		setFilterUser(null);
		setFilterCaseType(null);
		setFilterCampaignType(null);
	};

	function onChangeCaseStatus(val: LookupModel) {
		setFilterCaseStatus(val);
	}
	function onChangeMessageResponse(val: LookupModel) {
		setFilterMessageResponse(val);
	}
	function onChangeMessageType(val: LookupModel) {
		setFilterMessageType(val);
		if (val == null) {
			setFilterMessageStatus(null);
		}
	}
	function onChangeCampaignName(val: LookupModel) {
		setFilterCampaignName(val);
	}
	function onChangeMessageStatus(val: LookupModel) {
		setFilterMessageStatus(val);
		if (val == null) {
			setFilterMessageResponse(null);
		}
	}
	function onChangeCreatedBy(val: LookupModel) {
		setFilterUser(val);

		//when clear search
		if (val == null) {
			loadCreatedBy();
		}
	}
	function onChangeCaseType(val: LookupModel) {
		if (val.value == PLAYER_CONTANTS.CaseType_Campaign_Id.toString()) {
			const campaignTypes = campaignTypeList
				.filter((obj) => obj.masterReferenceParentId.toString() == PLAYER_CONTANTS.MasterReference_Campaign_Type_Parent_Id)
				.map((obj) => obj.options);
			setCampaignTypeOptions(campaignTypes);
		} else {
			setCampaignTypeOptions([]);
			setFilterCampaignType(null);
		}

		setFilterCaseType(val);
	}
	function onChangeCampaignType(val: LookupModel) {
		setFilterCampaignType(val);
	}
	function onKeyDownCreatedBy(e: any) {
		var filterValue = e.target.value + e.key;
		clearTimeout(filterTimeout);

		if (filterValue.length > 2 && e.keyCode >= 65 && e.keyCode <= 90) {
			filterTimeout = setTimeout(() => {
				//console.log('======>' + filterValue.length + '|' + filterValue)
				loadFilteredCreatedBy(e.target.value);
			}, 1000);
		}

		if (filterValue == '') {
			loadCreatedBy();
		}
	}

	// -----------------------------------------------------------------
	// CUSTOM PAGINATION METHODS
	// -----------------------------------------------------------------

	const CreateCaseBtn = () => (
		<MlabButton
			access={true}
			size={'sm'}
			label={'Create Case'}
			style={ElementStyle.primary}
			type={'button'}
			weight={'solid'}
			onClick={() => {
				const win: any = window.open(`/case-management/create-case/${playerId}/${brand}/${username}`, '_blank');
				win.focus();
			}}
			disabled={!userAccess.includes(USER_CLAIMS.CreateCustomerCaseWrite)}
		/>
	);

	const onPageSizeChanged = () => {
		var value: string = (document.getElementById('page-size') as HTMLInputElement).value;
		setPageSize(Number(value));
		setCurrentPage(1);

		if (playerCaseList != undefined && playerCaseList.length > 0) {
			loadPlayerCaseList(Number(value), 1, sortColumn, sortOrder, filterCaseId, filterCommId);
		}
	};

	const onClickFirst = () => {
		if (currentPage > 1) {
			setCurrentPage(1);
			loadPlayerCaseList(pageSize, 1, sortColumn, sortOrder, filterCaseId, filterCommId);
		}
	};

	const onClickPrevious = () => {
		if (currentPage > 1) {
			setCurrentPage(currentPage - 1);
			loadPlayerCaseList(pageSize, currentPage - 1, sortColumn, sortOrder, filterCaseId, filterCommId);
		}
	};

	const onClickNext = () => {
		if (totalPage() > currentPage) {
			setCurrentPage(currentPage + 1);
			loadPlayerCaseList(pageSize, currentPage + 1, sortColumn, sortOrder, filterCaseId, filterCommId);
		}
	};

	const onClickLast = () => {
		if (totalPage() > currentPage) {
			setCurrentPage(totalPage());
			loadPlayerCaseList(pageSize, totalPage(), sortColumn, sortOrder, filterCaseId, filterCommId);
		}
	};

	const totalPage = () => {
		return Math.ceil(recordCount / pageSize) | 0;
	};

	const onSort = (e: any) => {
		if (playerCaseList != undefined && playerCaseList.length > 0) {
			var sortDetail = e.api.getSortModel();
			setCurrentPage(1);

			if (sortDetail[0] != undefined) {
				setSortColumn(sortDetail[0]?.colId);
				setSortOrder(sortDetail[0]?.sort);
				loadPlayerCaseList(pageSize, 1, sortDetail[0]?.colId, sortDetail[0]?.sort, filterCaseId, filterCommId);
			} else {
				setSortColumn('');
				setSortOrder('');
				loadPlayerCaseList(pageSize, 1, '', '', filterCaseId, filterCommId);
			}
		}
	};

	// -----------------------------------------------------------------
	// FORMIK FORM POST
	// -----------------------------------------------------------------
	const formik = useFormik({
		initialValues,
		onSubmit: async (values, {setStatus, setSubmitting, resetForm}) => {
			var caseId = values.caseId == '' ? null : Number(values.caseId);
			var commId = values.communicationId == '' ? null : Number(values.communicationId);
			if (filterCaseType == undefined || filterCaseType == null) {
				swal(SwalDetails.ErrorTitle, SwalDetails.ErrorMandatoryText, SwalDetails.ErrorIcon);
			} else {
				setLoading(true);
				setCurrentPage(1);
				setFilterCaseId(caseId);
				setFilterCommId(commId);

				loadPlayerCaseList(pageSize, 1, sortColumn, sortOrder, caseId, commId);
			}
		},
	});

	return (
		<>
			<div className='col-lg-6'>
				<h6>Case and Communication</h6>
			</div>

			<div className='col-lg-6'>
				<button
					className='btn btn-icon w-auto px-0'
					style={{float: right, marginTop: '-10px'}}
					data-kt-toggle='true'
					data-kt-toggle-state='active'
					onClick={onClickToggle}
					type='button'
				>
					<FontAwesomeIcon icon={caseCommToggle ? faMinusSquare : faPlusSquare} />
				</button>
			</div>

			<FormContainer onSubmit={formik.handleSubmit}>
				<div className='row' style={caseCommToggle ? {} : styleHideDetails}>
					<div className='col-lg-4  mt-3'>
						<label>Communication Created Date</label>
						<div>
							<DefaultDatePicker format='dd/MM/yyyy HH:mm:ss' onChange={onChangeCaseCommCreatedDate} value={filterCreatedDate} />
						</div>
					</div>

					<div className='col-lg-4  mt-3'>
						<label>Case Status</label>
						<Select
							size='small'
							style={{width: '100%'}}
							options={CommonLookups('caseStatuses')}
							onChange={onChangeCaseStatus}
							value={filterCaseStatus}
							isClearable={true}
						/>
					</div>
					<div className='col-lg-4  mt-3'>
						<label>Campaign Type</label>
						<Select
							size='small'
							style={{width: '100%'}}
							options={campaignTypeOptions}
							onChange={onChangeCampaignType}
							value={filterCampaignType}
							isClearable={true}
						/>
					</div>
					<div className='col-lg-4  mt-3'>
						<label>Case ID</label>
						<NumberTextInput ariaLabel={'Case Id'} {...formik.getFieldProps('caseId')} />
					</div>
					<div className='col-lg-4  mt-3'>
						<label>Message Type</label>
						<Select
							size='small'
							style={{width: '100%'}}
							options={messageTypeOptionList}
							onChange={onChangeMessageType}
							value={filterMessageType}
							isClearable={true}
						/>
					</div>
					<div className='col-lg-4  mt-3'>
						<label>Campaign Name</label>
						<Select
							size='small'
							style={{width: '100%'}}
							options={campaignList}
							onChange={onChangeCampaignName}
							value={filterCampaignName}
							isClearable={true}
						/>
					</div>
					<div className='col-lg-4  mt-3'>
						<label>Communication ID</label>
						<NumberTextInput ariaLabel={'Communication Id'} {...formik.getFieldProps('communicationId')} />
					</div>

					<div className='col-lg-4  mt-3'>
						<label>Message Status</label>
						<Select
							size='small'
							style={{width: '100%'}}
							options={messageStatusOptions}
							onChange={onChangeMessageStatus}
							value={filterMessageStatus}
							isClearable={true}
							isDisabled={filterMessageType === undefined || filterMessageType === null}
						/>
					</div>

					<div className='col-lg-4  mt-3'>
						<label>Communication Created By</label>
						<Select
							onKeyDown={onKeyDownCreatedBy}
							size='small'
							style={{width: '100%'}}
							options={userList}
							onChange={onChangeCreatedBy}
							value={filterUser}
							isSearchable={true}
							isClearable={true}
						/>
						{/* <SearchTextInput ariaLabel={'Communication Created By'}  {...formik.getFieldProps('createdBy')}  /> */}
					</div>
					<div className='col-lg-4  mt-3'>
						<label className='required'>Case Type</label>
						<Select
							size='small'
							style={{width: '100%'}}
							options={CommonLookups('caseTypes')}
							onChange={onChangeCaseType}
							value={filterCaseType}
							isClearable={true}
						/>
					</div>
					<div className='col-lg-4  mt-3'>
						<label>Message Response</label>
						<Select
							size='small'
							style={{width: '100%'}}
							options={messageResponsesOptions}
							onChange={onChangeMessageResponse}
							value={filterMessageResponse}
							isClearable={true}
							isDisabled={filterMessageStatus === undefined || filterMessageStatus === null}
						/>
					</div>

					<div className='col-lg-12  mt-5'>
						<button type='submit' className='btn btn-primary btn-sm me-2' disabled={formik.isSubmitting}>
							{!loading && <span className='indicator-label'>Search</span>}
							{loading && (
								<span className='indicator-progress' style={{display: 'block'}}>
									Please wait...
									<br />
									<span className='spinner-border spinner-border-sm align-middle ms-2'></span>
								</span>
							)}
						</button>
						<button type='button' className='btn btn-secondary btn-sm me-2' onClick={onClickClearFilter}>
							Clear
						</button>
						{/* <a className="btn btn-dark btn-sm me-2" href='#' target='_blank'>Create Case</a> */}
						<CreateCaseBtn />
					</div>

					<div className='ag-theme-quartz mt-5' style={{height: 500, width: '100%', marginBottom: '50px', position: 'relative', padding: 0}}>
						<AgGridReact
							rowData={playerCaseList}
							defaultColDef={{
								sortable: true,
								resizable: true,
							}}
							components={{
								tableLoader: tableLoader,
							}}
							onGridReady={onGridReady}
							rowBuffer={0}
							//enableRangeSelection={true} //deprecated in AgGridReactver.32.0.0
							pagination={false}
							paginationPageSize={pageSize}
							columnDefs={columnDefs}
							onSortChanged={(e) => onSort(e)}
						/>

						<DefaultGridPagination
							recordCount={recordCount}
							currentPage={currentPage}
							pageSize={pageSize}
							onClickFirst={onClickFirst}
							onClickPrevious={onClickPrevious}
							onClickNext={onClickNext}
							onClickLast={onClickLast}
						/>

						<div style={{position: 'absolute', bottom: '-40px', left: '30px'}}>
							Show{' '}
							<select onChange={() => onPageSizeChanged()} id='page-size' style={{margin: 5}}>
								<option value='10' selected={true}>
									10
								</option>
								<option value='50'>50</option>
								<option value='100'>100</option>
							</select>{' '}
							entries
						</div>
					</div>
				</div>
			</FormContainer>
		</>
	);
};

export default PlayerCaseComm;

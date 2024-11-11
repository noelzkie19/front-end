import {faPencilAlt} from '@fortawesome/free-solid-svg-icons';
import {HubConnection} from '@microsoft/signalr';
import {AxiosResponse} from 'axios';
import 'datatables.net';
import 'datatables.net-dt';
import {Guid} from 'guid-typescript';
import moment from 'moment';
import {useEffect, useRef, useState} from 'react';
import {shallowEqual, useSelector} from 'react-redux';
import Select from 'react-select';
import swal from 'sweetalert';
import {RootState} from '../../../../../setup';
import * as hubConnection from '../../../../../setup/hub/MessagingHub';
import {ElementStyle, HttpStatusCodeEnum} from '../../../../constants/Constants';
import {
	ButtonsContainer,
	ContentContainer,
	DefaultSecondaryButton,
	DefaultTableButton,
	FormGroupContainer,
	FormHeader,
	GridWithLoaderAndPagination,
	MainContainer,
	MlabBadge,
	MlabButton,
	NumberTextInput,
	SearchTextInput,
	TableIconButton,
} from '../../../../custom-components';
import {DefaultPageSetup, StatusCode} from '../../../system/components/constants/PlayerConfigEnums';
import {USER_CLAIMS} from '../../../user-management/components/constants/UserClaims';
import useRemProfileConstant from '../../constants/useRemProfileConstant';
import {RemProfileFilterRequestModel} from '../../models/request/RemProfileFilterRequestModel';
import {RemProfileUpdateRequestModel} from '../../models/request/RemProfileUpdateRequestModel';
import {RemProfileListResponseModel} from '../../models/response/RemProfileListResponseModel';
import {RemProfileModel} from '../../models/response/RemProfileModel';
import {
	ExportRemProfileToCsv,
	GetRemProfileList,
	GetRemProfileListResult,
	UpdateRemOnlineStatus,
	UpdateRemProfileStatus,
	ValidateRemProfileIfHasPlayer,
} from '../../services/RemProfileApi';
import useRemLookups from '../../shared/hooks/useRemLookups';

const RemProfileList: React.FC = () => {
	// States
	const gridRef: any = useRef();
	const userAccessId = useSelector<RootState>(({auth}) => auth.userId, shallowEqual) as number;
	const userAccess = useSelector<RootState>(({auth}) => auth.access, shallowEqual) as string;
	const [loading, setLoading] = useState(false);
	const [remList, setRemList] = useState<Array<any>>([]);
	const [pageSize, setPageSize] = useState<number>(DefaultPageSetup.pageSizeDefault);
	const [currentPage, setCurrentPage] = useState<number>(1);
	const [recordCount, setRecordCount] = useState<number>(0);
	const [sortOrder, setSortOrder] = useState<string>('DESC');
	const [sortColumn, setSortColumn] = useState<string>('CreatedDate');

	const [remProfileIdFilter, setRemProfileIdFilter] = useState<any>(null);
	const [remProfileNameFilter, setRemProfileNameFilter] = useState<any>(null);
	const [remAgentNameFilter, setRemAgentNameFilter] = useState<any>();
	const [remPseudoNameFilter, setRemPseudoNameFilter] = useState<any>(null);
	const [remOnlineStatusIdFilter, setRemOnlineStatusIdFilter] = useState<any>(null);
	const [remAgentConfigStatusIdFilter, setRemAgentConfigStatusIdFilter] = useState<any>(null);
	const {PageEvent} = useRemProfileConstant();

	const onlineStatus = [
		{value: 0, label: 'Select All'},
		{value: 181, label: 'Offline'},
		{value: 182, label: 'Online'},
	];
	const remProfileStatus = [
		{value: 0, label: 'Select All'},
		{value: 184, label: 'Active'},
		{value: 185, label: 'InActive'},
	];

	const onlineStatusIdOnline = 182;
	const onlineStatusIdOffline = 181;
	const agentConfigStatusIdActive = 184;
	const agentConfigStatusIdInActive = 185;
	const remLookUps = useRemLookups();
	const customcellRendererRemProfileName = (params: any) => {
		return (
			<>
				{userAccess.includes(USER_CLAIMS.RemProfileRead) ? (
					<a href={`/relationship-management/view-rem-profile/view/${params.data.remProfileID}`} target='_blank'>
						{params.data.remProfileName}
					</a>
				) : (
					params.data.RemProfileName
				)}
			</>
		);
	};
	const customcellRendererOnlineStatusId = (params: any) => {
		return (
			<>
				{' '}
				{params ? (
					<div className='form-check form-switch form-check-custom form-check-solid d-flex justify-content-center flex-shrink-0'>
						<input
							className='form-check-input'
							type='checkbox'
							value=''
							id=''
							defaultChecked={params.data.onlineStatusId == onlineStatusIdOnline}
							onClick={(event) => onToggleOnlineStatus(params, event)}
							disabled={userAccess.includes(USER_CLAIMS.RemProfileRead) && !userAccess.includes(USER_CLAIMS.RemProfileWrite)}
						/>
					</div>
				) : null}
			</>
		);
	};
	const customcellRendererAgentConfigStatusId = (params: any) => {
		return (
			<>
				{params.data.agentConfigStatusId == agentConfigStatusIdActive ? (
					<>
						<MlabBadge label={'Active'} weight={'light'} type={'badge'} style={ElementStyle.success} />
						<DefaultTableButton
							access={userAccess.includes(USER_CLAIMS.RemProfileRead) && userAccess.includes(USER_CLAIMS.RemProfileWrite)}
							title={'Deactivate'}
							onClick={() => onToggleAgentConfigStatus(params, agentConfigStatusIdInActive)}
						/>
						{/* <span className='badge badge-light' onClick={() => onToggleAgentConfigStatus(params, agentConfigStatusIdInActive)}>
									Deactivate
								</span> */}
					</>
				) : (
					<>
						<MlabBadge label={'InActive'} weight={'light'} type={'badge'} style={ElementStyle.success} />
						<DefaultTableButton
							access={userAccess.includes(USER_CLAIMS.RemProfileRead) && userAccess.includes(USER_CLAIMS.RemProfileWrite)}
							title={'Activate'}
							onClick={() => onToggleAgentConfigStatus(params, agentConfigStatusIdActive)}
						/>
					</>
				)}
			</>
		);
	};
	const customcellRendererPosition = (params: any) => {
		return (
			<TableIconButton
				access={userAccess.includes(USER_CLAIMS.RemProfileRead) && userAccess.includes(USER_CLAIMS.RemProfileWrite)}
				faIcon={faPencilAlt}
				toolTipText={'Edit'}
				onClick={() => onEditRow(params.data)}
			/>
		);
	};
	const gridOptions = {
		columnDefs: [
			{headerName: 'ReM Profile ID', field: 'remProfileID', autoWidth: true},
			{
				headerName: 'ReM Profile Name',
				field: 'RemProfileName',
				autoWidth: true,
				cellRenderer: customcellRendererRemProfileName,
			},
			{headerName: 'Agent Id', field: 'agentId', autoWidth: true, hide: true, suppressToolPanel: true},
			{headerName: 'Agent Name', field: 'agentName', autoWidth: true},
			{headerName: 'Pseudo Name (PP)', field: 'pseudoNamePP', autoWidth: true},
			{
				headerName: 'Online Status',
				field: 'OnlineStatusId',
				autoWidth: true,
				cellRenderer: customcellRendererOnlineStatusId,
			},
			{
				headerName: 'ReM Profile Status',
				field: 'agentConfigStatusId',
				autoWidth: true,
				cellRenderer: customcellRendererAgentConfigStatusId,
			},
			{headerName: 'ScheduleTemplateSettingId', field: 'scheduleTemplateSettingId', autoWidth: true, hide: true, suppressToolPanel: true},
			{headerName: 'CreatedBy', field: 'createdBy', autoWidth: true, hide: true, suppressToolPanel: true},
			{headerName: 'CreatedDate', field: 'createdDate', autoWidth: true, hide: true, suppressToolPanel: true},
			{headerName: 'UpdatedBy', field: 'updatedBy', autoWidth: true, hide: true, suppressToolPanel: true},
			{headerName: 'UpdatedDate', field: 'updatedDate', autoWidth: true, hide: true, suppressToolPanel: true},
			{
				headerName: 'Action',
				field: 'position',
				sortable: false,
				cellRenderer: customcellRendererPosition,
			},
		],
	};

	//UseEffects
	useEffect(() => {
		const bc = new BroadcastChannel('MLAB_RemProfile');
		bc.onmessage = (event) => {
			let evenData = event?.data?.data;
			if (event?.data?.event == PageEvent.SEARCH) {
				let request: RemProfileFilterRequestModel = {
					pageSize: pageSize,
					offsetValue: (currentPage - 1) * pageSize,
					sortColumn: evenData.sortColumn,
					sortOrder: evenData.sortOrder,
					queueId: Guid.create().toString(),
					userId: userAccessId.toString(),
				};
				loadRemList(request);
			}
		};
	}, []);
	useEffect(() => {
		if (!loading && remList.length === 0) {
			if (document.getElementById('mlab-grid-loading-overlay') as HTMLInputElement) {
				(document.getElementById('mlab-grid-loading-overlay') as HTMLInputElement).innerText = 'No Rows To Show';
			}
		} else if (document.getElementById('mlab-grid-loading-overlay') as HTMLInputElement) {
			(document.getElementById('mlab-grid-loading-overlay') as HTMLInputElement).innerText = 'Please wait while your items are loading';
		}
	}, [loading]);

	// Methods
	const handleRemProfileIdFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setRemProfileIdFilter(event.target.value);
	};
	const handleRemProfileNameFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setRemProfileNameFilter(event.target.value);
	};
	const handleAgentNameFilterChange = (event: any) => {
		setRemAgentNameFilter(event);
	};
	const handleRemPseudoNameFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setRemPseudoNameFilter(event.target.value);
	};
	const handleOnlineStatusIdFilterChange = (event: any) => {
		setRemOnlineStatusIdFilter(event); //sss
	};
	const handleAgentConfigStatusIdFilterChange = (event: any) => {
		setRemAgentConfigStatusIdFilter(event);
	};
	const onPageSizeChanged = () => {
		const value: string = (document.getElementById('page-size') as HTMLInputElement).value;
		setPageSize(Number(value));
		setCurrentPage(1);

		if (remList != undefined && remList.length > 0) {
			paginationLoadList(Number(value), 1, sortColumn, sortOrder);
		}
	};

	const onClickFirst = () => {
		if (currentPage > 1) {
			setCurrentPage(1);
			paginationLoadList(pageSize, 1, sortColumn, sortOrder);
		}
	};

	const onClickPrevious = () => {
		if (currentPage > 1) {
			setCurrentPage(currentPage - 1);
			paginationLoadList(pageSize, currentPage - 1, sortColumn, sortOrder);
		}
	};

	const onClickNext = () => {
		if (totalPage() > currentPage) {
			setCurrentPage(currentPage + 1);
			paginationLoadList(pageSize, currentPage + 1, sortColumn, sortOrder);
		}
	};

	const onClickLast = () => {
		if (totalPage() > currentPage) {
			setCurrentPage(totalPage());
			paginationLoadList(pageSize, totalPage(), sortColumn, sortOrder);
		}
	};

	const onToggleOnlineStatus = (data: any, e: any) => {
		e.preventDefault();
		swal({
			title: 'Confirmation',
			text: 'This action will update the current Agent Online Status, please confirm',
			icon: 'warning',
			buttons: ['No', 'Yes'],
			dangerMode: true,
		}).then((onFormSubmit) => {
			if (onFormSubmit) {
				let resultData = data.data as RemProfileModel;

				let request: RemProfileUpdateRequestModel = {
					agentConfigStatusId: resultData.agentConfigStatusId,
					agentNameId: resultData.agentId,
					onlineStatusId: resultData.onlineStatusId == onlineStatusIdOnline ? onlineStatusIdOffline : onlineStatusIdOnline,
					remProfileID: resultData.remProfileID,
					userId: userAccessId,
					onlineStatus: resultData.onlineStatusId != onlineStatusIdOnline,
				};
				UpdateRemOnlineStatus(request).then((response) => {
					if (response.status === StatusCode.OK) {
						handleClear();

						let request: RemProfileFilterRequestModel = {
							pageSize: pageSize,
							offsetValue: (currentPage - 1) * pageSize,
							sortColumn: 'a.UpdatedDate',
							sortOrder: 'DESC',
							queueId: Guid.create().toString(),
							userId: userAccessId.toString(),
						};

						loadRemList(request);
					}
				});
			}
		});
	};
	const onToggleAgentConfigStatus = (data: any, agentConfigStatusId: number) => {
		let resultData = data.data as RemProfileModel;
		let request: RemProfileUpdateRequestModel = {
			agentConfigStatusId: agentConfigStatusId,
			agentNameId: resultData.agentId,
			onlineStatusId: resultData.onlineStatusId,
			remProfileID: resultData.remProfileID,
			userId: userAccessId,
			onlineStatus: agentConfigStatusId == agentConfigStatusIdActive,
		};

		if (agentConfigStatusId == agentConfigStatusIdInActive) {
			ValidateRemProfileIfHasPlayer(request)
				.then((validateResponse) => {
					if (validateResponse.data.status !== StatusCode.OK) {
						swal('ReM Profile', 'This action is not allowed, as this ReM Profile has a Player Assigned', 'error');
					} else {
						updateAgentStatus(request);
					}
				})
				.catch(() => {});
		} else {
			updateAgentStatus(request);
		}
	};

	const updateAgentStatus = (updateRequest: RemProfileUpdateRequestModel) => {
		swal({
			title: 'Confirmation',
			text: 'This action will update the current ReM Profile Status, please confirm',
			icon: 'warning',
			buttons: ['No', 'Yes'],
			dangerMode: true,
		}).then((onFormSubmit) => {
			if (onFormSubmit) {
				UpdateRemProfileStatus(updateRequest).then((response) => {
					if (response.status === StatusCode.OK) {
						handleClear();
						let request: RemProfileFilterRequestModel = {
							pageSize: pageSize,
							offsetValue: (currentPage - 1) * pageSize,
							sortColumn: 'a.UpdatedDate',
							sortOrder: 'DESC',
							queueId: Guid.create().toString(),
							userId: userAccessId.toString(),
						};
						loadRemList(request);
					}
				});
			}
		});
	};

	const totalPage = () => {
		return Math.ceil(recordCount / pageSize) | 0;
	};

	const onSort = (e: any) => {
		if (remList != undefined && remList.length > 0) {
			const sortDetail = e.api.getSortModel();
			if (sortDetail[0] != undefined) {
				setSortColumn(sortDetail[0]?.colId);
				setSortOrder(sortDetail[0]?.sort);
				loadRemList(undefined, sortDetail[0]?.colId, sortDetail[0]?.sort);
			} else {
				setSortColumn('');
				setSortOrder('');
				loadRemList(); //requestParam as undefined, setting _sortColumn as '' and _sortOrder as ''
			}
		}
	};

	const handleSearch = () => {
		gridRef.current.api.resetColumnState();
		loadRemList();
	};

	const handleRemProfileExportToCSV = () => {
		let request: RemProfileFilterRequestModel = {
			agentConfigStatusId: remAgentConfigStatusIdFilter?.value == 0 ? null : remAgentConfigStatusIdFilter?.value,
			agentNameIds: generateAgentIds(remAgentNameFilter),
			onlineStatusId: remOnlineStatusIdFilter?.value == 0 ? null : remOnlineStatusIdFilter?.value,
			pseudoNamePP: remPseudoNameFilter == '' || remPseudoNameFilter == null ? null : remPseudoNameFilter,
			remProfileID: remProfileIdFilter == '' || remProfileIdFilter == null ? null : remProfileIdFilter,
			remProfileName: remProfileNameFilter == '' || remProfileNameFilter == null ? null : remProfileNameFilter,
			scheduleTemplateSettingId: null,
			pageSize: recordCount,
			offsetValue: 0,
			sortColumn: sortColumn,
			sortOrder: sortOrder,
			queueId: Guid.create().toString(),
			userId: userAccessId.toString(),
		};

		setLoading(true);
		ExportRemProfileToCsv(request)
			.then((response) => {
				const url = window.URL.createObjectURL(new Blob(['\ufeff', response.data]));
				const link = document.createElement('a');
				link.href = url;
				link.setAttribute('download', `REM Profile ${moment(new Date()).format('DD/MM/yyyy')}.csv`);
				document.body.appendChild(link);
				link.click();
				setLoading(false);
			})
			.catch(() => {
				setLoading(false);
				swal('Failed', 'Problem in exporting list', 'error');
			});
	};

	const handleClear = () => {
		setRemProfileIdFilter('');
		setRemProfileNameFilter('');
		setRemAgentNameFilter(null);
		setRemPseudoNameFilter('');
		setRemOnlineStatusIdFilter(null);
		setRemAgentConfigStatusIdFilter(null);
	};

	const paginationLoadList = (_pageSize: number, _currentPage: number, _sortColumn: string, _sortOrder: string) => {
		const request: any = {
			pageSize: _pageSize,
			offsetValue: (_currentPage - 1) * _pageSize,
			sortColumn: _sortColumn,
			sortOrder: _sortOrder,
			userId: userAccessId.toString(),
			queueId: Guid.create().toString(),
		};

		loadRemList(request);
	};

	const generateAgentIds = (data: Array<any>) => {
		let result = data?.map((val) => {
			return val?.value;
		});

		let ids = result?.toString();

		return ids == '' ? null : ids;
	};

	const loadRemList = (requestParam?: RemProfileFilterRequestModel, _sortColumn?: string, _sortOrder?: string) => {
		let request: RemProfileFilterRequestModel = {
			agentConfigStatusId: remAgentConfigStatusIdFilter?.value == 0 ? null : remAgentConfigStatusIdFilter?.value,
			agentNameIds: generateAgentIds(remAgentNameFilter),
			onlineStatusId: remOnlineStatusIdFilter?.value == 0 ? null : remOnlineStatusIdFilter?.value,
			pseudoNamePP: remPseudoNameFilter == '' || remPseudoNameFilter == null ? null : remPseudoNameFilter,
			remProfileID: remProfileIdFilter == '' || remProfileIdFilter == null ? null : remProfileIdFilter,
			remProfileName: remProfileNameFilter == '' || remProfileNameFilter == null ? null : remProfileNameFilter,
			scheduleTemplateSettingId: null,
			pageSize: pageSize,
			offsetValue: (currentPage - 1) * pageSize,
			sortColumn: _sortColumn ?? sortColumn,
			sortOrder: _sortOrder ?? sortOrder,
			queueId: Guid.create().toString(),
			userId: userAccessId.toString(),
		};

		if (requestParam) {
			request = requestParam;
		}
		setLoading(true);
		setRemList([]);
		setTimeout(() => {
			const messagingHub = hubConnection.createHubConnenction();
			messagingHub
				.start()
				.then(() => {
					if (messagingHub.state === 'Connected') {
						GetRemProfileList(request)
							.then((response) => {
								processGetRemProfileListRecived(messagingHub, response, request);
							})
							.catch(() => {
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

	const processGetRemProfileListRecived = (messagingHub: HubConnection, response: AxiosResponse<any>, request: RemProfileFilterRequestModel) => {
		if (response.status === HttpStatusCodeEnum.Ok) {
			messagingHub.on(request.queueId.toString(), (message) => {
				GetRemProfileListResult(message.cacheId)
					.then((data) => {
						let resultData = data.data as RemProfileListResponseModel;
						setRemList(resultData.remProfileList);
						setRecordCount(resultData.totalRecordCount);

						messagingHub.off(request.queueId.toString());
						messagingHub.stop();

						setLoading(false);
					})
					.catch(() => {
						swal('Failed', 'GetRemProfileListResult', 'error');
						setLoading(false);
					});
			});
			setTimeout(() => {
				if (messagingHub.state === 'Connected') {
					messagingHub.stop();
				}
			}, 30000);
		} else {
			messagingHub.stop();
			setLoading(false);
		}
	};
	const onAddNew = () => {
		const win: any = window.open(`/relationship-management/add-rem-profile`, '_blank');
		win.focus();
	};
	const onEditRow = (data: any) => {
		const win: any = window.open(`/relationship-management/edit-rem-profile/${data.remProfileID}`, '_blank');
		win.focus();
	};

	return (
		<>
			<MainContainer>
				<FormHeader headerLabel={'ReM Profile'} />
				<ContentContainer>
					<FormGroupContainer>
						<div className='col-md-2'>
							<label className='form-label-sm mb-2'>ReM Profile Id</label>
							<NumberTextInput
								ariaLabel={'Rem Profile Id'}
								className={'form-control form-control-sm'}
								{...{value: remProfileIdFilter, onChange: handleRemProfileIdFilterChange}}
							/>
						</div>
						<div className='col-md-2'>
							<label className='form-label-sm mb-2'>ReM Profile</label>
							<SearchTextInput ariaLabel={'Rem Profile Name'} {...{value: remProfileNameFilter, onChange: handleRemProfileNameFilterChange}} />
						</div>
						<div className='col-md-2'>
							<label className='form-label-sm mb-2'>Agent Name</label>
							<Select
								isMulti
								size='small'
								style={{width: '100%'}}
								options={remLookUps?.users}
								onChange={handleAgentNameFilterChange}
								value={remAgentNameFilter}
								isClearable={true}
							/>
						</div>
						<div className='col-md-2'>
							<label className='form-label-sm mb-2'>Pseudo Name (PP)</label>
							<SearchTextInput ariaLabel={'Pseudo Name (PP)'} {...{value: remPseudoNameFilter, onChange: handleRemPseudoNameFilterChange}} />
						</div>
						<div className='col-md-2'>
							<label className='form-label-sm mb-2'>Online Status</label>
							<Select
								size='small'
								style={{width: '100%'}}
								options={onlineStatus}
								onChange={handleOnlineStatusIdFilterChange}
								value={remOnlineStatusIdFilter}
							/>
						</div>
						<div className='col-md-2'>
							<label className='form-label-sm mb-2'>ReM Profile Status</label>
							<Select
								size='small'
								style={{width: '100%'}}
								options={remProfileStatus}
								onChange={handleAgentConfigStatusIdFilterChange}
								value={remAgentConfigStatusIdFilter}
							/>
						</div>
					</FormGroupContainer>
					<FormGroupContainer>
						<ButtonsContainer>
							<MlabButton
								access={userAccess.includes(USER_CLAIMS.RemProfileRead)}
								size={'sm'}
								label={'Search'}
								style={ElementStyle.primary}
								type={'button'}
								weight={'solid'}
								loading={loading}
								disabled={loading}
								loadingTitle={' Please wait...'}
								onClick={handleSearch}
							/>
							<DefaultSecondaryButton access={userAccess.includes(USER_CLAIMS.RemProfileRead)} title={'Clear'} onClick={handleClear} />
							<MlabButton
								access={userAccess.includes(USER_CLAIMS.RemProfileRead) && userAccess.includes(USER_CLAIMS.RemProfileWrite)}
								size={'sm'}
								label={'Add'}
								style={ElementStyle.primary}
								type={'button'}
								weight={'solid'}
								onClick={onAddNew}
							/>
							<MlabButton
								access={userAccess.includes(USER_CLAIMS.RemProfileRead)}
								size={'sm'}
								label={'Export to CSV'}
								style={ElementStyle.primary}
								type={'button'}
								weight={'solid'}
								onClick={handleRemProfileExportToCSV}
								disabled={remList.length == 0}
							/>
						</ButtonsContainer>
					</FormGroupContainer>

					{/* New Table Implementation */}
					<FormGroupContainer>
						<div className='ag-theme-quartz pb-15 mb-15' style={{height: '500px', width: '100%'}}>
							{/* New grid loader implementation */}
							<GridWithLoaderAndPagination
								gridRef={gridRef}
								rowData={remList}
								columnDefs={gridOptions.columnDefs}
								sortColumn={sortColumn}
								sortOrder={sortOrder}
								isLoading={loading}
								height={500}
								onSortChanged={(e: any) => onSort(e)}
								//pagination details
								recordCount={recordCount}
								currentPage={currentPage}
								pageSize={pageSize}
								onClickFirst={onClickFirst}
								onClickPrevious={onClickPrevious}
								onClickNext={onClickNext}
								onClickLast={onClickLast}
								onPageSizeChanged={onPageSizeChanged}
							></GridWithLoaderAndPagination>
						</div>
					</FormGroupContainer>
				</ContentContainer>
			</MainContainer>
		</>
	);
};

export default RemProfileList;

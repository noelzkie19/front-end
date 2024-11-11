import {AgGridReact} from 'ag-grid-react';
import 'datatables.net';
import 'datatables.net-dt';
import {Guid} from 'guid-typescript';
import $ from 'jquery';
import {useEffect, useState} from 'react';
import {shallowEqual, useDispatch, useSelector} from 'react-redux';
import {useHistory} from 'react-router-dom';
import swal from 'sweetalert';
import {RootState} from '../../../../../setup';
import * as hubConnection from '../../../../../setup/hub/MessagingHub';
import gridOverlayTemplate from '../../../../common-template/gridTemplates';
import {ElementStyle} from '../../../../constants/Constants';
import {
	ButtonsContainer,
	ContentContainer,
	DefaultSecondaryButton,
	DefaultTableButton,
	FooterContainer,
	FormGroupContainer,
	FormHeader,
	MainContainer,
	MlabButton,
	NumberTextInput,
	PaddedContainer,
} from '../../../../custom-components';
import DefaultGridPagination from '../../../../custom-components/grid-pagination/DefaultGridPagination';
import {useFormattedDate} from '../../../../custom-functions';
import {USER_CLAIMS} from '../../../user-management/components/constants/UserClaims';
import {PlayerConfigurationFilterRequestModel} from '../../models/PlayerConfigurationFilterRequestModel';
import {PlayerConfigurationModel} from '../../models/PlayerConfigurationModel';
import {PlayerStatusListModel} from '../../models/PlayerStatusListModel';
import {PlayerStatusModel} from '../../models/PlayerStatusModel';
//models
import {GetPlayerConfigurationByIdRequestModel} from '../../models/requests/GetPlayerConfigurationByIdRequestModel';
//service
import {
	getPlayerConfigPlayerStatus,
	getPlayerConfigPlayerStatusResult,
	getPlayerConfigurationById,
	getPlayerConfigurationByIdResult,
} from '../../redux/SystemService';
import {PlayerConfigCommons, PlayerConfigTypes, PlayerStatusPlayerConfig, StatusCode} from '../constants/PlayerConfigEnums';
import '../player-configuration/player-configuration.css';
import AddEditPlayerStatusModal from './modals/AddEditPlayerStatusModal';

const EditPlayerStatus: React.FC = () => {
	//  States
	const dispatch = useDispatch();
	const history = useHistory();
	const [pageId, setPageId] = useState(0);
	const messagingHub = hubConnection.createHubConnenction();
	const userAccessId = useSelector<RootState>(({auth}) => auth.userId, shallowEqual) as number;
	const userAccess = useSelector<RootState>(({auth}) => auth.access, shallowEqual) as string;
	const [showModal, setShowModal] = useState(false);
	const [idFilter, setIdFilter] = useState('');
	const [rowData, setRowData] = useState<Array<any>>([]);
	const [loading, setLoading] = useState(false);
	const [playerStatusList, setPlayerStatusList] = useState<Array<PlayerStatusModel>>([]);
	const [recordCount, setRecordCount] = useState<number>(0);
	const [pageSize, setPageSize] = useState<number>(10);
	const [currentPage, setCurrentPage] = useState<number>(1);
	const [playerStatusDetail, setPlayerStatusDetail] = useState<PlayerStatusModel>();
	const [playerConfiguration, setPlayerConfiguration] = useState<PlayerConfigurationModel>();
	const [isEditFlag, setIsEditFlag] = useState(false);
	const [filterPlayerStatusId, setFilterPlayerStatusId] = useState<any>('');
	const [filterPlayerStatusICoreId, setFilterPlayerStatusICoreId] = useState<any>('');
	const [filterPlayerStatusName, setFilterPlayerStatusName] = useState<any>('');
	const [gridApi, setGridApi] = useState<any | null>(null);
	const [gridColumnApi, setGridColumnApi] = useState(null);
	const [sortOrder, setSortOrder] = useState<string>(PlayerConfigCommons.Asc);
	const [sortColumn, setSortColumn] = useState<string>(PlayerStatusPlayerConfig.PlayerStatusId);

	//  States
	useEffect(() => {
		getPlayerConfigInfo(PlayerConfigTypes.PlayerStatusTypeId);
		getPlayerStatusList(pageSize, currentPage);
	}, []);

	useEffect(() => {
		if (!loading && rowData.length === 0) {
			if (document.getElementById('mlab-grid-loading-overlay') as HTMLInputElement) {
				(document.getElementById('mlab-grid-loading-overlay') as HTMLInputElement).innerText = 'No Rows To Show';
			}
		} else {
			if (document.getElementById('mlab-grid-loading-overlay') as HTMLInputElement) {
				(document.getElementById('mlab-grid-loading-overlay') as HTMLInputElement).innerText = 'Please wait while your items are loading';
			}
		}
	}, [loading]);

	useEffect(() => {
		const table = $('.table-player-config').find('table').DataTable();
		table.clear();
		table.rows.add(rowData);
		table
			.on('order.dt search.dt', function () {
				table
					.column(0, {search: 'applied', order: 'applied'})
					.nodes()
					.each(function (cell, i) {
						cell.innerHTML = cell.innerText;
					});
			})
			.draw();
	}, [rowData]);

	// Grid - Pagination
	const tableLoader = (data: any) => {
		return (
			<div className='ag-custom-loading-cell' style={{paddingLeft: '10px', lineHeight: '25px'}}>
				<i className='fas fa-spinner fa-pulse'></i> <span> {data.loadingMessage}</span>
			</div>
		);
	};

	const onGridReady = (params: any) => {
		setGridApi(params.api);
		setGridColumnApi(params.columnApi);
		params.api.sizeColumnsToFit();
	};

	const columnDefs = [
		{
			headerName: PlayerStatusPlayerConfig.PlayerStatusIdHeader,
			field: PlayerStatusPlayerConfig.PlayerStatusId,
			autoWidth: true,
		},
		{headerName: PlayerConfigCommons.ICoreIdHeader, field: PlayerConfigCommons.ICoreIdField, autoWidth: true},
		{
			headerName: PlayerStatusPlayerConfig.PlayerStatusNameHeader,
			field: PlayerStatusPlayerConfig.PlayerStatusName,
			autoWidth: true,
		},
		{
			headerName: 'Action',
			field: 'position',
			autoWidth: true,
			cellRenderer: (params: any) => (
				<DefaultTableButton access={userAccess.includes(USER_CLAIMS.PlayerStatusWrite)} title={'Edit'} onClick={() => onEditRow(params.data)} />
			),
		},
	];

	const onSort = (e: any) => {
		if (playerStatusList != undefined && rowData.length > 0) {
			var sortDetail = e.api.getSortModel();
			if (sortDetail[0] != undefined) {
				setSortColumn(sortDetail[0]?.colId);
				setSortOrder(sortDetail[0]?.sort);
			} else {
				setSortColumn('');
				setSortOrder('');
			}
		}
	};

	const onPageSizeChanged = () => {
		var value: string = (document.getElementById('page-size') as HTMLInputElement).value;

		setPageSize(Number(value));
		setCurrentPage(1);
		getPlayerStatusList(value, 1);
	};

	const onClickFirst = () => {
		if (currentPage > 1) {
			setCurrentPage(1);

			getPlayerStatusList(pageSize, 1);
		}
	};

	const onClickPrevious = () => {
		if (currentPage > 1) {
			setCurrentPage(currentPage - 1);
			getPlayerStatusList(pageSize, currentPage - 1);
		}
	};

	const onClickNext = () => {
		if (totalPage() > currentPage) {
			setCurrentPage(currentPage + 1);
			getPlayerStatusList(pageSize, currentPage + 1);
		}
	};

	const onClickLast = () => {
		if (totalPage() > currentPage) {
			setCurrentPage(totalPage());
			getPlayerStatusList(pageSize, totalPage());
		}
	};

	const totalPage = () => {
		return Math.ceil(recordCount / pageSize) | 0;
	};

	// Methods
	const onEditRow = (item: any) => {
		setIsEditFlag(true);
		setPlayerStatusDetail(item);
		setShowModal(true);
	};

	const onAddNew = () => {
		setIsEditFlag(false);
		setShowModal(true);
	};

	const getPlayerConfigInfo = (id: number) => {
		const request: GetPlayerConfigurationByIdRequestModel = {
			id: id,
			userId: userAccessId.toString(),
			queueId: Guid.create().toString(),
		};

		messagingHub.start().then(() => {
			getPlayerConfigurationById(request).then((response) => {
				if (response.status === StatusCode.OK) {
					messagingHub.on(request.queueId.toString(), (message) => {
						getPlayerConfigurationByIdResult(message.cacheId)
							.then((returnData) => {
								const item = Object.assign(returnData.data);
								setPlayerConfiguration(item);
								messagingHub.off(request.queueId.toString());
								messagingHub.stop();
							})
							.catch(() => {
								swal('Failed', 'getPlayerConfigurationById', 'error');
							});
						setLoading(false);
					});

					setTimeout(() => {
						if (messagingHub.state === 'Connected') {
							messagingHub.stop();
							setLoading(false);
						}
					}, 30000);
				} else {
					swal('Failed', response.data.message, 'error');
				}
			});
		});
	};

	async function getPlayerStatusList(page: any, currentpage: any) {
		const messagingHub = hubConnection.createHubConnenction();
		setPlayerStatusList([]);
		setRowData([]);
		setLoading(true);
		messagingHub.start().then(() => {
			const playerStatusRequest: PlayerConfigurationFilterRequestModel = {
				pageSize: page,
				offsetValue: (currentpage - 1) * page,
				sortColumn: PlayerStatusPlayerConfig.PlayerStatusId,
				sortOrder: PlayerConfigCommons.Asc,
				userId: userAccessId.toString(),
				queueId: Guid.create().toString(),
				playerConfigurationTypeId: PlayerConfigTypes.PlayerStatusTypeId,
				playerConfigurationName: filterPlayerStatusName != '' ? filterPlayerStatusName : null,
				playerConfigurationCode: '',
				playerConfigurationId: filterPlayerStatusId != '' ? filterPlayerStatusId : null,
				playerConfigurationICoreId: filterPlayerStatusICoreId != '' ? filterPlayerStatusICoreId : null,
			};
			getPlayerConfigPlayerStatus(playerStatusRequest).then((response) => {
				if (response.status === StatusCode.OK) {
					messagingHub.on(playerStatusRequest.queueId.toString(), (message) => {
						getPlayerConfigPlayerStatusResult(message.cacheId)
							.then((returnData) => {
								let feedbackData = Object.assign(new Array<PlayerStatusListModel>(), returnData.data);
								setPlayerStatusList(feedbackData.playerStatusList);
								setRowData(feedbackData.playerStatusList);
								setRecordCount(feedbackData.recordCount);

								messagingHub.off(playerStatusRequest.queueId.toString());
								messagingHub.stop();

								setLoading(false);
							})
							.catch(() => {
								swal('Failed', 'getPlayerConfigPlayerStatusResult', 'error');
								setLoading(false);
							});
						messagingHub.off(playerStatusRequest.queueId.toString());
						messagingHub.stop();
					});

					setTimeout(() => {
						if (messagingHub.state === StatusCode.Connected) {
							messagingHub.stop();
							setLoading(false);
						}
					}, 30000);
				} else {
					swal('Failed', response.data.message, 'error');
					setLoading(false);
				}
			});
		});
	}

	//  Filter events
	const onChangePlayerStatusIdFilter = (data: any) => {
		setFilterPlayerStatusId(data.target.value);
	};

	const onChangePlayerStatusICoreIdFilter = (data: any) => {
		setFilterPlayerStatusICoreId(data.target.value);
	};

	const onChangePlayerStatusNameFilter = (data: any) => {
		setFilterPlayerStatusName(data.target.value);
	};

	const handleSearch = () => {
		if (Number.isInteger(parseInt(filterPlayerStatusId)) === false && filterPlayerStatusId !== '') {
			swal('Failed', 'Player Status Id should be a number', 'error');
			return;
		}

		resetPageInfo();
	};

	const resetPageInfo = () => {
		setCurrentPage(1);
		getPlayerStatusList(pageSize, 1);
	};

	const saveNewConfiguration = () => {
		getPlayerStatusList(pageSize, currentPage);
		getPlayerConfigInfo(PlayerConfigTypes.PlayerStatusTypeId);
	};

	const handleBackButton = () => {
		history.push('/system/player-configuration-list');
	};

	return (
		<>
			<MainContainer>
				<FormHeader headerLabel={'Edit Player Status'} />
				<ContentContainer>
					{/* Data pull on this part still in progress. Some details are hardcoded yet*/}
					<FormGroupContainer>
						<div className='col-lg-3'>
							<label>Player Configuration Type</label>
							<p className='form-control-plaintext fw-bolder'>{playerConfiguration?.playerConfigurationName}</p>
						</div>
					</FormGroupContainer>
					<FormGroupContainer>
						<div className='col-lg-3'>
							<label>Created Date</label>
							<p className='form-control-plaintext fw-bolder'>
								{useFormattedDate(playerConfiguration && playerConfiguration.createdDate ? playerConfiguration.createdDate : '')}
							</p>
						</div>
						<div className='col-lg-3'>
							<label>Created By</label>
							<p className='form-control-plaintext fw-bolder'>{playerConfiguration?.createdByName}</p>
						</div>
						<div className='col-lg-3'>
							<label>Last Modified Date</label>
							<p className='form-control-plaintext fw-bolder'>
								{useFormattedDate(playerConfiguration && playerConfiguration.updatedDate ? playerConfiguration.updatedDate : '')}
							</p>
						</div>
						<div className='col-lg-3'>
							<label>Modified By</label>
							<p className='form-control-plaintext fw-bolder'>{playerConfiguration?.updatedByName}</p>
						</div>
					</FormGroupContainer>
					<hr className='my-3 mb-7' />

					<FormGroupContainer>
						<div className='col-md-2'>
							<label className='form-label-sm mb-2'>Player Status Id</label>
							<NumberTextInput
								ariaLabel={''}
								className={'form-control form-control-sm'}
								{...{value: filterPlayerStatusId, onChange: onChangePlayerStatusIdFilter}}
							/>
						</div>

						<div className='col-md-2'>
							<label className='form-label-sm mb-2'>iCore Id</label>
							<NumberTextInput
								ariaLabel={''}
								className={'form-control form-control-sm'}
								{...{value: filterPlayerStatusICoreId, onChange: onChangePlayerStatusICoreIdFilter}}
							/>
						</div>

						<div className='col-md-3'>
							<label className='form-label-sm mb-2'>Player Status Name</label>
							<input type='text' className='form-control form-control-sm' value={filterPlayerStatusName} onChange={onChangePlayerStatusNameFilter} />
						</div>
					</FormGroupContainer>

					<FormGroupContainer>
						<ButtonsContainer>
							<MlabButton
								access={userAccess.includes(USER_CLAIMS.PlayerStatusRead)}
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
							<DefaultSecondaryButton access={userAccess.includes(USER_CLAIMS.PlayerStatusWrite)} title={'Add New'} onClick={onAddNew} />
						</ButtonsContainer>
					</FormGroupContainer>

					{/* New Table Implementation */}
					<FormGroupContainer>
						<div className='ag-theme-quartz pb-15' style={{height: 400, width: '100%'}}>
							<AgGridReact
								rowData={rowData}
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
								overlayNoRowsTemplate={gridOverlayTemplate}
							/>

							<DefaultGridPagination
								recordCount={recordCount}
								currentPage={currentPage}
								pageSize={pageSize}
								onClickFirst={onClickFirst}
								onClickPrevious={onClickPrevious}
								onClickNext={onClickNext}
								onClickLast={onClickLast}
								onPageSizeChanged={onPageSizeChanged}
							/>
						</div>
					</FormGroupContainer>
				</ContentContainer>
				<FooterContainer>
					<PaddedContainer>
						<DefaultSecondaryButton access={userAccess.includes(USER_CLAIMS.PlayerStatusRead)} title={'Back'} onClick={handleBackButton} />
					</PaddedContainer>
				</FooterContainer>
			</MainContainer>

			<AddEditPlayerStatusModal
				title={playerConfiguration != undefined ? playerConfiguration.playerConfigurationName : ''}
				configInfo={playerStatusDetail}
				isEditMode={isEditFlag}
				modal={showModal}
				saveConfiguration={saveNewConfiguration}
				rowData={rowData}
				closeModal={() => setShowModal(false)}
				configList={playerStatusList}
			/>
		</>
	);
};

export default EditPlayerStatus;

import {AgGridReact} from 'ag-grid-react';
import {Guid} from 'guid-typescript';
import {useEffect, useRef, useState} from 'react';
import {shallowEqual, useSelector} from 'react-redux';
import {useHistory} from 'react-router-dom';
import swal from 'sweetalert';
import {RootState} from '../../../../../setup';
import * as hubConnection from '../../../../../setup/hub/MessagingHub';
import gridOverlayTemplate from '../../../../common-template/gridTemplates';
import {ElementStyle} from '../../../../constants/Constants';
import useConstant from '../../../../constants/useConstant';
import {
	ButtonsContainer,
	ContentContainer,
	DefaultGridPagination,
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
import useFnsDateFormatter from '../../../../custom-functions/helper/useFnsDateFormatter';
import useSystemHooks from '../../../../custom-functions/system/useSystemHooks';
import {USER_CLAIMS} from '../../../user-management/components/constants/UserClaims';
import {PlayerConfigurationModel, VIPLevelModel} from '../../models';
import {PlayerConfigurationFilterRequestModel} from '../../models/PlayerConfigurationFilterRequestModel';
import {GetPlayerConfigurationByIdRequestModel} from '../../models/requests/GetPlayerConfigurationByIdRequestModel';
import {getPlayerConfigurationById, getPlayerConfigurationByIdResult, getVIPLevelList, getVIPLevelListResult} from '../../redux/SystemService';
import {DefaultPageSetup, PlayerConfigCommons, PlayerConfigTypes, VIPLevelPlayerConfig} from '../constants/PlayerConfigEnums';
import AddEditVIPLevelModal from './modals/AddEditVIPLevelModal';
import './player-configuration.css';
import { ColDef, ColGroupDef } from 'ag-grid-community';


const EditVIPLevel: React.FC = () => {
	// States and Properties
	const history = useHistory();
	const gridRef: any = useRef();
	const {getMasterReference, masterReferenceOptions} = useSystemHooks();
	const {masterReferenceIds, successResponse, HubConnected} = useConstant();
	const {mlabFormatDate} = useFnsDateFormatter();

	const userAccessId = useSelector<RootState>(({auth}) => auth.userId, shallowEqual) as number;
	const userAccess = useSelector<RootState>(({auth}) => auth.access, shallowEqual) as string;
	const [loading, setLoading] = useState(false);

	const [playerConfiguration, setPlayerConfiguration] = useState<PlayerConfigurationModel>();
	const [filterVIPLevelId, setFilterVIPLevelId] = useState('');
	const [filterVIPICoreId, setFilterVIPICoreId] = useState('');
	const [filterVIPLevelName, setFilterVIPLevelName] = useState('');
	const [filterVIPLevelCode, setFilterVIPLevelCode] = useState('');

	const [configList, setConfigList] = useState<Array<VIPLevelModel>>([]);
	const [vipLevelDetail, setVIPLevelDetail] = useState<VIPLevelModel>();
	const [isEditFlag, setIsEditFlag] = useState<boolean>(false);
	const [showModal, setShowModal] = useState<boolean>(false);

	const [pageSize, setPageSize] = useState<number>(DefaultPageSetup.pageSizeDefault);
	const [currentPage, setCurrentPage] = useState<number>(1);
	const [recordCount, setRecordCount] = useState<number>(0);
	const [sortOrder, setSortOrder] = useState<string>(PlayerConfigCommons.Asc);
	const [sortColumn, setSortColumn] = useState<string>(VIPLevelPlayerConfig.VIPLevelId);

	// Side Effects
	useEffect(() => {
		if (!loading && configList.length === 0) {
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
		getPlayerConfigInfo(PlayerConfigTypes.VIPLevelTypeId);
		getMasterReference(masterReferenceIds.parentId.VIPGroup.toString());
		setSortOrder(PlayerConfigCommons.Asc);
		setSortColumn(VIPLevelPlayerConfig.VIPLevelId);
	}, []);

	// Methods
	const onEditVIPLevelPageSizeChanged = () => {
		let value: string = (document.getElementById('page-size') as HTMLInputElement).value;
		setPageSize(Number(value));
		setCurrentPage(1);

		if (configList != undefined && configList.length > 0) {
			editVipLevelpaginationLoadList(Number(value), 1, sortColumn, sortOrder);
		}
	};

	const onEditVIPLevelClickFirst = () => {
		if (currentPage > 1) {
			setCurrentPage(1);
			editVipLevelpaginationLoadList(pageSize, 1, sortColumn, sortOrder);
		}
	};

	const onEditVIPLevelClickPrevious = () => {
		if (currentPage > 1) {
			setCurrentPage(currentPage - 1);
			editVipLevelpaginationLoadList(pageSize, currentPage - 1, sortColumn, sortOrder);
		}
	};

	const onEditVIPLevelClickNext = () => {
		if (totalEditVIPLevelPage() > currentPage) {
			setCurrentPage(currentPage + 1);
			editVipLevelpaginationLoadList(pageSize, currentPage + 1, sortColumn, sortOrder);
		}
	};

	const onEditVIPLevelClickLast = () => {
		if (totalEditVIPLevelPage() > currentPage) {
			setCurrentPage(totalEditVIPLevelPage());
			editVipLevelpaginationLoadList(pageSize, totalEditVIPLevelPage(), sortColumn, sortOrder);
		}
	};

	const totalEditVIPLevelPage = () => {
		return Math.ceil(recordCount / pageSize) | 0;
	};
	const handleFilterVIPLevelIdChange = (event: any) => {
		setFilterVIPLevelId(event.target.value);
	};

	const handleFilterVIPICoreIdChange = (event: any) => {
		setFilterVIPICoreId(event.target.value);
	};

	const handleFilterVIPLevelNameChange = (event: any) => {
		setFilterVIPLevelName(event.target.value);
	};

	const renderVIPGroup = (_params: any) => {
		return masterReferenceOptions.map((objOptions) => objOptions.options).find((objFilter) => objFilter.value === _params.data.vipGroupId.toString())
			?.label;
	};

	const renderEditVIPLevelAction = (_params: any) => (
		<DefaultTableButton access={userAccess.includes(USER_CLAIMS.VIPLevelWrite)} title={'Edit'} onClick={() => handleEdit(_params.data.vipLevelId)} />
	);

	const colDef : (ColDef<VIPLevelModel> | ColGroupDef<VIPLevelModel>)[] =  [
		{
			field:  VIPLevelPlayerConfig.VIPLevelId,
			headerName: VIPLevelPlayerConfig.VIPLevelIDHeader,
		},
		{
			field:  PlayerConfigCommons.ICoreIdField,
			headerName: PlayerConfigCommons.ICoreIdHeader,
		},
		{
			field:  VIPLevelPlayerConfig.VIPLevelName,
			headerName: VIPLevelPlayerConfig.VIPLevelNameHeader,
		},
		{
			field:  VIPLevelPlayerConfig.BrandName,
			headerName: VIPLevelPlayerConfig.BrandNameHeader,
		},
		{
			field:  VIPLevelPlayerConfig.VIPGroup,
			headerName: VIPLevelPlayerConfig.VIPGroupHeader,
			cellRenderer: renderVIPGroup,
		},
		{
			field:  PlayerConfigCommons.IsComplete,
			headerName: PlayerConfigCommons.Complete,
			cellRenderer: (params: any) => (params.data.isComplete === true ? 'Yes' : 'No'),
		},
		{
			headerName: 'Action',
			cellRenderer: renderEditVIPLevelAction,
		},
	]

	const gridOptions = {
		rowClassRules: {
			'rag-red': 'data.isComplete !== true',
		},
	};

	const getPlayerConfigInfo = async (id: number) => {
		setLoading(true);
		const request: GetPlayerConfigurationByIdRequestModel = {
			id: id,
			userId: userAccessId.toString(),
			queueId: Guid.create().toString(),
		};

		setTimeout(() => {
			const messagingHub = hubConnection.createHubConnenction();
			messagingHub
				.start()
				.then(() => {
					if (messagingHub.state === HubConnected) {
						getPlayerConfigurationById(request)
							.then((response) => {
								if (response.status === successResponse) {
									messagingHub.on(request.queueId.toString(), (message) => {
										getPlayerConfigurationByIdResult(message.cacheId).then((returnData) => {
											const item = Object.assign(returnData.data);
											setPlayerConfiguration(item);
											setLoading(false);
											messagingHub.off(request.queueId.toString());
											messagingHub.stop();
										});
									});

									setTimeout(() => {
										if (messagingHub.state === HubConnected) {
											messagingHub.stop();
										}
									}, 30000);
								} else {
									messagingHub.stop();
									setLoading(false);
								}
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

	const editVipLevelpaginationLoadList = (pageSize: number, currentPage: number, sortColumn: string, sortOrder: string) => {
		const request: PlayerConfigurationFilterRequestModel = {
			playerConfigurationTypeId: PlayerConfigTypes.VIPLevelTypeId,
			playerConfigurationName: filterVIPLevelName,
			playerConfigurationCode: filterVIPLevelCode,
			playerConfigurationId: filterVIPLevelId !== '' ? Number(filterVIPLevelId) : undefined,
			playerConfigurationICoreId: filterVIPICoreId !== '' ? Number(filterVIPLevelId) : undefined,
			pageSize: pageSize,
			offsetValue: (currentPage - 1) * pageSize,
			sortColumn: sortColumn,
			sortOrder: sortOrder,
			userId: userAccessId.toString(),
			queueId: Guid.create().toString(),
		};

		loadVIPLevelList(request);
	};

	const handleSearch = () => {
		setCurrentPage(1);
		const request: PlayerConfigurationFilterRequestModel = {
			pageSize: pageSize,
			offsetValue: 0,
			sortColumn: VIPLevelPlayerConfig.VIPLevelId,
			sortOrder: PlayerConfigCommons.Asc,
			userId: userAccessId.toString(),
			queueId: Guid.create().toString(),
			playerConfigurationTypeId: PlayerConfigTypes.VIPLevelTypeId,
			playerConfigurationName: filterVIPLevelName,
			playerConfigurationCode: '',
			playerConfigurationId: filterVIPLevelId !== '' ? Number(filterVIPLevelId) : undefined,
			playerConfigurationICoreId: filterVIPICoreId !== '' ? Number(filterVIPICoreId) : undefined,
		};

		loadVIPLevelList(request);
	};

	const loadVIPLevelList = (request: PlayerConfigurationFilterRequestModel) => {
		setLoading(true);
		setConfigList([]);
		setTimeout(() => {
			const messagingHub = hubConnection.createHubConnenction();
			messagingHub.start().then(() => {
				getVIPLevelList(request).then((response: any) => {
					if (response.status === successResponse) {
						messagingHub.on(request.queueId.toString(), (message) => {
							getVIPLevelListResult(message.cacheId)
								.then((returnData: any) => {
									setConfigList(returnData.data.vipLevelList);
									setRecordCount(returnData.data.recordCount);
									setLoading(false);
									messagingHub.off(request.queueId.toString());
									messagingHub.stop();
								})
								.catch(() => {
									swal('Failed', `Error loading VIPLevel`, 'error');
									setLoading(false);
								});
							setLoading(false);
						});
					} else {
						swal('Failed', response.data.message, 'error');
					}
				});
			});
		}, 1000);
	};

	const clearFilter = () => {
		setFilterVIPLevelId('');
		setFilterVIPICoreId('');
		setFilterVIPLevelName('');
		setFilterVIPLevelCode('');
	};

	const handleBack = () => {
		history.push('/system/player-configuration-list');
	};

	const handleShowModal = () => {
		setShowModal(!showModal);
	};

	const handleEdit = (id: number) => {
		const detail = configList.find((i) => i.vipLevelId === id);
		if (detail !== undefined) {
			setIsEditFlag(true);
			setVIPLevelDetail(detail);
			setShowModal(true);
		}
	};

	const handleAddNew = () => {
		setIsEditFlag(false);
		setVIPLevelDetail(undefined);
		setShowModal(true);
	};

	const handleSave = () => {
		handleShowModal();
		clearFilter();
		editVipLevelpaginationLoadList(pageSize, currentPage, sortColumn, sortOrder);
		//handleSearch()
	};

	const onEditVIPLevelGridReady = () => {
		resizeEditVIPLevelColumns();
		handleSearch();
	};

	const resizeEditVIPLevelColumns = () => {
		gridRef.current.api.sizeColumnsToFit();
	};

	return (
		<>
			<MainContainer>
				<FormHeader headerLabel={'Edit VIP Level'} />
				<ContentContainer>
					<FormGroupContainer>
						<div className='col-lg-3'>
							<label>
								Player Configuration Type
								<p className='form-control-plaintext fw-bolder'>{playerConfiguration?.playerConfigurationName}</p>
							</label>
						</div>
					</FormGroupContainer>
					<FormGroupContainer>
						<div className='col-lg-3'>
							<label>
								Created Date
								<p className='form-control-plaintext fw-bolder'>{mlabFormatDate(playerConfiguration?.createdDate)}</p>
							</label>
						</div>
						<div className='col-lg-3'>
							<label>
								Created By
								<p className='form-control-plaintext fw-bolder'>{playerConfiguration?.createdByName}</p>
							</label>
						</div>
						<div className='col-lg-3'>
							<label>
								Last Modified Date
								<p className='form-control-plaintext fw-bolder'>{mlabFormatDate(playerConfiguration?.updatedDate)}</p>
							</label>
						</div>
						<div className='col-lg-3'>
							<label>
								Modified By
								<p className='form-control-plaintext fw-bolder'>{playerConfiguration?.updatedByName}</p>
							</label>
						</div>
					</FormGroupContainer>
					<hr className='my-3 mb-7' />

					<FormGroupContainer>
						<div className='col-lg-2'>
							<span className='form-label-sm mb-2 d-block'>VIP Level Id</span>
							<NumberTextInput
								ariaLabel={''}
								className={'form-control form-control-sm'}
								{...{value: filterVIPLevelId, onChange: handleFilterVIPLevelIdChange}}
							/>
						</div>

						<div className='col-lg-2'>
							<span className='form-label-sm mb-2 d-block'>iCore ID</span>
							<NumberTextInput
								ariaLabel={''}
								className={'form-control form-control-sm '}
								{...{value: filterVIPICoreId, onChange: handleFilterVIPICoreIdChange}}
							/>
						</div>

						<div className='col-lg-3'>
							<span className='form-label-sm mb-2 d-block'>VIP Level Name </span>
							<input type='text' value={filterVIPLevelName} onChange={handleFilterVIPLevelNameChange} className='form-control form-control-sm' />
						</div>
					</FormGroupContainer>

					<FormGroupContainer>
						<ButtonsContainer>
							<MlabButton
								access={userAccess.includes(USER_CLAIMS.VIPLevelRead)}
								label='Search'
								style={ElementStyle.primary}
								type={'button'}
								weight={'solid'}
								size={'sm'}
								loading={loading}
								loadingTitle={'Please wait...'}
								onClick={() => {
									handleSearch();
									setCurrentPage(1);
								}}
								disabled={loading}
							/>
							<MlabButton
								access={userAccess.includes(USER_CLAIMS.VIPLevelWrite)}
								label='Add New'
								style={ElementStyle.secondary}
								type={'button'}
								weight={'solid'}
								size={'sm'}
								onClick={handleAddNew}
							/>
						</ButtonsContainer>
					</FormGroupContainer>
					<FormGroupContainer>
						<div className='ag-theme-quartz' style={{height: 400, width: '100%', marginBottom: '50px'}}>
							<AgGridReact
								ref={gridRef}
								rowData={configList}
								columnDefs={colDef}
								overlayNoRowsTemplate={gridOverlayTemplate}
								defaultColDef={{
									sortable: true,
									resizable: true,
								}}
								animateRows={true}
								onGridReady={onEditVIPLevelGridReady}
								onComponentStateChanged={resizeEditVIPLevelColumns}
								rowBuffer={0}
								//enableRangeSelection={true} //deprecated in AgGridReactver.32.0.0
								rowClassRules={gridOptions.rowClassRules}
							/>
							<DefaultGridPagination
								recordCount={recordCount}
								currentPage={currentPage}
								pageSize={pageSize}
								onClickFirst={onEditVIPLevelClickFirst}
								onClickPrevious={onEditVIPLevelClickPrevious}
								onClickNext={onEditVIPLevelClickNext}
								onClickLast={onEditVIPLevelClickLast}
								onPageSizeChanged={onEditVIPLevelPageSizeChanged}
								defaultColumns={colDef}
							/>
						</div>
					</FormGroupContainer>
				</ContentContainer>
				<FooterContainer>
					<PaddedContainer>
						<DefaultSecondaryButton access={userAccess.includes(USER_CLAIMS.VIPLevelRead)} title={'Back'} onClick={handleBack} />
					</PaddedContainer>
				</FooterContainer>
			</MainContainer>

			<AddEditVIPLevelModal
				title={VIPLevelPlayerConfig.VIPLevel}
				configInfo={vipLevelDetail}
				isEditMode={isEditFlag}
				modal={showModal}
				toggle={handleShowModal}
				handleSave={handleSave}
				rowData={configList}
			/>
		</>
	);
};

export default EditVIPLevel;

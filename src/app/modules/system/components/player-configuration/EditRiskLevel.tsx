import {AgGridReact} from 'ag-grid-react';
import 'datatables.net';
import 'datatables.net-dt';
import {Guid} from 'guid-typescript';
import {useEffect, useRef, useState} from 'react';
import {shallowEqual, useSelector} from 'react-redux';
import {useHistory} from 'react-router-dom';
import swal from 'sweetalert';
import '../../../../../_metronic/assets/css/datatables.min.css';
import {RootState} from '../../../../../setup';
import * as hubConnection from '../../../../../setup/hub/MessagingHub';
import gridOverlayTemplate from '../../../../common-template/gridTemplates';
import {ElementStyle} from '../../../../constants/Constants';
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
import {useFormattedDate} from '../../../../custom-functions';
import {USER_CLAIMS} from '../../../user-management/components/constants/UserClaims';
import {BrandResponseModel} from '../../models';
import {PlayerConfigurationFilterRequestModel} from '../../models/PlayerConfigurationFilterRequestModel';
import {PlayerConfigurationModel} from '../../models/PlayerConfigurationModel';
import {GetPlayerConfigurationByIdRequestModel} from '../../models/requests/GetPlayerConfigurationByIdRequestModel';
import {RiskLevelModel} from '../../models/RiskLevelModel';
import {getPlayerConfigurationById, getPlayerConfigurationByIdResult, getRiskLevelList, getRiskLevelListResult} from '../../redux/SystemService';
import {PlayerConfigCommons, PlayerConfigTypes, RiskLevelPlayerConfig, StatusCode} from '../constants/PlayerConfigEnums';
import AddEditRiskLevelModal from './modals/AddEditRiskLevelModal';
import './player-configuration.css';
import { ColDef, ColGroupDef } from 'ag-grid-community';


const EditRiskLevel: React.FC = () => {
	//  States
	const gridRef: any = useRef();
	const history = useHistory();
	const userAccessId = useSelector<RootState>(({auth}) => auth.userId, shallowEqual) as number;
	const userAccess = useSelector<RootState>(({auth}) => auth.access, shallowEqual) as string;
	const [showModal, setShowModal] = useState(false);
	const [isEditFlag, setIsEditFlag] = useState(false);
	const [idFilter, setIdFilter] = useState('');
	const [iCoreIdFilter, setICoreIdFilter] = useState('');
	const [nameFilter, setNameFilter] = useState('');
	const [rowData] = useState<Array<any>>([]);
	const [loading, setLoading] = useState(false);
	const [brandList] = useState<Array<BrandResponseModel>>([]);
	const [playerConfiguration, setPlayerConfiguration] = useState<PlayerConfigurationModel>();

	const [configList, setConfigList] = useState<Array<RiskLevelModel>>([]);
	const [riskLevelInfo, setRiskLevelInfo] = useState<RiskLevelModel>();

	const [pageSize, setPageSize] = useState<number>(10);
	const [currentPage, setCurrentPage] = useState<number>(1);
	const [recordCount, setRecordCount] = useState<number>(0);
	const [sortOrder] = useState<string>(PlayerConfigCommons.Asc);
	const [sortColumn] = useState<string>(RiskLevelPlayerConfig.RiskLevelId);

	const colDef : (ColDef<RiskLevelModel> | ColGroupDef<RiskLevelModel>)[] =  [
		{
			field: RiskLevelPlayerConfig.RiskLevelId,
			headerName: RiskLevelPlayerConfig.RiskLevelIdHeader,
		},
		{
			field: PlayerConfigCommons.ICoreIdField,
			headerName: PlayerConfigCommons.ICoreIdHeader,
		},
		{
			field: RiskLevelPlayerConfig.RiskLevelName,
			headerName: RiskLevelPlayerConfig.RiskLevelNameHeader,
		},
		{
			headerName: 'Action',
			cellRenderer: (params: any) => {
				return (
					<DefaultTableButton access={userAccess.includes(USER_CLAIMS.RiskLevelWrite)} title={'Edit'} onClick={() => handleEditRow(params.data)} />
				);
			},
		},
	];

	// Effects
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
		getPlayerConfigInfo(PlayerConfigTypes.RiskLevelTypeId);
	}, []);

	//  Methods
	const onPageSizeChanged = () => {
		var value: string = (document.getElementById('page-size') as HTMLInputElement).value;
		setPageSize(Number(value));
		setCurrentPage(1);

		if (configList != undefined && configList.length > 0) {
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

	const totalPage = () => {
		return Math.ceil(recordCount / pageSize) | 0;
	};

	const paginationLoadList = (pageSize: number, currentPage: number, sortColumn: string, sortOrder: string) => {
		const request: PlayerConfigurationFilterRequestModel = {
			playerConfigurationTypeId: PlayerConfigTypes.RiskLevelTypeId,
			playerConfigurationName: nameFilter,
			playerConfigurationCode: '',
			playerConfigurationId: idFilter !== '' ? Number(idFilter) : undefined,
			playerConfigurationICoreId: iCoreIdFilter !== '' ? Number(iCoreIdFilter) : undefined,
			pageSize: pageSize,
			offsetValue: (currentPage - 1) * pageSize,
			sortColumn: sortColumn,
			sortOrder: sortOrder,
			userId: userAccessId.toString(),
			queueId: Guid.create().toString(),
		};

		loadRiskLevelList(request);
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
					if (messagingHub.state === StatusCode.Connected) {
						getPlayerConfigurationById(request)
							.then((response) => {
								if (response.status === StatusCode.OK) {
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
										if (messagingHub.state === StatusCode.Connected) {
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

	const loadRiskLevelList = (request: PlayerConfigurationFilterRequestModel) => {
		setLoading(true);
		setConfigList([]);
		setTimeout(() => {
			const messagingHub = hubConnection.createHubConnenction();
			messagingHub.start().then(() => {
				getRiskLevelList(request).then((response: any) => {
					if (response.status === StatusCode.OK) {
						messagingHub.on(request.queueId.toString(), (message) => {
							getRiskLevelListResult(message.cacheId)
								.then((returnData: any) => {
									setConfigList(returnData.data.riskLevelList);
									setRecordCount(returnData.data.recordCount);
									setLoading(false);
									messagingHub.off(request.queueId.toString());
									messagingHub.stop();
								})
								.catch(() => {
									swal('Failed', `Error loading Marketing Channel`, 'error');
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

	const handleIdFilterOnChange = (event: any) => {
		setIdFilter(event.target.value);
	};

	const handleICoreIdFilterOnChange = (event: any) => {
		setICoreIdFilter(event.target.value);
	};

	const handleNameFilterOnChange = (event: any) => {
		setNameFilter(event.target.value);
	};

	const handleShowModal = () => {
		setShowModal(!showModal);
	};

	const handleEditRow = (item: any) => {
		setIsEditFlag(true);
		setRiskLevelInfo(item);
		handleShowModal();
	};

	const handleSearch = () => {
		if (Number.isInteger(parseInt(idFilter)) === false && idFilter !== '') {
			swal('Failed', 'Risk Level Id should be a number', 'error');
			return;
		}
		setCurrentPage(1);
		const request: PlayerConfigurationFilterRequestModel = {
			pageSize: pageSize,
			offsetValue: 0,
			sortColumn: RiskLevelPlayerConfig.RiskLevelId,
			sortOrder: PlayerConfigCommons.Asc,
			userId: userAccessId.toString(),
			queueId: Guid.create().toString(),
			playerConfigurationTypeId: PlayerConfigTypes.RiskLevelTypeId,
			playerConfigurationName: nameFilter,
			playerConfigurationCode: '',
			playerConfigurationId: idFilter !== '' ? Number(idFilter) : undefined,
			playerConfigurationICoreId: iCoreIdFilter !== '' ? Number(iCoreIdFilter) : undefined,
		};

		loadRiskLevelList(request);
	};

	const handleAddNew = () => {
		setIsEditFlag(false);
		handleShowModal();
	};

	const clearFilter = () => {
		setIdFilter('');
		setNameFilter('');
	};

	const saveNewConfiguration = () => {
		handleShowModal();
		clearFilter();
		paginationLoadList(pageSize, currentPage, sortColumn, sortOrder);
	};

	const onGridReady = () => {
		resizeColumns();
		handleSearch();
	};

	const resizeColumns = () => {
		gridRef.current.api.sizeColumnsToFit();
	};

	const handleBackButton = () => {
		history.push('/system/player-configuration-list');
	};

	return (
		<>
			<MainContainer>
				<FormHeader headerLabel={'Edit Risk Level'} />
				<ContentContainer>
					<FormGroupContainer>
						<div className='col-lg-3'>
							<label>Player Configuration Name</label>
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
						{/* Adjusted field layout */}
						<div className='col-md-2'>
							<label className='form-label-sm mb-2'>Risk Level Id</label>
							<NumberTextInput ariaLabel={''} className={'form-control form-control-sm'} {...{value: idFilter, onChange: handleIdFilterOnChange}} />
						</div>

						<div className='col-md-2'>
							<label className='form-label-sm mb-2'>iCore Id</label>
							<NumberTextInput
								ariaLabel={''}
								className={'form-control form-control-sm'}
								{...{value: iCoreIdFilter, onChange: handleICoreIdFilterOnChange}}
							/>
						</div>

						<div className='col-md-3'>
							<label className='form-label-sm mb-2'>Risk Level Name</label>
							<input type='text' className='form-control form-control-sm' value={nameFilter} onChange={handleNameFilterOnChange} />
						</div>
					</FormGroupContainer>
					<FormGroupContainer>
						<ButtonsContainer>
							<MlabButton
								access={userAccess.includes(USER_CLAIMS.RiskLevelRead)}
								label='Search'
								style={ElementStyle.primary}
								type={'button'}
								weight={'solid'}
								size={'sm'}
								loading={loading}
								loadingTitle={'Please wait...'}
								onClick={handleSearch}
								disabled={loading}
							/>
							<MlabButton
								access={userAccess.includes(USER_CLAIMS.RiskLevelWrite)}
								label='Add New'
								style={ElementStyle.secondary}
								type={'button'}
								weight={'solid'}
								size={'sm'}
								onClick={handleAddNew}
								disabled={loading}
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
								onGridReady={onGridReady}
								onComponentStateChanged={resizeColumns}
								rowBuffer={0}
								//enableRangeSelection={true} //deprecated in AgGridReactver.32.0.0
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
								defaultColumns={colDef}
							/>
						</div>
					</FormGroupContainer>
				</ContentContainer>
				<FooterContainer>
					<PaddedContainer>
						<DefaultSecondaryButton access={userAccess.includes(USER_CLAIMS.RiskLevelRead)} title={'Back'} onClick={handleBackButton} />
					</PaddedContainer>
				</FooterContainer>
			</MainContainer>
			<AddEditRiskLevelModal
				title={RiskLevelPlayerConfig.RiskLevel}
				configInfo={riskLevelInfo}
				isEditMode={isEditFlag}
				modal={showModal}
				toggle={handleShowModal}
				handleSave={saveNewConfiguration}
				rowData={rowData}
				brandData={brandList}
				configList={configList}
			/>
		</>
	);
};

export default EditRiskLevel;

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
import {MarketingChannelResponseModel, PlayerConfigurationModel} from '../../models';
import {PlayerConfigurationFilterRequestModel} from '../../models/PlayerConfigurationFilterRequestModel';
import {getMarketingChannelList, getMarketingChannelListResult} from '../../redux/SystemService';
import {useSystemPlayerConfigurationHooks} from '../../shared/hooks/useSystemPlayerConfigurationHooks';
import {MarketingChannelPlayerConfig, PlayerConfigCommons, PlayerConfigTypes, StatusCode} from '../constants/PlayerConfigEnums';
import AddEditMarketingChannelModal from './modals/AddEditMarketingChannelModal';
import './player-configuration.css';
import { ColDef, ColGroupDef } from 'ag-grid-community';


const EditMarketingChannel: React.FC = () => {
	// Properties
	const history = useHistory();
	const gridRef: any = useRef();

	const userAccessId = useSelector<RootState>(({auth}) => auth.userId, shallowEqual) as number;
	const userAccess = useSelector<RootState>(({auth}) => auth.access, shallowEqual) as string;
	const [loading, setLoading] = useState(false);

	const [filterMarketingChannelId, setFilterMarketingChannelId] = useState('');
	const [filterMarketingChannelICoreId, setFilterMarketingChannelICoreId] = useState('');
	const [filterMarketingChannelName, setFilterMarketingChannelName] = useState('');
	const [marketingChannelInfo, setMarketingChannelInfo] = useState<PlayerConfigurationModel>();

	const [configList, setConfigList] = useState<Array<MarketingChannelResponseModel>>([]);
	const [marketingChannelDetail, setMarketingChannelDetail] = useState<MarketingChannelResponseModel>();
	const [isEditFlag, setIsEditFlag] = useState<boolean>(false);
	const [showModal, setShowModal] = useState<boolean>(false);

	const [pageSize, setPageSize] = useState<number>(10);
	const [currentPage, setCurrentPage] = useState<number>(1);
	const [recordCount, setRecordCount] = useState<number>(0);
	const [sortOrder] = useState<string>(PlayerConfigCommons.Asc);
	const [sortColumn] = useState<string>(MarketingChannelPlayerConfig.MarketingChannelId);
	const {getPlayerConfigInfoById, playerConfigurationInfo} = useSystemPlayerConfigurationHooks();

	const colDef : (ColDef<MarketingChannelResponseModel> | ColGroupDef<MarketingChannelResponseModel>)[] = [
		{
			field:  MarketingChannelPlayerConfig.MarketingChannelId,
			headerName: MarketingChannelPlayerConfig.MarketingChannelIdHeader,
		},
		{
			field:  PlayerConfigCommons.ICoreIdField,
			headerName: PlayerConfigCommons.ICoreIdHeader,
		},
		{
			field:  MarketingChannelPlayerConfig.MarketingChannelName,
			headerName: MarketingChannelPlayerConfig.MarketingChannelNameHeader,
		},
		{
			headerName: 'Action',
			cellRenderer: (params: any) => {
				return (
					<DefaultTableButton
						access={userAccess.includes(USER_CLAIMS.MarketingChannelWrite)}
						title={'Edit'}
						onClick={() => handleEdit(params.data.id)}
					/>
				);
			},
		},
	];

	// Side Effects
	useEffect(() => {
		let marketingChannelLoading = document.getElementById('mlab-grid-loading-overlay') as HTMLInputElement;
		if (!loading && configList.length === 0) {
			if (marketingChannelLoading) {
				marketingChannelLoading.innerText = 'No Rows To Show';
			}
		} else {
			if (marketingChannelLoading) {
				marketingChannelLoading.innerText = 'Please wait while your items are loading';
			}
		}
	}, [loading]);

	useEffect(() => {
		if (playerConfigurationInfo) {
			setMarketingChannelInfo(playerConfigurationInfo);
		}
	}, [playerConfigurationInfo]);

	useEffect(() => {
		getPlayerConfigInfoById(PlayerConfigTypes.MarketingChannelTypeId);
	}, []);

	// Methods
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
		console.log(pageSize, '-', currentPage, '-', sortColumn, '-', sortOrder);
		if (totalPage() > currentPage) {
			setCurrentPage(totalPage());
			paginationLoadList(pageSize, totalPage(), sortColumn, sortOrder);
		}
	};

	const totalPage = () => {
		return Math.ceil(recordCount / pageSize) | 0;
	};

	const handleFilterMarketingChannelIdChange = (event: any) => {
		setFilterMarketingChannelId(event.target.value);
	};

	const handleFilterMarketingChannelICoreIdChange = (event: any) => {
		setFilterMarketingChannelICoreId(event.target.value);
	};

	const handleFilterMarketingChannelNameChange = (event: any) => {
		setFilterMarketingChannelName(event.target.value);
	};

	const paginationLoadList = (pageSize: number, currentPage: number, sortColumn: string, sortOrder: string) => {
		const request: PlayerConfigurationFilterRequestModel = {
			playerConfigurationTypeId: PlayerConfigTypes.MarketingChannelTypeId,
			playerConfigurationName: filterMarketingChannelName,
			playerConfigurationCode: '',
			playerConfigurationId: filterMarketingChannelId !== '' ? Number(filterMarketingChannelId) : undefined,
			pageSize: pageSize,
			offsetValue: (currentPage - 1) * pageSize,
			sortColumn: sortColumn,
			sortOrder: sortOrder,
			userId: userAccessId.toString(),
			queueId: Guid.create().toString(),
			playerConfigurationICoreId: filterMarketingChannelICoreId !== '' ? Number(filterMarketingChannelICoreId) : undefined,
		};

		loadMarketingChannelList(request);
	};

	const handleSearch = () => {
		setCurrentPage(1);
		const request: PlayerConfigurationFilterRequestModel = {
			pageSize: pageSize,
			offsetValue: 0,
			sortColumn: MarketingChannelPlayerConfig.MarketingChannelId,
			sortOrder: PlayerConfigCommons.Asc,
			userId: userAccessId.toString(),
			queueId: Guid.create().toString(),
			playerConfigurationTypeId: PlayerConfigTypes.MarketingChannelTypeId,
			playerConfigurationName: filterMarketingChannelName,
			playerConfigurationCode: '',
			playerConfigurationId: filterMarketingChannelId !== '' ? Number(filterMarketingChannelId) : undefined,
			playerConfigurationICoreId: filterMarketingChannelICoreId !== '' ? Number(filterMarketingChannelICoreId) : undefined,
		};
		loadMarketingChannelList(request);
	};

	const loadMarketingChannelList = (request: PlayerConfigurationFilterRequestModel) => {
		setLoading(true);
		setConfigList([]);
		setTimeout(() => {
			const messagingHub = hubConnection.createHubConnenction();
			messagingHub.start().then(() => {
				getMarketingChannelList(request).then((response: any) => {
					if (response.status === StatusCode.OK) {
						messagingHub.on(request.queueId.toString(), (message) => {
							getMarketingChannelListResult(message.cacheId)
								.then((returnData: any) => {
									setConfigList(returnData.data.marketingChannelList);
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

	const clearFilter = () => {
		setFilterMarketingChannelId('');
		setFilterMarketingChannelName('');
	};

	const handleBack = () => {
		history.push('/system/player-configuration-list');
	};

	const handleShowModal = () => {
		setShowModal(!showModal);
	};

	const handleEdit = (id: number) => {
		const detail = configList.find((i) => i.id === id);
		if (detail !== undefined) {
			setIsEditFlag(true);
			setMarketingChannelDetail(detail);
			setShowModal(true);
		}
	};

	const handleAddNew = () => {
		setIsEditFlag(false);
		setMarketingChannelDetail(undefined);
		setShowModal(true);
	};

	const handleSave = () => {
		handleShowModal();
		clearFilter();
		getPlayerConfigInfoById(PlayerConfigTypes.MarketingChannelTypeId);
		paginationLoadList(pageSize, currentPage, sortColumn, sortOrder);
	};

	const onGridReady = () => {
		resizeColumns();
		handleSearch();
	};

	const resizeColumns = () => {
		gridRef.current.api.sizeColumnsToFit();
	};

	return (
		<>
			<MainContainer>
				<FormHeader headerLabel={'Edit Marketing Channel'} />
				<ContentContainer>
					<FormGroupContainer>
						<div className='col-lg-3'>
							<label>Player Configuration Type</label>
							<p className='form-control-plaintext fw-bolder'>{marketingChannelInfo?.playerConfigurationName}</p>
						</div>
					</FormGroupContainer>
					<FormGroupContainer>
						<div className='col-lg-3'>
							<label>Created Date</label>
							<p className='form-control-plaintext fw-bolder'>
								{useFormattedDate(marketingChannelInfo?.createdDate ? marketingChannelInfo.createdDate : '')}
							</p>
						</div>
						<div className='col-lg-3'>
							<label>Created By</label>
							<p className='form-control-plaintext fw-bolder'>{marketingChannelInfo?.createdByName}</p>
						</div>
						<div className='col-lg-3'>
							<label>Last Modified Date</label>
							<p className='form-control-plaintext fw-bolder'>
								{useFormattedDate(marketingChannelInfo?.updatedDate ? marketingChannelInfo.updatedDate : '')}
							</p>
						</div>
						<div className='col-lg-3'>
							<label>Modified By</label>
							<p className='form-control-plaintext fw-bolder'>{marketingChannelInfo?.updatedByName}</p>
						</div>
					</FormGroupContainer>
					<hr className='my-3 mb-7' />

					<FormGroupContainer>
						<div className='col-md-2'>
							<label className='form-label-sm mb-2'>Marketing Channel Id</label>
							<NumberTextInput
								ariaLabel={''}
								className={'form-control form-control-sm'}
								{...{
									value: filterMarketingChannelId,
									onChange: handleFilterMarketingChannelIdChange,
								}}
							/>
						</div>

						<div className='col-md-2'>
							<label className='form-label-sm mb-2'>iCore Id</label>
							<NumberTextInput
								ariaLabel={''}
								className={'form-control form-control-sm'}
								{...{
									value: filterMarketingChannelICoreId,
									onChange: handleFilterMarketingChannelICoreIdChange,
								}}
							/>
						</div>

						<div className='col-md-3'>
							<label className='form-label-sm mb-2'>Marketing Channel Name</label>
							<input
								type='text'
								value={filterMarketingChannelName}
								onChange={handleFilterMarketingChannelNameChange}
								className='form-control form-control-sm'
							/>
						</div>
					</FormGroupContainer>

					<FormGroupContainer>
						<ButtonsContainer>
							<MlabButton
								access={userAccess.includes(USER_CLAIMS.MarketingChannelRead)}
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
								access={userAccess.includes(USER_CLAIMS.MarketingChannelWrite)}
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
						<DefaultSecondaryButton access={userAccess.includes(USER_CLAIMS.MarketingChannelRead)} title={'Back'} onClick={handleBack} />
					</PaddedContainer>
				</FooterContainer>
			</MainContainer>

			<AddEditMarketingChannelModal
				title={MarketingChannelPlayerConfig.MarketingChannel}
				configInfo={marketingChannelDetail}
				isEditMode={isEditFlag}
				modal={showModal}
				toggle={handleShowModal}
				handleSave={handleSave}
				closeModal={() => setShowModal(false)}
			/>
		</>
	);
};

export default EditMarketingChannel;

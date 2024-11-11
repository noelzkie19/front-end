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
import {PlayerConfigurationModel} from '../../models';
import {PlayerConfigurationFilterRequestModel} from '../../models/PlayerConfigurationFilterRequestModel';
import {CurrencyConfigResponseModel} from '../../models/response/CurrencyConfigResponseModel';
import {getCurrencyList, getCurrencyListResult} from '../../redux/SystemService';
import {useSystemPlayerConfigurationHooks} from '../../shared/hooks/useSystemPlayerConfigurationHooks';
import {CurrencyPlayerConfig, DefaultPageSetup, PlayerConfigCommons, PlayerConfigTypes, StatusCode} from '../constants/PlayerConfigEnums';
import AddEditCurrencyModal from './modals/AddEditCurrencyModal';
import './player-configuration.css';
import { ColDef, ColGroupDef } from 'ag-grid-community';


const EditCurrency: React.FC = () => {
	// States and Properties
	const history = useHistory();
	const gridRef: any = useRef();

	const userAccessId = useSelector<RootState>(({auth}) => auth.userId, shallowEqual) as number;
	const userAccess = useSelector<RootState>(({auth}) => auth.access, shallowEqual) as string;
	const [loading, setLoading] = useState<boolean>(false);

	const [filterCurrencyId, setFilterCurrencyId] = useState('');
	const [filterCurrencyICoreId, setFilterCurrencyICoreId] = useState('');
	const [filterCurrencyName, setFilterCurrencyName] = useState('');
	const [filterCurrencyCode, setFilterCurrencyCode] = useState('');
	const [currencyInfo, setCurrencyInfo] = useState<PlayerConfigurationModel>();

	const [configList, setConfigList] = useState<Array<CurrencyConfigResponseModel>>([]);
	const [currencyDetail, setCurrencyDetail] = useState<CurrencyConfigResponseModel>();
	const [isEditFlag, setIsEditFlag] = useState<boolean>(false);
	const [showModal, setShowModal] = useState<boolean>(false);

	const [pageSize, setPageSize] = useState<number>(DefaultPageSetup.pageSizeDefault);
	const [currentPage, setCurrentPage] = useState<number>(1);
	const [recordCount, setRecordCount] = useState<number>(0);
	const [sortOrder] = useState<string>(PlayerConfigCommons.Asc);
	const [sortColumn] = useState<string>(CurrencyPlayerConfig.CurrencyId);

	const {getPlayerConfigInfoById, playerConfigurationInfo} = useSystemPlayerConfigurationHooks();

	const colDef: (ColDef<CurrencyConfigResponseModel> | ColGroupDef<CurrencyConfigResponseModel>)[] = 
	[
		{
			field:  CurrencyPlayerConfig.CurrencyId,
			headerName: CurrencyPlayerConfig.CurrencyIdHeader,
		},
		{
			field:  PlayerConfigCommons.ICoreIdField,
			headerName: PlayerConfigCommons.ICoreIdHeader,
		},
		{
			field:  CurrencyPlayerConfig.CurrencyName,
			headerName: CurrencyPlayerConfig.CurrencyNameHeader,
		},
		{
			field:  CurrencyPlayerConfig.CurrencyCode,
			headerName: CurrencyPlayerConfig.CurrencyCodeHeader,
		},
		{
			field:  PlayerConfigCommons.IsComplete,
			headerName: PlayerConfigCommons.Complete,
			cellRenderer: (params: any) => (params.data.isComplete === true ? PlayerConfigCommons.Yes : PlayerConfigCommons.No),
		},
		{
			headerName: 'Action',
			cellRenderer: (params: any) => {
				return (
					<DefaultTableButton
						access={userAccess.includes(USER_CLAIMS.CurrencyWrite)}
						title={'Edit'}
						onClick={() => handleEdit(params.data.currencyId)}
					/>
				);
			},
		},
	]

	const gridOptions = {
		rowClassRules: {
			'rag-red': 'data.isComplete !== true',
		},
	};

	// Side Effects
	useEffect(() => {
		let currencyLoading = document.getElementById('mlab-grid-loading-overlay') as HTMLInputElement;
		if (!loading && configList.length === 0) {
			if (currencyLoading) {
				currencyLoading.innerText = 'No Rows To Show';
			}
		} else {
			if (currencyLoading) {
				currencyLoading.innerText = 'Please wait while your items are loading';
			}
		}
	}, [loading]);

	useEffect(() => {
		if (playerConfigurationInfo) {
			setCurrencyInfo(playerConfigurationInfo);
		}
	}, [playerConfigurationInfo]);

	useEffect(() => {
		getPlayerConfigInfoById(PlayerConfigTypes.CurrencyTypeId);
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
		if (totalPage() > currentPage) {
			setCurrentPage(totalPage());
			paginationLoadList(pageSize, totalPage(), sortColumn, sortOrder);
		}
	};

	const totalPage = () => {
		return Math.ceil(recordCount / pageSize) | 0;
	};
	const handleFilterCurrencyIdChange = (event: any) => {
		setFilterCurrencyId(event.target.value);
	};

	const handleFilterCurrencyICoreIdChange = (event: any) => {
		setFilterCurrencyICoreId(event.target.value);
	};

	const handleFilterCurrencyNameChange = (event: any) => {
		setFilterCurrencyName(event.target.value);
	};

	const handleFilterCurrencyCodeChange = (event: any) => {
		setFilterCurrencyCode(event.target.value);
	};

	const paginationLoadList = (pageSize: number, currentPage: number, sortColumn: string, sortOrder: string) => {
		const request: PlayerConfigurationFilterRequestModel = {
			playerConfigurationTypeId: PlayerConfigTypes.CurrencyTypeId,
			playerConfigurationName: filterCurrencyName !== '' ? filterCurrencyName : null,
			playerConfigurationCode: filterCurrencyCode !== '' ? filterCurrencyCode : null,
			playerConfigurationId: filterCurrencyId !== '' ? Number(filterCurrencyId) : undefined,
			pageSize: pageSize,
			offsetValue: (currentPage - 1) * pageSize,
			sortColumn: sortColumn,
			sortOrder: sortOrder,
			userId: userAccessId.toString(),
			queueId: Guid.create().toString(),
			playerConfigurationICoreId: filterCurrencyICoreId !== '' ? Number(filterCurrencyICoreId) : undefined,
		};

		loadCurrencyList(request);
	};

	const handleSearch = () => {
		setCurrentPage(1);
		const request: PlayerConfigurationFilterRequestModel = {
			pageSize: pageSize,
			offsetValue: DefaultPageSetup.offsetValueDefault,
			sortColumn: CurrencyPlayerConfig.CurrencyId,
			sortOrder: PlayerConfigCommons.Asc,
			userId: userAccessId.toString(),
			queueId: Guid.create().toString(),
			playerConfigurationTypeId: PlayerConfigTypes.CurrencyTypeId,
			playerConfigurationName: filterCurrencyName !== '' ? filterCurrencyName : null,
			playerConfigurationCode: filterCurrencyCode !== '' ? filterCurrencyCode : null,
			playerConfigurationId: filterCurrencyId !== '' ? Number(filterCurrencyId) : undefined,
			playerConfigurationICoreId: filterCurrencyICoreId !== '' ? Number(filterCurrencyICoreId) : undefined,
		};

		loadCurrencyList(request);
	};

	const loadCurrencyList = (request: PlayerConfigurationFilterRequestModel) => {
		setLoading(true);
		setConfigList([]);
		setTimeout(() => {
			const messagingHub = hubConnection.createHubConnenction();
			messagingHub.start().then(() => {
				getCurrencyList(request).then((response: any) => {
					if (response.status === StatusCode.OK) {
						messagingHub.on(request.queueId.toString(), (message) => {
							getCurrencyListResult(message.cacheId)
								.then((returnData: any) => {
									setConfigList(returnData.data.currencyList);
									setRecordCount(returnData.data.recordCount);
									setLoading(false);
									messagingHub.off(request.queueId.toString());
									messagingHub.stop();
								})
								.catch(() => {
									swal('Failed', `Error loading Currency`, 'error');
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
		setFilterCurrencyId('');
		setFilterCurrencyICoreId('');
		setFilterCurrencyName('');
		setFilterCurrencyCode('');
	};

	const handleBack = () => {
		history.push('/system/player-configuration-list');
	};

	const handleShowModal = () => {
		setShowModal(!showModal);
	};

	const handleEdit = (id: number) => {
		const detail = configList.find((i) => i.currencyId === id);
		if (detail !== undefined) {
			setIsEditFlag(true);
			setCurrencyDetail(detail);
			setShowModal(true);
		}
	};

	const handleAddNew = () => {
		setIsEditFlag(false);
		setCurrencyDetail(undefined);
		setShowModal(true);
	};

	const handleSave = () => {
		handleShowModal();
		clearFilter();
		getPlayerConfigInfoById(8);
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
				<FormHeader headerLabel={'Edit Currency'} />
				<ContentContainer>
					<FormGroupContainer>
						<div className='col-lg-3'>
							<label>Player Configuration Type</label>
							<p className='form-control-plaintext fw-bolder'>{currencyInfo?.playerConfigurationName}</p>
						</div>
					</FormGroupContainer>
					<FormGroupContainer>
						<div className='col-lg-3'>
							<label>Created Date</label>
							<p className='form-control-plaintext fw-bolder'>{useFormattedDate(currencyInfo?.createdDate ? currencyInfo.createdDate : '')}</p>
						</div>
						<div className='col-lg-3'>
							<label>Created By</label>
							<p className='form-control-plaintext fw-bolder'>{currencyInfo?.createdByName}</p>
						</div>
						<div className='col-lg-3'>
							<label>Last Modified Date</label>
							<p className='form-control-plaintext fw-bolder'>{useFormattedDate(currencyInfo?.updatedDate ? currencyInfo.updatedDate : '')}</p>
						</div>
						<div className='col-lg-3'>
							<label>Modified By</label>
							<p className='form-control-plaintext fw-bolder'>{currencyInfo?.updatedByName}</p>
						</div>
					</FormGroupContainer>
					<hr className='my-3 mb-7' />

					<FormGroupContainer>
						<div className='col-md-2'>
							<label className='form-label-sm mb-2'>Currency Id</label>
							<NumberTextInput
								ariaLabel={''}
								className={'form-control form-control-sm'}
								{...{value: filterCurrencyId, onChange: handleFilterCurrencyIdChange}}
							/>
						</div>

						<div className='col-md-2'>
							<label className='form-label-sm mb-2'>iCore Id</label>
							<NumberTextInput
								ariaLabel={''}
								className={'form-control form-control-sm'}
								{...{value: filterCurrencyICoreId, onChange: handleFilterCurrencyICoreIdChange}}
							/>
						</div>

						<div className='col-md-3'>
							<label className='form-label-sm mb-2'>Currency Name</label>
							<input type='text' value={filterCurrencyName} onChange={handleFilterCurrencyNameChange} className='form-control form-control-sm' />
						</div>

						<div className='col-md-3'>
							<label className='form-label-sm mb-2'>Currency Code</label>
							<input type='text' value={filterCurrencyCode} onChange={handleFilterCurrencyCodeChange} className='form-control form-control-sm' />
						</div>
					</FormGroupContainer>

					<FormGroupContainer>
						<ButtonsContainer>
							<MlabButton
								access={userAccess.includes(USER_CLAIMS.CurrencyRead)}
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
								access={userAccess.includes(USER_CLAIMS.CurrencyWrite)}
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
								rowClassRules={gridOptions.rowClassRules}
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
						<DefaultSecondaryButton access={userAccess.includes(USER_CLAIMS.CurrencyRead)} title={'Back'} onClick={handleBack} />
					</PaddedContainer>
				</FooterContainer>
			</MainContainer>

			<AddEditCurrencyModal
				title={CurrencyPlayerConfig.Currency}
				configInfo={currencyDetail}
				isEditMode={isEditFlag}
				modal={showModal}
				toggle={handleShowModal}
				handleSave={handleSave}
				closeModal={() => setShowModal(false)}
			/>
		</>
	);
};

export default EditCurrency;

import {AgGridReact} from 'ag-grid-react';
import 'datatables.net';
import 'datatables.net-dt';
import {useFormik} from 'formik';
import {Guid} from 'guid-typescript';
import {useEffect, useRef, useState} from 'react';
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
	FormContainer,
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
import {CountryListModel} from '../../models/CountryListModel';
import {CountryModel} from '../../models/CountryModel';
import {PlayerConfigCodeListDetailsTypeRequestModel} from '../../models/PlayerConfigCodeListDetailsTypeRequestModel';
import {PlayerConfigurationFilterRequestModel} from '../../models/PlayerConfigurationFilterRequestModel';
//models
import {UpsertPlayerConfigTypeRequestModel} from '../../models/UpsertPlayerConfigTypeRequestModel';
import * as systemManagement from '../../redux/SystemRedux';
//service
import {getPlayerConfigCountry, getPlayerConfigCountryResult} from '../../redux/SystemService';
import {
	CountryPlayerConfig,
	DefaultPageSetup,
	InfoDataSourceId,
	PlayerConfigCommons,
	PlayerConfigTypes,
	StatusCode,
} from '../constants/PlayerConfigEnums';
import '../player-configuration/player-configuration.css';
//Forms
import useConstant from '../../../../constants/useConstant';
import {PlayerConfigurationModel} from '../../models';
import {useSystemPlayerConfigurationHooks} from '../../shared/hooks/useSystemPlayerConfigurationHooks';
import AddEditCountryModal from './modals/AddEditCountryModal';

const EditCountry: React.FC = () => {
	// States
	const dispatch = useDispatch();
	const history = useHistory();
	const userAccessId = useSelector<RootState>(({auth}) => auth.userId, shallowEqual) as number;
	const userAccess = useSelector<RootState>(({auth}) => auth.access, shallowEqual) as string;
	const [showModal, setShowModal] = useState(false);
	const [countryRowData, setCountryRowData] = useState<Array<any>>([]);
	const [loading, setLoading] = useState(false);
	const [countryList, setCountryList] = useState<Array<CountryModel>>([]);
	const [countryRecordCount, setCountryRecordCount] = useState<number>(0);
	const [pageSize, setPageSize] = useState<number>(DefaultPageSetup.pageSizeDefault);
	const [currentPage, setCurrentPage] = useState<number>(1);

	const [countryDetail, setCountryDetail] = useState<CountryModel>();
	const [isEditFlag, setIsEditFlag] = useState(false);
	const [filterCountryId, setFilterCountryId] = useState<any>('');
	const [filterCountryICoreId, setFilterCountryICoreId] = useState<any>('');
	const [filterCountryName, setFilterCountryName] = useState<any>('');
	const [filterCountryCode, setFilterCountryCode] = useState<any>('');
	const [countryInfo, setCountryInfo] = useState<PlayerConfigurationModel>();
	const [gridApi, setGridApi] = useState<any | null>(null);
	const [gridColumnApi, setGridColumnApi] = useState(null);
	const [sortOrder, setSortOrder] = useState<string>(PlayerConfigCommons.Asc);
	const [sortColumn, setSortColumn] = useState<string>(CountryPlayerConfig.CountryId);
	const gridRef: any = useRef();
	const [gridHeight, setGridHeight] = useState<number>(400);
	const [isLoaded, setLoaded] = useState<Boolean>(false);

	const playerConfigCountryListState = useSelector<RootState>(({system}) => system.playerConfigCountryList, shallowEqual) as CountryModel[];
	const {getPlayerConfigInfoById, playerConfigurationInfo, saveDetails} = useSystemPlayerConfigurationHooks();
	const {SwalFailedMessage, SwalServerErrorMessage} = useConstant();

	const initialValues = {
		id: 0,
		countryName: '',
		countryCode: '',
		createdBy: '',
		createdDate: '',
		updatedBy: '',
		updatedDate: '',
	};

	// Effects
	useEffect(() => {
		getPlayerConfigInfoById(PlayerConfigTypes.CountryTypeId);
		if (!isLoaded) {
			getCountryList(pageSize, currentPage);
			setLoaded(true);
		}
	}, []);

	useEffect(() => {
		if (playerConfigurationInfo) {
			setCountryInfo(playerConfigurationInfo);
		}
	}, [playerConfigurationInfo]);

	useEffect(() => {
		let countryLoading = document.getElementById('mlab-grid-loading-overlay') as HTMLInputElement;
		if (countryLoading) {
			if (!loading && countryRowData.length === 0) {
				countryLoading.innerText = 'No Rows To Show';
			} else {
				countryLoading.innerText = 'Please wait while your items are loading';
			}
		}
	}, [loading]);

	// Grid - Pagination
	const countryTableLoader = (data: any) => {
		return (
			<div className='ag-custom-loading-cell' style={{paddingLeft: '10px', lineHeight: '25px'}}>
				<i className='fas fa-spinner fa-pulse'></i> <span> {data.loadingMessage}</span>
			</div>
		);
	};

	const gridOptions = {
		columnDefs: [
			{headerName: CountryPlayerConfig.CountryIdHeader, field: CountryPlayerConfig.CountryId, autoWidth: true},
			{headerName: PlayerConfigCommons.ICoreIdHeader, field: PlayerConfigCommons.ICoreIdField, autoWidth: true},
			{headerName: CountryPlayerConfig.CountryNameHeader, field: CountryPlayerConfig.CountryName, autoWidth: true},
			{headerName: CountryPlayerConfig.CountryCodeHeader, field: CountryPlayerConfig.CountryCode, autoWidth: true},
			{
				headerName: PlayerConfigCommons.Complete,
				field: PlayerConfigCommons.IsComplete,
				autoWidth: true,
				cellRenderer: (params: any) => <>{params.data.isComplete == true ? PlayerConfigCommons.Yes : PlayerConfigCommons.No}</>,
			},
			{
				headerName: 'Action',
				field: 'position',
				autoWidth: true,
				cellRenderer: (params: any) => (
					<>
						<DefaultTableButton access={userAccess.includes(USER_CLAIMS.CountryWrite)} title={'Edit'} onClick={() => onEditRow(params.data)} />
					</>
				),
			},
		],
		rowClassRules: {
			'rag-red': 'data.countryName == "" || !data.isComplete || data.countryCode == ""',
		},
	};

	const onCountryGridReady = (params: any) => {
		setGridApi(params.api);
		setGridColumnApi(params.columnApi);
		params.api.paginationGoToPage(4);
		params.api.sizeColumnsToFit();
	};

	const onSort = (e: any) => {
		if (countryList !== undefined && countryRowData.length > 0) {
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
		getCountryList(value, 1);
	};

	const onClickFirst = () => {
		if (currentPage > 1) {
			setCurrentPage(1);

			getCountryList(pageSize, 1);
		}
	};

	const onClickPrevious = () => {
		if (currentPage > 1) {
			setCurrentPage(currentPage - 1);
			getCountryList(pageSize, currentPage - 1);
		}
	};

	const onClickNext = () => {
		if (totalPage() > currentPage) {
			setCurrentPage(currentPage + 1);
			getCountryList(pageSize, currentPage + 1);
		}
	};

	const onClickLast = () => {
		if (totalPage() > currentPage) {
			setCurrentPage(totalPage());
			getCountryList(pageSize, totalPage());
		}
	};

	const totalPage = () => {
		return Math.ceil(countryRecordCount / pageSize) | 0;
	};

	// METHODS
	const onEditRow = (item: any) => {
		setIsEditFlag(true);
		setCountryDetail(item);
		setShowModal(true);
	};

	function getCountryList(page: any, currentpage: any) {
		setLoading(true);
		setCountryRowData([]);
		setTimeout(() => {
			const messagingHub = hubConnection.createHubConnenction();

			messagingHub.start().then(() => {
				const countryRequest: PlayerConfigurationFilterRequestModel = {
					pageSize: page,
					offsetValue: (currentpage - 1) * page,
					sortColumn: CountryPlayerConfig.CountryId,
					sortOrder: PlayerConfigCommons.Asc,
					userId: userAccessId.toString(),
					queueId: Guid.create().toString(),
					playerConfigurationTypeId: PlayerConfigTypes.CountryTypeId,
					playerConfigurationName: filterCountryName != '' ? filterCountryName : null,
					playerConfigurationCode: filterCountryCode != '' ? filterCountryCode : null,
					playerConfigurationId: filterCountryId != '' ? filterCountryId : null,
					playerConfigurationICoreId: filterCountryICoreId != '' ? filterCountryICoreId : null,
				};

				getPlayerConfigCountry(countryRequest).then((response) => {
					if (response.status === StatusCode.OK) {
						messagingHub.on(countryRequest.queueId.toString(), (message) => {
							getPlayerConfigCountryResult(message.cacheId)
								.then((returnData) => {
									let feedbackData = Object.assign(new Array<CountryListModel>(), returnData.data);
									setCountryList(feedbackData.countryList);
									setCountryRowData(feedbackData.countryList);

									dispatch(systemManagement.actions.getPlayerConfigCountryList(feedbackData.countryList));
									setCountryRecordCount(feedbackData.recordCount);

									messagingHub.off(countryRequest.queueId.toString());
									messagingHub.stop();

									setLoading(false);
								})
								.catch((ex) => {
									swal(SwalFailedMessage.title, 'getPlayerConfigCountryResult:' + ex, SwalFailedMessage.icon);
									setLoading(false);
								});
						});

						setTimeout(() => {
							if (messagingHub.state === StatusCode.Connected) {
								messagingHub.stop();
								setLoading(false);
							}
						}, 30000);
					} else {
						swal(SwalServerErrorMessage.title, response.data.message, SwalServerErrorMessage.icon);
						setLoading(false);
					}
				});
			});
		}, 1000);
	}

	//  Filter events
	const onChangeCountryIdFilter = (data: any) => {
		setFilterCountryId(data.target.value);
	};

	const onChangeCountryICoreIdFilter = (data: any) => {
		setFilterCountryICoreId(data.target.value);
	};

	const onChangeCountryNameFilter = (data: any) => {
		setFilterCountryName(data.target.value);
	};

	const onChangeCountryCodeFilter = (data: any) => {
		setFilterCountryCode(data.target.value);
	};

	const handleSearch = () => {
		if (Number.isInteger(parseInt(filterCountryId)) === false && filterCountryId !== '') {
			swal('Failed', 'Country Id should be a number', 'error');
			return;
		}
		setCurrentPage(1);
		getCountryList(pageSize, 1);
	};

	const onAddNew = () => {
		setIsEditFlag(false);
		setShowModal(true);
	};

	const onCloseModal = () => {
		setShowModal(false);
	};

	const saveNewConfiguration = () => {
		getCountryList(pageSize, currentPage);
		getPlayerConfigInfoById(PlayerConfigTypes.CountryTypeId);
	};
	const handleBackButton = () => {
		history.push('/system/player-configuration-list');
	};

	const formik = useFormik({
		initialValues,
		onSubmit: (values, {setSubmitting}) => {
			swal({
				title: 'Confirmation',
				text: 'This action will save the changes made . Please confirm“',
				icon: 'warning',
				buttons: ['No', 'Yes'],
				dangerMode: true,
			}).then((onFormSubmit) => {
				if (onFormSubmit) {
					setSubmitting(true);
					onSaveCountryDetails();
				}
			});
			setLoading(false);
			setSubmitting(false);
		},
	});

	const onSaveCountryDetails = () => {
		setTimeout(() => {
			let upSertCountryList = Array<PlayerConfigCodeListDetailsTypeRequestModel>();

			playerConfigCountryListState?.forEach((item: CountryModel) => {
				const tempOption: PlayerConfigCodeListDetailsTypeRequestModel = {
					playerConfigurationId: item.countryId != undefined ? item.countryId : null,
					playerConfigurationCode: item.countryCode,
					playerConfigurationName: item.countryName,
					isComplete: item.isComplete,
					dataSourceId: InfoDataSourceId.MLab,
					status: undefined,
					brandId: undefined,
				};
				upSertCountryList.push(tempOption);
			});

			const request: UpsertPlayerConfigTypeRequestModel = {
				playerConfigurationTypeId: PlayerConfigTypes.CountryTypeId,
				playerConfigCodeListDetailsType: upSertCountryList,
				userId: userAccessId.toString(),
				queueId: Guid.create().toString(),
			};

			saveDetails(request, 'Country');
		}, 1000);
	};

	return (
		<>
			<FormContainer onSubmit={formik.handleSubmit}>
				<MainContainer>
					<FormHeader headerLabel={'Edit Country'} />
					<ContentContainer>
						<FormGroupContainer>
							<div className='col-lg-3'>
								<label>Player Configuration Type</label>
								<p className='form-control-plaintext fw-bolder'>{countryInfo?.playerConfigurationName}</p>
							</div>
						</FormGroupContainer>
						<FormGroupContainer>
							<div className='col-lg-3'>
								<label>Created Date</label>
								<p className='form-control-plaintext fw-bolder'>{useFormattedDate(countryInfo?.createdDate ? countryInfo.createdDate : '')}</p>
							</div>
							<div className='col-lg-3'>
								<label>Created By</label>
								<p className='form-control-plaintext fw-bolder'>{countryInfo?.createdByName}</p>
							</div>
							<div className='col-lg-3'>
								<label>Last Modified Date</label>
								<p className='form-control-plaintext fw-bolder'>{useFormattedDate(countryInfo?.updatedDate ? countryInfo.updatedDate : '')}</p>
							</div>
							<div className='col-lg-3'>
								<label>Modified By</label>
								<p className='form-control-plaintext fw-bolder'>{countryInfo?.updatedByName}</p>
							</div>
						</FormGroupContainer>
						<hr className='my-3 mb-7' />

						<FormGroupContainer>
							<div className='col-md-2'>
								<label className='form-label-sm mb-2'>Country Id</label>
								<NumberTextInput
									ariaLabel={'Country Id'}
									className={'form-control form-control-sm'}
									{...{value: filterCountryId, onChange: onChangeCountryIdFilter}}
								/>
							</div>

							<div className='col-md-2'>
								<label className='form-label-sm mb-2'>iCore Id</label>
								<NumberTextInput
									ariaLabel={'iCore Id'}
									className={'form-control form-control-sm'}
									{...{value: filterCountryICoreId, onChange: onChangeCountryICoreIdFilter}}
								/>
							</div>

							<div className='col-md-3'>
								<label className='form-label-sm mb-2'>Country Name</label>
								<input type='text' className='form-control form-control-sm' value={filterCountryName} onChange={onChangeCountryNameFilter} />
							</div>

							<div className='col-md-3'>
								<label className='form-label-sm mb-2'>Country Code</label>
								<input type='text' className='form-control form-control-sm' value={filterCountryCode} onChange={onChangeCountryCodeFilter} />
							</div>
						</FormGroupContainer>
						<FormGroupContainer>
							<ButtonsContainer>
								<MlabButton
									access={userAccess.includes(USER_CLAIMS.CountryRead)}
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
								<DefaultSecondaryButton access={userAccess.includes(USER_CLAIMS.CountryWrite)} title={'Add New'} onClick={onAddNew} />
							</ButtonsContainer>
						</FormGroupContainer>

						{/* New Table Implementation */}
						<FormGroupContainer>
							<div className='ag-theme-quartz pb-15' style={{height: gridHeight, width: '100%'}}>
								<AgGridReact
									rowData={countryRowData}
									defaultColDef={{
										sortable: true,
										resizable: true,
									}}
									components={{
										tableLoader: countryTableLoader,
									}}
									onGridReady={onCountryGridReady}
									rowBuffer={0}
									//enableRangeSelection={true} //deprecated in AgGridReactver.32.0.0
									pagination={false}
									paginationPageSize={pageSize}
									columnDefs={gridOptions.columnDefs}
									onSortChanged={(e) => onSort(e)}
									overlayNoRowsTemplate={gridOverlayTemplate}
									ref={gridRef}
									rowClassRules={gridOptions.rowClassRules}
								/>

								<DefaultGridPagination
									recordCount={countryRecordCount}
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
							<DefaultSecondaryButton access={userAccess.includes(USER_CLAIMS.CountryRead)} title={'Back'} onClick={handleBackButton} />
						</PaddedContainer>
					</FooterContainer>
				</MainContainer>

				<AddEditCountryModal
					title={countryInfo?.playerConfigurationName!}
					configInfo={countryDetail}
					isEditMode={isEditFlag}
					modal={showModal}
					saveConfiguration={saveNewConfiguration}
					rowData={countryRowData}
					closeModal={onCloseModal}
					configList={countryList}
				/>
			</FormContainer>
		</>
	);
};

export default EditCountry;

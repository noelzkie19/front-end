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
import {LanguageListModel} from '../../models/LanguageListModel';
import {LanguageModel} from '../../models/LanguageModel';
import {PlayerConfigCodeListDetailsTypeRequestModel} from '../../models/PlayerConfigCodeListDetailsTypeRequestModel';
import {PlayerConfigurationFilterRequestModel} from '../../models/PlayerConfigurationFilterRequestModel';
//models
import {UpsertPlayerConfigTypeRequestModel} from '../../models/UpsertPlayerConfigTypeRequestModel';
import * as systemManagement from '../../redux/SystemRedux';
//service
import {getPlayerConfigLanguage, getPlayerConfigLanguageResult} from '../../redux/SystemService';
import {
	DefaultPageSetup,
	InfoDataSourceId,
	LanguagePlayerConfig,
	PlayerConfigCommons,
	PlayerConfigTypes,
	StatusCode,
} from '../constants/PlayerConfigEnums';
import '../player-configuration/player-configuration.css';
//forms
import useConstant from '../../../../constants/useConstant';
import {PlayerConfigurationModel} from '../../models';
import {useSystemPlayerConfigurationHooks} from '../../shared/hooks/useSystemPlayerConfigurationHooks';
import AddEditLanguageModal from './modals/AddEditLanguageModal';

const EditLanguage: React.FC = () => {
	//  States
	const dispatch = useDispatch();
	const history = useHistory();
	const userAccessId = useSelector<RootState>(({auth}) => auth.userId, shallowEqual) as number;
	const userAccess = useSelector<RootState>(({auth}) => auth.access, shallowEqual) as string;
	const [showModal, setShowModal] = useState<boolean>(false);
	const [languageRowData, setLanguageRowData] = useState<Array<any>>([]);
	const [loading, setLoading] = useState(false);
	const [languageList, setLanguageList] = useState<Array<LanguageModel>>([]);
	const [recordCount, setRecordCount] = useState<number>(0);
	const [pageSize, setPageSize] = useState<number>(DefaultPageSetup.pageSizeDefault);
	const [currentPage, setCurrentPage] = useState<number>(1);
	const [languageDetail, setLanguageDetail] = useState<LanguageModel>();
	const [isEditFlag, setIsEditFlag] = useState(false);
	const [filterLanguageId, setFilterLanguageId] = useState<any>('');
	const [filterLanguageICoreId, setFilterLanguageICoreId] = useState<any>('');
	const [filterLanguageName, setFilterLanguageName] = useState<any>('');
	const [filterLanguageCode, setFilterLanguageCode] = useState<any>('');
	const [languageInfo, setLanguageInfo] = useState<PlayerConfigurationModel>();
	const [gridApi, setGridApi] = useState<any | null>(null);
	const [gridColumnApi, setGridColumnApi] = useState(null);
	const [sortOrder, setSortOrder] = useState<string>(PlayerConfigCommons.Asc);
	const [sortColumn, setSortColumn] = useState<string>(LanguagePlayerConfig.LanguageId);
	const gridRef: any = useRef();
	const [gridHeight, setGridHeight] = useState<number>(400);

	const playerConfigLanguageListState = useSelector<RootState>(({system}) => system.playerConfigLanguageList, shallowEqual) as LanguageModel[];
	const {getPlayerConfigInfoById, playerConfigurationInfo, saveDetails} = useSystemPlayerConfigurationHooks();
	const {SwalFailedMessage, SwalServerErrorMessage} = useConstant();

	const initialValues = {
		id: 0,
		languageName: '',
		languageCode: '',
		createdBy: '',
		createdDate: '',
		updatedBy: '',
		updatedDate: '',
		languageList: Array<LanguageModel>(),
	};

	//  Effects
	useEffect(() => {
		getPlayerConfigInfoById(PlayerConfigTypes.LanguageTypeId);
		getLanguageList(pageSize, currentPage);
	}, []);

	useEffect(() => {
		if (playerConfigurationInfo) {
			setLanguageInfo(playerConfigurationInfo);
		}
	}, [playerConfigurationInfo]);

	useEffect(() => {
		let languageLoading = document.getElementById('mlab-grid-loading-overlay') as HTMLInputElement;
		if (languageLoading) {
			if (!loading && languageList.length === 0) {
				languageLoading.innerText = 'No Rows To Show';
			} else {
				languageLoading.innerText = 'Please wait while your items are loading';
			}
		}
	}, [loading]);

	// Grid - Pagination
	const languageTableLoader = (data: any) => {
		return (
			<div className='ag-custom-loading-cell' style={{paddingLeft: '10px', lineHeight: '25px'}}>
				<i className='fas fa-spinner fa-pulse'></i> <span> {data.loadingMessage}</span>
			</div>
		);
	};

	const gridOptions = {
		columnDefs: [
			{
				headerName: LanguagePlayerConfig.LanguageIdHeader,
				field: LanguagePlayerConfig.LanguageId,
				autoWidth: true,
			},
			{
				headerName: PlayerConfigCommons.ICoreIdHeader,
				field: PlayerConfigCommons.ICoreIdField,
			},
			{
				headerName: LanguagePlayerConfig.LanguageNameHeader,
				field: LanguagePlayerConfig.LanguageName,
			},
			{
				headerName: LanguagePlayerConfig.LanguageCodeHeader,
				field: LanguagePlayerConfig.LanguageCode,
			},
			{
				headerName: PlayerConfigCommons.Complete,
				field: PlayerConfigCommons.IsComplete,
				cellRenderer: (params: any) => <>{params.data.isComplete ? PlayerConfigCommons.Yes : PlayerConfigCommons.No}</>,
			},
			{
				headerName: 'Action',
				cellRenderer: (params: any) => (
					<>
						<DefaultTableButton access={userAccess.includes(USER_CLAIMS.LanguageWrite)} title={'Edit'} onClick={() => onEditRow(params.data)} />
					</>
				),
			},
		],
		rowClassRules: {
			'rag-red': '!data.isComplete',
		},
	};

	const onLanguageGridReady = (params: any) => {
		setGridApi(params.api);
		setGridColumnApi(params.columnApi);
		params.api.sizeColumnsToFit();
	};

	const onSort = (e: any) => {
		if (languageList != undefined && languageRowData.length > 0) {
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
		getLanguageList(value, 1);
	};

	const onClickFirst = () => {
		if (currentPage > 1) {
			setCurrentPage(1);

			getLanguageList(pageSize, 1);
		}
	};

	const onClickPrevious = () => {
		if (currentPage > 1) {
			setCurrentPage(currentPage - 1);
			getLanguageList(pageSize, currentPage - 1);
		}
	};

	const onClickNext = () => {
		if (totalPage() > currentPage) {
			setCurrentPage(currentPage + 1);
			getLanguageList(pageSize, currentPage + 1);
		}
	};

	const onClickLast = () => {
		if (totalPage() > currentPage) {
			setCurrentPage(totalPage());
			getLanguageList(pageSize, totalPage());
		}
	};

	const totalPage = () => {
		return Math.ceil(recordCount / pageSize) | 0;
	};

	//  Methods
	const onEditRow = (item: any) => {
		setIsEditFlag(true);
		setLanguageDetail(item);
		setShowModal(true);
	};

	function getLanguageList(page: any, currentpage: any) {
		const messagingHub = hubConnection.createHubConnenction();
		setLanguageRowData([]);
		messagingHub.start().then(() => {
			const languageRequest: PlayerConfigurationFilterRequestModel = {
				pageSize: page,
				offsetValue: (currentpage - 1) * page,
				sortColumn: LanguagePlayerConfig.LanguageId,
				sortOrder: PlayerConfigCommons.Asc,
				userId: userAccessId.toString(),
				queueId: Guid.create().toString(),
				playerConfigurationTypeId: PlayerConfigTypes.LanguageTypeId,
				playerConfigurationName: filterLanguageName != '' ? filterLanguageName : null,
				playerConfigurationCode: filterLanguageCode != '' ? filterLanguageCode : null,
				playerConfigurationId: filterLanguageId != '' ? filterLanguageId : null,
				playerConfigurationICoreId: filterLanguageICoreId != '' ? filterLanguageICoreId : null,
			};

			getPlayerConfigLanguage(languageRequest).then((response) => {
				setLoading(true);
				if (response.status === StatusCode.OK) {
					messagingHub.on(languageRequest.queueId.toString(), (message) => {
						getPlayerConfigLanguageResult(message.cacheId)
							.then((returnData) => {
								let feedbackData = Object.assign(new Array<LanguageListModel>(), returnData.data);
								setLanguageList(feedbackData.languageList);
								setLanguageRowData(feedbackData.languageList);

								dispatch(systemManagement.actions.getPlayerConfigLanguageList(feedbackData.languageList));
								setRecordCount(feedbackData.recordCount);

								messagingHub.off(languageRequest.queueId.toString());
								messagingHub.stop();

								setLoading(false);
							})
							.catch((ex) => {
								swal(SwalFailedMessage.title, 'getPlayerConfigLanguageResult: ' + ex, SwalFailedMessage.icon);
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
					swal(SwalServerErrorMessage, response.data.message, SwalServerErrorMessage.icon);
					setLoading(false);
				}
			});
		});
	}

	//  Filter events
	const onChangeLanguageIdFilter = (data: any) => {
		setFilterLanguageId(data.target.value);
	};

	const onChangeLanguageICoreIdFilter = (data: any) => {
		setFilterLanguageICoreId(data.target.value);
	};

	const onChangeLanguageNameFilter = (data: any) => {
		setFilterLanguageName(data.target.value);
	};

	const onChangeLanguageCodeFilter = (data: any) => {
		setFilterLanguageCode(data.target.value);
	};

	const handleSearch = () => {
		if (Number.isInteger(parseInt(filterLanguageICoreId)) === false && filterLanguageICoreId !== '') {
			swal('Failed', 'iCore Id should be a number', 'error');
			return;
		}

		resetPageInfo();
	};

	const resetPageInfo = () => {
		setCurrentPage(1);
		getLanguageList(pageSize, 1);
	};

	const onAddNew = () => {
		setIsEditFlag(false);
		setShowModal(true);
	};

	const onCloseModal = () => {
		setShowModal(false);
	};

	const saveNewConfiguration = () => {
		getLanguageList(pageSize, currentPage);
		getPlayerConfigInfoById(5);
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
					onSaveLanguageDetails();
				}
			});

			setLoading(false);
			setSubmitting(false);
		},
	});

	const onSaveLanguageDetails = () => {
		let upSertLanguageList = Array<PlayerConfigCodeListDetailsTypeRequestModel>();
		playerConfigLanguageListState?.forEach((item: LanguageModel) => {
			const tempOption: PlayerConfigCodeListDetailsTypeRequestModel = {
				playerConfigurationId: item.id != undefined ? item.id : null,
				playerConfigurationCode: item.languageCode,
				playerConfigurationName: item.languageName,
				isComplete: item.isComplete,
				dataSourceId: InfoDataSourceId.MLab,
				status: undefined,
				brandId: undefined,
			};
			upSertLanguageList.push(tempOption);
		});

		const request: UpsertPlayerConfigTypeRequestModel = {
			playerConfigurationTypeId: PlayerConfigTypes.LanguageTypeId,
			playerConfigCodeListDetailsType: upSertLanguageList,
			userId: userAccessId.toString(),
			queueId: Guid.create().toString(),
		};

		saveDetails(request, 'Language');
	};

	return (
		<>
			<FormContainer onSubmit={formik.handleSubmit}>
				<MainContainer>
					<FormHeader headerLabel={'Edit Language'} />
					<ContentContainer>
						{/* Data pull on this part still in progress. Some details are hardcoded yet*/}
						<FormGroupContainer>
							<div className='col-lg-3'>
								<label>Player Configuration Type</label>
								<p className='form-control-plaintext fw-bolder'>{languageInfo?.playerConfigurationName}</p>
							</div>
						</FormGroupContainer>
						<FormGroupContainer>
							<div className='col-lg-3'>
								<label>Created Date</label>
								<p className='form-control-plaintext fw-bolder'>{useFormattedDate(languageInfo?.createdDate ? languageInfo.createdDate : '')}</p>
							</div>
							<div className='col-lg-3'>
								<label>Created By</label>
								<p className='form-control-plaintext fw-bolder'>{languageInfo?.createdByName}</p>
							</div>
							<div className='col-lg-3'>
								<label>Last Modified Date</label>
								<p className='form-control-plaintext fw-bolder'>{useFormattedDate(languageInfo?.updatedDate ? languageInfo.updatedDate : '')}</p>
							</div>
							<div className='col-lg-3'>
								<label>Modified By</label>
								<p className='form-control-plaintext fw-bolder'>{languageInfo?.updatedByName}</p>
							</div>
						</FormGroupContainer>
						<hr className='my-3 mb-7' />

						<FormGroupContainer>
							<div className='col-md-2'>
								<label className='form-label-sm mb-2'>Language Id</label>
								<NumberTextInput
									ariaLabel={''}
									className={'form-control form-control-sm'}
									{...{value: filterLanguageId, onChange: onChangeLanguageIdFilter}}
								/>
							</div>

							<div className='col-md-2'>
								<label className='form-label-sm mb-2'>iCore Id</label>
								<NumberTextInput
									ariaLabel={''}
									className={'form-control form-control-sm'}
									{...{value: filterLanguageICoreId, onChange: onChangeLanguageICoreIdFilter}}
								/>
							</div>

							<div className='col-md-3'>
								<label className='form-label-sm mb-2'>Language Name</label>
								<input type='text' className='form-control form-control-sm' value={filterLanguageName} onChange={onChangeLanguageNameFilter} />
							</div>

							<div className='col-md-3'>
								<label className='form-label-sm mb-2'>Language Code</label>
								<input type='text' className='form-control form-control-sm' value={filterLanguageCode} onChange={onChangeLanguageCodeFilter} />
							</div>
						</FormGroupContainer>
						<FormGroupContainer>
							<ButtonsContainer>
								<MlabButton
									access={userAccess.includes(USER_CLAIMS.LanguageRead)}
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
								<DefaultSecondaryButton access={userAccess.includes(USER_CLAIMS.LanguageWrite)} title={'Add New'} onClick={onAddNew} />
							</ButtonsContainer>
						</FormGroupContainer>

						{/* New Table Implementation */}
						<FormGroupContainer>
							<div className='ag-theme-quartz pb-15' style={{height: gridHeight, width: '100%'}}>
								<AgGridReact
									rowData={languageRowData}
									defaultColDef={{
										sortable: true,
										resizable: true,
									}}
									components={{
										tableLoader: languageTableLoader,
									}}
									onGridReady={onLanguageGridReady}
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
							<DefaultSecondaryButton access={userAccess.includes(USER_CLAIMS.LanguageRead)} title={'Back'} onClick={handleBackButton} />
						</PaddedContainer>
					</FooterContainer>
				</MainContainer>

				<AddEditLanguageModal
					title={languageInfo != undefined ? languageInfo.playerConfigurationName : ''}
					configInfo={languageDetail}
					isEditMode={isEditFlag}
					modal={showModal}
					saveConfiguration={saveNewConfiguration}
					rowData={languageRowData}
					closeModal={onCloseModal}
					configList={languageList}
				/>
			</FormContainer>
		</>
	);
};

export default EditLanguage;

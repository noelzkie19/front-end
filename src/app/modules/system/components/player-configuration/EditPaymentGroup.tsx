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
import {PaymentGroupResponseModel, PlayerConfigurationModel} from '../../models';
import {PlayerConfigurationFilterRequestModel} from '../../models/PlayerConfigurationFilterRequestModel';
import {getPaymentGroupList, getPaymentGroupListResult} from '../../redux/SystemService';
import {useSystemPlayerConfigurationHooks} from '../../shared/hooks/useSystemPlayerConfigurationHooks';
import {DefaultPageSetup, PaymentGroupPlayerConfig, PlayerConfigCommons, PlayerConfigTypes, StatusCode} from '../constants/PlayerConfigEnums';
import AddEditPaymentGroupModal from './modals/AddEditPaymentGroupModal';
import './player-configuration.css';
import { ColDef, ColGroupDef } from 'ag-grid-community';

const EditPaymentGroup: React.FC = () => {
	// Properties
	const history = useHistory();
	const gridRef: any = useRef();

	const userAccessId = useSelector<RootState>(({auth}) => auth.userId, shallowEqual) as number;
	const userAccess = useSelector<RootState>(({auth}) => auth.access, shallowEqual) as string;
	const [loading, setLoading] = useState<boolean>(false);

	const [filterPaymentGroupId, setFilterPaymentGroupId] = useState('');
	const [filterPaymentGroupICoreId, setFilterPaymentGroupICoreId] = useState('');
	const [filterPaymentGroupName, setFilterPaymentGroupName] = useState('');
	const [paymentGroupInfo, setPaymentGroupInfo] = useState<PlayerConfigurationModel>();

	const [configList, setConfigList] = useState<Array<PaymentGroupResponseModel>>([]);
	const [paymentGroupDetail, setPaymentGroupDetail] = useState<PaymentGroupResponseModel>();
	const [isEditFlag, setIsEditFlag] = useState<boolean>(false);
	const [showModal, setShowModal] = useState<boolean>(false);

	const [pageSize, setPageSize] = useState<number>(DefaultPageSetup.pageSizeDefault);
	const [currentPage, setCurrentPage] = useState<number>(1);
	const [recordCount, setRecordCount] = useState<number>(0);
	const [sortOrder, setSortOrder] = useState<string>(PlayerConfigCommons.Asc);
	const [sortColumn, setSortColumn] = useState<string>(PaymentGroupPlayerConfig.PaymentGroupId);
	const {getPlayerConfigInfoById, playerConfigurationInfo} = useSystemPlayerConfigurationHooks();

	const colDef : (ColDef<PaymentGroupResponseModel> | ColGroupDef<PaymentGroupResponseModel>)[] = [
		{
			field: PaymentGroupPlayerConfig.PaymentGroupId,
			headerName: PaymentGroupPlayerConfig.PaymentGroupIdHeader,
		},
		{
			field: PlayerConfigCommons.ICoreIdField,
			headerName: PlayerConfigCommons.ICoreIdHeader,
		},
		{
			field: PaymentGroupPlayerConfig.PaymentGroupName,
			headerName: PaymentGroupPlayerConfig.PaymentGroupNameHeader,
		},
		{
			field: PaymentGroupPlayerConfig.PaymentGroupName,
			headerName: 'Action',
			cellRenderer: (params: any) => {
				return (
					<DefaultTableButton access={userAccess.includes(USER_CLAIMS.PaymentGroupWrite)} title={'Edit'} onClick={() => handleEdit(params.data.id)} />
				);
			},
		},
	];

	useEffect(() => {
		getPlayerConfigInfoById(PlayerConfigTypes.PaymentGroupTypeId);
	}, []);

	useEffect(() => {
		if (playerConfigurationInfo) {
			setPaymentGroupInfo(playerConfigurationInfo);
		}
	}, [playerConfigurationInfo]);

	useEffect(() => {
		let paymentGroupLoading = document.getElementById('mlab-grid-loading-overlay') as HTMLInputElement;
		if (paymentGroupLoading) {
			if (!loading && configList.length === 0) {
				paymentGroupLoading.innerText = 'No Rows To Show';
			} else {
				paymentGroupLoading.innerText = 'Please wait while your items are loading';
			}
		}
	}, [loading]);

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

	const handleFilterPaymentGroupIdChange = (event: any) => {
		setFilterPaymentGroupId(event.target.value);
	};

	const handleFilterPaymentGroupICoreIdChange = (event: any) => {
		setFilterPaymentGroupICoreId(event.target.value);
	};

	const handleFilterPaymentGroupNameChange = (event: any) => {
		setFilterPaymentGroupName(event.target.value);
	};

	const paginationLoadList = (pageSize: number, currentPage: number, sortColumn: string, sortOrder: string) => {
		const request: PlayerConfigurationFilterRequestModel = {
			playerConfigurationTypeId: PlayerConfigTypes.PaymentGroupTypeId,
			playerConfigurationName: filterPaymentGroupName,
			playerConfigurationCode: '',
			playerConfigurationId: filterPaymentGroupId !== '' ? Number(filterPaymentGroupId) : undefined,
			pageSize: pageSize,
			offsetValue: (currentPage - 1) * pageSize,
			sortColumn: sortColumn,
			sortOrder: sortOrder,
			userId: userAccessId.toString(),
			queueId: Guid.create().toString(),
			playerConfigurationICoreId: filterPaymentGroupICoreId !== '' ? Number(filterPaymentGroupICoreId) : undefined,
		};

		loadPaymentGroupList(request);
	};

	const handleSearch = () => {
		setCurrentPage(1);
		let request: PlayerConfigurationFilterRequestModel = {
			playerConfigurationTypeId: PlayerConfigTypes.PaymentGroupTypeId,
			playerConfigurationName: filterPaymentGroupName,
			playerConfigurationCode: '',
			playerConfigurationId: filterPaymentGroupId !== '' ? Number(filterPaymentGroupId) : undefined,
			pageSize: pageSize,
			offsetValue: 0,
			sortColumn: sortColumn,
			sortOrder: sortOrder,
			userId: userAccessId.toString(),
			queueId: Guid.create().toString(),
			playerConfigurationICoreId: filterPaymentGroupICoreId !== '' ? Number(filterPaymentGroupICoreId) : undefined,
		};

		loadPaymentGroupList(request);
	};

	const loadPaymentGroupList = (request: PlayerConfigurationFilterRequestModel) => {
		//handle search here
		setLoading(true);
		setConfigList([]);
		setTimeout(() => {
			const messagingHub = hubConnection.createHubConnenction();
			messagingHub.start().then(() => {
				getPaymentGroupList(request).then((response: any) => {
					if (response.status === StatusCode.OK) {
						messagingHub.on(request.queueId.toString(), (message) => {
							getPaymentGroupListResult(message.cacheId)
								.then((returnData: any) => {
									setConfigList(returnData.data.paymentGroupList);
									setRecordCount(returnData.data.recordCount);

									setLoading(false);
									messagingHub.off(request.queueId.toString());
									messagingHub.stop();
								})
								.catch(() => {
									swal('Failed', `Error loading Payment Group`, 'error');
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
		setFilterPaymentGroupId('');
		setFilterPaymentGroupName('');
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
			setPaymentGroupDetail(detail);
			setShowModal(true);
		}
	};

	const handleAddNew = () => {
		setIsEditFlag(false);
		setPaymentGroupDetail(undefined);
		setShowModal(true);
	};

	const handleSave = () => {
		handleShowModal();
		clearFilter();
		getPlayerConfigInfoById(6);
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
				<FormHeader headerLabel={'Edit Payment Group'} />
				<ContentContainer>
					<FormGroupContainer>
						<div className='col-lg-3'>
							<label>Player Configuration Type</label>
							<p className='form-control-plaintext fw-bolder'>{paymentGroupInfo?.playerConfigurationName}</p>
						</div>
					</FormGroupContainer>
					<FormGroupContainer>
						<div className='col-lg-3'>
							<label>Created Date</label>
							<p className='form-control-plaintext fw-bolder'>
								{useFormattedDate(paymentGroupInfo?.createdDate ? paymentGroupInfo.createdDate : '')}
							</p>
						</div>
						<div className='col-lg-3'>
							<label>Created By</label>
							<p className='form-control-plaintext fw-bolder'>{paymentGroupInfo?.createdByName}</p>
						</div>
						<div className='col-lg-3'>
							<label>Last Modified Date</label>
							<p className='form-control-plaintext fw-bolder'>
								{useFormattedDate(paymentGroupInfo?.updatedDate ? paymentGroupInfo.updatedDate : '')}
							</p>
						</div>
						<div className='col-lg-3'>
							<label>Modified By</label>
							<p className='form-control-plaintext fw-bolder'>{paymentGroupInfo?.updatedByName}</p>
						</div>
					</FormGroupContainer>
					<hr className='my-3 mb-7' />
					<FormGroupContainer>
						<div className='col-md-2'>
							<label className='form-label-sm mb-2'>Payment Group Id</label>
							<NumberTextInput
								ariaLabel={''}
								className={'form-control form-control-sm'}
								{...{value: filterPaymentGroupId, onChange: handleFilterPaymentGroupIdChange}}
							/>
						</div>

						<div className='col-md-2'>
							<label className='form-label-sm mb-2'>iCore Id</label>
							<NumberTextInput
								ariaLabel={''}
								className={'form-control form-control-sm'}
								{...{
									value: filterPaymentGroupICoreId,
									onChange: handleFilterPaymentGroupICoreIdChange,
								}}
							/>
						</div>

						<div className='col-md-3'>
							<label className='form-label-sm mb-2'>Payment Group Name</label>
							<input
								type='text'
								value={filterPaymentGroupName}
								onChange={handleFilterPaymentGroupNameChange}
								className='form-control form-control-sm'
							/>
						</div>
					</FormGroupContainer>
					<FormGroupContainer>
						<ButtonsContainer>
							<MlabButton
								access={userAccess.includes(USER_CLAIMS.PaymentGroupRead)}
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
								access={userAccess.includes(USER_CLAIMS.PaymentGroupWrite)}
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
								rowBuffer={0}
								//enableRangeSelection={true} //deprecated in AgGridReactver.32.0.0
								onComponentStateChanged={resizeColumns}
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
						<DefaultSecondaryButton access={userAccess.includes(USER_CLAIMS.PaymentGroupRead)} title={'Back'} onClick={handleBack} />
					</PaddedContainer>
				</FooterContainer>
			</MainContainer>

			<AddEditPaymentGroupModal
				title={PaymentGroupPlayerConfig.PaymentGroup}
				configInfo={paymentGroupDetail}
				isEditMode={isEditFlag}
				modal={showModal}
				toggle={handleShowModal}
				handleSave={handleSave}
				closeModal={() => setShowModal(false)}
			/>
		</>
	);
};

export default EditPaymentGroup;

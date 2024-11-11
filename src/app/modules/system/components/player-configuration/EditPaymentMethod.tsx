import {faPencilAlt, faTicketAlt} from '@fortawesome/free-solid-svg-icons';
import {AgGridReact} from 'ag-grid-react';
import {Guid} from 'guid-typescript';
import {useEffect, useRef, useState} from 'react';
import {ButtonGroup} from 'react-bootstrap-v5';
import {shallowEqual, useSelector} from 'react-redux';
import {Prompt, useHistory} from 'react-router-dom';
import Select from 'react-select';
import swal from 'sweetalert';
import {RootState} from '../../../../../setup';
import * as hubConnection from '../../../../../setup/hub/MessagingHub';
import gridOverlayTemplate from '../../../../common-template/gridTemplates';
import {OptionListModel} from '../../../../common/model';
import {ElementStyle} from '../../../../constants/Constants';
import {
	ButtonsContainer,
	ContentContainer,
	DefaultGridPagination,
	DefaultSecondaryButton,
	FooterContainer,
	FormGroupContainer,
	FormHeader,
	MainContainer,
	MlabButton,
	NumberTextInput,
	PaddedContainer,
	SearchTextInput,
	TableIconButton,
} from '../../../../custom-components';
import useFnsDateFormatter from '../../../../custom-functions/helper/useFnsDateFormatter';
import useFormattedDate from '../../../../custom-functions/useFormattedDate';
import {usePromptOnUnload} from '../../../../custom-helpers';
import {LookupModel} from '../../../../shared-models/LookupModel';
import {USER_CLAIMS} from '../../../user-management/components/constants/UserClaims';
import {PlayerConfigurationModel} from '../../models';
import {PaymentMethodFilterRequestModel} from '../../models/PaymentMethodFilterRequestModel';
import {PaymentMethodResponseModel} from '../../models/response/PaymentMethodResponseModel';
import {getPaymentMethodList, getPaymentMethodListResult} from '../../redux/SystemService';
import {useSystemOptionHooks} from '../../shared';
import {useSystemPlayerConfigurationHooks} from '../../shared/hooks/useSystemPlayerConfigurationHooks';
import {DefaultPageSetup, PaymentMethodPlayerConfig, PlayerConfigCommons, PlayerConfigTypes, StatusCode} from '../constants/PlayerConfigEnums';
import {PAYMENT_METHOD_VERIFIER, STATUS_OPTIONS} from '../constants/SelectOptions';
import AddEditPaymentMethodModal from './modals/AddEditPaymentMethodModal';
import TicketFieldsModal from './modals/TicketFieldsModal';
import './player-configuration.css';
import { ColDef, ColGroupDef } from 'ag-grid-community';


const EditPaymentMethod: React.FC = () => {
	// Properties
	const history = useHistory();
	const gridRef: any = useRef();
	const {mlabFormatDate} = useFnsDateFormatter();
	usePromptOnUnload(true, 'Changes you made may not be saved.');

	const userAccessId = useSelector<RootState>(({auth}) => auth.userId, shallowEqual) as number;
	const userAccess = useSelector<RootState>(({auth}) => auth.access, shallowEqual) as string;
	const [loading, setLoading] = useState<boolean>(false);

	const {checkAccess, getTicketFieldsOptions, ticketFieldsOptions, getMessageTypeOptionList, messageTypeOptionList} = useSystemOptionHooks();
	const {getPlayerConfigInfoById, playerConfigurationInfo} = useSystemPlayerConfigurationHooks();

	const [messageTypeOptionsMvp, setMessageTypeOptionsMvp] = useState<Array<OptionListModel>>([]);
	const [paymentMethodInfo, setPaymentMethodInfo] = useState<PlayerConfigurationModel>();
	const [paymentMethodList, setPaymentMethodList] = useState<Array<PaymentMethodResponseModel>>([]);
	const [selectedPaymentMethodDetails, setSelectedPaymentMethodDetails] = useState<any>();

	const [filterPaymentMethodId, setFilterPaymentMethodId] = useState('');
	const [filterPaymentMethodICoreId, setFilterPaymentMethodICoreId] = useState('');
	const [filterPaymentMethodName, setFilterPaymentMethodName] = useState('');
	const [filterPaymentMethodVerifier, setFilterPaymentMethodVerifier] = useState<any>();
	const [filterPaymentMethodStatus, setFilterPaymentMethodStatus] = useState<any>();
	const [filterPaymentMethodAccountMessageTypeIds, setFilterPaymentMethodAccountMessageTypeIds] = useState<Array<LookupModel>>([]);
	const [filterPaymentMethodAccountProviderId, setFilterPaymentMethodAccountProviderId] = useState('');

	const [pageSize, setPageSize] = useState<number>(DefaultPageSetup.pageSizeDefault);
	const [currentPage, setCurrentPage] = useState<number>(1);
	const [recordCount, setRecordCount] = useState<number>(0);
	const [sortOrder, setSortOrder] = useState<string>(PlayerConfigCommons.Asc);
	const [sortColumn, setSortColumn] = useState<string>(PaymentMethodPlayerConfig.PaymentMethodId);

	const [showModal, setShowModal] = useState<boolean>(false);
	const [isEditFlag, setIsEditFlag] = useState<boolean>(false);

	const [showTicketFieldsModal, setShowTicketFieldsModal] = useState<boolean>(false);

	if (!checkAccess(userAccess, userAccessId, 'e')) {
		history.push('/error/401');
	}

	const paginationPaymentMethodList = (pageSize: number, currentPage: number, sortColumn: string, sortOrder: string) => {
		const request: PaymentMethodFilterRequestModel = {
			paymentMethodId: filterPaymentMethodId !== '' ? Number(filterPaymentMethodId) : undefined,
			paymentMethodICoreId: filterPaymentMethodICoreId !== '' ? Number(filterPaymentMethodICoreId) : undefined,
			paymentMethodName: filterPaymentMethodName,
			paymentMethodStatus: filterPaymentMethodStatus?.value ?? null,
			paymentMethodVerifier: Number(filterPaymentMethodVerifier?.value) || null,
			paymentMethodMessageTypeIds: filterPaymentMethodAccountMessageTypeIds.map((i) => i.value).join(',') ?? null,
			paymentMethodProviderId: filterPaymentMethodAccountProviderId,
			pageSize: pageSize,
			offsetValue: (currentPage - 1) * pageSize,
			sortColumn: sortColumn,
			sortOrder: sortOrder,
			userId: userAccessId.toString(),
			queueId: Guid.create().toString(),
		};

		loadPaymentMethodList(request);
	};

	const paymentMethodAction = (params: any) => {
		return (
			<ButtonGroup aria-label='Actions'>
				<div className='d-flex justify-content-center flex-shrink-0'>
					<div className='me-4'>
						<TableIconButton
							access={userAccess.includes(USER_CLAIMS.PaymentMethodWrite)}
							faIcon={faPencilAlt}
							toolTipText={'Edit'}
							onClick={() => handlePaymentMethodInfoEdit(params.data.paymentMethodExtId)}
						/>
					</div>
					<div className='me-6'>
						<TableIconButton
							access={userAccess.includes(USER_CLAIMS.PaymentMethodRead)}
							faIcon={faTicketAlt}
							toolTipText={'Ticket Fields'}
							onClick={() => handleTicketFieldDetailsEdit(params.data.paymentMethodExtId)}
						/>
					</div>
				</div>
			</ButtonGroup>
		);
	};

	const colDef : (ColDef<PaymentMethodResponseModel> | ColGroupDef<PaymentMethodResponseModel>)[] = 
	[
		{
			field: PaymentMethodPlayerConfig.PaymentMethodId,
			headerName: PaymentMethodPlayerConfig.PaymentMethodIdHeader,
			width: 180,
		},
		{
			field: PlayerConfigCommons.ICoreIdField,
			headerName: PlayerConfigCommons.ICoreIdHeader,
			width: 100,
		},
		{
			field: PaymentMethodPlayerConfig.PaymentMethodName,
			headerName: PaymentMethodPlayerConfig.PaymentMethodNameHeader,
			minWidth: 250,
		},
		{
			field: PaymentMethodPlayerConfig.PaymentMethodVerifier,
			headerName: PaymentMethodPlayerConfig.PaymentMethodVerifierHeader,
			width: 100,
			cellRenderer: (params: any) => PAYMENT_METHOD_VERIFIER.find((i) => i.value === params.data.verifier)?.label ?? '',
		},
		{
			field: PaymentMethodPlayerConfig.PaymentMethodStatus,
			headerName: PaymentMethodPlayerConfig.PaymentMethodStatusHeader,
			width: 100,
			cellRenderer: (params: any) => (params.data.status === true ? 'Active' : 'Inactive'),
		},
		{
			field: PaymentMethodPlayerConfig.PaymentMethodCommProviderAccount,
			headerName: PaymentMethodPlayerConfig.PaymentMethodCommProviderAccountHeader,
			minWidth: 250,
		},
		{
			field: PlayerConfigCommons.CreatedDate,
			headerName: PlayerConfigCommons.CreatedDateHeader,
			cellRenderer: (param: any) => mlabFormatDate(param.data.createdDate),
		},
		{
			field: PlayerConfigCommons.CreatedBy,
			headerName: PlayerConfigCommons.CreatedByHeader,
		},
		{
			field: PlayerConfigCommons.LastModifiedDate,
			headerName: PlayerConfigCommons.LastModifiedDateHeader,
			cellRenderer: (param: any) => mlabFormatDate(param.data.updatedDate),
		},
		{
			field: PlayerConfigCommons.LastModifiedBy,
			headerName: PlayerConfigCommons.LastModifiedByHeader,
			minWidth: 150,
		},
		{
			field: PaymentMethodPlayerConfig.PaymentMethodName,
			headerName: 'Action',
			minWidth: 150,
			cellRenderer: paymentMethodAction,
		},
	];

	// -----------------------------------------------------------------
	// MOUNTED
	// -----------------------------------------------------------------
	useEffect(() => {
		getPlayerConfigInfoById(PlayerConfigTypes.PaymentMethodTypeId);
		getTicketFieldsOptions();
		getMessageTypeOptionList('');
	}, []);

	useEffect(() => {
		if (playerConfigurationInfo) {
			setPaymentMethodInfo(playerConfigurationInfo);
		}
	}, [playerConfigurationInfo]);

	useEffect(() => {
		if (messageTypeOptionList) {
			setMessageTypeOptionsMvp(messageTypeOptionList.filter((i) => i.label === 'Telegram'));
		}
	}, [messageTypeOptionList]);

	useEffect(() => {
		if (!loading && paymentMethodList.length === 0) {
			if (document.getElementById('mlab-grid-loading-overlay') as HTMLInputElement) {
				(document.getElementById('mlab-grid-loading-overlay') as HTMLInputElement).innerText = 'No Rows To Show';
			}
		} else if (document.getElementById('mlab-grid-loading-overlay') as HTMLInputElement) {
			(document.getElementById('mlab-grid-loading-overlay') as HTMLInputElement).innerText = 'Please wait while your items are loading';
		}
	}, [loading]);

	const handleFilterPaymentMethodIdChange = (event: any) => {
		setFilterPaymentMethodId(event.target.value);
	};

	const handleFilteriCoreIdChange = (event: any) => {
		setFilterPaymentMethodICoreId(event.target.value);
	};

	const handleFilterPaymentMethodNameChange = (event: any) => {
		setFilterPaymentMethodName(event.target.value);
	};

	const handleFilterPaymentMethodAccountProviderId = (event: any) => {
		setFilterPaymentMethodAccountProviderId(event.target.value);
	};

	const clearFilter = () => {
		setFilterPaymentMethodId('');
		setFilterPaymentMethodICoreId('');
		setFilterPaymentMethodName('');
		setFilterPaymentMethodVerifier('');
		setFilterPaymentMethodStatus('');
		setFilterPaymentMethodAccountMessageTypeIds([]);
		setFilterPaymentMethodAccountProviderId('');
	};

	const handlePaymentMethodSearch = () => {
		setCurrentPage(1);
		let request: PaymentMethodFilterRequestModel = {
			paymentMethodId: filterPaymentMethodId !== '' ? Number(filterPaymentMethodId) : undefined,
			paymentMethodICoreId: filterPaymentMethodICoreId !== '' ? Number(filterPaymentMethodICoreId) : undefined,
			paymentMethodName: filterPaymentMethodName,
			paymentMethodStatus: filterPaymentMethodStatus?.value ?? null,
			paymentMethodVerifier: Number(filterPaymentMethodVerifier?.value) || null,
			paymentMethodMessageTypeIds: filterPaymentMethodAccountMessageTypeIds.map((i) => i.value).join(',') ?? null,
			paymentMethodProviderId: filterPaymentMethodAccountProviderId,
			pageSize: pageSize,
			offsetValue: 0,
			sortColumn: sortColumn,
			sortOrder: sortOrder,
			userId: userAccessId.toString(),
			queueId: Guid.create().toString(),
		};

		loadPaymentMethodList(request);
	};

	const loadPaymentMethodList = (request: PaymentMethodFilterRequestModel) => {
		//handle search here
		setLoading(true);
		setPaymentMethodList([]);
		setTimeout(() => {
			const messagingHub = hubConnection.createHubConnenction();
			messagingHub.start().then(() => {
				getPaymentMethodList(request).then((response: any) => {
					if (response.status === StatusCode.OK) {
						messagingHub.on(request.queueId.toString(), (message) => {
							getPaymentMethodListResult(message.cacheId)
								.then((returnData: any) => {
									setPaymentMethodList(returnData.data.paymentMethodList);
									setRecordCount(returnData.data.recordCount);

									setLoading(false);
									messagingHub.off(request.queueId.toString());
									messagingHub.stop();
								})
								.catch(() => {
									swal('Failed', `Error loading Payment Method`, 'error');
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

	const handleShowModal = () => {
		setShowModal(!showModal);
	};

	const handleShowTicketFieldsModal = () => {
		setShowTicketFieldsModal(!showTicketFieldsModal);
	};

	const handleAddNew = () => {
		setIsEditFlag(false);
		setShowModal(true);
	};

	const handlePaymentMethodInfoEdit = (id: number) => {
		const detail = paymentMethodList.find((i) => i.paymentMethodExtId === id);
		if (detail !== undefined) {
			setIsEditFlag(true);
			setSelectedPaymentMethodDetails(detail);
			setShowModal(true);
		}
	};

	const handleTicketFieldDetailsEdit = (id: number) => {
		const detail = paymentMethodList.find((i) => i.paymentMethodExtId === id);
		if (detail !== undefined) {
			setSelectedPaymentMethodDetails(detail);
			setShowTicketFieldsModal(true);
		}
	};

	const handleSaveTicketFields = () => {
		handleShowTicketFieldsModal();
		paginationPaymentMethodList(pageSize, currentPage, sortColumn, sortOrder);
	};
	const handleSave = () => {
		handleShowModal();
		clearFilter();
		paginationPaymentMethodList(pageSize, currentPage, sortColumn, sortOrder);
	};

	// Methods
	const onPMGridReady = () => {
		resizePMGridColumns();
		handlePaymentMethodSearch();
	};

	const resizePMGridColumns = () => {
		gridRef.current.api.sizeColumnsToFit();
	};

	const onPMGridSort = (e: any) => {
		setCurrentPage(1);
		if (paymentMethodList != undefined && paymentMethodList.length > 0) {
			let sortDetail = e.api.getSortModel();
			if (sortDetail[0] != undefined) {
				setSortColumn(sortDetail[0]?.colId);
				setSortOrder(sortDetail[0]?.sort);
				paginationPaymentMethodList(pageSize, 1, sortDetail[0]?.colId, sortDetail[0]?.sort);
			} else {
				paginationPaymentMethodList(pageSize, 1, sortColumn, sortOrder);
			}
		}
	};

	const onPMGridClickFirst = () => {
		if (currentPage > 1) {
			setCurrentPage(1);
			paginationPaymentMethodList(pageSize, 1, sortColumn, sortOrder);
		}
	};

	const onPMGridClickPrevious = () => {
		if (currentPage > 1) {
			setCurrentPage(currentPage - 1);
			paginationPaymentMethodList(pageSize, currentPage - 1, sortColumn, sortOrder);
		}
	};

	const onPMGridClickNext = () => {
		if (totalPage() > currentPage) {
			setCurrentPage(currentPage + 1);
			paginationPaymentMethodList(pageSize, currentPage + 1, sortColumn, sortOrder);
		}
	};

	const onPMGridClickLast = () => {
		if (totalPage() > currentPage) {
			setCurrentPage(totalPage());
			paginationPaymentMethodList(pageSize, totalPage(), sortColumn, sortOrder);
		}
	};

	const onPMGridPageSizeChanged = () => {
		let value: string = (document.getElementById('page-size') as HTMLInputElement).value;
		setPageSize(Number(value));
		setCurrentPage(1);

		if (paymentMethodList != undefined && paymentMethodList.length > 0) {
			paginationPaymentMethodList(Number(value), 1, sortColumn, sortOrder);
		}
	};

	const totalPage = () => {
		return Math.ceil(recordCount / pageSize) | 0;
	};

	const handleBack = () => {
		history.push('/system/player-configuration-list');
	};

	return (
		<>
			<MainContainer>
				<Prompt
					message={() => {
						return !showModal && !showTicketFieldsModal ? true : 'Changes you made may not be saved.';
					}}
				/>
				<FormHeader headerLabel={'Edit Payment Method'} />
				<ContentContainer>
					<FormGroupContainer>
						<div className='col-lg-3'>
							<label htmlFor='player-config-type-label'>Player Configuration Type</label>
							<p id='player-config-type-label' className='form-control-plaintext fw-bolder'>
								{paymentMethodInfo?.playerConfigurationName}
							</p>
						</div>
					</FormGroupContainer>
					<FormGroupContainer>
						<div className='col-lg-3'>
							<label htmlFor='created-date-label'>Created Date</label>
							<p id='created-date-label' className='form-control-plaintext fw-bolder'>
								{useFormattedDate(paymentMethodInfo?.createdDate ? paymentMethodInfo.createdDate : '')}
							</p>
						</div>
						<div className='col-lg-3'>
							<label htmlFor='created-by-label'>Created By</label>
							<p id='created-by-label' className='form-control-plaintext fw-bolder'>
								{paymentMethodInfo?.createdByName}
							</p>
						</div>
						<div className='col-lg-3'>
							<label htmlFor='modified-date-label'>Last Modified Date</label>
							<p id='modified-date-label' className='form-control-plaintext fw-bolder'>
								{useFormattedDate(paymentMethodInfo?.updatedDate ? paymentMethodInfo.updatedDate : '')}
							</p>
						</div>
						<div className='col-lg-3'>
							<label htmlFor='modified-by-label'>Modified By</label>
							<p id='modified-by-label' className='form-control-plaintext fw-bolder'>
								{paymentMethodInfo?.updatedByName}
							</p>
						</div>
					</FormGroupContainer>
					<hr className='my-3 mb-7' />
					<FormGroupContainer>
						<div className='col-lg-3'>
							<label htmlFor='payment-method-id-field' className='form-label-sm mb-2'>
								Payment Method ID
							</label>
							<NumberTextInput
								ariaLabel={''}
								className={'form-control form-control-sm'}
								{...{id: 'payment-method-id-field', value: filterPaymentMethodId, onChange: handleFilterPaymentMethodIdChange}}
							/>
						</div>
						<div className='col-lg-3'>
							<label htmlFor='icore-id-field' className='form-label-sm mb-2'>
								iCore ID
							</label>
							<NumberTextInput
								ariaLabel={''}
								className={'form-control form-control-sm'}
								{...{id: 'icore-id-field', value: filterPaymentMethodICoreId, onChange: handleFilteriCoreIdChange}}
							/>
						</div>
						<div className='col-lg-3'>
							<label htmlFor='payment-method-name-field' className='form-label-sm mb-2'>
								Payment Method Name
							</label>
							<SearchTextInput
								ariaLabel={''}
								{...{id: 'payment-method-name-field', value: filterPaymentMethodName, onChange: handleFilterPaymentMethodNameChange}}
							/>
						</div>
						<div className='col-lg-3'>
							<label htmlFor='verifier-field' className='form-label-sm mb-2'>
								Verifier
							</label>
							<Select
								id='verifier-field'
								size='small'
								style={{width: '100%'}}
								options={PAYMENT_METHOD_VERIFIER}
								onChange={(val: any) => setFilterPaymentMethodVerifier(val)}
								value={filterPaymentMethodVerifier}
								isClearable={true}
							/>
						</div>
						<div className='col-lg-12 mt-3'></div>
						<div className='col-lg-3'>
							<label htmlFor='status-field' className='form-label-sm mb-2'>
								Status
							</label>
							<Select
								id='status-field'
								size='small'
								style={{width: '100%'}}
								options={STATUS_OPTIONS}
								onChange={(val: any) => setFilterPaymentMethodStatus(val)}
								value={filterPaymentMethodStatus}
								isClearable={true}
							/>
						</div>
						<div className='col-lg-3'>
							<label htmlFor='message-type-field' className='form-label-sm mb-2'>
								Communication Provider Message Type
							</label>
							<Select
								id='message-type-field'
								isMulti
								size='small'
								style={{width: '100%'}}
								options={messageTypeOptionList}
								onChange={(val: any) => setFilterPaymentMethodAccountMessageTypeIds(val)}
								value={filterPaymentMethodAccountMessageTypeIds}
								isClearable={true}
							/>
						</div>
						<div className='col-lg-3'>
							<label htmlFor='account-id-field' className='form-label-sm mb-2'>
								Communication Provider Account ID
							</label>
							<SearchTextInput
								ariaLabel={''}
								{...{id: 'account-id-field', value: filterPaymentMethodAccountProviderId, onChange: handleFilterPaymentMethodAccountProviderId}}
							/>
						</div>
						<div className='col-lg-12 mt-3'></div>
					</FormGroupContainer>
					<FormGroupContainer>
						<ButtonsContainer>
							<MlabButton
								access={userAccess.includes(USER_CLAIMS.PaymentMethodRead)}
								label='Search'
								style={ElementStyle.primary}
								type={'button'}
								weight={'solid'}
								size={'sm'}
								loading={loading}
								loadingTitle={'Please wait...'}
								onClick={handlePaymentMethodSearch}
								disabled={loading}
							/>
							<MlabButton
								access={userAccess.includes(USER_CLAIMS.PaymentMethodWrite)}
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
								rowData={paymentMethodList}
								columnDefs={colDef}
								overlayNoRowsTemplate={gridOverlayTemplate}
								defaultColDef={{
									sortable: true,
									resizable: true,
								}}
								animateRows={true}
								onGridReady={onPMGridReady}
								rowBuffer={0}
								//enableRangeSelection={true} //deprecated in AgGridReactver.32.0.0
								onComponentStateChanged={resizePMGridColumns}
								onSortChanged={(e) => onPMGridSort(e)}
							/>
							<DefaultGridPagination
								recordCount={recordCount}
								currentPage={currentPage}
								pageSize={pageSize}
								onClickFirst={onPMGridClickFirst}
								onClickPrevious={onPMGridClickPrevious}
								onClickNext={onPMGridClickNext}
								onClickLast={onPMGridClickLast}
								onPageSizeChanged={onPMGridPageSizeChanged}
								defaultColumns={colDef}
							/>
						</div>
					</FormGroupContainer>
				</ContentContainer>
				<FooterContainer>
					<PaddedContainer>
						<DefaultSecondaryButton access={userAccess.includes(USER_CLAIMS.PaymentMethodRead)} title={'Back'} onClick={handleBack} />
					</PaddedContainer>
				</FooterContainer>
			</MainContainer>
			<AddEditPaymentMethodModal
				title={PaymentMethodPlayerConfig.PaymentMethod}
				messageTypeOptionList={messageTypeOptionsMvp}
				paymentMethodInfo={selectedPaymentMethodDetails}
				isEditMode={isEditFlag}
				modal={showModal}
				toggle={handleShowModal}
				handleSave={handleSave}
				closeModal={() => setShowModal(false)}
			/>
			<TicketFieldsModal
				paymentMethodInfo={selectedPaymentMethodDetails}
				ticketFieldsList={ticketFieldsOptions}
				modal={showTicketFieldsModal}
				toggle={handleShowTicketFieldsModal}
				handleSave={handleSaveTicketFields}
				closeModal={() => setShowTicketFieldsModal(false)}
			/>
		</>
	);
};

export default EditPaymentMethod;

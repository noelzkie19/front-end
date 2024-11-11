import {faPencilAlt, faTrash} from '@fortawesome/free-solid-svg-icons';
import {AgGridReact} from 'ag-grid-react';
import 'datatables.net';
import 'datatables.net-dt';
import {useFormik} from 'formik';
import {Guid} from 'guid-typescript';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {ButtonGroup} from 'react-bootstrap-v5';
import {shallowEqual, useDispatch, useSelector} from 'react-redux';
import {useHistory, useParams} from 'react-router-dom';
import Select from 'react-select';
import swal from 'sweetalert';
import {RootState} from '../../../../../setup';
import * as hubConnection from '../../../../../setup/hub/MessagingHub';
import {LookupModel} from '../../../../common/model';
import useConstant from '../../../../constants/useConstant';
import {
	BorderedButton,
	ContentContainer,
	DefaultPrimaryButton,
	FormContainer,
	FormGroupContainer,
	FormHeader,
	LocalGridPagination,
	MainContainer,
	TableIconButton,
} from '../../../../custom-components';
import {useFormattedDate} from '../../../../custom-functions';
import CommonLookups from '../../../../custom-functions/CommonLookups';
import {disableSplashScreen, enableSplashScreen} from '../../../../utils/helper';
import {USER_CLAIMS} from '../../../user-management/components/constants/UserClaims';
import useCampaignSettingConstants from '../../constants/useCampaignSettingConstant';
import * as campaignSetting from '../../redux/AutoTaggingRedux';
import {getAutoTaggingDetailsById, getAutoTaggingDetailsByIdResult} from '../../redux/AutoTaggingService';
import {CampaignPeriodDetailsModel} from '../models/CampaignPeriodDetailsModel';
import {TaggingConfigurationModel} from '../models/TaggingConfigurationModel';
import {UserTaggingModel} from '../models/UserTaggingModel';
import {AutoTaggingDetailsByIdRequestModel} from '../models/request/AutoTaggingDetailsByIdRequestModel';
import {AutoTaggingDetailsByIdResponseModel} from '../models/response/AutoTaggingDetailsByIdResponseModel';
import AutoTaggingConfigurationModal from './AutoTaggingConfigurationModal';
import CampaignList from './CampaignList';
import { ColDef, ColGroupDef } from 'ag-grid-community';

const ViewAutoTagging: React.FC = () => {
	//  Constants
	const {successResponse, HubConnected} = useConstant();
	const {LARGE, ASC, MEDIUM} = useCampaignSettingConstants();

	//  Get redux store
	const messagingHub = hubConnection.createHubConnenction();
	const userAccessId = useSelector<RootState>(({auth}) => auth.userId, shallowEqual) as number;
	const userAccess = useSelector<RootState>(({auth}) => auth.access, shallowEqual) as string;
	const history = useHistory();

	//  State
	const dispatch = useDispatch();
	const [loading, setLoading] = useState(false);
	const [modalShow, setModalShow] = useState<boolean>(false);
	const [autoTaggingDetails, setAutoTaggingDetails] = useState<AutoTaggingDetailsByIdResponseModel>();
	const [taggingConfigurationList, setTaggingConfigurationList] = useState<Array<TaggingConfigurationModel>>([]);
	const [taggedUserList, setTaggedUserList] = useState<Array<UserTaggingModel>>([]);
	const [campaignDetailsList, setCampaignDetailsList] = useState<Array<CampaignPeriodDetailsModel>>([]);
	const [showHeader, setShowHeader] = useState(false);
	const [modalAction, setModalAction] = useState('');
	const [modalSize, setModalSize] = useState(LARGE);
	const [selectedConfiguration, setSelectedConfiguration] = useState<TaggingConfigurationModel>();
	const [selectedUsers, setSelectedUsers] = useState<Array<UserTaggingModel>>([]);
	const [selectedStatuses, setSelectedStatuses] = useState<string | any>('');
	const [hasCampaign, setHasCampaign] = useState<boolean>(false);
	const [filterSettingStatus, setFilterSettingStatus] = useState<LookupModel | null>();
	const {paramCampaignSettingId}: {paramCampaignSettingId: number} = useParams();

	const [actionTitle, setActionTitle] = useState('View');
	const [gridApi, setGridApi] = useState<any | null>(null);
	const [gridColumnApi, setGridColumnApi] = useState(null);
	
	//	Pagination
	const [gridPageSize, setGridPageSize] = useState<number>(10);
	const [gridCurrentPage, setGridCurrentPage] = useState<number>(1);
	const [gridTotalPages, setGridTotalPages] = useState<number>(1);
	const gridRefView: any = useRef();
	const customPageSizeElementId = 'view-auto-tagging';
	const autoTaggingCampaignSettingId = 43
	
	//   GRID DETAILS
	const columnDefs : (ColDef<TaggingConfigurationModel> | ColGroupDef<TaggingConfigurationModel>)[] =[
		{headerName: 'Priority', field: 'priorityNumber', sort: 'asc' as 'asc'},
		{
			headerName: 'Configuration Name',
			field: 'taggingConfigurationName',
		
			cellRenderer: (params: any) => (
				<>
					{params.data.campaignSettingId != 0 ? (
						<ButtonGroup aria-label='Basic example'>
							<div className='d-flex justify-content-center flex-shrink-0 shadow-none'>
								<label
									className='btn-link cursor-pointer'
									onClick={() => {
										onOpentTaggingConfigurationDetails(params.data, 'View');
									}}
								>
									{params.data.taggingConfigurationName}
								</label>
							</div>
						</ButtonGroup>
					) : null}
				</>
			),
		},
		{
			headerName: 'Segment Name',
			field: 'segmentName',

			cellRenderer: (params: any) => (
				<>
					{params.data.segmentId != 0 ? (
						<ButtonGroup aria-label='Basic example'>
							<div className='d-flex justify-content-center flex-shrink-0 shadow-none'>
								<label
									className='btn-link cursor-pointer'
									onClick={() => {
										openSegment(params.data.segmentId);
									}}
								>
									{params.data.segmentName}
								</label>
							</div>
						</ButtonGroup>
					) : null}
				</>
			),
		},
		{
			headerName: 'Action',
			cellRenderer: (params: any) => (
				<>
					{params.data.campaignSettingId != 0 ? (
						<ButtonGroup aria-label='Basic example'>
							<div className='d-flex justify-content-center flex-shrink-0'>
								<div className='me-4'>
									<TableIconButton
										access={userAccess.includes(USER_CLAIMS.ViewAutoTaggingWrite)}
										isDisable={true}
										faIcon={faPencilAlt}
										toolTipText={'Edit'}
										onClick={() => {}}
									/>
								</div>
								<div className='me-4'>
									<TableIconButton
										access={userAccess.includes(USER_CLAIMS.ViewAutoTaggingWrite)}
										isDisable={true}
										faIcon={faTrash}
										toolTipText={'Remove'}
										onClick={() => {}}
									/>
								</div>
							</div>
						</ButtonGroup>
					) : null}
				</>
			),
		},
	];

	const initialValues = {
		campaignSettingId: '',
		campaignSettingName: '',
		campaignSettingDescription: '',
		settingTypeId: '',
		isActive: '',
		campaignSettingTypeId: '',
		goalParameterAmountId: '',
		goalParameterCountId: '',

		taggingConfigurationList: Array<TaggingConfigurationModel>(),
		userTaggingList: Array<UserTaggingModel>(),
		campaignDetailsList: Array<CampaignPeriodDetailsModel>(),
		createdBy: '',
		createdDate: '',
		updatedBy: '',
		updatedDate: '',
	};

	//  BEGIN: METHODS

	const openSegment = (id: any) => {
		window.open('/player-management/segment/view/' + id, '_blank');
	};

	const onOpentTaggingConfigurationDetails = (data: TaggingConfigurationModel, action: any) => {
		setActionTitle(action);
		setModalShow(true);

		setShowHeader(true);
		setModalSize(LARGE);
		setSelectedConfiguration(data);
	};

	const onOpenAutoTaggingDetails = () => {
		history.push('/campaign-management/campaign-setting/edit-auto-tagging/' + paramCampaignSettingId);
	};

	//  WATCHERS
	const onGridReady = (params: any) => {
		setGridApi(params.api);
		setGridColumnApi(params.columnApi);
		params.api.paginationGoToPage(4);

		params.api.sizeColumnsToFit();
	};

	useEffect(() => {
		if (autoTaggingDetails != undefined) {
			let status = autoTaggingDetails.isActive == 1 ? {value: '1', label: 'Active'} : {value: '0', label: 'Inactive'};
			formik.setFieldValue('isActive', status);
			formik.setFieldValue('campaignSettingName', autoTaggingDetails.campaignSettingName);
			formik.setFieldValue('campaignSettingDescription', autoTaggingDetails.campaignSettingDescription);
		}
	}, [autoTaggingDetails]);

	let selectedId: string = '';

	useEffect(() => {
		getSelectedAutoTaggingDetails(paramCampaignSettingId);
	}, []);

	const formik = useFormik({
		initialValues,
		onSubmit: () => {},
	});

	const onChangeSettingStatus = (val: LookupModel) => {
		setFilterSettingStatus(val);
	};

	const getSelectedAutoTaggingDetails = (id: number) => {
		enableSplashScreen();
		setTimeout(() => {
			messagingHub.start().then(() => {
				const request: AutoTaggingDetailsByIdRequestModel = {
					campaignSettingId: id,
					campaignSettingTypeId: autoTaggingCampaignSettingId, //FIXED for auto tagging Details
					queueId: Guid.create().toString(),
					userId: userAccessId.toString(),
				};
				getAutoTaggingDetailsById(request).then((response) => {
					messagingHub.on(request.queueId.toString(), (message) => {
						getAutoTaggingDetailsByIdResult(message.cacheId)
							.then((returnData) => {
								const item = returnData.data;
								if (item === undefined) {
									swal('Failed', 'Cannot find Auto Tagging Details', 'error');
								} else {
									let data = Object.assign(returnData.data);
									data = data[0];
									setAutoTaggingDetails(data);
									setTaggedUserList(data.userTaggingList);
									setCampaignDetailsList(data.campaignPeriodList);
									setTaggingConfigurationList(data.taggingConfigurationList);
									setHasCampaign(data.campaignPeriodList.length > 0 ? true : false);
									setSelectedUsers(data.userTaggingList);
									setFilterSettingStatus(data.isActive == 1 ? {value: '1', label: 'Active'} : {value: '0', label: 'Inactive'});

									dispatch(campaignSetting.actions.getAutoTaggingDetailsById(data));

									let feedbackData = Object.assign(new Array<TaggingConfigurationModel>(), data.taggingConfigurationList);
									dispatch(campaignSetting.actions.getTaggingConfigByList(feedbackData));

									let usersData = Object.assign(new Array<UserTaggingModel>(), data.userTaggingList);
									dispatch(campaignSetting.actions.getUsersConfigByList(data.userTaggingList));
								}
							})
							.catch(() => {
								setLoading(false);
							});
						messagingHub.off(request.queueId.toString());
					});

					setTimeout(() => {
						if (messagingHub.state === HubConnected) {
							messagingHub.stop();
							setLoading(false);
						}
					}, 30000);
				});
				disableSplashScreen();
			});
		}, 1000);
	};

	// Local pagination methods
	const onViewPaginationChanged = useCallback(() => {
		if (gridRefView.current.api) {
			setGridPageSize(gridRefView.current.api.paginationGetPageSize());
			setGridCurrentPage(gridRefView.current.api.paginationGetCurrentPage() + 1);
			setGridTotalPages(gridRefView.current.api.paginationGetTotalPages());
		}
	}, []);



	//  View
	return (
		<FormContainer onSubmit={formik.handleSubmit}>
			<MainContainer>
				<FormHeader headerLabel={'View Auto Tagging Setting'} />
				<ContentContainer>
					<FormGroupContainer>
						<div className='form-group col-md-3 mb-5'>
							<label className='form-label'>Setting Name</label>
							<input
								type='text'
								className='form-control form-control-sm'
								aria-label={'Setting Name'}
								disabled={true}
								{...formik.getFieldProps('campaignSettingName')}
							/>
						</div>
						<div className='form-group col-md-4 mb-5'>
							<label className='form-label'>Setting Description</label>
							<input type='text' className='form-control form-control-sm' disabled={true} {...formik.getFieldProps('campaignSettingDescription')} />
						</div>

						<div className='form-group col-md-2 mb-5'>
							<label className='form-label '>Setting Status</label>
							<Select
								isDisabled={true}
								size='small'
								style={{width: '100%'}}
								options={CommonLookups('settingStatuses')}
								onChange={onChangeSettingStatus}
								value={filterSettingStatus}
							/>
						</div>
					</FormGroupContainer>
					<FormGroupContainer>
						<div className='form-group row mt-9 ml-7'>
							<div className='form-group col-md-3 mb-5'>
								<h2 className='form-label '>Created Date</h2>
								<p className='form-label  fw-bolder'>
									{useFormattedDate(autoTaggingDetails && autoTaggingDetails.createdDate ? autoTaggingDetails.createdDate : '')}
								</p>
							</div>
							<div className='form-group row col-md-3 mb-5'>
								<label className='form-label '>Created By</label>
								<label className='form-label fw-bolder'>{autoTaggingDetails?.createdBy}</label>
							</div>
							<div className='form-group row col-md-3 mb-5'>
								<label className='form-label '>Last Modified Date</label>
								<p className='form-label fw-bolder'>
									{' '}
									{useFormattedDate(autoTaggingDetails && autoTaggingDetails.updatedDate ? autoTaggingDetails.updatedDate : '')}
								</p>
							</div>
							<div className='form-group row col-md-3 mb-5'>
								<label className='form-label '>Last Modified By</label>
								<label className='form-label fw-bolder'>{autoTaggingDetails?.updatedBy}</label>
							</div>
						</div>
					</FormGroupContainer>

					<div className='separator border-1 my-10' />
					<div className='row mb-3'>
						<h6 className='fw-bolder m-0'>Configuration</h6>
					</div>

					<FormGroupContainer>
							<div className='ag-theme-quartz mb-13' style={{height: 350, width: '100%'}}>
								<AgGridReact
									rowData={taggingConfigurationList}
									defaultColDef={{
										sortable: true,
										resizable: true,
									}}
									onGridReady={onGridReady}
									rowBuffer={0}
									enableRangeSelection={true}
									onPaginationChanged={onViewPaginationChanged}
									columnDefs={columnDefs}
									ref={gridRefView}
									paginationPageSize={gridPageSize}
									pagination={true}
									suppressPaginationPanel={true}
									suppressScrollOnNewData={true}
								/>
								<LocalGridPagination
									setGridPageSize={setGridPageSize}
									recordCount={taggingConfigurationList.length}
									gridCurrentPage={gridCurrentPage}
									gridPageSize={gridPageSize}
									gridTotalPages={gridTotalPages}
									gridRef={gridRefView}
									customId={customPageSizeElementId} //page-size-create-subtopic | optional, for page that has more than one grid with page size selection
								/>
							</div>
						</FormGroupContainer>


					<div className='d-flex my-6'>
						<BorderedButton
							access={userAccess.includes(USER_CLAIMS.ViewAutoTaggingWrite)}
							title={'Add New'}
							isDisabled={true}
							onClick={() => {
								setModalShow(true);
								setShowHeader(true);
								setModalAction('Add');
								setModalSize('lg');
							}}
							isColored={true}
						/>
						<BorderedButton
							access={userAccess.includes(USER_CLAIMS.ViewAutoTaggingWrite)}
							title={'Change Priority'}
							isDisabled={true}
							onClick={() => {
								setModalShow(true);
								setShowHeader(false);
								setModalSize(MEDIUM);
							}}
							isColored={true}
						/>
					</div>
					{campaignDetailsList.length != 0 && <CampaignList campaignPeriodList={campaignDetailsList} />}

					<div className='separator border-1 my-5' />
					<div className='d-flex my-4'>
						<DefaultPrimaryButton
							title={'Edit Setting'}
							access={userAccess.includes(USER_CLAIMS.ViewAutoTaggingWrite)}
							isDisable={hasCampaign}
							onClick={onOpenAutoTaggingDetails}
						/>
					</div>
				</ContentContainer>
				{/* modal for add auto tagging */}
				<AutoTaggingConfigurationModal
					actionTitle={actionTitle}
					subModalData={selectedUsers}
					modalData={selectedConfiguration}
					showForm={modalShow}
					closeModal={() => setModalShow(false)}
					showHeader={showHeader}
					modalAction={modalAction}
					modalSize={modalSize}
				/>
			</MainContainer>
		</FormContainer>
	);
};

export default ViewAutoTagging;

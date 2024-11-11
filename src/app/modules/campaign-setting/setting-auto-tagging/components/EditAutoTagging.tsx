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
import {LookupModel} from '../../../../common/model/LookupModel';
import useConstant from '../../../../constants/useConstant';
import {BorderedButton, DefaultSecondaryButton, FormGroupContainer, LoaderButton, LocalGridPagination, TableIconButton} from '../../../../custom-components';
import {useFormattedDate} from '../../../../custom-functions';
import CommonLookups from '../../../../custom-functions/CommonLookups';
import {disableSplashScreen, enableSplashScreen} from '../../../../utils/helper';
import {USER_CLAIMS} from '../../../user-management/components/constants/UserClaims';
import useCampaignSettingConstants from '../../constants/useCampaignSettingConstant';
import * as campaignSetting from '../../redux/AutoTaggingRedux';
//service
import {
	checkCampaignSettingByNameIfExist,
	getAutoTaggingDetailsById,
	getAutoTaggingDetailsByIdResult,
	saveAutoTaggingDetails,
	saveAutoTaggingDetailsResult,
} from '../../redux/AutoTaggingService';
import AutoTaggingConfigurationModal from '../components/AutoTaggingConfigurationModal';
import {CampaignPeriodDetailsModel} from '../models/CampaignPeriodDetailsModel';
import {AddTaggingConfigurationModel} from '../models/request/AddTaggingConfigurationModel';
import {AddUpdateAutoTaggingRequestModel} from '../models/request/AddUpdateAutoTaggingRequestModel';
import {AddUserTaggingModel} from '../models/request/AddUserTaggingModel';
// MODELS
import {AutoTaggingDetailsByIdRequestModel} from '../models/request/AutoTaggingDetailsByIdRequestModel';
import {AutoTaggingDetailsByIdResponseModel} from '../models/response/AutoTaggingDetailsByIdResponseModel';
import {TaggingConfigurationModel} from '../models/TaggingConfigurationModel';
import {UserTaggingModel} from '../models/UserTaggingModel';
import AutoTaggingPriority from './AutoTaggingPriority';
import CampaignList from './CampaignList';
import { ColDef, ColGroupDef } from 'ag-grid-community';

const EditAutoTagging: React.FC = () => {
	//  Get redux store
	const messagingHub = hubConnection.createHubConnenction();
	const userAccessId = useSelector<RootState>(({auth}) => auth.userId, shallowEqual) as number;
	const userAccess = useSelector<RootState>(({auth}) => auth.access, shallowEqual) as string;
	const history = useHistory();

	const getTaggingConfigListState = useSelector<RootState>(
		({campaignSetting}) => campaignSetting.getTaggingConfigByList,
		shallowEqual
	) as TaggingConfigurationModel[];

	const getUsersConfigByListState = useSelector<RootState>(
		({campaignSetting}) => campaignSetting.getUsersConfigByList,
		shallowEqual
	) as UserTaggingModel[];

	//  Constants
	const {successResponse, HubConnected} = useConstant();
	const {CampaignSettingTypes, LARGE, EDIT, ADD, MEDIUM, MAX_CONFIG_TAG} = useCampaignSettingConstants();

	//  State
	const dispatch = useDispatch();
	const [loading, setLoading] = useState(false);
	const [modalShow, setModalShow] = useState<boolean>(false);
	const [autoTaggingDetails, setAutoTaggingDetails] = useState<AutoTaggingDetailsByIdResponseModel>();
	const [taggingConfigurationList, setTaggingConfigurationList] = useState<Array<TaggingConfigurationModel>>([]);
	const [taggedUserList, setTaggedUserList] = useState<Array<AddUserTaggingModel>>([]);
	const [campaignDetailsList, setCampaignDetailsList] = useState<Array<CampaignPeriodDetailsModel>>([]);
	const [showHeader, setShowHeader] = useState(false);
	const [modalAction, setModalAction] = useState('');
	const [modalSize, setModalSize] = useState(LARGE);

	const [selectedConfiguration, setSelectedConfiguration] = useState<TaggingConfigurationModel>();
	const [selectedUsers, setSelectedUsers] = useState<Array<UserTaggingModel>>([]);
	const [actionTitle, setActionTitle] = useState(EDIT);

	const [goalParameterAmountId, setGoalParameterAmountId] = useState(0);
	const [goalParameterCountId, setGoalParameterCountId] = useState(0);
	
	const [modalPriorityShow, setModalPriorityShow] = useState<boolean>(false);
	const [hasCampaign, setHasCampaign] = useState<boolean>(false);
	const [disableAdd, setDisableAdd] = useState<boolean>(false);
	const [disablePriority, setDisablePriority] = useState<boolean>(false);
	const [filterSettingStatus, setFilterSettingStatus] = useState<LookupModel | null>();
	const {paramCampaignSettingId}: {paramCampaignSettingId: number} = useParams();

	//	Pagination
	const gridRefEdit: any = useRef();
	const [gridPageSize, setGridPageSize] = useState<number>(10);
	const [gridCurrentPage, setGridCurrentPage] = useState<number>(1);
	const [gridTotalPages, setGridTotalPages] = useState<number>(1);
	const customPageSizeElementId = 'edit-auto-tagging';

	//   GRID DETAILS
	const columnDefs : (ColDef<TaggingConfigurationModel> | ColGroupDef<TaggingConfigurationModel>)[] = [
		{headerName: 'Priority', field: 'priorityNumber', sort: 'asc' as 'asc'},
		{
			headerName: 'Configuration Name',
			field: 'taggingConfigurationName',
			minWidth: 500,
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
			minWidth: 500,
			autoHeight: true,
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
			autoHeight: true,
			cellRenderer: (params: any) => (
				<>
					{params.data.campaignSettingId != 0 ? (
						<ButtonGroup aria-label='Basic example'>
							<div className='d-flex justify-content-center flex-shrink-0'>
								<div className='me-4'>
									<TableIconButton
										access={userAccess.includes(USER_CLAIMS.ViewAutoTaggingWrite)}
										isDisable={hasCampaign}
										faIcon={faPencilAlt}
										toolTipText={EDIT}
										onClick={() => {
											!hasCampaign && onOpentTaggingConfigurationDetails(params.data, EDIT);
										}}
									/>
								</div>
								<div className='me-4'>
									<TableIconButton
										access={userAccess.includes(USER_CLAIMS.ViewAutoTaggingWrite)}
										isDisable={hasCampaign}
										faIcon={faTrash}
										iconColor={!hasCampaign && 'text-danger'}
										toolTipText={'Remove'}
										onClick={() => {
											!hasCampaign && onRemoveEditTaggingConfiguration(params.data.taggingConfigurationName);
										}}
									/>
								</div>
							</div>
						</ButtonGroup>
					) : null}
				</>
			),
		},
	];

	const openSegment = (id: any) => {
		window.open('/player-management/segment/view/' + id, '_blank');
	};

	const initialValues = {
		campaignSettingId: 0,
		campaignSettingName: '',
		campaignSettingDescription: '',
		settingTypeId: '',
		isActive: 0,
		campaignSettingTypeId: 0,
		goalParameterAmountId: 0,
		goalParameterCountId: 0,

		taggingConfigurationList: Array<TaggingConfigurationModel>(),
		userTaggingList: Array<UserTaggingModel>(),
		campaignDetailsList: Array<CampaignPeriodDetailsModel>(),
		createdBy: 0,
		createdDate: '',
		updatedBy: 0,
		updatedDate: '',
	};

	//  BEGIN: METHODS
	const onOpentTaggingConfigurationDetails = (data: TaggingConfigurationModel, action: any) => {
		setActionTitle(action);
		setModalShow(true);
		setShowHeader(true);
		setModalAction(action);
		setModalSize(LARGE);
		setSelectedConfiguration(data);
	};

	const onRemoveEditTaggingConfiguration = (name: string) => {
		swal({
			title: 'Confirmation',
			text: 'Auto Tagging Configuration will be removed from the setting, please confirm',
			icon: 'warning',
			buttons: ['No', 'Yes'],
			dangerMode: true,
		}).then((willClose) => {
			if (willClose) {
				//Recompute Id range number
				const filtered = getTaggingConfigListState
					.filter((p) => p.taggingConfigurationName != name)
					.sort((s: any, t: any) => {
						return parseInt(s.priorityNumber) - parseInt(t.priorityNumber);
					});
				let indx = 1;
				let addTaggingConfigList = Array<AddTaggingConfigurationModel>();
				filtered?.forEach((item: TaggingConfigurationModel) => {
					const tempOption: AddTaggingConfigurationModel = {
						taggingConfigurationId: item.taggingConfigurationId,
						taggingConfigurationName: item.taggingConfigurationName,
						campaignSettingId: paramCampaignSettingId,
						segmentName: item.segmentName,
						priorityNumber: indx++,
						segmentId: item.segmentId,
						createdBy: userAccessId,
						createdDate: item.createdDate,
						updatedBy: userAccessId,
						updatedDate: item.updatedDate,
					};
					addTaggingConfigList.push(tempOption);
				});

				dispatch(campaignSetting.actions.getTaggingConfigByList(addTaggingConfigList));

				const filteredUsers = getUsersConfigByListState.filter((u) => u.taggingConfigurationName != name);
				dispatch(campaignSetting.actions.getUsersConfigByList(filteredUsers));
			}
		});
	};

	//  WATCHERS
	const onGridReady = (params: any) => {
		params.api.sizeColumnsToFit();
		setTaggingConfigurationList(getTaggingConfigListState);
	};

	useEffect(() => {
		if (autoTaggingDetails != undefined) {
			formik.setFieldValue('isActive', autoTaggingDetails.isActive);
			formik.setFieldValue('campaignSettingName', autoTaggingDetails.campaignSettingName);
			formik.setFieldValue('campaignSettingDescription', autoTaggingDetails.campaignSettingDescription);
		}

		dispatch(campaignSetting.actions.getAutoTaggingDetailsById(autoTaggingDetails!));
	}, [autoTaggingDetails]);

	let selectedId: string = '';

	const clearStates = () => {
		dispatch(campaignSetting.actions.getTaggingConfigByList([]));
		dispatch(campaignSetting.actions.getUsersConfigByList([]));
	};

	useEffect(() => {
		clearStates();
		getSelectedAutoTaggingDetails(paramCampaignSettingId);

		return () => {
			window.onbeforeunload = function (_event) {
				return;
			};
		};
	}, []);

	useEffect(() => {
		if (history) {
			history.block((prompt: any) => {
				if (!prompt.pathname.includes('view')) {
					outsideRedirectPage(prompt.pathname);
					return false;
				}
			});
		} else {
			history.block(() => {});
		}
		return () => {
			history.block(() => {});
		};
	}, [history]);

	window.onbeforeunload = confirmExit;

	function confirmExit() {
		return true;
	}

	

	const outsideRedirectPage = (promptNamePath: any) => {
		swal({
			title: 'Confirmation',
			text: 'Any changes will be discarded, please confirm',
			icon: 'warning',
			buttons: ['No', 'Yes'],
			dangerMode: true,
		}).then((willSave) => {
			if (willSave) {
				history.block(() => {});
				history.push(promptNamePath);
			}
		});
	};

	const formik = useFormik({
		initialValues,
		onSubmit: (values, {setSubmitting}) => {
			values.taggingConfigurationList = taggingConfigurationList;

			initialValues.campaignSettingId = values.campaignSettingId;
			initialValues.campaignSettingName = values.campaignSettingName;
			initialValues.isActive = values.isActive;

			setLoading(true);
			setTimeout(() => {
				//validations
				if (
					!formik.values.campaignSettingName ||
					!formik.values.campaignSettingDescription ||
					!filterSettingStatus?.value ||
					getTaggingConfigListState.length == 0
				) {
					swal('Failed', 'Unable to proceed, kindly fill up all mandatory fields', 'error');
					setSubmitting(false);
				} else {
					checkCampaignSettingByNameIfExist({
						campaignSettingName: values.campaignSettingName,
						campaignSettingTypeId: CampaignSettingTypes.autoTaggingSettingTypeId,
						campaignSettingId: paramCampaignSettingId,
					})
						.then((response) => {
							if (response.status === successResponse) {
								let result = response.data;
								if (result === true) {
									swal('Failed', 'Unable to record, the Setting Name is already exist', 'error');
								} else {
									swal({
										title: 'Confirmation',
										text: 'This action will update the setting data and configuration, please confirm',
										icon: 'warning',
										buttons: ['No', 'Yes'],
										dangerMode: true,
									}).then((willUpdateEdit) => {
										if (willUpdateEdit) {
											setSubmitting(true);
											onSaveAutoTaggingDetails(values);
										}
									});
								}
							} else {
								swal('Failed', 'Connection error Please close the form and try again 1', 'error');
							}
						})
						.catch(() => {
							swal('Failed', 'Connection error Please close the form and try again 2', 'error');
						});
				}
				setSubmitting(false);
				setLoading(false);
			}, 1000);
		},
	});

	const addNew = () => {
		setModalShow(true);
		setShowHeader(true);
		setModalAction(ADD);
		setModalSize(LARGE);
	};

	useEffect(() => {
		setDisablePriority(getTaggingConfigListState.length > 1 ? false : true);
		setDisableAdd(getTaggingConfigListState.length === MAX_CONFIG_TAG ? true : false);
	}, [getTaggingConfigListState]);

	const openPriorityModal = () => {
		setShowHeader(false);
		setModalSize(MEDIUM);
		setModalPriorityShow(true);
	};

	const onChangeSettingStatus = (data: LookupModel) => {
		if (data) {
			setFilterSettingStatus(data);
		}
	};

	const onSaveAutoTaggingDetails = (data: any) => {
		const messagingHubCon = hubConnection.createHubConnenction();
		//  BUILD DATA FOR TAGGING CONFIG
		let addTaggingConfigList = Array<AddTaggingConfigurationModel>();

		getTaggingConfigListState?.forEach((item: TaggingConfigurationModel) => {
			const tempOption: AddTaggingConfigurationModel = {
				taggingConfigurationId: item.taggingConfigurationId,
				taggingConfigurationName: item.taggingConfigurationName,
				campaignSettingId: paramCampaignSettingId,
				segmentName: item.segmentName,
				priorityNumber: item.priorityNumber,
				segmentId: item.segmentId,
				createdBy: userAccessId,
				createdDate: item.createdDate,
				updatedBy: userAccessId,
				updatedDate: item.updatedDate,
			};
			addTaggingConfigList.push(tempOption);
		});

		//  BUILD DATA FOR USER TAGGING CONFIG
		let addUserConfigList = Array<AddUserTaggingModel>();

		getUsersConfigByListState?.forEach((item: UserTaggingModel) => {
			const tempOption: AddUserTaggingModel = {
				userTaggingId: item.taggedUserId != null ? item.taggedUserId : item.userId,
				taggingConfigurationId: item.taggingConfigurationId,
				taggingConfigurationName: item.taggingConfigurationName,
				taggedUserName: item.taggedUserName,
				userId: item.taggedUserId != null ? item.taggedUserId : item.userId,
				createdBy: userAccessId,
				updatedBy: userAccessId,
			};
			addUserConfigList.push(tempOption);
		});

		const request: AddUpdateAutoTaggingRequestModel = {
			campaignSettingId: paramCampaignSettingId,
			campaignSettingName: data.campaignSettingName.trim(),
			campaignSettingDescription: data.campaignSettingDescription,
			settingTypeId: undefined,
			isActive: filterSettingStatus?.value != undefined ? parseInt(filterSettingStatus?.value) : undefined,
			campaignSettingTypeId: CampaignSettingTypes.autoTaggingSettingTypeId,
			goalParameterAmountId: goalParameterAmountId,
			goalParameterCountId: goalParameterCountId,
			queueId: Guid.create().toString(),
			userId: userAccessId.toString(),

			taggingConfigurationList: addTaggingConfigList,
			userTaggingList: addUserConfigList,
			createdDate:
				autoTaggingDetails?.createdDate != undefined || autoTaggingDetails?.createdDate != ''
					? autoTaggingDetails?.createdDate
					: new Date().toISOString().slice(0, 10).toString(),
			createdBy: userAccessId,
			updatedBy: userAccessId,
		};

		messagingHubCon.start().then(() => {
			if (messagingHubCon.state === HubConnected) {
				saveAutoTaggingDetails(request).then((response) => {
					if (response.status === successResponse) {
						messagingHubCon.on(request.queueId.toString(), (message) => {
							saveAutoTaggingDetailsResult(message.cacheId)
								.then((returnData) => {
									if (response.status !== successResponse) {
										swal('Failed', 'Error Saving Auto Tagging Details', 'error');
									} else {
										messagingHubCon.off(request.queueId.toString());
										messagingHubCon.stop();
										swal('Successful!', 'The data has been submitted', 'success');

										redirection(paramCampaignSettingId);
									}
								})
								.catch(() => {
									swal('Failed', 'saveAutoTaggingDetailsResult', 'error');
								});
						});
					} else {
						swal('Failed', response.data.message, 'error');
					}
				});
			}
		});
	};

	const getSelectedAutoTaggingDetails = (id: number) => {
		enableSplashScreen();
		setTimeout(() => {
			messagingHub.start().then(() => {
				const request: AutoTaggingDetailsByIdRequestModel = {
					campaignSettingId: id,
					campaignSettingTypeId: CampaignSettingTypes.autoTaggingSettingTypeId, //FIXED for auto tagging Details
					userId: userAccessId.toString(),
					queueId: Guid.create().toString(),
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
									setTaggingConfigurationList(data.taggingConfigurationList);
									setTaggedUserList(data.userTaggingList);
									setCampaignDetailsList(data.campaignPeriodList);
									setGoalParameterAmountId(data.goalParameterAmountId);
									setGoalParameterCountId(data.goalParameterCountId);
									setSelectedUsers(data.userTaggingList);
									setFilterSettingStatus(data.isActive == 1 ? {value: '1', label: 'Active'} : {value: '0', label: 'Inactive'});

									setHasCampaign(data.campaignPeriodList.length > 0 ? true : false);

									dispatch(campaignSetting.actions.getAutoTaggingDetailsById(data));

									let feedbackData = Object.assign(new Array<TaggingConfigurationModel>(), data.taggingConfigurationList);
									dispatch(campaignSetting.actions.getTaggingConfigByList(feedbackData));

									let usersData = Object.assign(new Array<UserTaggingModel>(), data.userTaggingList);
									dispatch(campaignSetting.actions.getUsersConfigByList(data.userTaggingList));

									messagingHub.off(request.queueId.toString());
									messagingHub.stop();
									disableSplashScreen();

									setLoading(false);
								}
							})
							.catch(() => {
								setLoading(false);
							});
						messagingHub.off(request.queueId.toString());
						messagingHub.stop();
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

	const redirection = (id: any) => {
		history.push('/campaign-management/campaign-setting/view-auto-tagging/' + id);
	};

	// Local pagination methods
	const onEditPaginationChanged = useCallback(() => {
		if (gridRefEdit.current.api) {
			//new implem
			setGridPageSize(gridRefEdit.current.api.paginationGetPageSize());
			setGridCurrentPage(gridRefEdit.current.api.paginationGetCurrentPage() + 1);
			setGridTotalPages(gridRefEdit.current.api.paginationGetTotalPages());
		}
	}, []);

	//  View
	return (
		<form className='form w-100' onSubmit={formik.handleSubmit}>
			<div className='card card-custom'>
				<div
					className='card-header cursor-pointer'
					role='button'
					data-bs-toggle='collapse'
					data-bs-target='#kt_account_deactivate'
					aria-expanded='true'
					aria-controls='kt_account_deactivate'
				>
					<div className='card-title m-0'>
						<h5 className='fw-bolder m-0'>Edit Auto Tagging Setting</h5>
					</div>
				</div>
				<div className='card-body p-9'>
					<FormGroupContainer>
						<div className='form-group col-md-3 mb-5'>
							<label className='form-label '>Setting Name</label>
							<input
								type='text'
								className='form-control form-control-sm'
								aria-label={'Setting Name'}
								autoComplete='off'
								disabled={hasCampaign || !userAccess.includes(USER_CLAIMS.UpdateAutoTaggingWrite)}
								{...formik.getFieldProps('campaignSettingName')}
							/>
						</div>
						<div className='form-group col-md-4 mb-5'>
							<label className='form-label'>Setting Description</label>
							<input
								type='text'
								className='form-control form-control-sm'
								autoComplete='off'
								aria-label={'Setting Description'}
								disabled={hasCampaign || !userAccess.includes(USER_CLAIMS.UpdateAutoTaggingWrite)}
								{...formik.getFieldProps('campaignSettingDescription')}
							/>
						</div>
						<div className='form-group col-md-2 mb-5'>
							<label className='form-label'>Setting Status</label>
							<Select
								size='small'
								style={{width: '100%'}}
								options={CommonLookups('settingStatuses')}
								onChange={onChangeSettingStatus}
								isDisabled={hasCampaign || !userAccess.includes(USER_CLAIMS.UpdateAutoTaggingWrite)}
								value={filterSettingStatus}
							/>
						</div>
					</FormGroupContainer>
					<FormGroupContainer>
						<div className='form-group mt-10 col-md-3 mb-5'>
							<label className='form-label '>Created Date</label>
							<p className='form-label  fw-bolder'>
								{useFormattedDate(autoTaggingDetails && autoTaggingDetails.createdDate ? autoTaggingDetails.createdDate : '')}
							</p>
						</div>
						<div className='form-group mt-10 col-md-3 mb-5'>
							<label className='form-label '>Created By</label>
							<p className='form-label fw-bolder'>{autoTaggingDetails?.createdBy}</p>
						</div>
						<div className='form-group mt-10 col-md-3 mb-5'>
							<label className='form-label '>Last Modified Date</label>
							<p className='form-label fw-bolder'>
								{' '}
								{useFormattedDate(autoTaggingDetails && autoTaggingDetails.updatedDate ? autoTaggingDetails.updatedDate : '')}
							</p>
						</div>
						<div className='form-group mt-10 col-md-3 mb-5'>
							<label className='form-label  '>Last Modified By</label>
							<p className='form-label fw-bolder'>{autoTaggingDetails?.updatedBy}</p>
						</div>
					</FormGroupContainer>

					<div className='separator border-1 my-10' />
					<div className='row mb-3'>
						<h6 className='fw-bolder m-0'>Configuration</h6>
					</div>
					

					<FormGroupContainer>
							<div className='ag-theme-quartz mb-13' style={{height: 350, width: '100%'}}>
								<AgGridReact
									rowData={getTaggingConfigListState}
									defaultColDef={{
										sortable: true,
										resizable: true,
									}}
									onGridReady={onGridReady}
									rowBuffer={0}
									enableRangeSelection={true}
									onPaginationChanged={onEditPaginationChanged}
									columnDefs={columnDefs}
									ref={gridRefEdit}
									paginationPageSize={gridPageSize}
									pagination={true}
									suppressPaginationPanel={true}
									suppressScrollOnNewData={true}
								/>
								<LocalGridPagination
									setGridPageSize={setGridPageSize}
									recordCount={getTaggingConfigListState.length}
									gridCurrentPage={gridCurrentPage}
									gridPageSize={gridPageSize}
									gridTotalPages={gridTotalPages}
									gridRef={gridRefEdit}
									customId={customPageSizeElementId} //page-size-create-subtopic | optional, for page that has more than one grid with page size selection
								/>
							</div>
						</FormGroupContainer>
						
					<div className='d-flex my-6'>
						<BorderedButton
							isDisabled={hasCampaign || disableAdd ? true : false}
							access={userAccess.includes(USER_CLAIMS.UpdateAutoTaggingWrite)}
							title={'Add New'}
							onClick={() => {
								addNew();
							}}
							isColored={true}
						/>
						<BorderedButton
							isDisabled={hasCampaign}
							access={userAccess.includes(USER_CLAIMS.UpdateAutoTaggingWrite)}
							title={'Change Priority'}
							onClick={() => {
								openPriorityModal();
							}}
							isColored={true}
						/>
					</div>

					{campaignDetailsList.length != 0 && <CampaignList campaignPeriodList={campaignDetailsList} />}

					<div className='separator border-1 my-5' />

					<div className='d-flex my-4'>
						<LoaderButton
							access={userAccess.includes(USER_CLAIMS.UpdateAutoTaggingWrite)}
							loading={formik.isSubmitting}
							title={'Submit'}
							loadingTitle={' Please wait... '}
							disabled={formik.isSubmitting || hasCampaign}
						/>

						<DefaultSecondaryButton
							access={userAccess.includes(USER_CLAIMS.UpdateAutoTaggingRead)}
							title={'Back'}
							onClick={() => {
								outsideRedirectPage('/campaign-management/campaign-setting/auto-tagging');
							}}
							isDisable={false}
						/>
					</div>
				</div>
			</div>

			{/* modal for add auto tagging */}
			<AutoTaggingConfigurationModal
				actionTitle={actionTitle}
				modalData={selectedConfiguration}
				subModalData={selectedUsers}
				showForm={modalShow}
				closeModal={() => setModalShow(false)}
				showHeader={showHeader}
				modalAction={modalAction}
				modalSize={modalSize}
			/>
			{/* end modal for auto tagging */}
			<AutoTaggingPriority showForm={modalPriorityShow} closeModal={() => setModalPriorityShow(false)} modalAction={modalAction} />
		</form>
	);
};

export default EditAutoTagging;

import {faPencilAlt, faTrash} from '@fortawesome/free-solid-svg-icons';
import {AgGridReact} from 'ag-grid-react';
import 'datatables.net';
import 'datatables.net-dt';
import {useFormik} from 'formik';
import {Guid} from 'guid-typescript';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {ButtonGroup} from 'react-bootstrap-v5';
import {shallowEqual, useDispatch, useSelector} from 'react-redux';
import {useHistory, useLocation} from 'react-router-dom';
import Select from 'react-select';
import swal from 'sweetalert';
import * as Yup from 'yup';
import {RootState} from '../../../../../setup';
import * as hubConnection from '../../../../../setup/hub/MessagingHub';
import {LookupModel} from '../../../../common/model/LookupModel';
import useConstant from '../../../../constants/useConstant';
import {
	BorderedButton,
	ContentContainer,
	DefaultSecondaryButton,
	FormContainer,
	FormGroupContainer,
	FormHeader,
	LoaderButton,
	LocalGridPagination,
	MainContainer,
	TableIconButton,
} from '../../../../custom-components';
import CommonLookups from '../../../../custom-functions/CommonLookups';
import {USER_CLAIMS} from '../../../user-management/components/constants/UserClaims';
import useCampaignSettingConstant from '../../constants/useCampaignSettingConstant';
import * as campaignSetting from '../../redux/AutoTaggingRedux';
//service
import {
	checkCampaignSettingByNameIfExist,
	getAutoTaggingDetailsById,
	getAutoTaggingDetailsByIdResult,
	saveAutoTaggingDetails,
	saveAutoTaggingDetailsResult,
} from '../../redux/AutoTaggingService';
import {CampaignSettingListResponseModel} from '../../setting-point-incentive/models/response/CampaignSettingListResponseModel';
import AutoTaggingConfigurationModal from '../components/AutoTaggingConfigurationModal';
import {CampaignPeriodDetailsModel} from '../models/CampaignPeriodDetailsModel';
import {AddTaggingConfigurationModel} from '../models/request/AddTaggingConfigurationModel';
import {AddUpdateAutoTaggingRequestModel} from '../models/request/AddUpdateAutoTaggingRequestModel';
import {AddUserTaggingModel} from '../models/request/AddUserTaggingModel';
import {AutoTaggingDetailsByIdRequestModel} from '../models/request/AutoTaggingDetailsByIdRequestModel';
import {AutoTaggingDetailsByIdResponseModel} from '../models/response/AutoTaggingDetailsByIdResponseModel';
import {TaggingConfigurationModel} from '../models/TaggingConfigurationModel';
import {UserTaggingModel} from '../models/UserTaggingModel';
import AutoTaggingPriority from './AutoTaggingPriority';
import { ColDef, ColGroupDef } from 'ag-grid-community';

interface FormValues {
	configurationName: string;
	segmentName: string;
	selectedUsers: string;
}

const initialValues = {
	campaignSettingId: 0,
	campaignSettingName: '',
	campaignSettingDescription: '',
	settingTypeId: 0,
	isActive: 0,
	campaignSettingTypeId: 43,
	goalParameterAmountId: 0,
	goalParameterCountId: 0,

	taggingConfigurationList: Array<TaggingConfigurationModel>(),
	userTaggingList: Array<UserTaggingModel>(),
	createdBy: '',
	createdDate: '',
	updatedBy: '',
	updatedDate: '',
};

const useQuery = () => {
	const {search} = useLocation();

	return React.useMemo(() => new URLSearchParams(search), [search]);
};

const taggingSchema = Yup.object().shape({
	campaignSettingName: Yup.string().required(),
	campaignSettingDescription: Yup.string().required(),
	isActive: Yup.boolean().required(),
});

const AddAutoTagging: React.FC = () => {
	//  Get redux store
	const userAccessId = useSelector<RootState>(({auth}) => auth.userId, shallowEqual) as number;
	const userAccess = useSelector<RootState>(({auth}) => auth.access, shallowEqual) as string;
	const history = useHistory();
	const messagingHub = hubConnection.createHubConnenction();

	const autoTaggingDetailsByIdState = useSelector<RootState>(
		({campaignSetting}) => campaignSetting.getAutoTaggingDetailsById,
		shallowEqual
	) as AutoTaggingDetailsByIdResponseModel;

	const campaignSettingListState = useSelector<RootState>(
		({campaignSetting}) => campaignSetting.getCampaignSettingList,
		shallowEqual
	) as CampaignSettingListResponseModel[];

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
	const {CampaignSettingTypes, LARGE, EDIT, ADD, MAX_CONFIG_TAG} = useCampaignSettingConstant();

	//  State
	let query = useQuery();
	let isClone: boolean = query.get('action') == 'clone' ? true : false;
	const dispatch = useDispatch();

	const [loading, setLoading] = useState(false);
	const [modalShow, setModalShow] = useState<boolean>(false);
	const [showHeader, setShowHeader] = useState(false);
	const [modalAction, setModalAction] = useState('');
	const [modalSize, setModalSize] = useState(LARGE);
	const [selectedConfiguration, setSelectedConfiguration] = useState<TaggingConfigurationModel>();
	const [modalPriorityShow, setModalPriorityShow] = useState<boolean>(false);
	const [disableAdd, setDisableAdd] = useState<boolean>(false);
	const [disablePriority, setDisablePriority] = useState<boolean>(false);
	const [isFormDisable, setIsFormDisable] = useState<boolean>(true);
	const [campaignDetailsList, setCampaignDetailsList] = useState<Array<CampaignPeriodDetailsModel>>([]);
	const [autoTaggingDetails, setAutoTaggingDetails] = useState<AutoTaggingDetailsByIdResponseModel>();
	const [taggingConfigurationList, setTaggingConfigurationList] = useState<Array<TaggingConfigurationModel>>([]);
	const [taggedUserList, setTaggedUserList] = useState<Array<AddUserTaggingModel>>([]);
	const [goalParameterAmountId, setGoalParameterAmountId] = useState(0);
	const [goalParameterCountId, setGoalParameterCountId] = useState(0);
	const [selectedUsers, setSelectedUsers] = useState<Array<UserTaggingModel>>([]);
	const [filterSettingStatus, setFilterSettingStatus] = useState<LookupModel | null>();

	//	Pagination
	const customPageSizeElementId = 'add-auto-tagging';
	const [gridPageSize, setGridPageSize] = useState<number>(10);
	const [gridTotalPages, setGridTotalPages] = useState<number>(1);
	const [gridCurrentPage, setGridCurrentPage] = useState<number>(1);
	const gridRef: any = useRef();

	//   GRID DETAILS
	const columnDefs : (ColDef<TaggingConfigurationModel> | ColGroupDef<TaggingConfigurationModel>)[] = [
		{headerName: 'Priority', field: 'priorityNumber', sort: 'asc' as 'asc'},
		{
			headerName: 'Configuration Name',
			field: 'taggingConfigurationName',
			minWidth: 500,
			cellRenderer: (params: any) => (
				<>
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
							<div className='d-flex justify-content-center flex-shrink-0 shadow-none segment-name'>
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
					<ButtonGroup aria-label='Basic example'>
						<div className='d-flex justify-content-center flex-shrink-0 btn-link'>
							<div className='me-4'>
								<TableIconButton
									access={userAccess.includes(USER_CLAIMS.UpdateAutoTaggingWrite)}
									faIcon={faPencilAlt}
									toolTipText={EDIT}
									onClick={() => {
										onOpentTaggingConfigurationDetails(params.data, EDIT);
									}}
								/>
							</div>
							<div className='me-4'>
								<TableIconButton
									access={userAccess.includes(USER_CLAIMS.UpdateAutoTaggingWrite)}
									faIcon={faTrash}
									iconColor={'text-danger'}
									toolTipText={'Remove'}
									onClick={() => {
										onRemoveTaggingConfiguration(params.data.taggingConfigurationName);
									}}
								/>
							</div>
						</div>
					</ButtonGroup>
				</>
			),
		},
	];

	

	const onRemoveTaggingConfiguration = (name: string) => {
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
						taggingConfigurationId: 0,
						taggingConfigurationName: item.taggingConfigurationName,
						campaignSettingId: 0,
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

	const onOpentTaggingConfigurationDetails = (data: TaggingConfigurationModel, action: any) => {
		setModalShow(true);
		setShowHeader(true);
		setModalAction(action);
		setModalSize(LARGE);
		setSelectedConfiguration(data);
	};

	//  BEGIN: METHODS

	useEffect(() => {
		if (history) {
			history.block((prompt: any) => {
				if (!prompt.pathname.includes('view')) {
					outsideRedirectPage(prompt.pathname);
					return false;
				}
			});
		}
	}, [history]);

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

	const openSegment = (id: any) => {
		window.open('/player-management/segment/view/' + id, '_blank');
	};

	const redirection = (id: any) => {
		history.push('/campaign-management/campaign-setting/view-auto-tagging/' + id);
	};

	useEffect(() => {
		if (isClone && (query.get('id') != '0' || query.get('id') != null)) {
			getSelectedAutoTaggingDetails(Number(query.get('id')));
		} else {
			clearData();
		}

		return () => {
			window.onbeforeunload = function (_event) {
				return;
			};
		};
	}, []);

	window.onbeforeunload = confirmExit;

	function confirmExit() {
		return true;
	}

	useEffect(() => {
		setDisablePriority(getTaggingConfigListState.length > 1 ? false : true);
		setDisableAdd(getTaggingConfigListState.length === MAX_CONFIG_TAG ? true : false);

		return () => {
			window.onbeforeunload = function (_event) {
				return;
			};
		};
	}, [getTaggingConfigListState]);

	useEffect(() => {
		if (autoTaggingDetails != undefined) {
			setFilterSettingStatus(autoTaggingDetails.isActive === 1 ? {value: '1', label: 'Active'} : {value: '0', label: 'Inactive'});
			formik.setFieldValue('isActive', autoTaggingDetails.isActive);
			formik.setFieldValue('campaignSettingDescription', autoTaggingDetails.campaignSettingDescription);
		}
		dispatch(campaignSetting.actions.getAutoTaggingDetailsById(autoTaggingDetails!));
	}, [autoTaggingDetails]);

	const onChangeSettingStatus = (data: LookupModel) => {
		if (data) {
			setFilterSettingStatus(data);
		}
	};

	//  WATCHERS
	const onGridReady = (params: any) => {
		params.api.sizeColumnsToFit();
	};

	const clearData = () => {
		dispatch(campaignSetting.actions.getTaggingConfigByList([]));
		dispatch(campaignSetting.actions.getUsersConfigByList([]));
		dispatch(campaignSetting.actions.getAutoTaggingDetailsById(initialValues));
	};

	const openPriorityModal = () => {
		setModalPriorityShow(true);
	};

	const formik = useFormik({
		initialValues,
		onSubmit: (values, {setStatus, setSubmitting, resetForm}) => {
			setTimeout(() => {
				//validations
				let isValid = true;
				if (
					!formik.values.campaignSettingName ||
					!formik.values.campaignSettingDescription ||
					!filterSettingStatus?.value ||
					getTaggingConfigListState.length == 0
				) {
					swal('Failed', 'Unable to proceed, kindly fill up all mandatory fields', 'error');
					setSubmitting(false);
					setIsFormDisable(false);
					isValid = false;
				} else {
					checkCampaignSettingByNameIfExist({
						campaignSettingName: values.campaignSettingName,
						campaignSettingTypeId: CampaignSettingTypes.autoTaggingSettingTypeId,
					})
						.then((response) => {
							if (response.status === successResponse) {
								let result = response.data;
								if (result === true) {
									swal('Failed', 'Unable to record, the Setting Name is already exist', 'error');
								} else {
									swal({
										title: 'Confirmation',
										icon: 'warning',
										text: 'This action will update the setting data and configuration, please confirm',
										buttons: ['No', 'Yes'],
										dangerMode: true,
									}).then((willUpdate) => {
										if (willUpdate) {
											onSaveAutoTaggingDetails(values);
											setSubmitting(true);
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

	const openAddConfig = () => {
		setModalShow(true);
		setShowHeader(true);
		setModalAction(ADD);
		setModalSize(LARGE);
	};

	const getSelectedAutoTaggingDetails = (id: number) => {
		setTimeout(() => {
			messagingHub.start().then(() => {
				const requestAutoTag: AutoTaggingDetailsByIdRequestModel = {
					campaignSettingId: id,
					campaignSettingTypeId: CampaignSettingTypes.autoTaggingSettingTypeId, //FIXED for auto tagging Details
					userId: userAccessId.toString(),
					queueId: Guid.create().toString(),
				};
				getAutoTaggingDetailsById(requestAutoTag).then((response) => {
					messagingHub.on(requestAutoTag.queueId.toString(), (message) => {
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
									setGoalParameterAmountId(data.goalParameterAmountId);
									setGoalParameterCountId(data.goalParameterCountId);
									setCampaignDetailsList(data.campaignPeriodList);
									setSelectedUsers(data.userTaggingList);
									setDisableAdd(data.taggingConfigurationList.length > MAX_CONFIG_TAG ? true : false);
									setDisablePriority(data.taggingConfigurationList.length == 0 ? true : false);

									setFilterSettingStatus(data.isActive === 1 ? {value: '1', label: 'Active'} : {value: '0', label: 'Inactive'});
									dispatch(campaignSetting.actions.getAutoTaggingDetailsById(data));

									let feedbackData = Object.assign(new Array<TaggingConfigurationModel>(), data.taggingConfigurationList);
									dispatch(campaignSetting.actions.getTaggingConfigByList(feedbackData));

									let usersData = Object.assign(new Array<UserTaggingModel>(), data.userTaggingList);
									dispatch(campaignSetting.actions.getUsersConfigByList(data.userTaggingList));

									messagingHub.off(requestAutoTag.queueId.toString());
									messagingHub.stop();

									setLoading(false);
								}
							})
							.catch(() => {
								setLoading(false);
							});
						messagingHub.off(requestAutoTag.queueId.toString());
						messagingHub.stop();
					});

					setTimeout(() => {
						if (messagingHub.state === HubConnected) {
							messagingHub.stop();
							setLoading(false);
						}
					}, 30000);
				});
			});
		}, 1000);
	};

	const onSaveAutoTaggingDetails = (data: any) => {
		const messagingHub = hubConnection.createHubConnenction();

		//  BUILD DATA FOR TAGGING CONFIG
		let addTaggingConfigList = Array<AddTaggingConfigurationModel>();

		getTaggingConfigListState?.forEach((item: TaggingConfigurationModel) => {
			const tempOption: AddTaggingConfigurationModel = {
				taggingConfigurationId: 0,
				taggingConfigurationName: item.taggingConfigurationName,
				campaignSettingId: 0,
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
				userTaggingId: item.userId != undefined ? item.userId : item.taggedUserId,
				taggingConfigurationId: 0,
				taggingConfigurationName: item.taggingConfigurationName,
				taggedUserName: item.taggedUserName,
				userId: item.userId != undefined ? item.userId : item.taggedUserId,
				createdBy: userAccessId,
				updatedBy: userAccessId,
			};
			addUserConfigList.push(tempOption);
		});

		const request: AddUpdateAutoTaggingRequestModel = {
			campaignSettingId: 0,
			campaignSettingName: data.campaignSettingName.trim(),
			campaignSettingDescription: data.campaignSettingDescription,
			settingTypeId: undefined,
			isActive: filterSettingStatus?.value != undefined ? parseInt(filterSettingStatus?.value) : undefined,
			campaignSettingTypeId: CampaignSettingTypes.autoTaggingSettingTypeId,
			goalParameterAmountId: 0,
			goalParameterCountId: 0,
			queueId: Guid.create().toString(),
			userId: userAccessId.toString(),

			taggingConfigurationList: addTaggingConfigList,
			userTaggingList: addUserConfigList,
			createdDate: new Date().toISOString().slice(0, 10).toString(),
			createdBy: userAccessId,
			updatedBy: userAccessId,
		};

		messagingHub.start().then(() => {
			if (messagingHub.state === HubConnected) {
				saveAutoTaggingDetails(request).then((response) => {
					if (response.status === successResponse) {
						messagingHub.on(request.queueId.toString(), (message) => {
							const resultData = JSON.parse(message.remarks);
							const latestCampaignSettingId = resultData.Data;
							saveAutoTaggingDetailsResult(message.cacheId)
								.then((returnData) => {
									if (response.status !== successResponse) {
										swal('Failed', 'Error Saving Auto Tagging Details', 'error');
									} else {
										messagingHub.off(request.queueId.toString());
										messagingHub.stop();
										swal('Successful!', 'The data has been submitted', 'success');

										redirection(latestCampaignSettingId);
										clearData();
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

	// Local pagination methods
	const onAddPaginationChanged = useCallback(() => {
		if (gridRef.current.api) {
			//new implem
			setGridPageSize(gridRef.current.api.paginationGetPageSize());
			setGridTotalPages(gridRef.current.api.paginationGetTotalPages());
			setGridCurrentPage(gridRef.current.api.paginationGetCurrentPage() + 1);
		}
	}, []);
	
	//  View
	return (
		<FormContainer onSubmit={formik.handleSubmit}>
			<MainContainer>
				<FormHeader headerLabel={'Add Auto Tagging Setting'} />

				<ContentContainer>
					<FormGroupContainer>
						<div className='form-group col-md-3 mb-5 add-tagging'>
							<label className='form-label'>Setting Name</label>
							<input
								type='text'
								autoComplete='off'
								className='form-control form-control-sm'
								disabled={!userAccess.includes(USER_CLAIMS.UpdateAutoTaggingWrite)}
								{...formik.getFieldProps('campaignSettingName')}
							/>
						</div>
						<div className='form-group col-md-4 mb-5'>
							<label className='form-label'>Setting Description</label>
							<input
								type='text'
								autoComplete='off'
								className='form-control form-control-sm'
								disabled={!userAccess.includes(USER_CLAIMS.UpdateAutoTaggingWrite)}
								{...formik.getFieldProps('campaignSettingDescription')}
							/>
						</div>
						<div className='form-group col-md-2 mb-5'>
							<label className='form-label'>Setting Status</label>
							<Select
								size='small'
								autoComplete='off'
								style={{width: '100%'}}
								options={CommonLookups('settingStatuses')}
								onChange={onChangeSettingStatus}
								value={filterSettingStatus}
								isDisabled={!userAccess.includes(USER_CLAIMS.UpdateAutoTaggingWrite)}
							/>
						</div>
					</FormGroupContainer>
					<div className='separator border-1 my-10' />

					<div className='row mb-3 mt-5'>
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
									//enableRangeSelection={true} //deprecated in AgGridReactv32.0.0
									onPaginationChanged={onAddPaginationChanged}
									columnDefs={columnDefs}
									ref={gridRef}
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
									gridRef={gridRef}
									customId={customPageSizeElementId} //page-size-create-subtopic | optional, for page that has more than one grid with page size selection
								/>
							</div>
						</FormGroupContainer>


					<div className='d-flex my-6'>
						<BorderedButton
							access={userAccess.includes(USER_CLAIMS.UpdateAutoTaggingWrite)}
							title={'Add New'}
							onClick={() => {
								openAddConfig();
							}}
							isColored={true}
							isDisabled={disableAdd}
						/>
						<BorderedButton
							access={userAccess.includes(USER_CLAIMS.UpdateAutoTaggingWrite)}
							title={'Change Priority'}
							onClick={() => {
								openPriorityModal();
							}}
							isColored={true}
							isDisabled={disablePriority}
						/>
					</div>

					<div className='separator border-1 my-5' />

					<div className='d-flex my-4'>
						<LoaderButton
							access={userAccess.includes(USER_CLAIMS.UpdateAutoTaggingWrite)}
							loading={formik.isSubmitting}
							title={'Submit'}
							loadingTitle={' Please wait... '}
							disabled={formik.isSubmitting}
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
				</ContentContainer>
				{/* modal for add auto tagging */}
				<AutoTaggingConfigurationModal
					modalData={selectedConfiguration}
					subModalData={getUsersConfigByListState}
					showForm={modalShow}
					closeModal={() => setModalShow(false)}
					showHeader={showHeader}
					modalAction={modalAction}
					modalSize={modalSize}
				/>
				{/* end modal for auto tagging */}
				<AutoTaggingPriority showForm={modalPriorityShow} closeModal={() => setModalPriorityShow(false)} modalAction={modalAction} />
			</MainContainer>
		</FormContainer>
	);
};

export default AddAutoTagging;

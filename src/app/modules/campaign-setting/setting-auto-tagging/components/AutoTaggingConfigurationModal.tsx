import {AgGridReact} from 'ag-grid-react';
import {useFormik} from 'formik';
import React, {useEffect, useState} from 'react';
import {ModalFooter} from 'react-bootstrap-v5';
import {shallowEqual, useDispatch, useSelector} from 'react-redux';
import Select from 'react-select';
import swal from 'sweetalert';
import {RootState} from '../../../../../setup';
import {
	ContentContainer,
	DefaultPrimaryButton,
	DefaultSecondaryButton,
	FormContainer,
	FormGroupContainer,
	FormModal,
	MainContainer,
} from '../../../../custom-components';
import {USER_CLAIMS} from '../../../user-management/components/constants/UserClaims';
import * as campaignSetting from '../../redux/AutoTaggingRedux';
import {getSegmentAutoTagging, getTaggingUsers} from '../../redux/AutoTaggingService';
import {DropdownModel} from '../models/DropdownModel';
import {SegmentSelectionModel} from '../models/SegmentSelectionModel';
import {TaggingConfigurationModel} from '../models/TaggingConfigurationModel';
import {UserSelectionModel} from '../models/UserSelectionModel';
import {UserTaggingModel} from '../models/UserTaggingModel';
import {AutoTaggingDetailsByIdResponseModel} from '../models/response/AutoTaggingDetailsByIdResponseModel';
import { ColDef, ColGroupDef } from 'ag-grid-community';

interface Props {
	showForm: boolean;
	closeModal: () => void;
	showHeader: boolean;
	modalAction: string;
	modalSize?: any;
	modalData?: TaggingConfigurationModel;
	subModalData?: Array<UserTaggingModel>;
	actionTitle?: any;
}

interface FormValues {
	priorityNumber: number;
	taggingConfigurationName: string;
	segmentName: string;
	selectedUsers: string;
}

const initialValues: FormValues = {
	priorityNumber: 0,
	taggingConfigurationName: '',
	segmentName: '',
	selectedUsers: '',
};

const AutoTaggingConfigurationModal: React.FC<Props> = ({
	showForm,
	closeModal,
	showHeader,
	modalAction,
	modalSize,
	modalData,
	subModalData,
	actionTitle,
}) => {
	//  Get redux store
	const userAccess = useSelector<RootState>(({auth}) => auth.access, shallowEqual) as string;
	const userAccessId = useSelector<RootState>(({auth}) => auth.userId, shallowEqual) as number;

	const autoTaggingDetailsByIdState = useSelector<RootState>(
		({campaignSetting}) => campaignSetting.getAutoTaggingDetailsById,
		shallowEqual
	) as AutoTaggingDetailsByIdResponseModel;

	const getTaggingConfigListState = useSelector<RootState>(
		({campaignSetting}) => campaignSetting.getTaggingConfigByList,
		shallowEqual
	) as TaggingConfigurationModel[];

	const getUsersConfigByListState = useSelector<RootState>(({campaignSetting}) => campaignSetting.getUsersConfigByList, shallowEqual) as any;

	const dispatch = useDispatch();

	// STATES
	const [loading, setLoading] = useState<boolean>(false);
	const [submitDisable, setSubmitDisable] = useState<boolean>(true);
	const [isDisableForm, setIsDisableForm] = useState<boolean>(false);
	const [rowData, setRowData] = useState<Array<UserTaggingModel>>([]);
	const [filterConfigurationName, setFilterConfigurationName] = useState('');
	const [filterSegmentName, setFilterSegmentName] = useState<string | any>('');
	const [filterSelectedUser, setFilterSelectedUser] = useState<string | any>('');
	const [customSizeVal, setCustomSizeval] = useState(modalSize);

	const [usersList, setUsersList] = useState<Array<DropdownModel>>([]);
	const [segmentList, setSegmentList] = useState<Array<DropdownModel>>([]);

	const [gridApi, setGridApi] = useState<any | null>(null);
	const [gridColumnApi, setGridColumnApi] = useState(null);

	const ADD = 'Add';
	const EDIT = 'Edit';
	const VIEW = 'View';
	const moduleAccessId = 21;

	const getActiveUserOptions = () => {
		getTaggingUsers(moduleAccessId)
			.then((response) => {
				if (response.status === 200) {
					let allUsers = Object.assign(new Array<UserSelectionModel>(), response.data);
					let usersTempList = Array<DropdownModel>();

					allUsers.forEach((item) => {
						const usersOption: DropdownModel = {
							value: item.userId.toString(),
							label: item.fullName,
						};
						usersTempList.push(usersOption);
					});
					setUsersList(usersTempList.filter((thing, i, arr) => arr.findIndex((t) => t.value === thing.value) === i));
				} else {
					console.log('Problem in active users list');
				}
			})
			.catch(() => {
				console.log('Problem in active users list');
			});
	};

	//  get segment details
	const getSegmentOptions = () => {
		getSegmentAutoTagging()
			.then((response) => {
				if (response.status === 200) {
					let allSegment = Object.assign(new Array<SegmentSelectionModel>(), response.data);
					let segmentTempList = Array<DropdownModel>();

					allSegment.forEach((item) => {
						const segmentOption: DropdownModel = {
							value: item.segmentId.toString(),
							label: item.segmentName,
						};
						segmentTempList.push(segmentOption);
					});
					setSegmentList(segmentTempList.filter((thing, i, arr) => arr.findIndex((t) => t.value === thing.value) === i));
				} else {
					console.log('Problem in getting segment list');
				}
			})
			.catch(() => {
				console.log('Problem in getting segment list');
			});
	};

	const clearData = () => {
		setFilterSegmentName({value: '', label: ''});
		setFilterSelectedUser([]);
		formik.setFieldValue('taggingConfigurationName', '');
		formik.setFieldValue('segmentName', '');
		setRowData([]);
	};

	const formik = useFormik({
		initialValues,
		onSubmit: (values, {setStatus, setSubmitting, resetForm}) => {
			//validations
			let isValid = true;
			if (!formik.values.taggingConfigurationName || filterSegmentName.value == '' || filterSelectedUser.length == 0) {
				swal('Failed', 'Unable to proceed, kindly fill up all mandatory fields', 'error');
				setSubmitting(false);
				isValid = false;
			}

			let highestPriority = Math.max(...getTaggingConfigListState.map((o: any) => o.priorityNumber));
			highestPriority = highestPriority > 0 ? highestPriority : 0;

			const isExist = getTaggingConfigListState.filter(
				(x) =>
					x.taggingConfigurationName.toLowerCase() === values.taggingConfigurationName.toLowerCase() && x.priorityNumber != modalData?.priorityNumber
			);

			if (isExist.length > 0) {
				swal('Failed', 'Unable to record, the Auto Tagging Configuration Name is already exist', 'error');
				setLoading(false);
				setSubmitting(false);
				isValid = false;
			}

			if (isValid) {
				if (modalAction == EDIT) {
					debugger
					//RESET DATA FOR TAGGING - DELETE/INSERT
					const newTagList = Object.assign(
						new Array<TaggingConfigurationModel>(),
						getTaggingConfigListState.filter((u) => u.taggingConfigurationName != modalData?.taggingConfigurationName)
					);
					dispatch(campaignSetting.actions.getTaggingConfigByList([]));

					// INSERT TAGGING UPDATE
					const newTaggingConfig: TaggingConfigurationModel = {
						taggingConfigurationId: modalData?.taggingConfigurationId != undefined ? modalData?.taggingConfigurationId : 0,
						taggingConfigurationName: values.taggingConfigurationName,
						campaignSettingId: autoTaggingDetailsByIdState != undefined ? autoTaggingDetailsByIdState.campaignSettingId : 0,
						segmentName: filterSegmentName.label,
						priorityNumber: modalData?.priorityNumber,
						segmentId: parseInt(filterSegmentName.value),

						createdDate: new Date().toISOString().slice(0, 10).toString(),
						updatedDate: new Date().toISOString().slice(0, 10).toString(),
					};
					dispatch(campaignSetting.actions.getTaggingConfigByList([...newTagList, newTaggingConfig]));

					//reset data for tags
					let updated = getUsersConfigByListState.filter((x: any) => x.taggingConfigurationName != modalData?.taggingConfigurationName);

					rowData.forEach((item: UserTaggingModel, index: any) => {
						const x: UserTaggingModel = {
							taggedUserId: item.taggedUserId != null ? item.taggedUserId : item.userId,
							taggingConfigurationId: modalData?.taggingConfigurationId != undefined ? modalData?.taggingConfigurationId : 0,
							taggedUserName: item.taggedUserName,
							taggingConfigurationName: values.taggingConfigurationName,
							userId: item.taggedUserId != null ? item.taggedUserId : item.userId,
						};
						updated.push(x);
					});
					const updatedUserList = Object.assign(new Array<UserTaggingModel>(), updated);
					dispatch(campaignSetting.actions.getUsersConfigByList(updatedUserList));
				
				} else {
					const newTaggingConfig: TaggingConfigurationModel = {
						taggingConfigurationId: 0,
						taggingConfigurationName: values.taggingConfigurationName,
						campaignSettingId: autoTaggingDetailsByIdState != undefined ? autoTaggingDetailsByIdState.campaignSettingId : 0,
						segmentName: filterSegmentName.label,
						priorityNumber: highestPriority + 1,
						segmentId: filterSegmentName.value,

						createdDate: new Date().toISOString().slice(0, 10).toString(),
						updatedDate: new Date().toISOString().slice(0, 10).toString(),
					};

					let newData = Object.assign(new Array<TaggingConfigurationModel>(), newTaggingConfig);
					dispatch(campaignSetting.actions.getTaggingConfigByList([...getTaggingConfigListState, newData]));

					//create new user tagging

					filterSelectedUser.forEach((item: DropdownModel, index: any) => {
						let x: UserTaggingModel = {
							taggedUserId: parseInt(item.value),
							taggingConfigurationId: 0,
							taggedUserName: item.label,
							taggingConfigurationName: values.taggingConfigurationName,
							userId: parseInt(item.value),
						};
						getUsersConfigByListState.push(x);
					});
					
					dispatch(campaignSetting.actions.getUsersConfigByList(getUsersConfigByListState));
				}

				closeModal();
			}
		},
	});

	//   GRID DETAILS
	const columnDefs : (ColDef<UserTaggingModel> | ColGroupDef<UserTaggingModel>)[] = [{headerName: 'User Name', field: 'taggedUserName'}];

	//  WATCHERS
	const onGridReady = (params: any) => {
		params.api.sizeColumnsToFit();

		if (modalAction == ADD) {
			clearData();
		}
	};

	useEffect(() => {
		getSegmentOptions();
		getActiveUserOptions();
	}, []);

	useEffect(() => {
		setIsDisableForm(actionTitle == VIEW || modalAction == VIEW ? true : false);

		if (modalData != undefined && showForm) {
			setFilterSegmentName({value: modalData.segmentId?.toString(), label: modalData.segmentName});
			formik.setFieldValue('taggingConfigurationName', modalData.taggingConfigurationName);
			formik.setFieldValue('segmentName', modalData.segmentName);
			const data = Object.assign(new Array<UserTaggingModel>(), filteredUserMapped(modalData.taggingConfigurationName));
			getUserMappedInConfig(data); //for multiselect
		}
	}, [showForm]);

	// METHODS
	const closeModalForm = () => {
		if (!isDisableForm) {
			swal({
				title: 'Confirmation',
				text: 'Any changes will be discarded, please confirm',
				icon: 'warning',
				buttons: ['No', 'Yes'],
				dangerMode: true,
			}).then((willClose) => {
				if (willClose) {
					closeModal();
				}
			});
		} else {
			closeModal();
		}
	};

	const filteredUserMapped = (name: any) => {
		return getUsersConfigByListState?.filter((x: any) => x.taggingConfigurationName == name);
	};

	//  DISPLAY SELECTED VALUES IN DROPDOWN
	const getUserMappedInConfig = (data: any) => {
		let filteredData = Object.assign(new Array<UserTaggingModel>(), data);

		let userMappedData = Array<DropdownModel>();

		filteredData?.forEach((item: UserTaggingModel) => {
			const tempOption: DropdownModel = {
				value: item.taggedUserId?.toString() != '0' ? item.taggedUserId?.toString() : item.userId.toString(), //equal to value of userId saved in users table
				label: item.taggedUserName,
			};
			userMappedData.push(tempOption);
		});
		setFilterSelectedUser(userMappedData);
		setRowData(filteredData);
	};

	const onChangeSegmentName = (val: string) => {
		setFilterSegmentName(val);
	};

	const onChangeSelectedUser = (params: Array<DropdownModel>) => {
		setFilterSelectedUser(params);
		let finalList = Array<UserTaggingModel>();

		params.forEach((item: DropdownModel) => {
			const tempOption: UserTaggingModel = {
				taggedUserId: parseInt(item.value),
				taggedUserName: item.label,
				userId: parseInt(item.value),
				taggingConfigurationName: '',
			};
			finalList.push(tempOption);
		});

		setRowData(finalList);
	};

	const tableLoader = (data: any) => {
		return (
			<div className='ag-custom-loading-cell' style={{paddingLeft: '10px', lineHeight: '25px'}}>
				<i className='fas fa-spinner fa-pulse'></i> <span> {data.loadingMessage}</span>
			</div>
		);
	};

	return (
		<FormModal
			customSize={modalSize}
			headerTitle={showHeader ? modalAction + ' Configuration' : 'Change Configuration Priority'}
			haveFooter={false}
			show={showForm}
		>
			<FormContainer onSubmit={formik.handleSubmit}>
				<MainContainer>
					<ContentContainer>
						{showHeader && (
							<>
								<FormGroupContainer>
									<label className='col-form-label text-right col-lg-4 col-sm-12'>Configuration Name</label>
									<div className='col-lg-8 col-md-9 col-sm-12  mb-5'>
										<div className='input-group'>
											<input
												type='text'
												autoComplete='off'
												className='form-control form-control-sm'
												aria-label='Configuration Name'
												disabled={isDisableForm}
												{...formik.getFieldProps('taggingConfigurationName')}
											/>
										</div>
									</div>
								</FormGroupContainer>
								<FormGroupContainer>
									<label className='col-form-label text-right col-lg-4 col-sm-12'>Segment Name</label>
									<div className='col-lg-8 col-md-9 col-sm-12  mb-5'>
										<Select
											//isMulti
											autoComplete='off'
											size='small'
											style={{width: '100%'}}
											options={segmentList}
											onChange={onChangeSegmentName}
											value={filterSegmentName}
											isDisabled={isDisableForm}
										/>
									</div>
								</FormGroupContainer>

								<FormGroupContainer>
									<label className='col-form-label text-right col-lg-4'>Select User</label>
									<div className='col-lg-8 mb-10'>
										<Select
											autoComplete='off'
											size='small'
											style={{width: '100%'}}
											isMulti
											options={usersList}
											onChange={onChangeSelectedUser}
											value={filterSelectedUser}
											isDisabled={isDisableForm}
										/>
									</div>
								</FormGroupContainer>
							</>
						)}

						<FormGroupContainer>
							{/* table */}
							<div className='ag-theme-quartz' style={{height: 200, width: '100%'}}>
								<AgGridReact
									rowData={rowData}
									components={{
										tableLoader: tableLoader,
									}}
									onGridReady={onGridReady}
									rowBuffer={0}
									//enableRangeSelection={true} //deprecated in AgGridReactv32.0.0
									columnDefs={columnDefs}
									rowDragManaged={true}
									animateRows={true}
								/>
							</div>
						</FormGroupContainer>
					</ContentContainer>
				</MainContainer>
				<ModalFooter style={{border: 0, float: 'right'}}>
					<DefaultPrimaryButton
						title={'Submit'}
						isDisable={isDisableForm}
						access={userAccess.includes(USER_CLAIMS.UpdateAutoTaggingWrite)}
						onClick={formik.submitForm}
					/>
					<DefaultSecondaryButton
						access={userAccess.includes(USER_CLAIMS.UpdateAutoTaggingRead)}
						title={'Close'}
						onClick={closeModalForm}
						isDisable={false}
					/>
				</ModalFooter>
			</FormContainer>
		</FormModal>
	);
};

export default AutoTaggingConfigurationModal;

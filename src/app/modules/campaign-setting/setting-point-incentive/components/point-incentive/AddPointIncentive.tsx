import 'datatables.net';
import 'datatables.net-dt';
import {useFormik} from 'formik';
import {Guid} from 'guid-typescript';
import React, {useEffect, useState} from 'react';
import {shallowEqual, useDispatch, useSelector} from 'react-redux';
import {useHistory, useLocation} from 'react-router-dom';
import Select from 'react-select';
import swal from 'sweetalert';
import {RootState} from '../../../../../../setup';
import * as hubConnection from '../../../../../../setup/hub/MessagingHub';
import {LookupModel} from '../../../../../common/model/LookupModel';
import {
	ContentContainer,
	DefaultSecondaryButton,
	FormContainer,
	FormGroupContainer,
	FormHeader,
	LoaderButton,
	MainContainer,
} from '../../../../../custom-components';
import CommonLookups from '../../../../../custom-functions/CommonLookups';
import {USER_CLAIMS} from '../../../../user-management/components/constants/UserClaims';
import * as campaignSetting from '../../../redux/AutoTaggingRedux';
import {
	checkCampaignSettingByNameIfExist,
	getPointIncentiveDetailsById,
	getPointIncentiveDetailsByIdResult,
	savePointIncentiveSetting,
	savePointIncentiveSettingResult,
} from '../../../redux/AutoTaggingService';
import {CampaignPeriodDetailsModel} from '../../../setting-auto-tagging/models/CampaignPeriodDetailsModel';
import {CampaignSettingListResponseModel} from '../../../setting-point-incentive/models/response/CampaignSettingListResponseModel';
import {GoalParameterListModel} from '../../models/GoalParameterListModel';
import {PointToValueListModel} from '../../models/PointToValueListModel';
import {AddConfigPointToValueRequestModel} from '../../models/request/AddConfigPointToValueRequestModel';
import {AddUpdatePointIncentiveRequestModel} from '../../models/request/AddUpdatePointIncentiveRequestModel';
import {PointIncentiveDetailsByIdRequestModel} from '../../models/request/PointIncentiveDetailsByIdRequestModel';
import {PointIncentiveDetailsByIdResponseModel} from '../../models/response/PointIncentiveDetailsByIdResponseModel';
import '../../styles/PointIncentiveStyle.css';
//  pages
import PointIncentiveRangeConfigurationGrid from './PointIncentiveRangeConfigurationGrid';

interface FormValues {
	campaignSettingName: string;
	campaignSettingDescription: string;
	selectedUsers: string;
	settingStatus: string;
	settingType: string;
	isActive: number;
}

const pointIncentiveSetting = 44; //FIXED for POINT INCENTIVE

const initialValues: FormValues = {
	campaignSettingName: '',
	campaignSettingDescription: '',
	settingStatus: '',
	settingType: '',
	selectedUsers: '',
	isActive: 0,
};

const initialValuesClear = {
	campaignSettingId: 0,
	campaignSettingName: '',
	campaignSettingDescription: '',
	settingTypeId: 0,
	isActive: 0,
	campaignSettingTypeId: pointIncentiveSetting,
	goalParameterAmountId: 0,
	goalParameterCountId: 0,

	pointToIncentiveRangeConfigurationList: Array<PointToValueListModel>(),
	goalParameterRangeConfigurationList: Array<GoalParameterListModel>(),
	createdBy: '',
	createdDate: '',
	updatedBy: '',
	updatedDate: '',
};

const useQuery = () => {
	const {search} = useLocation();

	return React.useMemo(() => new URLSearchParams(search), [search]);
};

// END: METHODS

const AddPointIncentive: React.FC = () => {
	// GET REDUX STORE
	const userAccessId = useSelector<RootState>(({auth}) => auth.userId, shallowEqual) as number;
	const userAccess = useSelector<RootState>(({auth}) => auth.access, shallowEqual) as string;
	const expiresIn = useSelector<RootState>(({auth}) => auth.expiresIn, shallowEqual) as string;
	const history = useHistory();

	// STATE
	let query = useQuery();
	let isClone: boolean = query.get('action') == 'clone' ? true : false;
	let selectedSettingTypeId: any;

	const messagingHub = hubConnection.createHubConnenction();
	const dispatch = useDispatch();
	const [loading, setLoading] = useState(false);
	const [modalShow, setModalShow] = useState<boolean>(false);
	const [rowData, setRowData] = useState('');
	const [showHeader, setShowHeader] = useState(false);
	const [actionTitle, setActionTitle] = useState('');
	const [isFormDisable, setIsFormDisable] = useState<boolean>(true);

	const [pointIncentiveDetails, setPointIncentiveDetails] = useState<PointIncentiveDetailsByIdResponseModel>();
	const [goalParameterRangeConfigList, setGoalParameterRangeConfigList] = useState<Array<GoalParameterListModel>>([]);
	const [pointToValueRangeConfigList, setPointToValueRangeConfigList] = useState<Array<PointToValueListModel>>([]);
	const [campaignDetailsList, setCampaignDetailsList] = useState<Array<CampaignPeriodDetailsModel>>([]);
	const [modalAction, setModalAction] = useState('');
	const [modalSize, setModalSize] = useState('lg');
	const [globalSettingTypeId, setGlobalSettingTypeId] = useState();
	const [selectedSettingStatus, setSelectedSettingStatus] = useState<LookupModel | null>();
	const [selectedSettingType, setSelectedSettingType] = useState<string | any>('');

	const pointIncentiveDetailsByIdState = useSelector<RootState>(
		({campaignSetting}) => campaignSetting.getPointIncentiveDetailsById,
		shallowEqual
	) as PointIncentiveDetailsByIdResponseModel;

	const getGoalParameterConfigListState = useSelector<RootState>(
		({campaignSetting}) => campaignSetting.getGoalParametersConfigList,
		shallowEqual
	) as GoalParameterListModel[];

	const getPointToValueConfigListState = useSelector<RootState>(
		({campaignSetting}) => campaignSetting.getPointToValueConfigList,
		shallowEqual
	) as PointToValueListModel[];

	const campaignSettingListState = useSelector<RootState>(
		({campaignSetting}) => campaignSetting.getCampaignSettingList,
		shallowEqual
	) as CampaignSettingListResponseModel[];

	const columnDefsCampaign = [
		{headerName: 'No', field: 'no'},
		{headerName: 'Campaign Name', field: 'campaignName'},
		{headerName: 'Campaign Status', field: 'campaignName'},
		{headerName: 'Campaign Report Period', field: 'campaignReportPeriod'},
	];

	//  BEGIN: METHODS
	const clearData = () => {
		dispatch(campaignSetting.actions.getGoalParametersConfigList([]));
		dispatch(campaignSetting.actions.getPointToValueConfigList([]));

		dispatch(campaignSetting.actions.getPointIncentiveDetailsById(initialValuesClear));
	};

	useEffect(() => {
		formik.setFieldValue('settingTypeId', '41');
		clearData();
		if (isClone && (query.get('id') != '0' || query.get('id') != null)) {
			getPointIncentiveSetting(Number(query.get('id')));
		} else clearData();

		return () => {
			window.onbeforeunload = function (event) {
				return;
			};
		};
	}, []);

	window.onbeforeunload = confirmExit;

	function confirmExit() {
		return true;
	}

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

	useEffect(() => {
		if (pointIncentiveDetails !== undefined) {
			formik.setFieldValue('isActive', pointIncentiveDetails.isActive);
			formik.setFieldValue('campaignSettingDescription', pointIncentiveDetails.campaignSettingDescription);
			formik.setFieldValue('settingTypeId', pointIncentiveDetails.settingTypeId);
		}
		dispatch(campaignSetting.actions.getPointIncentiveDetailsById(pointIncentiveDetails!));
	}, [pointIncentiveDetails]);

	const redirection = (id: any) => {
		history.push('/campaign-management/campaign-setting/view-point-incentive/' + id);
	};

	const onChangeSettingStatus = (data: LookupModel) => {
		if (data) {
			setSelectedSettingStatus(data);
		}
	};

	const onSavePointIncentiveSetting = (data: any) => {
		//  BUILD DATA FOR POINT INCENTIVE SETTING
		let addPointToValueConfigList = Array<AddConfigPointToValueRequestModel>();

		getPointToValueConfigListState?.forEach((item: PointToValueListModel) => {
			const tempOption: AddConfigPointToValueRequestModel = {
				pointToIncentiveRangeConfigurationId: 0,
				campaignSettingId: 0,
				currencyId: 0,
				rangeNo: item.rangeNo,
				incentiveValueAmount: item.incentiveValueAmount,
				validPointAmountFrom: item.validPointAmountFrom,
				validPointAmountTo: item.validPointAmountTo,
				createdBy: userAccessId,
				updatedBy: userAccessId,
			};
			addPointToValueConfigList.push(tempOption);
		});

		if (true) {
			const request: AddUpdatePointIncentiveRequestModel = {
				campaignSettingId: 0,
				campaignSettingTypeId: pointIncentiveSetting, //  POINT INCENTIVE
				campaignSettingName: data.campaignSettingName.trim(),
				campaignSettingDescription: data.campaignSettingDescription,
				settingTypeId: 41,
				isActive: selectedSettingStatus?.value != undefined ? parseInt(selectedSettingStatus?.value) : undefined,

				goalParameterAmountId: data.goalParameterAmountId,
				goalParameterCountId: data.goalParameterCountId,
				queueId: Guid.create().toString(),
				userId: userAccessId.toString(),

				pointToIncentiveRangeConfigurationType: addPointToValueConfigList,
			};
			messagingHub.start().then(() => {
				if (true) {
					savePointIncentiveSetting(request).then((response) => {
						if (response.status === 200) {
							messagingHub.on(request.queueId.toString(), (message) => {
								const resultData = JSON.parse(message.remarks);
								const latestCampaignSettingId = resultData.Data;

								savePointIncentiveSettingResult(message.cacheId)
									.then((returnData) => {
										if (response.status !== 200) {
											swal('Failed', 'Error Saving Point Incentive Details', 'error');
										} else {
											messagingHub.off(request.queueId.toString());
											messagingHub.stop();

											swal('Successful!', 'The data has been submitted', 'success');
											redirection(latestCampaignSettingId);
											clearData();
										}
									})
									.catch(() => {
										swal('Failed', 'savePointIncentiveSettingResult', 'error');
									});
							});
						} else {
							swal('Failed', response.data.message, 'error');
						}
					});
				}
			});
		}
	};

	const formik = useFormik({
		initialValues,
		onSubmit: (values, {setStatus, setSubmitting, resetForm}) => {
			setLoading(true);
			setTimeout(() => {
				//validations
				let isValid = true;

				if (
					!formik.values.campaignSettingName ||
					!formik.values.campaignSettingDescription ||
					!selectedSettingStatus?.value ||
					getPointToValueConfigListState.length == 0
				) {
					swal('Failed', 'Unable to proceed, kindly fill up all mandatory fields', 'error');
					setSubmitting(false);
					setLoading(false);
					isValid = false;
				} else {
					checkCampaignSettingByNameIfExist({campaignSettingName: values.campaignSettingName, campaignSettingTypeId: pointIncentiveSetting})
						.then((response) => {
							if (response.status === 200) {
								let result = response.data;

								if (result === true) {
									swal('Failed', 'Unable to record, the Setting Name is already exist', 'error');

									setSubmitting(false);
								} else {
									swal({
										title: 'Confirmation',
										text: 'This action will update the setting data and configuration, please confirm',
										icon: 'warning',
										buttons: ['No', 'Yes'],
										dangerMode: true,
									}).then((willUpdate) => {
										if (willUpdate) {
											setSubmitting(true);
											onSavePointIncentiveSetting(values);
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

				setLoading(false);
				setSubmitting(false);
			}, 1000);
		},
	});

	const getPointIncentiveSetting = (id: number) => {
		setTimeout(() => {
			messagingHub.start().then(() => {
				const request: PointIncentiveDetailsByIdRequestModel = {
					campaignSettingId: id,
					campaignSettingTypeId: pointIncentiveSetting,
					userId: userAccessId.toString(),
					queueId: Guid.create().toString(),
				};
				getPointIncentiveDetailsById(request).then((response) => {
					messagingHub.on(request.queueId.toString(), (message) => {
						getPointIncentiveDetailsByIdResult(message.cacheId)
							.then((returnData) => {
								const item = returnData.data;
								if (item === undefined) {
									swal('Failed', 'Cannot find Point Incentive Details', 'error');
								} else {
									let data = Object.assign(returnData.data);
									data = data[0];
									setPointIncentiveDetails(data);
									setGoalParameterRangeConfigList(data.goalParameterRangeConfigurationList);
									setPointToValueRangeConfigList(data.pointToIncentiveRangeConfigurationList);
									setCampaignDetailsList(data.campaignPeriodList);
									setGlobalSettingTypeId(data.settingTypeId);
									setSelectedSettingStatus(data.isActive == 1 ? {value: '1', label: 'Active'} : {value: '0', label: 'Inactive'});

									formik.setFieldValue('campaignSettingDescription', data.campaignSettingDescription);

									formik.setFieldValue('settingTypeId', data.settingTypeId);

									selectedSettingTypeId = data.setttingTypeId;

									dispatch(campaignSetting.actions.getPointIncentiveDetailsById(data));

									let goalParams = Object.assign(new Array<GoalParameterListModel>(), data.goalParameterRangeConfigurationList);
									dispatch(campaignSetting.actions.getGoalParametersConfigList(goalParams));

									let pointToValue = Object.assign(new Array<PointToValueListModel>(), data.pointToIncentiveRangeConfigurationList);
									dispatch(campaignSetting.actions.getPointToValueConfigList(pointToValue));

									messagingHub.off(request.queueId.toString());
									messagingHub.stop();
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
						if (messagingHub.state === 'Connected') {
							messagingHub.stop();
							setLoading(false);
						}
					}, 30000);
				});
			});
		}, 1000);
	};

	// VIEW
	return (
		<FormContainer onSubmit={formik.handleSubmit}>
			<MainContainer>
				<FormHeader headerLabel={'Add Point To Value Setting'}></FormHeader>
				<ContentContainer>
					<FormGroupContainer>
						<div className='form-group col-md-3 mb-5'>
							<label className='form-label'>Setting Name</label>
							<input
								type='text'
								autoComplete='off'
								className='form-control form-control-sm'
								{...formik.getFieldProps('campaignSettingName')}
								disabled={!userAccess.includes(USER_CLAIMS.UpdateIncentiveSettingWrite)}
							/>
						</div>
						<div className='form-group col-md-4 mb-5'>
							<label className='form-label'>Setting Description</label>
							<input
								type='text'
								autoComplete='off'
								className='form-control form-control-sm'
								{...formik.getFieldProps('campaignSettingDescription')}
								disabled={!userAccess.includes(USER_CLAIMS.UpdateIncentiveSettingWrite)}
							/>
						</div>
						<div className='form-group col-md-2 mb-5'>
							<label className='form-label'>Setting Status</label>
							<Select
								size='small'
								style={{width: '100%'}}
								options={CommonLookups('settingStatuses')}
								onChange={onChangeSettingStatus}
								value={selectedSettingStatus}
								isDisabled={!userAccess.includes(USER_CLAIMS.UpdateIncentiveSettingWrite)}
							/>
						</div>
						<div className='form-group col-md-2 mb-5'>
							<label className='form-label'>Setting Type</label>
							<select disabled={true} className='form-select form-select-sm' aria-label='Setting Type' {...formik.getFieldProps('settingTypeId')}>
								<option value='0'></option>
								<option value='40'>Goal Parameter to Point</option>
								<option value='41'>Point to Value</option>
							</select>
						</div>
					</FormGroupContainer>
					<FormGroupContainer></FormGroupContainer>

					<div className='separator border-4 my-10' />

					<div className='row mb-5'>
						<h6 className='fw-bolder m-0'>Range Configuration</h6>
					</div>

					<FormGroupContainer>
						<PointIncentiveRangeConfigurationGrid
							gridPointToValueData={getPointToValueConfigListState}
							gridGoalParamsData={getGoalParameterConfigListState}
							btnAction={'Edit'}
						/>
					</FormGroupContainer>

					<div className='separator border-4 my-10' />

					<div className='d-flex my-4'>
						<LoaderButton
							access={userAccess.includes(USER_CLAIMS.UpdateIncentiveSettingWrite)}
							loading={formik.isSubmitting}
							title={'Submit'}
							loadingTitle={' Please wait... '}
							disabled={formik.isSubmitting}
						/>
						<DefaultSecondaryButton
							access={userAccess.includes(USER_CLAIMS.UpdateIncentiveSettingRead)}
							title={'Close'}
							onClick={() => {
								outsideRedirectPage('/campaign-management/campaign-setting/point-incentive');
							}}
							isDisable={false}
						/>
					</div>
				</ContentContainer>
			</MainContainer>
		</FormContainer>
	);
};

export default AddPointIncentive;

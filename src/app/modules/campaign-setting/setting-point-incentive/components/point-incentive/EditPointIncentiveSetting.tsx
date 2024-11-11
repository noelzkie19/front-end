import 'datatables.net';
import 'datatables.net-dt';
import {useFormik} from 'formik';
import {Guid} from 'guid-typescript';
import React, {useEffect, useState} from 'react';
import {shallowEqual, useDispatch, useSelector} from 'react-redux';
import {useHistory, useParams} from 'react-router-dom';
import Select from 'react-select';
import swal from 'sweetalert';
import * as Yup from 'yup';
import {RootState} from '../../../../../../setup';
import * as hubConnection from '../../../../../../setup/hub/MessagingHub';
import {MasterReferenceOptionModel} from '../../../../../common/model';
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
import {useFormattedDate, useMasterReferenceOption} from '../../../../../custom-functions';
import CommonLookups from '../../../../../custom-functions/CommonLookups';
import {disableSplashScreen, enableSplashScreen} from '../../../../../utils/helper';
import {USER_CLAIMS} from '../../../../user-management/components/constants/UserClaims';
import * as campaignSetting from '../../../redux/AutoTaggingRedux';
//service
import {
	checkCampaignSettingByNameIfExist,
	getPointIncentiveDetailsById,
	getPointIncentiveDetailsByIdResult,
	savePointIncentiveSetting,
	savePointIncentiveSettingResult,
} from '../../../redux/AutoTaggingService';
import {CampaignSettingListResponseModel} from '../../../setting-point-incentive/models/response/CampaignSettingListResponseModel';
import {CampaignPeriodDetailsModel} from '../../models/CampaignPeriodDetailsModel';
import {GoalParameterListModel} from '../../models/GoalParameterListModel';
import {PointToValueListModel} from '../../models/PointToValueListModel';
import {AddConfigGoalParameterRequestModel} from '../../models/request/AddConfigGoalParameterRequestModel';
import {AddConfigPointToValueRequestModel} from '../../models/request/AddConfigPointToValueRequestModel';
import {AddUpdatePointIncentiveRequestModel} from '../../models/request/AddUpdatePointIncentiveRequestModel';
import {PointIncentiveDetailsByIdRequestModel} from '../../models/request/PointIncentiveDetailsByIdRequestModel';
import {PointIncentiveDetailsByIdResponseModel} from '../../models/response/PointIncentiveDetailsByIdResponseModel';
import '../../styles/PointIncentiveStyle.css';
import CampaignList from '../CampaignList';
import PointIncentiveRangeConfigurationGrid from './PointIncentiveRangeConfigurationGrid';
//  pages
import PointIncentiveRangeConfigurationModal from './PointIncentiveRangeConfigurationModal';
import TabularRangeConfig from './TabularRangeConfig';

interface FormValues {
	campaignSettingName: string;
	campaignSettingDescription: string;
	selectedUsers: string;
	settingStatus: string;
	settingType: string;
	isActive: number;
}

const initialValues: FormValues = {
	campaignSettingName: '',
	campaignSettingDescription: '',
	settingStatus: '',
	settingType: '',
	selectedUsers: '',
	isActive: 0,
};

const pointIncentiveSchema = Yup.object().shape({
	campaignSettingName: Yup.string().required(),
	campaignSettingDescription: Yup.string().required(),
	isActive: Yup.boolean().required(),
});

const EditPointIncentiveSetting: React.FC = () => {
	//  CONSTANTS
	const pointIncentiveSetting = 44;

	// GET REDUX STORE
	const userAccessId = useSelector<RootState>(({auth}) => auth.userId, shallowEqual) as number;
	const userAccess = useSelector<RootState>(({auth}) => auth.access, shallowEqual) as string;
	const expiresIn = useSelector<RootState>(({auth}) => auth.expiresIn, shallowEqual) as string;
	const history = useHistory();

	const messagingHub = hubConnection.createHubConnenction();

	// STATE
	const [loading, setLoading] = useState(false);
	const [modalShow, setModalShow] = useState<boolean>(false);
	const [actionTitle, setActionTitle] = useState('');
	const [pointIncentiveDetails, setPointIncentiveDetails] = useState<PointIncentiveDetailsByIdResponseModel>();
	const [goalParameterRangeConfigList, setGoalParameterRangeConfigList] = useState<Array<GoalParameterListModel>>([]);
	const [pointToValueRangeConfigList, setPointToValueRangeConfigList] = useState<Array<PointToValueListModel>>([]);
	const [campaignDetailsList, setCampaignDetailsList] = useState<Array<CampaignPeriodDetailsModel>>([]);
	const [showHeader, setShowHeader] = useState(false);
	const [modalAction, setModalAction] = useState('');
	const [modalSize, setModalSize] = useState('lg');
	const dispatch = useDispatch();
	const [globalSettingTypeId, setGlobalSettingTypeId] = useState();
	const [isFormDisable, setIsFormDisable] = useState<boolean>(true);
	const [hasCampaign, setHasCampaign] = useState<boolean>(false);
	const {paramCampaignSettingId}: {paramCampaignSettingId: number} = useParams();

	//  FIELDS
	const [inputCampaignSettingName, setInputCampaignSettingName] = useState('');
	const [inputCampaignSettingDesc, setInputCampaignSettingDesc] = useState('');
	const [inputSettingStatus, setInputSettingStatus] = useState<string | any>('');
	const [inputSettingType, setInputSettingType] = useState<string | any>('');
	const [filterSettingStatus, setFilterSettingStatus] = useState<any>(null);
	const [filterCampaignSettingType, setFilterCampaignSettingType] = useState<string | any>('');
	const [selectedSettingStatus, setSelectedSettingStatus] = useState<LookupModel | null>();
	const [selectedSettingType, setSelectedSettingType] = useState<string | any>('');

	let selectedSettingTypeId: any;
	const masterReference = useMasterReferenceOption('39');

	const campaignSettingListState = useSelector<RootState>(
		({campaignSetting}) => campaignSetting.getCampaignSettingList,
		shallowEqual
	) as CampaignSettingListResponseModel[];

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

	//  BEGIN: METHODS

	const onChangeSettingStatus = (data: LookupModel) => {
		if (data) {
			setSelectedSettingStatus(data);
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
					checkCampaignSettingByNameIfExist({
						campaignSettingName: values.campaignSettingName,
						campaignSettingTypeId: pointIncentiveSetting,
						campaignSettingId: paramCampaignSettingId,
					})
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

	useEffect(() => {
		getPointIncentiveSetting(paramCampaignSettingId);

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
		//force view mode if assigned to atleast one campaign
		if (hasCampaign) {
			setActionTitle('View');
		}
	}, [hasCampaign]);

	const onChangeSettingType = (params: string) => {
		setSelectedSettingType(params);
	};

	const redirection = (id: any) => {
		history.push('/campaign-management/campaign-setting/view-point-incentive/' + id);
	};

	const getPointIncentiveSetting = (id: number) => {
		enableSplashScreen();
		setTimeout(() => {
			messagingHub.start().then(() => {
				const request: PointIncentiveDetailsByIdRequestModel = {
					campaignSettingId: id,
					campaignSettingTypeId: pointIncentiveSetting, //FIXED for POINT INCENTIVE
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
									setHasCampaign(data.campaignPeriodList.length > 0 ? true : false);

									setSelectedSettingStatus(data.isActive == 1 ? {value: '1', label: 'Active'} : {value: '0', label: 'Inactive'});
									setSelectedSettingType(
										data.settingTypeId == 40 ? {value: '40', label: 'Goal Parameter to Point'} : {value: '41', label: 'Point to Value'}
									);

									formik.setFieldValue('campaignSettingName', data.campaignSettingName);
									formik.setFieldValue('campaignSettingDescription', data.campaignSettingDescription);

									selectedSettingTypeId = data.setttingTypeId;

									dispatch(campaignSetting.actions.getPointIncentiveDetailsById(data));

									let goalParams = Object.assign(new Array<GoalParameterListModel>(), data.goalParameterRangeConfigurationList);
									dispatch(campaignSetting.actions.getGoalParametersConfigList(goalParams));

									let pointToValue = Object.assign(new Array<PointToValueListModel>(), data.pointToIncentiveRangeConfigurationList);
									dispatch(campaignSetting.actions.getPointToValueConfigList(pointToValue));

									disableSplashScreen();
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
						disableSplashScreen();
					});

					setTimeout(() => {
						if (messagingHub.state === 'Connected') {
							messagingHub.stop();
							disableSplashScreen();
							setLoading(false);
						}
					}, 30000);
				});
				disableSplashScreen();
			});
		}, 1000);
	};

	const onSavePointIncentiveSetting = (data: any) => {
		//  BUILD DATA FOR POINT INCENTIVE SETTING
		let addPointToValueConfigList = Array<AddConfigPointToValueRequestModel>();

		getPointToValueConfigListState?.forEach((item: PointToValueListModel) => {
			const tempOption: AddConfigPointToValueRequestModel = {
				pointToIncentiveRangeConfigurationId: item.pointToIncentiveRangeConfigurationId,
				campaignSettingId: paramCampaignSettingId,
				currencyId: item.currencyId,
				rangeNo: item.rangeNo,
				incentiveValueAmount: item.incentiveValueAmount,
				validPointAmountFrom: item.validPointAmountFrom,
				validPointAmountTo: item.validPointAmountTo,
				createdBy: userAccessId,
				updatedBy: userAccessId,
			};
			addPointToValueConfigList.push(tempOption);
		});

		// BUILD DATA FOR GOAL TO PARAMETER
		let addGoalParameterConfigList = Array<AddConfigGoalParameterRequestModel>();

		getGoalParameterConfigListState?.forEach((item: GoalParameterListModel) => {
			const tempOption: AddConfigGoalParameterRequestModel = {
				goalParameterRangeConfigurationId: item.goalParameterRangeConfigurationId,
				campaignSettingId: paramCampaignSettingId,
				currencyId: item.currencyId,
				rangeNo: item.rangeNo,
				pointAmount: item.pointAmount,
				rangeFrom: item.rangeFrom,
				rangeTo: item.rangeTo,
				createdBy: userAccessId,
				updatedBy: userAccessId,
			};
			addGoalParameterConfigList.push(tempOption);
		});

		const request: AddUpdatePointIncentiveRequestModel = {
			campaignSettingId: paramCampaignSettingId,
			campaignSettingTypeId: 44, //  POINT INCENTIVE
			campaignSettingName: data.campaignSettingName.trim(),
			campaignSettingDescription: data.campaignSettingDescription,
			settingTypeId: parseInt(selectedSettingType?.value),
			isActive: selectedSettingStatus?.value != undefined ? parseInt(selectedSettingStatus?.value) : undefined,

			goalParameterAmountId: data.goalParameterAmountId,
			goalParameterCountId: data.goalParameterCountId,
			queueId: Guid.create().toString(),
			userId: userAccessId.toString(),

			pointToIncentiveRangeConfigurationType: addPointToValueConfigList,
			goalParameterRangeConfigurationType: addGoalParameterConfigList,
			createdDate:
				pointIncentiveDetails?.createdDate != undefined || pointIncentiveDetails?.createdDate != ''
					? pointIncentiveDetails?.createdDate
					: new Date().toISOString().slice(0, 10).toString(),
		};
		messagingHub.start().then(() => {
			if (messagingHub.state === 'Connected') {
				savePointIncentiveSetting(request).then((response) => {
					if (response.status === 200) {
						messagingHub.on(request.queueId.toString(), (message) => {
							savePointIncentiveSettingResult(message.cacheId)
								.then((returnData) => {
									if (response.status !== 200) {
										swal('Failed', 'Error Saving Point Incentive Details', 'error');
									} else {
										messagingHub.off(request.queueId.toString());
										messagingHub.stop();

										swal('Successful!', 'The data has been submitted', 'success');
										redirection(paramCampaignSettingId);
									}
								})
								.catch(() => {
									swal('Failed', 'savePointIncentiveSettingResult', 'error');
									//disableSplashScreen()
								});
						});
					} else {
						swal('Failed', response.data.message, 'error');
					}
				});
			}
		});
	};

	// VIEW
	return (
		<FormContainer onSubmit={formik.handleSubmit}>
			<MainContainer>
				<FormHeader headerLabel={'Edit ' + (globalSettingTypeId == 40 ? 'Goal Parameter to Point Setting' : 'Point to Value Setting')} />

				<ContentContainer>
					<FormGroupContainer>
						<div className='form-group col-md-3 mb-5'>
							<label className='form-label'>Setting Name</label>
							<input
								type='text'
								className='form-control form-control-sm'
								disabled={hasCampaign || !userAccess.includes(USER_CLAIMS.UpdateIncentiveSettingWrite)}
								autoComplete='off'
								{...formik.getFieldProps('campaignSettingName')}
							/>
						</div>
						<div className='form-group col-md-4 mb-5'>
							<label className='form-label'>Setting Description</label>
							<input
								type='text'
								className='form-control form-control-sm'
								disabled={hasCampaign || !userAccess.includes(USER_CLAIMS.UpdateIncentiveSettingWrite)}
								autoComplete='off'
								{...formik.getFieldProps('campaignSettingDescription')}
							/>
						</div>
						{/* Dropdown option will be updated to get dynamic Id */}
						<div className='form-group col-md-2 mb-5'>
							<label className='form-label'>Setting Status</label>
							<Select
								size='small'
								isDisabled={hasCampaign || !userAccess.includes(USER_CLAIMS.UpdateIncentiveSettingWrite)}
								style={{width: '100%'}}
								options={CommonLookups('settingStatuses')}
								onChange={onChangeSettingStatus}
								value={selectedSettingStatus}
							/>
						</div>
						{/* Dropdown option will be updated to get dynamic Id */}
						<div className='form-group col-md-2 mb-5'>
							<label className='form-label'>Setting Type</label>
							<Select
								isDisabled={true}
								size='small'
								style={{width: '100%'}}
								options={masterReference
									.filter((x: MasterReferenceOptionModel) => x.masterReferenceParentId === 39)
									.map((x: MasterReferenceOptionModel) => x.options)}
								onChange={onChangeSettingType}
								value={selectedSettingType}
							/>
						</div>
					</FormGroupContainer>

					<FormGroupContainer></FormGroupContainer>
					<FormGroupContainer>
						<div className='form-group mt-10 col-md-3 mb-5'>
							<label className='form-label'>Created Date</label>
							<p className='form-label  fw-bolder'>
								{useFormattedDate(pointIncentiveDetails && pointIncentiveDetails.createdDate ? pointIncentiveDetails.createdDate : '')}
							</p>
						</div>
						<div className='form-group row mt-10 col-md-3 mb-5'>
							<label className='form-label'>Created By</label>
							<p className='form-label fw-bolder'>{pointIncentiveDetails?.createdBy}</p>
						</div>
						<div className='form-group mt-10 row col-md-3 mb-5'>
							<label className='form-label '>Last Modified Date</label>
							<p className='form-label fw-bolder'>
								{' '}
								{useFormattedDate(pointIncentiveDetails && pointIncentiveDetails.updatedDate ? pointIncentiveDetails.updatedDate : '')}
							</p>
						</div>
						<div className='form-group mt-10 row col-md-3 mb-5'>
							<label className='form-label '>Last Modified By</label>
							<p className='form-label fw-bolder'>{pointIncentiveDetails?.updatedBy}</p>
						</div>
					</FormGroupContainer>

					<div className='separator border-4 my-10' />
					{globalSettingTypeId == 40 ? (
						<>
							<div className='row mb-5'>
								<h6 className='fw-bolder m-0'>Range Configuration</h6>
							</div>
							<div>
								<TabularRangeConfig modalData={getGoalParameterConfigListState} />
							</div>
						</>
					) : (
						<>
							<div className='row mb-5'>
								<h6 className='fw-bolder m-0'>Range Configuration</h6>
							</div>
							<div>
								{/* Range configuration for Point To value setting Type */}
								<FormGroupContainer>
									<PointIncentiveRangeConfigurationGrid
										gridPointToValueData={getPointToValueConfigListState}
										gridGoalParamsData={getGoalParameterConfigListState}
										btnAction={hasCampaign ? 'View' : 'Edit'}
									/>
								</FormGroupContainer>
							</div>
						</>
					)}

					{campaignDetailsList.length != 0 && <CampaignList campaignPeriodList={campaignDetailsList} />}

					<div className='separator border-4 my-10' />

					<div className='d-flex my-4'>
						<LoaderButton
							access={userAccess.includes(USER_CLAIMS.UpdateIncentiveSettingWrite)}
							loading={formik.isSubmitting}
							title={'Submit'}
							loadingTitle={' Please wait... '}
							disabled={formik.isSubmitting || hasCampaign}
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
				{/* modal for edit point incentive - goal parameter and point to value*/}
				<PointIncentiveRangeConfigurationModal
					showForm={modalShow}
					closeModal={() => setModalShow(false)}
					showHeader={showHeader}
					actionTitle={actionTitle}
				/>
				{/* end modal for auto tagging */}
			</MainContainer>
		</FormContainer>
	);
};

export default EditPointIncentiveSetting;

import 'datatables.net';
import 'datatables.net-dt';
import {useFormik} from 'formik';
import {Guid} from 'guid-typescript';
import React, {useEffect, useState} from 'react';
import {shallowEqual, useDispatch, useSelector} from 'react-redux';
import {useHistory, useLocation} from 'react-router-dom';
import Select from 'react-select';
import swal from 'sweetalert';
import * as Yup from 'yup';
import {RootState} from '../../../../../../setup';
import * as hubConnection from '../../../../../../setup/hub/MessagingHub';
import {LookupModel} from '../../../../../common/model/LookupModel';
import useConstant from '../../../../../constants/useConstant';
import {
	ContentContainer,
	DefaultSecondaryButton,
	FormContainer,
	FormGroupContainer,
	FormHeader,
	LoaderButton,
	MainContainer,
} from '../../../../../custom-components';
import {useCurrenciesWithCode} from '../../../../../custom-functions';
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
import {AddConfigGoalParameterRequestModel} from '../../models/request/AddConfigGoalParameterRequestModel';
import {AddUpdatePointIncentiveRequestModel} from '../../models/request/AddUpdatePointIncentiveRequestModel';
import {PointIncentiveDetailsByIdRequestModel} from '../../models/request/PointIncentiveDetailsByIdRequestModel';
import {PointIncentiveDetailsByIdResponseModel} from '../../models/response/PointIncentiveDetailsByIdResponseModel';
import '../../styles/PointIncentiveStyle.css';
//  pages
import GoalParameterRangeConfigurationGrid from './GoalParameterRangeConfigurationGrid';

interface FormValues {
	campaignSettingName: string;
	campaignSettingDescription: string;
	settingTypeId?: number;
	isActive?: number;
}

const initialValues: FormValues = {
	campaignSettingName: '',
	campaignSettingDescription: '',
	settingTypeId: undefined,
	isActive: undefined,
};

const InitialValues = {
	campaignSettingId: 0,
	campaignSettingName: '',
	campaignSettingDescription: '',
	settingTypeId: 0,
	isActive: 0,
	campaignSettingTypeId: 44,
	goalParameterAmountId: 0,
	goalParameterCountId: 0,

	pointToIncentiveRangeConfigurationList: Array<PointToValueListModel>(),
	goalParameterRangeConfigurationList: Array<GoalParameterListModel>(),
	campaignPeriodList: Array<CampaignPeriodDetailsModel>(),

	createdBy: '',
	createdDate: '',
	updatedBy: '',
	updatedDate: '',
};

const useQuery = () => {
	const {search} = useLocation();

	return React.useMemo(() => new URLSearchParams(search), [search]);
};

const campaignSettingParamsSchema = Yup.object().shape({
	campaignSettingName: Yup.string().required(),
	campaignSettingDescription: Yup.string().required(),
	isActive: Yup.string().required(),
});

const AddGoalParameterPointSetting: React.FC = () => {
	// GET REDUX STORE
	const userAccessId = useSelector<RootState>(({auth}) => auth.userId, shallowEqual) as number;
	const userAccess = useSelector<RootState>(({auth}) => auth.access, shallowEqual) as string;
	const expiresIn = useSelector<RootState>(({auth}) => auth.expiresIn, shallowEqual) as string;
	const history = useHistory();

	const pointIncentiveDetailsByIdState = useSelector<RootState>(
		({campaignSetting}) => campaignSetting.getPointIncentiveDetailsById,
		shallowEqual
	) as PointIncentiveDetailsByIdResponseModel;

	const getGoalParameterConfigListState = useSelector<RootState>(
		({campaignSetting}) => campaignSetting.getGoalParametersConfigList,
		shallowEqual
	) as GoalParameterListModel[];

	const campaignSettingListState = useSelector<RootState>(
		({campaignSetting}) => campaignSetting.getCampaignSettingList,
		shallowEqual
	) as CampaignSettingListResponseModel[];

	// STATE
	let query = useQuery();
	let isClone: boolean = query.get('action') == 'clone' ? true : false;

	const messagingHub = hubConnection.createHubConnenction();
	const [loading, setLoading] = useState<boolean>(false);
	const dispatch = useDispatch();
	const [selectedDataTab, setSelectedDataTab] = useState<Array<GoalParameterListModel>>([]);
	const [isFormDisable, setIsFormDisable] = useState<boolean>(true);
	const [pointIncentiveDetails, setPointIncentiveDetails] = useState<PointIncentiveDetailsByIdResponseModel>();
	const [goalParameterRangeConfigList, setGoalParameterRangeConfigList] = useState<Array<GoalParameterListModel>>([]);
	const [pointToValueRangeConfigList, setPointToValueRangeConfigList] = useState<Array<PointToValueListModel>>([]);
	const [campaignDetailsList, setCampaignDetailsList] = useState<Array<CampaignPeriodDetailsModel>>([]);
	const [modalSize, setModalSize] = useState('lg');
	const [globalSettingTypeId, setGlobalSettingTypeId] = useState();
	const [selectedSettingStatus, setSelectedSettingStatus] = useState<LookupModel | null>();

	const pointIncentiveSetting = 44; //FIXED for POINT INCENTIVE

	//CONSTANTS
	const {successResponse, HubConnected} = useConstant();

	const columnDefsCampaign = [
		{headerName: 'No', field: 'no'},
		{headerName: 'Campaign Name', field: 'campaignName'},
		{headerName: 'Campaign Status', field: 'campaignName'},
		{headerName: 'Campaign Report Period', field: 'campaignReportPeriod'},
	];

	//MOUNT
	useEffect(() => {
		formik.setFieldValue('settingTypeId', '40');

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

	//  WATCHERS
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

	//  BEGIN: METHODS
	//get currency List
	let currencyList: any = useCurrenciesWithCode();

	const clearData = () => {
		dispatch(campaignSetting.actions.getGoalParametersConfigList([]));
		dispatch(campaignSetting.actions.getPointToValueConfigList([]));
		dispatch(campaignSetting.actions.getPointIncentiveDetailsById(initialValues));
	};

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

	const redirection = (id: any) => {
		history.push('/campaign-management/campaign-setting/view-point-incentive/' + id);
	};

	const onChangeSettingStatus = (data: LookupModel) => {
		if (data) {
			setSelectedSettingStatus(data);
			formik.setFieldValue('isActive', data.value);
		}
	};

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
									swal('ERROR', 'Cannot find Point Incentive Details', 'error');
								} else {
									let data = Object.assign(returnData.data);
									data = data[0];

									setPointIncentiveDetails(data);
									setGoalParameterRangeConfigList(data.goalParameterRangeConfigurationList);
									setPointToValueRangeConfigList(data.pointToIncentiveRangeConfigurationList);
									setCampaignDetailsList(data.campaignPeriodList);
									setGlobalSettingTypeId(data.settingTypeId);
									formik.setFieldValue('campaignSettingDescription', data.campaignSettingDescription);
									formik.setFieldValue('isActive', data.isActive);
									formik.setFieldValue('settingTypeId', data.settingTypeId);
									setSelectedSettingStatus(data.isActive == 1 ? {value: '1', label: 'Active'} : {value: '0', label: 'Inactive'});

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
						if (messagingHub.state === HubConnected) {
							messagingHub.stop();
							setLoading(false);
						}
					}, 30000);
				});
			});
		}, 1000);
	};

	const onSaveGoalParameterSetting = (data: any) => {
		// BUILD DATA FOR GOAL TO PARAMETER
		let addGoalParameterConfigList = Array<AddConfigGoalParameterRequestModel>();

		getGoalParameterConfigListState?.forEach((item: GoalParameterListModel) => {
			const tempOption: AddConfigGoalParameterRequestModel = {
				goalParameterRangeConfigurationId: 0, //item.goalParameterRangeConfigurationId,
				campaignSettingId: 0,
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
			campaignSettingId: 0,
			campaignSettingTypeId: pointIncentiveSetting, //  POINT INCENTIVE
			campaignSettingName: data.campaignSettingName.trim(),
			campaignSettingDescription: data.campaignSettingDescription,
			settingTypeId: 40,
			isActive: selectedSettingStatus?.value != undefined ? parseInt(selectedSettingStatus?.value) : undefined,

			goalParameterAmountId: 0,
			goalParameterCountId: 0,
			queueId: Guid.create().toString(),
			userId: userAccessId.toString(),
			goalParameterRangeConfigurationType: addGoalParameterConfigList,
		};

		messagingHub.start().then(() => {
			if (messagingHub.state === HubConnected) {
				savePointIncentiveSetting(request).then((response) => {
					if (response.status === successResponse) {
						messagingHub.on(request.queueId.toString(), (message) => {
							const resultData = JSON.parse(message.remarks);
							const latestCampaignSettingId = resultData.Data;
							savePointIncentiveSettingResult(message.cacheId)
								.then((returnData) => {
									if (response.status !== successResponse) {
										swal('Failed', 'Error Saving Point Incentive Details', 'error');
									} else {
										messagingHub.off(request.queueId.toString());
										messagingHub.stop();

										swal('Successful!', 'The data has been submitted', 'success');
										redirection(latestCampaignSettingId);
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
	};

	const formik = useFormik({
		initialValues,
		onSubmit: (values, {setStatus, setSubmitting, resetForm}) => {
			setLoading(true);
			setSubmitting(true);

			setTimeout(() => {
				//validations
				let isValid = true;
				const isExist = campaignSettingListState.filter(
					(x) => x.campaignSettingName.toLowerCase().trim() == values.campaignSettingName.toLowerCase().trim()
				);

				if (
					!formik.values.campaignSettingName ||
					!formik.values.campaignSettingDescription ||
					!selectedSettingStatus?.value ||
					getGoalParameterConfigListState.length == 0
				) {
					swal('Failed', 'Unable to proceed, kindly fill up all mandatory fields', 'error');
					setSubmitting(false);
					setLoading(false);
					isValid = false;
				} else {
					checkCampaignSettingByNameIfExist({campaignSettingName: values.campaignSettingName, campaignSettingTypeId: pointIncentiveSetting})
						.then((response) => {
							if (response.status === successResponse) {
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
									}).then((onConfirm) => {
										if (onConfirm) {
											setSubmitting(true);
											onSaveGoalParameterSetting(values);
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

	const onSelectedTab = (currency: any) => {
		const currencyData = getGoalParameterConfigListState.filter((x) => x.currencyName == currency);
		setSelectedDataTab(currencyData);
	};

	const customStyles = {
		control: (base: any, state: any) => ({
			...base,
			background: '#023950',
			// match with the menu
			borderRadius: state.isFocused ? '3px 3px 0 0' : 3,
			// Overwrittes the different states of border
			borderColor: state.isFocused ? 'yellow' : 'green',
			// Removes weird border around container
			boxShadow: null,
			'&:hover': {
				// Overwrittes the different states of border
				borderColor: state.isFocused ? 'red' : 'blue',
			},
		}),
	};

	return (
        (<FormContainer onSubmit={formik.handleSubmit}>
            <MainContainer>
				<FormHeader headerLabel={'Add Goal Parameter to Point Setting'} />
				<ContentContainer>
					<FormGroupContainer>
						<div className='form-group col-md-3 mb-5'>
							<label className='form-label'>Setting Names</label>
							<input
								type='text'
								className={'form-control form-control-sm'}
								autoComplete='off'
								{...formik.getFieldProps('campaignSettingName')}
								disabled={!userAccess.includes(USER_CLAIMS.UpdateIncentiveSettingWrite)}
							/>
						</div>
						<div className='form-group col-md-4 mb-5'>
							<label className='form-label'>Setting Description</label>
							<input
								type='text'
								className={'form-control form-control-sm'}
								autoComplete='off'
								{...formik.getFieldProps('campaignSettingDescription')}
								disabled={!userAccess.includes(USER_CLAIMS.UpdateIncentiveSettingWrite)}
							/>
						</div>
						<div className='form-group col-md-2 mb-5'>
							<label className='form-label'>Setting Status</label>
							<Select
								size='small'
								style={customStyles}
								options={CommonLookups('settingStatuses')}
								onChange={onChangeSettingStatus}
								value={selectedSettingStatus}
								autoComplete='off'
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
					<div className='separator border-4 my-10' />

					<div className='row mb-5'>
						<h6 className='fw-bolder m-0'>Range Configuration</h6>
					</div>
					<div className='range-config mb-5'>
						<div className='tabbable-custom'>
							<ul className='nav nav-tabs nav-tab-border'>
								{currencyList.map((element: any, indx: any) => {
									return (
                                        (<li className={indx == 0 ? 'nav-item tab-highlighted' : 'nav-item'}>
                                            <a
												className={indx == 0 ? 'nav-link active' : 'nav-link'}
												data-bs-toggle='tab'
												onClick={() => {
													onSelectedTab(element.label);
												}}
												href={'#' + element.label.replace(/\s/g, '') + '-details'}
											>
												{element.label}
											</a>
                                        </li>)
                                    );
								})}
							</ul>
							<div className='tab-content'>
								{currencyList.map((e: any, index: any) => {
									return (
                                        (<div className={index == 0 ? 'tab-pane active' : 'tab-pane'} id={e.label.replace(/\s/g, '') + '-details'}>
                                            <GoalParameterRangeConfigurationGrid currencyId={e.value} selectedCurrency={e.label} dataGrid={selectedDataTab} />
                                        </div>)
                                    );
								})}
							</div>
						</div>
					</div>

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
							title={'Back'}
							onClick={() => {
								outsideRedirectPage('/campaign-management/campaign-setting/point-incentive');
							}}
							isDisable={false}
						/>
					</div>
				</ContentContainer>
			</MainContainer>
        </FormContainer>)
    );
};

export default AddGoalParameterPointSetting;

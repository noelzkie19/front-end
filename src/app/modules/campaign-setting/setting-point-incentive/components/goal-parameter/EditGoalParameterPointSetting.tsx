import 'datatables.net';
import 'datatables.net-dt';
import {useFormik} from 'formik';
import {Guid} from 'guid-typescript';
import React, {useEffect, useState} from 'react';
import {shallowEqual, useDispatch, useSelector} from 'react-redux';
import {useHistory, useParams} from 'react-router-dom';
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
import {useCurrenciesWithCode, useFormattedDate} from '../../../../../custom-functions';
import CommonLookups from '../../../../../custom-functions/CommonLookups';
import {USER_CLAIMS} from '../../../../user-management/components/constants/UserClaims';
import useCampaignSettingConstant from '../../../constants/useCampaignSettingConstant';
import * as campaignSetting from '../../../redux/AutoTaggingRedux';
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
import {AddUpdatePointIncentiveRequestModel} from '../../models/request/AddUpdatePointIncentiveRequestModel';
import {PointIncentiveDetailsByIdRequestModel} from '../../models/request/PointIncentiveDetailsByIdRequestModel';
import {PointIncentiveDetailsByIdResponseModel} from '../../models/response/PointIncentiveDetailsByIdResponseModel';
import '../../styles/PointIncentiveStyle.css';
import CampaignList from '../CampaignList';
import GoalParameterRangeConfigurationGrid from './GoalParameterRangeConfigurationGrid';
//  pages
import GoalParameterRangeConfigurationModal from './GoalParameterRangeConfigurationModal';

interface FormValues {
	configurationName: string;
	segmentName: string;
	selectedUsers: string;
	campaignSettingName: string;
	campaignSettingDescription: string;
	isActive: number;
}

const initialValues: FormValues = {
	campaignSettingName: '',
	campaignSettingDescription: '',
	isActive: 0,
	configurationName: '',
	segmentName: '',
	selectedUsers: '',
};

const EditGoalParameterPointSetting: React.FC = () => {
	// GET REDUX STORE
	const userAccessId = useSelector<RootState>(({auth}) => auth.userId, shallowEqual) as number;
	const userAccess = useSelector<RootState>(({auth}) => auth.access, shallowEqual) as string;
	const expiresIn = useSelector<RootState>(({auth}) => auth.expiresIn, shallowEqual) as string;
	const history = useHistory();
	const messagingHub = hubConnection.createHubConnenction();

	const getGoalParameterConfigListState = useSelector<RootState>(
		({campaignSetting}) => campaignSetting.getGoalParametersConfigList,
		shallowEqual
	) as GoalParameterListModel[];

	const campaignSettingListState = useSelector<RootState>(
		({campaignSetting}) => campaignSetting.getCampaignSettingList,
		shallowEqual
	) as CampaignSettingListResponseModel[];

	// STATE
	const [loading, setLoading] = useState(false);
	const [modalShow, setModalShow] = useState<boolean>(false);

	const [actionTitle, setActionTitle] = useState('');
	const [selectedDataTab, setSelectedDataTab] = useState<Array<GoalParameterListModel>>([]);
	const [pointIncentiveDetails, setPointIncentiveDetails] = useState<PointIncentiveDetailsByIdResponseModel>();
	const [goalParameterRangeConfigList, setGoalParameterRangeConfigList] = useState<Array<GoalParameterListModel>>([]);
	const [pointToValueRangeConfigList, setPointToValueRangeConfigList] = useState<Array<PointToValueListModel>>([]);
	const [campaignDetailsList, setCampaignDetailsList] = useState<Array<CampaignPeriodDetailsModel>>([]);
	const [showHeader, setShowHeader] = useState(false);
	const [modalAction, setModalAction] = useState('');
	const [modalSize, setModalSize] = useState('lg');
	const [btnAction, setBtnAction] = useState('View');
	const [globalSettingTypeId, setGlobalSettingTypeId] = useState();
	// const pointIncentiveSetting = 44;
	let currencyList: any = useCurrenciesWithCode();
	const [hasCampaign, setHasCampaign] = useState<boolean>(false);
	const [disableAdd, setDisableAdd] = useState<boolean>(false);
	const {paramCampaignSettingId}: {paramCampaignSettingId: number} = useParams();
	const [selectedSettingStatus, setSelectedSettingStatus] = useState<LookupModel | null>();
	const dispatch = useDispatch();

	const columnDefsCampaign = [
		{headerName: 'No', field: 'no'},
		{headerName: 'Campaign Name', field: 'campaignName'},
		{headerName: 'Campaign Status', field: 'campaignName'},
		{headerName: 'Campaign Report Period', field: 'campaignReportPeriod'},
	];

	const {CampaignSettingTypes, LARGE, EDIT, ADD, MAX_CONFIG_TAG, PointIncentiveSettingTypes} = useCampaignSettingConstant();

	//  BEGIN: METHODS

	const onSelectedTab = (currency: any) => {
		const currencyData = getGoalParameterConfigListState.filter((x) => x.currencyName == currency);
		setSelectedDataTab(currencyData);
	};

	useEffect(() => {
		getPointIncentiveSetting(paramCampaignSettingId);
		onSelectedTab(currencyList.length > 0 && currencyList[0].label);

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

	const getPointIncentiveSetting = (id: number) => {
		let selectedSettingTypeId: any;
		setTimeout(() => {
			messagingHub.start().then(() => {
				const request: PointIncentiveDetailsByIdRequestModel = {
					campaignSettingId: id,
					campaignSettingTypeId: CampaignSettingTypes.pointIncentiveSettingTypeId, //FIXED for POINT INCENTIVE
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
									formik.setFieldValue('campaignSettingName', data.campaignSettingName);
									formik.setFieldValue('campaignSettingDescription', data.campaignSettingDescription);
									formik.setFieldValue('isActive', data.isActive);
									formik.setFieldValue('settingTypeId', data.settingTypeId);

									setSelectedSettingStatus(data.isActive == 1 ? {value: '1', label: 'Active'} : {value: '0', label: 'Inactive'});

									selectedSettingTypeId = data.setttingTypeId;

									dispatch(campaignSetting.actions.getPointIncentiveDetailsById(data));

									let goalParams = Object.assign(new Array<GoalParameterListModel>(), data.goalParameterRangeConfigurationList);
									dispatch(campaignSetting.actions.getGoalParametersConfigList(goalParams));

									let pointToValue = Object.assign(new Array<PointToValueListModel>(), data.pointToIncentiveRangeConfigurationList);
									dispatch(campaignSetting.actions.getPointToValueConfigList(pointToValue));

									//disableSplashScreen()
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

	const closePage = () => {
		swal({
			title: 'Confirmation',
			text: 'Any changes will be discarded, please confirm',
			icon: 'warning',
			buttons: ['No', 'Yes'],
			dangerMode: true,
		}).then((willClose) => {
			if (willClose) {
				history.push('/campaign-management/campaign-setting/point-incentive');
			}
		});
	};

	const redirection = (id: any) => {
		history.push('/campaign-management/campaign-setting/view-point-incentive/' + id);
	};

	//  WATCHERS
	const onGridReady = (params: any) => {
		params.api.sizeColumnsToFit();
	};

	const onChangeSettingStatus = (data: LookupModel) => {
		if (data) {
			setSelectedSettingStatus(data);
			formik.setFieldValue('isActive', data.value);
		}
	};

	const onSaveGoalParameterSetting = (data: any) => {
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
			campaignSettingTypeId: CampaignSettingTypes.pointIncentiveSettingTypeId, //  POINT INCENTIVE
			campaignSettingName: data.campaignSettingName.trim(),
			campaignSettingDescription: data.campaignSettingDescription,
			settingTypeId: PointIncentiveSettingTypes.goalParameterSettingTypeId,
			isActive: selectedSettingStatus?.value != undefined ? parseInt(selectedSettingStatus?.value) : undefined,

			goalParameterAmountId: data.goalParameterAmountId,
			goalParameterCountId: data.goalParameterCountId,
			queueId: Guid.create().toString(),
			userId: userAccessId.toString(),

			goalParameterRangeConfigurationType: addGoalParameterConfigList,
		};

		messagingHub.start().then(() => {
			//if(!props.isEditMode) {
			if (messagingHub.state === 'Connected') {
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
										redirection(paramCampaignSettingId);
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
			setTimeout(() => {
				//validations
				let isValid = true;
				const isExist = campaignSettingListState.filter(
					(x) =>
						x.campaignSettingName.toLowerCase().trim() == values.campaignSettingName.toLowerCase().trim() &&
						x.campaignSettingId != paramCampaignSettingId
				);
				if (
					!formik.values.campaignSettingName ||
					!formik.values.campaignSettingDescription ||
					values.isActive == undefined ||
					getGoalParameterConfigListState.length == 0
				) {
					swal('Failed', 'Unable to proceed, kindly fill up all mandatory fields', 'error');
					setSubmitting(false);
					isValid = false;
				} else {
					checkCampaignSettingByNameIfExist({
						campaignSettingName: values.campaignSettingName,
						campaignSettingTypeId: CampaignSettingTypes.pointIncentiveSettingTypeId,
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

	// VIEW
	return (
        (<FormContainer onSubmit={formik.handleSubmit}>
            <MainContainer>
				<FormHeader headerLabel={'Edit Goal Parameter to Point Setting'} />
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
								options={CommonLookups('settingStatuses')}
								onChange={onChangeSettingStatus}
								value={selectedSettingStatus}
								autoComplete='off'
							/>
						</div>
						{/* Dropdown option will be updated to get dynamic Id */}
						<div className='form-group col-md-2 mb-5'>
							<label className='form-label'>Setting Type</label>
							<select disabled={true} className='form-select form-select-sm' aria-label='Setting Type' {...formik.getFieldProps('settingTypeId')}>
								<option value='0'></option>
								<option value='40'>Goal Parameter to Point</option>
								<option value='41'>Point to Value</option>
							</select>
						</div>
					</FormGroupContainer>
					<FormGroupContainer>
						<div className='form-group row mt-9 ml-7'>
							<div className='form-group col-md-3 mb-5'>
								<h2 className='form-label '>Created Date</h2>
								<label className='form-label fw-bolder'>
									{useFormattedDate(pointIncentiveDetails && pointIncentiveDetails?.createdDate ? pointIncentiveDetails?.createdDate : '')}
								</label>
							</div>
							<div className='form-group row col-md-3 mb-5'>
								<label className='form-label'>Created By</label>
								<label className='form-label fw-bolder'>{pointIncentiveDetails?.createdBy}</label>
							</div>
							<div className='form-group row col-md-3 mb-5'>
								<label className='form-label'>Last Modified Date</label>
								<label className='form-label fw-bolder'>
									{useFormattedDate(pointIncentiveDetails && pointIncentiveDetails?.updatedDate ? pointIncentiveDetails?.updatedDate : '')}
								</label>
							</div>
							<div className='form-group row col-md-3 mb-5'>
								<label className='form-label'>Last Modified By</label>
								<label className='form-label fw-bolder'>{pointIncentiveDetails?.updatedBy}</label>
							</div>
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
												className={(indx == 0 ? 'active' : '') + ' nav-link nav-width-custom nav-link-custom-colors'}
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
                                            <GoalParameterRangeConfigurationGrid
												isView={hasCampaign}
												currencyId={e.value}
												selectedCurrency={e.label}
												dataGrid={selectedDataTab}
											/>
                                        </div>)
                                    );
								})}
							</div>
						</div>
					</div>

					{campaignDetailsList.length > 0 && <CampaignList campaignPeriodList={campaignDetailsList} />}

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
							title={'Back'}
							onClick={() => {
								outsideRedirectPage('/campaign-management/campaign-setting/point-incentive');
							}}
							isDisable={false}
						/>
					</div>
				</ContentContainer>
				{/* modal for goal parameter */}
				<GoalParameterRangeConfigurationModal
					showForm={modalShow}
					closeModal={() => setModalShow(false)}
					showHeader={showHeader}
					actionTitle={actionTitle}
				/>
				{/* end modal for goal parameter*/}
			</MainContainer>
        </FormContainer>)
    );
};

export default EditGoalParameterPointSetting;

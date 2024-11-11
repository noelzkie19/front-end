import 'datatables.net';
import 'datatables.net-dt';
import {useFormik} from 'formik';
import {Guid} from 'guid-typescript';
import React, {useEffect, useState} from 'react';
import {ButtonGroup} from 'react-bootstrap-v5';
import {shallowEqual, useDispatch, useSelector} from 'react-redux';
import {useHistory} from 'react-router-dom';
import Select from 'react-select';
import swal from 'sweetalert';
import {RootState} from '../../../../../../setup';
import * as hubConnection from '../../../../../../setup/hub/MessagingHub';
import {LookupModel} from '../../../../../common/model';
import {
	ContentContainer,
	DefaultPrimaryButton,
	DefaultTableButton,
	FormContainer,
	FormGroupContainer,
	FormHeader,
	MainContainer,
} from '../../../../../custom-components';
import {useCurrenciesWithCode, useFormattedDate} from '../../../../../custom-functions';
import CommonLookups from '../../../../../custom-functions/CommonLookups';
import {disableSplashScreen, enableSplashScreen} from '../../../../../utils/helper';
import {USER_CLAIMS} from '../../../../user-management/components/constants/UserClaims';
import * as campaignSetting from '../../../redux/AutoTaggingRedux';
//service
import {getPointIncentiveDetailsById, getPointIncentiveDetailsByIdResult} from '../../../redux/AutoTaggingService';
import {CampaignPeriodDetailsModel} from '../../models/CampaignPeriodDetailsModel';
import {GoalParameterListModel} from '../../models/GoalParameterListModel';
import {PointToValueListModel} from '../../models/PointToValueListModel';
import {PointIncentiveDetailsByIdRequestModel} from '../../models/request/PointIncentiveDetailsByIdRequestModel';
import {PointIncentiveDetailsByIdResponseModel} from '../../models/response/PointIncentiveDetailsByIdResponseModel';
import '../../styles/PointIncentiveStyle.css';
import CampaignList from '../CampaignList';
import GoalParameterRangeConfigurationGrid from '../goal-parameter/GoalParameterRangeConfigurationGrid';
import PointIncentiveRangeConfigurationGrid from './PointIncentiveRangeConfigurationGrid';
//  pages
import PointIncentiveRangeConfigurationModal from './PointIncentiveRangeConfigurationModal';

const initialValues = {
	campaignSettingId: '',
	campaignSettingName: '',
	campaignSettingDescription: '',
	settingTypeId: '',
	isActive: '',
	campaignSettingTypeId: '',
	goalParameterAmountId: null,
	goalParameterCountId: null,

	pointToIncentiveRangeConfigurationList: Array<PointToValueListModel>(),
	goalParameterRangeConfigurationList: Array<GoalParameterListModel>(),
	campaignPeriodList: Array<CampaignPeriodDetailsModel>(),

	createdBy: '',
	createdDate: '',
	updatedBy: '',
	updatedDate: '',
};

// END: METHODS

const ViewPointIncentiveSetting: React.FC = () => {
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
	const [selectedDataTab, setSelectedDataTab] = useState<Array<GoalParameterListModel>>([]);
	const [pointIncentiveDetails, setPointIncentiveDetails] = useState<PointIncentiveDetailsByIdResponseModel>();
	const [goalParameterRangeConfigList, setGoalParameterRangeConfigList] = useState<Array<GoalParameterListModel>>([]);
	const [pointToValueRangeConfigList, setPointToValueRangeConfigList] = useState<Array<PointToValueListModel>>([]);
	const [campaignDetailsList, setCampaignDetailsList] = useState<Array<CampaignPeriodDetailsModel>>([]);
	const [showHeader, setShowHeader] = useState(false);
	const [modalAction, setModalAction] = useState('');
	const [modalSize, setModalSize] = useState('lg');
	const [btnAction, setBtnAction] = useState('View');
	const [hasCampaign, setHasCampaign] = useState<boolean>(false);

	const [globalSettingTypeId, setGlobalSettingTypeId] = useState();

	//  FIELDS
	const [inputCampaignSettingName, setInputCampaignSettingName] = useState('');
	const [inputCampaignSettingDesc, setInputCampaignSettingDesc] = useState('');
	const [inputSettingStatus, setInputSettingStatus] = useState<string | any>('');
	const [inputSettingType, setInputSettingType] = useState<string | any>('');
	const [filterSettingStatus, setFilterSettingStatus] = useState<LookupModel | null>();

	const dispatch = useDispatch();

	let selectedSettingTypeId: any;

	//get currency List
	let currencyList: any = useCurrenciesWithCode();

	//   GRID DETAILS
	const columnDefs = [
		{headerName: 'Range No', field: 'rangeNo', sort: 'ASC'},
		{headerName: 'Point Amount', field: 'pointAmount'},
		{headerName: 'Range From', field: 'rangeFrom'},
		{headerName: 'Range To', field: 'rangeTo'},
		{
			headerName: 'Action',
			field: '',
			cellRenderer: (params: any) => (
				<>
					{params.data.messageResponseId != 0 ? (
						<ButtonGroup aria-label='Basic example'>
							<div className='d-flex justify-content-center flex-shrink-0'>
								<div>
									<DefaultTableButton
										access={userAccess.includes(USER_CLAIMS.ViewIncentiveSettingWrite)}
										title={'Edit'}
										onClick={() => {
											setModalShow(true);
											setActionTitle('Edit');
										}}
									/>
								</div>
								<div>
									<DefaultTableButton
										access={userAccess.includes(USER_CLAIMS.ViewIncentiveSettingWrite)}
										title={'Remove'}
										onClick={() => console.log('remove')}
									/>
								</div>
							</div>
						</ButtonGroup>
					) : null}
				</>
			),
		},
	];

	//  BEGIN: METHODS
	//  WATCHERS
	const onGridReady = (params: any) => {
		params.api.sizeColumnsToFit();
	};

	const goToEditPage = () => {
		const pathArray = window.location.pathname.split('/');
		if (pathArray.length >= 4) {
			if (globalSettingTypeId == 40) {
				history.push('/campaign-management/campaign-setting/edit-goal-parameter/' + pathArray[4]);
			} else {
				history.push('/campaign-management/campaign-setting/edit-point-incentive/' + pathArray[4]);
			}
		}
	};

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

	const formik = useFormik({
		initialValues,
		onSubmit: (values, {setStatus, setSubmitting, resetForm}) => {},
	});

	let selectedId: string = '';

	useEffect(() => {
		const pathArray = window.location.pathname.split('/');
		if (pathArray.length >= 5) {
			selectedId = pathArray[4];
			getPointIncentiveSetting(parseInt(selectedId));
			//set default selected tab
			onSelectedTab(currencyList.length > 0 ? currencyList[0].label : 'RMB');
		}
	}, []);

	useEffect(() => {
		if (pointIncentiveDetails != undefined) {
			const status = pointIncentiveDetails.isActive == 1 ? {value: '1', label: 'Active'} : {value: '0', label: 'Inactive'};
			const settingTypeId =
				pointIncentiveDetails.settingTypeId == 40 ? {value: '40', label: 'Goal Parameter to Point'} : {value: '41', label: 'Point to Value'};
			formik.setFieldValue('isActive', status);
			formik.setFieldValue('campaignSettingName', pointIncentiveDetails.campaignSettingName);
			formik.setFieldValue('campaignSettingDescription', pointIncentiveDetails.campaignSettingDescription);
			formik.setFieldValue('settingTypeId', settingTypeId);
		}
	}, [pointIncentiveDetails]);

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
									swal('ERROR', 'Cannot find Point Incentive Details', 'error');
								} else {
									let data = Object.assign(returnData.data);
									data = data[0];
									setPointIncentiveDetails(data);
									setGoalParameterRangeConfigList(data.goalParameterRangeConfigurationList);
									setPointToValueRangeConfigList(data.pointToIncentiveRangeConfigurationList);
									setCampaignDetailsList(data.campaignPeriodList);
									setGlobalSettingTypeId(data.settingTypeId);
									setHasCampaign(data.campaignPeriodList.length > 0 ? true : false);
									setFilterSettingStatus(data.isActive == 1 ? {value: '1', label: 'Active'} : {value: '0', label: 'Inactive'});

									formik.setFieldValue('campaignSettingName', data.campaignSettingName);
									formik.setFieldValue('campaignSettingDescription', data.campaignSettingDescription);
									formik.setFieldValue('isActive', data.isActive == 1 ? {value: '1', label: 'Active'} : {value: '0', label: 'Inactive'});
									formik.setFieldValue('settingTypeId', data.settingTypeId);

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

	const onSelectedTab = (currency: any) => {
		const currencyData = getGoalParameterConfigListState.filter((x) => x.currencyName == currency);
		setSelectedDataTab(currencyData);
	};

	const onChangeSettingStatus = (val: LookupModel) => {
		setFilterSettingStatus(val);
	};

	// VIEW
	return (
        (<FormContainer onSubmit={formik.handleSubmit}>
            <MainContainer>
				<FormHeader headerLabel={'View ' + (globalSettingTypeId == 40 ? 'Goal Parameter to Point Setting' : 'Point to Value Setting')} />
				<ContentContainer>
					<FormGroupContainer>
						<div className='form-group col-md-3 mb-5'>
							<label className='form-label'>Setting Name</label>
							<input type='text' className='form-control form-control-sm' disabled={true} {...formik.getFieldProps('campaignSettingName')} />
						</div>
						<div className='form-group col-md-4 mb-5'>
							<label className='form-label'>Setting Description</label>
							<input type='text' className='form-control form-control-sm' disabled={true} {...formik.getFieldProps('campaignSettingDescription')} />
						</div>
						<div className='form-group col-md-2 mb-5'>
							<label className='form-label'>Setting Status</label>
							<Select
								isDisabled={true}
								size='small'
								style={{width: '100%'}}
								options={CommonLookups('settingStatuses')}
								onChange={onChangeSettingStatus}
								value={filterSettingStatus}
							/>
						</div>
						<div className='form-group col-md-2 mb-5'>
							<label className='form-label'>Setting Type</label>
							<select className='form-select form-select-sm' aria-label='Setting Type' disabled={true} {...formik.getFieldProps('settingTypeId')}>
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
								<label className='form-label '>Created By</label>
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
					{globalSettingTypeId == 40 && (
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
                                                <GoalParameterRangeConfigurationGrid
													isView={true}
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
					)}

					{globalSettingTypeId == 41 && (
						<div>
							{/* Range configuration for Point To value setting Type */}
							<FormGroupContainer>
								<PointIncentiveRangeConfigurationGrid
									btnAction={btnAction}
									gridPointToValueData={pointToValueRangeConfigList}
									gridGoalParamsData={getGoalParameterConfigListState}
								/>
							</FormGroupContainer>
						</div>
					)}

					{campaignDetailsList.length != 0 && <CampaignList campaignPeriodList={campaignDetailsList} />}

					<div className='separator border-4 my-10' />

					<div className='d-flex my-4'>
						<DefaultPrimaryButton
							title={'Edit Setting'}
							access={userAccess.includes(USER_CLAIMS.ViewIncentiveSettingWrite)}
							isDisable={hasCampaign}
							onClick={goToEditPage}
						/>
					</div>

					{/* modal for add auto tagging */}
					<PointIncentiveRangeConfigurationModal
						showForm={modalShow}
						closeModal={() => setModalShow(false)}
						showHeader={showHeader}
						actionTitle={actionTitle}
					/>
					{/* end modal for auto tagging */}
				</ContentContainer>
			</MainContainer>
        </FormContainer>)
    );
};

export default ViewPointIncentiveSetting;

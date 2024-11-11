import {faChevronLeft, faChevronRight} from '@fortawesome/free-solid-svg-icons';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {useFormik} from 'formik';
import {Guid} from 'guid-typescript';
import moment from 'moment';
import React, {useEffect, useState} from 'react';
import {Tab, Tabs} from 'react-bootstrap-v5';
import {shallowEqual, useDispatch, useSelector} from 'react-redux';
import {useHistory, useParams} from 'react-router-dom';
import swal from 'sweetalert';
import {RootState} from '../../../../setup';
import * as hubConnection from '../../../../setup/hub/MessagingHub';
import {LookupModel} from '../../../common/model';
import {CustomLookupModel} from '../../../common/model/CustomLookupModel';
import {
	CampaignStatusEnum,
	ElementStyle,
	EligibilityTypeEnum,
	HttpStatusCodeEnum,
	MessageGroupEnum,
	SegmentTypes,
	campaignTab,
	dataType,
	pageMode
} from '../../../constants/Constants';
import useConstant from '../../../constants/useConstant';
import {
	ContentContainer,
	FooterContainer,
	FormContainer,
	FormGroupContainer,
	FormHeader,
	MainContainer,
	MlabButton,
	PaddedContainer
} from '../../../custom-components';
import {disableSplashScreen, enableSplashScreen} from '../../../utils/helper';
import {MasterReference} from '../../system/components/constants/CampaignSetting';
import {USER_CLAIMS} from '../../user-management/components/constants/UserClaims';
import {CampaignConfigurationCommunicationModelFactory} from '../models/request/CampaignConfigurationCommunicationModel';
import {CampaignConfigurationModelFactory} from '../models/request/CampaignConfigurationModel';
import {CampaignIdRequestModel} from '../models/request/CampaignIdRequestModel';
import {CampaignModel} from '../models/request/CampaignModel';
import {RetentionCampaignPlayerListModel} from '../models/response/RetentionCampaignPlayerListModel';
import * as campaign from '../redux/CampaignManagementRedux';
import {
	GetCampaignPeriodBySourceId,
	getAllCampaignCustomEventSettingName,
	getAllCampaignStatus,
	getCampaignById,
	getCampaignByIdResult,
	getEligibilityType,
	saveCampaign,
	validateCampaignHasPlayer
} from '../redux/CampaignManagementService';
import './Campaign.css';
import {CampaignCommunicationTab} from './CampaignCommunicationTab';
import {CampaignConfiguration} from './CampaignConfiguration';
import {CampaignHoldReasonModal} from './CampaignHoldReasonModal';
import {CampaignInformation} from './CampaignInformation';
import {CampaignUploadPlayer} from './CampaignUploadPlayer';

interface Props {
	mode: string;
}

const initialValues = {
	campaignName: '',
	brand: 0,
	campaignDescription: '',
	campaignPeriodDateFrom: '',
	campaignPeriodDateTo: '',
};

export const Campaign = (Props: Props) => {
	const dispatch = useDispatch();
	const history = useHistory();
	const {id}: {id: number} = useParams();
	const isClone: boolean = Props.mode === pageMode.clone;
	const userAccess = useSelector<RootState>(({auth}) => auth.access, shallowEqual) as string;
	const userAccessId = useSelector<RootState>(({auth}) => auth.userId, shallowEqual) as number;
	const [loading, setLoading] = useState(false);
	const [selectedTab, setSelectedTab] = useState<string>(campaignTab.campaignInfoTab);
	const [disabledNext, setDisabledNext] = useState<boolean>(false);
	const [disabledPrevious, setDisabledPrevious] = useState<boolean>(true);
	const [campaignStatusName, setCampaignStatusName] = useState<string>();
	const [isViewMode, setIsViewMode] = useState<boolean>(false);
	const [badgeStyle, setBadgeStyle] = useState<string>('');
	const [modalShow, setModalShow] = useState<boolean>(false);
	const [showWarningModal, setShowWarningModal] = useState<boolean>(true);
	//Buttons
	const [showDeactivateButton, setShowDeactivateButton] = useState<boolean>(false);
	const [showActiveButton, setShowActiveButton] = useState<boolean>(false);
	const [showHoldButton, setShowHoldButton] = useState<boolean>(false);
	const [showUpdateButton, setShowUpdateButton] = useState<boolean>(false);
	const [showEditButton, setShowEditButton] = useState<boolean>(false);
	const [showDraftButton, setShowDraftButton] = useState<boolean>(false);
	const [showUploadPlayerTab, setShowUploadPlayerTab] = useState<boolean>(false);
	const [campaignPeriodFrom, setCampaignPeriodFrom] = useState<any>(new Date());
	const eligibilityTypeState = useSelector<RootState>(({campaign}) => campaign.eligibilityTypeId, shallowEqual) as number;
	const campaignStatusState = useSelector<RootState>(({campaign}) => campaign.getAllCampaignStatus, shallowEqual) as Array<LookupModel>;
	let campaignState = useSelector<RootState>(({campaign}) => campaign.campaign, shallowEqual) as CampaignModel;
	const campaignEligibilityType = useSelector<RootState>(({campaign}) => campaign.getEligibilityType, shallowEqual) as Array<LookupModel>;
	const campaignInPeriod = useSelector<RootState>(({campaign}) => campaign.getCampaignPeriod, shallowEqual) as Array<CustomLookupModel>;
	const campaignRetentionPlayerState = useSelector<RootState>(
		({campaign}) => campaign.campaignRetentionPlayers,
		shallowEqual
	) as Array<RetentionCampaignPlayerListModel>;
	const campaignPeriodFromState = useSelector<RootState>(({campaign}) => campaign.campaignPeriodFrom, shallowEqual) as any;
	const getAllCampaignCustomEvent = useSelector<RootState>(({campaign}) => campaign.getAllCampaignCustomEvent, shallowEqual) as Array<LookupModel>;
	const {HubConnected} = useConstant();

	const uploadPlayerList = 'Upload Player List';	
	const { SwalServerErrorMessage,message,SwalFailedMessage } = useConstant();

	useEffect(() => {
		loadCampaignStatus();
		loadCampaignCustomEvent();
		loadCampaignEligibilityTypes();
		loadInPeriods();
		dispatch(campaign.actions.mode(Props.mode));
		if (id != null && id !== 0) {
			loadCampaignById();
		}
		if (Props.mode === pageMode.view.toString()) {
			setIsViewMode(true);
		}
		if (Props.mode === pageMode.create.toString() || Props.mode === pageMode.clone.toString()) {
			setCampaignPeriodFrom(new Date());
			//check if has create access
			if (!userAccess.includes(USER_CLAIMS.CreateCampaignWrite)) history.push('/error/401');
		}
		//Clear Redux
		dispatch(campaign.actions.clearCampaignState());
		dispatch(campaign.actions.campaignRetentionPlayers([]));
		dispatch(campaign.actions.eligibilityTypeId(0));
		dispatch(campaign.actions.campaignStatusId(0));
		dispatch(campaign.actions.campaignPeriodFrom(''))
		dispatch(campaign.actions.campaignPeriodTo(''))
		//check if has clone access
		if (isClone && !userAccess.includes(USER_CLAIMS.CreateCampaignWrite)) {
			history.push('/error/401');
		}

		toggleButtonVisibility();

		return () => {
			dispatch(campaign.actions.clearCampaignState());
			dispatch(campaign.actions.eligibilityTypeId(0));
			//Clear Redux
			dispatch(campaign.actions.campaignRetentionPlayers([]));
			dispatch(campaign.actions.eligibilityTypeId(0));
			dispatch(campaign.actions.campaignStatusId(0));
			dispatch(campaign.actions.campaignPeriodFrom(''))
			dispatch(campaign.actions.campaignPeriodTo(''))
			window.onbeforeunload = function (event) {
				return;
			};
		};
	}, []);

	// USE EFFECT FOR THE CHANGE NAVIGATION URL
	useEffect(() => {
		if (history && Props.mode !== pageMode.view.toString()) {
			history.block((prompt: any) => {
				if (showWarningModal) {
					alertCampaign(prompt.pathname);
					return false;
				}
			});
		} else {
			history.block(() => {});
		}
		return () => {
			history.block(() => {});
		};
	}, [history, showWarningModal]);

	const handleEditCampaign = () => {
		setShowWarningModal(false);
		history.push(`/campaign-management/campaign/edit/${campaignState.campaignId}`);
	};

	const setCampaignStatuseNameBadge = (value: CampaignStatusEnum) => {
		switch (value) {
			case CampaignStatusEnum.Draft:
				setBadgeStyle('badge badge-light-primary');
				break;
			case CampaignStatusEnum.Activate:
				setBadgeStyle('badge badge-light-success');
				break;
			case CampaignStatusEnum.Inactive:
			case CampaignStatusEnum.Onhold:
				setBadgeStyle('badge badge-light-dark');
				break;
			case CampaignStatusEnum.Ended:
				setBadgeStyle('badge badge-light-danger');
				break;
			default:
				break;
		}
	};

	const handleButtonNextTab = (val: string) => {
		let nextTab = 0;
		if (selectedTab) nextTab = +selectedTab + 1;

		setSelectedTab(nextTab.toString());
		disabledButton(nextTab.toString());
	};

	const handleButtonPreviousTab = (val: string) => {
		let prevTab = 0;
		if (selectedTab) prevTab = +selectedTab - 1;

		setSelectedTab(prevTab.toString());
		disabledButton(prevTab.toString());
	};

	const handleNavigateTab = (val: any) => {
		setSelectedTab(val);
		disabledButton(val);
	};

	/* END CONST */
	function toggleButtonVisibility() {
		hideAllActionButtons();
		if (Props.mode === pageMode.view.toString()) {
			setShowEditButton(true);
			setShowWarningModal(false);
		}
		if (Props.mode === pageMode.edit.toString()) {
			setShowUpdateButton(true);
		}
		if (campaignState.campaignId === 0 || campaignState.campaignId === -1) {
			dispatch(campaign.actions.campaignStatusId(CampaignStatusEnum.Draft));
			setShowDraftButton(true);
		} else if (
			Props.mode !== pageMode.view.toString() &&
			campaignState.campaignStatusId === CampaignStatusEnum.Draft &&
			campaignState.campaignId > 0
		) {
			setShowActiveButton(true);
		} else if (
			Props.mode !== pageMode.view.toString() &&
			campaignState?.campaignStatusId === CampaignStatusEnum.Activate &&
			campaignState.campaignId > 0
		) {
			setShowHoldButton(true);
		} else if (
			Props.mode !== pageMode.view.toString() &&
			campaignState.campaignStatusId === CampaignStatusEnum.Onhold &&
			campaignState.campaignId > 0
		) {
			setShowDeactivateButton(true);
			setShowActiveButton(true);
		} else if (campaignState.campaignStatusId >= CampaignStatusEnum.Completed && campaignState.campaignId > 0) {
			setShowEditButton(false);
			setShowUpdateButton(false);
		}
	}

	function hideAllActionButtons() {
		setShowActiveButton(false);
		setShowDeactivateButton(false);
		setShowHoldButton(false);
		setShowEditButton(false);
		setShowDraftButton(false);
	}

	const hasExchangeRateError = () => {
		let hasError;
		//Check if the exchange Rate has value
		campaignState.campaignConfigurationExchangeRateModel.forEach((element) => {
			if (isNaN(Number(element?.exchangeRate)) || element?.exchangeRate == 0) {
				hasError = true;
			}
		});
		return hasError;
	};

	const handleSaveWithUploadPlayer = (campaignStatusEnum?: CampaignStatusEnum) => {
		if (campaignRetentionPlayerState.length === 0) {
			validateCampaignHasPlayer(campaignState.campaignId, campaignState.campaignGuid).then((response) => {
				if (response.status && !response.data) {
					swal({
						title: 'Confirmation',
						text: 'No player has been uploaded in this campaign, would you like to proceed?',
						icon: 'warning',
						buttons: ['No', 'Yes'],
						dangerMode: true,
					}).then((handleSaveUploadPlayer) => {
						if (handleSaveUploadPlayer) {
							setModalShow(false);
							setLoading(true);
							setShowWarningModal(false);
							handleSubmitCampaign(campaignStatusEnum);
						} else {
							setSelectedTab(campaignTab.campaignPlayerList);
						}
					});
				}
				return true;
			});
		}
		return true;
	};

	const handleUpdateCampaign = (campaignStatusEnum?: CampaignStatusEnum) => {
		if (handleValidateFields()) {
			return swal(SwalFailedMessage.title, message.requiredAllFields, SwalFailedMessage.icon);
		}
		if(campaignStatusEnum === CampaignStatusEnum.Activate && validateCampaignCommunicationMessageConfig() ){
			return swal(SwalFailedMessage.title, message.requiredAllFields, SwalFailedMessage.icon);
		}

		//To check wether the user retain the original campaign period or made an update.
		if (campaignPeriodFrom != campaignState.campaignInformationModel.campaignPeriodFrom && new Date(campaignPeriodFromState) <= new Date()) {
			return swal('Failed', 'Unable to proceed, Campaign Start date and time must be higher than current date and time', 'error');
		}

		if (campaignState.campaignInformationModel.campaignPeriodFrom > campaignState.campaignInformationModel.campaignPeriodTo) {
			return swal('Failed', 'Unable to proceed, Campaign end date and time must be higher than Campaign Start date', 'error');
		}

		if (hasExchangeRateError()) return swal('Failed', 'Unable to update, please complete the Exchange Rate configuration', 'error');

		if (
			campaignState.campaignConfigurationModel.eligibilityTypeId === EligibilityTypeEnum.UploadPlayerList &&
			campaignRetentionPlayerState.length === 0 &&
			!handleSaveWithUploadPlayer(campaignStatusEnum)
		) {
			return;
		}
		let action = Props.mode === pageMode.edit.toString() ? ' update ' : ' create ';
		let confirmationMessage = 'This action will' + action + 'the Campaign Record, please confirm';

		switch (campaignStatusEnum) {
			case CampaignStatusEnum.Draft:
			case CampaignStatusEnum.Ended:
				confirmationMessage = 'This action will' + action + 'the Campaign Record, please confirm';
				break;
			case CampaignStatusEnum.Activate:
				confirmationMessage =
					'This action will activate the Campaign Record. Some information will not be editable after activation. Please ensure your changes have already been updated before proceeding, please confirm to Activate the campaign';
				break;
			case CampaignStatusEnum.Inactive:
				confirmationMessage =
					'This action will deactivate the Campaign Record, all services will be stopped and can’t be reactivated, please confirm to Deactivate the campaign';
				break;
			case CampaignStatusEnum.Onhold:
				confirmationMessage =
					'This action will set the campaign status to On Hold, all services will be stopped and will affect campaign’s progress, please confirm to Hold the campaign';
				break;
			default:
				break;
		}
		swal({
			title: 'Confirmation',
			text: confirmationMessage,
			icon: 'warning',
			buttons: ['No', 'Yes'],
			dangerMode: true,
		}).then((willSave) => {
			if (willSave) {
				setModalShow(false);
				setLoading(true);
				setShowWarningModal(false);
				handleSubmitCampaign(campaignStatusEnum);
			}
		});
	};

	const isEmpty = (value: any) => {
		const whatType = typeof value;
		switch (whatType) {
			case dataType.string.toString():
				return Boolean(value.trim() === '' || value === null || value === undefined);
			case dataType.number.toString():
			case dataType.undefined.toString():
			case dataType.object.toString():
				return Boolean(value === 0 || value === null || value === undefined);
			default:
				break;
		}
	};
	const validateCampaignInformationFields = () =>{
		if(isEmpty(campaignState.campaignInformationModel.brandId) ||
		isEmpty(campaignState.campaignInformationModel.campaignPeriodFrom?.toLocaleString()) ||
		isEmpty(campaignState.campaignInformationModel.campaignPeriodTo?.toLocaleString()) ||
		isEmpty(campaignState.campaignInformationModel.campaignReportPeriod) ||
		isEmpty(campaignState.campaignInformationModel.campaignTypeId) ||
		campaignState.campaignInformationCurrencyModel.length === 0
		){
			return true
		}
		return false;
	}
	const validateCampaignConfigurationFields = () => {
		if(isEmpty(campaignState.campaignConfigurationModel.inPeriodId)
		|| (campaignState.campaignConfigurationModel.eligibilityTypeId == 0 || campaignState.campaignConfigurationModel.eligibilityTypeId.toString() === '0')  
		|| (campaignState.campaignConfigurationModel.eligibilityTypeId == EligibilityTypeEnum.Segmentation && isEmpty(campaignState.campaignConfigurationModel.segmentId)) 
		|| (campaignState.campaignConfigurationCommunicationModel.messageGroupId == MessageGroupEnum.Call && isEmpty(campaignState.campaignConfigurationModel.agentId)) 
		|| (campaignState.campaignConfigurationModel.isAutoTag && isEmpty(campaignState.campaignConfigurationModel.autoTaggingId)) 
		|| (campaignState.campaignConfigurationCommunicationModel.messageGroupId !== 0 && campaignState.campaignConfigurationCommunicationModel.messageGroupId === MessageGroupEnum.Call && isEmpty(campaignState.campaignInformationModel.surveyTemplateId))
		)
		{
			return true
		}
		return false;
	}
	const validateCampaignConfigurationCommFields=() => {
		if((campaignState.campaignConfigurationCommunicationModel.messageGroupId === MessageGroupEnum.Call && isEmpty(campaignState.campaignConfigurationModel.validationRulesId)) 
		|| (campaignState.campaignConfigurationCommunicationModel.messageGroupId === MessageGroupEnum.Call && isEmpty(campaignState.campaignConfigurationModel.goalParameterPointSettingId)) 
		|| (campaignState.campaignConfigurationCommunicationModel.messageGroupId === MessageGroupEnum.Call && isEmpty(campaignState.campaignConfigurationModel.pointValueSettingId)) 
		|| (campaignState.campaignConfigurationCommunicationModel.messageGroupId === MessageGroupEnum.Call && isEmpty(campaignState.campaignConfigurationModel.goalParameterPointSettingId)) 
		|| (campaignState.campaignConfigurationCommunicationModel.messageGroupId === MessageGroupEnum.Call && (isEmpty(campaignState.campaignIncentiveDataSourceModel?.countParameterId) && isEmpty(campaignState.campaignIncentiveDataSourceModel?.amountParameterId))) 
		){
			return true;
		}
		return false;
	}
	const handleValidateFields = () => {
		if (isEmpty(campaignState.campaignName)
			|| validateCampaignInformationFields() 
			|| validateCampaignConfigurationFields() 
			|| (campaignState.campaignId === 0 && isEmpty(campaignState.campaignConfigurationCommunicationModel.messageType)) 
			|| campaignState.campaignConfigurationGoalModel.length === 0 
			|| isEmpty(campaignState.campaignConfigurationCommunicationModel.messageGroupId) 
			|| isEmpty(campaignState.campaignConfigurationModel.primaryGoalId) 
			|| validateCampaignConfigurationCommFields()
			|| (campaignState.campaignConfigurationModel.segmentTypeId?.toString() === SegmentTypes.Distribution && !isEmpty(campaignState.campaignConfigurationModel.segmentTypeId) && isEmpty(campaignState.campaignConfigurationModel.varianceId))
		  ) {
			return true;
		  }
		  
		  return false;
	};
	const validateCampaignCommunicationMessageConfig = () => {
		return (
		  campaignState.campaignConfigurationCommunicationModel.messageGroupId !== MessageGroupEnum.Call &&
		  campaignState.campaignCommunicationCustomEventModel.length === 0
		);
	  };
	const paramSaveCampaign = (campaignStatusEnum?: CampaignStatusEnum) =>{
		let campaignStatusId =campaignStatusEnum ?? campaignState.campaignStatusId;
		campaignState.userId = userAccessId.toString();
		campaignState.queueId = Guid.create().toString();
		campaignState.campaignStatusId = campaignStatusId;
		dispatch(campaign.actions.campaign({...campaignState}));
		if (campaignState.campaignId < 0) {
			campaignState.campaignId = 0;
		}
	}
	const handleConnectionError = () => {
		swal('Failed', 'Problem connecting to the server, Please refresh', 'error');
	}
	const handleSaveCampaignError = (response: any, messagingHub: any) => {
		if (response.data.status !== HttpStatusCodeEnum.Ok) {
			messagingHub.stop();
			if (response.data.status === HttpStatusCodeEnum.Conflict) {
				setLoading(false);
				disableSplashScreen();
			}
			 swal('Failed', response.data.message, 'error');
		}
	  };
	const handleSubmitCampaign = (campaignStatusEnum?: CampaignStatusEnum) => {
		enableSplashScreen();
		setTimeout(() => {
			const messagingHub = hubConnection.createHubConnenction();
			messagingHub
				.start()
				.then(() => {
					// CHECKING STATE CONNECTION
					if (messagingHub.state !== HubConnected) {
						handleConnectionError()
						return
					}
						// PARAMETER TO PASS ON API GATEWAY //
						paramSaveCampaign(campaignStatusEnum);
						// REQUEST FIRST TO GATEWAY IF TRANSACTION WAS VALID
						saveCampaign(campaignState)
							.then((response) => {
								// IF REQUEST IS SUCCESS THEN CONSUME CALLBACK API
								handleSaveCampaignError(response,messagingHub);
								messagingHub.on(campaignState.queueId.toString(), (message) => {
									// CALLBACK API
									let resultData = JSON.parse(message.remarks);
									setLoading(false);
									setIsViewMode(true);
									setShowWarningModal(false);
									messagingHub.off(campaignState.queueId.toString());
									messagingHub.stop();
									if (resultData.Status === HttpStatusCodeEnum.Ok) {
										swal('Success', 'Transaction successfully submitted', 'success');
										let campaignId = resultData.Data?.CampaignId;
										history.push(`/campaign-management/campaign/view/${campaignId}`);
									} else {
										swal('Failed', 'Problem connecting to the server, Please refresh', 'error');
									}
									disableSplashScreen();
								});
								setTimeout(() => {
									if (messagingHub.state === HubConnected) {
										messagingHub.stop();
										setLoading(false);
									}
								}, 30000);
							})
							.catch(() => {
								messagingHub.stop();
								setLoading(false);
								swal(SwalServerErrorMessage.title, SwalServerErrorMessage.textError, SwalServerErrorMessage.icon);
							});
							
				})
				.catch((err) =>{swal(SwalServerErrorMessage.title, SwalServerErrorMessage.textErrorStartingConnection + err, SwalServerErrorMessage.icon); setLoading(false)});
		}, 1000);
	};

	const loadCampaignStatus = () => {
		if (campaignStatusState.length === 0) {
			getAllCampaignStatus().then((response) => {
				if (response.status === HttpStatusCodeEnum.Ok) {
					dispatch(campaign.actions.getAllCampaignStatus(response.data));
				} else {
					swal('Failed', 'Error getting Message Type List', 'error');
				}
			});
		}
	};

	const loadCampaignEligibilityTypes = () => {
		if (campaignEligibilityType.length === 0) {
			getEligibilityType().then((response) => {
				if (response.status === HttpStatusCodeEnum.Ok) {
					dispatch(campaign.actions.getEligibilityType(response.data));
				} else {
					swal('Failed', 'Error getting Eligibility type List', 'error');
				}
			});
		}
	};

	const loadInPeriods = () => {
		if (campaignInPeriod.length === 0) {
			GetCampaignPeriodBySourceId(MasterReference.DatasourceAllId).then((response) => {
				if (response.status === HttpStatusCodeEnum.Ok) {
					dispatch(campaign.actions.getCampaignPeriod(response.data));
				} else {
					swal('Failed', 'Error getting Campaign Period List', 'error');
				}
			});
		}
	};

	const setCampaignStatus = () => {
		if (campaignState?.campaignStatusId > 0) {
			if (campaignStatusState !== undefined && campaignStatusState.length > 0) {
				const statusCampaign = campaignStatusState.find((a) => a.value?.toString() === campaignState.campaignStatusId.toString());
				const campaignEnumValue: CampaignStatusEnum = campaignState.campaignStatusId;
				setCampaignStatusName(statusCampaign?.label);
				setCampaignStatuseNameBadge(campaignEnumValue);
			}
		}
	};
	const distpatchCampaign =()=> {
		dispatch(campaign.actions.campaignStatusId(campaignState.campaignStatusId));
		dispatch(campaign.actions.campaign({...campaignState}));
		dispatch(campaign.actions.campaignPeriodFrom(campaignState.campaignInformationModel.campaignPeriodFrom));
		dispatch(campaign.actions.campaignPeriodTo(campaignState.campaignInformationModel.campaignPeriodTo));
	}
	const setGetCampaignById = () => {
		if (isClone) {
			campaignState.campaignId = -1;
			campaignState.campaignStatusId = CampaignStatusEnum.Draft;
		}
		if (!campaignState.campaignConfigurationModel) {
			campaignState.campaignConfigurationModel = CampaignConfigurationModelFactory();
		}
		if (!campaignState.campaignConfigurationCommunicationModel) {
			campaignState.campaignConfigurationCommunicationModel = CampaignConfigurationCommunicationModelFactory();
		}
	}
	const loadCampaignById = () => {
		setTimeout(() => {
			const messagingHub = hubConnection.createHubConnenction();
			messagingHub
				.start()
				.then(() => {
					// CHECKING STATE CONNECTION
					if (messagingHub.state !== HubConnected) {
						handleConnectionError()
						return;
					}
					// PARAMETER TO PASS ON API GATEWAY //
					setLoading(true);
					const request: CampaignIdRequestModel = {
						queueId: Guid.create().toString(),
						userId: userAccessId.toString(),
						campaignId: Number(id),
						isClone: isClone,
					}
					// REQUEST FIRST TO GATEWAY IF TRANSACTION WAS VALID
					getCampaignById(request)
						.then((response) => {
							// IF REQUEST IS SUCCESS THEN CONSUME CALLBACK API
							if (response.status != HttpStatusCodeEnum.Ok) {
								handleSaveCampaignError(response, messagingHub);
								return
							}
							messagingHub.on(request.queueId.toString(), (message) => {
								// CALLBACK API
								getCampaignByIdResult(message.cacheId)
									.then((result) => {
										setLoading(false);
										let resultData = Object.assign({}, result.data);
										campaignState = resultData;
										setCampaignStatus();
										toggleButtonVisibility();
										setGetCampaignById();
										setCampaignPeriodFrom(campaignState.campaignInformationModel.campaignPeriodFrom);
										distpatchCampaign();
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
						})
						.catch(() => {
							messagingHub.stop();
							swal('Failed', 'Problem in getting campaign list', 'error');
						});
				})
				.catch((err) => swal('Failed', 'Error while starting connection: ' + err, 'error'));
		}, 1000);
	}

	const alertCampaign = (promptNamePath: any) => {
		swal({
			title: 'Confirmation',
			text: 'Any changes will be discarded, please confirm',
			icon: 'warning',
			buttons: ['No', 'Yes'],
			dangerMode: true,
		}).then((confirmSave) => {
			if (confirmSave) {
				history.block(() => {});
				history.push(promptNamePath);
			}
		});
	};

	window.onbeforeunload = confirmExit;
	function confirmExit() {
		if (Props.mode !== pageMode.view) return true;
		else return;
	}

	// Functions
	function disabledButton(val: string) {
		if (!val) { return }
		
		if (val === campaignTab.campaignInfoTab) {
			setDisabledPrevious(true);
			setDisabledNext(false);
		} else if ((showUploadPlayerTab && val === campaignTab.campaignPlayerList)
			    || (!showUploadPlayerTab && val === campaignTab.campaignCommunication)) {
			setDisabledPrevious(false);
			setDisabledNext(true);
		}
		else if (((val === campaignTab.campaignConfigTab) 
				|| (showUploadPlayerTab && val === campaignTab.campaignCommunication))) {
			setDisabledPrevious(false);
			setDisabledNext(false);
		}
	}

	const formik = useFormik({
		initialValues,
		onSubmit: async (values, {setStatus, setSubmitting, resetForm, setValues}) => {},
	});

	useEffect(() => {
		setShowUploadPlayerTab(false);
		if (eligibilityTypeState !== undefined && eligibilityTypeState !== 0) {
			let selectedCampaignEligibilityType = campaignEligibilityType.find(
				(a) => a.value?.toString() === campaignState.campaignConfigurationModel.eligibilityTypeId.toString()
			);
			if (selectedCampaignEligibilityType?.label.trimEnd() === uploadPlayerList) {
				setShowUploadPlayerTab(true);
			}
		}
	}, [eligibilityTypeState]);

	// UseEffect for accuracy
	useEffect(() => {
		disabledButton(selectedTab);
	}, [showUploadPlayerTab]);

	const loadCampaignCustomEvent = () => {
		if (getAllCampaignCustomEvent.length === 0) {
			getAllCampaignCustomEventSettingName().then((response) => {
				if (response.status === HttpStatusCodeEnum.Ok) {
					dispatch(campaign.actions.getAllCampaignCustomEvent(response.data));
				} else {
					swal('Failed', 'Error getting Message Type List', 'error');
				}
			});
		}
	};

	return (
		<FormContainer onSubmit={formik.handleSubmit}>
			<MainContainer>
				<FormHeader headerLabel={'Create Campaign'} />
				<ContentContainer>
					<FormGroupContainer>
						{!isViewMode && <div className='col-lg-12'>{initialValues.campaignName?.toString()}</div>}
						<div className='d-flex col-lg-3 align-items-center'>
							<label className='fw-bolder me-5'>Campaign ID: </label>
							<span className='ml-5'>{campaignState.campaignId <= 0 ? '' : campaignState.campaignId}</span>
						</div>
						<div className='d-flex col-lg-3 align-items-center'>
							<label className='fw-bolder me-5'>Campaign Name: </label>
							<span className=' ml-5' style={{wordBreak: 'break-all'}}>
								{' '}
								{campaignState.campaignName}
							</span>
						</div>
						<div className='d-flex col-lg-3 align-items-center'>
							<label className='fw-bolder'>Campaign Status: </label>
							<span className={'' + badgeStyle === '' ? '' : badgeStyle} style={{marginLeft: 10}}>
								{' '}
								{campaignStatusName}
							</span>
						</div>
						<div className='col-lg-3'>
							<div className='float-end'>
								{showHoldButton && (
									<MlabButton
										access={userAccess.includes(USER_CLAIMS.HoldCampaignWrite) === true}
										label='Hold'
										style={ElementStyle.primary}
										type={'button'}
										weight={'solid'}
										size={'sm'}
										onClick={() => setModalShow(true)}
										disabled={loading}
									/>
								)}
								{showDeactivateButton && (
									<MlabButton
										access={userAccess.includes(USER_CLAIMS.EditCampaignWrite) === true || userAccess.includes(USER_CLAIMS.EditCampaignRead) === true}
										label='Deactivate'
										style={ElementStyle.danger}
										type={'button'}
										weight={'solid'}
										size={'sm'}
										onClick={() => handleUpdateCampaign(CampaignStatusEnum.Inactive)}
										disabled={loading}
									/>
								)}
								{showActiveButton && (
									<MlabButton
										access={true}
										label='Activate'
										style={ElementStyle.success}
										type={'button'}
										weight={'solid'}
										size={'sm'}
										onClick={() => handleUpdateCampaign(CampaignStatusEnum.Activate)}
										disabled={loading}
									/>
								)}
							</div>
						</div>
						<div className='col-lg-12 mt-3'></div>
						<div className='col-lg-12 mt-3'></div>
						{campaignState.campaignId > 0 && (
							<>
								<div className='col-lg-3'>
									<label className='fw-bolder'>Created Date: </label>
									<div className='col-sm-10'>
										<span> {moment(new Date(campaignState.createdDate)).format('MM/DD/YYYY HH:mm')} </span>
									</div>
								</div>
								<div className='col-lg-3'>
									<label className='fw-bolder'>Created By: </label>
									<div className='col-sm-10'>
										<span> {campaignState.createdByName}</span>
									</div>
								</div>
								<div className='col-lg-3'>
									<label className='fw-bolder'>Last Modified Date: </label>
									<div className='col-sm-10'>
										<span> {campaignState.updatedDate == null ? '' : moment(new Date(campaignState.updatedDate)).format('MM/DD/YYYY HH:mm')}</span>
									</div>
								</div>
								<div className='col-lg-3'>
									<label className='fw-bolder'>Modified By: </label>
									<div className='col-sm-10'>
										<span> {campaignState.updatedByName}</span>
									</div>
								</div>
								<div className='col-lg-12 mt-3'></div>
								<div className='col-lg-12 mt-3'></div>
							</>
						)}
						<Tabs defaultActiveKey={selectedTab} activeKey={selectedTab} id='uncontrolled-tab' onSelect={handleNavigateTab} className='mb-3 campaign'>
							<Tab eventKey={campaignTab.campaignInfoTab} title='Information' tabClassName='campaign-tabitem'>
								<CampaignInformation formik={formik} initialValues={initialValues} />
							</Tab>
							<Tab eventKey={campaignTab.campaignConfigTab} title='Configuration' tabClassName='campaign-tabitem'>
								<CampaignConfiguration />
							</Tab>
							<Tab eventKey={campaignTab.campaignCommunication} title='Communication' tabClassName='campaign-tabitem'>
								<CampaignCommunicationTab/>
							</Tab>
							{showUploadPlayerTab && (
								<Tab eventKey={campaignTab.campaignPlayerList} title='Player List' tabClassName='campaign-tabitem'>
									<CampaignUploadPlayer />
								</Tab>
							)}
						</Tabs>
					</FormGroupContainer>
				</ContentContainer>
				<FooterContainer>
					<PaddedContainer>
						<div className='col-lg-12'>
							{!isViewMode &&
								showDraftButton &&
								(userAccess.includes(USER_CLAIMS.CreateCampaignRead) === true || userAccess.includes(USER_CLAIMS.CreateCampaignWrite) === true) && (
								<button type='submit' onClick={(e: any) => handleUpdateCampaign(CampaignStatusEnum.Draft)} className='btn btn-primary btn-sm me-2'>
									{!loading && (
										<span className='indicator-label'>Save as Draft</span>
									)}
									{loading && (
										<span className='indicator-progress' style={{ display: 'block' }}>
											Please wait...{/**/}
											<span className='spinner-border spinner-border-sm align-middle ms-2'></span>
										</span>
									)}
								</button>
								)}
							{!isViewMode &&
								showUpdateButton &&
								(userAccess.includes(USER_CLAIMS.EditCampaignWrite) === true || userAccess.includes(USER_CLAIMS.EditCampaignRead) === true) && (
									<button type='submit' onClick={(e: any) => handleUpdateCampaign()} className='btn btn-primary btn-sm me-2'>
										{!loading && showUpdateButton && <span className='indicator-label'>Update Campaign</span>}
										{loading && !isViewMode && (
											<span className='indicator-progress' style={{display: 'block'}}>
												Please wait...{/**/}
												<span className='spinner-border spinner-border-sm align-middle ms-2'></span>
											</span>
										)}
									</button>
								)}
							{isViewMode && showEditButton && (
								<MlabButton
									access={userAccess.includes(USER_CLAIMS.EditCampaignWrite) === true}
									label='Edit Campaign'
									style={ElementStyle.primary}
									type={'button'}
									weight={'solid'}
									size={'sm'}
									loading={loading}
									loadingTitle={'Please wait...'}
									onClick={() => handleEditCampaign()}
									disabled={loading}
								/>
							)}
							<button
								type='button'
								className='btn  btn-primary btn-sm me-2 float-end '
								onClick={() => handleButtonNextTab('2')}
								disabled={disabledNext}
							>
								Next
								<FontAwesomeIcon icon={faChevronRight} style={{marginLeft: 5}} />
							</button>
							<button
								type='button'
								className='btn btn-primary btn-sm me-2 float-end '
								onClick={() => handleButtonPreviousTab('1')}
								disabled={disabledPrevious}
							>
								<FontAwesomeIcon icon={faChevronLeft} style={{marginRight: 5}} />
								Previous
							</button>
						</div>
					</PaddedContainer>
				</FooterContainer>
				<CampaignHoldReasonModal
					showForm={modalShow}
					closeModal={() => setModalShow(false)}
					submitCampaign={() => handleUpdateCampaign(CampaignStatusEnum.Onhold)}
				/>
			</MainContainer>
		</FormContainer>
	);
};

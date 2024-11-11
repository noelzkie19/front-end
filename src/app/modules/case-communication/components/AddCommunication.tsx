import {faCopy, faEye, faEyeSlash, faInfoCircle} from '@fortawesome/free-solid-svg-icons';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {AgGridReact} from 'ag-grid-react';
import {useFormik} from 'formik';
import React, {useCallback, useEffect, useState} from 'react';
import {ButtonGroup, Col, InputGroup, Row} from 'react-bootstrap-v5';
import {shallowEqual, useDispatch, useSelector} from 'react-redux';
import Select from 'react-select';
import swal from 'sweetalert';
import {RootState} from '../../../../setup';
import * as hubConnection from '../../../../setup/hub/MessagingHub';
import {
	BasicDateTimePicker,
	BasicFieldLabel,
	BasicTextInput,
	ButtonsContainer,
	DefaultPrimaryButton,
	DefaultSelect,
	DefaultTableButton,
	DismissibleToast,
	ErrorLabel,
	FieldContainer,
	FormContainer,
	FormHeader,
	MLabQuillEditor,
	MainContainer,
	MlabButton,
	PaddedContainer,
	RequiredLabel,
} from '../../../custom-components';
import {useUserProfile} from '../../../custom-functions';
import {PlayerModel} from '../../player-management/models/PlayerModel';
import {GetPlayerProfile, SavePlayerContact} from '../../player-management/redux/PlayerManagementService';
import {USER_CLAIMS} from '../../user-management/components/constants/UserClaims';
import {
	AddCaseCommunicationRequest,
	AddCommunicationFeedbackRequest,
	AddCommunicationRequest,
	AddCommunicationSurveyRequest,
	CaseCampaignByIdRequest,
	CaseInformationRequest,
	CaseInformationResponse,
	CloudTalkMakeACallRequestModel,
	CommunicationFeedBackResponse,
	FormattedFlyFoneCdrUdt,
	SamespaceMakeACallRequestModel,
	SurveyQuestionAnswerResponse,
	SurveyQuestionResponse,
} from '../models';

import {addHours, addSeconds, isAfter, isSameSecond, subMinutes} from 'date-fns';
import {Guid} from 'guid-typescript';
import {Prompt, useHistory, useParams} from 'react-router-dom';
import {ElementStyle, MessageGroupEnum, MessageStatusEnum, MessageTypeEnum} from '../../../constants/Constants';
import useConstant from '../../../constants/useConstant';
import CellRenderRowIndex from '../../../custom-components/grid-components/CellRenderRowIndex';
import useFnsDateFormatter from '../../../custom-functions/helper/useFnsDateFormatter';
import useSystemHooks from '../../../custom-functions/system/useSystemHooks';
import {usePromptOnUnload} from '../../../custom-helpers';
import * as auth from '../../../modules/auth/redux/AuthRedux';
import {isJsonSizeValid} from '../../../utils/helper';
import {CloudTalkCdrResponseModel, CloudTalkGetCallRequestModel, FlyFoneOutboundCallRequestModel} from '../../case-management/models';
import {SamespaceGetCallRequestModel} from '../../case-management/models/request/SamespaceGetCallRequestModel';
import {SamespaceGetCallResponseModel} from '../../case-management/models/response/SamespaceGetCallResponseModel';
import {PLAYER_CONTANTS} from '../../player-management/constants/PlayerContants';
import {PlayerContactRequestModel} from '../../player-management/models/PlayerContactRequestModel';
import {usePlayerManagementHooks} from '../../player-management/shared/usePlayerManagementHooks';
import {SwalDetails} from '../../system/components/constants/CampaignSetting';
import {UseUserManagementHooks} from '../../user-management/components/shared/hooks';
import {CommunicationProviderAccountUdt} from '../../user-management/models';
import UseCaseCommConstant from '../UseCaseCommConstant';
import * as caseCommunication from '../redux/CaseCommunicationRedux';
import {
	AddCaseCommunication,
	GetCaseCampaignById,
	GetCaseInformationbyId,
	GetCommunicationSurveyQuestionAnswers,
	SendGetCaseCampaignById,
	SendGetCaseInformationbyId,
} from '../services/CaseCommunicationApi';
import {CampaignCaseCommSurvey, CaseCommReminder, CaseCommTooltip} from './shared/components';
import {useCaseCommHooks, useCaseCommOptions} from './shared/hooks';
import { ColDef, ColGroupDef } from 'ag-grid-community';


const initialValues = {
	feedbackDetails: '',
	solutionProvided: '',
	campaignName: '',
};

const AddCommunication: React.FC = () => {
	// Get Redux Store
	const userAccess = useSelector<RootState>(({auth}) => auth.access, shallowEqual) as string;
	const userAccessId = useSelector<RootState>(({auth}) => auth.userId, shallowEqual) as number;
	const {access} = useSelector<RootState>(({auth}) => auth, shallowEqual) as auth.IAuthState;
	/**
	 *  ? Hooks
	 */
	const {
		campaignCallPlayer,
		isCalling,
		callingCode,
		setIsCalling,
		getFlyfoneCdrData,
		isFetching,
		flyfoneCdrData,
		convertCommunicationContentToPostRequest,
		cloudTalkCall,
		getCloudTalkCall,
		cloudTalkCdr,
		samespaceCall,
		getSamespaceCall,
		samespaceCdrData,
		UploadCaseCommContentImageToMlabStorage,
	} = useCaseCommHooks();
	const dispatch = useDispatch();

	// States with interface model
	const [playerInformation, setPlayerInformation] = useState<PlayerModel>();

	// Constants
	const [isShotPrompt, setIsShotPrompt] = useState<boolean>(true);
	const history = useHistory();
	const {caseId}: {caseId: number} = useParams();
	const userProfile = useUserProfile();
	usePromptOnUnload(isShotPrompt, 'Are you sure you want to leave?');
	const {successResponse, HubConnected, tinyMCEKey, properFormatDateHourMinSec, message} = useConstant();
	const {postDateHourMinSecFormat} = UseCaseCommConstant();

	// States
	// Player Informations
	const [contactMobileType, setContactMobileType] = useState<string>('password');
	const [contactEmail, setContactEmail] = useState<string>('password');
	const [isShowContactTypeMobile, setIsShowContactTypeMobile] = useState<boolean>(false);
	const [isShowEmailText, setIsShowEmailText] = useState<boolean>(false);
	const [playerDetailsShow, setPlayerDetailsShow] = useState<boolean>(false);
	const [addCommPlayerBrand, setAddCommPlayerBrand] = useState<string | undefined>('');
	const [addCommPlayercurrency, setAddCommPlayercurrency] = useState<string | undefined>('');
	const [addCommUserName, setAddCommUserName] = useState<string | undefined>('');
	const [playerName, setPlayerName] = useState<string | undefined>('');
	const [vipLevel, setVipLevel] = useState<string | undefined>('');
	const [payment, setPayment] = useState<string | undefined>('');
	const [internalAccount, setInternalAccount] = useState<string | undefined>('');
	const [marketingChannel, setMarketingChannel] = useState<string | undefined>('');
	const [marketingSource, setMarketingSource] = useState<string | undefined>('');
	const [deposited, setDeposited] = useState<string | undefined>('');
	const [addCommPlayerEmail, setAddCommPlayerEmail] = useState<string>('');
	const [addCommPlayerMobilePhone, setAddCommPlayerMobilePhone] = useState<string>('');

	// Case information
	const [selectedTopic, setSelectedTopic] = useState<any>('');
	const [selectedSubtopic, setSelectedSubtopic] = useState<any>('');
	const [topicId, setTopicId] = useState<number>(0);
	const [subtopicId, setSubtopicId] = useState<number>(0);

	const [caseTypeId, setCaseTypeId] = useState<number>(0);
	const [campaignId, setCampaignId] = useState<number>(0);
	const [caseStatusId, setCaseStatusId] = useState<number>(0);
	const [playerId, setPlayerId] = useState<string>('0');
	const [caseDetailsShow, setCaseDetailsShow] = useState<boolean>(false);
	const [caseTypeName, setCaseTypeName] = useState<string>('');
	const [caseStatusname, setCaseStatusname] = useState<string>('');
	const [caseCreatorName, setCaseCreatorName] = useState<string | undefined>('');
	const [caseCreatedDate, setCaseCreatedDate] = useState<string | undefined>('');
	const [caselastModifiedDate, setCaselastModifiedDate] = useState<string | undefined>('');
	const [caselastModifiedAgent, setCaselastModifiedAgent] = useState<string>('');
	const [campaignName, setCampaignName] = useState<string>('');
	const [isContactable, setIsContactable] = useState<boolean>(true);
	const [hasAddCommunicationFetchedCdr, setHasAddCommunicationFetchedCdr] = useState<boolean>(false);
	const [addCommunicationCreatedDate, setAddCommunicationCreatedDate] = useState<string>('');

	// Communication
	const [selectedPurpose, setSelectedPurpose] = useState<any>('');
	const [selectedMessageType, setSelectedMessageType] = useState<any>('');
	const [selectedMessageStatus, setSelectedMessageStatus] = useState<any>('');
	const [selectedMessageResponse, setSelectedMessageResponse] = useState<any>('');
	const [startCommunicationDate, setStartCommunicationDate] = useState<any>();
	const [endCommunicationDate, setEndCommunicationDate] = useState<any>();
	const [startCommunicationDatePost, setStartCommunicationDatePost] = useState<string>('');
	const [endCommunicationDatePost, setEndCommunicationDatePost] = useState<string>('');
	const [openStartCommunication, setOpenStartCommunication] = useState<boolean>(false);
	const [openEndCommunication, setOpenEndCommunication] = useState<boolean>(false);
	const [editorKey, setEditorKey] = useState<number>(4);
	const [isDisableCallOnAddComm, setIsDisableCallOnAddComm] = useState<boolean>(false);
	const [isDisableAddCommWhenHasCdr, setIsDisableAddCommWhenHasCdr] = useState<boolean>(false);
	const [isStartCallClick, setIsStartCallClick] = useState<boolean>(false);
	const [addCommToolTipShow, setAddCommToolTipShow] = useState<boolean>(false);

	// Campaign Information
	const [callListNote, setCallListNote] = useState<string>('');
	const [callListNoteId, setCallListNoteId] = useState<number>(0);
	const [surveyTemplateId, setSurveyTemplateId] = useState<number>(0);
	const [brandName, setBrandName] = useState<string>('');

	// Feedback
	const [selectedAddCommFeedbackType, setSelectedAddCommFeedbackType] = useState<any>('');
	const [selectedAddCommFeedbackCategory, setSelectedAddCommFeedbackCategory] = useState<any>('');
	const [selectedAddCommFeedbackAnswer, setSelectedAddCommFeedbackAnswer] = useState<any>('');
	const [hasFeedbackErrors, setHasFeedbackErrors] = useState<boolean>(false);
	const [errorFeedbackMessage, setErrorFeedbackMessage] = useState<string>('');
	const [convertedContent, setConvertedContent] = useState<string>();
	const [rowData, setRowData] = useState<Array<CommunicationFeedBackResponse>>([]);
	const [caseInformation, setCaseInformation] = useState<CaseInformationResponse>();
	const [feedbackData, setFeedbackData] = useState<Array<CommunicationFeedBackResponse>>([]);
	const [addCommFeedbackSolutionProvided, setAddCommFeedbackSolutionProvided] = useState<string>('');
	const [addCommFeedbackDetails, setAddCommFeedbackDetails] = useState<string>('');

	// Survey
	const [surveyQuestion, setSurveyQuestion] = useState<SurveyQuestionResponse[]>([]);
	const [surveyQuestionAnswer, setSurveyQuestionAnswer] = useState<SurveyQuestionAnswerResponse[]>([]);
	const [surveyTemplateTitle, setSurveyTemplateTitle] = useState<string>('');
	const [addCommSurveyRequest, setAddCommSurveyRequest] = useState<AddCommunicationSurveyRequest[]>([]);

	const [isSubmitClicked, setIsSubmitClicked] = useState<boolean>(false);
	const [emailHasIcon, setEmailHasIcon] = useState<boolean>(false);
	const [mobileHasIcon, setMobileHasIcon] = useState<boolean>(false);
	const {validateContactDetailsAccess} = usePlayerManagementHooks();
	const [blindAccount, setBlindAccount] = useState<any>(null);
	const [mlabPlayerId, setMlabPlayerId] = useState<number>(0);
	/**
	 *  ? Hooks
	 */
	const {
		getMessageStatusOptionById,
		messageStatusOptionList,
		getMessageResponseOptionById,
		messageResponseOptionList,
		getMessageTypeOptionList,
		getFeedbackTypeOptionList,
		feedbackTypeOptionList,
		getFeedbackCategoryOptionById,
		feedbackCategoryOptionList,
		getFeedbackAnserOptions,
		feedbackAnswerLoading,
		feedbackAnswerOptionList,
		getTopicOptions,
		topicOptionList,
	} = useCaseCommOptions();

	const {getMasterReference, masterReferenceOptions} = useSystemHooks();
	const {communicationProviderAccounts, getCommunicationProviderAccounts} = UseUserManagementHooks();
	const {mlabFormatDate} = useFnsDateFormatter();
	const messagingHub = hubConnection.createHubConnenction();

	/**
	 * ? Mount load of the page
	 */
	useEffect(() => {
		dispatch(caseCommunication.actions.communicationSurveyQuestionAnswer([]));
		if (caseId !== 0) {
			_clearStorage();
			_getCaseInformation();
			getMessageTypeOptionList();
			getFeedbackTypeOptionList();
			messagePrompt();
			setConvertedContent('-');
			getCommunicationProviderAccounts(userAccessId || 0, true, message.caseCommNoCommProviderOnUser);
			getTopicOptions();
			getMasterReference('');
		} else {
			swal('Failed', 'Problem getting case information', 'error');
		}
	}, []);

	const onGridReady = (params: any) => {
		params.api.paginationGoToPage(4);
		setRowData(feedbackData);
		params.api.sizeColumnsToFit();
	};

	useEffect(() => {
		if (communicationProviderAccounts.filter((obj) => obj.messageGroupId === MessageGroupEnum.Call).length > 0) {
			let commProvObj = communicationProviderAccounts
				.filter((obj) => obj.messageGroupId === MessageGroupEnum.Call)
				.find((obj) => obj.messageTypeName !== '');
			setSelectedMessageType({label: commProvObj?.messageTypeName, value: commProvObj?.messageTypeId});
		}
	}, [communicationProviderAccounts]);

	/**
	 *  ? Watchers
	 */
	useEffect(() => {
		if (flyfoneCdrData !== undefined) {
			populateAddCommunicationFromFlyfoneCdr(flyfoneCdrData);
		}
	}, [flyfoneCdrData]);

	useEffect(() => {
		if (cloudTalkCdr !== undefined) populateAddCommFromCloudTalkCdr(cloudTalkCdr);
	}, [cloudTalkCdr]);

	useEffect(() => {
		if (samespaceCdrData !== undefined) populateAddCommFromSamespaceCdr(samespaceCdrData);
	}, [samespaceCdrData]);

	useEffect(() => {
		setSelectedPurpose(
			masterReferenceOptions
				.filter((masterRefObj) => masterRefObj.masterReferenceParentId === 4)
				.flatMap((x) => x.options)
				.find((x) => x.label.toLowerCase() === 'add communication')
		);
	}, [masterReferenceOptions]);

	useEffect(() => {
		if (selectedMessageType !== undefined) {
			const {value} = selectedMessageType;
			getMessageStatusOptionById(value);
		}
	}, [selectedMessageType]);

	useEffect(() => {
		if (messageResponseOptionList.length === 1) setSelectedMessageResponse(messageResponseOptionList.find((x) => x.label !== ''));
	}, [messageResponseOptionList]);

	useEffect(() => {
		if (feedbackCategoryOptionList.length === 1) setSelectedAddCommFeedbackCategory(feedbackCategoryOptionList.find((x) => x.label !== ''));
	}, [feedbackCategoryOptionList]);

	useEffect(() => {
		if (feedbackTypeOptionList.length === 1) setSelectedAddCommFeedbackType(feedbackTypeOptionList.find((x) => x.label !== ''));
	}, [feedbackTypeOptionList]);

	useEffect(() => {
		if (selectedAddCommFeedbackType !== undefined) {
			const {value} = selectedAddCommFeedbackType;
			getFeedbackCategoryOptionById(value);
		}
	}, [selectedAddCommFeedbackType]);

	useEffect(() => {
		if (feedbackAnswerOptionList.length === 1) {
			const {feedbackAnswerId, feedbackAnswerName, feedbackCategoryName, feedbackTypeName} = feedbackAnswerOptionList[0];
			setSelectedAddCommFeedbackAnswer({
				label: feedbackTypeName + ' - ' + feedbackCategoryName + ' - ' + feedbackAnswerName,
				value: feedbackAnswerId,
			});
		}
	}, [feedbackAnswerOptionList]);

	useEffect(() => {
		if (selectedAddCommFeedbackCategory !== undefined) {
			getFeedbackAnserOptions(selectedAddCommFeedbackType.value, selectedAddCommFeedbackCategory.value, '');
		}
	}, [selectedAddCommFeedbackCategory]);

	useEffect(() => {
		setRowData(feedbackData);
	}, [feedbackData]);

	useEffect(() => {
		if (blindAccount !== null) {
			checkEmail(blindAccount);
			checMobile(blindAccount);
		}
	}, [blindAccount]);

	const checkEmail = (_isBlindAccount: boolean) => {
		const hasViewIcon = validateContactDetailsAccess(access, _isBlindAccount);
		setEmailHasIcon(hasViewIcon);
	};

	const checMobile = (_isBlindAccount: boolean) => {
		const hasViewEyeIcon = validateContactDetailsAccess(access, _isBlindAccount);
		setMobileHasIcon(hasViewEyeIcon);
	};

	/**
	 *  ? API call metthods
	 */
	async function saveContactClick(contactTypeId: number) {
		if (playerId != '0' || playerId != undefined) {
			const request: PlayerContactRequestModel = {
				mlabPlayerId: playerInformation?.mlabPlayerId ?? 0,
				userId: userAccessId,
				pageName: 'ADD_COMMUNICATION',
				contactTypeId: contactTypeId,
			};

			await SavePlayerContact(request)
				.then((response) => {
					if (response.status === successResponse) {
						if (response.data.item2 != null && response.data.item2.thresholdAction === 'Deactivate User Account') {
							dispatch(auth.actions.logout());

							swal({
								icon: 'warning',
								dangerMode: true,
								title: 'Your login session is terminated',
							});
						}
					} else {
						swal('Failed', 'Problem in saving profile contact click', 'error');
					}
				})
				.catch((ex) => {
					swal('Failed', 'Problem in saving profile contact click', 'error');
				});
		}
	}

	const _redirectCaseCommDenied = () => {
		history.push('/error/401');
	};

	const _getCaseInformation = async () => {
		setTimeout(() => {
			messagingHub
				.start()
				.then(() => {
					const request: CaseInformationRequest = {
						queueId: Guid.create().toString(),
						userId: userAccessId.toString(),
						caseInformationId: caseId,
					};
					SendGetCaseInformationbyId(request).then((response) => {
						if (response.status === successResponse) {
							messagingHub.on(request.queueId.toString(), (message) => {
								GetCaseInformationbyId(message.cacheId)
									.then((data) => {
										if (data?.data) {
											setCaseInformation(data.data);
											getPlayerProfile(data.data.playerId, data.data.brandName);
											setBrandName(data.data.brandName);
											_getCaseCampaignInformation(data.data.playerId, data.data.campaignId, data.data.brandName);
											setAddCommunicationCreatedDate(data.data?.createdDate?.toString() ?? '');
											setSelectedTopic({
												label: data.data.topicName,
												value: data.data.topicId.toString(),
											});
											setSelectedSubtopic({
												label: data.data.subtopicName,
												value: data.data.subtopicId.toString(),
											});
											setTopicId(data.data.topicId);
											setSubtopicId(data.data.subtopicId);
											setPlayerId(data.data.playerId);
											setCaseTypeId(data.data.caseTypeId);
											setCaseTypeName(data.data.caseTypeName);
											setCaseStatusname(data.data.caseStatusName);
											setCaseCreatorName(data.data.createdByName);
											setCaseCreatedDate(mlabFormatDate(data.data.createdDate, postDateHourMinSecFormat));
											setCaselastModifiedDate(mlabFormatDate(data.data.updatedDate, postDateHourMinSecFormat));
											setCaselastModifiedAgent(data.data.updatedByName);
											setCampaignName(data.data.campaignName);
											setCampaignId(data.data.campaignId);
											setCaseStatusId(data.data.caseStatusId);
										} else {
											_redirectCaseCommDenied();
										}
									})
									.catch(() => {
										console.log('error from callback function');
									});
							});
						} else {
							swal('Failed', 'Problem getting case information', 'error');
						}
					});
				})
				.catch((err) => console.log('Error while starting connection: ' + err));
		}, 1000);
	};

	async function getPlayerProfile(id: string, playerIdBrand: string) {
		await GetPlayerProfile({playerId: id, userId: userAccessId, brandName: playerIdBrand})
			.then((response) => {
				if (response.status === successResponse) {
					let profile: PlayerModel = response.data?.data;
					if (profile) {
						setPlayerInformation(profile);
						setAddCommPlayerBrand(profile.brand);
						setAddCommPlayercurrency(profile.currency);
						setAddCommUserName(profile.username);
						setPlayerName(profile.firstName + ' ' + profile.lastName);
						setVipLevel(profile.vipLevel);
						setPayment(profile.paymentGroup);
						setInternalAccount(profile.internalAccount === true ? 'Yes' : 'No');
						setMarketingChannel(profile.marketingChannel);
						setMarketingSource(profile.marketingSource);
						setDeposited(profile.deposited === true ? 'Yes' : 'No');
						setAddCommPlayerEmail(profile.email);
						setAddCommPlayerMobilePhone(profile.mobilePhone);
						setBlindAccount(!!profile.blindAccount);
						setMlabPlayerId(profile.mlabPlayerId ?? 0);
					} else {
						_redirectCaseCommDenied();
					}
				} else {
					setPlayerInformation(undefined);
				}
			})
			.catch((ex) => {
				console.log('[ERROR] Player Profile: ' + ex);
			});
	}

	const _getCaseCampaignInformation = (playerId: string, campaignId: number, brandName: string) => {
		setTimeout(() => {
			const messagingHub = hubConnection.createHubConnenction();
			messagingHub
				.start()
				.then(() => {
					const request: CaseCampaignByIdRequest = {
						queueId: Guid.create().toString(),
						userId: userAccessId.toString(),
						campaignId: campaignId,
						playerId: playerId,
						brandName: brandName,
					};

					SendGetCaseCampaignById(request).then((response) => {
						if (response.status === successResponse) {
							messagingHub.on(request.queueId.toString(), (message) => {
								GetCaseCampaignById(message.cacheId)
									.then((data) => {
										setCallListNote(data.data.callListNote);
										setCallListNoteId(data.data.callListNoteId);
										setSurveyTemplateId(data.data.surveyTemplateId);
										if (data.data.surveyTemplateId != 0) {
											_getSurveyTemplate(data.data.campaignId);
										}
									})
									.catch((err) => {
										console.log('error from callback function' + err);
									});
							});
						} else {
							swal('Failed', 'Problem getting case campaign information', 'error');
						}
					});
				})
				.catch((err) => console.log('Error while starting connection: ' + err));
		}, 1000);
	};

	const _getSurveyTemplate = (campaignId: number) => {
		GetCommunicationSurveyQuestionAnswers(campaignId)
			.then((response) => {
				if (response.status === successResponse) {
					setSurveyQuestion(response.data?.surveyQuestions);
					setSurveyQuestionAnswer(response.data.surveyQuestionAnswers);
					setSurveyTemplateTitle(response.data.surveyTemplate.surveyTemplateName);
				} else {
					swal('Failed', 'Problem getting survey template', 'error');
				}
			})
			.catch((err) => {
				console.log('Problem in Survey Questions and Answers' + err);
			});
	};

	const addCommunicationCallPlayer = () => {
		setIsStartCallClick(true);
		_setStartCommunicationNow();
		if (selectedMessageType.value === MessageTypeEnum.FlyFoneCall.toString()) addCommCallPlayerViaFlyfone();
		if (selectedMessageType.value === MessageTypeEnum.CloudTalk.toString()) addCommCallPlayerViaCloudTalkPlayer();
		if (selectedMessageType.value === MessageTypeEnum.Samespace.toString()) addCommCallPlayerViaSamespacePlayer();
	};

	const addCommCallPlayerViaFlyfone = () => {
		setIsCalling(false);
		let request: FlyFoneOutboundCallRequestModel = {
			department:
				communicationProviderAccounts.find((commDepartment) => commDepartment.messageTypeId === MessageTypeEnum.FlyFoneCall.toString())?.department ??
				'',
			ext:
				communicationProviderAccounts.find((commAccountId) => commAccountId.messageTypeId === MessageTypeEnum.FlyFoneCall.toString())?.accountID ??
				'',
			outnumber: playerInformation?.mobilePhone.replace(/\D/, '') ?? '',
			userId: userAccessId.toString(),
			mlabPlayerId: mlabPlayerId,
		};
		setIsCalling(false);
		campaignCallPlayer(request);
	};

	const addCommCallPlayerViaCloudTalkPlayer = () => {
		setIsCalling(true);
		let request: CloudTalkMakeACallRequestModel = {
			agentId:
				communicationProviderAccounts.find((commAccountId) => commAccountId.messageTypeId === MessageTypeEnum.CloudTalk.toString())?.accountID ?? '',
			mlabPlayerId: mlabPlayerId,
			userId: userAccessId,
		};
		setIsCalling(false);
		cloudTalkCall(request);
	};

	const addCommCallPlayerViaSamespacePlayer = () => {
		setIsCalling(true);
		let _addCommSameSpaceCall: CommunicationProviderAccountUdt | undefined = communicationProviderAccounts.find(
			(commAccountId) => commAccountId.messageTypeId === MessageTypeEnum.Samespace.toString()
		);
		if (_addCommSameSpaceCall) {
			let request: SamespaceMakeACallRequestModel = {
				agentId: _addCommSameSpaceCall.accountID,
				mlabPlayerId: mlabPlayerId,
				userId: userAccessId,
				subscriptionId: _addCommSameSpaceCall.subscriptionId,
			};
			samespaceCall(request);
		}
	};

	const addCommunicationPlayerInfoGetFlyfoneCdr = () => {
		if (callingCode !== '0') {
			getFlyfoneCdrData(callingCode);
		}
	};

	const addCommunicationPlayerGetCloudTalkCdr = () => {
		_setEndCommunicationNow();
		let requestGetCloudtalkCdr: CloudTalkGetCallRequestModel = {
			agentId:
				communicationProviderAccounts.find((commAccountId) => commAccountId.messageTypeId === MessageTypeEnum.CloudTalk.toString())?.accountID ?? '',
			dialId: callingCode,
			userId: userAccessId,
		};

		getCloudTalkCall(requestGetCloudtalkCdr);
	};

	const addCommunicationPlayerGetSamespaceCdr = () => {
		_setEndCommunicationNow();
		let _sameSpaceAddCommParams: CommunicationProviderAccountUdt | undefined = communicationProviderAccounts.find(
			(commAccountId) => commAccountId.messageTypeId === MessageTypeEnum.Samespace.toString()
		);
		if (_sameSpaceAddCommParams !== undefined) {
			let request: SamespaceGetCallRequestModel = {
				agentId: _sameSpaceAddCommParams.accountID,
				dialId: callingCode,
				userId: userAccessId,
				subscriptionId: _sameSpaceAddCommParams.subscriptionId,
			};

			getSamespaceCall(request);
		}
	};

	const addCommunicationEndCall = () => {
		setIsCalling(false);
		setIsDisableCallOnAddComm(true);
		if (selectedMessageType.value === MessageTypeEnum.FlyFoneCall.toString()) addCommunicationPlayerInfoGetFlyfoneCdr();
		if (selectedMessageType.value === MessageTypeEnum.CloudTalk.toString()) addCommunicationPlayerGetCloudTalkCdr();
		if (selectedMessageType.value === MessageTypeEnum.Samespace.toString()) addCommunicationPlayerGetSamespaceCdr();
	};

	const populateAddCommunicationFromFlyfoneCdr = async (_flyfoneCdrData: FormattedFlyFoneCdrUdt) => {
		const {callDate, callRecording, duration} = _flyfoneCdrData;
		let flyfoneAdddCommCallDateToGMT8 = addHours(Date.parse(callDate), 1);

		let flyfoneStartDateAddedDuration = addSeconds(flyfoneAdddCommCallDateToGMT8, parseInt(duration));
		let callRecordingAddCommHtmlContent = `<a href="${callRecording}"> ${callRecording}</a>`;
		let flyfoneAddCommunicationStartDate = mlabFormatDate(flyfoneAdddCommCallDateToGMT8, 'MM/d/yyyy HH:mm:ss');
		let flyfoneAddCommunicationEndDate = mlabFormatDate(flyfoneStartDateAddedDuration, 'MM/d/yyyy HH:mm:ss');
		let autoPopulateAddCommMessageStatus = messageStatusOptionList.find((x) => x.label === MessageStatusEnum.Contactable);
		let addCommValidContent = await addCommContentChecker(callRecordingAddCommHtmlContent);

		setStartCommunicationDate(flyfoneAdddCommCallDateToGMT8);
		setEndCommunicationDate(flyfoneStartDateAddedDuration);
		setStartCommunicationDatePost(flyfoneAddCommunicationStartDate.toString());
		setEndCommunicationDatePost(flyfoneAddCommunicationEndDate.toString());
		setSelectedMessageStatus(autoPopulateAddCommMessageStatus);
		clearResponse(autoPopulateAddCommMessageStatus);
		getMessageResponseOptionById(parseInt(autoPopulateAddCommMessageStatus?.value ?? '0'));
		setIsContactable(true);
		setHasAddCommunicationFetchedCdr(true);
		setIsDisableAddCommWhenHasCdr(true);
		setConvertedContent(addCommValidContent);
	};

	const populateAddCommFromCloudTalkCdr = async (_cloudTalkCdr: CloudTalkCdrResponseModel) => {
		const {endedAt, recordingLink, startedAt} = _cloudTalkCdr;
		let cloudTalkRecording =
			recordingLink !== null ? `<a href="${recordingLink}"> ${recordingLink}</a>` : `<p>${message.customerCase.cloudtalkHasNoRecordingLinkError}</p>`;
		let cloudTalkStartDate = mlabFormatDate(startedAt, 'MM/d/yyyy HH:mm:ss');
		let cloudTalkEndDate = mlabFormatDate(endedAt, 'MM/d/yyyy HH:mm:ss');
		let autoPopulateCloudTalkMessageStatus = messageStatusOptionList.find((x) => x.label === MessageStatusEnum.Contactable);
		let cloudTalkCallFormatContent = await addCommContentChecker(cloudTalkRecording);
		let hasRecordingLink: boolean = recordingLink !== null;

		setStartCommunicationDate(new Date(cloudTalkStartDate));
		setEndCommunicationDate(new Date(cloudTalkEndDate));
		setStartCommunicationDatePost(cloudTalkStartDate.toString());
		setEndCommunicationDatePost(cloudTalkEndDate.toString());
		setSelectedMessageStatus(autoPopulateCloudTalkMessageStatus);
		clearResponse(autoPopulateCloudTalkMessageStatus);
		getMessageResponseOptionById(parseInt(autoPopulateCloudTalkMessageStatus?.value ?? '0'));
		setIsContactable(true);
		setHasAddCommunicationFetchedCdr(hasRecordingLink);
		setConvertedContent(cloudTalkCallFormatContent);
		setIsDisableAddCommWhenHasCdr(true);
	};

	const clearResponse = (messageStatus: any) => {
		const response = messageStatus !== selectedMessageStatus ? '' : selectedMessageResponse;
		setSelectedMessageResponse(response);
	};

	function setCaseCommSamespaceRecordingURL(status: string, recordingURL: string) {
		let recordingLink = '';
		if (status === 'answered') {
			recordingLink =
				recordingURL !== null && recordingURL !== ''
					? `<a href="${recordingURL}"> ${recordingURL}</a>`
					: `<p>${message.customerCase.samespaceHasNoRecordingLinkError}</p>`;
		} else {
			recordingLink = convertedContent ?? '';
		}

		return recordingLink;
	}

	function setCaseCommMessageStatus(status: string) {
		if (status == 'answered') {
			let autoPopulateSamespaceAddCommMessageStatus = messageStatusOptionList.find((x) => x.label === MessageStatusEnum.Contactable);
			return autoPopulateSamespaceAddCommMessageStatus;
		} else {
			let autoPopulateSamespaceAddCommMessageStatus = messageStatusOptionList.find((x) => x.label === MessageStatusEnum.Uncontactable);
			return autoPopulateSamespaceAddCommMessageStatus;
		}
	}

	const populateAddCommFromSamespaceCdr = async (_samespaceCdr: SamespaceGetCallResponseModel) => {
		const {recordingURL, startTime, endTime, status} = _samespaceCdr;
		let samespaceRecording = setCaseCommSamespaceRecordingURL(status, recordingURL);
		let samespaceAddCommCallFormatContent = await addCommContentChecker(samespaceRecording);
		let caseSamespaceAddCommHasRecordingLink: boolean = status === 'answered' && recordingURL !== null && recordingURL !== '';

		let autoCaseCommMessageStatus = setCaseCommMessageStatus(status);

		if (startTime != '') {
			let samespaceAddCommStartDate = mlabFormatDate(startTime, 'MM/d/yyyy HH:mm:ss');
			setStartCommunicationDate(new Date(samespaceAddCommStartDate));
			setStartCommunicationDatePost(samespaceAddCommStartDate.toString());
		}

		if (endTime != '' && status != 'failed') {
			let samespaceAddCommEndDate = mlabFormatDate(endTime, 'MM/d/yyyy HH:mm:ss');
			setEndCommunicationDate(new Date(samespaceAddCommEndDate));
			setEndCommunicationDatePost(samespaceAddCommEndDate.toString());
		}

		setSelectedMessageStatus(autoCaseCommMessageStatus);
		clearResponse(autoCaseCommMessageStatus);
		getMessageResponseOptionById(parseInt(autoCaseCommMessageStatus?.value ?? '0'));
		if (autoCaseCommMessageStatus?.label === MessageStatusEnum.Contactable) {
			setIsContactable(true);
		} else {
			setIsContactable(false);
		}
		setHasAddCommunicationFetchedCdr(caseSamespaceAddCommHasRecordingLink);
		setConvertedContent(samespaceAddCommCallFormatContent);
		setIsDisableAddCommWhenHasCdr(caseSamespaceAddCommHasRecordingLink);
	};

	//Events
	const onClickShowEmail = () => {
		setIsShowEmailText(!isShowEmailText);
		setContactEmail('password');

		if (!isShowEmailText) {
			setContactEmail('text');
			saveContactClick(PLAYER_CONTANTS.ContactType_Email_Id);
		}
	};

	const onClickContactMobile = () => {
		setIsShowContactTypeMobile(!isShowContactTypeMobile);
		setContactMobileType('password');

		if (!isShowContactTypeMobile) {
			setContactMobileType('text');
			saveContactClick(PLAYER_CONTANTS.ContactType_Mobile_Id);
		}
	};

	const onClickPlayerDetails = () => {
		setPlayerDetailsShow(true);
	};
	const onClickCaseDetails = () => {
		setCaseDetailsShow(true);
	};

	const _setEndCommunicationNow = () => {
		setEndCommunicationDate(new Date());
		setEndCommunicationDatePost(mlabFormatDate(new Date(), postDateHourMinSecFormat));
	};

	const _setStartCommunicationNow = () => {
		setStartCommunicationDate(new Date());
		setStartCommunicationDatePost(mlabFormatDate(new Date(), postDateHourMinSecFormat));
	};

	const onChangeSelectAddCommFeedbackCategory = (val: any) => {
		setSelectedAddCommFeedbackCategory(val);
		setSelectedAddCommFeedbackAnswer('');
	};

	const onChangeSelectAddCommFeedbackType = (val: any) => {
		setSelectedAddCommFeedbackCategory('');
		setSelectedAddCommFeedbackAnswer('');
		setSelectedAddCommFeedbackType(val);
	};

	const onChangeSelectAddCommFeedbackAnswer = (val: any) => {
		const {feedbackAnswerId, feedbackAnswerName, feedbackCategoryId, feedbackCategoryName, feedbackTypeId, feedbackTypeName} = val.value;
		setSelectedAddCommFeedbackAnswer({label: feedbackTypeName + ' - ' + feedbackCategoryName + ' - ' + feedbackAnswerName, value: feedbackAnswerId});
		setSelectedAddCommFeedbackCategory({label: feedbackCategoryName, value: feedbackCategoryId});
		setSelectedAddCommFeedbackType({label: feedbackTypeName, value: feedbackTypeId});
	};

	const onChangeSelectPurpose = (val: string) => {
		setSelectedPurpose(val);
	};

	const onChangeStartCommunicationDate = (val: any) => {
		setOpenStartCommunication(!openStartCommunication);
		setStartCommunicationDate(val);
		setStartCommunicationDatePost(mlabFormatDate(val, postDateHourMinSecFormat));
	};

	const onChangeEndCommunicationDate = (val: any) => {
		setEndCommunicationDate(val);
		setOpenEndCommunication(!openEndCommunication);
		setEndCommunicationDatePost(mlabFormatDate(val, postDateHourMinSecFormat));
	};

	const onChangeSelectedTopic = (val: any) => {
		setSelectedTopic(val);
		setSelectedSubtopic('');
		setTopicId(val.value);
	};

	const onChangeMessageType = (val: any) => {
		setSelectedMessageType(val);
		setSelectedMessageStatus('');
		setSelectedMessageResponse('');
	};

	const onChangeMessageStatus = (val: any) => {
		setSelectedMessageStatus(val);
		setSelectedMessageResponse('');
		const {label, value} = val;

		getMessageResponseOptionById(value);

		if (label === MessageStatusEnum.Contactable) {
			setIsContactable(true);
		} else {
			setIsContactable(false);
		}

		if (label === MessageStatusEnum.InvalidNumber || label === MessageStatusEnum.Uncontactable) {
			setHasAddCommunicationFetchedCdr(true);
			// -- start communication date
			let formatedStartCommunicationDate = mlabFormatDate(subMinutes(new Date(), 1), postDateHourMinSecFormat);
			setStartCommunicationDate(subMinutes(new Date(), 1));
			setStartCommunicationDatePost(formatedStartCommunicationDate);

			// -- end communication date
			setEndCommunicationDate(new Date());
			setEndCommunicationDatePost(mlabFormatDate(new Date(), postDateHourMinSecFormat));
		}
	};

	const onChangeMessageResponse = (val: string) => {
		setSelectedMessageResponse(val);
	};

	// Redux Methods
	const _removeFeedback = (data: CommunicationFeedBackResponse) => {
		let filterdFeedback = feedbackData.filter((x: CommunicationFeedBackResponse) => x !== data);
		setFeedbackData(filterdFeedback);
	};

	const validateAddCommunicationFeedbackObj = async () => {
		if (feedbackData !== undefined) {
			const requestToValidate: CommunicationFeedBackResponse = {
				communicationFeedbackId: 0,
				communicationFeedbackNo: 0,
				caseCommunicationId: 0,
				feedbackTypeId: parseInt(selectedAddCommFeedbackType.value),
				feedbackTypeName: selectedAddCommFeedbackType.label,
				feedbackCategoryId: parseInt(selectedAddCommFeedbackCategory.value),
				feedbackCategoryName: selectedAddCommFeedbackCategory.label,
				feedbackAnswerId: parseInt(selectedAddCommFeedbackAnswer.value),
				feedbackAnswerName:
					feedbackAnswerOptionList.find((x) => x.feedbackAnswerId === selectedAddCommFeedbackAnswer.value)?.feedbackAnswerName ?? '',
				communicationSolutionProvided: addCommFeedbackSolutionProvided,
				communicationFeedbackDetails: addCommFeedbackDetails,
			};

			let searchFeedbackData = feedbackData.find(
				(x: CommunicationFeedBackResponse) =>
					x.feedbackTypeId === requestToValidate.feedbackTypeId &&
					x.feedbackAnswerId === requestToValidate.feedbackAnswerId &&
					x.feedbackCategoryId === requestToValidate.feedbackCategoryId &&
					x.communicationFeedbackDetails.toLocaleUpperCase() === requestToValidate.communicationFeedbackDetails.toLocaleUpperCase() &&
					x.communicationSolutionProvided.toLocaleUpperCase() === requestToValidate.communicationSolutionProvided.toUpperCase()
			);
			return searchFeedbackData;
		}
	};

	const _validateFeedbackData = async () => {
		let isError: boolean = false;

		if (selectedAddCommFeedbackType.value === undefined || selectedAddCommFeedbackType.value === '') {
			isError = true;
			setHasFeedbackErrors(true);
			setErrorFeedbackMessage(message.requiredAllFields);
		}

		if (selectedAddCommFeedbackAnswer.value === undefined || selectedAddCommFeedbackAnswer.value === '') {
			isError = true;
			setHasFeedbackErrors(true);
			setErrorFeedbackMessage(message.requiredAllFields);
		}

		if (selectedAddCommFeedbackCategory.value === undefined || selectedAddCommFeedbackCategory.value === '') {
			isError = true;
			setHasFeedbackErrors(true);
			setErrorFeedbackMessage(message.requiredAllFields);
		}

		if (addCommFeedbackSolutionProvided === '') {
			isError = true;
			setHasFeedbackErrors(true);
			setErrorFeedbackMessage(message.requiredAllFields);
		}

		if (addCommFeedbackDetails === '') {
			isError = true;
			setHasFeedbackErrors(true);
			setErrorFeedbackMessage(message.requiredAllFields);
		}

		if ((await validateAddCommunicationFeedbackObj()) !== undefined) {
			isError = true;
			setHasFeedbackErrors(true);
			setErrorFeedbackMessage('Value already exists, please check the table to find them');
		}

		if (isError === false) {
			const request: CommunicationFeedBackResponse = {
				communicationFeedbackId: 0,
				caseCommunicationId: 0,
				communicationFeedbackNo: 0,
				feedbackTypeId: parseInt(selectedAddCommFeedbackType.value),
				feedbackTypeName: selectedAddCommFeedbackType.label,
				feedbackCategoryId: parseInt(selectedAddCommFeedbackCategory.value),
				feedbackCategoryName: selectedAddCommFeedbackCategory.label,
				feedbackAnswerId: parseInt(selectedAddCommFeedbackAnswer.value),
				feedbackAnswerName:
					feedbackAnswerOptionList.find((x) => x.feedbackAnswerId === selectedAddCommFeedbackAnswer.value)?.feedbackAnswerName ?? '',
				communicationSolutionProvided: addCommFeedbackSolutionProvided,
				communicationFeedbackDetails: addCommFeedbackDetails,
			};

			let storedData = feedbackData ?? [];
			const newDataToStore = storedData.concat(request);
			setHasFeedbackErrors(false);
			setFeedbackData(newDataToStore);
			setRowData(feedbackData);
			setErrorFeedbackMessage('');
			_resetFeedbackForm();
		}
	};

	// METHODS
	const _resetFeedbackForm = () => {
		setSelectedAddCommFeedbackType('');
		setSelectedAddCommFeedbackAnswer('');
		setSelectedAddCommFeedbackCategory('');
		setAddCommFeedbackDetails('');
		setAddCommFeedbackSolutionProvided('');
	};

	const _closePage = () => {
		setIsShotPrompt(false);
		swal({
			title: 'Confirmation',
			text: 'This action will discard any changes made and return to the campaign workspace page, please confirm',
			icon: 'warning',
			buttons: ['No', 'Yes'],
			dangerMode: true,
		}).then((onClosePage) => {
			if (onClosePage) {
				window.close();
				_clearStorage();
			} else {
				setIsShotPrompt(true);
			}
		});
	};

	const handleAddCommEditorChange = useCallback((_content: string) => {
		setConvertedContent(_content);
	}, []);

	const addCommContentChecker = async (_contentParam: string) => {
		if (convertedContent === '' || convertedContent === '<p>-</p>') {
			return _contentParam;
		} else if (_contentParam === convertedContent) {
			return convertedContent;
		} else {
			return convertedContent + _contentParam;
		}
	};

	const _clearStorage = () => {
		dispatch(caseCommunication.actions.communicationSurveyQuestionAnswer([]));
		setEditorKey(editorKey * 43);
		_resetFeedbackForm();
	};

	const _validateAddCommDetails = async () => {
		let hasCommError: boolean = false;

		if (selectedTopic.value === undefined) {
			hasCommError = true;
		}

		if (selectedSubtopic.value === undefined) {
			hasCommError = true;
		}

		if (selectedMessageType.value === undefined) {
			hasCommError = true;
		}

		if (selectedMessageResponse.value === undefined) {
			hasCommError = true;
		}

		if (selectedMessageStatus.value === undefined) {
			hasCommError = true;
		}

		if (endCommunicationDatePost === '' || endCommunicationDatePost === undefined) {
			hasCommError = true;
		}

		if (startCommunicationDatePost === '' || startCommunicationDatePost === undefined) {
			hasCommError = true;
		}

		if (endCommunicationDatePost === 'Invalid date') {
			hasCommError = true;
		}

		if (startCommunicationDatePost === 'Invalid date') {
			hasCommError = true;
		}

		if (convertedContent === undefined || convertedContent === '') {
			hasCommError = true;
		}

		return hasCommError;
	};

	const _validateAddCommunicationRequiredFieldsForm = async () => {
		let isError: boolean = false;

		isError = await _validateAddCommDetails();

		if (isContactable === true) {
			if (addCommSurveyRequest.length === 0 || addCommSurveyRequest === undefined) {
				isError = true;
			}

			let requiredToAddCommQuestion = surveyQuestion.filter((x) => x.isMandatory === true).map((x) => x.surveyQuestionId);
			let answersDataFromAddComm = addCommSurveyRequest
				.filter((x: AddCommunicationSurveyRequest) => x.surveyAnswer !== '')
				.map((x: any) => x.surveyQuestionId);
			let allCommunicationFounded = requiredToAddCommQuestion.every((rq) => answersDataFromAddComm.includes(rq));

			if (allCommunicationFounded === false) {
				isError = true;
			}
		}

		return isError;
	};

	const _validateAddCommunicationDate = async () => {
		let isError: boolean = false;
		if (isSameSecond(Date.parse(startCommunicationDatePost), Date.parse(endCommunicationDatePost))) {
			isError = true;
		}
		if (isAfter(Date.parse(startCommunicationDatePost), Date.parse(endCommunicationDatePost))) {
			isError = true;
		}

		return isError;
	};

	// Elements
	function messagePrompt() {
		return (
			<div>
				<div>
					<Prompt when={true} message={(location: any) => `Are you sure you want to go to ${location.pathname}`} />
				</div>
			</div>
		);
	}

	const onCopyAddCommDialId = () => {
		navigator.clipboard.writeText(callingCode);
		setAddCommToolTipShow(true);
	};

	const renderCaseDetails = (): JSX.Element => (
		<>
			<Row>
				<Col sm={12}>
					<BasicFieldLabel title={'Case Type'} /> : <BasicFieldLabel title={caseTypeName} />
				</Col>
			</Row>
			<Row>
				<Col sm={12}>
					<BasicFieldLabel title={'Case Status'} /> : <BasicFieldLabel title={caseStatusname} />
				</Col>
			</Row>
			<Row>
				<Col sm={12}>
					<BasicFieldLabel title={'Case Creator'} /> : <BasicFieldLabel title={caseCreatorName?.toString() ?? ''} />
				</Col>
			</Row>
			<Row>
				<Col sm={12}>
					<BasicFieldLabel title={'Created Date'} /> : <BasicFieldLabel title={caseCreatedDate?.toString() ?? ''} />
				</Col>
			</Row>
			<Row>
				<Col sm={12}>
					<BasicFieldLabel title={'Last Modified Date'} /> : <BasicFieldLabel title={caselastModifiedDate?.toString() ?? ''} />
				</Col>
			</Row>
			<Row>
				<Col sm={12}>
					<BasicFieldLabel title={'Last Modified By'} /> : <BasicFieldLabel title={caselastModifiedAgent?.toString() ?? ''} />
				</Col>
			</Row>
			<Row>
				<Col sm={12}>
					<BasicFieldLabel title={'Campaign Name'} /> : <BasicFieldLabel title={campaignName} />
				</Col>
			</Row>
		</>
	);

	const renderPlayerDetails = (): JSX.Element => (
		<>
			<Row>
				<Col sm={12}>
					<BasicFieldLabel title={'Brand'} /> : <BasicFieldLabel title={addCommPlayerBrand ?? ''} />
				</Col>
			</Row>
			<Row>
				<Col sm={12}>
					<BasicFieldLabel title={'Currency'} /> : <BasicFieldLabel title={addCommPlayercurrency ?? ''} />
				</Col>
			</Row>
			<Row>
				<Col sm={12}>
					<BasicFieldLabel title={'Username'} /> : <BasicFieldLabel title={addCommUserName ?? ''} />
				</Col>
			</Row>
			<Row>
				<Col sm={12}>
					<BasicFieldLabel title={'Player Name'} /> : <BasicFieldLabel title={playerName ?? ''} />
				</Col>
			</Row>
			<Row>
				<Col sm={12}>
					<BasicFieldLabel title={'VIP Level'} /> : <BasicFieldLabel title={vipLevel?.toString() ?? ''} />
				</Col>
			</Row>
			<Row>
				<Col sm={12}>
					<BasicFieldLabel title={'Payment Group'} /> : <BasicFieldLabel title={payment?.toString() ?? ''} />
				</Col>
			</Row>
			<Row>
				<Col sm={12}>
					<BasicFieldLabel title={'Internal Account'} /> : <BasicFieldLabel title={internalAccount?.toString() ?? ''} />
				</Col>
			</Row>
			<Row>
				<Col sm={12}>
					<BasicFieldLabel title={'Markering Channel'} /> : <BasicFieldLabel title={marketingChannel?.toString() ?? ''} />
				</Col>
			</Row>
			<Row>
				<Col sm={12}>
					<BasicFieldLabel title={'Marketing Source'} /> : <BasicFieldLabel title={marketingSource?.toString() ?? ''} />
				</Col>
			</Row>
			<Row>
				<Col sm={12}>
					<BasicFieldLabel title={'Deposited'} /> : <BasicFieldLabel title={deposited?.toString() ?? ''} />
				</Col>
			</Row>
		</>
	);

	const renderAddCommunicationFeedbackAction = (_props: any) => (
		<>
			{_props.data.messageTypeId != 0 ? (
				<ButtonGroup aria-label='Basic example'>
					<div className='d-flex justify-content-center flex-shrink-0'>
						<DefaultTableButton
							access={userAccess.includes(USER_CLAIMS.AddCommunicationWrite)}
							title={'remove'}
							onClick={() => _removeFeedback(_props.data)}
						/>
					</div>
				</ButtonGroup>
			) : null}
		</>
	);

	// Table Content and Header
	const addCommunicationFeedbackColdef : (ColDef<CommunicationFeedBackResponse> | ColGroupDef<CommunicationFeedBackResponse>)[] =[
		{headerName: 'No', field: 'feedbackTypeName', cellRenderer: CellRenderRowIndex},
		{headerName: 'Feedback Type', field: 'feedbackTypeName'},
		{headerName: 'Feedback Category', field: 'feedbackCategoryName'},
		{headerName: 'Feedback Answer', field: 'feedbackAnswerName'},
		{headerName: 'Feedback Details', field: 'communicationFeedbackDetails'},
		{headerName: 'Solution Provided', field: 'communicationSolutionProvided'},
		{
			headerName: 'Action',
			cellRenderer: renderAddCommunicationFeedbackAction,
		},
	];

	const hasNoAddCommunicationProviderAccount = () => {
		const hasCaseCommunicationProvider = communicationProviderAccounts.some((str) => str.messageGroupId === MessageGroupEnum.Call);
		return !hasCaseCommunicationProvider;
	};

	const disableAddCommunicationCallBtn = () =>
		hasNoAddCommunicationProviderAccount() || isCalling || isFetching || isDisableCallOnAddComm || selectedMessageType.value === undefined;
	const disableAddCommunicationEndCallBtn = () => !isCalling || isDisableCallOnAddComm;

	const addCommFeedBackRequest = async () => {
		let postFeedbackData = feedbackData ?? [];
		let feedbackRequestData = Array<AddCommunicationFeedbackRequest>();
		if (isContactable === true) {
			postFeedbackData.forEach((item: CommunicationFeedBackResponse) => {
				const feedbackRequest: AddCommunicationFeedbackRequest = {
					communicationFeedbackId: 0,
					caseCommunicationId: 0,
					communicationFeedbackNo: item.communicationFeedbackNo,
					feedbackTypeId: item.feedbackTypeId,
					feedbackCategoryId: item.feedbackCategoryId,
					feedbackAnswerId: item.feedbackAnswerId,
					feedbackAnswer: item.feedbackAnswerName,
					communicationSolutionProvided: item.communicationSolutionProvided,
					communicationFeedbackDetails: item.communicationFeedbackDetails,
					updatedBy: userAccessId,
					createdBy: userAccessId,
				};
				feedbackRequestData.push(feedbackRequest);
			});
		}

		return feedbackRequestData;
	};

	const AddCommunicationPostRequest = async () => {
		const feedbackPostRequest = await addCommFeedBackRequest();
		const addCommContentToBase64 = await convertCommunicationContentToPostRequest(convertedContent ?? '');

		const communicationRequest: AddCommunicationRequest = {
			caseCommunicationId: 0,
			caseInformationId: caseId,
			purposeId: parseInt(selectedPurpose.value),
			messageTypeId: parseInt(selectedMessageType.value),
			messageStatusId: parseInt(selectedMessageStatus.value),
			messageReponseId: parseInt(selectedMessageResponse.value),
			startCommunicationDate: startCommunicationDatePost,
			endCommunicationDate: endCommunicationDatePost,
			communicationContent: addCommContentToBase64,
			communicationSurveyQuestion: isContactable === true ? addCommSurveyRequest : [],
			communicationFeedBackType: feedbackPostRequest.filter((x: AddCommunicationFeedbackRequest) => x.communicationFeedbackId === 0),
			createdBy: userAccessId,
			updatedBy: userAccessId,
		};

		return communicationRequest;
	};

	const addCaseCommunicationPostRequest = async () => {
		const consolidatedCommunicationRequest = await AddCommunicationPostRequest();

		const request: AddCaseCommunicationRequest = {
			queueId: Guid.create().toString(),
			userId: userAccessId.toString(),
			playerId: caseInformation?.playerId ? caseInformation?.playerId : '0',
			caseInformationId: caseId,
			caseCreatorId: userAccessId,
			caseTypeId: caseTypeId,
			campaignId: campaignId,
			caseStatusId: caseStatusId,
			topicId: topicId,
			subtopicId: subtopicId,
			callListNote: callListNote,
			callListNoteId: callListNoteId || 0,
			callingCode: callingCode,
			caseCommunication: consolidatedCommunicationRequest,
			hasFlyfoneCdr: hasAddCommunicationFetchedCdr,
			subscriptionId: communicationProviderAccounts.find((commAccountId) => commAccountId.messageTypeId === MessageTypeEnum.Samespace.toString())
				?.subscriptionId,
			brandName: brandName,
		};

		return request;
	};

	const addCaseCommActionAfterSubmit = (_response: number, _queueId: string, _setSubmitting: (e: boolean) => void) => {
		if (_response === successResponse) {
			messagingHub.on(_queueId, (message) => {
				let resultFormData = JSON.parse(message.remarks);

				if (resultFormData.Status === successResponse) {
					swal('Success', 'Transaction successfully submitted', 'success');
					_clearStorage();
					history.push(`/campaign-workspace/view-case/${caseId}`);
					_setSubmitting(false);
				} else {
					swal('Failed', 'Problem connecting to the server, Please refresh', 'error');
					_clearStorage();
					_setSubmitting(false);
				}

				messagingHub.off(_queueId);
				messagingHub.stop();
			});
		} else {
			_setSubmitting(false);
			swal('Failed', 'Problem in Connection on Gateway', 'error');

			messagingHub.off(_queueId);
			messagingHub.stop();
		}
	};

	// Formik
	const formik = useFormik({
		initialValues,
		onSubmit: async (values, {setStatus, setSubmitting, resetForm}) => {
			if (isSubmitClicked) return;

			setIsSubmitClicked(true);
			setSubmitting(true);
			const addCaseCommRequestPost = await addCaseCommunicationPostRequest();

			if (!isJsonSizeValid(addCaseCommRequestPost)) {
				swal(SwalDetails.ErrorTitle, 'Communication content should not exceed 3MB.', SwalDetails.ErrorIcon);
				setSubmitting(false);
				setIsSubmitClicked(false);
			} else if ((await _validateAddCommunicationRequiredFieldsForm()) === true) {
				swal('Failed', message.requiredAllFields, 'error');
				setIsSubmitClicked(false);
				setSubmitting(false);
			} else if ((await _validateAddCommunicationDate()) === true) {
				swal('Failed', 'Unable to proceed, Communication end date and time must be higher than Communication Start date', 'error');
				setIsSubmitClicked(false);
				setSubmitting(false);
			} else {
				setSubmitting(true);
				setTimeout(() => {
					messagingHub
						.start()
						.then(() => {
							if (messagingHub.state === HubConnected) {
								setSubmitting(true);
								AddCaseCommunication(addCaseCommRequestPost)
									.then((response) => {
										addCaseCommActionAfterSubmit(response.status, addCaseCommRequestPost.queueId.toString(), setSubmitting);
									})
									.catch(() => {
										setSubmitting(false);
										messagingHub.stop();
										swal('Failed', 'Problem in Connection on Gateway', 'error');
									});
							}
						})
						.catch((err) => console.log('Error while starting connection: ' + err));
				}, 1000);
			}
		},
	});

	return (
		<FormContainer onSubmit={formik.handleSubmit}>
			{/* Case and Player Information */}
			<MainContainer>
				<FormHeader headerLabel={'Case and Player Information'} />
				<div style={{margin: 40}}>
					<Row>
						<Col sm={3}>
							<BasicFieldLabel title={'Case ID'} />
							<InputGroup>
								<div className='col-sm-10'>
									<input type={'text'} className='form-control form-control-sm input-case' disabled aria-label='Case ID' value={caseId} />
								</div>

								<div
									className='btn btn-icon w-auto px-0 btn-active-color-primary input-case'
									style={{right: '20px', bottom: '5px'}}
									onClick={onClickCaseDetails}
								>
									<FontAwesomeIcon icon={faInfoCircle} />
								</div>
							</InputGroup>
							<DismissibleToast
								onClose={() => setCaseDetailsShow(false)}
								show={caseDetailsShow}
								toastBody={renderCaseDetails()}
								toastHeader={'Case Details'}
							/>
						</Col>
						<Col sm={3}>
							<BasicFieldLabel title={'Username (Currency)'} />

							<InputGroup>
								<div className='col-sm-10'>
									<input type={'text'} className='form-control form-control-sm input-case' disabled aria-label='username' value={addCommUserName} />
								</div>

								<div
									className='btn btn-icon w-auto px-0 btn-active-color-primary'
									style={{right: '20px', bottom: '5px'}}
									onClick={onClickPlayerDetails}
								>
									<FontAwesomeIcon icon={faInfoCircle} />
								</div>
							</InputGroup>

							<DismissibleToast
								onClose={() => setPlayerDetailsShow(false)}
								show={playerDetailsShow}
								toastBody={renderPlayerDetails()}
								toastHeader={'Player Details'}
							/>
						</Col>
						<Col sm={3}>
							<BasicFieldLabel title={'Topic'} />
							<DefaultSelect data={topicOptionList} onChange={onChangeSelectedTopic} value={selectedTopic} isDisabled={true} />
						</Col>
						<Col sm={3}>
							<BasicFieldLabel title={'Subtopic'} />
							<DefaultSelect data={[]} onChange={(e) => setSelectedSubtopic(e)} value={selectedSubtopic} isDisabled={true} />
						</Col>
					</Row>

					<Row style={{marginTop: 20, marginBottom: 20}}>
						<Col sm={3}>
							<BasicFieldLabel title={'Mobile Number'} />
							<InputGroup>
								<div className='col-sm-10'>
									<input
										type={contactMobileType}
										className='form-control form-control-sm input-case'
										aria-label='Mobile Number'
										disabled
										value={addCommPlayerMobilePhone}
									/>
								</div>

								<div className='btn btn-icon w-auto px-0 btn-active-color-primary' style={{right: '20px', bottom: '5px'}}>
									{mobileHasIcon === true ? (
										<FontAwesomeIcon icon={isShowContactTypeMobile ? faEyeSlash : faEye} onClick={onClickContactMobile} />
									) : null}
								</div>
							</InputGroup>
						</Col>

						<Col sm={3}>
							<BasicFieldLabel title={'Email Address'} />
							<InputGroup>
								<div className='col-sm-10'>
									<input type={contactEmail} className='form-control form-control-sm' disabled aria-label='Email' value={addCommPlayerEmail} />
								</div>

								<div className='btn btn-icon w-auto px-0 btn-active-color-primary' style={{right: '20px', bottom: '5px'}}>
									{emailHasIcon === true ? <FontAwesomeIcon icon={isShowContactTypeMobile ? faEyeSlash : faEye} onClick={onClickShowEmail} /> : null}
								</div>
							</InputGroup>
						</Col>
					</Row>
				</div>
			</MainContainer>

			<div style={{margin: 20}}></div>

			{/* Communication Details  */}
			<MainContainer>
				<FormHeader headerLabel={'Communication Detail'} />
				<div style={{margin: 40}}>
					<Row>
						<Col sm={3}>
							<BasicFieldLabel title={'Created By'} />
							<input type='text' className='form-control form-control-sm' value={userProfile?.fullname} disabled={true} />
						</Col>
						<Col sm={3}>
							<BasicFieldLabel title={'Created Date'} />
							<BasicTextInput
								ariaLabel={'Created Date'}
								disabled={true}
								value={addCommunicationCreatedDate}
								onChange={(e) => setAddCommunicationCreatedDate(e.target.value)}
							/>
						</Col>
						<Col sm={3}>
							<div className='float-end' style={{marginTop: 30}}>
								<MlabButton
									access={true}
									type={'button'}
									weight={'solid'}
									size={'sm'}
									label={'Start Call'}
									customStyle={{backgroundColor: '#198754'}}
									style={ElementStyle.success}
									onClick={addCommunicationCallPlayer}
									loadingTitle={' Calling ...'}
									loading={isCalling}
									disabled={disableAddCommunicationCallBtn()}
								/>
							</div>
						</Col>
						<Col sm={3} style={{position: 'relative'}}>
							<InputGroup style={{marginTop: 30}}>
								<input
									type='textbox'
									className='form-control form-control-sm'
									disabled
									aria-label='Mobile Number'
									value={callingCode === '0' ? '' : callingCode}
								/>
								<div
									className='btn btn-icon w-auto px-0 btn-active-color-primary'
									style={{position: 'absolute', right: '20px', bottom: '-5px'}}
									onClick={onCopyAddCommDialId}
								>
									<CaseCommTooltip showCaseCommToolTip={addCommToolTipShow} message={'Copied'} />
									<FontAwesomeIcon icon={faCopy} />
								</div>
							</InputGroup>
						</Col>
					</Row>
					<Row style={{marginTop: 20, marginBottom: 20}}>
						<Col sm={3}>
							<BasicFieldLabel title={'Purpose'} />
							<Select size='small' style={{width: '100%'}} options={[]} onChange={onChangeSelectPurpose} value={selectedPurpose} isDisabled={true} />
						</Col>
						<Col sm={3}>
							<BasicFieldLabel title={'Message Type'} />
							<Select
								size='small'
								style={{width: '100%'}}
								isDisabled={isStartCallClick}
								options={communicationProviderAccounts
									.filter((obj) => obj.messageGroupId === MessageGroupEnum.Call)
									.map((commAccountObj) => {
										return {label: commAccountObj.messageTypeName, value: commAccountObj.messageTypeId};
									})}
								onChange={onChangeMessageType}
								value={selectedMessageType}
							/>
						</Col>
						<Col sm={3}>
							<RequiredLabel title={'Message Status'} />
							<Select
								size='small'
								style={{width: '100%'}}
								options={messageStatusOptionList}
								onChange={onChangeMessageStatus}
								value={selectedMessageStatus}
								isDisabled={false}
							/>
						</Col>
						<Col sm={3}>
							<RequiredLabel title={'Message Response'} />
							<Select
								size='small'
								style={{width: '100%'}}
								options={messageResponseOptionList}
								onChange={onChangeMessageResponse}
								value={selectedMessageResponse}
								isDisabled={false}
							/>
						</Col>
					</Row>

					<Row style={{marginTop: 20, marginBottom: 20}}>
						<Col sm={4}>
							<BasicFieldLabel title={'Start Communication'} />
							<div style={{display: 'flex'}}>
								<BasicDateTimePicker
									format={properFormatDateHourMinSec}
									onChange={onChangeStartCommunicationDate}
									onOpenCalendar={() => setOpenStartCommunication(!openStartCommunication)}
									onBlur={() => setOpenStartCommunication(!openStartCommunication)}
									onInputClick={() => setOpenStartCommunication(!openStartCommunication)}
									value={startCommunicationDate}
									open={false}
									timeFormat={'HH:mm:ss'}
									isDisable={true}
								/>
								<div className='col-sm-10'>
									<DefaultPrimaryButton
										isDisable={isCalling || isFetching || isDisableAddCommWhenHasCdr}
										access={userAccess.includes(USER_CLAIMS.AddCommunicationWrite)}
										title={'Now'}
										onClick={_setStartCommunicationNow}
									/>
								</div>
							</div>
						</Col>
						<Col sm={4}>
							<BasicFieldLabel title={'End Communication'} />
							<div style={{display: 'flex'}}>
								<BasicDateTimePicker
									format={properFormatDateHourMinSec}
									onChange={onChangeEndCommunicationDate}
									value={endCommunicationDate}
									open={isDisableAddCommWhenHasCdr ? false : openEndCommunication}
									onBlur={() => setOpenEndCommunication(!openEndCommunication)}
									onInputClick={() => setOpenEndCommunication(!openEndCommunication)}
									onOpenCalendar={() => setOpenEndCommunication(!openEndCommunication)}
									timeFormat={'HH:mm:ss'}
									isDisable={isDisableAddCommWhenHasCdr}
								/>
								<div className='col-sm-10'>
									<DefaultPrimaryButton
										isDisable={isCalling || isFetching || isDisableAddCommWhenHasCdr}
										access={userAccess.includes(USER_CLAIMS.AddCommunicationWrite)}
										title={'Now'}
										onClick={_setEndCommunicationNow}
									/>
								</div>
							</div>
						</Col>
					</Row>

					<Row>
						<BasicFieldLabel title={'Communication Content'} />
					</Row>
					<Row>
						<Col sm={12}>
							<div style={{width: '100%', height: 'auto', marginBottom: 20, zIndex: 'auto'}} className='border'>
								<MLabQuillEditor
									isUploadToMlabStorage={true}
									uploadToMlabStorage={UploadCaseCommContentImageToMlabStorage}
									isReadOnly={isDisableAddCommWhenHasCdr}
									quillValue={convertedContent}
									setQuillValue={(content: string) => {
										handleAddCommEditorChange(content);
									}}
									hasImageToEditor={true}
								/>
							</div>
						</Col>
					</Row>
				</div>
			</MainContainer>

			<div style={{margin: 20}}></div>

			{/* Survey Questions And Answers */}
			<div style={isContactable === false ? {display: 'none'} : undefined}>
				<CampaignCaseCommSurvey
					campaignSurveyQuestion={surveyQuestion}
					campaignSurveyQuestionAnswer={surveyQuestionAnswer}
					campaignSurveyTemplateTitle={surveyTemplateTitle}
					campaignSurveyRequest={addCommSurveyRequest}
					setCampaignSurveyRequest={setAddCommSurveyRequest}
					campaignSurveyTemplateId={surveyTemplateId}
					campaignSurveyUserIdCreated={userAccessId.toString()}
					isCampaignCaseCommSurveyReadOnly={false}
					campaignSurveyCommunicationId={0}
					campaignSurveyPreSelectOnlyOneAnswer={true}
				/>

				<div style={{margin: 20}}></div>
				{/* Communication Feedback */}
				<MainContainer>
					<FormHeader headerLabel={'Feedback'} />
					<div style={{margin: 40}}>
						<Row>
							<Col sm={11}>
								<ErrorLabel hasErrors={hasFeedbackErrors} errorMessage={errorFeedbackMessage} />
							</Col>
						</Row>
						<Row>
							<Col sm={3}>
								<BasicFieldLabel title={'Feedback Type'} />
								<DefaultSelect onChange={onChangeSelectAddCommFeedbackType} data={feedbackTypeOptionList} value={selectedAddCommFeedbackType} />
							</Col>
							<Col sm={3}>
								<BasicFieldLabel title={'Feedback Category'} />
								<DefaultSelect
									onChange={onChangeSelectAddCommFeedbackCategory}
									data={feedbackCategoryOptionList}
									value={selectedAddCommFeedbackCategory}
								/>
							</Col>
							<Col sm={6}>
								<BasicFieldLabel title={'Feedback Answer'} />
								<Select
									isSearchable={true}
									options={feedbackAnswerOptionList.flatMap((x) => [
										{label: x.feedbackTypeName + ' - ' + x.feedbackCategoryName + ' - ' + x.feedbackAnswerName, value: x},
									])}
									onChange={onChangeSelectAddCommFeedbackAnswer}
									value={selectedAddCommFeedbackAnswer}
									isLoading={feedbackAnswerLoading}
									onInputChange={(e: any) => {
										if (e.length >= 3) {
											getFeedbackAnserOptions('', '', e);
										}
									}}
								/>
							</Col>
						</Row>
						<Row style={{marginTop: 20, marginBottom: 20}}>
							<Col sm={6}>
								<BasicFieldLabel title={'Feedback Details'} />
								<BasicTextInput
									ariaLabel={''}
									colWidth={'col-sm-12'}
									value={addCommFeedbackDetails}
									onChange={(e) => {
										setAddCommFeedbackDetails(e.target.value);
									}}
									disabled={false}
								/>
							</Col>
							<Col sm={6}>
								<BasicFieldLabel title={'Solution Provided'} />
								<BasicTextInput
									ariaLabel={''}
									colWidth={'col-sm-12'}
									value={addCommFeedbackSolutionProvided}
									onChange={(e) => {
										setAddCommFeedbackSolutionProvided(e.target.value);
									}}
									disabled={false}
								/>
							</Col>
						</Row>

						<Row>
							<Col sm={3} style={{display: 'flex', justifyContent: 'flex-start'}}>
								<Row style={{marginTop: 10, marginBottom: 20, marginLeft: 5}}>
									<DefaultPrimaryButton
										isDisable={false}
										access={userAccess.includes(USER_CLAIMS.AddCommunicationWrite)}
										title={'Add'}
										onClick={_validateFeedbackData}
									/>
								</Row>
							</Col>
						</Row>

						<div className='ag-theme-quartz' style={{height: 400, width: '100%', marginBottom: 20}}>
							<AgGridReact
								rowData={rowData}
								defaultColDef={{
									sortable: true,
									resizable: true,
								}}
								onGridReady={onGridReady}
								rowBuffer={0}
								enableRangeSelection={true}
								pagination={true}
								paginationPageSize={10}
								columnDefs={addCommunicationFeedbackColdef}
							/>
						</div>
					</div>
				</MainContainer>
			</div>

			<div style={{margin: 20}}></div>

			<MainContainer>
				<div style={{marginLeft: 40}}>
					<PaddedContainer>
						<FieldContainer>
							<Row>
								<ButtonsContainer>
									<MlabButton
										access={true}
										type={'button'}
										weight={'solid'}
										size={'sm'}
										label={'End Call'}
										style={ElementStyle.danger}
										onClick={addCommunicationEndCall}
										loadingTitle={'End Call'}
										loading={false}
										disabled={disableAddCommunicationEndCallBtn()}
									/>
									<MlabButton
										access={userAccess?.includes(USER_CLAIMS.CaseAndCommunicationWrite)}
										size={'sm'}
										label={'Submit'}
										style={ElementStyle.primary}
										type={'button'}
										weight={'solid'}
										onClick={formik.handleSubmit}
										loading={isCalling || formik.isSubmitting || isSubmitClicked}
										loadingTitle={'Please wait ...'}
										disabled={isCalling || formik.isSubmitting || isFetching || isSubmitClicked}
									/>
									<MlabButton
										access={userAccess?.includes(USER_CLAIMS.CaseAndCommunicationRead)}
										size={'sm'}
										label={'Back'}
										style={ElementStyle.secondary}
										type={'button'}
										weight={'solid'}
										onClick={_closePage}
										loading={isCalling || formik.isSubmitting || isSubmitClicked}
										loadingTitle={'Please wait ...'}
										disabled={isCalling || formik.isSubmitting || isSubmitClicked}
									/>
								</ButtonsContainer>
							</Row>
							<Row>
								<div>
									<CaseCommReminder isCalling={isCalling} isFetching={isFetching} messageTypeId={selectedMessageType.value} />
								</div>
							</Row>
						</FieldContainer>
					</PaddedContainer>
				</div>
			</MainContainer>
		</FormContainer>
	);
};

export default AddCommunication;

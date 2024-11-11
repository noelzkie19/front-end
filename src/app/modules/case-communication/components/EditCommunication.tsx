import {
	BasicDateTimePicker,
	BasicFieldLabel,
	ButtonsContainer,
	DefaultPrimaryButton,
	DefaultSecondaryButton,
	DefaultSelect,
	DefaultTableButton,
	DefaultTextInput,
	DismissibleToast,
	ErrorLabel,
	FieldContainer,
	FormContainer,
	FormHeader,
	LoaderButton,
	MLabQuillEditor,
	MainContainer,
	PaddedContainer,
} from '../../../custom-components';
import {
	useCaseTypeOptions,
	useFeedbackCategoryOption,
	useFeedbackTypeOption,
	useMasterReferenceOption,
	useMessageResponseOption,
	useMessageStatusOption,
	useMessageTypeOptions,
	useSubtopicOptions,
	useTopicOptions,
} from '../../../custom-functions';

import {faEye, faEyeSlash, faInfoCircle} from '@fortawesome/free-solid-svg-icons';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {useFormik} from 'formik';
import moment from 'moment';
import React, {useCallback, useEffect, useState} from 'react';
import {ButtonGroup, Col, InputGroup, Row} from 'react-bootstrap-v5';
import {shallowEqual, useDispatch, useSelector} from 'react-redux';
import swal from 'sweetalert';
import * as Yup from 'yup';
import {RootState} from '../../../../setup';
import * as hubConnection from '../../../../setup/hub/MessagingHub';
import {MasterReferenceOptionModel, OptionListModel} from '../../../common/model';
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
	CommunicationByIdRequest,
	CommunicationFeedBackResponse,
	CommunicationResponse,
	CommunicationSurveyQuestionAnswerResponse,
	CommunicationSurveyQuestionResponse,
	CommunicationSurveyRequest,
	SurveyQuestionAnswerResponse,
	SurveyQuestionResponse,
} from '../models';

import {AgGridReact} from 'ag-grid-react';
import Select from 'react-select';

import {parse} from 'date-fns';
import {Guid} from 'guid-typescript';
import {htmlDecode} from 'js-htmlencode';
import {useHistory, useParams} from 'react-router-dom';
import {HttpStatusCodeEnum, MessageTypeEnum} from '../../../constants/Constants';
import useConstant from '../../../constants/useConstant';
import useFnsDateFormatter from '../../../custom-functions/helper/useFnsDateFormatter';
import {usePromptOnUnload} from '../../../custom-helpers';
import * as auth from '../../../modules/auth/redux/AuthRedux';
import {isJsonSizeValid} from '../../../utils/helper';
import {uploadFile} from '../../case-management/services/CustomerCaseApi';
import {PLAYER_CONTANTS} from '../../player-management/constants/PlayerContants';
import {PlayerContactRequestModel} from '../../player-management/models/PlayerContactRequestModel';
import {usePlayerManagementHooks} from '../../player-management/shared/usePlayerManagementHooks';
import {SwalDetails} from '../../system/components/constants/CampaignSetting';
import * as caseCommunication from '../redux/CaseCommunicationRedux';
import {
	AddCaseCommunication,
	GetCaseCampaignById,
	GetCaseInformationbyId,
	GetCommucationSurvey,
	GetCommunicationById,
	GetCommunicationFeedbackList,
	GetCommunicationSurveyQuestionAnswers,
	SendGetCaseCampaignById,
	SendGetCaseInformationbyId,
	SendGetCommucationSurvey,
	SendGetCommunicationById,
	SendGetCommunicationFeedbackList,
} from '../services/CaseCommunicationApi';
import {useCaseCommHooks, useCaseCommOptions} from './shared/hooks';
import { ColDef, ColGroupDef } from 'ag-grid-community';

const formSchema = Yup.object().shape({
	// messageTypeName: Yup.string()
});

const initialValues = {
	feedbackDetails: '',
	solutionProvided: '',
	campaignName: '',
};

interface answerSelectedOption {
	surveyQuestionId: number;
	selectedOption: OptionListModel;
}

const EditCommunication: React.FC = () => {
	// Get Redux Store
	const {access, userId} = useSelector<RootState>(({auth}) => auth, shallowEqual) as auth.IAuthState;

	const caseCommunicationSurveyData = useSelector<RootState>(
		({caseCommunication}) => caseCommunication.communicationSurveyQuestionAnswer,
		shallowEqual
	) as any;
	const dispatch = useDispatch();

	// Constants
	const [isShotPrompt, setIsShotPrompt] = useState<boolean>(true);
	const history = useHistory();
	const {communicationId}: {communicationId: number} = useParams();
	usePromptOnUnload(isShotPrompt, 'Are you sure you want to leave?');
	const {successResponse, HubConnected, message, FnsDateFormatPatterns} = useConstant();
	let postDateFormat = 'MM/D/yyyy HH:mm:ss';
	let momentFormat = 'DD.MM.YYYY HH:mm:ss';

	// Stats with interface models
	const [playerInformation, setPlayerInformation] = useState<PlayerModel>();

	// States
	// Player Information
	const [brand, setBrand] = useState<string | undefined>('');
	const [contactEmail, setContactEmail] = useState<string>('password');
	const [contactMobileType, setContactMobileType] = useState<string>('password');
	const [currency, setCurrency] = useState<string | undefined>('');
	const [deposited, setDeposited] = useState<string | undefined>('');
	const [internalAccount, setInternalAccount] = useState<string | undefined>('');
	const [isShowContactTypeMobile, setShowContactTypeMobile] = useState<boolean>(false);
	const [isShowEmailText, setIsShowEmailText] = useState<boolean>(false);
	const [marketingChannel, setMarketingChannel] = useState<string | undefined>('');
	const [marketingSource, setMarketingSource] = useState<string | undefined>('');
	const [payment, setPayment] = useState<string | undefined>('');
	const [playerDetailsShow, setPlayerDetailsShow] = useState<boolean>(false);
	const [playerId, setPlayerId] = useState<string>('0');
	const [playerName, setPlayerName] = useState<string | undefined>('');
	const [userName, setUserName] = useState<string | undefined>('');
	const [vipLevel, setVipLevel] = useState<string | undefined>('');
	const [mlabPlayerId, setMlabPlayerId] = useState<number>(0);

	// Case Information
	const [selectedTopic, setSelectedTopic] = useState<string | any>('');
	const [selectedSubtopic, setSelectedSubtopic] = useState<string | any>('');
	const [topicId, setTopicId] = useState<number>(0);
	const [subtopicId, setSubtopicId] = useState<number>(0);
	const [campaignId, setCampaignId] = useState<number>(0);
	const [caseStatusId, setCaseStatusId] = useState<number>(0);
	const [caseId, setCaseId] = useState<number>(0);
	const [caseTypeId, setCaseTypeId] = useState<number>(0);
	const [isContactable, setIsContactable] = useState<boolean>(true);
	const [caseDetailsShow, setCaseDetailsShow] = useState<boolean>(false);
	const [caseTypeName, setCaseTypeName] = useState<string>('');
	const [caseStatusname, setCaseStatusname] = useState<string>('');
	const [caseCreatorName, setCaseCreatorName] = useState<string | undefined>('');
	const [caseCreatedDate, setCaseCreatedDate] = useState<string | undefined>('');
	const [caselastModifiedDate, setCaselastModifiedDate] = useState<string | undefined>('');
	const [caselastModifiedAgent, setCaselastModifiedAgent] = useState<string>('');
	const [campaignName, setCampaignName] = useState<string>('');
	const [caseInformation, setCaseInformation] = useState<CaseInformationResponse>();

	// Campaign Inforamtion
	const [callListNote, setCallListNote] = useState<string>('');
	const [callListNoteId, setCallListNoteId] = useState<number>(0);
	const [surveyTemplateId, setSurveyTemplateId] = useState<number>(0);
	const [brandName, setBrandName] = useState<string>('');

	// Feedbacks
	const [selectedFeedbackType, setSelectedFeedbackType] = useState<string | any>('');
	const [selectedFeedbackCategory, setSelectedFeedbackCategory] = useState<string | any>('');
	const [selectedFeedbackAnswer, setSelectedFeedbackAnswer] = useState<string | any>('');
	const [feedbackTypeId, setFeedbackTypeId] = useState<number>(0);
	const [feedbackCategoryId, setFeedbackCategoryId] = useState<number>(0);
	const [hasFeedbackErrors, setHasFeedbackErrors] = useState<boolean>(false);
	const [errorFeedbackMessage, setErrorFeedbackMessage] = useState<string>('');
	const [rowData, setRowData] = useState<Array<CommunicationFeedBackResponse>>([]);
	const [feedbackData, setFeedbackData] = useState<Array<CommunicationFeedBackResponse>>([]);

	// Survey
	const [surveyQuestion, setSurveyQuestion] = useState<SurveyQuestionResponse[]>([]);
	const [surveyQuestionAnswer, setSurveyQuestionAnswer] = useState<SurveyQuestionAnswerResponse[]>([]);
	const [answerOptionSelectedList, setAnswerOptionSelectedList] = useState<Array<answerSelectedOption> | any>([]);
	const [surveyTemplateTitle, setSurveyTemplateTitle] = useState<string>('');

	// Communications
	const [selectedPurpose, setSelectedPurpose] = useState<string | any>('');
	const [selectedMessageType, setSelectedMessageType] = useState<string | any>('');
	const [messageTypeId, setMessageTypeId] = useState<number>(0);
	const [selectedMessageStatus, setSelectedMessageStatus] = useState<string | any>('');
	const [messageStatusId, setMessageStatusId] = useState<number>(0);
	const [selectedMessageResponse, setSelectedMessageResponse] = useState<string | any>('');
	const [selectedCaseType, setSelectedCaseType] = useState<string | any>('');
	const [communication, setCommunication] = useState<CommunicationResponse>();
	const [openStartCommunication, setOpenStartCommunication] = useState<boolean>(false);
	const [openEndCommunication, setOpenEndCommunication] = useState<boolean>(false);
	const [convertedContent, setConvertedContent] = useState<string>();
	const [startCommunicationDate, setStartCommunicationDate] = useState<any>();
	const [endCommunicationDate, setEndCommunicationDate] = useState<any>();
	const [reportedDate, setReportedDate] = useState<any>();
	const [openReportedDate, setOpenReportedDate] = useState<boolean>(false);
	const [startCommunicationDatePost, setStartCommunicationDatePost] = useState<string>('');
	const [endCommunicationDatePost, setEndCommunicationDatePost] = useState<string>('');

	//Contact Details SO
	const [emailHasIcon, setEmailHasIcon] = useState<boolean>(false);
	const [mobileHasIcon, setMobileHasIcon] = useState<boolean>(false);
	const {validateContactDetailsAccess} = usePlayerManagementHooks();
	const [blindAccount, setBlindAccount] = useState<any>(null);

	//Prefilled fields
	const masterReference = useMasterReferenceOption('4')
		.filter((x: MasterReferenceOptionModel) => x.masterReferenceParentId === 4)
		.map((x: MasterReferenceOptionModel) => x.options);
	const messageTypeOptionValue = useMessageTypeOptions().find((obj) => obj.value === MessageTypeEnum.FlyFoneCall.toString());
	const caseTypeOptionValue = useCaseTypeOptions().find((obj) => obj.label.toLowerCase() === 'campaign');
	const purposeOptionValue = useMasterReferenceOption('4')
		.filter((x: MasterReferenceOptionModel) => x.masterReferenceParentId === 4)
		.map((x: MasterReferenceOptionModel) => x.options)
		.find((x) => x.label.toLowerCase() === 'add communication');

	const {mlabFormatDate} = useFnsDateFormatter();

	/**
	 * ? Hooks
	 */
	const {
		getFeedbackTypeOptionList,
		feedbackTypeOptionList,
		getFeedbackCategoryOptionById,
		feedbackCategoryOptionList,
		getFeedbackAnserOptions,
		feedbackAnswerOptionList,
		feedbackAnswerLoading,
	} = useCaseCommOptions();

	const {convertCommunicationContentToPostRequest, UploadCaseCommContentImageToMlabStorage} = useCaseCommHooks();

	/**
	 * ? Page Mounted
	 */
	useEffect(() => {
		dispatch(caseCommunication.actions.communicationSurveyQuestionAnswer([]));
		if (communicationId !== 0) {
			_loadGetCommunicationEditAccess();
			_getCommunicationFeedbacks();
			_getSurveyData();
		} else {
			swal('Failed', 'Problem getting communication information', 'error');
		}
	}, []);

	const onGridReady = (params: any) => {
		params.api.paginationGoToPage(4);
		setRowData(feedbackData);
		params.api.sizeColumnsToFit();
	};

	//watchers
	useEffect(() => {
		if (feedbackCategoryOptionList.length === 1) setSelectedFeedbackCategory(feedbackCategoryOptionList.find((x) => x.label !== ''));
	}, [feedbackCategoryOptionList]);

	useEffect(() => {
		setRowData(feedbackData);
	}, [feedbackData]);

	useEffect(() => {
		if (feedbackTypeOptionList.length === 1) setSelectedFeedbackType(feedbackTypeOptionList.find((x) => x.label !== ''));
	}, [feedbackTypeOptionList]);

	useEffect(() => {
		if (selectedFeedbackType !== undefined) {
			const {value} = selectedFeedbackType;
			getFeedbackCategoryOptionById(value);
		}
	}, [selectedFeedbackType]);

	useEffect(() => {
		if (selectedFeedbackCategory !== undefined) {
			getFeedbackAnserOptions(selectedFeedbackType.value, selectedFeedbackCategory.value, '');
		}
	}, [selectedFeedbackCategory]);

	useEffect(() => {
		if (feedbackAnswerOptionList.length === 1) {
			const {feedbackAnswerId, feedbackAnswerName, feedbackCategoryName, feedbackTypeName} = feedbackAnswerOptionList[0];
			setSelectedFeedbackAnswer({label: feedbackTypeName + ' - ' + feedbackCategoryName + ' - ' + feedbackAnswerName, value: feedbackAnswerId});
		}
	}, [feedbackAnswerOptionList]);

	/**
	 * ? Api Call
	 */
	async function saveEditCommContactClick(contactTypeId: number) {
		if (playerId != '0' || playerId != undefined || playerId != '') {
			const request: PlayerContactRequestModel = {
				mlabPlayerId: mlabPlayerId,
				userId: parseInt(userId ?? '0'),
				contactTypeId: contactTypeId,
				pageName: 'EDIT_COMMUNICATION',
			};

			await SavePlayerContact(request)
				.then((response) => {
					if (response.status === successResponse) {
						if (response.data.item2 != null && response.data.item2.thresholdAction === 'Deactivate User Account') {
							dispatch(auth.actions.logout());
							swal({
								title: 'Your login session is terminated',
								icon: 'warning',
								dangerMode: true,
							});
						}
					} else {
						swal('Failed', 'Problem in saving profile contact click', 'error');
					}
				})
				.catch((ex) => {
					console.log('[ERROR] Player Profile: ' + ex);
					swal('Failed', 'Problem in saving profile contact click', 'error');
				});
		}
	}

	const _getCaseInformation = (id: number) => {
		setTimeout(() => {
			const messagingHubGetCaseInfo = hubConnection.createHubConnenction();
			messagingHubGetCaseInfo
				.start()
				.then(() => {
					const request: CaseInformationRequest = {
						queueId: Guid.create().toString(),
						userId: userId?.toString() ?? '0',
						caseInformationId: id,
					};
					SendGetCaseInformationbyId(request).then((response) => {
						if (response.status === successResponse) {
							messagingHubGetCaseInfo.on(request.queueId.toString(), (message) => {
								GetCaseInformationbyId(message.cacheId)
									.then((data) => {
										setCaseId(data.data.caseInformatIonId);
										setPlayerId(data.data.playerId);
										setCaseTypeId(data.data.caseTypeId);

										setTopicId(data.data.topicId);
										setSubtopicId(data.data.subtopicId);
										setCampaignId(data.data.campaignId);
										setCaseStatusId(data.data.caseStatusId);

										setCaseId(data.data.caseInformatIonId);
										setPlayerId(data.data.playerId);
										setCaseTypeId(data.data.caseTypeId);

										setCaseInformation(data.data);
										setBrandName(data.data.brandName);
										getPlayerProfile(data.data.playerId, data.data.brandName);
										_getSurveyTemplate(data.data.campaignId);
										_getCaseCampaignInformation(data.data.playerId, data.data.campaignId);

										formik.setFieldValue('caseId', data.data.caseInformatIonId);
										formik.setFieldValue('caseCreator', data.data.caseCreatorName);
										formik.setFieldValue('caseId', data.data.caseInformatIonId);
										formik.setFieldValue('caseStatus', data.data.caseStatusName);
										formik.setFieldValue('createdDate', data.data.createdDate);
										formik.setFieldValue('updatedBy', data.data.updatedByName);
										formik.setFieldValue('updatedDate', data.data.updatedDate);

										setSelectedTopic({
											label: data.data.topicName,
											value: data.data.topicId.toString(),
										});

										setSelectedSubtopic({
											label: data.data.subtopicName,
											value: data.data.subtopicId.toString(),
										});

										setSelectedCaseType({
											label: data.data.caseTypeName,
											value: data.data.caseTypeId.toString(),
										});

										setCaseTypeName(data.data.caseTypeName);
										setCaseStatusname(data.data.caseStatusName);
										setCaseCreatorName(data.data.createdByName);
										setCaseCreatedDate(moment(data.data.createdDate).format(FnsDateFormatPatterns.mlabDateFormat));
										setCaselastModifiedDate(moment(data.data.updatedDate).format(FnsDateFormatPatterns.mlabDateFormat));
										setCaselastModifiedAgent(data.data.updatedByName);
										setCampaignName(data.data.campaignName);
									})
									.catch((err) => {
										console.log('error from callback function', +err);
									});
							});
						} else {
							swal('Problem in getting Case Information');
						}
					});
				})
				.catch((err) => console.log('Error while starting connection: ' + err));
		}, 1000);
	};

	async function getPlayerProfile(id: string, brandName: string) {
		await GetPlayerProfile({playerId: id, brandName: brandName})
			.then((response) => {
				if (response.status === successResponse) {
					let profile: PlayerModel = response.data?.data;

					setPlayerInformation(profile);
					let userNameCurrency = profile.username + '' + '(' + profile.currency + ')';
					formik.setFieldValue('username', userNameCurrency);
					formik.setFieldValue('brand', profile.brand);
					formik.setFieldValue('currency', profile.currency);
					formik.setFieldValue('vipLevel', profile.vipLevel);
					formik.setFieldValue('paymentGroup', profile.paymentGroup);
					formik.setFieldValue('deposited', profile.deposited === true ? 'Yes' : 'No');
					formik.setFieldValue('marketingChannel', profile.marketingChannel);
					formik.setFieldValue('marketingSource', profile.marketingSource);
					formik.setFieldValue('mobilePhone', profile.mobilePhone);
					formik.setFieldValue('email', profile.email);
					formik.setFieldValue('campaignName', profile.campaignName);

					setBrand(profile.brand);
					setCurrency(profile.currency);
					setUserName(profile.username);
					setPlayerName(profile.firstName + ' ' + profile.lastName);
					setVipLevel(profile.vipLevel);
					setPayment(profile.paymentGroup);
					setInternalAccount(profile.internalAccount === true ? 'Yes' : 'No');
					setMarketingChannel(profile?.marketingChannel);
					setMarketingSource(profile?.marketingSource);
					setDeposited(profile.deposited === true ? 'Yes' : 'No');
					setMlabPlayerId(profile?.mlabPlayerId ?? 0);
					setBlindAccount(!!profile.blindAccount);
				} else {
					setPlayerInformation(undefined);
				}
			})
			.catch((ex) => {
				console.log('Problem in getting profile' + ex);
				history.push('/error/401');
			});
	}

	useEffect(() => {
		if (blindAccount !== null) {
			verifyEmail(blindAccount);
			verifyMobile(blindAccount);
		}
	}, [blindAccount]);

	const verifyEmail = (_isBlindAccount: boolean) => {
		const hasViewEyeIcon = validateContactDetailsAccess(access, _isBlindAccount);
		setEmailHasIcon(hasViewEyeIcon);
	};

	const verifyMobile = (_isBlindAccount: boolean) => {
		const hasViewIcon = validateContactDetailsAccess(access, _isBlindAccount);
		setMobileHasIcon(hasViewIcon);
	};

	const _getCaseCampaignInformation = (playerId: string, campaignId: number) => {
		setTimeout(() => {
			const messagingHubGetCaseCampaignInformation = hubConnection.createHubConnenction();
			messagingHubGetCaseCampaignInformation
				.start()
				.then(() => {
					const request: CaseCampaignByIdRequest = {
						userId: userId?.toString() ?? '0',
						queueId: Guid.create().toString(),
						campaignId: campaignId,
						playerId: playerId,
						brandName: brand,
					};

					SendGetCaseCampaignById(request).then((response) => {
						if (response.status === successResponse) {
							messagingHubGetCaseCampaignInformation.on(request.queueId.toString(), (message) => {
								GetCaseCampaignById(message.cacheId)
									.then((data) => {
										setCallListNoteId(data.data.callListNoteId);
										setCallListNote(data.data.callListNote);
										setSurveyTemplateId(data.data.surveyTemplateId);
										formik.setFieldValue('campaignName', data.data.campaignName);
										getFeedbackAnserOptions('', '', '');
									})
									.catch((err) => {
										console.log('error from callback function' + err);
									});
							});
						} else {
							swal('Problem in getting Case and Campaign Information');
						}
					});
				})
				.catch((err) => console.log('Error while starting connection: ' + err));
		}, 1000);
	};

	const _loadGetCommunicationEditAccess = async () => {
		const hasAccess = await _getCommunicationById();
		if (!hasAccess) {
			history.push('/error/401');
		}
	};

	const _getCommunicationById = async () => {
		try {
			const messagingHubGetCommunicationById = hubConnection.createHubConnenction();
			await messagingHubGetCommunicationById.start();

			const request: CommunicationByIdRequest = {
				queueId: Guid.create().toString(),
				userId: userId?.toString() ?? '0',
				caseCommunicationId: communicationId,
			};

			const response = await SendGetCommunicationById(request);
			if (response.status !== successResponse) {
				swal('Problem in getting communication record');
				return false;
			}

			return new Promise((resolveAccess) => {
				messagingHubGetCommunicationById.on(request.queueId.toString(), async (message) => {
					try {
						const data = await GetCommunicationById(message.cacheId);

						if (!data?.data) {
							resolveAccess(false);
							return;
						}

						setCommunication(data.data);
						_getCaseInformation(data.data.caseInformationId);
						setMessageTypeId(data.data.messagetypeId);
						setMessageStatusId(data.data.messagestatusId);
						setSelectedPurpose({
							label: data.data.purposeName,
							value: data.data.purposeId,
						});
						setSelectedMessageType({
							label: data.data.messageTypeName,
							value: data.data.messagetypeId.toString(),
						});
						setSelectedMessageStatus({
							label: data.data.messageStatusName,
							value: data.data.messagestatusId.toString(),
						});
						setSelectedMessageResponse({
							label: data.data.messageResponseName,
							value: data.data.messageresponseId.toString(),
						});
						setIsContactable(data.data.messageStatusName.toLocaleLowerCase() === 'contactable');
						formik.setFieldValue('communicationCreatedBy', data.data.createdByName);
						let createdDate = parse(data.data.updatedDate ?? '', FnsDateFormatPatterns.mlabDateFormat, new Date());
						formik.setFieldValue('communicationCreatedDate', mlabFormatDate(createdDate));
						formik.setFieldValue('communicationId', data.data.caseCommunicationId);

						setStartCommunicationDate(moment(data.data.startCommunicationDate).toDate());
						setStartCommunicationDatePost(moment(data.data.startCommunicationDate).format(postDateFormat));
						setEndCommunicationDate(moment(data.data.endCommunicationDate).toDate());
						setEndCommunicationDatePost(moment(data.data.endCommunicationDate).format(postDateFormat));
						setReportedDate(moment(data.data.reportedDate).toDate());

						// setInititalContent(htmlDecode(data.data.communicationContent ?? ''));
						setConvertedContent(htmlDecode(data.data.communicationContent));
						resolveAccess(true);
					} catch (err) {
						console.log('error from callback function' + err);
						resolveAccess(false);
					}
				});
			});
		} catch (err) {
			console.log('Error while starting connection: ' + err);
			return false;
		}
	};

	const _getSurveyTemplate = (campaignId: number) => {
		GetCommunicationSurveyQuestionAnswers(campaignId)
			.then((response) => {
				if (response.status === successResponse) {
					setSurveyQuestion(response.data.surveyQuestions);
					setSurveyQuestionAnswer(response.data.surveyQuestionAnswers);
					setSurveyTemplateTitle(response.data.surveyTemplate.surveyTemplateName);
				} else {
					swal('Problem in Survey Questions and Answers');
				}
			})
			.catch((err) => {
				console.log('Problem in Survey Questions and Answers' + err);
			});
	};

	const _getSurveyData = () => {
		setTimeout(() => {
			const messagingHub = hubConnection.createHubConnenction();
			messagingHub
				.start()
				.then(() => {
					const request: CommunicationSurveyRequest = {
						queueId: Guid.create().toString(),
						userId: userId?.toString() ?? '0',
						caseCommunicationId: communicationId,
					};

					SendGetCommucationSurvey(request).then((response) => {
						if (response.status === successResponse) {
							messagingHub.on(request.queueId.toString(), (message) => {
								GetCommucationSurvey(message.cacheId)
									.then((response) => {
										let surveyQuestionAnsersData = Object.assign(new Array<CommunicationSurveyQuestionResponse>(), response.data);
										let newSelectionData = Array<answerSelectedOption>();

										let surveyAnswerResponse = Array<CommunicationSurveyQuestionAnswerResponse>();

										surveyQuestionAnsersData.forEach((item: CommunicationSurveyQuestionResponse) => {
											const requestToStore: CommunicationSurveyQuestionAnswerResponse = {
												communicationSurveyQuestionId: item.communicationSurveyQuestionId,
												caseCommunicationId: item.caseCommunicationId,
												surveyTemplateId: surveyTemplateId,
												surveyQuestionId: item.surveyQuestionId,
												surveyQuestionAnswersId: item.surveyQuestionAnswersId,
												surveyAnswerName: item.surveyAnswerName,
											};
											surveyAnswerResponse.push(requestToStore);
										});
										dispatch(caseCommunication.actions.communicationSurveyQuestionAnswer(surveyAnswerResponse));
										setAnswerOptionSelectedList([]);

										surveyQuestionAnsersData.forEach((item: CommunicationSurveyQuestionResponse) => {
											const selectedItemData: answerSelectedOption = {
												surveyQuestionId: item.surveyQuestionId,
												selectedOption: {value: item.surveyQuestionAnswersId.toString(), label: item.surveyAnswerName},
											};
											newSelectionData.push(selectedItemData);
										});
										setAnswerOptionSelectedList(newSelectionData);
									})
									.catch(() => {
										console.log('error from callback function');
									});
							});
						} else {
							swal('Problem on getting survey data');
						}
					});
				})
				.catch((err) => console.log('Error while starting connection: ' + err));
		}, 1000);
	};

	const _getCommunicationFeedbacks = () => {
		setTimeout(() => {
			const messagingHub = hubConnection.createHubConnenction();
			messagingHub
				.start()
				.then(() => {
					const request: CommunicationByIdRequest = {
						queueId: Guid.create().toString(),
						userId: userId?.toString() ?? '0',
						caseCommunicationId: communicationId,
					};

					SendGetCommunicationFeedbackList(request).then((response) => {
						if (response.status === successResponse) {
							messagingHub.on(request.queueId.toString(), (message) => {
								GetCommunicationFeedbackList(message.cacheId)
									.then((data) => {
										let feedbackData = Object.assign(new Array<CommunicationFeedBackResponse>(), data.data);
										let moldFeedbackData = Array<CommunicationFeedBackResponse>();

										feedbackData.forEach((obj) => {
											const request: CommunicationFeedBackResponse = {
												communicationFeedbackId: obj.communicationFeedbackId,
												caseCommunicationId: obj.caseCommunicationId,
												communicationFeedbackNo: obj.communicationFeedbackNo,
												feedbackTypeId: obj.feedbackTypeId,
												feedbackTypeName: obj.feedbackTypeName,
												feedbackCategoryId: obj.feedbackCategoryId,
												feedbackCategoryName: obj.feedbackCategoryName,
												feedbackAnswerId: obj.feedbackAnswerId,
												feedbackAnswerName: obj.feedbackAnswerName,
												communicationFeedbackDetails: obj.communicationFeedbackDetails,
												communicationSolutionProvided: obj.communicationSolutionProvided,
											};
											moldFeedbackData.push(request);
										});

										setFeedbackData(moldFeedbackData);
									})
									.catch((err) => {
										console.log('error from callback function GetCommunicationFeedbackList' + err);
									});
							});
						} else {
							swal('Problem in communication feedbacks');
						}
					});
				})
				.catch((err) => console.log('Error while starting connection: ' + err));
		}, 1000);
	};

	/**
	 * ? Events Methods
	 */
	const onClickContactMobile = () => {
		setShowContactTypeMobile(!isShowContactTypeMobile);
		setContactMobileType('password');

		if (!isShowContactTypeMobile) {
			setContactMobileType('text');
			saveEditCommContactClick(PLAYER_CONTANTS.ContactType_Mobile_Id);
		}
	};

	const onClickShowEmail = () => {
		setIsShowEmailText(!isShowEmailText);
		setContactEmail('password');

		if (!isShowEmailText) {
			setContactEmail('text');
			saveEditCommContactClick(PLAYER_CONTANTS.ContactType_Email_Id);
		}
	};

	// Case
	const onClickCaseDetails = () => {
		setCaseDetailsShow(true);
	};

	const onChangeSelectedTopic = (val: string | any) => {
		setSelectedTopic(val);
		setSelectedSubtopic('');
		setTopicId(val.value);
	};

	const onChangeSelectedSubTopic = (val: string) => {
		setSelectedSubtopic(val);
	};

	// Player
	const onClickPlayerDetails = () => {
		setPlayerDetailsShow(true);
	};

	// Communication
	const onChangeSelectPurpose = (val: string) => {
		setSelectedPurpose(val);
	};

	const _setEndCommunicationNow = () => {
		moment.defaultFormat = momentFormat;
		let today = moment(moment(), moment.defaultFormat).toDate();
		setEndCommunicationDate(today);

		let formatedEndCommunicationDate = moment(today).format(postDateFormat);
		setEndCommunicationDatePost(formatedEndCommunicationDate.toString());
	};

	const _setStartCommunicationNow = () => {
		moment.defaultFormat = momentFormat;
		let today = moment(moment(), moment.defaultFormat).toDate();
		setStartCommunicationDate(today);

		let formatedStartCommunicationDate = moment(today).format(postDateFormat);
		setStartCommunicationDatePost(formatedStartCommunicationDate.toString());
	};

	const onChangeStartCommunicationDate = (val: any) => {
		setOpenStartCommunication(!openStartCommunication);
		setStartCommunicationDate(val);

		let formatedStartCommunicationDate = moment(val).format(postDateFormat);
		setStartCommunicationDatePost(formatedStartCommunicationDate.toString());
	};

	const onChangeEndCommunicationDate = (val: any) => {
		setEndCommunicationDate(val);
		setOpenEndCommunication(!openEndCommunication);

		let formatedEndCommunicationDate = moment(val).format(postDateFormat);
		setEndCommunicationDatePost(formatedEndCommunicationDate.toString());
	};

	const onChangeMessageType = (val: string | any) => {
		setSelectedMessageType(val);
		setSelectedMessageStatus('');
		setSelectedMessageResponse('');
		setMessageTypeId(val.value);
	};

	const onChangeMessageStatus = (val: string | any) => {
		setSelectedMessageStatus(val);
		setSelectedMessageResponse('');
		dispatch(caseCommunication.actions.communicationSurveyQuestionAnswer([]));
		// dispatch(caseCommunication.actions.communicationFeedbackList([]));
		setAnswerOptionSelectedList([]);
		setMessageStatusId(val.value);
		let messageStatusLabel: string = val.label;
		if (messageStatusLabel.toLocaleLowerCase() === 'contactable') {
			setIsContactable(true);
		} else {
			setIsContactable(false);
		}
	};

	const onChangeMessageResponse = (val: string) => {
		setSelectedMessageResponse(val);
	};

	const handleEditorChange = useCallback((_content: string) => {
		setConvertedContent(_content);
	}, []);

	// Feedbacks
	const onChangeSelectFeedbackAnswer = (val: any) => {
		const {feedbackAnswerId, feedbackAnswerName, feedbackCategoryId, feedbackCategoryName, feedbackTypeId, feedbackTypeName} = val.value;
		setSelectedFeedbackAnswer({label: feedbackTypeName + ' - ' + feedbackCategoryName + ' - ' + feedbackAnswerName, value: feedbackAnswerId});
		setSelectedFeedbackCategory({label: feedbackCategoryName, value: feedbackCategoryId});
		setSelectedFeedbackType({label: feedbackTypeName, value: feedbackTypeId});
	};

	const onChangeCaseType = (val: string) => {
		setSelectedCaseType(val);
	};

	const onChangeSelectFeedbackType = (val: string | any) => {
		setSelectedFeedbackType(val);
		setSelectedFeedbackCategory('');
		setFeedbackTypeId(val.value);
	};

	const onChangeSelectFeedbackCategory = (val: string | any) => {
		setSelectedFeedbackCategory(val);
		setSelectedFeedbackAnswer('');
		setFeedbackCategoryId(val.value);
		getFeedbackAnserOptions(selectedFeedbackType.value, val.value, '');
	};

	// Methods
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
				_clearStorage();
				history.push(`/campaign-workspace/view-communication/${communicationId}`);
			} else {
				setIsShotPrompt(true);
			}
		});
	};

	const _validateForm = () => {
		let isError: boolean = false;

		if (selectedTopic.value === undefined) {
			isError = true;
		}

		if (selectedSubtopic.value === undefined) {
			isError = true;
		}
		if (selectedMessageStatus.value === undefined) {
			isError = true;
		}

		if (selectedMessageResponse.value === undefined) {
			isError = true;
		}

		if (startCommunicationDatePost === '' || startCommunicationDatePost === undefined) {
			isError = true;
		}

		if (endCommunicationDatePost === '' || endCommunicationDatePost === undefined) {
			isError = true;
		}

		if (startCommunicationDatePost === 'Invalid date') {
			isError = true;
		}

		if (endCommunicationDatePost === 'Invalid date') {
			isError = true;
		}

		if (convertedContent === undefined || convertedContent === '') {
			isError = true;
		}

		if (isContactable === true) {
			if (caseCommunicationSurveyData === undefined || caseCommunicationSurveyData.length === 0) {
				isError = true;
			}

			let requiredQuestion = surveyQuestion.filter((x) => x.isMandatory === true).map((x) => x.surveyQuestionId);
			let answersData = caseCommunicationSurveyData.filter((x: any) => x.surveyAnswerName !== '').map((x: any) => x.surveyQuestionId);
			let allFounded = requiredQuestion.every((rq) => answersData.includes(rq));

			if (allFounded === false) {
				isError = true;
			}
		}

		return isError;
	};

	const _validateCommunicationDate = () => {
		let isError: boolean = false;
		let startCommunicationDate = moment(startCommunicationDatePost);
		let endCommunicationDate = moment(endCommunicationDatePost);

		isError = startCommunicationDate.isSameOrAfter(endCommunicationDate, 'second');

		return isError;
	};

	const _dispatchFeedbackType = () => {
		let storedData = feedbackData ? feedbackData : [];
		let isError: boolean = false;

		if (selectedFeedbackCategory.value === undefined || selectedFeedbackCategory.value === '') {
			isError = true;
			setHasFeedbackErrors(true);
			setErrorFeedbackMessage(message.requiredAllFields);
		}

		if (selectedFeedbackType.value === undefined || selectedFeedbackType.value === '') {
			isError = true;
			setHasFeedbackErrors(true);
			setErrorFeedbackMessage(message.requiredAllFields);
		}

		if (formik.values.feedbackDetails === '') {
			isError = true;
			setHasFeedbackErrors(true);
			setErrorFeedbackMessage(message.requiredAllFields);
		}

		if (selectedFeedbackAnswer.value === undefined || selectedFeedbackAnswer.value === '') {
			isError = true;
			setHasFeedbackErrors(true);
			setErrorFeedbackMessage(message.requiredAllFields);
		}

		if (formik.values.solutionProvided === '') {
			isError = true;
			setHasFeedbackErrors(true);
			setErrorFeedbackMessage(message.requiredAllFields);
		}

		if (feedbackData !== undefined) {
			const requestToValidate: CommunicationFeedBackResponse = {
				communicationFeedbackId: 1,
				caseCommunicationId: communicationId,
				communicationFeedbackNo: 1,
				feedbackTypeId: parseInt(selectedFeedbackType.value),
				feedbackTypeName: selectedFeedbackType.label,
				feedbackCategoryId: parseInt(selectedFeedbackCategory.value),
				feedbackCategoryName: selectedFeedbackCategory.label,
				feedbackAnswerId: parseInt(selectedFeedbackAnswer.value),
				feedbackAnswerName: feedbackAnswerOptionList.find((x) => x.feedbackAnswerId === selectedFeedbackAnswer.value)?.feedbackAnswerName || '',
				communicationFeedbackDetails: formik.values.feedbackDetails,
				communicationSolutionProvided: formik.values.solutionProvided,
			};

			let searchFeedbackData = feedbackData.find(
				(x: CommunicationFeedBackResponse) =>
					x.feedbackTypeId === requestToValidate.feedbackTypeId &&
					x.feedbackCategoryId === requestToValidate.feedbackCategoryId &&
					x.feedbackAnswerId === requestToValidate.feedbackAnswerId &&
					x.communicationFeedbackDetails.toLocaleUpperCase() === requestToValidate.communicationFeedbackDetails.toLocaleUpperCase() &&
					x.communicationSolutionProvided.toLocaleUpperCase() === requestToValidate.communicationSolutionProvided.toUpperCase()
			);

			if (searchFeedbackData !== undefined) {
				setHasFeedbackErrors(true);
				setErrorFeedbackMessage('Value already exists, please check the table to find them');
				isError = true;
			}
		}

		if (isError === false) {
			const request: CommunicationFeedBackResponse = {
				communicationFeedbackId: 1,
				caseCommunicationId: communicationId,
				communicationFeedbackNo: 1,
				feedbackTypeId: parseInt(selectedFeedbackType.value),
				feedbackTypeName: selectedFeedbackType.label,
				feedbackCategoryId: parseInt(selectedFeedbackCategory.value),
				feedbackCategoryName: selectedFeedbackCategory.label,
				feedbackAnswerId: parseInt(selectedFeedbackAnswer.value),
				feedbackAnswerName: feedbackAnswerOptionList.find((x) => x.feedbackAnswerId === selectedFeedbackAnswer.value)?.feedbackAnswerName || '',
				communicationFeedbackDetails: formik.values.feedbackDetails,
				communicationSolutionProvided: formik.values.solutionProvided,
			};

			let storedData = feedbackData ? feedbackData : [];
			const newDataToStore = storedData.concat(request);

			// dispatch(caseCommunication.actions.communicationFeedbackList(newDataToStore));
			setFeedbackData(newDataToStore);
			setRowData(feedbackData);
			setHasFeedbackErrors(false);
			setErrorFeedbackMessage('');
			_resetFeedbackForm();
		}
	};

	const _dispatchSurveyData = (data: CommunicationSurveyQuestionAnswerResponse) => {
		let storedData = caseCommunicationSurveyData !== undefined ? caseCommunicationSurveyData : [];
		const count = storedData.findIndex((x: CommunicationSurveyQuestionAnswerResponse) => x.surveyQuestionId === data.surveyQuestionId);

		if (count < 0) {
			let addNewData = storedData.concat(data);
			dispatch(caseCommunication.actions.communicationSurveyQuestionAnswer(addNewData));
		} else {
			let filteredData = storedData.filter((x: CommunicationSurveyQuestionAnswerResponse) => x.surveyQuestionId !== data.surveyQuestionId);
			let UpdatedData = [...filteredData, data];
			dispatch(caseCommunication.actions.communicationSurveyQuestionAnswer(UpdatedData));
		}
	};

	const _resetFeedbackForm = () => {
		setSelectedFeedbackType('');
		setSelectedFeedbackCategory('');
		setSelectedFeedbackAnswer('');
		formik.setFieldValue('feedbackDetails', '');
		formik.setFieldValue('solutionProvided', '');
	};

	const _back = () => {
		swal({
			title: 'Confirmation',
			text: 'Any changes will be discarded, please confirm',
			icon: 'warning',
			buttons: ['No', 'Yes'],
			dangerMode: true,
		}).then((willUpdate) => {
			if (willUpdate) {
				history.push(`/campaign-workspace/view-case/${caseId}`);
			}
		});
	};

	const _clearStorage = () => {
		dispatch(caseCommunication.actions.communicationSurveyQuestionAnswer([]));
		dispatch(caseCommunication.actions.communicationFeedbackList([]));
		_resetFeedbackForm();
	};

	const _removeFeedback = (data: CommunicationFeedBackResponse) => {
		let filterdFeedback = feedbackData.filter((x: CommunicationFeedBackResponse) => x !== data);
		setFeedbackData(filterdFeedback);
		// dispatch(caseCommunication.actions.communicationFeedbackList([...filterdFeedback]));
	};

	// ELEMENTS
	function renderCaseDetails(): JSX.Element {
		return (
			<>
				<Row aria-label='Case Type'>
					<Col sm={12}>
						<BasicFieldLabel title={'Case Type'} /> : <BasicFieldLabel title={caseTypeName} />
					</Col>
				</Row>
				<Row aria-label='Case Status'>
					<Col sm={12}>
						<BasicFieldLabel title={'Case Status'} /> : <BasicFieldLabel title={caseStatusname} />
					</Col>
				</Row>
				<Row aria-label='Case Creator'>
					<Col sm={12}>
						<BasicFieldLabel title={'Case Creator'} /> : <BasicFieldLabel title={caseCreatorName ? caseCreatorName.toString() : ''} />
					</Col>
				</Row>
				<Row aria-label='Created Date'>
					<Col sm={12}>
						<BasicFieldLabel title={'Created Date'} /> : <BasicFieldLabel title={caseCreatedDate ? caseCreatedDate?.toString() : ''} />
					</Col>
				</Row>
				<Row aria-label='Last Modified Date'>
					<Col sm={12}>
						<BasicFieldLabel title={'Last Modified Date'} /> :{' '}
						<BasicFieldLabel title={caselastModifiedDate ? caselastModifiedDate?.toString() : ''} />
					</Col>
				</Row>
				<Row aria-label='Last Modified By'>
					<Col sm={12}>
						<BasicFieldLabel title={'Last Modified By'} /> :{' '}
						<BasicFieldLabel title={caselastModifiedAgent ? caselastModifiedAgent?.toString() : ''} />
					</Col>
				</Row>
				<Row aria-label='Campaign Name'>
					<Col sm={12}>
						<BasicFieldLabel title={'Campaign Name'} /> : <BasicFieldLabel title={formik.values.campaignName} />
					</Col>
				</Row>
			</>
		);
	}

	function renderPlayerDetails(): JSX.Element {
		return (
			<>
				<Row aria-label='Brand'>
					<Col sm={12}>
						<BasicFieldLabel title={'Brand'} /> : <BasicFieldLabel title={brand ? brand.toString() : ''} />
					</Col>
				</Row>
				<Row aria-label='Currency'>
					<Col sm={12}>
						<BasicFieldLabel title={'Currency'} /> : <BasicFieldLabel title={currency ? currency.toString() : ''} />
					</Col>
				</Row>
				<Row aria-label='Username'>
					<Col sm={12}>
						<BasicFieldLabel title={'Username'} /> : <BasicFieldLabel title={userName ? userName.toString() : ''} />
					</Col>
				</Row>
				<Row aria-label='Player Name'>
					<Col sm={12}>
						<BasicFieldLabel title={'Player Name'} /> : <BasicFieldLabel title={playerName ? playerName : ''} />
					</Col>
				</Row>
				<Row aria-label='VIP Level'>
					<Col sm={12}>
						<BasicFieldLabel title={'VIP Level'} /> : <BasicFieldLabel title={vipLevel ? vipLevel?.toString() : ''} />
					</Col>
				</Row>
				<Row aria-label='Payment Group'>
					<Col sm={12}>
						<BasicFieldLabel title={'Payment Group'} /> : <BasicFieldLabel title={payment ? payment?.toString() : ''} />
					</Col>
				</Row>
				<Row aria-label='Internal Account'>
					<Col sm={12}>
						<BasicFieldLabel title={'Internal Account'} /> : <BasicFieldLabel title={internalAccount ? internalAccount?.toString() : ''} />
					</Col>
				</Row>
				<Row aria-label='Markering Channel'>
					<Col sm={12}>
						<BasicFieldLabel title={'Markering Channel'} /> : <BasicFieldLabel title={marketingChannel ? marketingChannel?.toString() : ''} />
					</Col>
				</Row>
				<Row aria-label='Marketing Source'>
					<Col sm={12}>
						<BasicFieldLabel title={'Marketing Source'} /> : <BasicFieldLabel title={marketingSource ? marketingSource?.toString() : ''} />
					</Col>
				</Row>
				<Row aria-label='Deposited'>
					<Col sm={12}>
						<BasicFieldLabel title={'Deposited'} /> : <BasicFieldLabel title={deposited ? deposited.toString() : ''} />
					</Col>
				</Row>
			</>
		);
	}

	// Table Content and Header
	const columnDefs : (ColDef<CommunicationFeedBackResponse> | ColGroupDef<CommunicationFeedBackResponse>)[] =[
		{
			headerName: 'No',
			field: 'communicationFeedbackNo',
			sort: 'asc' as 'asc',
			cellRenderer: (params: any) => <>{params ? <div>{params.rowIndex + 1}</div> : null}</>,
		},
		{headerName: 'Feedback Type', field: 'feedbackTypeName'},
		{headerName: 'Feedback Category', field: 'feedbackCategoryName'},
		{headerName: 'Feedback Answer', field: 'feedbackAnswerName'},
		{headerName: 'Feedback Details', field: 'communicationFeedbackDetails'},
		{headerName: 'Solution Provided', field: 'communicationSolutionProvided'},
		{
			headerName: 'Action',
			cellRenderer: (params: any) => (
				<>
					<ButtonGroup aria-label='Basic example'>
						<div className='d-flex justify-content-center flex-shrink-0'>
							<DefaultTableButton
								access={access?.includes(USER_CLAIMS.EditCommunicationWrite)}
								title={'remove'}
								onClick={() => _removeFeedback(params.data)}
							/>
						</div>
					</ButtonGroup>
				</>
			),
		},
	];

	// Formik
	const formik = useFormik({
		initialValues,
		onSubmit: async (values, {setStatus, setSubmitting, resetForm}) => {
			setSubmitting(true);
			if (_validateForm() === true) {
				swal('Failed', 'Unable to proceed, kindly fill up all mandatory fields', 'error');
				setSubmitting(false);
			} else {
				if (_validateCommunicationDate() === true) {
					swal('Failed', 'Unable to proceed, Communication end date and time must be higher than Communication Start date', 'error');
					setSubmitting(false);
				} else {
					let postFeedbackData = feedbackData ?? [];
					let postSurveyData = caseCommunicationSurveyData ?? [];
					let feedbackRequestData = Array<AddCommunicationFeedbackRequest>();

					if (isContactable === true) {
						postFeedbackData.forEach((item: CommunicationFeedBackResponse) => {
							const feedbackRequest: AddCommunicationFeedbackRequest = {
								communicationFeedbackId: item.communicationFeedbackId,
								caseCommunicationId: communicationId,
								communicationFeedbackNo: item.communicationFeedbackNo,
								feedbackTypeId: item.feedbackTypeId,
								feedbackCategoryId: item.feedbackCategoryId,
								feedbackAnswerId: item.feedbackAnswerId,
								feedbackAnswer: item.feedbackAnswerName,
								communicationFeedbackDetails: item.communicationFeedbackDetails,
								communicationSolutionProvided: item.communicationSolutionProvided,
								createdBy: parseInt(userId ?? '0'),
								updatedBy: parseInt(userId ?? '0'),
							};
							feedbackRequestData.push(feedbackRequest);
						});
					}

					let surveyRequestData = Array<AddCommunicationSurveyRequest>();
					if (isContactable === true) {
						postSurveyData.forEach((item: CommunicationSurveyQuestionAnswerResponse) => {
							const surverQuestionAnswerRequest: AddCommunicationSurveyRequest = {
								communicationSurveyQuestionId: item.communicationSurveyQuestionId,
								caseCommunicationId: item.caseCommunicationId,
								surveyTemplateId: item.surveyTemplateId,
								surveyQuestionId: item.surveyQuestionId,
								surveyQuestionAnswersId: item.surveyQuestionAnswersId,
								surveyAnswer: item.surveyAnswerName,
								createdBy: parseInt(userId ?? '0'),
								updatedBy: parseInt(userId ?? '0'),
							};
							surveyRequestData.push(surverQuestionAnswerRequest);
						});
					}

					let convertedEditCommContent = await convertCommunicationContentToPostRequest(convertedContent ?? '');
					const communicationRequest: AddCommunicationRequest = {
						caseCommunicationId: communicationId,
						caseInformationId: caseId,
						purposeId: purposeOptionValue !== undefined ? parseInt(purposeOptionValue.value) : 0,
						messageTypeId: selectedMessageType !== undefined ? parseInt(selectedMessageType.value) : 0,
						messageStatusId: parseInt(selectedMessageStatus.value),
						messageReponseId: parseInt(selectedMessageResponse.value),
						startCommunicationDate: startCommunicationDatePost,
						endCommunicationDate: endCommunicationDatePost,
						communicationContent: convertedEditCommContent,
						communicationSurveyQuestion: surveyRequestData,
						communicationFeedBackType: feedbackRequestData,
						createdBy: parseInt(userId ?? '0'),
						updatedBy: parseInt(userId ?? '0'),
					};

					const request: AddCaseCommunicationRequest = {
						queueId: Guid.create().toString(),
						userId: userId?.toString() ?? '0',
						playerId: playerId,
						caseInformationId: caseId,
						caseCreatorId: parseInt(userId ?? '0'),
						caseTypeId: caseTypeId,
						campaignId: campaignId,
						caseStatusId: caseStatusId,
						topicId: topicId,
						subtopicId: subtopicId,
						callListNote: callListNote,
						callListNoteId: callListNoteId || 0,
						caseCommunication: communicationRequest,
						brandName: brandName,
					};

					if (!isJsonSizeValid(request)) {
						setSubmitting(false);
						swal(SwalDetails.ErrorTitle, 'Communication content should not exceed 3MB.', SwalDetails.ErrorIcon);
						return;
					}

					setSubmitting(true);
					setTimeout(() => {
						const messagingHub = hubConnection.createHubConnenction();
						messagingHub
							.start()
							.then(() => {
								if (messagingHub.state === HubConnected) {
									setSubmitting(true);
									AddCaseCommunication(request)
										.then((response) => {
											if (response.status === successResponse) {
												messagingHub.on(request.queueId.toString(), (message) => {
													let resultData = JSON.parse(message.remarks);

													if (resultData.Status === successResponse) {
														swal('Success', 'Transaction successfully submitted', 'success').then((willUpdate) => {
															if (willUpdate) {
																_clearStorage();
																history.push(`/campaign-workspace/view-communication/${communicationId}`);
																setSubmitting(false);
															}
														});
													} else {
														swal('Failed', 'Problem connecting to the server, Please refresh', 'error').then((willUpdate) => {
															_clearStorage();
															setSubmitting(false);
														});
													}
													messagingHub.stop();
													messagingHub.off(request.queueId.toString());
												});

												setTimeout(() => {
													if (messagingHub.state === HubConnected) {
														messagingHub.stop();
													}
												}, 30000);
											} else {
												swal('Failed', 'Problem in Connection on Gateway', 'error');
												setSubmitting(false);
											}
										})
										.catch(() => {
											messagingHub.stop();
											setSubmitting(false);
											swal('Failed', 'Problem in Connection on Gateway', 'error');
										});
								}
							})
							.catch((err) => console.log('Error while starting connection: ' + err));
					}, 1000);
				}
			}
		},
	});
	const images_upload_handler_edit = (blobInfo: any, success: any, failure: any, progress: any) => {
		const formDataEditComm = new FormData();

		formDataEditComm.append('file', blobInfo.blob(), blobInfo.filename());

		uploadFile(formDataEditComm)
			.then((response) => {
				const jsonEditComm = response.data;

				if (response.status === HttpStatusCodeEnum.Ok) {
					success(jsonEditComm.location);
				} else {
					failure('Failed to upload. ' + blobInfo.filename(), {remove: true});
				}
			})
			.catch((error) => {
				failure(error, {remove: true});
			});
	};
	return (
		<FormContainer onSubmit={formik.handleSubmit}>
			<MainContainer>
				<FormHeader headerLabel={'Case and Player Information'} />
				<div style={{margin: 40}}>
					<Row>
						<Col sm={4}>
							<BasicFieldLabel title={'Case ID'} />
							<InputGroup>
								<div className='col-sm-10'>
									<input type={'text'} disabled aria-label='Case ID' className='form-control form-control-sm' {...formik.getFieldProps('caseId')} />
								</div>

								<div
									style={{right: '20px', bottom: '5px'}}
									className='btn btn-icon w-auto px-0 btn-active-color-primary'
									onClick={onClickCaseDetails}
								>
									<FontAwesomeIcon icon={faInfoCircle} />
								</div>
							</InputGroup>
							<DismissibleToast
								toastHeader={'Case Details'}
								onClose={() => setCaseDetailsShow(false)}
								show={caseDetailsShow}
								toastBody={renderCaseDetails()}
							/>
						</Col>
						<Col sm={4}>
							<BasicFieldLabel title={'Username (Currency)'} />

							<InputGroup>
								<div className='col-sm-10'>
									<input
										aria-label='username'
										disabled
										type={'text'}
										className='form-control form-control-sm'
										{...formik.getFieldProps('username')}
									/>
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
								toastHeader={'Player Details'}
								onClose={() => setPlayerDetailsShow(false)}
								show={playerDetailsShow}
								toastBody={renderPlayerDetails()}
							/>
						</Col>
					</Row>

					<Row style={{marginTop: 20, marginBottom: 20}}>
						<Col sm={3}>
							<BasicFieldLabel title={'Topic'} />
							<DefaultSelect data={useTopicOptions()} onChange={onChangeSelectedTopic} value={selectedTopic} isDisabled={true} />
						</Col>
						<Col sm={3}>
							<BasicFieldLabel title={'Subtopic'} />
							<DefaultSelect data={useSubtopicOptions(topicId)} onChange={onChangeSelectedSubTopic} value={selectedSubtopic} isDisabled={true} />
						</Col>
						<Col sm={3}>
							<BasicFieldLabel title={'Mobile Number'} />
							<InputGroup>
								<div className='col-sm-10' aria-label='Mobile Number'>
									<input
										disabled
										type={contactMobileType}
										className='form-control form-control-sm'
										aria-label='Mobile Number'
										{...formik.getFieldProps('mobilePhone')}
									/>
								</div>
								{playerInformation?.mobilePhone !== undefined && mobileHasIcon ? (
									<div
										className='btn btn-icon w-auto px-0 btn-active-color-primary mobile-div'
										style={{right: '20px', bottom: '5px'}}
										onClick={onClickContactMobile}
									>
										<FontAwesomeIcon icon={isShowContactTypeMobile ? faEyeSlash : faEye} />
									</div>
								) : null}
							</InputGroup>
						</Col>

						<Col sm={3}>
							<BasicFieldLabel title={'Email Address'} />
							<InputGroup>
								<div className='col-sm-10'>
									<input
										disabled
										type={contactEmail}
										className='form-control form-control-sm'
										aria-label='Mobile Number'
										{...formik.getFieldProps('email')}
									/>
								</div>
								{playerInformation?.email !== undefined && emailHasIcon ? (
									<div
										className='btn btn-icon w-auto px-0 btn-active-color-primary'
										style={{right: '20px', bottom: '5px'}}
										onClick={onClickShowEmail}
									>
										<FontAwesomeIcon icon={isShowEmailText ? faEyeSlash : faEye} />
									</div>
								) : null}
							</InputGroup>
						</Col>
					</Row>
				</div>
			</MainContainer>

			<div style={{margin: 20}}></div>

			<MainContainer>
				<FormHeader headerLabel={'Communication Detail'} />
				<div style={{margin: 40}}>
					<Row aria-label='Communication Detail'>
						<Col sm={3}>
							<BasicFieldLabel title={'Created By'} />
							<DefaultTextInput disabled={true} ariaLabel={'communicationCreatedBy'} {...formik.getFieldProps('communicationCreatedBy')} />
						</Col>
						<Col sm={3}>
							<BasicFieldLabel title={'Created Date'} />
							<DefaultTextInput disabled={true} ariaLabel={'communicationCreatedDate'} {...formik.getFieldProps('communicationCreatedDate')} />
						</Col>
						<Col sm={3}>
							<BasicFieldLabel title={'Communication ID'} />
							<DefaultTextInput disabled={true} ariaLabel={'communicationId'} {...formik.getFieldProps('communicationId')} />
						</Col>
					</Row>

					<Row style={{marginTop: 20, marginBottom: 20}}>
						<Col sm={3}>
							<BasicFieldLabel title={'Purpose'} />
							<Select
								size='small'
								style={{width: '100%'}}
								options={masterReference}
								onChange={onChangeSelectPurpose}
								value={masterReference}
								isDisabled={true}
							/>
						</Col>
						<Col sm={3}>
							<BasicFieldLabel title={'Message Type'} />
							<Select
								size='small'
								style={{width: '100%'}}
								options={messageTypeOptionValue}
								onChange={onChangeMessageType}
								value={selectedMessageType}
								isDisabled={true}
							/>
						</Col>
						<Col sm={3}>
							<BasicFieldLabel title={'Message Status'} />
							<DefaultSelect data={useMessageStatusOption(messageTypeId)} onChange={onChangeMessageStatus} value={selectedMessageStatus} />
						</Col>
						<Col sm={3}>
							<BasicFieldLabel title={'Message Response'} />
							<DefaultSelect data={useMessageResponseOption(messageStatusId)} onChange={onChangeMessageResponse} value={selectedMessageResponse} />
						</Col>
					</Row>

					<Row style={{marginTop: 20, marginBottom: 20}}>
						<Col sm={4}>
							<BasicFieldLabel title={'Start Communication'} />
							<div style={{display: 'flex'}}>
								<BasicDateTimePicker
									format={FnsDateFormatPatterns.mlabDateFormat}
									onChange={onChangeStartCommunicationDate}
									onOpenCalendar={() => setOpenStartCommunication(!openStartCommunication)}
									onInputClick={() => setOpenStartCommunication(!openStartCommunication)}
									onBlur={() => setOpenStartCommunication(!openStartCommunication)}
									value={startCommunicationDate}
									open={openStartCommunication}
								/>
								<div className='col-sm-10'>
									<DefaultPrimaryButton
										isDisable={false}
										access={access?.includes(USER_CLAIMS.EditCommunicationWrite)}
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
									format={FnsDateFormatPatterns.mlabDateFormat}
									onChange={onChangeEndCommunicationDate}
									value={endCommunicationDate}
									open={openEndCommunication}
									onBlur={() => setOpenEndCommunication(!openEndCommunication)}
									onInputClick={() => setOpenEndCommunication(!openEndCommunication)}
									onOpenCalendar={() => setOpenEndCommunication(!openEndCommunication)}
								/>
								<div className='col-sm-10'>
									<DefaultPrimaryButton
										isDisable={false}
										access={access?.includes(USER_CLAIMS.EditCommunicationWrite)}
										title={'Now'}
										onClick={_setEndCommunicationNow}
									/>
								</div>
							</div>
						</Col>

						<Col sm={4}>
							<BasicFieldLabel title={'Reported Date'} />
							<div style={{display: 'flex'}}>
								<BasicDateTimePicker
									isDisable={true}
									format={FnsDateFormatPatterns.mlabDateFormat}
									value={reportedDate}
									open={openReportedDate}
									onBlur={() => setOpenReportedDate(!openReportedDate)}
									onInputClick={() => setOpenReportedDate(!openReportedDate)}
									onOpenCalendar={() => setOpenReportedDate(!openReportedDate)}
									onChange={function (val: any): void {
										throw new Error('Function not implemented.');
									}}
								/>
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
									isReadOnly={false}
									quillValue={convertedContent}
									setQuillValue={(content: string) => {
										handleEditorChange(content);
									}}
									hasImageToEditor={true}
								/>
							</div>
						</Col>
					</Row>
				</div>
			</MainContainer>

			<div style={{margin: 20}}></div>
			<div style={isContactable === false ? {display: 'none'} : undefined}>
				{/* SURVEY AREA */}
				<MainContainer>
					<FormHeader headerLabel={surveyTemplateTitle} />
					<div style={{margin: 40}}>
						{surveyQuestion.length > 0 ? (
							<>
								{surveyQuestion.map((questions) => {
									let answersData = Object.assign(new Array<SurveyQuestionAnswerResponse>(), surveyQuestionAnswer).filter(
										(x) => x.surveyQuestionId === questions.surveyQuestionId
									);
									let OptionList = Array<OptionListModel>();

									answersData.forEach((item: SurveyQuestionAnswerResponse) => {
										const tempOption: OptionListModel = {
											label: item.surveyQuestionAnswerName,
											value: item.surveyQuestionAnswerId.toString(),
										};
										OptionList.push(tempOption);
									});

									const onChangeSelectAnswer = (val: any | string) => {
										let request: answerSelectedOption = {
											surveyQuestionId: questions.surveyQuestionId,
											selectedOption: val,
										};

										let requestToStore: CommunicationSurveyQuestionAnswerResponse = {
											communicationSurveyQuestionId: 0,
											caseCommunicationId: 0,
											surveyTemplateId: surveyTemplateId,
											surveyQuestionId: questions.surveyQuestionId,
											surveyQuestionAnswersId: parseInt(request.selectedOption.value),
											surveyAnswerName: request.selectedOption.label,
										};

										const count = answerOptionSelectedList.findIndex((x: answerSelectedOption) => x.surveyQuestionId === request.surveyQuestionId);

										if (count < 0) {
											let addEditRequest = answerOptionSelectedList.concat(request);
											setAnswerOptionSelectedList(addEditRequest);
										} else {
											let filteredAnswers = answerOptionSelectedList.filter(
												(x: answerSelectedOption) => x.surveyQuestionId !== request.surveyQuestionId
											);
											setAnswerOptionSelectedList([...filteredAnswers, request]);
										}

										_dispatchSurveyData(requestToStore);
									};

									const onChangeSelectMultipleAnswer = (val: any | string) => {
										let surveyQuestionAnswer = Array<CommunicationSurveyQuestionAnswerResponse>();
										let storedData = caseCommunicationSurveyData !== undefined ? caseCommunicationSurveyData : [];
										let optionMulti = Array<answerSelectedOption>();

										val.forEach((element: any) => {
											let requestToStore: CommunicationSurveyQuestionAnswerResponse = {
												communicationSurveyQuestionId: 0,
												caseCommunicationId: 0,
												surveyTemplateId: surveyTemplateId,
												surveyQuestionId: questions.surveyQuestionId,
												surveyQuestionAnswersId: parseInt(element.value),
												surveyAnswerName: element.label,
											};
											surveyQuestionAnswer.push(requestToStore);
										});

										const count = storedData.findIndex(
											(x: CommunicationSurveyQuestionAnswerResponse) => x.surveyQuestionId === questions.surveyQuestionId
										);

										if (count < 0) {
											let addNewData = storedData.concat(surveyQuestionAnswer);
											dispatch(caseCommunication.actions.communicationSurveyQuestionAnswer(addNewData));
										} else {
											let filteredData = storedData.filter(
												(x: CommunicationSurveyQuestionAnswerResponse) => x.surveyQuestionId !== questions.surveyQuestionId
											);
											let UpdatedData = [...filteredData, ...surveyQuestionAnswer];
											dispatch(caseCommunication.actions.communicationSurveyQuestionAnswer(UpdatedData));
										}

										val.forEach((x: OptionListModel) => {
											let requests: answerSelectedOption = {
												surveyQuestionId: questions.surveyQuestionId,
												selectedOption: {label: x.label, value: x.value},
											};
											optionMulti.push(requests);
										});

										const counts = answerOptionSelectedList.findIndex((x: answerSelectedOption) => x.surveyQuestionId === questions.surveyQuestionId);

										if (counts < 0) {
											let addEditRequest = answerOptionSelectedList.concat(optionMulti);
											setAnswerOptionSelectedList(addEditRequest);
										} else {
											let filteredAnswers = answerOptionSelectedList.filter(
												(x: answerSelectedOption) => x.surveyQuestionId !== questions.surveyQuestionId
											);
											setAnswerOptionSelectedList([...filteredAnswers, ...optionMulti]);
										}
									};

									const onChangeTextAnswer = (surveyAnswerName: string, surveyQuestionId: number) => {
										let requestToStore: CommunicationSurveyQuestionAnswerResponse = {
											communicationSurveyQuestionId: 0,
											caseCommunicationId: 0,
											surveyTemplateId: surveyTemplateId,
											surveyQuestionId: surveyQuestionId,
											surveyQuestionAnswersId: 0,
											surveyAnswerName: surveyAnswerName,
										};

										_dispatchSurveyData(requestToStore);
										let requestSurveyData: answerSelectedOption = {
											surveyQuestionId: surveyQuestionId,
											selectedOption: {label: surveyAnswerName, value: '0'},
										};

										const count = answerOptionSelectedList.findIndex((x: answerSelectedOption) => x.surveyQuestionId === surveyQuestionId);

										if (count < 0) {
											let addRequest = answerOptionSelectedList.concat(requestSurveyData);
											setAnswerOptionSelectedList(addRequest);
										} else {
											let filteredAnswers = answerOptionSelectedList.filter((x: answerSelectedOption) => x.surveyQuestionId !== surveyQuestionId);
											setAnswerOptionSelectedList([...filteredAnswers, requestSurveyData]);
										}
									};

									const onChangeRadioAnswer = (surveyAnswerName: string, surveyAnswerId: number, surveyQuestionId: number) => {
										let requestToStore: CommunicationSurveyQuestionAnswerResponse = {
											communicationSurveyQuestionId: 0,
											caseCommunicationId: 0,
											surveyTemplateId: surveyTemplateId,
											surveyQuestionId: surveyQuestionId,
											surveyQuestionAnswersId: surveyAnswerId,
											surveyAnswerName: surveyAnswerName,
										};
										_dispatchSurveyData(requestToStore);
										let requestSurveyData: answerSelectedOption = {
											surveyQuestionId: surveyQuestionId,
											selectedOption: {label: surveyAnswerName, value: surveyAnswerId.toString()},
										};

										const count = answerOptionSelectedList.findIndex((x: answerSelectedOption) => x.surveyQuestionId === surveyQuestionId);

										if (count < 0) {
											let addRequest = answerOptionSelectedList.concat(requestSurveyData);
											setAnswerOptionSelectedList(addRequest);
										} else {
											let filteredAnswers = answerOptionSelectedList.filter((x: answerSelectedOption) => x.surveyQuestionId !== surveyQuestionId);
											setAnswerOptionSelectedList([...filteredAnswers, requestSurveyData]);
										}
									};

									return (
										<>
											{(() => {
												switch (questions.fieldTypeName) {
													case 'Dropdown':
														return (
															<Row style={{marginTop: 20, marginBottom: 20}}>
																<Col sm={6}>
																	<BasicFieldLabel title={questions.surveyQuestionName} />
																	<Select
																		native
																		isSearchable={false}
																		size='small'
																		style={{width: '100%'}}
																		options={OptionList}
																		onChange={onChangeSelectAnswer}
																		value={
																			answerOptionSelectedList !== undefined
																				? answerOptionSelectedList
																						.filter((xAnsSelect: answerSelectedOption) => xAnsSelect.surveyQuestionId === questions.surveyQuestionId)
																						.map((x: answerSelectedOption) => x.selectedOption)
																				: []
																		}
																	/>
																</Col>
															</Row>
														);
													case 'Dropdown With Search':
														return (
															<Row style={{marginTop: 20, marginBottom: 20}}>
																<Col sm={6}>
																	<BasicFieldLabel title={questions.surveyQuestionName} />
																	<Select
																		options={OptionList}
																		size='small'
																		style={{width: '100%'}}
																		onChange={onChangeSelectAnswer}
																		value={
																			answerOptionSelectedList !== undefined
																				? answerOptionSelectedList
																						.filter((xDDS: answerSelectedOption) => xDDS.surveyQuestionId === questions.surveyQuestionId)
																						.map((x: answerSelectedOption) => x.selectedOption)
																				: []
																		}
																	/>
																</Col>
															</Row>
														);
													case 'Dropdown Multi Select':
														return (
															<Row style={{marginTop: 20, marginBottom: 20}} aria-label='Multi-Select'>
																<Col sm={6}>
																	<BasicFieldLabel title={questions.surveyQuestionName} />
																	<Select
																		size='small'
																		isMulti
																		options={OptionList}
																		style={{width: '100%'}}
																		onChange={onChangeSelectMultipleAnswer}
																		value={
																			answerOptionSelectedList !== undefined
																				? answerOptionSelectedList
																						.filter((xDDMS: answerSelectedOption) => xDDMS.surveyQuestionId === questions.surveyQuestionId)
																						.map((x: answerSelectedOption) => x.selectedOption)
																				: []
																		}
																	/>
																</Col>
															</Row>
														);
													case 'Dropdown Multi Select With Search':
														return (
															<Row style={{marginTop: 20, marginBottom: 20}} aria-label='Multi-Select With Search'>
																<Col sm={6}>
																	<BasicFieldLabel title={questions.surveyQuestionName} />
																	<Select
																		size='small'
																		isMulti
																		style={{width: '100%'}}
																		options={OptionList}
																		onChange={onChangeSelectMultipleAnswer}
																		value={
																			answerOptionSelectedList !== undefined
																				? answerOptionSelectedList
																						.filter((xDDMSS: answerSelectedOption) => xDDMSS.surveyQuestionId === questions.surveyQuestionId)
																						.map((x: answerSelectedOption) => x.selectedOption)
																				: []
																		}
																	/>
																</Col>
															</Row>
														);
													case 'Radio Button':
														return (
															<Row style={{marginTop: 20, marginBottom: 20}}>
																<Col sm={6}>
																	<BasicFieldLabel title={questions.surveyQuestionName} />

																	{OptionList.map((r) => {
																		return (
																			<div style={{flexDirection: 'row'}}>
																				<input
																					type='radio'
																					checked={
																						answerOptionSelectedList !== undefined
																							? answerOptionSelectedList
																									.filter((x: answerSelectedOption) => x.surveyQuestionId === questions.surveyQuestionId)
																									.map((x: any) => x.selectedOption.value)
																									.toString() === r.value
																								? true
																								: false
																							: false
																					}
																					onChange={(e) => onChangeRadioAnswer(r.label, parseInt(e.target.defaultValue), questions.surveyQuestionId)}
																					name={r.value}
																					value={r.value}
																					style={{margin: 10}}
																				/>
																				<BasicFieldLabel title={r.label} />
																			</div>
																		);
																	})}
																</Col>
															</Row>
														);
													case 'Text Input':
														return (
															<Row style={{marginTop: 20, marginBottom: 20}}>
																<Col sm={6}>
																	<BasicFieldLabel title={questions.surveyQuestionName} />
																	<input
																		type='text'
																		className='form-control form-control-sm'
																		aria-label={questions.surveyQuestionName}
																		onChange={(e) => onChangeTextAnswer(e.target.value, questions.surveyQuestionId)}
																		value={
																			answerOptionSelectedList !== undefined
																				? answerOptionSelectedList
																						.filter((x: answerSelectedOption) => x.surveyQuestionId === questions.surveyQuestionId)
																						.map((x: any) => x.selectedOption.label)
																						.toString()
																				: ''
																		}
																	/>
																</Col>
															</Row>
														);
													case 'Multiline Text Input':
														return (
															<Row style={{marginTop: 20, marginBottom: 20}}>
																<Col sm={6}>
																	<BasicFieldLabel title={questions.surveyQuestionName} />
																	<textarea
																		className='form-control form-control-sm'
																		value={
																			answerOptionSelectedList !== undefined
																				? answerOptionSelectedList
																						.filter((x: answerSelectedOption) => x.surveyQuestionId === questions.surveyQuestionId)
																						.map((x: any) => x.selectedOption.label)
																						.toString()
																				: ''
																		}
																		onChange={(e) => onChangeTextAnswer(e.target.value, questions.surveyQuestionId)}
																	/>
																</Col>
															</Row>
														);
													default:
														return null;
												}
											})()}
										</>
									);
								})}
							</>
						) : null}
					</div>
				</MainContainer>

				<div style={{margin: 20}}></div>
				{/* FEEDBACK AREA */}
				<MainContainer>
					<FormHeader headerLabel={'Feedback'} />
					<div style={{margin: 40}}>
						<Row>
							<Col sm={11}>
								<ErrorLabel hasErrors={hasFeedbackErrors} errorMessage={errorFeedbackMessage} />
							</Col>
						</Row>

						<Row aria-label='Feedback Section'>
							<Col sm={3}>
								<BasicFieldLabel title={'Feedback Type'} />
								<DefaultSelect data={useFeedbackTypeOption()} value={selectedFeedbackType} onChange={onChangeSelectFeedbackType} />
							</Col>
							<Col sm={3}>
								<BasicFieldLabel title={'Feedback Category'} />
								<DefaultSelect
									data={useFeedbackCategoryOption(feedbackTypeId)}
									value={selectedFeedbackCategory}
									onChange={onChangeSelectFeedbackCategory}
								/>
							</Col>
							<Col sm={6}>
								<BasicFieldLabel title={'Feedback Answer'} />
								<Select
									isSearchable={true}
									options={feedbackAnswerOptionList.flatMap((x) => [
										{label: x.feedbackTypeName + ' - ' + x.feedbackCategoryName + ' - ' + x.feedbackAnswerName, value: x},
									])}
									onChange={onChangeSelectFeedbackAnswer}
									value={selectedFeedbackAnswer}
									isLoading={feedbackAnswerLoading}
									onInputChange={(e: any) => {
										if (e.length >= 3) {
											getFeedbackAnserOptions('', '', e);
										}
									}}
								/>
							</Col>
						</Row>

						<Row style={{marginTop: 20, marginBottom: 20}} aria-label='Feedback Details Section'>
							<Col sm={6}>
								<BasicFieldLabel title={'Feedback Details'} />
								<DefaultTextInput ariaLabel={'feedbackDetails'} {...formik.getFieldProps('feedbackDetails')} />
							</Col>
							<Col sm={6}>
								<BasicFieldLabel title={'Solution Provided'} />
								<div style={{display: 'flex', justifyContent: 'flex-start'}}>
									<DefaultTextInput ariaLabel={'solutionProvided'} {...formik.getFieldProps('solutionProvided')} />
								</div>
							</Col>
						</Row>

						<Row aria-label='Feedback Add Section'>
							<Col sm={3} style={{display: 'flex', justifyContent: 'flex-start'}}>
								<Row style={{marginTop: 10, marginBottom: 20, marginLeft: 5}}>
									<DefaultPrimaryButton
										isDisable={false}
										access={access?.includes(USER_CLAIMS.EditCommunicationWrite)}
										title={'Add'}
										onClick={_dispatchFeedbackType}
									/>
								</Row>
							</Col>
						</Row>

						<div className='ag-theme-quartz' style={{height: 400, width: '100%', marginBottom: 20}}>
							<AgGridReact
								rowBuffer={0}
								enableRangeSelection={true}
								pagination={true}
								rowData={rowData}
								defaultColDef={{
									sortable: true,
									resizable: true,
								}}
								onGridReady={onGridReady}
								paginationPageSize={10}
								columnDefs={columnDefs}
							/>
						</div>
					</div>
				</MainContainer>
			</div>
			<div style={{margin: 20}}></div>

			<MainContainer>
				<div style={{marginLeft: 40, marginTop: 20, marginBottom: 20}}>
					<PaddedContainer>
						<FieldContainer>
							<ButtonsContainer>
								<LoaderButton
									access={access?.includes(USER_CLAIMS.EditCommunicationWrite)}
									loading={formik.isSubmitting}
									title={'Submit'}
									loadingTitle={' Please wait... '}
									disabled={formik.isSubmitting}
								/>
								<DefaultSecondaryButton access={access?.includes(USER_CLAIMS.EditCommunicationRead)} title={'Back'} onClick={_closePage} />
							</ButtonsContainer>
						</FieldContainer>
					</PaddedContainer>
				</div>
			</MainContainer>
		</FormContainer>
	);
};

export default EditCommunication;

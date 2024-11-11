import {AgGridReact} from 'ag-grid-react';

import {Guid} from 'guid-typescript';
import {htmlDecode, htmlEncode} from 'js-htmlencode';
import {useHistory} from 'react-router-dom';
import {ElementStyle} from '../../../constants/Constants';
import useConstant from '../../../constants/useConstant';
import * as auth from '../../../modules/auth/redux/AuthRedux';
import {PLAYER_CONTANTS} from '../../player-management/constants/PlayerContants';
import {PlayerContactRequestModel} from '../../player-management/models/PlayerContactRequestModel';
import * as caseCommunication from '../redux/CaseCommunicationRedux';
import {
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
import {CampaignCaseCommSurvey} from './shared/components';

import {faEye, faEyeSlash, faInfoCircle} from '@fortawesome/free-solid-svg-icons';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {parse} from 'date-fns';
import {useFormik} from 'formik';
import moment from 'moment';
import React, {useEffect, useState} from 'react';
import {Col, InputGroup, Row} from 'react-bootstrap-v5';
import {shallowEqual, useDispatch, useSelector} from 'react-redux';
import swal from 'sweetalert';
import {RootState} from '../../../../setup';
import * as hubConnection from '../../../../setup/hub/MessagingHub';
import {
	BasicDateTimePicker,
	BasicFieldLabel,
	ButtonsContainer,
	DefaultPrimaryButton,
	DefaultSecondaryButton,
	DefaultSelect,
	DefaultTextInput,
	DismissibleToast,
	FieldContainer,
	FormContainer,
	FormHeader,
	MLabQuillEditor,
	MainContainer,
	MlabButton,
	PaddedContainer,
} from '../../../custom-components';
import {
	useFeedbackAnswerOption,
	useFeedbackCategoryOption,
	useFeedbackTypeOption,
	useMessageResponseOption,
	useMessageStatusOption,
	useMessageTypeOptions,
	useSubtopicOptions,
	useTopicOptions,
} from '../../../custom-functions';
import useFnsDateFormatter from '../../../custom-functions/helper/useFnsDateFormatter';
import {PlayerModel} from '../../player-management/models/PlayerModel';
import {GetPlayerProfile, SavePlayerContact} from '../../player-management/redux/PlayerManagementService';
import {usePlayerManagementHooks} from '../../player-management/shared/usePlayerManagementHooks';
import {USER_CLAIMS} from '../../user-management/components/constants/UserClaims';
import {
	AddCommunicationSurveyRequest,
	CaseCampaignByIdRequest,
	CaseInformationRequest,
	CaseInformationResponse,
	CommunicationByIdRequest,
	CommunicationFeedBackResponse,
	CommunicationSurveyQuestionResponse,
	CommunicationSurveyRequest,
	SurveyQuestionAnswerResponse,
	SurveyQuestionResponse,
} from '../models';
import {useCaseCommHooks} from './shared/hooks';
import { ColDef, ColGroupDef } from 'ag-grid-community';

const initialValues = {
	feedbackDetails: '',
	solutionProvided: '',
	caseStatus: '',
	campaignName: '',
};

const ViewCommunication: React.FC = () => {
	// Get Redux Store
	const userAccess = useSelector<RootState>(({auth}) => auth.access, shallowEqual) as string;
	const userAccessId = useSelector<RootState>(({auth}) => auth.userId, shallowEqual) as number;
	const {access} = useSelector<RootState>(({auth}) => auth, shallowEqual) as auth.IAuthState;

	const caseCommunicationFeedbackData = useSelector<RootState>(
		({caseCommunication}) => caseCommunication.communicationFeedbackList,
		shallowEqual
	) as any;

	const dispatch = useDispatch();

	const [playerInformation, setPlayerInformation] = useState<PlayerModel>();

	// Constants
	const history = useHistory();
	const {successResponse, tinyMCEKey, SwalFailedMessage, FnsDateFormatPatterns} = useConstant();
	const [isEnableEdit, setIsEnableEdit] = useState<boolean>(true);

	// Communications States
	const [selectedPurpose, setSelectedPurpose] = useState<any>('');
	const [selectedMessageType, setSelectedMessageType] = useState<any>('');
	const [selectedMessageStatus, setSelectedMessageStatus] = useState<any>('');
	const [selectedMessageResponse, setSelectedMessageResponse] = useState<any>('');
	const [selectedCaseType, setSelectedCaseType] = useState<any>('');
	const [openStartCommunication, setOpenStartCommunication] = useState<boolean>(false);
	const [openEndCommunication, setOpenEndCommunication] = useState<boolean>(false);
	const [convertedContent, setConvertedContent] = useState<string>();
	const [startCommunicationDate, setStartCommunicationDate] = useState<any>();
	const [endCommunicationDate, setEndCommunicationDate] = useState<any>();
	const [reportedDate, setReportedDate] = useState<any>();
	const [inititalContent, setInititalContent] = useState<string>('');
	const [startCommunicationDatePost, setStartCommunicationDatePost] = useState<string>('');
	const [endCommunicationDatePost, setEndCommunicationDatePost] = useState<any>('');
	const [isContactable, setIsContactable] = useState<boolean>(true);
	const [messageStatusId, setMessageStatusId] = useState<number>(0);
	const [messageTypeId, setMessageTypeId] = useState<number>(0);

	// Feedback States
	const [selectedFeedbackType, setSelectedFeedbackType] = useState<string | any>('');
	const [selectedFeedbackCategory, setSelectedFeedbackCategory] = useState<string | any>('');
	const [selectedFeedbackAnswer, setSelectedFeedbackAnswer] = useState<string | any>('');
	const [feedbackTypeId, setFeedbackTypeId] = useState<number>(0);
	const [feedbackCategoryId, setFeedbackCategoryId] = useState<number>(0);
	const [rowData, setRowData] = useState<Array<CommunicationFeedBackResponse>>([]);

	// Survey States
	const [surveyQuestion, setSurveyQuestion] = useState<SurveyQuestionResponse[]>([]);
	const [surveyQuestionAnswer, setSurveyQuestionAnswer] = useState<SurveyQuestionAnswerResponse[]>([]);
	const [surveyTemplateTitle, setSurveyTemplateTitle] = useState<string>('');
	const [viewCaseSurveyRequest, setViewCaseSurveyRequest] = useState<AddCommunicationSurveyRequest[]>([]);

	// Player Informations States
	const [isShowContactTypeMobile, setShowContactTypeMobile] = useState<boolean>(false);
	const [isShowEmailText, setIsShowEmailText] = useState<boolean>(false);
	const [contactMobileType, setContactMobileType] = useState<string>('password');
	const [contactEmail, setContactEmail] = useState<string>('password');
	const [playerDetailsShow, setPlayerDetailsShow] = useState<boolean>(false);
	const [brand, setBrand] = useState<string | undefined>('');
	const [currency, setCurrency] = useState<string | undefined>('');
	const [internalAccount, setInternalAccount] = useState<string | undefined>('');
	const [marketingChannel, setMarketingChannel] = useState<string | undefined>('');
	const [marketingSource, setMarketingSource] = useState<string | undefined>('');
	const [deposited, setDeposited] = useState<string | undefined>('');
	const [surveyTemplateId, setSurveyTemplateId] = useState<number>(0);
	const [userName, setUserName] = useState<string | undefined>('');
	const [playerName, setPlayerName] = useState<string | undefined>('');
	const [vipLevel, setVipLevel] = useState<string | undefined>('');
	const [payment, setPayment] = useState<string | undefined>('');

	// Case Informations States
	const [selectedTopic, setSelectedTopic] = useState<string | any>('');
	const [selectedSubtopic, setSelectedSubtopic] = useState<string | any>('');
	const [topicId, setTopicId] = useState<number>(0);
	const [caseDetailsShow, setCaseDetailsShow] = useState<boolean>(false);
	const [caseTypeName, setCaseTypeName] = useState<string>('');
	const [caseStatusname, setCaseStatusname] = useState<string>('');
	const [caseCreatorName, setCaseCreatorName] = useState<string | undefined>('');
	const [caseCreatedDate, setCaseCreatedDate] = useState<string | undefined>('');
	const [caselastModifiedDate, setCaselastModifiedDate] = useState<string | undefined>('');
	const [caselastModifiedAgent, setCaselastModifiedAgent] = useState<string>('');
	const [campaignName, setCampaignName] = useState<string>('');
	const [caseInformation, setCaseInformation] = useState<CaseInformationResponse>();

	//SO view Contact Details
	const [emailHasIcon, setEmailHasIcon] = useState<boolean>(false);
	const [mobileHasIcon, setMobileHasIcon] = useState<boolean>(false);
	const {validateContactDetailsAccess} = usePlayerManagementHooks();
	const [blindAccount, setBlindAccount] = useState<any>(null);

	// Grid
	const [playerId, setPlayerId] = useState<string>('0');
	const {mlabFormatDate} = useFnsDateFormatter();
	const {UploadCaseCommContentImageToMlabStorage} = useCaseCommHooks();

	// Mounted Function upon loading of page
	useEffect(() => {
		if (_getCommunicationId() !== 0) {
			setRowData(caseCommunicationFeedbackData);
			getCommunicationById();
			getCommunicationFeedbacks();
			_getViewSurveyData();
		} else {
			swal('Failed', 'Problem getting communication information', 'error');
		}
	}, []);

	const onViewGridReady = (params: any) => {
		params.api.paginationGoToPage(4);
		setRowData(caseCommunicationFeedbackData);
		params.api.sizeColumnsToFit();
	};

	// Watchers check and make action for state changes
	useEffect(() => {
		setRowData(caseCommunicationFeedbackData);
	}, [caseCommunicationFeedbackData]);

	// Api Call Methods
	async function saveContactClick(contactTypeId: number) {
		if (playerId != '0' || playerId != undefined || playerId != '') {
			const requestPlayer: PlayerContactRequestModel = {
				mlabPlayerId: playerInformation?.mlabPlayerId ?? 0,
				userId: userAccessId,
				contactTypeId: contactTypeId,
				pageName: 'VIEW_COMMUNICATION',
			};

			await SavePlayerContact(requestPlayer)
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
						swal(SwalFailedMessage.title, 'Problem in saving profile contact click', SwalFailedMessage.icon);
					}
				})
				.catch((ex) => {
					console.log('[ERROR] Player Profile: ' + ex);
					swal(SwalFailedMessage.title, 'Problem in saving profile contact click', SwalFailedMessage.icon);
				});
		}
	}

	const getCaseInformation = (id: number) => {
		setTimeout(() => {
			const messagingHub = hubConnection.createHubConnenction();
			messagingHub
				.start()
				.then(() => {
					const requestView: CaseInformationRequest = {
						queueId: Guid.create().toString(),
						userId: userAccessId.toString(),
						caseInformationId: id,
					};
					SendGetCaseInformationbyId(requestView).then((response) => {
						if (response.status === successResponse) {
							messagingHub.on(requestView.queueId.toString(), (message) => {
								GetCaseInformationbyId(message.cacheId)
									.then((data) => {
										setCaseInformation(data.data);

										// Call player information base on case player Id
										getViewPlayerProfile(data.data.playerId, data.data.brandName);
										_getViewCaseCampaignInformation(data.data.playerId, data.data.campaignId, data.data.brandName);
										setPlayerId(data.data.playerId);

										// Setting of fields for Case inforamtions
										formik.setFieldValue('caseId', data.data.caseInformatIonId);
										formik.setFieldValue('caseCreator', data.data.caseCreatorName);
										formik.setFieldValue('caseStatus', data.data.caseStatusName);
										formik.setFieldValue('updatedBy', data.data.updatedByName);
										formik.setFieldValue('updatedDate', data.data.updatedDate);
										formik.setFieldValue('createdDate', data.data.createdDate);

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
											value: data.data.toString(),
										});

										setTopicId(caseInformation !== undefined ? caseInformation?.topicId : 0);
										setSelectedPurpose({label: 'Add Communication', value: '5'});

										setCaseTypeName(data.data.caseTypeName);
										setCaseStatusname(data.data.caseStatusName);
										setCaseCreatorName(data.data.createdByName);
										setCaseCreatedDate(moment(data.data.createdDate).format(FnsDateFormatPatterns.mlabDateFormat));
										setCaselastModifiedDate(moment(data.data.updatedDate).format(FnsDateFormatPatterns.mlabDateFormat));
										setCaselastModifiedAgent(data.data.updatedByName);
										setCampaignName(data.data.campaignName);
									})
									.catch(() => {
										console.log('error from callback function');
									});
							});
						} else {
							swal(SwalFailedMessage.title, 'Problem getting case information', SwalFailedMessage.icon);
						}
					});
				})
				.catch((err) => console.log('Error while starting connection: ' + err));
		}, 1000);
	};

	async function getViewPlayerProfile(id: string, brandName: string) {
		await GetPlayerProfile({playerId: id, brandName: brandName})
			.then((response) => {
				console.log(response);
				if (response.status === successResponse) {
					let profile: PlayerModel = response.data?.data;
					setPlayerInformation(profile);

					let userNameCurrency = profile.username + '' + '(' + profile.currency + ')';

					formik.setFieldValue('username', userNameCurrency);
					formik.setFieldValue('brand', profile.brand);
					formik.setFieldValue('currency', profile.currency);
					formik.setFieldValue('vipLevel', profile.vipLevel);
					formik.setFieldValue('email', profile.email);
					formik.setFieldValue('paymentGroup', profile.paymentGroup);
					formik.setFieldValue('deposited', profile.deposited === true ? 'Yes' : 'No');
					formik.setFieldValue('marketingChannel', profile.marketingChannel);
					formik.setFieldValue('marketingSource', profile.marketingSource);
					formik.setFieldValue('mobilePhone', profile.mobilePhone);

					setUserName(profile.username);
					setBrand(profile.brand);
					setCurrency(profile.currency);
					setPlayerName(profile.firstName + ' ' + profile.lastName);
					setVipLevel(profile.vipLevel);
					setPayment(profile.paymentGroup);
					setInternalAccount(profile.internalAccount === true ? 'Yes' : 'No');
					setMarketingChannel(profile.marketingChannel);
					setMarketingSource(profile.marketingSource);
					setDeposited(profile.deposited === true ? 'Yes' : 'No');
					setBlindAccount(!!profile.blindAccount);
				} else {
					setPlayerInformation(undefined);
				}
			})
			.catch((ex) => {
				console.log('[ERROR] Player Profile: ' + ex);
				console.log('Problem in getting profile');
				history.push('/error/401');
			});
	}

	const checkMobileIcon = (_isBlindAccount: boolean) => {
		const hasViewIcon = validateContactDetailsAccess(access, _isBlindAccount);
		setMobileHasIcon(hasViewIcon);
	};

	const checkEmailIcon = (_isBlindAccount: boolean) => {
		const hasViewEyeIcon = validateContactDetailsAccess(access, _isBlindAccount);
		setEmailHasIcon(hasViewEyeIcon);
	};

	useEffect(() => {
		if (blindAccount !== null) {
			checkEmailIcon(blindAccount);
			checkMobileIcon(blindAccount);
		}
	}, [blindAccount]);

	const getCommunicationById = async () => {
		setTimeout(() => {
			const messagingHub = hubConnection.createHubConnenction();
			messagingHub
				.start()
				.then(() => {
					const requestById: CommunicationByIdRequest = {
						queueId: Guid.create().toString(),
						userId: userAccessId.toString(),
						caseCommunicationId: _getCommunicationId(),
					};
					_loadGetCommunicationByIdAccess(requestById, messagingHub);
				})
				.catch((err) => console.log('Error while starting connection: ' + err));
		}, 1000);
	};

	const _loadGetCommunicationByIdAccess = async (requestById: any, messagingHub: any) => {
		const hasAccess = await _sendGetCommunicationByIdRequest(requestById, messagingHub);

		if (!hasAccess) {
			history.push('/error/401');
		}
	};

	const _sendGetCommunicationByIdRequest = async (requestById: any, messagingHub: any) => {
		try {
			const response = await SendGetCommunicationById(requestById);
			if (response.status === successResponse) {
				const message = await new Promise((resolve) => {
					messagingHub.on(requestById.queueId.toString(), (message: any) => {
						resolve(message);
					});
				});

				const hasData = await getCommDetails(message);
				return hasData;
			} else {
				console.log('Failed', 'Problem getting communication information', 'error');
				return false;
			}
		} catch (error) {
			console.log('Error', error);
			return false;
		}
	};

	const getCommDetails = async (message: any) => {
		try {
			const data = await GetCommunicationById(message.cacheId);
			if (data?.data) {
				formik.setFieldValue('communicationCreatedBy', data.data.createdByName);
				formik.setFieldValue(
					'communicationCreatedDate',
					mlabFormatDate(parse(data.data.createdDate ?? '', FnsDateFormatPatterns.mlabDateFormat, new Date()))
				);
				formik.setFieldValue('communicationId', data.data.caseCommunicationId);
				getCaseInformation(data.data.caseInformationId);
				setSelectedMessageResponse({
					label: data.data.messageResponseName,
					value: data.data.messageresponseId.toString(),
				});

				setSelectedMessageStatus({
					label: data.data.messageStatusName,
					value: data.data.messagestatusId.toString(),
				});

				setSelectedMessageType({
					label: data.data.messageTypeName,
					value: data.data.messagetypeId.toString(),
				});

				let isContact = false;
				isContact = data.data.messageStatusName.toLocaleLowerCase() === 'contactable' ? true : isContact;
				setIsContactable(isContact);

				let isEditEnable = true;
				isEditEnable = data.data.messagetypeId == 5 || data.data.messagetypeId == 6 ? false : isEditEnable;
				setIsEnableEdit(isEditEnable);

				// format the date string with the new defaultFormat then parse
				let communicationStartDate = moment(data.data.startCommunicationDate).toDate();
				let communicationEndDate = moment(data.data.endCommunicationDate).toDate();
				let communicationReportedDate = moment(data.data.reportedDate).toDate();

				setStartCommunicationDate(communicationStartDate);
				setEndCommunicationDate(communicationEndDate);
				setReportedDate(communicationReportedDate);
				setInititalContent(htmlDecode(data.data.communicationContent));
				return true;
			} else {
				return false;
			}
		} catch (error) {
			console.log('error from callback function', error);
			return false;
		}
	};

	const getCommunicationFeedbacks = () => {
		setTimeout(() => {
			const messagingHub = hubConnection.createHubConnenction();
			messagingHub
				.start()
				.then(() => {
					const request: CommunicationByIdRequest = {
						queueId: Guid.create().toString(),
						userId: userAccessId.toString(),
						caseCommunicationId: _getCommunicationId(),
					};

					SendGetCommunicationFeedbackList(request).then((response) => {
						if (response.status === successResponse) {
							messagingHub.on(request.queueId.toString(), (message) => {
								GetCommunicationFeedbackList(message.cacheId)
									.then((data) => {
										dispatch(caseCommunication.actions.communicationFeedbackList(data.data));
									})
									.catch((err) => {
										console.log('error from callback function' + err);
									});
							});
						} else {
							swal('Failed', 'Problem getting communications feedback', 'error');
						}
					});
				})
				.catch((err) => console.log('Error while starting connection: ' + err));
		}, 1000);
	};

	const _getViewSurveyData = () => {
		setTimeout(() => {
			const messagingHub = hubConnection.createHubConnenction();
			messagingHub
				.start()
				.then(() => {
					const request: CommunicationSurveyRequest = {
						queueId: Guid.create().toString(),
						userId: userAccessId.toString(),
						caseCommunicationId: _getCommunicationId(),
					};

					SendGetCommucationSurvey(request).then((response) => {
						if (response.status === successResponse) {
							messagingHub.on(request.queueId.toString(), (message) => {
								GetCommucationSurvey(message.cacheId)
									.then((response) => {
										let surveyQuestionAnsersData = Object.assign(new Array<CommunicationSurveyQuestionResponse>(), response.data);
										let viewCaseSurveSelectedAnswerObj: AddCommunicationSurveyRequest[] = [];

										surveyQuestionAnsersData.forEach((responseAnswerObj) => {
											let AnswerItemOnj: AddCommunicationSurveyRequest = {
												caseCommunicationId: responseAnswerObj.caseCommunicationId,
												communicationSurveyQuestionId: responseAnswerObj.communicationSurveyQuestionId,
												surveyAnswer: responseAnswerObj.surveyAnswerName,
												surveyQuestionAnswersId: responseAnswerObj.surveyQuestionAnswersId,
												surveyQuestionId: responseAnswerObj.surveyQuestionId,
												surveyTemplateId: surveyTemplateId,
												createdBy: userAccessId,
												updatedBy: userAccessId,
											};
											viewCaseSurveSelectedAnswerObj.push(AnswerItemOnj);
										});
										setViewCaseSurveyRequest(viewCaseSurveSelectedAnswerObj);
									})
									.catch((err) => {
										console.log('error from callback function' + err);
									});
							});
						} else {
							swal('Failed', 'Problem getting communication survey', 'error');
						}
					});
				})
				.catch((err) => console.log('Error while starting connection: ' + err));
		}, 1000);
	};

	const _getViewCaseCampaignInformation = (playerId: string, campaignId: number, brandName: string) => {
		setTimeout(() => {
			const messagingHub = hubConnection.createHubConnenction();
			messagingHub
				.start()
				.then(() => {
					const request: CaseCampaignByIdRequest = {
						queueId: Guid.create().toString(),
						userId: userAccessId.toString(),
						playerId: playerId,
						campaignId: campaignId,
						brandName: brandName,
					};

					SendGetCaseCampaignById(request).then((response) => {
						if (response.status === successResponse) {
							messagingHub.on(request.queueId.toString(), (message) => {
								// CONSUME CALLBACK API
								GetCaseCampaignById(message.cacheId)
									.then((data) => {
										formik.setFieldValue('campaignName', data.data.campaignName);
										setSurveyTemplateId(data.data.surveyTemplateId);

										if (data.data.surveyTemplateId != 0) {
											_getViewSurveyTemplate(data.data.campaignId);
										}
									})
									.catch((err) => {
										console.log('error from callback function GetCaseCampaignById' + err);
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

	// Events menthods
	const onClickViewContactMobile = () => {
		setShowContactTypeMobile(!isShowContactTypeMobile);
		setContactMobileType('password');

		if (!isShowContactTypeMobile) {
			setContactMobileType('text');
			saveContactClick(PLAYER_CONTANTS.ContactType_Mobile_Id);
		}
	};

	const onClickViewShowEmail = () => {
		setIsShowEmailText(!isShowEmailText);
		setContactEmail('password');

		if (!isShowEmailText) {
			setContactEmail('text');
			saveContactClick(PLAYER_CONTANTS.ContactType_Email_Id);
		}
	};

	const onClickViewCaseDetails = () => {
		setCaseDetailsShow(true);
	};

	const onClickViewPlayerDetails = () => {
		setPlayerDetailsShow(true);
	};

	const onChangeViewSelectFeedbackType = (val: any) => {
		setSelectedFeedbackType(val);
		setSelectedFeedbackCategory('');
		setFeedbackTypeId(val.value);
	};

	const onChangeViewSelectFeedbackCategory = (val: any) => {
		setSelectedFeedbackCategory(val);
		setSelectedFeedbackAnswer('');
		setFeedbackCategoryId(val.value);
	};

	const onChangeViewSelectFeedbackAnswer = (val: any) => {
		setSelectedFeedbackAnswer(val);
	};

	const onChangeViewSelectPurpose = (val: string) => {
		setSelectedPurpose(val);
	};

	const onChangeViewStartCommunicationDate = (val: any) => {
		setOpenStartCommunication(!openStartCommunication);
		setStartCommunicationDate(val);

		let formatedStartCommunicationDate = moment(val).format(FnsDateFormatPatterns.mlabDateFormat);
		setStartCommunicationDatePost(formatedStartCommunicationDate.toString());
	};

	const onChangeViewEndCommunicationDate = (val: any) => {
		setEndCommunicationDate(val);
		setOpenEndCommunication(!openEndCommunication);

		let formatedEndCommunicationDate = moment(val).format(FnsDateFormatPatterns.mlabDateFormat);
		setEndCommunicationDatePost(formatedEndCommunicationDate.toString());
	};

	const onChangeViewSelectedTopic = (val: any) => {
		setSelectedTopic(val);
		setSelectedSubtopic('');
		setTopicId(val.value);
	};

	const onChangeViewSelectedSubTopic = (val: string) => {
		setSelectedSubtopic(val);
	};

	const onChangeViewMessageType = (val: any) => {
		setSelectedMessageType(val);
		setSelectedMessageStatus('');
		setSelectedMessageResponse('');
		setMessageTypeId(val.value);
	};

	const onChangeViewMessageStatus = (val: any) => {
		setSelectedMessageStatus(val);
		setSelectedMessageResponse('');
		setMessageStatusId(val.value);
	};

	const onChangeViewMessageResponse = (val: string) => {
		setSelectedMessageResponse(val);
	};

	// Methods
	const _closeViewPage = () => {
		_clearViewStorage();
		window.close();
	};

	const _getViewSurveyTemplate = (campaignId: number) => {
		GetCommunicationSurveyQuestionAnswers(campaignId)
			.then((response) => {
				if (response.status === successResponse) {
					let surveyQuestionData = Object.assign(new Array<SurveyQuestionResponse>(), response.data.surveyQuestions);
					let surveyQuestionAnsersAData = Object.assign(new Array<SurveyQuestionAnswerResponse>(), response.data.surveyQuestionAnswers);

					setSurveyQuestion(surveyQuestionData);
					setSurveyQuestionAnswer(surveyQuestionAnsersAData);
					setSurveyTemplateTitle(response.data.surveyTemplate.surveyTemplateName);
				}
			})
			.catch((err) => {
				console.log('Problem in Survey Questions and Answers' + err);
			});
	};

	const _dispatchViewFeedbackType = () => {
		let storedData = caseCommunicationFeedbackData ? caseCommunicationFeedbackData : [];
		const request: CommunicationFeedBackResponse = {
			communicationFeedbackId: 1,
			caseCommunicationId: 1,
			communicationFeedbackNo: 1,
			feedbackTypeId: selectedFeedbackType.value,
			feedbackTypeName: selectedFeedbackType.label,
			feedbackCategoryId: selectedFeedbackCategory.value,
			feedbackCategoryName: selectedFeedbackCategory.label,
			feedbackAnswerId: selectedFeedbackAnswer.value,
			feedbackAnswerName: selectedFeedbackAnswer.label,
			communicationFeedbackDetails: formik.values.feedbackDetails,
			communicationSolutionProvided: formik.values.solutionProvided,
		};

		const newDataToStore = storedData.concat(request);

		dispatch(caseCommunication.actions.communicationFeedbackList(newDataToStore));
		setRowData(caseCommunicationFeedbackData);
		_resetViewFeedbackForm();
	};

	const _resetViewFeedbackForm = () => {
		setSelectedFeedbackType('');
		setSelectedFeedbackCategory('');
		setSelectedFeedbackAnswer('');
		formik.setFieldValue('feedbackDetails', '');
		formik.setFieldValue('solutionProvided', '');
	};

	const _getCommunicationId = () => {
		let pageId: number = 0;

		const pathArray = window.location.pathname.split('/');
		if (pathArray.length >= 4) {
			pageId = parseInt(pathArray[3]);
		} else {
			pageId = 0;
		}

		return pageId;
	};

	const handleViewEditorChange = (e: any) => {
		let convertedToHtmlEncoded = htmlEncode(e);
		setConvertedContent(convertedToHtmlEncoded);
	};

	const _clearViewStorage = () => {
		dispatch(caseCommunication.actions.communicationSurveyQuestionAnswer([]));
		dispatch(caseCommunication.actions.communicationFeedbackList([]));
	};

	const _editCommunication = () => {
		history.push(`/campaign-workspace/edit-communication/${_getCommunicationId()}`);
	};

	// ELEMENTS
	function renderViewCaseDetails(): JSX.Element {
		return (
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
						<BasicFieldLabel title={'Case Creator'} /> : <BasicFieldLabel title={caseCreatorName ? caseCreatorName.toString() : ''} />
					</Col>
				</Row>
				<Row>
					<Col sm={12}>
						<BasicFieldLabel title={'Created Date'} /> : <BasicFieldLabel title={caseCreatedDate ? caseCreatedDate?.toString() : ''} />
					</Col>
				</Row>
				<Row>
					<Col sm={12}>
						<BasicFieldLabel title={'Last Modified Date'} /> :{' '}
						<BasicFieldLabel title={caselastModifiedDate ? caselastModifiedDate?.toString() : ''} />
					</Col>
				</Row>
				<Row>
					<Col sm={12}>
						<BasicFieldLabel title={'Last Modified By'} /> :{' '}
						<BasicFieldLabel title={caselastModifiedAgent ? caselastModifiedAgent?.toString() : ''} />
					</Col>
				</Row>
				<Row>
					<Col sm={12}>
						<BasicFieldLabel title={'Campaign Name'} /> : <BasicFieldLabel title={campaignName} />
					</Col>
				</Row>
			</>
		);
	}

	function renderPlayerDetails(): JSX.Element {
		return (
			<>
				<Row>
					<Col sm={12}>
						<BasicFieldLabel title={'Brand'} /> : <BasicFieldLabel title={brand ? brand.toString() : ''} />
					</Col>
				</Row>
				<Row>
					<Col sm={12}>
						<BasicFieldLabel title={'Currency'} /> : <BasicFieldLabel title={currency ? currency.toString() : ''} />
					</Col>
				</Row>
				<Row>
					<Col sm={12}>
						<BasicFieldLabel title={'Username'} /> : <BasicFieldLabel title={userName ? userName.toString() : ''} />
					</Col>
				</Row>
				<Row>
					<Col sm={12}>
						<BasicFieldLabel title={'Player Name'} /> : <BasicFieldLabel title={playerName ? playerName : ''} />
					</Col>
				</Row>
				<Row>
					<Col sm={12}>
						<BasicFieldLabel title={'VIP Level'} /> : <BasicFieldLabel title={vipLevel ? vipLevel?.toString() : ''} />
					</Col>
				</Row>
				<Row>
					<Col sm={12}>
						<BasicFieldLabel title={'Payment Group'} /> : <BasicFieldLabel title={payment ? payment?.toString() : ''} />
					</Col>
				</Row>
				<Row>
					<Col sm={12}>
						<BasicFieldLabel title={'Internal Account'} /> : <BasicFieldLabel title={internalAccount ? internalAccount?.toString() : ''} />
					</Col>
				</Row>
				<Row>
					<Col sm={12}>
						<BasicFieldLabel title={'Markering Channel'} /> : <BasicFieldLabel title={marketingChannel ? marketingChannel?.toString() : ''} />
					</Col>
				</Row>
				<Row>
					<Col sm={12}>
						<BasicFieldLabel title={'Marketing Source'} /> : <BasicFieldLabel title={marketingSource ? marketingSource?.toString() : ''} />
					</Col>
				</Row>
				<Row>
					<Col sm={12}>
						<BasicFieldLabel title={'Deposited'} /> : <BasicFieldLabel title={deposited ? deposited.toString() : ''} />
					</Col>
				</Row>
			</>
		);
	}

	// AG grid Table and Header
	const columnDefs : (ColDef<CommunicationFeedBackResponse> | ColGroupDef<CommunicationFeedBackResponse>)[] =[
		{
			headerName: 'No',
			field: 'communicationFeedbackNo',
			sort: 'asc' as 'asc',
		},
		{headerName: 'Feedback Type', field: 'feedbackTypeName'},
		{headerName: 'Feedback Category', field: 'feedbackCategoryName'},
		{headerName: 'Feedback Answer', field: 'feedbackAnswerName'},
		{headerName: 'Feedback Details', field: 'communicationFeedbackDetails'},
		{headerName: 'Solution Provided', field: 'communicationSolutionProvided'},
	];

	const formik = useFormik({
		initialValues,
		onSubmit: (values, {setStatus, setSubmitting, resetForm}) => {},
	});

	return (
		<FormContainer onSubmit={formik.handleSubmit}>
			<MainContainer>
				<FormHeader headerLabel={'Case and Player Information'} />
				<div style={{margin: 40}}>
					<Row>
						<Col sm={3}>
							<BasicFieldLabel title={'Case ID'} />
							<InputGroup>
								<div className='col-sm-10'>
									<input type={'text'} className='form-control form-control-sm' disabled aria-label='Case ID' {...formik.getFieldProps('caseId')} />
								</div>

								<div
									className='btn btn-icon w-auto px-0 btn-active-color-primary'
									style={{right: '20px', bottom: '5px'}}
									onClick={onClickViewCaseDetails}
								>
									<FontAwesomeIcon icon={faInfoCircle} />
								</div>
							</InputGroup>
							<DismissibleToast
								onClose={() => setCaseDetailsShow(false)}
								show={caseDetailsShow}
								toastBody={renderViewCaseDetails()}
								toastHeader={'Case Details'}
							/>
						</Col>
						<Col sm={3}>
							<BasicFieldLabel title={'Username (Currency)'} />

							<InputGroup>
								<div className='col-sm-10'>
									<input
										type={'text'}
										className='form-control form-control-sm'
										disabled
										aria-label='username'
										{...formik.getFieldProps('username')}
									/>
								</div>

								<div
									className='btn btn-icon w-auto px-0 btn-active-color-primary'
									style={{right: '20px', bottom: '5px'}}
									onClick={onClickViewPlayerDetails}
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
							<DefaultSelect data={useTopicOptions()} onChange={onChangeViewSelectedTopic} value={selectedTopic} isDisabled={true} />
						</Col>
						<Col sm={3}>
							<BasicFieldLabel title={'Subtopic'} />
							<DefaultSelect data={useSubtopicOptions(topicId)} onChange={onChangeViewSelectedSubTopic} value={selectedSubtopic} isDisabled={true} />
						</Col>
					</Row>

					<Row style={{marginTop: 20, marginBottom: 20}}>
						<Col sm={3}>
							<BasicFieldLabel title={'Mobile Number'} />
							<div className='col-sm-12'>
								<InputGroup>
									<input
										type={contactMobileType}
										className='form-control form-control-sm'
										disabled
										aria-label='Mobile Number'
										{...formik.getFieldProps('mobilePhone')}
									/>
									{playerInformation?.mobilePhone !== undefined && mobileHasIcon ? (
										<FontAwesomeIcon
											icon={isShowContactTypeMobile ? faEyeSlash : faEye}
											className='btn btn-icon btn-active-color-primary'
											style={{position: 'absolute', top: 5, right: 70, fontSize: 0.5}}
											onClick={onClickViewContactMobile}
										/>
									) : null}
									<MlabButton
										access={true}
										size={'sm'}
										label={'Call'}
										style={ElementStyle.primary}
										type={'button'}
										weight={'solid'}
										onClick={() => {}}
										loading={false}
										loadingTitle={' Calling ...'}
										disabled={true}
									/>
								</InputGroup>
							</div>
						</Col>

						<Col sm={3}>
							<BasicFieldLabel title={'Email Address'} />
							<InputGroup>
								<div className='col-sm-10'>
									<input
										type={contactEmail}
										className='form-control form-control-sm'
										disabled
										aria-label='Mobile Number'
										{...formik.getFieldProps('email')}
									/>
								</div>
								{playerInformation?.email !== undefined && emailHasIcon ? (
									<FontAwesomeIcon
										icon={isShowEmailText ? faEyeSlash : faEye}
										className='btn btn-icon btn-active-color-primary'
										style={{position: 'absolute', top: 5, right: 70, fontSize: 0.5}}
										onClick={onClickViewShowEmail}
									/>
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
					<Row>
						<Col sm={3}>
							<BasicFieldLabel title={'Created By'} />
							<DefaultTextInput ariaLabel={'communicationCreatedBy'} disabled={true} {...formik.getFieldProps('communicationCreatedBy')} />
						</Col>
						<Col sm={3}>
							<BasicFieldLabel title={'Created Date'} />
							<DefaultTextInput ariaLabel={'communicationCreatedDate'} disabled={true} {...formik.getFieldProps('communicationCreatedDate')} />
						</Col>
						<Col sm={3}>
							<BasicFieldLabel title={'Communication ID'} />
							<DefaultTextInput ariaLabel={'communicationId'} disabled={true} {...formik.getFieldProps('communicationId')} />
						</Col>
					</Row>

					<Row style={{marginTop: 20, marginBottom: 20}}>
						<Col sm={3}>
							<BasicFieldLabel title={'Purpose'} />
							<DefaultSelect
								data={[{value: '5', label: 'Add Communication'}]}
								onChange={onChangeViewSelectPurpose}
								value={selectedPurpose}
								isDisabled={true}
							/>
						</Col>
						<Col sm={3}>
							<BasicFieldLabel title={'Message Type'} />
							<DefaultSelect data={useMessageTypeOptions()} onChange={onChangeViewMessageType} value={selectedMessageType} isDisabled={true} />
						</Col>
						<Col sm={3}>
							<BasicFieldLabel title={'Message Status'} />
							<DefaultSelect
								data={useMessageStatusOption(messageTypeId)}
								onChange={onChangeViewMessageStatus}
								value={selectedMessageStatus}
								isDisabled={true}
							/>
						</Col>
						<Col sm={3}>
							<BasicFieldLabel title={'Message Response'} />
							<DefaultSelect
								data={useMessageResponseOption(messageStatusId)}
								onChange={onChangeViewMessageResponse}
								value={selectedMessageResponse}
								isDisabled={true}
							/>
						</Col>
					</Row>

					<Row style={{marginTop: 20, marginBottom: 20}}>
						<Col sm={4}>
							<BasicFieldLabel title={'Start Communication'} />
							<div style={{display: 'flex'}}>
								<BasicDateTimePicker
									format={FnsDateFormatPatterns.mlabDateFormat}
									onChange={onChangeViewStartCommunicationDate}
									onOpenCalendar={() => setOpenStartCommunication(false)}
									onBlur={() => setOpenStartCommunication(false)}
									value={startCommunicationDate}
									open={false}
									isDisable={true}
								/>
							</div>
						</Col>
						<Col sm={4}>
							<BasicFieldLabel title={'End Communication'} />
							<div style={{display: 'flex'}}>
								<BasicDateTimePicker
									format={FnsDateFormatPatterns.mlabDateFormat}
									onChange={onChangeViewEndCommunicationDate}
									value={endCommunicationDate}
									open={false}
									onBlur={() => setOpenEndCommunication(false)}
									onOpenCalendar={() => setOpenEndCommunication(false)}
									isDisable={true}
								/>
							</div>
						</Col>

						<Col sm={4}>
							<BasicFieldLabel title={'Reported Date'} />
							<div style={{display: 'flex'}}>
								<BasicDateTimePicker
									format={FnsDateFormatPatterns.mlabDateFormat}
									value={reportedDate}
									open={false}
									isDisable={true}
									onChange={() => {}}
									onOpenCalendar={() => {}}
									onBlur={() => {}}
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
									isReadOnly={true}
									quillValue={inititalContent}
									setQuillValue={(content: string) => {
										handleViewEditorChange(content);
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
				<CampaignCaseCommSurvey
					campaignSurveyQuestion={surveyQuestion}
					campaignSurveyQuestionAnswer={surveyQuestionAnswer}
					campaignSurveyTemplateTitle={surveyTemplateTitle}
					campaignSurveyRequest={viewCaseSurveyRequest}
					setCampaignSurveyRequest={setViewCaseSurveyRequest}
					campaignSurveyTemplateId={surveyTemplateId}
					campaignSurveyUserIdCreated={userAccessId.toString()}
					isCampaignCaseCommSurveyReadOnly={true}
					campaignSurveyCommunicationId={_getCommunicationId()}
					campaignSurveyPreSelectOnlyOneAnswer={false}
				/>

				<div style={{margin: 20}}></div>

				<MainContainer>
					<FormHeader headerLabel={'Feedback'} />
					<div style={{margin: 40}}>
						<Row>
							<Col sm={3}>
								<BasicFieldLabel title={'Feedback Type'} />
								<DefaultSelect
									data={useFeedbackTypeOption()}
									onChange={onChangeViewSelectFeedbackType}
									value={selectedFeedbackType}
									isDisabled={true}
								/>
							</Col>
							<Col sm={3}>
								<BasicFieldLabel title={'Feedback Category'} />
								<DefaultSelect
									data={useFeedbackCategoryOption(feedbackTypeId)}
									onChange={onChangeViewSelectFeedbackCategory}
									value={selectedFeedbackCategory}
									isDisabled={true}
								/>
							</Col>
							<Col sm={6}>
								<BasicFieldLabel title={'Feedback Answer'} />
								<DefaultSelect
									data={useFeedbackAnswerOption(feedbackCategoryId)}
									onChange={onChangeViewSelectFeedbackAnswer}
									value={selectedFeedbackAnswer}
									isDisabled={true}
								/>
							</Col>
						</Row>

						<Row style={{marginTop: 20, marginBottom: 20}}>
							<Col sm={6}>
								<BasicFieldLabel title={'Feedback Details'} />
								<DefaultTextInput ariaLabel={'feedbackDetails'} {...formik.getFieldProps('feedbackDetails')} disabled={true} />
							</Col>
							<Col sm={6}>
								<BasicFieldLabel title={'Solution Provided'} />
								<div style={{display: 'flex', justifyContent: 'flex-start'}}>
									<DefaultTextInput ariaLabel={'solutionProvided'} {...formik.getFieldProps('solutionProvided')} disabled={true} />
								</div>
							</Col>
						</Row>

						<Row>
							<Col sm={3} style={{display: 'flex', justifyContent: 'flex-start'}}>
								<Row style={{marginTop: 10, marginBottom: 20, marginLeft: 5}}>
									<DefaultPrimaryButton
										isDisable={true}
										access={userAccess.includes(USER_CLAIMS.ViewCommunicationRead)}
										title={'Add'}
										onClick={_dispatchViewFeedbackType}
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
								onGridReady={onViewGridReady}
								rowBuffer={0}
								enableRangeSelection={true}
								pagination={true}
								paginationPageSize={10}
								columnDefs={columnDefs}
							/>
						</div>
					</div>
				</MainContainer>
			</div>
			<div style={{margin: 20}}></div>

			<MainContainer>
				<div style={{marginLeft: 40, marginTop: 10, marginBottom: 10}}>
					<PaddedContainer>
						<FieldContainer>
							<ButtonsContainer>
								<DefaultPrimaryButton
									isDisable={formik.values.caseStatus === 'Open' && isEnableEdit ? false : true}
									access={userAccess.includes(USER_CLAIMS.EditCommunicationWrite)}
									title={'Edit Communication'}
									onClick={_editCommunication}
								/>
								<DefaultSecondaryButton access={userAccess.includes(USER_CLAIMS.ViewCommunicationRead)} title={'Close'} onClick={_closeViewPage} />
							</ButtonsContainer>
						</FieldContainer>
					</PaddedContainer>
				</div>
			</MainContainer>
		</FormContainer>
	);
};

export default ViewCommunication;

import {AgGridReact} from 'ag-grid-react';
import {isAfter, isSameSecond} from 'date-fns';
import {useFormik} from 'formik';
import {Guid} from 'guid-typescript';
import React, {useEffect, useState} from 'react';
import {ButtonGroup, Col, Row} from 'react-bootstrap-v5';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
import 'react-loading-skeleton/dist/skeleton.css';
import {shallowEqual, useDispatch, useSelector} from 'react-redux';
import {useHistory, useParams} from 'react-router-dom';
import Select from 'react-select';
import swal from 'sweetalert';
import {RootState} from '../../../../setup';
import * as hubConnection from '../../../../setup/hub/MessagingHub';
import {ElementStyle, MessageTypeEnum} from '../../../constants/Constants';
import useConstant from '../../../constants/useConstant';
import {
	BasicFieldLabel,
	ButtonsContainer,
	DefaultPrimaryButton,
	DefaultSelect,
	DefaultTableButton,
	DefaultTextInput,
	ErrorLabel,
	FieldContainer,
	FormContainer,
	FormHeader,
	MainContainer,
	MlabButton,
	PaddedContainer,
} from '../../../custom-components';
import {useUserProfile} from '../../../custom-functions';
import useFnsDateFormatter from '../../../custom-functions/helper/useFnsDateFormatter';
import useSystemHooks from '../../../custom-functions/system/useSystemHooks';
import {isJsonSizeValid} from '../../../utils/helper';
import {IAuthState} from '../../auth';
import {CloudTalkCdrResponseModel, CloudTalkGetCallRequestModel} from '../../case-management/models';
import {SamespaceGetCallRequestModel} from '../../case-management/models/request/SamespaceGetCallRequestModel';
import {SamespaceGetCallResponseModel} from '../../case-management/models/response/SamespaceGetCallResponseModel';
import {SwalDetails} from '../../system/components/constants/CampaignSetting';
import {USER_CLAIMS} from '../../user-management/components/constants/UserClaims';
import {UseUserManagementHooks} from '../../user-management/components/shared/hooks';
import {CommunicationProviderAccountUdt} from '../../user-management/models';
import UseCaseCommConstant from '../UseCaseCommConstant';
import {
	AddCaseCommunicationRequest,
	AddCommunicationFeedbackRequest,
	AddCommunicationRequest,
	AddCommunicationSurveyRequest,
	CaseCampaignByIdRequest,
	CommunicationFeedBackResponse,
	FormattedFlyFoneCdrUdt,
} from '../models';
import * as caseCommunication from '../redux/CaseCommunicationRedux';
import {AddCaseCommunication, GetCaseCampaignById, SendGetCaseCampaignById, ValidateCaseCampaignPlayer} from '../services/CaseCommunicationApi';
import '../styles/Editor.css';
import {
	CampaignCaseCommSurvey,
	CaseCommReminder,
	CaseCommunication,
	CaseInformations,
	CasePlayerInformations,
	CommunicationLoadingDiv,
	LoadingDivForm,
	SurveyLoadingDiv,
} from './shared/components';
import {useCaseCommHooks, useCaseCommOptions} from './shared/hooks';
import { ColDef, ColGroupDef } from 'ag-grid-community';
import CellRenderRowIndex from '../../../custom-components/grid-components/CellRenderRowIndex';

const initialValues = {
	feedbackDetails: '',
	solutionProvided: '',
	callListNote: '',
};

const PaddedDiv = () => <div style={{margin: 20}} />;

const CreateCaseCommunication: React.FC = () => {
	/**
	 *  ? Redux
	 */
	const {access, userId} = useSelector<RootState>(({auth}) => auth, shallowEqual) as IAuthState;

	/**
	 *  ? Hooks
	 */
	const history = useHistory();
	const dispatch = useDispatch();
	const userProfile = useUserProfile();
	const {paramPlayerId}: {paramPlayerId: string} = useParams();
	const {paramCampaignId}: {paramCampaignId: number} = useParams();
	const {paramBrand}: {paramBrand: string} = useParams();
	const {successResponse, message, caseStatus, HubConnected, SwalFailedMessage, SwalGatewayErrorMessage} = useConstant();
	const {postDateHourMinSecFormat} = UseCaseCommConstant();
	const {mlabFormatDate} = useFnsDateFormatter();

	/**
	 * ? States
	 */

	// Campaign
	const [campaignId, setCampaignId] = useState<number>(0);
	const [surveyTemplateId, setSurveyTemplateId] = useState<number>(0);
	const [campaignTypeId, setCampaignTypeId] = useState<number>(0);

	// Player Informations
	const [mobilePhone, setMobilePhone] = useState<string>('');
	const [caseMlabPlayerId, setCaseMlabPlayerId] = useState<number>(0);

	// Case
	const [selectedTopic, setSelectedTopic] = useState<any>('');
	const [selectedSubtopic, setSelectedSubtopic] = useState<any>('');
	const [callListNoteId, setCallListNoteId] = useState<number>(0);
	const [callListNote, setCallListNote] = useState<string>('');
	const [campaignName, setCampaignName] = useState<string>('');
	const [caseLoading, setCaseLoading] = useState<boolean>(false);

	// Communications
	const [selectedMessageType, setSelectedMessageType] = useState<any>('');
	const [selectedMessageStatus, setSelectedMessageStatus] = useState<any>('');
	const [selectedMessageResponse, setSelectedMessageResponse] = useState<any>('');
	const [selectedCaseType, setSelectedCaseType] = useState<any>('');
	const [selectedPurpose, setSelectedPurpose] = useState<any>('');
	const [startCommunicationDate, setStartCommunicationDate] = useState<any>();
	const [endCommunicationDate, setEndCommunicationDate] = useState<any>();
	const [isContactable, setIsContactable] = useState<boolean>(true);
	const [openStartCommunication, setOpenStartCommunication] = useState<boolean>(false);
	const [openEndCommunication, setOpenEndCommunication] = useState<boolean>(false);
	const [startCommunicationDatePost, setStartCommunicationDatePost] = useState<any>('');
	const [endCommunicationDatePost, setEndCommunicationDatePost] = useState<any>('');
	const [convertedContent, setConvertedContent] = useState<any>();
	const [editorKey, setEditorKey] = useState<number>(4);
	const [hasCdr, setHasCdr] = useState<boolean>(false);
	const [isDisableCreateCaseWhenHasCdr, setIsDisableCreateCaseWhenHasCdr] = useState<boolean>(false);
	const [caseCommIsCalling, setCaseCommIsCalling] = useState<boolean>(false);
	const [dialID, setDialID] = useState<any>('');
	const [disableCall, setDisableCall] = useState<boolean>(false);

	const [retrievedFlyfoneCdrData, setRetrievedFlyfoneCdrData] = useState<FormattedFlyFoneCdrUdt>();
	const [retrievedCloudTalkCdrData, setRetrievedCloudTalkCdrData] = useState<CloudTalkCdrResponseModel>();
	const [retrievedSamespaceCdrData, setRetrievedSamespaceCdrData] = useState<SamespaceGetCallResponseModel>();

	// Survey
	const [createCaseSurveyRequest, setCreateCaseSurveyRequest] = useState<AddCommunicationSurveyRequest[]>([]);

	// Feedback
	const [selectedCreateCaseFeedbackType, setSelectedCreateCaseFeedbackType] = useState<any>('');
	const [selectedCreateCaseFeedbackCategory, setSelectedCreateCaseFeedbackCategory] = useState<any>('');
	const [selectedCreateCaseFeedbackAnswer, setSelectedCreateCaseFeedbackAnswer] = useState<any>('');
	const [hasFeedbackErrors, setHasFeedbackErrors] = useState<boolean>(false);
	const [errorFeedbackMessage, setErrorFeedbackMessage] = useState<string>('');
	const [feedbackData, setFeedbackData] = useState<Array<CommunicationFeedBackResponse>>([]);

	// Forms
	const [rowData, setRowData] = useState<Array<CommunicationFeedBackResponse>>([]);

	const [isSubmitClicked, setIsSubmitClicked] = useState<boolean>(false);
	/**
	 * ? Hooks
	 */
	const {
		getTopicOptions,
		topicOptionList,
		getSubtopicOptions,
		subtopicOptionList,
		getFeedbackAnserOptions,
		feedbackAnswerOptionList,
		feedbackAnswerLoading,
		getMessageTypeOptionList,
		getMessageStatusOptionById,
		messageStatusOptionList,
		getCaseTypeOptionList,
		caseTypeOptionsList,
		feedbackTypeOptionList,
		getFeedbackTypeOptionList,
		getFeedbackCategoryOptionById,
		feedbackCategoryOptionList,
		getMessageResponseOptionById,
		messageResponseOptionList,
	} = useCaseCommOptions();

	const {getMasterReference, masterReferenceOptions} = useSystemHooks();

	const {
		getSurveyTemplate,
		surveyQuestion,
		surveyQuestionAnswer,
		surveyTemplateTitle,
		surveyLoading,
		convertCommunicationContentToPostRequest,
		isFetching,
		getFlyfoneCdrData,
		getCloudTalkCall,
		getSamespaceCall,
		flyfoneCdrData,
		cloudTalkCdr,
		samespaceCdrData,
	} = useCaseCommHooks();

	const {communicationProviderAccounts, getCommunicationProviderAccounts} = UseUserManagementHooks();

	useEffect(() => {
		let definedUserId: number = userId !== undefined ? parseInt(userId) : 0;
		getCommunicationProviderAccounts(definedUserId, true, message.caseCommNoCommProviderOnUser);
	}, []);

	/**
	 * Page Mounted
	 */
	useEffect(() => {
		dispatch(caseCommunication.actions.communicationSurveyQuestionAnswer([]));
		_resetFeedbackForm();

		ValidateCaseCampaignPlayer(paramPlayerId, paramCampaignId, paramBrand)
			.then((response) => {
				if (response.data.status === successResponse) {
					loadCaseCampaignInformationForCreateCase();
				} else {
					swal('Failed', 'Unable to proceed, player already have case record on this campaign', 'error')
						.then((willUpdate) => {
							if (willUpdate) {
								history.push('/campaign-workspace/agent-workspace');
							}
						})
						.catch(() => {
							console.log('Error found validating player');
						});
				}
			})
			.catch(() => {
				swal('Connection error Please close the form and try again').catch(() => {});
			});
	}, []);

	const onGridReady = (params: any) => {
		params.api.paginationGoToPage(4);
		setRowData(feedbackData);
		params.api.sizeColumnsToFit();
	};

	/**
	 * ? Watchers
	 */

	useEffect(() => {
		if (feedbackTypeOptionList.length === 1) setSelectedCreateCaseFeedbackType(feedbackTypeOptionList.find((x) => x.label !== ''));
	}, [feedbackTypeOptionList]);

	useEffect(() => {
		if (feedbackCategoryOptionList.length === 1) setSelectedCreateCaseFeedbackCategory(feedbackCategoryOptionList.find((x) => x.label !== ''));
	}, [feedbackCategoryOptionList]);

	useEffect(() => {
		if (feedbackAnswerOptionList.length === 1) {
			const {feedbackAnswerId, feedbackAnswerName, feedbackCategoryName, feedbackTypeName} = feedbackAnswerOptionList[0];
			setSelectedCreateCaseFeedbackAnswer({label: feedbackTypeName + '-' + feedbackCategoryName + '-' + feedbackAnswerName, value: feedbackAnswerId});
		}
	}, [feedbackAnswerOptionList]);

	useEffect(() => {
		setRowData(feedbackData);
	}, [feedbackData]);

	useEffect(() => {
		if (selectedCreateCaseFeedbackType !== undefined) {
			const {value} = selectedCreateCaseFeedbackType;
			getFeedbackCategoryOptionById(value);
		}
	}, [selectedCreateCaseFeedbackType]);

	useEffect(() => {
		if (selectedCreateCaseFeedbackCategory !== undefined) {
			getFeedbackAnserOptions(selectedCreateCaseFeedbackType.value, selectedCreateCaseFeedbackCategory.value, '');
		}
	}, [selectedCreateCaseFeedbackCategory]);

	useEffect(() => {
		if (flyfoneCdrData !== undefined) setRetrievedFlyfoneCdrData(flyfoneCdrData);
	}, [flyfoneCdrData]);

	useEffect(() => {
		if (cloudTalkCdr !== undefined) setRetrievedCloudTalkCdrData(cloudTalkCdr);
	}, [cloudTalkCdr]);

	useEffect(() => {
		if (samespaceCdrData !== undefined) setRetrievedSamespaceCdrData(samespaceCdrData);
	}, [samespaceCdrData]);

	/**
	 * ? Api Call Methods
	 */

	const _redirectCreateCaseDenied = () => history.push('/error/401');

	const _getCaseCampaignInforRestriction = async (_hasData: boolean) => {
		if (!_hasData) {
			_redirectCreateCaseDenied();
		}
	};

	const loadCaseCampaignInformationForCreateCaseCallback = async (_cacheId: string) => {
		try {
			const data = await GetCaseCampaignById(_cacheId);
			if (!data?.data) {
				setCaseLoading(false);
				_getCaseCampaignInforRestriction(false);
			} else {
				getMasterReference('4');
				getFeedbackAnserOptions('', '', '');
				getMessageTypeOptionList();
				getCaseTypeOptionList();
				getSurveyTemplate(paramCampaignId);
				getTopicOptions();
				getFeedbackTypeOptionList();
				setCampaignId(data.data.campaignId);
				setCallListNoteId(data.data.callListNoteId);
				setSurveyTemplateId(data.data.surveyTemplateId);
				setCallListNote(data.data.callListNote);
				setCampaignTypeId(data.data.campaignTypeId);
				setCampaignName(data.data.campaignName);
				setConvertedContent('-');
				setCaseLoading(false);
				_getCaseCampaignInforRestriction(true);
			}
		} catch (err) {
			console.log('error from callback function' + err);
			setCaseLoading(false);
			_getCaseCampaignInforRestriction(false);
		}
	};

	const setEndCommunicationNow = () => {
		setEndCommunicationDate(new Date());
		setEndCommunicationDatePost(mlabFormatDate(new Date(), postDateHourMinSecFormat));
	};

	const loadCaseCampaignInformationForCreateCase = async () => {
		setCaseLoading(true);

		try {
			const messagingHub = hubConnection.createHubConnenction();
			await messagingHub.start();

			const request: CaseCampaignByIdRequest = {
				queueId: Guid.create().toString(),
				userId: userId?.toString() ?? '0',
				playerId: paramPlayerId,
				campaignId: paramCampaignId,
				brandName: paramBrand,
			};

			const response = await SendGetCaseCampaignById(request);
			if (response.status !== successResponse) {
				setCaseLoading(false);
				return false;
			} else {
				messagingHub.on(request.queueId.toString(), (message) => {
					loadCaseCampaignInformationForCreateCaseCallback(message.cacheId);
				});
			}
		} catch (err) {
			console.log('Error while starting connection: ' + err);
			setCaseLoading(false);
			return false;
		}
	};

	const onChangeSelectFeedbackCategory = (val: any) => {
		setSelectedCreateCaseFeedbackCategory(val);
		setSelectedCreateCaseFeedbackAnswer('');
	};

	const onChangeSelectFeedbackType = (val: any) => {
		setSelectedCreateCaseFeedbackCategory('');
		setSelectedCreateCaseFeedbackAnswer('');
		setSelectedCreateCaseFeedbackType(val);
	};

	const onChangeSelectFeedbackAnswer = (val: any) => {
		const {feedbackAnswerId, feedbackAnswerName, feedbackCategoryId, feedbackCategoryName, feedbackTypeId, feedbackTypeName} = val.value;
		setSelectedCreateCaseFeedbackAnswer({
			label: feedbackTypeName + ' - ' + feedbackCategoryName + ' - ' + feedbackAnswerName,
			value: feedbackAnswerId,
		});
		setSelectedCreateCaseFeedbackCategory({label: feedbackCategoryName, value: feedbackCategoryId});
		setSelectedCreateCaseFeedbackType({label: feedbackTypeName, value: feedbackTypeId});
	};

	/**
	 *  ? Dispatch Methods
	 */

	const _dispatchCreateCaseFeedback = async () => {
		if (feedbackData !== undefined) {
			const createCaseCommFeedbackDispatchRequest: CommunicationFeedBackResponse = {
				communicationFeedbackId: 0,
				caseCommunicationId: 0,
				communicationFeedbackNo: 0,
				feedbackTypeId: parseInt(selectedCreateCaseFeedbackType.value),
				feedbackTypeName: selectedCreateCaseFeedbackType.label,
				feedbackAnswerId: parseInt(selectedCreateCaseFeedbackAnswer.value),
				feedbackAnswerName:
					feedbackAnswerOptionList.find((x) => x.feedbackAnswerId === selectedCreateCaseFeedbackAnswer.value)?.feedbackAnswerName || '',
				feedbackCategoryId: parseInt(selectedCreateCaseFeedbackCategory.value),
				feedbackCategoryName: selectedCreateCaseFeedbackCategory.label,
				communicationFeedbackDetails: formik.values.feedbackDetails,
				communicationSolutionProvided: formik.values.solutionProvided,
			};

			let searchCreateCaseFeedbackData = feedbackData.find(
				(x: CommunicationFeedBackResponse) =>
					x.feedbackTypeId === createCaseCommFeedbackDispatchRequest.feedbackTypeId &&
					x.feedbackAnswerId === createCaseCommFeedbackDispatchRequest.feedbackAnswerId &&
					x.feedbackCategoryId === createCaseCommFeedbackDispatchRequest.feedbackCategoryId &&
					x.communicationFeedbackDetails.toLocaleUpperCase() ===
						createCaseCommFeedbackDispatchRequest.communicationFeedbackDetails.toLocaleUpperCase() &&
					x.communicationSolutionProvided.toLocaleUpperCase() === createCaseCommFeedbackDispatchRequest.communicationSolutionProvided.toUpperCase()
			);

			return searchCreateCaseFeedbackData;
		}
	};

	const _validateCreateCaseFeedback = async () => {
		let isError: boolean = false;

		if (selectedCreateCaseFeedbackType.value === '' || selectedCreateCaseFeedbackType.value === undefined) {
			isError = true;
			setHasFeedbackErrors(true);
			setErrorFeedbackMessage(message.requiredAllFields);
		}

		if (selectedCreateCaseFeedbackCategory.value === '' || selectedCreateCaseFeedbackCategory.value === undefined) {
			isError = true;
			setHasFeedbackErrors(true);
			setErrorFeedbackMessage(message.requiredAllFields);
		}

		if (formik.values.feedbackDetails === '') {
			isError = true;
			setHasFeedbackErrors(true);
			setErrorFeedbackMessage(message.requiredAllFields);
		}

		if (formik.values.solutionProvided === '') {
			isError = true;
			setHasFeedbackErrors(true);
			setErrorFeedbackMessage(message.requiredAllFields);
		}

		if (selectedCreateCaseFeedbackAnswer.value === '' || selectedCreateCaseFeedbackAnswer.value === undefined) {
			isError = true;
			setHasFeedbackErrors(true);
			setErrorFeedbackMessage(message.requiredAllFields);
		}

		if ((await _dispatchCreateCaseFeedback()) !== undefined) {
			setHasFeedbackErrors(true);
			setErrorFeedbackMessage('Value already exists, please check the table to find them');
			return true;
		}

		if (isError === false) {
			const requestComms: CommunicationFeedBackResponse = {
				communicationFeedbackId: 1,
				caseCommunicationId: 1,
				communicationFeedbackNo: 1,
				feedbackTypeId: parseInt(selectedCreateCaseFeedbackType.value),
				feedbackTypeName: selectedCreateCaseFeedbackType.label,
				feedbackAnswerId: parseInt(selectedCreateCaseFeedbackAnswer.value),
				feedbackAnswerName:
					feedbackAnswerOptionList.find((x) => x.feedbackAnswerId === selectedCreateCaseFeedbackAnswer.value)?.feedbackAnswerName || '',
				feedbackCategoryId: parseInt(selectedCreateCaseFeedbackCategory.value),
				feedbackCategoryName: selectedCreateCaseFeedbackCategory.label,
				communicationFeedbackDetails: formik.values.feedbackDetails,
				communicationSolutionProvided: formik.values.solutionProvided,
			};

			let storedData = feedbackData ?? [];
			const newDataToStore = storedData.concat(requestComms);
			setFeedbackData(newDataToStore);
			setRowData(feedbackData);
			setHasFeedbackErrors(false);
			setErrorFeedbackMessage('');
			_resetFeedbackForm();
		}
	};

	const _resetFeedbackForm = () => {
		setSelectedCreateCaseFeedbackType('');
		setSelectedCreateCaseFeedbackCategory('');
		setSelectedCreateCaseFeedbackAnswer('');
		formik.setFieldValue('feedbackDetails', '');
		formik.setFieldValue('solutionProvided', '');
	};

	const _resetCreateCaseForm = () => {
		setSelectedCaseType([]);
		setSelectedTopic([]);
		setSelectedSubtopic([]);
		setSelectedMessageStatus([]);
		setSelectedMessageResponse([]);
		setStartCommunicationDate(null);
		setEndCommunicationDate(null);
		setStartCommunicationDatePost('');
		setEndCommunicationDatePost('');
		setConvertedContent('-');
		setEditorKey(editorKey * 43);
	};

	const _removeFeedback = (data: CommunicationFeedBackResponse) => {
		let filterdFeedback = feedbackData.filter((x: CommunicationFeedBackResponse) => x !== data);
		setFeedbackData(filterdFeedback);
	};

	const backToAgentWorkSpace = () => {
		swal({
			title: 'Confirmation',
			text: 'This action will discard any changes made and return to the campaign workspace page, please confirm',
			icon: 'warning',
			buttons: ['No', 'Yes'],
			dangerMode: true,
		})
			.then((onBack) => {
				if (onBack) {
					history.push('/campaign-workspace/agent-workspace');
				}
			})
			.catch(() => {});
	};

	async function validateCaseCreationDetails() {
		let caseInforError: boolean = false;

		if (selectedTopic === undefined || selectedTopic === '') {
			caseInforError = true;
		}

		if (selectedSubtopic === undefined || selectedSubtopic === '') {
			caseInforError = true;
		}

		return caseInforError;
	}

	async function validateCaseCommunicationCreationDetails() {
		let caseCommunicationCreationError: boolean = false;

		if (selectedMessageType === undefined || selectedMessageType === '') {
			caseCommunicationCreationError = true;
		}

		if (selectedMessageStatus === undefined || selectedMessageStatus === '') {
			caseCommunicationCreationError = true;
		}

		if (selectedMessageResponse === undefined || selectedMessageResponse === '') {
			caseCommunicationCreationError = true;
		}

		if (startCommunicationDatePost === undefined || startCommunicationDatePost === '' || startCommunicationDatePost === 'Invalid date') {
			caseCommunicationCreationError = true;
		}

		if (endCommunicationDatePost === undefined || endCommunicationDatePost === '' || endCommunicationDatePost === 'Invalid date') {
			caseCommunicationCreationError = true;
		}

		return caseCommunicationCreationError;
	}

	async function validateCaseCreateFormToPost() {
		let isError: boolean = false;

		if ((await validateCaseCreationDetails()) === true) {
			isError = true;
		}

		if ((await validateCaseCommunicationCreationDetails()) === true) {
			isError = true;
		}

		if (isContactable === true) {
			if (createCaseSurveyRequest.length === 0 || createCaseSurveyRequest === undefined) {
				isError = true;
			}

			let requiredQuestion = surveyQuestion.filter((x) => x.isMandatory === true).map((x) => x.surveyQuestionId);
			let answersDataCase = createCaseSurveyRequest
				.filter((x: AddCommunicationSurveyRequest) => x.surveyAnswer !== '')
				.map((x: any) => x.surveyQuestionId);
			let allCaseFounded = requiredQuestion.every((rq) => answersDataCase.includes(rq));

			if (allCaseFounded === false) {
				isError = true;
			}
		}

		return isError;
	}

	async function validateCommunicationDateCaseCreate() {
		let isError: boolean = false;

		if (isSameSecond(Date.parse(startCommunicationDatePost), Date.parse(endCommunicationDatePost))) {
			isError = true;
		}
		if (isAfter(Date.parse(startCommunicationDatePost), Date.parse(endCommunicationDatePost))) {
			isError = true;
		}

		return isError;
	}

	async function caseCreatefeedbackRequestData() {
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
					communicationFeedbackDetails: item.communicationFeedbackDetails,
					communicationSolutionProvided: item.communicationSolutionProvided,
					createdBy: userId ? parseInt(userId) : 0,
					updatedBy: userId ? parseInt(userId) : 0,
				};
				feedbackRequestData.push(feedbackRequest);
			});
		}

		return feedbackRequestData;
	}

	async function caseCreateRequestPost() {
		let feedbackRequestData = await caseCreatefeedbackRequestData();
		let converteCaseCommContentToBase64 = await convertCommunicationContentToPostRequest(convertedContent);

		const communicationRequest: AddCommunicationRequest = {
			caseCommunicationId: 0,
			caseInformationId: 0,
			purposeId: parseInt(selectedPurpose.value),
			messageTypeId: parseInt(selectedMessageType.value),
			messageStatusId: parseInt(selectedMessageStatus.value),
			messageReponseId: parseInt(selectedMessageResponse.value),
			startCommunicationDate: startCommunicationDatePost,
			endCommunicationDate: endCommunicationDatePost,
			communicationContent: converteCaseCommContentToBase64,
			communicationSurveyQuestion: createCaseSurveyRequest,
			communicationFeedBackType: feedbackRequestData.filter((x: AddCommunicationFeedbackRequest) => x.communicationFeedbackId === 0),
			createdBy: userId ? parseInt(userId) : 0,
			updatedBy: userId ? parseInt(userId) : 0,
		};
		const request: AddCaseCommunicationRequest = {
			queueId: Guid.create().toString(),
			userId: userId?.toString() ?? '0',
			playerId: paramPlayerId,
			caseInformationId: 0,
			caseCreatorId: userId ? parseInt(userId) : 0,
			caseTypeId: parseInt(selectedCaseType.value),
			campaignId: campaignId,
			caseStatusId: caseStatus.Open,
			topicId: parseInt(selectedTopic.value),
			subtopicId: parseInt(selectedSubtopic.value),
			callListNoteId: callListNoteId || 0,
			callListNote: callListNote, //formik.values.callListNote, // BUG FIX: MLAB-4747
			callingCode: dialID,
			hasFlyfoneCdr: hasCdr,
			caseCommunication: communicationRequest,
			subscriptionId: communicationProviderAccounts.find((commAccountId) => commAccountId.messageTypeId === MessageTypeEnum.Samespace.toString())
				?.subscriptionId,
			brandName: paramBrand,
		};

		return request;
	}

	const caseCreateCommunicationActionAfterPost = (_response: number, _caseId: any) => {
		if (_response === successResponse) {
			swal('Success', 'Transaction successfully submitted', 'success')
				.then((onSuccess) => {
					if (onSuccess) {
						_resetCreateCaseForm();
						history.push(`/campaign-workspace/view-case/${_caseId}`);
						formik.setSubmitting(false);
					}
				})
				.catch(() => {});
			_resetCreateCaseForm();
		} else {
			swal('Failed', 'Problem connecting to the server, Please refresh', 'error').catch(() => {});
			formik.setSubmitting(false);
		}
	};

	const createCaseCommunicationPost = async () => {
		let request = await caseCreateRequestPost();

		if (!isJsonSizeValid(request)) {
			swal(SwalDetails.ErrorTitle, 'Communication content should not exceed 3MB.', SwalDetails.ErrorIcon);
			return;
		}

		setTimeout(() => {
			const messagingHub = hubConnection.createHubConnenction();
			messagingHub
				.start()
				.then(() => {
					if (messagingHub.state === HubConnected) {
						formik.setSubmitting(true);
						AddCaseCommunication(request)
							.then((response) => {
								if (response.status === successResponse) {
									messagingHub.on(request.queueId.toString(), (message) => {
										let resultData = JSON.parse(message.remarks);
										caseCreateCommunicationActionAfterPost(resultData.Status, resultData.Data.CaseId);
										messagingHub.off(request.queueId.toString());
										messagingHub.stop().catch(() => {});
									});
								} else {
									swal(SwalGatewayErrorMessage.title, SwalGatewayErrorMessage.textError, SwalGatewayErrorMessage.icon).catch(() => {});
									formik.setSubmitting(false);
								}
							})
							.catch(() => {
								messagingHub.stop().catch(() => {});
								swal(SwalGatewayErrorMessage.title, SwalGatewayErrorMessage.textError, SwalGatewayErrorMessage.icon).catch(() => {});
								formik.setSubmitting(false);
							});
					}
				})
				.catch((err) => console.log('Error while starting connection: ' + err));
		}, 1000);
	};

	/**
	 * ? Communication call functions
	 */
	const disableCreateCaseEndCallBtn = () => !caseCommIsCalling || disableCall;

	const casePlayerInfoGetFlyfoneCdrData = () => {
		if (selectedMessageType.value === MessageTypeEnum.FlyFoneCall.toString()) {
			if (dialID !== '0') {
				getFlyfoneCdrData(dialID);
			}
		}

		if (selectedMessageType.value === MessageTypeEnum.CloudTalk.toString()) {
			fetchCloudTalkCdr();
		}

		if (selectedMessageType.value === MessageTypeEnum.Samespace.toString()) {
			fetchSamespaceCdr();
		}

		setCaseCommIsCalling(false);
		setDisableCall(true);
	};

	const fetchCloudTalkCdr = async () => {
		let requestGetCloudtalkCdr: CloudTalkGetCallRequestModel = {
			agentId:
				communicationProviderAccounts.find((commAccountId) => commAccountId.messageTypeId === MessageTypeEnum.CloudTalk.toString())?.accountID ?? '',
			dialId: dialID,
			userId: parseInt(userId ?? '0'),
		};
		getCloudTalkCall(requestGetCloudtalkCdr);
	};

	const fetchSamespaceCdr = async () => {
		setEndCommunicationNow();
		let _sameSpaceCreateParams: CommunicationProviderAccountUdt | undefined = communicationProviderAccounts.find(
			(commAccountId) => commAccountId.messageTypeId === MessageTypeEnum.Samespace.toString()
		);

		let request: SamespaceGetCallRequestModel = {
			agentId: _sameSpaceCreateParams?.accountID ?? '',
			dialId: dialID,
			userId: parseInt(userId ?? '0'),
			subscriptionId: _sameSpaceCreateParams?.subscriptionId,
		};
		getSamespaceCall(request);
	};

	/**
	 * ? Formik form post
	 */
	const formik = useFormik({
		initialValues,
		onSubmit: async (values, {setStatus, setSubmitting, resetForm}) => {
			if (isSubmitClicked) return;
			setSubmitting(true);
			setIsSubmitClicked(true);
			if (await validateCaseCreateFormToPost()) {
				swal(SwalFailedMessage.title, SwalFailedMessage.textMandatory, SwalFailedMessage.icon).catch(() => {});
				setSubmitting(false);
				setIsSubmitClicked(false);
			} else if (await validateCommunicationDateCaseCreate()) {
				swal(SwalFailedMessage.title, SwalFailedMessage.textCommunicationDateValidation, SwalFailedMessage.icon).catch(() => {});
				setSubmitting(false);
				setIsSubmitClicked(false);
			} else {
				createCaseCommunicationPost().catch(() => {});
			}
		},
	});

	/**
	 * Table
	 */
	const renderCreateCaseCommFeedbackAction = (_props: any) => (
		<ButtonGroup aria-label='Basic example'>
			<div className='d-flex justify-content-center flex-shrink-0'>
				<DefaultTableButton
					access={access?.includes(USER_CLAIMS.CaseAndCommunicationWrite)}
					title={'remove'}
					onClick={() => _removeFeedback(_props.data)}
				/>
			</div>
		</ButtonGroup>
	);

	const renderCreateCaseCommFeedbackRowIndex = (_props: any) => <>{_props ? <div>{_props.rowIndex + 1}</div> : null}</>;

	const columnDefs : (ColDef<CommunicationFeedBackResponse> | ColGroupDef<CommunicationFeedBackResponse>)[] =[
		{headerName: 'No', field: 'feedbackTypeName', cellRenderer: CellRenderRowIndex},
		{headerName: 'Feedback Type', field: 'feedbackTypeName'},
		{headerName: 'Feedback Category', field: 'feedbackCategoryName'},
		{headerName: 'Feedback Answer', field: 'feedbackAnswerName'},
		{headerName: 'Feedback Details', field: 'communicationFeedbackDetails'},
		{headerName: 'Solution Provided', field: 'communicationSolutionProvided'},
		{
			headerName: 'Action',
			cellRenderer: renderCreateCaseCommFeedbackAction,
		},
	];

	/**
	 * ? Local Components
	 */

	return (
		<FormContainer onSubmit={formik.handleSubmit}>
			{/* Player information Section */}
			<CasePlayerInformations
				callListNote={callListNote}
				setCallistNote={setCallListNote}
				mobilePhone={mobilePhone}
				setMobilePhone={setMobilePhone}
				brandName={paramBrand}
				setCaseMlabPlayerId={setCaseMlabPlayerId}
			/>
			<PaddedDiv />
			{caseLoading === true ? (
				<LoadingDivForm />
			) : (
				<CaseInformations
					selectedCaseType={selectedCaseType}
					setSelectedCaseType={setSelectedCaseType}
					selectedTopic={selectedTopic}
					setSelectedTopic={setSelectedTopic}
					selectedSubtopic={selectedSubtopic}
					setSelectedSubtopic={setSelectedSubtopic}
					topicOptionList={topicOptionList}
					subtopicOptionList={subtopicOptionList}
					getSubtopicOptions={getSubtopicOptions}
					campaignName={campaignName}
					setCampaignName={setCampaignName}
					userProfile={userProfile}
					campaignTypeId={campaignTypeId}
					caseTypeOptionsList={caseTypeOptionsList}
				/>
			)}

			<PaddedDiv />

			{/* Case Communication Section */}
			{caseLoading === true ? (
				<CommunicationLoadingDiv />
			) : (
				<CaseCommunication
					editorKey={editorKey}
					endCommunicationDate={endCommunicationDate}
					masterReferenceOptions={masterReferenceOptions}
					openEndCommunication={openEndCommunication}
					openStartCommunication={openStartCommunication}
					selectedMessageResponse={selectedMessageResponse}
					selectedMessageStatus={selectedMessageStatus}
					selectedMessageType={selectedMessageType}
					setConvertedContent={setConvertedContent}
					setEndCommunicationDate={setEndCommunicationDate}
					setEndCommunicationDatePost={setEndCommunicationDatePost}
					setOpenEndCommunication={setOpenEndCommunication}
					setIsContactable={setIsContactable}
					setOpenStartCommunication={setOpenStartCommunication}
					setSelectedMessageResponse={setSelectedMessageResponse}
					setSelectedMessageStatus={setSelectedMessageStatus}
					setSelectedMessageType={setSelectedMessageType}
					setStartCommunicationDate={setStartCommunicationDate}
					setStartCommunicationDatePost={setStartCommunicationDatePost}
					startCommunicationDate={startCommunicationDate}
					messageStatusOptionList={messageStatusOptionList}
					selectedPurpose={selectedPurpose}
					setSelectedPurpose={setSelectedPurpose}
					hasCallingOnCreateCase={caseCommIsCalling}
					getMessageResponseOptionById={getMessageResponseOptionById}
					messageResponseOptionList={messageResponseOptionList}
					getMessageStatusOptionById={getMessageStatusOptionById}
					convertedContent={convertedContent}
					setHasCdr={setHasCdr}
					isDisableCreateCaseWhenHasCdr={isDisableCreateCaseWhenHasCdr}
					dialID={dialID}
					setDialID={setDialID}
					mobilePhone={mobilePhone}
					paramPlayerId={paramPlayerId}
					setIsDisableCreateCaseWhenHasCdr={setIsDisableCreateCaseWhenHasCdr}
					setHasCallingOnCreateCase={setCaseCommIsCalling}
					disableCall={disableCall}
					retrievedFlyfoneCdrData={retrievedFlyfoneCdrData}
					retrievedCloudTalkCdrData={retrievedCloudTalkCdrData}
					retrievedSamespaceCdrData={retrievedSamespaceCdrData}
					commProviderProps={communicationProviderAccounts}
					caseMlabPlayerId={caseMlabPlayerId}
				/>
			)}

			<PaddedDiv />

			<PaddedDiv />

			<div style={isContactable === false ? {display: 'none'} : undefined}>
				{caseLoading === true || surveyLoading === true || surveyQuestion.length === 0 ? (
					<SurveyLoadingDiv />
				) : (
					<CampaignCaseCommSurvey
						campaignSurveyQuestion={surveyQuestion}
						campaignSurveyQuestionAnswer={surveyQuestionAnswer}
						campaignSurveyTemplateTitle={surveyTemplateTitle}
						campaignSurveyRequest={createCaseSurveyRequest}
						setCampaignSurveyRequest={setCreateCaseSurveyRequest}
						campaignSurveyTemplateId={surveyTemplateId}
						campaignSurveyUserIdCreated={userId ?? '0'}
						isCampaignCaseCommSurveyReadOnly={false}
						campaignSurveyCommunicationId={0}
						campaignSurveyPreSelectOnlyOneAnswer={true}
					/>
				)}

				<div style={{margin: 20}}></div>
				{caseLoading === true ? (
					<CommunicationLoadingDiv />
				) : (
					<MainContainer>
						<FormHeader headerLabel={'Feedback'} />
						<div style={{margin: 40}}>
							<Row>
								<Col sm={12}>
									<ErrorLabel hasErrors={hasFeedbackErrors} errorMessage={errorFeedbackMessage} />
								</Col>
							</Row>

							<Row>
								<Col sm={3}>
									<BasicFieldLabel title={'Feedback Type'} />
									<DefaultSelect onChange={onChangeSelectFeedbackType} value={selectedCreateCaseFeedbackType} data={feedbackTypeOptionList} />
								</Col>
								<Col sm={3}>
									<BasicFieldLabel title={'Feedback Category'} />
									<DefaultSelect
										onChange={onChangeSelectFeedbackCategory}
										value={selectedCreateCaseFeedbackCategory}
										data={feedbackCategoryOptionList}
									/>
								</Col>
								<Col sm={6}>
									<BasicFieldLabel title={'Feedback Answer'} />
									<Select
										options={feedbackAnswerOptionList.flatMap((x) => [
											{label: x.feedbackTypeName + ' - ' + x.feedbackCategoryName + ' - ' + x.feedbackAnswerName, value: x},
										])}
										isSearchable={true}
										onChange={onChangeSelectFeedbackAnswer}
										value={selectedCreateCaseFeedbackAnswer}
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
									<DefaultTextInput {...formik.getFieldProps('feedbackDetails')} ariaLabel={'feedbackDetails'} />
								</Col>
								<Col sm={6}>
									<BasicFieldLabel title={'Solution Provided'} />
									<div style={{display: 'flex', justifyContent: 'flex-start'}}>
										<DefaultTextInput {...formik.getFieldProps('solutionProvided')} ariaLabel={'solutionProvided'} />
									</div>
								</Col>
							</Row>

							<Row>
								<Col sm={3} style={{display: 'flex', justifyContent: 'flex-start'}}>
									<Row style={{marginTop: 10, marginBottom: 20, marginLeft: 5}}>
										<DefaultPrimaryButton
											title={'Add'}
											isDisable={false}
											access={access?.includes(USER_CLAIMS.CaseAndCommunicationWrite)}
											onClick={_validateCreateCaseFeedback}
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
									enableRangeSelection={true}
									pagination={true}
									paginationPageSizeSelector={false}
									columnDefs={columnDefs}
									rowBuffer={0}
									paginationPageSize={10}
								/>
							</div>
						</div>
					</MainContainer>
				)}
			</div>

			<PaddedDiv />

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
										onClick={() => casePlayerInfoGetFlyfoneCdrData()}
										loadingTitle={'End Call'}
										loading={false}
										disabled={disableCreateCaseEndCallBtn()}
									/>
									<MlabButton
										access={access?.includes(USER_CLAIMS.CaseAndCommunicationWrite)}
										size={'sm'}
										label={'Submit'}
										type={'button'}
										weight={'solid'}
										style={ElementStyle.primary}
										onClick={formik.handleSubmit}
										loading={caseCommIsCalling || formik.isSubmitting || isSubmitClicked}
										loadingTitle={'Please wait ...'}
										disabled={caseCommIsCalling || formik.isSubmitting || isFetching || isSubmitClicked}
									/>
									<MlabButton
										access={access?.includes(USER_CLAIMS.CaseAndCommunicationRead)}
										size={'sm'}
										label={'Back'}
										type={'button'}
										weight={'solid'}
										style={ElementStyle.secondary}
										onClick={backToAgentWorkSpace}
										loading={caseCommIsCalling || formik.isSubmitting || isSubmitClicked}
										loadingTitle={'Please wait ...'}
										disabled={caseCommIsCalling || formik.isSubmitting || isSubmitClicked}
									/>
								</ButtonsContainer>
							</Row>
							<Row>
								<div>
									<CaseCommReminder isCalling={caseCommIsCalling} isFetching={isFetching} messageTypeId={selectedMessageType.value} />
								</div>
							</Row>
						</FieldContainer>
					</PaddedContainer>
				</div>
			</MainContainer>
		</FormContainer>
	);
};

export default CreateCaseCommunication;

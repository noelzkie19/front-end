import axios from 'axios';
import {AppConfiguration} from 'read-appsettings-json';
import {LookupModel} from '../../../common/model';
import {
	CloudTalkMakeACallRequestModel,
	CloudTalkMakeACallWithApiResponseModel,
	FormattedFlyFoneCdrUdt,
	SurveyTemplateResponse,
} from '../../case-communication/models';
import {SamespaceMakeACallRequestModel} from '../../case-communication/models/request/SamespaceMakeACallRequestModel';
import {SamespaceMakeACallWithApiResponseModel} from '../../case-communication/models/response/SamespaceMakeACallWithApiResponseModel';
import {
	ChatSurveyActionAndSummaryGetByIdRequestModel,
	CloudTalkCdrResponseModel,
	CloudTalkGetCallRequestModel,
	CustomerServiceCaseInformationResponseModel,
	FlyFoneCallDetailRecordRequestModel,
	FlyFoneCallDetailRecordResponseModel,
	FlyFoneFetchCallDetailRecordRequestModel,
	FlyFoneOutboundCallRequestModel,
	PCSCommunicationQuestionsResponseModel,
	PCSCommunicationSummaryActionResponseModel,
	PCSQuestionaireListByFilterRequestModel,
	PCSQuestionaireListByFilterResponseModel,
	SubtopicLanguageOptionModelResponse,
	TopicLanguageOptionModelResponse,
	UpSertCustomerServiceCaseCommunicationRequestModel,
	UpsertCaseResponse,
	UpsertChatSurveyActionAndSummaryRequestModel,
} from '../models';
import {CaseCommunicationFilterModel} from '../models/CaseCommunicationFilterModel';
import {CaseCommunicationOwnerList} from '../models/CommunicationOwnerList';
import {CustomerCaseCommListRequestModel} from '../models/CustomerCaseCommListRequestModel';
import {CaseCommunicationAnnotationRequestModel} from '../models/request/CaseCommunicationAnnotationRequestModel';
import {SamespaceGetCallRequestModel} from '../models/request/SamespaceGetCallRequestModel';
import {ValidateCaseCommunicationAnnotationRequestModel} from '../models/request/ValidateCaseCommunicationAnnotationRequestModel';
import {CommunicationReviewEventLogRequestModel} from '../models/request/communication-review/CommunicationReviewEventLogRequestModel';
import {CommunicationReviewHistoryRequestModel} from '../models/request/communication-review/CommunicationReviewHistoryRequestModel';
import {CommunicationReviewLimitRequestModel} from '../models/request/communication-review/CommunicationReviewLimitRequestModel';
import {CommunicationReviewTaggingRequestModel} from '../models/request/communication-review/CommunicationReviewTaggingRequestModel';
import {SaveCommunicationReviewRequestModel} from '../models/request/communication-review/SaveCommunicationReviewRequestModel';
import {CaseCommunicationAnnotationModel} from '../models/response/CaseCommunicationAnnotationModel';
import {CaseManagementPCSCommunicationByFilterResponseModel} from '../models/response/CaseManagementPCSCommunicationByFilterResponseModel';
import {SamespaceGetCallResponseModel} from '../models/response/SamespaceGetCallResponseModel';
import {CaseCommunicationReviewResponseModel} from '../models/response/communication-review/CaseCommunicationReviewResponseModel';
import {CommunicationReviewCriteriaListResponseModel} from '../models/response/communication-review/CommunicationReviewCriteriaListResponseModel';
import {CommunicationReviewHistoryResponseModel} from '../models/response/communication-review/CommunicationReviewHistoryResponseModel';
import {CommunicationReviewLookupsResponseModel} from '../models/response/communication-review/CommunicationReviewLookupsResponseModel';


const API_GATEWAY_URL = AppConfiguration.Setting().REACT_APP_MLAB_GATEWAY_URL;
const API_CALLBACK_URL = AppConfiguration.Setting().REACT_APP_MLAB_CALLBACK_URL;
const GET_CUSTOMER_CASE: string = `${API_GATEWAY_URL}CaseManagement/GetCustomerCaseById`;
const GET_CUSTOMER_CASE_COMM_LIST: string = `${API_GATEWAY_URL}CaseManagement/GetCustomerCaseCommList`;
const GET_CASE_COMMUNICATION_INFO: string = `${API_GATEWAY_URL}CaseManagement/GetCaseCommunicationById`;

export async function GetCustomerCaseAsync(customerCaseId: number, userId: number) {
	return axios.get(GET_CUSTOMER_CASE, {
		params: {
			customerCaseId: customerCaseId,
			userId: userId,
		},
	});
}

export async function GetCustomerCaseCommListAsync(request: CustomerCaseCommListRequestModel) {
	return axios.post(GET_CUSTOMER_CASE_COMM_LIST, request);
}

export async function GetCaseCommunicationInfoAsync(communicationId: any, userId: number) {
	return axios.get(GET_CASE_COMMUNICATION_INFO, {
		params: {
			communicationId: communicationId,
			userId: userId,
		},
	});
}

const GET_CASE_COMMUNICATION_LIST: string = `${API_GATEWAY_URL}CaseCommunication/GetCaseCommunicationList`;
const GET_CASE_COMMUNICATION_LIST_RESPONSE: string = `${API_CALLBACK_URL}CaseCommunication/GetCaseCommunicationList`;

export async function getCaseCommunicationList(request: CaseCommunicationFilterModel) {
	return axios.post(GET_CASE_COMMUNICATION_LIST, request);
}

export async function getCaseCommunicationListResult(request: string) {
	return axios.get<string>(GET_CASE_COMMUNICATION_LIST_RESPONSE, {
		params: {
			cachedId: request,
		},
	});
}

// Annotation
const GET_CASECOMM_ANNOTATION_BY_CASECOMM_ID: string = `${API_GATEWAY_URL}CaseManagement/GetCaseCommunicationAnnotationByCaseCommunicationId`;
export async function getCaseCommAnnotationByCaseCommId(caseCommunicationId: number) {
	return axios.get<Array<CaseCommunicationAnnotationModel>>(GET_CASECOMM_ANNOTATION_BY_CASECOMM_ID, {
		params: {
			caseCommunicationId: caseCommunicationId,
		},
	});
}

const UPSERT_CASE_COMM_ANNOTATION: string = `${API_GATEWAY_URL}CaseManagement/UpsertCaseCommunicationAnnotation`;
export async function upsertCaseCommunicationAnnotation(request: CaseCommunicationAnnotationRequestModel) {
	return axios.post(UPSERT_CASE_COMM_ANNOTATION, request);
}

const VALIDATE_CASE_COMM_ANNOTATION: string = `${API_GATEWAY_URL}CaseManagement/ValidateCaseCommunicationAnnotation`;
export async function validateCaseCommunicationAnnotation(request: ValidateCaseCommunicationAnnotationRequestModel) {
	return axios.get(VALIDATE_CASE_COMM_ANNOTATION, {
		params: {
			caseCommunicationId: request.caseCommunicationId,
			contentBefore: request.contentBefore,
			contentAfter: request.contentAfter,
		},
	});
}

// Case Communication Review History
const GET_COMMUNICATION_REVIEW_HISTORY_LIST: string = `${API_GATEWAY_URL}CaseManagement/GetCommunicationReviewHistoryList`;
const GET_COMMUNICATION_REVIEW_HISTORY_LIST_RESPONSE: string = `${API_CALLBACK_URL}CaseManagement/GetCommunicationReviewHistoryList`;

export async function getCommunicationReviewHistoryList(request: CommunicationReviewHistoryRequestModel) {
	return axios.post(GET_COMMUNICATION_REVIEW_HISTORY_LIST, request);
}

export async function getCommunicationReviewHistoryListResult(request: string) {
	return axios.get<Array<CommunicationReviewHistoryResponseModel>>(GET_COMMUNICATION_REVIEW_HISTORY_LIST_RESPONSE, {
		params: {
			cachedId: request,
		},
	});
}
//

const GET_COMMUNICATION_OWNER_LIST: string = `${API_GATEWAY_URL}CaseCommunication/GetAllCommunicationOwner`;

export async function GetCommunicationOwner() {
	return await axios.get<Array<CaseCommunicationOwnerList>>(GET_COMMUNICATION_OWNER_LIST);
}
const EXPORT_CASE_COMM_TO_CSV: string = `${API_GATEWAY_URL}CaseCommunication/ExportCaseCommToCsv`;
export async function ExportCaseCommToCsv(request: CaseCommunicationFilterModel) {
	return axios.post(EXPORT_CASE_COMM_TO_CSV, request, {
		responseType: 'blob',
	});
}

const GET_TOPICNAME_BYCODE: string = `${API_GATEWAY_URL}AgentSurveyWidget/GetTopicNameByCode`;
export async function GetTopicNameByCode(languageCode: string, currencyCode: string) {
	return axios.get<Array<TopicLanguageOptionModelResponse>>(GET_TOPICNAME_BYCODE, {
		params: {
			LanguageCode: languageCode,
			CurrencyCode: currencyCode,
		},
	});
}

const GET_SUBTOPICNAME_BYID: string = `${API_GATEWAY_URL}AgentSurveyWidget/GetSubtopicnameById`;
export async function GetSubtopicLanguageNameById(topicLanguageId: number, currencyCode: string, languageId: number) {
	return axios.get<Array<SubtopicLanguageOptionModelResponse>>(GET_SUBTOPICNAME_BYID, {
		params: {
			TopicLanguageId: topicLanguageId,
			CurrencyCode: currencyCode,
			LanguageId: languageId,
		},
	});
}

const GET_PLAYERS_BY_PLAYERID: string = `${API_GATEWAY_URL}CaseManagement/GetPlayersByPlayerId`;
const GET_PLAYERS_BY_USERNAME: string = `${API_GATEWAY_URL}CaseManagement/GetPlayersByUsername`;

export async function GetPlayersByPlayerId(playerId: string, brand: number, userId: number) {
	return axios.get(GET_PLAYERS_BY_PLAYERID, {
		params: {
			playerId: playerId,
			brandId: brand,
			userId: userId,
		},
	});
}

export async function GetPlayersByUsername(username: string, brand: number, userId: number) {
	return axios.get(GET_PLAYERS_BY_USERNAME, {
		params: {
			username: username,
			brandId: brand,
			userId: userId,
		},
	});
}

const VALIDATE_PLAYER_CASE_COMMUNICATION: string = `${API_GATEWAY_URL}CaseManagement/ValidatePlayerCaseCommunication`;
export async function ValidatePlayerCaseCommunication(mlabPlayerId: number) {
	return axios.get(VALIDATE_PLAYER_CASE_COMMUNICATION, {
		params: {
			mlabPlayerId: mlabPlayerId,
		},
	});
}

const UPSERT_CUSTOMER_SERVICE_CASE_COMMUNICATION: string = `${API_GATEWAY_URL}CaseManagement/UpSertCustomerServiceCaseCommunication`;
export async function UpSertCustomerServiceCaseCommunication(request: UpSertCustomerServiceCaseCommunicationRequestModel) {
	return axios.post<UpsertCaseResponse>(UPSERT_CUSTOMER_SERVICE_CASE_COMMUNICATION, request);
}

const GET_CUSTOMER_SERVICE_CASE_INFORMATION_BY_ID: string = `${API_GATEWAY_URL}CaseManagement/GetCustomerServiceCaseInformationById`;
export async function GetCustomerServiceCaseInformationById(caseId: number, userId: number) {
	return axios.get<CustomerServiceCaseInformationResponseModel>(GET_CUSTOMER_SERVICE_CASE_INFORMATION_BY_ID, {
		params: {
			caseInformationId: caseId,
			userId: userId,
		},
	});
}

const CHANGE_CUSTOMER_SERVICE_CASE_STATUS: string = `${API_GATEWAY_URL}CaseManagement/ChangeCustomerServiceCaseCommStatus`;
export async function changeCustomerServiceCaseCommStatus(request: any) {
	return axios.post(CHANGE_CUSTOMER_SERVICE_CASE_STATUS, request);
}

const CHANGE_CUSTOMER_SERVICE_CASE_STATUS_RESULT: string = `${API_CALLBACK_URL}CaseCommunication/ChangeCustomerServiceCaseCommStatus`;
export async function changeCustomerServiceCaseCommStatusResult(request: string) {
	return axios.get<string>(CHANGE_CUSTOMER_SERVICE_CASE_STATUS_RESULT, {
		params: {
			cachedId: request,
		},
	});
}

const REQUEST_GET_CASE_CAMPAIGN_BY_ID: string = `${API_GATEWAY_URL}CaseManagement/GetCaseManagementPCSQuestionsByFilter`;
export async function getCaseManagementPCSQuestionsByFilter(request: PCSQuestionaireListByFilterRequestModel) {
	return axios.post<Array<PCSQuestionaireListByFilterResponseModel>>(REQUEST_GET_CASE_CAMPAIGN_BY_ID, request);
}

const GET_PCS_COMMUNICATION_SUMMARY_ACTION: string = `${API_GATEWAY_URL}system/GetPCSCommunicationSummaryAction`;
export async function sendGetPCSCommunicationSummaryAction() {
	return axios.get<Array<PCSCommunicationSummaryActionResponseModel>>(GET_PCS_COMMUNICATION_SUMMARY_ACTION);
}

const GET_CASE_MANAGEMENT_PCS_COMMUNICATION_BY_FILTER: string = `${API_GATEWAY_URL}CaseManagement/GetCaseManagementPCSCommunicationByFilter`;
export async function getCaseManagementPCSCommunicationByFilter(request: PCSQuestionaireListByFilterRequestModel) {
	return axios.post<CaseManagementPCSCommunicationByFilterResponseModel>(GET_CASE_MANAGEMENT_PCS_COMMUNICATION_BY_FILTER, request);
}

const REQUEST_EXPORT_TO_CSV_PCS: string = `${API_GATEWAY_URL}CaseManagement/GetPCSQuestionaireListCsv`;
export async function getPCSQuestionaireListCsv(request: PCSQuestionaireListByFilterRequestModel) {
	return await axios.post(REQUEST_EXPORT_TO_CSV_PCS, request, {
		responseType: 'blob',
	});
}
// -----------------------------------------------------------------
// GET COMMUNICATION SURVEY LIST OF QUESTIONS AND ANSWERS
// -----------------------------------------------------------------
const GET_COMMUNICATION_SURVEY_TEMPLATE_BY_ID: string = `${API_GATEWAY_URL}CaseManagement/GetCustomerCaseCommSurveyTemplateById`;
export async function GetCustomerCaseCommSurveyTemplateById(surveyTemplateId: number) {
	return axios.get<SurveyTemplateResponse>(GET_COMMUNICATION_SURVEY_TEMPLATE_BY_ID, {
		params: {
			surveyTemplateId: surveyTemplateId,
		},
	});
}

const GET_CASE_COMMUNICATION_FEEDBACK: string = `${API_GATEWAY_URL}CaseManagement/GetCaseCommunicationFeedbackById`;
export async function GetCaseCommunicationFeedbackAsync(communicationId: any) {
	return axios.get(GET_CASE_COMMUNICATION_FEEDBACK, {
		params: {
			communicationId: communicationId,
		},
	});
}

const GET_CASE_COMMUNICATION_SURVEY: string = `${API_GATEWAY_URL}CaseManagement/GetCaseCommunicationSurveyById`;
export async function GetCaseCommunicationSurveyAsync(communicationId: any) {
	return axios.get(GET_CASE_COMMUNICATION_SURVEY, {
		params: {
			communicationId: communicationId,
		},
	});
}

const GET_CUSTOMER_CASE_SURVEY_TEMPLATE: string = `${API_GATEWAY_URL}CaseManagement/GetCustomerCaseSurveyTemplate`;
export function getCustomerCaseSurveyTemplate(caseTypeId: number) {
	return axios.get<Array<LookupModel>>(GET_CUSTOMER_CASE_SURVEY_TEMPLATE, {
		params: {
			caseTypeId: caseTypeId,
		},
	});
}

const GET_PCS_COMMUNICATION_QUESTIONS_BY_ID: string = `${API_GATEWAY_URL}CaseManagement/GetPCSCommunicationQuestionsById`;
export function getPCSCommunicationQuestionsById(_caseCommunicationId: number) {
	return axios.get<Array<PCSCommunicationQuestionsResponseModel>>(GET_PCS_COMMUNICATION_QUESTIONS_BY_ID, {
		params: {
			caseCommunicationId: _caseCommunicationId,
		},
	});
}

const UPSERT_CHAT_SURVEY_SUMMARY_ACTION: string = `${API_GATEWAY_URL}CaseManagement/UpsertChatSurveyActionAndSummary`;
export async function UpsertChatSurveyActionAndSummary(request: UpsertChatSurveyActionAndSummaryRequestModel) {
	return axios.post(UPSERT_CHAT_SURVEY_SUMMARY_ACTION, request);
}

const GET_CHAT_SURVEY_SUMMARY_ACTION_BY_CHATSURVEYID: string = `${API_GATEWAY_URL}CaseManagement/GetChatSurveyById`;
const GET_CHAT_SURVEY_SUMMARY_ACTION_BY_CHATSURVEYID_RESPONSE: string = `${API_CALLBACK_URL}CaseManagement/GetChatSurveyById`;

export async function GetChatSurveyByIdAsync(request: ChatSurveyActionAndSummaryGetByIdRequestModel) {
	return axios.post(GET_CHAT_SURVEY_SUMMARY_ACTION_BY_CHATSURVEYID, request);
}

export async function GetChatSurveyByIdResultAsync(request: string) {
	return axios.get<string>(GET_CHAT_SURVEY_SUMMARY_ACTION_BY_CHATSURVEYID_RESPONSE, {
		params: {
			cachedId: request,
		},
	});
}

const FlY_FONE_OUTBOUND_CALL: string = `${API_GATEWAY_URL}CaseManagement/FlyFoneOutboundCall`;
export async function flyFoneOutboundCall(request: FlyFoneOutboundCallRequestModel) {
	return axios.post(FlY_FONE_OUTBOUND_CALL, request);
}

const FlY_FONE_CALL_RECORDS: string = `${API_GATEWAY_URL}CaseManagement/GetFlyFoneCallDetailRecords`;
export async function getFlyFoneCallDetailRecords() {
	return axios.get<Array<FlyFoneCallDetailRecordResponseModel>>(FlY_FONE_CALL_RECORDS);
}

const FLY_FONE_END_OUTBOUND_CALL: string = `${API_GATEWAY_URL}CaseManagement/FlyFoneEndOutboundCall`;
export async function flyFoneEndOutboundCall(request: FlyFoneCallDetailRecordRequestModel) {
	return axios.post<FormattedFlyFoneCdrUdt>(FLY_FONE_END_OUTBOUND_CALL, request);
}

const FLY_FONE_FETCH_DETAIL_RECORDS: string = `${API_GATEWAY_URL}CaseManagement/FlyFoneFetchDetailRecords`;
export async function flyFoneFetchDetailRecords(request: FlyFoneFetchCallDetailRecordRequestModel) {
	return axios.post(FLY_FONE_FETCH_DETAIL_RECORDS, request);
}

const CLOUD_TALK_MAKE_A_CALL: string = `${API_GATEWAY_URL}CaseManagement/CloudTalkMakeACall`;
export async function cloudTalkMakeACall(request: CloudTalkMakeACallRequestModel) {
	return axios.post<CloudTalkMakeACallWithApiResponseModel>(CLOUD_TALK_MAKE_A_CALL, request);
}

const ClOUDTALK_GET_CALL: string = `${API_GATEWAY_URL}CaseManagement/CloudTalkGetCall`;
export async function cloudTalkGetCall(request: CloudTalkGetCallRequestModel) {
	return axios.post<CloudTalkCdrResponseModel>(ClOUDTALK_GET_CALL, request);
}

//#region Communication Review
const GET_COMMUNICATION_REVIEW_LOOKUPS: string = `${API_GATEWAY_URL}CaseManagement/GetCommunicationReviewLookups`;
export async function GetCommunicationReviewLookups() {
	return axios.get<CommunicationReviewLookupsResponseModel>(GET_COMMUNICATION_REVIEW_LOOKUPS);
}

const VALIDATE_COMMUNICATION_REVIEW_LIMIT: string = `${API_GATEWAY_URL}CaseManagement/ValidateCommunicationReviewLimit`;
export async function ValidateCommunicationReviewLimit(request: CommunicationReviewLimitRequestModel) {
	return axios.post(VALIDATE_COMMUNICATION_REVIEW_LIMIT, request);
}

const INSERT_COMMUNICATION_REVIEW_EVENTLOG: string = `${API_GATEWAY_URL}CaseManagement/InsertCommunicationReviewEventLog`;
export async function InsertCommunicationReviewEventLog(request: CommunicationReviewEventLogRequestModel) {
	return axios.post(INSERT_COMMUNICATION_REVIEW_EVENTLOG, request);
}

const SAVE_COMMUNICATION_REVIEW: string = `${API_GATEWAY_URL}CaseManagement/SaveCommunicationReview`;
export async function SaveCommunicationReview(request: SaveCommunicationReviewRequestModel) {
	return axios.post(SAVE_COMMUNICATION_REVIEW, request);
}
const GET_COMMUNICATION_REVIEW_BY_ID: string = `${API_GATEWAY_URL}CaseManagement/GetCommunicationHistoryByReviewId`;
export function getCommunicationReviewById(request: any) {
	return axios.post(GET_COMMUNICATION_REVIEW_BY_ID, request);
}

const GET_COMMUNICATION_REVIEW_BY_ID_RESPONSE: string = `${API_CALLBACK_URL}CaseManagement/GetCommunicationHistoryByReviewId`;
export function getCommunicationReviewByIdResult(request: string) {
	return axios.get<CaseCommunicationReviewResponseModel>(GET_COMMUNICATION_REVIEW_BY_ID_RESPONSE, {
		params: {
			cachedId: request,
		},
	});
}
const GET_CRITERIA_LIST_BY_MEASUREMENT_ID: string = `${API_GATEWAY_URL}CaseManagement/GetCriteriaListByMeasurementId`;
export async function getCriteriaListByMeasurementId(measurementId: number | null) {
	return await axios.get<Array<CommunicationReviewCriteriaListResponseModel>>(GET_CRITERIA_LIST_BY_MEASUREMENT_ID, {
		params: {
			measurementId: measurementId,
		},
	});
}
const GET_COMM_EVENT_LOG: string = `${API_GATEWAY_URL}CaseManagement/GetCommunicationReviewEventLog`;
export async function getCommunicationReviewEventLogByCommId(caseCommunicationId: number) {
	return await axios.get<Array<CommunicationReviewEventLogRequestModel>>(GET_COMM_EVENT_LOG, {
		params: {
			caseCommunicationId: caseCommunicationId,
		},
	});
}

const UPDATE_REVIEW_HISTORY_TAG: string = `${API_GATEWAY_URL}CaseManagement/UpdateCommReviewPrimaryTagging`;
export async function updateCommReviewPrimaryTagging(request: CommunicationReviewTaggingRequestModel) {
	return axios.post(UPDATE_REVIEW_HISTORY_TAG, request);
}

const REMOVE_REVIEW_HISTORY_TAG: string = `${API_GATEWAY_URL}CaseManagement/RemoveCommReviewPrimaryTagging`;
export async function removeCommReviewPrimaryTagging(request: CommunicationReviewTaggingRequestModel) {
	return axios.post(REMOVE_REVIEW_HISTORY_TAG, request);
}
//#endregion

//#region Samespace VoIP Integration
const SAME_SPACE_MAKE_A_CALL: string = `${API_GATEWAY_URL}CaseManagement/SamespaceMakeACall`;
export async function samespaceMakeACall(request: SamespaceMakeACallRequestModel) {
	return axios.post<SamespaceMakeACallWithApiResponseModel>(SAME_SPACE_MAKE_A_CALL, request);
}

const SAMESPACE_GET_CALL: string = `${API_GATEWAY_URL}CaseManagement/SamespaceGetCall`;
export async function samespaceGetCall(request: SamespaceGetCallRequestModel) {
	return axios.post<SamespaceGetCallResponseModel>(SAMESPACE_GET_CALL, request);
}
//#endregion
const UPLOAD_FILE: string = `${API_GATEWAY_URL}Upload/UploadImage`;
export async function uploadFile(formData: FormData) {
	return axios.post(UPLOAD_FILE, formData);
}

const GET_ALL_ACTIVE_CAMPAIGN_BY_USERNAME: string = `${API_GATEWAY_URL}AgentSurveyWidget/GetAllActiveCampaignByUsername?platform=Mlab`;
export async function GetAllActiveCampaignByUsername(username: string) {
	return await axios.get<Array<LookupModel>>(GET_ALL_ACTIVE_CAMPAIGN_BY_USERNAME, {
		params: {
			username: username,
		},
	});
}

const GET_EDITCASE_CAMPAIGN_BY_USERNAME: string = `${API_GATEWAY_URL}CaseManagement/GetEditCustomerServiceCaseCampainNameByUsername`;
export async function GetEditCustomerServiceCaseCampainNameByUsername(username: string, brandId: number) {
	return await axios.get<Array<LookupModel>>(GET_EDITCASE_CAMPAIGN_BY_USERNAME, {
		params: {
			username: username,
			brandId: brandId
		},
	});
}


const GET_CHATSTATISTICDETAILS_BY_COMM_ID: string = `${API_GATEWAY_URL}CaseManagement/GetChatStatisticsByCommunicationId`;
export async function getChatStatisticsByCommunicationId(communicationId: number) {
	return axios.get<any>(GET_CHATSTATISTICDETAILS_BY_COMM_ID, {
		params: {
			communicationId: communicationId
		}
	});
}


import axios from 'axios';
import {AppConfiguration} from 'read-appsettings-json';
import {OptionListModel} from '../../../common/model';
import {LookupModel} from '../../../shared-models/LookupModel';
import {
	AddFeedbackAnswerRequestModel,
	AddFeedbackCategoryRequestModel,
	AddFeedbackTypeRequestModel,
	AddMessageListRequest,
	AddMessageStatusRequest,
	AddSkillRequestModel,
	AddTopicRequestModel,
	AllTopicModel,
	CaseTypeModel,
	CodeListIdResponseModel,
	CodeListInfoModel,
	CodeListModel,
	CodeListTypeModel,
	FeedbackAnswerFilterModel,
	FeedbackAnswerModel,
	FeedbackCategoryModel,
	FeedbackTypeModel,
	FeedBackTypeResponse,
	FieldTypeModel,
	GetCodeListByIdRequest,
	GetMessageStatusListRequest,
	GetMessageStatusListResponse,
	GetMesssageStatusByIdRequest,
	GetSubtopicById,
	GetSubtopicOrderUdtViewModel,
	GetSurveyQuestionByIdRequestModel,
	GetTopicByIdResponseModel,
	MarketingChannelListResponseModel,
	MessageTypeListRequest,
	MessageTypeListResponse,
	PaymentGroupListResponseModel,
	PCSCommunicationProviderOptionResponseModel,
	PlayerConfigCodeListValidatorRequestModel,
	PlayerConfigurationModel,
	PostChatSurveyFilterRequestModel,
	PostChatSurveyResponseModel,
	PostChatSurveyToggleRequestModel,
	RequestModel,
	RiskLevelModel,
	SaveSurveyQuestionRequestModel,
	SkillFilterRequestModel,
	SkillFilterResponseModel,
	SkillToggleRequestModel,
	SubmitSubtopicRequestModel,
	SubtopicByIdResponseModel,
	SubtopicNewRequestModel,
	SubtopicRequestModel,
	SurveyQuestionModel,
	SurveyTemplateModel,
	TopicRequestModel,
	UpdateSubtopicOrderRequestModel,
	UpdateTopicOrderRequestModel,
	UpSertTopicRequestModel,
	ValidateSubtopicNameRequestModel,
	VIPLevelModel,
} from '../models';
import {BrandInfoModel} from '../models/BrandInfoModel';
import {CountryListModel} from '../models/CountryListModel';
import {CountryModel} from '../models/CountryModel';
import {CurrencyModel} from '../models/CurrencyModel';
import {LanguageListModel} from '../models/LanguageListModel';
import {LanguageModel} from '../models/LanguageModel';
import {OperatorInfoModel} from '../models/OperatorInfoModel';
import {OperatorModel} from '../models/OperatorModel';
import {PaymentMethodFilterRequestModel} from '../models/PaymentMethodFilterRequestModel';
import {PlayerConfigurationFilterRequestModel} from '../models/PlayerConfigurationFilterRequestModel';
import {PlayerConfigValidatorRequestModel} from '../models/PlayerConfigValidatorRequestModel';
import {PlayerStatusListModel} from '../models/PlayerStatusListModel';
import {PortalListModel} from '../models/PortalListModel';
import {FeedbackCategoryFilterModel} from '../models/requests/FeedbackCategoryFilterModel';
import {FeedbackTypeByIdRequest} from '../models/requests/FeedbackTypeByIdRequest';
import {FeedbackTypeFilterModel} from '../models/requests/FeedbackTypeFilterModel';
import {GetMessageResponseList} from '../models/requests/GetMessageResponseList';
import {GetPlayerConfigurationByIdRequestModel} from '../models/requests/GetPlayerConfigurationByIdRequestModel';
import {GetSurveyTemplateByIdRequestModel} from '../models/requests/GetSurveyTemplateByIdRequestModel';
import {MesssageResponseById} from '../models/requests/MesssageResponseById';
import {PostChatSurveyIdRequestModel} from '../models/requests/PostChatSurveyIdRequestModel';
import {PostChatSurveyRequestModel} from '../models/requests/PostChatSurveyRequestModel';
import {SubmitAddMessageResponse} from '../models/requests/SubmitAddMessageResponse';
import {ValidateCommunicationProviderRequestModel} from '../models/requests/ValidateCommunicationProviderRequestModel';
import {ValidatePaymentMethodNameRequestModel} from '../models/requests/ValidatePaymentMethodNameRequestModel';
import {ValidatePostChatSurveyQuestionIDModel} from '../models/requests/ValidatePostChatSurveyQuestionIDModel';
import {ValidateSkillRequestModel} from '../models/requests/ValidateSkillRequestModel';
import {MessageResponseList} from '../models/response/MessageResponseList';
import {PaymentMethodListResponseModel} from '../models/response/PaymentMethodListResponseModel';
import {PostChatSurveyFilterResponseModel} from '../models/response/PostChatSurveyFilterResponseModel';
import {PostChatSurveyLookupsResponseModel} from '../models/response/PostChatSurveyLookupsResponseModel';
import {SubtopicListResponseModel} from '../models/response/SubtopicListResponseModel';
import {TopicResponseListModel} from '../models/response/TopicResponseListModel';
import {ResponseModel} from '../models/ResponseModel';
import {SurveyTemplateRequestModel} from '../models/SurveyTemplateRequestModel';
import {TicketFieldsModel} from '../models/TicketFieldsModels';
import {GetTopicByIdRequestModel} from '../models/topic/request/GetTopicByIdRequestModel';
import {UpdateTopicStatusRequestModel} from '../models/topic/request/UpdateTopicStatusRequestModel';
import {GetTopicOrderResponseModel} from '../models/topic/response/GetTopicOrderResponseModel';
import {UpsertPaymentMethodRequestModel} from '../models/UpsertPaymentMethodRequestModel';
import {UpsertPlayerConfigTypeRequestModel} from '../models/UpsertPlayerConfigTypeRequestModel';
import {UpsertTicketFieldsRequestModel} from '../models/UpsertTicketFieldsRequestModel';
import {CurrencyListResponseModel} from './../models/response/CurrencyListResponseModel';
import {RiskLevelListResponseModel} from './../models/response/RiskLevelListResponseModel';
import {VIPLevelListResponseModel} from './../models/response/VipLevelListResponseModel';
import {UpdateUserStatusOnlineModel} from '../models/UpdateUserOnlineStatusModel';
import {GetAppConfigSettingByApplicationIdResponseModel} from '../models/response/GetAppConfigSettingByApplicationIdResponseModel';
import { StaffPerformaneSettingResponseModel } from '../models/staffperformance/response/StaffPerformanceSettingResponseModel';
import { StaffPerformanceRequestModel } from '../models/staffperformance/request/StaffPerformanceRequestModel';
import { ReviewPeriodListRequestModel } from '../models/staffperformance/request/ReviewPeriodListRequestModel';

const API_GATEWAY_URL: string = AppConfiguration.Setting().REACT_APP_MLAB_GATEWAY_URL!;
const API_CALLBACK_URL = AppConfiguration.Setting().REACT_APP_MLAB_CALLBACK_URL;

const GET_OPERATOR_LIST: string = `${API_GATEWAY_URL}system/GetOperatorListByFilter`;
const GET_OPERATOR_BY_ID: string = `${API_GATEWAY_URL}system/GetOperatorById`;
const UPDATE_OPERATOR: string = `${API_GATEWAY_URL}system/UpdateOperator`;
const ADD_OPERATOR: string = `${API_GATEWAY_URL}system/AddOperator`;
const GET_ALL_CURRENCY: string = `${API_GATEWAY_URL}system/GetCurrencies`;
const GET_BRAND_EXISTING_LIST: string = `${API_GATEWAY_URL}system/GetBrandExistingList`;
const GET_ALL_BRAND: string = `${API_GATEWAY_URL}system/GetAllBrand`;
const GET_ALL_VIPLEVEL: string = `${API_GATEWAY_URL}system/GetAllVIPLevel`;
const GET_ALL_VIPLEVEL_BY_BRAND: string = `${API_GATEWAY_URL}system/GetAllVIPLevelByBrand`;
const GET_ALL_CASE_TYPE: string = `${API_GATEWAY_URL}system/GetCaseTypeList`;
const GET_ALL_MESSAGE_TYPE: string = `${API_GATEWAY_URL}system/GetMessageType`;
const GET_ALL_OPERATOR: string = `${API_GATEWAY_URL}system/GetAllOperator`;
const GET_OPERATOR_DETAILS: string = `${API_GATEWAY_URL}system/GetOperatorDetails`;
const GET_CODE_LIST: string = `${API_GATEWAY_URL}system/GetAllCodeList`;
const GET_CODE_LIST_RESULT: string = `${API_CALLBACK_URL}system/GetAllCodeList`;
const GET_CODE_LIST_TYPE: string = `${API_GATEWAY_URL}system/GetAllCodelistType`;
const GET_CODE_LIST_TYPE_RESULT: string = `${API_CALLBACK_URL}system/GetAllCodeListType`;
const GET_FIELD_TYPE: string = `${API_GATEWAY_URL}system/GetAllFieldType`;
const GET_FIELD_TYPE_RESULT: string = `${API_CALLBACK_URL}system/GetAllFieldType`;
const ADD_CODE_LIST: string = `${API_GATEWAY_URL}system/AddCodeList`;
const ADD_CODE_LIST_TYPE: string = `${API_GATEWAY_URL}system/AddCodeListType`;
const ADD_CODE_LIST_RESULT: string = `${API_CALLBACK_URL}system/AddCodeList`;
const ADD_CODE_LIST_TYPE_RESULT: string = `${API_CALLBACK_URL}system/AddCodeListType`;
const GET_SURVEY_QUESTION_LIST: string = `${API_GATEWAY_URL}system/GetSurveyQuestionsByFilter`;
const GET_SURVEY_QUESTION_LIST_RESULT: string = `${API_CALLBACK_URL}system/GetSurveyQuestionsByFilter`;
const GET_SURVEY_QUESTION_BY_ID: string = `${API_GATEWAY_URL}system/GetSurveyQuestionById`;
const GET_SURVEY_QUESTION_BY_ID_RESULT: string = `${API_CALLBACK_URL}system/GetSurveyQuestionById`;
const SAVE_SURVEY_QUESTION: string = `${API_GATEWAY_URL}system/SaveSurveyQuestion`;
const SAVE_SURVEY_QUESTION_RESULT: string = `${API_CALLBACK_URL}system/SaveSurveyQuestion`;
const GET_SURVEY_TEMPLATE_LIST: string = `${API_GATEWAY_URL}system/GetSurveyTemplateByFilter`;
const GET_SURVEY_TEMPLATE_LIST_RESULT: string = `${API_CALLBACK_URL}system/GetSurveyTemplateByFilter`;
const SAVE_SURVEY_TEMPLATE: string = `${API_GATEWAY_URL}system/SaveSurveyTemplate`;
const SAVE_SURVEY_TEMPLATE_RESULT: string = `${API_CALLBACK_URL}system/SaveSurveyTemplate`;
const GET_SURVEY_TEMPLATE_BY_ID: string = `${API_GATEWAY_URL}system/GetSurveyTemplateById`;
const GET_SURVEY_TEMPLATE_BY_ID_RESULT: string = `${API_CALLBACK_URL}system/GetSurveyTemplateById`;
const GET_FEEDBACK_TYPE_LIST: string = `${API_GATEWAY_URL}system/GetFeedbackTypeList`;
const GET_FEEDBACK_TYPE_LIST_RESULT: string = `${API_CALLBACK_URL}system/GetFeedbackTypeList`;
const ADD_FEEDBACK_TYPE: string = `${API_GATEWAY_URL}system/AddFeedbackTypeList`;
const ADD_FEEDBACK_TYPE_RESULT: string = `${API_CALLBACK_URL}system/AddFeedbackTypeList`;
const GET_FEEDBACK_CATEGORY_LIST: string = `${API_GATEWAY_URL}system/GetFeedbackCategoryList`;
const GET_FEEDBACK_CATEGORY_LIST_RESULT: string = `${API_CALLBACK_URL}system/GetFeedbackCategoryList`;
const ADD_FEEDBACK_CATEGORY: string = `${API_GATEWAY_URL}system/AddFeedbackCategoryList`;
const ADD_FEEDBACK_CATEGORY_RESULT: string = `${API_CALLBACK_URL}system/AddFeedbackCategoryList`;
const GET_FEEDBACK_ANSWER_LIST: string = `${API_GATEWAY_URL}system/GetFeedbackAnswerList`;
const GET_FEEDBACK_ANSWER_LIST_RESULT: string = `${API_CALLBACK_URL}system/GetFeedbackAnswerList`;
const ADD_FEEDBACK_ANSWER: string = `${API_GATEWAY_URL}system/AddFeedbackAnswerList`;
const ADD_FEEDBACK_ANSWER_RESULT: string = `${API_CALLBACK_URL}system/AddFeedbackAnswerList`;
const REQUEST_ALL_TOPIC_LIST: string = `${API_GATEWAY_URL}system/GetTopicListByFilter`;
const GET_ALL_TOPIC_LIST: string = `${API_CALLBACK_URL}system/GetTopicListByFilter`;
const REQUEST_GET_TOPIC_NAME: string = `${API_GATEWAY_URL}system/GetTopicByName`;
const REQUEST_ADD_TOPIC: string = `${API_GATEWAY_URL}system/AddTopic`;
const GET_ADD_TOPIC_RESULT: string = `${API_CALLBACK_URL}system/AddTopic`;
const REQUEST_CODE_LIST_BY_ID: string = `${API_GATEWAY_URL}system/GetCodeListById`;
const GET_CODE_LIST_BY_ID: string = `${API_CALLBACK_URL}system/GetCodeListById`;

const REQUEST_SUBTOPIC_LIST: string = `${API_GATEWAY_URL}system/GetSubtopicByFilter`;
const GET_SUBTOPIC_LIST: string = `${API_CALLBACK_URL}system/GetSubtopic`;
const REQUEST_VALIDATE_SUBTOPIC_BY_NAME = `${API_GATEWAY_URL}system/ValidateSubtopicName`;
const REQUEST_ADD_SUBTOPIC: string = `${API_GATEWAY_URL}system/SubmitSubtopic`;
const GET_ADD_SUBTOPIC: string = `${API_CALLBACK_URL}system/SubtmitSubtopic`;
const REQUEST_SUBTOPIC_BY_ID: string = `${API_GATEWAY_URL}system/GetSubtopicById`;
const GET_SUBTOPIC_BY_ID: string = `${API_CALLBACK_URL}system/GetSubtopicById`;

const REQUEST_UPSERT_SUBTOPIC: string = `${API_GATEWAY_URL}system/UpsertSubtopic`;

const REQUEST_MESSAGE_TYPE_LIST: string = `${API_GATEWAY_URL}system/GetMessageTypeList`;
const GET_MESSAGE_TYPE_LIST: string = `${API_CALLBACK_URL}system/GetMessageTypeList`;
const REQUEST_GET_MESSAGE_TYPE_NAME: string = `${API_GATEWAY_URL}system/ValidateMessageType`;
const REQUEST_ADD_MESSAGE_TYPE: string = `${API_GATEWAY_URL}system/SaveMessageList`;
const GET_ADD_MESSAGE_TYPE: string = `${API_CALLBACK_URL}system/SaveMessageList`;

const REQUEST_MESSAGE_STATUS_LIST: string = `${API_GATEWAY_URL}system/GetMessageStatusList`;
const GET_MESSAGE_STATUS_LIST: string = `${API_CALLBACK_URL}system/GetMessageStatusList`;

const REQUEST_ADD_MESSAGE_STATUS: string = `${API_GATEWAY_URL}system/SaveMessageStatusList`;
const GET_ADD_MESSAGE_STATUS: string = `${API_CALLBACK_URL}system/SaveMessageStatusList`;

const REQUEST_VALIDATE_MESSAGE_STATUS: string = `${API_GATEWAY_URL}system/ValidateMessageStatus`;

const REQUEST_MESSAGE_STATUS_BY_ID: string = `${API_GATEWAY_URL}system/GetMessageStatusById`;
const GET_MESSAGE_STATUS_BY_ID: string = `${API_CALLBACK_URL}system/GetMessageStatusById`;

const REQUEST_ADD_MESSAGE_RESPONSE: string = `${API_GATEWAY_URL}system/SaveMessageResponseList`;
const GET_ADD_MESSAGE_RESPONSE: string = `${API_CALLBACK_URL}system/SaveMessageResponseList`;

const REQUEST_MESSAGE_RESPONSE_LIST: string = `${API_GATEWAY_URL}system/GetMessageResponseList`;
const GET_MESSAGE_RESPONSE_LIST: string = `${API_CALLBACK_URL}system/GetMessageResponseList`;
const REQUEST_VALIDATE_MESSAGE_RESPONSE: string = `${API_GATEWAY_URL}system/ValidateMessageResponseName`;

const REQUEST_MESSAGE_RESPONSE_BY_ID: string = `${API_GATEWAY_URL}system/GetMesssageResponseById`;
const GET_MESSAGE_RESPONSE_BY_ID: string = `${API_CALLBACK_URL}system/GetMessageResponseById`;

const GET_ALL_TOPIC: string = `${API_GATEWAY_URL}system/GetAllTopic`;

const GET_PLAYER_CONFIGURATION_LIST: string = `${API_GATEWAY_URL}playerconfiguration/GetAllPlayerConfiguration`;
const GET_PLAYER_CONFIGURATION_LIST_RESULT: string = `${API_CALLBACK_URL}system/GetAllPlayerConfiguration`;

const GET_PLAYER_CONFIGURATION_BY_ID: string = `${API_GATEWAY_URL}playerconfiguration/GetPlayerConfigurationById`;
const GET_PLAYER_CONFIGURATION_BY_ID_RESULT: string = `${API_CALLBACK_URL}system/GetPlayerConfigurationById`;
const GET_VIP_LEVEL_LIST: string = `${API_GATEWAY_URL}playerconfiguration/GetVIPLevelByFilter`;
const GET_VIP_LEVEL_LIST_RESULT: string = `${API_CALLBACK_URL}system/GetVIPLevelByFilter`;
const SAVE_VIP_LEVEL: string = `${API_GATEWAY_URL}playerconfiguration/AddVIPLevel`;
const SAVE_VIP_LEVEL_RESULT: string = `${API_CALLBACK_URL}system/AddVIPLevel`;
const UPDATE_VIP_LEVEL: string = `${API_GATEWAY_URL}playerconfiguration/UpdateVIPLevel`;
const UPDATE_VIP_LEVEL_RESULT: string = `${API_CALLBACK_URL}system/UpdateVIPLevel`;
const GET_RISK_LEVEL_LIST: string = `${API_GATEWAY_URL}playerconfiguration/GetRiskLevelByFilter`;
const GET_RISK_LEVEL_LIST_RESULT: string = `${API_CALLBACK_URL}system/GetRiskLevelByFilter`;
const SAVE_RISK_LEVEL: string = `${API_GATEWAY_URL}playerconfiguration/AddRiskLevel`;
const SAVE_RISK_LEVEL_RESULT: string = `${API_CALLBACK_URL}system/AddRiskLevel`;
const UPDATE_RISK_LEVEL: string = `${API_GATEWAY_URL}playerconfiguration/UpdateRiskLevel`;
const UPDATE_RISK_LEVEL_RESULT: string = `${API_CALLBACK_URL}system/UpdateRiskLevel`;

const REQUEST_VALIDATE_FEEDTYPE_BY_NAME: string = `${API_GATEWAY_URL}system/ValidateFeedbackTypeName`;

const REQUEST_FEEDBACKTYPE_BY_ID: string = `${API_GATEWAY_URL}system/GetFeedbackTypeById`;
const GET_FEEDBACKTYPE_BY_ID: string = `${API_CALLBACK_URL}system/GetFeedbackTypeById`;
const DEACTIVATE_SURVEY_QUESTION: string = `${API_GATEWAY_URL}system/DeactivateSurveyQuestion`;
const DEACTIVATE_SURVEY_TEMPLATE: string = `${API_GATEWAY_URL}system/DeactivateSurveyTemplate`;

const GET_SYSTEM_LOOKUPS: string = `${API_GATEWAY_URL}system/GetSystemLookups`;

const GET_PLAYER_CONFIG_LANGUAGE: string = `${API_GATEWAY_URL}playerconfiguration/GetPlayerConfigLanguage`;
const GET_PLAYER_CONFIG_LANGUAGE_RESULT: string = `${API_CALLBACK_URL}system/GetPlayerConfigLanguage`;

const SAVE_PLAYER_CONFIG_CODE_DETAILS: string = `${API_GATEWAY_URL}playerconfiguration/SavePlayerConfigCodeDetails`;
const SAVE_PLAYER_CONFIG_CODE_DETAILS_RESULT: string = `${API_CALLBACK_URL}system/SavePlayerConfigCodeDetails`;

const GET_PLAYER_CONFIG_PLAYERSTATUS: string = `${API_GATEWAY_URL}playerconfiguration/GetPlayerConfigPlayerStatus`;
const GET_PLAYER_CONFIG_PLAYERSTATUS_RESULT: string = `${API_CALLBACK_URL}system/GetPlayerConfigPlayerStatus`;

const GET_PLAYER_CONFIG_PORTAL: string = `${API_GATEWAY_URL}playerconfiguration/GetPlayerConfigPortal`;
const GET_PLAYER_CONFIG_PORTAL_RESULT: string = `${API_CALLBACK_URL}system/GetPlayerConfigPortal`;

const VALIDATE_PLAYER_CONFIG_CODE_DETAILS: string = `${API_GATEWAY_URL}playerconfiguration/CheckExistingIDNameCodeList`;

const GET_PAYMENT_GROUP_LIST: string = `${API_GATEWAY_URL}playerconfiguration/GetPaymentGroupByFilter`;
const GET_PAYMENT_GROUP_LIST_RESULT: string = `${API_CALLBACK_URL}system/GetPaymentGroupByFilter`;

const GET_MARKETING_CHANNEL_LIST: string = `${API_GATEWAY_URL}playerconfiguration/GetMarketingChannelByFilter`;
const GET_MARKETING_CHANNEL_LIST_RESULT: string = `${API_CALLBACK_URL}system/GetMarketingChannelByFilter`;

const GET_CURRENCY_LIST: string = `${API_GATEWAY_URL}playerconfiguration/GetCurrencyByFilter`;
const GET_CURRENCY_LIST_RESULT: string = `${API_CALLBACK_URL}system/GetCurrencyByFilter`;

const GET_CURRENCY_BY_FILTER: string = `${API_GATEWAY_URL}system/GetCurrencyByFilter`;

const VALIDATE_PLAYER_CONFIGURATION_RECORD = `${API_GATEWAY_URL}playerconfiguration/CheckExistingIDNameCodeList`;

const GET_PLAYER_CONFIG_COUNTRY: string = `${API_GATEWAY_URL}playerconfiguration/GetPlayerConfigCountry`;
const GET_PLAYER_CONFIG_COUNTRY_RESULT: string = `${API_CALLBACK_URL}system/GetPlayerConfigCountry`;

const UPSERT_POST_CHAT_SURVEY: string = `${API_GATEWAY_URL}postchatsurvey/UpsertPostChatSurvey`;
const GET_POST_CHAT_SURVEY_BY_ID: string = `${API_GATEWAY_URL}postchatsurvey/GetPostChatSurveyById`;
const GET_POST_CHAT_SURVEY_BY_ID_RESULT: string = `${API_GATEWAY_URL}postchatsurvey/GetPostChatSurveyById`;
const VALIDATE_PCS_QUESTIONID: string = `${API_GATEWAY_URL}postchatsurvey/ValidatePostChatSurveyQuestionID`;

const GET_POST_CHAT_SURVEY_LIST: string = `${API_GATEWAY_URL}postchatsurvey/GetPostChatSurveyByFilter`;
const GET_POST_CHAT_SURVEY_LIST_RESULT: string = `${API_CALLBACK_URL}system/GetPostChatSurveyByFilter`;

const GET_SKILL_LIST: string = `${API_GATEWAY_URL}skillmapping/GetSkillByFilter`;
const GET_SKILL_LIST_RESULT: string = `${API_CALLBACK_URL}system/GetSkillByFilter`;
const REQUEST_UPSERT_SKILL: string = `${API_GATEWAY_URL}skillmapping/UpsertSkill`;
const VALIDATE_SKILL: string = `${API_GATEWAY_URL}skillmapping/ValidateSkill`;

const GET_PCS_LOOKUPS: string = `${API_GATEWAY_URL}postchatsurvey/GetPCSLookups`;
const GET_PCS_SKILLS_BY_LICENSE_ID: string = `${API_GATEWAY_URL}postchatsurvey/GetSkillsByLicenseId`;

const TOGGLE_PCS: string = `${API_GATEWAY_URL}postchatsurvey/TogglePostChatSurvey`;
const TOGGLE_SKILL: string = `${API_GATEWAY_URL}skillmapping/ToggleSkill`;

const GET_CURRENCY_WITH_NULLABLE_RESTRICTION: string = `${API_GATEWAY_URL}system/GetCurrencyWithNullableRestriction`;

const GET_COUNTRY_WITH_ACCESS_RESTRICTION: string = `${API_GATEWAY_URL}system/GetCountryWithAccessRestriction`;

export function getOperatorList(operatorId: number, operatorName: string, brandId: number, brandName: string) {
	return axios.get<Array<OperatorModel>>(GET_OPERATOR_LIST, {
		params: {
			operatorId: operatorId,
			operatorName: operatorName,
			brandId: brandId,
			brandName: brandName,
		},
	});
}

export function getOperatorById(operatorId: number) {
	return axios.get<OperatorModel>(GET_OPERATOR_BY_ID, {
		params: {
			operatorId: operatorId,
		},
	});
}

export function updateOperator(updateOperator: OperatorModel) {
	return axios.post<ResponseModel>(UPDATE_OPERATOR, updateOperator);
}

export function addOperator(createOperator: OperatorModel) {
	return axios.post<ResponseModel>(ADD_OPERATOR, createOperator);
}

export function getAllCurrency(userId?: number) {
	if (typeof userId !== 'undefined') {
		return axios.get<Array<CurrencyModel>>(`${GET_ALL_CURRENCY}/?userId=${userId}`);
	}
	return axios.get<Array<CurrencyModel>>(GET_ALL_CURRENCY);
}

export function getBrandExistingList(brandIds: string, brandNames: string) {
	console.log(GET_BRAND_EXISTING_LIST);
	return axios.get<ResponseModel>(GET_BRAND_EXISTING_LIST.replace('%E2%80%8B', ''), {
		params: {
			brandIds: brandIds,
			brandNames: brandNames,
		},
	});
}

export async function getAllBrand(userId?: number, platformId? : number) {
	return axios.get<BrandInfoModel[]>(GET_ALL_BRAND, {
		params: {
			userId: userId,
			platformId: platformId
		},
	});
}

export async function getAllVIPLevel(userId?: number) {
	if (typeof userId !== 'undefined') {
		return await axios.get<Array<VIPLevelModel>>(`${GET_ALL_VIPLEVEL}/?userId=${userId}`);
	}

	return await axios.get<Array<VIPLevelModel>>(GET_ALL_VIPLEVEL);
}

export async function getAllVIPLevelByBrand(userId?: number, brandId?: string) {
	return await axios.get<Array<VIPLevelModel>>(GET_ALL_VIPLEVEL_BY_BRAND, {
		params: {
			userId: userId,
			brandId: brandId
		}
	});
}

export function getAllCaseType() {
	return axios.get<Array<CaseTypeModel>>(GET_ALL_CASE_TYPE);
}

export function getAllMessageType() {
	return axios.get<Array<MessageTypeListResponse>>(GET_ALL_MESSAGE_TYPE);
}

export function GetAllOperator() {
	return axios.get<Array<OperatorInfoModel>>(GET_ALL_OPERATOR);
}

export function getOperatorDetails(operatorIds: string) {
	return axios.get<OperatorModel>(GET_OPERATOR_DETAILS, {
		params: {
			operatorIds: operatorIds,
		},
	});
}

export async function getCodeList(request: RequestModel) {
	return axios.post(GET_CODE_LIST, request);
}

export async function getCodeListResult(request: string) {
	return axios.get<Array<CodeListModel>>(GET_CODE_LIST_RESULT, {
		params: {
			cachedId: request,
		},
	});
}

export async function getCodeListType(request: RequestModel) {
	return axios.get(GET_CODE_LIST_TYPE);
}

export async function getCodeListTypeResult(request: string) {
	return axios.get<Array<CodeListTypeModel>>(GET_CODE_LIST_TYPE_RESULT, {
		params: {
			cachedId: request,
		},
	});
}

export async function getFieldType() {
	return axios.get(GET_FIELD_TYPE);
}

export async function getFieldTypeResult(request: string) {
	return axios.get<Array<FieldTypeModel>>(GET_FIELD_TYPE_RESULT, {
		params: {
			cachedId: request,
		},
	});
}

export function addCodeList(createCodeList: CodeListInfoModel) {
	return axios.post<ResponseModel>(ADD_CODE_LIST, createCodeList);
}

export function upsertPostChatSurvey(postChatSurvey: PostChatSurveyRequestModel) {
	return axios.post<ResponseModel>(UPSERT_POST_CHAT_SURVEY, postChatSurvey);
}

export function validatePostChatSurveyQuestionID(questionID: string, postChatSurveyID: number, skillId: string) {
	let request: ValidatePostChatSurveyQuestionIDModel = {
		questionId: questionID,
		postChatSurveyId: postChatSurveyID,
		skillId: skillId,
	};

	return axios.post<boolean>(VALIDATE_PCS_QUESTIONID, request);
}

export async function getPostChatSurveyById(request: PostChatSurveyIdRequestModel) {
	return axios.post<PostChatSurveyResponseModel>(GET_POST_CHAT_SURVEY_BY_ID, request);
}

export async function getPostChatSurveyByIdResult(cacheId: string) {
	return axios.get(GET_POST_CHAT_SURVEY_BY_ID_RESULT, {
		params: {
			cachedId: cacheId,
		},
	});
}

export function addCodeListResult(cacheId: string) {
	return axios.get(ADD_CODE_LIST_RESULT, {
		params: {
			cachedId: cacheId,
		},
	});
}

export function addCodeListType(createCodeListType: CodeListTypeModel) {
	return axios.post<ResponseModel>(ADD_CODE_LIST_TYPE, createCodeListType);
}

export function addCodeListTypeResult(cacheId: string) {
	return axios.get(ADD_CODE_LIST_TYPE_RESULT, {
		params: {
			cachedId: cacheId,
		},
	});
}

export async function getSurveyQuestionList(request: RequestModel) {
	return axios.post(GET_SURVEY_QUESTION_LIST, request);
}

export async function getSurveyQuestionListResult(request: string) {
	return axios.get<Array<SurveyQuestionModel>>(GET_SURVEY_QUESTION_LIST_RESULT, {
		params: {
			cachedId: request,
		},
	});
}

export async function saveSurveyQuestion(request: SaveSurveyQuestionRequestModel) {
	return axios.post(SAVE_SURVEY_QUESTION, request);
}

export async function saveSurveyQuestionResult(cacheId: string) {
	return axios.get(SAVE_SURVEY_QUESTION_RESULT, {
		params: {
			cachedId: cacheId,
		},
	});
}

export async function getSurveyTemplateList(request: RequestModel) {
	return axios.post(GET_SURVEY_TEMPLATE_LIST, request);
}

export async function getSurveyTemplateListResult(request: string) {
	return axios.get<Array<SurveyTemplateModel>>(GET_SURVEY_TEMPLATE_LIST_RESULT, {
		params: {
			cachedId: request,
		},
	});
}

export async function saveSurveyTemplate(request: SurveyTemplateRequestModel) {
	return axios.post(SAVE_SURVEY_TEMPLATE, request);
}

export async function saveSurveyTemplateResult(cacheId: string) {
	return axios.get(SAVE_SURVEY_TEMPLATE_RESULT, {
		params: {
			cachedId: cacheId,
		},
	});
}
export async function getFeedbackCategoryList(request: FeedbackCategoryFilterModel) {
	return axios.post(GET_FEEDBACK_CATEGORY_LIST, request);
}

export async function getFeedbackCategoryListResult(request: string) {
	return axios.get<Array<FeedbackCategoryModel>>(GET_FEEDBACK_CATEGORY_LIST_RESULT, {
		params: {
			cachedId: request,
		},
	});
}

export async function getFeedbackAnswerList(request: FeedbackAnswerFilterModel) {
	return axios.post(GET_FEEDBACK_ANSWER_LIST, request);
}

export async function getFeedbackAnswerListResult(request: string) {
	return axios.get<Array<FeedbackAnswerModel>>(GET_FEEDBACK_ANSWER_LIST_RESULT, {
		params: {
			cachedId: request,
		},
	});
}

// -----------------------------------------------------------------
// TOPIC ENDPOINTS
// -----------------------------------------------------------------
export async function sendTopicList(request: TopicRequestModel) {
	return axios.post(REQUEST_ALL_TOPIC_LIST, request);
}

export async function getTopicList(request: string) {
	return axios.get<TopicResponseListModel>(GET_ALL_TOPIC_LIST, {
		params: {
			cachedId: request,
		},
	});
}

export async function sendTopicName(topicName: string, caseTypeId: number) {
	return axios.get<boolean>(REQUEST_GET_TOPIC_NAME, {
		params: {
			topicName: topicName,
			caseTypeId: caseTypeId,
		},
	});
}
export async function sendAddTopic(request: AddTopicRequestModel) {
	return axios.post(REQUEST_ADD_TOPIC, request);
}
export async function getAddTopicResult(request: string) {
	return axios.get<ResponseModel>(GET_ADD_TOPIC_RESULT, {
		params: {
			cachedId: request,
		},
	});
}

const REQUEST_UPSERT_TOPIC: string = `${API_GATEWAY_URL}system/UpSertTopic`;
export async function SendUpSertTopic(request: UpSertTopicRequestModel) {
	return axios.post(REQUEST_UPSERT_TOPIC, request);
}

const REQUEST_GET_TOPIC_BY_ID_TOPIC: string = `${API_GATEWAY_URL}system/GetTopicById`;
export async function SendGetTopicById(request: GetTopicByIdRequestModel) {
	return axios.post(REQUEST_GET_TOPIC_BY_ID_TOPIC, request);
}

const GET_TOPIC_BY_ID_TOPIC: string = `${API_CALLBACK_URL}system/GetTopicById`;
export async function GetTopicById(request: string) {
	return axios.get<GetTopicByIdResponseModel>(GET_TOPIC_BY_ID_TOPIC, {
		params: {
			cachedId: request,
		},
	});
}

const GET_TOPIC_ORDER: string = `${API_GATEWAY_URL}system/GetTopicOrder`;
export async function SendGetTopicOrder() {
	return axios.get<Array<GetTopicOrderResponseModel>>(GET_TOPIC_ORDER);
}

const REQUEST_UPDATE_TOPIC_ORDER: string = `${API_GATEWAY_URL}system/UpdateTopicOrder`;
export async function SendUpdateTopicOrder(request: UpdateTopicOrderRequestModel) {
	return axios.post(REQUEST_UPDATE_TOPIC_ORDER, request);
}

const GET_SUBTOPIC_ORDER: string = `${API_GATEWAY_URL}system/GetSubtopicOrder`;
export async function SendGetSubtopicOrder(topicId: number) {
	return axios.get<Array<GetSubtopicOrderUdtViewModel>>(GET_SUBTOPIC_ORDER, {
		params: {
			topicId: topicId,
		},
	});
}

const REQUEST_UPDATE_SUBTOPIC_ORDER: string = `${API_GATEWAY_URL}system/UpdateSubtopicOrder`;
export async function SendUpdateSubtopicOrder(request: UpdateSubtopicOrderRequestModel) {
	return axios.post(REQUEST_UPDATE_SUBTOPIC_ORDER, request);
}

const REQUEST_UPDATE_TOPIC_STATUS: string = `${API_GATEWAY_URL}system/UpdateTopicStatus`;
export async function SendUpdateTopicStatus(request: UpdateTopicStatusRequestModel) {
	return axios.post(REQUEST_UPDATE_TOPIC_STATUS, request);
}

const GET_TOPIC_OPTIONS_BY_CODE: string = `${API_GATEWAY_URL}system/GetTopicOptionsByCode`;
export async function GetTopicOptionsByCode(languageCode: string, caseTypeId: number) {
	return axios.get<Array<OptionListModel>>(GET_TOPIC_OPTIONS_BY_CODE, {
		params: {
			LanguageCode: languageCode,
			CaseTypeId: caseTypeId,
		},
	});
}

// -----------------------------------------------------------------
// CODELIST ENDPOINTS
// -----------------------------------------------------------------
export async function sendCodeListById(request: GetCodeListByIdRequest) {
	return axios.post(REQUEST_CODE_LIST_BY_ID, request);
}
export async function getCodeListById(request: string) {
	return axios.get<CodeListIdResponseModel>(GET_CODE_LIST_BY_ID, {
		params: {
			cachedId: request,
		},
	});
}
// -----------------------------------------------------------------
// SUBTOPIC ENDPOINTS
// -----------------------------------------------------------------
export async function sendSubtopicListRequest(request: SubtopicRequestModel) {
	return axios.post(REQUEST_SUBTOPIC_LIST, request);
}
export async function getSubtopicListRequest(request: string) {
	return axios.get<SubtopicListResponseModel>(GET_SUBTOPIC_LIST, {
		params: {
			cachedId: request,
		},
	});
}
export async function validatedSubtopicName(request: ValidateSubtopicNameRequestModel) {
	return axios.get<boolean>(REQUEST_VALIDATE_SUBTOPIC_BY_NAME, {
		params: {
			name: request.subtopicName,
			subtopicId: request.subtopicId,
		},
	});
}
export async function sendSubmitSubtopic(request: SubmitSubtopicRequestModel) {
	return axios.post(REQUEST_ADD_SUBTOPIC, request);
}
export async function getAddSubtopicResult(request: string) {
	return axios.get<ResponseModel>(GET_ADD_SUBTOPIC, {
		params: {
			cachedId: request,
		},
	});
}
export async function sendGetSubtopicById(request: GetSubtopicById) {
	return axios.post(REQUEST_SUBTOPIC_BY_ID, request);
}
export async function getSubtopicById(request: string) {
	return axios.get<SubtopicByIdResponseModel>(GET_SUBTOPIC_BY_ID, {
		params: {
			cachedId: request,
		},
	});
}

export async function upsertSubtopic(request: SubtopicNewRequestModel) {
	return axios.post(REQUEST_UPSERT_SUBTOPIC, request);
}

const REQUEST_UPDATE_SUBTOPIC_STATUS: string = `${API_GATEWAY_URL}system/UpdateSubtopicStatus`;
export function updateSubtopicStatus(subTopicId: number, userId: string, isActive: boolean) {
	return axios.get<Array<OperatorModel>>(REQUEST_UPDATE_SUBTOPIC_STATUS, {
		params: {subTopicId: subTopicId, userId: userId, isActive: isActive},
	});
}

const GET_SUBTOPIC_OPTIONS_BY_ID: string = `${API_GATEWAY_URL}system/GetSubtopicOptionsById`;
export async function GetSubtopicOptionsById(topicLanguageId: number) {
	return axios.get<Array<OptionListModel>>(GET_SUBTOPIC_OPTIONS_BY_ID, {
		params: {
			TopicLanguageId: topicLanguageId,
		},
	});
}

// -----------------------------------------------------------------
// MESSAGE TYPE ENDPOINTS
// -----------------------------------------------------------------
export async function sendGetMessageTypeList(request: MessageTypeListRequest) {
	return axios.post(REQUEST_MESSAGE_TYPE_LIST, request);
}
export async function getMessageTypeList(request: string) {
	return axios.get<Array<MessageTypeListResponse>>(GET_MESSAGE_TYPE_LIST, {
		params: {
			cachedId: request,
		},
	});
}
export async function validateMessageTypeName(request: string) {
	return axios.get<ResponseModel>(REQUEST_GET_MESSAGE_TYPE_NAME, {
		params: {
			messageTypeName: request,
		},
	});
}
export async function sendAddMessageList(request: AddMessageListRequest) {
	return axios.post(REQUEST_ADD_MESSAGE_TYPE, request);
}
export async function getAddMessageList(request: string) {
	return axios.get<ResponseModel>(GET_ADD_MESSAGE_TYPE, {
		params: {
			cachedId: request,
		},
	});
}
// -----------------------------------------------------------------
// MESSAGE STATUS ENDPOINTS
// -----------------------------------------------------------------
export async function sendGetMessageStatusList(request: GetMessageStatusListRequest) {
	return axios.post(REQUEST_MESSAGE_STATUS_LIST, request);
}
export async function getMessageStatusList(request: string) {
	return axios.get<Array<GetMessageStatusListResponse>>(GET_MESSAGE_STATUS_LIST, {
		params: {
			cachedId: request,
		},
	});
}
export async function sendAddMessageStatusList(request: AddMessageStatusRequest) {
	return axios.post(REQUEST_ADD_MESSAGE_STATUS, request);
}
export async function getAddMessageStatusList(request: string) {
	return axios.get<ResponseModel>(GET_ADD_MESSAGE_STATUS, {
		params: {
			cachedId: request,
		},
	});
}
export async function validateMessageStatus(request: string) {
	return axios.get<ResponseModel>(REQUEST_VALIDATE_MESSAGE_STATUS, {
		params: {
			messageStatusName: request,
		},
	});
}
export async function sendGetMesssageStatusById(request: GetMesssageStatusByIdRequest) {
	return axios.post(REQUEST_MESSAGE_STATUS_BY_ID, request);
}
export async function getGetMesssageStatusById(request: string) {
	return axios.get<GetMessageStatusListResponse>(GET_MESSAGE_STATUS_BY_ID, {
		params: {
			cachedId: request,
		},
	});
}
// -----------------------------------------------------------------
// MESSAGE RESPONSE ENDPOINTS
// -----------------------------------------------------------------
export async function sendAddMessageResponseList(request: SubmitAddMessageResponse) {
	return axios.post(REQUEST_ADD_MESSAGE_RESPONSE, request);
}
export async function getAddMessageResponseList(request: string) {
	return axios.get<ResponseModel>(GET_ADD_MESSAGE_RESPONSE, {
		params: {
			cachedId: request,
		},
	});
}
export async function sendGetMessageResponseList(request: GetMessageResponseList) {
	return axios.post(REQUEST_MESSAGE_RESPONSE_LIST, request);
}
export async function getMessageResponseList(request: string) {
	return axios.get<Array<MessageResponseList>>(GET_MESSAGE_RESPONSE_LIST, {
		params: {
			cachedId: request,
		},
	});
}
export async function validateMessageResponseName(request: string) {
	return axios.get<ResponseModel>(REQUEST_VALIDATE_MESSAGE_RESPONSE, {
		params: {
			messageResponseName: request,
		},
	});
}
export async function sendGetMesssageResponseById(request: MesssageResponseById) {
	return axios.post(REQUEST_MESSAGE_RESPONSE_BY_ID, request);
}
export async function getMesssageResponseById(request: string) {
	return axios.get<Array<MessageResponseList>>(GET_MESSAGE_RESPONSE_BY_ID, {
		params: {
			cachedId: request,
		},
	});
}
// -----------------------------------------------------------------
// MESSAGE FEEDBACK TYPES ENDPOINTS
// -----------------------------------------------------------------
export async function addFeedbackTypeList(request: AddFeedbackTypeRequestModel) {
	return axios.post(ADD_FEEDBACK_TYPE, request);
}
export async function addFeedbackTypeListResult(request: string) {
	return axios.get<ResponseModel>(ADD_FEEDBACK_TYPE_RESULT, {
		params: {
			cachedId: request,
		},
	});
}
export async function validateFeedbackTypeName(request: string) {
	return axios.get<ResponseModel>(REQUEST_VALIDATE_FEEDTYPE_BY_NAME, {
		params: {
			feedbackTypeName: request,
		},
	});
}
export async function getFeedbackTypeList(request: FeedbackTypeFilterModel) {
	return axios.post(GET_FEEDBACK_TYPE_LIST, request);
}

export async function getFeedbackTypeListResult(request: string) {
	return axios.get<Array<FeedbackTypeModel>>(GET_FEEDBACK_TYPE_LIST_RESULT, {
		params: {
			cachedId: request,
		},
	});
}
export async function sendFeedbackTypeById(request: FeedbackTypeByIdRequest) {
	return axios.post(REQUEST_FEEDBACKTYPE_BY_ID, request);
}
export async function getFeedbackTypeById(request: string) {
	return axios.get<Array<FeedBackTypeResponse>>(GET_FEEDBACKTYPE_BY_ID, {
		params: {
			cachedId: request,
		},
	});
}
// -----------------------------------------------------------------
// MESSAGE FEEDBACK CATEGORIES ENDPOINTS
// -----------------------------------------------------------------
export async function addFeedbackCategoryList(request: AddFeedbackCategoryRequestModel) {
	return axios.post(ADD_FEEDBACK_CATEGORY, request);
}
export async function addFeedbackCategoryListResult(request: string) {
	return axios.get<ResponseModel>(ADD_FEEDBACK_CATEGORY_RESULT, {
		params: {
			cachedId: request,
		},
	});
}

export async function addFeedbackAnswerList(request: AddFeedbackAnswerRequestModel) {
	return axios.post(ADD_FEEDBACK_ANSWER, request);
}

export async function addFeedbackAnswerListResult(request: string) {
	return axios.get<ResponseModel>(ADD_FEEDBACK_ANSWER_RESULT, {
		params: {
			cachedId: request,
		},
	});
}

export async function getPlayerConfigurationList(request: RequestModel) {
	return axios.post(GET_PLAYER_CONFIGURATION_LIST, request);
}

export async function getPlayerConfigurationListResult(request: string) {
	return axios.get<Array<SurveyQuestionModel>>(GET_PLAYER_CONFIGURATION_LIST_RESULT, {
		params: {
			cachedId: request,
		},
	});
}

export async function getPlayerConfigurationById(request: GetPlayerConfigurationByIdRequestModel) {
	return await axios.post(GET_PLAYER_CONFIGURATION_BY_ID, request);
}

export async function getPlayerConfigurationByIdResult(request: string) {
	return await axios.get<PlayerConfigurationModel>(GET_PLAYER_CONFIGURATION_BY_ID_RESULT, {
		params: {
			cachedId: request,
		},
	});
}

export function getAllTopic() {
	return axios.get<Array<AllTopicModel>>(GET_ALL_TOPIC);
}

export async function getSurveyQuestionById(request: GetSurveyQuestionByIdRequestModel) {
	return axios.post(GET_SURVEY_QUESTION_BY_ID, request);
}

export async function getSurveyQuestionByIdResult(request: string) {
	return axios.get<SurveyQuestionModel>(GET_SURVEY_QUESTION_BY_ID_RESULT, {
		params: {
			cachedId: request,
		},
	});
}

export async function getSurveyTemplateById(request: GetSurveyTemplateByIdRequestModel) {
	return axios.post(GET_SURVEY_TEMPLATE_BY_ID, request);
}

export async function getSurveyTemplateByIdResult(request: string) {
	return axios.get<SurveyQuestionModel>(GET_SURVEY_TEMPLATE_BY_ID_RESULT, {
		params: {
			cachedId: request,
		},
	});
}

export async function getVIPLevelList(request: PlayerConfigurationFilterRequestModel) {
	return await axios.post(GET_VIP_LEVEL_LIST, request);
}

export async function getVIPLevelListResult(request: string) {
	return await axios.get<VIPLevelListResponseModel>(GET_VIP_LEVEL_LIST_RESULT, {
		params: {
			cachedId: request,
		},
	});
}

export async function saveVIPLevel(request: VIPLevelModel) {
	return axios.post(SAVE_VIP_LEVEL, request);
}

export async function saveVIPLevelResult(cacheId: string) {
	return axios.get(SAVE_VIP_LEVEL_RESULT, {
		params: {
			cachedId: cacheId,
		},
	});
}

export async function updateVIPLevel(request: VIPLevelModel) {
	return axios.post(UPDATE_VIP_LEVEL, request);
}

export async function updateVIPLevelResult(cacheId: string) {
	return axios.get(UPDATE_VIP_LEVEL_RESULT, {
		params: {
			cachedId: cacheId,
		},
	});
}

export async function getRiskLevelList(request: PlayerConfigurationFilterRequestModel) {
	return axios.post(GET_RISK_LEVEL_LIST, request);
}

export async function getRiskLevelListResult(request: string) {
	return axios.get<RiskLevelListResponseModel>(GET_RISK_LEVEL_LIST_RESULT, {
		params: {
			cachedId: request,
		},
	});
}

export async function saveRiskLevel(request: RiskLevelModel) {
	return axios.post(SAVE_RISK_LEVEL, request);
}

export async function saveRiskLevelResult(cacheId: string) {
	return axios.get(SAVE_RISK_LEVEL_RESULT, {
		params: {
			cachedId: cacheId,
		},
	});
}

export async function updateRiskLevel(request: RiskLevelModel) {
	return axios.post(UPDATE_RISK_LEVEL, request);
}

export async function updateRiskLevelResult(cacheId: string) {
	return axios.get(UPDATE_RISK_LEVEL_RESULT, {
		params: {
			cachedId: cacheId,
		},
	});
}

export async function deactivateSurveyQuestion(surveyQuestionId: number) {
	return axios.get(DEACTIVATE_SURVEY_QUESTION, {
		params: {
			surveyQuestionId: surveyQuestionId,
		},
	});
}

export async function deactivateSurveyTemplate(surveyTemplateId: number) {
	return axios.get(DEACTIVATE_SURVEY_TEMPLATE, {
		params: {
			surveyTemplateId: surveyTemplateId,
		},
	});
}

export async function getSystemLookups() {
	return axios.get(GET_SYSTEM_LOOKUPS);
}

export async function getPlayerConfigLanguage(request: PlayerConfigurationFilterRequestModel) {
	return axios.post(GET_PLAYER_CONFIG_LANGUAGE, request);
}

export async function getPlayerConfigLanguageResult(request: string) {
	return axios.get<LanguageListModel>(GET_PLAYER_CONFIG_LANGUAGE_RESULT, {
		params: {
			cachedId: request,
		},
	});
}

export async function getPlayerConfigPlayerStatus(request: PlayerConfigurationFilterRequestModel) {
	return axios.post(GET_PLAYER_CONFIG_PLAYERSTATUS, request);
}

export async function getPlayerConfigPlayerStatusResult(request: string) {
	return axios.get<PlayerStatusListModel>(GET_PLAYER_CONFIG_PLAYERSTATUS_RESULT, {
		params: {
			cachedId: request,
		},
	});
}

export async function getPlayerConfigPortal(request: PlayerConfigurationFilterRequestModel) {
	return axios.post(GET_PLAYER_CONFIG_PORTAL, request);
}

export async function getPlayerConfigPortalResult(request: string) {
	return axios.get<PortalListModel>(GET_PLAYER_CONFIG_PORTAL_RESULT, {
		params: {
			cachedId: request,
		},
	});
}

export async function saveCodeDetailsList(request: UpsertPlayerConfigTypeRequestModel) {
	return axios.post(SAVE_PLAYER_CONFIG_CODE_DETAILS, request);
}

export async function saveCodeDetailsListResult(cacheId: string) {
	return axios.get(SAVE_PLAYER_CONFIG_CODE_DETAILS_RESULT, {
		params: {
			cachedId: cacheId,
		},
	});
}

export async function getPaymentGroupList(request: PlayerConfigurationFilterRequestModel) {
	return axios.post(GET_PAYMENT_GROUP_LIST, request);
}

export async function getPaymentGroupListResult(request: string) {
	return axios.get<PaymentGroupListResponseModel>(GET_PAYMENT_GROUP_LIST_RESULT, {
		params: {
			cachedId: request,
		},
	});
}

export async function getMarketingChannelList(request: PlayerConfigurationFilterRequestModel) {
	return axios.post(GET_MARKETING_CHANNEL_LIST, request);
}

export async function getMarketingChannelListResult(request: string) {
	return axios.get<MarketingChannelListResponseModel>(GET_MARKETING_CHANNEL_LIST_RESULT, {
		params: {
			cachedId: request,
		},
	});
}

export async function getCurrencyByFilter(request: PlayerConfigurationFilterRequestModel) {
	return axios.post(GET_CURRENCY_BY_FILTER, request);
}

export async function getCurrencyList(request: PlayerConfigurationFilterRequestModel) {
	return axios.post(GET_CURRENCY_LIST, request);
}

export async function getCurrencyListResult(request: string) {
	return axios.get<CurrencyListResponseModel>(GET_CURRENCY_LIST_RESULT, {
		params: {
			cachedId: request,
		},
	});
}

export async function validatePlayerConfigurationRecord(request: PlayerConfigCodeListValidatorRequestModel) {
	return axios.post(VALIDATE_PLAYER_CONFIGURATION_RECORD, request);
}

export async function checkCodeDetailsIfExisting(request: PlayerConfigValidatorRequestModel) {
	return axios.post(VALIDATE_PLAYER_CONFIG_CODE_DETAILS, request);
}

export async function getPlayerConfigCountry(request: PlayerConfigurationFilterRequestModel) {
	return axios.post(GET_PLAYER_CONFIG_COUNTRY, request);
}

export async function getPlayerConfigCountryResult(request: string) {
	return axios.get<CountryListModel>(GET_PLAYER_CONFIG_COUNTRY_RESULT, {
		params: {
			cachedId: request,
		},
	});
}

const GET_LANGUAGE_OPTION_LIST: string = `${API_GATEWAY_URL}playerconfiguration/GetLanguageOptionList`;
export function GetLanguageOptionList() {
	return axios.get<Array<LanguageModel>>(GET_LANGUAGE_OPTION_LIST);
}

export async function getPostChatSurveyByFilter(request: PostChatSurveyFilterRequestModel) {
	return axios.post(GET_POST_CHAT_SURVEY_LIST, request);
}

export async function getPostChatSurveyByFilterResult(request: string) {
	return axios.get<PostChatSurveyFilterResponseModel>(GET_POST_CHAT_SURVEY_LIST_RESULT, {
		params: {
			cachedId: request,
		},
	});
}

export async function getSkillByFilter(request: SkillFilterRequestModel) {
	return axios.post(GET_SKILL_LIST, request);
}
export async function getSkillByFilterResult(request: string) {
	return axios.get<SkillFilterResponseModel>(GET_SKILL_LIST_RESULT, {
		params: {
			cachedId: request,
		},
	});
}

export async function getPostChatSurveyLookups() {
	return axios.get<PostChatSurveyLookupsResponseModel>(GET_PCS_LOOKUPS);
}

export async function getSkillsByLicenseId(licenseId: string) {
	return axios.get<Array<LookupModel>>(GET_PCS_SKILLS_BY_LICENSE_ID, {
		params: {
			licenseId: licenseId,
		},
	});
}
export async function upsertSkill(request: AddSkillRequestModel) {
	return axios.post(REQUEST_UPSERT_SKILL, request);
}

export function togglePostChatSurvey(request: PostChatSurveyToggleRequestModel) {
	return axios.post<ResponseModel>(TOGGLE_PCS, request);
}

export function toggleSkill(request: SkillToggleRequestModel) {
	return axios.post<ResponseModel>(TOGGLE_SKILL, request);
}

export async function validateSkill(request: ValidateSkillRequestModel) {
	return axios.post(VALIDATE_SKILL, request);
}

const GeT_PCS_COMMUNICATION_PROVIDER_OPTION: string = `${API_GATEWAY_URL}system/GetPCSCommunicationProviderOption`;
export async function getPCSCommunicationProviderOption() {
	return axios.get<Array<PCSCommunicationProviderOptionResponseModel>>(GeT_PCS_COMMUNICATION_PROVIDER_OPTION);
}

export function getAllCurrencyWithNullableRestriction(userId?: number) {
	return axios.get<Array<CurrencyModel>>(GET_CURRENCY_WITH_NULLABLE_RESTRICTION, {
		params: {
			userId: userId,
		},
	});
}


const GET_REM_AGENTS_BY_USER_ACCESS: string = `${API_GATEWAY_URL}system/GetRemAgentsByUserAccess`;
export function getRemAgentsByUserAccess(userId?: number) {
	return axios.get<Array<LookupModel>>(GET_REM_AGENTS_BY_USER_ACCESS, {
		params: {
			userId: userId,
		},
	});
}


const GET_PAYMENT_METHOD_LIST: string = `${API_GATEWAY_URL}playerconfiguration/GetPaymentMethodByFilter`;
const GET_PAYMENT_METHOD_LIST_RESULT: string = `${API_CALLBACK_URL}system/GetPaymentMethodByFilter`;

export async function getPaymentMethodList(request: PaymentMethodFilterRequestModel) {
	return axios.post(GET_PAYMENT_METHOD_LIST, request);
}

export async function getPaymentMethodListResult(request: string) {
	return axios.get<PaymentMethodListResponseModel>(GET_PAYMENT_METHOD_LIST_RESULT, {
		params: {
			cachedId: request,
		},
	});
}

const GET_TICKET_FIELDS_OPTION_LIST: string = `${API_GATEWAY_URL}playerconfiguration/GetTicketFieldsList`;
export function GetTicketFieldsList() {
	return axios.get<Array<TicketFieldsModel>>(GET_TICKET_FIELDS_OPTION_LIST);
}

const SAVE_PAYMENT_METHOD: string = `${API_GATEWAY_URL}playerconfiguration/SavePaymentMethod`;
const SAVE_PAYMENT_METHOD_RESULT: string = `${API_CALLBACK_URL}system/SavePaymentMethod`;
export async function savePaymentMethod(request: UpsertPaymentMethodRequestModel) {
	return axios.post(SAVE_PAYMENT_METHOD, request);
}

export async function savePaymentMethodResult(cacheId: string) {
	return axios.get(SAVE_PAYMENT_METHOD_RESULT, {
		params: {
			cachedId: cacheId,
		},
	});
}

const VALIDATE_PAYMENT_METHOD_NAME: string = `${API_GATEWAY_URL}playerconfiguration/ValidatePaymentMethodName`;
export async function ValidatePaymentMethodName(request: ValidatePaymentMethodNameRequestModel) {
	return await axios.post(VALIDATE_PAYMENT_METHOD_NAME, request);
}

const VALIDATE_PAYMENT_METHOD_COMMUNICATION_PROVIDER: string = `${API_GATEWAY_URL}playerconfiguration/ValidatePaymentMethodCommunicationProvider`;
export async function ValidatePaymentMethodCommunicationProvider(request: ValidateCommunicationProviderRequestModel) {
	return await axios.post(VALIDATE_PAYMENT_METHOD_COMMUNICATION_PROVIDER, request);
}

const SAVE_TICKET_FIELD: string = `${API_GATEWAY_URL}playerconfiguration/SaveTicketFields`;
const SAVE_TICKET_FIELD_RESULT: string = `${API_CALLBACK_URL}system/SaveTicketFields`;
export async function saveSelectedTicketFields(request: UpsertTicketFieldsRequestModel) {
	return axios.post(SAVE_TICKET_FIELD, request);
}

export async function saveSelectedTicketFieldsResult(cacheId: string) {
	return axios.get(SAVE_TICKET_FIELD_RESULT, {
		params: {
			cachedId: cacheId,
		},
	});
}

export function getAllCountryWithAccessRestriction(userId?: number) {
	return axios.get<Array<CountryModel>>(GET_COUNTRY_WITH_ACCESS_RESTRICTION, {
		params: {
			userId: userId,
		},
	});
}

const UPDATE_USER_STATUS_ONLINE: string = `${API_GATEWAY_URL}Authentication/UpdateUserStatusById`;
export async function updateUserStatusById(request: UpdateUserStatusOnlineModel) {
	return axios.post(UPDATE_USER_STATUS_ONLINE, request);
}

const GET_STAFF_PERFORMANCE_SETTING_LIST: string = `${API_GATEWAY_URL}System/GetStaffPermormanceSettingList`;
export async function getStaffPermormanceSettingList(request: StaffPerformanceRequestModel) {
	return axios.post<StaffPerformaneSettingResponseModel>(GET_STAFF_PERFORMANCE_SETTING_LIST, request);
}

const GET_STAFF_PERFORMANCE_INFO: string = `${API_GATEWAY_URL}System/GetStaffPerformanceInfo`;
export async function getStaffPerformanceInfo(Id: string) {
	return axios.get(GET_STAFF_PERFORMANCE_INFO, {
		params: {
			Id: Id,
		},
	});
}

const GET_STAFF_PERFORMANCE_REVIEW_PERIOD_LIST: string = `${API_GATEWAY_URL}System/GetCommunicationReviewPeriodsByFilter`;
export async function getStaffPerformanceReviewPeriodList(request: ReviewPeriodListRequestModel) {
	return axios.post<any>(GET_STAFF_PERFORMANCE_REVIEW_PERIOD_LIST, request);
}

const GET_STAFF_PERFORMANCE_REVIEW_PERIOD_LIST_RESULT: string = `${API_CALLBACK_URL}System/GetCommunicationReviewPeriodsByFilter`;
export async function getStaffPerformanceReviewPeriodListResult(Id: number) {
	return axios.get(GET_STAFF_PERFORMANCE_REVIEW_PERIOD_LIST_RESULT, {
		params: {
			cachedId: Id,
		},
	});
}

const UPSERT_REVIEW_PERIOD: string = `${API_GATEWAY_URL}System/UpsertReviewPeriod`;
export async function upsertReviewPeriod(request: any) {
	return axios.post<any>(UPSERT_REVIEW_PERIOD, request);
}

const GET_APP_CONFIG_SETTING: string = `${API_GATEWAY_URL}System/GetAppConfigSettingByApplicationId`;
export async function getAppConfigSettingByApplicationId(request: number) {
	return axios.get<Array<GetAppConfigSettingByApplicationIdResponseModel>>(GET_APP_CONFIG_SETTING, {
		params: {
			applicationId: request,
		},
	});
}

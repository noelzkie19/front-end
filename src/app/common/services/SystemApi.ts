import axios from 'axios';
import {AppConfiguration} from 'read-appsettings-json';
import {CaseTypeModel} from '../../modules/system/models';
import { GetTopicOptionsReponse } from '../../modules/system/models/topic/response/GetTopicOptionsReponse';
import {
	CaseTypeOptionModel,
	FeedbackAnswerOptionModel,
	FeedbackAnswerOptionRequestModel,
	FeedbackCategoryOptionModel,
	FeedbackTypeOptionModel,
	LookupModel,
	MasterReferenceOptionListModel,
	MasterReferenceOptionModel,
	MessageResponseOptionModel,
	MessageStatusOptionModel,
	MessageTypeOptionModel,
	SubtopicOptionModel,
	TopicOptionModel,
} from '../model';

const API_GATEWAY_URL: string = AppConfiguration.Setting().REACT_APP_MLAB_GATEWAY_URL!;
const API_CALLBACK_URL = AppConfiguration.Setting().REACT_APP_MLAB_CALLBACK_URL;

const GET_CASE_TYPE_OPTION_LIST: string = `${API_GATEWAY_URL}system/GetCaseTypeOptionList`;
const GET_TOPIC_OPTION_LIST: string = `${API_GATEWAY_URL}system/GetTopicOptionList`;
const GET_TOPIC_OPTION_BY_BRAND_LIST: string = `${API_GATEWAY_URL}system/GetTopicOptionByBrandId`;
const GET_SUBTOPIC_OPTION_LIST: string = `${API_GATEWAY_URL}system/GetSubtopicOptionById`;
const GET_MESSAGE_TYPE_OPTION_LIST: string = `${API_GATEWAY_URL}system/GetMessageTypeOptionList`;
const GET_MESSAGE_STATUS_OPTION_LIST: string = `${API_GATEWAY_URL}system/GetMessageStatusOptionById`;
const GET_MESSAGE_REPSONSE_OPTION_LIST: string = `${API_GATEWAY_URL}system/GetMessageResponseOptionById`;
const GET_FEEDBACK_TYPE_OPTION_LIST: string = `${API_GATEWAY_URL}system/GetFeedbackTypeOptionList`;
const GET_FEEDBACK_CATEGORY_OPTION_LIST: string = `${API_GATEWAY_URL}system/GetFeedbackCategoryOptionById`;
const GET_FEEDBACK_ANSWER_OPTION_LIST: string = `${API_GATEWAY_URL}system/GetFeedbackAnswerOptionById`;
const GET_MASTER_REFERENCE_OPTION_LIST: string = `${API_GATEWAY_URL}system/GetMasterReferenceList`;
const GET_DATE_BY_OPTION_LIST: string = `${API_GATEWAY_URL}system/GetDateByOptionList`;

export async function GetCaseTypeOptionList() {
	return await axios.get<Array<CaseTypeOptionModel>>(GET_CASE_TYPE_OPTION_LIST);
}
export async function GetTopicOptionList() {
	return await axios.get<Array<TopicOptionModel>>(GET_TOPIC_OPTION_LIST);
}
export async function GetTopicOptionByBrandId(request: number) {
	return axios.get<Array<LookupModel>>(GET_TOPIC_OPTION_BY_BRAND_LIST, {
		params: {
			brandId: request,
		},
	});
}

export async function GetSubtopicOptionById(request: number) {
	return axios.get<Array<SubtopicOptionModel>>(GET_SUBTOPIC_OPTION_LIST, {
		params: {
			topicId: request,
		},
	});
}
export async function GetMessageTypeOptionList(request?: string) {
	return await axios.get<Array<MessageTypeOptionModel>>(GET_MESSAGE_TYPE_OPTION_LIST, {
		params: {
			channelTypeId: request,
		},
	});
}
export async function GetMessageStatusOptionById(request: number) {
	return axios.get<Array<MessageStatusOptionModel>>(GET_MESSAGE_STATUS_OPTION_LIST, {
		params: {
			messageTypeId: request,
		},
	});
}
export async function GetMessageResponseOptionById(request: number) {
	return axios.get<Array<MessageResponseOptionModel>>(GET_MESSAGE_REPSONSE_OPTION_LIST, {
		params: {
			messageStatusId: request,
		},
	});
}
export async function GetFeedbackTypeOptionList() {
	return await axios.get<Array<FeedbackTypeOptionModel>>(GET_FEEDBACK_TYPE_OPTION_LIST);
}
export async function GetFeedbackCategoryOptionById(request: number) {
	return axios.get<Array<FeedbackCategoryOptionModel>>(GET_FEEDBACK_CATEGORY_OPTION_LIST, {
		params: {
			feedbackTypeId: request,
		},
	});
}
export async function GetFeedbackAnswerOptionById(request: FeedbackAnswerOptionRequestModel) {
	return axios.post<Array<FeedbackAnswerOptionModel>>(GET_FEEDBACK_ANSWER_OPTION_LIST, request);
}
export async function GetMasterReferenceList(request: string) {
	return axios.get<Array<MasterReferenceOptionListModel>>(GET_MASTER_REFERENCE_OPTION_LIST, {
		params: {
			masterReferenceId: request,
		},
	});
}

const GET_TOPIC_OPTIONS: string = `${API_GATEWAY_URL}system/GetTopicOptions`;
export async function GetTopicOptions() {
	return await axios.get<Array<GetTopicOptionsReponse>>(GET_TOPIC_OPTIONS);
}

export async function GetDateByOptionList() {
	return await axios.get<Array<LookupModel>>(GET_DATE_BY_OPTION_LIST);
}
export async function SetIdleUser(isIdle: boolean) {
	const SET_USER_IDLE: string = `${API_GATEWAY_URL}userManagement/SetUserIdle`+'?isIdle='+isIdle;
	return axios.post(SET_USER_IDLE,{})
}
import axios from 'axios';
import {AppConfiguration} from 'read-appsettings-json';
import {RemAgentProfileDetailsRequest, RemAgentProfileDetailsResponse, RemProfileFilterRequestModel, RemProfileListResponseModel} from '../models';
import {RemProfileUpdateRequestModel} from '../models/request/RemProfileUpdateRequestModel';
import {ValidateRemProfileNameRequest} from '../models/request/ValidateRemProfileNameRequest';
import {MessageTypeContactDetailsResponse} from '../models/response/MessageTypeContactDetailsResponse';
import {RemProfileByIdResponseModel} from '../models/response/RemProfileByIdResponseModel';
import {RemProfileScheduleTemplateResponse} from '../models/response/RemProfileScheduleTemplateResponse';

// Global Configuration for axios
const API_GATEWAY_URL: string = AppConfiguration.Setting().REACT_APP_MLAB_GATEWAY_URL!;
const API_CALLBACK_URL = AppConfiguration.Setting().REACT_APP_MLAB_CALLBACK_URL;

const GET_REUSABLE_PROFILE_DETAILS: string = `${API_GATEWAY_URL}RelationshipManagement/GetReusableRemProfileDetails`;
export async function GetReusableRemProfileDetails() {
	return await axios.post<Array<RemAgentProfileDetailsResponse>>(GET_REUSABLE_PROFILE_DETAILS);
}

const REQUEST_VALIDATE_REM_PROFILE_NAME: string = `${API_GATEWAY_URL}RelationshipManagement/ValidateRemProfileName`;
export async function ValidateRemProfileName(request: ValidateRemProfileNameRequest) {
	return await axios.post(REQUEST_VALIDATE_REM_PROFILE_NAME, request);
}

const GET_REM_PROFILE_LIST: string = `${API_GATEWAY_URL}RelationshipManagement/GetRemProfileByFilter`;
export async function GetRemProfileList(request: RemProfileFilterRequestModel) {
	return await axios.post(GET_REM_PROFILE_LIST, request);
}

const GET_REM_PROFILE_LIST_RESULT: string = `${API_CALLBACK_URL}RelationshipManagement/GetRemProfileByFilter`;
export async function GetRemProfileListResult(request: string) {
	return axios.get<RemProfileListResponseModel>(GET_REM_PROFILE_LIST_RESULT, {
		params: {
			cachedId: request,
		},
	});
}

const UPDATE_REM_PROFILE_STATUS: string = `${API_GATEWAY_URL}RelationshipManagement/UpdateRemProfileStatus`;
export async function UpdateRemProfileStatus(request: RemProfileUpdateRequestModel) {
	return await axios.post(UPDATE_REM_PROFILE_STATUS, request);
}

const UPDATE_REM_ONLINE_STATUS: string = `${API_GATEWAY_URL}RelationshipManagement/UpdateRemOnlineStatus`;
export async function UpdateRemOnlineStatus(request: RemProfileUpdateRequestModel) {
	return await axios.post(UPDATE_REM_ONLINE_STATUS, request);
}

const REQUEST_VALIDATE_REM_PROFILE_ID_IF_HAS_PLAYER: string = `${API_GATEWAY_URL}RelationshipManagement/ValidateRemProfileIfHasPlayer`;
export async function ValidateRemProfileIfHasPlayer(request: RemProfileUpdateRequestModel) {
	return await axios.post(REQUEST_VALIDATE_REM_PROFILE_ID_IF_HAS_PLAYER, request);
}

const GET_ALL_SCHEDULE_TEMPLATE_LIST: string = `${API_GATEWAY_URL}RelationshipManagement/GetAllScheduleTemplateList`;
export async function GetAllScheduleTemplateList() {
	return await axios.get<Array<RemProfileScheduleTemplateResponse>>(GET_ALL_SCHEDULE_TEMPLATE_LIST);
}

const GET_MESSAGETYPE_CONTACTDETAILS_LIST: string = `${API_GATEWAY_URL}RelationshipManagement/GetMessageTypeChannelList`;
export async function GetMessageTypeChannelList() {
	return await axios.get<Array<MessageTypeContactDetailsResponse>>(GET_MESSAGETYPE_CONTACTDETAILS_LIST);
}

const UPSERT_REM_PROFILE: string = `${API_GATEWAY_URL}RelationshipManagement/UpSertRemProfile`;

export async function UpSertRemProfile(request: RemAgentProfileDetailsRequest) {
	return axios.post(UPSERT_REM_PROFILE, request);
}

const GET_REM_PROFILE_BY_ID: string = `${API_GATEWAY_URL}RelationshipManagement/GetRemProfileById`;
const GET_REM_PROFILE_BY_ID_RESULT: string = `${API_CALLBACK_URL}RelationshipManagement/GetRemProfileById`;

export async function GetRemProfileById(request: RemProfileFilterRequestModel) {
	return axios.post(GET_REM_PROFILE_BY_ID, request);
}

export async function GetRemProfileByIdResult(request: string) {
	return axios.get<RemProfileByIdResponseModel>(GET_REM_PROFILE_BY_ID_RESULT, {
		params: {
			cachedId: request,
		},
	});
}

const EXPORT_REM_TO_CSV: string = `${API_GATEWAY_URL}RelationshipManagement/ExportRemProfileToCsv`;
export async function ExportRemProfileToCsv(request: RemProfileFilterRequestModel) {
	return axios.post(EXPORT_REM_TO_CSV, request, {
		responseType: 'blob',
	});
}

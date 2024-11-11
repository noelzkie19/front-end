import axios from 'axios';
import { AppConfiguration } from 'read-appsettings-json';
import { SaveScheduleTemplateRequest, ScheduleTemplateByIdRequest, ScheduleTemplateLanguageListResponse, ScheduleTemplateLanguageRequest, ScheduleTemplateListRequest, ScheduleTemplateListResponse, ScheduleTemplateResponse, ValidateTemplateRequest } from "../models"
import { AutoDistributionSettingFilterRequest } from '../models/request/AutoDistributionSettingFilterRequest';
import { RemoveDistributionByVIPLevelRequestModel } from '../models/request/RemoveDistributionByVIPLevelRequestModel';
import { UpdateAutoDistributionSettingPriorityRequestModel } from '../models/request/UpdateAutoDistributionSettingPriorityRequestModel';
import { UpdateMaxPlayerCountConfigRequestModel } from '../models/request/UpdateMaxPlayerCountConfigRequestModel';
import { RemAutoDistributionConfigListResponse } from '../models/response/RemAutoDistributionConfigListResponse';
import { RemAutoDistributionAgentListResponse } from '../models/response/RemAutoDistributionAgentListResponse';
import { UpdateAutoDistributionConfigStatusRequestModel } from '../models/request/UpdateAutoDistributionConfigStatusRequestModel';
import { AutoDistributionConfigurationRequestModel } from '../models/request/AutoDistributionConfigurationRequestModel';
import { AutoDistributionConfigurationByIdRequestModel } from '../models/request/AutoDistributionConfigurationByIdRequestModel';
import { AutoDistributionConfigurationDetailsResponseModel } from '../models/response/AutoDistributionConfigurationDetailsResponseModel';
import { AutoDistributionConfigurationListByAgentIdRequestModel } from '../models/request/AutoDistributionConfigurationListByAgentIdRequestModel';
import { AutoDistributionConfigurationListByAgentIdResponseModel } from '../models/response/AutoDistributionConfigurationListByAgentIdResponseModel';

// Global Configuration for axios
const API_GATEWAY_URL: string = AppConfiguration.Setting().REACT_APP_MLAB_GATEWAY_URL!
const API_CALLBACK_URL = AppConfiguration.Setting().REACT_APP_MLAB_CALLBACK_URL

//Schedule Template List
const REQUEST_SCHEDULE_TEMPLATE_SETTING_LIST: string = `${API_GATEWAY_URL}RelationshipManagement/GetScheduleTemplateSettingList`;
const GET_SCHEDULE_TEMPLATE_SETTING_LIST: string = `${API_CALLBACK_URL}RelationshipManagement/GetScheduleTemplateSettingList`;
export async function SendGetScheduleTeplateSettingList(request: ScheduleTemplateListRequest) {
	return axios.post(REQUEST_SCHEDULE_TEMPLATE_SETTING_LIST, request);
}
export async function GetScheduleTeplateSettingList(request: string) {
	return axios.get<ScheduleTemplateListResponse>(GET_SCHEDULE_TEMPLATE_SETTING_LIST, {
		params: {
			cachedId: request,
		},
	});
}

const EXPORT_REM_TO_CSV: string = `${API_GATEWAY_URL}RelationshipManagement/ExportRemSettingToCsv`
export async function ExportRemSettingToCsv(request: ScheduleTemplateListRequest) {
	return axios.post(EXPORT_REM_TO_CSV, request);
}

//Schedule Template by Id
const REQUEST_SCHEDULE_TEMPLATE_SETTING_BY_ID: string = `${API_GATEWAY_URL}RelationshipManagement/GetScheduleTemplateSettingById`;
const GET_SCHEDULE_TEMPLATE_SETTING_BY_ID: string = `${API_CALLBACK_URL}RelationshipManagement/GetScheduleTemplateSettingById`;
export async function SendGetScheduleTeplateSettingById(request: ScheduleTemplateByIdRequest) {
	return axios.post(REQUEST_SCHEDULE_TEMPLATE_SETTING_BY_ID, request);
}
export async function GetScheduleTeplateSettingById(request: string) {
	return axios.get<ScheduleTemplateResponse>(GET_SCHEDULE_TEMPLATE_SETTING_BY_ID, {
		params: {
			cachedId: request,
		},
	});
}

//Schedule Template Language Setting List
const REQUEST_SCHEDULE_TEMPLATE_LANGUAGE_SETTING_LIST: string = `${API_GATEWAY_URL}RelationshipManagement/GetScheduleTemplateLanguageSettingList`;
const GET_SCHEDULE_TEMPLATE_LANGUAGE_SETTING_LIST: string = `${API_CALLBACK_URL}RelationshipManagement/GetScheduleTemplateLanguageSettingList`;
export async function SendGetScheduleTemplateLanguageSettingList(request: ScheduleTemplateLanguageRequest) {
	return axios.post(REQUEST_SCHEDULE_TEMPLATE_LANGUAGE_SETTING_LIST, request);
}
export async function GetScheduleTemplateLanguageSettingListAsync(request: string) {
	return axios.get<ScheduleTemplateLanguageListResponse>(GET_SCHEDULE_TEMPLATE_LANGUAGE_SETTING_LIST, {
		params: {
			cachedId: request,
		},
	});
}

//Save ScheduleTemplate Setting
const REQUEST_SAVE_SCHEDULE_TEMPLATE_SETTING: string = `${API_GATEWAY_URL}RelationshipManagement/SaveScheduleTemplateSetting`;
export async function SaveScheduleTemplateSetting(request: SaveScheduleTemplateRequest) {
	return axios.post(REQUEST_SAVE_SCHEDULE_TEMPLATE_SETTING, request);
}

//Validate Template Setting
const REQUEST_VALIDATE_TEMPLATE_SETTING: string = `${API_GATEWAY_URL}RelationshipManagement/ValidateTemplateSetting`
export async function ValidateTemplateSetting(request: ValidateTemplateRequest) {
	return axios.post(REQUEST_VALIDATE_TEMPLATE_SETTING, request)
}

//Auto Distribution Setting
const GET_REM_AUTO_DISTRIBUTION_SETTING_CONFIGS_LIST: string = `${API_GATEWAY_URL}RelationshipManagement/GetAutoDistributionSettingConfigsListByFilter`;
export async function GetAutoDistributionSettingConfigsListByFilter(request: AutoDistributionSettingFilterRequest) {
	return await axios.post(GET_REM_AUTO_DISTRIBUTION_SETTING_CONFIGS_LIST, request);
}

const GET_REM_AUTO_DISTRIBUTION_SETTING_CONFIGS_LIST_RESULT: string = `${API_CALLBACK_URL}RelationshipManagement/GetAutoDistributionSettingConfigsListByFilter`;
export async function GetAutoDistributionSettingConfigsListResult(request: string) {
	return axios.get<RemAutoDistributionConfigListResponse>(GET_REM_AUTO_DISTRIBUTION_SETTING_CONFIGS_LIST_RESULT, {
		params: {
			cachedId: request,
		},
	});
}

const GET_REM_AUTO_DISTRIBUTION_SETTING_AGENTS_LIST: string = `${API_GATEWAY_URL}RelationshipManagement/GetAutoDistributionSettingAgentsListByFilter`;
export async function GetAutoDistributionSettingAgentsListByFilter(request: AutoDistributionSettingFilterRequest) {
	return await axios.post(GET_REM_AUTO_DISTRIBUTION_SETTING_AGENTS_LIST, request);
}

const GET_REM_AUTO_DISTRIBUTION_SETTING_AGENTS_LIST_RESULT: string = `${API_CALLBACK_URL}RelationshipManagement/GetAutoDistributionSettingAgentsListByFilter`;
export async function GetAutoDistributionSettingAgentsListResult(request: string) {
	return axios.get<RemAutoDistributionAgentListResponse>(GET_REM_AUTO_DISTRIBUTION_SETTING_AGENTS_LIST_RESULT, {
		params: {
			cachedId: request,
		},
	});
}

const UPDATE_MAX_PLAYER_COUNT_CONFIG: string = `${API_GATEWAY_URL}RelationshipManagement/UpdateMaxPlayerCountConfig`;
export async function UpdateMaxPlayerCountConfig(request: UpdateMaxPlayerCountConfigRequestModel) {
	return axios.post(UPDATE_MAX_PLAYER_COUNT_CONFIG, request);
}

const REMOVE_DISTRIBUTION_BY_VIPLEVEL: string = `${API_GATEWAY_URL}RelationshipManagement/RemoveDistributionbyVipLevel`;
export async function RemoveDistributionbyVipLevel(request: RemoveDistributionByVIPLevelRequestModel) {
	return axios.post(REMOVE_DISTRIBUTION_BY_VIPLEVEL, request);
}

const UPDATE_AUTO_DISTRIBUTION_SETTING_PRIORITY: string = `${API_GATEWAY_URL}RelationshipManagement/UpdateAutoDistributionSettingPriority`;
export async function UpdateAutoDistributionSettingPriority(request: UpdateAutoDistributionSettingPriorityRequestModel) {
	return axios.post(UPDATE_AUTO_DISTRIBUTION_SETTING_PRIORITY, request);
}

const GET_REMOVED_VIP_LEVELS: string = `${API_GATEWAY_URL}RelationshipManagement/GetRemovedVipLevels`;
export async function getRemovedVipLevels() {
	return axios.get(GET_REMOVED_VIP_LEVELS);
}

const GET_AUTO_DISTRIBUTION_SETTING_CONFIG_LIST: string = `${API_GATEWAY_URL}RelationshipManagement/GetAllAutoDistributionConfigListOrder`;
export async function GetAllAutoDistributionConfigListOrder() {
	return axios.get(GET_AUTO_DISTRIBUTION_SETTING_CONFIG_LIST);
}

const UPDATE_AUTO_DISTRIBUTION_CONFIG_STATUS: string = `${API_GATEWAY_URL}RelationshipManagement/UpdateAutoDistributionConfigurationStatus`;
export async function UpdateAutoDistributionConfigStatus(request: UpdateAutoDistributionConfigStatusRequestModel) {
	return axios.post(UPDATE_AUTO_DISTRIBUTION_CONFIG_STATUS, request);
}

const DELETE_AUTO_DISTRIBUTION_CONFIG: string = `${API_GATEWAY_URL}RelationshipManagement/DeleteAutoDistributionConfigurationById`;
export async function DeleteAutoDistributionConfig(autoDistributionSettingId: number) {
	return await axios.get(DELETE_AUTO_DISTRIBUTION_CONFIG, {
		params: {
			autoDistributionSettingId: autoDistributionSettingId,
		},
	});
}

const VALIDATE_AUTO_DISTRIBUTION_CONFIG_NAME: string = `${API_GATEWAY_URL}RelationshipManagement/ValidateAutoDistributionConfigurationName`;
export async function ValidateAutoDistributionConfigurationName(autoDistributionSettingId: number, configurationName: string) {
	return await axios.get(VALIDATE_AUTO_DISTRIBUTION_CONFIG_NAME, {
		params: {
			autoDistributionSettingId: autoDistributionSettingId,
			configurationName: configurationName
		},
	});
}

const GET_AUTO_DISTRIBUTION_CONFIG_COUNT: string = `${API_GATEWAY_URL}RelationshipManagement/GetAutoDistributionConfigurationCount`;
export async function GetAutoDistributionConfigurationCount(userId: number) {
	return axios.post(GET_AUTO_DISTRIBUTION_CONFIG_COUNT, {
		userId: userId,
	});
}

const SAVE_AUTO_DISTRIBUTION_CONFIGURATION: string = `${API_GATEWAY_URL}RelationshipManagement/SaveAutoDistributionConfiguration`;
export async function SaveAutoDistributionConfiguration(request: AutoDistributionConfigurationRequestModel) {
	return axios.post(SAVE_AUTO_DISTRIBUTION_CONFIGURATION, request);
}

const REQUEST_AUTO_DISTRIBUTION_CONFIGURATION_BY_ID: string = `${API_GATEWAY_URL}RelationshipManagement/GetAutoDistributionConfigurationDetailsById`;
const GET_AUTO_DISTRIBUTION_CONFIGURATION_BY_ID: string = `${API_CALLBACK_URL}RelationshipManagement/GetAutoDistributionConfigurationDetailsById`;
export async function SendGetAutoDistributionConfigurationDetailsById(request: AutoDistributionConfigurationByIdRequestModel) {
	return axios.post(REQUEST_AUTO_DISTRIBUTION_CONFIGURATION_BY_ID, request);
}
export async function GetAutoDistributionConfigurationDetailsById(request: string) {
	return axios.get<AutoDistributionConfigurationDetailsResponseModel>(GET_AUTO_DISTRIBUTION_CONFIGURATION_BY_ID, {
		params: {
			cachedId: request,
		},
	});
}

const REQUEST_AUTO_DISTRIBUTION_CONFIGURATION_LIST_BY_AGENT_ID: string = `${API_GATEWAY_URL}RelationshipManagement/GetAutoDistributionConfigurationListByAgentId`;
const GET_AUTO_DISTRIBUTION_CONFIGURATION_LIST_BY_AGENT_ID: string = `${API_CALLBACK_URL}RelationshipManagement/GetAutoDistributionConfigurationListByAgentId`;
export async function SendGetAutoDistributionConfigurationListByAgentId(request: AutoDistributionConfigurationListByAgentIdRequestModel) {
	return axios.post(REQUEST_AUTO_DISTRIBUTION_CONFIGURATION_LIST_BY_AGENT_ID, request);
}
export async function GetAutoDistributionConfigurationListByAgentIdResult(request: string) {
	return await axios.get<AutoDistributionConfigurationListByAgentIdResponseModel>(GET_AUTO_DISTRIBUTION_CONFIGURATION_LIST_BY_AGENT_ID, {
		params: {
			cachedId: request,
		},
	});
}



import axios from 'axios';
import {AppConfiguration} from 'read-appsettings-json';
import {CampaignGoalSettingByFilterRequestModel, CampaignGoalSettingByFilterResponseModel, CampaignGoalSettingIdRequestModel} from '../models';
import {CampaignGoalSettingRequestModel} from '../models/request/CampaignGoalSettingRequestModel';
import {CheckCampaignGoalSettingByNameExistRequestModel} from '../models/request/CheckCampaignGoalSettingByNameExistRequestModel';
import {CampaignGoalSettingByIdResponseModel} from '../models/response/CampaignGoalSettingByIdResponseModel';

// GLOBAL CONFIGURATION FOR AXIOS
const API_GATEWAY_URL: string = AppConfiguration.Setting().REACT_APP_MLAB_GATEWAY_URL!;
const API_CALLBACK_URL = AppConfiguration.Setting().REACT_APP_MLAB_CALLBACK_URL;

// ENDPOINTS URL's AND CONSUME ENDPOINTS
const REQUEST_GET_CAMPAIGN_GOAL_SETTING_BY_FILTER: string = `${API_GATEWAY_URL}CampaignGoalSetting/GetCampaignGoalSettingByFilter`;
const GET_CAMPAIGN_GOAL_SETTING_BY_FILTER: string = `${API_CALLBACK_URL}CampaignGoalSetting/GetCampaignGoalSettingByFilter`;

export async function SendGetCampaignGoalSettingByFilter(request: CampaignGoalSettingByFilterRequestModel) {
	return axios.post(REQUEST_GET_CAMPAIGN_GOAL_SETTING_BY_FILTER, request);
}

export async function GetCampaignGoalSettingByFilter(request: string) {
	return axios.get<CampaignGoalSettingByFilterResponseModel>(GET_CAMPAIGN_GOAL_SETTING_BY_FILTER, {
		params: {
			cachedId: request,
		},
	});
}

const REQUEST_CHECK_CAMPAIGN_GOAL_SETTING_BY_NAME: string = `${API_GATEWAY_URL}CampaignGoalSetting/CheckCampaignGoalSettingByNameExist`;
export async function SendCheckCampaignGoalSettingByNameExist(request: CheckCampaignGoalSettingByNameExistRequestModel) {
	return axios.post(REQUEST_CHECK_CAMPAIGN_GOAL_SETTING_BY_NAME, request);
}

//	GET CAMPAIGN GOAL DETAILS BY SELECTED ID
const REQUEST_GET_CAMPAIGN_GOAL_SETTING_BY_ID: string = `${API_GATEWAY_URL}CampaignGoalSetting/GetCampaignGoalSettingByIdDetails`;
const GET_CAMPAIGN_GOAL_SETTING_BY_ID: string = `${API_CALLBACK_URL}CampaignGoalSetting/GetCampaignGoalSettingByIdDetails`;

export async function GetCampaignGoalSettingByIdDetails(request: CampaignGoalSettingIdRequestModel) {
	return axios.post(REQUEST_GET_CAMPAIGN_GOAL_SETTING_BY_ID, request);
}

export async function GetCampaignGoalSettingByIdDetailsResult(request: string) {
	return axios.get<CampaignGoalSettingByIdResponseModel>(GET_CAMPAIGN_GOAL_SETTING_BY_ID, {
		params: {
			cachedId: request,
		},
	});
}

//	UPSERT CAMPAIGN GOAL DETAILS
const REQUEST_UPSERT_CAMPAIGN_GOAL_SETTING: string = `${API_GATEWAY_URL}CampaignGoalSetting/UpsertCampaignGoalSetting`;

export async function UpsertCampaignGoalSetting(request: CampaignGoalSettingRequestModel) {
	return axios.post(REQUEST_UPSERT_CAMPAIGN_GOAL_SETTING, request);
}

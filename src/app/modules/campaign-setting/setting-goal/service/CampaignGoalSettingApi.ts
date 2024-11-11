import axios from 'axios'
import { AppConfiguration } from 'read-appsettings-json'
import { CampaignGoalSettingByFilterRequestModel, CampaignGoalSettingByFilterResponseModel, CampaignGoalSettingIdRequestModel, CampaignGoalSettingIdResponseModel, CampaignGoalSettingRequestModel, CheckCampaignGoalSettingByNameExistRequestModel } from '../models'

// -----------------------------------------------------------------
// GLOBAL CONFIGURATION FOR AXIOS
// -----------------------------------------------------------------
const API_GATEWAY_URL: string = AppConfiguration.Setting().REACT_APP_MLAB_GATEWAY_URL!
const API_CALLBACK_URL = AppConfiguration.Setting().REACT_APP_MLAB_CALLBACK_URL

// --------------------------------------------------------------------
// GetCampaignGoalSettingByFilter ENDPOINTS URL's AND CONSUME ENDPOINTS
// --------------------------------------------------------------------
const REQUEST_GET_CAMPAIGN_GOAL_SETTING_BY_FILTER: string = `${API_GATEWAY_URL}CampaignGoalSetting/GetCampaignGoalSettingByFilter`
const GET_CAMPAIGN_GOAL_SETTING_BY_FILTER: string = `${API_CALLBACK_URL}CampaignGoalSetting/GetCampaignGoalSettingByFilter`

export async function SendGetCampaignGoalSettingByFilter(request: CampaignGoalSettingByFilterRequestModel) {
    return axios.post(REQUEST_GET_CAMPAIGN_GOAL_SETTING_BY_FILTER, request)
}
export async function GetCampaignGoalSettingByFilter(request: string) {
    return axios.get<CampaignGoalSettingByFilterResponseModel>(GET_CAMPAIGN_GOAL_SETTING_BY_FILTER, {
        params: {
            cachedId: request,
        },
    })
}

// ---------------------------------------------------------------------
// GetCampaignGoalSettingById ENDPOINTS URL's AND CONSUME ENDPOINTS
// ---------------------------------------------------------------------
const REQUEST_GET_CAMPAIGN_GOAL_SETTING_BY_ID: string = `${API_GATEWAY_URL}CampaignGoalSetting/GetCampaignGoalSettingById`
const GET_CAMPAIGN_GOAL_SETTING_BY_ID: string = `${API_CALLBACK_URL}CampaignGoalSetting/GetCampaignGoalSettingById`

export async function SendGetCampaignGoalSettingById(request: CampaignGoalSettingIdRequestModel) {
    return axios.post(REQUEST_GET_CAMPAIGN_GOAL_SETTING_BY_ID, request)
}

export async function GetCampaignGoalSettingById(request: string) {
    return axios.get<CampaignGoalSettingIdResponseModel>(GET_CAMPAIGN_GOAL_SETTING_BY_ID, {
        params: {
            cachedId: request,
        },
    })
}

// -----------------------------------------------------------------
// AddCampaignGoalSetting ENDPOINTS URL's AND CONSUME ENDPOINTS
// -----------------------------------------------------------------
const REQUEST_ADD_CAMPAIGN_GOAL_SETTING: string = `${API_GATEWAY_URL}CampaignGoalSetting/AddCampaignGoalSetting`

export async function SendAddCampaignGoalSettingAsync(request: CampaignGoalSettingRequestModel){
    return axios.post(REQUEST_ADD_CAMPAIGN_GOAL_SETTING, request)
}

// ------------------------------------------------------------------------------
// CheckCampaignGoalSettingByNameExist ENDPOINTS URL's AND CONSUME ENDPOINTS
// ------------------------------------------------------------------------------
const REQUEST_CHECK_CAMPAIGN_GOAL_SETTING_BY_NAME: string = `${API_GATEWAY_URL}CampaignGoalSetting/CheckCampaignGoalSettingByNameExist`
export async function SendCheckCampaignGoalSettingByNameExist(request: CheckCampaignGoalSettingByNameExistRequestModel) {
    return axios.post(REQUEST_CHECK_CAMPAIGN_GOAL_SETTING_BY_NAME, request)
}



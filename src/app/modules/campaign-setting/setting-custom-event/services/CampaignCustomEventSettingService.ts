import axios from 'axios'
import {AppConfiguration} from 'read-appsettings-json'
import {CustomEventFilterModel, CustomEventFilterResponseModel, CustomEventModel} from '../models'

const API_GATEWAY_URL = AppConfiguration.Setting().REACT_APP_MLAB_GATEWAY_URL
const API_CALLBACK_URL = AppConfiguration.Setting().REACT_APP_MLAB_CALLBACK_URL
const GET_CAMPAIGN_CUSTOM_EVENT_SETTING_LIST: string = `${API_GATEWAY_URL}CampaignCustomEventSetting/GetCampaignCustomEventSettingByFilter`
const GET_CAMPAIGN_CUSTOM_EVENT_SETTING_LIST_RESULT: string = `${API_CALLBACK_URL}CampaignCustomEventSetting/GetCampaignCustomEventSettingByFilter`
const VALIDATE_CAMPAIGN_CUSTOM_EVENT_SETTING: string = `${API_GATEWAY_URL}CampaignCustomEventSetting/ValidatePlayerConfigurationRecord`
const ADD_CAMPAIGN_CUSTOM_EVENT_SETTING: string = `${API_GATEWAY_URL}CampaignCustomEventSetting/AddCampaignCustomEventSetting`
const ADD_CAMPAIGN_CUSTOM_EVENT_SETTING_RESULT: string = `${API_CALLBACK_URL}CampaignCustomEventSetting/AddCampaignCustomEventSetting`

export async function getCampaignCustomEventSettingList(request: CustomEventFilterModel) {
  return axios.post(GET_CAMPAIGN_CUSTOM_EVENT_SETTING_LIST, request)
}

export async function getCampaignCustomEventSettingListResult(request: string) {
  return axios.get<CustomEventFilterResponseModel>(
    GET_CAMPAIGN_CUSTOM_EVENT_SETTING_LIST_RESULT,
    {
      params: {
        cachedId: request,
      },
    }
  )
}

export async function validatePlayerConfigurationRecord(request: CustomEventFilterModel) {
  return axios.post(VALIDATE_CAMPAIGN_CUSTOM_EVENT_SETTING, request)
}

export async function addCampaignCustomEventSettingList(request: CustomEventModel) {
  return axios.post(ADD_CAMPAIGN_CUSTOM_EVENT_SETTING, request)
}

export async function addCampaignCustomEventSettingListResult(request: string) {
  return axios.get(
    ADD_CAMPAIGN_CUSTOM_EVENT_SETTING_RESULT,
    {
      params: {
        cachedId: request,
      },
    }
  )
}
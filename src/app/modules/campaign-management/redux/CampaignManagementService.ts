import { CampaignIdRequestModel } from './../models/request/CampaignIdRequestModel';
import axios from "axios";
import { AppConfiguration } from "read-appsettings-json"
import { CampaignListRequestModel } from "../models/request/CampaignListRequestModel";
import { SegmentationListModel } from '../models/response/SegmentationListModel';
import { CampaignGoalSettingListModel } from '../models/response/CampaignGoalSettingListModel';
import { CampaignModel } from '../models/request/CampaignModel';
import { ResponseModel } from '../../system/models';
import { CampaignFilterResponseModel } from '../models/response/CampaignFilterResponseModel';
import { LookupModel } from "../../../common/model";
import { CampaignLookUps } from '../models/options/CampaignLookUps';
import { CampaignConfigurationAutoTaggingModel } from '../models/request/CampaignConfigurationAutoTaggingModel';
import { CampaignLookupByFilterRequestModel } from '../models/request/CampaignLookupByFilterRequestModel';
import { CampaignImportPlayerRequestModel } from '../models/request/CampaignImportPlayerRequestModel';
import { ValidatedImportPlayer } from '../models/request/ValidatedImportPlayer';
import { UploadPlayerFilterModel } from '../models/request/UploadPlayerFilterModel';
import { CampaignImportPlayerResponseModel } from '../models/response/CampaignImportPlayerResponseModel';
import { CampaignImportPlayerModel } from '../models/request/CampaignImportPlayerModel';
import { CustomLookupModel } from '../../../common/model/CustomLookupModel';

const API_GATEWAY_URL = AppConfiguration.Setting().REACT_APP_MLAB_GATEWAY_URL
const API_CALLBACK_URL = AppConfiguration.Setting().REACT_APP_MLAB_CALLBACK_URL

const GET_CAMPAIGN_LIST: string = `${API_GATEWAY_URL}campaignmanagement/GetCampaignList`
const GET_ALL_CAMPAIGN: string = `${API_GATEWAY_URL}campaignmanagement/GetAllCampaign`
const GET_CAMPAIGN_LIST_RESULT: string = `${API_CALLBACK_URL}campaignmanagement/GetCampaignList`
const GET_CAMPAIGN_LOOKUP_BY_FILTER: string = `${API_GATEWAY_URL}campaignmanagement/GetCampaignLookupByFilter`
const GET_ALL_CAMPAIGN_TYPE: string = `${API_GATEWAY_URL}campaignmanagement/GetAllCampaignType`
const GET_ALL_CAMPAIGN_STATUS: string = `${API_GATEWAY_URL}campaignmanagement/GetAllCampaignStatus`
const GET_ALL_SURVEY_TEMPLATE: string = `${API_GATEWAY_URL}campaignmanagement/GetAllSurveyTemplate`
const GET_ALL_SEGMENT: string = `${API_GATEWAY_URL}campaignmanagement/GetAllSegment`
const GET_SEGMENT_WITH_SEGMENTTYPE_NAME: string = `${API_GATEWAY_URL}campaignmanagement/GetSegmentWithSegmentTypeName`
const GET_SEGMENT_BY_ID: string = `${API_GATEWAY_URL}campaignmanagement/GetSegmentationById`
const GET_CAMPAIGN_CONFIGURATION_SEGMENT_BY_ID: string = `${API_GATEWAY_URL}campaignmanagement/GetCampaignConfigurationSegmentById`
const GET_ALL_CAMPAIGN_GOAL_SETTING: string = `${API_GATEWAY_URL}campaignmanagement/GetCampaignGoalSettingList`
const GET_CAMPAIGN_GOAL_SETTING_BY_ID: string = `${API_GATEWAY_URL}campaignmanagement/GetCampaignGoalSettingById`
const SAVE_CAMPAIGN: string = `${API_GATEWAY_URL}campaignmanagement/SaveCampaign`
const GET_CAMPAIGN_BY_ID: string = `${API_GATEWAY_URL}campaignmanagement/GetCampaignById`
const GET_CAMPAIGN_BY_ID_RESULT: string = `${API_CALLBACK_URL}campaignmanagement/GetCampaignById`
const GET_CAMPAIGN_LOOKUP: string = `${API_GATEWAY_URL}campaignmanagement/GetCampaignSystemLookUp`
const GET_AUTO_TAGGING_DETAILS_BY_ID: string = `${API_GATEWAY_URL}campaignmanagement/GetAutoTaggingDetailsById`
const GET_USER_BY_MODULE: string = `${API_GATEWAY_URL}campaignmanagement/GetUsersByModule`
const GET_CAMPAIGN_SAVED_ID: string = `${API_CALLBACK_URL}campaignmanagement/GetCampaignSavedId`
const GET_ELIGIBILITY_TYPE: string = `${API_GATEWAY_URL}campaignmanagement/GetEligibilityType`
const GET_SEARCH_FILTER_TYPE: string = `${API_GATEWAY_URL}campaignmanagement/GetSearchFilter`
const GET_CAMPAIGN_NAME_WITH_FILTER: string = `${API_GATEWAY_URL}campaignmanagement/GetAllCampaignBySearchFilter`
const VALIDATE_IMPORT_PLAYERS : string = `${API_GATEWAY_URL}campaignmanagement/ValidateImportPlayers`
const VALIDATE_IMPORT_PLAYERST_RESULT: string = `${API_CALLBACK_URL}campaignmanagement/ValidateImportPlayers`
const PROCESS_IMPORT_PLAYER: string = `${API_GATEWAY_URL}campaignmanagement/ProcessCampaignImportPlayers`
const GET_PROCESS_IMPORT_PLAYER: string = `${API_CALLBACK_URL}campaignmanagement/ProcessImportPlayers`
const GET_CAMPAIGN_UPLOAD_PLAYER_LIST: string = `${API_GATEWAY_URL}campaignmanagement/GetCampaignUploadPlayerList`
const GET_CAMPAIGN_UPLOAD_PLAYER_RESULT: string = `${API_CALLBACK_URL}campaignmanagement/GetCampaignUploadPlayerList`
const REMOVE_CAMPAIGN_IMPORT_PLAYERS : string = `${API_GATEWAY_URL}campaignmanagement/RemoveCampaignImportPlayers`
const REMOVE_CAMPAIGN_IMPORT_PLAYERS_RESULT: string = `${API_CALLBACK_URL}campaignmanagement/RemoveCampaignImportPlayers`
const GET_EXPORT_CAMPAIGN_IMPORT_PLAYERS : string = `${API_GATEWAY_URL}campaignmanagement/GetExportCampaignUploadPlayerList`
const GET_ALL_CAMPAIGN_EVENT_SETTING: string = `${API_GATEWAY_URL}campaignmanagement/GetAllCampaignCustomEventSettingName`
const VALIDATE_HAS_PLAYER_IN_CAMPAIGN: string = `${API_GATEWAY_URL}campaignmanagement/ValidateHasPlayerInCampaign`
const GET_CAMPAIGN_PERIOD_BY_SOURCE_ID: string = `${API_GATEWAY_URL}campaignmanagement/GetCampaignPeriodBySourceId`

export async function getCampaignList(request: CampaignListRequestModel) {
    return axios.post(GET_CAMPAIGN_LIST, request);
}

export async function getCampaignListResult(request: string) {
    return axios.get<CampaignFilterResponseModel>(GET_CAMPAIGN_LIST_RESULT, {
      params: {
        cachedId: request,
      },
    })
  }
  export async function getvalidateImportPlayersResult(request: string) {
    return axios.get<ValidatedImportPlayer>(VALIDATE_IMPORT_PLAYERST_RESULT, {
      params: {
        cachedId: request,
      },
    })
  }
export function getCampaignLookUp() {
    return axios.get<CampaignLookUps>(GET_CAMPAIGN_LOOKUP)
}
export function getAllCampaign() {
    return axios.get<Array<LookupModel>>(GET_ALL_CAMPAIGN)
}
export function getAllCampaignBySearchFilter(searchFilterField :string, searchFilterType : number,campaignType: number) {
  return axios.get<Array<LookupModel>>(GET_CAMPAIGN_NAME_WITH_FILTER,{
    params: {
      searchFilterType: searchFilterType,
      searchFilterField: searchFilterField,
      campaignType: campaignType,
    },
  })
}
export function getCampaignLookupByFilter(request: CampaignLookupByFilterRequestModel) {
  return axios.post<Array<LookupModel>>(GET_CAMPAIGN_LOOKUP_BY_FILTER, request)
}

export function getAllCampaignStatus() {
  return axios.get<Array<LookupModel>>(GET_ALL_CAMPAIGN_STATUS)
}
 
export async function getAllCampaignType() {
    return await axios.get<Array<LookupModel>>(GET_ALL_CAMPAIGN_TYPE)
}
export function getlAllSurveyTemplate() {
  return axios.get<Array<LookupModel>>(GET_ALL_SURVEY_TEMPLATE)
} 
export function getAllSegment() {
  return axios.get<Array<LookupModel>>(GET_ALL_SEGMENT)
}
export function getSegmentWithSegmentTypeName() {
  return axios.get<Array<CustomLookupModel>>(GET_SEGMENT_WITH_SEGMENTTYPE_NAME)
}
export function getCampaignGoalSettingList() {
  return axios.get<Array<CampaignGoalSettingListModel>>(GET_ALL_CAMPAIGN_GOAL_SETTING)
}     
export function getSegmentationById(segmentId: number) {
  return axios.get<Array<SegmentationListModel>>(GET_SEGMENT_BY_ID, {
    params: {
      segmentationId: segmentId,
    },
  })
}
export function getCampaignConfigurationSegmentById(segmentId: number, varianceId: number | undefined) {
  return axios.get<Array<SegmentationListModel>>(GET_CAMPAIGN_CONFIGURATION_SEGMENT_BY_ID, {
    params: {
      segmentId: segmentId,
      varianceId: varianceId
    },
  })
}
export function getCampaignGoalSettingById(campaignGoalSettingId: number) {
  return axios.get<CampaignGoalSettingListModel>(GET_CAMPAIGN_GOAL_SETTING_BY_ID, {
    params: {
      campaignGoalSettingId: campaignGoalSettingId,
    },
  })
}

export function saveCampaign(saveCampaign: CampaignModel) {
  return axios.post<ResponseModel>(SAVE_CAMPAIGN, saveCampaign)
}
export function validateImportPlayers(request: CampaignImportPlayerRequestModel) {
  return axios.post<ResponseModel>(VALIDATE_IMPORT_PLAYERS, request)
}
export function getCampaignById(request: CampaignIdRequestModel) {
  return axios.post(GET_CAMPAIGN_BY_ID, request)
}
export async function getCampaignByIdResult(request: string) {
  return axios.get<CampaignModel>(GET_CAMPAIGN_BY_ID_RESULT, {
    params: {
      cachedId: request,
    },
  })
}
export function getCampaignSavedIdResult(request: string) {
  return axios.get<number>(GET_CAMPAIGN_SAVED_ID, {
    params: {
      cachedId: request
    },
  })
}
export function getAutoTaggingDetailsById(campaignSettingId: number) {
  return axios.get<Array<CampaignConfigurationAutoTaggingModel>>(GET_AUTO_TAGGING_DETAILS_BY_ID, {
    params: {
      campaignSettingId: campaignSettingId,
    },
  })
}
export function getUsersByModule(subMainModuleDetailId: number) {
  return axios.get<Array<CampaignConfigurationAutoTaggingModel>>(GET_USER_BY_MODULE, {
    params: {
      subMainModuleDetailId: subMainModuleDetailId,
    },
  })
}
export function getFilterTypeValues(filterTypeId: number) {
  return axios.get<Array<CampaignConfigurationAutoTaggingModel>>(GET_AUTO_TAGGING_DETAILS_BY_ID, {
    params: {
      filterTypeId: filterTypeId,
    },
  })
}
export function getEligibilityType() {
  return axios.get<Array<LookupModel>>(GET_ELIGIBILITY_TYPE)
}
export function getSearchFilter() {
  return axios.get<Array<LookupModel>>(GET_SEARCH_FILTER_TYPE)
}

export async function processImportPlayerResult(request: string) {
  return axios.get<ResponseModel>(GET_PROCESS_IMPORT_PLAYER, {
    params: {
      cachedId: request,
    },
  })
}
export function processImportPlayer(request: CampaignImportPlayerRequestModel) {
  return axios.post<ResponseModel>(PROCESS_IMPORT_PLAYER, request)
}

export async function getCampaignUploadPlayerListResult(request: string) {
  return axios.get<CampaignImportPlayerResponseModel>(GET_CAMPAIGN_UPLOAD_PLAYER_RESULT, {
    params: {
      cachedId: request,
    },
  })
}
export function getCampaignUploadPlayerList(request: UploadPlayerFilterModel) {
  return axios.post<ResponseModel>(GET_CAMPAIGN_UPLOAD_PLAYER_LIST, request)
}
export async function removeImportPlayerResult(request: string) {
  return axios.get<ResponseModel>(REMOVE_CAMPAIGN_IMPORT_PLAYERS_RESULT, {
    params: {
      cachedId: request,
    },
  })
}
export function removeImportPlayer(request: CampaignImportPlayerModel) {
  return axios.post<ResponseModel>(REMOVE_CAMPAIGN_IMPORT_PLAYERS, request)
}
export async function exportToCsvCampaignPlayerList(request: UploadPlayerFilterModel) {
  return axios.post(GET_EXPORT_CAMPAIGN_IMPORT_PLAYERS, request, {
    responseType: 'blob',
  })
}
export async function getAllCampaignCustomEventSettingName() {
  return await axios.get<Array<LookupModel>>(GET_ALL_CAMPAIGN_EVENT_SETTING)
}
export async function validateCampaignHasPlayer(campaignId : number,campaignGuid : string) {
  return await axios.get<Array<LookupModel>>(VALIDATE_HAS_PLAYER_IN_CAMPAIGN, {
    params: {
      campaignId: campaignId,
      campaignGuid: campaignGuid
    },
  })
}
export function GetCampaignPeriodBySourceId(sourceID:number) {
  return axios.get<Array<CustomLookupModel>>(GET_CAMPAIGN_PERIOD_BY_SOURCE_ID,{
    params: {
      sourceID: sourceID,
    },
  })
}

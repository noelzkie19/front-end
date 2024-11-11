import axios from 'axios'
import { AppConfiguration } from "read-appsettings-json";

import { AutoTaggingListModel } from '../setting-auto-tagging/models/AutoTaggingListModel'
import { DropdownModel } from '../setting-auto-tagging/models/DropdownModel'
import { UserTaggingModel } from '../setting-auto-tagging/models/UserTaggingModel'
import { TaggingConfigurationModel } from '../setting-auto-tagging/models/TaggingConfigurationModel'
import { AutoTaggingDetailsByIdRequestModel } from '../setting-auto-tagging/models/request/AutoTaggingDetailsByIdRequestModel';
import { AutoTaggingPointIncentiveFilterRequestModel } from '../setting-auto-tagging/models/request/AutoTaggingFiltersRequestModel';
import { CampaignSettingListResponseModel } from '../setting-auto-tagging/models/response/CampaignSettingListResponseModel';
import { AutoTaggingDetailsByIdResponseModel } from '../setting-auto-tagging/models/response/AutoTaggingDetailsByIdResponseModel';
import { AddUpdateAutoTaggingRequestModel } from '../setting-auto-tagging/models/request/AddUpdateAutoTaggingRequestModel';
import { SegmentSelectionModel } from '../setting-auto-tagging/models/SegmentSelectionModel';
import { UserSelectionModel } from '../setting-auto-tagging/models/UserSelectionModel';
import { PointIncentiveDetailsByIdResponseModel } from '../setting-point-incentive/models/response/PointIncentiveDetailsByIdResponseModel';
import { PointIncentiveDetailsByIdRequestModel } from '../setting-point-incentive/models/request/PointIncentiveDetailsByIdRequestModel';
import { AddUpdatePointIncentiveRequestModel } from '../setting-point-incentive/models/request/AddUpdatePointIncentiveRequestModel';
import { PointIncentiveListRequestModel } from '../setting-point-incentive/models/request/PointIncentiveListRequestModel';
import { CurrencyModel } from '../../../modules/system/models/CurrencyModel'
import { CurrencyCodeModel } from '../../system/models/CurrencyCodeModel';
import { AutoTaggingSettingNameRequestModel } from '../setting-auto-tagging/models/request/AutoTaggingSettingNameRequestModel'


const API_GATEWAY_URL = AppConfiguration.Setting().REACT_APP_MLAB_GATEWAY_URL
const API_CALLBACK_URL = AppConfiguration.Setting().REACT_APP_MLAB_CALLBACK_URL

const GET_AUTOTAGGING_SELECTION: string = `${API_GATEWAY_URL}campaigntaggingpointsetting/GetAutoTaggingSelection`

//  BEGIN: REQUESTS --------------------------------
const GET_CAMPAIGNSETTING_LIST: string = `${API_GATEWAY_URL}campaigntaggingpointsetting/GetCampaignSettingList`
const GET_AUTO_TAGGING_BY_ID: string = `${API_GATEWAY_URL}campaigntaggingpointsetting/GetAutoTaggingDetailsById`
const ADD_AUTO_TAGGING_LIST: string = `${API_GATEWAY_URL}campaigntaggingpointsetting/AddAutoTaggingList`

const GET_POINTINCENTIVE_ID: string = `${API_GATEWAY_URL}campaigntaggingpointsetting/GetPointIncentiveDetailsById`
const ADD_POINT_INCENTIVE_LIST: string = `${API_GATEWAY_URL}campaigntaggingpointsetting/AddPointIncentiveSetting`

//  VALIDATE EXISTING CAMPAIGN SETTING NAME
const CHECK_CAMPAIGN_SETTING_BY_NAME: string = `${API_GATEWAY_URL}campaigntaggingpointsetting/CheckCampaignSettingByNameIfExist`


//  GATEWAY DROPDOWN
const GET_SEGMENT_LIST: string = `${API_GATEWAY_URL}campaigntaggingpointsetting/GetTaggingSegment`
const GET_USER_LIST: string = `${API_GATEWAY_URL}campaigntaggingpointsetting/GetUsersByModule`
const GET_ALL_CURRENCY: string = `${API_GATEWAY_URL}system/GetCurrencyCode`


//  END: REQUESTS





//  BEGIN: RESPONSE ---------------------------------
const GET_CAMPAIGNSETTING_LIST_RESULT: string = `${API_CALLBACK_URL}campaigntaggingpointsetting/GetCampaignSettingList`
const GET_AUTO_TAGGING_BY_ID_RESULT: string = `${API_CALLBACK_URL}campaigntaggingpointsetting/GetAutoTaggingDetailsById`
const ADD_AUTO_TAGGING_LIST_RESPONSE: string = `${API_CALLBACK_URL}campaigntaggingpointsetting/AddAutoTaggingList`

const GET_POINTINCENTIVE_RESULT: string = `${API_CALLBACK_URL}campaigntaggingpointsetting/GetPointIncentiveDetailsById`
const ADD_POINT_INCENTIVE_RESPONSE: string = `${API_CALLBACK_URL}campaigntaggingpointsetting/AddPointIncentiveSetting`


//  END: RESPONSE


//  CALLS -------------------------------------------

//  GET DROPDOWN OPTION VALUES
export async function getSelectionValues(masterReferenceId: number, masterReferenceIsParent: number) {
    return axios.get(GET_AUTOTAGGING_SELECTION, {
      params: {
        masterReferenceId: masterReferenceId,
        masterReferenceIsParent: masterReferenceIsParent
      }
    })
}

export function getAllCurrencyCode() {
  return axios.get<Array<CurrencyCodeModel>>(GET_ALL_CURRENCY)
}

//  GET SELECT FOR SEGMENT LIST
export function getSegmentAutoTagging() {
  return axios.get<Array<SegmentSelectionModel>>(GET_SEGMENT_LIST)
}

//  GET SELECT FOR ACTIVE USERS LIST
export async function getTaggingUsers(moduleAccessId: number) {
  return await axios.get<Array<UserSelectionModel>>(GET_USER_LIST, {
    params: {
      subMainModuleDetailId: moduleAccessId
    }
  })
}

//  DISPLAY FOR AUTO TAGGING AND POINT INCENTIVE SEARCH RESULTS
export async function getCampaignSettingList(request: AutoTaggingPointIncentiveFilterRequestModel) {
    return axios.post(GET_CAMPAIGNSETTING_LIST, request)
}

export async function getCampaignSettingListResult(request: string) {
  return axios.get<Array<CampaignSettingListResponseModel>>(GET_CAMPAIGNSETTING_LIST_RESULT, {
    params: {
      cachedId: request,
    },
  })
}


//  DISPLAY AUTO TAGGING DETAILS BY SELECTED ID
export async function getAutoTaggingDetailsById(request: AutoTaggingDetailsByIdRequestModel) {
  return axios.post(GET_AUTO_TAGGING_BY_ID, request)
}

export async function getAutoTaggingDetailsByIdResult(request: string) {
return axios.get<AutoTaggingDetailsByIdResponseModel>(GET_AUTO_TAGGING_BY_ID_RESULT, {
  params: {
    cachedId: request,
  },
})
}

//  SAVE AUTO TAGGING 
export async function saveAutoTaggingDetails(request: AddUpdateAutoTaggingRequestModel) {
  return axios.post(ADD_AUTO_TAGGING_LIST, request)
}

export async function saveAutoTaggingDetailsResult(cacheId: string) {
  return axios.get(ADD_AUTO_TAGGING_LIST_RESPONSE, {
    params: {
      cachedId: cacheId,
    },
  })
}



//  DISPLAY POINT INCENTIVE DETAILS BY SELECTED ID
export async function getPointIncentiveDetailsById(request: PointIncentiveDetailsByIdRequestModel) {
  return axios.post(GET_POINTINCENTIVE_ID, request)
}

export async function getPointIncentiveDetailsByIdResult(request: string) {
return axios.get<PointIncentiveDetailsByIdResponseModel>(GET_POINTINCENTIVE_RESULT, {
  params: {
    cachedId: request,
  },
})
}


//  SAVE POINT INCENTIVE DETAILS 
export async function savePointIncentiveSetting(request: AddUpdatePointIncentiveRequestModel) {
  return axios.post(ADD_POINT_INCENTIVE_LIST, request)
}

export async function savePointIncentiveSettingResult(cacheId: string) {
  return axios.get(ADD_POINT_INCENTIVE_RESPONSE, {
    params: {
      cachedId: cacheId,
    },
  })
}

export async function checkCampaignSettingByNameIfExist(request: AutoTaggingSettingNameRequestModel) {
    return axios.post(CHECK_CAMPAIGN_SETTING_BY_NAME, request)
}


import {Action} from '@reduxjs/toolkit'
import {persistReducer} from 'redux-persist'
import storage from 'redux-persist/lib/storage'
import { put, takeLatest } from 'redux-saga/effects'
import { AutoTaggingListModel } from '../setting-auto-tagging/models/AutoTaggingListModel'
import { AutoTaggingDetailsByIdResponseModel } from '../setting-auto-tagging/models/response/AutoTaggingDetailsByIdResponseModel'
import { CampaignSettingListResponseModel } from '../setting-auto-tagging/models/response/CampaignSettingListResponseModel'
import { TaggingConfigurationModel } from '../setting-auto-tagging/models/TaggingConfigurationModel'
import { UserTaggingModel } from '../setting-auto-tagging/models/UserTaggingModel'
import { PointIncentiveDetailsByIdResponseModel } from '../setting-point-incentive/models/response/PointIncentiveDetailsByIdResponseModel'
import { GoalParameterListModel } from '../setting-point-incentive/models/GoalParameterListModel'
import { PointToValueListModel } from '../setting-point-incentive/models/PointToValueListModel'

export interface ActionWithPayload<T> extends Action {
  payload?: T
}

// -----------------------------------------------------------------
// DEFINE ALL ACTIONS TO BE CALL ON PAGES FOR DISPATCHING
// -----------------------------------------------------------------
export const actionTypes = {
    getCampaignSettingList: 'getCampaignSettingList',
    getAutoTaggingDetailsById: 'getAutoTaggingDetailsById',
    getTaggingConfigByList: 'getTaggingConfigByList',
    getUsersConfigByList: 'getUsersConfigByList',
    getPointIncentiveDetailsById: 'getPointIncentiveDetailsById',
    getGoalParametersConfigList: 'getGoalParametersConfigList',
    getPointToValueConfigList: 'getPointToValueConfigList'
}
// -----------------------------------------------------------------
// DEFINE INITIAL STATE TO BE RETURN
// -----------------------------------------------------------------
const initialCampaignSettingState: ICampaignSettingState = {
    autoTaggingList: [],
    getAutoTaggingDetailsById: undefined,
    getTaggingConfigByList: [],
    usersConfigByList: [],
    getUsersConfigByList: [],
    getPointIncentiveDetailsById: undefined,
    getGoalParametersConfigList: [],
    getPointToValueConfigList: [],
    getCampaignSettingList: [],
}
// -----------------------------------------------------------------
// DEFINED STATE TO BE RETURN BASED ON MODEL INTERFACE
// -----------------------------------------------------------------
export interface ICampaignSettingState {
    autoTaggingList?: Array<CampaignSettingListResponseModel>,
    getAutoTaggingDetailsById?: AutoTaggingDetailsByIdResponseModel,
    getTaggingConfigByList?: Array<TaggingConfigurationModel>,
    usersConfigByList?: Array<UserTaggingModel>,
    getUsersConfigByList?: Array<UserTaggingModel>,
    getPointIncentiveDetailsById?: PointIncentiveDetailsByIdResponseModel,
    getGoalParametersConfigList?: Array<GoalParameterListModel>,
    getPointToValueConfigList?: Array<PointToValueListModel>,
    getCampaignSettingList?: Array<CampaignSettingListResponseModel>,
}
// -----------------------------------------------------------------
// THIS WILL CHECK ACTION CALLS
// -----------------------------------------------------------------
export const reducer = persistReducer(
    { storage, key: 'mlab-persist-campaignsetting', whitelist: ['result','getCampaignSettingList', 'getAutoTaggingDetailsById', 'getTaggingConfigByList'
                ,'getUsersConfigByList'] },
    (state: ICampaignSettingState = initialCampaignSettingState, action: ActionWithPayload<ICampaignSettingState>) => {
        switch (action.type) {
            case actionTypes.getCampaignSettingList: {
                const getCampaignSettingList = action.payload?.getCampaignSettingList
                return { ...state, getCampaignSettingList: getCampaignSettingList }
            }
            case actionTypes.getAutoTaggingDetailsById: {
                const getAutoTaggingDetailsById = action.payload?.getAutoTaggingDetailsById
                return { ...state, getAutoTaggingDetailsById: getAutoTaggingDetailsById }
            }
            case actionTypes.getTaggingConfigByList: {
                const getTaggingConfigByList = action.payload?.getTaggingConfigByList
                return { ...state, getTaggingConfigByList: getTaggingConfigByList }
            }
            case actionTypes.getUsersConfigByList: {
                const getUsersConfigByList = action.payload?.getUsersConfigByList
                return { ...state, getUsersConfigByList: getUsersConfigByList }
            }
          
            case actionTypes.getPointIncentiveDetailsById: {
                const getPointIncentiveDetailsById = action.payload?.getPointIncentiveDetailsById
                return { ...state, getPointIncentiveDetailsById: getPointIncentiveDetailsById }
            }

            case actionTypes.getGoalParametersConfigList: {
                const getGoalParametersConfigList = action.payload?.getGoalParametersConfigList
                return { ...state, getGoalParametersConfigList: getGoalParametersConfigList }
            }

            case actionTypes.getPointToValueConfigList: {
                const getPointToValueConfigList = action.payload?.getPointToValueConfigList
                return { ...state, getPointToValueConfigList: getPointToValueConfigList }
            }

            case actionTypes.getCampaignSettingList: {
                const getCampaignSettingList = action.payload?.getCampaignSettingList
                return { ...state, getCampaignSettingList: getCampaignSettingList }
            }

            default:
                return state
        }
    },

)

//  dispatch
export const actions = {
    // requestUser: () => ({
    //     type: actionTypes.getCampaignSettingList,
    // }),
    
    getCampaignSettingList: (getCampaignSettingList: CampaignSettingListResponseModel[]) => ({ type: actionTypes.getCampaignSettingList, payload : { getCampaignSettingList }}),
    getAutoTaggingDetailsById: (getAutoTaggingDetailsById: AutoTaggingDetailsByIdResponseModel) => ({ type: actionTypes.getAutoTaggingDetailsById, payload : { getAutoTaggingDetailsById }}),
    getTaggingConfigByList: (getTaggingConfigByList: TaggingConfigurationModel[]) => ({ type: actionTypes.getTaggingConfigByList, payload : { getTaggingConfigByList }}),
    getUsersConfigByList: (getUsersConfigByList: UserTaggingModel[]) => ({ type: actionTypes.getUsersConfigByList, payload : { getUsersConfigByList }}),
    getPointIncentiveDetailsById: (getPointIncentiveDetailsById: PointIncentiveDetailsByIdResponseModel) => ({ type: actionTypes.getPointIncentiveDetailsById, payload : { getPointIncentiveDetailsById }}),
    getGoalParametersConfigList: (getGoalParametersConfigList: GoalParameterListModel[]) => ({ type: actionTypes.getGoalParametersConfigList, payload : { getGoalParametersConfigList }}),
    getPointToValueConfigList: (getPointToValueConfigList: PointToValueListModel[]) => ({ type: actionTypes.getPointToValueConfigList, payload : { getPointToValueConfigList }}),
}

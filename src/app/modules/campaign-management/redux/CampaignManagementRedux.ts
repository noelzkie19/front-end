import { CampaignModel, CampaignModelFactory } from './../models/request/CampaignModel';
import { CampaignInformationModel, CampaignInformationModelFactory } from './../models/request/CampaignInformationModel';
// -----------------------------------------------------------------
// DEFINE ALL ACTIONS TO BE CALL ON PAGES FOR DISPATCHING

import { Action } from "@reduxjs/toolkit"
import { persistReducer } from "redux-persist"
import storage from "redux-persist/lib/storage"
import { CampaignListModel } from "../models/response/CampaignListModel"
import { CampaignConfigurationModel } from '../models/request/CampaignConfigurationModel';
import { CampaignConfigurationAutoTaggingModel } from '../models/request/CampaignConfigurationAutoTaggingModel';
import { CurrencyRowsModel } from '../../system/models';
import { LookupModel } from '../../../common/model';
import { UserSelectionModel } from '../../campaign-setting/setting-auto-tagging/models/UserSelectionModel';
import { RetentionCampaignPlayerListModel } from '../models/response/RetentionCampaignPlayerListModel';
import { CustomLookupModel } from '../../../common/model/CustomLookupModel';

export interface ActionWithPayload<T> extends Action {
    payload?: T
  }
  
// -----------------------------------------------------------------
export const actionTypes = {
    getCampaignList: 'getCampaignList',
    UserRequested: 'UserRequested',
    campaignInformation : 'campaignInformation',
    campaign : 'campaign',
    getCampaignType: 'getCampaignType',
    getCampaignName: 'getCampaignName',
    getCampaignInformationCurrency: 'getCampaignInformationCurrency',
    getAllSurveyTemplate: 'getAllSurveyTemplate',
    getAllSegment: 'getAllSegment',
    getAllCampaignGoalParameterAmount: 'getAllCampaignGoalParameterAmount',
    getAllCampaignGoalParameterCount: 'getAllCampaignGoalParameterCount',
    getAllCampaignGoalParameterPointSetting: 'getAllCampaignGoalParameterPointSetting',
    getAllCampaignGoalParameterValueSetting: 'getAllCampaignGoalParameterValueSetting',
    getAllAutoTaggingSetting: 'getAllAutoTaggingSetting',
    getAllCampaignStatus: 'getAllCampaignStatus',
    clearState:'clearState',
    clearCampaignState: 'clearCampaignState',
    getAllUserAgentForTagging: 'getAllUserAgentForTagging',
    campaignStatusId : 'campaignStatusId',
    clearCampaignList: 'clearCampaignList',
    mode: 'mode',
    getEligibilityType: 'getEligibilityType',
    getSearchFilter: 'getSearchFilter',
    eligibilityTypeId: 'eligibilityTypeId',
    campaignRetentionPlayers: 'campaignRetentionPlayers',
    campaignPeriodFrom: 'campaignPeriodFrom',
    getAllCampaignCustomEvent: 'getAllCampaignCustomEvent',
    campaignPeriodTo: 'campaignPeriodTo',
    getCampaignPeriod: 'getCampaignPeriodBySourceId'
}
// -----------------------------------------------------------------
// DEFINE INITIAL STATE TO BE RETURN
// -----------------------------------------------------------------
const initialSystemState: ICampaignState = {
    getCampaignList: [],
    campaignInformation : CampaignInformationModelFactory(),
    campaign: CampaignModelFactory(),
    campaignConfiguration :undefined,
    campaignConfigurationAutoTagging :undefined,
    getCampaignType : [],
    getCampaignName : [],
    getCampaignInformationCurrency: [],
    getAllSurveyTemplate: [],
    getAllSegment: [],
    getAllCampaignGoalParameterCount: [],
    getAllCampaignGoalParameterAmount: [],
    getAllCampaignGoalParameterPointSetting: [],
    getAllCampaignGoalParameterValueSetting: [],
    getAllAutoTaggingSetting: [],
    getAllCampaignStatus: [],
    getAllUserAgentForTagging: [],
    campaignStatusId : 0,
    mode: '',
    getEligibilityType: [],
    getSearchFilter: [],
    eligibilityTypeId: 0,
    campaignRetentionPlayers: [],
    campaignPeriodFrom : undefined,
    getAllCampaignCustomEvent: [],
    campaignPeriodTo : undefined,
    getCampaignPeriod:[]

}
// -----------------------------------------------------------------
// DEFINED STATE TO BE RETURN BASED ON MODEL INTERFACE
// -----------------------------------------------------------------
export interface ICampaignState {
    getCampaignList?: Array<CampaignListModel>,
    campaign? : CampaignModel,
    campaignInformation? : CampaignInformationModel,
    campaignConfiguration? : CampaignConfigurationModel,
    campaignConfigurationAutoTagging? : CampaignConfigurationAutoTaggingModel,
    getCampaignType? : Array<LookupModel>,
    getCampaignName? :  Array<LookupModel>,
    getCampaignInformationCurrency? : Array<CurrencyRowsModel>,
    getAllSurveyTemplate? : Array<LookupModel>, 
    getAllSegment? : Array<LookupModel>,
    getAllCampaignGoalParameterCount? : Array<LookupModel>,
    getAllCampaignGoalParameterAmount?:  Array<LookupModel>,
    getAllCampaignGoalParameterPointSetting? : Array<LookupModel>,
    getAllCampaignGoalParameterValueSetting?:  Array<LookupModel>,
    getAllAutoTaggingSetting? : Array<LookupModel>,
    getAllCampaignStatus? : Array<LookupModel>,
    getAllUserAgentForTagging? : Array<UserSelectionModel>,
    campaignStatusId? : number
    mode? : string
    getEligibilityType?:  Array<LookupModel>,
    getSearchFilter?:  Array<LookupModel>,
    eligibilityTypeId? : number,
    campaignRetentionPlayers?: Array<RetentionCampaignPlayerListModel>,
    campaignPeriodFrom? : any,
    getAllCampaignCustomEvent? :  Array<LookupModel>,
    campaignPeriodTo?: any,
    getCampaignPeriod?:Array<CustomLookupModel>

}
// -----------------------------------------------------------------
// THIS WILL CHECK ACTION CALLS
// -----------------------------------------------------------------
export const reducer = persistReducer(
    { storage, key: 'mlab-persist-campaign-management', whitelist: ['result'
        ,'getCampaignList',
        'campaignInformation'
        ,'campaign'
        ,'getCampaignType'
        ,'getAllSurveyTemplate'
        ,'getAllSegment'
        ,'getAllCampaignGoalParameterCount'
        ,'getAllCampaignGoalParameterAmount'
        ,'getAllCampaignStatus'
        ,'clearState'
        ,'clearCampaignState'
        ,'getAllUserAgentForTagging'
        ,'campaignStatusId'
        , 'mode'
        ,'getAllCampaignGoalParameterPointSetting'
        ,'getAllCampaignGoalParameterValueSetting'
        ,'clearCampaignList'
        ,'getAllAutoTaggingSetting'
        ,'getEligibilityType'
        ,'getSearchFilter'
        ,'eligibilityTypeId'
        ,'campaignRetentionPlayers'
        ,'campaignPeriodFrom'
        ,'getAllCampaignCustomEvent'
        ,'campaignPeriodTo'
        ,'getCampaignPeriod'
    ] },
    (state: ICampaignState = initialSystemState, action: ActionWithPayload<ICampaignState>) => {
        switch (action.type) {
            case actionTypes.UserRequested: {
                return { ...state, user: undefined }
            }        
            case actionTypes.campaignInformation: {
                const campaignInformation = action.payload?.campaignInformation
                return {...state, campaignInformation}
            }
            case actionTypes.getCampaignList: {
                const getCampaignList = action.payload?.getCampaignList
                return {...state, getCampaignList}
            }
            case actionTypes.campaign: {
                const campaign = action.payload?.campaign
                return {...state, campaign}
            }     
            case actionTypes.getCampaignType: {
                const getCampaignType = action.payload?.getCampaignType
                return {...state, getCampaignType}
            }
            case actionTypes.getCampaignName: {
                const getCampaignName = action.payload?.getCampaignName
                return {...state, getCampaignName}
            } 
            case actionTypes.getCampaignInformationCurrency: {
                const getCampaignInformationCurrency = action.payload?.getCampaignInformationCurrency
                return {...state, getCampaignInformationCurrency}
            }
            case actionTypes.getAllSurveyTemplate: {
                const getAllSurveyTemplate = action.payload?.getAllSurveyTemplate
                return {...state, getAllSurveyTemplate}
            }  
            case actionTypes.getAllSegment: {
                const getAllSegment = action.payload?.getAllSegment
                return {...state, getAllSegment}
            }     
            case actionTypes.getAllCampaignGoalParameterCount: {
                const getAllCampaignGoalParameterCount = action.payload?.getAllCampaignGoalParameterCount
                return {...state, getAllCampaignGoalParameterCount}
            } 
            case actionTypes.getAllCampaignGoalParameterAmount: {
                const getAllCampaignGoalParameterAmount = action.payload?.getAllCampaignGoalParameterAmount
                return {...state, getAllCampaignGoalParameterAmount}
            }   
            case actionTypes.getAllCampaignGoalParameterPointSetting: {
                const getAllCampaignGoalParameterPointSetting = action.payload?.getAllCampaignGoalParameterPointSetting
                return {...state, getAllCampaignGoalParameterPointSetting}
            }                  
            case actionTypes.getAllCampaignGoalParameterValueSetting: {
                const getAllCampaignGoalParameterValueSetting = action.payload?.getAllCampaignGoalParameterValueSetting
                return {...state, getAllCampaignGoalParameterValueSetting}
            }  
            case actionTypes.getAllAutoTaggingSetting: {
                const getAllAutoTaggingSetting = action.payload?.getAllAutoTaggingSetting
                return {...state, getAllAutoTaggingSetting}
            }  
            case actionTypes.getAllCampaignStatus: {
                const getAllCampaignStatus = action.payload?.getAllCampaignStatus
                return {...state, getAllCampaignStatus}
            }            
            case actionTypes.getAllUserAgentForTagging: {
                const getAllUserAgentForTagging = action.payload?.getAllUserAgentForTagging
                return {...state, getAllUserAgentForTagging}
            }
            case actionTypes.campaignStatusId: {
                const campaignStatusId = action.payload?.campaignStatusId
                return {...state, campaignStatusId}
            }            
            case actionTypes.eligibilityTypeId: {
                const eligibilityTypeId = action.payload?.eligibilityTypeId
                return {...state, eligibilityTypeId}
            }
            case actionTypes.mode: {
                const mode = action.payload?.mode
                return {...state, mode}
            } 
            case actionTypes.clearState: {
                return {
                   ...initialSystemState
            }
            }  
            case actionTypes.clearCampaignState: {
                return {...state, campaign: CampaignModelFactory() }      
            } 
            
            case actionTypes.clearCampaignList: {
                return {...state, clearCampaignList: [] }      
            } 
            case actionTypes.getEligibilityType: {
                const getEligibilityType = action.payload?.getEligibilityType
                return {...state, getEligibilityType}
            } 
            case actionTypes.getSearchFilter: {
                const getSearchFilter = action.payload?.getSearchFilter
                return {...state, getSearchFilter}
            }
            case actionTypes.campaignRetentionPlayers: {
                const campaignRetentionPlayers = action.payload?.campaignRetentionPlayers
                return {...state, campaignRetentionPlayers}
            }
            case actionTypes.campaignPeriodFrom: {
                const campaignPeriodFrom = action.payload?.campaignPeriodFrom
                return {...state, campaignPeriodFrom}
            }  
            case actionTypes.getAllCampaignCustomEvent: {
                const getAllCampaignCustomEvent = action.payload?.getAllCampaignCustomEvent
                return {...state, getAllCampaignCustomEvent}
            }   
            case actionTypes.campaignPeriodTo: {
                const campaignPeriodTo = action.payload?.campaignPeriodTo
                return {...state, campaignPeriodTo}
            }  
            case actionTypes.getCampaignPeriod: {
                const getCampaignPeriod = action.payload?.getCampaignPeriod
                return {...state, getCampaignPeriod}
            } 
            default:
                return state
        }
    },

)


// -----------------------------------------------------------------
// ACTUAL ACTION TO BE CALL ON PAGE FOR DISPATCHING
// -----------------------------------------------------------------
export const actions = {
    //**  CHECK ACTION REQUEST*/
     requestUser: () => ({
        type: actionTypes.UserRequested,
     }),
    // getMessageStatusList: (getMessageStatusList: GetMessageStatusListResponse[]) => ({ type: actionTypes.getMessageStatusList, payload: { getMessageStatusList } }),
    getCampaignList: (getCampaignList: CampaignListModel[]) => ({ type: actionTypes.getCampaignList, payload: { getCampaignList } }),
    campaignInformation: (campaignInformation: CampaignInformationModel) => ({ type: actionTypes.campaignInformation, payload: { campaignInformation } }),
    campaign: (campaign: CampaignModel) => ({ type: actionTypes.campaign, payload: { campaign } }),
    getCampaignType: (getCampaignType: LookupModel[]) => ({ type: actionTypes.getCampaignType, payload: { getCampaignType } }),
    getCampaignName: (getCampaignName: LookupModel[]) => ({ type: actionTypes.getCampaignName, payload: { getCampaignName } }),
    getCampaignInformationCurrency: (getCampaignInformationCurrency: CurrencyRowsModel[]) => ({ type: actionTypes.getCampaignInformationCurrency, payload: { getCampaignInformationCurrency } }),
    getAllSurveyTemplate: (getAllSurveyTemplate: LookupModel[]) => ({ type: actionTypes.getAllSurveyTemplate, payload: { getAllSurveyTemplate } }),
    getAllSegment: (getAllSegment: LookupModel[]) => ({ type: actionTypes.getAllSegment, payload: { getAllSegment } }),
    getAllCampaignGoalParameterCount: (getAllCampaignGoalParameterCount: LookupModel[]) => ({ type: actionTypes.getAllCampaignGoalParameterCount, payload: { getAllCampaignGoalParameterCount } }),
    getAllCampaignGoalParameterAmount: (getAllCampaignGoalParameterAmount: LookupModel[]) => ({ type: actionTypes.getAllCampaignGoalParameterAmount, payload: { getAllCampaignGoalParameterAmount } }),
    getAllCampaignGoalParameterPointSetting: (getAllCampaignGoalParameterPointSetting: LookupModel[]) => ({ type: actionTypes.getAllCampaignGoalParameterPointSetting, payload: { getAllCampaignGoalParameterPointSetting } }),
    getAllCampaignGoalParameterValueSetting: (getAllCampaignGoalParameterValueSetting: LookupModel[]) => ({ type: actionTypes.getAllCampaignGoalParameterValueSetting, payload: { getAllCampaignGoalParameterValueSetting } }),
    getAllAutoTaggingSetting: (getAllAutoTaggingSetting: LookupModel[]) => ({ type: actionTypes.getAllAutoTaggingSetting, payload: { getAllAutoTaggingSetting } }),
    getAllCampaignStatus: (getAllCampaignStatus: LookupModel[]) => ({ type: actionTypes.getAllCampaignStatus, payload: { getAllCampaignStatus } }),
    clearState:  () => ({ type: actionTypes.clearState }),
    clearCampaignState:   () => ({ type: actionTypes.clearCampaignState }), //() => ({ type: actionTypes.clearCampaignState }),
    getAllUserAgentForTagging: (getAllUserAgentForTagging: UserSelectionModel[]) => ({ type: actionTypes.getAllUserAgentForTagging, payload: { getAllUserAgentForTagging } }),
    campaignStatusId: (campaignStatusId: number) => ({ type: actionTypes.campaignStatusId, payload: { campaignStatusId } }),
    mode: (mode: string) => ({ type: actionTypes.mode, payload: { mode } }),
    clearCampaignList: () => ({ type: actionTypes.clearCampaignList}),
    getEligibilityType: (getEligibilityType: LookupModel[]) => ({ type: actionTypes.getEligibilityType, payload: { getEligibilityType } }),
    getSearchFilter: (getSearchFilter: LookupModel[]) => ({ type: actionTypes.getSearchFilter, payload: { getSearchFilter } }),
    eligibilityTypeId: (eligibilityTypeId: number) => ({ type: actionTypes.eligibilityTypeId, payload: { eligibilityTypeId } }),
    campaignRetentionPlayers: (campaignRetentionPlayers: RetentionCampaignPlayerListModel[]) => ({ type: actionTypes.campaignRetentionPlayers, payload: { campaignRetentionPlayers } }),
    campaignPeriodFrom: (campaignPeriodFrom: any) => ({ type: actionTypes.campaignPeriodFrom, payload: { campaignPeriodFrom } }),
    getAllCampaignCustomEvent:(getAllCampaignCustomEvent: LookupModel[]) => ({ type: actionTypes.getAllCampaignCustomEvent, payload: { getAllCampaignCustomEvent } }), 
    campaignPeriodTo: (campaignPeriodTo: any) => ({ type: actionTypes.campaignPeriodTo, payload: { campaignPeriodTo } }),
    getCampaignPeriod: (getCampaignPeriod: any) => ({ type: actionTypes.getCampaignPeriod, payload: { getCampaignPeriod } })
}

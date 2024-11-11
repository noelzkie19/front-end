import {Action} from '@reduxjs/toolkit'
import { persistReducer } from 'redux-persist'
import storage from 'redux-persist/lib/storage'
import { GoalTypeCommunicationRecordUdtModel } from '../models/GoalTypeCommunicationRecordUdtModel'
import { GoalTypeDepositUdtModel } from '../models/GoalTypeDepositUdtModel'
import { GoalTypeDepositCurrencyMinMaxUdtModel } from '../models/GoalTypeDepositCurrencyMinMaxUdtModel'
import { CommunicationRecordDepositListModel } from '../models/CommunicationRecordDepositListModel'
import { ActiveEndedCampaignListModel } from '../models/ActiveEndedCampaignListModel'
import { CampaignGoalSettingListModel } from '../models'

export interface ActionWithPayload<T> extends Action {
    payload?: T
}

// -----------------------------------------------------------------
// DEFINE ALL ACTIONS TO BE CALL ON PAGES FOR DISPATCHING
// -----------------------------------------------------------------
export const actionTypes = {
    goalTypeCommnunicationRecordDepositList: 'goalTypeCommnunicationRecordDepositList',
    goalTypeCommunicationRecordList: 'goalTypeCommunicationRecordList', //Commnunication Record Child
    goalTypeDepositList: 'goalTypeDeposit', // Deposit Child
    goalTypeDepositCurrencyList: 'goalTypeDepositCurrency', // Deposit Child
    goalTypeActiveEndedCampaignList: 'goalTypeActiveEndedCampaignList', // Campaign
    goalTypeCampaignGoalSettingByIdData: 'goalTypeCampaignGoalSettingByIdData' //Campaing Seeting by Id
}

// -----------------------------------------------------------------
// DEFINE INITIAL STATE TO BE RETURN
// -----------------------------------------------------------------
const initialGoalSettingState: IGoalSettingState = {
    goalTypeCommnunicationRecordDepositList: undefined,
    goalTypeCommunicationRecordList: undefined,
    goalTypeDepositList: undefined,
    goalTypeDepositCurrencyList: undefined,
    goalTypeActiveEndedCampaignList: undefined,
    goalTypeCampaignGoalSettingByIdData: undefined,
}

// -----------------------------------------------------------------
// DEFINED STATE TO BE RETURN BASED ON MODEL INTERFACE
// -----------------------------------------------------------------
export interface IGoalSettingState {
    goalTypeCommnunicationRecordDepositList?: CommunicationRecordDepositListModel
    goalTypeCommunicationRecordList?: Array<GoalTypeCommunicationRecordUdtModel>,
    goalTypeDepositList?: Array<GoalTypeDepositUdtModel>,
    goalTypeDepositCurrencyList?: Array<GoalTypeDepositCurrencyMinMaxUdtModel>,
    goalTypeActiveEndedCampaignList?: Array<ActiveEndedCampaignListModel>,
    goalTypeCampaignGoalSettingByIdData?: CampaignGoalSettingListModel
}

// -----------------------------------------------------------------
// THIS WILL CHECK ACTION CALLS
// -----------------------------------------------------------------
export const reducer = persistReducer(
    { storage, key: 'mlab-persist-goal-setting', whitelist: ['goalTypeCommunicationRecordList','goalTypeDepositList','goalTypeDepositCurrencyList','goalTypeCommnunicationRecordDepositList','goalTypeActiveEndedCampaignList','goalTypeCampaignGoalSettingByIdData'] },
    (state: IGoalSettingState = initialGoalSettingState, action: ActionWithPayload<IGoalSettingState>) => {
        switch (action.type) {
            case actionTypes.goalTypeCommunicationRecordList: {
                const data = action.payload?.goalTypeCommunicationRecordList
                return {...state, goalTypeCommunicationRecordList: data}
            }
            case actionTypes.goalTypeDepositList: {
                const data = action.payload?.goalTypeDepositList
                return {...state, goalTypeDepositList: data}
            }   
            case actionTypes.goalTypeDepositCurrencyList: {
                const data = action.payload?.goalTypeDepositCurrencyList
                return {...state, goalTypeDepositCurrencyList: data}
            }    
            case actionTypes.goalTypeCommnunicationRecordDepositList:{
                const data = action.payload?.goalTypeCommnunicationRecordDepositList
                return{...state, goalTypeCommnunicationRecordDepositList: data}
            }
            case actionTypes.goalTypeActiveEndedCampaignList:{
                const data = action.payload?.goalTypeActiveEndedCampaignList
                return{...state, goalTypeActiveEndedCampaignList: data}
            }
            case actionTypes.goalTypeCampaignGoalSettingByIdData:{
                const data = action.payload?.goalTypeCampaignGoalSettingByIdData
                return{...state, goalTypeCampaignGoalSettingByIdData: data}
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
    goalTypeCommunicationRecordList: (goalTypeCommunicationRecordList: Array<GoalTypeCommunicationRecordUdtModel>) => ({ type: actionTypes.goalTypeCommunicationRecordList, payload: { goalTypeCommunicationRecordList } }),
    goalTypeDepositList: (goalTypeDepositList: Array<GoalTypeDepositUdtModel>) => ({ type: actionTypes.goalTypeDepositList, payload: { goalTypeDepositList } }),
    goalTypeDepositCurrencyList: (goalTypeDepositCurrencyList: Array<GoalTypeDepositCurrencyMinMaxUdtModel>) => ({ type: actionTypes.goalTypeDepositCurrencyList, payload: { goalTypeDepositCurrencyList } }),
    goalTypeCommnunicationRecordDepositList: (goalTypeCommnunicationRecordDepositList: CommunicationRecordDepositListModel[]) => ({ type: actionTypes.goalTypeCommnunicationRecordDepositList, payload: { goalTypeCommnunicationRecordDepositList } }),
    goalTypeActiveEndedCampaignList: (goalTypeActiveEndedCampaignList: Array<ActiveEndedCampaignListModel>) => ({ type: actionTypes.goalTypeActiveEndedCampaignList, payload: { goalTypeActiveEndedCampaignList } }),
    goalTypeCampaignGoalSettingByIdData: (goalTypeCampaignGoalSettingByIdData: CampaignGoalSettingListModel) => ({ type: actionTypes.goalTypeCampaignGoalSettingByIdData, payload: { goalTypeCampaignGoalSettingByIdData } }),
}
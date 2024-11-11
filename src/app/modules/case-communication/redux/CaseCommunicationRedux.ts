import {Action} from '@reduxjs/toolkit'
import { persistReducer } from 'redux-persist'
import { AnswerSelectedOption, CommunicationFeedBackResponse, CommunicationSurveyQuestionAnswerResponse } from '../models'
import storage from 'redux-persist/lib/storage'

export interface ActionWithPayload<T> extends Action {
    payload?: T
}

// -----------------------------------------------------------------
// DEFINE ALL ACTIONS TO BE CALL ON PAGES FOR DISPATCHING
// -----------------------------------------------------------------
export const actionTypes = {
    communicationFeedbackList: 'communicationFeedbackList',
    communicationSurveyQuestionAnswer: 'communicationSurveyQuestionAnswer',
    surveyAnswerSelectedOption: 'surveyAnswerSelectedOption'
}

// -----------------------------------------------------------------
// DEFINE INITIAL STATE TO BE RETURN
// -----------------------------------------------------------------
const initialSystemState: ICaseCommuncationState = {
    communicationFeedbackList: undefined,
    communicationSurveyQuestionAnswer: undefined,
    surveyAnswerSelectedOption: undefined,
}

// -----------------------------------------------------------------
// DEFINED STATE TO BE RETURN BASED ON MODEL INTERFACE
// -----------------------------------------------------------------
export interface ICaseCommuncationState {
    communicationFeedbackList?: CommunicationFeedBackResponse
    communicationSurveyQuestionAnswer?: CommunicationSurveyQuestionAnswerResponse,
    surveyAnswerSelectedOption?: AnswerSelectedOption
}

// -----------------------------------------------------------------
// THIS WILL CHECK ACTION CALLS
// -----------------------------------------------------------------
export const reducer = persistReducer(
    { storage, key: 'mlab-persist-case-communication', whitelist: ['communicationFeedbackList','communicationSurveyQuestionAnswer','surveyAnswerSelectedOption'] },
    (state: ICaseCommuncationState = initialSystemState, action: ActionWithPayload<ICaseCommuncationState>) => {
        switch (action.type) {
            case actionTypes.communicationFeedbackList: {
                const data = action.payload?.communicationFeedbackList
                return {...state, communicationFeedbackList: data}
            }
            case actionTypes.communicationSurveyQuestionAnswer: {
                const data = action.payload?.communicationSurveyQuestionAnswer
                return {...state, communicationSurveyQuestionAnswer: data}
            }
            case actionTypes.surveyAnswerSelectedOption: {
                const data = action.payload?.surveyAnswerSelectedOption
                return {...state, surveyAnswerSelectedOption: data}
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
    communicationFeedbackList: (communicationFeedbackList: CommunicationFeedBackResponse[]) => ({ type: actionTypes.communicationFeedbackList, payload: { communicationFeedbackList } }),
    communicationSurveyQuestionAnswer: (communicationSurveyQuestionAnswer: CommunicationSurveyQuestionAnswerResponse[]) => ({ type: actionTypes.communicationSurveyQuestionAnswer, payload: { communicationSurveyQuestionAnswer } }),
    surveyAnswerSelectedOption: (surveyAnswerSelectedOption: AnswerSelectedOption[]) => ({ type: actionTypes.surveyAnswerSelectedOption, payload: { surveyAnswerSelectedOption } }),
}
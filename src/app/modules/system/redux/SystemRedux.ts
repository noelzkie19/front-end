import { FeedbackAnswerModel } from '../models/FeedbackAnswerModel';
import { FeedbackCategoryModel } from './../models/FeedbackCategoryModel';
import { FieldTypeModel } from './../models/FieldTypeModel'
import { CodeListModel } from './../models/CodeListModel'
import { Action } from '@reduxjs/toolkit'
import { persistReducer } from 'redux-persist'
import storage from 'redux-persist/lib/storage'
import { CodeListTypeModel } from '../models/CodeListTypeModel'
import { TopicModel, OperatorModel, SubTopicModel, SubtTopicTableModel, TopicResponseModel, SubtopicPostModel, MessageTypeListResponse, MessageResponseList, FeedbackTypeModel, SurveyQuestionModel, MessageTypePostRequest, FeedBackTypeResponse, BrandResponseModel, GetTopiCaseTypeModel } from '../models'
import { GetMessageStatusListResponse } from '../models/response/GetMessageStatusListResponse'
import { SurveyTemplateModel } from '../models/SurveyTemplateModel';
import { PlayerConfigurationModel } from '../models/PlayerConfigurationModel';
import { VIPLevelModel } from '../models/VIPLevelModel';
import { RiskLevelModel } from '../models/RiskLevelModel';
import { SurveyQuestionAnswerModel } from '../models/SurveyQuestionAnswerModel';
import { SurveyTemplateQuestionModel } from '../models/SurveyTemplateQuestionModel';
import { LanguageModel } from '../models/LanguageModel';
import { CountryModel } from '../models/CountryModel';
import { SubtopicUdtResponseModel } from '../models/response/SubtopicUdtResponseModel';

export interface ActionWithPayload<T> extends Action {
    payload?: T
}

// -----------------------------------------------------------------
// DEFINE ALL ACTIONS TO BE CALL ON PAGES FOR DISPATCHING
// -----------------------------------------------------------------
export const actionTypes = {
    getOperatorList: 'getOperatorList',
    getOperatorById: 'getOperatorById',
    updateOperator: 'updateOperator',
    addOperator: 'addOperator',
    getAllCurrency: 'getAllCurrency',
    getBrandExistingList: 'getBrandExistingList',
    getAllBrand: 'getAllBrand',
    GetAllOperator: 'GetAllOperator',
    getOperatorDetails: 'getOperatorDetails',
    getTopcList: 'getTopcList',
    UserRequested: 'UserRequested',
    clearTopicList: 'clearTopicList',
    getSubtopicList: 'getSubtopicList',
    postSubTopic: 'postSubTopic',
    getCodeList: 'getCodeList',
    getCodeListType: 'getCodeListType',
    getFieldType: 'getFieldType',
    postTopic: 'postTopic',
    getMessageTypeList: 'getMessageTypeList',
    postMessageTypeList: 'postMessageTypeList',
    getMessageStatusList: 'getMessageStatusList',
    postMessageStatusList: 'postMessageStatusList',
    getMessageResponseList: 'getMessageResponseList',
    postMessageResponseList: 'postMessageResponseList',
    getFeedbackTypeList: 'getFeedbackTypeList',
    getFeedbackCategoryList: 'getFeedbackCategoryList',
    getFeedbackAnswerList: 'getFeedbackAnswerList',
    getSurveyQuestionList: 'getSurveyQuestionList',
    getSurveyTemplateList: 'getSurveyTemplateList',
    getPlayerConfigurationList: 'getPlayerConfigurationList',
    getFeedbackTypes: 'getFeedbackTypes',
    postFeedbackTypes: 'postFeedbackTypes',
    getAllBrandList: 'getAllBrandList',
    getVIPLevelList: 'getVIPLevelList',
    getRiskLevelList: 'getRiskLevelList',
    getSurveyQuestionAnswers: 'getSurveyQuestionAnswers',
    getSurveyTemplateQuestions: 'getSurveyTemplateQuestions',
    getPlayerConfigLanguageList: 'getPlayerConfigLanguageList',
    getPlayerConfigCountryList: 'getPlayerConfigCountryList',
    getTopicCaseTypeInfo: 'getTopicCaseTypeInfo'
}
// -----------------------------------------------------------------
// DEFINE INITIAL STATE TO BE RETURN
// -----------------------------------------------------------------
const initialSystemState: ISystemState = {
    operatorId: undefined,
    operatorName: undefined,
    brandId: undefined,
    brandName: undefined,
    updateOperator: undefined,
    createOperator: undefined,
    brandIds: undefined,
    brandNames: undefined,
    operatorIds: undefined,
    getTopcList: undefined,
    getSubtopicList: undefined,
    postSubTopic: undefined,
    codeList: [],
    codeListType: [],
    fieldType: [],
    postTopic: undefined,
    getMessageTypeList: undefined,
    postMessageTypeList: undefined,
    getMessageStatusList: undefined,
    postMessageStatusList: undefined,
    getMessageResponseList: undefined,
    postMessageResponseList: undefined,
    feedbackTypeList: [],
    feedbackCategoryList: [],
    feedbackAnswerList: [],
    surveyQuestionList: [],
    surveyTemplateList: [],
    playerConfigurationList: [],
    postFeedbackTypes: [],
    getFeedbackTypes: [],
    brandList: [],
    vipLevelList: [],
    riskLevelList: [],
    questionAnswers: [],
    templateQuestions: [],
    playerConfigLanguageList: [],
    playerConfigCountryList: [],
    getTopicCaseTypeInfo: undefined,
}
// -----------------------------------------------------------------
// DEFINED STATE TO BE RETURN BASED ON MODEL INTERFACE
// -----------------------------------------------------------------
export interface ISystemState {
    operatorId?: number
    operatorName?: string
    brandId?: number
    brandName?: string
    updateOperator?: OperatorModel
    createOperator?: OperatorModel
    brandIds?: string,
    brandNames?: string,
    operatorIds?: string,
    getTopcList?: TopicModel,
    getSubtopicList?: SubtTopicTableModel,
    postSubTopic?: SubTopicModel,
    codeList?: Array<CodeListModel>
    codeListType?: Array<CodeListTypeModel>
    fieldType?: Array<FieldTypeModel>
    postTopic?: TopicResponseModel
    getMessageTypeList?: MessageTypeListResponse
    postMessageTypeList?: MessageTypePostRequest
    getMessageStatusList?: GetMessageStatusListResponse
    postMessageStatusList?: GetMessageStatusListResponse
    getMessageResponseList?: MessageResponseList
    postMessageResponseList?: MessageResponseList
    feedbackTypeList?: Array<FeedbackTypeModel>
    feedbackCategoryList?: Array<FeedbackCategoryModel>
    feedbackAnswerList?: Array<FeedbackAnswerModel>
    surveyQuestionList?: Array<SurveyQuestionModel>
    surveyTemplateList?: Array<SurveyTemplateModel>
    playerConfigurationList?: Array<PlayerConfigurationModel>,
    postFeedbackTypes?: FeedBackTypeResponse[],
    getFeedbackTypes?: FeedBackTypeResponse[],
    brandList?: Array<BrandResponseModel>,
    vipLevelList?: Array<VIPLevelModel>,
    riskLevelList?: Array<RiskLevelModel>,
    questionAnswers?: Array<SurveyQuestionAnswerModel>,
    templateQuestions?: Array<SurveyTemplateQuestionModel>,
    playerConfigLanguageList?: Array<LanguageModel>,
    playerConfigCountryList?: Array<CountryModel>,
    getTopicCaseTypeInfo?: GetTopiCaseTypeModel
}

const setCodelistPayload = (state: any, action: any, type: any) => {
    if(type == actionTypes.getCodeList){
        const codeListData = action.payload?.codeList
        return { ...state, codeList: codeListData } 
    } else if (type == actionTypes.getCodeListType){
        const codeListTypeData = action.payload?.codeListType
        return { ...state, codeListType: codeListTypeData }
    } else if (type == actionTypes.getFieldType){
        const fieldTypeData = action.payload?.fieldType
        return { ...state, fieldType: fieldTypeData }
    }
}

const setOperatorPayload = (type: any) => {
    if(type == actionTypes.getOperatorList) {
        return { operatorId: undefined, operatorName: undefined, brandId: undefined, brandName: undefined }
    } else if(type == actionTypes.getOperatorById) {
        return { operatorId: undefined }
    } else if(type == actionTypes.getOperatorDetails) {
        return { operatorIds: undefined }
    } else if(type == actionTypes.addOperator) {
        return { createOperator: undefined }
    } else if(type == actionTypes.updateOperator) {
        return { updateOperator: undefined }
    }
}

const setFeedbackTypePayload = (state: any, action: any, type: any) => {
    if(type == actionTypes.getFeedbackTypeList) {
        const getData = action.payload?.feedbackTypeList
        return { ...state, feedbackTypeList: getData }
    } else if(type == actionTypes.getFeedbackTypes) {
        const getData = action.payload?.getFeedbackTypes
        return { ...state, getFeedbackTypes: getData }
    } else if(type == actionTypes.postFeedbackTypes) {
        const postData = action.payload?.postFeedbackTypes
        return { ...state, postFeedbackTypes: postData }
    }
}
const setSurveyQuestionPayload = (state: any, action: any, type: any) => {
    if(type == actionTypes.getSurveyQuestionList) {
        const getData = action.payload?.surveyQuestionList
        return { ...state, surveyQuestionList: getData }
    } else if(type == actionTypes.getSurveyQuestionAnswers) {
        const getData = action.payload?.questionAnswers
        return { ...state, questionAnswers: getData }
    }
}

const setSurveyTemplatePayload = (state: any, action: any, type: any) => {
    if(type == actionTypes.getSurveyTemplateList) {
        const getData = action.payload?.surveyTemplateList
        return { ...state, surveyTemplateList: getData }
    } else if(actionTypes.getSurveyTemplateQuestions) {
        const getData = action.payload?.templateQuestions
        return { ...state, templateQuestions: getData }
    }
}

// -----------------------------------------------------------------
// THIS WILL CHECK ACTION CALLS
// -----------------------------------------------------------------
export const reducer = persistReducer(
    {
        storage, key: 'v100-demo1-auth', whitelist: ['result', 'getTopcList', 'clearTopicList',
            'getSubtopicList', 'postSubTopic', 'postTopic', 'getMessageTypeList', 'postMessageTypeList',
            'getMessageStatusList', 'postMessageStatusList', 'getMessageResponseList', 'postMessageResponseList',
            'getFeedbackTypeList', 'getFeedbackCategoryList', 'getFeedbackAnswerList',
            'getSurveyQuestionList', 'getSurveyTemplateList', 'getPlayerConfigurationList', 'postFeedbackTypes', 'getFeedbackTypes',
            'getSurveyQuestionList', 'getSurveyTemplateList', 'getPlayerConfigurationList', 'getAllBrandList',
            'getVIPLevelList', 'getRiskLevelList', 'getSurveyQuestionAnswers', 'getSurveyTemplateQuestions', 'getPlayerConfigCountryList','getTopicCaseTypeInfo']
    },
    (state: ISystemState = initialSystemState, action: ActionWithPayload<ISystemState>) => {
        switch (action.type) {
            //user
            case actionTypes.UserRequested: {
                return { ...state, user: undefined }
            }
            //operator
            case actionTypes.getOperatorList:
            case actionTypes.getOperatorById:
            case actionTypes.getOperatorDetails:
            case actionTypes.addOperator:
            case actionTypes.updateOperator: {
                return setOperatorPayload(action.type)
            }
            case actionTypes.getBrandExistingList: {
                return { brandIds: undefined, brandNames: undefined }
            }
            case actionTypes.getTopcList: {
                const getTopicData = action.payload?.getTopcList
                return { ...state, getTopcList: getTopicData }
            }
            case actionTypes.getSubtopicList: {
                const getSubtopicData = action.payload?.getSubtopicList
                return { ...state, getSubtopicList: getSubtopicData }
            }
            case actionTypes.postSubTopic: {
                const postSubtopicData = action.payload?.postSubTopic
                return { ...state, postSubTopic: postSubtopicData }
            }
            //codelist
            case actionTypes.getCodeList:
            case actionTypes.getCodeListType:
            case actionTypes.getFieldType: {
                return setCodelistPayload(state, action, action.type)
            }
            case actionTypes.postTopic: {
                const postTopic = action.payload?.postTopic
                return { ...state, postTopic }
            }
            case actionTypes.getMessageTypeList: {
                const getdata = action.payload?.getMessageTypeList
                return { ...state, getMessageTypeList: getdata }
            }
            case actionTypes.postMessageTypeList: {
                const postData = action.payload?.postMessageTypeList
                return { ...state, postMessageTypeList: postData }
            }
            case actionTypes.getMessageStatusList: {
                const getdata = action.payload?.getMessageStatusList
                return { ...state, getMessageStatusList: getdata }
            }
            case actionTypes.postMessageStatusList: {
                const postData = action.payload?.postMessageStatusList
                return { ...state, postMessageStatusList: postData }
            }
            case actionTypes.getMessageResponseList: {
                const getdata = action.payload?.getMessageResponseList
                return { ...state, getMessageResponseList: getdata }
            }
            case actionTypes.postMessageResponseList: {
                const postData = action.payload?.postMessageResponseList
                return { ...state, postMessageResponseList: postData }
            }
            //feedbackType
            case actionTypes.getFeedbackTypeList:
            case actionTypes.getFeedbackTypes: 
            case actionTypes.postFeedbackTypes: {
                return setFeedbackTypePayload(state, action, action.type)
            }
            //feedbackCategory
            case actionTypes.getFeedbackCategoryList: {
                const getData = action.payload?.feedbackCategoryList
                return { ...state, feedbackCategoryList: getData }
            }
            //feedbackAnswer
            case actionTypes.getFeedbackAnswerList: {
                const getData = action.payload?.feedbackAnswerList
                return { ...state, feedbackAnswerList: getData }
            }
            //surveyQuestion
            case actionTypes.getSurveyQuestionList: 
            case actionTypes.getSurveyQuestionAnswers: {
                return setSurveyQuestionPayload(state, action, action.type)
            }
            //surveyTemplate
            case actionTypes.getSurveyTemplateList: 
            case actionTypes.getSurveyTemplateQuestions: {
                return setSurveyTemplatePayload(state, action, action.type)
            }
            case actionTypes.getPlayerConfigurationList: {
                const getData = action.payload?.playerConfigurationList
                return { ...state, playerConfigurationList: getData }
            }
            case actionTypes.getAllBrandList: {
                const getData = action.payload?.brandList
                return { ...state, brandList: getData }
            }
            case actionTypes.getVIPLevelList: {
                const getData = action.payload?.vipLevelList
                return { ...state, vipLevelList: getData }
            }
            case actionTypes.getRiskLevelList: {
                const getData = action.payload?.riskLevelList
                return { ...state, riskLevelList: getData }
            }
            case actionTypes.getPlayerConfigLanguageList: {
                const getData = action.payload?.playerConfigLanguageList
                return { ...state, playerConfigLanguageList: getData }
            }
            case actionTypes.getPlayerConfigCountryList: {
                const getData = action.payload?.playerConfigCountryList
                return { ...state, playerConfigCountryList: getData }
            }
            case actionTypes.getTopicCaseTypeInfo:{
                const getData = action.payload?.getTopicCaseTypeInfo
                return {...state, getTopicCaseTypeInfo: getData}
            }
            case actionTypes.getAllCurrency: 
            case actionTypes.getAllBrand: 
            case actionTypes.GetAllOperator:
            case actionTypes.clearTopicList: {
                return {}
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

    getOperatorList: (operatorId: number, operatorName: string, brandId: number, brandName: string) => ({ type: actionTypes.getOperatorList, payload: { operatorId, operatorName, brandId, brandName } }),
    getOperatorById: (operatorId: number) => ({ type: actionTypes.getOperatorById, payload: { operatorId } }),
    updateOperator: (updateOperator: OperatorModel) => ({ type: actionTypes.updateOperator, payload: { updateOperator } }),
    addOperator: (createOperator: OperatorModel) => ({ type: actionTypes.updateOperator, payload: { createOperator } }),
    getAllCurrency: () => ({ type: actionTypes.getAllCurrency }),
    getBrandExistingList: (brandIds: string, brandNames: string) => ({ type: actionTypes.updateOperator, payload: { brandIds, brandNames } }),
    getAllBrand: () => ({ type: actionTypes.getAllBrand }),
    GetAllOperator: () => ({ type: actionTypes.GetAllOperator }),
    getOperatorDetails: (operatorIds: string) => ({ type: actionTypes.getOperatorDetails, payload: { operatorIds } }),
    getTopcList: (getTopcList: TopicResponseModel[]) => ({ type: actionTypes.getTopcList, payload: { getTopcList } }),
    clearTopicList: () => ({ type: actionTypes.clearTopicList }),
    GetAllCodeList: (codeList: CodeListModel[]) => ({ type: actionTypes.getCodeList, payload: { codeList }, }),
    GetAllCodeListType: (codeListType: CodeListTypeModel[]) => ({ type: actionTypes.getCodeListType, payload: { codeListType }, }),
    GetAllFieldType: (fieldType: FieldTypeModel[]) => ({ type: actionTypes.getFieldType, payload: { fieldType }, }),
    getSubtopicList: (getSubtopicList: SubtopicUdtResponseModel[]) => ({ type: actionTypes.getSubtopicList, payload: { getSubtopicList } }),
    postSubTopic: (postSubTopic: SubtopicPostModel[]) => ({ type: actionTypes.postSubTopic, payload: { postSubTopic } }),
    postTopic: (postTopic: TopicResponseModel[]) => ({ type: actionTypes.postTopic, payload: { postTopic } }),
    getMessageTypeList: (getMessageTypeList: MessageTypeListResponse[]) => ({ type: actionTypes.getMessageTypeList, payload: { getMessageTypeList } }),
    postMessageTypeList: (postMessageTypeList: MessageTypePostRequest[]) => ({ type: actionTypes.postMessageTypeList, payload: { postMessageTypeList } }),
    getMessageStatusList: (getMessageStatusList: GetMessageStatusListResponse[]) => ({ type: actionTypes.getMessageStatusList, payload: { getMessageStatusList } }),
    postMessageStatusList: (postMessageStatusList: GetMessageStatusListResponse[]) => ({ type: actionTypes.postMessageStatusList, payload: { postMessageStatusList } }),
    getMessageResponseList: (getMessageResponseList: MessageResponseList[]) => ({ type: actionTypes.getMessageResponseList, payload: { getMessageResponseList } }),
    postMessageResponseList: (postMessageResponseList: MessageResponseList[]) => ({ type: actionTypes.postMessageResponseList, payload: { postMessageResponseList } }),
    getFeedbackTypeList: (feedbackTypeList: FeedbackTypeModel[]) => ({ type: actionTypes.getFeedbackTypeList, payload: { feedbackTypeList } }),
    getFeedbackCategoryList: (feedbackCategoryList: FeedbackCategoryModel[]) => ({ type: actionTypes.getFeedbackCategoryList, payload: { feedbackCategoryList } }),
    getFeedbackAnswerList: (feedbackAnswerList: FeedbackAnswerModel[]) => ({ type: actionTypes.getFeedbackAnswerList, payload: { feedbackAnswerList } }),
    getSurveyQuestionList: (surveyQuestionList: SurveyQuestionModel[]) => ({ type: actionTypes.getSurveyQuestionList, payload: { surveyQuestionList } }),
    getSurveyTemplateList: (surveyTemplateList: SurveyTemplateModel[]) => ({ type: actionTypes.getSurveyTemplateList, payload: { surveyTemplateList } }),
    getPlayerConfigurationList: (playerConfigurationList: PlayerConfigurationModel[]) => ({ type: actionTypes.getPlayerConfigurationList, payload: { playerConfigurationList } }),
    getFeedbackTypes: (getFeedbackTypes: FeedBackTypeResponse[]) => ({ type: actionTypes.getFeedbackTypes, payload: { getFeedbackTypes } }),
    postFeedbackTypes: (postFeedbackTypes: FeedBackTypeResponse[]) => ({ type: actionTypes.postFeedbackTypes, payload: { postFeedbackTypes } }),
    getAllBrandList: (brandList: BrandResponseModel[]) => ({ type: actionTypes.getAllBrandList, payload: { brandList } }),
    getVIPLevelList: (vipLevelList: VIPLevelModel[]) => ({ type: actionTypes.getVIPLevelList, payload: { vipLevelList } }),
    getRiskLevelList: (riskLevelList: RiskLevelModel[]) => ({ type: actionTypes.getRiskLevelList, payload: { riskLevelList } }),
    getSurveyQuestionAnswers: (questionAnswers: SurveyQuestionAnswerModel[]) => ({ type: actionTypes.getSurveyQuestionAnswers, payload: { questionAnswers } }),
    getSurveyTemplateQuestions: (templateQuestions: SurveyTemplateQuestionModel[]) => ({ type: actionTypes.getSurveyTemplateQuestions, payload: { templateQuestions } }),
    getPlayerConfigLanguageList: (playerConfigLanguageList: LanguageModel[]) => ({ type: actionTypes.getPlayerConfigLanguageList, payload: { playerConfigLanguageList } }),
    getPlayerConfigCountryList: (playerConfigCountryList: CountryModel[]) => ({ type: actionTypes.getPlayerConfigCountryList, payload: { playerConfigCountryList } }),
    getTopicCaseTypeInfo: (getTopicCaseTypeInfo: GetTopiCaseTypeModel) => ({ type: actionTypes.getTopicCaseTypeInfo, payload: { getTopicCaseTypeInfo } }),
}

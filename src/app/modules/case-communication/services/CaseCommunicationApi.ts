import axios from 'axios'
import {AppConfiguration} from 'read-appsettings-json'
import {ResponseModel} from '../../system/models/ResponseModel'
import {AddCaseCommunicationRequest, CaseCampaignByIdRequest, CaseCampaignByIdResponse, CaseContributorByIdResponse, CaseContributorListRequest, CaseInformationRequest, CaseInformationResponse, ChangeCaseStatusRequest, CommunicationByIdRequest, CommunicationFeedbackListRequest, CommunicationFeedBackResponse, CommunicationListRequest, CommunicationListResponse, CommunicationResponse, CommunicationSurveyQuestionResponse, CommunicationSurveyRequest, SurveyTemplateResponse, UpdateCaseInformationRequest} from '../models'

// -----------------------------------------------------------------
// GLOBAL CONFIGURATION FOR AXIOS
// -----------------------------------------------------------------
const API_GATEWAY_URL: string = AppConfiguration.Setting().REACT_APP_MLAB_GATEWAY_URL!
const API_CALLBACK_URL = AppConfiguration.Setting().REACT_APP_MLAB_CALLBACK_URL

// -----------------------------------------------------------------
// GET CASE INFORMATIONS BY ID
// -----------------------------------------------------------------
const REQUEST_GET_CASE_INFORMATION_BY_ID: string = `${API_GATEWAY_URL}CaseCommunication/GetCaseInformationbyId`
const GET_CASE_INFORMATION_BY_ID: string = `${API_CALLBACK_URL}CaseCommunication/GetCaseInformationbyId`

export async function SendGetCaseInformationbyId(request: CaseInformationRequest) {
    return axios.post(REQUEST_GET_CASE_INFORMATION_BY_ID, request)
}
export async function GetCaseInformationbyId(request: string) {
    return axios.get<CaseInformationResponse>(GET_CASE_INFORMATION_BY_ID, {
        params: {
            cachedId: request,
        },
    })
}


// -----------------------------------------------------------------
// GET COMMUNICATION DETAIL BY ID
// -----------------------------------------------------------------
const REQUEST_GET_COMMUNICATION_BY_ID: string = `${API_GATEWAY_URL}CaseCommunication/GetCommunicationById`
const GET_COMMUNICATION_BY_ID: string = `${API_CALLBACK_URL}CaseCommunication/GetCommunicationById`

export async function SendGetCommunicationById(request: CommunicationByIdRequest) {
    return axios.post(REQUEST_GET_COMMUNICATION_BY_ID, request)
}
export async function GetCommunicationById(request: string) {
    return axios.get<CommunicationResponse>(GET_COMMUNICATION_BY_ID, {
        params: {
            cachedId: request,
        },
    })
}

// -----------------------------------------------------------------
// GET COMMUNICATION LIST
// -----------------------------------------------------------------
const REQUEST_GET_COMMUNICATION_LIST: string = `${API_GATEWAY_URL}CaseCommunication/GetCommunicationList`
const GET_COMMUNICATION_LIST: string = `${API_CALLBACK_URL}CaseCommunication/GetCommunicationList`

export async function SendGetCommunicationList(request: CommunicationListRequest) {
    return axios.post(REQUEST_GET_COMMUNICATION_LIST, request)
}
export async function GetCommunicationList(request: string) {
    return axios.get<CommunicationListResponse>(GET_COMMUNICATION_LIST, {
        params: {
            cachedId: request,
        },
    })
}

// -----------------------------------------------------------------
// CHANGE CASE STATUS
// -----------------------------------------------------------------
const REQUEST_CHANGE_CASE_STATUS: string = `${API_GATEWAY_URL}CaseCommunication/ChangeCaseStatus`

export async function SendChangeCaseStatus(request: ChangeCaseStatusRequest) {
    return axios.post(REQUEST_CHANGE_CASE_STATUS, request)
}

// -----------------------------------------------------------------
// GET LIST OF COMMUNICATIONS SURVEY
// -----------------------------------------------------------------
const REQUEST_GET_COMMUNICATION_SURVEY: string = `${API_GATEWAY_URL}CaseCommunication/GetCommunicationSurvey`
const GET_COMMUNICATION_SURVEY: string = `${API_CALLBACK_URL}CaseCommunication/GetCommunicationSurvey`

export async function SendGetCommucationSurvey(request: CommunicationSurveyRequest) {
    return axios.post(REQUEST_GET_COMMUNICATION_SURVEY, request)
}
export async function GetCommucationSurvey(request: string) {
    return axios.get<Array<CommunicationSurveyQuestionResponse>>(GET_COMMUNICATION_SURVEY, {
        params: {
            cachedId: request,
        },
    })
}

// -----------------------------------------------------------------
// GET LIST OF COMMUNICATIONS FEEDBACK LIST
// -----------------------------------------------------------------
const REQUEST_GET_COMMUNICATION_FEEDBACK_LIST: string = `${API_GATEWAY_URL}CaseCommunication/GetCommunicationFeedbackList`
const GET_COMMUNICATION_FEEDBACK_LIST: string = `${API_CALLBACK_URL}CaseCommunication/GetCommunicationFeedbackList`

export async function SendGetCommunicationFeedbackList(request: CommunicationFeedbackListRequest) {
    return axios.post(REQUEST_GET_COMMUNICATION_FEEDBACK_LIST, request)
}
export async function GetCommunicationFeedbackList(request: string) {
    return axios.get<Array<CommunicationFeedBackResponse>>(GET_COMMUNICATION_FEEDBACK_LIST, {
        params: {
            cachedId: request,
        },
    })
}

// -----------------------------------------------------------------
// ADD CASE AND COMMUNICATIONS
// -----------------------------------------------------------------
const REQUEST_ADD_CASE_COMMUNICATION: string = `${API_GATEWAY_URL}CaseCommunication/AddCaseCommunication`

export async function AddCaseCommunication(request: AddCaseCommunicationRequest) {
    return axios.post(REQUEST_ADD_CASE_COMMUNICATION, request)
}

// -----------------------------------------------------------------
// GET COMMUNICATION SURVEY LIST OF QUESTIONS AND ANSWERS
// -----------------------------------------------------------------
const GET_COMMUNICATION_SURVEY_QUESTION_ANSWERS: string = `${API_GATEWAY_URL}system/GetCommunicationSurveyQuestionAnswers`

export async function GetCommunicationSurveyQuestionAnswers(request: number) {
    return axios.get<SurveyTemplateResponse>(GET_COMMUNICATION_SURVEY_QUESTION_ANSWERS, {
        params: {
            campaignId: request,
        },
    })
}

// -----------------------------------------------------------------
// UPDATE CASE AND COMMUNICATIONS
// -----------------------------------------------------------------
const REQUEST_UPDATE_CASE_INFORMATION: string = `${API_GATEWAY_URL}CaseCommunication/UpdateCaseInformation`

export async function UpdateCaseInformation(request: UpdateCaseInformationRequest) {
    return axios.post(REQUEST_UPDATE_CASE_INFORMATION, request)
}

// -----------------------------------------------------------------
// GET CASE CAMPAIGN BY ID
// -----------------------------------------------------------------
const REQUEST_GET_CASE_CAMPAIGN_BY_ID: string = `${API_GATEWAY_URL}CaseCommunication/GetCaseCampaignById`
const GET_CASE_CAMPAIGN_BY_ID: string = `${API_CALLBACK_URL}CaseCommunication/GetCaseCampaignById`

export async function SendGetCaseCampaignById(request: CaseCampaignByIdRequest) {
    return axios.post(REQUEST_GET_CASE_CAMPAIGN_BY_ID, request)
}
export async function GetCaseCampaignById(request: string) {
    return axios.get<CaseCampaignByIdResponse>(GET_CASE_CAMPAIGN_BY_ID, {
        params: {
            cachedId: request,
        },
    })
}

// -----------------------------------------------------------------
// GET CASE CONTRIBUTOR LIST
// -----------------------------------------------------------------
const REQUEST_GET_CASE_CONTRIBUTOR_BY_ID: string = `${API_GATEWAY_URL}CaseCommunication/GetCaseContributorById`
const GET_CASE_CONTRIBUTOR_BY_ID: string = `${API_CALLBACK_URL}CaseCommunication/GetCaseContributorById`

export async function SendGetCaseContributorById(request: CaseContributorListRequest) {
    return axios.post(REQUEST_GET_CASE_CONTRIBUTOR_BY_ID, request)
}
export async function GetCaseContributorById(request: string) {
    return axios.get<Array<CaseContributorByIdResponse>>(GET_CASE_CONTRIBUTOR_BY_ID, {
        params: {
            cachedId: request,
        },
    })
}
// -----------------------------------------------------------------
// GET CASE CONTRIBUTOR LIST
// -----------------------------------------------------------------
const REQUEST_VALIDATE_CASE_CAMPAIGN_PLAYER: string = `${API_GATEWAY_URL}CaseCommunication/ValidateCaseCampaignPlayer`
export async function ValidateCaseCampaignPlayer(playerId: string, campaignId: number, brandName: string) {
    return axios.get<ResponseModel>(REQUEST_VALIDATE_CASE_CAMPAIGN_PLAYER, {
      params: {
        playerId: playerId,
        campaignId: campaignId,
        brandName: brandName
      },
    })
}
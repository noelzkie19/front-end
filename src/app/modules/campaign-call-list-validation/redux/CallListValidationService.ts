import axios from 'axios'
import { AppConfiguration } from "read-appsettings-json";
import { AgentValidationsRequestModel } from '../models/request/AgentValidationsRequestModel'
import { CallEvaluationRequestModel } from '../models/request/CallEvaluationRequestModel'
import { CallValidationListRequestModel } from '../models/request/CallValidationListRequestModel'
import { LeaderValidationsRequestModel } from '../models/request/LeaderValidationsRequestModel'
import { DeleteCallEvaluationRequestModel } from '../models/request/DeleteCallEvaluationRequestModel'
import { LeaderJustificationRequestModel } from '../models/request/LeaderJustificationRequestModel'
import { CallValidationFilterResponseModel } from '../models/response/CallValidationFilterResponseModel'
import { CallValidationListResponseModel } from '../models/response/CallValidationListResponseModel'
import { LeaderJustificationListResponseModel } from '../models/response/LeaderJustificationListResponseModel'
import { CallValidationFilterRequestModel } from '../models/request/CallValidationFilterRequestModel'

const API_GATEWAY_URL = AppConfiguration.Setting().REACT_APP_MLAB_GATEWAY_URL

const GET_CALL_VALIDATION_FILTER: string = `${API_GATEWAY_URL}CallListValidation/GetCallListValidationFilter`
const GET_CALL_VALIDATION_LIST: string = `${API_GATEWAY_URL}CallListValidation/GetCallValidationList`
const GET_LEADER_JUSTIFICATION_LIST: string = `${API_GATEWAY_URL}CallListValidation/GetLeaderJustificationList`
const UPSERT_AGENT_VALIDATION: string = `${API_GATEWAY_URL}CallListValidation/UpsertAgentValidation`
const UPSERT_LEADER_VALIDATION: string = `${API_GATEWAY_URL}CallListValidation/UpsertLeaderValidation`
const ADD_CALL_EVALUATION: string = `${API_GATEWAY_URL}CallListValidation/UpsertCallEvaluation`
const DELETE_CALL_EVALUATION: string = `${API_GATEWAY_URL}CallListValidation/DeleteCallEvaluation`
const UPSERT_LEADER_JUSTIFICATION: string = `${API_GATEWAY_URL}CallListValidation/UpsertLeaderJustification`



export async function getCallListValidationFilter(request: CallValidationFilterRequestModel) {
    return await axios.post<CallValidationFilterResponseModel>(GET_CALL_VALIDATION_FILTER, request)
}

export async function getCallValidationList(request: CallValidationListRequestModel) {
    return axios.post<CallValidationListResponseModel>(GET_CALL_VALIDATION_LIST, request)
}

export async function upsertAgentValidation(request: Array<AgentValidationsRequestModel>) {
    return axios.post(UPSERT_AGENT_VALIDATION, request)
}

export async function upsertLeaderValidation(request: Array<LeaderValidationsRequestModel>) {
    return axios.post(UPSERT_LEADER_VALIDATION, request)
}

export async function upsertCallEvaluation(request: CallEvaluationRequestModel) {
    return axios.post(ADD_CALL_EVALUATION, request)
}
export async function deleteCallEvaluation(request: DeleteCallEvaluationRequestModel) {
    return axios.post(DELETE_CALL_EVALUATION, request)
}

export async function upsertLeaderJustification(request: Array<LeaderJustificationRequestModel>) {
    return axios.post(UPSERT_LEADER_JUSTIFICATION, request)
}

export async function getLeaderJustificationList() {
    return axios.get<Array<LeaderJustificationListResponseModel>>(GET_LEADER_JUSTIFICATION_LIST)
}
import axios from 'axios'
import { AppConfiguration } from "read-appsettings-json";
import { AgentListRequestModel } from '../models/request/AgentListRequestModel'
import { AgentStatusRequestModel } from '../models/request/AgentStatusRequestModel'
import { DailyReportRequestModel } from '../models/request/DailyReportRequestModel'
import { AutoTaggedNameListResponseModel } from '../models/response/AutoTaggedNameListResponseModel'
import { AgentListResponseModel } from '../models/response/AgentListResponseModel'
import { DeleteDailyReportRequestModel } from '../models/request/DeleteDailyReportRequestModel'
import { TaggedNameRequestModel } from '../models/request/TaggedNameRequestModel'

const API_GATEWAY_URL = AppConfiguration.Setting().REACT_APP_MLAB_GATEWAY_URL

const GET_AUTO_TAGGING_NAME_LIST: string = `${API_GATEWAY_URL}AgentMonitoring/GetAutoTaggingNameList`
const GET_CAMPAIGN_AGENT_LIST: string = `${API_GATEWAY_URL}AgentMonitoring/GetCampaignAgentList`
const UPDATE_CAMPAIGN_AGENT_STATUS: string = `${API_GATEWAY_URL}AgentMonitoring/UpdateCampaignAgentStatus`
const UPSERT_DAILY_REPORT: string = `${API_GATEWAY_URL}AgentMonitoring/UpsertDailyReport`
const DELETE_DAILY_REPORT: string = `${API_GATEWAY_URL}AgentMonitoring/DeleteDailyReportById`

export async function GetAutoTaggingNameList(request: TaggedNameRequestModel) {
    return axios.post<Array<AutoTaggedNameListResponseModel>>(GET_AUTO_TAGGING_NAME_LIST,request)
}

export async function GetCampaignAgentList(request: AgentListRequestModel) {
    return axios.post<AgentListResponseModel>(GET_CAMPAIGN_AGENT_LIST, request)
}

export async function updateCampaignAgentStatus(request: AgentStatusRequestModel) {
    return axios.post(UPDATE_CAMPAIGN_AGENT_STATUS, request)
}

export async function upsertDailyReport(request: Array<DailyReportRequestModel>) {
    return axios.post(UPSERT_DAILY_REPORT, request)
}

export async function deleteDailyReport(request: Array<DeleteDailyReportRequestModel>) {
    return axios.post(DELETE_DAILY_REPORT, request)
}


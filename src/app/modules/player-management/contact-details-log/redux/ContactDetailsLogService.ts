import axios from 'axios'
import {AppConfiguration} from 'read-appsettings-json'
import {ContactLogListRequestModel} from '../models/ContactLogListRequestModel'
import {ContactLogSummaryResponseModel} from '../models/ContactLogSummaryResponseModel'
import {ContactLogTeamListRequestModel} from '../models/ContactLogTeamListRequestModel'

const API_GATEWAY_URL = AppConfiguration.Setting().REACT_APP_MLAB_GATEWAY_URL
const API_CALLBACK_URL = AppConfiguration.Setting().REACT_APP_MLAB_CALLBACK_URL

const GET_CONTACT_LOG_SUMMARY_LIST: string = `${API_GATEWAY_URL}player/GetViewContactLogList`
const GET_CONTACT_LOG_TEAM_LIST: string = `${API_GATEWAY_URL}player/GetViewContactLogTeamList`
const GET_CONTACT_LOG_USER_LIST: string = `${API_GATEWAY_URL}player/GetViewContactLogUserList`

const GET_CONTACT_LOG_SUMMARY_RESULT_LIST: string = `${API_CALLBACK_URL}playermanagement/GetViewContactLogList`
const GET_CONTACT_LOG_TEAM_RESULT_LIST: string = `${API_CALLBACK_URL}playermanagement/GetViewContactLogTeamList`
const GET_CONTACT_LOG_USER_RESULT_LIST: string = `${API_CALLBACK_URL}playermanagement/GetViewContactLogUserList`
const EXPORT_TO_CSV_CONTACT_LOG_SUMMARY: string = `${API_GATEWAY_URL}player/ExportToCsvSummaryContactLog` 
const EXPORT_TO_CSV_CONTACT_LOG_USER: string = `${API_GATEWAY_URL}player/ExportToCsvUserContactLog` 
const EXPORT_TO_CSV_CONTACT_LOG_TEAM: string = `${API_GATEWAY_URL}player/ExportToCsvTeamContactLog` 

export async function getViewContactLogList(request: ContactLogListRequestModel) {
  return axios.post(GET_CONTACT_LOG_SUMMARY_LIST, request)
}
export async function getViewContactLogTeamList(request: ContactLogListRequestModel) {
  return axios.post(GET_CONTACT_LOG_TEAM_LIST, request)
}
export async function getViewContactLogUserList(request: ContactLogListRequestModel) {
  return axios.post(GET_CONTACT_LOG_USER_LIST, request)
}
export async function getViewContactLogListResult(request: string) {
  return axios.get<ContactLogSummaryResponseModel>(GET_CONTACT_LOG_SUMMARY_RESULT_LIST, {
    params: {
      cachedId: request,
    },
  })
}
export async function exportToCsvSummaryList(request: ContactLogListRequestModel) {
  return axios.post(EXPORT_TO_CSV_CONTACT_LOG_SUMMARY, request, {
    responseType: 'blob',
  })
}
export async function exportToCsvUserList(request: ContactLogListRequestModel) {
    return axios.post(EXPORT_TO_CSV_CONTACT_LOG_USER, request, {
      responseType: 'blob',
    })
  }
export async function exportToCsvTeamList(request: ContactLogListRequestModel) {
    return axios.post(EXPORT_TO_CSV_CONTACT_LOG_TEAM, request, {
      responseType: 'blob',
    })
  }
    
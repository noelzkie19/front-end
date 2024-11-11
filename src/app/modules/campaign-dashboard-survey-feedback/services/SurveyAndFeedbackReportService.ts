
import axios from "axios";
import { AppConfiguration } from "read-appsettings-json";
import { SurveyAndFeedbackRequestModel, SurveyAndFeedbackResultResponseModel } from "../models";


const API_GATEWAY_URL = AppConfiguration.Setting().REACT_APP_MLAB_GATEWAY_URL
const API_CALLBACK_URL = AppConfiguration.Setting().REACT_APP_MLAB_CALLBACK_URL


const GET_SURVEY_AND_FEEDBACK_REPORT: string = `${API_GATEWAY_URL}CampaignDashboard/GetCampaignSurveyAndFeedbackReport`
const GET_SURVEY_AND_FEEDBACK_REPORT_RESULT: string = `${API_CALLBACK_URL}CampaignDashboard/GetCampaignSurveyAndFeedbackReport`
const EXPORT_FEEDBACK_RESULT: string = `${API_GATEWAY_URL}CampaignDashboard/ExportFeedbackResult`
const EXPORT_SURVEY_RESULT: string = `${API_GATEWAY_URL}CampaignDashboard/ExportSurveyResult`

export async function getSurveyAndFeedbackReport(request: SurveyAndFeedbackRequestModel) {
    return axios.post(GET_SURVEY_AND_FEEDBACK_REPORT, request);
}

export async function getSurveyAndFeedbackReportResult(request: string) {
    return axios.get<SurveyAndFeedbackResultResponseModel>(GET_SURVEY_AND_FEEDBACK_REPORT_RESULT, {
        params: {
        cachedId: request,
        },
    })
}
export async function getExportFeedbackReport(request: SurveyAndFeedbackRequestModel) {
    return axios.post(EXPORT_FEEDBACK_RESULT, request, {
        responseType: 'blob'
    })
}

export async function getExportSurveyReport(request: SurveyAndFeedbackRequestModel) {
    return axios.post(EXPORT_SURVEY_RESULT, request, {
        responseType: 'blob'
    })
}
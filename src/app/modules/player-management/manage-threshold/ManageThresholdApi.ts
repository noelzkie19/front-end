import axios from 'axios'
import { AppConfiguration } from 'read-appsettings-json'
import { GetManageThresholdResponse, SaveManageThresholdRequest, SaveUserThresholdRequest } from './models'

// -----------------------------------------------------------------
// GLOBAL CONFIGURATION FOR AXIOS
// -----------------------------------------------------------------
const API_GATEWAY_URL: string = AppConfiguration.Setting().REACT_APP_MLAB_GATEWAY_URL!
const API_CALLBACK_URL = AppConfiguration.Setting().REACT_APP_MLAB_CALLBACK_URL

// -----------------------------------------------------------------
// SAVE MANAGE THRESHOLD
// -----------------------------------------------------------------
const REQUEST_SAVE_MANAGE_THRESHOLD: string = `${API_GATEWAY_URL}player/SaveManageThreshold`

export async function SaveManageThreshold(request: SaveManageThresholdRequest) {
    return axios.post(REQUEST_SAVE_MANAGE_THRESHOLD, request)
}

// -----------------------------------------------------------------
// GET MANAGE THRESHOLD
// -----------------------------------------------------------------
const REQUEST_GETMANAGE_THRESHOLD: string = `${API_GATEWAY_URL}player/GetManageThresholds`

export function GetManageThresholds() {
    return axios.get<GetManageThresholdResponse>(REQUEST_GETMANAGE_THRESHOLD)
}

// -----------------------------------------------------------------
// GET USER THRESHOLD
// -----------------------------------------------------------------
const REQUEST_SAVE_USER_THRESHOLD: string = `${API_GATEWAY_URL}player/SaveUserThreshold`

export async function SaveUserThreshold(request: SaveUserThresholdRequest) {
    return axios.post(REQUEST_SAVE_USER_THRESHOLD, request)
}
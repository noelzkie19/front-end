import axios from 'axios';
import {AppConfiguration} from 'read-appsettings-json';
import {QueueFilterModel} from '../models/QueueFilterModel';
import {QueueStatusFilterModel} from '../models/QueueStatusFilterModel';
import {DeleteQueueByDateCreatedModel} from '../models/DeleteQueueByDateCreatedModel';
import {AppConfigSettingFilterRequestModel} from '../models/request/AppConfigSettingFilterRequestModel';
import {AppConfigSettingFilterResponseModel} from '../models/response/AppConfigSettingFilterResponseModel';
import {AppConfigSettingRequestModel} from '../models/request/AppConfigSettingRequestModel';
import { EventSubscriptionRequestModel } from '../models/request/EventSubscriptionRequestModel';
import { EventSubscriptionResponseModel } from '../models/response/EventSubscriptionResponseModel';
import { EventSubscriptionFilterRequestModel } from '../models/request/EventSubscriptionFilterRequestModel';

const API_GATEWAY_URL = AppConfiguration.Setting().REACT_APP_MLAB_GATEWAY_URL;
const API_CALLBACK_URL = AppConfiguration.Setting().REACT_APP_MLAB_CALLBACK_URL;
const GET_QUEUE_REQUEST_LIST: string = `${API_GATEWAY_URL}administrator/GetQueueRequest`;
const GET_QUEUE_HISTORY_LIST: string = `${API_GATEWAY_URL}administrator/GetQueueHistory`;
const GET_DISTNCT_QUEUE_STATUS_LIST: string = `${API_GATEWAY_URL}administrator/GetDistinctQueueStatus`;
const GET_DISTNCT_QUEUE_ACTIONS_LIST: string = `${API_GATEWAY_URL}administrator/GetDistinctQueueActions`;
const DELETE_QUEUE_FROM_LIST_BY_DATE: string = `${API_GATEWAY_URL}administrator/DeleteQueueByCreatedDateRange`;
const GET_APP_CONFIG_SETTING_LIST: string = `${API_GATEWAY_URL}administrator/GetAppConfigSettingByFilter`;
const GET_APP_CONFIG_SETTING_LIST_RESULT: string = `${API_CALLBACK_URL}system/GetAppConfigSettingByFilter`;
const UPSERT_APP_CONFIG_SETTING: string = `${API_GATEWAY_URL}administrator/UpsertAppConfigSetting`;
const UPDATE_SUBSCRIPTION: string = `${API_GATEWAY_URL}administrator/UpdateEventSubscription`;
const GET_SUBSCRIPTION: string = `${API_GATEWAY_URL}administrator/GetEventSubscription`;

export async function getQueueRequest(request: QueueFilterModel) {
	return axios.post(GET_QUEUE_REQUEST_LIST, request);
}

export async function getQueueHistory(request: QueueFilterModel) {
	return axios.post(GET_QUEUE_HISTORY_LIST, request);
}

export function getDistinctQueueStatus() {
	return axios.get<Array<QueueStatusFilterModel>>(GET_DISTNCT_QUEUE_STATUS_LIST);
}

export function getDistinctQueueActions() {
	return axios.get<Array<QueueStatusFilterModel>>(GET_DISTNCT_QUEUE_ACTIONS_LIST);
}

export async function deleteQueueByCreatedDateRange(request: DeleteQueueByDateCreatedModel) {
	return axios.post(DELETE_QUEUE_FROM_LIST_BY_DATE, request);
}

export async function getAppConfigSettingByFilter(request: AppConfigSettingFilterRequestModel) {
	return axios.post(GET_APP_CONFIG_SETTING_LIST, request);
}
export async function getAppConfigSettingByFilterResult(request: string) {
	return axios.get<AppConfigSettingFilterResponseModel>(GET_APP_CONFIG_SETTING_LIST_RESULT, {
		params: {
			cachedId: request,
		},
	});
}
export async function upsertAppConfigSetting(request: AppConfigSettingRequestModel) {
	return axios.post(UPSERT_APP_CONFIG_SETTING, request);
}
export async function updateEventSubscription(request: EventSubscriptionRequestModel) {
	return axios.post(UPDATE_SUBSCRIPTION, request);
}
export async function getEventSubscription(request: EventSubscriptionFilterRequestModel) {
	return axios.post(GET_SUBSCRIPTION, request);
}
const GET_BROADCAST_CONFIGURATION_LIST_RESULT: string = `${API_CALLBACK_URL}Cache/GetById`;
export async function getEventSubscriptionResult(request: string) {
	return axios.get<EventSubscriptionResponseModel>(GET_BROADCAST_CONFIGURATION_LIST_RESULT, {
		params: {
			cachedId: request,
		},
	});
}
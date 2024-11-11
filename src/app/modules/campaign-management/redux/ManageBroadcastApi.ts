import axios from 'axios';
import {AppConfiguration} from 'read-appsettings-json';
import {SearchBroadcastRequest} from '../models/request/SearchBroadcastRequest';
import {SearchBroadcastDetailsResponse} from '../models/response/SearchBroadcastDetailsResponse';
import { BroadcastConfigurationRequest } from '../models/request/BroadcastConfigurationRequest';
import { BroadcastConfigurationResponse } from '../models/response/BroadcastConfigurationResponse';
import { GetBroadcastConfigurationByIdRequest } from '../models/request/GetBroadcastConfigurationByIdRequest';
import { GetBroadcastConfigurationRecipientsStatusProgressByIdRequest } from '../models/request/GetBroadcastConfigurationRecipientsStatusProgressByIdRequest';

// Global Configuration for axios
const API_GATEWAY_URL: string = AppConfiguration.Setting().REACT_APP_MLAB_GATEWAY_URL!;
const API_CALLBACK_URL = AppConfiguration.Setting().REACT_APP_MLAB_CALLBACK_URL;

const GET_BROADCAST_LIST: string = `${API_GATEWAY_URL}EngagementHub/GetBroadcastListByFilter`;
export async function GetBroadcastListByFilter(request: SearchBroadcastRequest) {
	return await axios.post(GET_BROADCAST_LIST, request);
}

const GET_BROADCAST_LIST_RESULT: string = `${API_CALLBACK_URL}EngagementHub/GetBroadcastListByFilter`;
export async function GetBroadcastByFilterResult(request: string) {
	return axios.get<SearchBroadcastDetailsResponse>(GET_BROADCAST_LIST_RESULT, {
		params: {
			cachedId: request,
		},
	});
}

const GET_BROADCAST_CONFIGURATION_LIST: string = `${API_GATEWAY_URL}EngagementHub/GetBroadcastConfigurationById`;
export async function GetBroadcastConfigurationById(request:GetBroadcastConfigurationByIdRequest) {
	return await axios.post(GET_BROADCAST_CONFIGURATION_LIST, request);
}

const GET_BROADCAST_CONFIGURATION_LIST_RESULT: string = `${API_CALLBACK_URL}Cache/GetById`;
export async function GetBroadcastConfigurationByIdResult(request: string) {
	return axios.get<BroadcastConfigurationResponse>(GET_BROADCAST_CONFIGURATION_LIST_RESULT, {
		params: {
			cachedId: request,
		},
	});
}

const GET_BROADCAST_CONFIGURATION_PROGRESS_LIST: string = `${API_GATEWAY_URL}EngagementHub/GetBroadcastConfigurationRecipientsStatusProgressById`;
export async function GetBroadcastConfigurationRecipientsStatusProgressById(request:GetBroadcastConfigurationRecipientsStatusProgressByIdRequest) {
	return await axios.post(GET_BROADCAST_CONFIGURATION_PROGRESS_LIST, request);
}

const GET_BROADCAST_CONFIGURATION_PROGRESS_LISTRESULT: string = `${API_CALLBACK_URL}Cache/GetById`;
export async function GetBroadcastConfigurationRecipientsStatusProgressByIdResult(request: string) {
	return axios.get<BroadcastConfigurationResponse>(GET_BROADCAST_CONFIGURATION_PROGRESS_LISTRESULT, {
		params: {
			cachedId: request,
		},
	});
}

const UPSERT_BROADCAST_CONFIGURATION: string = `${API_GATEWAY_URL}EngagementHub/UpsertBroadcastConfiguration`;
export async function UpsertBroadcastConfiguration(request: BroadcastConfigurationRequest) {
	return axios.post(UPSERT_BROADCAST_CONFIGURATION, request)
}

const CANCEL_BROADCAST: string = `${API_GATEWAY_URL}EngagementHub/CancelBroadcast`;
export async function CancelBroadcast(broadcastConfigurationId: number,userId:number) {
	return await axios.get<boolean>(CANCEL_BROADCAST, {
		params: {
			broadcastConfigurationId: broadcastConfigurationId,
			userId:userId
		}
	})
}
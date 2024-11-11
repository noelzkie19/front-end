import axios from 'axios';
import {AppConfiguration} from 'read-appsettings-json';
import {CampaignPerformanceRequestModel} from '../models/request/CampaignPerformanceRequestModel';
import {CampaignPerformanceFilterResponseModel} from '../models/response/CampaignPerformanceFilterResponseModel';
import {CampaignPerformanceResponseModel} from '../models/response/CampaignPerformanceResponseModel';

const API_GATEWAY_URL = AppConfiguration.Setting().REACT_APP_MLAB_GATEWAY_URL;
const API_CALLBACK_URL = AppConfiguration.Setting().REACT_APP_MLAB_CALLBACK_URL;

const GET_CAMPAIGN_PERFORMANCE_FILTER: string = `${API_GATEWAY_URL}CampaignPerformance/GetCampaignPerformanceFilter`;
const GET_CAMPAIGN_PERFORMANCE_LIST: string = `${API_GATEWAY_URL}CampaignPerformance/GetCampaignPerformanceList`;
const GET_CAMPAIGN_PERFORMANCE_LIST_RESULT: string = `${API_CALLBACK_URL}CampaignPerformance/GetCampaignPerformanceList`;

export function GetCampaignPerformanceFilter(campaignTypeId: number) {
	return axios.get<CampaignPerformanceFilterResponseModel>(GET_CAMPAIGN_PERFORMANCE_FILTER, {
		params: {
			campaignTypeId: campaignTypeId,
		},
	});
}

export function getCampaignPerformanceList(filter: CampaignPerformanceRequestModel) {
	return axios.post(GET_CAMPAIGN_PERFORMANCE_LIST, filter);
}
export function getCampaignPerformanceListResult(request: string) {
	return axios.get<CampaignPerformanceResponseModel>(GET_CAMPAIGN_PERFORMANCE_LIST_RESULT, {
		params: {
			cachedId: request,
		},
	});
}

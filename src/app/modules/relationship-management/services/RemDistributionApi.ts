import axios from 'axios';
import {AppConfiguration} from 'read-appsettings-json';
import {RemDistributionFilterRequest, RemDistributionListResponse, UpsertRemDistributionRequest} from '../models';
import { RemoveRemDistributionRequestModel } from '../models/request/RemoveRemDistributionRequestModel';

// Global Configuration for axios
const API_GATEWAY_URL: string = AppConfiguration.Setting().REACT_APP_MLAB_GATEWAY_URL;
const API_CALLBACK_URL = AppConfiguration.Setting().REACT_APP_MLAB_CALLBACK_URL;

const GET_REM_DISTRIBUTION_LIST: string = `${API_GATEWAY_URL}RelationshipManagement/GetRemDistributionByFilter`;
export async function GetRemDistributionList(request: RemDistributionFilterRequest) {
	return await axios.post(GET_REM_DISTRIBUTION_LIST, request);
}

const GET_REM_DISTRIBUTION_LIST_RESULT: string = `${API_CALLBACK_URL}RelationshipManagement/GetRemDistributionByFilter`;
export async function GetRemDistributionListResult(request: string) {
	return axios.get<RemDistributionListResponse>(GET_REM_DISTRIBUTION_LIST_RESULT, {
		params: {
			cachedId: request,
		},
	});
}

const UPSERT_REM_DISTRIBUTION: string = `${API_GATEWAY_URL}RelationshipManagement/UpsertRemDistribution`;
export async function UpsertRemDistribution(request: Array<UpsertRemDistributionRequest>) {
	return await axios.post(UPSERT_REM_DISTRIBUTION, request);
}

const REMOVE_REM_DISTRIBUTION: string = `${API_GATEWAY_URL}RelationshipManagement/RemoveRemDistribution`;
export async function RemoveRemDistribution(request: RemoveRemDistributionRequestModel) {
	return await axios.post(REMOVE_REM_DISTRIBUTION, request);
}
const GET_REM_LOOKUPS: string = `${API_GATEWAY_URL}RelationshipManagement/GetRemLookups`;
export async function getRemLookups() {
	return axios.get(GET_REM_LOOKUPS);
}

const EXPORT_REM_DIST_TO_CSV: string = `${API_GATEWAY_URL}RelationshipManagement/ExportRemDistributionToCsv`
export async function ExportRemDistributionToCsv(request: RemDistributionFilterRequest) {
	return axios.post(EXPORT_REM_DIST_TO_CSV, request, {
	  responseType: 'blob'
	})
  }
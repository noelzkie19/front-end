import axios from 'axios';
import {AppConfiguration} from 'read-appsettings-json';
import { RemHistoryFilterRequestModel } from '../../player-management/models/RemHistoryFilterRequestModel';
import { RemHistoryListResponse } from '../models';

// Global Configuration for axios
const API_GATEWAY_URL: string = AppConfiguration.Setting().REACT_APP_MLAB_GATEWAY_URL!;
const API_CALLBACK_URL = AppConfiguration.Setting().REACT_APP_MLAB_CALLBACK_URL;

const GET_REM_HISTORY_LIST: string = `${API_GATEWAY_URL}RelationshipManagement/GetRemHistoryByFilter`;
export async function GetRemHistoryList(request: RemHistoryFilterRequestModel) {
	return await axios.post(GET_REM_HISTORY_LIST, request);
}

const GET_REM_HISTORY_LIST_RESULT: string = `${API_CALLBACK_URL}RelationshipManagement/GetRemHistoryByFilter`;
export async function GetRemHistoryListResult(request: string) {
	return axios.get<RemHistoryListResponse>(GET_REM_HISTORY_LIST_RESULT, {
		params: {
			cachedId: request,
		},
	});
}

const EXPORT_REM_TO_CSV: string = `${API_GATEWAY_URL}RelationshipManagement/ExportRemHistoryToCsv`
export async function ExportRemHistoryToCsv(request: RemHistoryFilterRequestModel) {
	return axios.post(EXPORT_REM_TO_CSV, request, {
	  responseType: 'blob'
	})
  }

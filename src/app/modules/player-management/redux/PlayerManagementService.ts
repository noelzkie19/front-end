import axios from 'axios';
import { AppConfiguration } from 'read-appsettings-json';
import { ImportPlayersRequestModel } from '../models/ImportPlayersRequestModel';
import { PlayerCaseRequestModel } from '../models/PlayerCaseRequestModel';
import { PlayerContactRequestModel } from '../models/PlayerContactRequestModel';
import { PlayerFilterRequestModel } from '../models/PlayerFilterRequestModel';
import { ResponseModel } from '../models/ResponseModel';
import { LookupModel } from '../../../common/model';
import { PlayerSensitiveDataRequestModel, PlayerSensitiveDataResponseModel } from '../models';

const API_GATEWAY_URL = AppConfiguration.Setting().REACT_APP_MLAB_GATEWAY_URL;
const API_CALLBACK_URL = AppConfiguration.Setting().REACT_APP_MLAB_CALLBACK_URL;

const IMPORT_PLAYERS: string = `${API_GATEWAY_URL}player/ImportPlayers`;
const GET_PLAYERS_LIST: string = `${API_GATEWAY_URL}player/GetPlayers`;
const GET_PLAYER_PROFILE: string = `${API_GATEWAY_URL}player/GetPlayer`;
const SAVE_PLAYER_CONTACT: string = `${API_GATEWAY_URL}player/SavePlayerContact`;
const GET_PLAYER_CASES_LIST: string = `${API_GATEWAY_URL}player/GetPlayerCases`;
const VALIDATE_IMPORT_PLAYERS: string = `${API_GATEWAY_URL}player/ValidateImportPlayers`;
const GET_INVALID_PLAYER_LIST_RESULT: string = `${API_CALLBACK_URL}playermanagement/GetAllInvalidImportPlayers`;
const GET_CAMPAIGN_LOOKUPS: string = `${API_GATEWAY_URL}player/GetPlayerCampaignLookups`;
const GET_REM_DISTRIBUTION_PLAYER: string = `${API_GATEWAY_URL}relationshipmanagement/GetRemDistributionPlayer`;

export async function ImportPlayers(importPlayers: ImportPlayersRequestModel) {
	return await axios.post<ResponseModel>(IMPORT_PLAYERS, importPlayers);
}

export async function ValidateImportPlayers(importPlayers: ImportPlayersRequestModel) {
	return await axios.post<ResponseModel>(VALIDATE_IMPORT_PLAYERS, importPlayers);
}

export async function GetPlayerList(request: PlayerFilterRequestModel) {
	return axios.post(GET_PLAYERS_LIST, request);
}

export function GetPlayerProfile(request: any) {
	return axios.post(GET_PLAYER_PROFILE, request);
}

export async function GetRemDistributionPlayer(request: any) {
	return axios.post(GET_REM_DISTRIBUTION_PLAYER, request);
}

export async function SavePlayerContact(request: PlayerContactRequestModel) {
	return axios.post(SAVE_PLAYER_CONTACT, request);
}

export async function GetPlayerCaseList(request: PlayerCaseRequestModel) {
	return axios.post(GET_PLAYER_CASES_LIST, request);
}

export function GetInvalidPlayerListResult(request: string) {
	return axios.get<string>(GET_INVALID_PLAYER_LIST_RESULT, {
		params: {
			cachedId: request,
		},
	});
}

export function GetPlayerCampaignLookups(campaignType?: number) {
	return axios.get<Array<LookupModel>>(GET_CAMPAIGN_LOOKUPS, {
		params: {
			campaignType: campaignType,
		},
	});
}

const GET_PLAYER_SENSITIVE_DATA: string = `${API_GATEWAY_URL}player/GetPlayerSensitiveData`;
export function getPlayerSensitiveData(request: PlayerSensitiveDataRequestModel) {
	return axios.post<PlayerSensitiveDataResponseModel>(GET_PLAYER_SENSITIVE_DATA, request);
}

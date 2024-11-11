import axios from 'axios';
import {AppConfiguration} from 'read-appsettings-json';
import {OptionListModel} from '../../../../common/model';
import {LeadLinkDetailsResponse} from '../models/LeadLinkDetailsResponse';
import {LeadsRequest} from '../models/LeadsRequest';
import {SearchLeadsResponseModel} from '../models/SearchLeadsResponseModel';

const API_GATEWAY_URL: string = AppConfiguration.Setting().REACT_APP_MLAB_GATEWAY_URL!;
const API_CALLBACK_URL = AppConfiguration.Setting().REACT_APP_MLAB_CALLBACK_URL;

const GET_LEADS_BY_FILTER: string = `${API_GATEWAY_URL}SearchLeads/GetLeadsByFilter`;
const GET_LEADS_BY_FILTER_RESULT: string = `${API_CALLBACK_URL}SearchLeads/GetLeadsByFilter`;

export async function GetLeadsByFilter(request: LeadsRequest) {
	return axios.post(GET_LEADS_BY_FILTER, request);
}

export async function GetLeadsByFilterResult(request: string) {
	return axios.get<SearchLeadsResponseModel>(GET_LEADS_BY_FILTER_RESULT, {
		params: {
			cachedId: request,
		},
	});
}


const LINK_UNLINK_PLAYER: string = `${API_GATEWAY_URL}SearchLeads/LinkUnlinkPlayer`;
export async function LinkUnlinkPlayer(leadId: number, linkedMlabPlayerId: number, userId: number) {
	return axios.get<boolean>(LINK_UNLINK_PLAYER, {
		params: {
			leadId: leadId,
			linkedMlabPlayerId: linkedMlabPlayerId,
			userId: userId
		},
	});
}


const REMOVE_LEAD: string = `${API_GATEWAY_URL}SearchLeads/RemoveLead`;
export async function RemoveLead(leadId: number) {
	return axios.get<boolean>(REMOVE_LEAD, {
		params: {
			leadId: leadId
		},
	});
}

const GET_LEAD_LINK_DETAILS_BY_ID: string = `${API_GATEWAY_URL}SearchLeads/GetLeadLinkDetailsById`;
export async function GetLeadLinkDetailsById(mlabPlayerId: number) {
	return axios.get<LeadLinkDetailsResponse>(GET_LEAD_LINK_DETAILS_BY_ID, {
		params: {
			mlabPlayerId: mlabPlayerId
		},
	});
}

const GET_ALL_SOURCE_BOT: string = `${API_GATEWAY_URL}SearchLeads/GetAllSourceBOT`;
export async function GetAllSourceBOT() {
	return axios.get<Array<OptionListModel>>(GET_ALL_SOURCE_BOT);
}

const GET_LEAD_PLAYERS_BY_USERNAME: string = `${API_GATEWAY_URL}SearchLeads/GetLeadPlayersByUsername`;
export async function GetLeadPlayersByUsername(username: string, userId: number) {
	return axios.get(GET_LEAD_PLAYERS_BY_USERNAME, {
		params: {
			username: username,
			userId: userId,
		},
	});
}

const GET_LEADS_SELECTION_BY_FILTER: string = `${API_GATEWAY_URL}SearchLeads/GetLeadSelectionByFilter`;
export async function GetLeadSelectionByFilter(request: LeadsRequest) {
	return axios.post(GET_LEADS_SELECTION_BY_FILTER, request);
}
import axios from "axios";
import {AppConfiguration} from "read-appsettings-json";
import {CallListNoteRequestModel, CallListNoteResponseModel, CampaignPlayerFilterRequestModel, CampaignPlayerFilterResponseModel, DiscardPlayerRequestModel, PlayerDepositAttemptsResponseModel, TagAgentRequestModel} from "../models";
import {ServiceCommunicationHistoryFilterRequestModel} from '../models/request/ServiceCommunicationHistoryFilterRequestModel';
import {ValidateTagAgentRequestmodel} from '../models/request/ValidateTagAgentRequestModel';
import {ServiceCommunicationHistoryResponseModel} from '../models/response/ServiceCommunicationHistoryResponseModel';
import {LookupModel} from './../../../common/model/LookupModel';

const API_GATEWAY_URL = AppConfiguration.Setting().REACT_APP_MLAB_GATEWAY_URL
const API_CALLBACK_URL = AppConfiguration.Setting().REACT_APP_MLAB_CALLBACK_URL
const GET_ALL_CAMPAIGNS: string = `${API_GATEWAY_URL}AgentWorkspace/GetAllCampaigns`
const GET_CAMPAIGN_AGENTS: string = `${API_GATEWAY_URL}AgentWorkspace/GetCampaignAgents`
const GET_MESSAGE_STATUS_RESPONSE_LIST: string = `${API_GATEWAY_URL}AgentWorkspace/GetMessageStatusResponseList`
const GET_AGENTS_FOR_TAGGING: string = `${API_GATEWAY_URL}AgentWorkspace/GetAgentsForTagging`
const GET_CAMPAIGN_PLAYERS_LIST_FILTER: string = `${API_GATEWAY_URL}AgentWorkspace/GetCampaignPlayersByFilter`
const GET_CAMPAIGN_PLAYERS_LIST: string = `${API_GATEWAY_URL}AgentWorkspace/GetCampaignPlayerListByFilter`
const GET_CAMPAIGN_PLAYERS_LIST_RESULT: string = `${API_CALLBACK_URL}AgentWorkspace/GetCampaignPlayerListByFilter`
const GET_CALL_LIST_NOTE: string = `${API_GATEWAY_URL}AgentWorkspace/GetCallListNote`
const SAVE_CALL_LIST_NOTE: string = `${API_GATEWAY_URL}AgentWorkspace/SaveCallListNote`
const TAG_AGENT: string = `${API_GATEWAY_URL}AgentWorkspace/TagAgent`
const DISCARD_PLAYER: string = `${API_GATEWAY_URL}AgentWorkspace/DiscardPlayer`
const VALIDATE_TAGGING: string = `${API_GATEWAY_URL}AgentWorkspace/ValidateTagging`
const EXPORT_TO_CSV: string = `${API_GATEWAY_URL}AgentWorkspace/ExportToCSV`
const GET_PLAYER_DEPOSIT_ATTEMPTS: string =  `${API_GATEWAY_URL}AgentWorkspace/GetPlayerDepositAttempts`
const GET_CAMPAIGNS_BY_CASETYPE: string = `${API_GATEWAY_URL}CaseCommunication/GetCampaignByCaseTypeId`
const GET_PLAYER_COMMUNICATION_HISTORY: string =  `${API_GATEWAY_URL}AgentWorkspace/GetServiceCommunicationHistoryByFilter`

export async function getAllCampaignsList(campaignType: number) {
    return await axios.get<Array<LookupModel>>(GET_ALL_CAMPAIGNS, {
        params: {
            'campaignType': campaignType
        }
    });
}
export async function getCampaignByCaseTypeId(caseTypeId: number) {
    return await axios.get<Array<LookupModel>>(GET_CAMPAIGNS_BY_CASETYPE, {
        params: {
            'caseTypeId': caseTypeId
        }
    });
}
export async function getCampaignAgentsList(campaignId: number) {
    return await axios.get<Array<LookupModel>>(GET_CAMPAIGN_AGENTS, {
        params: {
            'campaignId': campaignId
        }
    });
}

export async function getMessageStatusResponseList(campaignId: number) {
    return await axios.get<Array<LookupModel>>(GET_MESSAGE_STATUS_RESPONSE_LIST, {
        params: {
            'campaignId': campaignId
        }
    });
}

export async function getAgentsForTagging() {
    return await axios.get<Array<LookupModel>>(GET_AGENTS_FOR_TAGGING);
}

export async function getCampaignPlayerListFilter(request: CampaignPlayerFilterRequestModel) {
    return await axios.post(GET_CAMPAIGN_PLAYERS_LIST_FILTER, request);
}


export async function getCampaignPlayerList(request: CampaignPlayerFilterRequestModel) {
    return await axios.post(GET_CAMPAIGN_PLAYERS_LIST, request);
}

export async function getCampaignPlayerListResult(request: string) {
    return await axios.get<CampaignPlayerFilterResponseModel>(GET_CAMPAIGN_PLAYERS_LIST_RESULT, {
        params: {
            'cachedId': request
        }
    });
}

export async function getCallListNote(request: number) {
    return await axios.get<CallListNoteResponseModel>(GET_CALL_LIST_NOTE, {
        params: {
            'callListNoteId': request
        }
    });
}

export async function saveCallListNote(request: CallListNoteRequestModel) {
    return await axios.post(SAVE_CALL_LIST_NOTE, request);
}

export async function tagAgent(request: TagAgentRequestModel) {
    return await axios.post(TAG_AGENT, request);
}

export async function discardPlayer(request: DiscardPlayerRequestModel) {
    return await axios.post(DISCARD_PLAYER, request);
}

export async function validateTagAgent(request: ValidateTagAgentRequestmodel) {
    return await axios.post(VALIDATE_TAGGING, request);
}

export async function exportToCsv(request: CampaignPlayerFilterRequestModel) {
    return await axios.post(EXPORT_TO_CSV, request, {
      responseType: 'blob'
    })
}

export async function GetPlayerDepositAttempts(campaignPlayerId: number) {
    return await axios.get<Array<PlayerDepositAttemptsResponseModel>>(GET_PLAYER_DEPOSIT_ATTEMPTS, {
        params: {
            'campaignPlayerId': campaignPlayerId
        }
    });
}
export async function GetServiceCommunicationHistory(request: ServiceCommunicationHistoryFilterRequestModel) {
    return await axios.post<ServiceCommunicationHistoryResponseModel>(GET_PLAYER_COMMUNICATION_HISTORY,request);
}
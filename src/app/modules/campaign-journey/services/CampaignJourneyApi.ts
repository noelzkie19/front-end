import axios from 'axios'
import { AppConfiguration } from 'read-appsettings-json'
import { ResponseModel } from '../../system/models';
import { JourneyGridRequestModel } from '../models/request/JourneyGridRequestModel';
import { SaveJourneyRequestModel } from '../models/request/SaveJourneyRequestModel';
import { GetCampaignDetailsResponseModel } from '../models/response/GetCampaignDetailsResponseModel';
import { JourneyGridResponseModel } from '../models/response/JourneyGridResponseModel';
import { JourneyDetailsRequestModel } from '../models/request/JourneyDetailsRequestModel';
import { JourneyDetailsResponseModel } from '../models/response/JourneyDetailsResponseModel';
import { LookupModel } from '../../../shared-models/LookupModel';

const API_GATEWAY_URL: string = AppConfiguration.Setting().REACT_APP_MLAB_GATEWAY_URL!
const API_CALLBACK_URL = AppConfiguration.Setting().REACT_APP_MLAB_CALLBACK_URL

//Get Journey Grid
const REQUEST_JOURNEY_GRID: string = `${API_GATEWAY_URL}CampaignJourney/GetJourneyGrid`;
const GET_JOURNEY_GRID: string = `${API_CALLBACK_URL}CampaignJourney/GetJourneyGrid`;
export const RequestJourneyGrid = async (request: JourneyGridRequestModel) => {
    return axios.post(REQUEST_JOURNEY_GRID, request);
};
export const GetJourneyGrid = async (request: string) => {
    return axios.get<JourneyGridResponseModel>(GET_JOURNEY_GRID, {
        params: {
            cacheId: request
        }
    });
};

//Get Journey Details
const REQUEST_JOURNEY_DETAILS: string = `${API_GATEWAY_URL}CampaignJourney/GetJourneyDetails`;
const GET_JOURNEY_DETAILS: string = `${API_CALLBACK_URL}CampaignJourney/GetJourneyDetails`;
export const RequestJourneyDetails = async (request: JourneyDetailsRequestModel) => {
    return axios.post(REQUEST_JOURNEY_DETAILS, request);
};
export const GetJourneyDetails = async (request: string) => {
    return axios.get<JourneyDetailsResponseModel>(GET_JOURNEY_DETAILS, {
        params: {
            cacheId: request
        }
    });
};
  
//Get Campaign Details
const GET_JOURNEY_CAMPAIGN_DETAILS: string = `${API_GATEWAY_URL}CampaignJourney/GetJourneyCampaignDetails`;
export const GetJourneyCampaignDetails = async (request: string) => {
    return axios.get<GetCampaignDetailsResponseModel>(GET_JOURNEY_CAMPAIGN_DETAILS, {
        params: {
            campaignId: request,
        }
    });
};
  
//Save Journey
const SAVE_JOURNEY: string =`${API_GATEWAY_URL}CampaignJourney/SaveJourney`;
export const SaveJourney = async (request: SaveJourneyRequestModel) => {
    return axios.post<ResponseModel>(SAVE_JOURNEY, request);
};

//Get Available Campaign Names
const GET_JOURNEY_CAMPAIGN_NAMES: string = `${API_GATEWAY_URL}CampaignJourney/GetJourneyCampaignNames`;
export function GetJourneyCampaignNames(searchFilterField: string, searchFilterType: number, campaignType: number) {
    return axios.get<Array<LookupModel>>(GET_JOURNEY_CAMPAIGN_NAMES, {
      params: {
        searchFilterField: searchFilterField,
        searchFilterType: searchFilterType,
        campaignType: campaignType,
      },
    });
};

//Get Journey Names
const GET_JOURNEY_NAMES: string = `${API_GATEWAY_URL}CampaignJourney/GetJourneyNames`;
export function GetJourneyNames() {
    return axios.get<Array<LookupModel>>(GET_JOURNEY_NAMES);
};

//Get Journey Status
const GET_JOURNEY_STATUS: string = `${API_GATEWAY_URL}CampaignJourney/GetJourneyStatus`;
export function GetJourneyStatus() {
    return axios.get<Array<LookupModel>>(GET_JOURNEY_STATUS);
};


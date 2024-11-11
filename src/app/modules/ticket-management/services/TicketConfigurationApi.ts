import axios from 'axios';
import {AppConfiguration} from 'read-appsettings-json';
import { TicketTypeResponseModel } from '../models/ticket-config/TicketTypeResponseModel';
import { LookupModel } from '../../../shared-models/LookupModel';
import { FieldMappingResponseModel } from '../models/ticket-config/FieldMappingResponseModel';
// Global Configuration for axios
const API_GATEWAY_URL: string = AppConfiguration.Setting().REACT_APP_MLAB_GATEWAY_URL!;
const API_CALLBACK_URL = AppConfiguration.Setting().REACT_APP_MLAB_CALLBACK_URL;

const GET_TICKET_TYPES = `${API_GATEWAY_URL}TicketManagement/GetTicketTypes`;
export async function getTicketTypes() {
	return axios.get<TicketTypeResponseModel[]>(GET_TICKET_TYPES);
}

const GET_TICKET_MNGT_LOOKUP_FIELD_ID: string = `${API_GATEWAY_URL}TicketManagement/GetTicketLookUpByFieldId`;
export async function getTicketLookUpByFieldId(fieldId: any) {
	return axios.get<LookupModel[]>(GET_TICKET_MNGT_LOOKUP_FIELD_ID, {
		params: {
			fieldId: fieldId,
		},
	});
}

const GET_TICKET_FIELD_MAPPING: string = `${API_GATEWAY_URL}TicketManagement/GetTicketFieldMappingByTicketType`;
export async function getTicketFieldMapping(ticketTypeId: any) {
	return axios.get<FieldMappingResponseModel[]>(GET_TICKET_FIELD_MAPPING, {
		params: {
			ticketTypeId: ticketTypeId,
		},
	});
}

const GET_TICKET_CUSTOM_GROUP_BY_TICKET_TYPE = `${API_GATEWAY_URL}TicketManagement/GetTicketCustomGroupByTicketType`;
export async function getTicketCustomGroupingByTicketType(ticketTypeId: any) {
	return axios.get<FieldMappingResponseModel[]>(GET_TICKET_CUSTOM_GROUP_BY_TICKET_TYPE, {
		params: {
			ticketTypeId: ticketTypeId,
		},
	});
}

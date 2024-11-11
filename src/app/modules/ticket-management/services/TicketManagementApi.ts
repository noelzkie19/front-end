import axios from 'axios';
import {AppConfiguration} from 'read-appsettings-json';
import {IcoreTransactionDataResponseModel, MlabTransactionDataResponseModel, TransactionDataRequestModel} from '../models';
import {TicketManagementLookupsModel} from '../models/TicketManagementLookupsModel';
import {DeleteAttachmentRequestModel} from '../models/request/DeleteAttachmentRequestModel';
import {DeleteTicketCommentRequestModel} from '../models/request/DeleteTicketCommentRequestModel';
import {FileListRequestModel} from '../models/request/FileListRequestModel';
import {FmboTransactionDataRequestModel} from '../models/request/FmboTransactionDataRequestModel';
import {GetTicketCommentsRequestModel} from '../models/request/GetTicketCommentsRequestModel';
import {GetTicketThresholdRequestModel} from '../models/request/GetTicketThresholdRequestModel';
import {InsertTicketAttachmentRequestModel} from '../models/request/InsertTicketAttachmentRequestModel';
import {PaymentMethodHiddenFieldsRequestModel} from '../models/request/PaymentMethodHiddenFieldsRequestModel';
import {SaveSearchFilterRequestModel} from '../models/request/SaveSearchFilterRequestModel';
import {SaveTicketDetailsRequestModel} from '../models/request/SaveTicketDetailsRequestModel';
import {SearchFilterRequestModel} from '../models/request/SearchFilterRequestModel';
import {TicketCommentRequestModel} from '../models/request/TicketCommentRequestModel';
import {TicketDetailsRequestModel} from '../models/request/TicketDetailsRequestModel';
import {TicketPlayerRequestModel} from '../models/request/TicketPlayerRequestModel';
import {TicketStatusHierarchyRequestModel} from '../models/request/TicketStatusHierarchyRequestModel';
import {UpsertPopupTicketDetailsRequestModel} from '../models/request/UpsertPopupTicketDetailsRequestModel';
import {FileListResponseModel} from '../models/response/FileListResponseModel';
import {PaymentMethodHiddenFieldsResponseModel} from '../models/response/PaymentMethodHiddenFieldsResponseModel';
import {SearchFilterResponseModel} from '../models/response/SearchFilterResponseModel';
import {SearchTicketResponseModel} from '../models/response/SearchTicketResponseModel';
import {TeamAssignmentResponseModel} from '../models/response/TeamAssignmentResponseModel';
import {TicketCommentResponseModel} from '../models/response/TicketCommentResponseModel';
import {TicketPlayerResponseModel} from '../models/response/TicketPlayerResponseModel';
import {TicketStatusHierarchyResponseModel} from '../models/response/TicketStatusHierarchyResponseModel';
import {TicketStatusMappingResponseModel} from '../models/response/TicketStatusMappingResponseModel';
import {TransactionFieldMappingResponseModel} from '../models/response/TransactionFieldMappingResponseModel';
import { ManualBalanceCorrectionRequestModel } from '../models/request/ManualBalanceCorrectionRequestModel';
import {TransactionStatusReferenceResponseModel} from '../models/response/TransactionStatusReferenceResponseModel';
import { HoldWithdrawalRequestModel } from '../models/request/HoldWithdrawalRequestModel';
import { LookupModel } from '../../../shared-models/LookupModel';
import { TicketIntegrationResponseModel } from '../models/response/TicketIntegrationResponseModel';
import { GetMlabRequestModel } from '../models/request/GetMlabRequestModel';
import { GetTicketHistoryCollaboratorRequestModel } from '../models/request/GetTicketHistoryCollaboratorRequestModel';
import { TicketHistoryResponseModel } from '../models/response/TicketHistoryResponseModel';
import { TicketCollaboratorResponseModel } from '../models/response/TicketCollaboratorResponseModel';
import { AddUserCollaboratorRequestModel } from '../models/request/AddUserCollaboratorRequestModel';
import { DeleteUserAsCollaboratorRequestModel } from '../models/request/DeleteUserAsCollaboratorRequestModel';
import { GetAutoAssignedIdRequestModel } from '../models/request/GetAutoAssignedIdRequestModel';
import { ValidateUserTierRequestModel } from '../models/request/ValidateUserTierRequestModel';
import { GetAllProcessorResponseModel } from '../models/response/GetAllProcessorResponseModel';
// Global Configuration for axios
const API_GATEWAY_URL: string = AppConfiguration.Setting().REACT_APP_MLAB_GATEWAY_URL;
const API_CALLBACK_URL: string = AppConfiguration.Setting().REACT_APP_MLAB_CALLBACK_URL;

const GET_PLAYERS_LIST_BY_FILTER: string = `${API_GATEWAY_URL}TicketManagement/GetPlayerByFilter`;
export async function getPlayerInfo(request: TicketPlayerRequestModel) {
	return axios.get<TicketPlayerResponseModel>(GET_PLAYERS_LIST_BY_FILTER, {
		params: {
			brandId: request.BrandId,
			playerId: request.PlayerId,
			playerUsername: request.PlayerUsername
		}
	});
}

const GET_TEAM_ASSIGNMENT: string = `${API_GATEWAY_URL}TicketManagement/GetTeamAssignment`;
export async function getTeamAssignmentData() {
	return axios.get<TeamAssignmentResponseModel>(GET_TEAM_ASSIGNMENT);
}

const GET_ICORE_TRANSACTION_DAtA: string = `${API_GATEWAY_URL}TicketManagement/GetIcoreTransactionData`;
export async function getIcoreTransactionData(request: TransactionDataRequestModel) {
	return axios.post<IcoreTransactionDataResponseModel>(GET_ICORE_TRANSACTION_DAtA, request);
}

const GET_FMBO_TRANSACTION_DAtA: string = `${API_GATEWAY_URL}TicketManagement/GetFmboTransactionData`;
export async function getFmboTransactionData(request: FmboTransactionDataRequestModel) {
	return axios.post<TicketIntegrationResponseModel>(GET_FMBO_TRANSACTION_DAtA, request);
}


const GET_MLAB_TRANSACTION_DATA: string = `${API_GATEWAY_URL}TicketManagement/GetMlabTransactionData`;
export async function getMlabTransactionData(request: GetMlabRequestModel) {
return axios.post<MlabTransactionDataResponseModel>(GET_MLAB_TRANSACTION_DATA, request);
}

const GET_TICKET_INFO_BY_ID: string = `${API_GATEWAY_URL}TicketManagement/GetTicketInfoById`;
export async function getTicketInfoById(request: TicketDetailsRequestModel) {
	return axios.get<any>(GET_TICKET_INFO_BY_ID, {
		params: {
			ticketTypeSequenceId: request.ticketTypeSequenceId,
			ticketTypeId: request.ticketTypeId
		}
	});
}

const UPLOAD_FILE: string = `${API_GATEWAY_URL}Azure/UploadImage`;
export async function uploadFile(formData: FormData) {
	return axios.post(UPLOAD_FILE, formData);
}
	
const SAVE_TICKET: string = `${API_GATEWAY_URL}TicketManagement/SaveTicketDetails`;
export async function SaveTicketDetails(request: SaveTicketDetailsRequestModel) {
	return axios.post(SAVE_TICKET, request);
}

const TICKET_STATUS_HIERARCHY: string = `${API_GATEWAY_URL}TicketManagement/GetTicketStatusHierarchyByTicketType`; 
export async function getTicketStatusHierarchyByTicketType(request: TicketStatusHierarchyRequestModel) {
	return axios.post<TicketStatusHierarchyResponseModel>(TICKET_STATUS_HIERARCHY, request);
}

const GET_FILE: string = `${API_GATEWAY_URL}Azure/GetImages`;
export async function getImages(request: Array<FileListRequestModel>) {
	return axios.post<Array<FileListResponseModel>>(GET_FILE, request);
}

const DELETE_ATTACHMENT: string = `${API_GATEWAY_URL}TicketManagement/DeleteTicketAttachmentById`;
export async function deleteTicketAttachmentById(request: DeleteAttachmentRequestModel) {
	return axios.post(DELETE_ATTACHMENT, request);
}

const UPSERT_TICKET_COMMENT: string = `${API_GATEWAY_URL}TicketManagement/UpsertTicketComment`;
export async function UpsertTicketComment(request: TicketCommentRequestModel) {
	return axios.post(UPSERT_TICKET_COMMENT, request);
}

const REQUEST_TICKET_COMMENT_BY_TICKET_COMMENT_ID: string = `${API_GATEWAY_URL}TicketManagement/GetTicketCommentByTicketCommentId`;
export async function requestTicketCommentByTicketCommentId(request: GetTicketCommentsRequestModel) {
	return axios.post(REQUEST_TICKET_COMMENT_BY_TICKET_COMMENT_ID, request);
}

const GET_TICKET_COMMENT_BY_TICKET_COMMENT_ID: string = `${API_CALLBACK_URL}TicketManagement/GetTicketCommentByTicketCommentId`;
export const GetTicketComment = async (request: string) => {
    return axios.get<TicketCommentResponseModel>(GET_TICKET_COMMENT_BY_TICKET_COMMENT_ID, {
        params: {
            cachedId: request
        }
    });
};

const DELETE_TICKET_COMMENT: string = `${API_GATEWAY_URL}TicketManagement/DeleteTicketCommentByTicketCommentId`;
export async function deleteTicketComment(request: DeleteTicketCommentRequestModel) {
	return axios.post(DELETE_TICKET_COMMENT, request);
}

const VALIDATE_UNFINISHED_TRANSACTION_ID_BY_TICKET: string = `${API_GATEWAY_URL}TicketManagement/ValidateUnfinishedTransactionIdByTicket`;
export async function getTransactionIdValidationByTicket(transactionId: string, ticketTypeId: number, fieldId: number) {
	return axios.get<any>(VALIDATE_UNFINISHED_TRANSACTION_ID_BY_TICKET, {
		params: {
			transactionId: transactionId,
			ticketTypeId: ticketTypeId,
			fieldId: fieldId
		}
	});
}

const UPSERT_POPUP_TICKET_DETAILS: string = `${API_GATEWAY_URL}TicketManagement/UpsertPopupTicketDetails`;
export async function UpsertPopupTicketDetails(request: UpsertPopupTicketDetailsRequestModel) {
	return axios.post(UPSERT_POPUP_TICKET_DETAILS, request);
}

const INSERT_TICKET_ATTACHMENT: string = `${API_GATEWAY_URL}TicketManagement/InsertTicketAttachment`;
export async function InsertTicketAttachment(request: InsertTicketAttachmentRequestModel) {
	return axios.post(INSERT_TICKET_ATTACHMENT, request);
}

const GET_ASSIGNEE_LIST: string = `${API_GATEWAY_URL}TicketManagement/GetAssigneesByIds`;
export async function getAssigneeListById(statusId: number, ticketTypeId: number, paymentMethodId: number, mlabPlayerId: number, ticketId: number, departmentId: number, adjustmentAmount: number ) {
	return axios.get<any>(GET_ASSIGNEE_LIST, {
		params: {
			statusId: statusId,
			ticketTypeId: ticketTypeId,
			paymentMethodId: paymentMethodId,
			mlabPlayerId: mlabPlayerId,
			ticketId: ticketId,
			departmentId: departmentId,
			adjustmentAmount: adjustmentAmount		
		}
	});
}

const GET_AUTO_ASSIGNED: string = `${API_GATEWAY_URL}TicketManagement/GetAutoAssignedId`;
export async function getAutoAssigned(request: GetAutoAssignedIdRequestModel) {
	return axios.get<any>(GET_AUTO_ASSIGNED, {
		params: {
			statusId: request.statusId,
			ticketTypeId: request.ticketTypeId,
			paymentMethodId: request.paymentMethodId,
			mlabPlayerId: request.mlabPlayerId,
			ticketId: request.ticketId,
			ticketCode: request.ticketCode,
			statusDescription: request.statusDescription,
			departmentId: request.departmentId,
			adjustmentAmount: request.adjustmentAmount
		}
	});
}

const GET_TICKET_STATUS_POPUP_MAPPINGG: string = `${API_GATEWAY_URL}TicketManagement/GetTicketStatusPopupMapping`;
export const getTicketStatusPopupMapping = async (ticketTypeId: number) => {
    return axios.get<Array<TicketStatusMappingResponseModel>>(GET_TICKET_STATUS_POPUP_MAPPINGG, {
		params: {
			ticketTypeId: ticketTypeId
		}
    });
};

const GET_TICKET_THRESHOLD: string = `${API_GATEWAY_URL}TicketManagement/GetTicketThreshold`;
export async function getTicketThreshold(request: GetTicketThresholdRequestModel) {
	return axios.post(GET_TICKET_THRESHOLD, request);
}
const REQUEST_SEARCH_TICKET: string = `${API_GATEWAY_URL}TicketManagement/GetSearchTicketByFilters`;
export const requestSearchTicket = async (request: SearchFilterRequestModel) => {
	return axios.post(REQUEST_SEARCH_TICKET, request);
}

const GET_SEARCH_TICKET: string = `${API_CALLBACK_URL}TicketManagement/GetSearchTicketByFilters`;
export const GetSearchTicket = async (request: string) => {
    return axios.get<SearchTicketResponseModel>(GET_SEARCH_TICKET, {
        params: {
            cachedId: request
        }
    });
};

const GET_TICKET_MANAGEMENT_LOOKUPS: string = `${API_GATEWAY_URL}TicketManagement/GetTicketManagementLookups`;
export const getTicketManagementLookups = async () => {
	return axios.get<TicketManagementLookupsModel>(GET_TICKET_MANAGEMENT_LOOKUPS);
};

const EXPORT_SEARCH_TICKET: string = `${API_GATEWAY_URL}TicketManagement/ExportSearchTicketByFilters`;
export const exportSearchTicket = async (request: SearchFilterRequestModel) => {
	return axios.post(EXPORT_SEARCH_TICKET, request);
};

const GET_FILTER_ID_BY_USER_ID: string = `${API_GATEWAY_URL}TicketManagement/GetFilterIDByUserId?userId=`;
export const getFilterIDByUserId = async (userId: string) => {
	return axios.get<any>(GET_FILTER_ID_BY_USER_ID + userId);
}

const GET_SAVED_FILTER_BY_FILTER_ID: string = `${API_GATEWAY_URL}TicketManagement/GetSavedFilterByFilterId?filterId=`;
export const getSavedFilterByFilterId = async (filterId: number) => {
	return axios.get<SearchFilterResponseModel>(GET_SAVED_FILTER_BY_FILTER_ID + filterId);
}

const SAVE_SEARCH_FILTER: string = `${API_GATEWAY_URL}TicketManagement/UpsertSearchTicketFilter`;
export const UpsertSearchTicketFilter = async (request: SaveSearchFilterRequestModel) => {
	return axios.post(SAVE_SEARCH_FILTER, request);
}

const GET_TRANSACTION_FIELDMAPPING: string = `${API_GATEWAY_URL}TicketManagement/GetTransactionFieldMapping`;
export const getTransactionFieldMapping = async (ticketTypeId: number) => {
    return axios.get<Array<TransactionFieldMappingResponseModel>>(GET_TRANSACTION_FIELDMAPPING, {
		params: {
			ticketTypeId: ticketTypeId
		}
    });
};

const GET_PAYMENT_METHOD_HIDDEN_FIELDS: string = `${API_GATEWAY_URL}TicketManagement/GetHiddenPaymentMethodTickets`;
export async function getHiddenPaymentMethodTickets(request: PaymentMethodHiddenFieldsRequestModel) {
	return axios.post<Array<PaymentMethodHiddenFieldsResponseModel>>(GET_PAYMENT_METHOD_HIDDEN_FIELDS, request);
}

const GET_TRANSACTION_STATUS_REFERENCE: string = `${API_GATEWAY_URL}TicketManagement/GetTransactionStatusReference`;
export async function getTransactionStatusReference() {
	return axios.get<TransactionStatusReferenceResponseModel>(GET_TRANSACTION_STATUS_REFERENCE);
}

const UPDATE_MANUAL_BALANCE_CORRECTION: string = `${API_GATEWAY_URL}TicketManagement/PostManualBalanceCorrection`;
export const UpdateManualBalanceCorrection = async (request: ManualBalanceCorrectionRequestModel) => {
	return axios.post(UPDATE_MANUAL_BALANCE_CORRECTION, request);
}

const UPDATE_HOLD_WITHDRAWAL: string = `${API_GATEWAY_URL}TicketManagement/PostICoreHoldWithdrawal`;
export const UpdateHoldWithdrawal = async (request: HoldWithdrawalRequestModel) => {
	return axios.post(UPDATE_HOLD_WITHDRAWAL, request);
}

const GET_ADJUSTMENT_BUSINESS_TYPE_LIST = `${API_GATEWAY_URL}TicketManagement/GetAdjustmentBusinessTypeList`;
export const GetAdjustmentBusinessTypeList = async () => {
	return axios.get<Array<LookupModel>>(GET_ADJUSTMENT_BUSINESS_TYPE_LIST);
}

const REQUEST_TICKET_HISTORY: string = `${API_GATEWAY_URL}TicketManagement/GetTicketHistory`;
export const RequestTicketHistory = async (request: GetTicketHistoryCollaboratorRequestModel) => {
	return axios.post(REQUEST_TICKET_HISTORY, request);
}

const GET_TICKET_HISTORY: string = `${API_CALLBACK_URL}TicketManagement/GetTicketHistory`;
export const GetTicketHistory = async (request: string) => {
    return axios.get<TicketHistoryResponseModel>(GET_TICKET_HISTORY, {
        params: {
            cachedId: request
        }
    });
};

const REQUEST_TICKET_COLLABORATOR: string = `${API_GATEWAY_URL}TicketManagement/GetCollaboratorGridList`;
export const RequestTicketCollaborator = async (request: GetTicketHistoryCollaboratorRequestModel) => {
	return axios.post(REQUEST_TICKET_COLLABORATOR, request);
}

const GET_TICKET_COLLABORATOR: string = `${API_CALLBACK_URL}TicketManagement/GetCollaboratorGridList`;
export const GetTicketCollaborator = async (request: string) => {
    return axios.get<TicketCollaboratorResponseModel>(GET_TICKET_COLLABORATOR, {
        params: {
            cachedId: request
        }
    });
};

const GET_USER_COLLABORATOR_LIST: string = `${API_GATEWAY_URL}TicketManagement/GetUserCollaboratorList`;
export const GetUserCollaboratorList = async () => {
    return axios.get<Array<LookupModel>>(GET_USER_COLLABORATOR_LIST);
};

const VALIDATE_ADD_USER_COLLABORATOR: string = `${API_GATEWAY_URL}TicketManagement/ValidateAddUserAsCollaborator`;
export const ValidateAddUserCollaborator = async (request: AddUserCollaboratorRequestModel) => {
	return axios.post(VALIDATE_ADD_USER_COLLABORATOR, request);
}

const DELETE_USER_COLLABORATOR: string = `${API_GATEWAY_URL}TicketManagement/DeleteUserAsCollaborator`;
export const RemoveUserAsCollaborator = async (request: DeleteUserAsCollaboratorRequestModel) => {
	return axios.post(DELETE_USER_COLLABORATOR, request);
}

const VALIDATE_USER_TIER: string = `${API_GATEWAY_URL}TicketManagement/ValidateUserTier`;
export const ValidateUserTier = async (request: ValidateUserTierRequestModel) => {
	return axios.post(VALIDATE_USER_TIER, request);
}

const GET_ALL_PROCESSOR: string = `${API_GATEWAY_URL}TicketManagement/GetAllPaymentProcessor`;
export const GetAllPaymentProcessor = async () => {
    return axios.get<Array<GetAllProcessorResponseModel>>(GET_ALL_PROCESSOR);
};

import { BaseModel } from "../../../user-management/models/BaseModel";
import { TicketHistoryFieldsModel } from "../udt/TicketHistoryFieldsModel";

export interface UpsertPopupTicketDetailsRequestModel extends BaseModel {
    ticketId: number,
    ticketTypeId: number,
    ticketDetails: Array<TicketFieldDefinition>
    comment: string,
    icoreStatusId: number,
    fmboStatusId: number,
    sendUpdateEmail: boolean,
    ticketHistoryLabelType: Array<TicketHistoryFieldsModel>
    parentStatusId: number
    childStatusId: number
}

interface TicketFieldDefinition {
    ticketFieldMappingId: number,
    ticketFieldMappingValue: string
}
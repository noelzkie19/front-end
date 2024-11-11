import { BaseModel } from "../../../user-management/models/BaseModel";

export interface InsertTicketAttachmentRequestModel extends BaseModel {
    ticketId: number,
    ticketTypeId: number,
    typeId: number,
    url: string
}
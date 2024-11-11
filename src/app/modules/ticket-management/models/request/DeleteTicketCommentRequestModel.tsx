import { BaseModel } from "../../../user-management/models/BaseModel";

export interface DeleteTicketCommentRequestModel extends BaseModel {
    ticketTypeId: number,
    ticketCommentId: number,
}
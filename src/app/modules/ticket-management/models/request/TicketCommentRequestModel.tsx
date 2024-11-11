import { BaseModel } from "../../../user-management/models/BaseModel";

export interface TicketCommentRequestModel extends BaseModel{
    ticketId: number,
    ticketTypeId: number,
    comment: string,
    ticketCommentId: number,
}
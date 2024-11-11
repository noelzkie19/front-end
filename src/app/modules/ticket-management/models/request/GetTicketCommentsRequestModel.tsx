import { BaseModel } from "../../../user-management/models/BaseModel";

export interface GetTicketCommentsRequestModel extends BaseModel{
    ticketId: number,
    ticketTypeId: number,
    viewOldComment: boolean,
}
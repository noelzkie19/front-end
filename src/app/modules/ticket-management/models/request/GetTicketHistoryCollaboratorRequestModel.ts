import { BaseModel } from "../../../user-management/models/BaseModel";

export interface GetTicketHistoryCollaboratorRequestModel extends BaseModel{
    ticketId: number,
    ticketTypeId: number,
    sortOrder: string,
    sortColumn: string,
    offsetValue: number,
    pageSize: number
}
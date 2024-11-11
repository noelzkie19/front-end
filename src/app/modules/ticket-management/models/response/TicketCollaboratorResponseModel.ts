import { TicketCollaboratorModel } from "./TicketCollaboratorModel";

export interface TicketCollaboratorResponseModel {
    collaboratorList: Array<TicketCollaboratorModel>,
    rowCount: number
}
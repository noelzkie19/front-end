import { TicketHistoryModel } from "./TicketHistoryModel";

export interface TicketHistoryResponseModel {
    ticketHistoryList: Array<TicketHistoryModel>,
    rowCount: number
}
import { SearchTicketModel } from "./SearchTicketModel";

export interface SearchTicketResponseModel {
    ticketList: Array<SearchTicketModel>,
    rowCount: number
}
export interface TicketTransactionValidationResponseModel {
  ticketCode : string
  statusName : string
}

export const TICKET_TRANSACTION_ID_VALIDATION_DEFAULT = {
  ticketCode: "0",
  statusName: ""
}
export interface TicketStatusMappingResponseModel {
   parentStatusId: number,
   childStatusId: number,
   ticketTypeId: number,
   ticketTypeFieldMappingId: number,
   order: number,
   isForReview: boolean,
   alternativeLabel: string,
   isRequired: boolean
}
export interface TicketStatusHierarchyResponseModel {
  parentStatusId : number
  parentStatusName : string
  childStatusId : number
  childStatusName : string
  childStatusColorCode : string
  isForTransactionVerification: boolean
}
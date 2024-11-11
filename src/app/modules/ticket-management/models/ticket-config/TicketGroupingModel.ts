import { FieldMappingResponseModel } from "./FieldMappingResponseModel"
import { DynamicTicketModel } from "./DynamicTicketModel"

export interface TicketGroupingModel {
  isColored?: string
  sectionMapping: FieldMappingResponseModel[]
  dynamicTicketForm: DynamicTicketModel[]
  updateDynamicTicket: any
  isFromUser?: boolean
  viewOnly? : boolean
  handleTextInputSearching?: () => null
  groupName?: string
  groupId?: number | string
}
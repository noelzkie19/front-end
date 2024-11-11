import { BaseModel } from "../../../user-management/models/BaseModel";
import { TicketAttachmentModel } from "../TicketAttachmentModel";
import { TicketPlayerModel } from "../TicketPlayerModel";
import { TicketHistoryFieldsModel } from "../udt/TicketHistoryFieldsModel";

export interface SaveTicketDetailsRequestModel extends BaseModel {
    ticketId: number,
    ticketTypeId: number,
    ticketPlayerIds: Array<TicketPlayerModel>,
    ticketAttachments: Array<TicketAttachmentModel>,
    ticketDetails: Array<TicketFieldDefinition>,
    ticketHistoryLabelType: Array<TicketHistoryFieldsModel>
}

interface TicketFieldDefinition {
    ticketFieldMappingId: number,
    ticketFieldMappingValue: string
}
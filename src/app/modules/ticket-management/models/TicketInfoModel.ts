import { TicketAttachmentModel } from "./TicketAttachmentModel";
import { TicketPlayerModel } from "./TicketPlayerModel";
import { TicketDetailModel } from "./TicketDetailModel";
export interface TicketInfoModel {
    ticketId: number, 
    ticketTypeSequenceId: number,
    ticketTypeId: number,
    ticketPlayerIds: TicketPlayerModel[],
    ticketAttachments: Array<TicketAttachmentModel>
    ticketDetails: TicketDetailModel[],
    convertedComment: string
}
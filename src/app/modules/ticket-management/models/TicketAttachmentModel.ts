
export interface TicketAttachmentModel {
    ticketAttachmentId: number,
    typeId: number,
    url: string,

    //for getting image 
    fileName?: string,
    base64Text?: string,
}
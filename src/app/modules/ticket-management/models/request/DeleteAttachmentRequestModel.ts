import { BaseModel } from "../../../user-management/models/BaseModel"

export interface DeleteAttachmentRequestModel extends BaseModel {
    ticketAttachmentId: number,
    ticketTypeId: number
}
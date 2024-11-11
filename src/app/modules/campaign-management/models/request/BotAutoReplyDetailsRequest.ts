import { RequestModel } from "../../../system/models"

export interface BotAutoReplyDetailsRequest extends RequestModel {
    botDetailId?: number
    pageSize?: number
    offsetValue?: number
    sortColumn?: string 
    sortOrder?: string
}
import {RequestModel} from "../../../system/models"

export interface SearchBroadcastRequest extends RequestModel {
    broadcastId?: number
    broadcastName?: string
    broadcastStartDate?: string
    broadcastEndDate?: string
    broadcastStatusId?: string
    messageTypeId?: string
    pageSize?: number
    offsetValue?: number
    sortColumn?: string 
    sortOrder?: string
}
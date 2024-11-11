import { RequestModel } from "../../../system/models"

export interface CustomEventFilterModel extends RequestModel {
    customEventName: string
    dateFrom?: string,
    dateTo?: string,
    pageSize?: number
    offsetValue?: number
    sortColumn?: string
    sortOrder?: string
}
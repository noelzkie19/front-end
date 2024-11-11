import { RequestModel } from './RequestModel';

export interface TicketFieldsResponseModel extends RequestModel {
    id: number | null
    fieldName: string
}
import { RequestModel } from '.';
export interface UpsertTicketFieldsRequestModel extends RequestModel{
    paymentMethodId: number,
    selectedTicketFields: string,
}
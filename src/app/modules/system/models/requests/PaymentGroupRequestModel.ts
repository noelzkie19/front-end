import { RequestModel } from '..';
export interface PaymentGroupRequestModel extends RequestModel {
    paymentGroupId?: number,
    paymentGroupName: string
}
import { PaymentGroupResponseModel } from './PaymentGroupResponseModel';
export interface PaymentGroupListResponseModel {
    paymentGroupList: Array<PaymentGroupResponseModel>,
    recordCount: number
}
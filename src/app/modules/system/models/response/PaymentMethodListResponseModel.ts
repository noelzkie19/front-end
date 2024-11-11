import { PaymentMethodResponseModel } from './PaymentMethodResponseModel';
export interface PaymentMethodListResponseModel {
    paymentMethodList: Array<PaymentMethodResponseModel>,
    recordCount: number
}
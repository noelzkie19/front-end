import { RequestModel } from './RequestModel';

export interface PaymentMethodFilterRequestModel extends RequestModel {
    paymentMethodId?: number,
    paymentMethodICoreId?: number | null,
    paymentMethodName?: string | null,
    paymentMethodVerifier?: number | null,
    paymentMethodStatus?: boolean | null,
    paymentMethodMessageTypeIds?: string,
    paymentMethodProviderId?: string,
    pageSize: number,
    offsetValue: number,
    sortColumn: string,
    sortOrder: string,
}
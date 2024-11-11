import { RequestModel } from '.';
export interface UpsertPaymentMethodRequestModel extends RequestModel{
    reqPaymentMethodId?: number,
    reqPaymentMethodICoreId: number,
    reqPaymentMethodName: string,
    reqPaymentMethodVerifier: number,
    reqPaymentMethodStatus: boolean,
    reqPaymentMethodMessageTypeId?:  number | null,
    reqPaymentMethodProviderId?: string,
}
export interface PaymentMethodResponseModel {
    paymentMethodExtId: number,
    iCoreId: number,
    paymentMethodExtName: string,
    verifier: number,
    status: boolean,
    communicationProviderAccount: string,
    messageTypeId: number | null,
    providerAccount: string,
    ticketFields?: string,
    createdDate: string,
    createdBy: string,
    updatedDate: string,
    updatedBy: string,
}
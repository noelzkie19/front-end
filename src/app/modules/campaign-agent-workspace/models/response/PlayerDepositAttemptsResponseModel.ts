export interface PlayerDepositAttemptsResponseModel {
    transactionId: string,
    transactionStatusName: string,
    transactionDate: string,
    currencyCode: string,
    amount: number,
    paymentMethodExtName: string
}
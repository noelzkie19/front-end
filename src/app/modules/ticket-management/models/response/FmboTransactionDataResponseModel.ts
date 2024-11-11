export interface FmboTransactionDataResponseModel {
	paymentMethodName: string;
    paymentMethodExt: string;
    transactionDate: Date;
    cryptoCurrency: string;
    cryptoAmount: number;
    pgTransactionId: string;
    paymentSystemTransactionStatusId: number;
    transactionHash: string;
    methodCurrency: string;
    referenceNumber: string;
    remarks: string;
    recievedAmount: number;
    walletAddress: string;
    providerTransactionId: string;
    transactionId: string;
    paymentProcessor: string;
}
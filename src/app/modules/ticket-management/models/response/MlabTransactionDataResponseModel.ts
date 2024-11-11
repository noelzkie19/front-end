export interface MlabTransactionDataResponseModel {
	transactionId: string;
	paymentMethodName: string;
	amount: number;
	providerTransactionId: string;
	paymentMethodExtId?: number;
	pgTransactionId: string;
	transactionStatusId: number;
	paymentSystemTransactionStatusId: number;
	transactionDate: Date;
	transactionHash: string;
	remarks: string;
	walletAddress: string;
	cryptoAmount: number;
	recievedAmount: number;
	methodCurrency: string;
	referenceNumber: string;
}
export interface IcoreTransactionDataResponseModel {
	transactionId: string;
	playerId: number;
	paymentMethodName: string;
	paymentMethodExt: string;
	transactionDate: string;
	balanceBefore: number;
	transactionTypeId: number;
	transactionStatusId: number;
	amount: number;
	providerTransactionId: string;
	providerId: number;
	paymentInstrumentId: number;
	isSuccessInsert: boolean;
	messageValidation: string;
	accountHolder: string;
	bankName: string;
	accountNumber: string;
}

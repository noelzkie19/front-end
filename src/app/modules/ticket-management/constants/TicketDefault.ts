import { IcoreTransactionDataResponseModel, MlabTransactionDataResponseModel } from "../models";
import { TicketInfoModel } from "../models/TicketInfoModel";
import { TransactionDataModel } from "../models/TransactionDataModel";
import { FmboTransactionDataResponseModel } from "../models/response/FmboTransactionDataResponseModel";
import { TicketPlayerResponseModel } from "../models/response/TicketPlayerResponseModel";

export const TICKET_DEFAULT : TicketInfoModel = {
    ticketId: 0,
    ticketTypeSequenceId: 0,
    ticketTypeId: 0,
    ticketPlayerIds: [],
    ticketAttachments: [],
    ticketDetails: [],
    convertedComment: ''
}


export const ICORE_DEFAULT : IcoreTransactionDataResponseModel = {
    transactionId: '', 
    playerId: 0, 
    paymentMethodName: '', 
    paymentMethodExt: '', 
    transactionDate: '', 
    balanceBefore: 0,
    transactionTypeId: 0,
    transactionStatusId: 0, 
    amount: 0, 
    providerTransactionId: '', 
    providerId: 0, 
    paymentInstrumentId: 0, 
    isSuccessInsert: false, 
    messageValidation: '',
    accountHolder: '',
    bankName: '',
    accountNumber: '',
}

export const FMBO_DEFAULT : FmboTransactionDataResponseModel = {
    paymentMethodName: '', 
    paymentMethodExt: '', 
    transactionDate: new Date(), 
    cryptoCurrency: '', 
    cryptoAmount: 0, 
    pgTransactionId: '', 
    paymentSystemTransactionStatusId: 0,
    transactionHash: '',
    methodCurrency: '', 
    referenceNumber: '',
    remarks: '', 
    recievedAmount: 0, 
    walletAddress: '',
    providerTransactionId: '',
    transactionId: '',
    paymentProcessor: ''
}

export const MLAB_DEFAULT : MlabTransactionDataResponseModel = {
    transactionId: '',
	paymentMethodName: '',
	amount: 0,
	providerTransactionId: '',
	paymentMethodExtId: 0,
	pgTransactionId: '',
	transactionStatusId:0,
	paymentSystemTransactionStatusId: 0,
	transactionDate: new Date(),
	transactionHash: '',
	remarks: '',
	walletAddress: '',
	cryptoAmount: 0,
	recievedAmount: 0,
	methodCurrency: '',
	referenceNumber: ''
}

export const PLAYER_INFO_DEFAULT : TicketPlayerResponseModel  = {
    mlabPlayerId: 0,
    playerId: '',
    username: '',
    countryName: '',
    currencyCode: '',
    vipLevel: '',
    isForVipCredit: false
}

export const TRANSACTION_DEFAULT : TransactionDataModel  = {
    mlabTransactionData: MLAB_DEFAULT,
    iCoreTransactionData: ICORE_DEFAULT,
    fmboTransactionData: FMBO_DEFAULT,
    userId: 0
}
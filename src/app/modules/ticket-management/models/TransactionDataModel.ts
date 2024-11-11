import { FmboTransactionDataResponseModel } from "./response/FmboTransactionDataResponseModel"
import { IcoreTransactionDataResponseModel } from "./response/IcoreTransactionDataResponseModel"
import { MlabTransactionDataResponseModel } from "./response/MlabTransactionDataResponseModel"

export interface TransactionDataModel {
    mlabTransactionData?: MlabTransactionDataResponseModel,
    iCoreTransactionData?: IcoreTransactionDataResponseModel
    fmboTransactionData?: FmboTransactionDataResponseModel
    userId: number,
    isIcoreFirst?: boolean,
    searchedPaymentSystemId?: string,
    searchedPlatformTransactionId?: string
}

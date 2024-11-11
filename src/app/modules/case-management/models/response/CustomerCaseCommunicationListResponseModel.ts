import { CustomerCaseCommunicationResponseModel } from "./CustomerCaseCommunicationResponseModel"

export interface CustomerCaseCommunicationListResponseModel {
    caseCommunicationList: Array<CustomerCaseCommunicationResponseModel>
    recordCount : number
}
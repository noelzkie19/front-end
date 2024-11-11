import { CaseCommunicationFilterListResponseModel } from "./CaseCommunicationFilterListResponseModel"

export interface CaseCommunicationFilterResponseModel {
    caseCommunicationFilterList: Array<CaseCommunicationFilterListResponseModel>
    recordCount: number
}
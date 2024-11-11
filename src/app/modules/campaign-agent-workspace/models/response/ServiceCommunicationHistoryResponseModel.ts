import { ServiceCommunicationHistoryModel } from "./ServiceCommunicationHistoryModel"

export interface ServiceCommunicationHistoryResponseModel {
    campaignServiceCommunications: Array<ServiceCommunicationHistoryModel>
    recordCount: number
}
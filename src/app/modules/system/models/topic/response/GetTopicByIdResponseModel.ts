import { TopicBrandUdtModel, TopicCurrencyUdtModel, TopicLanguageUdtModel } from "../.."

export interface GetTopicByIdResponseModel {
    caseTypeId : number
    caseTypeName: string
    topicId: number
    topicName: string
    isActive: boolean
    statusName?: string
    topicCurrencyType: Array<TopicCurrencyUdtModel>
    topicBrandType: Array<TopicBrandUdtModel>
    topicLanguageType: Array<TopicLanguageUdtModel>
    position: number
}
import { BaseRequest } from "../../../../../shared-models/BaseRequest"
import { TopicBrandUdtModel } from "../udt/TopicBrandUdtModel"
import { TopicCurrencyUdtModel } from "../udt/TopicCurrencyUdtModel"
import { TopicLanguageUdtModel } from "../udt/TopicLanguageUdtModel"

export interface UpSertTopicRequestModel extends BaseRequest {
    codeListId: number
    topicId : number
    caseTypeId: number
    topicName: string
    topicBrandType: Array<TopicBrandUdtModel>
    topicCurrencyType: Array<TopicCurrencyUdtModel>
    topicLanguageType: Array<TopicLanguageUdtModel>
    isActive: boolean
    position: number
}
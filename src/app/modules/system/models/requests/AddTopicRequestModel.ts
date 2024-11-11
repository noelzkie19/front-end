import { TopicResponseModel } from "..";

export interface AddTopicRequestModel {
    queueId: string
    userId: string
    codeListId: number
    isActive: boolean
    topics: TopicResponseModel
}
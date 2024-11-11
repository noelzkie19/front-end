import { BaseRequest } from "../../../../../shared-models/BaseRequest";

export interface GetTopicByIdRequestModel extends BaseRequest {
    topicId: number
}
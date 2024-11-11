import { TopicOrderTypeUdtModel } from "../..";
import { BaseRequest } from "../../../../../shared-models/BaseRequest";

export interface UpdateTopicOrderRequestModel extends BaseRequest {
    topicOrderType: Array<TopicOrderTypeUdtModel>
}
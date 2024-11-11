import { BaseRequest } from "../../../../../shared-models/BaseRequest";

export interface UpdateTopicStatusRequestModel extends BaseRequest {
    topicId : number
    isActive: boolean   
}
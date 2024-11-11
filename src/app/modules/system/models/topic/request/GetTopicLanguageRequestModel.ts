import { BaseRequest } from "../../../../../shared-models/BaseRequest";
import { PaginationModel } from "../../../../../shared-models/PaginationModel";

export interface GetTopicLanguageRequestModel extends BaseRequest, PaginationModel {
    topicId: number
}
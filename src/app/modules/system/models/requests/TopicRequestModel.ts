import { RequestModel } from "../RequestModel";

export interface TopicRequestModel extends RequestModel{
    topicName: string | null,
    brandIds: string | null,
    currencyIds: string | null,
    caseTypeId: string | null,
    topicStatus: string | null,
    pageSize: number| null,
    offsetValue: number| null,
    sortColumn: string| null,
    sortOrder: string| null
}


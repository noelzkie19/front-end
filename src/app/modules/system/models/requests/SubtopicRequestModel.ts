export interface SubtopicRequestModel {
    queueId: string,
    userId: string,
    subtopicName?: string | null,
    status?: string | null,
    topicId: number | null,
    topicIds?: string | null,
    currencyIds?: string | null,
    brandIds?: string | null,
    caseTypeId:  number | null,
    pageSize: number| null,
    offsetValue: number| null,
    sortColumn: string| null,
    sortOrder: string| null
}

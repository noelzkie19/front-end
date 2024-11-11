export interface CustomerCaseCommListRequestModel {
    caseInformationId: number;
    pageSize?: number
    offsetValue?: number
    sortColumn?: string
    sortOrder?: string
}
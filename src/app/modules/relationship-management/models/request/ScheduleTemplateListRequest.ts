import { BaseRemPaginationRequest, BaseRemRequest } from ".."
export interface ScheduleTemplateListRequest extends BaseRemRequest, BaseRemPaginationRequest {
    scheduleTemplateName : string | null
    createdBy?: string | null
    updatedBy?: string | null
}
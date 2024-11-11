import { ScheduleTemplateResponse } from ".."

export interface ScheduleTemplateListResponse {
    totalRecordCount: number
    scheduleTemplateResponseList: Array<ScheduleTemplateResponse>
}
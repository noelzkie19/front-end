import { BaseRemPaginationRequest, BaseRemRequest } from ".."

export interface ScheduleTemplateLanguageRequest extends BaseRemRequest, BaseRemPaginationRequest  {
    scheduleTemplateSettingId: number
}
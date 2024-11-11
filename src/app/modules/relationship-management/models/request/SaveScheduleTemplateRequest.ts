import {BaseRemRequest, ScheduleTemplateLanguageTypeRequest} from '..';
export interface SaveScheduleTemplateRequest extends BaseRemRequest {
	scheduleTemplateSettingId: number;
	scheduleTemplateName: string;
	scheduleTemplateDescription: string;
	scheduleTemplateLanguageSettingType: Array<ScheduleTemplateLanguageTypeRequest>;
	isDirty: boolean;
}

import { RequestModel } from './../RequestModel';

export interface SurveyTemplateFilterModel extends RequestModel {
    templateName: string,
    templateStatus: string,
    questionName: string
}
export interface SurveyTemplateModel {
    id: number,
    name: string,
    status: boolean,
    description: string,
    caseTypeId: number,
    caseType: string,
    messageTypeId: number,
    messageType: string
    createdBy: number
}
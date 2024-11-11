export interface SurveyResultResponseModel {
    surveyQuestionId: number,
    surveyQuestionName: string,
    surveyAnswer: string,
    count: number,
    ftd: number,
    ftdPercentage: number,
    initialDeposit: number,
    initialDepositPercentage: number
}
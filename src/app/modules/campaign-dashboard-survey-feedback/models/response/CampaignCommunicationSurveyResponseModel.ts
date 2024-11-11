export interface CampaignCommunicationSurveyResponseModel {
    campaignType: string;
    campaignName: string;
    communicationId: number | string;
    playerId: string;
    callListId: number | string;
    caseId: number | string;
    caseTopic: string;
    caseSubTopic: string;
    surveyQuestionId: number | string;
    surveyQuestion: string;
    surveyAnswers: string;
}
export function CampaignCommunicationSurveyResponseModelFactory() {
    const initialData : CampaignCommunicationSurveyResponseModel = {
        campaignType: '',
        campaignName: '',
        communicationId: '',
        playerId: '',
        callListId: '',
        caseId: '',
        caseTopic: '',
        caseSubTopic: '',
        surveyQuestionId: '',
        surveyQuestion: '',
        surveyAnswers: '',
    }

    return initialData
}
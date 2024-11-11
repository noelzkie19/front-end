export interface CampaignCommunicationFeedbackReponseModel {
    campaignType: string;
    campaignName: string;
    communicationId: number | string;
    playerId: string;
    callListId: number | string;
    caseId: number | string;
    caseTopic: string;
    caseSubTopic: string;
    feedbackType: string;
    feedbackCategory: string;
    feedbackAnswer: string;
}
export function CampaignCommunicationFeedbackReponseModelFactory() {
    const initialData : CampaignCommunicationFeedbackReponseModel = {
        campaignType: '',
        campaignName: '',
        communicationId: '',
        playerId: '',
        callListId: '',
        caseId: '',
        caseTopic: '',
        caseSubTopic: '',
        feedbackType: '',
        feedbackCategory: '',
        feedbackAnswer: '',
    }

    return initialData
}
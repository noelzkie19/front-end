import { CommunicationReviewModel } from "../../CommunicationReviewModel";
import { CommunicationReviewAssessmentList } from "../../request/communication-review/CommunicationReviewAssessmentList";

export interface CaseCommunicationReviewResponseModel extends CommunicationReviewModel {
    communicationReviewAssessments: Array<CommunicationReviewAssessmentList>
}
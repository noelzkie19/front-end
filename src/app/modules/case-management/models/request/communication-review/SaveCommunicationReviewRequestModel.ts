import { BaseRequest } from "../../../../../shared-models/BaseRequest";
import { CommunicationReviewAssessmentRequestModel } from "./CommunicationReviewAssessmentRequestModel";

export interface SaveCommunicationReviewRequestModel extends BaseRequest {
	communicationReviewId: number,
    caseCommunicationId: number,
    qualityReviewPeriodId: number,
    communicationReviewStatusId: number,
    communicationRevieweeId: number,
    communicationReviewerId: number,
    communicationReviewSummary: string,
    communicationReviewScore: number,
	communicationReviewAssessments: Array<CommunicationReviewAssessmentRequestModel>
}
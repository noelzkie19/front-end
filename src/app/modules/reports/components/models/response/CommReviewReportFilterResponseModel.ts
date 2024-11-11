import { CommunicationReviewRemarks } from "./CommunicationReviewRemarks";
import { CommunicationReviewScoreData } from "./CommunicationReviewScoreData";

export interface CommReviewReportFilterResponseModel {
	communicationReviewScoreData: Array<CommunicationReviewScoreData>,
    communicationReviewRemarks: Array<CommunicationReviewRemarks>,
}
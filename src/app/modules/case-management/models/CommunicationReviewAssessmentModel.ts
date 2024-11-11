import { CommunicationReviewAssessmentListModel } from "./CommunicationReviewAssessmentListModel";

export interface CommunicationReviewAssessmentModel {
    reviewAssessmentList: Array<CommunicationReviewAssessmentListModel>,
    mainCategoryTotalScore: number,
    mainCategoryTotalHighestCriteriaScore: number,
    miscellaneousTotalScore: number
}
import { CommunicationReviewModel } from "../CommunicationReviewModel"
import { CommunicationReviewAssessmentList } from "../request/communication-review/CommunicationReviewAssessmentList"
import { CommunicationReviewAssessmentModel } from "../CommunicationReviewAssessmentModel"
import { CommunicationReviewHistoryResponseModel } from "../response/communication-review/CommunicationReviewHistoryResponseModel"
import { FormSectionStatesModel } from "./FormSectionStatesModel"

export interface CommunicationReviewViewModel {
    communicationId: number
    communicationReviewInfo: CommunicationReviewModel
    communicationReviewAssessment: CommunicationReviewAssessmentModel,
    assessmentList: Array<CommunicationReviewAssessmentList>
    summary: string
    saveLoading: boolean
    categoryTotalScore: number
    categoryTotalCriteriaScore: number
    miscTotalScore: number
    reviewStarted: number
    dirtyAssessmentForm: boolean
    reviewScore: number
    finalScore: number
    commReviewHistoryList: Array<CommunicationReviewHistoryResponseModel>
    formSectionState: FormSectionStatesModel;
}


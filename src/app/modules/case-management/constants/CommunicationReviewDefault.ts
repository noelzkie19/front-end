import { CommunicationReviewModel } from "../models/CommunicationReviewModel";
import { CommunicationReviewViewModel } from "../models/viewModels/CommunicationReviewViewModel";
import { FormSectionStatesModel } from "../models/viewModels/FormSectionStatesModel";
import { MainCategorySectionViewModel } from "../models/viewModels/MainCategorySectionViewModel";
import { MiscellaneousSectionViewModel } from "../models/viewModels/MiscellaneousSectionViewModel";


export const COMMUNICATION_REVIEW_DEFAULT : CommunicationReviewModel = {
    communicationReviewId: 0,
    caseId: 0,
    communicationId: 0,
    reviewStatusId: 343,
    reviewStatus: 'Not Reviewed',
    reviewPeriodId: 0,
    reviewId: 0,
    revieweeId: 0,
    reviewee: '',
    reviewerId: 0,
    reviewer: '',
    isRead: false,
    isPrimary: false,
    reviewSummary: '',
    totalScore: 0,
    startCommunicationDate: ''
}

export const FORM_SECTION_STATE_DEFAULT : FormSectionStatesModel = {
    finalReviewScore: '',
    reviewScoreBenchmark: '',
    reviewMarkButtonLabel: '',
    reviewMarkLoading: false,
    reviewMarkedReadCounter: 0,
    counterTooltipVisible: false,
    reviewMarkedRead: false,
    reviewStartLoading: false,
    reviewCancelLoading: false
}

export const COMMUNICATION_REVIEW_VIEW_DEFAULT : CommunicationReviewViewModel = {
    communicationId: 0,
    communicationReviewInfo: COMMUNICATION_REVIEW_DEFAULT,
    communicationReviewAssessment: {
        reviewAssessmentList: [],
        mainCategoryTotalScore: 0,
        mainCategoryTotalHighestCriteriaScore: 0,
        miscellaneousTotalScore: 0,
    },
    assessmentList: [],
    summary: '',
    saveLoading: false, 
    categoryTotalScore: 0,
    categoryTotalCriteriaScore: 0,
    miscTotalScore: 0,
    reviewStarted: 0,
    dirtyAssessmentForm: false,
    reviewScore: 0,
    finalScore: 0,
    commReviewHistoryList: [],
    formSectionState: FORM_SECTION_STATE_DEFAULT
}

export const MAIN_CATEGORY_VIEW_DEFAULT : MainCategorySectionViewModel = {
    qualityReviewMeasurementId: 0,
    qualityReviewMeasurementName: '',
    qualityReviewMeasurementCriteriaId: 0,
    qualityReviewMeasurementCriteriaName: '',
    qualityReviewMeasurementScoreAndRanking: '',
    qualityReviewMeasurementIsAutoFailed: '',
    qualityReviewMeasurementScore: 0,
    remarks: '',
    suggestions: '',
    isAutoFail: false
}

export const MISCELLANEOUS_VIEW_DEFAULT : MiscellaneousSectionViewModel = {
    qualityReviewMeasurementId: 0,
    qualityReviewMeasurementName: '',
    qualityReviewMeasurementScore: 0,
    remarks: '',
    suggestions: ''
}



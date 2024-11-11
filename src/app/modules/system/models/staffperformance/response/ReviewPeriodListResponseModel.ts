export interface ReviewPeriodListModel {
  communicationReviewPeriodId: number
  communicationReviewPeriodName: string
  rangeStart: string | null
  rangeEnd: string | null
  validationPeriod: string | null
  status: string | boolean | null
}

export interface ReviewPeriodListResponseModel {
  reviewPeriodList: ReviewPeriodListModel[],
  totalRecords: number
}

export const REVIEW_PERIOD_LIST_DEFAULT = {
  communicationReviewPeriodId: 0,
  communicationReviewPeriodName: '',
  rangeStart: null,
  rangeEnd: null,
  validationPeriod: null,
  status: '1'
} 

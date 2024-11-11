export interface ReviewPeriodListRequestModel {
  communicationReviewPeriodName: string
  status: number | null
  offsetValue: number,
  pageSize: number,
  sortColumn: string,
  sortOrder: string,
  queueId: string,
  userId: string
}

export const REVIEW_PERIOD_REQUEST_DEFAULT : ReviewPeriodListRequestModel = {
  communicationReviewPeriodName: '',
  status: null,
  offsetValue: 0,
  pageSize: 0,
  sortColumn: '',
  sortOrder: '',
  queueId: '',
  userId: '0',
}
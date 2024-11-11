import { Guid } from "guid-typescript";
import { ReviewPeriodListRequestModel } from "../../../models/staffperformance/request/ReviewPeriodListRequestModel";
import {  ReviewPeriodListModel } from "../../../models/staffperformance/response/ReviewPeriodListResponseModel";
import { PaginationModel } from "../../../../../common/model";
export const StatusOptions = [
  { value: '1', label: 'Active' },
  { value: '0', label: 'Inactive' },
]

export const ReviewPeriodRequestBuilder = (userId: any, periodName: string, status: any, pagination: PaginationModel) : ReviewPeriodListRequestModel => {  
  return {
    communicationReviewPeriodName: periodName,
    status: status ? Number(status) : null,
    offsetValue: (pagination.pageSize * pagination.currentPage) - pagination.pageSize,
    pageSize: pagination.pageSize ?? 1,
    sortOrder: pagination.sortOrder ?? 'ASC',
    sortColumn: pagination.sortColumn ?? 'CreatedDate',
    queueId: Guid.create().toString(),
    userId: userId.toString()
  }
}

export const ValidateUpsertReviewPeriodRequestModel = async ( reviewPeriodList: ReviewPeriodListModel) => {  
  return Object.values(reviewPeriodList).some(value => value === '' || value === null);
}
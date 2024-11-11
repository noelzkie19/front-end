import { RequestModel } from "../../../system/models";

export interface JourneyGridRequestModel extends RequestModel
{
    createdDateFrom?: string,
    createdDateTo?: string,
    journeyId?: string,
    journeyStatus?: string,
    pageSize?: number,
    offsetValue?: number,
    sortColumn?: string,
    sortOrder?: string
};
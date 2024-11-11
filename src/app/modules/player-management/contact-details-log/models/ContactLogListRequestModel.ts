import { RequestModel } from "../../../system/models";

export interface ContactLogListRequestModel extends RequestModel {
    actionDateFrom?: Date;
    actionDateTo?: Date;
    teamIds?: string;
    userIds?: string;
    pageSize?: number | null;
    offsetValue?: number | null;
    sortColumn?: string;
    sortOrder?: string;
}
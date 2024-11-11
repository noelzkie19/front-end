import { BaseModel } from "../../../user-management/models/BaseModel";

export interface SearchFilterRequestModel extends BaseModel {
    createdDateFrom : string,
    createdDateTo : string,
    ticketType : string,
    ticketCode : string,
    summary : string,
    playerUsername : string,
    status : string,
    assignee : string,
    reporter : string,
    externalLinkName : string,
    currency: string,
    methodCurrency : string,
    vipGroup : string,
    vipLevel : string,
    userListTeams : string,
    platformTransactionId: string,
    currentPage : number,
    offsetValue : number,
    pageSize : number,
    sortColumn : string,
    sortOrder : string
}
import { LookupModel } from "../../../common/model";

export interface PlayerFilterRequestModel {
    startDate?: string
    endDate?: string
    brands?: Array<LookupModel>
    statusId?: number
    internalAccount?: boolean
    playerId?: string
    currencyId?: number
    marketingChannels?: Array<LookupModel>
    riskLevels?: Array<LookupModel>
    username?: string
    vipLevels?: Array<LookupModel>
    marketingSource?: string
    pageSize?: number
    offsetValue?: number
    sortColumn?: string
    sortOrder?: string
    userId?: number
}
import { RequestModel } from '..';
export interface MarketingChannelRequestModel extends RequestModel {
    marketingChannelId?: number,
    marketingChannelName: string
}
import { MarketingChannelResponseModel } from './MarketingChannelResponseModel';
export interface MarketingChannelListResponseModel {
    marketingChannelList: Array<MarketingChannelResponseModel>,
    recordCount: number
}
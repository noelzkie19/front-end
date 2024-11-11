import {CampaignPerformanceDetailResponseModel} from './CampaignPerformanceDetailResponseModel';
import {ContactableRateResponseModel} from './ContactableRateResponseModel';
import {DistributionOfMessagePerCurrencyResponseModel} from './DistributionOfMessagePerCurrencyResponseModel';
import {FtdPercentageResponseModel} from './FtdPercentageResponseModel';
import {PeConversionDetailResponseModel} from './PeConversionDetailResponseModel';
import {PeConversionListResponseModel} from './PeConversionListResponseModel';

export interface CampaignPerformanceResponseModel {
	campaignDetail: Array<CampaignPerformanceDetailResponseModel>;
	peConversionGoalTable: Array<PeConversionListResponseModel>;
	peConversionGoalChart: Array<PeConversionDetailResponseModel>;
	ftdPercentage: Array<FtdPercentageResponseModel>;
	distributionOfMessage: Array<DistributionOfMessagePerCurrencyResponseModel>;
	contactableRate: Array<ContactableRateResponseModel>;
}

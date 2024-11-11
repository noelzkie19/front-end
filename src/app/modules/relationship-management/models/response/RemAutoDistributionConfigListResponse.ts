import { RemAutoDistributionConfigModel } from './RemAutoDistributionConfigModel';

export interface RemAutoDistributionConfigListResponse {
	configurationList: Array<RemAutoDistributionConfigModel>;
	configurationTotalRecordCount: number;
}

import {RemDistributionModel} from './RemDistributionModel';

export interface RemDistributionListResponse {
	remDistributionList: Array<RemDistributionModel>;
	recordCount: number;
}

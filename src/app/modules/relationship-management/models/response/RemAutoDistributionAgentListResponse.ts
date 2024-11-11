import { RemProfileResponseModel } from './RemProfileResponseModel';

export interface RemAutoDistributionAgentListResponse {
	remProfileList: Array<RemProfileResponseModel>;
	remProfileTotalRecordCount: number;
}

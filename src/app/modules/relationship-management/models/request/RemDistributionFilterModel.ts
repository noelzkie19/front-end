import {LookupModel} from '../../../../shared-models/LookupModel';

export interface RemDistributionFilterModel {
	remProfileId: LookupModel | null;
	agentIds: Array<LookupModel>;
	pseudoNames: Array<LookupModel>;
	playerId: string;
	userName: string;
	statusId?: LookupModel | null;
	currencyIds: Array<LookupModel>;
	brandId: LookupModel | null;
	vipLevelIds: Array<LookupModel>;
	assignStatus: LookupModel | null;
	distributionDate: Array<string>;
	assignedByIds: Array<LookupModel>;
}

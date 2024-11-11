import { PaginationModel } from '../../../../shared-models/PaginationModel';
import {RequestModel} from '../../../system/models';

export interface RemDistributionFilterRequest extends RequestModel, PaginationModel {
	remProfileId?: number;
	agentIds?: string;
	pseudoNames?: string;
	playerId?: string;
	userName?: string;
	statusId?: number;
	currencyIds?: string;
	brandId?: number;
	vipLevelIds?: string;
	assignStatus?: boolean;
	distributionDateStart?: string | null;
	distributionDateEnd?: string | null;
	assignedByIds?: string;
}

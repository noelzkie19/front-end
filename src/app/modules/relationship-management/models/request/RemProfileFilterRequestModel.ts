import {RequestModel} from '../../../system/models';

export interface RemProfileFilterRequestModel extends RequestModel {
	remProfileID?: number;
	remProfileName?: string;
	agentNameIds?: string | null;
	pseudoNamePP?: string;
	onlineStatusId?: number | null;
	agentConfigStatusId?: number | null;
	scheduleTemplateSettingId?: number | null;
	pageSize?: number;
	offsetValue?: number;
	sortColumn?: string;
	sortOrder?: string;
}

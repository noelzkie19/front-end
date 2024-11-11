import {BaseRequestModel} from './BaseRequestModel';

export interface CampaignGoalSettingByFilterRequestModel extends BaseRequestModel {
	campaignSettingName?: string;
	isActive?: number;
	dateFrom: string;
	dateTo: string;
	offsetValue: number;
	pageSize: number;
	sortColumn: string;
	sortOrder: string;
}

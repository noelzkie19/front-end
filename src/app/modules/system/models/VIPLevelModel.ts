import {RequestModel} from './RequestModel';
export interface VIPLevelModel extends RequestModel {
	vipLevelId?: number | null;
	vipLevelName: string;
	brandId: number | null;
	brandName?: string;
	isComplete?: boolean;
	iCoreId?: number | null;
	vipGroupId?: number;
}

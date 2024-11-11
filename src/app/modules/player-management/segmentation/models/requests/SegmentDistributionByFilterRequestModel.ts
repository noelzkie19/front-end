import {BaseRequest} from '../../../../../shared-models/BaseRequest';
import {PaginationModel} from '../../../../../shared-models/PaginationModel';

export interface SegmentDistributionByFilterRequestModel extends PaginationModel, BaseRequest {
	segmentId: string;
	playerId?: string;
	userName?: string;
	varianceName?: string;
}

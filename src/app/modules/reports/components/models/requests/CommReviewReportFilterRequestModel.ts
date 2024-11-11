import {RequestModel} from '../../../../system/models'

export interface CommReviewReportFilterRequestModel extends RequestModel {
	displayType?: number | string;
    revieweeTeamIds?: string | null;
    revieweeIds?: string | null;
    reviewerIds?: string | null;
	communicationRangeStart?: string;
	communicationRangeEnd?: string;
    reviewPeriod?: number | null;
    hasLineComments?: number | null;
}

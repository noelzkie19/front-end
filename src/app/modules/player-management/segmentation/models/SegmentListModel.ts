export interface SegmentListModel {
	segmentId: number;
	segmentName: string;
	segmentDescription: string;
	isActive: boolean;
	isStatic: boolean;
	queryForm: string;
	segmentTypeId?: number;
	isReactivated?: boolean;
	hasTableau?: boolean;
}

export interface GoalTypeGameActivityListResponseModel {
	goalTypeGameActivityId: number;
	goalTypeName: string | null;
	goalTypeId: number;
	campaignSettingId: number;
	goalTypeTransactionTypeId: number;
	goalTypeProductId: number;
	thresholdTypeId: number;
	goalTypeDataSourceId: number;
	goalTypePeriodId: number;
	intervalRelationalOperatorId: number;
	intervalSourceId: number;
	intervalNumber: number;
	createdBy?: number;
	createdDate: string | null;
	updatedBy?: number;
	updatedDate: string | null;
	intervalSourceGoalTypeId: number;
}

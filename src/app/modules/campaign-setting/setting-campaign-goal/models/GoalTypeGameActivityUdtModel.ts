export interface GoalTypeGameActivityUdtModel {
	goalTypeGameActivityId: number;
	goalTypeId: number;
	goalTypeName: string;
	campaignSettingId: number;
	goalTypeTransactionTypeId: number;
	goalTypeProductId: string;
	goalTypeProductIds: string;
	thresholdTypeId: number;
	goalTypeDataSourceId: number;
	goalTypeDataSourceName: string;
	goalTypePeriodId: number;
	goalTypePeriodName: string;
	intervalRelationalOperatorId: number;
	intervalRelationalOperatorName: string;
	intervalSourceId: number;
	intervalSourceName: string;
	intervalNumber: number;
	createdBy: number;
	updatedBy: number;
	goalTypeGuid?: string;
	intervalSourceGoalTypeId: number;
	intervalSourceGoalTypeName?: any;
	intervalSourceGoalTypeGUID?: string | null;
	goalName?: string;
}

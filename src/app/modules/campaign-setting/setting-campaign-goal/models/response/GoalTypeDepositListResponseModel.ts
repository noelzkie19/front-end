export interface GoalTypeDepositListResponseModel {
	goalTypeDepositId?: number;
	goalTypeName: string | null;
	goalTypeId: number;
	intervalRelationalOperatorId: number;
	intervalSourceId: number;
	intervalNumber: number;
	nthNumber: number;
	thresholdTypeId: number;
	campaignSettingId: number;
	goalTypeTransactionTypeId: number;
	goalTypeDataSourceId: number;
	goalTypePeriodId: number;
	createdBy: number;
	createdDate: string | null;
	updatedBy: number;
	updatedDate: string | null;
	intervalSourceGoalTypeId: number;
}

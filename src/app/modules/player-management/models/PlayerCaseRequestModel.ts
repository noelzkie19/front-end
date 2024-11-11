export interface PlayerCaseRequestModel {
	mlabPlayerId?: number;
	brandName?:string;
	createdDate?: string;
	caseId?: number;
	communicationId?: number;
	caseStatus?: number;
	messageTypeId?: number;
	messageStatusId?: number;
	messageResponseId?: number;
	campaignNameId?: number;
	createdBy?: number;
	pageSize?: number;
	offsetValue?: number;
	sortColumn?: string;
	sortOrder?: string;
	caseTypeId?: number;
	campaignTypeId?: number;
}

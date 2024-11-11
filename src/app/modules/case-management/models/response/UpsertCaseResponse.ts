export interface UpsertCaseResponse {
	caseId: number;
	caseStatus: string;
	caseMissingFields: string;
}

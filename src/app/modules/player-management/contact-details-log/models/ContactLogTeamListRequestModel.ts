export interface ContactLogTeamListRequestModel {
    teamId: number,
    pageSize: number | null;
    offsetValue: number | null;
    sortColumn: string;
    sortOrder: string;
}
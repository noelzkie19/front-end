export interface RemHistoryFilterBaseRequestModel {
    assignmentDateStart: string,
    assignmentDateEnd: string,
    actionTypeIds?: string,
    remProfileIds?: string,
    agentIds?: string,
    pseudoName: string,
    mlabPlayerId: number
}
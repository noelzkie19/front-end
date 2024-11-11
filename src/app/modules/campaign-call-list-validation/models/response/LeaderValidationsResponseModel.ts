import { NumberFilter } from "ag-grid-community";

export interface LeaderValidationsResponseModel {
    leaderValidationId: number
    leaderValidationStatus: boolean
    justificationId: number
    leaderValidationNotes: string
    highDeposit: number
    isLeaderValidated: boolean
    campaignPlayerId: number
    createdBy: number
    createdDate: string
    updatedBy: number
    updatedDate: string
}
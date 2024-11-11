export interface LeaderValidationsRequestModel {
    queueId: string
    userId: string
    leaderValidationStatus: boolean
    justificationId: number
    leaderValidationNotes: string
    highDeposit: number
    isLeaderValidated: boolean
    campaignPlayerId: number
    createdBy: number
    updatedBy: number
    leaderValidationId: number
}

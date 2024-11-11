export interface CallEvaluationRequestModel {
    queueId: string
    userId: string
    evaluationPoint?: number
    evaluationNotes: string
    campaignPlayerId: number
    createdBy: number
    updatedBy: number
    callEvaluationId: number
}

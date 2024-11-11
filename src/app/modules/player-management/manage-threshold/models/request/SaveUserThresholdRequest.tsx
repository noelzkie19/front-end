export interface SaveUserThresholdRequest {
    queueId: string
    userId: string
    userThresholdId: number
    userThresholdCount: number
    actionId: number
}
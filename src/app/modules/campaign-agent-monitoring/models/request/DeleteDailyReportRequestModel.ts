export interface DeleteDailyReportRequestModel {
    queueId: string
    userId: string
    reportDate: string
    shift: string
    hour: number
    minute: number
    second: number
    campaignAgentId: number
}


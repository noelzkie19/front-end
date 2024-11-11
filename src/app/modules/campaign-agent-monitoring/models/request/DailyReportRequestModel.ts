export interface DailyReportRequestModel {
    queueId: string
    userId: string
    reportDate: string
    shift: string
    hour: number
    minute: number
    second: number
    campaignAgentId: number
    createdBy: number
    updatedBy: number
    dailyReportId: number
}

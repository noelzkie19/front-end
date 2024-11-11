import { AgentResponseModel } from './AgentResponseModel'
import { DailyReportResponseModel } from './DailyReportResponseModel'
export interface AgentListResponseModel {
    agents: Array<AgentResponseModel>
    dailyReports: Array<DailyReportResponseModel>
    recordCount: number
}

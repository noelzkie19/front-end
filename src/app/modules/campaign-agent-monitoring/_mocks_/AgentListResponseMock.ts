import { AgentResponseMock } from '../_mocks_/AgentResponseMock'
import { DailyReportResponseMock } from '../_mocks_/DailyReportResponseMock'
import { AgentListResponseModel } from '../models/response/AgentListResponseModel'

export class AgentListResponseMock {
    public static table: Array<AgentListResponseModel> = [
        {
            agents: AgentResponseMock.table,
            dailyReports: DailyReportResponseMock.table,
            recordCount: 10
        },
    ]
}

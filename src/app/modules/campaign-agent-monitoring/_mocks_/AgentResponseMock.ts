import { AgentResponseModel } from '../models/response/AgentResponseModel'

export class AgentResponseMock {
    public static table: Array<AgentResponseModel> = [
        {
            campaignName: 'Campain Call',
            agentName: 'Agent 1',
            agentId: 1,
            campaignID: 1,
            status: true,
            taggedCountForTheCampaignPeriod: 5,
            taggedCountToday: 3,
            lastTaggedDateAndTime: '2021-11-18T05:56:58.991Z',
            autoTaggingName: 'Auto Tag Name 1',
            campaignAgentId: 1,
            campaignStatus: 1
        },
        {
            campaignName: 'Campain Call',
            agentName: 'Agent 2',
            agentId: 2,
            campaignID: 1,
            status: true,
            taggedCountForTheCampaignPeriod: 5,
            taggedCountToday: 3,
            lastTaggedDateAndTime: '2021-11-18T05:56:58.991Z',
            autoTaggingName: 'Auto Tag Name 1',
            campaignAgentId: 2,
            campaignStatus: 1
        },
        {
            campaignName: 'Campain Call',
            agentName: 'Agent 3',
            agentId: 3,
            campaignID: 1,
            status: true,
            taggedCountForTheCampaignPeriod: 5,
            taggedCountToday: 3,
            lastTaggedDateAndTime: '2021-11-18T05:56:58.991Z',
            autoTaggingName: 'Auto Tag Name 3',
            campaignAgentId: 3,
            campaignStatus: 1
        },

    ]
}

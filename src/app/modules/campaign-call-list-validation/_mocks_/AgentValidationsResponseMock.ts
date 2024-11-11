import { AgentValidationsResponseModel } from '../models/response/AgentValidationsResponseModel'

export class AgentValidationsResponseMock {
    public static table: Array<AgentValidationsResponseModel> = [
        {
            agentValidationId: 1,
            agentValidationStatus: true,
            agentValidationNotes: 'test',
            isAgentValidated: true,
            campaignPlayerId: 1,
            createdBy: 0,
            createdDate: '2021-11-18T05:56:58.991Z',
            updatedBy: 0,
            updatedDate: ''
        },
        {
            agentValidationId: 2,
            agentValidationStatus: false,
            agentValidationNotes: 'test',
            isAgentValidated: true,
            campaignPlayerId: 2,
            createdBy: 0,
            createdDate: '2021-11-18T05:56:58.991Z',
            updatedBy: 0,
            updatedDate: ''
        },
        {
            agentValidationId: 3,
            agentValidationStatus: true,
            agentValidationNotes: 'test',
            isAgentValidated: true,
            campaignPlayerId: 3,
            createdBy: 0,
            createdDate: '2021-11-18T05:56:58.991Z',
            updatedBy: 0,
            updatedDate: ''
        },

    ]
}


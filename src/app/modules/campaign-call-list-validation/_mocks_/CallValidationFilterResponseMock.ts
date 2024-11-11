import {AgentFilterResponseModel} from '../models/response/AgentFilterResponseModel'
import {CallValidationFilterResponseModel} from '../models/response/CallValidationFilterResponseModel'
import {LeaderJustificationFilterResponseModel} from '../models/response/LeaderJustificationFilterResponseModel'

export class CallValidationFilterResponseMock {
    public static table: Array<CallValidationFilterResponseModel> = [
        {
            callCaseStatusOutcomes: [
                'Message Status 1 - Message Response 1',
                'Message Status 2 - Message Response 2'
            ],
            playerIds: [
                '11111',
                '22222'
            ],
            agentNames: [
                { agentId: 1, agentName: "Agent 1" },
                { agentId: 2, agentName: "Agent 2" },

            ],
            userNames: [
                'Username 1',
                'Username 2'
            ],
            justifications: [
                { leaderJustificationId: 1, justification: "Jusification 1" },
                { leaderJustificationId: 2, justification: "Jusification 2" },
            ]

        }
    ]
}

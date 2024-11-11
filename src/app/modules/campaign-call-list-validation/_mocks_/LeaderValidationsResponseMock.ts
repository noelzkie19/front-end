import { LeaderValidationsResponseModel } from '../models/response/LeaderValidationsResponseModel'

export class LeaderValidationsResponseMock {
    public static table: Array<LeaderValidationsResponseModel> = [
        {
            leaderValidationId: 1,
            leaderValidationStatus: true,
            justificationId: 1,
            leaderValidationNotes: 'test',
            highDeposit: 1,
            isLeaderValidated: true,
            campaignPlayerId: 1,
            createdBy: 0,
            createdDate: '2021-11-18T05:56:58.991Z',
            updatedBy: 0,
            updatedDate: ''
        },
        {
            leaderValidationId: 2,
            leaderValidationStatus: false,
            justificationId: 1,
            leaderValidationNotes: 'test',
            highDeposit: 1,
            isLeaderValidated: true,
            campaignPlayerId: 2,
            createdBy: 0,
            createdDate: '2021-11-18T05:56:58.991Z',
            updatedBy: 0,
            updatedDate: ''
        },
        {
            leaderValidationId: 3,
            leaderValidationStatus: true,
            justificationId: 1,
            leaderValidationNotes: 'test',
            highDeposit: 1,
            isLeaderValidated: true,
            campaignPlayerId: 3,
            createdBy: 0,
            createdDate: '2021-11-18T05:56:58.991Z',
            updatedBy: 0,
            updatedDate: ''
        },

    ]
}


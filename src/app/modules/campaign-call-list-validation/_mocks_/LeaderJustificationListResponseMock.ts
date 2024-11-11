import { LeaderJustificationListResponseModel } from '../models/response/LeaderJustificationListResponseModel'

export class LeaderJustificationListResponseMock {
    public static table: Array<LeaderJustificationListResponseModel> = [
        {
            justification: 'NA',
            status: true,
            leaderJustificationId: 1,
            createdBy: 0,
            createdDate: '2021-11-18T05:56:58.991Z',
            updatedBy: 0,
            updatedDate: ''
        },
        {
            justification: 'DEPOSIT BEFORE CALL',
            status: true,
            leaderJustificationId: 2,
            createdBy: 0,
            createdDate: '2021-11-18T05:56:58.991Z',
            updatedBy: 0,
            updatedDate: ''
        },
        {
            justification: 'Invalid',
            status: false,
            leaderJustificationId: 1,
            createdBy: 0,
            createdDate: '2021-11-18T05:56:58.991Z',
            updatedBy: 0,
            updatedDate: ''
        },

    ]
}


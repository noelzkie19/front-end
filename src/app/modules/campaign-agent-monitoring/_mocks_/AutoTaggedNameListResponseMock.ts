import { AutoTaggedNameListResponseModel } from '../models/response/AutoTaggedNameListResponseModel'


export class AutoTaggedNameListResponseMock {
    public static table: Array<AutoTaggedNameListResponseModel> = [
        {
            autoTaggedName: 'Auto Tag Name 1',
            autoTaggedId: 1
        },
        {
            autoTaggedName: 'Auto Tag Name 2',
            autoTaggedId: 2
        },
        {
            autoTaggedName: 'Auto Tag Name 3',
            autoTaggedId: 3
        },
    ]
}

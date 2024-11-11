import { RequestModel } from "../../../system/models";

export interface CallListNoteRequestModel extends RequestModel {
    callListNoteId: number
    campaignPlayerId: number
    note: string
}
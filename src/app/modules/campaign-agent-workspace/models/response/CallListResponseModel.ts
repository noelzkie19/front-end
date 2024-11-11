export interface CallListNoteResponseModel {
    callListNoteId: number
    campaignPlayerId: number
    note: string
    createdBy: number
    createdByName: string
    createdDate: string
    updatedBy: number
    updatedByName: string
    updatedDate: string
} 

export function CallListNoteResponseModelFactory() {
    const obj : CallListNoteResponseModel = {
        callListNoteId: 0,
        campaignPlayerId: 0,
        note: '',
        createdBy: 0,
        createdByName: '',
        createdDate: '',
        updatedBy: 0,
        updatedByName: '',
        updatedDate: ''
    }

    return obj
}
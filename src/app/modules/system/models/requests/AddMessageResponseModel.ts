interface MessageStatusId {
    messageStatusId: number
}

export interface AddMessageResponseModel {
    id: number,
    messageResponseName: string,
    messageStatusIds: Array<MessageStatusId>
    messageStatusId: number,
    position: number,
    isActive: boolean,
    createdBy: number,
    updatedBy: number
}
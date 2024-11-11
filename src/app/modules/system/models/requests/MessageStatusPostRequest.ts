interface MessageTypeId {
    messageTypeIds : string
}

export interface MessageStatusPostRequest {
    id: number,
    messageStatusName: string,
    messageTypeId: number,
    messageTypeIds: Array<MessageTypeId>,
    position: number,
    isActive: boolean,
    createdBy: number,
    updatedBy: number
}
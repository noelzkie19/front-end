export interface AddMessageTypeRequest {
    messageTypeId: number
    messageTypeName: string
    messageTypeStatus: string
    position: number
    action?: string
}
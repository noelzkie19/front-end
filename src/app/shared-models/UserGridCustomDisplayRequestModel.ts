
export interface UserGridCustomDisplayRequestModel {
    userId: string
    module: string
    display: string|undefined
    queueId: string
    isForFilter: boolean
    section: number
}
import { ICorePlayerModel } from "./ICorePlayerModel"

export interface ImportPlayersRequestModel {
    id: number
    name: string
    description: string
    status: number
    players: string
    createdBy: number
    updatedBy?: number,
    queueId: string,
    userId: string
}
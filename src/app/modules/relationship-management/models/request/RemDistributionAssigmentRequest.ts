import { RequestModel } from "../../../system/models";

export interface RemDistributionAssigmentRequest extends RequestModel {
    remDistributionId: number,
    mlabPlayerId: number
    playerId: string,
    remProfileId: number,
    createdBy: number,
    hasIntegration: number
}
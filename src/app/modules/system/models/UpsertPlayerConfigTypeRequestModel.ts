import { RequestModel } from '.';
import { PlayerConfigCodeListDetailsTypeRequestModel } from './PlayerConfigCodeListDetailsTypeRequestModel'

export interface UpsertPlayerConfigTypeRequestModel extends RequestModel{
    playerConfigurationTypeId?: number,
    playerConfigCodeListDetailsType?: Array<PlayerConfigCodeListDetailsTypeRequestModel>
}
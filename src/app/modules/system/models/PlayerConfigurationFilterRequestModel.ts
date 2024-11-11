import { RequestModel } from './RequestModel';

export interface PlayerConfigurationFilterRequestModel extends RequestModel {
    playerConfigurationTypeId?: number,
    playerConfigurationId?: number,
    playerConfigurationICoreId?: number | null,
    playerConfigurationName: string | null,
    playerConfigurationCode: string | null,
    pageSize: number,
    offsetValue: number,
    sortColumn: string,
    sortOrder: string,
}
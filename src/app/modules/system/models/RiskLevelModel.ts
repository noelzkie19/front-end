import { ConfigBrandModel } from './ConfigBrandModel';
import { RequestModel } from './RequestModel';
export interface RiskLevelModel extends RequestModel {
    riskLevelId?: number | null 
    riskLevelName: string
    iCoreId?: number | null
    brands: Array<ConfigBrandModel>
}
import { RiskLevelModel } from "..";

export interface RiskLevelListResponseModel {
    riskeLevelList: Array<RiskLevelModel>,
    recordCount: number
}
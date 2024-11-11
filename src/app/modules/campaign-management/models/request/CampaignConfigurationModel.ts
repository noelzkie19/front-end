export interface CampaignConfigurationModel {
    campaignConfigurationId : number,
    campaignId : number,
    segmentId : number | undefined,
    isAutoTag : boolean,
    autoTaggingId : number,
    agentId : number,
    primaryGoalId : number,
    validationRulesId : number,
    leaderValidationId : number,
    goalParameterPointSettingId: number,
    pointValueSettingId: number,
    eligibilityTypeId: number
    varianceId : number | undefined,
    VarianceName: string| undefined,
    segmentTypeId: number | undefined,
    inPeriodId: number| undefined
}


export function CampaignConfigurationModelFactory() {
    const obj: CampaignConfigurationModel = {
        campaignConfigurationId : 0,
        campaignId : 0,
        segmentId : undefined,
        isAutoTag : false,
        autoTaggingId : 0,
        agentId : 0,
        primaryGoalId : 0,
        validationRulesId : 0,
        leaderValidationId : 0,
        goalParameterPointSettingId: 0,
        pointValueSettingId: 0,
        eligibilityTypeId: 0,
        varianceId: 0,
        VarianceName: '',
        segmentTypeId: undefined,
        inPeriodId:0
    }
    return obj
}
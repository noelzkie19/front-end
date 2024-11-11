export interface AutoDistributionConfigurationListByAgentIdResponseModel {
    configurationNameTotalCount: number;
    configurationList: Array<{autoDistributionSettingId: number, configurationName: string, status: boolean}>;
}
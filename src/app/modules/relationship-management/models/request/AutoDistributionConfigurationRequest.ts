export interface AutoDistributionConfigurationRequest{
    autoDistributionSettingId: number;
    configurationName: string;
    selectedCurrency: Array<number>;
    selectedCountry: Array<number>;
    selectedVipLevel: Array<number>;
    selectedRemAgents: Array<number>;
}
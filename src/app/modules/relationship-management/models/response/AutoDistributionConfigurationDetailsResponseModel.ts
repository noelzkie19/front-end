export interface AutoDistributionConfigurationDetailsResponseModel {
    configurationDetails : {autoDistributionSettingId: number, configurationName: string; status: boolean};
    adsCurrencyType: Array<{currencyId: number, currencyName: string}>;
    adsCountryType: Array<{countryId: number, countryName: string}>;
    adsVipLevelType: Array<{vipLevelId: number, vipLevelName: string}>;
    adsRemAgentType: Array<{remAgentId: number, remProfileId: number, remAgentName: string}>;
}
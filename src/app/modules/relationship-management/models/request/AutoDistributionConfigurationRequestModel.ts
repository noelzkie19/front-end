import { BaseRemRequest } from "./BaseRemRequest";

export interface AutoDistributionConfigurationRequestModel extends BaseRemRequest{
    autoDistributionSettingId: number;
    configurationName: string;
    adsCurrencyType: Array<{CurrencyId: number}>;
    adsCountryType: Array<{CountryId: number}>;
    adsVipLevelType: Array<{VipLevelId: number}>;
    adsRemAgentType: Array<{RemProfileId: number}>;
}
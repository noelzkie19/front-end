export interface PlayerConfigCodeListValidatorRequestModel {
    playerConfigurationTypeId?: number,
    playerConfigurationId?: number | null,
    playerConfigurationName: string | null,
    playerConfigurationCode: string | null,
    playerConfigurationICoreId?: number | null,
}
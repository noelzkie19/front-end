export interface PlayerConfigValidatorRequestModel {
  playerConfigurationTypeId?: number
  playerConfigurationId?: number | null
  playerConfigurationName: string | null
  playerConfigurationCode: string | null
  playerConfigurationICoreId?: number | null
  playerConfigurationAction?: string
  playerConfigurationBrandId?: number | null
}

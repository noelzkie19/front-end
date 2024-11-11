export interface PlayerConfigCodeListDetailsTypeRequestModel {
  playerConfigurationId?: number | null
  playerConfigurationCode?: string | null
  playerConfigurationName: string | null
  isComplete: boolean
  dataSourceId?: number
  status?: number
  brandId?: number
  iCoreId?: number | null
}

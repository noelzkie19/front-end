

export interface AddConfigPointToValueRequestModel{
    pointToIncentiveRangeConfigurationId: number
    campaignSettingId?: number
    currencyId?: number
    rangeNo?: number
    incentiveValueAmount?: number
    validPointAmountFrom?: number
    validPointAmountTo?: number
   
    createdBy?: number
    updatedBy?: number
}
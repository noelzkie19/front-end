
export interface PlayerModel {
    playerId: string
    lastName: string
    firstName: string
    username: string
    brand: string
    currency: string
    registrationDate: string
    status: string
    vipLevel: string
    riskLevelName: string
    paymentGroup: string
    deposited: boolean
    country: string
    language: string
    bonusAbuser: boolean
    receiveBonus: boolean
    internalAccount: boolean
    mobilePhone: string
    email: string
    marketingChannel: string
    marketingSource: string
    campaignName: string
    couponCode: string
    referredBy: string
    referrerURL: string
    bTAG: string
    blindAccount?: boolean
    isCensoredMobile?:boolean
    isCensoredEmail?:boolean
    mlabPlayerId?: number
}
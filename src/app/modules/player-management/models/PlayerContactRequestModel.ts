
export interface PlayerContactRequestModel {
    mlabPlayerId: number
    userId: number
    contactTypeId: number
    pageName: string
    hasAccess? :boolean
}
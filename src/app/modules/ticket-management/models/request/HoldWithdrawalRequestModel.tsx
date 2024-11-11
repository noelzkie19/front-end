export interface HoldWithdrawalRequestModel {
    UserId: number,
    UpdatePlayerSettings: Array<UpdatePlayerSetting>,
    PlayerIds: Array<string>
}

interface UpdatePlayerSetting
{
    Key: string,
    Value: string,
}
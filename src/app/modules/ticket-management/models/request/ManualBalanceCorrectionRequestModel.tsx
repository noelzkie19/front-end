export interface ManualBalanceCorrectionRequestModel {
    MlabPlayerId: number;
    PlayerId: string;
    UserId: number;
    ManualCorrectionReason: number;
    Amount: number;
    Explanation: string;
    WagerMultiplier: number;

}
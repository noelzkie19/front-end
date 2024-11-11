export interface ContactLogThresholdModel {
    userId: number;
    fullName: string;
    thresholdCount: number;
    emailRecipient: string;
    emailContent: string;
    thresholdAction: string;
    currentCount: number;
}
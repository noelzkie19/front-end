export interface LeadsResponse {
    leadId: number;
    leadName: string;
    stageName: string;
    sourceName: string;
    telegramId: string;
    telegramTypeName: string;
    telegramSubscriptionName: string;
    telegramUsername: string;
    telegramChatId: string;
    telegramChatName: string;
    telegramChatStatus: string;
    linkedPlayerUsername: string;
    linkedPlayerId?: number;
    brandId?: number;
    brandName: string;
    currencyName: string;
    vipLevelName: string;
    countryName: string;
    isPossibleDuplicate: string;
    updatedDate: string;
    updatedBy: string;
}
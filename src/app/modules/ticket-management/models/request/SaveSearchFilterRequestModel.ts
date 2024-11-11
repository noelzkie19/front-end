export interface SaveSearchFilterRequestModel {
    ticketSearchFilterName: string,
    createdDateFrom: string,
    createdDateTo: string,
    ticketType: string,
    ticketCode: string,
    summary: string,
    playerUsername: string,
    status: string,
    assignee: string,
    reporter: string,
    externalLinkName: string,
    currency: string,
    methodCurrency: string,
    vipGroup: string,
    vipLevel: string,
    userListTeams: string,
    platformTransactionId: string,
    queueId: string,
    userId: string
}
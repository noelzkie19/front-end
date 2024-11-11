export interface UserFilterModel {
    email: string
    fullName: string,
    statuses: string,
    teams: string,
    userIdRequest: number,
    queueId: string,
    userId: string,
    communicationProviderMessageTypeId?: number,
    communicationProviderAccountId?: string,
}

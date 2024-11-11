export interface AddUserTaggingModel {
    userTaggingId: number,
    taggingConfigurationId?: number,
    taggingConfigurationName: string,
    taggedUserName: string,
    userId?: number,
    createdBy?: number
    updatedBy?: number,
}
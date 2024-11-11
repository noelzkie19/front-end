export interface SkillResponseModel {
    id: number;
    brandId: number;
    brandName: string;
    licenseId: string;
    skillId: string;
    skillName: string;
    isActive: boolean;
    messageTypeId: number;
    messageTypeName: string;
    mlabPlayerId: number;
    playerId: string;
    playerName: string;
    agentUserId: number;
    agentUserName: string;
    teamId: number;
    teamName: string;
    topicId: number;
    topicName: string;
    subtopicId: number;
    subtopicName: string;
    createdBy? : number;
    createdDate?: string
    updatedBy?: number;
    updatedDate?:  string
}


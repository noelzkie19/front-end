export interface TopicResponseModel {
    id: number;
    topicName: string;
    codeListId: number;
    codeListName: string;
    position: number;
    isActive: boolean;
    createdBy: number;
    brands: string;
    currencies: string;
    caseTypeName: string;
    updatedBy: number | null;
    action?: string;
    withTranslation?: boolean;
}

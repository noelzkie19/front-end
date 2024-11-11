export interface SubtopicUdtResponseModel{
    id: number,
    subtopicId: number,
    subtopicName: string,
    isActive: string,
    position: number,
    topicId: number,
    brand: string,
    currency: string,
    topic:string,
    createdBy?: number,
    createdDate?: string,
    updatedBy?: number,
    updatedDate?: string,
    withTranslation: boolean;
}
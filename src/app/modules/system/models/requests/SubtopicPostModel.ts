import { SubtopicBrand, SubtopicCurrency, SubtopicTopic } from "..";

export interface SubtopicPostModel {
    id: number,
    subTopicName: string,
    isActive: string,
    position: number,
    topicId: number,
    brand: Array<SubtopicBrand>,
    currency: Array<SubtopicCurrency>,
    topic: Array<SubtopicTopic>,
    action?: string,
    createdBy?: number,
    updatedBy?: number,
}

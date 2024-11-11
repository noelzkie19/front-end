import { SubtTopicTableModel } from "../models";
import { BrandRowsMock } from "./BrandRowsMock";
import { CurrencyRowsMocks } from "./CurrencyRowsMocks";
import { TopicRowsMocks } from "./TopicRowsMocks";

export class SubTopicMocks {
    public static table: Array<SubtTopicTableModel> = [
        {
            id: 1,
            subTopicName: 'Test Subtopic Name',
            topic: TopicRowsMocks.table,
            brand: BrandRowsMock.table,
            currency: CurrencyRowsMocks.table,
            position: 1,
            subTopicStatus: '1',
        },
        {
            id: 2,
            subTopicName: 'Test Subtopic Name 2',
            topic: TopicRowsMocks.table,
            brand: BrandRowsMock.table,
            currency: CurrencyRowsMocks.table,
            position: 2,
            subTopicStatus: '1',
        },
        {
            id: 3,
            subTopicName: 'Test Subtopic Name 3',
            topic: TopicRowsMocks.table,
            brand: BrandRowsMock.table,
            currency: CurrencyRowsMocks.table,
            position: 3,
            subTopicStatus: '1',
        },
        {
            id: 4,
            subTopicName: 'Test Subtopic Name 4',
            topic: TopicRowsMocks.table,
            brand: BrandRowsMock.table,
            currency: CurrencyRowsMocks.table,
            position: 4,
            subTopicStatus: '1',
        }
    ] 
}
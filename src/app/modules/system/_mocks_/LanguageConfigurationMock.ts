import { BrandsMock } from './BrandsMock';
import { ConfigurationBaseModel } from '../models/ConfigurationBaseModel';

export class LanguageConfigurationMock {
    public static table : Array<ConfigurationBaseModel> = [
        {
            id: 1,
            name: 'Chinese (PRC)',
            code: 'zh-CN',
            brand: BrandsMock.table.filter(i => i.name === "M88")
        },
        {
            id: 2,
            name: 'English (United States)',
            code: 'en-US',
            brand: BrandsMock.table.filter(i => i.name === "M88")
        },
        {
            id: 3,
            name: 'Indonesian',
            code: 'id-ID',
            brand: BrandsMock.table.filter(i => i.name === "M88")
        },
        {
            id: 4,
            name: 'Thai',
            code: 'th-TH',
            brand: BrandsMock.table.filter(i => i.name === "M88")
        },
        {
            id: 5,
            name: 'Vietnamese',
            code: 'vi-VN',
            brand: BrandsMock.table.filter(i => i.name === "M88")
        },
    ]
}
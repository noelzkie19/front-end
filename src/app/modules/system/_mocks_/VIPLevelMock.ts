import { BrandsMock } from './BrandsMock';
import { ConfigurationBaseModel } from "../models/ConfigurationBaseModel";

export class VIPLevelMock {
    public static table : Array<ConfigurationBaseModel> = [
        {
            id: 1,
            name: 'New Player - R1u',
            brand: BrandsMock.table.filter(i => i.name === "M88")
        },
        {
            id: 2,
            name: 'Normal - R2u',
            brand: BrandsMock.table.filter(i => i.name === "M88")
        },
        {
            id: 3,
            name: 'Verified - R3u',
            brand: BrandsMock.table.filter(i => i.name === "M88")
        },
        {
            id: 4,
            name: 'Premium - R4u',
            brand: BrandsMock.table.filter(i => i.name === "M88")
        },
        {
            id: 5,
            name: 'VIP - Bronze - V1u',
            brand: BrandsMock.table.filter(i => i.name === "M88")
        },
        {
            id: 6,
            name: 'VIP - Silver - V2u',
            brand: BrandsMock.table.filter(i => i.name === "M88")
        },
        {
            id: 7,
            name: 'VIP - Gold - V3u',
            brand: BrandsMock.table.filter(i => i.name === "M88")
        },
        {
            id: 8,
            name: 'VIP - Platinum - V4u',
            brand: BrandsMock.table.filter(i => i.name === "M88")
        },
        {
            id: 9,
            name: 'VIP - Diamond - V5u',
            brand: BrandsMock.table.filter(i => i.name === "M88")
        },
        {
            id: 10,
            name: 'VIP - Elite - V6u',
            brand: BrandsMock.table.filter(i => i.name === "M88")
        },
    ]
}
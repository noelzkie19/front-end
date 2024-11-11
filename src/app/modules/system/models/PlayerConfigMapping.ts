export interface PlayerConfigMapping<T> {
    id: number
    name: string
    getList: (request: T) => Promise<any>
    getListResult: (request: string) => Promise<any>
    saveConfig: (request: T) => Promise<any>
    saveConfigResult: (request: string) => Promise<any>
    model: any
}
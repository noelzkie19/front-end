import { ColDef } from 'ag-grid-community';
export interface PlayerConfigurationRoute {
     id: number,
     name: string,  
     route: string,
     view: string,
     colDef: Array<ColDef>,
     rowClassRules?: any,
     filterParams?: any,
     clientSidePagination?: boolean,
     getList: (param: any) => any,
     getListResult: (param: any) => any,
     getData?: (response: any) => any
}
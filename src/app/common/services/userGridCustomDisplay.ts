import { AppConfiguration } from "read-appsettings-json";
import axios from "axios";
import { UserGridCustomDisplayRequestModel } from "../../shared-models/UserGridCustomDisplayRequestModel";
import { UserGridCustomDisplayResponseModel } from "../model/system/UserGridCustomDisplayResponseModel";

const API_GATEWAY_URL = AppConfiguration.Setting().REACT_APP_MLAB_GATEWAY_URL
const API_CALLBACK_URL = AppConfiguration.Setting().REACT_APP_MLAB_CALLBACK_URL

const LOAD_USER_GRID_CUSTOM_DISPLAY: string = `${API_GATEWAY_URL}system/LoadUserGridCustomDisplay`
const UPSERT_USER_GRID_CUSTOM_DISPLAY: string = `${API_GATEWAY_URL}system/UpsertUserGridCustomDisplay`
const UPSERT_USER_GRID_CUSTOM_DISPLAY_RESULT: string = `${API_CALLBACK_URL}system/UpsertUserGridCustomDisplay`

export async function SetGridCustomDisplayAsync(defaultColumns: any, userId: number, defaultFields?: any) {
    
    const useColumns : Array<any> = new Array<any> ();
    const useFilterColumns : Array<any> = new Array<any> ();
    const defaultsData : any ={
        defaultColumns: [],
        defaultFields: []
    }

    try
    {
        const userDisplay : any = await LoadUserGridCustomDisplayAsync(userId)
        
        const gridDisplay = userDisplay.find((d: any) => !d.isForFilter)
        const filterDisplay = userDisplay.find((d: any) => d.isForFilter)
        if(gridDisplay || filterDisplay){
            if (gridDisplay?.display?.length > 0){
                const display = JSON.parse(gridDisplay.display);
                display.forEach((e: { value: string; }) => {
                    const column = defaultColumns.find((i: { field: string; })=> i.field === e.value);
                    const columnOrder = display.find((d: any) => d.value === column.field).order
                    if(column != undefined){
                        if(columnOrder){
                            column.order = columnOrder
                        }
                        useColumns.push(column)
                    }
                });
                defaultsData.defaultColumns = useColumns;

            }else{
                defaultsData.defaultColumns = defaultColumns
            }

            if(filterDisplay?.display?.length > 0){
                const fieldDisplay = JSON.parse(filterDisplay.display);
                fieldDisplay.forEach((e: { value: string; }) => {
                    const filter = defaultFields.find((i: { field: string; })=> i.field === e.value);
                    const order = fieldDisplay.find((d: any) => d.value === filter.field).order
                    if(filter != undefined){
                        if(order){
                            filter.order = order
                        }
                        useFilterColumns.push(filter)
                    }
                });
                defaultsData.defaultFields = useFilterColumns;

            }
            else{
                defaultsData.defaultFields = defaultFields
            }

            return defaultsData;
        }
       
    }
    catch (e) {
        console.log(`[Error] GetUserGridDisplay [Module:${window.location.pathname} | UserId:${userId}] - ${e}`)        
    }
    defaultsData.defaultColumns = defaultColumns
    defaultsData.defaultFields = defaultFields
    return defaultsData;
}

export async function UpsertUserGridCustomDisplayAsync(request: UserGridCustomDisplayRequestModel) {
    return await axios.post(UPSERT_USER_GRID_CUSTOM_DISPLAY, request);
}

export async function UpsertUserGridCustomDisplayResultAsync(cacheId: string) {
    return axios.get(UPSERT_USER_GRID_CUSTOM_DISPLAY_RESULT, {
      params: {
        cachedId: cacheId,
      },
    })
  }

export async function LoadUserGridCustomDisplayAsync(userId: number) {
    const result =  await axios.get<Array<UserGridCustomDisplayResponseModel>>(LOAD_USER_GRID_CUSTOM_DISPLAY, {
                        params: {
                            'userId': userId,
                            'module': window.location.pathname
                        }
                    });

    const data = result?.data ?? '';
    if(data){        
        return result.data
    }

    return [];
    
}
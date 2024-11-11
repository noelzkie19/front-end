import React, { useEffect, useMemo, useState } from "react"
import { useAsyncFn } from "react-use"
import { SetGridCustomDisplayAsync } from "../../../common/services/userGridCustomDisplay"
import { useSystemOptionHooks } from "../../system/shared"
import { shallowEqual, useSelector } from "react-redux"
import { RootState } from "../../../../setup"
import { ChannelType } from "../../../constants/Constants"
import useCustomerCaseCommHooks from "../shared/hooks/useCustomerCaseCommHooks"
import { useVIPLevels } from "../../../custom-functions"


interface IProps {
    defaultColumns: any,
    defaultFilters: any,
    setColumnFields: (val: any) => void,
    setFilterFields: (val: any) => void,
    columnDefs: any,
    fetchingGridColumnDisplay: boolean,
    getGridColumnDisplayAsync: (...args: any) => Promise<void>,
    isUpdateGridCustomDisplay: boolean,
    setIsUpgradeGridDisplay: (val: any) => void,
    isSubmitGridCustomDisplay: boolean,
    setIsSubmitGridDisplay: (val: any) => void
    resetColumnDefs: (val: any) => void
    filterDefs: any,
    resetFilterDefs: (val: any) => void
    currencyOptions: any
    dateOptions: any
    brandOptions: any
    messageTypeOptions: any
    vipLevelOptions: any,
    fetchAllOptions: boolean,
    resetFetchAllOptions: (val: any) => void
} 


export const CaseCommunicationContext = React.createContext<IProps>({
    defaultColumns: [],
    defaultFilters: [],
    setColumnFields: () => {},
    setFilterFields: () => {},
    columnDefs: [],
    fetchingGridColumnDisplay: false,
    getGridColumnDisplayAsync: async (...args: any) => { },
    isUpdateGridCustomDisplay: false,
    setIsUpgradeGridDisplay: () => {},
    isSubmitGridCustomDisplay: false,
    setIsSubmitGridDisplay: () => {},
    resetColumnDefs: () => {},
    filterDefs: [],
    resetFilterDefs: () => {},
    currencyOptions: [],
    dateOptions: [],
    brandOptions: [],
    messageTypeOptions: [],
    vipLevelOptions: [],
    fetchAllOptions: false,
    resetFetchAllOptions: () => {}
})

 
export const CaseCommunicationContextProvider: React.FC = ({children}) => {
    const [defaultColumns, setDefaultColumns] = useState<Array<any>>([]);
    const [defaultFilters, setDefaultFilters] = useState<Array<any>>([]);
    const [columnDefs, setColumnDefs] = useState<Array<any>>([]);
    const [filterDefs, setFilterDefs] = useState<Array<any>>([]);
    const [isUpdateGridCustomDisplay, setIsUpdateGridCustomDisplay] = useState<boolean>(false);
    const [isSubmitGridCustomDisplay, setIsSubmitGridCustomDisplay] = useState<boolean>(false);
    const {getCurrencyOptions, currencyOptionList, getDateByOptionList, dateByOptions , getBrandOptions, brandOptionList} = useSystemOptionHooks();
    const {getAllMessageTypeOptionsWithFilters, messageTypeWithFilterOptions} = useCustomerCaseCommHooks();
    const [currencyOptions, setCurrencyOptions] = useState<Array<any>>([]);
    const [dateOptions, setDateOptions] = useState<Array<any>>([]);
    const [brandOptions, setBrandOptions] = useState<Array<any>>([]);
    const [messageTypeOptions, setMessageTypeOptions] = useState<Array<any>>([]);
    const [vipLevelOptions, setVipLevelOptions] = useState<Array<any>>([]);
    const userAccessId = useSelector<RootState>(({auth}) => auth.userId, shallowEqual) as number;
    const CHANNEL_TYPES = ChannelType.ChatIntegrationId + ',' + ChannelType.Communication;
    const vipOptions = useVIPLevels(userAccessId)
    const [fetchAllOptions, setFetchAllOptions] = useState<boolean>(false);


    useEffect(() => {
        getCurrencyOptions()
        getDateByOptionList()
        getBrandOptions(userAccessId)
        getAllMessageTypeOptionsWithFilters(CHANNEL_TYPES)
       
    },[])

    useEffect(() => {
        if(vipOptions && vipOptions.length > 0){
            setVipLevelOptions(vipOptions)
        }
    }, [vipOptions])

    useEffect(() => {
        if(brandOptionList && brandOptionList.length >0) {
            setBrandOptions(brandOptionList)
        }
    },[brandOptionList])

    useEffect(() =>{
        if(currencyOptionList && currencyOptionList.length > 0){
            setCurrencyOptions(currencyOptionList)
        }

    },[currencyOptionList])

    useEffect(() => {
        if(dateByOptions && dateByOptions.length > 0) {
            setDateOptions(dateByOptions)
        }

    },[dateByOptions])

    useEffect (() => {
        if(messageTypeWithFilterOptions && messageTypeWithFilterOptions.length > 0) {
            setMessageTypeOptions(messageTypeWithFilterOptions)
        }

    },[messageTypeWithFilterOptions])

    useEffect(() => {
        if(brandOptions.length > 0 &&
            currencyOptions.length > 0 &&
            dateOptions.length > 0 &&
            messageTypeWithFilterOptions.length > 0 &&
            vipLevelOptions.length > 0 
        ) {
            setFetchAllOptions(true)
        }

    },[brandOptions, currencyOptions, dateOptions, messageTypeWithFilterOptions, vipLevelOptions])

    const setColumnFields =(val: any) =>{
        setDefaultColumns(val)
    }

    const setFilterFields =(val: any) =>{
        setDefaultFilters(val)
    }

    const setIsUpgradeGridDisplay = (val: any) =>{
        setIsUpdateGridCustomDisplay(val)
    }
    const setIsSubmitGridDisplay = (val: any) =>{
        setIsSubmitGridCustomDisplay(val)
    }

    const [{ loading: fetchingGridColumnDisplay }, getGridColumnDisplayAsync] =  useAsyncFn(async (...args) => {
        const [keyword] = args;
            const response = await SetGridCustomDisplayAsync(keyword.defaultColumns, parseInt(keyword.userId), keyword.defaultFields);
 
            if (response) {
             setColumnDefs(response.defaultColumns);
             setFilterDefs(response.defaultFields)
            } 
       
    }, [setColumnDefs])

    const resetColumnDefs = (val: any) =>{
        setColumnDefs(val)
    }
    const resetFilterDefs = (val: any) =>{
        setFilterDefs(val)
    }

    const resetFetchAllOptions = (val: any) => {
        setFetchAllOptions(val)
    }

    const value: IProps = useMemo(() => {
        return {
        defaultColumns,
        defaultFilters,
        setColumnFields,
        setFilterFields,
        columnDefs,
        fetchingGridColumnDisplay,
        getGridColumnDisplayAsync,
        isUpdateGridCustomDisplay,
        setIsUpgradeGridDisplay,
        isSubmitGridCustomDisplay,
        setIsSubmitGridDisplay,
        resetColumnDefs,
        filterDefs,
        resetFilterDefs,
        currencyOptions,
        dateOptions,
        brandOptions,
        messageTypeOptions,
        vipLevelOptions,
        fetchAllOptions,
        resetFetchAllOptions
        }
    }, [defaultColumns, 
        defaultFilters,
        setColumnFields,
        setFilterFields,
        columnDefs,
        fetchingGridColumnDisplay,
        getGridColumnDisplayAsync,
        isUpdateGridCustomDisplay,
        setIsUpgradeGridDisplay,
        isSubmitGridCustomDisplay,
        setIsSubmitGridDisplay,
        resetColumnDefs,
        filterDefs,
        resetFilterDefs,
        currencyOptions,
        dateOptions,
        brandOptions,
        messageTypeOptions,
        vipLevelOptions,
        fetchAllOptions,
        resetFetchAllOptions
    ])
  
    return <CaseCommunicationContext.Provider value={value}>{children}</CaseCommunicationContext.Provider>
}
  
import React,{useState, useEffect} from 'react'
import { CurrencyOptions, CurrencyResponseModel, OptionsSelectedModel } from '../modules/system/models';
import { getAllCurrencyCode } from '../../app/modules/campaign-setting/redux/AutoTaggingService';
import { CurrencyCodeModel } from '../modules/system/models/CurrencyCodeModel';

export default function useCurrenciesWithCode() {

    // -----------------------------------------------------------------
    // STATE
    // -----------------------------------------------------------------
    const [currencyList, setCurrencyList] = useState<Array<CurrencyOptions>>([])

    // -----------------------------------------------------------------
    // FIRST MOUNT OF COMPONENT
    // -----------------------------------------------------------------
    useEffect(() => {
        getAllCurrencyCode().then((response) => {
            if (response.status === 200) {
                let allCurrencies = Object.assign(new Array<CurrencyCodeModel>(), response.data);
                let currencyTempList = Array<CurrencyOptions>();
    
                allCurrencies.forEach(item => {
                    const currencyOption: CurrencyOptions = {
                        value: item.currencyId.toString(),
                        label: item.currencyCode,
                    };
                    currencyTempList.push(currencyOption)
                })
                setCurrencyList(currencyTempList.filter(
                    (thing, i, arr) => arr.findIndex(t => t.value === thing.value) === i
                ));
            }
            else {
                // disableSplashScreen()
                console.log("Problem in currency code list")
            }
        })
        .catch(() => {
            //disableSplashScreen()
            console.log("Problem in currency code list catch")
        })
    }, [])

    return currencyList
}

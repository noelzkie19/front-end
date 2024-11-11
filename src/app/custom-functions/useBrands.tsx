import React,{useState,useEffect} from 'react'
import { BrandOptions } from '../modules/system/models';
import { BrandResponseModel } from '../modules/system/models/response/BrandResponseModel';
import { getAllBrand } from '../modules/system/redux/SystemService';

export default function useBrands(userId?: number) {

    // -----------------------------------------------------------------
    // STATE
    // -----------------------------------------------------------------
    const [brandList, setBrandList] = useState<Array<BrandOptions>>([])

    // -----------------------------------------------------------------
    // RETURN FUNCTIONS
    // -----------------------------------------------------------------
    useEffect(() => {
        getAllBrand(userId).then((response) => {
            if (response.status === 200) {
                let allBrands = Object.assign(new Array<BrandResponseModel>(), response.data);
                let brandTempList = Array<BrandOptions>();
                allBrands.forEach(item => {
                    const brandOption: BrandOptions = {
                        value: item.brandId.toString(),
                        label: item.brandName,
                    };
                    brandTempList.push(brandOption)
                })
                setBrandList(brandTempList.filter(
                    (thing, i, arr) => arr.findIndex(t => t.value === thing.value) === i
                ));
            }
            else {
                //  disableSplashScreen()
                console.log("Problem in getting brand list")
            }
        })
        .catch(() => {
            // disableSplashScreen()
            console.log("Problem in getting brand list")
        })
    }, [])

    return brandList;
}

import React,{useState,useEffect} from 'react'
import { VIPLevelOptions, VIPLevelModel } from '../modules/system/models';
import { getAllVIPLevel } from '../modules/system/redux/SystemService';

export default function useVIPLevels(userId?: number) {

    // -----------------------------------------------------------------
    // STATE
    // -----------------------------------------------------------------
    const [vipLevelList, setVIPLevelList] = useState<Array<VIPLevelOptions>>([])

    // -----------------------------------------------------------------
    // RETURN FUNCTIONS
    // -----------------------------------------------------------------
    useEffect(() => {
        getAllVIPLevel(userId).then((response) => {
            if (response.status === 200) {
                let allVIPLevels = Object.assign(new Array<VIPLevelModel>(), response.data);
                let tempList = Array<VIPLevelOptions>();
                allVIPLevels.forEach(item => {
                    const vipLevelOption: VIPLevelOptions = {
                        value: item.vipLevelId?.toString() ?? '',
                        label: item.vipLevelName,
                    };
                    tempList.push(vipLevelOption)
                })
                setVIPLevelList(tempList.filter(
                    (thing, i, arr) => arr.findIndex(t => t.value === thing.value) === i
                ));
            }
            else {
                //  disableSplashScreen()
                console.log("Problem in getting VIP Level list")
            }
        })
        .catch(() => {
            // disableSplashScreen()
            console.log("Problem in getting VIP Level list")
        })
    }, [])

    return vipLevelList;
}
